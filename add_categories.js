// Script to add more specific categories for better organization
const categories = [
  {
    name: "Knowledge Base",
    description: "Comprehensive knowledge bases and reference materials",
    color: "#6366F1",
    icon: "fas fa-book"
  },
  {
    name: "Templates",
    description: "Ready-to-use templates and document formats",
    color: "#8B5CF6",
    icon: "fas fa-file-alt"
  },
  {
    name: "Checklists",
    description: "Step-by-step checklists and verification guides",
    color: "#10B981",
    icon: "fas fa-tasks"
  },
  {
    name: "Frameworks & Models",
    description: "Business frameworks, models, and methodologies",
    color: "#F59E0B",
    icon: "fas fa-sitemap"
  },
  {
    name: "Process Workflows",
    description: "Detailed process workflows and procedures",
    color: "#EF4444",
    icon: "fas fa-project-diagram"
  },
  {
    name: "AI & Automation",
    description: "AI prompts, automation guides, and tech workflows",
    color: "#06B6D4",
    icon: "fas fa-robot"
  },
  {
    name: "Training Materials",
    description: "Educational content and training programs",
    color: "#84CC16",
    icon: "fas fa-graduation-cap"
  },
  {
    name: "Strategy & Planning",
    description: "Strategic planning tools and frameworks",
    color: "#F97316",
    icon: "fas fa-chess"
  }
];

// Function to add categories via API
async function addCategories() {
  try {
    // First get admin token
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Prompts123' })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('Failed to login');
      return;
    }
    
    const token = loginData.token;
    console.log('Successfully logged in');
    
    // Add each category
    for (const category of categories) {
      try {
        const response = await fetch('http://localhost:3000/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(category)
        });
        
        const result = await response.json();
        if (result.success) {
          console.log(`✅ Added category: ${category.name}`);
        } else {
          console.log(`⚠️ Category ${category.name} might already exist or failed to create`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${category.name}:`, error.message);
      }
    }
    
    console.log('🎉 Category creation process completed!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
addCategories();