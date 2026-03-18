
// Inject emoji favicon if not present
(function() {
    if (!document.querySelector("link[rel*='icon']")) {
        const link = document.createElement('link');
        link.type = 'image/svg+xml';
        link.rel = 'icon';
        link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕹️</text></svg>';
        document.head.appendChild(link);
    }
})();

// Core functionality like loading components
function updateTopbarUser() {
    const p = JSON.parse(localStorage.getItem('arcado_profile') || '{}');
    const nameEl = document.getElementById('topbarUsername');
    const avatarEl = document.getElementById('topbarAvatar');
    if (nameEl) nameEl.textContent = p.name || 'Player';
    if (avatarEl) {
        avatarEl.textContent = p.avatar || '🎮';
        if (p.avatarBg) avatarEl.style.background = p.avatarBg;
    }
}

async function loadComponent(id, url) {
    try {
        const res = await fetch(url);
        if (res.ok) {
            document.getElementById(id).innerHTML = await res.text();
            if (id === 'headerContainer') { attachCategoryListeners(); updateTopbarUser(); }
            if (id === 'sidebarContainer') { attachSearchListener(); }
        }
    } catch(e) {}
}

function getLiveCount(gameId) {
    let baseHash = (gameId * 1337) % 450;
    let block = Math.floor(Date.now() / 5000); // 5 second blocks for small fluctuations 
    let fluctuation = (block + gameId) % 21 - 10;
    return Math.abs(baseHash) + 50 + fluctuation;
}

function getFavs() { return JSON.parse(localStorage.getItem('arcado_favs') || '[]'); }
function saveFavs(f) { localStorage.setItem('arcado_favs', JSON.stringify(f)); }
function toggleFavorite(e, gameId) {
    e.preventDefault();
    e.stopPropagation();
    let favs = getFavs();
    if(favs.includes(gameId)) {
        favs = favs.filter(id => id !== gameId);
        e.target.classList.remove('active');
    } else {
        favs.push(gameId);
        e.target.classList.add('active');
    }
    saveFavs(favs);
}

function getLikes() { return JSON.parse(localStorage.getItem('arcado_likes') || '[]'); }

function toggleLike(gameId) {
    let likes = getLikes();
    const btn = document.getElementById('likeBtn');
    const countEl = document.getElementById('likeCountText');

    if(likes.includes(gameId)) {
        likes = likes.filter(id => id !== gameId);
        btn.classList.remove('active');
    } else {
        likes.push(gameId);
        btn.classList.add('active');
    }
    localStorage.setItem('arcado_likes', JSON.stringify(likes));
    if(countEl) countEl.textContent = getLikeCount(gameId, likes.includes(gameId));
}


function getLikeCount(gid, isLiked) {
    let base = (gid * 11) % 500 + 100;
    return base + (isLiked ? 1 : 0);
}

function getRatingById(id) {
    return (40 + (id * 7) % 11) / 10;
}


const CAT_EMOJIS = { arcade: '👾 Arcade', puzzle: '🧩 Puzzle', runner: '🏃 Runner', racing: '🚗 Racing', action: '⚔️ Action', sports: '⚽ Sport', girls: '💅 Girls', match3: '💎 Match 3', bubble: '🫧 Bubble', cards: '🃏 Cards', quiz: '🧠 Quiz', multiplayer: '👥 Multi' };

function renderGameCard(g) {
    const isFav = getFavs().includes(g.id);
    let badgeHtml = g.badge ? `<div class="game-badge">${g.badge === 'hot' ? '🔥 Hot' : '🆕 New'}</div>` : '';
    let catName = CAT_EMOJIS[g.category] || g.category;
    return `
    <a href="/game/${g.slug}.html" class="game-card">
        <div class="game-thumb-wrap">
            ${badgeHtml}
            <img class="game-thumb" src="${g.image}" alt="${g.name}" loading="lazy">
            <div class="game-play-btn">▶</div>
            <button class="game-fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, ${g.id})">❤️</button>
        </div>
        <div class="game-info">
            <div class="game-name">${g.name}</div>
            <div class="game-meta">
                <div class="game-cat">${catName}</div>
                <div class="live-badge"><div class="live-dot"></div><span class="live-num" data-gid="${g.id}">${getLiveCount(g.id)}</span><span> playing</span></div>
            </div>
        </div>
    </a>`;
}

function attachCategoryListeners() {
    const pills = document.querySelectorAll('.cat-pill');
    if(!pills.length) return;
    const urlParams = new URLSearchParams(window.location.search);
    const currCat = urlParams.get('cat') || 'all';
    pills.forEach(p => {
        if(p.dataset.cat === currCat) p.classList.add('active');
        p.addEventListener('click', () => {
            window.location.href = `/?cat=${p.dataset.cat}`;
        });
    });
}

function attachSearchListener() {
    const i = document.getElementById('sidebarSearch');
    if(i) {
        i.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                window.location.href = `/?search=${encodeURIComponent(i.value)}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('sidebarContainer', '/components/sidebar.html');
    loadComponent('headerContainer', '/components/header.html');
    loadComponent('footerContainer', '/components/footer.html');
    
    // Handle "Click to Play" activation
    document.addEventListener('click', (e) => {
        const frame = e.target.closest('.frame-container');
        if (frame && !frame.classList.contains('active')) {
            frame.classList.add('active');
        }
    });

    // Live count updates synchronously across all components
    setInterval(() => {
        document.querySelectorAll('.live-num').forEach(el => {
            let gid = parseInt(el.dataset.gid);
            if(!isNaN(gid)) {
                el.textContent = getLiveCount(gid);
            }
        });
    }, 5000);
});
