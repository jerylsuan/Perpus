function showToast(msg, type) {
    type = type || 'info';
    var c = document.getElementById('toast-container');
    var t = document.createElement('div');
    var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
    t.className = 'toast toast-' + type;
    t.innerHTML = '<i class="fas fa-' + icon + '" style="margin-right:0.375rem;"></i>' + msg;
    c.appendChild(t);
    setTimeout(function() { t.classList.add('exit'); setTimeout(function() { t.remove(); }, 300); }, 2500);
}

function isBookBorrowed(bookId) {
    return getBorrows().some(function(b) { return b.bookId === bookId && !b.returnDate; });
}
function getBorrowInfo(bookId) {
    return getBorrows().find(function(b) { return b.bookId === bookId && !b.returnDate; }) || null;
}

function getAllBooks() {
    var hidden = getHiddenBookIds();
    var custom = getCustomBooks();
    var customIds = {};
    custom.forEach(function(b) { customIds[b.id] = true; });
    return booksData
        .filter(function(b) { return !customIds[b.id]; })
        .concat(custom)
        .filter(function(b) { return hidden.indexOf(b.id) === -1; });
}

function getBookById(id) {
    return getAllBooks().find(function(b) { return b.id === id; });
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDueDate(borrowDate) {
    var due = getDueDate(borrowDate);
    return due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
