const fs = require('fs');
const path = require('path');
const Database = require('./index');

class DataMigration {
  constructor(options = {}) {
    this.sourcePath = options.sourcePath || path.join(__dirname, '..', 'backend', 'data');
    this.targetPath = options.targetPath || path.join(__dirname, 'data');
    this.db = new Database({
      dataPath: this.targetPath,
      backupPath: path.join(__dirname, 'backups')
    });
  }

  async migrate() {
    console.log('开始数据迁移...');
    console.log(`源路径: ${this.sourcePath}`);
    console.log(`目标路径: ${this.targetPath}`);
    
    try {
      // 1. 备份现有数据
      await this._backupExistingData();
      
      // 2. 迁移用户数据
      await this._migrateUsers();
      
      // 3. 迁移商品数据
      await this._migrateProducts();
      
      // 4. 迁移消息数据
      await this._migrateMessages();
      
      // 5. 迁移订单数据
      await this._migrateOrders();
      
      // 6. 迁移举报数据
      await this._migrateReports();
      
      // 7. 迁移收藏数据
      await this._migrateFavorites();
      
      console.log('\n🎉 数据迁移完成！');
      
      // 8. 验证迁移结果
      await this._verifyMigration();
      
    } catch (error) {
      console.error('❌ 数据迁移失败:', error);
      throw error;
    }
  }

  async _backupExistingData() {
    console.log('\n1. 创建备份...');
    try {
      const backupFile = await this.db.backup();
      console.log(`   ✅ 备份创建成功: ${backupFile}`);
    } catch (error) {
      console.log(`   ⚠️  备份创建失败: ${error.message}`);
    }
  }

  async _migrateUsers() {
    console.log('\n2. 迁移用户数据...');
    try {
      const sourceFile = path.join(this.sourcePath, 'users.json');
      if (!fs.existsSync(sourceFile)) {
        console.log('   ⚠️  用户数据文件不存在，跳过');
        return;
      }

      const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
      console.log(`   找到 ${sourceData.length} 个用户`);

      let successCount = 0;
      for (const user of sourceData) {
        try {
          // 转换数据格式
          const migratedUser = {
            name: user.name || '',
            email: user.email || '',
            password: user.password || '',
            studentId: user.studentId || null,
            phone: user.phone || null,
            avatar: user.avatar || null,
            department: user.department || null,
            grade: user.grade || null,
            isVerified: user.isVerified || false,
            creditScore: user.creditScore || 100,
            completedDeals: user.completedDeals || 0,
            positiveRate: user.positiveRate || '100',
            role: user.role || 'user',
            isBanned: user.isBanned || false
          };

          // 检查是否已存在
          const existing = this.db.select('users')
            .where({ email: migratedUser.email })
            .execute();

          if (existing.length === 0) {
            await this.db.insert('users', migratedUser);
            successCount++;
          } else {
            console.log(`   ⚠️  用户 ${migratedUser.email} 已存在，跳过`);
          }
        } catch (error) {
          console.log(`   ❌ 迁移用户失败: ${error.message}`);
        }
      }

      console.log(`   ✅ 成功迁移 ${successCount} 个用户`);
    } catch (error) {
      console.log(`   ❌ 迁移用户数据失败: ${error.message}`);
    }
  }

  async _migrateProducts() {
    console.log('\n3. 迁移商品数据...');
    try {
      const sourceFile = path.join(this.sourcePath, 'products.json');
      if (!fs.existsSync(sourceFile)) {
        console.log('   ⚠️  商品数据文件不存在，跳过');
        return;
      }

      const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
      console.log(`   找到 ${sourceData.length} 个商品`);

      let successCount = 0;
      for (const product of sourceData) {
        try {
          // 转换数据格式
          const migratedProduct = {
            sellerId: product.sellerId || '',
            title: product.title || '',
            description: product.description || null,
            price: product.price || '',
            originalPrice: product.originalPrice || null,
            category: product.category || '',
            condition: product.condition || '',
            location: product.location || '',
            images: product.images || [],
            status: product.status || 'pending',
            isUrgent: product.isUrgent || false,
            isFeatured: product.isFeatured || false,
            isGraduationSeason: product.isGraduationSeason || false,
            favoriteCount: product.favoriteCount || 0,
            viewCount: product.viewCount || 0,
            isbn: product.isbn || null,
            expiresAt: product.expiresAt || null
          };

          // 检查是否已存在
          const existing = this.db.select('products')
            .where({ id: product.id })
            .execute();

          if (existing.length === 0) {
            await this.db.insert('products', migratedProduct);
            successCount++;
          } else {
            console.log(`   ⚠️  商品 ${product.id} 已存在，跳过`);
          }
        } catch (error) {
          console.log(`   ❌ 迁移商品失败: ${error.message}`);
        }
      }

      console.log(`   ✅ 成功迁移 ${successCount} 个商品`);
    } catch (error) {
      console.log(`   ❌ 迁移商品数据失败: ${error.message}`);
    }
  }

  async _migrateMessages() {
    console.log('\n4. 迁移消息数据...');
    try {
      const sourceFile = path.join(this.sourcePath, 'messages.json');
      if (!fs.existsSync(sourceFile)) {
        console.log('   ⚠️  消息数据文件不存在，跳过');
        return;
      }

      const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
      console.log(`   找到 ${sourceData.length} 条消息`);

      let successCount = 0;
      for (const message of sourceData) {
        try {
          // 转换数据格式
          const migratedMessage = {
            senderId: message.senderId || '',
            receiverId: message.receiverId || '',
            productId: message.productId || null,
            content: message.content || '',
            messageType: message.messageType || 'text',
            isRead: message.isRead || false
          };

          // 检查是否已存在
          const existing = this.db.select('messages')
            .where({ id: message.id })
            .execute();

          if (existing.length === 0) {
            await this.db.insert('messages', migratedMessage);
            successCount++;
          } else {
            console.log(`   ⚠️  消息 ${message.id} 已存在，跳过`);
          }
        } catch (error) {
          console.log(`   ❌ 迁移消息失败: ${error.message}`);
        }
      }

      console.log(`   ✅ 成功迁移 ${successCount} 条消息`);
    } catch (error) {
      console.log(`   ❌ 迁移消息数据失败: ${error.message}`);
    }
  }

  async _migrateOrders() {
    console.log('\n5. 迁移订单数据...');
    try {
      const sourceFile = path.join(this.sourcePath, 'orders.json');
      if (!fs.existsSync(sourceFile)) {
        console.log('   ⚠️  订单数据文件不存在，跳过');
        return;
      }

      const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
      console.log(`   找到 ${sourceData.length} 个订单`);

      let successCount = 0;
      for (const order of sourceData) {
        try {
          // 转换数据格式
          const migratedOrder = {
            buyerId: order.buyerId || '',
            sellerId: order.sellerId || '',
            productId: order.productId || '',
            status: order.status || 'pending',
            buyerRating: order.buyerRating || null,
            buyerComment: order.buyerComment || null,
            completedAt: order.completedAt || null
          };

          // 检查是否已存在
          const existing = this.db.select('orders')
            .where({ id: order.id })
            .execute();

          if (existing.length === 0) {
            await this.db.insert('orders', migratedOrder);
            successCount++;
          } else {
            console.log(`   ⚠️  订单 ${order.id} 已存在，跳过`);
          }
        } catch (error) {
          console.log(`   ❌ 迁移订单失败: ${error.message}`);
        }
      }

      console.log(`   ✅ 成功迁移 ${successCount} 个订单`);
    } catch (error) {
      console.log(`   ❌ 迁移订单数据失败: ${error.message}`);
    }
  }

  async _migrateReports() {
    console.log('\n6. 迁移举报数据...');
    try {
      const sourceFile = path.join(this.sourcePath, 'reports.json');
      if (!fs.existsSync(sourceFile)) {
        console.log('   ⚠️  举报数据文件不存在，跳过');
        return;
      }

      const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
      console.log(`   找到 ${sourceData.length} 个举报`);

      let successCount = 0;
      for (const report of sourceData) {
        try {
          // 转换数据格式
          const migratedReport = {
            reporterId: report.reporterId || '',
            targetType: report.targetType || '',
            targetId: report.targetId || '',
            reason: report.reason || '',
            description: report.description || null,
            status: report.status || 'pending',
            adminNote: report.adminNote || null,
            resolvedAt: report.resolvedAt || null
          };

          // 检查是否已存在
          const existing = this.db.select('reports')
            .where({ id: report.id })
            .execute();

          if (existing.length === 0) {
            await this.db.insert('reports', migratedReport);
            successCount++;
          } else {
            console.log(`   ⚠️  举报 ${report.id} 已存在，跳过`);
          }
        } catch (error) {
          console.log(`   ❌ 迁移举报失败: ${error.message}`);
        }
      }

      console.log(`   ✅ 成功迁移 ${successCount} 个举报`);
    } catch (error) {
      console.log(`   ❌ 迁移举报数据失败: ${error.message}`);
    }
  }

  async _migrateFavorites() {
    console.log('\n7. 迁移收藏数据...');
    try {
      const sourceFile = path.join(this.sourcePath, 'favorites.json');
      if (!fs.existsSync(sourceFile)) {
        console.log('   ⚠️  收藏数据文件不存在，跳过');
        return;
      }

      const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
      console.log(`   找到 ${sourceData.length} 个收藏`);

      let successCount = 0;
      for (const favorite of sourceData) {
        try {
          // 转换数据格式
          const migratedFavorite = {
            userId: favorite.userId || '',
            productId: favorite.productId || ''
          };

          // 检查是否已存在
          const existing = this.db.select('favorites')
            .where({ userId: migratedFavorite.userId, productId: migratedFavorite.productId })
            .execute();

          if (existing.length === 0) {
            await this.db.insert('favorites', migratedFavorite);
            successCount++;
          } else {
            console.log(`   ⚠️  收藏已存在，跳过`);
          }
        } catch (error) {
          console.log(`   ❌ 迁移收藏失败: ${error.message}`);
        }
      }

      console.log(`   ✅ 成功迁移 ${successCount} 个收藏`);
    } catch (error) {
      console.log(`   ❌ 迁移收藏数据失败: ${error.message}`);
    }
  }

  async _verifyMigration() {
    console.log('\n8. 验证迁移结果...');
    
    const stats = this.db.getStats();
    console.log('   迁移后数据统计:');
    
    for (const [table, data] of Object.entries(stats)) {
      console.log(`   - ${table}: ${data.count} 条记录`);
    }
    
    console.log('\n📊 迁移验证完成！');
  }

  async rollback() {
    console.log('开始回滚数据...');
    try {
      // 清空所有表
      for (const table of this.db.tables) {
        const data = this.db._loadTable(table);
        if (data.length > 0) {
          this.db._saveTable(table, []);
          console.log(`   ✅ 清空 ${table} 表`);
        }
      }
      console.log('\n🎉 数据回滚完成！');
    } catch (error) {
      console.error('❌ 数据回滚失败:', error);
      throw error;
    }
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataMigration;
  
  // 如果直接运行此文件
  if (require.main === module) {
    const migration = new DataMigration();
    
    // 解析命令行参数
    const args = process.argv.slice(2);
    
    if (args.includes('--rollback')) {
      migration.rollback().catch(console.error);
    } else {
      migration.migrate().catch(console.error);
    }
  }
}
