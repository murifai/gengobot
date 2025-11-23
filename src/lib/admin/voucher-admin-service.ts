import { prisma } from '@/lib/prisma';
import { Voucher, VoucherType, SubscriptionTier, Prisma } from '@prisma/client';

// Types for voucher admin operations
export interface CreateVoucherInput {
  code: string;
  name: string;
  description?: string;
  type: VoucherType;
  value: number;
  maxUses?: number;
  usesPerUser?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  newUsersOnly?: boolean;
  applicableTiers?: SubscriptionTier[];
  minMonths?: number;
  isStackable?: boolean;
  isExclusive?: boolean;
  createdBy?: string;
  metadata?: Prisma.InputJsonValue;
}

export interface UpdateVoucherInput {
  name?: string;
  description?: string;
  type?: VoucherType;
  value?: number;
  maxUses?: number;
  usesPerUser?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  newUsersOnly?: boolean;
  applicableTiers?: SubscriptionTier[];
  minMonths?: number;
  isStackable?: boolean;
  isExclusive?: boolean;
  metadata?: Prisma.InputJsonValue;
}

export interface VoucherStats {
  totalRedemptions: number;
  totalDiscountGiven: number;
  conversionRate: number;
  averageOrderValue: number;
  redemptionsByDate: { date: string; count: number }[];
}

export interface VoucherWithStats extends Voucher {
  stats: VoucherStats;
}

export interface VoucherListFilters {
  isActive?: boolean;
  type?: VoucherType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VoucherTemplate {
  name: string;
  description?: string;
  type: VoucherType;
  value: number;
  maxUses?: number;
  usesPerUser?: number;
  endDate?: Date;
  isActive?: boolean;
  newUsersOnly?: boolean;
  applicableTiers?: SubscriptionTier[];
  isStackable?: boolean;
  isExclusive?: boolean;
}

export class VoucherAdminService {
  /**
   * Create a new voucher
   */
  async createVoucher(data: CreateVoucherInput): Promise<Voucher> {
    // Normalize code to uppercase
    const normalizedCode = data.code.trim().toUpperCase();

    // Check for duplicate code
    const existing = await prisma.voucher.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      throw new Error(`Voucher code "${normalizedCode}" already exists`);
    }

    return prisma.voucher.create({
      data: {
        code: normalizedCode,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        usesPerUser: data.usesPerUser ?? 1,
        startDate: data.startDate ?? new Date(),
        endDate: data.endDate,
        isActive: data.isActive ?? true,
        newUsersOnly: data.newUsersOnly ?? false,
        applicableTiers: data.applicableTiers ?? [],
        minMonths: data.minMonths,
        isStackable: data.isStackable ?? false,
        isExclusive: data.isExclusive ?? false,
        createdBy: data.createdBy,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Update an existing voucher
   */
  async updateVoucher(id: string, data: UpdateVoucherInput): Promise<Voucher> {
    return prisma.voucher.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.usesPerUser !== undefined && { usesPerUser: data.usesPerUser }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.newUsersOnly !== undefined && { newUsersOnly: data.newUsersOnly }),
        ...(data.applicableTiers && { applicableTiers: data.applicableTiers }),
        ...(data.minMonths !== undefined && { minMonths: data.minMonths }),
        ...(data.isStackable !== undefined && { isStackable: data.isStackable }),
        ...(data.isExclusive !== undefined && { isExclusive: data.isExclusive }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      },
    });
  }

  /**
   * Delete a voucher
   */
  async deleteVoucher(id: string): Promise<void> {
    // Check if voucher has redemptions
    const redemptionCount = await prisma.voucherRedemption.count({
      where: { voucherId: id },
    });

    if (redemptionCount > 0) {
      throw new Error('Cannot delete voucher with existing redemptions. Deactivate it instead.');
    }

    await prisma.voucher.delete({
      where: { id },
    });
  }

  /**
   * Toggle voucher active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<Voucher> {
    return prisma.voucher.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Get voucher by ID
   */
  async getVoucher(id: string): Promise<Voucher | null> {
    return prisma.voucher.findUnique({
      where: { id },
    });
  }

  /**
   * Get voucher stats
   */
  async getVoucherStats(id: string): Promise<VoucherStats> {
    const redemptions = await prisma.voucherRedemption.findMany({
      where: { voucherId: id },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate stats
    const totalRedemptions = redemptions.length;
    const totalDiscountGiven = redemptions.reduce((sum, r) => {
      const discount = (r.originalAmount || 0) - (r.finalAmount || 0);
      return sum + discount;
    }, 0);

    // Average order value
    const validOrders = redemptions.filter(r => r.finalAmount && r.finalAmount > 0);
    const averageOrderValue =
      validOrders.length > 0
        ? validOrders.reduce((sum, r) => sum + (r.finalAmount || 0), 0) / validOrders.length
        : 0;

    // Conversion rate: users who upgraded after using voucher
    // This requires checking subscription changes - simplified for now
    const conversionRate = totalRedemptions > 0 ? 0.5 : 0; // Placeholder

    // Redemptions by date
    const redemptionsByDate = this.groupByDate(redemptions);

    return {
      totalRedemptions,
      totalDiscountGiven,
      conversionRate,
      averageOrderValue,
      redemptionsByDate,
    };
  }

  /**
   * Get all vouchers with stats
   */
  async getAllVouchersWithStats(filters?: VoucherListFilters): Promise<{
    vouchers: VoucherWithStats[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.VoucherWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get vouchers with pagination
    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.voucher.count({ where }),
    ]);

    // Get stats for each voucher
    const vouchersWithStats = await Promise.all(
      vouchers.map(async voucher => {
        const stats = await this.getVoucherStats(voucher.id);
        return { ...voucher, stats };
      })
    );

    return {
      vouchers: vouchersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Generate bulk voucher codes
   */
  async generateBulkCodes(
    prefix: string,
    count: number,
    template: VoucherTemplate,
    createdBy?: string
  ): Promise<Voucher[]> {
    const vouchers: Voucher[] = [];

    for (let i = 0; i < count; i++) {
      // Generate unique code
      const suffix = this.generateRandomSuffix(6);
      const code = `${prefix.toUpperCase()}${suffix}`;

      try {
        const voucher = await this.createVoucher({
          code,
          name: `${template.name} #${i + 1}`,
          description: template.description,
          type: template.type,
          value: template.value,
          maxUses: template.maxUses ?? 1, // Default to single use for bulk
          usesPerUser: template.usesPerUser ?? 1,
          endDate: template.endDate,
          isActive: template.isActive ?? true,
          newUsersOnly: template.newUsersOnly ?? false,
          applicableTiers: template.applicableTiers,
          isStackable: template.isStackable ?? false,
          isExclusive: template.isExclusive ?? false,
          createdBy,
        });
        vouchers.push(voucher);
      } catch {
        // Skip duplicate codes, retry with new suffix
        i--;
        continue;
      }
    }

    return vouchers;
  }

  /**
   * Export redemptions to CSV format
   */
  async exportRedemptions(voucherId: string): Promise<string> {
    const redemptions = await prisma.voucherRedemption.findMany({
      where: { voucherId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        voucher: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = [
      'Redemption ID',
      'User Email',
      'User Name',
      'Voucher Code',
      'Voucher Name',
      'Discount Type',
      'Discount Value',
      'Original Amount',
      'Final Amount',
      'Status',
      'Created At',
    ];

    const rows = redemptions.map(r => [
      r.id,
      r.user.email,
      r.user.name || '',
      r.voucher.code,
      r.voucher.name,
      r.discountType,
      r.discountValue.toString(),
      r.originalAmount?.toString() || '',
      r.finalAmount?.toString() || '',
      r.status,
      r.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Get redemptions for a voucher
   */
  async getRedemptions(voucherId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [redemptions, total] = await Promise.all([
      prisma.voucherRedemption.findMany({
        where: { voucherId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.voucherRedemption.count({ where: { voucherId } }),
    ]);

    return {
      redemptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get overall voucher analytics
   */
  async getOverallAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVouchers,
      activeVouchers,
      totalRedemptions,
      last30DaysRedemptions,
      totalDiscountGiven,
    ] = await Promise.all([
      prisma.voucher.count(),
      prisma.voucher.count({ where: { isActive: true } }),
      prisma.voucherRedemption.count(),
      prisma.voucherRedemption.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.voucherRedemption.aggregate({
        _sum: {
          originalAmount: true,
          finalAmount: true,
        },
      }),
    ]);

    const totalDiscount =
      (totalDiscountGiven._sum.originalAmount || 0) - (totalDiscountGiven._sum.finalAmount || 0);

    // Top vouchers by redemptions
    const topVouchers = await prisma.voucher.findMany({
      orderBy: { currentUses: 'desc' },
      take: 5,
      select: {
        id: true,
        code: true,
        name: true,
        currentUses: true,
        type: true,
        value: true,
      },
    });

    return {
      totalVouchers,
      activeVouchers,
      totalRedemptions,
      last30DaysRedemptions,
      totalDiscountGiven: totalDiscount,
      topVouchers,
    };
  }

  /**
   * Helper: Group redemptions by date
   */
  private groupByDate(redemptions: { createdAt: Date }[]): { date: string; count: number }[] {
    const grouped: Record<string, number> = {};

    redemptions.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  /**
   * Helper: Generate random suffix for voucher codes
   */
  private generateRandomSuffix(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export singleton instance
export const voucherAdminService = new VoucherAdminService();
