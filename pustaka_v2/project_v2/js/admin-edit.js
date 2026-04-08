var selectedEditColorIdx = 0;
var editPdfAction = 'keep';

function openEditBook(bookId) {
    var book = getBookById(bookId);
    if (!book) return;

    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-year').value = book.year;
    document.getElementById('edit-category').value = book.category;
    document.getElementById('edit-synopsis').value = book.synopsis;
    document.getElementById('edit-color1').value = book.color1;
    document.getElementById('edit-color2').value = book.color2;

    selectedEditColorIdx = colorPresets.findIndex(function(c) { return c.c1 === book.color1 && c.c2 === book.color2; });
    if (selectedEditColorIdx === -1) selectedEditColorIdx = 0;
    document.getElementById('edit-color-options').innerHTML = colorPresets.map(function(c, i) {
        var active = c.c1 === book.color1 && c.c2 === book.color2;
        return '<div onclick="selectEditColor(' + i + ')" id="edit-color-opt-' + i + '" style="width:40px;height:40px;border-radius:.375rem;cursor:pointer;background:linear-gradient(135deg,' + c.c1 + ',' + c.c2 + ');border:3px solid ' + (active?'var(--fg)':'transparent') + ';transition:border .15s;"></div>';
    }).join('');

    document.getElementById('edit-cover-img').value = book.coverImg || '';
    editPdfAction = 'keep';
    if (book.pdfUrl) {
        document.getElementById('edit-pdf-url').value = book.pdfUrl;
        document.getElementById('edit-pdf-area').classList.add('has-file');
        document.getElementById('edit-pdf-area').innerHTML = '<i class="fas fa-check-circle" style="color:var(--primary);"></i><p style="color:var(--primary);font-weight:600;">Link tersimpan</p>';
    } else {
        document.getElementById('edit-pdf-url').value = '';
        document.getElementById('edit-pdf-area').classList.remove('has-file');
        document.getElementById('edit-pdf-area').innerHTML =
            '<i class="fas fa-link"></i><p>Klik <a href="#" onclick="event.preventDefault();openPdfGuide()" style="color:var(--primary);font-weight:600;">ini</a> untuk lihat cara buat link embed</p>';
    }

    showModal('modal-edit-book');
}

function selectEditColor(idx) {
    selectedEditColorIdx = idx;
    document.getElementById('edit-color1').value = colorPresets[idx].c1;
    document.getElementById('edit-color2').value = colorPresets[idx].c2;
    colorPresets.forEach(function(_, i) {
        document.getElementById('edit-color-opt-' + i).style.border = i === idx ? '3px solid var(--fg)' : '3px solid transparent';
    });
}

function handleEditPdfUrlInput() {
    var val = document.getElementById('edit-pdf-url').value.trim();
    var area = document.getElementById('edit-pdf-area');
    if (val) {
        area.classList.add('has-file');
        area.innerHTML = '<i class="fas fa-check-circle" style="color:var(--primary);"></i><p style="color:var(--primary);font-weight:600;">Link tersimpan</p>';
        editPdfAction = 'new';
    } else {
        area.classList.remove('has-file');
        area.innerHTML = '<i class="fas fa-link"></i><p>Klik <a href="#" onclick="event.preventDefault();openPdfGuide()" style="color:var(--primary);font-weight:600;">ini</a> untuk lihat cara buat link embed</p>';
        editPdfAction = 'remove';
    }
}

async function handleEditBook(e) {
    e.preventDefault();
    var bookId = parseInt(document.getElementById('edit-book-id').value);
    if (isNaN(bookId)) return;

    var pdfUrl = convertPdfUrl(document.getElementById('edit-pdf-url').value.trim());

    if (editPdfAction === 'remove' || !pdfUrl) {
        pdfUrl = null;
    }

    var updatedBook = {
        id: bookId,
        title: document.getElementById('edit-title').value.trim(),
        author: document.getElementById('edit-author').value.trim(),
        year: parseInt(document.getElementById('edit-year').value),
        category: document.getElementById('edit-category').value,
        synopsis: document.getElementById('edit-synopsis').value.trim(),
        coverImg: document.getElementById('edit-cover-img').value.trim() || null,
        color1: document.getElementById('edit-color1').value,
        color2: document.getElementById('edit-color2').value,
        pdfUrl: pdfUrl
    };

    var customBooks = getCustomBooks();
    var idx = customBooks.findIndex(function(b) { return b.id === bookId; });
    if (idx !== -1) customBooks[idx] = updatedBook;
    else customBooks.push(updatedBook);
    await saveCustomBooks(customBooks);

    hideModal('modal-edit-book');
    showToast('Buku berhasil diperbarui', 'success');
    renderAdmin();
}

async function deleteBook(bookId) {
    var customBooks = getCustomBooks();
    var idx = customBooks.findIndex(function(b) { return b.id === bookId; });
    if (idx !== -1) {
        customBooks.splice(idx, 1);
        await saveCustomBooks(customBooks);
    } else {
        var h = getHiddenBookIds().slice();
        if (h.indexOf(bookId) === -1) {
            h.push(bookId);
            await saveHiddenBookIds(h);
        }
    }
    saveBorrows(getBorrows().filter(function(b) { return b.bookId !== bookId; }));
    showToast('Buku berhasil dihapus', 'success');
    renderAdmin();
}
