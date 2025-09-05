-- Sample test data for Prompt Vault

-- Insert test items
INSERT OR REPLACE INTO vault_items (id, title, description, content, type, category_id, author, difficulty, is_featured) VALUES 
(1, 'Email Marketing Campaign Prompt', 'Create compelling email marketing campaigns', 'Create an engaging email marketing campaign for [PRODUCT/SERVICE] targeting [TARGET_AUDIENCE]. 

Include:
- Subject line that gets 30%+ open rates
- Compelling hook in first 2 sentences  
- Value proposition clearly stated
- Social proof or testimonials
- Clear call-to-action
- P.S. line for additional engagement

Tone: [PROFESSIONAL/CASUAL/URGENT]
Length: [SHORT/MEDIUM/LONG]
Goal: [SALES/AWARENESS/ENGAGEMENT]', 'prompt', 1, 'Joshua Payne', 'Beginner', 1),

(2, 'Content Strategy Framework', 'Complete framework for content planning', 'CONTENT STRATEGY FRAMEWORK

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
- Update strategy monthly', 'framework', 2, 'Joshua Payne', 'Intermediate', 1),

(3, 'Social Media Growth Workflow', 'Step-by-step social media growth process', 'SOCIAL MEDIA GROWTH WORKFLOW

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
   - Plan tomorrow''s content

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
- Goal setting for next month', 'workflow', 1, 'Joshua Payne', 'Beginner', 0);

-- Update search index
INSERT INTO vault_search(rowid, title, description, content) 
SELECT id, title, description, content FROM vault_items WHERE id <= 3;