import { Router, Response } from 'express';
import { messagesRepository } from '../repositories/messages';
import { usersRepository } from '../repositories/users';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { InsertMessage } from '../db/schema';

const router = Router();

// Get conversation list with last message and unread count
router.get('/list', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const allMessages = await messagesRepository.getConversationList(req.user!.id);
    
    const conversationMap = new Map();
    
    for (const msg of allMessages) {
      const otherUserId = msg.senderId === req.user!.id ? msg.receiverId : msg.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        const otherUser = await usersRepository.findById(otherUserId);
        conversationMap.set(otherUserId, {
          oderId: otherUserId,
          oderName: otherUser?.name || '未知用户',
          oderAvatar: otherUser?.avatar || null,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          productId: msg.productId,
        });
      }
      
      if (msg.senderId === otherUserId && !msg.isRead) {
        const conv = conversationMap.get(otherUserId);
        conv.unreadCount++;
      }
    }
    
    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    
    return res.json({ success: true, data: conversations });
  } catch (err) {
    console.error('Error getting conversation list:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Get conversation with specific user
router.get('/conversation/:userId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.query;
    const msgs = await messagesRepository.getConversation(
      req.user!.id,
      req.params.userId as string,
      productId as string | undefined
    );
    
    const otherUser = await usersRepository.findById(req.params.userId as string);
    
    return res.json({ 
      success: true, 
      data: {
        messages: msgs.reverse(),
        oderId: req.params.userId,
        oderName: otherUser?.name || '未知用户',
        oderAvatar: otherUser?.avatar || null,
      }
    });
  } catch (err) {
    console.error('Error getting conversation:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Send message
router.post('/send', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, productId, content, messageType } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ success: false, message: '消息内容过长' });
    }
    
    const riskyKeywords = ['转账', '汇款', '付款', '打钱', '微信转', '支付宝', '银行卡'];
    const hasRisk = riskyKeywords.some(kw => content.includes(kw));
    
    const msg = await messagesRepository.create({
      senderId: req.user!.id,
      receiverId,
      productId: productId || null,
      content,
      messageType: messageType || 'text',
    } as InsertMessage);
    
    return res.status(201).json({ 
      success: true, 
      data: msg, 
      hasRisk,
      riskWarning: hasRisk ? '请注意交易安全，建议使用平台担保交易' : null
    });
  } catch (err) {
    console.error('Error sending message:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Mark messages as read
router.post('/read/:senderId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    await messagesRepository.markRead(req.params.senderId as string, req.user!.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Get unread message count
router.get('/unread-count', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const allMessages = await messagesRepository.getConversationList(req.user!.id);
    const unreadCount = allMessages.filter(
      msg => msg.senderId !== req.user!.id && !msg.isRead
    ).length;
    
    return res.json({ success: true, data: { unreadCount } });
  } catch (err) {
    console.error('Error getting unread count:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Delete message
router.delete('/:messageId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await messagesRepository.delete(req.params.messageId as string, req.user!.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '消息不存在或无权限删除' });
    }
    return res.json({ success: true, message: '消息已删除' });
  } catch (err) {
    console.error('Error deleting message:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
