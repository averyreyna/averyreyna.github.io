const dcTimeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
});

function setDcTime() {
    const el = document.getElementById('dc-time');
    if (!el) return;
    el.textContent = dcTimeFormatter.format(new Date());
}

function setLinkOpensInNewTab(a, url) {
    if (!url) return;
    if (url.startsWith('mailto:')) {
        a.removeAttribute('target');
        a.removeAttribute('rel');
    } else if (/^https?:\/\//i.test(url)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
    } else {
        a.removeAttribute('target');
        a.removeAttribute('rel');
    }
}

function renderAxis(axis) {
    const root = document.getElementById('axis-root');
    if (!root || !axis) return;

    const labels = axis.labels || {};
    const links = axis.links || [];

    const plane = document.createElement('div');
    plane.className = 'site-axis__plane';
    plane.setAttribute('role', 'img');
    plane.setAttribute('aria-label', 'Links by personal versus professional and essential versus peripheral');

    plane.appendChild(Object.assign(document.createElement('div'), { className: 'site-axis__line site-axis__line--h' }));
    plane.appendChild(Object.assign(document.createElement('div'), { className: 'site-axis__line site-axis__line--v' }));

    for (const [position, text] of Object.entries(labels)) {
        const el = document.createElement('span');
        el.className = `site-axis__end-label site-axis__end-label--${position}`;
        el.textContent = text;
        plane.appendChild(el);
    }

    for (const link of links) {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'site-axis__link';
        a.setAttribute('aria-label', link.label || link.url || '');
        setLinkOpensInNewTab(a, link.url);
        a.style.left = `calc(50% + ${(link.x || 0) * 40}%)`;
        a.style.top = `calc(50% - ${(link.y || 0) * 40}%)`;

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined site-axis__link-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = link.icon || 'link';
        a.appendChild(icon);

        plane.appendChild(a);
    }

    root.appendChild(plane);
}

function createStaticMarkerDot(item) {
    const dot = document.createElement('span');
    let className = 'reference-view__static-marker';
    if (item.wip) className += ' reference-view__static-marker--wip';
    else if (item.private) className += ' reference-view__static-marker--private';
    dot.className = className;
    dot.setAttribute('aria-hidden', 'true');
    return dot;
}

function createReferenceRow(item, stableId) {
    const hasMedia = !!(item.image && item.image.src);
    const hasExpand = hasMedia;
    const footUrl = item.footnoteLink && item.footnoteLink.url;
    const isLinkOnly = !!(footUrl && !hasExpand);
    const article = document.createElement('article');
    article.className = 'reference-view__item';
    article.setAttribute('role', 'listitem');

    const detailsId = `reference-details-${stableId}`;
    let details = null;

    if (hasExpand) {
        details = document.createElement('div');
        details.id = detailsId;
        details.className = 'reference-view__details';
        details.hidden = true;

        const inner = document.createElement('div');
        inner.className = 'reference-view__details-inner';

        if (footUrl) {
            const textCol = document.createElement('div');
            textCol.className = 'reference-view__details-text';
            const foot = document.createElement('p');
            foot.className = 'reference-view__footnote';
            const fa = document.createElement('a');
            fa.href = footUrl;
            setLinkOpensInNewTab(fa, footUrl);
            fa.textContent = item.footnoteLink.label || footUrl;
            foot.appendChild(fa);
            textCol.appendChild(foot);
            inner.appendChild(textCol);
        }

        const fig = document.createElement('figure');
        fig.className = 'reference-view__figure';
        const isVideo = /\.(mp4|webm|mov)$/i.test(item.image.src);
        const media = document.createElement(isVideo ? 'video' : 'img');
        media.className = 'reference-view__media';
        if (isVideo) {
            media.src = item.image.src;
            media.autoplay = true;
            media.loop = true;
            media.muted = true;
            media.playsInline = true;
        } else {
            media.src = item.image.src;
            media.loading = 'lazy';
            media.alt = item.image.alt || '';
        }
        fig.appendChild(media);
        inner.appendChild(fig);

        details.appendChild(inner);
    }

    const row = document.createElement('div');
    row.className = 'reference-view__row';

    const dateEl = document.createElement('time');
    dateEl.className = 'reference-view__date';
    if (item.date) dateEl.setAttribute('datetime', item.date);
    dateEl.textContent = item.date || '';

    const titleEl = document.createElement('span');
    titleEl.className = 'reference-view__title';
    titleEl.appendChild(document.createTextNode(item.title || ''));

    const sumEl = document.createElement('span');
    sumEl.className = 'reference-view__summary';
    sumEl.textContent = item.summary || '';

    row.appendChild(dateEl);
    row.appendChild(titleEl);
    row.appendChild(sumEl);

    const toggleCell = document.createElement('div');
    toggleCell.className = 'reference-view__toggle-cell';

    if (hasExpand && details) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reference-view__toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', detailsId);
        btn.setAttribute('aria-label', `Toggle details for ${item.title || 'entry'}`);
        const chev = document.createElement('span');
        chev.className = 'reference-view__chevron';
        chev.setAttribute('aria-hidden', 'true');
        chev.textContent = '∨';
        btn.appendChild(chev);
        btn.addEventListener('click', () => {
            const willOpen = details.hidden;
            details.hidden = !willOpen;
            btn.setAttribute('aria-expanded', String(willOpen));
            chev.textContent = willOpen ? '∧' : '∨';
            row.classList.toggle('reference-view__row--expanded', willOpen);
        });
        toggleCell.appendChild(btn);
    } else if (isLinkOnly) {
        if (item.wip || item.private) {
            toggleCell.appendChild(createStaticMarkerDot(item));
        }
        const ext = document.createElement('a');
        ext.href = footUrl;
        ext.className = 'reference-view__row-link';
        setLinkOpensInNewTab(ext, footUrl);
        ext.setAttribute('aria-label', `Open link: ${item.title || 'entry'}`);
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined reference-view__link-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = 'link';
        ext.appendChild(icon);
        toggleCell.appendChild(ext);
    } else {
        toggleCell.appendChild(createStaticMarkerDot(item));
    }

    row.appendChild(toggleCell);
    article.appendChild(row);
    if (details) article.appendChild(details);
    return article;
}

function createBanner(section) {
    const banner = document.createElement('div');
    banner.className = 'undergrad-banner';
    const label = document.createElement('p');
    label.className = 'undergrad-label';
    label.textContent = section.label || '';
    banner.appendChild(label);
    return banner;
}

function createSectionBlock(section, secIdx) {
    const items = section.items || [];
    const block = document.createElement('div');
    block.className = 'reference-view__section-block';

    const h = document.createElement('h2');
    h.className = 'reference-view__section-label';
    if (section.labelHref) {
        const labelA = document.createElement('a');
        labelA.className = 'reference-view__section-label-link';
        labelA.href = section.labelHref;
        labelA.textContent = section.label || '';
        setLinkOpensInNewTab(labelA, section.labelHref);
        h.appendChild(labelA);
    } else {
        h.textContent = section.label || '';
    }
    block.appendChild(h);

    const list = document.createElement('div');
    list.className = 'reference-view__section';
    list.setAttribute('role', 'list');

    const PREVIEW_LIMIT = 3;
    const hasOverflow = items.length > PREVIEW_LIMIT;
    const overflowRows = [];
    let previewEndRow = null;

    items.forEach((entry, itemIdx) => {
        const row = createReferenceRow(entry, `${secIdx}-${itemIdx}`);
        if (hasOverflow && itemIdx >= PREVIEW_LIMIT) {
            row.hidden = true;
            row.classList.add('reference-view__item--overflow');
            overflowRows.push(row);
        }
        if (hasOverflow && itemIdx === PREVIEW_LIMIT - 1) {
            row.classList.add('reference-view__item--section-end');
            previewEndRow = row;
        }
        list.appendChild(row);
    });

    block.appendChild(list);

    const footer = document.createElement('div');
    footer.className = 'reference-view__section-footer';
    footer.setAttribute('aria-hidden', 'true');
    if (hasOverflow) {
        footer.removeAttribute('aria-hidden');
        const expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.className = 'reference-view__section-expand';
        expandBtn.setAttribute('aria-expanded', 'false');
        expandBtn.textContent = 'EXPAND';
        expandBtn.addEventListener('click', () => {
            const willExpand = expandBtn.getAttribute('aria-expanded') !== 'true';
            overflowRows.forEach(r => { r.hidden = !willExpand; });
            expandBtn.setAttribute('aria-expanded', String(willExpand));
            expandBtn.textContent = willExpand ? 'COLLAPSE' : 'EXPAND';
            if (previewEndRow) {
                previewEndRow.classList.toggle('reference-view__item--section-end', !willExpand);
            }
        });
        footer.appendChild(expandBtn);
    }
    block.appendChild(footer);

    return block;
}

function renderSections(root, sections, keyPrefix) {
    sections.forEach((section, secIdx) => {
        if (section.type === 'banner') {
            root.appendChild(createBanner(section));
            return;
        }
        root.appendChild(createSectionBlock(section, `${keyPrefix}${secIdx}`));
    });
}

async function loadSiteData() {
    const root = document.getElementById('reference-view-root');
    if (!root) return;
    try {
        const res = await fetch('/data.json');
        const data = await res.json();
        renderAxis(data.axis);

        renderSections(root, data.sections || [], '');

        const anotherLifeRoot = document.getElementById('another-life-root');
        if (anotherLifeRoot && data.anotherLife) {
            renderSections(anotherLifeRoot, data.anotherLife.sections || [], 'al-');
        }
    } catch (err) {
        console.error('Error loading site data:', err);
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

document.addEventListener('DOMContentLoaded', () => {
    setDcTime();
    setInterval(setDcTime, 30000);
    loadSiteData();
    makeToggle('another-life-toggle', 'another-life-section', 'In a past life...', 'Back to this one...');
});
