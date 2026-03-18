
function fmtMs(ms) { const m = Math.floor(ms / 60000), h = Math.floor(m / 60); return h > 0 ? `${h}h ${m%60}m` : `${m}m`; }
function onNameFocus() {
    const el = document.getElementById('profileName');
    el.style.borderColor = 'var(--accent)';
    document.getElementById('nameEditTick').style.display = 'inline';
    document.getElementById('nameEditIcon').style.display = 'none';
}
function onNameBlur() {
    setTimeout(() => {
        const el = document.getElementById('profileName');
        if (document.activeElement !== el) {
            el.style.borderColor = 'transparent';
            document.getElementById('nameEditTick').style.display = 'none';
            document.getElementById('nameEditIcon').style.display = 'inline';
        }
    }, 200);
}
function handleNameKey(e) { 
    if(e.key === 'Enter') e.preventDefault();
    const currentLen = e.target.textContent.length;
    // Allow navigation, delete, backspace etc (key length > 1)
    if (e.key.length === 1 && currentLen >= 7 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
    }
}

function saveProfileName() {
    let el = document.getElementById('profileName');
    let newName = el.textContent.trim();
    if(newName.length > 7) newName = newName.substring(0, 7);
    if(newName) {
        let p = JSON.parse(localStorage.getItem('arcado_profile') || '{}');
        p.name = newName;
        localStorage.setItem('arcado_profile', JSON.stringify(p));
        if (typeof updateTopbarUser === 'function') updateTopbarUser();
    }
    el.blur();
}
const EMOJIS = ['🎮', '🕹️', '🚀', '🔥', '💎', '👾', '👻', '🤖', '🦖', '⚽', '🏎️', '🍕', '🐱', '🕶️', '👑'];
const COLORS = ['linear-gradient(135deg, #ff5f57, #ffbe30)', 'linear-gradient(135deg, #7c3aed, #db2777)', 'linear-gradient(135deg, #00c851, #007e33)', 'linear-gradient(135deg, #33b5e5, #0099cc)', 'linear-gradient(135deg, #2e2e2e, #111111)', 'linear-gradient(135deg, #ffbb33, #ff8800)', 'linear-gradient(135deg, #ff3547, #cc0000)', 'linear-gradient(135deg, #6253e1, #04befe)', 'linear-gradient(135deg, #84fab0, #8fd3f4)', 'linear-gradient(135deg, #f093fb, #f5576c)'];
let currentEmoji = '🎮', currentColor = COLORS[0];
window.openAvatarModal = function() {
    let p = JSON.parse(localStorage.getItem('arcado_profile') || '{}');
    currentEmoji = p.avatar || '🎮'; currentColor = p.avatarBg || COLORS[0];
    const eg = document.getElementById('emojiGrid');
    eg.innerHTML = EMOJIS.map(e => `<div onclick="selectEmoji('${e}', this)" class="emoji-opt ${e===currentEmoji?'active':''}" style="font-size:24px; padding:10px; background:var(--card); border-radius:10px; cursor:pointer; text-align:center; border:2px solid transparent;">${e}</div>`).join('');
    const cg = document.getElementById('colorGrid');
    cg.innerHTML = COLORS.map(c => `<div onclick="selectColor('${c}', this)" class="color-opt ${c===currentColor?'active':''}" style="height:35px; background:${c}; border-radius:10px; cursor:pointer; border:2px solid transparent;"></div>`).join('');
    document.getElementById('avatarModal').style.display = 'grid';
};
window.selectEmoji = (e, el) => { currentEmoji = e; document.querySelectorAll('.emoji-opt').forEach(x => x.classList.remove('active')); el.classList.add('active'); };
window.selectColor = (c, el) => { currentColor = c; document.querySelectorAll('.color-opt').forEach(x => x.classList.remove('active')); el.classList.add('active'); };
window.closeAvatarModal = () => { document.getElementById('avatarModal').style.display = 'none'; };
window.saveAvatar = () => {
    let p = JSON.parse(localStorage.getItem('arcado_profile') || '{}');
    p.avatar = currentEmoji; p.avatarBg = currentColor;
    localStorage.setItem('arcado_profile', JSON.stringify(p));
    document.getElementById('profileAvatarIcon').textContent = currentEmoji;
    document.getElementById('profileAvatar').style.background = currentColor;
    if (typeof updateTopbarUser === 'function') updateTopbarUser();
    closeAvatarModal();
};
document.addEventListener('DOMContentLoaded', () => {
    let p = JSON.parse(localStorage.getItem('arcado_profile'));
    if(!p) { p = { name: 'Player', joined: Date.now(), games: {}, totalMs: 0, favCount: 0 }; localStorage.setItem('arcado_profile', JSON.stringify(p)); }
    document.getElementById('profileName').textContent = p.name || 'Player';
    document.getElementById('profileJoined').textContent = 'Member since ' + new Date(p.joined).toLocaleDateString();
    const iconEl = document.getElementById('profileAvatarIcon'), bgEl = document.getElementById('profileAvatar');
    if (iconEl && p.avatar) iconEl.textContent = p.avatar;
    if (bgEl && p.avatarBg) bgEl.style.background = p.avatarBg;
    const gCount = Object.keys(p.games || {}).length;
    document.getElementById('profileStats').innerHTML = `<div style="background:var(--card); border:1px solid #fff1; border-radius:12px; padding:14px; text-align:center;"><div style="font-family:'Fredoka One',cursive; font-size:26px; color:var(--accent2);">${gCount}</div><div style="font-size:10px; font-weight:800; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin-top:3px;">Games Played</div></div><div style="background:var(--card); border:1px solid #fff1; border-radius:12px; padding:14px; text-align:center;"><div style="font-family:'Fredoka One',cursive; font-size:26px; color:var(--accent2);">${fmtMs(p.totalMs)}</div><div style="font-size:10px; font-weight:800; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin-top:3px;">Time Played</div></div><div style="background:var(--card); border:1px solid #fff1; border-radius:12px; padding:14px; text-align:center;"><div style="font-family:'Fredoka One',cursive; font-size:26px; color:var(--accent2);">${p.favCount || 0}</div><div style="font-size:10px; font-weight:800; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin-top:3px;">Favorites</div></div>`;
    const badges = [{ id: 'first', icon: '🎮', name: 'First Play', desc: 'Played your first game', check: p => Object.keys(p.games||{}).length >= 1 }, { id: 'vet10', icon: '🔟', name: 'Veteran', desc: 'Played 10 different games', check: p => Object.keys(p.games||{}).length >= 10 }, { id: 'fav5', icon: '❤️', name: 'Collector', desc: 'Favorited 5 games', check: p => (p.favCount||0) >= 5 }, { id: 'marathon', icon: '⏱️', name: 'Marathon', desc: 'Played for 60+ minutes total', check: p => (p.totalMs||0) >= 3600000 }];
    document.getElementById('badgesGrid').innerHTML = badges.map(b => { const unlocked = b.check(p); const st = unlocked ? 'opacity:1; border-color:#ffbe3045; background:linear-gradient(135deg, #1e1000, #1e2235);' : 'opacity:.35; background:var(--card); border:1px solid #fff1;'; return `<div style="border-radius:12px; padding:14px; text-align:center; transition:all .2s; ${st}"><div style="font-size:30px; margin-bottom:7px;">${b.icon}</div><div style="font-weight:800; font-size:12.5px; margin-bottom:3px;">${b.name}</div><div style="font-size:11px; color:var(--muted);">${b.desc}</div></div>`; }).join('');
});
