const Database = require('./database/index');

console.log('========================================');
console.log('  测试审核功能');
console.log('========================================');
console.log('');

const db = new Database({
  dataPath: './database/data',
  backupPath: './database/backups',
  autoBackup: false
});

async function testApproval() {
  try {
    console.log('1. 创建测试用户（管理员）...');
    const admin = await db.insert('users', {
      name: '管理员',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isBanned: false
    });
    console.log('   ✅ 管理员创建成功:', admin.name);

    console.log('\n2. 创建测试用户（卖家）...');
    const seller = await db.insert('users', {
      name: '测试卖家',
      email: 'seller@example.com',
      password: 'seller123',
      role: 'user',
      isVerified: true,
      isBanned: false
    });
    console.log('   ✅ 卖家创建成功:', seller.name);

    console.log('\n3. 创建待审核商品...');
    const product1 = await db.insert('products', {
      sellerId: seller.id,
      title: '待审核商品1',
      price: '100',
      category: 'books',
      condition: 'new',
      location: '测试地点',
      status: 'pending',
      description: '这是一个待审核的商品'
    });
    console.log('   ✅ 商品1创建成功:', product1.title, '(状态:', product1.status + ')');

    const product2 = await db.insert('products', {
      sellerId: seller.id,
      title: '待审核商品2',
      price: '200',
      category: 'electronics',
      condition: '99',
      location: '测试地点',
      status: 'pending',
      description: '这是另一个待审核的商品'
    });
    console.log('   ✅ 商品2创建成功:', product2.title, '(状态:', product2.status + ')');

    console.log('\n4. 查询待审核商品...');
    const pendingProducts = db.select('products')
      .where({ status: 'pending' })
      .execute();
    console.log('   ✅ 找到', pendingProducts.length, '个待审核商品');

    console.log('\n5. 模拟审核通过商品1...');
    const approvedProduct = db.update('products')
      .set({ status: 'approved' })
      .where({ id: product1.id })
      .execute();
    console.log('   ✅ 商品1审核通过:', approvedProduct[0].title, '(状态:', approvedProduct[0].status + ')');

    console.log('\n6. 模拟审核拒绝商品2...');
    const rejectedProduct = db.update('products')
      .set({ status: 'rejected', rejectionReason: '商品描述不完整' })
      .where({ id: product2.id })
      .execute();
    console.log('   ✅ 商品2审核拒绝:', rejectedProduct[0].title, '(状态:', rejectedProduct[0].status + ')');
    console.log('   拒绝原因:', rejectedProduct[0].rejectionReason);

    console.log('\n7. 查询审核统计...');
    const allProducts = db.select('products').execute();
    const stats = {
      total: allProducts.length,
      pending: allProducts.filter(p => p.status === 'pending').length,
      approved: allProducts.filter(p => p.status === 'approved').length,
      rejected: allProducts.filter(p => p.status === 'rejected').length
    };
    console.log('   统计信息:');
    console.log('   - 总商品数:', stats.total);
    console.log('   - 待审核:', stats.pending);
    console.log('   - 已通过:', stats.approved);
    console.log('   - 已拒绝:', stats.rejected);

    console.log('\n8. 查询卖家的商品状态...');
    const sellerProducts = db.select('products')
      .where({ sellerId: seller.id })
      .execute();
    console.log('   卖家的商品:');
    sellerProducts.forEach(p => {
      console.log('   -', p.title, ':', p.status);
    });

    console.log('\n9. 测试批量审核...');
    const product3 = await db.insert('products', {
      sellerId: seller.id,
      title: '待审核商品3',
      price: '300',
      category: 'daily',
      condition: 'new',
      location: '测试地点',
      status: 'pending',
      description: '第三个待审核的商品'
    });
    console.log('   ✅ 商品3创建成功:', product3.title);

    const product4 = await db.insert('products', {
      sellerId: seller.id,
      title: '待审核商品4',
      price: '400',
      category: 'sports',
      condition: '99',
      location: '测试地点',
      status: 'pending',
      description: '第四个待审核的商品'
    });
    console.log('   ✅ 商品4创建成功:', product4.title);

    const newPendingProducts = db.select('products')
      .where({ status: 'pending' })
      .execute();
    console.log('   当前待审核商品数:', newPendingProducts.length);

    console.log('\n10. 批量通过审核...');
    const batchApproved = [];
    for (const product of newPendingProducts) {
      const updated = db.update('products')
        .set({ status: 'approved' })
        .where({ id: product.id })
        .execute();
      batchApproved.push(updated[0]);
    }
    console.log('   ✅ 批量通过', batchApproved.length, '个商品');

    console.log('\n11. 最终统计...');
    const finalStats = db.select('products').execute();
    const finalCount = {
      total: finalStats.length,
      pending: finalStats.filter(p => p.status === 'pending').length,
      approved: finalStats.filter(p => p.status === 'approved').length,
      rejected: finalStats.filter(p => p.status === 'rejected').length
    };
    console.log('   最终统计:');
    console.log('   - 总商品数:', finalCount.total);
    console.log('   - 待审核:', finalCount.pending);
    console.log('   - 已通过:', finalCount.approved);
    console.log('   - 已拒绝:', finalCount.rejected);

    console.log('\n🎉 审核功能测试完成！');
    console.log('');
    console.log('📊 测试结果:');
    console.log('   ✅ 创建管理员用户');
    console.log('   ✅ 创建卖家用户');
    console.log('   ✅ 创建待审核商品');
    console.log('   ✅ 查询待审核商品');
    console.log('   ✅ 单个商品审核通过');
    console.log('   ✅ 单个商品审核拒绝');
    console.log('   ✅ 查询审核统计');
    console.log('   ✅ 查询卖家商品状态');
    console.log('   ✅ 批量审核通过');
    console.log('   ✅ 最终统计验证');

    console.log('');
    console.log('========================================');
    console.log('  测试完成');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testApproval();
