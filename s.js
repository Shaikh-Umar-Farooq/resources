// // Firebase Auth and Firestore instances
// const auth = firebase.auth();
// const db = firebase.firestore();

// // DOM Elements - Auth
// const authSection = document.getElementById('authSection');
// const mainContent = document.getElementById('mainContent');
// const userSection = document.getElementById('userSection');
// const userEmail = document.getElementById('userEmail');
// const loginBtn = document.getElementById('loginBtn');
// const signupBtn = document.getElementById('signupBtn');
// const logoutBtn = document.getElementById('logoutBtn');
// const authError = document.getElementById('authError');
// const emailInput = document.getElementById('email');
// const passwordInput = document.getElementById('password');

// // DOM Elements - Content (from original)
// const welcomeSection = document.getElementById('welcomeSection');
// const chaptersSection = document.getElementById('chaptersSection');
// const resourcesSection = document.getElementById('resourcesSection');
// const chapterList = document.getElementById('chapterList');
// const resourceList = document.getElementById('resourceList');

// // Auth State Handler
// auth.onAuthStateChanged((user) => {
//     if (user) {
//         // User is signed in
//         authSection.classList.add('hidden');
//         mainContent.classList.remove('hidden');
//         userSection.classList.remove('hidden');
//         userEmail.textContent = user.email;
//         loadProgress(); // Load user's progress from Firestore
//     } else {
//         // User is signed out
//         authSection.classList.remove('hidden');
//         mainContent.classList.add('hidden');
//         userSection.classList.add('hidden');
//         userEmail.textContent = '';
//     }
// });

// // Auth Event Listeners
// loginBtn.addEventListener('click', async () => {
//     const email = emailInput.value;
//     const password = passwordInput.value;
    
//     if (!email || !password) {
//         authError.textContent = 'Please enter both email and password';
//         return;
//     }

//     try {
//         loginBtn.classList.add('loading');
//         await auth.signInWithEmailAndPassword(email, password);
//         authError.textContent = '';
//         emailInput.value = '';
//         passwordInput.value = '';
//     } catch (error) {
//         authError.textContent = error.message;
//     } finally {
//         loginBtn.classList.remove('loading');
//     }
// });

// signupBtn.addEventListener('click', async () => {
//     const email = emailInput.value;
//     const password = passwordInput.value;
    
//     if (!email || !password) {
//         authError.textContent = 'Please enter both email and password';
//         return;
//     }

//     try {
//         signupBtn.classList.add('loading');
//         await auth.createUserWithEmailAndPassword(email, password);
//         authError.textContent = '';
//         emailInput.value = '';
//         passwordInput.value = '';
//     } catch (error) {
//         authError.textContent = error.message;
//     } finally {
//         signupBtn.classList.remove('loading');
//     }
// });

// logoutBtn.addEventListener('click', async () => {
//     try {
//         await auth.signOut();
//     } catch (error) {
//         console.error('Error signing out:', error);
//     }
// });

// // Progress Calculation Functions (unchanged)
// function calculateChapterProgress(chapter) {
//     const total = chapter.resources.length;
//     const completed = chapter.resources.filter(resource => resource.completed).length;
//     const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
//     return { completed, total, percentage };
// }

// function calculateLevelProgress(level) {
//     let totalResources = 0;
//     let completedResources = 0;

//     level.chapters.forEach(chapter => {
//         const progress = calculateChapterProgress(chapter);
//         totalResources += progress.total;
//         completedResources += progress.completed;
//     });

//     const percentage = totalResources === 0 ? 0 : Math.round((completedResources / totalResources) * 100);
//     return { completed: completedResources, total: totalResources, percentage };
// }

// // Helper Functions (unchanged)
// function findChapterByTitle(title) {
//     return Object.values(courseData)
//         .flatMap(level => level.chapters)
//         .find(chapter => chapter.title === title);
// }

// function getYouTubeVideoId(url) {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : null;
// }

// // Progress Persistence with Firestore
// async function saveProgress(chapterTitle, resourceTitle, completed, resource) {
//     const user = auth.currentUser;
//     if (!user) return;

//     try {
//         // Update the resource object in memory
//         resource.completed = completed;

//         // Save to Firestore
//         await db.collection('users').doc(user.uid).collection('progress').doc(chapterTitle).set({
//             [resourceTitle]: completed
//         }, { merge: true });

//         // Update UI
//         updateAllProgress();
//     } catch (error) {
//         console.error('Error saving progress:', error);
//     }
// }

// async function loadProgress() {
//     const user = auth.currentUser;
//     if (!user) return;

//     try {
//         const snapshot = await db.collection('users').doc(user.uid).collection('progress').get();
        
//         // Reset all progress first
//         Object.values(courseData).forEach(level => {
//             level.chapters.forEach(chapter => {
//                 chapter.resources.forEach(resource => {
//                     resource.completed = false;
//                 });
//             });
//         });

//         // Apply progress from Firestore
//         snapshot.forEach(doc => {
//             const chapterTitle = doc.id;
//             const progress = doc.data();
            
//             Object.entries(progress).forEach(([resourceTitle, completed]) => {
//                 Object.values(courseData).forEach(level => {
//                     level.chapters.forEach(chapter => {
//                         if (chapter.title === chapterTitle) {
//                             const resource = chapter.resources.find(r => r.title === resourceTitle);
//                             if (resource) {
//                                 resource.completed = completed;
//                             }
//                         }
//                     });
//                 });
//             });
//         });

//         updateAllProgress();
//     } catch (error) {
//         console.error('Error loading progress:', error);
//     }
// }

// // Display Functions
// function showChapters(level) {
//     const levelData = courseData[level];
//     document.getElementById('levelTitle').textContent = levelData.title;
//     chapterList.innerHTML = '';

//     levelData.chapters.forEach(chapter => {
//         const chapterCard = document.createElement('div');
//         chapterCard.className = 'chapter-card';
//         chapterCard.innerHTML = `<h3>${chapter.title}</h3>`;
        
//         const progress = calculateChapterProgress(chapter);
//         chapterCard.innerHTML += `
//             <div class="chapter-stats">
//                 <span>${progress.completed}/${progress.total} resources completed</span>
//                 <span>${progress.percentage}%</span>
//             </div>
//             <div class="progress-bar">
//                 <div class="progress-fill" style="width: ${progress.percentage}%"></div>
//             </div>
//         `;

//         chapterCard.addEventListener('click', () => showResources(chapter));
//         chapterList.appendChild(chapterCard);
//     });

//     welcomeSection.classList.add('hidden');
//     chaptersSection.classList.remove('hidden');
// }

// function showResources(chapter) {
//     document.getElementById('chapterTitle').textContent = chapter.title;
    
//     // Reset tabs
//     document.querySelectorAll('.tab').forEach(tab => {
//         tab.classList.remove('active');
//         if (tab.dataset.type === 'video') {
//             tab.classList.add('active');
//         }
//     });

//     // Remove old event listeners
//     const tabs = document.querySelector('.tabs');
//     const newTabs = tabs.cloneNode(true);
//     tabs.parentNode.replaceChild(newTabs, tabs);
    
//     // Add new event listeners
//     newTabs.querySelectorAll('.tab').forEach(tab => {
//         tab.addEventListener('click', () => {
//             newTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
//             tab.classList.add('active');
//             showResourcesByType(chapter, tab.dataset.type);
//         });
//     });

//     showResourcesByType(chapter, 'video');
//     chaptersSection.classList.add('hidden');
//     resourcesSection.classList.remove('hidden');
// }



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

// Progress Calculation Functions (unchanged)
function calculateChapterProgress(chapter) {
    const total = chapter.resources.length;
    const completed = chapter.resources.filter(resource => resource.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percentage };
}

function calculateLevelProgress(level) {
    let totalResources = 0;
    let completedResources = 0;

    level.chapters.forEach(chapter => {
        const progress = calculateChapterProgress(chapter);
        totalResources += progress.total;
        completedResources += progress.completed;
    });

    const percentage = totalResources === 0 ? 0 : Math.round((completedResources / totalResources) * 100);
    return { completed: completedResources, total: totalResources, percentage };
}

// Helper Functions (unchanged)
function findChapterByTitle(title) {
    return Object.values(courseData)
        .flatMap(level => level.chapters)
        .find(chapter => chapter.title === title);
}

function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Progress Persistence with Firestore
async function saveProgress(chapterTitle, resourceTitle, completed, resource) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Update the resource object in memory
        resource.completed = completed;

        // Save to Firestore
        await db.collection('users').doc(user.uid).collection('progress').doc(chapterTitle).set({
            [resourceTitle]: completed
        }, { merge: true });

        // Update UI
        updateAllProgress();
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

async function loadProgress() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await db.collection('users').doc(user.uid).collection('progress').get();
        
        // Reset all progress first
        Object.values(courseData).forEach(level => {
            level.chapters.forEach(chapter => {
                chapter.resources.forEach(resource => {
                    resource.completed = false;
                });
            });
        });

        // Apply progress from Firestore
        snapshot.forEach(doc => {
            const chapterTitle = doc.id;
            const progress = doc.data();
            
            Object.entries(progress).forEach(([resourceTitle, completed]) => {
                Object.values(courseData).forEach(level => {
                    level.chapters.forEach(chapter => {
                        if (chapter.title === chapterTitle) {
                            const resource = chapter.resources.find(r => r.title === resourceTitle);
                            if (resource) {
                                resource.completed = completed;
                            }
                        }
                    });
                });
            });
        });

        updateAllProgress();
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Display Functions
// Update the showChapters function to always show progress
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

        // Update all UI elements
        updateAllProgress();
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
        <div class="progress-text">
            <span>${overallProgress.completed}/${overallProgress.total} resources completed</span>
            <span>${overallProgress.percentage}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${overallProgress.percentage}%"></div>
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
    const existingProgress = card.querySelector('.progress-bar');
    if (!existingProgress) {
        card.innerHTML += `
            <div class="chapter-stats">
                <span>${progress.completed}/${progress.total} resources completed</span>
                <span>${progress.percentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
            </div>
        `;
    } else {
        card.querySelector('.progress-fill').style.width = `${progress.percentage}%`;
        card.querySelector('.chapter-stats').innerHTML = `
            <span>${progress.completed}/${progress.total} resources completed</span>
            <span>${progress.percentage}%</span>
        `;
    }
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
        const status = header.querySelector('.completion-status') || 
                      document.createElement('div');
        status.className = 'completion-status';
        status.textContent = `${progress.completed}/${progress.total} completed (${progress.percentage}%)`;
        if (!header.querySelector('.completion-status')) {
            header.appendChild(status);
        }
    }
}

// Resource Display Function
function showResourcesByType(chapter, type) {
    resourceList.innerHTML = '';
    const filteredResources = chapter.resources.filter(resource => resource.type === type);
    
    filteredResources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'resource-card';
        
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
                            <input type="checkbox" id="${resource.url}" ${resource.completed ? 'checked' : ''}>
                            <label for="${resource.url}">Mark as complete</label>
                        </div>
                        <a href="${resource.url}" class="view-link" target="_blank">Watch Video</a>
                    </div>
                </div>
            `;
            const isCompleted = userProgress[resource.title] || false;
            // Update checkbox checked state based on userProgress
            resourceCard.querySelector('input[type="checkbox"]').checked = isCompleted;
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
                            <input type="checkbox" id="${resource.url}" ${resource.completed ? 'checked' : ''}>
                            <label for="${resource.url}">Mark as complete</label>
                        </div>
                        <a href="${resource.url}" class="view-link" target="_blank">Read Article</a>
                    </div>
                </div>
            `;
            const isCompleted = userProgress[resource.title] || false;
            // Update checkbox checked state based on userProgress
            resourceCard.querySelector('input[type="checkbox"]').checked = isCompleted;
        }
        
        const checkbox = resourceCard.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            saveProgress(chapter.title, resource.title, checkbox.checked);
        });
        
        resourceList.appendChild(resourceCard);
    });
}


// Event Listeners
document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => showChapters(card.dataset.level));
});

document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    welcomeSection.classList.remove('hidden');
    chaptersSection.classList.add('hidden');
    resourcesSection.classList.add('hidden');
});

document.getElementById('backToLevels').addEventListener('click', (e) => {
    e.preventDefault();
    welcomeSection.classList.remove('hidden');
    chaptersSection.classList.add('hidden');
});

document.getElementById('backToChapters').addEventListener('click', (e) => {
    e.preventDefault();
    resourcesSection.classList.add('hidden');
    chaptersSection.classList.remove('hidden');
});