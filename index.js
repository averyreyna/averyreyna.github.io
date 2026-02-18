document.addEventListener('DOMContentLoaded', function() {
    initLazyLoading();

    function createExperienceEntry({ header, subheader, meta, description, location }) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'experience-item';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'experience-content';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'experience-header';
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
                const stripHtml = (str) => {
                    const div = document.createElement('div');
                    div.innerHTML = str;
                    return div.textContent || div.innerText || '';
                };
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
            const response = await fetch('/data/experience.json');
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
            const response = await fetch('/data/announcements.json');
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
            const response = await fetch('/data/awards.json');
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
    
    loadAnnouncements();
    loadAwards();
    loadExperience();

    async function loadPublicScholarship() {
        try {
            const response = await fetch('/data/public_scholarship.json');
            const articles = await response.json();
            const container = document.getElementById('public-scholarship-container');
            articles.forEach((article) => {
                const articleDiv = document.createElement('div');
                articleDiv.className = 'experience-item';
                const contentDiv = document.createElement('div');
                contentDiv.className = 'experience-content';
                const linksHtml = article.links.map(link => {
                    if (link.italic) {
                        return `<span class="text-gray-500 text-xs italic">${link.text}</span>`;
                    }
                    return `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`;
                }).join('');
                contentDiv.innerHTML = `
                    <div class="experience-header">
                        <span class="font-semibold text-gray-900 leading-tight">${article.title}</span>
                    </div>
                    <span class="text-xs text-gray-500">${article.venue}</span>
                    <span class="text-xs text-gray-700">${article.authors}</span>
                    <span class="flex flex-row flex-wrap gap-2">
                        ${linksHtml}
                    </span>
                `;
                articleDiv.appendChild(contentDiv);
                container.appendChild(articleDiv);
            });
        } catch (error) {
            console.error('Error loading public scholarship:', error);
        }
    }
    loadPublicScholarship();

    async function loadMedia() {
        try {
            const response = await fetch('/data/media.json');
            const items = await response.json();
            const container = document.getElementById('media-container');
            items.forEach((item) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'experience-item';
                const contentDiv = document.createElement('div');
                contentDiv.className = 'experience-content';
                const linksHtml = item.links.map(link =>
                    `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`
                ).join('');
                contentDiv.innerHTML = `
                    <div class="experience-header">
                        <span class="font-semibold text-gray-900 leading-tight">${item.title}</span>
                    </div>
                    ${item.series ? `<span class="text-xs text-gray-500">${item.series}</span>` : ''}
                    <span class="flex flex-row flex-wrap gap-2">
                        ${linksHtml}
                    </span>
                `;
                itemDiv.appendChild(contentDiv);
                container.appendChild(itemDiv);
            });
        } catch (error) {
            console.error('Error loading media:', error);
        }
    }

    async function loadPresentations() {
        try {
            const response = await fetch('/data/presentations.json');
            const presentations = await response.json();
            const container = document.getElementById('presentations-container');
            presentations.forEach((presentation) => {
                const presDiv = document.createElement('div');
                presDiv.className = 'experience-item';
                const contentDiv = document.createElement('div');
                contentDiv.className = 'experience-content';
                const linksHtml = presentation.links.map(link =>
                    `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`
                ).join('');
                contentDiv.innerHTML = `
                    <div class="experience-header">
                        <span class="font-semibold text-gray-900 leading-tight">${presentation.title}</span>
                    </div>
                    <span class="text-xs text-gray-500">${presentation.venue}</span>
                    <span class="text-xs text-gray-700">${presentation.authors}</span>
                    <span class="flex flex-row flex-wrap gap-2">
                        ${linksHtml}
                    </span>
                `;
                presDiv.appendChild(contentDiv);
                container.appendChild(presDiv);
            });
        } catch (error) {
            console.error('Error loading presentations:', error);
        }
    }

    loadMedia();
    loadPresentations();
    
    async function loadRecentPublications() {
        try {
            const response = await fetch('/data/papers.json');
            const papers = await response.json();
            
            // Filter to only conference papers
            const conferencePapers = papers.filter(paper => {
                const venue = paper.venue.toLowerCase();
                return venue !== 'preprint' && !venue.includes('preprint') && !venue.includes('arxiv');
            });
            
            // If we have 3+ conference papers, use only those. Otherwise, take first 3 papers total (maintaining chronological order)
            let recentPapers;
            if (conferencePapers.length >= 3) {
                recentPapers = conferencePapers.slice(0, 3);
            } else {
                // Take first 3 papers from original array (already in most-recent-first order)
                recentPapers = papers.slice(0, 3);
            }
            
            const container = document.getElementById('recent-publications-container');
            
            recentPapers.forEach((paper) => {
                const paperDiv = document.createElement('div');
                paperDiv.className = 'experience-item';

                const contentDiv = document.createElement('div');
                contentDiv.className = 'experience-content';

                const linksHtml = paper.links.map(link => {
                    if (link.italic) {
                        return `<span class="text-gray-500 text-xs italic">${link.text}</span>`;
                    } else {
                        return `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`;
                    }
                }).join('');
                
                contentDiv.innerHTML = `
                    <div class="experience-header">
                        <span class="font-semibold text-gray-900 leading-tight">${paper.title}</span>
                    </div>
                    <span class="text-xs text-gray-500">${paper.venue}</span>
                    <span class="text-xs text-gray-700">${paper.authors}</span>
                    <span class="flex flex-row flex-wrap gap-2">
                        ${linksHtml}
                    </span>
                `;
                
                paperDiv.appendChild(contentDiv);
                
                container.appendChild(paperDiv);
            });
            
        } catch (error) {
            console.error('Error loading recent publications:', error);
        }
    }
    
    loadRecentPublications();
    
    async function loadResources() {
        try {
            const response = await fetch('/data/resources.json');
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
            const response = await fetch('/data/talks.json');
            const talks = await response.json();
            const container = document.getElementById('talks-container');
            talks.forEach((talk) => {
                const talkDiv = document.createElement('div');
                talkDiv.className = 'experience-item';
                const contentDiv = document.createElement('div');
                contentDiv.className = 'experience-content';
                contentDiv.innerHTML = `
                    <div class="experience-header">
                        <span class="font-semibold text-gray-900 leading-tight">${talk.title}</span>
                    </div>
                    <span class="text-xs text-gray-500">${talk.venue}</span>
                    <span class="text-xs text-gray-700">${talk.authors}</span>
                `;
                talkDiv.appendChild(contentDiv);
                container.appendChild(talkDiv);
            });
        } catch (error) {
            console.error('Error loading talks:', error);
        }
    }
    loadTalks();

    async function loadTeaching() {
        try {
            const response = await fetch('/data/teaching.json');
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
            const response = await fetch('/data/volunteering.json');
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
            
            const lazyImages = document.querySelectorAll('.lazy-load');
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            const lazyImages = document.querySelectorAll('.lazy-load');
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
});