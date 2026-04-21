function renderHome() {
    var categories = ['Semua', 'Fiksi', 'Non-Fiksi', 'Pengembangan Diri', 'Jurnal'];
    document.getElementById('filter-tabs').innerHTML = categories.map(function(c) {
        return '<button class="filter-tab ' + (currentFilter === c ? 'active' : '') + '" onclick="currentFilter=\'' + c + '\';renderHome();">' + c + '</button>';
    }).join('');

    var search = (document.getElementById('search-input') ? document.getElementById('search-input').value : '').toLowerCase();
    var filtered = getAllBooks().filter(function(b) {
        return (b.title.toLowerCase().indexOf(search) !== -1 || b.author.toLowerCase().indexOf(search) !== -1)
            && (currentFilter === 'Semua' || b.category === currentFilter);
    });
    document.getElementById('book-count').textContent = filtered.length + ' dari ' + getAllBooks().length + ' buku';

    var grid = document.getElementById('books-grid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted);"><i class="fas fa-search" style="font-size:2rem;margin-bottom:.75rem;display:block;"></i>Tidak ada buku ditemukan</div>';
        return;
    }
    grid.innerHTML = filtered.map(function(book, i) {
        var borrowed = isBookBorrowed(book.id);
        var borrowInfo = getBorrowInfo(book.id);
        var hasPdf = !!book.pdfUrl;
        var hasImg = !!book.coverImg;

        var statusBadge = borrowed
            ? '<span class="badge badge-no">Dipinjam</span>'
            : '<span class="badge badge-ok">Tersedia</span>';
        if (hasPdf) statusBadge += ' <span class="badge badge-pdf">PDF</span>';

        // Cover: gambar jika ada, gradient jika tidak
        var coverHtml;
        if (hasImg) {
            coverHtml = '<div style="aspect-ratio:3/4;position:relative;overflow:hidden;">' +
                '<img src="' + book.coverImg + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'linear-gradient(135deg,' + book.color1 + ',' + book.color2 + ')\';">' +
                '<div style="position:absolute;top:.5rem;right:.5rem;">' + statusBadge + '</div>' +
                '</div>';
        } else {
            coverHtml = '<div style="background:linear-gradient(135deg,' + book.color1 + ',' + book.color2 + ');aspect-ratio:3/4;display:flex;flex-direction:column;justify-content:flex-end;padding:1.125rem;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:.5rem;right:.5rem;">' + statusBadge + '</div>' +
                '<div style="position:absolute;top:-20%;right:-20%;width:60%;height:60%;background:rgba(255,255,255,.06);border-radius:50%;"></div>' +
                '<div class="font-display" style="font-weight:700;font-size:.95rem;color:#fff;line-height:1.3;text-shadow:0 1px 3px rgba(0,0,0,.3);">' + book.title + '</div>' +
                '<div style="font-size:.7rem;color:rgba(255,255,255,.8);margin-top:.2rem;">' + book.author + '</div>' +
                '</div>';
        }

        // Info peminjam jika dipinjam
        var borrowerInfo = '';
        if (borrowed && borrowInfo) {
            borrowerInfo = '<div style="font-size:.7rem;color:#DC2626;margin-top:.25rem;"><i class="fas fa-user"></i> Dipinjam oleh: <b>' + borrowInfo.username + '</b></div>';
        }

        return '<div class="book-card anim-fade" style="animation-delay:' + (i * .04) + 's" onclick="navigate(\'detail\',' + book.id + ')">' +
            coverHtml +
            '<div style="padding:.875rem;">' +
                '<div style="display:flex;align-items:center;gap:.375rem;margin-bottom:.375rem;">' +
                    '<span style="font-size:.675rem;color:var(--muted);background:var(--bg);padding:.1rem .5rem;border-radius:.25rem;">' + book.category + '</span>' +
                    '<span style="font-size:.675rem;color:var(--muted);">' + book.year + '</span>' +
                '</div>' +
                '<div style="font-size:.8rem;color:var(--muted);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + book.synopsis + '</div>' +
                borrowerInfo +
            '</div>' +
        '</div>';
    }).join('');
}

function renderDetail(bookId) {
    var book = getBookById(bookId);
    if (!book) return;
    currentBookId = bookId;
    var borrowed = isBookBorrowed(bookId);
    var borrowInfo = getBorrowInfo(bookId);
    var isMyBorrow = borrowed && borrowInfo && borrowInfo.username === currentUser?.username;
    var hasPdf = !!book.pdfUrl;
    var hasImg = !!book.coverImg;
    var isAdmin = currentUser?.type === 'admin';

    var readBtn = '';
    if (hasPdf) {
        if (isAdmin || isMyBorrow) {
            readBtn = '<button class="btn btn-accent" onclick="event.stopPropagation();openReader(' + book.id + ')"><i class="fas fa-file-pdf"></i> Baca PDF</button>';
        } else {
            readBtn = '<button class="btn btn-ghost" disabled style="opacity:.5;cursor:not-allowed;"><i class="fas fa-lock"></i> Pinjam dulu untuk membaca</button>';
        }
    } else {
        readBtn = '<button class="btn btn-ghost" disabled style="opacity:.5;cursor:not-allowed;"><i class="fas fa-file-pdf"></i> Belum ada PDF</button>';
    }

    var actionBtn = '';
    if (isAdmin) {
        actionBtn = '';
    } else if (borrowed) {
        if (isMyBorrow) {
            var daysLeft = getDaysLeft(borrowInfo.borrowDate);
            var overdueLabel = isOverdue(borrowInfo.borrowDate)
                ? '<span style="color:#DC2626;font-size:.8rem;"><i class="fas fa-exclamation-triangle"></i> Terlambat ' + Math.abs(daysLeft) + ' hari!</span>'
                : '<span style="color:var(--muted);font-size:.8rem;"><i class="fas fa-clock"></i> Sisa ' + daysLeft + ' hari</span>';
            actionBtn = '<div style="display:flex;flex-direction:column;gap:.5rem;">' +
                overdueLabel +
                '<button class="btn btn-outline" onclick="event.stopPropagation();openReturnModal(' + book.id + ')"><i class="fas fa-undo"></i> Kembalikan</button>' +
                '</div>';
        } else {
            actionBtn = '<div style="display:flex;flex-direction:column;gap:.375rem;">' +
                '<button class="btn btn-ghost" disabled style="opacity:.5;cursor:not-allowed;"><i class="fas fa-lock"></i> Tidak Tersedia</button>' +
                '<span style="font-size:.8rem;color:var(--muted);"><i class="fas fa-user"></i> Dipinjam oleh: <b>' + borrowInfo.username + '</b></span>' +
                '<span style="font-size:.75rem;color:var(--muted);">Kembali: ' + formatDueDate(borrowInfo.borrowDate) + '</span>' +
                '</div>';
        }
    } else {
        actionBtn = '<button class="btn btn-primary" onclick="event.stopPropagation();borrowBook(' + book.id + ')"><i class="fas fa-hand-holding"></i> Pinjam Buku</button>';
    }

    var badges = borrowed
        ? '<span class="badge badge-no">Dipinjam oleh ' + borrowInfo.username + '</span>'
        : '<span class="badge badge-ok">Tersedia</span>';
    if (hasPdf) badges += ' <span class="badge badge-pdf">PDF</span>';

    // Cover detail
    var coverHtml;
    if (hasImg) {
        coverHtml = '<div style="width:220px;flex-shrink:0;">' +
            '<img src="' + book.coverImg + '" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:.75rem;box-shadow:0 8px 24px rgba(0,0,0,.15);" onerror="this.style.display=\'none\'">' +
            '</div>';
    } else {
        coverHtml = '<div style="width:220px;flex-shrink:0;">' +
            '<div style="background:linear-gradient(135deg,' + book.color1 + ',' + book.color2 + ');aspect-ratio:3/4;border-radius:.75rem;display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;position:relative;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.15);">' +
                '<div style="position:absolute;top:-15%;right:-15%;width:50%;height:50%;background:rgba(255,255,255,.07);border-radius:50%;"></div>' +
                '<div style="position:absolute;bottom:-10%;left:-10%;width:40%;height:40%;background:rgba(0,0,0,.08);border-radius:50%;"></div>' +
                '<div class="font-display" style="font-weight:700;font-size:1.125rem;color:#fff;line-height:1.3;text-shadow:0 2px 4px rgba(0,0,0,.3);">' + book.title + '</div>' +
                '<div style="font-size:.8rem;color:rgba(255,255,255,.85);margin-top:.25rem;">' + book.author + '</div>' +
            '</div>' +
        '</div>';
    }

    document.getElementById('detail-content').innerHTML =
    '<button class="btn btn-ghost btn-sm" onclick="navigate(\'home\')" style="margin-bottom:1.5rem;"><i class="fas fa-arrow-left"></i> Kembali</button>' +
    '<div class="anim-fade" style="display:flex;gap:2rem;flex-wrap:wrap;">' +
        coverHtml +
        '<div style="flex:1;min-width:260px;">' +
            '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;flex-wrap:wrap;">' +
                '<span style="font-size:.75rem;color:var(--muted);background:var(--bg);padding:.15rem .625rem;border-radius:.25rem;">' + book.category + '</span>' +
                '<span style="font-size:.75rem;color:var(--muted);">' + book.year + '</span>' + badges +
            '</div>' +
            '<h1 class="font-display" style="font-size:1.75rem;font-weight:900;line-height:1.2;margin-bottom:.25rem;">' + book.title + '</h1>' +
            '<p style="color:var(--muted);font-size:.9rem;margin-bottom:1.25rem;">oleh ' + book.author + '</p>' +
            '<p style="color:var(--fg);font-size:.9rem;line-height:1.75rem;margin-bottom:1.75rem;">' + book.synopsis + '</p>' +
            '<div style="display:flex;gap:.75rem;flex-wrap:wrap;align-items:flex-start;">' + readBtn + actionBtn + '</div>' +
        '</div>' +
    '</div>';
}

function renderMyBooks() {
    if (!currentUser) { showGate(); return; }
    var borrows = getBorrows().filter(function(b) { return b.username === currentUser.username && !b.returnDate; });
    var listHTML;
    if (borrows.length === 0) {
        listHTML = '<div style="text-align:center;padding:3rem;color:var(--muted);background:var(--card);border-radius:.75rem;border:1px solid var(--border);"><i class="fas fa-inbox" style="font-size:2rem;margin-bottom:.75rem;display:block;"></i>Kamu belum meminjam buku apapun</div>';
    } else {
        listHTML = '<div style="display:flex;flex-direction:column;gap:.75rem;">' +
            borrows.map(function(b) {
                var book = getBookById(b.bookId);
                if (!book) return '';
                var daysLeft = getDaysLeft(b.borrowDate);
                var overdue = isOverdue(b.borrowDate);
                var dueBadge = overdue
                    ? '<span style="color:#DC2626;font-size:.75rem;font-weight:600;"><i class="fas fa-exclamation-triangle"></i> Terlambat ' + Math.abs(daysLeft) + ' hari!</span>'
                    : '<span style="color:' + (daysLeft <= 2 ? '#D97706' : 'var(--muted)') + ';font-size:.75rem;"><i class="fas fa-clock"></i> Kembali: ' + formatDueDate(b.borrowDate) + ' (sisa ' + daysLeft + ' hari)</span>';

                var coverMini = book.coverImg
                    ? '<img src="' + book.coverImg + '" style="width:50px;height:68px;object-fit:cover;border-radius:.375rem;flex-shrink:0;" onerror="this.style.display=\'none\'">'
                    : '<div style="width:50px;height:68px;border-radius:.375rem;background:linear-gradient(135deg,' + book.color1 + ',' + book.color2 + ');flex-shrink:0;"></div>';

                return '<div class="anim-fade" style="display:flex;gap:1rem;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:.75rem;padding:1rem;">' +
                    coverMini +
                    '<div style="flex:1;min-width:0;">' +
                        '<div style="font-weight:600;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + book.title + '</div>' +
                        '<div style="font-size:.8rem;color:var(--muted);">' + book.author + '</div>' +
                        '<div style="font-size:.75rem;color:var(--muted);margin-top:.125rem;">Dipinjam: ' + formatDate(b.borrowDate) + '</div>' +
                        '<div style="margin-top:.25rem;">' + dueBadge + '</div>' +
                    '</div>' +
                    '<button class="btn btn-outline btn-sm" onclick="openReturnModal(' + b.bookId + ')"><i class="fas fa-undo"></i> Kembalikan</button>' +
                '</div>';
            }).join('') + '</div>';
    }
    document.getElementById('mybooks-content').innerHTML =
    '<button class="btn btn-ghost btn-sm" onclick="navigate(\'home\')" style="margin-bottom:1.5rem;"><i class="fas fa-arrow-left"></i> Kembali</button>' +
    '<h2 class="font-display" style="font-size:1.5rem;font-weight:700;margin-bottom:.375rem;">Pinjaman Saya</h2>' +
    '<p style="color:var(--muted);font-size:.875rem;margin-bottom:1.5rem;">Daftar buku yang sedang kamu pinjam</p>' + listHTML;
}

function renderAdmin() {
    var users = getUsers();
    var activeBorrows = getBorrows().filter(function(b) { return !b.returnDate; });
    var availableBooks = getAllBooks().length - activeBorrows.length;

    var borrowTable = activeBorrows.length === 0
        ? '<div style="padding:2rem;text-align:center;color:var(--muted);font-size:.875rem;">Tidak ada peminjaman aktif</div>'
        : '<div style="overflow-x:auto;"><table class="atable"><thead><tr><th>Buku</th><th>Peminjam</th><th>Tanggal Pinjam</th><th>Batas Kembali</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
            activeBorrows.map(function(b) {
                var book = getBookById(b.bookId);
                var daysLeft = getDaysLeft(b.borrowDate);
                var overdue = isOverdue(b.borrowDate);
                var statusBadge = overdue
                    ? '<span class="badge" style="background:#FEE2E2;color:#991B1B;">Terlambat ' + Math.abs(daysLeft) + ' hari</span>'
                    : '<span class="badge" style="background:#D1FAE5;color:#065F46;">Sisa ' + daysLeft + ' hari</span>';
                return '<tr>' +
                    '<td style="font-weight:600;">' + (book ? book.title : '?') + '</td>' +
                    '<td>' + b.username + '</td>' +
                    '<td>' + formatDate(b.borrowDate) + '</td>' +
                    '<td>' + formatDueDate(b.borrowDate) + '</td>' +
                    '<td>' + statusBadge + '</td>' +
                    '<td><button class="btn btn-danger btn-sm" onclick="adminForceReturn(' + b.bookId + ')"><i class="fas fa-undo"></i> Kembalikan</button></td>' +
                '</tr>';
            }).join('') + '</tbody></table></div>';

    var userTable = users.length === 0
        ? '<div style="padding:2rem;text-align:center;color:var(--muted);font-size:.875rem;">Belum ada pengguna</div>'
        : '<div style="overflow-x:auto;"><table class="atable"><thead><tr><th>Nama</th><th>Username</th><th>Terdaftar</th><th>Aksi</th></tr></thead><tbody>' +
            users.map(function(u) {
                return '<tr>' +
                    '<td style="font-weight:600;">' + u.name + '</td>' +
                    '<td>' + u.username + '</td>' +
                    '<td>' + formatDate(u.createdAt) + '</td>' +
                    '<td><button class="btn btn-danger btn-sm" onclick="adminDeleteUser(\'' + u.username + '\')"><i class="fas fa-trash"></i> Hapus</button></td>' +
                '</tr>';
            }).join('') +
            '</tbody></table></div>';

    var bookTable = getAllBooks().length === 0
        ? '<div style="padding:2rem;text-align:center;color:var(--muted);font-size:.875rem;">Belum ada buku</div>'
        : '<div style="overflow-x:auto;"><table class="atable"><thead><tr><th>Cover</th><th>Judul</th><th>Penulis</th><th>Kategori</th><th>PDF</th><th>Aksi</th></tr></thead><tbody>' +
            getAllBooks().map(function(b) {
                var coverThumb = b.coverImg
                    ? '<img src="' + b.coverImg + '" style="width:36px;height:48px;object-fit:cover;border-radius:.25rem;" onerror="this.style.display=\'none\'">'
                    : '<div style="width:36px;height:48px;border-radius:.25rem;background:linear-gradient(135deg,' + b.color1 + ',' + b.color2 + ');"></div>';
                return '<tr>' +
                    '<td>' + coverThumb + '</td>' +
                    '<td style="font-weight:600;">' + b.title + '</td>' +
                    '<td>' + b.author + '</td>' +
                    '<td>' + b.category + '</td>' +
                    '<td>' + (b.pdfUrl ? '<span class="badge badge-pdf">Ada</span>' : '<span class="badge" style="background:#FEF3C7;color:#92400E;">Kosong</span>') + '</td>' +
                    '<td><div style="display:flex;gap:.375rem;">' +
                        '<button class="btn btn-outline btn-sm" onclick="openEditBook(' + b.id + ')"><i class="fas fa-pen"></i> Edit</button>' +
                        '<button class="btn btn-danger btn-sm" onclick="deleteBook(' + b.id + ')"><i class="fas fa-trash"></i></button>' +
                    '</div></td>' +
                '</tr>';
            }).join('') + '</tbody></table></div>';

    document.getElementById('admin-content').innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:.75rem;">' +
        '<div><h2 class="font-display" style="font-size:1.5rem;font-weight:700;">Dashboard Admin</h2><p style="color:var(--muted);font-size:.8125rem;">Kelola peminjaman dan data pengguna</p></div>' +
        '<div style="display:flex;gap:.5rem;">' +
            '<button class="btn btn-accent btn-sm" onclick="initAddBookForm();showModal(\'modal-add-book\')"><i class="fas fa-plus"></i> Tambah Buku</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="navigate(\'home\')"><i class="fas fa-arrow-left"></i> Beranda</button>' +
        '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:2rem;">' +
        '<div class="stat-card"><div style="display:flex;align-items:center;gap:.75rem;"><div class="stat-icon" style="background:#D1FAE5;color:#065F46;"><i class="fas fa-book"></i></div><div><div style="font-size:1.5rem;font-weight:700;">' + getAllBooks().length + '</div><div style="font-size:.75rem;color:var(--muted);">Total Buku</div></div></div></div>' +
        '<div class="stat-card"><div style="display:flex;align-items:center;gap:.75rem;"><div class="stat-icon" style="background:#DBEAFE;color:#1E40AF;"><i class="fas fa-check-circle"></i></div><div><div style="font-size:1.5rem;font-weight:700;">' + availableBooks + '</div><div style="font-size:.75rem;color:var(--muted);">Tersedia</div></div></div></div>' +
        '<div class="stat-card"><div style="display:flex;align-items:center;gap:.75rem;"><div class="stat-icon" style="background:#FEE2E2;color:#991B1B;"><i class="fas fa-hand-holding"></i></div><div><div style="font-size:1.5rem;font-weight:700;">' + activeBorrows.length + '</div><div style="font-size:.75rem;color:var(--muted);">Dipinjam</div></div></div></div>' +
        '<div class="stat-card"><div style="display:flex;align-items:center;gap:.75rem;"><div class="stat-icon" style="background:#FEF3C7;color:#92400E;"><i class="fas fa-users"></i></div><div><div style="font-size:1.5rem;font-weight:700;">' + users.length + '</div><div style="font-size:.75rem;color:var(--muted);">Pengguna</div></div></div></div>' +
    '</div>' +
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:.75rem;overflow:hidden;margin-bottom:2rem;"><div style="padding:1rem 1rem .75rem;font-weight:700;font-size:.9rem;">Peminjaman Aktif</div>' + borrowTable + '</div>' +
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:.75rem;overflow:hidden;margin-bottom:2rem;"><div style="padding:1rem 1rem .75rem;font-weight:700;font-size:.9rem;">Daftar Pengguna</div>' + userTable + '</div>' +
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:.75rem;overflow:hidden;"><div style="padding:1rem 1rem .75rem;font-weight:700;font-size:.9rem;">Kelola Buku</div>' + bookTable + '</div>';
}
