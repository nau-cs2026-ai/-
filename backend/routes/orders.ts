import { Router, Response } from 'express';
import { ordersRepository } from '../repositories/orders';
import { productsRepository } from '../repositories/products';
import { usersRepository } from '../repositories/users';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/my', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const [bought, sold] = await Promise.all([
      ordersRepository.findByBuyer(req.user!.id),
      ordersRepository.findBySeller(req.user!.id),
    ]);
    return res.json({ success: true, data: { bought, sold } });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: '缺少商品ID' });
    const product = await productsRepository.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: '商品不存在' });
    if (product.sellerId === req.user!.id) {
      return res.status(400).json({ success: false, message: '不能购买自己的商品' });
    }
    const order = await ordersRepository.create({
      buyerId: req.user!.id,
      sellerId: product.sellerId,
      productId,
      status: 'intent',
    });
    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/:id/complete', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const order = await ordersRepository.findById(req.params.id as string);
    if (!order) return res.status(404).json({ success: false, message: '订单不存在' });
    if (order.buyerId !== req.user!.id) return res.status(403).json({ success: false, message: '无权限操作' });
    const completed = await ordersRepository.complete(order.id, rating || 1, comment || '');
    // Update seller credit score
    if (rating === 1) await usersRepository.updateCreditScore(order.sellerId, 3); // positive
    else if (rating === 3) await usersRepository.updateCreditScore(order.sellerId, -5); // negative
    else await usersRepository.updateCreditScore(order.sellerId, 1); // neutral
    // Update product status
    await productsRepository.update(order.productId, { status: 'sold' });
    // Update seller completed deals
    const seller = await usersRepository.findById(order.sellerId);
    if (seller) await usersRepository.update(order.sellerId, { completedDeals: seller.completedDeals + 1 });
    return res.json({ success: true, data: completed });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
