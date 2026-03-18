
const REAL_NAMES = ["Sam F.", "Player#32", "Amaya", "Diana Hi", "Hackerrrr", "Zane", "Leo G", "X_Gamer_X", "Sasha", "Maximus", "GamerGirl99", "ProPoki", "Kael", "Jade", "Mystic"];
const EMOJIS = ['🎮', '🕹️', '🚀', '🔥', '💎', '👾', '👻', '🤖', '🦖', '⚽', '🏎️', '🍕', '🐱', '🕶️', '👑'];
const COLORS = [
    'linear-gradient(135deg, #ff5f57, #ffbe30)', 
    'linear-gradient(135deg, #7c3aed, #db2777)',
    'linear-gradient(135deg, #00c851, #007e33)',
    'linear-gradient(135deg, #33b5e5, #0099cc)',
    'linear-gradient(135deg, #2e2e2e, #111111)',
    'linear-gradient(135deg, #ffbb33, #ff8800)',
    'linear-gradient(135deg, #ff3547, #cc0000)',
    'linear-gradient(135deg, #6253e1, #04befe)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #f093fb, #f5576c)'
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let lb = REAL_NAMES.map((name, i) => {
            let score = 8500000 - (i * 500000) - (Math.floor(Math.random() * 100000));
            let hash = 0;
            for (let j = 0; j < name.length; j++) hash = name.charCodeAt(j) + ((hash << 5) - hash);
            return {
                name: name,
                score: score,
                gameName: 'Elite Player',
                avatar: EMOJIS[Math.abs(hash) % EMOJIS.length],
                avatarBg: COLORS[Math.abs(hash) % COLORS.length],
                me: false
            };
        });
        
        let p = JSON.parse(localStorage.getItem('arcado_profile') || '{}');
        let userScore = ((p.totalMs || 0) / 1000) * 15 + (Object.keys(p.games || {}).length * 1250);
        
        lb.push({ 
            name: p.name || 'Player', 
            score: Math.round(userScore), 
            gameName: 'Overall Ranking', 
            avatar: p.avatar || '🎮', 
            avatarBg: p.avatarBg || COLORS[0],
            me: true 
        });
        
        lb.sort((a,b) => b.score - a.score);
        
        const html = lb.map((e, i) => {
            let rank = i + 1;
            let displayRank = rank > 15 && e.me ? "99+" : rank.toString();
            if (rank > 15 && !e.me) return '';

            return `
            <div style="display:flex; align-items:center; gap:12px; padding:12px 15px; background:${e.me ? 'rgba(255, 95, 87, 0.15)' : 'var(--card)'}; border-radius:12px; margin-bottom:8px; border:1px solid ${e.me ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}; transform: ${e.me ? 'scale(1.02)' : 'none'};">
                <div style="font-family:'Fredoka One',cursive; font-size:16px; width:40px; text-align:center; color:${rank <= 3 ? 'var(--accent2)' : 'var(--muted)'};">
                    ${rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : displayRank}
                </div>
                <div style="width:40px; height:40px; border-radius:50%; display:grid; place-items:center; background:${e.avatarBg}; font-size:20px;">
                    ${e.avatar}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:14px; color:${e.me ? 'var(--accent)' : 'var(--text)'}">${e.name} ${e.me ? '(You ✨)' : ''}</div>
                    <div style="font-size:11px; color:var(--muted); font-weight:600;">${e.gameName}</div>
                </div>
                <div style="font-family:'Fredoka One',cursive; font-size:17px; color:var(--accent2);">${e.score.toLocaleString()}</div>
            </div>
            `;
        }).join('');
        
        document.getElementById('lbContent').innerHTML = html;
    } catch (err) {}
});
