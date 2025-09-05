import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { sign, verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = 'vault-secret-key-2024'

// Admin password - secure authentication
const ADMIN_PASSWORD = 'Prompts123'

// Helper function to create JWT token
async function createToken() {
  return await sign({ admin: true, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, JWT_SECRET)
}

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET)
    return payload.admin === true && payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

// Demo data fallback when database is not available
const demoData = {
  items: [
    {
      id: 1,
      title: "Strategic Planning Assistant",
      description: "A comprehensive prompt for developing strategic plans with AI assistance, covering analysis, goal setting, and implementation roadmaps.",
      content: "You are a senior strategic planning consultant...",
      type: "prompt",
      category: "Business",
      author: "Joshua Payne",
      difficulty: "advanced",
      rating: 4.8,
      usage_count: 25,
      is_featured: true,
      created_at: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      title: "Content Marketing Production System",
      description: "End-to-end workflow for creating, publishing, and optimizing content that drives real business results.",
      content: "# Content Marketing Production System...",
      type: "workflow",
      category: "Creative", 
      author: "Joshua Payne",
      difficulty: "intermediate",
      rating: 4.9,
      usage_count: 18,
      is_featured: true,
      created_at: "2024-01-16T10:00:00Z"
    },
    {
      id: 3,
      title: "OKR Goal Setting Framework",
      description: "A proven framework for setting and achieving specific, measurable, achievable, relevant, and time-bound goals.",
      content: "# OKR (Objectives & Key Results) Framework...",
      type: "framework",
      category: "Business",
      author: "Joshua Payne", 
      difficulty: "intermediate",
      rating: 4.7,
      usage_count: 32,
      is_featured: true,
      created_at: "2024-01-17T10:00:00Z"
    },
    {
      id: 4,
      title: "Life Coach GPT - Complete System",
      description: "Comprehensive system prompt for creating a life coaching GPT that provides personalized guidance and transformation support.",
      content: "You are an expert life coach with 15+ years of experience...",
      type: "prompt",
      category: "Custom GPTs",
      author: "Joshua Payne",
      difficulty: "advanced", 
      rating: 5.0,
      usage_count: 15,
      is_featured: true,
      created_at: "2024-01-18T10:00:00Z"
    },
    {
      id: 5,
      title: "Marketing Coach GPT - Digital Growth",
      description: "Expert system prompt for creating a marketing coaching GPT focused on digital marketing strategy and growth optimization.",
      content: "You are an elite digital marketing strategist...",
      type: "prompt", 
      category: "Custom GPTs",
      author: "Joshua Payne",
      difficulty: "advanced",
      rating: 4.9,
      usage_count: 22,
      is_featured: true,
      created_at: "2024-01-19T10:00:00Z"
    }
  ],
  categories: [
    { id: 1, name: "AI Prompts", description: "Effective prompts for AI models", color: "#8B5CF6" },
    { id: 2, name: "Workflows", description: "Step-by-step processes", color: "#10B981" },
    { id: 3, name: "Frameworks", description: "Structured approaches", color: "#F59E0B" },
    { id: 4, name: "Business", description: "Business strategy content", color: "#EF4444" },
    { id: 5, name: "Creative", description: "Creative processes", color: "#EC4899" },
    { id: 6, name: "Custom GPTs", description: "Custom GPT prompts", color: "#14B8A6" }
  ],
  tags: [
    { id: 1, name: "advanced" },
    { id: 2, name: "strategy" },
    { id: 3, name: "productivity" },
    { id: 4, name: "coaching" },
    { id: 5, name: "custom-gpt" }
  ]
}

// Public API Routes
app.get('/api/items', async (c) => {
  try {
    const { searchParams } = new URL(c.req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const db = c.env?.DB
    if (!db) {
      // Return demo data when database is not available
      let items = [...demoData.items]
      
      if (type) items = items.filter(item => item.type === type)
      if (category) items = items.filter(item => item.category === category)
      if (featured === 'true') items = items.filter(item => item.is_featured)
      if (search) {
        const searchLower = search.toLowerCase()
        items = items.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        )
      }
      
      return c.json({ items })
    }

    // Build query with filters - include real-time rating and usage stats
    let query = `
      SELECT v.*, c.name as category_name, c.color as category_color,
             COALESCE(AVG(r.rating), 0) as current_rating,
             COUNT(r.rating) as rating_count,
             COALESCE(u.usage_count, 0) as current_usage_count
      FROM vault_items v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN ratings r ON v.id = r.item_id
      LEFT JOIN (
        SELECT item_id, COUNT(*) as usage_count
        FROM usage_analytics
        WHERE action = 'view'
        GROUP BY item_id
      ) u ON v.id = u.item_id
      WHERE 1=1
    `
    const params: any[] = []

    if (type) {
      query += ` AND v.type = ?`
      params.push(type)
    }
    if (category) {
      query += ` AND c.name = ?`
      params.push(category)
    }
    if (featured === 'true') {
      query += ` AND v.is_featured = 1`
    }
    if (search) {
      query += ` AND (v.title LIKE ? OR v.description LIKE ? OR v.content LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    query += ` GROUP BY v.id ORDER BY v.created_at DESC`

    const result = await db.prepare(query).bind(...params).all()
    
    // Update the vault_items table with current stats (sync real-time data)
    if (result.results) {
      for (const item of result.results) {
        await db.prepare(`
          UPDATE vault_items 
          SET rating = ?, rating_count = ?, usage_count = ?
          WHERE id = ?
        `).bind(item.current_rating, item.rating_count, item.current_usage_count, item.id).run()
      }
    }
    
    return c.json({ items: result.results })
  } catch (error) {
    console.error('Error fetching items:', error)
    return c.json({ error: 'Failed to fetch items' }, 500)
  }
})

app.get('/api/items/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env?.DB

    if (!db) {
      const item = demoData.items.find(item => item.id.toString() === id)
      if (!item) return c.notFound()
      return c.json({ item })
    }

    const result = await db.prepare(`
      SELECT v.*, c.name as category_name, c.color as category_color
      FROM vault_items v
      LEFT JOIN categories c ON v.category_id = c.id
      WHERE v.id = ?
    `).bind(id).first()

    if (!result) return c.notFound()

    // Track usage with user agent and timestamp
    const userIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    const userAgent = c.req.header('user-agent') || 'unknown'
    
    await db.prepare(`
      INSERT INTO usage_analytics (item_id, action, user_ip, user_agent, created_at) 
      VALUES (?, 'view', ?, ?, datetime('now'))
    `).bind(id, userIP, userAgent).run()

    // Update usage count with real-time calculation
    const usageResult = await db.prepare(`
      UPDATE vault_items 
      SET usage_count = (SELECT COUNT(*) FROM usage_analytics WHERE item_id = ? AND action = 'view')
      WHERE id = ?
    `).bind(id, id).run()

    // Get updated item with latest usage count and rating
    const updatedResult = await db.prepare(`
      SELECT v.*, c.name as category_name, c.color as category_color,
             COALESCE(AVG(r.rating), 0) as current_rating,
             COUNT(r.rating) as rating_count
      FROM vault_items v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN ratings r ON v.id = r.item_id
      WHERE v.id = ?
      GROUP BY v.id
    `).bind(id).first()

    return c.json({ item: updatedResult })
  } catch (error) {
    console.error('Error fetching item:', error)
    return c.json({ error: 'Failed to fetch item' }, 500)
  }
})

app.get('/api/categories', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ categories: demoData.categories })
    }

    const result = await db.prepare('SELECT * FROM categories ORDER BY name').all()
    return c.json({ categories: result.results })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return c.json({ categories: demoData.categories })
  }
})

app.get('/api/tags', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ tags: demoData.tags })
    }

    const result = await db.prepare('SELECT * FROM tags ORDER BY name').all()
    return c.json({ tags: result.results })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return c.json({ tags: demoData.tags })
  }
})

// Rating System APIs
app.post('/api/items/:id/rate', async (c) => {
  try {
    const id = c.req.param('id')
    const { rating, feedback } = await c.req.json()
    const db = c.env?.DB

    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400)
    }

    const userIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    
    // Check if user already rated this item (prevent duplicate ratings)
    const existingRating = await db.prepare(`
      SELECT id FROM ratings 
      WHERE item_id = ? AND user_ip = ?
    `).bind(id, userIP).first()

    if (existingRating) {
      // Update existing rating
      await db.prepare(`
        UPDATE ratings 
        SET rating = ?, feedback = ?, created_at = CURRENT_TIMESTAMP
        WHERE item_id = ? AND user_ip = ?
      `).bind(rating, feedback || '', id, userIP).run()
    } else {
      // Insert new rating
      await db.prepare(`
        INSERT INTO ratings (item_id, rating, feedback, user_ip, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(id, rating, feedback || '', userIP).run()
    }

    // Update item's rating statistics in real-time
    const ratingStats = await db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
      FROM ratings
      WHERE item_id = ?
    `).bind(id).first()

    await db.prepare(`
      UPDATE vault_items
      SET rating = ?, rating_count = ?
      WHERE id = ?
    `).bind(ratingStats.avg_rating, ratingStats.rating_count, id).run()

    return c.json({ 
      success: true, 
      message: existingRating ? 'Rating updated' : 'Rating submitted',
      avgRating: ratingStats.avg_rating,
      ratingCount: ratingStats.rating_count
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return c.json({ error: 'Failed to submit rating' }, 500)
  }
})

app.get('/api/items/:id/ratings', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env?.DB

    if (!db) {
      return c.json({ ratings: [] })
    }

    const ratings = await db.prepare(`
      SELECT rating, feedback, created_at
      FROM ratings
      WHERE item_id = ? AND feedback IS NOT NULL AND feedback != ''
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(id).all()

    const stats = await db.prepare(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_ratings,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM ratings
      WHERE item_id = ?
    `).bind(id).first()

    return c.json({ 
      ratings: ratings.results || [],
      stats: stats || { avg_rating: 0, total_ratings: 0 }
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return c.json({ ratings: [], stats: { avg_rating: 0, total_ratings: 0 } })
  }
})

// Get usage analytics for an item
app.get('/api/items/:id/analytics', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env?.DB

    if (!db) {
      return c.json({ analytics: { usage_count: 0, recent_usage: [] } })
    }

    // Get usage statistics
    const usageStats = await db.prepare(`
      SELECT 
        COUNT(*) as total_usage,
        COUNT(CASE WHEN accessed_at >= datetime('now', '-1 day') THEN 1 END) as daily_usage,
        COUNT(CASE WHEN accessed_at >= datetime('now', '-7 days') THEN 1 END) as weekly_usage,
        COUNT(CASE WHEN accessed_at >= datetime('now', '-30 days') THEN 1 END) as monthly_usage
      FROM item_usage
      WHERE item_id = ?
    `).bind(id).first()

    // Get recent usage (last 10 access times)
    const recentUsage = await db.prepare(`
      SELECT accessed_at, user_agent
      FROM item_usage
      WHERE item_id = ?
      ORDER BY accessed_at DESC
      LIMIT 10
    `).bind(id).all()

    return c.json({
      analytics: {
        total_usage: usageStats.total_usage || 0,
        daily_usage: usageStats.daily_usage || 0,
        weekly_usage: usageStats.weekly_usage || 0,
        monthly_usage: usageStats.monthly_usage || 0,
        recent_usage: recentUsage.results || []
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return c.json({ analytics: { usage_count: 0, recent_usage: [] } })
  }
})

// ===== ANNOUNCEMENT MANAGEMENT API =====

// Get active announcements
app.get('/api/announcements', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      // Return default announcement if no database
      return c.json({ 
        announcements: [{
          id: 1,
          title: "🚀 NEW: 30 Professional Knowledge Bases Available",
          message: "Join TopAIToolbox.app Community - Accelerate your productivity go from prompt to product in a community setting",
          type: "promotion",
          background_color: "#F59E0B",
          text_color: "#000000",
          link_url: "https://www.topaitoolbox.app",
          link_text: "Join Movement",
          icon_class: "fas fa-rocket",
          is_active: true
        }]
      })
    }

    const result = await db.prepare(`
      SELECT * FROM announcements 
      WHERE is_active = TRUE 
      AND (start_date IS NULL OR start_date <= datetime('now'))
      AND (end_date IS NULL OR end_date >= datetime('now'))
      ORDER BY priority DESC, created_at DESC
    `).all()
    
    return c.json({ announcements: result.results })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return c.json({ announcements: [] })
  }
})

// Get all announcements (admin only)
app.get('/api/admin/announcements', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token || !(await verifyToken(token))) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) {
      return c.json({ announcements: [] })
    }

    const result = await db.prepare(`
      SELECT * FROM announcements 
      ORDER BY priority DESC, created_at DESC
    `).all()
    
    return c.json({ announcements: result.results })
  } catch (error) {
    console.error('Error fetching admin announcements:', error)
    return c.json({ error: 'Failed to fetch announcements' }, 500)
  }
})

// Create new announcement (admin only)
app.post('/api/admin/announcements', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token || !(await verifyToken(token))) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const data = await c.req.json()
    const { 
      title, message, type = 'info', 
      background_color = '#F59E0B', text_color = '#000000',
      image_url, link_url, link_text = 'Learn More',
      is_active = true, show_icon = true, 
      icon_class = 'fas fa-rocket',
      start_date, end_date, priority = 0
    } = data

    if (!title || !message) {
      return c.json({ error: 'Title and message are required' }, 400)
    }

    const result = await db.prepare(`
      INSERT INTO announcements (
        title, message, type, background_color, text_color,
        image_url, link_url, link_text, is_active, show_icon,
        icon_class, start_date, end_date, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, message, type, background_color, text_color,
      image_url || null, link_url || null, link_text, is_active, show_icon,
      icon_class, start_date || null, end_date || null, priority
    ).run()

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return c.json({ error: 'Failed to create announcement' }, 500)
  }
})

// Update announcement (admin only)
app.put('/api/admin/announcements/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token || !(await verifyToken(token))) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const id = c.req.param('id')
    const data = await c.req.json()
    const { 
      title, message, type, 
      background_color, text_color,
      image_url, link_url, link_text,
      is_active, show_icon, 
      icon_class, start_date, end_date, priority
    } = data

    const result = await db.prepare(`
      UPDATE announcements SET 
        title = ?, message = ?, type = ?, 
        background_color = ?, text_color = ?,
        image_url = ?, link_url = ?, link_text = ?,
        is_active = ?, show_icon = ?, icon_class = ?,
        start_date = ?, end_date = ?, priority = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title, message, type, 
      background_color, text_color,
      image_url || null, link_url || null, link_text,
      is_active, show_icon, icon_class,
      start_date || null, end_date || null, priority, id
    ).run()

    return c.json({ success: true, changes: result.changes })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return c.json({ error: 'Failed to update announcement' }, 500)
  }
})

// Delete announcement (admin only)
app.delete('/api/admin/announcements/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token || !(await verifyToken(token))) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const id = c.req.param('id')
    const result = await db.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run()

    return c.json({ success: true, changes: result.changes })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return c.json({ error: 'Failed to delete announcement' }, 500)
  }
})

// Admin Authentication
app.post('/api/admin/login', async (c) => {
  try {
    const { password } = await c.req.json()
    
    if (password === ADMIN_PASSWORD) {
      const token = await createToken()
      return c.json({ success: true, token })
    } else {
      return c.json({ success: false, message: 'Invalid password' }, 401)
    }
  } catch (error) {
    return c.json({ success: false, message: 'Invalid request' }, 400)
  }
})

// Admin middleware for protected routes
app.use('/api/admin/*', async (c, next) => {
  // Skip authentication for login route
  if (c.req.url.endsWith('/login')) {
    return next()
  }

  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = auth.substring(7)
  const isValid = await verifyToken(token)
  
  if (!isValid) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  return next()
})

// Admin API Routes
app.get('/api/admin/items', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ items: demoData.items })
    }

    const result = await db.prepare(`
      SELECT v.*, c.name as category_name 
      FROM vault_items v
      LEFT JOIN categories c ON v.category_id = c.id
      ORDER BY v.created_at DESC
    `).all()
    
    return c.json({ items: result.results })
  } catch (error) {
    console.error('Admin items error:', error)
    return c.json({ error: 'Failed to fetch admin items' }, 500)
  }
})

app.post('/api/admin/items', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const item = await c.req.json()
    
    const result = await db.prepare(`
      INSERT INTO vault_items (title, description, content, type, category_id, author, difficulty, metadata, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      item.title,
      item.description, 
      item.content,
      item.type,
      item.category_id,
      item.author || 'Joshua Payne',
      item.difficulty || 'intermediate',
      JSON.stringify(item.metadata || {}),
      item.is_featured ? 1 : 0
    ).run()

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Create item error:', error)
    return c.json({ error: 'Failed to create item' }, 500)
  }
})

app.put('/api/admin/items/:id', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const id = c.req.param('id')
    const item = await c.req.json()
    
    await db.prepare(`
      UPDATE vault_items 
      SET title = ?, description = ?, content = ?, type = ?, category_id = ?, 
          difficulty = ?, metadata = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      item.title,
      item.description,
      item.content, 
      item.type,
      item.category_id,
      item.difficulty,
      JSON.stringify(item.metadata || {}),
      item.is_featured ? 1 : 0,
      id
    ).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Update item error:', error)
    return c.json({ error: 'Failed to update item' }, 500)
  }
})

app.delete('/api/admin/items/:id', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const id = c.req.param('id')
    
    await db.prepare('DELETE FROM vault_items WHERE id = ?').bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete item error:', error)
    return c.json({ error: 'Failed to delete item' }, 500)
  }
})

// Category Management APIs
app.get('/api/admin/categories', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ categories: [] })
    }

    const result = await db.prepare('SELECT * FROM categories ORDER BY name').all()
    return c.json({ categories: result.results })
  } catch (error) {
    console.error('Error fetching admin categories:', error)
    return c.json({ error: 'Failed to fetch categories' }, 500)
  }
})

app.post('/api/admin/categories', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const { name, description, color, icon } = await c.req.json()
    
    const result = await db.prepare(`
      INSERT INTO categories (name, description, color)
      VALUES (?, ?, ?)
    `).bind(name, description, color || '#3B82F6').run()

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Create category error:', error)
    return c.json({ error: 'Failed to create category' }, 500)
  }
})

app.put('/api/admin/categories/:id', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const id = c.req.param('id')
    const { name, description, color, icon } = await c.req.json()
    
    await db.prepare(`
      UPDATE categories 
      SET name = ?, description = ?, color = ?
      WHERE id = ?
    `).bind(name, description, color, id).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Update category error:', error)
    return c.json({ error: 'Failed to update category' }, 500)
  }
})

app.delete('/api/admin/categories/:id', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const id = c.req.param('id')
    
    // Check if category is in use
    const inUse = await db.prepare('SELECT COUNT(*) as count FROM vault_items WHERE category_id = ?').bind(id).first()
    if (inUse.count > 0) {
      return c.json({ error: 'Cannot delete category that is in use by items' }, 400)
    }
    
    await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return c.json({ error: 'Failed to delete category' }, 500)
  }
})

// Tag Management APIs  
app.get('/api/admin/tags', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ tags: [] })
    }

    const result = await db.prepare('SELECT * FROM tags ORDER BY name').all()
    return c.json({ tags: result.results })
  } catch (error) {
    console.error('Error fetching admin tags:', error)
    return c.json({ error: 'Failed to fetch tags' }, 500)
  }
})

app.post('/api/admin/tags', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const { name, description } = await c.req.json()
    
    const result = await db.prepare(`
      INSERT INTO tags (name, description)
      VALUES (?, ?)
    `).bind(name, description).run()

    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('Create tag error:', error)
    return c.json({ error: 'Failed to create tag' }, 500)
  }
})

app.delete('/api/admin/tags/:id', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      return c.json({ error: 'Database not available' }, 503)
    }

    const id = c.req.param('id')
    
    // Remove tag associations first
    await db.prepare('DELETE FROM item_tags WHERE tag_id = ?').bind(id).run()
    
    // Then delete the tag
    await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete tag error:', error)
    return c.json({ error: 'Failed to delete tag' }, 500)
  }
})

// === ANNOUNCEMENTS API ===

// Get active announcements
app.get('/api/announcements', async (c) => {
  try {
    const db = c.env?.DB
    if (!db) {
      // Return default announcement if no database
      return c.json({
        announcements: [{
          id: 1,
          title: '🚀 NEW: 30 Professional Knowledge Bases Available',
          message: 'Join TopAIToolbox.app Community - Accelerate your productivity go from prompt to product in a community setting',
          link_url: 'https://www.topaitoolbox.app',
          link_text: 'Join Movement',
          background_color: '#F59E0B',
          text_color: '#000000',
          image_url: null,
          is_active: true,
          priority: 10
        }]
      })
    }

    const result = await db.prepare(`
      SELECT * FROM announcements 
      WHERE is_active = 1 
      ORDER BY priority DESC, created_at DESC
    `).all()

    return c.json({ announcements: result.results || [] })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return c.json({ announcements: [] })
  }
})

// Get all announcements (admin only)
app.get('/api/admin/announcements', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!verifyAdminToken(token)) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) return c.json({ announcements: [] })

    const result = await db.prepare(`
      SELECT * FROM announcements 
      ORDER BY priority DESC, created_at DESC
    `).all()

    return c.json({ announcements: result.results || [] })
  } catch (error) {
    console.error('Error fetching admin announcements:', error)
    return c.json({ error: 'Failed to fetch announcements' }, 500)
  }
})

// Create new announcement
app.post('/api/admin/announcements', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!verifyAdminToken(token)) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) return c.json({ error: 'Database not available' }, 500)

    const {
      title,
      message,
      link_url,
      link_text = 'Learn More',
      image_url,
      background_color = '#F59E0B',
      text_color = '#000000',
      is_active = true,
      priority = 5
    } = await c.req.json()

    if (!title || !message) {
      return c.json({ error: 'Title and message are required' }, 400)
    }

    const result = await db.prepare(`
      INSERT INTO announcements (
        title, message, link_url, link_text, image_url, 
        background_color, text_color, is_active, priority, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      title, message, link_url, link_text, image_url,
      background_color, text_color, is_active ? 1 : 0, priority
    ).run()

    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Announcement created successfully' 
    })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return c.json({ error: 'Failed to create announcement' }, 500)
  }
})

// Update announcement
app.put('/api/admin/announcements/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!verifyAdminToken(token)) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) return c.json({ error: 'Database not available' }, 500)

    const id = c.req.param('id')
    const {
      title,
      message,
      link_url,
      link_text,
      image_url,
      background_color,
      text_color,
      is_active,
      priority
    } = await c.req.json()

    if (!title || !message) {
      return c.json({ error: 'Title and message are required' }, 400)
    }

    await db.prepare(`
      UPDATE announcements 
      SET title = ?, message = ?, link_url = ?, link_text = ?, 
          image_url = ?, background_color = ?, text_color = ?, 
          is_active = ?, priority = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      title, message, link_url, link_text, image_url,
      background_color, text_color, is_active ? 1 : 0, priority, id
    ).run()

    return c.json({ 
      success: true,
      message: 'Announcement updated successfully' 
    })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return c.json({ error: 'Failed to update announcement' }, 500)
  }
})

// Delete announcement
app.delete('/api/admin/announcements/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!verifyAdminToken(token)) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) return c.json({ error: 'Database not available' }, 500)

    const id = c.req.param('id')
    await db.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run()

    return c.json({ 
      success: true,
      message: 'Announcement deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return c.json({ error: 'Failed to delete announcement' }, 500)
  }
})

// Toggle announcement status
app.patch('/api/admin/announcements/:id/toggle', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!verifyAdminToken(token)) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = c.env?.DB
    if (!db) return c.json({ error: 'Database not available' }, 500)

    const id = c.req.param('id')
    
    // Get current status
    const current = await db.prepare('SELECT is_active FROM announcements WHERE id = ?').bind(id).first()
    if (!current) {
      return c.json({ error: 'Announcement not found' }, 404)
    }

    // Toggle status
    const newStatus = current.is_active ? 0 : 1
    await db.prepare(`
      UPDATE announcements 
      SET is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newStatus, id).run()

    return c.json({ 
      success: true,
      is_active: newStatus === 1,
      message: `Announcement ${newStatus === 1 ? 'activated' : 'deactivated'}` 
    })
  } catch (error) {
    console.error('Error toggling announcement:', error)
    return c.json({ error: 'Failed to toggle announcement' }, 500)
  }
})

// Main page
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Vault - AI Prompts, Workflows & Frameworks</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-black min-h-screen">
    <!-- Header -->
    <header class="bg-black shadow-lg border-b border-yellow-400">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-4">
                    <h1 class="text-2xl font-bold text-white">
                        <i class="fas fa-vault mr-2 text-yellow-400"></i>
                        Prompt Vault
                    </h1>
                    <span class="text-sm text-gray-400">by Joshua Payne</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/admin" class="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                        <i class="fas fa-cog mr-1"></i>Admin
                    </a>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-gray-900 via-black to-gray-800 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <!-- Dynamic Announcements -->
            <div id="announcementsContainer" class="mb-6">
                <!-- Announcements will be loaded here -->
            </div>
            
            <h2 class="text-4xl font-bold mb-4">
                Your Complete Vault of AI Prompts, Workflows & Frameworks
            </h2>
            <p class="text-xl mb-8 text-gray-300">
                Curated collection of expert prompts, proven workflows, and 30+ professional knowledge bases for accelerated productivity
            </p>
            <div class="flex justify-center space-x-4">
                <button id="browseBtn" class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition shadow-lg">
                    <i class="fas fa-search mr-2"></i>Browse Vault
                </button>
                <button id="searchBtn" class="border-2 border-yellow-400 text-yellow-400 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition">
                    <i class="fas fa-filter mr-2"></i>Filter & Search
                </button>
                <a href="https://www.topaitoolbox.app" target="_blank" class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition shadow-lg">
                    <i class="fas fa-external-link-alt mr-2"></i>Join Movement
                </a>
            </div>
        </div>
    </section>

    <!-- Search & Filter Section -->
    <section class="bg-gray-900 py-8 border-b border-yellow-400" id="searchSection" style="display: none;">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" id="searchInput" placeholder="Search prompts, workflows..." 
                       class="bg-black border border-yellow-400 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 placeholder-gray-400">
                <select id="typeFilter" class="bg-black border border-yellow-400 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400">
                    <option value="">All Types</option>
                    <option value="prompt">Prompts</option>
                    <option value="workflow">Workflows</option>
                    <option value="framework">Frameworks</option>
                </select>
                <select id="categoryFilter" class="bg-black border border-yellow-400 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400">
                    <option value="">All Categories</option>
                </select>
                <label class="flex items-center space-x-2 text-white">
                    <input type="checkbox" id="featuredFilter" class="rounded border-yellow-400 text-yellow-400 focus:ring-yellow-400">
                    <span>Featured Only</span>
                </label>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Section -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div class="bg-gray-900 border border-yellow-400 rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:border-yellow-300 transition-all">
                <div class="text-3xl font-bold text-yellow-400" id="totalItems">49+</div>
                <div class="text-gray-300">Total Items</div>
            </div>
            <div class="bg-gray-900 border border-yellow-400 rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:border-yellow-300 transition-all">
                <div class="text-3xl font-bold text-yellow-400" id="totalPrompts">11</div>
                <div class="text-gray-300">AI Prompts</div>
            </div>
            <div class="bg-gray-900 border border-yellow-400 rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:border-yellow-300 transition-all">
                <div class="text-3xl font-bold text-yellow-400" id="totalWorkflows">3</div>
                <div class="text-gray-300">Workflows</div>
            </div>
            <div class="bg-gray-900 border border-yellow-400 rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:border-yellow-300 transition-all">
                <div class="text-3xl font-bold text-yellow-400" id="totalFrameworks">5</div>
                <div class="text-gray-300">Frameworks</div>
            </div>
            <div class="bg-gray-900 border border-yellow-400 rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:border-yellow-300 transition-all">
                <div class="text-3xl font-bold text-yellow-400" id="totalKnowledgeBases">30</div>
                <div class="text-gray-300">Knowledge Bases</div>
            </div>
        </div>

        <!-- TopAIToolbox Promotion Section -->
        <div class="bg-gradient-to-r from-gray-900 via-black to-gray-800 border-2 border-yellow-400 rounded-2xl p-8 mb-12 text-white relative overflow-hidden shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-5 rounded-2xl"></div>
            <div class="relative z-10">
                <div class="flex items-center justify-between flex-wrap gap-6">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-rocket text-3xl mr-3 text-yellow-400"></i>
                            <h3 class="text-2xl font-bold text-yellow-400">Supercharge Your AI Productivity!</h3>
                        </div>
                        <p class="text-lg mb-4 text-gray-300">
                            🚀 <strong class="text-yellow-400">From Prompt to Product in Record Time</strong> - Transform your workflow with 30+ comprehensive knowledge bases!
                        </p>
                        <div class="grid md:grid-cols-2 gap-4 mb-6">
                            <div class="space-y-2">
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    <span class="text-gray-300">30 Expert-Level Knowledge Bases</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    <span class="text-gray-300">Custom GPT Integration Ready</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    <span class="text-gray-300">Instant PDF Export</span>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    <span class="text-gray-300">Community-Driven Innovation</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    <span class="text-gray-300">Professional Documentation</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    <span class="text-gray-300">Real-World Applications</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span class="bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm">Digital Marketing</span>
                            <span class="bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm">Software Dev</span>
                            <span class="bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm">Financial Planning</span>
                            <span class="bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm">Healthcare</span>
                            <span class="bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm">Legal Practice</span>
                            <span class="bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-sm">+25 More</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center space-y-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold mb-1 text-yellow-400">Join the Movement!</div>
                            <div class="text-gray-400 text-sm mb-4">Streamlining Builders & Entrepreneurs</div>
                        </div>
                        <a href="https://www.topaitoolbox.app" target="_blank" 
                           class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            <i class="fas fa-external-link-alt mr-2"></i>
                            Visit TopAIToolbox.app
                        </a>
                        <p class="text-xs text-gray-400 text-center max-w-48">
                            Join the movement to streamline builders and entrepreneurs
                        </p>
                    </div>
                </div>
                
                <!-- Feature Highlights -->
                <div class="border-t border-yellow-400 border-opacity-30 pt-6 mt-6">
                    <div class="grid md:grid-cols-4 gap-4 text-center">
                        <div>
                            <i class="fas fa-users text-2xl mb-2 text-yellow-400"></i>
                            <div class="font-semibold text-sm text-gray-300">Community Learning</div>
                        </div>
                        <div>
                            <i class="fas fa-download text-2xl mb-2 text-yellow-400"></i>
                            <div class="font-semibold text-sm text-gray-300">Export Tools</div>
                        </div>
                        <div>
                            <i class="fas fa-robot text-2xl mb-2 text-yellow-400"></i>
                            <div class="font-semibold text-sm text-gray-300">Custom GPTs</div>
                        </div>
                        <div>
                            <i class="fas fa-chart-line text-2xl mb-2 text-yellow-400"></i>
                            <div class="font-semibold text-sm text-gray-300">Scale Productivity</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Items Grid -->
        <div id="itemsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Items will be loaded here -->
        </div>

        <!-- Loading State -->
        <div id="loading" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-yellow-400 mb-4"></i>
            <p class="text-gray-300">Loading vault contents...</p>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-yellow-400 text-white py-8 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p class="text-gray-300">&copy; 2025 Prompt Vault - Curated by <span class="text-yellow-400">Joshua Payne</span></p>
            <p class="text-gray-400 text-sm mt-2">
                Professional prompts, workflows, and frameworks for streamlining builders & entrepreneurs
            </p>
            <p class="text-gray-500 text-xs mt-3">
                Powered by <span class="text-yellow-400 font-semibold">Ghostware Systems</span>
            </p>
        </div>
    </footer>

    <script src="/static/app.js"></script>
</body>
</html>
  `)
})

// Admin page
app.get('/admin', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Prompt Vault</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-black min-h-screen">
    <div id="app">
        <!-- Login will be rendered here -->
    </div>
    
    <!-- Footer for Admin -->
    <footer class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-yellow-400 py-2">
        <div class="text-center">
            <p class="text-gray-500 text-xs">
                Powered by <span class="text-yellow-400 font-semibold">Ghostware Systems</span>
            </p>
        </div>
    </footer>
    
    <script src="/static/admin.js"></script>
</body>
</html>
  `)
})

export default app