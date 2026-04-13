import { db } from '../db';
import { products, Product, InsertProduct } from '../db';
import { eq, desc, ilike, and, or } from '../db';

export const productsRepository = {
  async findAll(filters?: {
    category?: string;
    condition?: string;
    search?: string;
    status?: string;
    sellerId?: string;
    isGraduationSeason?: boolean;
  }): Promise<Product[]> {
    const conditions = [];
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(products.category, filters.category));
    }
    if (filters?.condition && filters.condition !== 'all') {
      conditions.push(eq(products.condition, filters.condition));
    }
    if (filters?.status) {
      conditions.push(eq(products.status, filters.status));
    }
    if (filters?.sellerId) {
      conditions.push(eq(products.sellerId, filters.sellerId));
    }
    if (filters?.isGraduationSeason) {
      conditions.push(eq(products.isGraduationSeason, true));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(products.title, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`)
        )
      );
    }
    const query = conditions.length > 0
      ? db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt))
      : db.select().from(products).orderBy(desc(products.createdAt));
    return query as Promise<Product[]>;
  },

  async findById(id: string): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id)) as Product[];
    return result[0] || null;
  },

  async create(data: InsertProduct): Promise<Product> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const result = await db.insert(products).values({ 
      ...data, 
      expiresAt,
      images: data.images || [],
      status: data.status || 'pending',
      isUrgent: data.isUrgent ?? false,
      isFeatured: data.isFeatured ?? false,
      isGraduationSeason: data.isGraduationSeason ?? false,
      favoriteCount: 0,
      viewCount: 0,
    }).returning() as Product[];
    return result[0];
  },

  async update(id: string, data: Partial<InsertProduct>): Promise<Product | null> {
    const result = await db.update(products)
      .set({ ...data, updatedAt: new Date() } as Record<string, unknown>)
      .where(eq(products.id, id))
      .returning() as Product[];
    return result[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  },

  async incrementView(id: string): Promise<void> {
    const product = await this.findById(id);
    if (product) {
      await db.update(products)
        .set({ viewCount: (product.viewCount || 0) + 1 } as Record<string, unknown>)
        .where(eq(products.id, id));
    }
  },

  async updateFavoriteCount(id: string, delta: number): Promise<void> {
    const product = await this.findById(id);
    if (product) {
      await db.update(products)
        .set({ favoriteCount: Math.max(0, (product.favoriteCount || 0) + delta) } as Record<string, unknown>)
        .where(eq(products.id, id));
    }
  },
};
