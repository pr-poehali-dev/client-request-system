-- Таблица квартальных периодов сбора заявок
CREATE TABLE quarterly_periods (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  quarter INT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  collection_start_date DATE NOT NULL,
  collection_end_date DATE,
  quarter_start_date DATE NOT NULL,
  quarter_end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, quarter)
);

-- Добавляем связь заявок с периодами и статус блокировки
ALTER TABLE orders 
  ADD COLUMN period_id INT REFERENCES quarterly_periods(id),
  ADD COLUMN is_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN approved_at TIMESTAMP,
  ADD COLUMN approved_by INT REFERENCES clients(id);

-- Индексы для быстрого поиска
CREATE INDEX idx_periods_status ON quarterly_periods(status);
CREATE INDEX idx_periods_dates ON quarterly_periods(collection_start_date, collection_end_date);
CREATE INDEX idx_orders_period ON orders(period_id);
CREATE INDEX idx_orders_locked ON orders(is_locked);

-- Вставляем текущий период (Q1 2026)
INSERT INTO quarterly_periods (year, quarter, collection_start_date, quarter_start_date, quarter_end_date, status)
VALUES 
  (2026, 1, '2025-12-12', '2026-01-01', '2026-03-31', 'open');

-- Комментарии
COMMENT ON TABLE quarterly_periods IS 'Квартальные периоды сбора заявок';
COMMENT ON COLUMN quarterly_periods.collection_start_date IS 'Дата открытия приёма заявок (за 20 дней до начала квартала)';
COMMENT ON COLUMN quarterly_periods.collection_end_date IS 'Дата закрытия приёма заявок (когда администратор закрывает сбор)';
COMMENT ON COLUMN quarterly_periods.status IS 'Статус: upcoming (предстоящий), open (идёт сбор), closed (сбор завершён)';
COMMENT ON COLUMN orders.is_locked IS 'Заявка заблокирована после одобрения/закрытия периода';
COMMENT ON COLUMN orders.approved_at IS 'Дата и время одобрения заявки';