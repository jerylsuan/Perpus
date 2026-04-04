function openReader(bookId) {
    var book = getBookById(bookId);
    if (!book || !book.pdfUrl) { showToast('PDF tidak tersedia untuk buku ini', 'error'); return; }

    if (currentUser && currentUser.type !== 'admin') {
        var borrow = getBorrowInfo(bookId);
        if (!borrow || borrow.username !== currentUser.username) {
            showToast('Kamu harus meminjam buku ini terlebih dahulu', 'error');
            return;
        }
    }

    document.getElementById('reader-wrap').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('reader-title').textContent = book.title;
    document.getElementById('reader-content').innerHTML =
        '<iframe src="' + book.pdfUrl + '" style="width:100%;height:100%;border:none;"></iframe>';
}

function closeReader() {
    document.getElementById('reader-wrap').classList.remove('open');
    document.body.style.overflow = '';
}