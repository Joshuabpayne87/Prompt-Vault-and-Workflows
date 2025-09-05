import fs from 'fs';
import axios from 'axios';

const API_BASE = 'https://24b860c3.prompt-vault-2025.pages.dev';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiZXhwIjoxNzU2ODY0OTkyfQ.a3TGlQM_y71mUciJVgwMbOgrUYE3t72xnBtHUfIn5eE';

async function addKnowledgeBase(item) {
  try {
    const response = await axios.post(`${API_BASE}/api/admin/items`, item, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Added: ${item.title}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to add ${item.title}:`, error.response?.data || error.message);
  }
}

async function main() {
  const knowledgeBases = JSON.parse(fs.readFileSync('knowledge_bases.json', 'utf8'));
  
  console.log(`📚 Adding ${knowledgeBases.length} knowledge bases...\n`);
  
  for (const kb of knowledgeBases) {
    await addKnowledgeBase(kb);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Finished adding knowledge bases!');
}

main().catch(console.error);