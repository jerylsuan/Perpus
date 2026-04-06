var colorPresets = [
    {c1:'#E76F51',c2:'#F4A261'},{c1:'#264653',c2:'#2A9D8F'},{c1:'#606C38',c2:'#283618'},
    {c1:'#023E8A',c2:'#0096C7'},{c1:'#9B2226',c2:'#CA6702'},{c1:'#BC4749',c2:'#F2CC8F'},
    {c1:'#7B2CBF',c2:'#C77DFF'},{c1:'#006D77',c2:'#83C5BE'}
];
var selectedColorIdx = 0;

function initAddBookForm() {
    selectedColorIdx = 0;
    document.getElementById('color-options').innerHTML = colorPresets.map(function(c, i) {
        return '<div onclick="selectColor(' + i + ')" id="color-opt-' + i + '" style="width:40px;height:40px;border-radius:.375rem;cursor:pointer;background:linear-gradient(135deg,' + c.c1 + ',' + c.c2 + ');border:3px solid ' + (i===0?'var(--fg)':'transparent') + ';transition:border .15s;"></div>';
    }).join('');
    document.getElementById('add-color1').value = colorPresets[0].c1;
    document.getElementById('add-color2').value = colorPresets[0].c2;
    document.getElementById('add-pdf-url').value = '';
    resetAddPdfArea();
}

function selectColor(idx) {
    selectedColorIdx = idx;
    document.getElementById('add-color1').value = colorPresets[idx].c1;
    document.getElementById('add-color2').value = colorPresets[idx].c2;
    colorPresets.forEach(function(_, i) {
        document.getElementById('color-opt-' + i).style.border = i === idx ? '3px solid var(--fg)' : '3px solid transparent';
    });
}

function resetAddPdfArea() {
    document.getElementById('add-pdf-url').value = '';
    document.getElementById('add-pdf-area').classList.remove('has-file');
    document.getElementById('add-pdf-area').innerHTML =
        '<i class="fas fa-link"></i><p>Klik <a href="#" onclick="event.preventDefault();openPdfGuide()" style="color:var(--primary);font-weight:600;">ini</a> untuk lihat cara buat link embed</p>';
}

function handleAddPdfUrlInput() {
    var val = document.getElementById('add-pdf-url').value.trim();
    var area = document.getElementById('add-pdf-area');
    if (val) {
        area.classList.add('has-file');
        area.innerHTML = '<i class="fas fa-check-circle" style="color:var(--primary);"></i><p style="color:var(--primary);font-weight:600;">Link tersimpan</p>';
    } else {
        resetAddPdfArea();
    }
}

async function handleAddBook(e) {
    e.preventDefault();
    var title = document.getElementById('add-title').value.trim();
    var author = document.getElementById('add-author').value.trim();
    var year = document.getElementById('add-year').value;
    if (!title || !author || !year) { showToast('Judul, penulis, dan tahun wajib diisi', 'error'); return; }
    var pdfUrl = convertPdfUrl(document.getElementById('add-pdf-url').value.trim()) || null;

    var customBooks = getCustomBooks();
    var maxId = customBooks.length > 0 ? Math.max.apply(null, customBooks.map(function(b){return b.id;})) : 99;
    customBooks.push({
        id: Math.max(maxId + 1, 100),
        title: document.getElementById('add-title').value.trim(),
        author: document.getElementById('add-author').value.trim(),
        year: parseInt(document.getElementById('add-year').value),
        category: document.getElementById('add-category').value,
        synopsis: document.getElementById('add-synopsis').value.trim(),
        color1: document.getElementById('add-color1').value,
        color2: document.getElementById('add-color2').value,
        pdfUrl: pdfUrl
    });
    await saveCustomBooks(customBooks);
    hideModal('modal-add-book');
    showToast('Buku berhasil ditambahkan', 'success');
    renderAdmin();
}

function openPdfGuide() {
    window.open('https://support.google.com/drive/answer/24248588', '_blank');
}

/* Tampilkan panduan link embed di modal tambah buku */
var guideHtml = '<div style="margin-top:.75rem;padding:.75rem;background:var(--bg);border-radius:.5rem;font-size:.8125rem;color:var(--muted);line-height:1.6;">' +
    '<div style="font-weight:600;color:var(--fg);margin-bottom:.375rem;">Cara buat link embed:</div>' +
    '<ol style="padding-left:1rem;">' +
    '<li>Upload PDF ke <b>Google Drive</b></li>' +
    '<li>Klik kanan file &rarr; <b>"Bagikan"</b></li>' +
    '<li>Pilih <b>"Siapa saja yang memiliki link"</b></li>' +
    '<li>Salin link, ganti <b>file/d/.../view</b> jadi <b>file/d/.../preview</b></li>' +
    '</ol>' +
    '<div style="margin-top:.375rem;padding:.5rem;background:#fff;border:1px solid var(--border);border-radius:.375rem;font-family:monospace;font-size:.75rem;word-break:break-all;color:var(--fg);">https://drive.google.com/file/d/<span style="color:var(--accent);">FILE_ID</span>/preview</div>' +
    '</div>';