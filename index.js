document.addEventListener('DOMContentLoaded', () => {
    fetch('/data.json')
        .then(res => res.json())
        .then(data => {
            document.getElementById('content').innerHTML = jsonToTable(data);
        })
        .catch(err => console.error('Error loading site data:', err));
});

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
const URL_ABS = /^https?:\/\//i;
const URL_REL = /^\//;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function countRows(v) {
    if (Array.isArray(v))
        return Math.max(1, v.reduce((sum, item) => sum + countRows(item), 0));
    if (v !== null && typeof v === 'object')
        return Math.max(1, Object.values(v).reduce((sum, child) => sum + countRows(child), 0));
    return 1;
}

function buildNode(v) {
    if (Array.isArray(v))
        return v.length
            ? buildChildren(v.map((item, i) => [String(i), item]), true)
            : { firstRow: '<td></td>', extraRows: '' };
    if (v !== null && typeof v === 'object')
        return Object.keys(v).length
            ? buildChildren(Object.entries(v))
            : { firstRow: '<td></td>', extraRows: '' };

    const s = v === null ? 'null' : String(v);

    if (typeof v === 'string' && IMAGE_EXT.test(v))
        return { firstRow: `<td class="value"><img src="${esc(v)}" alt="${esc(v)}"></td>`, extraRows: '' };

    if (typeof v === 'string' && EMAIL_RE.test(v))
        return { firstRow: `<td class="value"><a href="mailto:${esc(v)}">${esc(v)}</a></td>`, extraRows: '' };

    if (typeof v === 'string' && URL_ABS.test(v))
        return { firstRow: `<td class="value"><a href="${esc(v)}" target="_blank" rel="noopener noreferrer">${esc(v)}</a></td>`, extraRows: '' };

    if (typeof v === 'string' && URL_REL.test(v))
        return { firstRow: `<td class="value"><a href="${esc(v)}">${esc(s)}</a></td>`, extraRows: '' };

    return {
        firstRow: `<td class="value"><a href="https://www.google.com/search?q=${encodeURIComponent(s)}" target="_blank" rel="noopener noreferrer">${esc(s)}</a></td>`,
        extraRows: '',
    };
}

function buildChildren(entries, isList = false) {
    let firstRow = '', extraRows = '', isFirst = true;
    for (const [k, v] of entries) {
        const span = countRows(v);
        const keyTd = isList ? '' : `<td rowspan="${span}">${esc(k)}</td>`;
        const child = buildNode(v);
        if (isFirst) {
            firstRow += keyTd + child.firstRow;
            extraRows += child.extraRows;
            isFirst = false;
        } else {
            extraRows += `<tr>${keyTd}${child.firstRow}</tr>${child.extraRows}`;
        }
    }
    return { firstRow, extraRows };
}

function jsonToTable(obj) {
    const { firstRow, extraRows } = buildChildren(Object.entries(obj));
    return `<table><tr>${firstRow}</tr>${extraRows}</table>`;
}
