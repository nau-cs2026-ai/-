import { db } from '../db';
import { reports, Report, InsertReport } from '../db';
import { eq, desc } from '../db';

export const reportsRepository = {
  async findAll(): Promise<Report[]> {
    const result = await db.select().from(reports).orderBy(desc(reports.createdAt));
    return result as Report[];
  },

  async create(data: InsertReport): Promise<Report> {
    const result = await db.insert(reports).values({
      ...data,
      status: data.status || 'pending',
    }).returning() as Report[];
    return result[0];
  },

  async resolve(id: string, adminNote: string): Promise<Report | null> {
    const result = await db.update(reports)
      .set({ status: 'resolved', adminNote, resolvedAt: new Date() } as Record<string, unknown>)
      .where(eq(reports.id, id))
      .returning() as Report[];
    return result[0] || null;
  },

  async dismiss(id: string, adminNote: string): Promise<Report | null> {
    const result = await db.update(reports)
      .set({ status: 'dismissed', adminNote, resolvedAt: new Date() } as Record<string, unknown>)
      .where(eq(reports.id, id))
      .returning() as Report[];
    return result[0] || null;
  },
};
