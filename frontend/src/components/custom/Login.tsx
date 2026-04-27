import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, ShoppingBag, Lock, Mail } from 'lucide-react';

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated === true) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('请填写邮筱和密码');
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.login(email, password);
      if (data.success && data.data?.token) {
        login(data.data.token);
        toast.success('登录成功', { description: `欢迎回来，${data.data.user.name}！` });
        navigate('/', { replace: true });
      } else {
        setError(data.message || '登录失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A5F] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white" style={{ fontFamily: 'Sora, sans-serif' }}>校园二手</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            校园闲置，<br /><span className="text-[#F59E0B]">流转有价值</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed">学号实名认证 · 信用评价保障 · 校内安全面交<br />让每一件闲置都找到新主人</p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { label: '认证用户', value: '2,847' },
            { label: '成功交易', value: '1,203' },
            { label: '好评率', value: '92%' },
            { label: '平均成交', value: '5.2天' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{stat.value}</p>
              <p className="text-white/60 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#1E3A5F]" style={{ fontFamily: 'Sora, sans-serif' }}>校园二手</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>欢迎回来</h1>
            <p className="text-[#6B7280]">登录您的校园二手账号</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">邮筱地址</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="请输入您的邮筱"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1E3A5F] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E3A5F] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            还没有账号？{' '}
            <Link to="/signup" className="text-[#1E3A5F] font-semibold hover:underline">
              立即注册
            </Link>
          </p>

          <p className="text-center text-sm text-[#6B7280] mt-4">
            管理员登录？{' '}
            <Link to="/admin/login" className="text-[#1E3A5F] font-semibold hover:underline">
              进入管理后台
            </Link>
          </p>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 text-center">
              🔒 仅限本校认证师生使用 · 安全可信赖
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;