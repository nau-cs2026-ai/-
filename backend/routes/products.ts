import { Router, Response } from 'express';
import { productsRepository } from '../repositories/products';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { InsertProduct } from '../db/schema';
import NotificationService from '../services/notificationService';

const router = Router();

// Public: list products
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, condition, search, status, graduation } = req.query;
    const prods = await productsRepository.findAll({
      category: category as string,
      condition: condition as string,
      search: search as string,
      status: (status as string) || 'approved',
      isGraduationSeason: graduation === 'true',
    });
    return res.json({ success: true, data: prods });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Public: get single product
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await productsRepository.findById(req.params.id as string);
    if (!product) return res.status(404).json({ success: false, message: '商品不存在' });
    await productsRepository.incrementView(req.params.id as string);
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Protected: create product
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, originalPrice, category, condition, location, images, isUrgent, isFeatured, isGraduationSeason, isbn } = req.body;
    if (!title || !price || !category || !condition || !location) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    const product = await productsRepository.create({
      title,
      description,
      price,
      originalPrice,
      category,
      condition,
      location,
      images: images || [],
      isUrgent: isUrgent || false,
      isFeatured: isFeatured || false,
      isGraduationSeason: isGraduationSeason || false,
      isbn,
      sellerId: req.user!.id,
      status: 'pending',
    } as InsertProduct);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Protected: update product
router.put('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const product = await productsRepository.findById(req.params.id as string);
    if (!product) return res.status(404).json({ success: false, message: '商品不存在' });
    if (product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限操作' });
    }
    const updated = await productsRepository.update(req.params.id as string, req.body);
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Protected: delete product
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const product = await productsRepository.findById(req.params.id as string);
    if (!product) return res.status(404).json({ success: false, message: '商品不存在' });
    if (product.sellerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限操作' });
    }
    await productsRepository.delete(req.params.id as string);
    return res.json({ success: true, message: '删除成功' });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Admin: get all products including pending
router.get('/admin/all', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' });
    const prods = await productsRepository.findAll({});
    return res.json({ success: true, data: prods });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Admin: get pending products
router.get('/admin/pending', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' });
    const prods = await productsRepository.findAll({ status: 'pending' });
    return res.json({ success: true, data: prods });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Admin: approve product
router.post('/admin/:id/approve', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' });
    const product = await productsRepository.findById(req.params.id as string);
    if (!product) return res.status(404).json({ success: false, message: '商品不存在' });
    
    const updated = await productsRepository.update(req.params.id as string, { status: 'approved' });
    
    await NotificationService.sendApprovalNotification(
      product.sellerId,
      product.id,
      product.title
    );
    
    return res.json({ success: true, data: updated, message: '商品已通过审核' });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Admin: reject product
router.post('/admin/:id/reject', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' });
    const product = await productsRepository.findById(req.params.id as string);
    if (!product) return res.status(404).json({ success: false, message: '商品不存在' });
    
    const { reason } = req.body;
    const updated = await productsRepository.update(req.params.id as string, { 
      status: 'rejected',
      rejectionReason: reason || '不符合发布规范'
    });
    
    await NotificationService.sendRejectionNotification(
      product.sellerId,
      product.id,
      product.title,
      reason || '不符合发布规范'
    );
    
    return res.json({ success: true, data: updated, message: '商品已拒绝' });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Admin: batch approve products
router.post('/admin/batch-approve', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' });
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, message: '商品ID列表格式错误' });
    }
    
    const results = [];
    const sellerIds = new Set<string>();
    
    for (const id of productIds) {
      try {
        const product = await productsRepository.findById(id);
        if (product && product.status === 'pending') {
          const updated = await productsRepository.update(id, { status: 'approved' });
          results.push(updated);
          sellerIds.add(product.sellerId);
        }
      } catch (error) {
        console.error(`Failed to approve product ${id}:`, error);
      }
    }
    
    await NotificationService.sendBatchApprovalNotification(
      Array.from(sellerIds),
      results.length
    );
    
    return res.json({ success: true, data: results, message: `已批量通过 ${results.length} 个商品` });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Admin: batch reject products
router.post('/admin/batch-reject', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' });
    const { productIds, reason } = req.body;
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, message: '商品ID列表格式错误' });
    }
    
    const results = [];
    const sellerIds = new Set<string>();
    
    for (const id of productIds) {
      try {
        const product = await productsRepository.findById(id);
        if (product && product.status === 'pending') {
          const updated = await productsRepository.update(id, { 
            status: 'rejected',
            rejectionReason: reason || '不符合发布规范'
          });
          results.push(updated);
          sellerIds.add(product.sellerId);
        }
      } catch (error) {
        console.error(`Failed to reject product ${id}:`, error);
      }
    }
    
    await NotificationService.sendBatchRejectionNotification(
      Array.from(sellerIds),
      results.length,
      reason || '不符合发布规范'
    );
    
    return res.json({ success: true, data: results, message: `已批量拒绝 ${results.length} 个商品` });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// Admin: get approval statistics
router.get('/admin/stats', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') return res.status(403).json({ success: false, message: '需要管理员权限' });
    
    const allProducts = await productsRepository.findAll({});
    const stats = {
      total: allProducts.length,
      pending: allProducts.filter(p => p.status === 'pending').length,
      approved: allProducts.filter(p => p.status === 'approved').length,
      rejected: allProducts.filter(p => p.status === 'rejected').length,
      sold: allProducts.filter(p => p.status === 'sold').length
    };
    
    return res.json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
