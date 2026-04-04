/**
 * borrow.js
 * Logika peminjaman dan pengembalian buku.
 * Dependency: storage.js, utils.js, modal.js, nav.js, render.js
 */

/* Pinjam buku — user harus login, buku harus tersedia */
function borrowBook(bookId) {
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu', 'error');
        showModal('modal-login');
        return;
    }
    if (isBookBorrowed(bookId)) {
        showToast('Buku ini sedang dipinjam orang lain', 'error');
        return;
    }

    const borrows = getBorrows();
    borrows.push({
        bookId: bookId,
        username: currentUser.username,
        borrowDate: new Date().toISOString(),
        returnDate: null
    });
    saveBorrows(borrows);

    showToast(`Berhasil meminjam "${getBookById(bookId).title}"`, 'success');
    renderDetail(bookId);
}

/* Buka modal pengembalian */
function openReturnModal(bookId) {
    document.getElementById('return-book-id').value = bookId;
    if (currentUser) document.getElementById('return-username').value = currentUser.username;
    showModal('modal-return');
}

/* Proses pengembalian — verifikasi login dulu */
function handleReturn(e) {
    e.preventDefault();
    const bookId   = parseInt(document.getElementById('return-book-id').value);
    const username  = document.getElementById('return-username').value.trim();
    const password  = document.getElementById('return-password').value;

    /* Verifikasi identitas */
    const user = getUsers().find(u => u.username === username && u.password === password);
    if (!user) { showToast('Username atau password salah', 'error'); return; }

    /* Cek apakah user ini yang meminjam buku tersebut */
    const borrows = getBorrows();
    const idx = borrows.findIndex(b => b.bookId === bookId && b.username === username && !b.returnDate);
    if (idx === -1) { showToast('Buku ini tidak sedang kamu pinjam', 'error'); return; }

    borrows[idx].returnDate = new Date().toISOString();
    saveBorrows(borrows);

    hideModal('modal-return');
    showToast(`"${getBookById(bookId).title}" berhasil dikembalikan`, 'success');

    /* Refresh view yang sedang aktif */
    if (document.getElementById('view-detail').classList.contains('active')) renderDetail(bookId);
    else if (document.getElementById('view-mybooks').classList.contains('active')) renderMyBooks();
}

/* Admin paksa kembalikan buku */
function adminForceReturn(bookId) {
    const borrows = getBorrows();
    const idx = borrows.findIndex(b => b.bookId === bookId && !b.returnDate);
    if (idx === -1) return;

    borrows[idx].returnDate = new Date().toISOString();
    saveBorrows(borrows);

    showToast(`"${getBookById(bookId).title}" berhasil dikembalikan oleh admin`, 'success');
    renderAdmin();
}