-- エアコン設置作業支援Chatbot データベーススキーマ
-- PostgreSQL 15+

-- UUIDエクステンションを有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'manager', 'admin')),
    license_number VARCHAR(50), -- 電気工事士免状番号
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 作業案件テーブル
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    address TEXT NOT NULL,
    building_type VARCHAR(50), -- 戸建/マンション/店舗等
    model VARCHAR(50) NOT NULL, -- エアコン機種
    quantity INTEGER NOT NULL DEFAULT 1,
    scheduled_date DATE NOT NULL,
    worker_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 作業報告テーブル
CREATE TABLE work_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    work_duration DECIMAL(4,2), -- 作業時間（時間単位）
    work_content TEXT, -- 作業内容
    special_notes TEXT, -- 特記事項
    customer_signature_url TEXT, -- お客様サインのURL
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 施工写真テーブル
CREATE TABLE work_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_report_id UUID REFERENCES work_reports(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL, -- S3 URL等
    photo_type VARCHAR(20) NOT NULL CHECK (photo_type IN ('before', 'during', 'after', 'trouble')),
    caption TEXT,
    taken_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 使用部材テーブル
CREATE TABLE used_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_report_id UUID REFERENCES work_reports(id) ON DELETE CASCADE,
    material_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- m/個/本/セット等
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 作業工程記録テーブル
CREATE TABLE work_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_report_id UUID REFERENCES work_reports(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL, -- 工程の順序
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 対話履歴テーブル
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_work_orders_worker_id ON work_orders(worker_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_scheduled_date ON work_orders(scheduled_date);
CREATE INDEX idx_work_reports_work_order_id ON work_reports(work_order_id);
CREATE INDEX idx_work_photos_work_report_id ON work_photos(work_report_id);
CREATE INDEX idx_used_materials_work_report_id ON used_materials(work_report_id);
CREATE INDEX idx_work_steps_work_report_id ON work_steps(work_report_id);
CREATE INDEX idx_chat_history_work_order_id ON chat_history(work_order_id);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_reports_updated_at BEFORE UPDATE ON work_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ投入
INSERT INTO users (email, password_hash, name, role, license_number) VALUES
('tanaka@example.com', 'hashed_password', '田中一郎', 'worker', '第二種-12345'),
('suzuki@example.com', 'hashed_password', '鈴木花子', 'manager', NULL);

INSERT INTO work_orders (customer_name, customer_phone, address, building_type, model, quantity, scheduled_date, worker_id, status) VALUES
('山田太郎', '03-1234-5678', '東京都新宿区西新宿1-1-1 203号室', 'マンション', 'CS-X400D2', 1, CURRENT_DATE, (SELECT id FROM users WHERE email = 'tanaka@example.com'), 'in_progress'),
('佐藤花子', '03-9876-5432', '東京都渋谷区渋谷2-2-2', '戸建', 'AN40ZRP', 2, CURRENT_DATE + INTERVAL '1 day', (SELECT id FROM users WHERE email = 'tanaka@example.com'), 'scheduled');
