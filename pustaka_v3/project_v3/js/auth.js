/**
 * auth.js — Login, register, admin, logout, verifikasi pengembalian.
 * Users & borrows sekarang disimpan di Firestore (via storage.js).
 */

function switchGateTab(tab) {
    document.querySelectorAll('.gate-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('gate-form-user').style.display = 'none';
    document.getElementById('gate-form-register').style.display = 'none';
    document.getElementById('gate-form-admin').style.display = 'none';

    if (tab === 'user') {
        document.querySelectorAll('.gate-tab')[0].classList.add('active');
        document.getElementById('gate-form-user').style.display = '';
    } else if (tab === 'register') {
        document.querySelectorAll('.gate-tab')[0].classList.add('active');
        document.getElementById('gate-form-register').style.display = '';
    } else {
        document.querySelectorAll('.gate-tab')[1].classList.add('active');
        document.getElementById('gate-form-admin').style.display = '';
    }
}

function handleGateLogin(e, type) {
    e.preventDefault();
    if (type === 'admin') {
        const username = document.getElementById('gate-admin-user').value.trim();
        const password = document.getElementById('gate-admin-pass').value;
        const admin = getAdmin();
        if (admin && admin.username === username && admin.password === password) {
            currentUser = { username: admin.username, name: 'Administrator', type: 'admin' };
            setSession(currentUser);
            hideGate();
            updateNavAuth();
            navigate('admin');
            showToast('Berhasil masuk sebagai Admin', 'success');
        } else {
            showToast('Username atau password admin salah', 'error');
        }
    } else {
        const username = document.getElementById('gate-username').value.trim();
        const password = document.getElementById('gate-password').value;
        const user = getUsers().find(u => u.username === username && u.password === password);
        if (!user) { showToast('Username atau password salah', 'error'); return; }
        currentUser = { ...user, type: 'user' };
        setSession(currentUser);
        hideGate();
        updateNavAuth();
        renderHome();
        showToast(`Selamat datang, ${user.name}`, 'success');
    }
}

async function handleGateRegister(e) {
    e.preventDefault();
    const name = document.getElementById('gate-reg-name').value.trim();
    const username = document.getElementById('gate-reg-username').value.trim();
    const password = document.getElementById('gate-reg-password').value;
    if (username.length < 3) { showToast('Username minimal 3 karakter', 'error'); return; }
    const users = getUsers();
    if (users.find(u => u.username === username)) { showToast('Username sudah digunakan', 'error'); return; }
    const newUser = { name, username, password, createdAt: new Date().toISOString() };
    users.push(newUser);
    await saveUsers(users);
    showToast('Akun berhasil dibuat! Silakan login.', 'success');
    switchGateTab('user');
    document.getElementById('gate-username').value = username;
}

function handleLogout() {
    currentUser = null;
    clearSession();
    showGate();
    showToast('Berhasil keluar', 'info');
}

async function handleReturn(e) {
    e.preventDefault();
    const bookId   = parseInt(document.getElementById('return-book-id').value);
    const username  = document.getElementById('return-username').value.trim();
    const password  = document.getElementById('return-password').value;

    const user = getUsers().find(u => u.username === username && u.password === password);
    if (!user) { showToast('Username atau password salah', 'error'); return; }

    const borrows = getBorrows();
    const idx = borrows.findIndex(b => b.bookId === bookId && b.username === username && !b.returnDate);
    if (idx === -1) { showToast('Buku ini tidak sedang kamu pinjam', 'error'); return; }

    borrows[idx].returnDate = new Date().toISOString();
    await saveBorrows(borrows);

    hideModal('modal-return');
    showToast(`"${getBookById(bookId).title}" berhasil dikembalikan`, 'success');

    if (document.getElementById('view-detail').classList.contains('active')) renderDetail(bookId);
    else if (document.getElementById('view-mybooks').classList.contains('active')) renderMyBooks();
}

function showGate() {
    document.getElementById('login-gate').classList.remove('hidden');
    document.querySelectorAll('#login-gate form').forEach(f => f.reset());
    switchGateTab('user');
}
function hideGate() {
    document.getElementById('login-gate').classList.add('hidden');
}
