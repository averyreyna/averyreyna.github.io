document.addEventListener('DOMContentLoaded', function() {
    let blockViewLoaded = false;
    let referenceViewLoaded = false;
    initLazyLoading();
    initViewSwitcher();
    initBioLocation();

    function stripHtml(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent || div.innerText || '';
    }

    function buildLinksHtml(links, supportItalic) {
        if (!links || !links.length) return '';
        return links.map(link => {
            if (supportItalic && link.italic) {
                return `<span class="text-gray-500 text-xs italic">${link.text}</span>`;
            }
            return `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`;
        }).join('');
    }

    function createArticleStyleEntry({ title, venue, series, authors, links, linksSupportItalic }) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content';
        const linksHtml = buildLinksHtml(links, linksSupportItalic);
        contentDiv.innerHTML = `
                    <div class="entry-header">
                        <span class="font-semibold text-gray-900 leading-tight">${title}</span>
                    </div>
                    ${venue ? `<span class="text-xs text-gray-500">${venue}</span>` : ''}
                    ${series ? `<span class="text-xs text-gray-500">${series}</span>` : ''}
                    ${authors ? `<span class="text-xs text-gray-700">${authors}</span>` : ''}
                    ${linksHtml ? `<span class="flex flex-row flex-wrap gap-2">${linksHtml}</span>` : ''}
                `;
        entryDiv.appendChild(contentDiv);
        return entryDiv;
    }

    function createExperienceEntry({ header, subheader, meta, description, location }) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'entry-item';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'entry-header';
        const headerSpan = document.createElement('span');
        headerSpan.className = 'font-semibold text-gray-900 leading-tight';
        headerSpan.textContent = header;
        headerDiv.appendChild(headerSpan);
        contentDiv.appendChild(headerDiv);

        if (subheader || meta) {
            const positionDatesDiv = document.createElement('div');
            positionDatesDiv.className = 'flex flex-row items-start justify-between gap-2';
            if (subheader) {
                const subheaderSpan = document.createElement('span');
                subheaderSpan.className = 'block text-xs text-gray-700';
                subheaderSpan.textContent = subheader;
                positionDatesDiv.appendChild(subheaderSpan);
            } else {
                const subheaderPlaceholder = document.createElement('span');
                subheaderPlaceholder.className = 'block text-xs text-gray-700';
                subheaderPlaceholder.innerHTML = '&nbsp;';
                positionDatesDiv.appendChild(subheaderPlaceholder);
            }
            if (meta) {
                const metaSpan = document.createElement('span');
                metaSpan.className = 'block text-xs text-gray-500 whitespace-nowrap';
                metaSpan.textContent = meta;
                positionDatesDiv.appendChild(metaSpan);
            }
            contentDiv.appendChild(positionDatesDiv);
        }

        if (description || location) {
            const aboutLocationDiv = document.createElement('div');
            aboutLocationDiv.className = 'flex flex-row items-center justify-between gap-2';

            if (description) {
                const summarySpan = document.createElement('span');
                summarySpan.className = 'block text-xs text-gray-700';
                summarySpan.textContent = stripHtml(description.trim());
                aboutLocationDiv.appendChild(summarySpan);
            }

            if (location) {
                const locationSpan = document.createElement('span');
                locationSpan.className = 'block text-xs text-gray-500 whitespace-nowrap';
                locationSpan.textContent = location;
                aboutLocationDiv.appendChild(locationSpan);
            } else if (description) {
                const emptySpan = document.createElement('span');
                emptySpan.innerHTML = '&nbsp;';
                aboutLocationDiv.appendChild(emptySpan);
            }
            if (!description && location) {
                const emptySpan = document.createElement('span');
                emptySpan.innerHTML = '&nbsp;';
                aboutLocationDiv.insertBefore(emptySpan, aboutLocationDiv.firstChild);
            }
            contentDiv.appendChild(aboutLocationDiv);
        }

        itemDiv.appendChild(contentDiv);
        return itemDiv;
    }

    async function loadExperience() {
        try {
            const response = await fetch('/data/list_view/experience.json');
            const experience = await response.json();
            const container = document.getElementById('experience-container');
            experience.forEach(entry => {
                const item = createExperienceEntry({
                    header: entry.organization,
                    subheader: entry.role,
                    meta: entry.dates,
                    location: entry.location,
                    description: entry.description
                });
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading experience:', error);
        }
    }

    async function loadAnnouncements() {
        try {
            const response = await fetch('/data/list_view/announcements.json');
            const announcements = await response.json();
            const container = document.getElementById('announcements-container');
            announcements.forEach((announcement, index) => {
                const announcementDiv = document.createElement('div');
                announcementDiv.className = 'announcement-item py-2';
                announcementDiv.setAttribute('data-index', index);
                
                announcementDiv.innerHTML = `
                    <h3 class="announcement-title announcement-date">
                        ${announcement.title}
                    </h3>
                    <p class="announcement-desc">
                        ${announcement.description}
                    </p>
                `;
                
                container.appendChild(announcementDiv);
            });
            
            initializePagination();
            
        } catch (error) {
            console.error('Error loading announcements:', error);
        }
    }
    
    function initializePagination() {
        const items = document.querySelectorAll('.announcement-item');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageIndicator = document.getElementById('page-indicator');
        
        const itemsPerPage = 3;
        const totalPages = Math.ceil(items.length / itemsPerPage);
        let currentPage = 1;
        
        function showPage(page) {
            items.forEach((item, index) => {
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                
                if (index >= startIndex && index < endIndex) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
            
            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages;
            pageIndicator.textContent = `${page} / ${totalPages}`;
        }
        
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });
        
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });
        
        showPage(currentPage);
    }

    async function loadAwards() {
        try {
            const response = await fetch('/data/list_view/awards.json');
            const awards = await response.json();
            const container = document.getElementById('awards-container');
            awards.forEach((award) => {
                const item = createExperienceEntry({
                    header: award.title,
                    subheader: award.organization,
                    meta: award.year,
                    location: null,
                    description: null
                });
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading awards:', error);
        }
    }

    async function loadEducation() {
        try {
            const response = await fetch('/data/list_view/education.json');
            const education = await response.json();
            const container = document.getElementById('education-container');
            education.forEach((entry) => {
                const description = entry.details && entry.details.length
                    ? entry.details.join(', ')
                    : null;
                const item = createExperienceEntry({
                    header: entry.institution,
                    subheader: entry.degree,
                    meta: entry.dates,
                    location: entry.location,
                    description: description
                });
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading education:', error);
        }
    }
    
    loadAnnouncements();
    loadAwards();
    loadEducation();
    loadExperience();

    async function loadPublicScholarship() {
        try {
            const response = await fetch('/data/list_view/public_scholarship.json');
            const articles = await response.json();
            const container = document.getElementById('public-scholarship-container');
            articles.forEach((article) => {
                const entry = createArticleStyleEntry({
                    title: article.title,
                    venue: article.venue,
                    authors: article.authors,
                    links: article.links,
                    linksSupportItalic: true
                });
                container.appendChild(entry);
            });
        } catch (error) {
            console.error('Error loading public scholarship:', error);
        }
    }
    loadPublicScholarship();

    async function loadMedia() {
        try {
            const response = await fetch('/data/list_view/media.json');
            const items = await response.json();
            const container = document.getElementById('media-container');
            items.forEach((item) => {
                const entry = createArticleStyleEntry({
                    title: item.title,
                    series: item.series || null,
                    links: item.links,
                    linksSupportItalic: false
                });
                container.appendChild(entry);
            });
        } catch (error) {
            console.error('Error loading media:', error);
        }
    }

    async function loadPresentations() {
        try {
            const response = await fetch('/data/list_view/presentations.json');
            const presentations = await response.json();
            const container = document.getElementById('presentations-container');
            presentations.forEach((presentation) => {
                const entry = createArticleStyleEntry({
                    title: presentation.title,
                    venue: presentation.venue,
                    authors: presentation.authors,
                    links: presentation.links,
                    linksSupportItalic: false
                });
                container.appendChild(entry);
            });
        } catch (error) {
            console.error('Error loading presentations:', error);
        }
    }

    loadMedia();
    loadPresentations();
    
    async function loadRecentPublications() {
        try {
            const response = await fetch('/data/list_view/papers.json');
            const papers = await response.json();
            // prefer conference papers; if fewer than 3, use first 3 from full list
            const conferencePapers = papers.filter(paper => {
                const venue = paper.venue.toLowerCase();
                return venue !== 'preprint' && !venue.includes('preprint') && !venue.includes('arxiv');
            });
            const recentPapers = conferencePapers.length >= 3
                ? conferencePapers.slice(0, 3)
                : papers.slice(0, 3);

            const container = document.getElementById('recent-publications-container');
            recentPapers.forEach((paper) => {
                const entry = createArticleStyleEntry({
                    title: paper.title,
                    venue: paper.venue,
                    authors: paper.authors,
                    links: paper.links,
                    linksSupportItalic: true
                });
                container.appendChild(entry);
            });
        } catch (error) {
            console.error('Error loading recent publications:', error);
        }
    }
    
    loadRecentPublications();
    
    async function loadResources() {
        try {
            const response = await fetch('/data/list_view/resources.json');
            const resources = await response.json();
            const container = document.getElementById('resources-container');
            resources.forEach((resource) => {
                const link = document.createElement('a');
                link.href = resource.url;
                link.className = 'resource-box';
                link.target = '_blank';
                link.rel = 'noopener';
                const yearSpan = document.createElement('span');
                yearSpan.className = 'resource-box-year';
                yearSpan.textContent = resource.year;
                const nameSpan = document.createElement('span');
                nameSpan.className = 'resource-box-name';
                nameSpan.textContent = resource.name;
                const typeSpan = document.createElement('span');
                typeSpan.className = 'resource-box-type';
                typeSpan.textContent = resource.title;
                link.appendChild(yearSpan);
                link.appendChild(nameSpan);
                link.appendChild(typeSpan);
                container.appendChild(link);
            });
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    }
    loadResources();

    async function loadTalks() {
        try {
            const response = await fetch('/data/list_view/talks.json');
            const talks = await response.json();
            const container = document.getElementById('talks-container');
            talks.forEach((talk) => {
                const entry = createArticleStyleEntry({
                    title: talk.title,
                    venue: talk.venue,
                    authors: talk.authors,
                    links: talk.links || [],
                    linksSupportItalic: false
                });
                container.appendChild(entry);
            });
        } catch (error) {
            console.error('Error loading talks:', error);
        }
    }
    loadTalks();

    async function loadTeaching() {
        try {
            const response = await fetch('/data/list_view/teaching.json');
            const teaching = await response.json();
            const container = document.getElementById('teaching-container');
            teaching.forEach((entry) => {
                const item = createExperienceEntry({
                    header: entry.course,
                    subheader: entry.position,
                    meta: entry.semester,
                    location: null,
                    description: null
                });
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading teaching:', error);
        }
    }
    loadTeaching();

    async function loadVolunteering() {
        try {
            const response = await fetch('/data/list_view/volunteering.json');
            const volunteering = await response.json();
            const container = document.getElementById('volunteering-container');
            volunteering.forEach((entry) => {
                const item = createExperienceEntry({
                    header: entry.organization,
                    subheader: entry.role,
                    meta: entry.dates,
                    location: entry.location,
                    description: entry.description
                });
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading volunteering:', error);
        }
    }
    loadVolunteering();
    
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            lazyImages.forEach(img => loadImage(img));
        }
    }
    
    function loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        const imageLoader = new Image();
        imageLoader.onload = function() {
            img.src = src;
            img.classList.remove('lazy-load');
            img.classList.add('loaded');
        };
        imageLoader.onerror = function() {
            img.classList.remove('lazy-load');
            img.classList.add('loaded');
        };
        imageLoader.src = src;
    }

    function createReferenceRow(item, stableId) {
        const hasExpand = !!(item.detailHtml || (item.image && item.image.src) ||
            (item.footnoteLink && item.footnoteLink.url));
        const article = document.createElement('article');
        article.className = 'reference-view__item';
        article.setAttribute('role', 'listitem');

        const detailsId = 'reference-details-' + stableId;
        let details = null;

        if (hasExpand) {
            details = document.createElement('div');
            details.id = detailsId;
            details.className = 'reference-view__details';
            details.hidden = true;

            const inner = document.createElement('div');
            inner.className = 'reference-view__details-inner';

            const textCol = document.createElement('div');
            textCol.className = 'reference-view__details-text';
            if (item.detailHtml) {
                const body = document.createElement('div');
                body.className = 'reference-view__detail-body';
                body.innerHTML = item.detailHtml;
                textCol.appendChild(body);
            }
            if (item.footnoteLink && item.footnoteLink.url) {
                const foot = document.createElement('p');
                foot.className = 'reference-view__footnote';
                const a = document.createElement('a');
                a.href = item.footnoteLink.url;
                a.target = '_blank';
                a.rel = 'noopener';
                a.textContent = item.footnoteLink.label || item.footnoteLink.url;
                foot.appendChild(a);
                textCol.appendChild(foot);
            }
            inner.appendChild(textCol);

            if (item.image && item.image.src) {
                const fig = document.createElement('figure');
                fig.className = 'reference-view__figure';
                const img = document.createElement('img');
                img.src = item.image.src;
                img.alt = item.image.alt || '';
                img.className = 'reference-view__media';
                img.loading = 'lazy';
                fig.appendChild(img);
                inner.appendChild(fig);
            }

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
        titleEl.textContent = item.title || '';

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
            const titleForA11y = (item.title || 'entry').replace(/"/g, '');
            btn.setAttribute('aria-label', 'Toggle details for ' + titleForA11y);
            const chev = document.createElement('span');
            chev.className = 'reference-view__chevron';
            chev.setAttribute('aria-hidden', 'true');
            chev.textContent = '\u2228';
            btn.appendChild(chev);
            btn.addEventListener('click', function() {
                const willOpen = details.hidden;
                details.hidden = !willOpen;
                btn.setAttribute('aria-expanded', String(willOpen));
                chev.textContent = willOpen ? '\u2227' : '\u2228';
                row.classList.toggle('reference-view__row--expanded', willOpen);
            });
            toggleCell.appendChild(btn);
        }

        row.appendChild(toggleCell);
        article.appendChild(row);
        if (details) article.appendChild(details);
        return article;
    }

    async function loadReferenceView() {
        const root = document.getElementById('reference-view-root');
        if (!root || referenceViewLoaded) return;
        try {
            const res = await fetch('/data/list_view/reference_view.json');
            const data = await res.json();
            root.innerHTML = '';

            const sections = data.sections || [];
            sections.forEach(function(section, secIdx) {
                const h = document.createElement('h2');
                h.className = 'reference-view__section-label';
                h.textContent = section.label || '';
                root.appendChild(h);

                const list = document.createElement('div');
                list.className = 'reference-view__section';
                list.setAttribute('role', 'list');
                (section.items || []).forEach(function(entry, itemIdx) {
                    list.appendChild(createReferenceRow(entry, secIdx + '-' + itemIdx));
                });
                root.appendChild(list);
            });

            referenceViewLoaded = true;
        } catch (err) {
            console.error('Error loading reference view:', err);
        }
    }

    async function loadBlockView() {
        const grid = document.getElementById('block-grid');
        if (!grid || blockViewLoaded) return;
        try {
            const res = await fetch('/data/block_view.json');
            const blocks = await res.json();
            grid.innerHTML = '';
            blocks.forEach(function(block) {
                const span = Math.min(Math.max(block.span || 1, 1), 6);
                const item = document.createElement('article');
                item.className = 'block-view__item block-view__span-' + span;
                if (block.id) item.id = 'block-' + block.id;
                const linkUrl = block.url || (block.links && block.links.length && block.links[0].url) || null;
                if (linkUrl) item.classList.add('block-view__item--linked');
                let html = '';
                if (linkUrl) {
                    html += '<a href="' + escapeHtml(linkUrl) + '" class="block-view__icon-link" target="_blank" rel="noopener" aria-label="Open link"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>';
                }
                html += '<h3 class="block-view__title">' + escapeHtml(block.title) + '</h3>';
                if (block.meta) html += '<p class="block-view__meta">' + escapeHtml(block.meta) + '</p>';
                if (block.description) html += '<p class="block-view__description">' + escapeHtml(block.description) + '</p>';
                item.innerHTML = html;
                grid.appendChild(item);
            });
            blockViewLoaded = true;
        } catch (err) {
            console.error('Error loading block view:', err);
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    var weatherCodeToDesc = {
        0: 'clear sky',
        1: 'mainly clear',
        2: 'partly cloudy',
        3: 'overcast',
        45: 'foggy',
        48: 'rime fog',
        51: 'light drizzle',
        53: 'drizzle',
        55: 'dense drizzle',
        61: 'slight rain',
        63: 'moderate rain',
        65: 'heavy rain',
        71: 'slight snow',
        73: 'moderate snow',
        75: 'heavy snow',
        77: 'snow grains',
        80: 'slight rain showers',
        81: 'moderate rain showers',
        82: 'violent rain showers',
        85: 'slight snow showers',
        86: 'heavy snow showers',
        95: 'thunderstorm',
        96: 'thunderstorm with slight hail',
        99: 'thunderstorm with heavy hail'
    };

    function formatBioTime(isoString) {
        if (!isoString) return '--';
        var part = isoString.split('T')[1];
        if (!part) return '--';
        var segments = part.split(':');
        var h = parseInt(segments[0], 10) || 0;
        var m = parseInt(segments[1], 10) || 0;
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        var pad = function(n) { return (n < 10 ? '0' : '') + n; };
        return pad(h) + ':' + pad(m) + ' ' + ampm;
    }

    function initBioLocation() {
        var timeEl = document.getElementById('bio-time');
        var weatherEl = document.getElementById('bio-weather');
        if (!timeEl || !weatherEl) return;
        var dcLat = 38.9072;
        var dcLon = -77.0369;
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + dcLat + '&longitude=' + dcLon + '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America/New_York';
        fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var cur = data.current;
                if (!cur) return;
                if (cur.time) timeEl.textContent = formatBioTime(cur.time);
                var code = cur.weather_code;
                weatherEl.textContent = weatherCodeToDesc[code] != null ? weatherCodeToDesc[code] : 'conditions ' + code;
            })
            .catch(function(err) {
                console.error('Bio location weather:', err);
                timeEl.textContent = '--';
                weatherEl.textContent = 'unavailable';
            });
    }

    function showView(viewName) {
        const longform = document.getElementById('view-longform');
        const blocks = document.getElementById('view-blocks');
        const reference = document.getElementById('view-reference');
        const tabLongform = document.getElementById('tab-longform');
        const tabBlocks = document.getElementById('tab-blocks');
        const tabReference = document.getElementById('tab-reference');
        if (!longform || !blocks || !reference || !tabLongform || !tabBlocks || !tabReference) return;
        const isLongform = viewName === 'longform';
        const isBlocks = viewName === 'blocks';
        const isReference = viewName === 'reference';
        longform.classList.toggle('view-panel--hidden', !isLongform);
        longform.setAttribute('aria-hidden', String(!isLongform));
        blocks.classList.toggle('view-panel--hidden', !isBlocks);
        blocks.setAttribute('aria-hidden', String(!isBlocks));
        reference.classList.toggle('view-panel--hidden', !isReference);
        reference.setAttribute('aria-hidden', String(!isReference));
        tabLongform.setAttribute('aria-selected', String(isLongform));
        tabLongform.classList.toggle('view-switcher__btn--active', isLongform);
        tabBlocks.setAttribute('aria-selected', String(isBlocks));
        tabBlocks.classList.toggle('view-switcher__btn--active', isBlocks);
        tabReference.setAttribute('aria-selected', String(isReference));
        tabReference.classList.toggle('view-switcher__btn--active', isReference);
        if (isBlocks) {
            loadBlockView();
            location.hash = 'blocks';
        } else {
            if (location.hash === '#blocks') location.hash = '';
            if (isReference) {
                loadReferenceView();
            }
        }
    }

    function initViewSwitcher() {
        if (location.hash === '#blocks') showView('blocks');
        document.querySelectorAll('.view-switcher__btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const view = btn.getAttribute('data-view');
                if (view) showView(view);
            });
        });
    }
});