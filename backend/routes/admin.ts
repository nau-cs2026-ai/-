import { Router, Response } from 'express';
import { productsRepository } from '../repositories/products';
import { usersRepository } from '../repositories/users';
import { ordersRepository } from '../repositories/orders';
import { reportsRepository } from '../repositories/reports';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Dashboard stats
router.get('/stats', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [allUsers, allProducts, allOrders, allReports] = await Promise.all([
      usersRepository.findAll(),
      productsRepository.findAll({}),
      ordersRepository.findAll(),
      reportsRepository.findAll(),
    ]);
    const stats = {
      totalUsers: allUsers.length,
      verifiedUsers: allUsers.filter(u => u.isVerified).length,
      totalProducts: allProducts.length,
      pendingProducts: allProducts.filter(p => p.status === 'pending').length,
      approvedProducts: allProducts.filter(p => p.status === 'approved').length,
      totalOrders: allOrders.length,
      completedOrders: allOrders.filter(o => o.status === 'completed').length,
      pendingReports: allReports.filter(r => r.status === 'pending').length,
      totalReports: allReports.length,
    };
    return res.json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Get all users
router.get('/users', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await usersRepository.findAll();
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Get all products (admin)
router.get('/products', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const products = await productsRepository.findAll({});
    return res.json({ success: true, data: products });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Approve product
router.post('/products/:id/approve', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await productsRepository.update(req.params.id as string, { status: 'approved' });
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Reject product
router.post('/products/:id/reject', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await productsRepository.update(req.params.id as string, { status: 'rejected' });
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Ban user
router.post('/users/:id/ban', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await usersRepository.update(req.params.id as string, { isBanned: true });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Unban user
router.post('/users/:id/unban', authenticateJWT, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await usersRepository.update(req.params.id as string, { isBanned: false });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
