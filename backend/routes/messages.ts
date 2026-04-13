import { Router, Response } from 'express';
import { messagesRepository } from '../repositories/messages';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { InsertMessage } from '../db/schema';

const router = Router();

router.get('/conversation/:userId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.query;
    const msgs = await messagesRepository.getConversation(
      req.user!.id,
      req.params.userId as string,
      productId as string | undefined
    );
    return res.json({ success: true, data: msgs.reverse() });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/list', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const msgs = await messagesRepository.getConversationList(req.user!.id);
    return res.json({ success: true, data: msgs });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/send', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, productId, content, messageType } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    // Check for risky keywords
    const riskyKeywords = ['转账', '汇款', '付款', '打钱', '微信转', '支付宝'];
    const hasRisk = riskyKeywords.some(kw => content.includes(kw));
    const msg = await messagesRepository.create({
      senderId: req.user!.id,
      receiverId,
      productId: productId || null,
      content,
      messageType: messageType || 'text',
    } as InsertMessage);
    return res.status(201).json({ success: true, data: msg, hasRisk });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/read/:senderId', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    await messagesRepository.markRead(req.params.senderId as string, req.user!.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
