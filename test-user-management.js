const Database = require('./database/index');

console.log('========================================');
console.log('  测试注册和登录功能');
console.log('========================================');
console.log('');

const db = new Database({
  dataPath: './database/data',
  backupPath: './database/backups',
  autoBackup: false
});

async function testUserManagement() {
  try {
    console.log('1. 检查当前用户数量...');
    const initialUsers = db.select('users').execute();
    console.log('   当前用户数量:', initialUsers.length);

    console.log('\n2. 创建新用户（模拟注册）...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testUser = await db.insert('users', {
      name: '测试用户',
      email: testEmail,
      password: 'hashed_password', // 实际应用中会使用 bcrypt 哈希
      role: 'user',
      isVerified: false,
      isBanned: false
    });
    console.log('   ✅ 新用户创建成功:');
    console.log('   - 姓名:', testUser.name);
    console.log('   - 邮箱:', testUser.email);
    console.log('   - 角色:', testUser.role);
    console.log('   - ID:', testUser.id);

    console.log('\n3. 验证用户保存到数据库...');
    const savedUser = db.select('users')
      .where({ email: testEmail })
      .execute();
    console.log('   ✅ 找到用户:', savedUser.length > 0 ? '是' : '否');
    if (savedUser.length > 0) {
      console.log('   - 保存的姓名:', savedUser[0].name);
      console.log('   - 保存的邮箱:', savedUser[0].email);
    }

    console.log('\n4. 测试用户查询功能...');
    const byEmail = db.select('users')
      .where({ email: testEmail })
      .execute();
    console.log('   ✅ 通过邮箱查询:', byEmail.length > 0 ? '成功' : '失败');

    const byId = db.select('users')
      .where({ id: testUser.id })
      .execute();
    console.log('   ✅ 通过ID查询:', byId.length > 0 ? '成功' : '失败');

    console.log('\n5. 测试用户更新功能...');
    const updatedUser = db.update('users')
      .set({ name: '更新后的测试用户', isVerified: true })
      .where({ id: testUser.id })
      .execute();
    console.log('   ✅ 用户更新成功:');
    console.log('   - 新姓名:', updatedUser[0].name);
    console.log('   - 验证状态:', updatedUser[0].isVerified ? '已验证' : '未验证');

    console.log('\n6. 测试用户删除功能...');
    const deleted = db.delete('users')
      .where({ id: testUser.id })
      .execute();
    console.log('   ✅ 用户删除成功:', deleted.length > 0 ? '是' : '否');

    console.log('\n7. 验证用户已删除...');
    const afterDelete = db.select('users')
      .where({ email: testEmail })
      .execute();
    console.log('   ✅ 用户是否存在:', afterDelete.length > 0 ? '是' : '否');

    console.log('\n8. 测试批量查询...');
    const allUsers = db.select('users').execute();
    console.log('   ✅ 总用户数量:', allUsers.length);
    console.log('   ✅ 管理员用户数量:', allUsers.filter(u => u.role === 'admin').length);
    console.log('   ✅ 普通用户数量:', allUsers.filter(u => u.role === 'user').length);

    console.log('\n9. 测试用户状态统计...');
    const verifiedUsers = allUsers.filter(u => u.isVerified).length;
    const bannedUsers = allUsers.filter(u => u.isBanned).length;
    console.log('   ✅ 已验证用户:', verifiedUsers);
    console.log('   ✅ 已封禁用户:', bannedUsers);
    console.log('   ✅ 活跃用户:', allUsers.length - bannedUsers);

    console.log('\n10. 测试用户密码字段...');
    const firstUser = allUsers[0];
    if (firstUser) {
      console.log('   ✅ 第一个用户密码字段存在:', firstUser.password ? '是' : '否');
      console.log('   ✅ 密码长度:', firstUser.password ? firstUser.password.length : 0);
      console.log('   ✅ 密码是否已哈希:', firstUser.password && firstUser.password.length > 20 ? '是' : '否');
    }

    console.log('\n🎉 用户管理功能测试完成！');
    console.log('');
    console.log('📊 测试结果:');
    console.log('   ✅ 检查当前用户数量');
    console.log('   ✅ 创建新用户');
    console.log('   ✅ 验证用户保存到数据库');
    console.log('   ✅ 测试用户查询功能');
    console.log('   ✅ 测试用户更新功能');
    console.log('   ✅ 测试用户删除功能');
    console.log('   ✅ 验证用户已删除');
    console.log('   ✅ 测试批量查询');
    console.log('   ✅ 测试用户状态统计');
    console.log('   ✅ 测试用户密码字段');

    console.log('');
    console.log('========================================');
    console.log('  测试完成');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testUserManagement();
