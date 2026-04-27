import { db } from '../db';
import { messages, Message, InsertMessage } from '../db';
import { eq, and, or, desc } from '../db';

export const messagesRepository = {
  async getConversation(userId1: string, userId2: string, productId?: string): Promise<Message[]> {
    const conditions = [
      or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      ),
    ];
    if (productId) conditions.push(eq(messages.productId, productId));
    const result = await db.select().from(messages).where(and(...conditions)).orderBy(desc(messages.createdAt));
    return result as Message[];
  },

  async getConversationList(userId: string): Promise<Message[]> {
    const result = await db.select().from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
    return result as Message[];
  },

  async create(data: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values({
      ...data,
      messageType: data.messageType || 'text',
      isRead: data.isRead ?? false,
    }).returning() as Message[];
    return result[0];
  },

  async markRead(senderId: string, receiverId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true } as Record<string, unknown>)
      .where(and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId)));
  },

  async delete(messageId: string, userId: string): Promise<boolean> {
    const result = await db.delete(messages)
      .where(and(eq(messages.id, messageId), eq(messages.senderId, userId)))
      .returning();
    return result.length > 0;
  },
};
