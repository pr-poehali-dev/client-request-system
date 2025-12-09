-- Создание таблицы клиентов
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    legal_entity VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    budget_limit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    budget_used DECIMAL(12, 2) NOT NULL DEFAULT 0,
    role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы категорий товаров
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'шт',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заявок
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    total DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы позиций заявок
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых категорий
INSERT INTO categories (name) VALUES 
    ('Офисные товары'),
    ('Техника'),
    ('Мебель')
ON CONFLICT DO NOTHING;

-- Вставка тестовых клиентов
INSERT INTO clients (name, email, legal_entity, address, budget_limit, budget_used, role) VALUES
    ('Администратор', 'admin@example.com', 'RequestHub', 'г. Москва, ул. Главная, д. 1', 0, 0, 'admin'),
    ('ООО "Альфа"', 'alpha@example.com', 'ООО "Альфа Групп"', 'г. Москва, ул. Ленина, д. 10', 200000, 50000, 'client'),
    ('ИП Петров', 'petrov@example.com', 'ИП Петров Иван Сергеевич', 'г. Санкт-Петербург, Невский пр., д. 25', 150000, 0, 'client'),
    ('ООО "Бета"', 'beta@example.com', 'ООО "Бета Технолоджи"', 'г. Москва, ул. Тверская, д. 5', 300000, 100000, 'client')
ON CONFLICT DO NOTHING;

-- Вставка тестовых товаров
INSERT INTO products (name, category_id, price, stock, unit) VALUES
    ('Офисная бумага A4', 1, 350, 500, 'уп'),
    ('Ручка шариковая синяя', 1, 15, 1000, 'шт'),
    ('Степлер металлический', 1, 450, 50, 'шт'),
    ('Маркер перманентный', 1, 85, 200, 'шт'),
    ('Папка-регистратор', 1, 180, 150, 'шт'),
    ('Блокнот А5', 1, 120, 300, 'шт'),
    ('Клей-карандаш', 1, 45, 400, 'шт'),
    ('Корректор ленточный', 1, 95, 250, 'шт')
ON CONFLICT DO NOTHING;