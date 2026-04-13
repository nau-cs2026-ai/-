import { Router, Response } from 'express';
import { reportsRepository } from '../repositories/reports';
import { usersRepository } from '../repositories/users';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth';
import { InsertReport } from '../db/schema';

const router = Router();

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    const report = await reportsRepository.create({
      reporterId: req.user!.id,
      targetType,
      targetId,
      reason,
      description,
    } as InsertReport);
    return res.status(201).json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await reportsRepository.findAll();
    return res.json({ success: true, data: reports });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/:id/resolve', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNote } = req.body;
    const report = await reportsRepository.resolve(req.params.id as string, adminNote || '');
    return res.json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/:id/dismiss', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { adminNote } = req.body;
    const report = await reportsRepository.dismiss(req.params.id as string, adminNote || '');
    return res.json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/users/:id/ban', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await usersRepository.update(req.params.id as string, { isBanned: true });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
