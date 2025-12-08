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

    async function loadResources() {
        try {
            const response = await fetch('/data/resources.json');
            const resourcesData = await response.json();
            const container = document.getElementById('resources-container');
            
            resourcesData.forEach((section, sectionIndex) => {
                // Create section heading
                const headingDiv = document.createElement('div');
                headingDiv.className = 'research-heading';
                
                const headingSpan = document.createElement('span');
                headingSpan.className = 'section-heading-semi-mono';
                headingSpan.textContent = section.section;
                
                const lineSpan = document.createElement('span');
                lineSpan.className = 'research-heading-line';
                
                headingDiv.appendChild(headingSpan);
                headingDiv.appendChild(lineSpan);
                container.appendChild(headingDiv);
                
                // Create subsections container
                const subsectionsContainer = document.createElement('div');
                subsectionsContainer.className = 'cv-entry-spacing';
                
                // Add margin bottom based on section
                if (sectionIndex === resourcesData.length - 1) {
                    subsectionsContainer.classList.add('mb-4');
                } else {
                    subsectionsContainer.classList.add('mb-4');
                }
                
                section.subsections.forEach((subsection, subsectionIndex) => {
                    const subsectionDiv = document.createElement('div');
                    subsectionDiv.className = 'block';
                    // Add spacing between subsections to match CV entry spacing
                    // Each subsection gets a small margin-bottom except the last one
                    if (subsectionIndex < section.subsections.length - 1) {
                        subsectionDiv.style.marginBottom = '0.25rem';
                    }
                    
                    // Title
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'font-semibold text-gray-900 leading-tight';
                    titleDiv.textContent = subsection.title;
                    subsectionDiv.appendChild(titleDiv);
                    
                    // Date
                    const dateDiv = document.createElement('div');
                    dateDiv.className = 'text-xs text-gray-500';
                    dateDiv.textContent = subsection.date;
                    subsectionDiv.appendChild(dateDiv);
                    
                    // Resources
                    // For "Resumés", wrap each resource separately; for others, wrap all together
                    const isResumes = subsection.title === 'Resumés';
                    
                    if (isResumes) {
                        // Each resource in its own wrapper (matching original structure)
                        subsection.resources.forEach((resource) => {
                            const resourceLink = document.createElement('a');
                            resourceLink.href = resource.url;
                            resourceLink.className = 'resource-link flex items-center justify-between text-gray-500 text-xs hover:text-gray-700 transition-colors';
                            resourceLink.target = '_blank';
                            resourceLink.rel = 'noopener';
                            
                            const nameSpan = document.createElement('span');
                            nameSpan.textContent = resource.name;
                            
                            const arrowSpan = document.createElement('span');
                            arrowSpan.textContent = '→';
                            
                            resourceLink.appendChild(nameSpan);
                            resourceLink.appendChild(arrowSpan);
                            
                            const resourceWrapper = document.createElement('div');
                            resourceWrapper.className = 'flex flex-col';
                            resourceWrapper.style.gap = '0.05rem';
                            resourceWrapper.appendChild(resourceLink);
                            
                            subsectionDiv.appendChild(resourceWrapper);
                        });
                    } else {
                        // All resources in one wrapper (matching original structure for other subsections)
                        const resourcesWrapper = document.createElement('div');
                        resourcesWrapper.className = 'flex flex-col';
                        resourcesWrapper.style.gap = '0.05rem';
                        
                        subsection.resources.forEach((resource) => {
                            const resourceLink = document.createElement('a');
                            resourceLink.href = resource.url;
                            resourceLink.className = 'resource-link flex items-center justify-between text-gray-500 text-xs hover:text-gray-700 transition-colors';
                            resourceLink.target = '_blank';
                            resourceLink.rel = 'noopener';
                            
                            const nameSpan = document.createElement('span');
                            nameSpan.textContent = resource.name;
                            
                            const arrowSpan = document.createElement('span');
                            arrowSpan.textContent = '→';
                            
                            resourceLink.appendChild(nameSpan);
                            resourceLink.appendChild(arrowSpan);
                            
                            resourcesWrapper.appendChild(resourceLink);
                        });
                        
                        subsectionDiv.appendChild(resourcesWrapper);
                    }
                    
                    subsectionsContainer.appendChild(subsectionDiv);
                });
                
                container.appendChild(subsectionsContainer);
            });
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    }
    
    loadResources();
});