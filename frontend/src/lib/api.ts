import { API_BASE_URL } from '../config/constants';
import type { ApiResponse, Product, User, Message, Order, Report, AdminStats } from '../types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const apiService = {
  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json() as Promise<ApiResponse<{ token: string; user: User }>>;
  },

  async signup(name: string, email: string, password: string, confirmPassword: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    return res.json() as Promise<ApiResponse<{ token: string; user: User }>>;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<User>>;
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ApiResponse<User>>;
  },

  async verifyStudent(studentId: string): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-student`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId }),
    });
    return res.json() as Promise<ApiResponse<User>>;
  },

  // Products
  async getProducts(params?: { category?: string; condition?: string; search?: string; graduation?: boolean }): Promise<ApiResponse<Product[]>> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.condition && params.condition !== 'all') query.set('condition', params.condition);
    if (params?.search) query.set('search', params.search);
    if (params?.graduation) query.set('graduation', 'true');
    const res = await fetch(`${API_BASE_URL}/api/products?${query}`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<Product[]>>;
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<Product>>;
  },

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ApiResponse<Product>>;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ApiResponse<Product>>;
  },

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json() as Promise<ApiResponse<null>>;
  },

  // Messages
  async getConversation(userId: string, productId?: string): Promise<ApiResponse<Message[]>> {
    const query = productId ? `?productId=${productId}` : '';
    const res = await fetch(`${API_BASE_URL}/api/messages/conversation/${userId}${query}`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<Message[]>>;
  },

  async getMessageList(): Promise<ApiResponse<Message[]>> {
    const res = await fetch(`${API_BASE_URL}/api/messages/list`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<Message[]>>;
  },

  async sendMessage(receiverId: string, content: string, productId?: string): Promise<ApiResponse<Message & { hasRisk?: boolean }>> {
    const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, content, productId }),
    });
    return res.json() as Promise<ApiResponse<Message & { hasRisk?: boolean }>>;
  },

  // Orders
  async getMyOrders(): Promise<ApiResponse<{ bought: Order[]; sold: Order[] }>> {
    const res = await fetch(`${API_BASE_URL}/api/orders/my`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<{ bought: Order[]; sold: Order[] }>>;
  },

  async createOrder(productId: string): Promise<ApiResponse<Order>> {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    return res.json() as Promise<ApiResponse<Order>>;
  },

  async completeOrder(orderId: string, rating: number, comment: string): Promise<ApiResponse<Order>> {
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    return res.json() as Promise<ApiResponse<Order>>;
  },

  // Reports
  async createReport(targetType: string, targetId: string, reason: string, description?: string): Promise<ApiResponse<Report>> {
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetType, targetId, reason, description }),
    });
    return res.json() as Promise<ApiResponse<Report>>;
  },

  async getReports(): Promise<ApiResponse<Report[]>> {
    const res = await fetch(`${API_BASE_URL}/api/reports`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<Report[]>>;
  },

  async resolveReport(id: string, adminNote: string): Promise<ApiResponse<Report>> {
    const res = await fetch(`${API_BASE_URL}/api/reports/${id}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminNote }),
    });
    return res.json() as Promise<ApiResponse<Report>>;
  },

  async dismissReport(id: string, adminNote: string): Promise<ApiResponse<Report>> {
    const res = await fetch(`${API_BASE_URL}/api/reports/${id}/dismiss`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminNote }),
    });
    return res.json() as Promise<ApiResponse<Report>>;
  },

  // Admin
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<AdminStats>>;
  },

  async getAdminUsers(): Promise<ApiResponse<User[]>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<User[]>>;
  },

  async getAdminProducts(): Promise<ApiResponse<Product[]>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/products`, { headers: getAuthHeaders() });
    return res.json() as Promise<ApiResponse<Product[]>>;
  },

  async approveProduct(id: string): Promise<ApiResponse<Product>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json() as Promise<ApiResponse<Product>>;
  },

  async rejectProduct(id: string): Promise<ApiResponse<Product>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json() as Promise<ApiResponse<Product>>;
  },

  async banUser(id: string): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/ban`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json() as Promise<ApiResponse<User>>;
  },

  async unbanUser(id: string): Promise<ApiResponse<User>> {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/unban`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json() as Promise<ApiResponse<User>>;
  },
};
