// DOM Elements
const welcomeSection = document.getElementById('welcomeSection');
const chaptersSection = document.getElementById('chaptersSection');
const resourcesSection = document.getElementById('resourcesSection');
const chapterList = document.getElementById('chapterList');
const resourceList = document.getElementById('resourceList');

// Progress Calculation Functions
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

// Helper Functions
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

// Update Progress UI
function updateAllProgress() {
    // Update level cards
    Object.entries(courseData).forEach(([levelKey, levelData]) => {
        const progress = calculateLevelProgress(levelData);
        const levelCard = document.querySelector(`.level-card[data-level="${levelKey}"]`);
        if (levelCard) {
            const progressBar = levelCard.querySelector('.progress-bar');
            if (!progressBar) {
                levelCard.innerHTML += `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${progress.completed}/${progress.total} completed</span>
                        <span>${progress.percentage}%</span>
                    </div>
                `;
            } else {
                progressBar.querySelector('.progress-fill').style.width = `${progress.percentage}%`;
                levelCard.querySelector('.progress-text').innerHTML = `
                    <span>${progress.completed}/${progress.total} completed</span>
                    <span>${progress.percentage}%</span>
                `;
            }
        }
    });

    // Update chapter cards if they're visible
    const chapterList = document.getElementById('chapterList');
    if (!chapterList.classList.contains('hidden')) {
        chapterList.querySelectorAll('.chapter-card').forEach(card => {
            const chapterTitle = card.querySelector('h3').textContent;
            const chapter = Object.values(courseData)
                .flatMap(level => level.chapters)
                .find(c => c.title === chapterTitle);
            if (chapter) {
                const progress = calculateChapterProgress(chapter);
                const progressBar = card.querySelector('.progress-bar');
                if (!progressBar) {
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
                    progressBar.querySelector('.progress-fill').style.width = `${progress.percentage}%`;
                    card.querySelector('.chapter-stats').innerHTML = `
                        <span>${progress.completed}/${progress.total} resources completed</span>
                        <span>${progress.percentage}%</span>
                    `;
                }
            }
        });
    }

    // Update current chapter progress if resources are visible
    if (!resourcesSection.classList.contains('hidden')) {
        const chapterTitle = document.getElementById('chapterTitle').textContent;
        const chapter = Object.values(courseData)
            .flatMap(level => level.chapters)
            .find(c => c.title === chapterTitle);
        if (chapter) {
            const progress = calculateChapterProgress(chapter);
            const header = document.querySelector('.resource-header');
            if (!header) {
                const titleElement = document.getElementById('chapterTitle');
                titleElement.outerHTML = `
                    <div class="resource-header">
                        <h2 id="chapterTitle">${chapterTitle}</h2>
                        <div class="completion-status">
                            ${progress.completed}/${progress.total} completed (${progress.percentage}%)
                        </div>
                    </div>
                `;
            } else {
                header.querySelector('.completion-status').textContent = 
                    `${progress.completed}/${progress.total} completed (${progress.percentage}%)`;
            }
        }
    }
}

// Display Functions
function showChapters(level) {
    const levelData = courseData[level];
    document.getElementById('levelTitle').textContent = levelData.title;
    chapterList.innerHTML = '';

    levelData.chapters.forEach(chapter => {
        const chapterCard = document.createElement('div');
        chapterCard.className = 'chapter-card';
        chapterCard.innerHTML = `<h3>${chapter.title}</h3>`;
        
        const progress = calculateChapterProgress(chapter);
        chapterCard.innerHTML += `
            <div class="chapter-stats">
                <span>${progress.completed}/${progress.total} resources completed</span>
                <span>${progress.percentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
            </div>
        `;

        chapterCard.addEventListener('click', () => showResources(chapter));
        chapterList.appendChild(chapterCard);
    });

    welcomeSection.classList.add('hidden');
    chaptersSection.classList.remove('hidden');
}

function showResources(chapter) {
    document.getElementById('chapterTitle').textContent = chapter.title;
    const progress = calculateChapterProgress(chapter);
    
    // Reset tabs and set video tab as active
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.type === 'video') {
            tab.classList.add('active');
        }
    });
    
    // Remove old event listeners by cloning and replacing tabs
    const tabs = document.querySelector('.tabs');
    const newTabs = tabs.cloneNode(true);
    tabs.parentNode.replaceChild(newTabs, tabs);
    
    // Add new event listeners to tabs
    newTabs.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            newTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showResourcesByType(chapter, tab.dataset.type);
        });
    });

    showResourcesByType(chapter, 'video'); // Show videos by default
    chaptersSection.classList.add('hidden');
    resourcesSection.classList.remove('hidden');
}

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
        }
        
        const checkbox = resourceCard.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            resource.completed = checkbox.checked;
            saveProgress(chapter.title, resource.title, checkbox.checked, resource);
        });
        
        resourceList.appendChild(resourceCard);
    });
}

// Progress Persistence
function saveProgress(chapterTitle, resourceTitle, completed, resource) {
    // Update the resource object
    resource.completed = completed;

    // Save to localStorage
    const progress = JSON.parse(localStorage.getItem('uiuxProgress') || '{}');
    if (!progress[chapterTitle]) {
        progress[chapterTitle] = {};
    }
    progress[chapterTitle][resourceTitle] = completed;
    localStorage.setItem('uiuxProgress', JSON.stringify(progress));

    // Update all progress indicators
    updateAllProgress();
}

function loadProgress() {
    const progress = JSON.parse(localStorage.getItem('uiuxProgress') || '{}');
    Object.entries(progress).forEach(([chapterTitle, resources]) => {
        Object.entries(resources).forEach(([resourceTitle, completed]) => {
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

// Initialize
loadProgress();
updateAllProgress();