import { useState, useEffect, memo } from 'react';
import { apiService } from '../../lib/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, RefreshCw, Shield, Package, Clock, AlertTriangle, ArrowLeft, MapPin } from 'lucide-react';
import type { Product } from '../../types';

interface AdminViewProps {
  onBack: () => void;
}

const AdminView = memo(function AdminView({ onBack }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'stats'>('pending');
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    } else {
      loadProducts();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/products/admin/${activeTab}`);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      toast.error('加载商品失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/products/admin/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('加载统计数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const response = await apiService.post(`/products/admin/${productId}/approve`);
      if (response.success) {
        toast.success('商品已通过审核');
        loadProducts();
      }
    } catch (error) {
      toast.error('审核失败');
      console.error(error);
    }
  };

  const handleReject = async (productId: string, reason: string) => {
    try {
      const response = await apiService.post(`/products/admin/${productId}/reject`, { reason });
      if (response.success) {
        toast.success('商品已拒绝');
        setRejectionReason('');
        loadProducts();
      }
    } catch (error) {
      toast.error('拒绝失败');
      console.error(error);
    }
  };

  const handleBatchApprove = async () => {
    try {
      const response = await apiService.post('/products/admin/batch-approve', {
        productIds: Array.from(selectedProducts)
      });
      if (response.success) {
        toast.success(`已批量通过 ${response.data.length} 个商品`);
        setSelectedProducts(new Set());
        loadProducts();
      }
    } catch (error) {
      toast.error('批量审核失败');
      console.error(error);
    }
  };

  const handleBatchReject = async () => {
    if (!rejectionReason) {
      toast.error('请输入拒绝原因');
      return;
    }

    try {
      const response = await apiService.post('/products/admin/batch-reject', {
        productIds: Array.from(selectedProducts),
        reason: rejectionReason
      });
      if (response.success) {
        toast.success(`已批量拒绝 ${response.data.length} 个商品`);
        setSelectedProducts(new Set());
        setRejectionReason('');
        loadProducts();
      }
    } catch (error) {
      toast.error('批量拒绝失败');
      console.error(error);
    }
  };

  const toggleSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#1E3A5F] hover:text-blue-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">返回首页</span>
          </button>
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Sora, sans-serif' }}>
            管理员审核
          </h1>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'stats') loadStats();
            else loadProducts();
          }}
          className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-blue-900 text-white px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-semibold">刷新</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex border-b border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'pending' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'text-[#6B7280] hover:bg-[#F8F7F4]'
            }`}
          >
            待审核
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'approved' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'text-[#6B7280] hover:bg-[#F8F7F4]'
            }`}
          >
            已通过
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'rejected' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'text-[#6B7280] hover:bg-[#F8F7F4]'
            }`}
          >
            已拒绝
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'stats' 
                ? 'bg-[#1E3A5F] text-white' 
                : 'text-[#6B7280] hover:bg-[#F8F7F4]'
            }`}
          >
            统计数据
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">审核统计</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-8 h-8" />
                  <span className="text-sm font-medium">总商品数</span>
                </div>
                <div className="text-4xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-8 h-8" />
                  <span className="text-sm font-medium">待审核</span>
                </div>
                <div className="text-4xl font-bold">{stats.pending}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-8 h-8" />
                  <span className="text-sm font-medium">已通过</span>
                </div>
                <div className="text-4xl font-bold">{stats.approved}</div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-8 h-8" />
                  <span className="text-sm font-medium">已拒绝</span>
                </div>
                <div className="text-4xl font-bold">{stats.rejected}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'stats' && (
          <div>
            {selectedProducts.size > 0 && (
              <div className="bg-[#F8F7F4] px-6 py-3 border-b border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.length}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm font-medium text-[#1A1A2E]">
                      已选择 {selectedProducts.size} 个商品
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBatchApprove}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">批量通过</span>
                    </button>
                    <button
                      onClick={handleBatchReject}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">批量拒绝</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[#6B7280]">加载中...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-[#9CA3AF] mb-4" />
                <div className="text-[#6B7280] text-lg">暂无商品</div>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-6 hover:bg-[#F8F7F4] transition-all ${
                      selectedProducts.has(product.id) ? 'bg-[#F8F7F4]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-5 h-5 mt-1 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#1A1A2E] text-lg mb-1">
                              {product.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                              <span className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                {product.sellerName || '未知卖家'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {product.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {timeAgo(product.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#1E3A5F]">
                              ¥{product.price}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-[#6B7280] text-sm mb-2 line-clamp-2">
                              {product.description || '暂无描述'}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-[#1E3A5F] text-white text-xs rounded-lg">
                                {product.category}
                              </span>
                              <span className="px-3 py-1 bg-[#10B981] text-white text-xs rounded-lg">
                                {product.condition}
                              </span>
                              {product.isUrgent && (
                                <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg">
                                  急售
                                </span>
                              )}
                              {product.isFeatured && (
                                <span className="px-3 py-1 bg-amber-500 text-white text-xs rounded-lg">
                                  推荐
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {activeTab === 'rejected' && product.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-semibold">拒绝原因：</span>
                            </div>
                            <p className="text-red-600 text-sm mt-1">{product.rejectionReason}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E5E7EB]">
                          {activeTab === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(product.id)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-semibold">通过审核</span>
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('请输入拒绝原因：');
                                  if (reason) handleReject(product.id, reason);
                                }}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all"
                              >
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm font-semibold">拒绝</span>
                              </button>
                            </>
                          )}
                          {activeTab === 'approved' && (
                            <div className="text-[#10B981] text-sm font-medium">
                              商品已通过审核，可以正常展示
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default AdminView;
