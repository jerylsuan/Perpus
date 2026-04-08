document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('show')) e.target.classList.remove('show');
    if (!e.target.closest('#nav-auth')) document.querySelectorAll('.user-dropdown').forEach(function(d) { d.classList.remove('show'); });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeReader();
});

document.addEventListener('DOMContentLoaded', async function() {
    await initSharedStorage();

    if (!getAdmin()) localStorage.setItem('pustaka_admin', JSON.stringify({ username: 'admin', password: 'admin123' }));
    var session = getSession();
    if (session) {
        if (session.type === 'admin') {
            var admin = getAdmin();
            if (admin && admin.username === session.username) { currentUser = session; hideGate(); updateNavAuth(); navigate('admin'); return; }
        } else {
            var user = getUsers().find(function(u) { return u.username === session.username; });
            if (user) { currentUser = Object.assign({}, user, { type: 'user' }); hideGate(); updateNavAuth(); renderHome(); return; }
        }
        clearSession();
    }
    showGate();
});
