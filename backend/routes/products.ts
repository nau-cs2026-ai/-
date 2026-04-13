import { Router, Response } from 'express';
import { productsRepository } from '../repositories/products';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { InsertProduct } from '../db/schema';

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
      status: 'approved',
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

export default router;
