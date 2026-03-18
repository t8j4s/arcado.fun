const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const htmlContent = fs.readFileSync(path.join(ROOT, 'arcado.html'), 'utf-8');

// extracting GAMES
const gamesMatch = htmlContent.match(/const GAMES = \[([\s\S]*?)\];/);
let gamesStr = gamesMatch[0].replace('const GAMES = ', '').replace(/;$/, '');
// eval to array
const GAMES = eval(gamesStr);

const GAME_DESC = {
      arcade: g => `${g.name} is a reflex-testing arcade hit. Race for the high score!`,
      puzzle: g => `${g.name} keeps your brain razor-sharp with clever puzzles and satisfying solutions.`,
      runner: g => `${g.name} is a pulse-pounding endless runner — dodge, jump, and sprint to a new best!`,
      racing: g => `${g.name} puts you behind the wheel. Master the track and leave rivals in the dust.`,
      action: g => `${g.name} delivers explosive action gameplay. React fast, aim true, conquer all!`,
      sports: g => `${g.name} captures real sports excitement right in your browser. Become a champion!`,
      girls: g => `${g.name} is a fun, creative game bursting with style. Express yourself and enjoy!`,
      match3: g => `${g.name} chains satisfying combos in colorful match-3 bliss — just one more turn!`,
      bubble: g => `${g.name} is a classic bubble shooter with a twist. Clear the board before time runs out!`,
      cards: g => `${g.name} brings strategic card play to your browser. Outsmart every opponent!`,
      quiz: g => `${g.name} puts your knowledge to the test. How smart are you? Find out now!`,
      multiplayer: g => `${g.name} is a multiplayer showdown. Challenge friends or go it alone!`,
};

function getRating(id) { 
    // Consistent rating between 4.0 and 5.0 based on ID
    return (40 + (id * 7) % 11) / 10; 
}

const newGames = GAMES.map(g => {
    let parts = g.url.split('/');
    let slug = g.slug || parts[parts.length - 2] || g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let desc = (GAME_DESC[g.cat] || GAME_DESC.arcade)(g);
    return {
        id: g.id,
        name: g.name,
        slug: slug,
        category: g.cat,
        badge: g.badge || null,
        featured: g.featured || false,
        image: g.img,
        url: g.url,
        rating: getRating(g.id),
        tags: [g.cat, "html5", "free"],
        description: desc
    };
});

const dirs = [
    'data', 'components', 'pages', 'game', 'assets/css', 'assets/js', 'ads'
];
dirs.forEach(d => fs.mkdirSync(path.join(ROOT, d), { recursive: true }));

fs.writeFileSync(path.join(ROOT, 'data/games.json'), JSON.stringify(newGames, null, 2));

// Leaderboards
const LB_NAMES = ['NightHawk99', 'PixelQueen', 'FastFinger', 'MegaGamer', 'StarBlaster', 'ArcadePro', 'ZeroGravity', 'NeonByte', 'ThunderAce', 'ShadowPlay'];
function lbSeed(a, b) { return ((a * 1009 + b * 7919) % 97531); }
const leaderboard = Array.from({ length: 15 }, (_, rank) => {
    const g = newGames[lbSeed(rank, 42) % newGames.length];
    return { rank: rank + 1, name: LB_NAMES[lbSeed(rank, g.id * 3) % LB_NAMES.length], score: Math.floor(lbSeed(rank, g.id) % 90000 + 10000), gameId: g.id, gameName: g.name, gameImage: g.image };
});
fs.writeFileSync(path.join(ROOT, 'data/leaderboard.json'), JSON.stringify(leaderboard, null, 2));

// Trending
const week = Math.floor(Date.now() / (7 * 86400000));
function hotSeed(a, b) { return ((a * 2311 + b * 6271) % 88889); }
const trending = [...newGames].sort((a, b) => hotSeed(week, a.id) - hotSeed(week, b.id)).slice(0, 20).map((g, i) => {
    return { id: g.id, rank: i + 1, views: Math.floor(hotSeed(week + i, g.id) % 90000 + 5000) };
});
fs.writeFileSync(path.join(ROOT, 'data/trending.json'), JSON.stringify(trending, null, 2));

console.log('Data files created successfully!');

// Generate sitemap.xml
let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
sitemap += `  <url><loc>https://arcado.fun/</loc><priority>1.0</priority></url>\n`;
sitemap += `  <url><loc>https://arcado.fun/pages/daily-challenge.html</loc><priority>0.8</priority></url>\n`;
sitemap += `  <url><loc>https://arcado.fun/pages/leaderboards.html</loc><priority>0.8</priority></url>\n`;
sitemap += `  <url><loc>https://arcado.fun/pages/hot.html</loc><priority>0.8</priority></url>\n`;
newGames.forEach(g => {
    sitemap += `  <url><loc>https://arcado.fun/game/${g.slug}.html</loc><priority>0.9</priority></url>\n`;
});
sitemap += '</urlset>';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log('Sitemap created!');

fs.writeFileSync(path.join(ROOT, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://arcado.fun/sitemap.xml\n');

fs.writeFileSync(path.join(ROOT, 'manifest.json'), JSON.stringify({
    name: "Arcado Games",
    short_name: "Arcado",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0f1a",
    theme_color: "#ff5f57",
    icons: [{
        src: "/assets/images/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png"
    }, {
        src: "/assets/images/icons/icon-192.png",
        sizes: "512x512",
        type: "image/png"
    }]
}, null, 2));
console.log('Manifest and robots.txt created!');
