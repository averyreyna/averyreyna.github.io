document.addEventListener('DOMContentLoaded', function() {
  const projectsContainer = document.getElementById('projects-container');
  let imageObserver;
  let scrollTimeout;
  let projectsData = [];

  loadProjects();

  function parseDate(dateString) {
    // Parse date strings like "Sep '25", "May '25", "Apr '24", "Mar '21"
    if (!dateString) return 0;
    
    const monthMap = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };
    
    const parts = dateString.trim().split(/\s+/);
    if (parts.length < 2) return 0;
    
    const month = monthMap[parts[0]] || 0;
    const yearMatch = parts[1].match(/'(\d{2})/);
    if (!yearMatch) return 0;
    
    const year = parseInt('20' + yearMatch[1], 10);
    return year * 100 + month; // Returns YYYYMM format for easy comparison
  }

  function loadProjects() {
    if (!projectsContainer) return;

    fetch('/data/projects.json')
      .then(response => response.json())
      .then(data => {
        projectsData = Array.isArray(data) ? data : [];
        renderProjects(projectsData);
        initLazyLoading();
        initializeScrollControls();
      })
      .catch(error => {
        console.error('Error loading projects:', error);
      });
  }

  function renderProjects(projects) {
    projectsContainer.innerHTML = '';

    // Group projects by category
    const projectsByCategory = {};
    projects.forEach(project => {
      const category = project.category || 'Other';
      if (!projectsByCategory[category]) {
        projectsByCategory[category] = [];
      }
      projectsByCategory[category].push(project);
    });

    // Sort categories alphabetically
    const sortedCategories = Object.keys(projectsByCategory).sort();

    // Render each category section
    sortedCategories.forEach(category => {
      // Sort projects within category by date (reverse chronological - newest first)
      const categoryProjects = projectsByCategory[category].sort((a, b) => {
        const dateA = parseDate(a.date || '');
        const dateB = parseDate(b.date || '');
        return dateB - dateA; // Reverse chronological (newest first)
      });

      const categorySection = createCategorySection(category, categoryProjects);
      projectsContainer.appendChild(categorySection);
    });
  }

  function createCategorySection(category, projects) {
    const section = document.createElement('div');
    section.className = 'project-category-section mb-2';

    // Category heading
    const heading = document.createElement('div');
    heading.className = 'research-heading mb-1';
    const headingText = document.createElement('span');
    headingText.className = 'section-heading-semi-mono';
    headingText.textContent = category;
    heading.appendChild(headingText);
    section.appendChild(heading);

    // Scrollable container wrapper
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'project-scroll-wrapper relative';

    // Scrollable container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'project-scroll-container';
    scrollContainer.setAttribute('data-category', category);

    // Navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'project-scroll-btn project-scroll-btn-prev';
    prevBtn.innerHTML = '←';
    prevBtn.setAttribute('aria-label', 'Scroll left');
    prevBtn.addEventListener('click', () => scrollCategory(category, -1));

    const nextBtn = document.createElement('button');
    nextBtn.className = 'project-scroll-btn project-scroll-btn-next';
    nextBtn.innerHTML = '→';
    nextBtn.setAttribute('aria-label', 'Scroll right');
    nextBtn.addEventListener('click', () => scrollCategory(category, 1));

    // Render projects
    projects.forEach(project => {
      const projectElement = createProjectElement(project);
      scrollContainer.appendChild(projectElement);
    });

    scrollWrapper.appendChild(prevBtn);
    scrollWrapper.appendChild(scrollContainer);
    scrollWrapper.appendChild(nextBtn);
    section.appendChild(scrollWrapper);

    return section;
  }

  function scrollCategory(category, direction) {
    const container = document.querySelector(`.project-scroll-container[data-category="${category}"]`);
    if (!container) return;

    const scrollAmount = 300; // pixels to scroll
    const currentScroll = container.scrollLeft;
    const newScroll = currentScroll + (scrollAmount * direction);
    
    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });

    // Update arrow states after scroll
    setTimeout(() => updateScrollButtons(category), 100);
  }

  function updateScrollButtons(category) {
    const container = document.querySelector(`.project-scroll-container[data-category="${category}"]`);
    if (!container) return;

    const prevBtn = container.parentElement.querySelector('.project-scroll-btn-prev');
    const nextBtn = container.parentElement.querySelector('.project-scroll-btn-next');

    const hasOverflow = container.scrollWidth > container.clientWidth;
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 10;

    if (prevBtn) {
      prevBtn.disabled = !hasOverflow || isAtStart;
      prevBtn.classList.toggle('disabled', !hasOverflow || isAtStart);
    }
    if (nextBtn) {
      nextBtn.disabled = !hasOverflow || isAtEnd;
      nextBtn.classList.toggle('disabled', !hasOverflow || isAtEnd);
    }
  }

  function initializeScrollControls() {
    const containers = document.querySelectorAll('.project-scroll-container');
    containers.forEach(container => {
      const category = container.getAttribute('data-category');
      
      // Update buttons on scroll
      container.addEventListener('scroll', () => {
        updateScrollButtons(category);
      });

      // Initial button state - delay to ensure layout has settled
      setTimeout(() => {
        updateScrollButtons(category);
      }, 100);
    });
  }

  function createProjectElement(project) {
    const projectLink = document.createElement('a');
    projectLink.className = 'project-link project-card-item';
    projectLink.href = project.link || '#';

    if (project.openInNewTab) {
      projectLink.target = '_blank';
      projectLink.rel = 'noopener';
    }

    const isIndustryUnavailable = project.category === 'Industry' && project.unavailable;
    if (isIndustryUnavailable) {
      projectLink.classList.add('industry-project');
    }

    const layout = document.createElement('div');
    layout.className = 'project-card-layout';

    const image = document.createElement('img');
    image.className = 'project-image lazy-load';
    image.setAttribute('data-src', project.image || '');
    image.setAttribute('loading', 'lazy');
    image.setAttribute('alt', project.title || 'Project image');
    applyImageHover(image, isIndustryUnavailable);

    const content = document.createElement('div');
    content.className = 'project-card-content';

    const titleRow = document.createElement('div');
    titleRow.className = 'font-semibold project-title';
    
    const titleText = document.createTextNode(project.title || '');
    titleRow.appendChild(titleText);
    
    // Add "New!" badge for Palestra project
    if (project.title === 'Palestra') {
      const newBadge = document.createElement('span');
      newBadge.className = 'project-new-badge';
      newBadge.textContent = 'New!';
      titleRow.appendChild(newBadge);
    }

    const description = document.createElement('div');
    description.className = 'project-desc';
    description.textContent = project.description || '';

    const year = document.createElement('div');
    year.className = 'project-year text-xs';
    year.textContent = project.date || '';

    content.appendChild(titleRow);
    content.appendChild(description);
    content.appendChild(year);

    layout.appendChild(image);
    layout.appendChild(content);
    projectLink.appendChild(layout);

    return projectLink;
  }

  function applyImageHover(image, isIndustryUnavailable) {
    if (isIndustryUnavailable) {
      image.addEventListener('mouseover', () => {
        image.style.filter = 'grayscale(0) blur(1px)';
      });
      image.addEventListener('mouseout', () => {
        image.style.filter = 'grayscale(1) blur(1px)';
      });
      return;
    }

    image.addEventListener('mouseover', () => {
      image.style.filter = 'grayscale(0)';
    });
    image.addEventListener('mouseout', () => {
      image.style.filter = 'grayscale(1)';
    });
  }
  
  const navToggle = document.getElementById('nav-toggle');
  const navDropdown = document.getElementById('nav-dropdown');
  const navArrow = document.querySelector('.nav-arrow');
  
  if (navToggle && navDropdown && navArrow) {
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
  }
  
  function initLazyLoading() {
    if (imageObserver && typeof imageObserver.disconnect === 'function') {
      imageObserver.disconnect();
    }

    if ('IntersectionObserver' in window) {
      imageObserver = new IntersectionObserver((entries, observer) => {
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
    
    preloadCriticalImages();
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
  
  function preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('.lazy-load');
    const imagesToPreload = Array.from(criticalImages).slice(0, 3);
    
    imagesToPreload.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        const imageLoader = new Image();
        imageLoader.onload = function() {
          img.src = src;
          img.classList.remove('lazy-load');
          img.classList.add('loaded');
        };
        imageLoader.src = src;
      }
    });
  }
  
  function handleScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (imageObserver) {
        const lazyImages = document.querySelectorAll('.lazy-load');
        lazyImages.forEach(img => {
          if (!img.src) {
            imageObserver.observe(img);
          }
        });
      }
    }, 100);
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
});
