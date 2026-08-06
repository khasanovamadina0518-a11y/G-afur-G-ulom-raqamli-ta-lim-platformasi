// ===================================
// Asarlar sahifasi JavaScript
// ===================================

let allPoems = [];
let filteredPoems = [];
let favorites = [];
let currentPoemId = null;

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    await loadPoems();
    loadFavorites();
    initFilters();
    initTabs();
    initModal();
    checkUrlParams(); // Check if a poem was shared
});

// ===================================
// Check URL Parameters
// ===================================
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const poemId = urlParams.get('id') || urlParams.get('poem');
    
    if (poemId) {
        const id = parseInt(poemId);
        const poem = allPoems.find(p => p.id === id);
        if (poem) {
            // Open the poem modal after a short delay
            setTimeout(() => openPoemModal(id), 500);
        }
    }
}

// ===================================
// Load Poems
// ===================================
async function loadPoems() {
    try {
        allPoems = await getSherlar();
        filteredPoems = [...allPoems];
        displayPoems();
        updateResultsCount();
    } catch (error) {
        console.error('She\'rlarni yuklashda xatolik:', error);
    }
}

// ===================================
// Display Poems
// ===================================
function displayPoems() {
    const container = document.getElementById('poems-grid');
    if (!container) return;
    
    if (filteredPoems.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" style="grid-column: 1/-1;">
                Hech qanday she'r topilmadi. Filtrlarni o'zgartiring.
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredPoems.map(poem => `
        <div class="poem-card" data-id="${poem.id}">
            <button class="favorite-btn ${isFavorite(poem.id) ? 'active' : ''}" 
                    onclick="toggleFavorite(${poem.id}); event.stopPropagation();">
                ${isFavorite(poem.id) ? '❤️' : '🤍'}
            </button>
            <div class="poem-badges">
                ${poem.mavzu.map(m => `<span class="badge">${m}</span>`).join('')}
            </div>
            <h3>${poem.sarlavha}</h3>
            <p class="poem-year">${poem.yil}</p>
            <p class="poem-excerpt">${poem.qisqa}</p>
            <div class="poem-actions">
                <button class="btn-primary btn-small" onclick="openPoemModal(${poem.id})">
                    To'liq o'qish →
                </button>
            </div>
        </div>
    `).join('');
}

// ===================================
// Filters
// ===================================
function initFilters() {
    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        applyFilters();
    });
    
    // Mavzu filters
    const mavzuButtons = document.querySelectorAll('.filter-btn[data-mavzu]');
    mavzuButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            mavzuButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
        });
    });
    
    // Year filter
    const yearSelect = document.getElementById('year-filter');
    yearSelect.addEventListener('change', applyFilters);
    
    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            const grid = document.getElementById('poems-grid');
            if (view === 'list') {
                grid.classList.add('list-view');
            } else {
                grid.classList.remove('list-view');
            }
        });
    });
}

function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const activeMavzu = document.querySelector('.filter-btn.active[data-mavzu]').getAttribute('data-mavzu');
    const yearRange = document.getElementById('year-filter').value;
    
    filteredPoems = allPoems.filter(poem => {
        // Search filter
        const matchesSearch = poem.sarlavha.toLowerCase().includes(searchQuery) ||
                            poem.matn.toLowerCase().includes(searchQuery);
        
        // Mavzu filter
        let matchesMavzu = true;
        if (activeMavzu === 'favorites') {
            matchesMavzu = isFavorite(poem.id);
        } else if (activeMavzu !== 'all') {
            matchesMavzu = poem.mavzu.includes(activeMavzu);
        }
        
        // Year filter
        let matchesYear = true;
        if (yearRange !== 'all') {
            const [start, end] = yearRange.split('-').map(Number);
            matchesYear = poem.yil >= start && poem.yil <= end;
        }
        
        return matchesSearch && matchesMavzu && matchesYear;
    });
    
    displayPoems();
    updateResultsCount();
}

function updateResultsCount() {
    const count = document.getElementById('results-count');
    count.textContent = `${allPoems.length} ta she'rdan ${filteredPoems.length} ta ko'rsatilmoqda`;
}

// ===================================
// Favorites
// ===================================
function loadFavorites() {
    const saved = localStorage.getItem('gafur-favorites');
    favorites = saved ? JSON.parse(saved) : [];
}

function saveFavorites() {
    localStorage.setItem('gafur-favorites', JSON.stringify(favorites));
}

function isFavorite(poemId) {
    return favorites.includes(poemId);
}

function toggleFavorite(poemId) {
    if (isFavorite(poemId)) {
        favorites = favorites.filter(id => id !== poemId);
    } else {
        favorites.push(poemId);
    }
    saveFavorites();
    displayPoems();
}

// ===================================
// Modal
// ===================================
function initModal() {
    const modal = document.getElementById('poem-modal');
    const closeBtn = document.getElementById('modal-close');
    const closeBtn2 = document.getElementById('close-btn');
    const shareBtn = document.getElementById('share-btn');
    const copyBtn = document.getElementById('copy-btn');
    const printBtn = document.getElementById('print-btn');
    const favoriteBtn = document.getElementById('favorite-modal-btn');
    
    closeBtn.addEventListener('click', closeModal);
    closeBtn2.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    
    shareBtn.addEventListener('click', sharePoem);
    copyBtn.addEventListener('click', copyToClipboard);
    printBtn.addEventListener('click', printPoem);
    favoriteBtn.addEventListener('click', function() {
        if (currentPoemId) {
            toggleFavorite(currentPoemId);
            updateFavoriteButton();
        }
    });
}

function openPoemModal(poemId) {
    const poem = allPoems.find(p => p.id === poemId);
    if (!poem) return;
    
    currentPoemId = poemId;
    
    document.getElementById('modal-title').textContent = poem.sarlavha;
    document.getElementById('modal-year').textContent = poem.yil;
    document.getElementById('modal-badges').innerHTML = 
        poem.mavzu.map(m => `<span class="badge">${m}</span>`).join('');
    document.getElementById('modal-text').textContent = poem.matn;
    
    updateFavoriteButton();
    
    const modal = document.getElementById('poem-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('poem-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentPoemId = null;
}

function updateFavoriteButton() {
    const btn = document.getElementById('favorite-modal-btn');
    if (isFavorite(currentPoemId)) {
        btn.textContent = '❤️ Sevimlilardan olib tashlash';
    } else {
        btn.textContent = "❤️ Sevimlilarga qo'shish";
    }
}

function copyToClipboard() {
    const text = document.getElementById('modal-text').textContent;
    const title = document.getElementById('modal-title').textContent;
    const year = document.getElementById('modal-year').textContent;
    
    const fullText = `${title}\n(${year})\n\n${text}\n\n— G'afur G'ulom`;
    
    navigator.clipboard.writeText(fullText).then(() => {
        alert('She\'r nusxalandi!');
    }).catch(err => {
        console.error('Nusxalashda xatolik:', err);
    });
}

function printPoem() {
    window.print();
}

// ===================================
// Share Poem
// ===================================
function sharePoem() {
    const poem = allPoems.find(p => p.id === currentPoemId);
    if (!poem) return;
    
    const title = `${poem.sarlavha} - G'afur G'ulom`;
    const text = `${poem.sarlavha} (${poem.yil})\n\n${poem.qisqa}\n\n— G'afur G'ulom`;
    const url = `${window.location.origin}${window.location.pathname}?poem=${poem.id}`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        })
        .then(() => {
            console.log('She\'r muvaffaqiyatli ulashildi');
        })
        .catch((error) => {
            console.log('Ulashish bekor qilindi:', error);
        });
    } else {
        // Fallback: Copy to clipboard
        const shareText = `${title}\n\n${text}\n\n${url}`;
        navigator.clipboard.writeText(shareText)
            .then(() => {
                showNotification('Havola nusxa olindi! ✓');
            })
            .catch((err) => {
                console.error('Nusxalashda xatolik:', err);
                showNotification('Nusxalashda xatolik!', 'error');
            });
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existing = document.querySelector('.share-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `share-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Fade out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===================================
// Tabs
// ===================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Remove active from all
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active to selected
    document.querySelector(`[data-tab="${tabName}"].tab-btn`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"].tab-content`).classList.add('active');
}

// ===================================
// Make functions global
// ===================================
window.openPoemModal = openPoemModal;
window.toggleFavorite = toggleFavorite;
