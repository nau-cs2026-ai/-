import { useState, useEffect, useRef, memo } from 'react';
import { apiService } from '../../lib/api';
import { toast } from 'sonner';
import { Send, User, MessageCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface Conversation {
  oderId: string;
  oderName: string;
  oderAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  productId: string | null;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  productId: string | null;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

interface MessagesViewProps {
  onChat: (id: string, name: string) => void;
  chatPartner: { id: string; name: string } | null;
  currentUser: any;
}

const MessagesView = memo(function MessagesView({ 
  onChat, 
  chatPartner,
  currentUser 
}: MessagesViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (chatPartner) {
      loadMessages(chatPartner.id);
    }
  }, [chatPartner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/messages/list');
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/messages/conversation/${userId}`);
      if (response.success) {
        setMessages(response.data.messages || []);
        markAsRead(userId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (userId: string) => {
    try {
      await apiService.post(`/messages/read/${userId}`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatPartner) return;
    
    setSending(true);
    try {
      const response = await apiService.sendMessage(chatPartner.id, newMessage.trim());
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        
        if (response.hasRisk) {
          toast.warning(response.riskWarning || '请注意交易安全', {
            description: '建议使用平台担保交易'
          });
        }
        
        loadConversations();
      }
    } catch (error) {
      toast.error('发送失败，请重试');
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Sora, sans-serif' }}>
            私信
          </h1>
          {totalUnread > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalUnread} 未读
            </div>
          )}
        </div>
        <button
          onClick={loadConversations}
          className="flex items-center gap-2 text-[#1E3A5F] hover:text-blue-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">刷新</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8F7F4]">
            <h2 className="font-semibold text-[#1A1A2E]">消息列表</h2>
          </div>
          
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-[#6B7280]">加载中...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="w-12 h-12 text-[#9CA3AF] mb-3" />
              <div className="text-[#6B7280] text-sm">暂无消息</div>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] max-h-[500px] overflow-y-auto">
              {conversations.map(conv => (
                <button 
                  key={conv.oderId} 
                  onClick={() => onChat(conv.oderId, conv.oderName)}
                  className={`w-full text-left p-4 hover:bg-[#F8F7F4] transition-all ${
                    chatPartner?.id === conv.oderId ? 'bg-[#F8F7F4]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
                        {conv.oderAvatar ? (
                          <img src={conv.oderAvatar} alt={conv.oderName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-[#1A1A2E] truncate">{conv.oderName}</p>
                          <span className="text-xs text-[#6B7280]">{formatTime(conv.lastMessageTime)}</span>
                        </div>
                        <p className="text-sm text-[#6B7280] truncate mt-1">{conv.lastMessage}</p>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-2">
          {chatPartner ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] h-[600px] flex flex-col">
              <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8F7F4]">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onChat('', '')}
                    className="lg:hidden text-[#6B7280] hover:text-[#1E3A5F]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#1A1A2E]">{chatPartner.name}</h2>
                    <p className="text-xs text-[#6B7280]">点击查看详情</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-[#FAFAFA]">
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-[#6B7280]">加载中...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <MessageCircle className="w-12 h-12 text-[#9CA3AF] mb-3" />
                      <p className="text-[#6B7280] text-sm">暂无消息，开始聊天吧</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isOwn = msg.senderId === currentUser?.id;
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-2xl p-3 ${
                              isOwn 
                                ? 'bg-[#1E3A5F] text-white' 
                                : 'bg-white border border-[#E5E7EB]'
                            }`}
                          >
                            <p className={`${isOwn ? 'text-white' : 'text-[#1A1A2E]'}`}>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-[#6B7280]'}`}>
                              {formatTime(msg.createdAt)}
                              {isOwn && msg.isRead && ' · 已读'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="p-4 border-t border-[#E5E7EB] bg-white">
                <div className="flex items-center gap-2">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
                    className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none"
                    rows={1}
                    maxLength={500}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-[#1E3A5F] hover:bg-blue-900 disabled:bg-[#9CA3AF] text-white p-3 rounded-xl transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-2 flex items-start gap-2 text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3 mt-0.5" />
                  <span>注意：如有转账、汇款等金钱往来，请务必使用平台担保交易</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] h-[600px] flex flex-col items-center justify-center">
              <MessageCircle className="w-16 h-16 text-[#9CA3AF] mb-4" />
              <p className="text-[#1A1A2E] font-semibold mb-2">选择一个聊天</p>
              <p className="text-sm text-[#6B7280]">从左侧列表选择一个联系人开始聊天</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MessagesView;
