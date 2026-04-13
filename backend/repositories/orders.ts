import { db } from '../db';
import { orders, Order, InsertOrder } from '../db';
import { eq, desc } from '../db';

export const ordersRepository = {
  async findByBuyer(buyerId: string): Promise<Order[]> {
    const result = await db.select().from(orders).where(eq(orders.buyerId, buyerId)).orderBy(desc(orders.createdAt));
    return result as Order[];
  },

  async findBySeller(sellerId: string): Promise<Order[]> {
    const result = await db.select().from(orders).where(eq(orders.sellerId, sellerId)).orderBy(desc(orders.createdAt));
    return result as Order[];
  },

  async findById(id: string): Promise<Order | null> {
    const result = await db.select().from(orders).where(eq(orders.id, id)) as Order[];
    return result[0] || null;
  },

  async create(data: Partial<InsertOrder>): Promise<Order> {
    const result = await db.insert(orders).values({
      ...data,
      status: data.status || 'intent',
    } as Record<string, unknown>).returning() as Order[];
    return result[0];
  },

  async complete(id: string, rating: number, comment: string): Promise<Order | null> {
    const result = await db.update(orders)
      .set({ status: 'completed', buyerRating: rating, buyerComment: comment, completedAt: new Date() } as Record<string, unknown>)
      .where(eq(orders.id, id))
      .returning() as Order[];
    return result[0] || null;
  },

  async findAll(): Promise<Order[]> {
    const result = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return result as Order[];
  },
};
