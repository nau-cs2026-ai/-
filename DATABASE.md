# 数据库管理系统

基于 JSON 文件的轻量级数据库管理系统，提供类似关系型数据库的功能，无需安装额外依赖。

## 功能特性

- ✅ 完整的 CRUD 操作
- ✅ 复杂查询支持（条件、排序、分页）
- ✅ 事务支持
- ✅ 数据索引
- ✅ 数据备份和恢复
- ✅ 数据验证
- ✅ 自动数据迁移
- ✅ 友好的管理界面

## 目录结构

```
database/
├── data/                # 数据文件存储
│   ├── users.json
│   ├── products.json
│   ├── messages.json
│   ├── orders.json
│   ├── reports.json
│   └── favorites.json
├── backups/             # 数据备份
├── index.js             # 数据库主模块
├── manager.js           # 数据库管理工具
├── query-builder.js     # 查询构建器
├── migrations.js        # 数据迁移
└── utils.js             # 工具函数
```

## 快速开始

### 1. 初始化数据库

```javascript
const Database = require('./database/index');

// 初始化数据库
const db = new Database({
  dataPath: './database/data',
  backupPath: './database/backups',
  autoBackup: true,
  backupInterval: 24 * 60 * 60 * 1000 // 24小时
});
```

### 2. 基本操作

```javascript
// 插入数据
const user = await db.insert('users', {
  name: '测试用户',
  email: 'test@example.com',
  password: 'hashed_password'
});

// 查询数据
const users = await db.select('users')
  .where({ age: { $gt: 18 } })
  .orderBy({ field: 'createdAt', direction: 'desc' })
  .limit(10)
  .execute();

// 更新数据
const updated = await db.update('users')
  .set({ name: '新名称' })
  .where({ id: 'user-001' })
  .execute();

// 删除数据
const deleted = await db.delete('users')
  .where({ id: 'user-001' })
  .execute();
```

### 3. 事务操作

```javascript
await db.transaction(async (tx) => {
  // 在事务中执行操作
  const user = await tx.insert('users', { name: '测试' });
  const product = await tx.insert('products', { sellerId: user.id, title: '测试商品' });
  
  // 如果出错，事务会自动回滚
  if (product.title !== '测试商品') {
    throw new Error('数据验证失败');
  }
});
```

### 4. 数据备份

```javascript
// 手动创建备份
const backupFile = await db.backup();
console.log('备份文件:', backupFile);

// 恢复备份
await db.restore('./database/backups/backup-2026-04-13.json');
```

## 管理界面

启动管理界面：

```bash
node database/manager.js
```

访问：`http://localhost:3000`

管理界面功能：
- 📊 数据概览
- 🔍 数据查询
- ✏️ 数据编辑
- 📤 数据导入导出
- 🗄️ 备份管理
- 🔧 系统设置

## 数据模型

### Users 表
| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | string | 用户ID |
| name | string | 用户名 |
| email | string | 邮箱 |
| password | string | 密码（加密） |
| studentId | string | 学号 |
| phone | string | 手机号 |
| avatar | string | 头像URL |
| department | string | 院系 |
| grade | string | 年级 |
| isVerified | boolean | 是否验证 |
| creditScore | number | 信用分 |
| completedDeals | number | 完成交易数 |
| positiveRate | string | 好评率 |
| role | string | 角色 |
| isBanned | boolean | 是否封禁 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

### Products 表
| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | string | 商品ID |
| sellerId | string | 卖家ID |
| title | string | 标题 |
| description | string | 描述 |
| price | string | 价格 |
| originalPrice | string | 原价 |
| category | string | 分类 |
| condition | string | 成色 |
| location | string | 地点 |
| images | array | 图片URL数组 |
| status | string | 状态 |
| isUrgent | boolean | 是否急售 |
| isFeatured | boolean | 是否推荐 |
| isGraduationSeason | boolean | 是否毕业季 |
| favoriteCount | number | 收藏数 |
| viewCount | number | 浏览数 |
| isbn | string | ISBN（书籍） |
| expiresAt | Date | 过期时间 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

### Messages 表
| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | string | 消息ID |
| senderId | string | 发送者ID |
| receiverId | string | 接收者ID |
| productId | string | 商品ID |
| content | string | 内容 |
| messageType | string | 消息类型 |
| isRead | boolean | 是否已读 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

### Orders 表
| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | string | 订单ID |
| buyerId | string | 买家ID |
| sellerId | string | 卖家ID |
| productId | string | 商品ID |
| status | string | 状态 |
| buyerRating | number | 买家评分 |
| buyerComment | string | 买家评价 |
| completedAt | Date | 完成时间 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

### Reports 表
| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | string | 举报ID |
| reporterId | string | 举报者ID |
| targetType | string | 目标类型 |
| targetId | string | 目标ID |
| reason | string | 原因 |
| description | string | 描述 |
| status | string | 状态 |
| adminNote | string | 管理员备注 |
| resolvedAt | Date | 解决时间 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

### Favorites 表
| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | string | 收藏ID |
| userId | string | 用户ID |
| productId | string | 商品ID |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

## API 文档

### 数据库实例

#### 构造函数
```javascript
new Database(options)
```

**参数：**
- `options.dataPath` (string): 数据文件存储路径
- `options.backupPath` (string): 备份文件存储路径
- `options.autoBackup` (boolean): 是否自动备份
- `options.backupInterval` (number): 自动备份间隔（毫秒）

#### 方法

##### insert(table, data)
插入数据到指定表

**参数：**
- `table` (string): 表名
- `data` (object): 数据对象

**返回：** 插入的数据对象

##### select(table)
创建查询构建器

**参数：**
- `table` (string): 表名

**返回：** 查询构建器实例

##### update(table)
创建更新构建器

**参数：**
- `table` (string): 表名

**返回：** 更新构建器实例

##### delete(table)
创建删除构建器

**参数：**
- `table` (string): 表名

**返回：** 删除构建器实例

##### transaction(callback)
执行事务

**参数：**
- `callback` (function): 事务回调函数，接收事务对象作为参数

**返回：** 回调函数的返回值

##### backup()
创建数据备份

**返回：** 备份文件路径

##### restore(backupFile)
从备份恢复数据

**参数：**
- `backupFile` (string): 备份文件路径

**返回：** 恢复结果

##### getStats()
获取数据库统计信息

**返回：** 统计信息对象

### 查询构建器

#### where(conditions)
添加查询条件

**参数：**
- `conditions` (object): 查询条件

**返回：** 查询构建器实例

#### orderBy(options)
添加排序

**参数：**
- `options` (object): 排序选项
  - `field` (string): 排序字段
  - `direction` (string): 排序方向 ('asc' 或 'desc')

**返回：** 查询构建器实例

#### limit(limit)
添加限制

**参数：**
- `limit` (number): 限制数量

**返回：** 查询构建器实例

#### offset(offset)
添加偏移

**参数：**
- `offset` (number): 偏移数量

**返回：** 查询构建器实例

#### execute()
执行查询

**返回：** 查询结果

### 更新构建器

#### set(data)
设置更新数据

**参数：**
- `data` (object): 更新数据

**返回：** 更新构建器实例

#### where(conditions)
添加更新条件

**参数：**
- `conditions` (object): 更新条件

**返回：** 更新构建器实例

#### execute()
执行更新

**返回：** 更新结果

### 删除构建器

#### where(conditions)
添加删除条件

**参数：**
- `conditions` (object): 删除条件

**返回：** 删除构建器实例

#### execute()
执行删除

**返回：** 删除结果

## 条件操作符

| 操作符 | 描述 | 示例 |
|-------|------|------|
| $eq | 等于 | { age: { $eq: 18 } } |
| $ne | 不等于 | { age: { $ne: 18 } } |
| $gt | 大于 | { age: { $gt: 18 } } |
| $gte | 大于等于 | { age: { $gte: 18 } } |
| $lt | 小于 | { age: { $lt: 18 } } |
| $lte | 小于等于 | { age: { $lte: 18 } } |
| $in | 在数组中 | { status: { $in: ['active', 'pending'] } } |
| $nin | 不在数组中 | { status: { $nin: ['banned'] } } |
| $like | 模糊匹配 | { name: { $like: '%test%' } } |
| $notLike | 不匹配 | { name: { $notLike: '%test%' } } |
| $exists | 存在 | { email: { $exists: true } } |
| $and | 与操作 | { $and: [{ age: { $gt: 18 } }, { status: 'active' }] } |
| $or | 或操作 | { $or: [{ age: { $gt: 18 } }, { status: 'admin' }] } |

## 性能优化

1. **索引**：对常用查询字段创建索引
2. **缓存**：缓存频繁访问的数据
3. **批量操作**：使用批量插入和更新
4. **惰性加载**：按需加载数据
5. **压缩**：压缩存储的 JSON 数据

## 安全注意事项

1. **数据验证**：所有输入数据都需要验证
2. **密码加密**：用户密码必须加密存储
3. **权限控制**：实现适当的权限控制
4. **备份**：定期备份数据
5. **防注入**：防止 SQL 注入攻击

## 示例代码

### 完整示例

```javascript
const Database = require('./database/index');

// 初始化数据库
const db = new Database({
  dataPath: './database/data',
  backupPath: './database/backups',
  autoBackup: true
});

// 示例 1: 插入用户
async function createUser() {
  const user = await db.insert('users', {
    name: '张三',
    email: 'zhangsan@example.com',
    password: 'hashed_password',
    studentId: '2024001',
    department: '计算机学院',
    grade: '2024级',
    isVerified: true,
    creditScore: 100,
    completedDeals: 0,
    positiveRate: '100',
    role: 'user',
    isBanned: false
  });
  console.log('创建用户:', user);
}

// 示例 2: 查询商品
async function getProducts() {
  const products = await db.select('products')
    .where({
      category: 'electronics',
      price: { $lt: '5000' },
      status: 'approved'
    })
    .orderBy({ field: 'createdAt', direction: 'desc' })
    .limit(10)
    .execute();
  console.log('商品列表:', products);
}

// 示例 3: 更新商品状态
async function updateProductStatus(productId, status) {
  const result = await db.update('products')
    .set({ status })
    .where({ id: productId })
    .execute();
  console.log('更新结果:', result);
}

// 示例 4: 事务操作
async function createOrder() {
  try {
    await db.transaction(async (tx) => {
      // 创建订单
      const order = await tx.insert('orders', {
        buyerId: 'user-001',
        sellerId: 'user-002',
        productId: 'product-001',
        status: 'pending'
      });
      
      // 更新商品状态
      await tx.update('products')
        .set({ status: 'sold' })
        .where({ id: 'product-001' })
        .execute();
      
      console.log('订单创建成功:', order);
    });
  } catch (error) {
    console.error('事务失败:', error);
  }
}

// 运行示例
(async () => {
  await createUser();
  await getProducts();
  await updateProductStatus('product-001', 'sold');
  await createOrder();
  
  // 获取统计信息
  const stats = await db.getStats();
  console.log('数据库统计:', stats);
  
  // 创建备份
  const backup = await db.backup();
  console.log('备份文件:', backup);
})();
```

## 部署说明

1. **复制数据库目录**到项目根目录
2. **配置数据库选项**在应用中初始化
3. **启动管理界面**进行数据管理
4. **设置定期备份**确保数据安全

## 故障排除

### 数据损坏
如果数据文件损坏，可以：
1. 使用最近的备份恢复
2. 运行数据修复工具
3. 检查文件权限

### 性能问题
如果查询速度慢：
1. 添加适当的索引
2. 优化查询条件
3. 减少一次性查询的数据量

### 内存使用
如果内存使用过高：
1. 启用惰性加载
2. 增加缓存大小
3. 优化数据结构

---

**版本：** 1.0.0
**最后更新：** 2026-04-13
**作者：** 系统自动生成
