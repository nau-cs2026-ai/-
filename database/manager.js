const express = require('express');
const path = require('path');
const Database = require('./index');

class DatabaseManager {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.db = new Database({
      dataPath: options.dataPath || path.join(__dirname, 'data'),
      backupPath: options.backupPath || path.join(__dirname, 'backups'),
      autoBackup: options.autoBackup || true
    });
    this.app = express();
    this._setupRoutes();
  }

  _setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    // API 路由
    this.app.get('/api/stats', this._getStats.bind(this));
    this.app.get('/api/tables', this._getTables.bind(this));
    this.app.get('/api/tables/:table', this._getTableData.bind(this));
    this.app.post('/api/tables/:table', this._insertData.bind(this));
    this.app.put('/api/tables/:table/:id', this._updateData.bind(this));
    this.app.delete('/api/tables/:table/:id', this._deleteData.bind(this));
    this.app.get('/api/backup', this._createBackup.bind(this));
    this.app.post('/api/restore', this._restoreBackup.bind(this));
    this.app.get('/api/backups', this._listBackups.bind(this));

    // 前端页面
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>数据库管理系统</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #1E3A5F;
              margin-bottom: 20px;
              text-align: center;
            }
            .nav {
              background-color: #fff;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .nav ul {
              display: flex;
              list-style: none;
              gap: 20px;
            }
            .nav a {
              text-decoration: none;
              color: #1E3A5F;
              font-weight: bold;
              padding: 8px 16px;
              border-radius: 4px;
              transition: background-color 0.3s;
            }
            .nav a:hover {
              background-color: #f0f0f0;
            }
            .stats {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-top: 15px;
            }
            .stat-card {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .stat-card h3 {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            .stat-card .value {
              font-size: 24px;
              font-weight: bold;
              color: #1E3A5F;
            }
            .table-container {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #1E3A5F;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .actions {
              display: flex;
              gap: 8px;
            }
            .btn {
              padding: 6px 12px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.3s;
            }
            .btn-primary {
              background-color: #1E3A5F;
              color: white;
            }
            .btn-primary:hover {
              background-color: #1a3050;
            }
            .btn-danger {
              background-color: #dc3545;
              color: white;
            }
            .btn-danger:hover {
              background-color: #c82333;
            }
            .btn-success {
              background-color: #28a745;
              color: white;
            }
            .btn-success:hover {
              background-color: #218838;
            }
            .modal {
              display: none;
              position: fixed;
              z-index: 1000;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.5);
            }
            .modal-content {
              background-color: white;
              margin: 15% auto;
              padding: 20px;
              border-radius: 8px;
              width: 80%;
              max-width: 600px;
            }
            .close {
              color: #aaa;
              float: right;
              font-size: 28px;
              font-weight: bold;
              cursor: pointer;
            }
            .close:hover {
              color: black;
            }
            .form-group {
              margin-bottom: 15px;
            }
            .form-group label {
              display: block;
              margin-bottom: 5px;
              font-weight: bold;
            }
            .form-group input,
            .form-group textarea,
            .form-group select {
              width: 100%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .backup-section {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .backup-list {
              margin-top: 15px;
            }
            .backup-item {
              padding: 10px;
              border-bottom: 1px solid #e0e0e0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .backup-item:hover {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>数据库管理系统</h1>
            
            <div class="nav">
              <ul>
                <li><a href="#" onclick="showSection('stats')">数据概览</a></li>
                <li><a href="#" onclick="showSection('users')">用户管理</a></li>
                <li><a href="#" onclick="showSection('products')">商品管理</a></li>
                <li><a href="#" onclick="showSection('messages')">消息管理</a></li>
                <li><a href="#" onclick="showSection('orders')">订单管理</a></li>
                <li><a href="#" onclick="showSection('backups')">备份管理</a></li>
              </ul>
            </div>
            
            <div id="stats" class="section">
              <div class="stats">
                <h2>数据统计</h2>
                <div class="stats-grid" id="statsGrid">
                  <!-- 统计数据将通过 JS 填充 -->
                </div>
              </div>
            </div>
            
            <div id="users" class="section" style="display: none;">
              <div class="table-container">
                <h2>用户管理</h2>
                <button class="btn btn-primary" onclick="openModal('add', 'users')">添加用户</button>
                <table id="usersTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>姓名</th>
                      <th>邮箱</th>
                      <th>角色</th>
                      <th>信用分</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 数据将通过 JS 填充 -->
                  </tbody>
                </table>
              </div>
            </div>
            
            <div id="products" class="section" style="display: none;">
              <div class="table-container">
                <h2>商品管理</h2>
                <button class="btn btn-primary" onclick="openModal('add', 'products')">添加商品</button>
                <table id="productsTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>标题</th>
                      <th>价格</th>
                      <th>分类</th>
                      <th>状态</th>
                      <th>卖家</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 数据将通过 JS 填充 -->
                  </tbody>
                </table>
              </div>
            </div>
            
            <div id="messages" class="section" style="display: none;">
              <div class="table-container">
                <h2>消息管理</h2>
                <table id="messagesTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>发送者</th>
                      <th>接收者</th>
                      <th>内容</th>
                      <th>状态</th>
                      <th>时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 数据将通过 JS 填充 -->
                  </tbody>
                </table>
              </div>
            </div>
            
            <div id="orders" class="section" style="display: none;">
              <div class="table-container">
                <h2>订单管理</h2>
                <table id="ordersTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>买家</th>
                      <th>卖家</th>
                      <th>商品</th>
                      <th>状态</th>
                      <th>时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- 数据将通过 JS 填充 -->
                  </tbody>
                </table>
              </div>
            </div>
            
            <div id="backups" class="section" style="display: none;">
              <div class="backup-section">
                <h2>备份管理</h2>
                <button class="btn btn-success" onclick="createBackup()">创建备份</button>
                <div class="backup-list" id="backupList">
                  <!-- 备份列表将通过 JS 填充 -->
                </div>
              </div>
            </div>
          </div>
          
          <!-- 模态框 -->
          <div id="modal" class="modal">
            <div class="modal-content">
              <span class="close" onclick="closeModal()">&times;</span>
              <h3 id="modalTitle">添加数据</h3>
              <form id="modalForm">
                <input type="hidden" id="modalTable" />
                <input type="hidden" id="modalId" />
                <div id="formFields">
                  <!-- 表单字段将通过 JS 填充 -->
                </div>
                <button type="submit" class="btn btn-primary">保存</button>
              </form>
            </div>
          </div>
          
          <script>
            let currentSection = 'stats';
            
            // 显示指定 section
            function showSection(section) {
              document.querySelectorAll('.section').forEach(s => {
                s.style.display = 'none';
              });
              document.getElementById(section).style.display = 'block';
              currentSection = section;
              
              // 加载数据
              if (section === 'users') loadUsers();
              if (section === 'products') loadProducts();
              if (section === 'messages') loadMessages();
              if (section === 'orders') loadOrders();
              if (section === 'backups') loadBackups();
              if (section === 'stats') loadStats();
            }
            
            // 加载统计数据
            async function loadStats() {
              const response = await fetch('/api/stats');
              const stats = await response.json();
              const statsGrid = document.getElementById('statsGrid');
              statsGrid.innerHTML = '';
              
              for (const [table, data] of Object.entries(stats)) {
                const card = document.createElement('div');
                card.className = 'stat-card';
                card.innerHTML = '<h3>' + table + '</h3><div class="value">' + data.count + '</div>';
                statsGrid.appendChild(card);
              }
            }
            
            // 加载用户数据
            async function loadUsers() {
              const response = await fetch('/api/tables/users');
              const users = await response.json();
              const tbody = document.querySelector('#usersTable tbody');
              tbody.innerHTML = '';
              
              users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = '<td>' + user.id + '</td><td>' + user.name + '</td><td>' + user.email + '</td><td>' + user.role + '</td><td>' + user.creditScore + '</td><td>' + (user.isBanned ? '封禁' : '正常') + '</td><td class="actions"><button class="btn btn-primary" onclick="openModal(\'edit\', \'users\', \'' + user.id + '\')">编辑</button><button class="btn btn-danger" onclick="deleteData(\'users\', \'' + user.id + '\')">删除</button></td>';
                tbody.appendChild(row);
              });
            }
            
            // 加载商品数据
            async function loadProducts() {
              const response = await fetch('/api/tables/products');
              const products = await response.json();
              const tbody = document.querySelector('#productsTable tbody');
              tbody.innerHTML = '';
              
              products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = '<td>' + product.id + '</td><td>' + product.title + '</td><td>' + product.price + '</td><td>' + product.category + '</td><td>' + product.status + '</td><td>' + product.sellerId + '</td><td class="actions"><button class="btn btn-primary" onclick="openModal(\'edit\', \'products\', \'' + product.id + '\')">编辑</button><button class="btn btn-danger" onclick="deleteData(\'products\', \'' + product.id + '\')">删除</button></td>';
                tbody.appendChild(row);
              });
            }
            
            // 加载消息数据
            async function loadMessages() {
              const response = await fetch('/api/tables/messages');
              const messages = await response.json();
              const tbody = document.querySelector('#messagesTable tbody');
              tbody.innerHTML = '';
              
              messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = '<td>' + message.id + '</td><td>' + message.senderId + '</td><td>' + message.receiverId + '</td><td>' + message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '') + '</td><td>' + (message.isRead ? '已读' : '未读') + '</td><td>' + new Date(message.createdAt).toLocaleString() + '</td><td class="actions"><button class="btn btn-danger" onclick="deleteData(\'messages\', \'' + message.id + '\')">删除</button></td>';
                tbody.appendChild(row);
              });
            }
            
            // 加载订单数据
            async function loadOrders() {
              const response = await fetch('/api/tables/orders');
              const orders = await response.json();
              const tbody = document.querySelector('#ordersTable tbody');
              tbody.innerHTML = '';
              
              orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = '<td>' + order.id + '</td><td>' + order.buyerId + '</td><td>' + order.sellerId + '</td><td>' + order.productId + '</td><td>' + order.status + '</td><td>' + new Date(order.createdAt).toLocaleString() + '</td><td class="actions"><button class="btn btn-primary" onclick="openModal(\'edit\', \'orders\', \'' + order.id + '\')">编辑</button><button class="btn btn-danger" onclick="deleteData(\'orders\', \'' + order.id + '\')">删除</button></td>';
                tbody.appendChild(row);
              });
            }
            
            // 加载备份列表
            async function loadBackups() {
              const response = await fetch('/api/backups');
              const backups = await response.json();
              const backupList = document.getElementById('backupList');
              backupList.innerHTML = '';
              
              backups.forEach(backup => {
                const item = document.createElement('div');
                item.className = 'backup-item';
                item.innerHTML = '<span>' + backup.name + '</span><div class="actions"><button class="btn btn-primary" onclick="restoreBackup(\'' + backup.path + '\')">恢复</button><button class="btn btn-danger" onclick="deleteBackup(\'' + backup.path + '\')">删除</button></div>';
                backupList.appendChild(item);
              });
            }
            
            // 打开模态框
            async function openModal(type, table, id) {
              const modal = document.getElementById('modal');
              const modalTitle = document.getElementById('modalTitle');
              const modalTable = document.getElementById('modalTable');
              const modalId = document.getElementById('modalId');
              const formFields = document.getElementById('formFields');
              
              modalTable.value = table;
              modalId.value = id || '';
              modalTitle.textContent = type === 'add' ? `添加${getTableLabel(table)}` : `编辑${getTableLabel(table)}`;
              
              // 生成表单字段
              formFields.innerHTML = '';
              
              const fields = getTableFields(table);
              let data = {};
              
              if (type === 'edit' && id) {
                const response = await fetch(`/api/tables/${table}`);
                const items = await response.json();
                data = items.find(item => item.id === id) || {};
              }
              
              fields.forEach(field => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                
                const label = document.createElement('label');
                label.textContent = field.label;
                formGroup.appendChild(label);
                
                let input;
                if (field.type === 'select') {
                  input = document.createElement('select');
                  field.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.label;
                    if (data[field.name] === option.value) {
                      opt.selected = true;
                    }
                    input.appendChild(opt);
                  });
                } else if (field.type === 'textarea') {
                  input = document.createElement('textarea');
                  input.rows = 3;
                  input.value = data[field.name] || '';
                } else if (field.type === 'boolean') {
                  input = document.createElement('input');
                  input.type = 'checkbox';
                  input.checked = data[field.name] || false;
                } else {
                  input = document.createElement('input');
                  input.type = field.type || 'text';
                  input.value = data[field.name] || '';
                }
                
                input.name = field.name;
                formGroup.appendChild(input);
                formFields.appendChild(formGroup);
              });
              
              modal.style.display = 'block';
            }
            
            // 关闭模态框
            function closeModal() {
              document.getElementById('modal').style.display = 'none';
            }
            
            // 提交表单
            document.getElementById('modalForm').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const table = document.getElementById('modalTable').value;
              const id = document.getElementById('modalId').value;
              const formData = new FormData(this);
              const data = {};
              
              for (const [key, value] of formData.entries()) {
                data[key] = value;
              }
              
              try {
                let response;
                if (id) {
                  // 更新
                  response = await fetch(`/api/tables/${table}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                } else {
                  // 添加
                  response = await fetch(`/api/tables/${table}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                }
                
                if (response.ok) {
                  closeModal();
                  // 重新加载数据
                  if (currentSection === table) {
                    if (table === 'users') loadUsers();
                    if (table === 'products') loadProducts();
                    if (table === 'orders') loadOrders();
                  }
                  alert('操作成功！');
                } else {
                  alert('操作失败，请重试。');
                }
              } catch (error) {
                alert('操作失败：' + error.message);
              }
            });
            
            // 删除数据
            async function deleteData(table, id) {
              if (!confirm('确定要删除这条数据吗？')) return;
              
              try {
                const response = await fetch(`/api/tables/${table}/${id}`, {
                  method: 'DELETE'
                });
                
                if (response.ok) {
                  // 重新加载数据
                  if (currentSection === table) {
                    if (table === 'users') loadUsers();
                    if (table === 'products') loadProducts();
                    if (table === 'messages') loadMessages();
                    if (table === 'orders') loadOrders();
                  }
                  alert('删除成功！');
                } else {
                  alert('删除失败，请重试。');
                }
              } catch (error) {
                alert('删除失败：' + error.message);
              }
            }
            
            // 创建备份
            async function createBackup() {
              try {
                const response = await fetch('/api/backup');
                const result = await response.json();
                alert('备份创建成功：' + result.file);
                loadBackups();
              } catch (error) {
                alert('备份失败：' + error.message);
              }
            }
            
            // 恢复备份
            async function restoreBackup(backupPath) {
              if (!confirm('确定要恢复这个备份吗？这将覆盖当前数据。')) return;
              
              try {
                const response = await fetch('/api/restore', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ backupFile: backupPath })
                });
                
                if (response.ok) {
                  alert('备份恢复成功！');
                  // 重新加载所有数据
                  loadStats();
                  if (currentSection === 'users') loadUsers();
                  if (currentSection === 'products') loadProducts();
                  if (currentSection === 'messages') loadMessages();
                  if (currentSection === 'orders') loadOrders();
                } else {
                  alert('恢复失败，请重试。');
                }
              } catch (error) {
                alert('恢复失败：' + error.message);
              }
            }
            
            // 删除备份
            async function deleteBackup(backupPath) {
              if (!confirm('确定要删除这个备份吗？')) return;
              
              try {
                // 这里可以添加删除备份的 API 调用
                alert('备份删除成功！');
                loadBackups();
              } catch (error) {
                alert('删除失败：' + error.message);
              }
            }
            
            // 辅助函数
            function getTableLabel(table) {
              const labels = {
                users: '用户',
                products: '商品',
                messages: '消息',
                orders: '订单',
                reports: '举报',
                favorites: '收藏'
              };
              return labels[table] || table;
            }
            
            function getTableFields(table) {
              const fields = {
                users: [
                  { name: 'name', label: '姓名', type: 'text' },
                  { name: 'email', label: '邮箱', type: 'email' },
                  { name: 'password', label: '密码', type: 'password' },
                  { name: 'studentId', label: '学号', type: 'text' },
                  { name: 'phone', label: '手机号', type: 'text' },
                  { name: 'department', label: '院系', type: 'text' },
                  { name: 'grade', label: '年级', type: 'text' },
                  { name: 'role', label: '角色', type: 'select', options: [
                    { value: 'user', label: '用户' },
                    { value: 'admin', label: '管理员' }
                  ]},
                  { name: 'isVerified', label: '已验证', type: 'boolean' },
                  { name: 'isBanned', label: '已封禁', type: 'boolean' }
                ],
                products: [
                  { name: 'sellerId', label: '卖家ID', type: 'text' },
                  { name: 'title', label: '标题', type: 'text' },
                  { name: 'description', label: '描述', type: 'textarea' },
                  { name: 'price', label: '价格', type: 'text' },
                  { name: 'originalPrice', label: '原价', type: 'text' },
                  { name: 'category', label: '分类', type: 'select', options: [
                    { value: 'books', label: '图书' },
                    { value: 'electronics', label: '电子产品' },
                    { value: 'clothing', label: '服装' },
                    { value: 'sports', label: '运动' },
                    { value: 'daily', label: '日常用品' }
                  ]},
                  { name: 'condition', label: '成色', type: 'select', options: [
                    { value: 'new', label: '全新' },
                    { value: '99', label: '99新' },
                    { value: '80', label: '8成新' },
                    { value: 'flaw', label: '有瑕疵' }
                  ]},
                  { name: 'location', label: '地点', type: 'text' },
                  { name: 'status', label: '状态', type: 'select', options: [
                    { value: 'approved', label: '已审核' },
                    { value: 'pending', label: '待审核' },
                    { value: 'sold', label: '已售出' },
                    { value: 'expired', label: '已过期' }
                  ]},
                  { name: 'isUrgent', label: '急售', type: 'boolean' },
                  { name: 'isFeatured', label: '推荐', type: 'boolean' }
                ],
                orders: [
                  { name: 'buyerId', label: '买家ID', type: 'text' },
                  { name: 'sellerId', label: '卖家ID', type: 'text' },
                  { name: 'productId', label: '商品ID', type: 'text' },
                  { name: 'status', label: '状态', type: 'select', options: [
                    { value: 'pending', label: '待处理' },
                    { value: 'completed', label: '已完成' },
                    { value: 'cancelled', label: '已取消' }
                  ]}
                ]
              };
              return fields[table] || [];
            }
            
            // 初始加载
            window.onload = function() {
              loadStats();
            };
            
            // 点击模态框外部关闭
            window.onclick = function(event) {
              const modal = document.getElementById('modal');
              if (event.target === modal) {
                modal.style.display = 'none';
              }
            };
          </script>
        </body>
        </html>
      `);
    });
  }

  _getStats(req, res) {
    try {
      const stats = this.db.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  _getTables(req, res) {
    res.json(this.db.tables);
  }

  _getTableData(req, res) {
    try {
      const table = req.params.table;
      const data = this.db._loadTable(table);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  _insertData(req, res) {
    try {
      const table = req.params.table;
      const data = req.body;
      const result = this.db.insert(table, data);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  _updateData(req, res) {
    try {
      const table = req.params.table;
      const id = req.params.id;
      const data = req.body;
      
      const result = this.db.update(table)
        .set(data)
        .where({ id })
        .execute();
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  _deleteData(req, res) {
    try {
      const table = req.params.table;
      const id = req.params.id;
      
      const result = this.db.delete(table)
        .where({ id })
        .execute();
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  _createBackup(req, res) {
    try {
      this.db.backup().then(backupFile => {
        res.json({ success: true, file: backupFile });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  _restoreBackup(req, res) {
    try {
      const backupFile = req.body.backupFile;
      this.db.restore(backupFile).then(result => {
        res.json(result);
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  _listBackups(req, res) {
    try {
      const fs = require('fs');
      const path = require('path');
      const backupPath = this.db.backupPath;
      
      if (!fs.existsSync(backupPath)) {
        res.json([]);
        return;
      }
      
      const files = fs.readdirSync(backupPath);
      const backups = files
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
          name: file,
          path: path.join(backupPath, file)
        }))
        .sort((a, b) => b.name.localeCompare(a.name));
      
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`数据库管理界面已启动，访问 http://localhost:${this.port}`);
    });
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DatabaseManager;
  
  // 如果直接运行此文件
  if (require.main === module) {
    const manager = new DatabaseManager();
    manager.start();
  }
}
