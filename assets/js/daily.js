
const CHALLENGE_TIME_MS = 4 * 60 * 1000; // 4 minutes per game

document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/data/games.json');
    const allGames = await res.json();
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    let challenge = JSON.parse(localStorage.getItem('arcado_daily_challenge') || 'null');
    
    if (!challenge || challenge.date !== dateStr) {
        let seed = 0;
        for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);
        
        let shuffled = [...allGames].sort(() => {
            seed = (seed * 9301 + 49297) % 233280;
            return (seed / 233280) - 0.5;
        });
        
        const selected = shuffled.slice(0, 3);
        const profile = JSON.parse(localStorage.getItem('arcado_profile') || '{}');
        const gamesStats = profile.games || {};
        
        challenge = {
            date: dateStr,
            games: selected.map(g => ({
                id: g.id,
                name: g.name,
                image: g.image,
                slug: g.slug,
                category: g.category,
                startMs: (gamesStats[g.id] && gamesStats[g.id].ms) || 0
            })),
            completed: false,
            celebrated: false
        };
        localStorage.setItem('arcado_daily_challenge', JSON.stringify(challenge));
    }

    function renderChallenges() {
        const profile = JSON.parse(localStorage.getItem('arcado_profile') || '{}');
        const gamesStats = profile.games || {};
        let allDone = true;

        const html = challenge.games.map(g => {
            const currentMs = (gamesStats[g.id] && gamesStats[g.id].ms) || 0;
            const earnedMs = Math.max(0, currentMs - g.startMs);
            const progress = Math.min(100, (earnedMs / CHALLENGE_TIME_MS) * 100);
            const isDone = earnedMs >= CHALLENGE_TIME_MS;
            if (!isDone) allDone = false;

            const remainingSec = Math.max(0, Math.ceil((CHALLENGE_TIME_MS - earnedMs) / 1000));
            const remainingMin = Math.floor(remainingSec / 60);
            const remainingText = isDone ? '✅ Completed' : `⏳ ${remainingMin}m ${remainingSec % 60}s left`;

            return `
            <div class="daily-card ${isDone ? 'completed' : ''}" style="background: var(--card); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <img src="${g.image}" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-family: 'Fredoka One', cursive; font-size: 18px; margin-bottom: 2px;">${g.name}</div>
                        <div style="color: var(--muted); font-size: 12px; font-weight: 600;">${g.category}</div>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${isDone ? '#10b981' : 'var(--muted)'};">
                        <span>Progress</span>
                        <span>${remainingText}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                <button onclick="window.location.href='/game/${g.slug}.html'" style="width: 100%; background: ${isDone ? 'rgba(16, 185, 129, 0.1)' : 'var(--accent)'}; color: ${isDone ? '#10b981' : '#fff'}; border: ${isDone ? '1px solid #10b98133' : 'none'}; border-radius: 10px; padding: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s;">
                    ${isDone ? 'Play Again' : '▶ Start Challenge'}
                </button>
            </div>
            `;
        }).join('');

        document.getElementById('dailyGamesContainer').innerHTML = html;

        if (allDone) {
            document.getElementById('dailyCompletionOverlay').style.display = 'block';
            if (!challenge.celebrated) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ff5f57', '#ffbe30', '#10b981', '#33b5e5']
                });
                challenge.celebrated = true;
                challenge.completed = true;
                localStorage.setItem('arcado_daily_challenge', JSON.stringify(challenge));
            }
        }
    }

    renderChallenges();
    setInterval(renderChallenges, 5000);

    function updateCountdown() {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        
        const diff = tomorrow - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        document.getElementById('cdH').textContent = String(h).padStart(2, '0');
        document.getElementById('cdM').textContent = String(m).padStart(2, '0');
        document.getElementById('cdS').textContent = String(s).padStart(2, '0');
        
        if (diff <= 0) window.location.reload();
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
});
