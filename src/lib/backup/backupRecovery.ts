/**
 * Backup and Recovery Service
 * Comprehensive backup and recovery system for task management data
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

export interface BackupOptions {
  includeTasks?: boolean;
  includeAttempts?: boolean;
  includeUsers?: boolean;
  includeConversations?: boolean;
  includeCharacters?: boolean;
  compress?: boolean;
  backupPath?: string;
}

export interface BackupMetadata {
  timestamp: Date;
  version: string;
  tables: string[];
  recordCounts: Record<string, number>;
  checksum?: string;
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  filepath: string;
  metadata: BackupMetadata;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredTables: string[];
  recordsRestored: Record<string, number>;
  errors: string[];
}

const DEFAULT_BACKUP_PATH = './backups';

/**
 * Create a full backup of the database
 */
export async function createFullBackup(options: BackupOptions = {}): Promise<BackupResult> {
  try {
    const backupId = generateBackupId();
    const backupPath = options.backupPath || DEFAULT_BACKUP_PATH;

    // Ensure backup directory exists
    await ensureDirectory(backupPath);

    // Collect data from all tables
    const backupData: Record<string, unknown> = {
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        tables: [],
        recordCounts: {},
      },
    };

    // Backup tasks
    if (options.includeTasks !== false) {
      const tasks = await prisma.task.findMany();
      backupData.tasks = tasks;
      backupData.metadata.tables.push('tasks');
      backupData.metadata.recordCounts.tasks = tasks.length;
    }

    // Backup task attempts
    if (options.includeAttempts !== false) {
      const attempts = await prisma.taskAttempt.findMany();
      backupData.taskAttempts = attempts;
      backupData.metadata.tables.push('taskAttempts');
      backupData.metadata.recordCounts.taskAttempts = attempts.length;
    }

    // Backup users
    if (options.includeUsers !== false) {
      const users = await prisma.user.findMany();
      backupData.users = users;
      backupData.metadata.tables.push('users');
      backupData.metadata.recordCounts.users = users.length;
    }

    // Backup conversations
    if (options.includeConversations !== false) {
      const conversations = await prisma.conversation.findMany();
      backupData.conversations = conversations;
      backupData.metadata.tables.push('conversations');
      backupData.metadata.recordCounts.conversations = conversations.length;
    }

    // Backup characters
    if (options.includeCharacters !== false) {
      const characters = await prisma.character.findMany();
      backupData.characters = characters;
      backupData.metadata.tables.push('characters');
      backupData.metadata.recordCounts.characters = characters.length;
    }

    // Backup task categories
    const categories = await prisma.taskCategory.findMany();
    backupData.taskCategories = categories;
    backupData.metadata.tables.push('taskCategories');
    backupData.metadata.recordCounts.taskCategories = categories.length;

    // Calculate checksum
    const dataString = JSON.stringify(backupData);
    backupData.metadata.checksum = calculateChecksum(dataString);

    // Write backup file
    const filename = `backup_${backupId}.json`;
    const filepath = path.join(backupPath, filename);

    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

    return {
      success: true,
      backupId,
      filepath,
      metadata: backupData.metadata,
    };
  } catch (error) {
    return {
      success: false,
      backupId: '',
      filepath: '',
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        tables: [],
        recordCounts: {},
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create incremental backup (only changed data since last backup)
 */
export async function createIncrementalBackup(
  lastBackupDate: Date,
  options: BackupOptions = {}
): Promise<BackupResult> {
  try {
    const backupId = generateBackupId();
    const backupPath = options.backupPath || DEFAULT_BACKUP_PATH;

    await ensureDirectory(backupPath);

    const backupData: Record<string, unknown> = {
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        type: 'incremental',
        sincDate: lastBackupDate,
        tables: [],
        recordCounts: {},
      },
    };

    // Backup changed tasks
    if (options.includeTasks !== false) {
      const tasks = await prisma.task.findMany({
        where: {
          OR: [{ createdAt: { gte: lastBackupDate } }, { updatedAt: { gte: lastBackupDate } }],
        },
      });
      backupData.tasks = tasks;
      backupData.metadata.tables.push('tasks');
      backupData.metadata.recordCounts.tasks = tasks.length;
    }

    // Backup changed attempts
    if (options.includeAttempts !== false) {
      const attempts = await prisma.taskAttempt.findMany({
        where: { startTime: { gte: lastBackupDate } },
      });
      backupData.taskAttempts = attempts;
      backupData.metadata.tables.push('taskAttempts');
      backupData.metadata.recordCounts.taskAttempts = attempts.length;
    }

    // Backup changed users
    if (options.includeUsers !== false) {
      const users = await prisma.user.findMany({
        where: {
          OR: [{ createdAt: { gte: lastBackupDate } }, { updatedAt: { gte: lastBackupDate } }],
        },
      });
      backupData.users = users;
      backupData.metadata.tables.push('users');
      backupData.metadata.recordCounts.users = users.length;
    }

    // Backup changed conversations
    if (options.includeConversations !== false) {
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [{ createdAt: { gte: lastBackupDate } }, { updatedAt: { gte: lastBackupDate } }],
        },
      });
      backupData.conversations = conversations;
      backupData.metadata.tables.push('conversations');
      backupData.metadata.recordCounts.conversations = conversations.length;
    }

    const dataString = JSON.stringify(backupData);
    backupData.metadata.checksum = calculateChecksum(dataString);

    const filename = `backup_incremental_${backupId}.json`;
    const filepath = path.join(backupPath, filename);

    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

    return {
      success: true,
      backupId,
      filepath,
      metadata: backupData.metadata,
    };
  } catch (error) {
    return {
      success: false,
      backupId: '',
      filepath: '',
      metadata: {
        timestamp: new Date(),
        version: '1.0.0',
        tables: [],
        recordCounts: {},
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Restore database from backup file
 */
export async function restoreFromBackup(
  backupFilepath: string,
  options: {
    verifyChecksum?: boolean;
    clearExisting?: boolean;
    dryRun?: boolean;
  } = {}
): Promise<RestoreResult> {
  const result: RestoreResult = {
    success: false,
    restoredTables: [],
    recordsRestored: {},
    errors: [],
  };

  try {
    // Read backup file
    const backupContent = await fs.readFile(backupFilepath, 'utf-8');
    const backupData = JSON.parse(backupContent);

    // Verify checksum if requested
    if (options.verifyChecksum && backupData.metadata.checksum) {
      const calculatedChecksum = calculateChecksum(
        JSON.stringify({
          ...backupData,
          metadata: { ...backupData.metadata, checksum: undefined },
        })
      );
      if (calculatedChecksum !== backupData.metadata.checksum) {
        result.errors.push('Checksum verification failed');
        return result;
      }
    }

    if (options.dryRun) {
      result.success = true;
      result.restoredTables = backupData.metadata.tables;
      result.recordsRestored = backupData.metadata.recordCounts;
      return result;
    }

    // Start transaction
    await prisma.$transaction(async tx => {
      // Clear existing data if requested
      if (options.clearExisting) {
        await tx.taskAttempt.deleteMany();
        await tx.conversation.deleteMany();
        await tx.task.deleteMany();
        await tx.character.deleteMany();
        await tx.taskCategory.deleteMany();
        // Don't delete users to preserve authentication
      }

      // Restore task categories first (no foreign keys)
      if (backupData.taskCategories) {
        for (const category of backupData.taskCategories) {
          await tx.taskCategory.upsert({
            where: { id: category.id },
            update: category,
            create: category,
          });
        }
        result.restoredTables.push('taskCategories');
        result.recordsRestored.taskCategories = backupData.taskCategories.length;
      }

      // Restore users
      if (backupData.users) {
        for (const user of backupData.users) {
          await tx.user.upsert({
            where: { id: user.id },
            update: user,
            create: user,
          });
        }
        result.restoredTables.push('users');
        result.recordsRestored.users = backupData.users.length;
      }

      // Restore characters
      if (backupData.characters) {
        for (const character of backupData.characters) {
          await tx.character.upsert({
            where: { id: character.id },
            update: character,
            create: character,
          });
        }
        result.restoredTables.push('characters');
        result.recordsRestored.characters = backupData.characters.length;
      }

      // Restore tasks
      if (backupData.tasks) {
        for (const task of backupData.tasks) {
          await tx.task.upsert({
            where: { id: task.id },
            update: task,
            create: task,
          });
        }
        result.restoredTables.push('tasks');
        result.recordsRestored.tasks = backupData.tasks.length;
      }

      // Restore conversations
      if (backupData.conversations) {
        for (const conversation of backupData.conversations) {
          await tx.conversation.upsert({
            where: { id: conversation.id },
            update: conversation,
            create: conversation,
          });
        }
        result.restoredTables.push('conversations');
        result.recordsRestored.conversations = backupData.conversations.length;
      }

      // Restore task attempts
      if (backupData.taskAttempts) {
        for (const attempt of backupData.taskAttempts) {
          await tx.taskAttempt.upsert({
            where: { id: attempt.id },
            update: attempt,
            create: attempt,
          });
        }
        result.restoredTables.push('taskAttempts');
        result.recordsRestored.taskAttempts = backupData.taskAttempts.length;
      }
    });

    result.success = true;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}

/**
 * List all available backups
 */
export async function listBackups(
  backupPath: string = DEFAULT_BACKUP_PATH
): Promise<BackupMetadata[]> {
  try {
    const files = await fs.readdir(backupPath);
    const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));

    const backups: BackupMetadata[] = [];

    for (const file of backupFiles) {
      const filepath = path.join(backupPath, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(content);
      backups.push(data.metadata);
    }

    return backups.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Delete old backups (keep last N backups)
 */
export async function cleanupOldBackups(
  keepCount: number = 10,
  backupPath: string = DEFAULT_BACKUP_PATH
): Promise<number> {
  try {
    const backups = await listBackups(backupPath);

    if (backups.length <= keepCount) {
      return 0;
    }

    const toDelete = backups.slice(keepCount);
    let deletedCount = 0;

    for (const backup of toDelete) {
      const files = await fs.readdir(backupPath);
      const matchingFiles = files.filter(
        f => f.includes(backup.timestamp.toString().split('T')[0]) && f.endsWith('.json')
      );

      for (const file of matchingFiles) {
        await fs.unlink(path.join(backupPath, file));
        deletedCount++;
      }
    }

    return deletedCount;
  } catch {
    return 0;
  }
}

/**
 * Schedule automatic backups
 */
export async function scheduleBackup(
  intervalHours: number = 24,
  options: BackupOptions = {}
): Promise<NodeJS.Timeout> {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  const performBackup = async () => {
    const result = await createFullBackup(options);
    if (result.success) {
      console.log(`Backup created: ${result.backupId}`);
      // Cleanup old backups
      await cleanupOldBackups(10, options.backupPath);
    } else {
      console.error(`Backup failed: ${result.error}`);
    }
  };

  // Perform initial backup
  await performBackup();

  // Schedule recurring backups
  return setInterval(performBackup, intervalMs);
}

/**
 * Export backup to external storage (placeholder for cloud integration)
 */
export async function exportBackupToCloud(
  backupFilepath: string,
  cloudProvider: 'aws' | 'gcp' | 'azure'
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Placeholder for cloud storage integration
  // In a real implementation, you would use AWS S3, Google Cloud Storage, or Azure Blob Storage
  return {
    success: false,
    error: `Cloud export not yet implemented for ${cloudProvider}`,
  };
}

// ===== Helper Functions =====

function generateBackupId(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = Math.random().toString(36).substring(7);
  return `${timestamp}_${random}`;
}

async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

function calculateChecksum(data: string): string {
  // Simple checksum calculation
  // In production, use a proper hash function like SHA-256
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}
