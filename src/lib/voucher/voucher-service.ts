import { prisma } from '@/lib/prisma';
import {
  Voucher,
  VoucherRedemption,
  VoucherType,
  RedemptionStatus,
  SubscriptionTier,
  CreditTransactionType,
} from '@prisma/client';
import { trialService } from '@/lib/subscription/trial-service';

// Types for voucher operations
export interface VoucherValidation {
  valid: boolean;
  voucher?: Voucher;
  error?: string;
  discountPreview?: {
    type: VoucherType;
    value: number;
    description: string;
  };
}

export interface DiscountResult {
  discountAmount: number;
  finalAmount: number;
  bonusCredits?: number;
  trialExtensionDays?: number;
}

export interface VoucherEligibility {
  eligible: boolean;
  reason?: string;
}

export interface VoucherRedemptionResult {
  success: boolean;
  redemption?: VoucherRedemption;
  discountResult?: DiscountResult;
  error?: string;
}

export class VoucherService {
  /**
   * Validate voucher code without applying it
   */
  async validateVoucher(
    code: string,
    userId: string,
    tier: SubscriptionTier,
    originalAmount?: number,
    durationMonths?: number
  ): Promise<VoucherValidation> {
    // Normalize code to uppercase
    const normalizedCode = code.trim().toUpperCase();

    // Find voucher by code
    const voucher = await prisma.voucher.findUnique({
      where: { code: normalizedCode },
      include: {
        redemptions: {
          where: { userId },
        },
      },
    });

    if (!voucher) {
      return {
        valid: false,
        error: 'Voucher code not found',
      };
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return {
        valid: false,
        error: 'Voucher is no longer active',
      };
    }

    // Check date validity
    const now = new Date();
    if (voucher.startDate > now) {
      return {
        valid: false,
        error: 'Voucher is not yet valid',
      };
    }

    // Check expiration - endDate should be valid for the entire day
    if (voucher.endDate) {
      const endOfDay = new Date(voucher.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (endOfDay < now) {
        return {
          valid: false,
          error: 'Voucher has expired',
        };
      }
    }

    // Check allowed durations - minMonths is actually allowedDurations stored as array
    // If minMonths exists and durationMonths is provided, check if duration is allowed
    if (voucher.minMonths && durationMonths) {
      // minMonths field is repurposed as allowed duration check
      // We use allowedDurations from metadata if available
      const metadata = voucher.metadata as { allowedDurations?: number[] } | null;
      const allowedDurations = metadata?.allowedDurations;

      if (allowedDurations && allowedDurations.length > 0) {
        if (!allowedDurations.includes(durationMonths)) {
          const durationLabels = allowedDurations
            .map(d => (d === 12 ? '1 tahun' : `${d} bulan`))
            .join(', ');
          return {
            valid: false,
            error: `Voucher ini hanya berlaku untuk durasi: ${durationLabels}`,
          };
        }
      }
    }

    // Check max uses
    if (voucher.maxUses !== null && voucher.currentUses >= voucher.maxUses) {
      return {
        valid: false,
        error: 'Voucher has reached maximum redemptions',
      };
    }

    // Check user's previous redemptions
    const userRedemptionCount = voucher.redemptions.length;
    if (userRedemptionCount >= voucher.usesPerUser) {
      return {
        valid: false,
        error: 'You have already used this voucher',
      };
    }

    // Check eligibility
    const eligibility = await this.checkEligibility(voucher, userId);
    if (!eligibility.eligible) {
      return {
        valid: false,
        error: eligibility.reason,
      };
    }

    // Check applicable tiers
    if (voucher.applicableTiers.length > 0 && !voucher.applicableTiers.includes(tier)) {
      return {
        valid: false,
        error: `This voucher is not available for ${tier} tier`,
      };
    }

    // Generate discount preview
    const discountPreview = this.getDiscountPreview(voucher, originalAmount);

    return {
      valid: true,
      voucher,
      discountPreview,
    };
  }

  /**
   * Apply voucher to a subscription/checkout
   */
  async applyVoucher(
    code: string,
    userId: string,
    tier: SubscriptionTier,
    originalAmount: number,
    subscriptionId?: string,
    durationMonths?: number
  ): Promise<VoucherRedemptionResult> {
    // First validate
    const validation = await this.validateVoucher(
      code,
      userId,
      tier,
      originalAmount,
      durationMonths
    );

    if (!validation.valid || !validation.voucher) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const voucher = validation.voucher;

    // Calculate discount
    const discountResult = this.calculateDiscount(voucher, originalAmount);

    // Create redemption record
    const redemption = await prisma.voucherRedemption.create({
      data: {
        voucherId: voucher.id,
        userId,
        subscriptionId,
        discountType: voucher.type,
        discountValue: voucher.value,
        originalAmount,
        finalAmount: discountResult.finalAmount,
        status: RedemptionStatus.APPLIED,
      },
    });

    // Increment voucher usage count
    await prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        currentUses: { increment: 1 },
      },
    });

    // Apply special voucher effects
    await this.applyVoucherEffects(voucher, userId, discountResult);

    return {
      success: true,
      redemption,
      discountResult,
    };
  }

  /**
   * Calculate discount based on voucher type
   */
  calculateDiscount(voucher: Voucher, originalAmount: number): DiscountResult {
    switch (voucher.type) {
      case VoucherType.PERCENTAGE:
        const percentDiscount = Math.round(originalAmount * (voucher.value / 100));
        return {
          discountAmount: percentDiscount,
          finalAmount: originalAmount - percentDiscount,
        };

      case VoucherType.FIXED_AMOUNT:
        const fixedDiscount = Math.min(voucher.value, originalAmount);
        return {
          discountAmount: fixedDiscount,
          finalAmount: originalAmount - fixedDiscount,
        };

      case VoucherType.BONUS_CREDITS:
        return {
          discountAmount: 0,
          finalAmount: originalAmount,
          bonusCredits: voucher.value,
        };

      case VoucherType.TRIAL_EXTENSION:
        return {
          discountAmount: 0,
          finalAmount: originalAmount,
          trialExtensionDays: voucher.value,
        };

      case VoucherType.TIER_UPGRADE:
        // For tier upgrade, return original amount (no discount)
        // The upgrade logic will be handled separately
        return {
          discountAmount: 0,
          finalAmount: originalAmount,
        };

      default:
        return {
          discountAmount: 0,
          finalAmount: originalAmount,
        };
    }
  }

  /**
   * Check if user is eligible for voucher
   */
  async checkEligibility(voucher: Voucher, userId: string): Promise<VoucherEligibility> {
    // Check new users only constraint
    if (voucher.newUsersOnly) {
      const existingRedemptions = await prisma.voucherRedemption.count({
        where: { userId },
      });

      if (existingRedemptions > 0) {
        return {
          eligible: false,
          reason: 'This voucher is only for new users',
        };
      }

      // Also check if user has any subscription history
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (subscription && subscription.tier !== SubscriptionTier.FREE) {
        return {
          eligible: false,
          reason: 'This voucher is only for new users',
        };
      }
    }

    // Check exclusive voucher constraint
    if (voucher.isExclusive) {
      // Check if user has used any exclusive voucher
      const exclusiveRedemption = await prisma.voucherRedemption.findFirst({
        where: {
          userId,
          voucher: {
            isExclusive: true,
          },
        },
      });

      if (exclusiveRedemption) {
        return {
          eligible: false,
          reason: 'Cannot use this voucher with other exclusive offers',
        };
      }
    }

    return { eligible: true };
  }

  /**
   * Get user's redeemed vouchers
   */
  async getUserRedemptions(userId: string): Promise<(VoucherRedemption & { voucher: Voucher })[]> {
    return prisma.voucherRedemption.findMany({
      where: { userId },
      include: { voucher: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get discount preview description
   */
  private getDiscountPreview(
    voucher: Voucher,
    originalAmount?: number
  ): { type: VoucherType; value: number; description: string } {
    let description: string;

    switch (voucher.type) {
      case VoucherType.PERCENTAGE:
        const percentOff = voucher.value;
        if (originalAmount) {
          const savings = Math.round(originalAmount * (percentOff / 100));
          description = `${percentOff}% off (Save Rp ${savings.toLocaleString('id-ID')})`;
        } else {
          description = `${percentOff}% off`;
        }
        break;

      case VoucherType.FIXED_AMOUNT:
        description = `Rp ${voucher.value.toLocaleString('id-ID')} off`;
        break;

      case VoucherType.BONUS_CREDITS:
        description = `${voucher.value.toLocaleString('id-ID')} bonus credits`;
        break;

      case VoucherType.TRIAL_EXTENSION:
        description = `${voucher.value} extra trial days`;
        break;

      case VoucherType.TIER_UPGRADE:
        description = `Temporary tier upgrade`;
        break;

      default:
        description = voucher.description || 'Special offer';
    }

    return {
      type: voucher.type,
      value: voucher.value,
      description,
    };
  }

  /**
   * Apply special voucher effects (bonus credits, trial extension, etc.)
   */
  private async applyVoucherEffects(
    voucher: Voucher,
    userId: string,
    discountResult: DiscountResult
  ): Promise<void> {
    // Handle bonus credits
    if (voucher.type === VoucherType.BONUS_CREDITS && discountResult.bonusCredits) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (subscription) {
        if (subscription.tier === SubscriptionTier.FREE) {
          // Add bonus trial credits
          await trialService.addBonusTrialCredits(
            userId,
            discountResult.bonusCredits,
            `Voucher bonus: ${voucher.code}`
          );
        } else {
          // Add bonus credits to regular subscription
          await prisma.subscription.update({
            where: { userId },
            data: {
              creditsRemaining: { increment: discountResult.bonusCredits },
              creditsTotal: { increment: discountResult.bonusCredits },
            },
          });

          // Record transaction
          await prisma.creditTransaction.create({
            data: {
              userId,
              type: CreditTransactionType.BONUS,
              amount: discountResult.bonusCredits,
              balance: subscription.creditsRemaining + discountResult.bonusCredits,
              description: `Voucher bonus: ${voucher.code}`,
            },
          });
        }
      }
    }

    // Handle trial extension
    if (voucher.type === VoucherType.TRIAL_EXTENSION && discountResult.trialExtensionDays) {
      await trialService.extendTrial(userId, discountResult.trialExtensionDays);
    }
  }

  /**
   * Revoke a voucher redemption (admin function)
   */
  async revokeRedemption(redemptionId: string): Promise<void> {
    const redemption = await prisma.voucherRedemption.findUnique({
      where: { id: redemptionId },
      include: { voucher: true },
    });

    if (!redemption) {
      throw new Error('Redemption not found');
    }

    // Update redemption status
    await prisma.voucherRedemption.update({
      where: { id: redemptionId },
      data: { status: RedemptionStatus.REVOKED },
    });

    // Decrement voucher usage count
    await prisma.voucher.update({
      where: { id: redemption.voucherId },
      data: {
        currentUses: { decrement: 1 },
      },
    });
  }

  /**
   * Check if a voucher can be stacked with another
   */
  async canStackVouchers(voucherCodes: string[]): Promise<{ canStack: boolean; reason?: string }> {
    if (voucherCodes.length <= 1) {
      return { canStack: true };
    }

    const vouchers = await prisma.voucher.findMany({
      where: {
        code: { in: voucherCodes.map(c => c.trim().toUpperCase()) },
      },
    });

    // Check if any voucher is non-stackable
    const nonStackable = vouchers.find(v => !v.isStackable);
    if (nonStackable) {
      return {
        canStack: false,
        reason: `Voucher ${nonStackable.code} cannot be combined with other vouchers`,
      };
    }

    // Check if any voucher is exclusive
    const exclusive = vouchers.find(v => v.isExclusive);
    if (exclusive) {
      return {
        canStack: false,
        reason: `Voucher ${exclusive.code} is an exclusive offer and cannot be combined`,
      };
    }

    return { canStack: true };
  }

  /**
   * Get voucher by code (for display purposes)
   */
  async getVoucherByCode(code: string): Promise<Voucher | null> {
    return prisma.voucher.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
  }
}

// Export singleton instance
export const voucherService = new VoucherService();
