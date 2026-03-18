
document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/data/trending.json');
    const trend = await res.json();
    
    const resGames = await fetch('/data/games.json');
    const games = await resGames.json();
    const gameMap = {};
    games.forEach(g => gameMap[g.id] = g);
    
    const html = trend.map(t => {
        const g = gameMap[t.id];
        return `
        <a href="/game/${g.slug}.html" style="display:flex; align-items:center; gap:12px; padding:10px 15px; background:var(--card); border-radius:11px; margin-bottom:6px; border:1px solid #fff1; text-decoration:none; color:inherit;">
          <div style="font-family:'Fredoka One',cursive; font-size:20px; width:32px; text-align:center; color:var(--muted);">${t.rank}</div>
          <img src="${g.image}" style="width:44px; height:44px; border-radius:9px; object-fit:cover;">
          <div style="flex:1;">
            <div style="font-weight:800; font-size:13px; margin-bottom:2px;">${g.name}</div>
            <div style="font-size:11px; color:var(--muted); font-weight:600;">${g.category}</div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:12px; color:var(--muted); font-weight:700;">${t.views >= 1000 ? (t.views/1000).toFixed(1)+'k' : t.views} views</span>
          </div>
        </a>
        `;
    }).join('');
    document.getElementById('hotContent').innerHTML = html;
});
