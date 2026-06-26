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
    if (!list || !extra) return;

    const entries = Array.from(list.querySelectorAll(':scope > p'));
    if (sortFn) {
        entries.sort(sortFn);
        entries.forEach(entry => list.appendChild(entry));
    }

    extra.replaceChildren(...entries.slice(limit));

    if (toggleWrap && entries.length <= limit) {
        toggleWrap.hidden = true;
    }
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

const listPreviews = [
    {
        listId: 'conjectures-list',
        extraId: 'conjectures-extra',
        toggleWrapId: 'conjectures-read-more',
        toggleId: 'conjectures-toggle',
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
        initListPreview(preview);
        makeToggle(preview.toggleId, preview.extraId, 'View all', 'View less');
    }

    makeToggle('another-life-toggle', 'another-life-section', 'In a past life...', 'Back to this one...');
});
