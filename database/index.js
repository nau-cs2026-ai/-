const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor(options = {}) {
    this.dataPath = options.dataPath || path.join(__dirname, 'data');
    this.backupPath = options.backupPath || path.join(__dirname, 'backups');
    this.autoBackup = options.autoBackup || false;
    this.backupInterval = options.backupInterval || 24 * 60 * 60 * 1000; // 24小时
    
    this.tables = ['users', 'products', 'messages', 'orders', 'reports', 'favorites'];
    this.indexes = new Map();
    
    this._init();
  }

  _init() {
    // 确保目录存在
    this._ensureDirectories();
    
    // 初始化表结构
    this._initTables();
    
    // 初始化索引
    this._initIndexes();
    
    // 启动自动备份
    if (this.autoBackup) {
      this._startAutoBackup();
    }
  }

  _ensureDirectories() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  _initTables() {
    for (const table of this.tables) {
      const filePath = path.join(this.dataPath, `${table}.json`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    }
  }

  _initIndexes() {
    // 为常用字段创建索引
    this.indexes.set('users', { email: new Map() });
    this.indexes.set('products', { sellerId: new Map(), category: new Map() });
    this.indexes.set('messages', { senderId: new Map(), receiverId: new Map() });
    this.indexes.set('orders', { buyerId: new Map(), sellerId: new Map() });
    this.indexes.set('favorites', { userId: new Map(), productId: new Map() });
    
    // 构建初始索引
    for (const table of this.tables) {
      const data = this._loadTable(table);
      this._buildIndex(table, data);
    }
  }

  _buildIndex(table, data) {
    const tableIndexes = this.indexes.get(table);
    if (!tableIndexes) return;
    
    for (const field in tableIndexes) {
      const indexMap = new Map();
      for (const item of data) {
        if (item[field]) {
          const key = item[field];
          if (!indexMap.has(key)) {
            indexMap.set(key, []);
          }
          indexMap.get(key).push(item.id);
        }
      }
      tableIndexes[field] = indexMap;
    }
  }

  _loadTable(table) {
    const filePath = path.join(this.dataPath, `${table}.json`);
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading table ${table}:`, error);
      return [];
    }
  }

  _saveTable(table, data) {
    const filePath = path.join(this.dataPath, `${table}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      // 更新索引
      this._buildIndex(table, data);
    } catch (error) {
      console.error(`Error saving table ${table}:`, error);
      throw error;
    }
  }

  _startAutoBackup() {
    setInterval(() => {
      this.backup().catch(console.error);
    }, this.backupInterval);
  }

  async insert(table, data) {
    if (!this.tables.includes(table)) {
      throw new Error(`Table ${table} does not exist`);
    }

    const tableData = this._loadTable(table);
    const now = new Date().toISOString();
    
    const newItem = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      ...data
    };

    tableData.push(newItem);
    this._saveTable(table, tableData);
    
    return newItem;
  }

  select(table) {
    if (!this.tables.includes(table)) {
      throw new Error(`Table ${table} does not exist`);
    }

    return new QueryBuilder(this, table);
  }

  update(table) {
    if (!this.tables.includes(table)) {
      throw new Error(`Table ${table} does not exist`);
    }

    return new UpdateBuilder(this, table);
  }

  delete(table) {
    if (!this.tables.includes(table)) {
      throw new Error(`Table ${table} does not exist`);
    }

    return new DeleteBuilder(this, table);
  }

  async transaction(callback) {
    // 简单的内存事务实现
    const backups = new Map();
    
    // 创建备份
    for (const table of this.tables) {
      const data = this._loadTable(table);
      backups.set(table, JSON.parse(JSON.stringify(data)));
    }

    try {
      // 创建事务对象
      const tx = {
        insert: (table, data) => this.insert(table, data),
        select: (table) => this.select(table),
        update: (table) => this.update(table),
        delete: (table) => this.delete(table)
      };

      const result = await callback(tx);
      return result;
    } catch (error) {
      // 回滚
      for (const [table, data] of backups.entries()) {
        this._saveTable(table, data);
      }
      throw error;
    }
  }

  async backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `backup-${timestamp}.json`);
    
    const backupData = {};
    for (const table of this.tables) {
      backupData[table] = this._loadTable(table);
    }

    try {
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      return backupFile;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  async restore(backupFile) {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file ${backupFile} does not exist`);
    }

    try {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      for (const table of this.tables) {
        if (backupData[table]) {
          this._saveTable(table, backupData[table]);
        }
      }
      
      return { success: true, message: 'Backup restored successfully' };
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  getStats() {
    const stats = {};
    for (const table of this.tables) {
      const data = this._loadTable(table);
      stats[table] = {
        count: data.length,
        lastUpdated: data.length > 0 ? 
          Math.max(...data.map(item => new Date(item.updatedAt).getTime())) : 
          null
      };
    }
    return stats;
  }
}

class QueryBuilder {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.conditions = {};
    this.orderBy = null;
    this.limit = null;
    this.offset = 0;
  }

  where(conditions) {
    this.conditions = conditions;
    return this;
  }

  orderBy(options) {
    this.orderBy = options;
    return this;
  }

  limit(limit) {
    this.limit = limit;
    return this;
  }

  offset(offset) {
    this.offset = offset;
    return this;
  }

  execute() {
    let data = this.db._loadTable(this.table);
    
    // 应用条件
    if (Object.keys(this.conditions).length > 0) {
      data = data.filter(item => this._matchesConditions(item, this.conditions));
    }
    
    // 应用排序
    if (this.orderBy) {
      data.sort((a, b) => {
        const aVal = a[this.orderBy.field];
        const bVal = b[this.orderBy.field];
        
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        
        if (this.orderBy.direction === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }
    
    // 应用偏移和限制
    if (this.offset > 0) {
      data = data.slice(this.offset);
    }
    
    if (this.limit !== null) {
      data = data.slice(0, this.limit);
    }
    
    return data;
  }

  _matchesConditions(item, conditions) {
    for (const [field, value] of Object.entries(conditions)) {
      if (typeof value === 'object' && value !== null) {
        // 处理操作符
        if (!this._matchesOperator(item[field], value)) {
          return false;
        }
      } else if (item[field] !== value) {
        return false;
      }
    }
    return true;
  }

  _matchesOperator(value, operator) {
    if (operator.$eq !== undefined) {
      return value === operator.$eq;
    } else if (operator.$ne !== undefined) {
      return value !== operator.$ne;
    } else if (operator.$gt !== undefined) {
      return value > operator.$gt;
    } else if (operator.$gte !== undefined) {
      return value >= operator.$gte;
    } else if (operator.$lt !== undefined) {
      return value < operator.$lt;
    } else if (operator.$lte !== undefined) {
      return value <= operator.$lte;
    } else if (operator.$in !== undefined) {
      return operator.$in.includes(value);
    } else if (operator.$nin !== undefined) {
      return !operator.$nin.includes(value);
    } else if (operator.$like !== undefined) {
      const pattern = operator.$like.replace(/%/g, '.*');
      const regex = new RegExp(pattern, 'i');
      return regex.test(String(value));
    } else if (operator.$notLike !== undefined) {
      const pattern = operator.$notLike.replace(/%/g, '.*');
      const regex = new RegExp(pattern, 'i');
      return !regex.test(String(value));
    } else if (operator.$exists !== undefined) {
      return (value !== undefined && value !== null) === operator.$exists;
    } else if (operator.$and !== undefined) {
      return operator.$and.every(cond => this._matchesConditions(value, cond));
    } else if (operator.$or !== undefined) {
      return operator.$or.some(cond => this._matchesConditions(value, cond));
    }
    return true;
  }
}

class UpdateBuilder {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.data = {};
    this.conditions = {};
  }

  set(data) {
    this.data = data;
    return this;
  }

  where(conditions) {
    this.conditions = conditions;
    return this;
  }

  execute() {
    const data = this.db._loadTable(this.table);
    const updatedItems = [];
    const now = new Date().toISOString();
    
    for (let i = 0; i < data.length; i++) {
      if (this._matchesConditions(data[i], this.conditions)) {
        data[i] = {
          ...data[i],
          ...this.data,
          updatedAt: now
        };
        updatedItems.push(data[i]);
      }
    }
    
    this.db._saveTable(this.table, data);
    return updatedItems;
  }

  _matchesConditions(item, conditions) {
    const queryBuilder = new QueryBuilder(this.db, this.table);
    return queryBuilder._matchesConditions(item, conditions);
  }
}

class DeleteBuilder {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.conditions = {};
  }

  where(conditions) {
    this.conditions = conditions;
    return this;
  }

  execute() {
    const data = this.db._loadTable(this.table);
    const deletedItems = [];
    const newData = [];
    
    for (const item of data) {
      if (this._matchesConditions(item, this.conditions)) {
        deletedItems.push(item);
      } else {
        newData.push(item);
      }
    }
    
    this.db._saveTable(this.table, newData);
    return deletedItems;
  }

  _matchesConditions(item, conditions) {
    const queryBuilder = new QueryBuilder(this.db, this.table);
    return queryBuilder._matchesConditions(item, conditions);
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Database;
  module.exports.QueryBuilder = QueryBuilder;
  module.exports.UpdateBuilder = UpdateBuilder;
  module.exports.DeleteBuilder = DeleteBuilder;
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.Database = Database;
}
