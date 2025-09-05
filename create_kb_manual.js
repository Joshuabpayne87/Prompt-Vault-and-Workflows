import axios from 'axios';

const API_BASE = 'https://24b860c3.prompt-vault-2025.pages.dev';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiZXhwIjoxNzU2ODY0OTkyfQ.a3TGlQM_y71mUciJVgwMbOgrUYE3t72xnBtHUfIn5eE';

const knowledgeBases = [
  {
    title: "Digital Marketing & SEO Knowledge Base",
    description: "Comprehensive digital marketing knowledge covering SEO, SEM, content marketing, social media, email marketing, and analytics. Perfect for marketing GPTs, content creation assistants, and digital strategy advisors.",
    content: `# DIGITAL MARKETING & SEO KNOWLEDGE BASE

## SEARCH ENGINE OPTIMIZATION (SEO)

### On-Page SEO Fundamentals
- **Title Tags**: 50-60 characters, include primary keyword, brand name at end
- **Meta Descriptions**: 150-160 characters, compelling copy with call-to-action
- **Header Structure**: H1 (one per page), H2-H6 hierarchical structure
- **URL Structure**: Short, descriptive, include target keywords, avoid parameters
- **Internal Linking**: Link to relevant pages, use descriptive anchor text
- **Image Optimization**: Alt text, file names, compression, responsive sizing
- **Page Speed**: Core Web Vitals, mobile optimization, caching strategies
- **Content Quality**: Original, valuable, comprehensive, user-focused

### Keyword Research & Strategy
- **Primary Keywords**: High volume, relevant, achievable difficulty
- **Long-tail Keywords**: Specific, lower competition, higher intent
- **Semantic Keywords**: Related terms, synonyms, context
- **Keyword Mapping**: One primary keyword per page
- **Search Intent**: Informational, navigational, commercial, transactional

## CONTENT MARKETING STRATEGY

### Content Planning & Creation
- **Content Audit**: Inventory existing content, identify gaps
- **Editorial Calendar**: Plan topics, publish dates, content types
- **Content Pillars**: Core themes aligned with business goals
- **Content Formats**: Blog posts, videos, infographics, podcasts, case studies

This knowledge base serves as a comprehensive reference for digital marketing professionals, marketing GPTs, and businesses looking to improve their online presence.`,
    type: "knowledge_base",
    category_id: 16,
    author: "Marketing Expert",
    difficulty: "intermediate"
  },
  {
    title: "Software Development Best Practices Knowledge Base",
    description: "Complete software development methodology covering coding standards, architecture patterns, testing strategies, DevOps practices, and team collaboration. Essential for developer GPTs, code review assistants, and technical project management.",
    content: `# SOFTWARE DEVELOPMENT BEST PRACTICES KNOWLEDGE BASE

## CODE QUALITY & STANDARDS

### Clean Code Principles
- **Meaningful Names**: Use intention-revealing, pronounceable, searchable names
- **Functions**: Small, single responsibility, descriptive names, minimal arguments
- **Comments**: Explain why, not what; avoid redundant comments
- **Formatting**: Consistent indentation, line length, spacing, team standards
- **Error Handling**: Use exceptions, don't return null, fail fast principles
- **Classes**: Single responsibility, open/closed principle, small and focused

### SOLID Principles
- **Single Responsibility**: One reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

## TESTING STRATEGIES

### Testing Pyramid
- **Unit Tests (70%)**: Test individual functions/methods in isolation
- **Integration Tests (20%)**: Test component interactions, API endpoints
- **End-to-End Tests (10%)**: Test complete user workflows, UI interactions

This knowledge base provides comprehensive guidance for software development teams and development GPTs.`,
    type: "knowledge_base",
    category_id: 16,
    author: "Senior Software Architect",
    difficulty: "advanced"
  }
];

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
    if (error.response?.data) {
      console.error('Response details:', error.response.data);
    }
  }
}

async function main() {
  console.log(`📚 Adding ${knowledgeBases.length} knowledge bases...\\n`);
  
  for (const kb of knowledgeBases) {
    await addKnowledgeBase(kb);
    await new Promise(resolve => setTimeout(resolve, 500)); // Longer delay
  }
  
  console.log('\\n🎉 Finished adding knowledge bases!');
}

main().catch(console.error);