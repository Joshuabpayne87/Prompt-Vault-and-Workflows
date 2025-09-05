// Script to properly categorize items based on their content
const categoryMappings = [
  // Digital Marketing & SEO → Digital Marketing (ID: 1)
  { itemId: 10, categoryId: 1, reason: "Digital Marketing & SEO Master Guide → Digital Marketing" },
  
  // Software Development → Technology (ID: 6)  
  { itemId: 11, categoryId: 6, reason: "Software Development & Engineering Excellence → Technology" },
  
  // Financial Planning → Business Strategy (ID: 2)
  { itemId: 12, categoryId: 2, reason: "Financial Planning & Investment Strategy → Business Strategy" },
  
  // Healthcare Management → Knowledge Bases (ID: 11)
  { itemId: 13, categoryId: 11, reason: "Healthcare & Medical Practice Management → Knowledge Bases" },
  
  // Legal Practice → Knowledge Bases (ID: 11)
  { itemId: 14, categoryId: 11, reason: "Legal Practice & Case Management → Knowledge Bases" },
  
  // Educational Administration → Knowledge Bases (ID: 11)
  { itemId: 15, categoryId: 11, reason: "Educational Administration & Curriculum Development → Knowledge Bases" },
  
  // Real Estate Investment → Business Strategy (ID: 2)
  { itemId: 16, categoryId: 2, reason: "Real Estate Investment & Property Management → Business Strategy" },
  
  // Human Resources → Leadership (ID: 5)
  { itemId: 17, categoryId: 5, reason: "Human Resources & Talent Management → Leadership" },
  
  // E-commerce Strategy → Digital Marketing (ID: 1)
  { itemId: 18, categoryId: 1, reason: "E-commerce & Online Business Strategy → Digital Marketing" },
  
  // Project Management → Business Frameworks (ID: 14)
  { itemId: 19, categoryId: 14, reason: "Project Management & Agile Methodologies → Business Frameworks" },
  
  // Sales Process → Sales & Growth (ID: 4)
  { itemId: 20, categoryId: 4, reason: "Sales Process & Customer Relationship Management → Sales & Growth" },
  
  // Supply Chain → Business Frameworks (ID: 14)
  { itemId: 21, categoryId: 14, reason: "Supply Chain & Operations Management → Business Frameworks" },
  
  // Mental Health → Knowledge Bases (ID: 11)
  { itemId: 22, categoryId: 11, reason: "Mental Health & Therapy Practice Guide → Knowledge Bases" },
  
  // Cybersecurity → Technology (ID: 6)
  { itemId: 23, categoryId: 6, reason: "Cybersecurity & Information Protection → Technology" },
  
  // Content Creation → Content Creation (ID: 3)
  { itemId: 24, categoryId: 3, reason: "Content Creation & Creative Writing → Content Creation" },
  
  // Cloud Computing → Technology (ID: 6)
  { itemId: 25, categoryId: 6, reason: "Cloud Computing & Infrastructure Management → Technology" }
];

async function recategorizeItems() {
  try {
    // Get admin token
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Prompts123' })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('❌ Failed to login');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Successfully logged in to admin panel\n');
    
    // First get all items
    const itemsResponse = await fetch('http://localhost:3000/api/admin/items', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const itemsData = await itemsResponse.json();
    const allItems = itemsData.items || [];
    
    console.log('📂 Recategorizing vault items from "General" to proper categories...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const mapping of categoryMappings) {
      try {
        // Find the current item data
        const currentItem = allItems.find(item => item.id === mapping.itemId);
        if (!currentItem) {
          console.log(`⚠️ Item ${mapping.itemId} not found`);
          errorCount++;
          continue;
        }
        
        // Update with all current data but new category_id
        const updateData = {
          title: currentItem.title,
          description: currentItem.description,
          content: currentItem.content,
          type: currentItem.type,
          category_id: mapping.categoryId,  // This is what we're changing
          author: currentItem.author,
          difficulty: currentItem.difficulty,
          is_featured: currentItem.is_featured,
          metadata: currentItem.metadata || {}
        };
        
        const response = await fetch(`http://localhost:3000/api/admin/items/${mapping.itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          console.log(`✅ ${mapping.reason}`);
          successCount++;
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Failed to update item ${mapping.itemId}: ${errorText}`);
          errorCount++;
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error updating item ${mapping.itemId}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Recategorization Summary:`);
    console.log(`   ✅ Successfully updated: ${successCount} items`);
    console.log(`   ❌ Errors: ${errorCount} items`);
    console.log(`   📝 Total processed: ${categoryMappings.length} items\n`);
    
    if (successCount > 0) {
      console.log('🎉 Items have been properly categorized!');
      console.log('💡 Visit the admin panel to see the improved organization.');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the recategorization
recategorizeItems();