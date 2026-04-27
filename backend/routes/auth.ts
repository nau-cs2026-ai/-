import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { usersRepository } from '../repositories/users';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campus-trade-secret-key';

const signupSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: '两次密码不一致', path: ['confirmPassword'] });

const adminSignupSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  role: z.enum(['admin']).default('admin'),
}).refine(d => d.password.length >= 6, { message: '密码至少6位' });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/signup', async (req: Request, res: Response) => {
  try {
    console.log('收到注册请求:', req.body);
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log('注册验证失败:', parsed.error.errors);
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { name, email, password } = parsed.data;
    console.log('查找用户:', email);
    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      console.log('用户已存在');
      return res.status(409).json({ success: false, message: '该邮箱已被注册' });
    }
    console.log('创建新用户:', name);
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await usersRepository.create({ name, email, password: hashedPassword });
    console.log('用户创建成功:', user.id);
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Token 生成成功');
    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, creditScore: user.creditScore, isVerified: user.isVerified },
      },
    });
  } catch (err) {
    console.error('注册错误:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/admin/signup', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    console.log('收到管理员创建请求:', req.body);
    
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: '只有管理员可以创建新管理员' });
    }
    
    const parsed = adminSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log('管理员创建验证失败:', parsed.error.errors);
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    
    const { name, email, password } = parsed.data;
    console.log('查找用户:', email);
    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      console.log('用户已存在');
      return res.status(409).json({ success: false, message: '该邮箱已被注册' });
    }
    
    console.log('创建新管理员:', name);
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await usersRepository.create({ name, email, password: hashedPassword, role: 'admin', isVerified: true });
    console.log('管理员创建成功:', user.id);
    
    return res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, creditScore: user.creditScore, isVerified: user.isVerified },
      },
      message: '管理员创建成功'
    });
  } catch (err) {
    console.error('管理员创建错误:', err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: '请填写正确的邮箱和密码' });
    }
    const { email, password } = parsed.data;
    const user = await usersRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: '该账号已被封禁' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, creditScore: user.creditScore, isVerified: user.isVerified, avatar: user.avatar, department: user.department, grade: user.grade },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = await usersRepository.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    return res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, creditScore: user.creditScore, isVerified: user.isVerified, avatar: user.avatar, department: user.department, grade: user.grade, completedDeals: user.completedDeals, positiveRate: user.positiveRate, studentId: user.studentId, phone: user.phone },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.put('/profile', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { name, department, grade, phone, studentId, avatar } = req.body;
    const user = await usersRepository.update(req.user!.id, { name, department, grade, phone, studentId, avatar });
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.post('/verify-student', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: '请提供学号' });
    const user = await usersRepository.update(req.user!.id, { studentId, isVerified: true });
    return res.json({ success: true, data: user, message: '学号认证成功' });
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router;
