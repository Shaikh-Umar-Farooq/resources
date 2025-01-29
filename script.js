// Firebase Auth and Firestore instances
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements - Auth
const authSection = document.getElementById('authSection');
const mainContent = document.getElementById('mainContent');
const userSection = document.getElementById('userSection');
const userEmail = document.getElementById('userEmail');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authError = document.getElementById('authError');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// DOM Elements - Content
const welcomeSection = document.getElementById('welcomeSection');
const chaptersSection = document.getElementById('chaptersSection');
const resourcesSection = document.getElementById('resourcesSection');
const chapterList = document.getElementById('chapterList');
const resourceList = document.getElementById('resourceList');
const levelsSection = document.getElementById('levelsSection');

// Progress tracking state
let userProgress = {};

// Auth State Handler
auth.onAuthStateChanged(async (user) => {
    if (user) {
        authSection.classList.add('hidden');
        mainContent.classList.remove('hidden');
        userSection.classList.remove('hidden');
        userEmail.textContent = user.email;
        await loadProgress(); // Load user's progress from Firestore
        updateAllProgress(); // Update UI with loaded progress
    } else {
        authSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
        userSection.classList.add('hidden');
        userEmail.textContent = '';
        userProgress = {}; // Clear progress on logout
    }
});

// Auth Event Listeners
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
        authError.textContent = 'Please enter both email and password';
        return;
    }

    try {
        loginBtn.classList.add('loading');
        await auth.signInWithEmailAndPassword(email, password);
        authError.textContent = '';
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        authError.textContent = error.message;
    } finally {
        loginBtn.classList.remove('loading');
    }
});

signupBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
        authError.textContent = 'Please enter both email and password';
        return;
    }

    try {
        signupBtn.classList.add('loading');
        await auth.createUserWithEmailAndPassword(email, password);
        authError.textContent = '';
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        authError.textContent = error.message;
    } finally {
        signupBtn.classList.remove('loading');
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Helper Functions
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function findChapterByTitle(title) {
    return Object.values(courseData)
        .flatMap(level => level.chapters)
        .find(chapter => chapter.title === title);
}
// Progress Calculation Functions
function calculateResourceProgress(resources) {
    const total = resources.length;
    const completed = resources.filter(resource => {
        const isCompleted = userProgress[resource.title] || false;
        return isCompleted;
    }).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percentage };
}

function calculateChapterProgress(chapter) {
    return calculateResourceProgress(chapter.resources);
}

function calculateLevelProgress(level) {
    const allResources = level.chapters.flatMap(chapter => chapter.resources);
    return calculateResourceProgress(allResources);
}

function calculateOverallProgress() {
    const allResources = Object.values(courseData)
        .flatMap(level => level.chapters)
        .flatMap(chapter => chapter.resources);
    return calculateResourceProgress(allResources);
}

// Progress Persistence with Firestore
async function saveProgress(chapterTitle, resourceTitle, completed) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Update local state
        userProgress[resourceTitle] = completed;

        // Save to Firestore
        await db.collection('users').doc(user.uid).set({
            progress: userProgress
        }, { merge: true });

        // Update all UI elements immediately
        updateAllProgress();
        
        // If we're in the resources view, update the chapter header
        if (!resourcesSection.classList.contains('hidden')) {
            const chapter = findChapterByTitle(chapterTitle);
            if (chapter) {
                const progress = calculateChapterProgress(chapter);
                updateChapterHeader(progress);
            }
        }

        // Force update level cards in the background
        Object.entries(courseData).forEach(([levelKey, levelData]) => {
            const progress = calculateLevelProgress(levelData);
            const levelCard = document.querySelector(`.level-card[data-level="${levelKey}"]`);
            if (levelCard) {
                updateProgressInCard(levelCard, progress);
            }
        });

    } catch (error) {
        console.error('Error saving progress:', error);
        // Revert local state on error
        userProgress[resourceTitle] = !completed;
        updateAllProgress();
    }
}

async function loadProgress() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.data();
        userProgress = data?.progress || {};
    } catch (error) {
        console.error('Error loading progress:', error);
        userProgress = {};
    }
}

// Update Progress UI
function updateAllProgress() {
    // Update overall progress in welcome section
    const overallProgress = calculateOverallProgress();
    const welcomeProgressDiv = document.getElementById('overallProgress') || createOverallProgressElement();
    welcomeProgressDiv.innerHTML = `
        <h3>Your Overall Progress</h3>
        <div class="progress-container">
            <div class="progress-stats">
                <span>${overallProgress.completed}/${overallProgress.total} resources completed</span>
                <span>${overallProgress.percentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${overallProgress.percentage}%"></div>
            </div>
        </div>
    `;

    // Update level cards
    Object.entries(courseData).forEach(([levelKey, levelData]) => {
        const progress = calculateLevelProgress(levelData);
        const levelCard = document.querySelector(`.level-card[data-level="${levelKey}"]`);
        if (levelCard) {
            updateProgressInCard(levelCard, progress);
        }
    });

    // Update chapter cards if visible
    if (!chaptersSection.classList.contains('hidden')) {
        document.querySelectorAll('.chapter-card').forEach(card => {
            const chapterTitle = card.querySelector('h3').textContent;
            const chapter = findChapterByTitle(chapterTitle);
            if (chapter) {
                const progress = calculateChapterProgress(chapter);
                updateProgressInCard(card, progress);
            }
        });
    }

    // Update current chapter progress if resources are visible
    if (!resourcesSection.classList.contains('hidden')) {
        const chapterTitle = document.getElementById('chapterTitle').textContent;
        const chapter = findChapterByTitle(chapterTitle);
        if (chapter) {
            const progress = calculateChapterProgress(chapter);
            updateChapterHeader(progress);
        }
    }
}

function updateProgressInCard(card, progress) {
    const progressContainer = card.querySelector('.progress-container');
    if (!progressContainer) {
        card.appendChild(createProgressElement(progress));
    } else {
        progressContainer.innerHTML = `
            <div class="progress-stats">
                <span>${progress.completed}/${progress.total} resources completed</span>
                <span>${progress.percentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
            </div>
        `;
    }
}

function createProgressElement(progress) {
    const div = document.createElement('div');
    div.className = 'progress-container';
    div.innerHTML = `
        <div class="progress-stats">
            <span>${progress.completed}/${progress.total} resources completed</span>
            <span>${progress.percentage}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
        </div>
    `;
    return div;
}

function createOverallProgressElement() {
    const div = document.createElement('div');
    div.id = 'overallProgress';
    div.className = 'overall-progress';
    welcomeSection.insertBefore(div, levelsSection);
    return div;
}

function updateChapterHeader(progress) {
    const header = document.querySelector('.resource-header');
    if (header) {
        const progressContainer = header.querySelector('.progress-container');
        if (!progressContainer) {
            header.appendChild(createProgressElement(progress));
        } else {
            progressContainer.innerHTML = `
                <div class="progress-stats">
                    <span>${progress.completed}/${progress.total} completed</span>
                    <span>${progress.percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
            `;
        }
    }
}
// Display Functions
function showChapters(level) {
    const levelData = courseData[level];
    document.getElementById('levelTitle').textContent = levelData.title;
    chapterList.innerHTML = '';

    // Add overall level progress at the top
    const levelProgress = calculateLevelProgress(levelData);
    const levelProgressDiv = document.createElement('div');
    levelProgressDiv.className = 'level-progress-header';
    levelProgressDiv.innerHTML = `
        <h3>${levelData.title} Progress</h3>
        <div class="progress-container">
            <div class="progress-stats">
                <span>${levelProgress.completed}/${levelProgress.total} resources completed</span>
                <span>${levelProgress.percentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${levelProgress.percentage}%"></div>
            </div>
        </div>
    `;
    chapterList.appendChild(levelProgressDiv);

    // Show chapters with their progress
    levelData.chapters.forEach(chapter => {
        const chapterCard = document.createElement('div');
        chapterCard.className = 'chapter-card';
        const progress = calculateChapterProgress(chapter);
        
        chapterCard.innerHTML = `
            <div class="chapter-header">
                <h3>${chapter.title}</h3>
                <div class="resource-count">${chapter.resources.length} resources</div>
            </div>
            <div class="progress-container">
                <div class="progress-stats">
                    <span>${progress.completed}/${progress.total} completed</span>
                    <span>${progress.percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
            </div>
        `;

        chapterCard.addEventListener('click', () => showResources(chapter));
        chapterList.appendChild(chapterCard);
    });

    welcomeSection.classList.add('hidden');
    chaptersSection.classList.remove('hidden');
}

function showResources(chapter) {
    const progress = calculateChapterProgress(chapter);
    
    // Update the header with progress
    const headerDiv = document.querySelector('.resource-header');
    headerDiv.innerHTML = `
        <div class="chapter-header">
            <h2 id="chapterTitle">${chapter.title}</h2>
            <div class="progress-container">
                <div class="progress-stats">
                    <span>${progress.completed}/${progress.total} completed</span>
                    <span>${progress.percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
            </div>
        </div>
    `;

    // Reset tabs and add new event listeners
    const tabs = document.querySelector('.tabs');
    const newTabs = tabs.cloneNode(true);
    
    // Add event listeners to new tabs
    newTabs.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.type === 'video') {
            tab.classList.add('active');
        }
        
        tab.addEventListener('click', () => {
            newTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showResourcesByType(chapter, tab.dataset.type);
        });
    });
    
    // Replace old tabs with new ones
    tabs.parentNode.replaceChild(newTabs, tabs);

    // Show video resources by default
    showResourcesByType(chapter, 'video');
    
    // Update visibility
    chaptersSection.classList.add('hidden');
    resourcesSection.classList.remove('hidden');
}

function showResourcesByType(chapter, type) {
    resourceList.innerHTML = '';
    const filteredResources = chapter.resources.filter(resource => resource.type === type);
    
    filteredResources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'resource-card';
        const isCompleted = userProgress[resource.title] || false;
        
        if (resource.type === 'video') {
            const videoId = getYouTubeVideoId(resource.url);
            const thumbnailUrl = videoId ? 
                `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 
                resource.thumbnail;

            resourceCard.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${thumbnailUrl}" alt="${resource.title}">
                </div>
                <div class="resource-content">
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span class="resource-author">${resource.author}</span>
                    </div>
                    <div class="resource-actions">
                        <div class="resource-checkbox-wrapper">
                            <input type="checkbox" id="${resource.title}" ${isCompleted ? 'checked' : ''}>
                            <label for="${resource.title}">Mark as complete</label>
                        </div>
                        <a href="${resource.url}" class="view-link" target="_blank">Watch Video</a>
                    </div>
                </div>
            `;
        } else {
            resourceCard.innerHTML = `
                <div class="article-thumbnail">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    </svg>
                </div>
                <div class="resource-content">
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span class="resource-author">By ${resource.author}</span>
                        <span>•</span>
                        <span>${resource.publisher}</span>
                    </div>
                    <div class="resource-actions">
                        <div class="resource-checkbox-wrapper">
                            <input type="checkbox" id="${resource.title}" ${isCompleted ? 'checked' : ''}>
                            <label for="${resource.title}">Mark as complete</label>
                        </div>
                        <a href="${resource.url}" class="view-link" target="_blank">Read Article</a>
                    </div>
                </div>
            `;
        }
        
        const checkbox = resourceCard.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            saveProgress(chapter.title, resource.title, checkbox.checked);
        });
        
        resourceList.appendChild(resourceCard);
    });
}
document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
        showChapters(card.dataset.level);
        updateAllProgress(); // Update progress when entering chapters view
    });
});

document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    welcomeSection.classList.remove('hidden');
    chaptersSection.classList.add('hidden');
    resourcesSection.classList.add('hidden');
    updateAllProgress(); // Update progress when returning home
});

document.getElementById('backToLevels').addEventListener('click', (e) => {
    e.preventDefault();
    welcomeSection.classList.remove('hidden');
    chaptersSection.classList.add('hidden');
    updateAllProgress(); // Update progress when returning to levels
});

document.getElementById('backToChapters').addEventListener('click', (e) => {
    e.preventDefault();
    resourcesSection.classList.add('hidden');
    chaptersSection.classList.remove('hidden');
    updateAllProgress(); // Update progress when returning to chapters
});





// Additional DOM Elements for Auth
const landingPage = document.getElementById('landingPage');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authButtons = document.getElementById('authButtons');
const showLoginBtn = document.getElementById('showLoginBtn');
const showSignupBtn = document.getElementById('showSignupBtn');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const landingGetStarted = document.getElementById('landingGetStarted');
const landingLearnMore = document.getElementById('landingLearnMore');
const welcomeUser = document.getElementById('welcomeUser');

// Form Input Elements
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupUsername = document.getElementById('signupUsername');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const confirmPassword = document.getElementById('confirmPassword');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// Auth State Handler
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            // Get user profile data
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            // Update UI with username
            welcomeUser.textContent = `Welcome, ${userData.username}!`;
            
            // Show/hide appropriate sections
            landingPage.classList.add('hidden');
            authSection.classList.add('hidden');
            mainContent.classList.remove('hidden');
            authButtons.classList.add('hidden');
            userSection.classList.remove('hidden');
            
            // Load user progress
            await loadProgress();
            updateAllProgress();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    } else {
        // Reset UI for logged out state
        landingPage.classList.remove('hidden');
        mainContent.classList.add('hidden');
        authSection.classList.add('hidden');
        authButtons.classList.remove('hidden');
        userSection.classList.add('hidden');
        welcomeUser.textContent = '';
        userProgress = {};
    }
});

// Form Switching Functions
function showLogin() {
    landingPage.classList.add('hidden');
    authSection.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginError.textContent = '';
    loginEmail.value = '';
    loginPassword.value = '';
}

function showSignup() {
    landingPage.classList.add('hidden');
    authSection.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupError.textContent = '';
    signupUsername.value = '';
    signupEmail.value = '';
    signupPassword.value = '';
    confirmPassword.value = '';
}

// Validation Functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(username) {
    return username.length >= 3 && username.length <= 30;
}

// Auth Event Listeners
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    loginError.textContent = '';

    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }

    if (!validateEmail(email)) {
        loginError.textContent = 'Please enter a valid email address';
        return;
    }

    try {
        loginBtn.classList.add('loading');
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        loginError.textContent = error.message;
    } finally {
        loginBtn.classList.remove('loading');
    }
});

signupBtn.addEventListener('click', async () => {
    const username = signupUsername.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirm = confirmPassword.value;
    signupError.textContent = '';

    // Validation checks
    if (!username || !email || !password || !confirm) {
        signupError.textContent = 'Please fill in all fields';
        return;
    }

    if (!validateUsername(username)) {
        signupError.textContent = 'Username must be between 3 and 30 characters';
        return;
    }

    if (!validateEmail(email)) {
        signupError.textContent = 'Please enter a valid email address';
        return;
    }

    if (!validatePassword(password)) {
        signupError.textContent = 'Password must be at least 6 characters long';
        return;
    }

    if (password !== confirm) {
        signupError.textContent = 'Passwords do not match';
        return;
    }

    try {
        signupBtn.classList.add('loading');
        // Create auth user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user profile in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            username: username,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        signupError.textContent = error.message;
    } finally {
        signupBtn.classList.remove('loading');
    }
});

// Landing Page and Navigation Event Listeners
showLoginBtn.addEventListener('click', showLogin);
showSignupBtn.addEventListener('click', showSignup);
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    showSignup();
});
switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
});
landingGetStarted.addEventListener('click', showSignup);
landingLearnMore.addEventListener('click', () => {
    document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' });
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Add this to your homeLink event listener
document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) {
        welcomeSection.classList.remove('hidden');
        chaptersSection.classList.add('hidden');
        resourcesSection.classList.add('hidden');
    } else {
        landingPage.classList.remove('hidden');
        authSection.classList.add('hidden');
    }
});