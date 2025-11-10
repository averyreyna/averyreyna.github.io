document.addEventListener('DOMContentLoaded', function() {
  let currentFilter = null;
  const filterInputs = document.querySelectorAll('.project-filter');
  const projectsContainer = document.getElementById('projects-container');
  let imageObserver;
  let scrollTimeout;
  let projectsData = [];

  filterInputs.forEach(input => {
    input.addEventListener('change', function() {
      if (this.checked) {
        filterInputs.forEach(other => {
          if (other !== this) {
            other.checked = false;
          }
        });
        applyFilter(this.dataset.filter?.trim());
      } else {
        resetFilters();
      }
    });
  });

  loadProjects();

  function loadProjects() {
    if (!projectsContainer) return;

    fetch('/data/projects.json')
      .then(response => response.json())
      .then(data => {
        projectsData = Array.isArray(data) ? data : [];
        renderProjects(projectsData);
        initLazyLoading();
        resetFilters();
      })
      .catch(error => {
        console.error('Error loading projects:', error);
      });
  }

  function renderProjects(projects) {
    projectsContainer.innerHTML = '';

    projects.forEach(project => {
      const projectElement = createProjectElement(project);
      projectsContainer.appendChild(projectElement);
    });
  }

  function createProjectElement(project) {
    const projectLink = document.createElement('a');
    projectLink.className = 'block project-link';
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
    layout.className = 'flex flex-row gap-5 items-center';

    const image = document.createElement('img');
    image.className = 'project-image lazy-load';
    image.setAttribute('data-src', project.image || '');
    image.setAttribute('loading', 'lazy');
    image.setAttribute('alt', project.title || 'Project image');
    applyImageHover(image, isIndustryUnavailable);

    const content = document.createElement('div');
    content.className = 'flex-1';

    const titleRow = document.createElement('div');
    titleRow.className = 'font-semibold project-title flex items-center';
    titleRow.textContent = project.title || '';

    const tag = document.createElement('span');
    tag.className = 'project-tag-inline';
    tag.textContent = project.category || '';
    titleRow.appendChild(tag);

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

  function applyFilter(filterTag) {
    if (!filterTag) return;

    currentFilter = filterTag;
    filterProjects(filterTag);
    setActiveState(filterTag);
    updateFilterInputs(filterTag);
  }

  function resetFilters() {
    currentFilter = null;
    showAllProjects();
    clearActiveStates();
    resetFilterInputs();
  }

  function showAllProjects() {
    const allProjects = document.querySelectorAll('.project-link');
    if (!allProjects.length) return;

    allProjects.forEach(project => {
      project.style.display = 'block';
    });

    reobserveImages();
  }

  function filterProjects(filterTag) {
    const allProjects = document.querySelectorAll('.project-link');
    if (!allProjects.length) return;

    allProjects.forEach(project => {
      const projectTag = project.querySelector('.project-tag-inline');
      if (projectTag && projectTag.textContent.trim() === filterTag) {
        project.style.display = 'block';
      } else {
        project.style.display = 'none';
      }
    });

    reobserveImages();
  }

  function setActiveState(filterTag) {
    const allTags = document.querySelectorAll('.project-tag-inline');
    allTags.forEach(tag => {
      if (tag.textContent.trim() === filterTag) {
        tag.classList.add('active');
      } else {
        tag.classList.remove('active');
      }
    });
  }

  function clearActiveStates() {
    const allTags = document.querySelectorAll('.project-tag-inline');
    allTags.forEach(tag => tag.classList.remove('active'));
  }

  function updateFilterInputs(filterTag) {
    filterInputs.forEach(input => {
      input.checked = input.dataset.filter?.trim() === filterTag;
    });
  }

  function resetFilterInputs() {
    filterInputs.forEach(input => {
      input.checked = false;
    });
  }
  
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
  
  function reobserveImages() {
    if (imageObserver) {
      const currentImages = document.querySelectorAll('.lazy-load');
      currentImages.forEach(img => imageObserver.unobserve(img));
      
      const visibleImages = document.querySelectorAll('.project-link[style*="block"]:not([style*="none"]) .lazy-load');
      visibleImages.forEach(img => {
        if (!img.src) {
          imageObserver.observe(img);
        }
      });
    }
  }
});