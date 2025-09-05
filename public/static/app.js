// Main App JavaScript
let currentItems = [];
let allCategories = [];

// DOM Elements
const itemsGrid = document.getElementById('itemsGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const featuredFilter = document.getElementById('featuredFilter');
const searchSection = document.getElementById('searchSection');

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
async function initializeApp() {
    try {
        await loadAnnouncements();
        await loadCategories();
        await loadItems();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load content. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search and filter functionality
    searchInput?.addEventListener('input', debounce(filterItems, 300));
    typeFilter?.addEventListener('change', filterItems);
    categoryFilter?.addEventListener('change', filterItems);
    featuredFilter?.addEventListener('change', filterItems);
    
    // Navigation buttons
    document.getElementById('browseBtn')?.addEventListener('click', () => {
        document.getElementById('itemsGrid').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        searchSection.style.display = searchSection.style.display === 'none' ? 'block' : 'none';
    });
}

// Load categories for filter dropdown
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        allCategories = data.categories || [];
        
        // Populate category filter
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            allCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load and display announcements
async function loadAnnouncements() {
    try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        const announcements = data.announcements || [];
        
        const container = document.getElementById('announcementsContainer');
        if (!container) return;
        
        if (announcements.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        const announcementsHtml = announcements.map(announcement => {
            const bgColor = announcement.background_color || '#F59E0B';
            const textColor = announcement.text_color || '#000000';
            const imageHtml = announcement.image_url ? 
                `<img src="${announcement.image_url}" alt="Announcement" class="w-8 h-8 mr-3 rounded-full">` : '';
            
            return `
                <div class="inline-block px-6 py-2 rounded-full mb-6 font-semibold text-sm shadow-lg animate-pulse" 
                     style="background-color: ${bgColor}; color: ${textColor};">
                    <div class="flex items-center justify-center">
                        ${imageHtml}
                        <span class="mr-4">${announcement.title} • ${announcement.message}</span>
                        ${announcement.link_url ? `
                            <a href="${announcement.link_url}" 
                               target="_blank" 
                               class="underline hover:no-underline ml-2"
                               style="color: ${textColor};">
                                ${announcement.link_text || 'Learn More'}
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = announcementsHtml;
        
    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

// Load and display items
async function loadItems(filters = {}) {
    showLoading();
    
    try {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.featured) params.append('featured', 'true');
        
        const response = await fetch(`/api/items?${params}`);
        const data = await response.json();
        
        currentItems = data.items || [];
        displayItems(currentItems);
        updateStats(currentItems);
        
    } catch (error) {
        console.error('Error loading items:', error);
        showError('Failed to load items. Please try again.');
    } finally {
        hideLoading();
    }
}

// Display items in grid
function displayItems(items) {
    if (!itemsGrid) return;
    
    if (items.length === 0) {
        itemsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
                <p class="text-gray-500">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    const itemsHtml = items.map(item => createItemCard(item)).join('');
    itemsGrid.innerHTML = itemsHtml;
}

// Create individual item card
function createItemCard(item) {
    const typeIcon = getTypeIcon(item.type);
    const typeColor = getTypeColor(item.type);
    const categoryColor = item.category_color || '#6B7280';
    
    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <div class="p-6">
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                              style="background-color: ${typeColor}20; color: ${typeColor};">
                            <i class="${typeIcon} mr-1"></i>
                            ${item.type}
                        </span>
                        ${item.is_featured ? `
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <i class="fas fa-star mr-1"></i>Featured
                            </span>
                        ` : ''}
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-eye mr-1"></i>
                        ${item.current_usage_count || item.usage_count || 0}
                    </div>
                </div>
                
                <!-- Title -->
                <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    ${item.title}
                </h3>
                
                <!-- Description -->
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                    ${item.description}
                </p>
                
                <!-- Metadata -->
                <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div class="flex items-center space-x-3">
                        <span>
                            <i class="fas fa-user mr-1"></i>
                            ${item.author || 'Joshua Payne'}
                        </span>
                        <span class="inline-flex items-center px-2 py-1 rounded" 
                              style="background-color: ${categoryColor}20; color: ${categoryColor};">
                            ${item.category_name || item.category || 'General'}
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${(item.current_rating || item.rating) ? `
                            <span class="flex items-center">
                                <i class="fas fa-star text-yellow-400 mr-1"></i>
                                ${(item.current_rating || item.rating).toFixed(1)}
                                <span class="ml-1 text-gray-400">(${item.rating_count || 0})</span>
                            </span>
                        ` : `
                            <span class="text-gray-400">Not rated</span>
                        `}
                    </div>
                </div>
                
                <!-- Difficulty Badge -->
                ${item.difficulty ? `
                    <div class="mb-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}">
                            ${item.difficulty}
                        </span>
                    </div>
                ` : ''}
                
                <!-- Action Button -->
                <button onclick="viewItem(${item.id})" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium">
                    <i class="fas fa-eye mr-2"></i>
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Get type icon
function getTypeIcon(type) {
    switch(type) {
        case 'prompt': return 'fas fa-comments';
        case 'workflow': return 'fas fa-project-diagram';
        case 'framework': return 'fas fa-layer-group';
        default: return 'fas fa-file-alt';
    }
}

// Get type color
function getTypeColor(type) {
    switch(type) {
        case 'prompt': return '#3B82F6';
        case 'workflow': return '#10B981';
        case 'framework': return '#8B5CF6';
        default: return '#6B7280';
    }
}

// Get difficulty color classes
function getDifficultyColor(difficulty) {
    switch(difficulty?.toLowerCase()) {
        case 'beginner': return 'bg-green-100 text-green-800';
        case 'intermediate': return 'bg-yellow-100 text-yellow-800';
        case 'advanced': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// View individual item
async function viewItem(id) {
    try {
        const response = await fetch(`/api/items/${id}`);
        const data = await response.json();
        
        if (data.item) {
            showItemModal(data.item);
            // Load comments after modal is shown
            loadComments(id);
        } else {
            alert('Item not found');
        }
    } catch (error) {
        console.error('Error loading item:', error);
        alert('Failed to load item details');
    }
}

// Show item modal
function showItemModal(item) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50';
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    const typeIcon = getTypeIcon(item.type);
    const typeColor = '#F59E0B'; // Yellow for consistency
    
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-6 border border-yellow-400 w-11/12 max-w-4xl shadow-2xl rounded-xl bg-gray-900">
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-400">
                            <i class="${typeIcon} mr-2"></i>
                            ${item.type}
                        </span>
                        ${item.is_featured ? `
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-black">
                                <i class="fas fa-star mr-2"></i>Featured
                            </span>
                        ` : ''}
                        ${item.difficulty ? `
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 bg-opacity-20 border border-yellow-400 text-yellow-300">
                                ${item.difficulty}
                            </span>
                        ` : ''}
                    </div>
                    <h2 class="text-2xl font-bold text-white mb-2">${item.title}</h2>
                    <p class="text-gray-300 mb-4">${item.description}</p>
                    
                    <div class="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                        <span>
                            <i class="fas fa-user mr-1 text-yellow-400"></i>
                            ${item.author || 'Joshua Payne'}
                        </span>
                        <span>
                            <i class="fas fa-eye mr-1 text-yellow-400"></i>
                            ${item.current_usage_count || item.usage_count || 0} views
                        </span>
                        ${(item.current_rating || item.rating) ? `
                            <span>
                                <i class="fas fa-star text-yellow-400 mr-1"></i>
                                ${(item.current_rating || item.rating).toFixed(1)}/5 (${item.rating_count || 0} ratings)
                            </span>
                        ` : `
                            <span class="text-gray-500">Not rated yet</span>
                        `}
                        <span>
                            <i class="fas fa-calendar mr-1 text-yellow-400"></i>
                            ${new Date(item.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <button onclick="document.body.removeChild(this.closest('.fixed'))" 
                        class="text-gray-400 hover:text-yellow-400 text-xl transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Content -->
            <div class="bg-black border border-yellow-400 rounded-lg p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-yellow-400">Content</h3>
                    <button onclick="copyContent('${item.id}', this)" id="copyBtn-${item.id}"
                            class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-md hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 text-sm font-medium shadow-lg">
                        <i class="fas fa-copy mr-2"></i>Copy Content
                    </button>
                </div>
                <div id="content-${item.id}" class="prose prose-sm max-w-none">
                    <pre class="whitespace-pre-wrap text-sm bg-gray-800 text-gray-100 p-4 rounded border border-gray-600 overflow-x-auto">${item.content}</pre>
                </div>
            </div>
            
            <!-- Rating Section -->
            <div class="bg-black border border-yellow-400 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-yellow-400 mb-4">Rate this ${item.type}</h3>
                <div id="ratingSection-${item.id}">
                    <div class="flex items-center space-x-2 mb-4">
                        <span class="text-sm text-gray-300">Your rating:</span>
                        <div class="flex space-x-1" id="starRating-${item.id}">
                            ${[1,2,3,4,5].map(star => `
                                <button onclick="setRating(${item.id}, ${star})" 
                                        class="text-2xl text-gray-500 hover:text-yellow-400 transition-colors rating-star"
                                        data-star="${star}">
                                    <i class="fas fa-star"></i>
                                </button>
                            `).join('')}
                        </div>
                        <span id="ratingValue-${item.id}" class="text-sm text-gray-300"></span>
                    </div>
                    <textarea id="ratingFeedback-${item.id}" 
                              placeholder="Share your thoughts about this ${item.type} (optional)..."
                              class="w-full border border-yellow-400 bg-gray-800 text-white rounded-md px-3 py-2 text-sm resize-none placeholder-gray-400 focus:border-yellow-300 focus:outline-none"
                              rows="3"></textarea>
                    <div class="flex justify-between items-center mt-3">
                        <div id="ratingMessage-${item.id}" class="text-sm"></div>
                        <button onclick="submitRating(${item.id})" 
                                class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-md hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 text-sm font-medium shadow-lg">
                            <i class="fas fa-star mr-2"></i>Submit Rating
                        </button>
                    </div>
                </div>
            </div>

            <!-- Comments Section -->
            <div class="bg-black border border-yellow-400 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-yellow-400 mb-4">
                    <i class="fas fa-comments mr-2"></i>Community Feedback
                </h3>
                <div id="commentsSection-${item.id}">
                    <div class="text-center py-4">
                        <i class="fas fa-spinner fa-spin text-yellow-400 mr-2"></i>
                        <span class="text-gray-300">Loading comments...</span>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3">
                <button onclick="document.body.removeChild(this.closest('.fixed'))" 
                        class="px-4 py-2 border border-yellow-400 rounded-md text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200">
                    Close
                </button>
                <button onclick="copyContent('${item.id}', this)" 
                        class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-md hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-medium shadow-lg">
                    <i class="fas fa-copy mr-2"></i>Copy Content
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Load comments for an item
async function loadComments(itemId) {
    try {
        const response = await fetch(`/api/items/${itemId}/ratings`);
        const data = await response.json();
        
        const commentsContainer = document.getElementById(`commentsSection-${itemId}`);
        if (!commentsContainer) return;
        
        const comments = data.ratings || [];
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-comment-slash text-gray-500 text-3xl mb-2"></i>
                    <p class="text-gray-400">No comments yet</p>
                    <p class="text-gray-500 text-sm">Be the first to share your thoughts!</p>
                </div>
            `;
        } else {
            const commentsHtml = comments.map(comment => {
                const date = new Date(comment.created_at).toLocaleDateString();
                const stars = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);
                
                return `
                    <div class="border-b border-yellow-400 border-opacity-20 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-2">
                                <span class="text-yellow-400 text-sm">${stars}</span>
                                <span class="text-yellow-400 font-medium">${comment.rating}/5</span>
                            </div>
                            <span class="text-gray-500 text-xs">${date}</span>
                        </div>
                        ${comment.feedback ? `
                            <p class="text-gray-300 text-sm leading-relaxed">${comment.feedback}</p>
                        ` : `
                            <p class="text-gray-500 text-sm italic">No written feedback provided</p>
                        `}
                    </div>
                `;
            }).join('');
            
            commentsContainer.innerHTML = `
                <div class="space-y-4">
                    ${commentsHtml}
                </div>
                <div class="mt-4 pt-4 border-t border-yellow-400 border-opacity-20">
                    <p class="text-xs text-gray-500 text-center">
                        ${comments.length} comment${comments.length !== 1 ? 's' : ''} • Average rating: ${data.stats?.avg_rating?.toFixed(1) || 'N/A'}/5
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentsContainer = document.getElementById(`commentsSection-${itemId}`);
        if (commentsContainer) {
            commentsContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                    <span class="text-red-400">Failed to load comments</span>
                </div>
            `;
        }
    }
}

// Copy content to clipboard
function copyContent(itemId, buttonElement) {
    const contentElement = document.querySelector(`#content-${itemId} pre`);
    if (contentElement) {
        navigator.clipboard.writeText(contentElement.textContent).then(() => {
            // Show success feedback - use the passed button or find it by ID
            const btn = buttonElement || document.getElementById(`copyBtn-${itemId}`) || document.querySelector(`[onclick*="copyContent('${itemId}')"]`);
            if (btn) {
                const originalHtml = btn.innerHTML;
                const originalClass = btn.className;
                btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
                btn.className = 'bg-gradient-to-r from-green-400 to-green-500 text-black px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium shadow-lg';
                
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.className = originalClass;
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy content');
        });
    }
}

// Filter items based on current filter values
function filterItems() {
    const filters = {
        search: searchInput?.value || '',
        type: typeFilter?.value || '',
        category: categoryFilter?.value || '',
        featured: featuredFilter?.checked || false
    };
    
    loadItems(filters);
}

// Update stats display
function updateStats(items) {
    const total = items.length;
    const prompts = items.filter(item => item.type === 'prompt').length;
    const workflows = items.filter(item => item.type === 'workflow').length;
    const frameworks = items.filter(item => item.type === 'framework').length;
    
    const totalEl = document.getElementById('totalItems');
    const promptsEl = document.getElementById('totalPrompts');
    const workflowsEl = document.getElementById('totalWorkflows');
    const frameworksEl = document.getElementById('totalFrameworks');
    
    if (totalEl) totalEl.textContent = total;
    if (promptsEl) promptsEl.textContent = prompts;
    if (workflowsEl) workflowsEl.textContent = workflows;
    if (frameworksEl) frameworksEl.textContent = frameworks;
}

// Show loading state
function showLoading() {
    if (loading) loading.style.display = 'block';
    if (itemsGrid) itemsGrid.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    if (loading) loading.style.display = 'none';
    if (itemsGrid) itemsGrid.style.display = 'grid';
}

// Show error message
function showError(message) {
    if (itemsGrid) {
        itemsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-red-600 mb-2">Error</h3>
                <p class="text-red-500">${message}</p>
            </div>
        `;
    }
    hideLoading();
}

// Rating system functions
let currentRating = 0;

function setRating(itemId, rating) {
    currentRating = rating;
    const stars = document.querySelectorAll(`#starRating-${itemId} .rating-star`);
    const ratingValue = document.getElementById(`ratingValue-${itemId}`);
    
    stars.forEach((star, index) => {
        const starElement = star.querySelector('i');
        if (index < rating) {
            starElement.className = 'fas fa-star';
            star.className = star.className.replace('text-gray-500', 'text-yellow-400');
        } else {
            starElement.className = 'fas fa-star';
            star.className = star.className.replace('text-yellow-400', 'text-gray-500');
        }
    });
    
    const ratingTexts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    ratingValue.textContent = ratingTexts[rating];
}

async function submitRating(itemId) {
    if (currentRating === 0) {
        showRatingMessage(itemId, 'Please select a rating', 'error');
        return;
    }
    
    const feedback = document.getElementById(`ratingFeedback-${itemId}`).value;
    const messageDiv = document.getElementById(`ratingMessage-${itemId}`);
    
    try {
        const response = await fetch(`/api/items/${itemId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rating: currentRating,
                feedback: feedback
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showRatingMessage(itemId, result.message + '! Thank you for your feedback.', 'success');
            // Update the displayed rating
            const updatedRating = result.avgRating;
            const ratingCount = result.ratingCount;
            
            // Update rating display in modal header
            const metadataSection = document.querySelector('.flex.items-center.space-x-4.text-sm.text-gray-400.mb-6');
            if (metadataSection) {
                // Find the rating span (it contains a star icon)
                const ratingSpans = metadataSection.querySelectorAll('span');
                let ratingSpan = null;
                
                // Look for the span with star icon or "Not rated yet" text
                ratingSpans.forEach(span => {
                    if (span.innerHTML.includes('fa-star') || span.innerHTML.includes('Not rated')) {
                        ratingSpan = span;
                    }
                });
                
                if (ratingSpan && updatedRating > 0) {
                    ratingSpan.innerHTML = `
                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                        ${updatedRating.toFixed(1)}/5 (${ratingCount} ratings)
                    `;
                } else if (ratingSpan) {
                    ratingSpan.innerHTML = `
                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                        ${updatedRating.toFixed(1)}/5 (${ratingCount} ratings)
                    `;
                }
            }
            
            // Disable rating form after submission
            document.getElementById(`ratingSection-${itemId}`).innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-check-circle text-yellow-400 text-3xl mb-2"></i>
                    <p class="text-yellow-400 font-medium">Thank you for rating this ${getCurrentItemType(itemId)}!</p>
                    <p class="text-gray-300 text-sm">Average rating: ${updatedRating.toFixed(1)}/5 (${ratingCount} ratings)</p>
                </div>
            `;
            
            // Refresh comments to show new feedback
            loadComments(itemId);
            
            // Refresh the items list to show updated ratings
            setTimeout(() => {
                loadItems();
            }, 2000);
        } else {
            showRatingMessage(itemId, result.error || 'Failed to submit rating', 'error');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        showRatingMessage(itemId, 'Network error. Please try again.', 'error');
    }
}

function showRatingMessage(itemId, message, type) {
    const messageDiv = document.getElementById(`ratingMessage-${itemId}`);
    messageDiv.textContent = message;
    messageDiv.className = `text-sm ${type === 'error' ? 'text-red-600' : 'text-green-600'}`;
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 5000);
    }
}

function getCurrentItemType(itemId) {
    const item = currentItems.find(item => item.id === parseInt(itemId));
    return item ? item.type : 'item';
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== ANNOUNCEMENTS =====

// Load and display announcements
async function loadAnnouncements() {
    try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        
        if (data.announcements && data.announcements.length > 0) {
            displayAnnouncements(data.announcements);
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        // Show default announcement on error
        showDefaultAnnouncement();
    }
}

// Display announcements
function displayAnnouncements(announcements) {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    
    // Sort by priority (higher first) then by creation date
    const sortedAnnouncements = announcements.sort((a, b) => {
        if (a.priority !== b.priority) {
            return (b.priority || 0) - (a.priority || 0);
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    // Take only the top 2 announcements to avoid clutter
    const topAnnouncements = sortedAnnouncements.slice(0, 2);
    
    const announcementsHtml = topAnnouncements.map(announcement => {
        return createAnnouncementHTML(announcement);
    }).join('');
    
    container.innerHTML = announcementsHtml;
}

// Create announcement HTML
function createAnnouncementHTML(announcement) {
    const bgColor = announcement.background_color || '#F59E0B';
    const textColor = announcement.text_color || '#000000';
    const showIcon = announcement.show_icon !== false;
    const iconClass = announcement.icon_class || 'fas fa-rocket';
    
    return `
        <div class="inline-block mb-4 mx-2" style="background: linear-gradient(to right, ${bgColor}, ${bgColor}F0); color: ${textColor};">
            <div class="px-6 py-3 rounded-full shadow-lg">
                <div class="flex items-center justify-center flex-wrap gap-3 text-sm font-semibold">
                    <div class="flex items-center space-x-2">
                        ${showIcon ? `<i class="${iconClass}"></i>` : ''}
                        <span>${announcement.title}</span>
                    </div>
                    ${announcement.message ? `<span class="hidden md:inline">•</span><span>${announcement.message}</span>` : ''}
                    ${announcement.link_url ? `
                        <a href="${announcement.link_url}" target="_blank" 
                           class="ml-2 px-3 py-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 text-xs font-medium">
                            ${announcement.link_text || 'Learn More'}
                        </a>
                    ` : ''}
                </div>
                ${announcement.image_url ? `
                    <div class="mt-2 text-center">
                        <img src="${announcement.image_url}" alt="Announcement" class="inline-block max-h-16 object-contain rounded">
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Show default announcement if API fails
function showDefaultAnnouncement() {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full inline-block mb-4 font-semibold text-sm shadow-lg">
            🚀 NEW: 30 Professional Knowledge Bases Available • Join TopAIToolbox.app Community
        </div>
    `;
}