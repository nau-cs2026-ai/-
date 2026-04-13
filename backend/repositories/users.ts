import { db } from '../db';
import { users, InsertUser, User } from '../db';
import { eq } from '../db';

export const usersRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).orderBy({ field: 'createdAt', direction: 'desc' }) as User[];
    return result[0] || null;
  },

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)) as User[];
    return result[0] || null;
  },

  async create(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...userData,
      isVerified: userData.isVerified ?? false,
      creditScore: userData.creditScore ?? 100,
      completedDeals: userData.completedDeals ?? 0,
      positiveRate: userData.positiveRate ?? '100',
      role: userData.role ?? 'user',
      isBanned: userData.isBanned ?? false,
    }).returning() as User[];
    return result[0];
  },

  async update(id: string, data: Partial<InsertUser>): Promise<User | null> {
    const result = await db.update(users)
      .set(data as Record<string, unknown>)
      .where(eq(users.id, id))
      .returning() as User[];
    return result[0] || null;
  },

  async findAll(): Promise<User[]> {
    return db.select().from(users) as Promise<User[]>;
  },

  async updateCreditScore(id: string, delta: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;
    const newScore = Math.max(0, user.creditScore + delta);
    await db.update(users)
      .set({ creditScore: newScore } as Record<string, unknown>)
      .where(eq(users.id, id));
  },
};
