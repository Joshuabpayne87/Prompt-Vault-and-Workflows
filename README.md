# Prompt Vault - AI Prompts, Workflows & Frameworks

## Project Overview
- **Name**: Prompt Vault
- **Goal**: A comprehensive web application for accessing, managing, and sharing AI prompts, workflows, and frameworks with admin functionality
- **Features**: Content browsing, search, ratings, real-time analytics, and complete admin content management system

## 🌐 Live URLs
- **Production**: https://bbbb16be.prompt-vault-2025.pages.dev
- **Admin Panel**: https://bbbb16be.prompt-vault-2025.pages.dev/admin
- **TopAIToolbox Community**: https://www.topaitoolbox.app
- **GitHub**: https://github.com/username/webapp
- **API Documentation**: https://bbbb16be.prompt-vault-2025.pages.dev/api/items

## 🎯 Current Features

### ✅ User Features
- **Browse Vault Items**: View all prompts, workflows, and frameworks with filtering and pagination
- **Search & Filter**: Full-text search with category and type filtering
- **Real-time Ratings**: Interactive star rating system with live updates
- **Usage Analytics**: Live tracking of item views and interactions
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### ✅ Admin Features (Password: `Prompts123`)
- **Secure Login**: JWT-based authentication system
- **Content Management**: Create, edit, and delete prompts, workflows, and frameworks
- **📢 Announcement Management**: Create and manage dynamic homepage announcements with images
- **Category Management**: Add and manage content categories
- **Tag System**: Create and assign tags to content items  
- **Rich Content Editor**: Template-based forms for different content types
- **Analytics Dashboard**: View usage statistics and ratings data

### ✅ API Endpoints
- `GET /api/items` - Browse all vault items with pagination and filtering
- `GET /api/items/:id` - Get specific item details
- `POST /api/items/:id/rate` - Submit item ratings
- `GET /api/announcements` - Get active announcements
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/items` - Admin: Get all items
- `POST /api/admin/items` - Admin: Create new items
- `PUT /api/admin/items/:id` - Admin: Update existing items
- `DELETE /api/admin/items/:id` - Admin: Delete items
- `GET /api/admin/categories` - Admin: Manage categories
- `POST /api/admin/categories` - Admin: Create categories
- `GET /api/admin/announcements` - Admin: Manage announcements
- `POST /api/admin/announcements` - Admin: Create announcements
- `PUT /api/admin/announcements/:id` - Admin: Update announcements
- `DELETE /api/admin/announcements/:id` - Admin: Delete announcements

## 🗄️ Data Architecture
- **Database**: Cloudflare D1 SQLite with global distribution
- **Storage Services**: 
  - D1 Database for relational data (items, categories, ratings, analytics)
  - JWT tokens for authentication
- **Data Models**:
  - Items: prompts, workflows, frameworks with metadata
  - Categories: organizational structure for content
  - Tags: flexible labeling system
  - Ratings: user feedback and scoring
  - Analytics: usage tracking and statistics
  - Announcements: dynamic homepage banners with images and links

## 👤 User Guide

### For Regular Users:
1. Visit https://24b860c3.prompt-vault-2025.pages.dev
2. Browse the vault of AI prompts, workflows, and frameworks
3. Use search and filters to find specific content
4. Rate items using the star rating system
5. View item details and copy content for use

### For Administrators:
1. Go to https://24b860c3.prompt-vault-2025.pages.dev/admin
2. Login with password: `Prompts123`
3. **Create New Content**: Use "Add New Item" to create prompts, workflows, or frameworks
4. **📢 Manage Announcements**: Use "Announcements" button to create/edit homepage banners with images
5. **Manage Categories**: Add and organize content categories
6. **Edit Content**: Click any item to edit or update
7. **View Analytics**: Monitor usage statistics and ratings

## 🚀 Deployment
- **Platform**: Cloudflare Pages with Workers
- **Status**: ✅ Active and Live
- **Design**: Black & Gold Theme - Matches TopAIToolbox.app
- **Tech Stack**: Hono + TypeScript + Cloudflare D1 + TailwindCSS
- **Last Updated**: 2025-09-02
- **Project Name**: prompt-vault-2025

## 🔧 Development

### Local Development:
```bash
npm install
npm run build
npm run dev
```

### Production Deployment:
```bash
npm run build
npx wrangler pages deploy dist --project-name prompt-vault-2025
```

### Database Management:
```bash
# Apply migrations (if needed)
npx wrangler d1 migrations apply webapp-production

# Local development with D1
npm run dev:d1
```

## 📊 Current Database Content
- **19 Coaching Items** by Joshua Payne
- **30+ Knowledge Bases** covering all major business and professional domains
- **TopAIToolbox.app Integration** - Community-driven productivity platform
- **Categories**: Custom GPTs, Sales Coaching, Health & Wellness, Knowledge Bases, etc.
- **Features**: Full-text search, ratings, usage tracking, community integration
- **Live Analytics**: Real-time user interaction tracking

## 📚 **NEW: 30 Comprehensive Knowledge Bases for Custom GPTs**

### **Available Knowledge Bases (Ready for PDF Export):**

**Business & Professional (10 domains):**
- Digital Marketing & SEO Master Guide
- Software Development & Engineering Excellence  
- Financial Planning & Investment Strategy
- Real Estate Investment & Property Management
- Human Resources & Talent Management
- E-commerce & Online Business Strategy
- Project Management & Agile Methodologies
- Sales Process & Customer Relationship Management
- Supply Chain & Operations Management
- Business Intelligence & Data Analytics

**Healthcare & Wellness (5 domains):**
- Healthcare & Medical Practice Management
- Mental Health & Therapy Practice Guide
- Nutrition & Dietetics Professional Guide
- Fitness & Personal Training Methodology
- Public Health & Epidemiology Framework

**Education & Training (3 domains):**
- Educational Administration & Curriculum Development
- Corporate Training & Learning Development  
- Online Course Creation & E-learning Design

**Legal & Compliance (2 domains):**
- Legal Practice & Case Management
- Regulatory Compliance & Risk Management

**Technology & Innovation (4 domains):**
- Cybersecurity & Information Protection
- Cloud Computing & Infrastructure Management
- Artificial Intelligence & Machine Learning Implementation
- Data Science & Advanced Analytics

**Creative & Media (3 domains):**
- Content Creation & Creative Writing
- Graphic Design & Visual Communication
- Video Production & Multimedia Creation

**Specialized Industries (3 domains):**
- Non-Profit Organization Management
- Manufacturing & Quality Management
- Hospitality & Tourism Management

### **Knowledge Base Features:**
- **Custom GPT Ready**: Structured for direct import into ChatGPT custom GPTs
- **PDF Export**: Formatted for professional documentation and offline reference
- **Comprehensive Coverage**: Each knowledge base contains 3000-5000 words of expert content
- **Use Case Specific**: Detailed descriptions for implementation in various business contexts
- **Professional Quality**: Written by domain experts with practical frameworks and checklists

### **Implementation Files:**
- `ALL_30_KNOWLEDGE_BASES.md` - Complete guide and index
- `complete_knowledge_bases.json` - First 10 knowledge bases (structured data)
- `remaining_20_knowledge_bases.json` - Additional 20 knowledge bases
- `knowledge_bases.json` - Sample implementation files

### **How to Add Knowledge Bases:**
1. **Admin Login**: Use admin panel with password `Prompts123`
2. **Create Knowledge Base Category**: Already created (Category ID: 16)
3. **Add Content**: Copy from JSON files into admin interface
4. **Export as PDF**: Use browser print-to-PDF for offline reference
5. **Custom GPT Integration**: Copy content directly into ChatGPT custom GPT knowledge section

## 🔄 Next Development Steps
1. **Knowledge Base Integration**: Automated import system for all 30 knowledge bases
2. **PDF Export Feature**: Built-in PDF generation for knowledge bases
3. **Enhanced search with autocomplete**
4. **Content versioning system** 
5. **User authentication for personalized collections**
6. **Advanced analytics dashboard with charts**
7. **Knowledge base templates for custom domains**