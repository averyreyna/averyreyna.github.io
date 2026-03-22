document.addEventListener('DOMContentLoaded', function() {
    loadSiteData();

    function renderAxis(axis) {
        var root = document.getElementById('axis-root');
        if (!root || !axis) return;

        var labels = axis.labels || {};
        var links = axis.links || [];

        root.innerHTML = '';
        var inner = document.createElement('div');
        inner.className = 'site-axis__inner';

        var plane = document.createElement('div');
        plane.className = 'site-axis__plane';
        plane.setAttribute('role', 'img');
        plane.setAttribute('aria-label', 'Links by personal versus professional and essential versus peripheral');

        var lineH = document.createElement('div');
        lineH.className = 'site-axis__line site-axis__line--h';
        var lineV = document.createElement('div');
        lineV.className = 'site-axis__line site-axis__line--v';
        plane.appendChild(lineH);
        plane.appendChild(lineV);

        function addEndLabel(className, text) {
            if (!text) return;
            var el = document.createElement('span');
            el.className = 'site-axis__end-label ' + className;
            el.textContent = text;
            plane.appendChild(el);
        }

        addEndLabel('site-axis__end-label--top', labels.top);
        addEndLabel('site-axis__end-label--bottom', labels.bottom);
        addEndLabel('site-axis__end-label--left', labels.left);
        addEndLabel('site-axis__end-label--right', labels.right);

        links.forEach(function(link) {
            var a = document.createElement('a');
            a.href = link.url;
            a.className = 'site-axis__link';
            a.textContent = link.label || link.url;
            var x = typeof link.x === 'number' ? link.x : 0;
            var y = typeof link.y === 'number' ? link.y : 0;
            a.style.left = 'calc(50% + ' + (x * 36) + '%)';
            a.style.top = 'calc(50% - ' + (y * 36) + '%)';
            if (link.url.indexOf('mailto:') === 0) {
                a.removeAttribute('target');
            } else {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            plane.appendChild(a);
        });

        inner.appendChild(plane);
        root.appendChild(inner);
    }

    function createReferenceRow(item, stableId) {
        var hasExpand = !!(item.detailHtml || (item.image && item.image.src) ||
            (item.footnoteLink && item.footnoteLink.url));
        var article = document.createElement('article');
        article.className = 'reference-view__item';
        article.setAttribute('role', 'listitem');

        var detailsId = 'reference-details-' + stableId;
        var details = null;

        if (hasExpand) {
            details = document.createElement('div');
            details.id = detailsId;
            details.className = 'reference-view__details';
            details.hidden = true;

            var inner = document.createElement('div');
            inner.className = 'reference-view__details-inner';

            var textCol = document.createElement('div');
            textCol.className = 'reference-view__details-text';
            if (item.detailHtml) {
                var body = document.createElement('div');
                body.className = 'reference-view__detail-body';
                body.innerHTML = item.detailHtml;
                textCol.appendChild(body);
            }
            if (item.footnoteLink && item.footnoteLink.url) {
                var foot = document.createElement('p');
                foot.className = 'reference-view__footnote';
                var a = document.createElement('a');
                a.href = item.footnoteLink.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = item.footnoteLink.label || item.footnoteLink.url;
                foot.appendChild(a);
                textCol.appendChild(foot);
            }
            inner.appendChild(textCol);

            if (item.image && item.image.src) {
                var fig = document.createElement('figure');
                fig.className = 'reference-view__figure';
                var img = document.createElement('img');
                img.src = item.image.src;
                img.alt = item.image.alt || '';
                img.className = 'reference-view__media';
                img.loading = 'lazy';
                fig.appendChild(img);
                inner.appendChild(fig);
            }

            details.appendChild(inner);
        }

        var row = document.createElement('div');
        row.className = 'reference-view__row';

        var dateEl = document.createElement('time');
        dateEl.className = 'reference-view__date';
        if (item.date) dateEl.setAttribute('datetime', item.date);
        dateEl.textContent = item.date || '';

        var titleEl = document.createElement('span');
        titleEl.className = 'reference-view__title';
        titleEl.textContent = item.title || '';

        var sumEl = document.createElement('span');
        sumEl.className = 'reference-view__summary';
        sumEl.textContent = item.summary || '';

        row.appendChild(dateEl);
        row.appendChild(titleEl);
        row.appendChild(sumEl);

        var toggleCell = document.createElement('div');
        toggleCell.className = 'reference-view__toggle-cell';

        if (hasExpand && details) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'reference-view__toggle';
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', detailsId);
            var titleForA11y = (item.title || 'entry').replace(/"/g, '');
            btn.setAttribute('aria-label', 'Toggle details for ' + titleForA11y);
            var chev = document.createElement('span');
            chev.className = 'reference-view__chevron';
            chev.setAttribute('aria-hidden', 'true');
            chev.textContent = '\u2228';
            btn.appendChild(chev);
            btn.addEventListener('click', function() {
                var willOpen = details.hidden;
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

    async function loadSiteData() {
        var root = document.getElementById('reference-view-root');
        if (!root) return;
        try {
            var res = await fetch('/data/list_view/reference_view.json');
            var data = await res.json();
            renderAxis(data.axis);
            root.innerHTML = '';

            var sections = data.sections || [];
            sections.forEach(function(section, secIdx) {
                if (section.hidden === true) return;
                var h = document.createElement('h2');
                h.className = 'reference-view__section-label';
                h.textContent = section.label || '';
                root.appendChild(h);

                var list = document.createElement('div');
                list.className = 'reference-view__section';
                list.setAttribute('role', 'list');
                (section.items || []).forEach(function(entry, itemIdx) {
                    list.appendChild(createReferenceRow(entry, secIdx + '-' + itemIdx));
                });
                root.appendChild(list);
            });
        } catch (err) {
            console.error('Error loading site data:', err);
        }
    }
});
