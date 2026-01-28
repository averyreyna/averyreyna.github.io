document.addEventListener('DOMContentLoaded', function() {
  const projectsContainer = document.getElementById('projects-container');
  let imageObserver;
  let scrollTimeout;
  let projectsData = [];

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
    const yearMatch = parts[1].match(/'(\d{2})/);
    if (!yearMatch) return 0;
    
    const year = parseInt('20' + yearMatch[1], 10);
    return year * 100 + month;
  }

  function loadProjects() {
    if (!projectsContainer) return;

    fetch('/data/projects.json')
      .then(response => response.json())
      .then(data => {
        projectsData = Array.isArray(data) ? data : [];
        renderProjects(projectsData);
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

    // Create a single grid container for all projects
    const gridContainer = document.createElement('div');
    gridContainer.className = 'projects-grid';

    sortedProjects.forEach(project => {
      const projectElement = createProjectElement(project);
      gridContainer.appendChild(projectElement);
    });

    projectsContainer.appendChild(gridContainer);
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
    applyImageHover(image, isIndustryUnavailable);

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

  function applyImageHover(image, isIndustryUnavailable) {
    // No hover effects needed - images display in full color
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
