document.addEventListener('DOMContentLoaded', function() {
    initLazyLoading();
    
    const navToggle = document.getElementById('nav-toggle');
    const navDropdown = document.getElementById('nav-dropdown');
    const navArrow = document.querySelector('.nav-arrow');
    
    navToggle.addEventListener('click', function() {
        const isHidden = navDropdown.classList.contains('hidden');
        navDropdown.classList.toggle('hidden');
        
        if (isHidden) {
            navArrow.textContent = '−';
        } else {
            navArrow.textContent = '+';
        }
    });
    
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navDropdown.contains(event.target)) {
            navDropdown.classList.add('hidden');
            navArrow.textContent = '+';
        }
    });
    
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
                    <h3 class="announcement-title">
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
    
    loadAnnouncements();
    
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