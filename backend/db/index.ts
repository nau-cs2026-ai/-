import { 
  db, 
  users, 
  products, 
  messages, 
  orders, 
  reports, 
  favorites,
  eq, 
  and, 
  or, 
  ilike, 
  desc, 
  asc, 
  sql,
  type User,
  type Product,
  type Message,
  type Order,
  type Report,
  type Favorite,
  type InsertUser,
  type InsertProduct,
  type InsertMessage,
  type InsertOrder,
  type InsertReport,
  type InsertFavorite,
} from './memory-store';

export { 
  db, 
  users, 
  products, 
  messages, 
  orders, 
  reports, 
  favorites,
  eq, 
  and, 
  or, 
  ilike, 
  desc, 
  asc, 
  sql 
};

export type { 
  User, 
  Product, 
  Message, 
  Order, 
  Report, 
  Favorite,
  InsertUser,
  InsertProduct,
  InsertMessage,
  InsertOrder,
  InsertReport,
  InsertFavorite,
};

export const insertUserSchema = {
  safeParse: (data: unknown) => {
    const d = data as Record<string, unknown>;
    if (!d.name || typeof d.name !== 'string') {
      return { success: false as const, error: { errors: [{ message: '姓名不能为空' }] } };
    }
    if (!d.email || typeof d.email !== 'string') {
      return { success: false as const, error: { errors: [{ message: '邮箱不能为空' }] } };
    }
    if (!d.password || typeof d.password !== 'string' || d.password.length < 6) {
      return { success: false as const, error: { errors: [{ message: '密码至少6位' }] } };
    }
    return { success: true as const, data: d as InsertUser };
  },
};

export const insertProductSchema = {
  safeParse: (data: unknown) => {
    const d = data as Record<string, unknown>;
    if (!d.title || typeof d.title !== 'string') {
      return { success: false as const, error: { errors: [{ message: '标题不能为空' }] } };
    }
    if (!d.price) {
      return { success: false as const, error: { errors: [{ message: '价格不能为空' }] } };
    }
    if (!d.category || typeof d.category !== 'string') {
      return { success: false as const, error: { errors: [{ message: '分类不能为空' }] } };
    }
    if (!d.condition || typeof d.condition !== 'string') {
      return { success: false as const, error: { errors: [{ message: '成色不能为空' }] } };
    }
    if (!d.location || typeof d.location !== 'string') {
      return { success: false as const, error: { errors: [{ message: '地点不能为空' }] } };
    }
    return { success: true as const, data: d as InsertProduct };
  },
};

export const insertMessageSchema = {
  safeParse: (data: unknown) => {
    const d = data as Record<string, unknown>;
    if (!d.content || typeof d.content !== 'string') {
      return { success: false as const, error: { errors: [{ message: '内容不能为空' }] } };
    }
    return { success: true as const, data: d as InsertMessage };
  },
};

export const insertOrderSchema = {
  safeParse: (data: unknown) => {
    return { success: true as const, data: data as InsertOrder };
  },
};

export const insertReportSchema = {
  safeParse: (data: unknown) => {
    const d = data as Record<string, unknown>;
    if (!d.reason || typeof d.reason !== 'string') {
      return { success: false as const, error: { errors: [{ message: '原因不能为空' }] } };
    }
    return { success: true as const, data: d as InsertReport };
  },
};

export const insertFavoriteSchema = {
  safeParse: (data: unknown) => {
    return { success: true as const, data: data as InsertFavorite };
  },
};
