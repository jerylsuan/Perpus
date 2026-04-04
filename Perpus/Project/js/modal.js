/**
 * modal.js
 * Fungsi buka dan tutup modal.
 * Tidak punya dependency.
 */

function showModal(id) {
    document.getElementById(id).classList.add('show');
    /* Auto-focus input pertama */
    setTimeout(() => {
        const input = document.getElementById(id).querySelector('input');
        if (input) input.focus();
    }, 100);
}

function hideModal(id) {
    document.getElementById(id).classList.remove('show');
    /* Reset form jika ada */
    const form = document.getElementById(id).querySelector('form');
    if (form) form.reset();
}