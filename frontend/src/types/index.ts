export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  creditScore: number;
  isVerified: boolean;
  avatar?: string;
  department?: string;
  grade?: string;
  completedDeals?: number;
  positiveRate?: string;
  studentId?: string;
  phone?: string;
  isBanned?: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  status: string;
  isUrgent: boolean;
  isFeatured: boolean;
  isGraduationSeason: boolean;
  favoriteCount: number;
  viewCount: number;
  isbn?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  sellerName?: string;
  sellerAvatar?: string;
  sellerCreditScore?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  status: string;
  buyerRating?: number;
  buyerComment?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  status: string;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalOrders: number;
  completedOrders: number;
  pendingReports: number;
  totalReports: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  hasRisk?: boolean;
}

export type ProductCategory = 'books' | 'electronics' | 'daily' | 'sports' | 'clothing' | 'all';
export type ProductCondition = 'new' | '99' | '80' | 'flaw' | 'all';
export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'expired';

export const CATEGORY_LABELS: Record<string, string> = {
  all: '全部',
  books: '📚 教材书籍',
  electronics: '💻 电子产品',
  daily: '🏠 生活用品',
  sports: '⚽ 体育用品',
  clothing: '👗 服饰配件',
};

export const CONDITION_LABELS: Record<string, string> = {
  new: '全新',
  '99': '99新',
  '80': '8成新',
  flaw: '有瑕疵',
};

export const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-[#1E3A5F] text-white',
  '99': 'bg-[#10B981] text-white',
  '80': 'bg-[#F59E0B] text-white',
  flaw: 'bg-gray-400 text-white',
};
