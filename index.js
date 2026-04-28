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
                nav.appendChild(document.createTextNode(' · '));
            }
        });
    }

    function renderItem(item) {
        var li = document.createElement('li');
        li.className = 'section__item';

        if (item.url) {
            var a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.title;
            if (/^https?:\/\//i.test(item.url)) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            li.appendChild(a);
        } else {
            li.appendChild(document.createTextNode(item.title));
        }

        if (item.context) {
            var sep = document.createTextNode('. ');
            var ctx = document.createElement('span');
            ctx.className = 'section__item-context';
            ctx.textContent = item.context + '.';
            li.appendChild(sep);
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
                la.textContent = section.label + ':';
                la.target = '_blank';
                la.rel = 'noopener noreferrer';
                h2.appendChild(la);
            } else {
                h2.textContent = section.label + ':';
            }
            div.appendChild(h2);

            var ul = document.createElement('ul');
            ul.className = 'section__list';
            (section.items || []).forEach(function (item) {
                ul.appendChild(renderItem(item));
            });
            div.appendChild(ul);

            (section.subsections || []).forEach(function (sub) {
                var subDiv = document.createElement('div');
                subDiv.className = 'section__subsection';

                var subLabel = document.createElement('p');
                subLabel.className = 'section__subsection-label';
                subLabel.textContent = '(' + sub.label + ')';
                subDiv.appendChild(subLabel);

                var subUl = document.createElement('ul');
                subUl.className = 'section__list';
                (sub.items || []).forEach(function (item) {
                    subUl.appendChild(renderItem(item));
                });
                subDiv.appendChild(subUl);
                div.appendChild(subDiv);
            });

            content.appendChild(div);
        });
    }
});
