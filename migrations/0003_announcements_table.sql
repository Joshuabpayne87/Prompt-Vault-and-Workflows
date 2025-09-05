-- Announcements management system

-- Announcements table for dynamic banner content
CREATE TABLE announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    link_text TEXT DEFAULT 'Learn More',
    image_url TEXT,
    background_color TEXT DEFAULT 'yellow-400',
    text_color TEXT DEFAULT 'black',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default announcement (current TopAIToolbox banner)
INSERT INTO announcements (title, message, link_url, link_text, background_color, text_color, is_active, display_order) VALUES 
('🚀 NEW: 30 Professional Knowledge Bases Available', 'Join TopAIToolbox.app Community - Accelerate your productivity go from prompt to product in a community setting', 'https://www.topaitoolbox.app', 'Join Movement', 'yellow-400', 'black', TRUE, 1);

-- Create index for performance
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_order ON announcements(display_order);