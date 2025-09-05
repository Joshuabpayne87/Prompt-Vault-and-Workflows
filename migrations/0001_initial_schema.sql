-- Initial database schema for Vault of Prompts

-- Categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vault items table (prompts, workflows, frameworks)
CREATE TABLE vault_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('prompt', 'workflow', 'framework')),
    category_id INTEGER,
    author TEXT DEFAULT 'Joshua Payne',
    difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Ratings table for tracking individual ratings
CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    user_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES vault_items(id) ON DELETE CASCADE
);

-- Usage analytics table
CREATE TABLE usage_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('view', 'copy', 'rate')),
    user_ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES vault_items(id) ON DELETE CASCADE
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE vault_search USING fts5(
    title, 
    description, 
    content, 
    content=vault_items, 
    content_rowid=id
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER vault_items_fts_insert AFTER INSERT ON vault_items BEGIN
    INSERT INTO vault_search(rowid, title, description, content) 
    VALUES (new.id, new.title, new.description, new.content);
END;

CREATE TRIGGER vault_items_fts_delete AFTER DELETE ON vault_items BEGIN
    DELETE FROM vault_search WHERE rowid = old.id;
END;

CREATE TRIGGER vault_items_fts_update AFTER UPDATE ON vault_items BEGIN
    DELETE FROM vault_search WHERE rowid = old.id;
    INSERT INTO vault_search(rowid, title, description, content) 
    VALUES (new.id, new.title, new.description, new.content);
END;

-- Insert default categories
INSERT OR IGNORE INTO categories (name, description, color) VALUES 
('Digital Marketing', 'Marketing strategies and campaigns', '#3B82F6'),
('Business Strategy', 'Business planning and strategy development', '#10B981'),
('Content Creation', 'Content writing and creative processes', '#8B5CF6'),
('Sales & Growth', 'Sales strategies and growth hacking', '#F59E0B'),
('Leadership', 'Leadership and management frameworks', '#EF4444'),
('Technology', 'Technical guides and development', '#06B6D4'),
('Analytics', 'Data analysis and reporting', '#84CC16'),
('Customer Success', 'Customer service and success strategies', '#F97316'),
('Product Management', 'Product development and management', '#EC4899'),
('General', 'General purpose prompts and workflows', '#6B7280');

-- Create indexes for better performance
CREATE INDEX idx_vault_items_type ON vault_items(type);
CREATE INDEX idx_vault_items_category ON vault_items(category_id);
CREATE INDEX idx_vault_items_featured ON vault_items(is_featured);
CREATE INDEX idx_vault_items_created ON vault_items(created_at);
CREATE INDEX idx_ratings_item ON ratings(item_id);
CREATE INDEX idx_analytics_item ON usage_analytics(item_id);
CREATE INDEX idx_analytics_action ON usage_analytics(action);