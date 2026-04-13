import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../lib/api';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import OmniflowBadge from '../components/custom/OmniflowBadge';
import type { Product, User, Message, Order, AdminStats } from '../types';
import { CATEGORY_LABELS, CONDITION_LABELS, CONDITION_COLORS } from '../types';
import {
  ShoppingBag, Search, Bell, Plus, Heart, MessageCircle, User,
  LayoutDashboard, LogOut, Menu, X, ChevronRight, MapPin, Clock,
  Shield, AlertTriangle, CheckCircle, Package, Send, Flag, BarChart2,
  Users, FileText, Camera, QrCode,
  TrendingUp, BookOpen, Laptop, Home, Dumbbell, Shirt, GraduationCap,
  ArrowLeft, RefreshCw
} from 'lucide-react';

type View = 'home' | 'browse' | 'publish' | 'messages' | 'profile' | 'admin' | 'product-detail' | 'chat';

const MOCK_PRODUCTS: Product[] = [
  { id: 'mock-1', sellerId: 'seller-1', title: '高等数学（第七版）同济大学', description: '九新，只有少量笔记，不影响阅读', price: '25', originalPrice: '49', category: 'books', condition: '99', location: '3号宿舍楼', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=280&fit=crop'], status: 'approved', isUrgent: false, isFeatured: false, isGraduationSeason: false, favoriteCount: 12, viewCount: 89, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '王同学', sellerCreditScore: 128 },
  { id: 'mock-2', sellerId: 'seller-2', title: 'MacBook Air M1 2020 8G/256G', description: '成色深空灰，使用一年，无磁贴无磁异，附原装充电器', price: '4200', originalPrice: '7499', category: 'electronics', condition: '80', location: '图书馆', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=280&fit=crop'], status: 'approved', isUrgent: false, isFeatured: true, isGraduationSeason: false, favoriteCount: 47, viewCount: 312, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '陈同学', sellerCreditScore: 156 },
  { id: 'mock-3', sellerId: 'seller-3', title: '永久牌折叠自行车 20寸 蓝色', description: '全新未骑，因毕业不需要出售', price: '380', originalPrice: '599', category: 'daily', condition: 'new', location: '二食堂门口', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop'], status: 'approved', isUrgent: false, isFeatured: false, isGraduationSeason: true, favoriteCount: 128, viewCount: 445, createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '张同学', sellerCreditScore: 98 },
  { id: 'mock-4', sellerId: 'seller-4', title: '小米护眼台灯 Pro 宿舍学习灯', description: '九新，使用不到一个月，功能完好', price: '89', originalPrice: '149', category: 'daily', condition: '99', location: '5号宿舍楼', images: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=280&fit=crop'], status: 'approved', isUrgent: false, isFeatured: false, isGraduationSeason: false, favoriteCount: 23, viewCount: 167, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '刘同学', sellerCreditScore: 112 },
  { id: 'mock-5', sellerId: 'seller-5', title: 'Nike Air Max 270 运动鞋 42码', description: '8成新，外观完好，尺码合适', price: '320', originalPrice: '899', category: 'clothing', condition: '80', location: '体育馆', images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=280&fit=crop'], status: 'approved', isUrgent: false, isFeatured: false, isGraduationSeason: false, favoriteCount: 8, viewCount: 94, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '赵同学', sellerCreditScore: 87 },
  { id: 'mock-6', sellerId: 'seller-6', title: '斯伯丁NBA官方比赛用球 7号', description: '全新，购买后未拆封', price: '180', originalPrice: '299', category: 'sports', condition: 'new', location: '篮球场', images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=280&fit=crop'], status: 'approved', isUrgent: false, isFeatured: false, isGraduationSeason: false, favoriteCount: 15, viewCount: 78, createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '孙同学', sellerCreditScore: 145 },
  { id: 'mock-7', sellerId: 'seller-7', title: 'Sony WH-1000XM5 降噪耳机', description: '99新，降噪效果极佳，附原装收纳盒', price: '1580', originalPrice: '2799', category: 'electronics', condition: '99', location: '1号宿舍楼', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=280&fit=crop'], status: 'approved', isUrgent: true, isFeatured: false, isGraduationSeason: false, favoriteCount: 34, viewCount: 203, createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '周同学', sellerCreditScore: 134 },
  { id: 'mock-8', sellerId: 'seller-8', title: '新概念英语全套4册 有笔记', description: '有少量笔记，内容完整，适合自学', price: '35', originalPrice: '120', category: 'books', condition: 'flaw', location: '外语楼', images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=280&fit=crop'], status: 'approved', isUrgent: false, isFeatured: false, isGraduationSeason: false, favoriteCount: 6, viewCount: 52, createdAt: new Date(Date.now() - 72 * 3600000).toISOString(), updatedAt: new Date().toISOString(), sellerName: '吴同学', sellerCreditScore: 76 },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'seller-2', receiverId: 'me', productId: 'mock-2', content: 'MacBook还在吗？', messageType: 'text', isRead: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'm2', senderId: 'me', receiverId: 'seller-2', productId: 'mock-2', content: '在的！可以约明天图书馆看货', messageType: 'text', isRead: true, createdAt: new Date(Date.now() - 540000).toISOString() },
  { id: 'm3', senderId: 'seller-2', receiverId: 'me', productId: 'mock-2', content: '好的，能便宜一点吗？', messageType: 'text', isRead: false, createdAt: new Date(Date.now() - 480000).toISOString() },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

function getCreditLabel(score: number): { label: string; color: string } {
  if (score >= 150) return { label: '靠谱学长', color: 'bg-[#10B981] text-white' };
  if (score >= 120) return { label: '爽快买家', color: 'bg-blue-500 text-white' };
  if (score >= 100) return { label: '诚信用户', color: 'bg-[#1E3A5F] text-white' };
  return { label: '新用户', color: 'bg-gray-400 text-white' };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <LayoutDashboard className="w-4 h-4" />,
  books: <BookOpen className="w-4 h-4" />,
  electronics: <Laptop className="w-4 h-4" />,
  daily: <Home className="w-4 h-4" />,
  sports: <Dumbbell className="w-4 h-4" />,
  clothing: <Shirt className="w-4 h-4" />,
};

// Memoized child components to prevent re-renders
const Navbar = memo(function Navbar({ 
  view, 
  setView, 
  user, 
  creditInfo, 
  loadProducts, 
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen 
}: { 
  view: View; 
  setView: (v: View) => void; 
  user: User; 
  creditInfo: { label: string; color: string }; 
  loadProducts: () => void;
  handleLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  return (
    <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('home')} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-white" /></div>
              <span className="font-bold text-xl text-[#1E3A5F] hidden sm:block" style={{ fontFamily: 'Sora, sans-serif' }}>校园二手</span>
            </button>
            <span className="hidden sm:inline-block text-xs font-medium text-[#6B7280] bg-[#F8F7F4] px-2 py-0.5 rounded-full border border-[#E5E7EB]">CampusTrade</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {(['home', 'browse', 'messages'] as const).map(v => (
              <button key={v} onClick={() => { setView(v); if (v === 'browse') loadProducts(); }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${view === v ? 'text-[#1E3A5F] bg-[#F8F7F4]' : 'text-[#1A1A2E] hover:text-[#1E3A5F] hover:bg-[#F8F7F4]'}`}>
                {v === 'home' ? '首页' : v === 'browse' ? '分类' : '私信'}
              </button>
            ))}
            <button onClick={() => { setView('browse'); setActiveCategory('all'); setConditionFilter('all'); setSearchQuery(''); loadProducts(); }} className="px-4 py-2 text-sm font-medium text-[#F59E0B] hover:bg-amber-50 rounded-lg transition-all duration-200">🎓 毕业季跳蚤市场</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F8F7F4] rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={() => setView('profile')} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center ring-2 ring-[#E5E7EB] group-hover:ring-[#1E3A5F] transition-all">
                <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#1A1A2E] leading-none">{user.name}</p>
                <p className="text-xs text-[#10B981] font-medium">{creditInfo.label}</p>
              </div>
            </button>
            <button onClick={() => setView('publish')} className="hidden sm:flex items-center gap-2 bg-[#1E3A5F] hover:bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
              <Plus className="w-4 h-4" />发布闲置
            </button>
            {user.role === 'admin' && (
              <button onClick={() => setView('admin')} className="hidden sm:flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                <LayoutDashboard className="w-3.5 h-3.5" />管理
              </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#6B7280] hover:text-[#1E3A5F] rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 py-3 space-y-1">
          {([{ v: 'home' as View, label: '首页' }, { v: 'browse' as View, label: '分类浏览' }, { v: 'publish' as View, label: '发布闲置' }, { v: 'messages' as View, label: '私信' }, { v: 'profile' as View, label: '我的' }]).map(item => (
            <button key={item.v} onClick={() => { setView(item.v); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-[#F8F7F4] rounded-xl transition-all">{item.label}</button>
          ))}
          <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2">
            <LogOut className="w-4 h-4" />退出登录
          </button>
        </div>
      )}
    </nav>
  );
});

const ProductCard = memo(function ProductCard({ product, favorites, onToggleFavorite, onClick }: { 
  product: Product; 
  favorites: Set<string>; 
  onToggleFavorite: (id: string) => void;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:border-[#1E3A5F]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="relative overflow-hidden">
        <img src={product.images[0] || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=280&fit=crop'} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" alt={product.title} />
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CONDITION_COLORS[product.condition] || 'bg-gray-400 text-white'}`}>{CONDITION_LABELS[product.condition] || product.condition}</span>
        </div>
        {product.isUrgent && <div className="absolute top-2 right-10"><span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">急售</span></div>}
        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm">
          <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-[#6B7280]'}`} />
        </button>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-semibold text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">查看详情</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[#1A1A2E] leading-snug mb-1 line-clamp-2">{product.title}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-[#1E3A5F]" style={{ fontFamily: 'Sora, sans-serif' }}>¥{product.price}</span>
          {product.originalPrice && <span className="text-xs text-[#6B7280] line-through">原价¥{product.originalPrice}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#1E3A5F] flex items-center justify-center"><span className="text-white text-xs">{(product.sellerName || '卖').charAt(0)}</span></div>
          <span className="text-xs text-[#6B7280]">{product.sellerName || '卖家'}</span>
          <span className="ml-auto text-xs text-[#10B981] font-medium">★ {product.sellerCreditScore || 100}</span>
        </div>
        <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{product.location} · {timeAgo(product.createdAt)}</p>
      </div>
    </div>
  );
});

const HomeView = memo(function HomeView({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  handleCategoryChange,
  filteredProducts,
  favorites,
  onToggleFavorite,
  onProductClick,
  loadingProducts
}: {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  handleSearch: () => void;
  handleCategoryChange: (cat: string) => void;
  filteredProducts: Product[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onProductClick: (p: Product) => void;
  loadingProducts: boolean;
}) {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-[#1E3A5F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16 sm:py-20 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              校园闲置，<span className="text-[#F59E0B]">流转有价值</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg mb-8">学号实名认证 · 信用评价保障 · 校内安全面交</p>
            <div className="bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-[#6B7280]" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="搜索商品、教材、电子产品..." 
                    className="flex-1 py-3 text-[#1A1A2E] placeholder:text-[#6B7280] bg-transparent focus:outline-none"
                  />
                </div>
                <button onClick={handleSearch} className="bg-[#1E3A5F] hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg">
                  搜索
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-white/60 text-sm">
              <span>热门搜索：</span>
              {['教材', '自行车', '台灯', '耳机'].map(term => (
                <button key={term} onClick={() => { setSearchQuery(term); handleSearch(); }} className="hover:text-white transition-colors">{term}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {[{ k: 'all', label: '全部', icon: <LayoutDashboard className="w-4 h-4" /> }, { k: 'books', label: '教材书籍', icon: <BookOpen className="w-4 h-4" /> }, { k: 'electronics', label: '电子产品', icon: <Laptop className="w-4 h-4" /> }, { k: 'daily', label: '生活用品', icon: <Home className="w-4 h-4" /> }, { k: 'sports', label: '体育用品', icon: <Dumbbell className="w-4 h-4" /> }, { k: 'clothing', label: '服饰配件', icon: <Shirt className="w-4 h-4" /> }].map(cat => (
            <button key={cat.k} onClick={() => handleCategoryChange(cat.k)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#1A1A2E] hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-all whitespace-nowrap">
              {cat.icon}{cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Sora, sans-serif' }}>精选商品</h2>
          <button className="text-sm text-[#1E3A5F] font-medium hover:underline">查看全部</button>
        </div>
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200"></div>
                <div className="p-3 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.slice(0, 8).map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                favorites={favorites} 
                onToggleFavorite={onToggleFavorite}
                onClick={() => onProductClick(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const PublishView = memo(function PublishView({ currentUser, onCancel, onSuccess }: { 
  currentUser: User | null; 
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'books' as string,
    condition: '99' as string,
    location: '',
    images: [] as string[],
    isUrgent: false,
    isFeatured: false,
    isGraduationSeason: false,
    isbn: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.price || !formData.category || !formData.condition || !formData.location) {
      setError('请填写所有必填项');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.createProduct({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        images: formData.images,
        isUrgent: formData.isUrgent,
        isFeatured: formData.isFeatured,
        isGraduationSeason: formData.isGraduationSeason,
        isbn: formData.isbn || undefined,
      });

      if (data.success) {
        toast.success('发布成功', { description: '您的闲置商品已提交审核' });
        onSuccess();
      } else {
        setError(data.message || '发布失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (imageInput && !formData.images.includes(imageInput)) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageInput] }));
      setImageInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setFormData(prev => ({ ...prev, images: [...prev.images, result] }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setFormData(prev => ({ ...prev, images: [...prev.images, result] }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="bg-[#1E3A5F] px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>发布闲置</h1>
          <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">商品标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="请输入商品标题"
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">商品描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请详细描述商品的使用情况、成色、购买时间等信息"
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">价格 *</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">原价</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={e => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">分类 *</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
              >
                <option value="books">教材书籍</option>
                <option value="electronics">电子产品</option>
                <option value="daily">生活用品</option>
                <option value="sports">体育用品</option>
                <option value="clothing">服饰配件</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">成色 *</label>
              <select
                value={formData.condition}
                onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
              >
                <option value="new">全新</option>
                <option value="99">99新</option>
                <option value="90">9成新</option>
                <option value="80">8成新</option>
                <option value="flaw">有瑕疵</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">交易地点 *</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="如：3号宿舍楼、图书馆、二食堂等"
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">商品图片</label>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageInput}
                  onChange={e => setImageInput(e.target.value)}
                  placeholder="输入图片URL"
                  className="flex-1 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-[#1E3A5F] hover:bg-blue-900 text-white text-sm font-medium rounded-xl transition-all"
                >
                  添加
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-[#E5E7EB]"></div>
                <span className="text-xs text-[#6B7280]">或</span>
                <div className="flex-1 h-px bg-[#E5E7EB]"></div>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' 
                    : 'border-[#E5E7EB] hover:border-[#1E3A5F]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Camera className="w-12 h-12 text-[#6B7280]" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-[#1E3A5F] hover:bg-blue-900 text-white text-sm font-medium rounded-xl transition-all"
                    >
                      选择文件
                    </button>
                    <span className="text-sm text-[#6B7280] ml-2">或拖拽图片到此处</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">支持 JPG、PNG、GIF 等格式，单个文件不超过 5MB</p>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img 
                        src={img} 
                        alt={`商品图片${i + 1}`} 
                        className="w-full h-32 object-cover rounded-lg border border-[#E5E7EB] group-hover:border-[#1E3A5F] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        图片 {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formData.category === 'books' && (
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">ISBN号（教材类必填）</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={e => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                placeholder="请输入ISBN号"
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={e => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                className="w-4 h-4 text-[#1E3A5F] rounded focus:ring-[#1E3A5F]"
              />
              <span className="text-sm text-[#1A1A2E]">急售</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-4 h-4 text-[#1E3A5F] rounded focus:ring-[#1E3A5F]"
              />
              <span className="text-sm text-[#1A1A2E]">推荐</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isGraduationSeason}
                onChange={e => setFormData(prev => ({ ...prev, isGraduationSeason: e.target.checked }))}
                className="w-4 h-4 text-[#1E3A5F] rounded focus:ring-[#1E3A5F]"
              />
              <span className="text-sm text-[#1A1A2E]">毕业季商品</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#1A1A2E] font-semibold rounded-xl transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#1E3A5F] hover:bg-blue-900 text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '发布中...' : '立即发布'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const BrowseView = memo(function BrowseView({ 
  products, 
  favorites, 
  onToggleFavorite, 
  onProductClick,
  loading,
  activeCategory,
  setActiveCategory,
  conditionFilter,
  setConditionFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  onSearch
}: {
  products: Product[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onProductClick: (p: Product) => void;
  loading: boolean;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  conditionFilter: string;
  setConditionFilter: (filter: string) => void;
  sortBy: 'newest' | 'price';
  setSortBy: (sort: 'newest' | 'price') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}) {
  return (
    <div>
      <div className="bg-[#1E3A5F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
            分类浏览
          </h1>
          
          <div className="bg-white rounded-2xl p-2 shadow-2xl mb-6">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-[#6B7280]" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  placeholder="搜索商品、教材、电子产品..." 
                  className="flex-1 py-3 text-[#1A1A2E] placeholder:text-[#6B7280] bg-transparent focus:outline-none"
                />
              </div>
              <button onClick={onSearch} className="bg-[#1E3A5F] hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg">
                搜索
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              {[
                { k: 'all', label: '全部', icon: <LayoutDashboard className="w-4 h-4" /> },
                { k: 'books', label: '教材书籍', icon: <BookOpen className="w-4 h-4" /> },
                { k: 'electronics', label: '电子产品', icon: <Laptop className="w-4 h-4" /> },
                { k: 'daily', label: '生活用品', icon: <Home className="w-4 h-4" /> },
                { k: 'sports', label: '体育用品', icon: <Dumbbell className="w-4 h-4" /> },
                { k: 'clothing', label: '服饰配件', icon: <Shirt className="w-4 h-4" /> }
              ].map(cat => (
                <button 
                  key={cat.k} 
                  onClick={() => setActiveCategory(cat.k)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.k 
                      ? 'bg-[#1E3A5F] text-white shadow-md' 
                      : 'bg-white border border-[#E5E7EB] text-[#1A1A2E] hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
                  }`}
                >
                  {cat.icon}{cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">成色</label>
            <div className="flex flex-wrap gap-2">
              {[
                { k: 'all', label: '全部' },
                { k: 'new', label: '全新' },
                { k: '99', label: '99新' },
                { k: '90', label: '9成新' },
                { k: '80', label: '8成新' },
                { k: 'flaw', label: '有瑕疵' }
              ].map(cond => (
                <button 
                  key={cond.k} 
                  onClick={() => setConditionFilter(cond.k)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    conditionFilter === cond.k 
                      ? 'bg-[#1E3A5F] text-white shadow-md' 
                      : 'bg-white border border-[#E5E7EB] text-[#1A1A2E] hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:w-auto">
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">排序</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'newest' 
                    ? 'bg-[#1E3A5F] text-white shadow-md' 
                    : 'bg-white border border-[#E5E7EB] text-[#1A1A2E] hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
                }`}
              >
                最新
              </button>
              <button 
                onClick={() => setSortBy('price')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  sortBy === 'price' 
                    ? 'bg-[#1E3A5F] text-white shadow-md' 
                    : 'bg-white border border-[#E5E7EB] text-[#1A1A2E] hover:border-[#1E3A5F] hover:text-[#1E3A5F]'
                }`}
              >
                价格
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: 'Sora, sans-serif' }}>
            {products.length} 个商品
          </h2>
          <button 
            onClick={() => { setActiveCategory('all'); setConditionFilter('all'); setSearchQuery(''); }}
            className="text-sm text-[#1E3A5F] font-medium hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            重置筛选
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
            <Package className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
            <p className="text-[#1A1A2E] font-semibold mb-2">暂无商品</p>
            <p className="text-[#6B7280] text-sm">试试调整筛选条件或搜索其他关键词</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                favorites={favorites} 
                onToggleFavorite={onToggleFavorite}
                onClick={() => onProductClick(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const ProductDetailView = memo(function ProductDetailView({ 
  product, 
  onBack, 
  onContact,
  favorites,
  onToggleFavorite
}: {
  product: Product;
  onBack: () => void;
  onContact: (product: Product) => void;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1E3A5F]">
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <img 
            src={product.images[0] || 'https://via.placeholder.com/600x400'} 
            alt={product.title} 
            className="w-full h-96 object-cover"
          />
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 p-4">
              {product.images.map((img, i) => (
                <div key={i} className="h-16 w-16 rounded-lg overflow-hidden border border-[#E5E7EB]">
                  <img src={img} alt={`图片${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              {product.title}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#1E3A5F]">¥{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-[#6B7280] line-through">¥{product.originalPrice}</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-1">分类</p>
              <p className="font-medium text-[#1A1A2E]">{product.category}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-1">成色</p>
              <p className="font-medium text-[#1A1A2E]">{product.condition}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-1">地点</p>
              <p className="font-medium text-[#1A1A2E]">{product.location}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-1">发布时间</p>
              <p className="font-medium text-[#1A1A2E]">
                {new Date(product.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
            <h3 className="font-semibold text-[#1A1A2E] mb-2">商品描述</h3>
            <p className="text-[#1A1A2E] whitespace-pre-line">{product.description}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
            <h3 className="font-semibold text-[#1A1A2E] mb-2">卖家信息</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A2E]">卖家昵称</p>
                  <p className="text-sm text-[#6B7280]">已成交 0 单</p>
                </div>
              </div>
              <button 
                onClick={() => onContact(product)}
                className="bg-[#1E3A5F] hover:bg-blue-900 text-white px-6 py-2 rounded-xl transition-all"
              >
                联系卖家
              </button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => onToggleFavorite(product.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                favorites.has(product.id) 
                  ? 'bg-red-50 border-red-400 text-red-500' 
                  : 'bg-white border-[#E5E7EB] text-[#1A1A2E] hover:border-[#1E3A5F]'
              }`}
            >
              <Heart className={`w-5 h-5 ${
                favorites.has(product.id) ? 'fill-red-500' : ''
              }`} />
              收藏
            </button>
            <button 
              onClick={() => onContact(product)}
              className="flex-1 bg-[#1E3A5F] hover:bg-blue-900 text-white flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              立即购买
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const MessagesView = memo(function MessagesView({ 
  onChat, 
  chatPartner 
}: {
  onChat: (id: string, name: string) => void;
  chatPartner: { id: string; name: string } | null;
}) {
  const MOCK_CHAT_LIST = [
    { id: '1', name: '张三', lastMessage: '你好，这个还在吗？', time: '10:30', unread: 2 },
    { id: '2', name: '李四', lastMessage: '好的，明天见面交易', time: '昨天', unread: 0 },
    { id: '3', name: '王五', lastMessage: '谢谢，已经收到了', time: '3天前', unread: 0 },
  ];
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>
        私信
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#1A1A2E]">消息列表</h2>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {MOCK_CHAT_LIST.map(chat => (
              <button 
                key={chat.id} 
                onClick={() => onChat(chat.id, chat.name)}
                className={`w-full text-left p-4 hover:bg-[#F8F7F4] transition-all ${
                  chatPartner?.id === chat.id ? 'bg-[#F8F7F4]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-[#1A1A2E] truncate">{chat.name}</p>
                        <span className="text-xs text-[#6B7280]">{chat.time}</span>
                      </div>
                      <p className="text-sm text-[#6B7280] truncate mt-1">{chat.lastMessage}</p>
                    </div>
                  </div>
                  {chat.unread > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {chatPartner ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] h-[600px] flex flex-col">
              <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-semibold text-[#1A1A2E]">{chatPartner.name}</h2>
                </div>
                <button className="text-sm text-[#1E3A5F] font-medium hover:underline">查看资料</button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-[#F8F7F4] rounded-2xl p-3 max-w-[70%]">
                      <p className="text-[#1A1A2E]">你好，这个还在吗？</p>
                      <p className="text-xs text-[#6B7280] mt-1">10:30</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#1E3A5F] text-white rounded-2xl p-3 max-w-[70%]">
                      <p>在的，你什么时候方便看货？</p>
                      <p className="text-xs mt-1 opacity-75">10:31</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="输入消息..." 
                    className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  />
                  <button className="bg-[#1E3A5F] hover:bg-blue-900 text-white p-3 rounded-xl transition-all">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] h-[600px] flex flex-col items-center justify-center">
              <MessageCircle className="w-16 h-16 text-[#6B7280] mb-4" />
              <p className="text-[#1A1A2E] font-semibold mb-2">选择一个聊天</p>
              <p className="text-sm text-[#6B7280]">从左侧列表选择一个联系人开始聊天</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const ProfileView = memo(function ProfileView({ 
  user, 
  onLogout 
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-[#1E3A5F] rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="flex items-center gap-4 relative">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-[#1E3A5F]">
            <User className="w-10 h-10 text-[#1E3A5F]" />
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              {user.name}
            </h1>
            <p className="text-sm opacity-80">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                信用分: {user.creditScore}
              </span>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                成交: {user.completedDeals} 单
              </span>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                好评率: {user.positiveRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              我的商品
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 text-center">
                <Plus className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">发布闲置</p>
              </div>
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-3">
                  <p className="text-sm font-medium text-[#1A1A2E] truncate">商品标题</p>
                  <p className="text-sm text-[#1E3A5F] font-semibold">¥100</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              我的收藏
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-3">
                  <p className="text-sm font-medium text-[#1A1A2E] truncate">收藏的商品</p>
                  <p className="text-sm text-[#1E3A5F] font-semibold">¥150</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              账户设置
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-[#F8F7F4] rounded-lg transition-all flex items-center justify-between">
                <span className="text-[#1A1A2E]">个人资料</span>
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              </button>
              <button className="w-full text-left p-3 hover:bg-[#F8F7F4] rounded-lg transition-all flex items-center justify-between">
                <span className="text-[#1A1A2E]">账户安全</span>
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              </button>
              <button className="w-full text-left p-3 hover:bg-[#F8F7F4] rounded-lg transition-all flex items-center justify-between">
                <span className="text-[#1A1A2E]">收货地址</span>
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              </button>
              <button className="w-full text-left p-3 hover:bg-[#F8F7F4] rounded-lg transition-all flex items-center justify-between">
                <span className="text-[#1A1A2E]">帮助中心</span>
                <ChevronRight className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <button 
              onClick={onLogout}
              className="w-full bg-[#EF4444] hover:bg-red-600 text-white font-medium py-3 rounded-xl transition-all"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Index() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chatPartner, setChatPartner] = useState<{ id: string; name: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [showRiskWarning, setShowRiskWarning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price'>('newest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadingProducts, setLoadingProducts] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadCurrentUser(); }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadCurrentUser = async () => {
    try {
      const res = await apiService.getMe();
      if (res.success && res.data) {
        setCurrentUser(res.data);
      }
    } catch { /* use mock */ }
  };

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await apiService.getProducts({ 
        category: activeCategory !== 'all' ? activeCategory : undefined, 
        condition: conditionFilter !== 'all' ? conditionFilter : undefined, 
        search: searchQuery || undefined 
      });
      if (res.success && res.data && res.data.length > 0) setProducts(res.data);
      else setProducts(MOCK_PRODUCTS);
    } catch { setProducts(MOCK_PRODUCTS); }
    finally { setLoadingProducts(false); }
  }, [activeCategory, conditionFilter, searchQuery]);

  const handleSearch = useCallback(() => { setView('browse'); loadProducts(); }, [loadProducts]);
  
  const handleCategoryChange = useCallback((cat: string) => { 
    setActiveCategory(cat); 
    setView('browse'); 
    loadProducts();
  }, [loadProducts]);

  const handleProductClick = useCallback((product: Product) => { 
    setSelectedProduct(product); 
    setView('product-detail'); 
  }, []);

  const handleToggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => { 
      const next = new Set(prev); 
      if (next.has(productId)) next.delete(productId); 
      else next.add(productId); 
      return next; 
    });
  }, []);

  const handleLogout = useCallback(() => { 
    logout(); 
    navigate('/login', { replace: true }); 
  }, [logout, navigate]);

  const filteredProducts = products
    .filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortBy === 'price' ? parseFloat(a.price) - parseFloat(b.price) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const user = currentUser || { id: 'me', name: '同学', email: '', role: 'user', creditScore: 100, isVerified: false, completedDeals: 0, positiveRate: '100' };
  const creditInfo = getCreditLabel(user.creditScore);

  return (
    <div className="min-h-screen bg-[#F8F7F4]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar 
        view={view} 
        setView={setView} 
        user={user} 
        creditInfo={creditInfo}
        loadProducts={loadProducts}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main>
        {view === 'home' && (
          <HomeView 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            handleCategoryChange={handleCategoryChange}
            filteredProducts={filteredProducts}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onProductClick={handleProductClick}
            loadingProducts={loadingProducts}
          />
        )}
        {view === 'browse' && (
          <BrowseView 
            products={filteredProducts}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onProductClick={handleProductClick}
            loading={loadingProducts}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            conditionFilter={conditionFilter}
            setConditionFilter={setConditionFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
          />
        )}
        {view === 'product-detail' && selectedProduct && (
          <ProductDetailView 
            product={selectedProduct}
            onBack={() => setView('home')}
            onContact={(product) => {
              setChatPartner({ id: 'seller-1', name: '卖家' });
              setView('messages');
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {view === 'messages' && (
          <MessagesView 
            onChat={(id, name) => setChatPartner({ id, name })}
            chatPartner={chatPartner}
          />
        )}
        {view === 'profile' && (
          <ProfileView 
            user={user}
            onLogout={handleLogout}
          />
        )}
        {view === 'publish' && (
          <PublishView 
            currentUser={currentUser}
            onCancel={() => setView('home')}
            onSuccess={() => {
              loadProducts();
              setView('home');
            }}
          />
        )}
      </main>
      <OmniflowBadge />
      <Toaster />
    </div>
  );
}
