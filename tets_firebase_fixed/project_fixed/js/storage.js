let currentUser = null;
let currentBookId = null;
let currentFilter = 'Semua';

// ─── PER-USER (localStorage) ───────────────────────────────────────────────
function getUsers()    { return JSON.parse(localStorage.getItem('pustaka_users') || '[]'); }
function saveUsers(u)  { localStorage.setItem('pustaka_users', JSON.stringify(u)); }
function getBorrows()    { return JSON.parse(localStorage.getItem('pustaka_borrows') || '[]'); }
function saveBorrows(b)  { localStorage.setItem('pustaka_borrows', JSON.stringify(b)); }
function getAdmin()      { return JSON.parse(localStorage.getItem('pustaka_admin') || 'null'); }
function setSession(u)   { localStorage.setItem('pustaka_session', JSON.stringify(u)); }
function getSession()    { return JSON.parse(localStorage.getItem('pustaka_session') || 'null'); }
function clearSession()  { localStorage.removeItem('pustaka_session'); }

// ─── IN-MEMORY CACHE ──────────────────────────────────────────────────────
let _customBooks = [];
let _hiddenBookIds = [];

function getCustomBooks()   { return _customBooks; }
function getHiddenBookIds() { return _hiddenBookIds; }

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────
async function fsGet(docId) {
    try {
        const snap = await window._db.collection('pustaka').doc(docId).get();
        return snap.exists ? snap.data().value : null;
    } catch(e) { console.error('fsGet error:', e); return null; }
}

async function fsSet(docId, value) {
    try {
        await window._db.collection('pustaka').doc(docId).set({ value });
    } catch(e) { console.error('fsSet error:', e); }
}

// ─── SAVE ke Firestore ────────────────────────────────────────────────────
async function saveCustomBooks(books) {
    _customBooks = books;
    await fsSet('custom_books', JSON.stringify(books));
}

async function saveHiddenBookIds(ids) {
    _hiddenBookIds = ids;
    await fsSet('hidden_books', JSON.stringify(ids));
}

// ─── INIT: load dari Firestore sebelum app jalan ──────────────────────────
async function initSharedStorage() {
    const cb = await fsGet('custom_books');
    _customBooks = cb ? JSON.parse(cb) : [];

    const hb = await fsGet('hidden_books');
    _hiddenBookIds = hb ? JSON.parse(hb) : [];
}

// ─── Auto-convert Google Drive link ke format preview ─────────────────────
function convertPdfUrl(url) {
    if (!url) return url;
    // Format: https://drive.google.com/file/d/FILE_ID/view -> /preview
    var match = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/);
    if (match) {
        return 'https://drive.google.com/file/d/' + match[1] + '/preview';
    }
    return url;
}
