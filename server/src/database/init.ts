import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Tabela de usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'vendedor')),
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de categorias
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de produtos
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE,
      category_id INTEGER,
      cost_price REAL NOT NULL,
      sale_price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 5,
      description TEXT,
      image_url TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Tabela de vendas
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      discount REAL DEFAULT 0,
      final_total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_received REAL,
      change_amount REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tabela de itens da venda
  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Índices para melhor performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
  `);

  // Trigger para atualizar estoque após venda
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_stock_after_sale
    AFTER INSERT ON sale_items
    BEGIN
      UPDATE products 
      SET stock = stock - NEW.quantity,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.product_id;
    END;
  `);

  // Criar usuário admin padrão se não existir
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hashedPassword, 'Administrador', 'admin');
    
    console.log('✓ Usuário admin criado (username: admin, senha: admin123)');
  }

  // Criar categorias padrão
  const categoriesExist = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (categoriesExist.count === 0) {
    const categories = [
      ['Papelaria', 'Produtos de papelaria em geral'],
      ['Presentes', 'Artigos para presentes'],
      ['Escolar', 'Material escolar'],
      ['Escritório', 'Material de escritório'],
      ['Festas', 'Artigos para festas'],
      ['Brinquedos', 'Brinquedos diversos']
    ];

    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    
    for (const [name, description] of categories) {
      insertCategory.run(name, description);
    }
    
    console.log('✓ Categorias padrão criadas');
  }

  console.log('✓ Banco de dados inicializado com sucesso!');
}

export default db;
