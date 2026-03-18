
async function loadGames() {
    const res = await fetch('/data/games.json');
    const games = await res.json();
    return games;
}

document.addEventListener('DOMContentLoaded', async () => {
    if(!document.getElementById('gamesGrid')) return;
    const games = await loadGames();
    const urlParams = new URLSearchParams(window.location.search);
    let cat = urlParams.get('cat') || 'all';
    let q = urlParams.get('search') || '';
    
    let filtered = games;
    if(q) {
        q = q.toLowerCase();
        filtered = games.filter(g => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
        document.getElementById('allTitle').textContent = `🔍 Search: ${q}`;
    } else if(cat === 'new') {
        filtered = games.filter(g => g.badge === 'new');
        document.getElementById('allTitle').textContent = '🆕 New Games';
    } else if(cat === 'popular') {
        filtered = games.filter(g => g.badge === 'hot');
        document.getElementById('allTitle').textContent = '🔥 Popular Games';
    } else if(cat !== 'all') {
        filtered = games.filter(g => g.category === cat);
        document.getElementById('allTitle').textContent = `🎮 ${cat} Games`;
    }
    
    document.getElementById('gameCount').textContent = `${filtered.length} games`;
    
    const grid = document.getElementById('gamesGrid');
    const loadMoreWrap = document.getElementById('loadMoreWrap');
    let displayCount = 40;
    
    function renderGrid(append = false) {
        if(filtered.length === 0) {
            grid.innerHTML = '<div class="no-results"><div class="ic">😢</div><p>No games found.</p></div>';
            if (loadMoreWrap) loadMoreWrap.style.display = 'none';
        } else {
            if (!append) {
                const current = filtered.slice(0, displayCount);
                grid.innerHTML = current.map(g => renderGameCard(g)).join('');
            } else {
                const start = displayCount - 40;
                const current = filtered.slice(start, displayCount);
                const temp = document.createElement('div');
                temp.innerHTML = current.map(g => renderGameCard(g)).join('');
                
                Array.from(temp.children).forEach((child, i) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(20px)';
                    child.style.transition = 'all 0.4s ease';
                    grid.appendChild(child);
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, i * 35);
                });
            }
            if (loadMoreWrap) {
                if (displayCount >= filtered.length) {
                    loadMoreWrap.style.display = 'none';
                } else {
                    loadMoreWrap.style.display = 'flex';
                }
            }
        }
    }
    
    if (document.getElementById('loadMoreBtn')) {
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            displayCount += 40;
            renderGrid(true);
        });
    }
    
    renderGrid(false);
    
    if(cat === 'all' && !q) {
        const feat = games.filter(g => g.featured);
        document.getElementById('featuredGrid').innerHTML = feat.slice(0, 10).map(g => renderGameCard(g)).join('');
    } else {
        document.getElementById('featuredSection').style.display = 'none';
    }
});
