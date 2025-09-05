// Admin Panel JavaScript
let authToken = localStorage.getItem('adminToken');

// Check if user is authenticated
function isAuthenticated() {
    return authToken !== null;
}

// Login functionality
function showLogin() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Admin Login
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Access the Prompt Vault admin panel
                    </p>
                </div>
                <form class="mt-8 space-y-6" id="loginForm">
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input id="password" name="password" type="password" required 
                               class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                               placeholder="Admin Password">
                    </div>
                    
                    <div id="errorMessage" class="text-red-600 text-sm text-center" style="display: none;"></div>
                    
                    <div>
                        <button type="submit" 
                                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            authToken = result.token;
            localStorage.setItem('adminToken', authToken);
            showAdminDashboard();
        } else {
            errorDiv.textContent = result.message || 'Invalid password';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <header class="bg-white shadow">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex items-center">
                            <h1 class="text-3xl font-bold text-gray-900">
                                <i class="fas fa-cog mr-2 text-blue-600"></i>
                                Admin Panel
                            </h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="/" class="text-gray-600 hover:text-gray-900">
                                <i class="fas fa-home mr-1"></i>View Site
                            </a>
                            <button id="logoutBtn" class="text-red-600 hover:text-red-700">
                                <i class="fas fa-sign-out-alt mr-1"></i>Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Navigation Tabs -->
            <nav class="bg-white shadow">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex space-x-8">
                        <button id="itemsTab" class="py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 whitespace-nowrap" onclick="showItemsView()">
                            <i class="fas fa-file-alt mr-2"></i>Items
                        </button>
                        <button id="categoriesTab" class="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap" onclick="showCategoriesView()">
                            <i class="fas fa-tags mr-2"></i>Categories
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" id="mainContent">
                <!-- Content will be loaded here dynamically -->
            </main>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Load data
    loadCategoriesAndTags();
    
    // Show items view by default
    showItemsView();
}

// Load admin items
async function loadAdminItems() {
    try {
        const response = await fetch('/api/admin/items', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        allItems = data.items || []; // Store globally for filtering
        displayAdminItems(data.items || []);
        updateStats(data.items || []);
    } catch (error) {
        console.error('Error loading admin items:', error);
        document.getElementById('itemsList').innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-600">Error loading items</p>
            </div>
        `;
    }
}

// Display admin items in table
function displayAdminItems(items) {
    const itemsList = document.getElementById('itemsList');
    
    if (items.length === 0) {
        itemsList.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">No items found</p>
            </div>
        `;
        return;
    }
    
    const itemsHtml = items.map(item => `
        <div class="border-b border-gray-200 px-4 py-4 flex justify-between items-center">
            <div class="flex-1">
                <div class="flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)} mr-3">
                        ${item.type}
                    </span>
                    <h4 class="text-sm font-medium text-gray-900">${item.title}</h4>
                </div>
                <p class="mt-1 text-sm text-gray-500">${item.description?.substring(0, 100)}...</p>
                <div class="mt-2 flex items-center text-xs text-gray-500">
                    <span class="mr-4">
                        <i class="fas fa-user mr-1"></i>${item.author || 'Joshua Payne'}
                    </span>
                    <span class="mr-4">
                        <i class="fas fa-eye mr-1"></i>${item.usage_count || 0} views
                    </span>
                    <span class="mr-4">
                        <i class="fas fa-star mr-1"></i>${item.rating || 0}/5
                    </span>
                    ${item.is_featured ? '<span class="text-yellow-600"><i class="fas fa-star mr-1"></i>Featured</span>' : ''}
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button class="text-blue-600 hover:text-blue-700" onclick="editItem(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-700" onclick="deleteItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    itemsList.innerHTML = itemsHtml;
}

// Get type color class
function getTypeColor(type) {
    switch(type) {
        case 'prompt': return 'bg-blue-100 text-blue-800';
        case 'workflow': return 'bg-green-100 text-green-800';
        case 'framework': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Update stats
function updateStats(items) {
    const total = items.length;
    const prompts = items.filter(item => item.type === 'prompt').length;
    const workflows = items.filter(item => item.type === 'workflow').length;
    const frameworks = items.filter(item => item.type === 'framework').length;
    
    document.getElementById('statsTotal').textContent = total;
    document.getElementById('statsPrompts').textContent = prompts;
    document.getElementById('statsWorkflows').textContent = workflows;
    document.getElementById('statsFrameworks').textContent = frameworks;
}

// Show create form
function showCreateForm() {
    showItemForm();
}

// Edit item
async function editItem(id) {
    try {
        const response = await fetch(`/api/admin/items`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        const item = data.items.find(item => item.id === id);
        
        if (item) {
            showItemForm(item);
        } else {
            alert('Item not found');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        alert('Failed to load item for editing');
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadAdminItems(); // Reload the list
        } else {
            alert('Failed to delete item');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting item');
    }
}

// Logout
function logout() {
    authToken = null;
    localStorage.removeItem('adminToken');
    showLogin();
}

// Global variables for categories and tags
let allCategories = [];
let allTags = [];

// Load categories and tags
async function loadCategoriesAndTags() {
    try {
        // Load categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        allCategories = categoriesData.categories || [];
        
        // Load tags
        const tagsResponse = await fetch('/api/tags');
        const tagsData = await tagsResponse.json();
        allTags = tagsData.tags || [];
    } catch (error) {
        console.error('Error loading categories and tags:', error);
    }
}

// Show item form (create or edit)
async function showItemForm(item = null) {
    const isEdit = item !== null;
    const title = isEdit ? 'Edit Item' : 'Create New Item';
    
    // Ensure categories and tags are loaded
    if (allCategories.length === 0) {
        await loadCategoriesAndTags();
    }
    
    const formHtml = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">${title}</h2>
                    <button onclick="closeItemForm()" class="text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="itemForm" class="space-y-6">
                    <!-- Basic Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                            <input type="text" id="itemTitle" required 
                                   value="${item?.title || ''}"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Author</label>
                            <input type="text" id="itemAuthor" 
                                   value="${item?.author || 'Joshua Payne'}"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                    
                    <!-- Type and Category -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                            <select id="itemType" required 
                                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Select Type</option>
                                <option value="prompt" ${item?.type === 'prompt' ? 'selected' : ''}>Prompt</option>
                                <option value="workflow" ${item?.type === 'workflow' ? 'selected' : ''}>Workflow</option>
                                <option value="framework" ${item?.type === 'framework' ? 'selected' : ''}>Framework</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select id="itemCategory" required 
                                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Select Category</option>
                                ${allCategories.map(cat => `
                                    <option value="${cat.id}" ${item?.category_id == cat.id ? 'selected' : ''}>
                                        ${cat.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                            <select id="itemDifficulty" 
                                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="beginner" ${item?.difficulty === 'beginner' ? 'selected' : ''}>Beginner</option>
                                <option value="intermediate" ${item?.difficulty === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                                <option value="advanced" ${item?.difficulty === 'advanced' ? 'selected' : ''}>Advanced</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea id="itemDescription" required rows="3"
                                  placeholder="Brief description of what this ${item?.type || 'item'} does..."
                                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${item?.description || ''}</textarea>
                    </div>
                    
                    <!-- Content -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                        <div class="mb-2 text-sm text-gray-600">
                            <strong>Tips:</strong> Use markdown formatting. For prompts, include clear instructions and examples. 
                            For workflows, use numbered steps. For frameworks, include sections and bullet points.
                        </div>
                        <textarea id="itemContent" required rows="20"
                                  placeholder="Enter the main content here..."
                                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm">${item?.content || ''}</textarea>
                    </div>
                    
                    <!-- Settings -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" id="itemFeatured" 
                                       ${item?.is_featured ? 'checked' : ''}
                                       class="rounded">
                                <span class="text-sm font-medium text-gray-700">Featured Item</span>
                            </label>
                            <p class="text-xs text-gray-500 mt-1">Featured items appear prominently on the homepage</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                            <input type="text" id="itemEstimatedTime" 
                                   value="${item?.estimated_time || ''}"
                                   placeholder="e.g., 15 minutes, 2-3 hours"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                    
                    <!-- Metadata (JSON) -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Additional Metadata (JSON)</label>
                        <textarea id="itemMetadata" rows="4"
                                  placeholder='{"specialties": ["coaching", "strategy"], "tools_needed": ["CRM", "Analytics"]}'
                                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm">${item?.metadata ? JSON.stringify(JSON.parse(item.metadata), null, 2) : ''}</textarea>
                        <p class="text-xs text-gray-500 mt-1">Optional: JSON object with additional properties like specialties, tools needed, etc.</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex justify-end space-x-3 pt-6 border-t">
                        <button type="button" onclick="closeItemForm()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>
                            ${isEdit ? 'Update' : 'Create'} Item
                        </button>
                    </div>
                </form>
                
                <!-- Loading State -->
                <div id="formLoading" class="hidden absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                    <div class="text-center">
                        <i class="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
                        <p class="text-gray-600">Saving...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHtml);
    
    // Add form submit handler
    document.getElementById('itemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem(item?.id);
    });
    
    // Add content templates based on type
    document.getElementById('itemType').addEventListener('change', function() {
        const type = this.value;
        const contentArea = document.getElementById('itemContent');
        if (!contentArea.value && type) {
            contentArea.value = getContentTemplate(type);
        }
    });
}

// Get content template based on type
function getContentTemplate(type) {
    const templates = {
        prompt: `You are an expert [ROLE] with [X]+ years of experience in [DOMAIN]. Your specialty is helping [TARGET AUDIENCE] achieve [DESIRED OUTCOME].

## Your Core Expertise
- [Key area 1]
- [Key area 2] 
- [Key area 3]

## Your Approach
- [Philosophy or methodology]
- [Key principles]

## Instructions
[Detailed instructions for the AI on how to respond, what questions to ask, what format to use]

## Response Guidelines
- [Tone and style]
- [Structure requirements]
- [What to include/exclude]

## Example Response
[Show an example of the desired output]

Remember: [Key reminders for consistent performance]`,

        workflow: `# [Workflow Name]

## Overview
[Brief description of what this workflow accomplishes and when to use it]

## Prerequisites  
- [Requirement 1]
- [Requirement 2]
- [Required tools/resources]

## Phase 1: [Phase Name] (Timeline)
### Step 1: [Action Item]
- **Objective:** [What this step achieves]
- **Actions:** [Specific tasks to complete]
- **Deliverable:** [Expected output]
- **Duration:** [Time estimate]

### Step 2: [Action Item]
[Continue with detailed steps...]

## Phase 2: [Phase Name] (Timeline)
[Continue with phases and steps...]

## Success Metrics
- [How to measure success]
- [Key performance indicators]

## Common Pitfalls
- [What to avoid]
- [Troubleshooting tips]

## Resources & Tools
- [Required tools]
- [Helpful resources]`,

        framework: `# [Framework Name]

## Framework Overview
[Description of what this framework is for and its core purpose]

## Core Components
### Component 1: [Name]
- **Definition:** [What this component is]
- **Purpose:** [Why it matters]
- **Implementation:** [How to apply it]

### Component 2: [Name] 
[Continue with components...]

## Implementation Process
### Step 1: [Phase Name]
1. [Action item]
2. [Action item]
3. [Action item]

### Step 2: [Phase Name]
[Continue with implementation steps...]

## Assessment & Measurement
- **Key Metrics:** [How to measure success]
- **Evaluation Criteria:** [What good looks like]
- **Review Process:** [When and how to assess]

## Best Practices
- [Guideline 1]
- [Guideline 2]
- [Guideline 3]

## Common Applications
- [Use case 1]
- [Use case 2]
- [Use case 3]

## Advanced Techniques
[More sophisticated applications of the framework]

This framework scales from [simple applications] to [complex applications] and can be adapted for [different contexts].`
    };
    
    return templates[type] || '';
}

// Save item (create or update)
async function saveItem(itemId = null) {
    const isEdit = itemId !== null;
    const loadingDiv = document.getElementById('formLoading');
    
    try {
        loadingDiv.classList.remove('hidden');
        
        // Collect form data
        const formData = {
            title: document.getElementById('itemTitle').value.trim(),
            description: document.getElementById('itemDescription').value.trim(),
            content: document.getElementById('itemContent').value.trim(),
            type: document.getElementById('itemType').value,
            category_id: parseInt(document.getElementById('itemCategory').value),
            author: document.getElementById('itemAuthor').value.trim() || 'Joshua Payne',
            difficulty: document.getElementById('itemDifficulty').value,
            is_featured: document.getElementById('itemFeatured').checked,
            estimated_time: document.getElementById('itemEstimatedTime').value.trim()
        };
        
        // Handle metadata
        const metadataText = document.getElementById('itemMetadata').value.trim();
        if (metadataText) {
            try {
                formData.metadata = JSON.parse(metadataText);
            } catch (e) {
                alert('Invalid JSON in metadata field. Please check the format.');
                loadingDiv.classList.add('hidden');
                return;
            }
        } else {
            formData.metadata = {};
        }
        
        // Add estimated_time to metadata if provided
        if (formData.estimated_time) {
            formData.metadata.estimated_time = formData.estimated_time;
        }
        
        // Validate required fields
        if (!formData.title || !formData.description || !formData.content || !formData.type || !formData.category_id) {
            alert('Please fill in all required fields.');
            loadingDiv.classList.add('hidden');
            return;
        }
        
        // Send request
        const url = isEdit ? `/api/admin/items/${itemId}` : '/api/admin/items';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const result = await response.json();
        
        if (result.success) {
            closeItemForm();
            loadAdminItems(); // Refresh the list
            alert(isEdit ? 'Item updated successfully!' : 'Item created successfully!');
        } else {
            alert(result.error || 'Failed to save item');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item. Please try again.');
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

// Close item form
function closeItemForm() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Show category manager
function showCategoryManager() {
    const modalHtml = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Manage Categories</h2>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Add New Category Form -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-semibold mb-4">Add New Category</h3>
                    <form id="categoryForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" id="categoryName" placeholder="Category Name" required
                               class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500">
                        <input type="text" id="categoryDescription" placeholder="Description"
                               class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500">
                        <input type="color" id="categoryColor" value="#3B82F6"
                               class="border border-gray-300 rounded-md px-3 py-2 h-10">
                        <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                            <i class="fas fa-plus mr-2"></i>Add
                        </button>
                    </form>
                </div>
                
                <!-- Categories List -->
                <div id="categoriesList" class="space-y-2">
                    <!-- Categories will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Load categories
    loadCategoriesList();
    
    // Add form handler
    document.getElementById('categoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await createCategory();
    });
}

// Show tag manager
function showTagManager() {
    const modalHtml = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Manage Tags</h2>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Add New Tag Form -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-semibold mb-4">Add New Tag</h3>
                    <form id="tagForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" id="tagName" placeholder="Tag Name" required
                               class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500">
                        <input type="text" id="tagDescription" placeholder="Description"
                               class="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500">
                        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>Add
                        </button>
                    </form>
                </div>
                
                <!-- Tags List -->
                <div id="tagsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Tags will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Load tags
    loadTagsList();
    
    // Add form handler
    document.getElementById('tagForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await createTag();
    });
}

// Load categories list
async function loadCategoriesList() {
    try {
        const response = await fetch('/api/admin/categories', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        const categoriesList = document.getElementById('categoriesList');
        
        if (data.categories && data.categories.length > 0) {
            categoriesList.innerHTML = data.categories.map(category => `
                <div class="flex items-center justify-between p-4 bg-white border rounded-lg">
                    <div class="flex items-center space-x-4">
                        <div class="w-4 h-4 rounded" style="background-color: ${category.color}"></div>
                        <div>
                            <h4 class="font-medium">${category.name}</h4>
                            <p class="text-sm text-gray-500">${category.description || 'No description'}</p>
                        </div>
                    </div>
                    <button onclick="deleteCategory(${category.id})" 
                            class="text-red-600 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        } else {
            categoriesList.innerHTML = '<p class="text-gray-500 text-center py-4">No categories found</p>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load tags list
async function loadTagsList() {
    try {
        const response = await fetch('/api/admin/tags', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        const tagsList = document.getElementById('tagsList');
        
        if (data.tags && data.tags.length > 0) {
            tagsList.innerHTML = data.tags.map(tag => `
                <div class="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div>
                        <h4 class="font-medium text-sm">#${tag.name}</h4>
                        <p class="text-xs text-gray-500">${tag.description || 'No description'}</p>
                    </div>
                    <button onclick="deleteTag(${tag.id})" 
                            class="text-red-600 hover:text-red-700 text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        } else {
            tagsList.innerHTML = '<p class="text-gray-500 text-center py-4 col-span-full">No tags found</p>';
        }
    } catch (error) {
        console.error('Error loading tags:', error);
    }
}

// Create category
async function createCategory() {
    try {
        const formData = {
            name: document.getElementById('categoryName').value.trim(),
            description: document.getElementById('categoryDescription').value.trim(),
            color: document.getElementById('categoryColor').value
        };
        
        if (!formData.name) {
            alert('Category name is required');
            return;
        }
        
        const response = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryColor').value = '#3B82F6';
            
            // Reload lists
            loadCategoriesList();
            loadCategoriesAndTags(); // Refresh global cache
        } else {
            alert(result.error || 'Failed to create category');
        }
    } catch (error) {
        console.error('Error creating category:', error);
        alert('Error creating category');
    }
}

// Create tag
async function createTag() {
    try {
        const formData = {
            name: document.getElementById('tagName').value.trim(),
            description: document.getElementById('tagDescription').value.trim()
        };
        
        if (!formData.name) {
            alert('Tag name is required');
            return;
        }
        
        const response = await fetch('/api/admin/tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            document.getElementById('tagForm').reset();
            
            // Reload lists
            loadTagsList();
            loadCategoriesAndTags(); // Refresh global cache
        } else {
            alert(result.error || 'Failed to create tag');
        }
    } catch (error) {
        console.error('Error creating tag:', error);
        alert('Error creating tag');
    }
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadCategoriesList();
            loadCategoriesAndTags();
        } else {
            alert(result.error || 'Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
    }
}

// Delete tag
async function deleteTag(id) {
    if (!confirm('Are you sure you want to delete this tag?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/tags/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadTagsList();
            loadCategoriesAndTags();
        } else {
            alert(result.error || 'Failed to delete tag');
        }
    } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Error deleting tag');
    }
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// ===== ANNOUNCEMENT MANAGEMENT =====

// Show announcement manager
function showAnnouncementManager() {
    const modalHtml = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">
                        <i class="fas fa-bullhorn mr-2 text-yellow-600"></i>
                        Manage Announcements
                    </h2>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Create New Announcement Button -->
                <div class="mb-6">
                    <button onclick="showAnnouncementForm()" class="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 transition">
                        <i class="fas fa-plus mr-2"></i>Create New Announcement
                    </button>
                </div>
                
                <!-- Announcements List -->
                <div id="announcementsList" class="space-y-4">
                    <!-- Announcements will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    loadAnnouncementsList();
}

// Load announcements list
async function loadAnnouncementsList() {
    try {
        const response = await fetch('/api/admin/announcements', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        const announcementsList = document.getElementById('announcementsList');
        
        if (data.announcements && data.announcements.length > 0) {
            announcementsList.innerHTML = data.announcements.map(announcement => `
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <h3 class="text-lg font-semibold text-gray-900">${announcement.title}</h3>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnnouncementTypeColor(announcement.type)}">
                                    ${announcement.type}
                                </span>
                                ${announcement.is_active ? 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1"></i>Active</span>' : 
                                    '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><i class="fas fa-pause-circle mr-1"></i>Inactive</span>'
                                }
                            </div>
                            <p class="text-gray-600 mb-3">${announcement.message}</p>
                            
                            <!-- Preview -->
                            <div class="bg-gray-50 border-l-4 p-3 rounded text-sm" style="border-left-color: ${announcement.background_color}; background-color: ${announcement.background_color}20;">
                                <div class="flex items-center text-black" style="color: ${announcement.text_color};">
                                    ${announcement.show_icon ? `<i class="${announcement.icon_class} mr-2"></i>` : ''}
                                    <span class="font-semibold">${announcement.title}</span>
                                    ${announcement.link_url ? `<a href="${announcement.link_url}" class="ml-2 underline">${announcement.link_text}</a>` : ''}
                                </div>
                                <div class="mt-1" style="color: ${announcement.text_color};">${announcement.message}</div>
                                ${announcement.image_url ? `<img src="${announcement.image_url}" alt="Announcement" class="mt-2 max-h-20 object-contain">` : ''}
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex items-center space-x-2 ml-4">
                            <button onclick="editAnnouncement(${announcement.id})" 
                                    class="text-blue-600 hover:text-blue-700 p-2">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteAnnouncement(${announcement.id})" 
                                    class="text-red-600 hover:text-red-700 p-2">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Metadata -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 border-t pt-3">
                        <div>
                            <span class="font-medium">Priority:</span> ${announcement.priority || 0}
                        </div>
                        <div>
                            <span class="font-medium">Start:</span> ${announcement.start_date ? new Date(announcement.start_date).toLocaleDateString() : 'Immediate'}
                        </div>
                        <div>
                            <span class="font-medium">End:</span> ${announcement.end_date ? new Date(announcement.end_date).toLocaleDateString() : 'No end date'}
                        </div>
                        <div>
                            <span class="font-medium">Created:</span> ${new Date(announcement.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            announcementsList.innerHTML = '<p class="text-gray-500 text-center py-8">No announcements found. Create your first announcement!</p>';
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        const announcementsList = document.getElementById('announcementsList');
        if (announcementsList) {
            announcementsList.innerHTML = '<p class="text-red-500 text-center py-8">Error loading announcements</p>';
        }
    }
}

// Get announcement type color
function getAnnouncementTypeColor(type) {
    const colors = {
        'info': 'bg-blue-100 text-blue-800',
        'success': 'bg-green-100 text-green-800',
        'warning': 'bg-yellow-100 text-yellow-800',
        'error': 'bg-red-100 text-red-800',
        'promotion': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

// Show announcement form
function showAnnouncementForm(announcement = null) {
    const isEdit = announcement !== null;
    const title = isEdit ? 'Edit Announcement' : 'Create New Announcement';
    
    const formHtml = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
            <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">${title}</h2>
                    <button onclick="closeAnnouncementForm()" class="text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="announcementForm" class="space-y-6">
                    <!-- Basic Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                            <input type="text" id="announcementTitle" required 
                                   value="${announcement?.title || ''}"
                                   placeholder="🚀 NEW: Amazing Feature Available"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select id="announcementType" 
                                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                                <option value="info" ${announcement?.type === 'info' ? 'selected' : ''}>Info</option>
                                <option value="success" ${announcement?.type === 'success' ? 'selected' : ''}>Success</option>
                                <option value="warning" ${announcement?.type === 'warning' ? 'selected' : ''}>Warning</option>
                                <option value="error" ${announcement?.type === 'error' ? 'selected' : ''}>Error</option>
                                <option value="promotion" ${announcement?.type === 'promotion' ? 'selected' : ''}>Promotion</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Message -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                        <textarea id="announcementMessage" required rows="3"
                                  placeholder="Join TopAIToolbox.app Community - Accelerate your productivity..."
                                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">${announcement?.message || ''}</textarea>
                    </div>
                    
                    <!-- Colors and Icon -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                            <input type="color" id="announcementBgColor" 
                                   value="${announcement?.background_color || '#F59E0B'}"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 h-10">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                            <input type="color" id="announcementTextColor" 
                                   value="${announcement?.text_color || '#000000'}"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 h-10">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Icon Class</label>
                            <input type="text" id="announcementIcon" 
                                   value="${announcement?.icon_class || 'fas fa-rocket'}"
                                   placeholder="fas fa-rocket"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <input type="number" id="announcementPriority" 
                                   value="${announcement?.priority || 0}"
                                   min="0" max="100"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                    </div>
                    
                    <!-- Link Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                            <input type="url" id="announcementLinkUrl" 
                                   value="${announcement?.link_url || ''}"
                                   placeholder="https://www.topaitoolbox.app"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Link Text</label>
                            <input type="text" id="announcementLinkText" 
                                   value="${announcement?.link_text || 'Learn More'}"
                                   placeholder="Join Movement"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                    </div>
                    
                    <!-- Image URL -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                        <input type="url" id="announcementImageUrl" 
                               value="${announcement?.image_url || ''}"
                               placeholder="https://example.com/image.jpg"
                               class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        <p class="text-xs text-gray-500 mt-1">Add an image to make your announcement more engaging</p>
                    </div>
                    
                    <!-- Dates -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date (Optional)</label>
                            <input type="datetime-local" id="announcementStartDate" 
                                   value="${announcement?.start_date ? new Date(announcement.start_date).toISOString().slice(0, 16) : ''}"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                            <input type="datetime-local" id="announcementEndDate" 
                                   value="${announcement?.end_date ? new Date(announcement.end_date).toISOString().slice(0, 16) : ''}"
                                   class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                    </div>
                    
                    <!-- Settings -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" id="announcementActive" 
                                       ${announcement?.is_active !== false ? 'checked' : ''}
                                       class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500">
                                <span class="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <p class="text-xs text-gray-500 mt-1">Only active announcements are displayed to users</p>
                        </div>
                        
                        <div>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" id="announcementShowIcon" 
                                       ${announcement?.show_icon !== false ? 'checked' : ''}
                                       class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500">
                                <span class="text-sm font-medium text-gray-700">Show Icon</span>
                            </label>
                            <p class="text-xs text-gray-500 mt-1">Display the icon alongside the title</p>
                        </div>
                    </div>
                    
                    <!-- Preview -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Live Preview</label>
                        <div id="announcementPreview" class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <!-- Preview will be updated here -->
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex justify-end space-x-3 pt-6 border-t">
                        <button type="button" onclick="closeAnnouncementForm()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>
                            ${isEdit ? 'Update' : 'Create'} Announcement
                        </button>
                    </div>
                </form>
                
                <!-- Loading State -->
                <div id="announcementFormLoading" class="hidden absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                    <div class="text-center">
                        <i class="fas fa-spinner fa-spin text-2xl text-yellow-600 mb-2"></i>
                        <p class="text-gray-600">Saving...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHtml);
    
    // Add form submit handler
    document.getElementById('announcementForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveAnnouncement(announcement?.id);
    });
    
    // Add preview updates
    const previewFields = ['announcementTitle', 'announcementMessage', 'announcementBgColor', 'announcementTextColor', 'announcementIcon', 'announcementLinkUrl', 'announcementLinkText', 'announcementImageUrl', 'announcementShowIcon'];
    previewFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateAnnouncementPreview);
            field.addEventListener('change', updateAnnouncementPreview);
        }
    });
    
    // Initial preview update
    updateAnnouncementPreview();
}

// Update announcement preview
function updateAnnouncementPreview() {
    const title = document.getElementById('announcementTitle')?.value || 'Your Title Here';
    const message = document.getElementById('announcementMessage')?.value || 'Your message here';
    const bgColor = document.getElementById('announcementBgColor')?.value || '#F59E0B';
    const textColor = document.getElementById('announcementTextColor')?.value || '#000000';
    const icon = document.getElementById('announcementIcon')?.value || 'fas fa-rocket';
    const linkUrl = document.getElementById('announcementLinkUrl')?.value || '';
    const linkText = document.getElementById('announcementLinkText')?.value || 'Learn More';
    const imageUrl = document.getElementById('announcementImageUrl')?.value || '';
    const showIcon = document.getElementById('announcementShowIcon')?.checked !== false;
    
    const preview = document.getElementById('announcementPreview');
    if (preview) {
        preview.innerHTML = `
            <div class="rounded-lg p-4 shadow-sm" style="background: linear-gradient(to right, ${bgColor}, ${bgColor}F0); color: ${textColor};">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div class="flex items-center space-x-3">
                        ${showIcon ? `<i class="${icon} text-xl"></i>` : ''}
                        <div>
                            <div class="font-semibold text-lg">${title}</div>
                            <div class="text-sm opacity-90">${message}</div>
                        </div>
                        ${imageUrl ? `<img src="${imageUrl}" alt="Announcement" class="h-12 w-12 object-cover rounded ml-4">` : ''}
                    </div>
                    ${linkUrl ? `<a href="${linkUrl}" class="bg-white bg-opacity-20 px-4 py-2 rounded text-sm font-medium hover:bg-opacity-30 transition">${linkText}</a>` : ''}
                </div>
            </div>
        `;
    }
}

// Save announcement
async function saveAnnouncement(announcementId = null) {
    const isEdit = announcementId !== null;
    const loadingDiv = document.getElementById('announcementFormLoading');
    
    try {
        loadingDiv?.classList.remove('hidden');
        
        // Collect form data
        const formData = {
            title: document.getElementById('announcementTitle').value.trim(),
            message: document.getElementById('announcementMessage').value.trim(),
            type: document.getElementById('announcementType').value,
            background_color: document.getElementById('announcementBgColor').value,
            text_color: document.getElementById('announcementTextColor').value,
            icon_class: document.getElementById('announcementIcon').value.trim(),
            priority: parseInt(document.getElementById('announcementPriority').value) || 0,
            link_url: document.getElementById('announcementLinkUrl').value.trim(),
            link_text: document.getElementById('announcementLinkText').value.trim(),
            image_url: document.getElementById('announcementImageUrl').value.trim(),
            start_date: document.getElementById('announcementStartDate').value || null,
            end_date: document.getElementById('announcementEndDate').value || null,
            is_active: document.getElementById('announcementActive').checked,
            show_icon: document.getElementById('announcementShowIcon').checked
        };
        
        // Validate required fields
        if (!formData.title || !formData.message) {
            alert('Title and message are required.');
            loadingDiv?.classList.add('hidden');
            return;
        }
        
        // Send request
        const url = isEdit ? `/api/admin/announcements/${announcementId}` : '/api/admin/announcements';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const result = await response.json();
        
        if (result.success) {
            closeAnnouncementForm();
            loadAnnouncementsList(); // Refresh the list
            alert(isEdit ? 'Announcement updated successfully!' : 'Announcement created successfully!');
        } else {
            alert(result.error || 'Failed to save announcement');
        }
    } catch (error) {
        console.error('Error saving announcement:', error);
        alert('Error saving announcement. Please try again.');
    } finally {
        loadingDiv?.classList.add('hidden');
    }
}

// Edit announcement
async function editAnnouncement(id) {
    try {
        const response = await fetch('/api/admin/announcements', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        const announcement = data.announcements.find(item => item.id === id);
        
        if (announcement) {
            showAnnouncementForm(announcement);
        } else {
            alert('Announcement not found');
        }
    } catch (error) {
        console.error('Error loading announcement:', error);
        alert('Failed to load announcement for editing');
    }
}

// Delete announcement
async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/announcements/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadAnnouncementsList(); // Reload the list
            alert('Announcement deleted successfully');
        } else {
            alert('Failed to delete announcement');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting announcement');
    }
}

// Close announcement form
function closeAnnouncementForm() {
    const modals = document.querySelectorAll('.fixed.inset-0');
    // Remove the topmost modal (form)
    if (modals.length > 0) {
        const topModal = modals[modals.length - 1];
        document.body.removeChild(topModal);
    }
}

// Tab management functions
function setActiveTab(activeTabId) {
    // Reset all tabs
    document.getElementById('itemsTab').className = "py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap";
    document.getElementById('categoriesTab').className = "py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap";
    
    // Set active tab
    document.getElementById(activeTabId).className = "py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 whitespace-nowrap";
}

// Items view
function showItemsView() {
    setActiveTab('itemsTab');
    
    document.getElementById('mainContent').innerHTML = `
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-file-alt text-2xl text-blue-500"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                                <dd class="text-lg font-medium text-gray-900" id="statsTotal">0</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-comments text-2xl text-green-500"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Prompts</dt>
                                <dd class="text-lg font-medium text-gray-900" id="statsPrompts">0</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-project-diagram text-2xl text-purple-500"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Workflows</dt>
                                <dd class="text-lg font-medium text-gray-900" id="statsWorkflows">0</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-layer-group text-2xl text-orange-500"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Frameworks</dt>
                                <dd class="text-lg font-medium text-gray-900" id="statsFrameworks">0</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter and Actions -->
        <div class="bg-white shadow rounded-lg mb-6">
            <div class="px-4 py-5 sm:p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Manage Content</h3>
                    <div class="flex space-x-3">
                        <button id="createItemBtn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                            <i class="fas fa-plus mr-2"></i>Create New Item
                        </button>
                    </div>
                </div>
                
                <!-- Filters -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select id="typeFilterAdmin" class="border border-gray-300 rounded-md px-3 py-2">
                        <option value="">All Types</option>
                        <option value="prompt">Prompts</option>
                        <option value="workflow">Workflows</option>
                        <option value="framework">Frameworks</option>
                    </select>
                    
                    <select id="categoryFilterAdmin" class="border border-gray-300 rounded-md px-3 py-2">
                        <option value="">All Categories</option>
                    </select>
                    
                    <input type="text" id="searchFilterAdmin" placeholder="Search items..." class="border border-gray-300 rounded-md px-3 py-2">
                    
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" id="featuredFilterAdmin" class="rounded border-gray-300">
                        <span class="text-sm text-gray-700">Featured Only</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">All Vault Items</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">Manage your prompts, workflows, and frameworks</p>
            </div>
            <div id="itemsList">
                <!-- Items will be loaded here -->
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('createItemBtn').addEventListener('click', showCreateForm);
    
    // Add filter listeners
    document.getElementById('typeFilterAdmin').addEventListener('change', applyItemFilters);
    document.getElementById('categoryFilterAdmin').addEventListener('change', applyItemFilters);
    document.getElementById('searchFilterAdmin').addEventListener('input', applyItemFilters);
    document.getElementById('featuredFilterAdmin').addEventListener('change', applyItemFilters);
    
    // Populate category filter
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        document.getElementById('categoryFilterAdmin').appendChild(option);
    });
    
    // Load items
    loadAdminItems();
}

// Categories view
function showCategoriesView() {
    setActiveTab('categoriesTab');
    
    document.getElementById('mainContent').innerHTML = `
        <!-- Category Management -->
        <div class="bg-white shadow rounded-lg mb-6">
            <div class="px-4 py-5 sm:p-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Category Management</h3>
                    <button id="createCategoryBtn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        <i class="fas fa-plus mr-2"></i>Create Category
                    </button>
                </div>
            </div>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="categoriesGrid">
            <!-- Categories will be loaded here -->
        </div>
    `;
    
    // Add event listeners
    document.getElementById('createCategoryBtn').addEventListener('click', showCategoryForm);
    
    // Load categories
    loadCategoriesForManagement();
}

// Load categories for management view
async function loadCategoriesForManagement() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        displayCategoriesGrid(data.categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display categories in grid format
function displayCategoriesGrid(categories) {
    const grid = document.getElementById('categoriesGrid');
    
    if (categories.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No categories found</div>';
        return;
    }
    
    const categoriesHtml = categories.map(category => `
        <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
                <div class="w-4 h-4 rounded" style="background-color: ${category.color}"></div>
                <div class="flex space-x-2">
                    <button onclick="editCategory(${category.id})" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h4 class="font-medium text-gray-900 mb-2">${category.name}</h4>
            <p class="text-sm text-gray-600 mb-3">${category.description}</p>
            <div class="text-xs text-gray-500">
                Created: ${new Date(category.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = categoriesHtml;
}

// Apply item filters
let allItems = [];
function applyItemFilters() {
    const typeFilter = document.getElementById('typeFilterAdmin').value;
    const categoryFilter = document.getElementById('categoryFilterAdmin').value;
    const searchFilter = document.getElementById('searchFilterAdmin').value.toLowerCase();
    const featuredFilter = document.getElementById('featuredFilterAdmin').checked;
    
    let filteredItems = allItems;
    
    if (typeFilter) {
        filteredItems = filteredItems.filter(item => item.type === typeFilter);
    }
    
    if (categoryFilter) {
        filteredItems = filteredItems.filter(item => item.category_id == categoryFilter);
    }
    
    if (searchFilter) {
        filteredItems = filteredItems.filter(item => 
            item.title.toLowerCase().includes(searchFilter) || 
            item.description.toLowerCase().includes(searchFilter)
        );
    }
    
    if (featuredFilter) {
        filteredItems = filteredItems.filter(item => item.is_featured);
    }
    
    displayAdminItems(filteredItems);
}

// Category form functions
function showCategoryForm(category = null) {
    const isEdit = category !== null;
    const title = isEdit ? 'Edit Category' : 'Create New Category';
    
    const formHtml = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-gray-900">${title}</h2>
                    <button onclick="closeCategoryForm()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="categoryForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input type="text" id="categoryName" required 
                               value="${category?.name || ''}"
                               class="w-full border border-gray-300 rounded-md px-3 py-2">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="categoryDescription" rows="3"
                                  class="w-full border border-gray-300 rounded-md px-3 py-2">${category?.description || ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <input type="color" id="categoryColor" 
                               value="${category?.color || '#3B82F6'}"
                               class="w-full h-10 border border-gray-300 rounded-md">
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeCategoryForm()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            ${isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHtml);
    document.getElementById('categoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCategory(category?.id);
    });
}

function closeCategoryForm() {
    const form = document.querySelector('.fixed.inset-0');
    if (form) {
        form.remove();
    }
}

// Save category
async function saveCategory(categoryId = null) {
    const isEdit = categoryId !== null;
    
    try {
        const formData = {
            name: document.getElementById('categoryName').value.trim(),
            description: document.getElementById('categoryDescription').value.trim(),
            color: document.getElementById('categoryColor').value
        };
        
        if (!formData.name) {
            alert('Please enter a category name.');
            return;
        }
        
        const url = isEdit ? `/api/admin/categories/${categoryId}` : '/api/admin/categories';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            closeCategoryForm();
            loadCategoriesForManagement();
            loadCategoriesAndTags(); // Refresh global categories
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to save category');
        }
        
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category');
    }
}

// Edit category
async function editCategory(categoryId) {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        const category = data.categories.find(cat => cat.id === categoryId);
        
        if (category) {
            showCategoryForm(category);
        } else {
            alert('Category not found');
        }
    } catch (error) {
        console.error('Error loading category:', error);
        alert('Error loading category');
    }
}



// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    if (isAuthenticated()) {
        showAdminDashboard();
    } else {
        showLogin();
    }
});