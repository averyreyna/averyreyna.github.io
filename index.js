document.addEventListener('DOMContentLoaded', function() {
    var dcTimeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
    });

    setDcTime();
    setInterval(setDcTime, 1000);
    loadSiteData();

    var trailChars = ['!', '@', '#', '$', '%', '&'];
    var lastTrailTime = 0;

    var cursorHead = document.createElement('span');
    cursorHead.className = 'cursor-trail-head';
    cursorHead.textContent = trailChars[Math.floor(Math.random() * trailChars.length)];
    cursorHead.setAttribute('aria-hidden', 'true');
    cursorHead.style.visibility = 'hidden';
    document.body.appendChild(cursorHead);

    document.documentElement.addEventListener('mouseleave', function() {
        cursorHead.style.visibility = 'hidden';
    });

    document.addEventListener('mousemove', function(e) {
        cursorHead.style.left = e.clientX + 'px';
        cursorHead.style.top = e.clientY + 'px';
        cursorHead.style.visibility = 'visible';

        var now = Date.now();
        if (now - lastTrailTime < 80) return;
        lastTrailTime = now;
        var span = document.createElement('span');
        span.className = 'cursor-trail-char';
        span.textContent = trailChars[Math.floor(Math.random() * trailChars.length)];
        span.style.left = (e.clientX + Math.round((Math.random() - 0.5) * 16)) + 'px';
        span.style.top  = (e.clientY + Math.round((Math.random() - 0.5) * 16)) + 'px';
        document.body.appendChild(span);
        setTimeout(function() { span.remove(); }, 600);
    });

    function setDcTime() {
        var dcTimeEl = document.getElementById('dc-time');
        if (!dcTimeEl) return;

        dcTimeEl.textContent = dcTimeFormatter.format(new Date());
    }

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
            var labelA11y = (link.label || link.url || '').replace(/"/g, '');
            a.setAttribute('aria-label', labelA11y);
            var iconName = link.icon || 'link';
            var icon = document.createElement('span');
            icon.className = 'material-symbols-outlined site-axis__link-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = iconName;
            a.appendChild(icon);
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

    function setLinkOpensInNewTab(a, url) {
        if (!url) return;
        if (url.indexOf('mailto:') === 0) {
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

    function createReferenceRow(item, stableId) {
        var hasDetailBody = !!(item.detailHtml || (item.image && item.image.src));
        var hasExpand = hasDetailBody;
        var footUrl = item.footnoteLink && item.footnoteLink.url;
        var isLinkOnly = !!(footUrl && !hasDetailBody);
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
                var fa = document.createElement('a');
                fa.href = item.footnoteLink.url;
                setLinkOpensInNewTab(fa, item.footnoteLink.url);
                fa.textContent = item.footnoteLink.label || item.footnoteLink.url;
                foot.appendChild(fa);
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
        } else if (isLinkOnly && footUrl) {
            var ext = document.createElement('a');
            ext.href = footUrl;
            ext.className = 'reference-view__row-link';
            setLinkOpensInNewTab(ext, footUrl);
            var titleForExt = (item.title || 'entry').replace(/"/g, '');
            ext.setAttribute('aria-label', 'Open link: ' + titleForExt);
            var icon = document.createElement('span');
            icon.className = 'material-symbols-outlined reference-view__link-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = 'link';
            ext.appendChild(icon);
            toggleCell.appendChild(ext);
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
            var res = await fetch('/data/data.json');
            var data = await res.json();
            renderAxis(data.axis);
            root.innerHTML = '';

            var sections = data.sections || [];
            var PREVIEW_LIMIT = 3;
            sections.forEach(function(section, secIdx) {
                if (section.hidden === true) return;
                var items = section.items || [];
                var block = document.createElement('div');
                block.className = 'reference-view__section-block';

                var h = document.createElement('h2');
                h.className = 'reference-view__section-label';
                var labelText = section.label || '';
                if (section.labelHref) {
                    var labelA = document.createElement('a');
                    labelA.className = 'reference-view__section-label-link';
                    labelA.href = section.labelHref;
                    labelA.textContent = labelText;
                    setLinkOpensInNewTab(labelA, section.labelHref);
                    h.appendChild(labelA);
                } else {
                    h.textContent = labelText;
                }
                block.appendChild(h);

                var list = document.createElement('div');
                list.className = 'reference-view__section';
                list.setAttribute('role', 'list');

                var hasOverflow = items.length > PREVIEW_LIMIT;
                var overflowRows = [];
                var previewEndRow = null;

                items.forEach(function(entry, itemIdx) {
                    var row = createReferenceRow(entry, secIdx + '-' + itemIdx);
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

                var footer = document.createElement('div');
                footer.className = 'reference-view__section-footer';
                footer.setAttribute('aria-hidden', 'true');
                if (hasOverflow && overflowRows.length > 0) {
                    footer.removeAttribute('aria-hidden');
                    var expandBtn = document.createElement('button');
                    expandBtn.type = 'button';
                    expandBtn.className = 'reference-view__section-expand';
                    expandBtn.setAttribute('aria-expanded', 'false');
                    expandBtn.textContent = 'EXPAND';
                    expandBtn.addEventListener('click', function() {
                        var willExpand = expandBtn.getAttribute('aria-expanded') !== 'true';
                        overflowRows.forEach(function(r) {
                            r.hidden = !willExpand;
                        });
                        expandBtn.setAttribute('aria-expanded', String(willExpand));
                        expandBtn.textContent = willExpand ? 'COLLAPSE' : 'EXPAND';
                        if (previewEndRow) {
                            previewEndRow.classList.toggle('reference-view__item--section-end', !willExpand);
                        }
                    });
                    footer.appendChild(expandBtn);
                }
                block.appendChild(footer);

                root.appendChild(block);
            });
        } catch (err) {
            console.error('Error loading site data:', err);
        }
    }
});
