const fs = require('fs');

// Read the knowledge bases data
const completeKnowledgeBases = JSON.parse(fs.readFileSync('./complete_knowledge_bases.json', 'utf8'));
const remainingKnowledgeBases = JSON.parse(fs.readFileSync('./remaining_20_knowledge_bases.json', 'utf8'));

// Combine all knowledge bases
const allKnowledgeBases = [...completeKnowledgeBases, ...remainingKnowledgeBases];

// Additional prompts, workflows, and frameworks
const additionalContent = [
  {
    title: "Email Marketing Campaign Prompt",
    description: "Create compelling email marketing campaigns",
    content: `Create an engaging email marketing campaign for [PRODUCT/SERVICE] targeting [TARGET_AUDIENCE]. 

Include:
- Subject line that gets 30%+ open rates
- Compelling hook in first 2 sentences  
- Value proposition clearly stated
- Social proof or testimonials
- Clear call-to-action
- P.S. line for additional engagement

Tone: [PROFESSIONAL/CASUAL/URGENT]
Length: [SHORT/MEDIUM/LONG]
Goal: [SALES/AWARENESS/ENGAGEMENT]`,
    type: "prompt",
    category_id: 1,
    difficulty: "Beginner",
    is_featured: 1
  },
  {
    title: "Content Strategy Framework",
    description: "Complete framework for content planning",
    content: `CONTENT STRATEGY FRAMEWORK

## 1. AUDIENCE RESEARCH
- Demographics & psychographics
- Pain points & challenges  
- Content consumption habits
- Platform preferences

## 2. CONTENT PILLARS (70-20-10 Rule)
- 70% Educational/Value-driven
- 20% Behind-the-scenes/Personal
- 10% Promotional

## 3. CONTENT CALENDAR
- Monthly themes
- Weekly focus areas
- Daily posting schedule
- Content types rotation

## 4. PERFORMANCE METRICS
- Engagement rates
- Reach & impressions
- Lead generation
- Conversion tracking

## 5. OPTIMIZATION PROCESS
- A/B test headlines
- Analyze best performing content
- Refine posting times
- Update strategy monthly`,
    type: "framework",
    category_id: 2,
    difficulty: "Intermediate",
    is_featured: 1
  },
  {
    title: "Social Media Growth Workflow",
    description: "Step-by-step social media growth process",
    content: `SOCIAL MEDIA GROWTH WORKFLOW

## DAILY TASKS (30 minutes)
1. **Morning (10 mins)**
   - Check analytics from previous day
   - Respond to comments/DMs
   - Schedule 1 engaging story

2. **Midday (10 mins)**  
   - Engage with 20 target accounts
   - Like, comment meaningfully
   - Share 1 valuable story/repost

3. **Evening (10 mins)**
   - Post main content piece
   - Engage with commenters
   - Plan tomorrow's content

## WEEKLY TASKS (2 hours)
- Content batch creation (1 hour)
- Hashtag research (15 mins)  
- Competitor analysis (15 mins)
- Analytics review (15 mins)
- Strategy adjustment (15 mins)

## MONTHLY REVIEWS
- Growth metrics analysis
- Content performance audit
- Strategy pivots based on data
- Goal setting for next month`,
    type: "workflow",
    category_id: 1,
    difficulty: "Beginner",
    is_featured: 0
  },
  {
    title: "AI Prompt Engineering Guide",
    description: "Master the art of crafting effective AI prompts",
    content: `AI PROMPT ENGINEERING GUIDE

## CORE PRINCIPLES
1. **Be Specific**: Vague prompts yield vague results
2. **Provide Context**: Background information improves accuracy
3. **Set Constraints**: Define format, length, style requirements
4. **Use Examples**: Show desired output format
5. **Iterate**: Refine based on results

## PROMPT STRUCTURE TEMPLATE
### Setup Phase
- Define the AI's role/persona
- Set the context and background
- Specify the task clearly

### Instructions Phase
- Break down complex tasks
- Use numbered steps
- Include format requirements

### Output Phase
- Specify desired format
- Set quality standards
- Include examples if needed

## ADVANCED TECHNIQUES
### Chain of Thought
"Let's think through this step by step..."

### Few-Shot Learning
Provide 2-3 examples of input/output pairs

### Role Playing
"You are an expert [ROLE] with [X] years of experience..."

### Constraint Setting
"Response must be exactly 100 words"
"Use only bullet points"
"Include at least 3 examples"

## COMMON PROMPT PATTERNS
### Analysis Pattern
"Analyze [SUBJECT] considering [FACTORS]. Provide insights on [SPECIFIC AREAS]."

### Comparison Pattern
"Compare [A] and [B] across [DIMENSIONS]. Create a table showing [SPECIFIC COMPARISONS]."

### Generation Pattern
"Create a [TYPE] for [AUDIENCE] that [SPECIFIC REQUIREMENTS]. Include [ELEMENTS]."

### Problem-Solving Pattern
"I have [PROBLEM]. Considering [CONSTRAINTS], suggest [NUMBER] solutions that [CRITERIA]."`,
    type: "framework",
    category_id: 6,
    difficulty: "Advanced",
    is_featured: 1
  },
  {
    title: "Business Pitch Deck Framework",
    description: "Create compelling investor presentations",
    content: `BUSINESS PITCH DECK FRAMEWORK

## SLIDE STRUCTURE (10-15 slides)

### 1. TITLE SLIDE
- Company name and tagline
- Your name and title
- Contact information
- Date and location

### 2. PROBLEM STATEMENT
- Clear problem definition
- Market pain points
- Current solutions' limitations
- Why now?

### 3. SOLUTION
- Your unique value proposition
- How you solve the problem
- Key benefits and features
- Demo or visual representation

### 4. MARKET OPPORTUNITY
- Total Addressable Market (TAM)
- Serviceable Addressable Market (SAM)
- Market trends and growth
- Target customer segments

### 5. BUSINESS MODEL
- Revenue streams
- Pricing strategy
- Unit economics
- Customer acquisition cost

### 6. TRACTION
- Key metrics and KPIs
- Customer testimonials
- Revenue growth
- Partnerships and achievements

### 7. COMPETITION
- Competitive landscape
- Your competitive advantages
- Barriers to entry
- Differentiation strategy

### 8. MARKETING & SALES
- Go-to-market strategy
- Sales channels
- Customer acquisition plan
- Partnership strategy

### 9. FINANCIAL PROJECTIONS
- 3-5 year financial forecast
- Key assumptions
- Break-even analysis
- Funding requirements

### 10. TEAM
- Key team members
- Relevant experience
- Advisory board
- Hiring plans

### 11. FUNDING REQUEST
- Amount needed
- Use of funds
- Valuation expectations
- Exit strategy

## PRESENTATION TIPS
- Keep slides visual and minimal text
- Tell a compelling story
- Practice your delivery
- Prepare for tough questions
- Have a clear ask`,
    type: "framework",
    category_id: 2,
    difficulty: "Intermediate",
    is_featured: 1
  }
];

// Generate SQL for all content
let sql = '';

// First, add the knowledge bases as framework type
allKnowledgeBases.forEach((kb, index) => {
  const id = index + 10; // Start from ID 10
  const title = kb.title.replace(/'/g, "''");
  const description = kb.description.replace(/'/g, "''");
  const content = kb.content.replace(/'/g, "''");
  
  sql += `INSERT OR REPLACE INTO vault_items (id, title, description, content, type, category_id, author, difficulty, is_featured, usage_count, rating, rating_count, created_at, updated_at) VALUES (${id}, '${title}', '${description}', '${content}', 'framework', 10, 'Joshua Payne', 'Intermediate', 0, 0, 0, 0, datetime('now'), datetime('now'));\n`;
});

// Add the additional prompts, workflows, and frameworks
additionalContent.forEach((item, index) => {
  const id = index + 100; // Start from ID 100
  const title = item.title.replace(/'/g, "''");
  const description = item.description.replace(/'/g, "''");
  const content = item.content.replace(/'/g, "''");
  
  sql += `INSERT OR REPLACE INTO vault_items (id, title, description, content, type, category_id, author, difficulty, is_featured, usage_count, rating, rating_count, created_at, updated_at) VALUES (${id}, '${title}', '${description}', '${content}', '${item.type}', ${item.category_id}, 'Joshua Payne', '${item.difficulty}', ${item.is_featured}, 0, 0, 0, datetime('now'), datetime('now'));\n`;
});

// Update the search index
sql += `\n-- Update search index\n`;
sql += `DELETE FROM vault_search;\n`;
sql += `INSERT INTO vault_search(rowid, title, description, content) SELECT id, title, description, content FROM vault_items;\n`;

// Write to file
fs.writeFileSync('./restore_content.sql', sql);
console.log(`Generated SQL file with ${allKnowledgeBases.length + additionalContent.length} items`);
console.log('Knowledge bases:', allKnowledgeBases.length);
console.log('Additional content:', additionalContent.length);