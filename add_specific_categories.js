// Script to add specific categories for different content types
const newCategories = [
  {
    name: "Knowledge Bases",
    description: "Comprehensive knowledge bases and reference materials for GPT training",
    color: "#6366F1"
  },
  {
    name: "Templates & Formats", 
    description: "Ready-to-use templates, document formats, and structured layouts",
    color: "#8B5CF6"
  },
  {
    name: "Checklists & Guides",
    description: "Step-by-step checklists, verification guides, and process lists",
    color: "#10B981"
  },
  {
    name: "Business Frameworks",
    description: "Business frameworks, strategic models, and methodologies",
    color: "#F59E0B"
  },
  {
    name: "AI & Automation",
    description: "AI prompts, automation workflows, and technology guides",
    color: "#06B6D4"
  }
];

async function addSpecificCategories() {
  try {
    // Get admin token
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Prompts123' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('Adding specific categories for better organization...\n');
    
    for (const category of newCategories) {
      try {
        const response = await fetch('http://localhost:3000/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(category)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Added: ${category.name}`);
        } else {
          const errorData = await response.json();
          console.log(`⚠️ ${category.name}: ${errorData.error || 'Failed to create'}`);
        }
      } catch (error) {
        console.error(`❌ Error with ${category.name}:`, error.message);
      }
    }
    
    // List all categories after addition
    console.log('\n📋 Current categories:');
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categoriesData = await categoriesResponse.json();
    categoriesData.categories.forEach(cat => {
      console.log(`  • ${cat.name} (${cat.description})`);
    });
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

addSpecificCategories();