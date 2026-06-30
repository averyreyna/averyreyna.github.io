function initLozad() {
    if (typeof lozad === 'undefined') return;
    lozad().observe();
}

function parseEntryDate(entry) {
    return new Date(entry.textContent.trim().split('\n').pop().trim());
}

function initListPreview({ listId, extraId, toggleWrapId, limit = 3, sortFn = null }) {
    const list = document.getElementById(listId);
    const extra = document.getElementById(extraId);
    const toggleWrap = document.getElementById(toggleWrapId);
    if (!list || !extra) return 0;

    const entries = Array.from(list.querySelectorAll(':scope > p'));
    if (sortFn) {
        entries.sort(sortFn);
        entries.forEach(entry => list.appendChild(entry));
    }

    extra.replaceChildren(...entries.slice(limit));

    const hidden = entries.length - limit;
    if (toggleWrap && hidden <= 0) {
        toggleWrap.hidden = true;
    }
    return hidden;
}

function makeToggle(toggleId, targetId, showText, hideText) {
    const toggle = document.getElementById(toggleId);
    const target = document.getElementById(targetId);
    if (!toggle || !target) return;

    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        if (target.style.display === 'none') {
            target.style.display = '';
            toggle.textContent = hideText;
        } else {
            target.style.display = 'none';
            toggle.textContent = showText;
        }
    });
}

function initGridPreview(toggleId, limit = 3) {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;
    const grid = toggle.previousElementSibling;
    if (!grid) return;

    const previewLimit = window.matchMedia('(max-width: 640px)').matches ? 2 : limit;
    const hidden = grid.querySelectorAll(':scope > .iw-card').length - previewLimit;
    if (hidden <= 0) {
        toggle.hidden = true;
        return;
    }

    toggle.textContent = `View all (+${hidden})`;
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const expanded = grid.classList.toggle('is-expanded');
        toggle.textContent = expanded ? 'View less' : `View all (+${hidden})`;
    });
}

const listPreviews = [
    {
        listId: 'conjectures-list',
        extraId: 'conjectures-extra',
        toggleWrapId: 'conjectures-read-more',
        toggleId: 'conjectures-toggle',
        sortFn: (a, b) => parseEntryDate(b) - parseEntryDate(a),
    },
    {
        listId: 'blog-list',
        extraId: 'blog-extra',
        toggleWrapId: 'blog-read-more',
        toggleId: 'blog-toggle',
        sortFn: (a, b) => parseEntryDate(b) - parseEntryDate(a),
    },
    {
        listId: 'current-media-list',
        extraId: 'current-media-extra',
        toggleWrapId: 'current-media-read-more',
        toggleId: 'current-media-toggle',
    },
    {
        listId: 'public-scholarship-list',
        extraId: 'public-scholarship-extra',
        toggleWrapId: 'public-scholarship-read-more',
        toggleId: 'public-scholarship-toggle',
    },
    {
        listId: 'presentations-list',
        extraId: 'presentations-extra',
        toggleWrapId: 'presentations-read-more',
        toggleId: 'presentations-toggle',
    },
    {
        listId: 'media-list',
        extraId: 'media-extra',
        toggleWrapId: 'media-read-more',
        toggleId: 'media-toggle',
    },
    {
        listId: 'service-list',
        extraId: 'service-extra',
        toggleWrapId: 'service-read-more',
        toggleId: 'service-toggle',
    },
];

document.addEventListener('DOMContentLoaded', () => {
    initLozad();

    for (const preview of listPreviews) {
        const hidden = initListPreview(preview);
        if (hidden > 0) {
            const showText = `View all (+${hidden})`;
            document.getElementById(preview.toggleId).textContent = showText;
            makeToggle(preview.toggleId, preview.extraId, showText, 'View less');
        }
    }

    ['iw-prototypes-toggle', 'iw-experiments-toggle', 'iw-industry-work-toggle', 'iw-resources-toggle', 'undergrad-resources-toggle'].forEach(id => initGridPreview(id));

    makeToggle('another-life-toggle', 'another-life-section', 'In a past life...', 'Back to this one...');
});
