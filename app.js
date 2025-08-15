// Global state
let currentUser = null;
let currentConversation = null;

// Initialize localStorage with sample users only (no sample skills)
function initializeData() {
  if (!localStorage.getItem('skillswap_users')) {
    const sampleUsers = [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        location: 'New York, NY',
        avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        rating: 4.8,
        reviews: 36,
        joinedDate: '2025-01-15'
      },
      {
        id: 'user2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        location: 'Los Angeles, CA',
        avatar: 'https://cdn.pixabay.com/photo/2017/02/16/23/10/smile-2072907_960_720.jpg',
        rating: 4.9,
        reviews: 42,
        joinedDate: '2025-01-10'
      },
      {
        id: 'user3',
        name: 'Mike Chen',
        email: 'mike@example.com',
        password: 'password123',
        location: 'San Francisco, CA',
        avatar: 'https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_960_720.jpg',
        rating: 4.7,
        reviews: 28,
        joinedDate: '2025-01-20'
      }
    ];
    localStorage.setItem('skillswap_users', JSON.stringify(sampleUsers));
  }

  // Initialize empty skills array if it doesn't exist
  if (!localStorage.getItem('skillswap_skills')) {
    localStorage.setItem('skillswap_skills', JSON.stringify([]));
  }

  // Initialize empty messages array if it doesn't exist
  if (!localStorage.getItem('skillswap_messages')) {
    localStorage.setItem('skillswap_messages', JSON.stringify([]));
  }

  // Initialize empty conversations array if it doesn't exist
  if (!localStorage.getItem('skillswap_conversations')) {
    localStorage.setItem('skillswap_conversations', JSON.stringify([]));
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeData();
  initializeApp();
  setupEventListeners();
  updateUIForAuthState();
  checkAuthState();
});

// Initialize app functionality
function initializeApp() {
  // Setup page navigation
  updateUIForAuthState();
  
  // Toggle mobile menu
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Dashboard tabs
  document.querySelectorAll('.dashboard-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      
      // Update tabs
      document.querySelectorAll('.dashboard-tab').forEach(t => {
        t.classList.remove('active-tab', 'text-indigo-600', 'border-indigo-500');
        t.classList.add('text-gray-500', 'border-transparent', 'hover:text-gray-700', 'hover:border-gray-300');
      });
      
      tab.classList.add('active-tab', 'text-indigo-600', 'border-indigo-500');
      tab.classList.remove('text-gray-500', 'border-transparent', 'hover:text-gray-700', 'hover:border-gray-300');
      
      // Update content
      document.querySelectorAll('.dashboard-content').forEach(content => {
        content.classList.remove('active-content');
        content.classList.add('hidden');
      });
      
      document.getElementById(`${targetId}-content`).classList.remove('hidden');
      document.getElementById(`${targetId}-content`).classList.add('active-content');
    });
  });
  
  // User menu dropdown
  const userMenuButton = document.getElementById('user-menu-button');
  const dropdownMenu = document.getElementById('dropdown-menu');
  
  if (userMenuButton) {
    userMenuButton.addEventListener('click', () => {
      dropdownMenu.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!userMenuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
      }
    });
  }
}

// Show specific page with authentication check
function showPage(pageId) {
  // Check if user needs to be logged in for this page
  const protectedPages = ['dashboard', 'profile', 'messages'];
  
  if (protectedPages.includes(pageId) && !currentUser) {
    showNotification('Please login or signup to access this page', 'warning');
    showPage('login');
    return;
  }
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Ensure profile container exists before showing
  if (pageId === 'profile' && !document.getElementById('profile-page')) {
    // Create a lightweight container so the page can show, content will be injected by loadProfile
    const profileContainer = document.createElement('div');
    profileContainer.id = 'profile-page';
    profileContainer.className = 'page py-10 bg-gray-50';
    document.body.appendChild(profileContainer);
  }
  
  // Show requested page
  const pageToShow = document.getElementById(`${pageId}-page`);
  if (pageToShow) {
    pageToShow.classList.add('active');
    window.scrollTo(0, 0);
    
    // Load page-specific content
    switch(pageId) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'listings':
        loadListings();
        break;
      case 'messages':
        loadMessages();
        break;
      case 'profile':
        loadProfile();
        break;
    }
  }
}

// Update UI based on auth state
function updateUIForAuthState() {
  const authLinks = document.getElementById('auth-links');
  const userMenu = document.getElementById('user-menu');
  const mobileAuthLinks = document.getElementById('mobile-auth-links');
  const mobileUserMenu = document.getElementById('mobile-user-menu');
  const userAvatar = document.getElementById('user-avatar');
  
  if (currentUser) {
    // User is logged in
    if (authLinks) authLinks.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (mobileAuthLinks) mobileAuthLinks.classList.add('hidden');
    if (mobileUserMenu) mobileUserMenu.classList.remove('hidden');
    if (userAvatar && currentUser.avatar) {
      userAvatar.src = currentUser.avatar;
    }
  } else {
    // User is logged out
    if (authLinks) authLinks.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (mobileAuthLinks) mobileAuthLinks.classList.remove('hidden');
    if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
  }
}

// Setup form event listeners
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      login(email, password);
    });
  }
  
  // Signup form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const location = document.getElementById('signup-location').value;
      
      signup(name, email, password, location);
    });
  }

  // Add skill form
  const addSkillForm = document.getElementById('add-skill-form');
  if (addSkillForm) {
    addSkillForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('skill-title').value;
      const category = document.getElementById('skill-category').value;
      const description = document.getElementById('skill-description').value;
      const location = document.getElementById('skill-location').value;
      
      addSkill(title, category, description, location);
    });
  }

  // Add request form
  const addRequestForm = document.getElementById('add-request-form');
  if (addRequestForm) {
    addRequestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('request-title').value;
      const category = document.getElementById('request-category').value;
      const description = document.getElementById('request-description').value;
      
      addRequest(title, category, description);
    });
  }

  // Conversation search
  const conversationSearch = document.getElementById('conversation-search');
  if (conversationSearch) {
    conversationSearch.addEventListener('input', () => {
      loadConversations();
    });
  }

  // Message form
  const messageForm = document.getElementById('message-form');
  if (messageForm) {
    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageInput = document.getElementById('message-input');
      const content = messageInput.value.trim();
      
      if (content && currentConversation) {
        sendMessage(content);
        messageInput.value = '';
      }
    });
  }
}

// Authentication functions
function login(email, password) {
  const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('skillswap_currentUser', JSON.stringify(user));
    updateUIForAuthState();
    showPage('dashboard');
    showNotification('Successfully logged in!', 'success');
  } else {
    showNotification('Invalid email or password', 'error');
  }
}

function signup(name, email, password, location) {
  const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    showNotification('User with this email already exists', 'error');
    return;
  }
  
  const newUser = {
    id: 'user' + Date.now(),
    name: name,
    email: email,
    password: password,
    location: location,
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    rating: 0,
    reviews: 0,
    joinedDate: new Date().toISOString().split('T')[0]
  };
  
  users.push(newUser);
  localStorage.setItem('skillswap_users', JSON.stringify(users));
  
  currentUser = newUser;
  localStorage.setItem('skillswap_currentUser', JSON.stringify(newUser));
  updateUIForAuthState();
  showPage('dashboard');
  showNotification('Account created successfully!', 'success');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('skillswap_currentUser');
  updateUIForAuthState();
  showPage('home');
  showNotification('Logged out successfully', 'success');
}

// Check if user is logged in on page load
function checkAuthState() {
  const savedUser = localStorage.getItem('skillswap_currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForAuthState();
  }
}

// Skill management functions
function addSkill(title, category, description, location) {
  if (!currentUser) {
    showNotification('Please log in to add a skill', 'error');
    return;
  }
  
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const newSkill = {
    id: 'skill' + Date.now(),
    userId: currentUser.id,
    title: title,
    category: category,
    description: description,
    location: location,
    type: 'offering',
    createdAt: new Date().toISOString().split('T')[0],
    rating: 0
  };
  
  skills.push(newSkill);
  localStorage.setItem('skillswap_skills', JSON.stringify(skills));
  
  closeModal('add-skill-modal');
  document.getElementById('add-skill-form').reset();
  
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    loadDashboard();
  }
  if (document.getElementById('listings-page').classList.contains('active')) {
    loadListings();
  }
  
  showNotification('Skill added successfully!', 'success');
}

function addRequest(title, category, description) {
  if (!currentUser) {
    showNotification('Please log in to add a request', 'error');
    return;
  }
  
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const newRequest = {
    id: 'request' + Date.now(),
    userId: currentUser.id,
    title: title,
    category: category,
    description: description,
    location: currentUser.location,
    type: 'requesting',
    createdAt: new Date().toISOString().split('T')[0],
    rating: null
  };
  
  skills.push(newRequest);
  localStorage.setItem('skillswap_skills', JSON.stringify(skills));
  
  closeModal('add-request-modal');
  document.getElementById('add-request-form').reset();
  
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    loadDashboard();
  }
  if (document.getElementById('listings-page').classList.contains('active')) {
    loadListings();
  }
  
  showNotification('Request added successfully!', 'success');
}

// Dashboard functions
function loadDashboard() {
  if (!currentUser) {
    showPage('login');
    return;
  }
  
  loadOfferedSkills();
  loadRequestedSkills();
  loadMatches();
}

function loadOfferedSkills() {
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const userSkills = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'offering');
  const container = document.getElementById('offered-skills');
  
  if (userSkills.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No skills offered yet. <button onclick="showAddSkillModal()" class="text-indigo-600 hover:text-indigo-800">Add your first skill</button></div>';
    return;
  }
  
  container.innerHTML = userSkills.map(skill => `
    <div class="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div class="p-5">
        <div class="flex justify-between items-start mb-4">
          <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">${getCategoryDisplayName(skill.category)}</span>
          <div class="flex space-x-2">
            <button onclick="editSkill('${skill.id}')" class="text-gray-500 hover:text-gray-700"><i class="fas fa-edit"></i></button>
            <button onclick="deleteSkill('${skill.id}')" class="text-gray-500 hover:text-red-500"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <h3 class="text-lg font-bold mb-2">${skill.title}</h3>
        <p class="text-gray-600 mb-4 text-sm">${skill.description}</p>
        <div class="flex items-center text-sm text-gray-500">
          <i class="fas fa-map-marker-alt mr-1"></i>
          <span>${skill.location}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function loadRequestedSkills() {
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const userRequests = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'requesting');
  const container = document.getElementById('requested-skills');
  
  if (userRequests.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No skill requests yet. <button onclick="showAddRequestModal()" class="text-indigo-600 hover:text-indigo-800">Add your first request</button></div>';
    return;
  }
  
  container.innerHTML = userRequests.map(skill => `
    <div class="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div class="p-5">
        <div class="flex justify-between items-start mb-4">
          <span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">${getCategoryDisplayName(skill.category)}</span>
          <div class="flex space-x-2">
            <button onclick="editSkill('${skill.id}')" class="text-gray-500 hover:text-gray-700"><i class="fas fa-edit"></i></button>
            <button onclick="deleteSkill('${skill.id}')" class="text-gray-500 hover:text-red-500"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <h3 class="text-lg font-bold mb-2">${skill.title}</h3>
        <p class="text-gray-600 mb-4 text-sm">${skill.description}</p>
        <div class="flex items-center text-sm text-gray-500">
          <i class="fas fa-clock mr-1"></i>
          <span>Requested on ${formatDate(skill.createdAt)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function loadMatches() {
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
  
  // Find users who want to learn what current user offers
  const userOffers = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'offering');
  const userRequests = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'requesting');
  
  const matches = [];
  
  // Find people who want to learn what current user offers
  userOffers.forEach(offer => {
    const matchingRequests = skills.filter(skill => 
      skill.type === 'requesting' && 
      skill.category === offer.category && 
      skill.userId !== currentUser.id
    );
    
    matchingRequests.forEach(request => {
      const requestUser = users.find(u => u.id === request.userId);
      if (requestUser) {
        matches.push({
          user: requestUser,
          offer: offer,
          request: request,
          matchType: 'wants_to_learn'
        });
      }
    });
  });
  
  // Find people who offer what current user wants to learn
  userRequests.forEach(request => {
    const matchingOffers = skills.filter(skill => 
      skill.type === 'offering' && 
      skill.category === request.category && 
      skill.userId !== currentUser.id
    );
    
    matchingOffers.forEach(offer => {
      const offerUser = users.find(u => u.id === offer.userId);
      if (offerUser) {
        matches.push({
          user: offerUser,
          offer: offer,
          request: request,
          matchType: 'can_teach'
        });
      }
    });
  });
  
  const container = document.getElementById('matches-grid');
  
  if (matches.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No matches found yet. Add more skills and requests to find matches!</div>';
    return;
  }
  
  // Remove duplicates and limit to 6 matches
  const uniqueMatches = matches.filter((match, index, self) => 
    index === self.findIndex(m => m.user.id === match.user.id)
  ).slice(0, 6);
  
  container.innerHTML = uniqueMatches.map(match => `
    <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start">
        <img src="${match.user.avatar}" alt="User" class="w-16 h-16 rounded-full object-cover mr-4">
        <div class="flex-1">
          <h3 class="text-lg font-bold">${match.user.name}</h3>
          <div class="flex items-center text-sm text-gray-500 mb-3">
            <i class="fas fa-map-marker-alt mr-1"></i>
            <span>${match.user.location}</span>
          </div>
          
          <div class="mb-4">
            ${match.matchType === 'wants_to_learn' ? `
              <div class="flex items-center mb-2">
                <span class="text-xs font-semibold uppercase text-gray-500 mr-2">Wants to learn:</span>
                <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded">${match.offer.title}</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs font-semibold uppercase text-gray-500 mr-2">Can teach you:</span>
                <span class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">${match.request.title}</span>
              </div>
            ` : `
              <div class="flex items-center mb-2">
                <span class="text-xs font-semibold uppercase text-gray-500 mr-2">Can teach you:</span>
                <span class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">${match.offer.title}</span>
              </div>
              <div class="flex items-center">
                <span class="text-xs font-semibold uppercase text-gray-500 mr-2">Wants to learn:</span>
                <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded">${match.request.title}</span>
              </div>
            `}
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex text-yellow-400 text-sm">
              ${generateStars(match.user.rating)}
              <span class="text-gray-600 ml-1">${match.user.rating} (${match.user.reviews} reviews)</span>
            </div>
            <button onclick="startConversation('${match.user.id}')" class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
              <i class="fas fa-comment-alt mr-1"></i> Message
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Listings functions
function loadListings() {
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
  
  // Get filters
  const categoryFilter = document.getElementById('category-filter').value;
  const typeFilter = document.getElementById('type-filter').value;
  const sortBy = document.getElementById('sort-by').value;
  
  // Apply filters
  let filteredSkills = skills;
  
  if (categoryFilter) {
    filteredSkills = filteredSkills.filter(skill => skill.category === categoryFilter);
  }
  
  if (typeFilter && typeFilter !== 'all') {
    filteredSkills = filteredSkills.filter(skill => skill.type === typeFilter);
  }
  
  // Apply sorting
  filteredSkills.sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  // Update results count
  document.getElementById('results-count').textContent = filteredSkills.length;
  
  const container = document.getElementById('listings-grid');
  
  if (filteredSkills.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No listings found. Try adjusting your filters or be the first to add a skill!</div>';
    return;
  }
  
  container.innerHTML = filteredSkills.map(skill => {
    const user = users.find(u => u.id === skill.userId);
    if (!user) return '';
    
    return `
      <div class="bg-white rounded-xl overflow-hidden shadow-md skill-card">
        <div class="p-6">
          <div class="flex justify-between items-center mb-3">
            <span class="bg-${getCategoryColor(skill.category)}-100 text-${getCategoryColor(skill.category)}-800 text-xs font-semibold px-2.5 py-0.5 rounded">${getCategoryDisplayName(skill.category)}</span>
            <div class="text-sm">
              <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>
              <span>${skill.location}</span>
            </div>
          </div>
          <h3 class="text-xl font-bold mb-2">${skill.title}</h3>
          <p class="text-gray-600 mb-4 line-clamp-2">${skill.description}</p>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <img src="${user.avatar}" alt="User" class="w-8 h-8 rounded-full mr-2">
              <span class="text-sm font-medium">${user.name}</span>
            </div>
            <div class="rating flex">
              ${generateStars(user.rating)}
            </div>
          </div>
          <div class="mt-4 flex space-x-2">
            <button onclick="startConversation('${user.id}')" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm">
              <i class="fas fa-comment-alt mr-1"></i> Message
            </button>
            ${skill.type === 'offering' ? `
              <button onclick="showSkillDetails('${skill.id}')" class="flex-1 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md text-sm">
                View Details
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Messages functions
function loadMessages() {
  if (!currentUser) {
    showPage('login');
    return;
  }
  
  loadConversations();
}

function loadConversations() {
  const conversations = JSON.parse(localStorage.getItem('skillswap_conversations') || '[]');
  const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
  const messages = JSON.parse(localStorage.getItem('skillswap_messages') || '[]');
  
  const userConversations = conversations.filter(conv => 
    conv.participants.includes(currentUser.id)
  );

  // Apply search filter
  const q = (document.getElementById('conversation-search')?.value || '').toLowerCase();
  const filtered = q
    ? userConversations.filter(conv => {
        const otherUserId = conv.participants.find(id => id !== currentUser.id);
        const otherUser = users.find(u => u.id === otherUserId);
        return otherUser && (otherUser.name.toLowerCase().includes(q) || (conv.lastMessage || '').toLowerCase().includes(q));
      })
    : userConversations;
  
  const container = document.getElementById('conversations-list');
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="p-4 text-center text-gray-500">No conversations yet. Start messaging people from the listings!</div>';
    return;
  }
  
  container.innerHTML = filtered.map(conv => {
    const otherUserId = conv.participants.find(id => id !== currentUser.id);
    const otherUser = users.find(u => u.id === otherUserId);
    const unreadCount = conv.unreadCount[currentUser.id] || 0;
    
    if (!otherUser) return '';
    
    return `
      <div class="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${unreadCount > 0 ? 'bg-indigo-50' : ''}" onclick="openConversation('${conv.id}')">
        <div class="flex justify-between items-start mb-1">
          <div class="flex items-center">
            <img src="${otherUser.avatar}" alt="Contact" class="w-10 h-10 rounded-full mr-3">
            <h3 class="font-semibold">${otherUser.name}</h3>
          </div>
          <span class="text-xs text-gray-500">${formatTime(conv.lastMessageTime)}</span>
        </div>
        <p class="text-sm text-gray-600 truncate">${conv.lastMessage}</p>
        ${unreadCount > 0 ? `<div class="mt-1"><span class="bg-indigo-600 text-white text-xs py-0.5 px-2 rounded-full">${unreadCount}</span></div>` : ''}
      </div>
    `;
  }).join('');
}

function openConversation(conversationId) {
  const conversations = JSON.parse(localStorage.getItem('skillswap_conversations') || '[]');
  const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
  const messages = JSON.parse(localStorage.getItem('skillswap_messages') || '[]');
  
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) return;
  
  const otherUserId = conversation.participants.find(id => id !== currentUser.id);
  const otherUser = users.find(u => u.id === otherUserId);
  
  currentConversation = conversationId;
  
  // Update chat header
  document.getElementById('chat-header').classList.remove('hidden');
  document.getElementById('chat-user-avatar').src = otherUser.avatar;
  document.getElementById('chat-user-name').textContent = otherUser.name;
  document.getElementById('chat-user-status').textContent = 'Online';
  
  // Show chat input
  document.getElementById('chat-input').classList.remove('hidden');
  
  // Load messages
  loadConversationMessages(conversationId);
  
  // Mark as read
  markConversationAsRead(conversationId);
}

function loadConversationMessages(conversationId) {
  const messages = JSON.parse(localStorage.getItem('skillswap_messages') || '[]');
  const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
  
  const conversationMessages = messages
    .filter(msg => msg.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  const container = document.getElementById('chat-messages');
  
  if (conversationMessages.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>';
    return;
  }
  
  container.innerHTML = conversationMessages.map(msg => {
    const isOwn = msg.senderId === currentUser.id;
    const sender = users.find(u => u.id === msg.senderId);
    
    return `
      <div class="flex ${isOwn ? 'justify-end' : ''} mb-4">
        ${!isOwn ? `<img src="${sender.avatar}" alt="Contact" class="w-8 h-8 rounded-full self-end mr-2">` : ''}
        <div class="max-w-xs md:max-w-md ${isOwn ? 'bg-indigo-600 text-white' : 'bg-gray-100'} rounded-lg p-3">
          <p class="${isOwn ? 'text-white' : 'text-gray-800'}">${msg.content}</p>
          <span class="text-xs ${isOwn ? 'text-indigo-200' : 'text-gray-500'} mt-1 block">${formatTime(msg.timestamp)}</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function sendMessage(content) {
  if (!currentConversation || !content.trim()) return;
  
  const messages = JSON.parse(localStorage.getItem('skillswap_messages') || '[]');
  const conversations = JSON.parse(localStorage.getItem('skillswap_conversations') || '[]');
  
  const conversation = conversations.find(c => c.id === currentConversation);
  const otherUserId = conversation.participants.find(id => id !== currentUser.id);
  
  const newMessage = {
    id: 'msg' + Date.now(),
    conversationId: currentConversation,
    senderId: currentUser.id,
    receiverId: otherUserId,
    content: content,
    timestamp: new Date().toISOString()
  };
  
  messages.push(newMessage);
  
  // Update conversation
  conversation.lastMessage = content;
  conversation.lastMessageTime = newMessage.timestamp;
  conversation.unreadCount[otherUserId] = (conversation.unreadCount[otherUserId] || 0) + 1;
  
  localStorage.setItem('skillswap_messages', JSON.stringify(messages));
  localStorage.setItem('skillswap_conversations', JSON.stringify(conversations));
  
  // Reload messages
  loadConversationMessages(currentConversation);
}

function startConversation(userId) {
  if (!currentUser) {
    showPage('login');
    return;
  }
  
  const conversations = JSON.parse(localStorage.getItem('skillswap_conversations') || '[]');
  
  // Check if conversation already exists
  let conversation = conversations.find(c => 
    c.participants.includes(currentUser.id) && c.participants.includes(userId)
  );
  
  if (!conversation) {
    // Create new conversation
    conversation = {
      id: 'conv' + Date.now(),
      participants: [currentUser.id, userId],
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: {}
    };
    
    conversations.push(conversation);
    localStorage.setItem('skillswap_conversations', JSON.stringify(conversations));
  }
  
  showPage('messages');
  setTimeout(() => openConversation(conversation.id), 100);
}

function markConversationAsRead(conversationId) {
  const conversations = JSON.parse(localStorage.getItem('skillswap_conversations') || '[]');
  const conversation = conversations.find(c => c.id === conversationId);
  
  if (conversation) {
    conversation.unreadCount[currentUser.id] = 0;
    localStorage.setItem('skillswap_conversations', JSON.stringify(conversations));
  }
}

// Profile functions
function loadProfile() {
  if (!currentUser) {
    showPage('login');
    return;
  }
  
  // Create profile page content if it doesn't exist
  let profilePage = document.getElementById('profile-page');
  if (!profilePage) {
    profilePage = document.createElement('div');
    profilePage.id = 'profile-page';
    profilePage.className = 'page py-10 bg-gray-50';
    document.body.appendChild(profilePage);
  }
  
  profilePage.innerHTML = `
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Profile Header -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div class="profile-header p-8 text-white">
            <div class="flex flex-col md:flex-row items-center">
              <img src="${currentUser.avatar}" alt="Profile" class="w-24 h-24 rounded-full object-cover mb-4 md:mb-0 md:mr-8">
              <div class="text-center md:text-left">
                <h1 class="text-3xl font-bold mb-2">${currentUser.name}</h1>
                <p class="text-lg mb-2">${currentUser.location}</p>
                <div class="flex items-center justify-center md:justify-start">
                  <div class="flex text-yellow-400 mr-2">
                    ${generateStars(currentUser.rating)}
                  </div>
                  <span class="text-white">${currentUser.rating} (${currentUser.reviews} reviews)</span>
                </div>
                <p class="text-sm mt-2">Member since ${formatDate(currentUser.joinedDate)}</p>
              </div>
              <div class="md:ml-auto mt-4 md:mt-0">
                <button id="edit-profile-btn" class="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50">
                  <i class="fas fa-user-edit mr-2"></i>Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Profile Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Skills Offered + Requested -->
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold">Skills Offered</h2>
                <button onclick="showAddSkillModal()" class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                  <i class="fas fa-plus mr-2"></i> Add Skill
                </button>
              </div>
              <div id="profile-offered-skills"></div>
            </div>

            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold">Skills Requested</h2>
                <button onclick="showAddRequestModal()" class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                  <i class="fas fa-plus mr-2"></i> Add Request
                </button>
              </div>
              <div id="profile-requested-skills"></div>
            </div>
          </div>
          
          <!-- Profile Info -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-md p-6">
              <h2 class="text-xl font-bold mb-4">Profile Information</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <p class="text-gray-900">${currentUser.name}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="text-gray-900">${currentUser.email}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Location</label>
                  <p class="text-gray-900">${currentUser.location}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Member Since</label>
                  <p class="text-gray-900">${formatDate(currentUser.joinedDate)}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Rating</label>
                  <div class="flex items-center">
                    <div class="flex text-yellow-400 mr-2">
                      ${generateStars(currentUser.rating)}
                    </div>
                    <span class="text-gray-900">${currentUser.rating} (${currentUser.reviews} reviews)</span>
                  </div>
                </div>
                <div class="pt-4 border-t mt-4">
                  <button id="toggle-edit-profile" class="px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm">Edit Profile</button>
                  <form id="edit-profile-form" class="space-y-3 mt-3 hidden">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" id="edit-name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" value="${currentUser.name}">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" id="edit-location" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" value="${currentUser.location}">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                      <input type="url" id="edit-avatar" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" value="${currentUser.avatar}">
                    </div>
                    <div class="flex justify-end">
                      <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">Save</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Wire up edit form
  const toggleEdit = document.getElementById('toggle-edit-profile');
  const editForm = document.getElementById('edit-profile-form');
  if (toggleEdit && editForm) {
    toggleEdit.onclick = () => {
      editForm.classList.toggle('hidden');
    };
    editForm.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('edit-name').value.trim();
      const location = document.getElementById('edit-location').value.trim();
      const avatar = document.getElementById('edit-avatar').value.trim() || currentUser.avatar;
      if (!name || !location) return;
      const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].location = location;
        users[idx].avatar = avatar;
        localStorage.setItem('skillswap_users', JSON.stringify(users));
      }
      currentUser.name = name;
      currentUser.location = location;
      currentUser.avatar = avatar;
      localStorage.setItem('skillswap_currentUser', JSON.stringify(currentUser));
      updateUIForAuthState();
      showNotification('Profile updated successfully', 'success');
      loadProfile();
    };
  }

  // Load profile skills
  loadProfileSkills();
  loadProfileRequestedSkills();
}

function loadProfileSkills() {
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const userSkills = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'offering');
  const container = document.getElementById('profile-offered-skills');
  
  if (!container) return;
  
  if (userSkills.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-8">No skills offered yet.</div>';
    return;
  }
  
  container.innerHTML = userSkills.map(skill => `
    <div class="border border-gray-200 rounded-lg p-4 mb-4">
      <div class="flex justify-between items-start mb-2">
        <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">${getCategoryDisplayName(skill.category)}</span>
      </div>
      <h3 class="text-lg font-bold mb-2">${skill.title}</h3>
      <p class="text-gray-600 mb-3">${skill.description}</p>
      <div class="flex items-center text-sm text-gray-500">
        <i class="fas fa-map-marker-alt mr-1"></i>
        <span>${skill.location}</span>
      </div>
    </div>
  `).join('');
}

function loadProfileRequestedSkills() {
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const userRequests = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'requesting');
  const container = document.getElementById('profile-requested-skills');
  if (!container) return;
  if (userRequests.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-8">No requests yet.</div>';
    return;
  }
  container.innerHTML = userRequests.map(skill => `
    <div class="border border-gray-200 rounded-lg p-4 mb-4">
      <div class="flex justify-between items-start mb-2">
        <span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">${getCategoryDisplayName(skill.category)}</span>
      </div>
      <h3 class="text-lg font-bold mb-2">${skill.title}</h3>
      <p class="text-gray-600 mb-3">${skill.description}</p>
      <div class="flex items-center text-sm text-gray-500">
        <i class="fas fa-clock mr-1"></i>
        <span>Requested on ${formatDate(skill.createdAt)}</span>
      </div>
    </div>
  `).join('');
}

// Utility functions
function showAddSkillModal() {
  if (!currentUser) {
    showPage('login');
    return;
  }
  document.getElementById('add-skill-modal').classList.remove('hidden');
}

function showAddRequestModal() {
  if (!currentUser) {
    showPage('login');
    return;
  }
  document.getElementById('add-request-modal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function applyFilters() {
  loadListings();
}

function resetFilters() {
  document.getElementById('category-filter').value = '';
  document.getElementById('type-filter').value = 'all';
  document.getElementById('sort-by').value = 'newest';
  loadListings();
}

function deleteSkill(skillId) {
  if (confirm('Are you sure you want to delete this skill?')) {
    const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
    const updatedSkills = skills.filter(skill => skill.id !== skillId);
    localStorage.setItem('skillswap_skills', JSON.stringify(updatedSkills));
    
    loadDashboard();
    loadListings();
    showNotification('Skill deleted successfully', 'success');
  }
}

function editSkill(skillId) {
  // For simplicity, we'll just show a notification
  showNotification('Edit functionality coming soon!', 'info');
}

function showSkillDetails(skillId) {
  // For simplicity, we'll just show a notification
  showNotification('Skill details coming soon!', 'info');
}

function getCategoryDisplayName(category) {
  const categories = {
    'programming': 'Programming',
    'design': 'Design',
    'language': 'Languages',
    'music': 'Music',
    'fitness': 'Fitness',
    'cooking': 'Cooking',
    'business': 'Business',
    'academic': 'Academic'
  };
  return categories[category] || category;
}

function getCategoryColor(category) {
  const colors = {
    'programming': 'indigo',
    'design': 'purple',
    'language': 'orange',
    'music': 'blue',
    'fitness': 'red',
    'cooking': 'yellow',
    'business': 'green',
    'academic': 'purple'
  };
  return colors[category] || 'gray';
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

// Profile functions
function loadProfile() {
  if (!currentUser) {
    showPage('login');
    return;
  }
  
  // Create profile page content if it doesn't exist
  let profilePage = document.getElementById('profile-page');
  if (!profilePage) {
    profilePage = document.createElement('div');
    profilePage.id = 'profile-page';
    profilePage.className = 'page py-10 bg-gray-50';
    document.body.appendChild(profilePage);
  }
  
  profilePage.innerHTML = `
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Profile Header -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div class="profile-header p-8 text-white">
            <div class="flex flex-col md:flex-row items-center">
              <img src="${currentUser.avatar}" alt="Profile" class="w-24 h-24 rounded-full object-cover mb-4 md:mb-0 md:mr-8">
              <div class="text-center md:text-left">
                <h1 class="text-3xl font-bold mb-2">${currentUser.name}</h1>
                <p class="text-lg mb-2">${currentUser.location}</p>
                <div class="flex items-center justify-center md:justify-start">
                  <div class="flex text-yellow-400 mr-2">
                    ${generateStars(currentUser.rating)}
                  </div>
                  <span class="text-white">${currentUser.rating} (${currentUser.reviews} reviews)</span>
                </div>
                <p class="text-sm mt-2">Member since ${formatDate(currentUser.joinedDate)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Profile Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Skills Offered -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-md p-6">
              <h2 class="text-2xl font-bold mb-6">Skills Offered</h2>
              <div id="profile-offered-skills">
                <!-- Skills will be loaded here -->
              </div>
            </div>
          </div>
          
          <!-- Profile Info -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-md p-6">
              <h2 class="text-xl font-bold mb-4">Profile Information</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <p class="text-gray-900">${currentUser.name}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="text-gray-900">${currentUser.email}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Location</label>
                  <p class="text-gray-900">${currentUser.location}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Member Since</label>
                  <p class="text-gray-900">${formatDate(currentUser.joinedDate)}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Rating</label>
                  <div class="flex items-center">
                    <div class="flex text-yellow-400 mr-2">
                      ${generateStars(currentUser.rating)}
                    </div>
                    <span class="text-gray-900">${currentUser.rating} (${currentUser.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load profile skills
  loadProfileSkills();
}

function loadProfileSkills() {
  const skills = JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
  const userSkills = skills.filter(skill => skill.userId === currentUser.id && skill.type === 'offering');
  const container = document.getElementById('profile-offered-skills');
  
  if (!container) return;
  
  if (userSkills.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-8">No skills offered yet.</div>';
    return;
  }
  
  container.innerHTML = userSkills.map(skill => `
    <div class="border border-gray-200 rounded-lg p-4 mb-4">
      <div class="flex justify-between items-start mb-2">
        <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">${getCategoryDisplayName(skill.category)}</span>
      </div>
      <h3 class="text-lg font-bold mb-2">${skill.title}</h3>
      <p class="text-gray-600 mb-3">${skill.description}</p>
      <div class="flex items-center text-sm text-gray-500">
        <i class="fas fa-map-marker-alt mr-1"></i>
        <span>${skill.location}</span>
      </div>
    </div>
  `).join('');
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
  
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white'
  };
  
  notification.className += ` ${colors[type]}`;
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}
