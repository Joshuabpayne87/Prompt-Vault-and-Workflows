// Fix categories for all items
const updates = [
  // Digital Marketing items
  { id: 10, categoryId: 1, category: "Digital Marketing" },
  { id: 18, categoryId: 1, category: "Digital Marketing" },
  
  // Technology items  
  { id: 11, categoryId: 6, category: "Technology" },
  { id: 23, categoryId: 6, category: "Technology" },
  { id: 25, categoryId: 6, category: "Technology" },
  
  // Business Strategy items
  { id: 12, categoryId: 2, category: "Business Strategy" },
  { id: 16, categoryId: 2, category: "Business Strategy" },
  
  // Knowledge Bases items
  { id: 13, categoryId: 11, category: "Knowledge Bases" },
  { id: 14, categoryId: 11, category: "Knowledge Bases" },
  { id: 15, categoryId: 11, category: "Knowledge Bases" },
  { id: 22, categoryId: 11, category: "Knowledge Bases" },
  
  // Leadership items
  { id: 17, categoryId: 5, category: "Leadership" },
  
  // Sales & Growth items
  { id: 20, categoryId: 4, category: "Sales & Growth" },
  
  // Business Frameworks items
  { id: 19, categoryId: 14, category: "Business Frameworks" },
  { id: 21, categoryId: 14, category: "Business Frameworks" },
  
  // Content Creation items
  { id: 24, categoryId: 3, category: "Content Creation" }
];

async function updateCategories() {
  try {
    console.log('🔐 Getting admin token...');
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Prompts123' })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Admin token obtained\n');
    
    // Get all current items
    console.log('📊 Fetching current items...');
    const itemsResponse = await fetch('http://localhost:3000/api/admin/items', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const itemsData = await itemsResponse.json();
    const allItems = itemsData.items || [];
    
    console.log(`📋 Found ${allItems.length} total items\n`);
    console.log('🔄 Starting category updates...\n');
    
    let successCount = 0;
    
    for (const update of updates) {
      const currentItem = allItems.find(item => item.id === update.id);
      if (!currentItem) {
        console.log(`⚠️  Item ${update.id} not found`);
        continue;
      }
      
      // Create update payload with all current data
      const updatePayload = {
        title: currentItem.title,
        description: currentItem.description,
        content: currentItem.content,
        type: currentItem.type,
        category_id: update.categoryId,  // This is the key change
        author: currentItem.author || 'Joshua Payne',
        difficulty: currentItem.difficulty || 'Intermediate',
        is_featured: currentItem.is_featured || false,
        metadata: currentItem.metadata || {}
      };
      
      try {
        const response = await fetch(`http://localhost:3000/api/admin/items/${update.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatePayload)
        });
        
        if (response.ok) {
          console.log(`✅ ${currentItem.title.substring(0, 50)}... → ${update.category}`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`❌ Failed to update ${update.id}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${update.id}: ${error.message}`);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    console.log(`\n🎉 Category update complete!`);
    console.log(`   ✅ Successfully updated: ${successCount}/${updates.length} items`);
    console.log(`   🔄 Refresh your browser to see the changes`);
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the update
updateCategories();