// This file contains the knowledge bases to add via the browser interface
// Since the API is having issues, we'll provide these for manual addition

const knowledgeBases = [
  {
    title: "Digital Marketing & SEO Master Guide",
    description: "Complete digital marketing knowledge base covering SEO, SEM, content marketing, social media strategies, email marketing, and analytics. Perfect for marketing GPTs, content creation assistants, and digital strategy advisors.",
    content: `# DIGITAL MARKETING & SEO MASTER GUIDE

## SEARCH ENGINE OPTIMIZATION
### On-Page SEO Fundamentals
- Title Tags: 50-60 characters, include primary keyword
- Meta Descriptions: 150-160 characters, compelling CTA  
- Header Structure: H1 (one per page), logical H2-H6 hierarchy
- URL Structure: Short, descriptive, keyword-rich
- Internal Linking: Relevant pages, descriptive anchor text
- Image Optimization: Alt text, file names, compression

### Technical SEO
- XML Sitemaps submission and maintenance
- Robots.txt optimization
- Schema markup for rich snippets
- Mobile-first indexing compliance
- Core Web Vitals optimization
- SSL certificate implementation

### Keyword Research Strategy
- Primary keywords: High volume, relevant, achievable
- Long-tail keywords: Specific, lower competition
- Search intent analysis: Informational, navigational, commercial, transactional
- Competitor keyword gap analysis
- Semantic keyword clustering

## CONTENT MARKETING
### Content Strategy Framework
- Content audit and gap analysis
- Editorial calendar planning
- Content pillar development
- Multi-format content creation
- Content distribution channels
- Performance measurement and optimization

### Social Media Marketing
- Platform-specific strategies (LinkedIn, Facebook, Instagram, Twitter)
- Content calendar management
- Community engagement tactics
- Influencer collaboration frameworks
- Social commerce integration
- Crisis management protocols

## PAID ADVERTISING
### Google Ads Optimization
- Campaign structure and organization
- Keyword match types and negative keywords
- Ad extensions and quality score improvement
- Bidding strategies and budget allocation
- Landing page optimization
- Conversion tracking and attribution

### Meta Ads Management
- Campaign objective selection
- Audience targeting and custom audiences
- Creative testing and optimization
- Pixel implementation and event tracking
- Lookalike audience development
- iOS 14+ privacy considerations

## EMAIL MARKETING
### Campaign Development
- List building and segmentation strategies
- Email automation workflows
- Personalization and dynamic content
- A/B testing methodologies
- Deliverability optimization
- Performance analytics and KPIs

## ANALYTICS & MEASUREMENT
### Google Analytics 4 Implementation
- Event tracking and conversion goals
- Custom dimensions and metrics
- Attribution modeling
- Audience insights and segmentation
- E-commerce tracking
- Data-driven decision making

Use this knowledge base for: Marketing strategy development, campaign optimization, SEO audits, content planning, advertising management, and comprehensive digital marketing education.`,
    author: "Marketing Expert",
    difficulty: "intermediate"
  },
  {
    title: "Software Development & Engineering Excellence",
    description: "Comprehensive software engineering knowledge base covering clean code principles, architecture patterns, testing strategies, DevOps practices, and team collaboration methodologies. Essential for developer GPTs and technical project management.",
    content: `# SOFTWARE DEVELOPMENT & ENGINEERING EXCELLENCE

## CLEAN CODE PRINCIPLES
### Naming Conventions
- Use intention-revealing names
- Choose pronounceable and searchable names
- Avoid mental mapping and encoded names
- Use solution domain names when appropriate
- Add meaningful context without gratuitous prefixes

### Function Design
- Keep functions small (20 lines or fewer)
- Single responsibility principle
- Descriptive function names
- Minimize function arguments (3 or fewer)
- Avoid side effects and output arguments
- Command Query Separation

### Code Organization
- Consistent formatting and indentation
- Meaningful comments explaining 'why' not 'what'
- Error handling with exceptions
- Don't return null values
- Fail fast principle implementation

## SOFTWARE ARCHITECTURE
### Design Patterns
**Creational Patterns:**
- Singleton: Controlled instance creation
- Factory Method: Object creation without specifying classes
- Builder: Complex object construction
- Abstract Factory: Families of related objects

**Structural Patterns:**
- Adapter: Interface compatibility
- Decorator: Dynamic behavior addition
- Facade: Simplified complex system interface
- Composite: Part-whole hierarchies

**Behavioral Patterns:**
- Observer: One-to-many notifications
- Strategy: Algorithm encapsulation
- Command: Request encapsulation
- State: State-dependent behavior

### SOLID Principles
- Single Responsibility: One reason to change
- Open/Closed: Open for extension, closed for modification
- Liskov Substitution: Subtypes must be substitutable
- Interface Segregation: Client-specific interfaces
- Dependency Inversion: Depend on abstractions

## TESTING STRATEGIES
### Testing Pyramid
- Unit Tests (70%): Fast, isolated, numerous
- Integration Tests (20%): Component interactions
- End-to-End Tests (10%): Complete workflows

### Test-Driven Development
- Red: Write failing test
- Green: Write minimal passing code
- Refactor: Improve code quality
- Benefits: Better design, documentation, confidence

Use this knowledge base for: Code reviews, architecture decisions, development team training, technical interviews, project planning, and engineering best practices implementation.`,
    author: "Senior Software Architect", 
    difficulty: "advanced"
  }
];

console.log("Knowledge bases ready for manual addition:");
console.log("1. Go to https://24b860c3.prompt-vault-2025.pages.dev/admin");
console.log("2. Login with password: Prompts123");
console.log("3. Click 'Add New Item'");
console.log("4. Select type: 'knowledge_base'");
console.log("5. Select category: 'Knowledge Bases'");
console.log("6. Copy and paste the content from this file");

export default knowledgeBases;