/**
 * nav.js — Navigasi antar view & update navbar.
 */

function navigate(view, data) {
    closeReader();
    document.querySelectorAll('.user-dropdown').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-home').classList.remove('active');

    switch (view) {
        case 'home':
            document.getElementById('view-home').classList.add('active');
            document.getElementById('nav-home').classList.add('active');
            renderHome();
            break;
        case 'detail':
            document.getElementById('view-detail').classList.add('active');
            renderDetail(data);
            break;
        case 'mybooks':
            document.getElementById('view-mybooks').classList.add('active');
            renderMyBooks();
            break;
        case 'admin':
            document.getElementById('view-admin').classList.add('active');
            renderAdmin();
            break;
    }
    window.scrollTo(0, 0);
}

function updateNavAuth() {
    const el = document.getElementById('nav-auth');
    if (!currentUser) return;

    if (currentUser.type === 'admin') {
        el.innerHTML = `
            <button class="btn btn-ghost btn-sm" onclick="this.nextElementSibling.classList.toggle('show')" style="display:flex;align-items:center;gap:0.375rem;">
                <i class="fas fa-shield-halved" style="color:var(--accent);font-size:1.125rem;"></i>
                <span style="font-weight:600;font-size:0.8125rem;">Admin</span>
                <i class="fas fa-chevron-down" style="font-size:0.6rem;color:var(--muted);"></i>
            </button>
            <div class="user-dropdown">
                <button onclick="navigate('admin');this.parentElement.classList.remove('show');"><i class="fas fa-chart-bar" style="width:1rem;"></i> Dashboard</button>
                <button onclick="navigate('home');this.parentElement.classList.remove('show');"><i class="fas fa-home" style="width:1rem;"></i> Beranda</button>
                <button class="danger" onclick="handleLogout();this.parentElement.classList.remove('show');"><i class="fas fa-sign-out-alt" style="width:1rem;"></i> Keluar</button>
            </div>`;
    } else {
        el.innerHTML = `
            <button class="btn btn-ghost btn-sm" onclick="this.nextElementSibling.classList.toggle('show')" style="display:flex;align-items:center;gap:0.375rem;">
                <i class="fas fa-user-circle" style="color:var(--primary);font-size:1.125rem;"></i>
                <span style="font-weight:600;font-size:0.8125rem;">${currentUser.username}</span>
                <i class="fas fa-chevron-down" style="font-size:0.6rem;color:var(--muted);"></i>
            </button>
            <div class="user-dropdown">
                <button onclick="navigate('mybooks');this.parentElement.classList.remove('show');"><i class="fas fa-book" style="width:1rem;"></i> Pinjaman Saya</button>
                <button class="danger" onclick="handleLogout();this.parentElement.classList.remove('show');"><i class="fas fa-sign-out-alt" style="width:1rem;"></i> Keluar</button>
            </div>`;
    }
}