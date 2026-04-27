import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Shield, Lock, Mail, ChevronLeft } from 'lucide-react';

function AdminLogin() {
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
      setError('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.login(email, password);
      if (data.success && data.data?.token) {
        if (data.data.user.role === 'admin') {
          login(data.data.token);
          toast.success('管理员登录成功', { description: `欢迎回来，${data.data.user.name}！` });
          navigate('/', { replace: true });
        } else {
          setError('您不是管理员，无法登录管理后台');
        }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex">
      {/* Left panel - admin branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white" style={{ fontFamily: 'Sora, sans-serif' }}>管理后台</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            管理员登录<br /><span className="text-blue-400">权限管理</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            安全的管理员登录通道<br />
            严格的权限控制机制<br />
            完整的操作记录追踪
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { label: '权限验证', value: '严格' },
            { label: '安全审计', value: '完整' },
            { label: '操作记录', value: '追踪' },
            { label: '风险控制', value: '多重' },
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
            <Link to="/" className="flex items-center gap-2 text-white">
              <ChevronLeft className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>管理员登录</h1>
            <p className="text-gray-400">登录管理后台进行审核和管理</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="请输入管理员邮箱"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入管理员密码"
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '登录中...' : '管理员登录'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            普通用户？{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              去用户登录
            </Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            已有管理员账号？{' '}
            <Link to="/admin/signup" className="text-blue-400 font-semibold hover:underline">
              创建新管理员
            </Link>
          </p>

          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/40 rounded-xl">
            <p className="text-xs text-blue-400 text-center">
              🔒 管理员专属登录通道 · 请勿泄露账号密码
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
