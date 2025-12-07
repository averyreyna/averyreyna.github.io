document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navDropdown = document.getElementById('nav-dropdown');
    const navArrow = document.querySelector('.nav-arrow');
    
    navToggle.addEventListener('click', function() {
        const isHidden = navDropdown.classList.contains('hidden');
        navDropdown.classList.toggle('hidden');
        
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

    async function fetchJsonData(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}: ${response.status}`);
        }
        return response.json();
    }

    function createExperienceEntry({ header, subheader, meta, description, location }) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'experience-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'experience-content flex flex-col gap-0.25';

        // Company/org header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'experience-header';
        
        const headerSpan = document.createElement('span');
        headerSpan.className = 'font-semibold text-gray-900 leading-tight';
        headerSpan.textContent = header;
        headerDiv.appendChild(headerSpan);
        contentDiv.appendChild(headerDiv);

        // Position and dates on same line
        if (subheader || meta) {
            const positionDatesDiv = document.createElement('div');
            positionDatesDiv.className = 'flex flex-row items-start justify-between gap-2';
            positionDatesDiv.style.marginTop = '-0.25rem';

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

        // About > location with dropdown
        if (description || location) {
            const aboutLocationDiv = document.createElement('div');
            aboutLocationDiv.className = 'flex flex-row items-center justify-between gap-2';
            aboutLocationDiv.style.marginTop = '-0.15rem';

            // About section with dropdown (if description exists)
            let aboutContainer = null;
            let aboutArrow = null;
            let descriptionDiv = null;

            if (description) {
                aboutContainer = document.createElement('div');
                aboutContainer.className = 'flex flex-row items-center';
                aboutContainer.style.cursor = 'pointer';
                aboutContainer.style.gap = '0.25rem';

                const aboutText = document.createElement('span');
                aboutText.className = 'text-xs text-gray-600';
                aboutText.textContent = 'Description';

                aboutArrow = document.createElement('span');
                aboutArrow.className = 'cv-description-arrow text-gray-500 transition-transform duration-200 ease-in-out';
                aboutArrow.style.transform = 'rotate(0deg)';
                aboutArrow.textContent = '>';

                aboutContainer.appendChild(aboutText);
                aboutContainer.appendChild(aboutArrow);

                // Description container (hidden by default)
                descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'cv-description-content hidden';
                descriptionDiv.style.marginTop = '0.05rem';
                descriptionDiv.style.marginBottom = '0';

                // Handle newlines in description
                if (description.includes('\n')) {
                    const descLines = description.split('\n').filter(line => line.trim());
                    descLines.forEach(line => {
                        const paragraph = document.createElement('div');
                        paragraph.className = 'text-xs text-gray-700';
                        paragraph.style.lineHeight = '1';
                        paragraph.style.marginBottom = '0';
                        paragraph.style.marginTop = '0';
                        paragraph.textContent = line.trim();
                        descriptionDiv.appendChild(paragraph);
                    });
                } else {
                    const descriptionText = document.createElement('div');
                    descriptionText.className = 'text-xs text-gray-700';
                    descriptionText.style.lineHeight = '1';
                    descriptionText.style.marginTop = '0';
                    descriptionText.style.marginBottom = '0';
                    descriptionText.textContent = description.trim();
                    descriptionDiv.appendChild(descriptionText);
                }

                // Toggle description on click
                aboutContainer.addEventListener('click', function() {
                    const isHidden = descriptionDiv.classList.contains('hidden');
                    if (isHidden) {
                        descriptionDiv.classList.remove('hidden');
                        aboutArrow.style.transform = 'rotate(90deg)';
                    } else {
                        descriptionDiv.classList.add('hidden');
                        aboutArrow.style.transform = 'rotate(0deg)';
                    }
                });

                aboutLocationDiv.appendChild(aboutContainer);
            }

            // Location
            if (location) {
                const locationSpan = document.createElement('span');
                locationSpan.className = 'block text-xs text-gray-500 whitespace-nowrap';
                locationSpan.textContent = location;
                aboutLocationDiv.appendChild(locationSpan);
            } else {
                // If no location, add empty placeholder
                const emptySpan = document.createElement('span');
                emptySpan.innerHTML = '&nbsp;';
                aboutLocationDiv.appendChild(emptySpan);
            }

            contentDiv.appendChild(aboutLocationDiv);

            // Add description div if it exists
            if (descriptionDiv) {
                contentDiv.appendChild(descriptionDiv);
            }
        }

        itemDiv.appendChild(contentDiv);
        return itemDiv;
    }

    function highlightKeywords(text) {
        // First, handle **bold** markers
        let html = text.replace(/\*\*(.*?)\*\*/g, '<span class="cv-readme-keyword">$1</span>');
        
        // Then highlight capitalized words that look like names/organizations/technologies
        // Match words that start with capital letter and are followed by more capitals or are part of a compound
        html = html.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, (match, word) => {
            // Skip if already wrapped in a keyword span
            if (match.includes('<span')) return match;
            // Skip common words
            const commonWords = ['The', 'This', 'That', 'These', 'Those', 'I', 'We', 'You', 'They', 'My', 'Our', 'Your', 'Their', 'A', 'An', 'And', 'Or', 'But', 'For', 'With', 'From', 'To', 'In', 'On', 'At', 'By', 'Of', 'As', 'Is', 'Are', 'Was', 'Were', 'Been', 'Be', 'Have', 'Has', 'Had', 'Do', 'Does', 'Did', 'Will', 'Would', 'Could', 'Should', 'May', 'Might', 'Must', 'Can'];
            if (commonWords.includes(word)) return match;
            // Skip if it's a single letter
            if (word.length <= 1) return match;
            // Highlight if it looks like a name/organization (multiple capitalized words or single long capitalized word)
            if (word.split(' ').length > 1 || word.length > 4) {
                return `<span class="cv-readme-keyword">${word}</span>`;
            }
            return match;
        });
        
        return html;
    }

    function openDescriptionModal(header, subheader, meta, description, location) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'cv-modal-overlay';
        modalOverlay.id = 'cv-modal-overlay';

        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'cv-modal-container';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'cv-modal-content';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'cv-modal-close';
        closeButton.innerHTML = '<i class="fa-solid fa-times"></i>';
        closeButton.setAttribute('aria-label', 'Close modal');

        // Create readme-style content
        const readmeContent = document.createElement('div');
        readmeContent.className = 'cv-readme-content';

        // Title
        const title = document.createElement('h1');
        title.className = 'cv-readme-title';
        title.textContent = header;
        readmeContent.appendChild(title);

        // Meta information
        const metaInfo = document.createElement('div');
        metaInfo.className = 'cv-readme-meta';

        if (subheader) {
            const role = document.createElement('p');
            role.className = 'cv-readme-role';
            role.textContent = subheader;
            metaInfo.appendChild(role);
        }

        if (meta) {
            const dates = document.createElement('p');
            dates.className = 'cv-readme-dates';
            dates.textContent = meta;
            metaInfo.appendChild(dates);
        }

        if (location) {
            const loc = document.createElement('p');
            loc.className = 'cv-readme-location';
            loc.textContent = location;
            metaInfo.appendChild(loc);
        }

        readmeContent.appendChild(metaInfo);

        // Description
        const descSection = document.createElement('div');
        descSection.className = 'cv-readme-description';

        // Split description by newlines and create paragraphs
        // If no newlines, treat as single paragraph
        if (description.includes('\n')) {
            const descLines = description.split('\n').filter(line => line.trim());
            descLines.forEach(line => {
                const paragraph = document.createElement('p');
                paragraph.className = 'cv-readme-text';
                paragraph.innerHTML = highlightKeywords(line.trim());
                descSection.appendChild(paragraph);
            });
        } else {
            const paragraph = document.createElement('p');
            paragraph.className = 'cv-readme-text';
            paragraph.innerHTML = highlightKeywords(description.trim());
            descSection.appendChild(paragraph);
        }

        readmeContent.appendChild(descSection);

        // Assemble modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(readmeContent);
        modalContainer.appendChild(modalContent);
        modalOverlay.appendChild(modalContainer);

        // Add to body
        document.body.appendChild(modalOverlay);

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Close handlers
        const closeModal = () => {
            modalOverlay.remove();
            document.body.style.overflow = '';
        };

        closeButton.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Animate in
        setTimeout(() => {
            modalOverlay.classList.add('cv-modal-active');
        }, 10);
    }

    async function loadEducation() {
        try {
            const educationData = await fetchJsonData('/data/education.json');
            const container = document.getElementById('education-container');

            educationData.forEach(entry => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'experience-item';

                const contentDiv = document.createElement('div');
                contentDiv.className = 'experience-content flex flex-col gap-0.25';

                const headerDiv = document.createElement('div');
                headerDiv.className = 'experience-header';

                const headerSpan = document.createElement('span');
                headerSpan.className = 'font-semibold text-gray-900 leading-tight';
                headerSpan.textContent = entry.institution;

                headerDiv.appendChild(headerSpan);
                contentDiv.appendChild(headerDiv);

                const metaDiv = document.createElement('div');
                metaDiv.className = 'flex flex-row items-start justify-between gap-2';
                metaDiv.style.marginTop = '-0.25rem';

                const degreeSpan = document.createElement('span');
                degreeSpan.className = 'block text-xs text-gray-700';
                degreeSpan.textContent = entry.degree;

                const datesSpan = document.createElement('span');
                datesSpan.className = 'block text-xs text-gray-500 whitespace-nowrap';
                datesSpan.textContent = entry.dates;

                metaDiv.appendChild(degreeSpan);
                metaDiv.appendChild(datesSpan);
                contentDiv.appendChild(metaDiv);

                if (Array.isArray(entry.details) && entry.details.length > 0 || entry.location) {
                    // Create a container for details and location on the same line
                    const detailsLocationDiv = document.createElement('div');
                    detailsLocationDiv.className = 'flex flex-row items-start justify-between gap-2';
                    detailsLocationDiv.style.marginTop = '-0.15rem';

                    // Details/accolades on the left
                    if (Array.isArray(entry.details) && entry.details.length > 0) {
                        const detailsContainer = document.createElement('div');
                        detailsContainer.className = 'flex flex-col gap-0.5 education-detail-group';

                        entry.details.forEach((detail, index) => {
                            const detailSpan = document.createElement('span');
                            detailSpan.className = 'block text-gray-500 text-xs';
                            if (index === 0) {
                                detailSpan.classList.add('education-minors');
                            } else if (index === 1) {
                                detailSpan.classList.add('education-honors');
                            }
                            detailSpan.textContent = detail;
                            detailsContainer.appendChild(detailSpan);
                        });

                        detailsLocationDiv.appendChild(detailsContainer);
                    } else {
                        // Empty placeholder if no details
                        const emptySpan = document.createElement('span');
                        emptySpan.innerHTML = '&nbsp;';
                        detailsLocationDiv.appendChild(emptySpan);
                    }

                    // Location on the right
                    if (entry.location) {
                        const locationSpan = document.createElement('span');
                        locationSpan.className = 'block text-xs text-gray-500 whitespace-nowrap';
                        locationSpan.textContent = entry.location;
                        detailsLocationDiv.appendChild(locationSpan);
                    } else {
                        // Empty placeholder if no location
                        const emptySpan = document.createElement('span');
                        emptySpan.innerHTML = '&nbsp;';
                        detailsLocationDiv.appendChild(emptySpan);
                    }

                    contentDiv.appendChild(detailsLocationDiv);
                }

                itemDiv.appendChild(contentDiv);
                container.appendChild(itemDiv);
            });
        } catch (error) {
            console.error('Error loading education:', error);
        }
    }

    async function loadWorkExperience() {
        try {
            const workExperience = await fetchJsonData('/data/work_experience.json');
            const container = document.getElementById('work-experience-container');

            workExperience.forEach(entry => {
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
            console.error('Error loading work experience:', error);
        }
    }

    async function loadResearchExperience() {
        try {
            const researchExperience = await fetchJsonData('/data/research_experience.json');
            const container = document.getElementById('research-experience-container');

            researchExperience.forEach(entry => {
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
            console.error('Error loading research experience:', error);
        }
    }

    async function loadTeachingExperience() {
        try {
            const teachingExperience = await fetchJsonData('/data/teaching_experience.json');
            const container = document.getElementById('teaching-experience-container');

            teachingExperience.forEach(entry => {
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
            console.error('Error loading teaching experience:', error);
        }
    }

    async function loadAwards() {
        try {
            const awards = await fetchJsonData('/data/awards.json');
            const container = document.getElementById('awards-container');

            awards.forEach(entry => {
                const item = createExperienceEntry({
                    header: entry.title,
                    subheader: entry.organization,
                    meta: entry.year
                });
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading awards:', error);
        }
    }

    async function loadVolunteering() {
        try {
            const volunteering = await fetchJsonData('/data/volunteering.json');
            const container = document.getElementById('volunteering-container');

            volunteering.forEach(entry => {
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

    async function loadMedia() {
        try {
            const mediaItems = await fetchJsonData('/data/media.json');
            const container = document.getElementById('media-container');

            mediaItems.forEach(entry => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'experience-item';

                const contentDiv = document.createElement('div');
                contentDiv.className = 'experience-content flex flex-col gap-0.25';

                const headerDiv = document.createElement('div');
                headerDiv.className = 'experience-header';

                const headerSpan = document.createElement('span');
                headerSpan.className = 'font-semibold text-gray-900 leading-tight';
                headerSpan.textContent = entry.title;

                headerDiv.appendChild(headerSpan);
                contentDiv.appendChild(headerDiv);

                if (entry.series) {
                    const seriesDiv = document.createElement('div');
                    seriesDiv.className = 'flex flex-row items-start justify-between gap-2';
                    seriesDiv.style.marginTop = '-0.25rem';

                    const seriesSpan = document.createElement('span');
                    seriesSpan.className = 'block text-xs text-gray-700';
                    seriesSpan.textContent = entry.series;
                    seriesDiv.appendChild(seriesSpan);

                    contentDiv.appendChild(seriesDiv);
                }

                if (Array.isArray(entry.links) && entry.links.length > 0) {
                    const linksSpan = document.createElement('span');
                    linksSpan.className = 'flex flex-row flex-wrap gap-2 mt-0.5';

                    entry.links.forEach(link => {
                        const linkElement = document.createElement('a');
                        linkElement.href = link.url;
                        linkElement.className = 'paper-link text-gray-500 text-xs';
                        linkElement.target = '_blank';
                        linkElement.rel = 'noopener';
                        linkElement.textContent = link.text;
                        linksSpan.appendChild(linkElement);
                    });

                    contentDiv.appendChild(linksSpan);
                }

                itemDiv.appendChild(contentDiv);
                container.appendChild(itemDiv);
            });
        } catch (error) {
            console.error('Error loading media:', error);
        }
    }

    async function loadReferences() {
        try {
            const references = await fetchJsonData('/data/references.json');
            const container = document.getElementById('references-container');

            references.forEach(entry => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'experience-item flex flex-col gap-0.25';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'font-semibold text-gray-900 mb-0.5 leading-tight';
                nameSpan.style.marginBottom = '0.1rem';
                nameSpan.textContent = entry.name;

                const titleSpan = document.createElement('span');
                titleSpan.className = 'text-xs text-gray-500';
                titleSpan.style.marginTop = '-0.25rem';
                titleSpan.style.display = 'block';
                titleSpan.textContent = entry.title;

                const affiliationSpan = document.createElement('span');
                affiliationSpan.className = 'text-xs text-gray-700';
                affiliationSpan.textContent = entry.affiliation;

                const linksSpan = document.createElement('span');
                linksSpan.className = 'flex flex-row flex-wrap gap-2 mt-0.5';

                if (entry.email) {
                    const emailLink = document.createElement('a');
                    emailLink.href = `mailto:${entry.email}`;
                    emailLink.className = 'paper-link text-gray-500 text-xs';
                    emailLink.textContent = 'Email';
                    linksSpan.appendChild(emailLink);
                }

                itemDiv.appendChild(nameSpan);
                itemDiv.appendChild(titleSpan);
                itemDiv.appendChild(affiliationSpan);
                itemDiv.appendChild(linksSpan);

                container.appendChild(itemDiv);
            });
        } catch (error) {
            console.error('Error loading references:', error);
        }
    }

    loadEducation();
    loadWorkExperience();
    loadResearchExperience();
    loadTeachingExperience();
    loadAwards();
    loadVolunteering();
    loadMedia();
    loadReferences();

    async function loadTalks() {
        try {
            const response = await fetch('/data/talks.json');
            const talks = await response.json();
            
            const container = document.getElementById('talks-container');
            
            talks.forEach((talk) => {
                const talkDiv = document.createElement('div');
                talkDiv.className = 'experience-item flex flex-col gap-0.25';

                const linksHtml = talk.links.map(link => 
                    `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`
                ).join('');
                
                talkDiv.innerHTML = `
                    <span class="font-semibold text-gray-900 mb-0.5 leading-tight" style="margin-bottom:0.1rem;">${talk.title}</span>
                    <span class="text-xs text-gray-500" style="margin-top:-0.25rem;">${talk.venue}</span>
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
    
    loadTalks();

    async function loadPapers() {
        try {
            const response = await fetch('/data/papers.json');
            const papers = await response.json();
            
            const container = document.getElementById('papers-container');
            
            papers.forEach((paper) => {
                const paperDiv = document.createElement('div');
                paperDiv.className = 'experience-item flex flex-col gap-0.25';

                const linksHtml = paper.links.map(link => {
                    if (link.italic) {
                        return `<span class="text-gray-500 text-xs italic">${link.text}</span>`;
                    } else {
                        return `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`;
                    }
                }).join('');
                
                const titleStyle = paper.title.includes("Don't Vibe, Plan") 
                    ? 'style="margin-bottom:0.1rem; filter: blur(3.5px);"' 
                    : 'style="margin-bottom:0.1rem;"';
                
                paperDiv.innerHTML = `
                    <span class="font-semibold text-gray-900 mb-0.5 leading-tight" ${titleStyle}>${paper.title}</span>
                    <span class="text-xs text-gray-500" style="margin-top:-0.25rem;">${paper.venue}</span>
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
    
    loadPapers();

    async function loadPresentations() {
        try {
            const response = await fetch('/data/presentations.json');
            const presentations = await response.json();
            
            const container = document.getElementById('presentations-container');
            
            presentations.forEach((presentation) => {
                const presentationDiv = document.createElement('div');
                presentationDiv.className = 'experience-item flex flex-col gap-0.25';

                const linksHtml = presentation.links.map(link => 
                    `<a href="${link.url}" class="paper-link text-gray-500 text-xs" target="_blank" rel="noopener">${link.text}</a>`
                ).join('');
                
                presentationDiv.innerHTML = `
                    <span class="font-semibold text-gray-900 mb-0.5 leading-tight" style="margin-bottom:0.1rem;">${presentation.title}</span>
                    <span class="text-xs text-gray-500" style="margin-top:-0.25rem;">${presentation.venue}</span>
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
    
    loadPresentations();

    async function loadArticles() {
        try {
            const response = await fetch('/data/articles.json');
            const articles = await response.json();
            
            const container = document.getElementById('articles-container');
            
            articles.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.className = 'experience-item flex flex-col gap-0.25';
                
                const titleSpan = document.createElement('span');
                titleSpan.className = 'font-semibold text-gray-900 mb-0.5 leading-tight';
                titleSpan.style.marginBottom = '0.1rem';
                titleSpan.textContent = article.title;
                
                const venueSpan = document.createElement('span');
                venueSpan.className = 'text-xs text-gray-500';
                venueSpan.style.marginTop = '-0.25rem';
                venueSpan.textContent = article.venue;
                
                const authorsSpan = document.createElement('span');
                authorsSpan.className = 'text-xs text-gray-700';
                authorsSpan.innerHTML = article.authors;
                
                const linksSpan = document.createElement('span');
                linksSpan.className = 'flex flex-row flex-wrap gap-2 mt-0.5';
                
                article.links.forEach(link => {
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.className = 'paper-link text-gray-500 text-xs';
                    linkElement.target = '_blank';
                    linkElement.rel = 'noopener';
                    linkElement.textContent = link.text;
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

    loadArticles();


    const companiesTrigger = document.querySelector('.companies-hover-trigger');
    const companiesDetail = document.querySelector('.companies-detail');
    
    if (companiesTrigger && companiesDetail) {
        let isTouch = false;
        
        companiesTrigger.addEventListener('touchstart', function() {
            isTouch = true;
        });
        
        companiesTrigger.addEventListener('mouseenter', function() {
            if (!isTouch) {
                companiesDetail.classList.add('show');
            }
        });
        
        companiesTrigger.addEventListener('mousemove', function(e) {
            if (!isTouch && companiesDetail.classList.contains('show')) {
                const rect = companiesTrigger.getBoundingClientRect();
                const x = e.clientX - rect.left + 15;
                const y = e.clientY - rect.top - 10;
                
                companiesDetail.style.left = x + 'px';
                companiesDetail.style.top = y + 'px';
            }
        });
        
        companiesTrigger.addEventListener('mouseleave', function() {
            if (!isTouch) {
                companiesDetail.classList.remove('show');
            }
        });
        
        companiesTrigger.addEventListener('click', function(e) {
            if (isTouch) {
                e.preventDefault();
                if (companiesDetail.classList.contains('show')) {
                    companiesDetail.classList.remove('show');
                } else {
                    companiesDetail.classList.add('show');
                    companiesDetail.style.left = '100%';
                    companiesDetail.style.top = '-50px';
                    companiesDetail.style.marginLeft = '10px';
                }
            }
        });
        
        document.addEventListener('click', function(e) {
            if (isTouch && !companiesTrigger.contains(e.target) && companiesDetail.classList.contains('show')) {
                companiesDetail.classList.remove('show');
            }
        });
    }

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
