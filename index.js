document.addEventListener('DOMContentLoaded', function () {
    fetch('/data.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            renderLinks(data.links || []);
            renderSections(data.sections || []);
        })
        .catch(function (err) { console.error('Error loading site data:', err); });

    function renderLinks(links) {
        var nav = document.getElementById('site-links');
        if (!nav || links.length === 0) return;
        links.forEach(function (link, i) {
            var a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.label;
            if (/^https?:\/\//i.test(link.url)) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            nav.appendChild(a);
            if (i < links.length - 1) {
                nav.appendChild(document.createTextNode(' '));
            }
        });
    }

    function renderItem(item) {
        var li = document.createElement('li');
        li.className = 'section__item';

        var titleEl;
        if (item.url) {
            titleEl = document.createElement('a');
            titleEl.href = item.url;
            if (/^https?:\/\//i.test(item.url)) {
                titleEl.target = '_blank';
                titleEl.rel = 'noopener noreferrer';
            }
        } else {
            titleEl = document.createElement('span');
        }
        titleEl.className = 'section__item-title';
        titleEl.textContent = item.title;
        li.appendChild(titleEl);

        if (Array.isArray(item.authors) && item.authors.length > 0) {
            var authorsDiv = document.createElement('div');
            authorsDiv.className = 'section__item-authors';

            item.authors.forEach(function (author, i) {
                if (i > 0) {
                    authorsDiv.appendChild(document.createTextNode(', '));
                }

                if (author === 'Avery Reyna') {
                    var strong = document.createElement('strong');
                    strong.textContent = author;
                    authorsDiv.appendChild(strong);
                } else {
                    authorsDiv.appendChild(document.createTextNode(author));
                }
            });

            li.appendChild(authorsDiv);
        }

        if (item.context) {
            var ctx = document.createElement('div');
            ctx.className = 'section__item-context';
            ctx.textContent = item.context;

            if (item.pdf) {
                ctx.appendChild(document.createTextNode(' '));
                var pdfLink = document.createElement('a');
                pdfLink.className = 'section__item-pdf';
                pdfLink.textContent = '[pdf]';
                pdfLink.href = item.pdf;
                if (/^https?:\/\//i.test(item.pdf) || /\.pdf$/i.test(item.pdf)) {
                    pdfLink.target = '_blank';
                    pdfLink.rel = 'noopener noreferrer';
                }
                ctx.appendChild(pdfLink);
            }

            li.appendChild(ctx);
        }

        return li;
    }

    function renderSections(sections) {
        var content = document.getElementById('content');
        if (!content) return;

        sections.forEach(function (section) {
            var div = document.createElement('div');
            div.className = 'section';

            var h2 = document.createElement('h2');
            h2.className = 'section__label';
            if (section.labelUrl) {
                var la = document.createElement('a');
                la.href = section.labelUrl;
                la.textContent = section.label;
                la.target = '_blank';
                la.rel = 'noopener noreferrer';
                h2.appendChild(la);
            } else {
                h2.textContent = section.label;
            }
            div.appendChild(h2);

            var ul = document.createElement('ul');
            ul.className = 'section__list';

            (section.items || []).forEach(function (item) {
                ul.appendChild(renderItem(item));
            });
            (section.subsections || []).forEach(function (sub) {
                (sub.items || []).forEach(function (item) {
                    ul.appendChild(renderItem(item));
                });
            });

            div.appendChild(ul);
            content.appendChild(div);
        });
    }
});
