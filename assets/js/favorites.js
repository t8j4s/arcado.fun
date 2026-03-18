
document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/data/games.json');
    const games = await res.json();
    const favIds = JSON.parse(localStorage.getItem('arcado_favs') || '[]');
    const favGames = games.filter(g => favIds.includes(g.id));
    if(favGames.length) {
        document.getElementById('favGrid').innerHTML = favGames.map(g => renderGameCard(g)).join('');
    } else {
        document.getElementById('favGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:70px 20px;color:var(--muted);">No favorites yet!</div>';
    }
});
