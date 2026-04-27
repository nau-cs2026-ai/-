import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// 数据文件路径
const DATA_DIR = join(__dirname, '..', 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');
const PRODUCTS_FILE = join(DATA_DIR, 'products.json');
const MESSAGES_FILE = join(DATA_DIR, 'messages.json');
const ORDERS_FILE = join(DATA_DIR, 'orders.json');
const REPORTS_FILE = join(DATA_DIR, 'reports.json');
const FAVORITES_FILE = join(DATA_DIR, 'favorites.json');

// 确保数据目录存在
import { mkdirSync } from 'fs';
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

type BaseRecord = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

type User = BaseRecord & {
  name: string;
  email: string;
  password: string;
  studentId?: string | null;
  phone?: string | null;
  avatar?: string | null;
  department?: string | null;
  grade?: string | null;
  isVerified: boolean;
  creditScore: number;
  completedDeals: number;
  positiveRate: string;
  role: string;
  isBanned: boolean;
};

type Product = BaseRecord & {
  sellerId: string;
  title: string;
  description?: string | null;
  price: string;
  originalPrice?: string | null;
  category: string;
  condition: string;
  location: string;
  images: string[];
  status: string;
  rejectionReason?: string | null;
  isUrgent: boolean;
  isFeatured: boolean;
  isGraduationSeason: boolean;
  favoriteCount: number;
  viewCount: number;
  isbn?: string | null;
  expiresAt?: Date | null;
};

type Message = BaseRecord & {
  senderId: string;
  receiverId: string;
  productId?: string | null;
  content: string;
  messageType: string;
  isRead: boolean;
};

type Order = BaseRecord & {
  buyerId: string;
  sellerId: string;
  productId: string;
  status: string;
  buyerRating?: number | null;
  buyerComment?: string | null;
  completedAt?: Date | null;
};

type Report = BaseRecord & {
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string | null;
  status: string;
  adminNote?: string | null;
  resolvedAt?: Date | null;
};

type Favorite = BaseRecord & {
  userId: string;
  productId: string;
};

// 从文件加载数据
function loadData<T>(filePath: string, defaultValue: T[]): T[] {
  try {
    if (existsSync(filePath)) {
      const data = readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
  }
  return defaultValue;
}

// 保存数据到文件
function saveData<T>(filePath: string, data: T[]): void {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
}

// 初始化数据
const usersData: User[] = loadData(USERS_FILE, []);
const productsData: Product[] = loadData(PRODUCTS_FILE, []);
const messagesData: Message[] = loadData(MESSAGES_FILE, []);
const ordersData: Order[] = loadData(ORDERS_FILE, []);
const reportsData: Report[] = loadData(REPORTS_FILE, []);
const favoritesData: Favorite[] = loadData(FAVORITES_FILE, []);

// 如果没有用户数据，添加测试用户
if (usersData.length === 0) {
  const testUser: User = {
    id: 'user-001',
    name: '测试用户',
    email: 'test@example.com',
    password: '$2a$10$rQZ9QxZ9QxZ9QxZ9QxZ9QOZ9QxZ9QxZ9QxZ9QxZ9QxZ9QxZ9QxZ9Q',
    studentId: '2024001',
    phone: '13800138000',
    department: '计算机学院',
    grade: '2024级',
    isVerified: true,
    creditScore: 100,
    completedDeals: 5,
    positiveRate: '100',
    role: 'user',
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser: User = {
    id: 'admin-001',
    name: '管理员',
    email: 'admin@example.com',
    password: '$2a$10$rQZ9QxZ9QxZ9QxZ9QxZ9QOZ9QxZ9QxZ9QxZ9QxZ9QxZ9QxZ9QxZ9Q',
    isVerified: true,
    creditScore: 100,
    completedDeals: 0,
    positiveRate: '100',
    role: 'admin',
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  usersData.push(testUser, adminUser);
  saveData(USERS_FILE, usersData);
}

type Condition = { 
  type: 'eq' | 'ilike' | 'sql'; 
  field: string; 
  value: unknown;
  sqlExpr?: (row: Record<string, unknown>) => boolean;
};

type LogicalCondition = {
  type: 'and' | 'or';
  conditions: Array<Condition | LogicalCondition>;
};

type OrderByConfig = { field: string; direction: 'asc' | 'desc' };

function matchesCondition(item: Record<string, unknown>, condition: Condition | LogicalCondition): boolean {
  if (condition.type === 'eq') {
    return item[condition.field] === condition.value;
  }
  if (condition.type === 'ilike') {
    const itemValue = String(item[condition.field] || '').toLowerCase();
    const searchValue = String(condition.value).toLowerCase().replace(/%/g, '');
    return itemValue.includes(searchValue);
  }
  if (condition.type === 'sql') {
    if (condition.sqlExpr) {
      return condition.sqlExpr(item);
    }
    return true;
  }
  if (condition.type === 'and') {
    return condition.conditions.every(c => matchesCondition(item, c));
  }
  if (condition.type === 'or') {
    return condition.conditions.some(c => matchesCondition(item, c));
  }
  return true;
}

function eq<T>(field: T, value: unknown): Condition {
  return { type: 'eq', field: String(field), value };
}

function and(...conditions: Array<Condition | LogicalCondition>): LogicalCondition {
  return { type: 'and', conditions };
}

function or(...conditions: Array<Condition | LogicalCondition>): LogicalCondition {
  return { type: 'or', conditions };
}

function ilike<T>(field: T, value: string): Condition {
  return { type: 'ilike', field: String(field), value };
}

function desc<T>(field: T): OrderByConfig {
  return { field: String(field), direction: 'desc' };
}

function asc<T>(field: T): OrderByConfig {
  return { field: String(field), direction: 'asc' };
}

type SqlTemplateResult = Condition;

function sql(template: TemplateStringsArray, ...values: unknown[]): SqlTemplateResult {
  const fieldMatch = template[0]?.match(/"(\w+)"/);
  const field = fieldMatch ? fieldMatch[1] : '';
  
  if (template[0]?.includes('+ 1')) {
    return {
      type: 'sql',
      field: '',
      value: null,
      sqlExpr: (row: Record<string, unknown>) => {
        const currentVal = Number(row[field]) || 0;
        row[field] = currentVal + 1;
        return true;
      },
    };
  }
  
  if (template[0]?.includes('+') && values.length > 0) {
    const delta = Number(values[0]) || 0;
    return {
      type: 'sql',
      field: '',
      value: null,
      sqlExpr: (row: Record<string, unknown>) => {
        const currentVal = Number(row[field]) || 0;
        row[field] = currentVal + delta;
        return true;
      },
    };
  }
  
  return { type: 'sql', field: '', value: null };
}

type TableData = Record<string, unknown>[];

function getTableData(tableName: string): TableData {
  switch (tableName) {
    case 'Users': return usersData as unknown as TableData;
    case 'Products': return productsData as unknown as TableData;
    case 'Messages': return messagesData as unknown as TableData;
    case 'Orders': return ordersData as unknown as TableData;
    case 'Reports': return reportsData as unknown as TableData;
    case 'Favorites': return favoritesData as unknown as TableData;
    default: return [];
  }
}

function getTableFile(tableName: string): string {
  switch (tableName) {
    case 'Users': return USERS_FILE;
    case 'Products': return PRODUCTS_FILE;
    case 'Messages': return MESSAGES_FILE;
    case 'Orders': return ORDERS_FILE;
    case 'Reports': return REPORTS_FILE;
    case 'Favorites': return FAVORITES_FILE;
    default: throw new Error(`Unknown table: ${tableName}`);
  }
}

function createSelectBuilder(tableName: string) {
  let whereCondition: Condition | LogicalCondition | null = null;
  let orderByConfig: OrderByConfig | null = null;
  let limitCount: number | null = null;

  const builder = {
    from: (_table: unknown) => builder,
    where: (condition: Condition | LogicalCondition) => {
      whereCondition = condition;
      return builder;
    },
    orderBy: (order: OrderByConfig) => {
      orderByConfig = order;
      return builder;
    },
    limit: (count: number) => {
      limitCount = count;
      return builder;
    },
    then(resolve: (value: TableData) => void, reject?: (reason?: any) => void) {
      try {
        let data = [...getTableData(tableName)];
        
        if (whereCondition) {
          data = data.filter(item => matchesCondition(item, whereCondition!));
        }
        
        if (orderByConfig) {
          data.sort((a, b) => {
            const aVal = a[orderByConfig!.field];
            const bVal = b[orderByConfig!.field];
            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;
            if (orderByConfig!.direction === 'desc') {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          });
        }
        
        if (limitCount !== null) {
          data = data.slice(0, limitCount);
        }
        
        resolve(data);
      } catch (error) {
        if (reject) {
          reject(error);
        }
      }
    },
    catch(reject: (reason?: any) => void) {
      return builder;
    },
    finally(callback: () => void) {
      callback();
      return builder;
    }
  };

  return builder;
}

function createInsertBuilder(tableName: string) {
  let insertData: Record<string, unknown> | null = null;

  const builder = {
    values: (data: Record<string, unknown>) => {
      insertData = data;
      return builder;
    },
    returning() {
      return {
        then: (resolve: (value: TableData) => void, reject?: (reason?: any) => void) => {
          try {
            const now = new Date();
            const newItem = {
              ...insertData,
              id: randomUUID(),
              createdAt: now,
              updatedAt: now,
            };
            
            const tableData = getTableData(tableName);
            tableData.push(newItem);
            
            // 保存到文件
            saveData(getTableFile(tableName), tableData);
            
            resolve([newItem]);
          } catch (error) {
            if (reject) {
              reject(error);
            }
          }
        }
      };
    },
  };

  return builder;
}

function createUpdateBuilder(tableName: string) {
  let updateData: Record<string, unknown> | null = null;
  let whereCondition: Condition | LogicalCondition | null = null;

  const builder = {
    set: (data: Record<string, unknown>) => {
      updateData = data;
      return builder;
    },
    where: (condition: Condition | LogicalCondition) => {
      whereCondition = condition;
      return builder;
    },
    returning() {
      return {
        then: (resolve: (value: TableData) => void, reject?: (reason?: any) => void) => {
          try {
            if (!whereCondition) {
              resolve([]);
              return;
            }
            
            const tableData = getTableData(tableName);
            const results: Record<string, unknown>[] = [];
            
            for (let i = 0; i < tableData.length; i++) {
              if (matchesCondition(tableData[i], whereCondition!)) {
                if (updateData) {
                  for (const key of Object.keys(updateData)) {
                    const val = updateData[key];
                    if (val && typeof val === 'object' && 'type' in val && val.type === 'sql' && 'sqlExpr' in val) {
                      (val as Condition).sqlExpr!(tableData[i]);
                    } else {
                      tableData[i][key] = val;
                    }
                  }
                }
                tableData[i].updatedAt = new Date();
                results.push(tableData[i]);
              }
            }
            
            // 保存到文件
            saveData(getTableFile(tableName), tableData);
            
            resolve(results);
          } catch (error) {
            if (reject) {
              reject(error);
            }
          }
        }
      };
    },
  };

  return builder;
}

function createDeleteBuilder(tableName: string) {
  let whereCondition: Condition | LogicalCondition | null = null;

  const builder = {
    where: (condition: Condition | LogicalCondition) => {
      whereCondition = condition;
      return builder;
    },
    returning() {
      return {
        then: (resolve: (value: TableData) => void, reject?: (reason?: any) => void) => {
          try {
            if (!whereCondition) {
              resolve([]);
              return;
            }
            
            const tableData = getTableData(tableName);
            const index = tableData.findIndex(item => matchesCondition(item, whereCondition!));
            
            if (index === -1) {
              resolve([]);
              return;
            }
            
            const deleted = tableData.splice(index, 1);
            
            // 保存到文件
            saveData(getTableFile(tableName), tableData);
            
            resolve(deleted);
          } catch (error) {
            if (reject) {
              reject(error);
            }
          }
        }
      };
    },
  };

  return builder;
}

const db = {
  select: () => ({
    from: (table: { _: string }) => createSelectBuilder(table._),
  }),
  insert: (table: { _: string }) => createInsertBuilder(table._),
  update: (table: { _: string }) => createUpdateBuilder(table._),
  delete: (table: { _: string }) => createDeleteBuilder(table._),
};

const users = { _: 'Users' };
const products = { _: 'Products' };
const messages = { _: 'Messages' };
const orders = { _: 'Orders' };
const reports = { _: 'Reports' };
const favorites = { _: 'Favorites' };

export type { User, Product, Message, Order, Report, Favorite };
export type { InsertUser, InsertProduct, InsertMessage, InsertOrder, InsertReport, InsertFavorite };

type InsertUser = Partial<User> & { name: string; email: string; password: string };
type InsertProduct = Partial<Product> & { sellerId: string; title: string; price: string; category: string; condition: string; location: string };
type InsertMessage = Partial<Message> & { senderId: string; receiverId: string; content: string };
type InsertOrder = Partial<Order> & { buyerId: string; sellerId: string; productId: string };
type InsertReport = Partial<Report> & { reporterId: string; targetType: string; targetId: string; reason: string };
type InsertFavorite = Partial<Favorite> & { userId: string; productId: string };

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
