document.addEventListener('DOMContentLoaded', function() {
  const projectsContainer = document.getElementById('projects-container');
  let imageObserver;
  let scrollTimeout;

  loadProjects();

  function parseDate(dateString) {
    if (!dateString) return 0;
    
    const monthMap = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
      'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };
    
    const parts = dateString.trim().split(/\s+/);
    if (parts.length < 2) return 0;
    
    const month = monthMap[parts[0]] || 0;

    // Handle full year (2025) or abbreviated ('25)
    let year = 0;
    const fullYearMatch = parts[1].match(/^(\d{4})$/);
    const shortYearMatch = parts[1].match(/'(\d{2})/);
    if (fullYearMatch) {
      year = parseInt(fullYearMatch[1], 10);
    } else if (shortYearMatch) {
      year = parseInt('20' + shortYearMatch[1], 10);
    } else {
      return 0;
    }
    
    return year * 100 + month;
  }

  function loadProjects() {
    if (!projectsContainer) return;

    fetch('/data/projects.json')
      .then(response => response.json())
      .then(data => {
        const projects = Array.isArray(data) ? data : [];
        renderProjects(projects);
        initLazyLoading();
      })
      .catch(error => {
        console.error('Error loading projects:', error);
      });
  }

  function renderProjects(projects) {
    projectsContainer.innerHTML = '';

    // Sort all projects by date (newest first), ignoring categories
    const sortedProjects = [...projects].sort((a, b) => {
      const dateA = parseDate(a.date || '');
      const dateB = parseDate(b.date || '');
      return dateB - dateA;
    });

    // Split projects: Oct 2023 (202310) and before are "undergraduate"
    const cutoff = 202310;
    const recentProjects = sortedProjects.filter(p => parseDate(p.date || '') > cutoff);
    const undergradProjects = sortedProjects.filter(p => parseDate(p.date || '') <= cutoff);

    // Create a single grid container for all projects
    const gridContainer = document.createElement('div');
    gridContainer.className = 'projects-grid';

    recentProjects.forEach(project => {
      const projectElement = createProjectElement(project);
      gridContainer.appendChild(projectElement);
    });

    // Add the toggle button as the last item in the recent projects grid
    if (undergradProjects.length > 0) {
      const toggleCard = document.createElement('div');
      toggleCard.className = 'undergrad-toggle-card';
      const toggleText = document.createElement('span');
      toggleText.textContent = 'View Undergraduate Work';
      toggleCard.appendChild(toggleText);

      toggleCard.addEventListener('click', function() {
        const undergradContainer = document.getElementById('undergrad-projects-grid');
        if (undergradContainer.style.display === 'none') {
          undergradContainer.style.display = '';
          toggleText.textContent = 'Hide Undergraduate Work';
        } else {
          undergradContainer.style.display = 'none';
          toggleText.textContent = 'View Undergraduate Work';
        }
      });

      gridContainer.appendChild(toggleCard);
    }

    projectsContainer.appendChild(gridContainer);

    // Create a separate hidden grid for undergraduate projects
    if (undergradProjects.length > 0) {
      const undergradGrid = document.createElement('div');
      undergradGrid.id = 'undergrad-projects-grid';
      undergradGrid.className = 'projects-grid';
      undergradGrid.style.display = 'none';
      undergradGrid.style.paddingTop = '0';

      undergradProjects.forEach(project => {
        const projectElement = createProjectElement(project);
        undergradGrid.appendChild(projectElement);
      });

      projectsContainer.appendChild(undergradGrid);
    }
  }


  function createProjectElement(project) {
    const projectLink = document.createElement('a');
    projectLink.className = 'project-link';
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

    const content = document.createElement('div');
    content.className = 'project-card-content';

    const titleRow = document.createElement('div');
    titleRow.className = 'font-semibold project-title';
    
    const titleText = document.createTextNode(project.title || '');
    titleRow.appendChild(titleText);

    const description = document.createElement('div');
    description.className = 'project-desc';
    description.textContent = project.description || '';

    const dateRow = document.createElement('div');
    dateRow.className = 'project-date-row';
    
    const category = document.createElement('span');
    category.className = 'project-category text-xs';
    category.textContent = project.category || '';
    
    const year = document.createElement('span');
    year.className = 'project-year text-xs';
    year.textContent = project.date || '';
    
    dateRow.appendChild(category);
    dateRow.appendChild(year);

    content.appendChild(titleRow);
    content.appendChild(description);
    content.appendChild(dateRow);

    layout.appendChild(image);
    layout.appendChild(content);
    projectLink.appendChild(layout);

    return projectLink;
  }

  const navToggle = document.getElementById('nav-toggle');
  const navDropdown = document.getElementById('nav-dropdown');
  const navArrow = document.querySelector('.nav-arrow');
  
  if (navToggle && navDropdown && navArrow) {
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
