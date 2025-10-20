document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navDropdown = document.getElementById('nav-dropdown');
    const navArrow = document.querySelector('.nav-arrow');
    
    navToggle.addEventListener('click', function() {
        const isHidden = navDropdown.classList.contains('hidden');
        navDropdown.classList.toggle('hidden');
        
        // Rotate arrow: > (0deg) when closed, v (90deg) when open
        if (isHidden) {
            navArrow.style.transform = 'rotate(90deg)';
        } else {
            navArrow.style.transform = 'rotate(0deg)';
        }
    });
    
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navDropdown.contains(event.target)) {
            navDropdown.classList.add('hidden');
            navArrow.style.transform = 'rotate(0deg)';
        }
    });

    // Load talks from JSON
    async function loadTalks() {
        try {
            const response = await fetch('/data/talks.json');
            const talks = await response.json();
            
            const container = document.getElementById('talks-container');
            
            // Create talk items with exact same styling
            talks.forEach((talk) => {
                const talkDiv = document.createElement('div');
                talkDiv.className = 'py-1 flex flex-col gap-0.25';
                
                // Function to get icon for link type (matching index.html styling)
                function getIconForLinkType(linkText) {
                    const text = linkText.toLowerCase();
                    const iconStyle = 'style="font-size: 0.5rem; display: inline-block; vertical-align: baseline; line-height: 1; transform: translateY(-0.05em);"';
                    if (text.includes('paper')) return `<i class="fa-solid fa-file-text mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('acm dl')) return `<i class="fa-solid fa-globe mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('project')) return `<i class="fa-solid fa-rocket mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('article')) return `<i class="fa-solid fa-pen-to-square mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('talk')) return `<i class="fa-solid fa-microphone mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('slides')) return `<i class="fa-solid fa-file-powerpoint mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('presentation')) return `<i class="fa-solid fa-images mr-0.5" ${iconStyle}></i>`;
                    return `<i class="fa-solid fa-link mr-0.5" ${iconStyle}></i>`; // default icon
                }

                // Generate links HTML
                const linksHtml = talk.links.map(link => 
                    `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${getIconForLinkType(link.text)}${link.text}</a>`
                ).join('');
                
                talkDiv.innerHTML = `
                    <span class="font-semibold text-gray-900 mb-0.5 leading-tight" style="margin-bottom:0.1rem;">${talk.title}</span>
                    <span class="text-xs text-gray-500">${talk.venue}</span>
                    <span class="text-xs text-gray-700">${talk.authors}</span>
                    <span class="flex flex-row flex-wrap gap-2 mt-0.5">
                        ${linksHtml}
                    </span>
                `;
                
                container.appendChild(talkDiv);
            });
            
        } catch (error) {
            console.error('Error loading talks:', error);
        }
    }
    
    // Load talks when page loads
    loadTalks();

    // Load papers from JSON
    async function loadPapers() {
        try {
            const response = await fetch('/data/papers.json');
            const papers = await response.json();
            
            const container = document.getElementById('papers-container');
            
            // Create paper items with exact same styling
            papers.forEach((paper) => {
                const paperDiv = document.createElement('div');
                paperDiv.className = 'py-1 flex flex-col gap-0.25';
                
                // Function to get icon for link type (matching index.html styling)
                function getIconForLinkType(linkText) {
                    const text = linkText.toLowerCase();
                    const iconStyle = 'style="font-size: 0.5rem; display: inline-block; vertical-align: baseline; line-height: 1; transform: translateY(-0.05em);"';
                    if (text.includes('paper')) return `<i class="fa-solid fa-file-text mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('acm dl')) return `<i class="fa-solid fa-globe mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('project')) return `<i class="fa-solid fa-rocket mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('article')) return `<i class="fa-solid fa-pen-to-square mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('talk')) return `<i class="fa-solid fa-microphone mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('slides')) return `<i class="fa-solid fa-file-powerpoint mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('presentation')) return `<i class="fa-solid fa-images mr-0.5" ${iconStyle}></i>`;
                    return `<i class="fa-solid fa-link mr-0.5" ${iconStyle}></i>`; // default icon
                }

                // Generate links HTML
                const linksHtml = paper.links.map(link => {
                    if (link.italic) {
                        return `<span class="text-gray-500 text-xs italic">${link.text}</span>`;
                    } else {
                        return `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${getIconForLinkType(link.text)}${link.text}</a>`;
                    }
                }).join('');
                
                paperDiv.innerHTML = `
                    <span class="font-semibold text-gray-900 mb-0.5 leading-tight" style="margin-bottom:0.1rem;">${paper.title}</span>
                    <span class="text-xs text-gray-500">${paper.venue}</span>
                    <span class="text-xs text-gray-700">${paper.authors}</span>
                    <span class="flex flex-row flex-wrap gap-2 mt-0.5">
                        ${linksHtml}
                    </span>
                `;
                
                container.appendChild(paperDiv);
            });
            
        } catch (error) {
            console.error('Error loading papers:', error);
        }
    }
    
    // Load papers when page loads
    loadPapers();

    // Load presentations from JSON
    async function loadPresentations() {
        try {
            const response = await fetch('/data/presentations.json');
            const presentations = await response.json();
            
            const container = document.getElementById('presentations-container');
            
            // Create presentation items with exact same styling
            presentations.forEach((presentation) => {
                const presentationDiv = document.createElement('div');
                presentationDiv.className = 'py-1 flex flex-col gap-0.25';
                
                // Function to get icon for link type (matching index.html styling)
                function getIconForLinkType(linkText) {
                    const text = linkText.toLowerCase();
                    const iconStyle = 'style="font-size: 0.5rem; display: inline-block; vertical-align: baseline; line-height: 1; transform: translateY(-0.05em);"';
                    if (text.includes('paper')) return `<i class="fa-solid fa-file-text mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('acm dl')) return `<i class="fa-solid fa-globe mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('project')) return `<i class="fa-solid fa-rocket mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('article')) return `<i class="fa-solid fa-pen-to-square mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('talk')) return `<i class="fa-solid fa-microphone mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('slides')) return `<i class="fa-solid fa-file-powerpoint mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('presentation')) return `<i class="fa-solid fa-images mr-0.5" ${iconStyle}></i>`;
                    return `<i class="fa-solid fa-link mr-0.5" ${iconStyle}></i>`; // default icon
                }

                // Generate links HTML
                const linksHtml = presentation.links.map(link => 
                    `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${getIconForLinkType(link.text)}${link.text}</a>`
                ).join('');
                
                presentationDiv.innerHTML = `
                    <span class="font-semibold text-gray-900 mb-0.5 leading-tight" style="margin-bottom:0.1rem;">${presentation.title}</span>
                    <span class="text-xs text-gray-500">${presentation.venue}</span>
                    <span class="text-xs text-gray-700">${presentation.authors}</span>
                    <span class="flex flex-row flex-wrap gap-2 mt-0.5">
                        ${linksHtml}
                    </span>
                `;
                
                container.appendChild(presentationDiv);
            });
            
        } catch (error) {
            console.error('Error loading presentations:', error);
        }
    }
    
    // Load presentations when page loads
    loadPresentations();

    // Load articles from JSON
    async function loadArticles() {
        try {
            const response = await fetch('/data/articles.json');
            const articles = await response.json();
            
            const container = document.getElementById('articles-container');
            
            articles.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.className = 'py-1 flex flex-col gap-0.25';
                
                // Title
                const titleSpan = document.createElement('span');
                titleSpan.className = 'font-semibold text-gray-900 mb-0.5 leading-tight';
                titleSpan.style.marginBottom = '0.1rem';
                titleSpan.textContent = article.title;
                
                // Venue
                const venueSpan = document.createElement('span');
                venueSpan.className = 'text-xs text-gray-500';
                venueSpan.textContent = article.venue;
                
                // Authors
                const authorsSpan = document.createElement('span');
                authorsSpan.className = 'text-xs text-gray-700';
                authorsSpan.innerHTML = article.authors;
                
                // Links
                const linksSpan = document.createElement('span');
                linksSpan.className = 'flex flex-row flex-wrap gap-2 mt-0.5';
                
                // Function to get icon for link type (matching index.html styling)
                function getIconForLinkType(linkText) {
                    const text = linkText.toLowerCase();
                    const iconStyle = 'style="font-size: 0.5rem; display: inline-block; vertical-align: baseline; line-height: 1; transform: translateY(-0.05em);"';
                    if (text.includes('paper')) return `<i class="fa-solid fa-file-text mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('acm dl')) return `<i class="fa-solid fa-globe mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('project')) return `<i class="fa-solid fa-rocket mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('article')) return `<i class="fa-solid fa-pen-to-square mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('talk')) return `<i class="fa-solid fa-microphone mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('slides')) return `<i class="fa-solid fa-file-powerpoint mr-0.5" ${iconStyle}></i>`;
                    if (text.includes('presentation')) return `<i class="fa-solid fa-images mr-0.5" ${iconStyle}></i>`;
                    return `<i class="fa-solid fa-link mr-0.5" ${iconStyle}></i>`; // default icon
                }

                article.links.forEach(link => {
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.className = 'paper-link text-gray-500 text-xs';
                    linkElement.target = '_blank';
                    linkElement.rel = 'noopener';
                    linkElement.innerHTML = getIconForLinkType(link.text) + link.text;
                    linksSpan.appendChild(linkElement);
                });
                
                articleDiv.appendChild(titleSpan);
                articleDiv.appendChild(venueSpan);
                articleDiv.appendChild(authorsSpan);
                articleDiv.appendChild(linksSpan);
                
                container.appendChild(articleDiv);
            });
        } catch (error) {
            console.error('Error loading articles:', error);
        }
    }

    // Load articles when page loads
    loadArticles();

    // Companies hover effect with cursor following
    const companiesTrigger = document.querySelector('.companies-hover-trigger');
    const companiesDetail = document.querySelector('.companies-detail');
    
    if (companiesTrigger && companiesDetail) {
        let isTouch = false;
        
        // Detect touch devices
        companiesTrigger.addEventListener('touchstart', function() {
            isTouch = true;
        });
        
        // Desktop hover behavior with cursor following
        companiesTrigger.addEventListener('mouseenter', function() {
            if (!isTouch) {
                companiesDetail.classList.add('show');
            }
        });
        
        companiesTrigger.addEventListener('mousemove', function(e) {
            if (!isTouch && companiesDetail.classList.contains('show')) {
                const rect = companiesTrigger.getBoundingClientRect();
                const x = e.clientX - rect.left + 15; // 15px offset to the right
                const y = e.clientY - rect.top - 10; // 10px offset above cursor
                
                companiesDetail.style.left = x + 'px';
                companiesDetail.style.top = y + 'px';
            }
        });
        
        companiesTrigger.addEventListener('mouseleave', function() {
            if (!isTouch) {
                companiesDetail.classList.remove('show');
            }
        });
        
        // Mobile tap behavior
        companiesTrigger.addEventListener('click', function(e) {
            if (isTouch) {
                e.preventDefault();
                if (companiesDetail.classList.contains('show')) {
                    companiesDetail.classList.remove('show');
                } else {
                    companiesDetail.classList.add('show');
                    // Position at a fixed location for mobile
                    companiesDetail.style.left = '100%';
                    companiesDetail.style.top = '-50px';
                    companiesDetail.style.marginLeft = '10px';
                }
            }
        });
        
        // Close on outside tap for mobile
        document.addEventListener('click', function(e) {
            if (isTouch && !companiesTrigger.contains(e.target) && companiesDetail.classList.contains('show')) {
                companiesDetail.classList.remove('show');
            }
        });
    }

    // XR Access hover effect with cursor following
    const xrAccessTrigger = document.querySelector('.xr-access-hover-trigger');
    const xrAccessDetail = document.querySelector('.xr-access-detail');
    
    if (xrAccessTrigger && xrAccessDetail) {
        let isTouch = false;
        
        xrAccessTrigger.addEventListener('touchstart', function() {
            isTouch = true;
        });
        
        xrAccessTrigger.addEventListener('mouseenter', function() {
            if (!isTouch) {
                xrAccessDetail.classList.add('show');
            }
        });
        
        xrAccessTrigger.addEventListener('mousemove', function(e) {
            if (!isTouch && xrAccessDetail.classList.contains('show')) {
                const rect = xrAccessTrigger.getBoundingClientRect();
                const x = e.clientX - rect.left + 15;
                const y = e.clientY - rect.top - 10;
                
                xrAccessDetail.style.left = x + 'px';
                xrAccessDetail.style.top = y + 'px';
            }
        });
        
        xrAccessTrigger.addEventListener('mouseleave', function() {
            if (!isTouch) {
                xrAccessDetail.classList.remove('show');
            }
        });
        
        xrAccessTrigger.addEventListener('click', function(e) {
            if (isTouch) {
                e.preventDefault();
                if (xrAccessDetail.classList.contains('show')) {
                    xrAccessDetail.classList.remove('show');
                } else {
                    xrAccessDetail.classList.add('show');
                    xrAccessDetail.style.left = '100%';
                    xrAccessDetail.style.top = '-50px';
                    xrAccessDetail.style.marginLeft = '10px';
                }
            }
        });
        
        document.addEventListener('click', function(e) {
            if (isTouch && !xrAccessTrigger.contains(e.target) && xrAccessDetail.classList.contains('show')) {
                xrAccessDetail.classList.remove('show');
            }
        });
    }

    // UW Tacoma hover effect with cursor following
    const uwTacomaTrigger = document.querySelector('.uw-tacoma-hover-trigger');
    const uwTacomaDetail = document.querySelector('.uw-tacoma-detail');
    
    if (uwTacomaTrigger && uwTacomaDetail) {
        let isTouch = false;
        
        uwTacomaTrigger.addEventListener('touchstart', function() {
            isTouch = true;
        });
        
        uwTacomaTrigger.addEventListener('mouseenter', function() {
            if (!isTouch) {
                uwTacomaDetail.classList.add('show');
            }
        });
        
        uwTacomaTrigger.addEventListener('mousemove', function(e) {
            if (!isTouch && uwTacomaDetail.classList.contains('show')) {
                const rect = uwTacomaTrigger.getBoundingClientRect();
                const x = e.clientX - rect.left + 15;
                const y = e.clientY - rect.top - 10;
                
                uwTacomaDetail.style.left = x + 'px';
                uwTacomaDetail.style.top = y + 'px';
            }
        });
        
        uwTacomaTrigger.addEventListener('mouseleave', function() {
            if (!isTouch) {
                uwTacomaDetail.classList.remove('show');
            }
        });
        
        uwTacomaTrigger.addEventListener('click', function(e) {
            if (isTouch) {
                e.preventDefault();
                if (uwTacomaDetail.classList.contains('show')) {
                    uwTacomaDetail.classList.remove('show');
                } else {
                    uwTacomaDetail.classList.add('show');
                    uwTacomaDetail.style.left = '100%';
                    uwTacomaDetail.style.top = '-50px';
                    uwTacomaDetail.style.marginLeft = '10px';
                }
            }
        });
        
        document.addEventListener('click', function(e) {
            if (isTouch && !uwTacomaTrigger.contains(e.target) && uwTacomaDetail.classList.contains('show')) {
                uwTacomaDetail.classList.remove('show');
            }
        });
    }

    // Companies toggle functionality
    const companiesToggle = document.getElementById('companies-toggle');
    const companiesList = document.getElementById('companies-list');
    
    if (companiesToggle && companiesList) {
        const arrowSpan = companiesToggle.querySelector('span');
        
        companiesToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isHidden = companiesList.style.display === 'none' || companiesList.style.display === '';
            
            if (isHidden) {
                companiesList.style.display = 'block';
                companiesToggle.classList.add('active');
                companiesToggle.setAttribute('aria-label', 'Hide companies');
                if (arrowSpan) {
                    arrowSpan.style.transform = 'rotate(90deg)';
                }
            } else {
                companiesList.style.display = 'none';
                companiesToggle.classList.remove('active');
                companiesToggle.setAttribute('aria-label', 'Show companies');
                if (arrowSpan) {
                    arrowSpan.style.transform = 'rotate(0deg)';
                }
            }
        });
    }
});
