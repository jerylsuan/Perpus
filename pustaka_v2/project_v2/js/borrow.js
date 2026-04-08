/**
 * borrow.js — Peminjaman & pengembalian buku, dengan batas 7 hari.
 */

const BORROW_DAYS = 7;

function getDueDate(borrowDate) {
    var d = new Date(borrowDate);
    d.setDate(d.getDate() + BORROW_DAYS);
    return d;
}

function getDaysLeft(borrowDate) {
    var due = getDueDate(borrowDate);
    var now = new Date();
    var diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
}

function isOverdue(borrowDate) {
    return getDaysLeft(borrowDate) < 0;
}

async function borrowBook(bookId) {
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu', 'error');
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
    await saveBorrows(borrows);

    showToast(`Berhasil meminjam "${getBookById(bookId).title}" — wajib dikembalikan dalam ${BORROW_DAYS} hari`, 'success');
    renderDetail(bookId);
}

function openReturnModal(bookId) {
    document.getElementById('return-book-id').value = bookId;
    if (currentUser) document.getElementById('return-username').value = currentUser.username;
    showModal('modal-return');
}

async function adminForceReturn(bookId) {
    const borrows = getBorrows();
    const idx = borrows.findIndex(b => b.bookId === bookId && !b.returnDate);
    if (idx === -1) return;

    borrows[idx].returnDate = new Date().toISOString();
    await saveBorrows(borrows);

    showToast(`"${getBookById(bookId).title}" berhasil dikembalikan oleh admin`, 'success');
    renderAdmin();
}
