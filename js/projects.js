document.addEventListener('DOMContentLoaded', function() {
  let currentFilter = null;
  const filterInputs = document.querySelectorAll('.project-filter');
  let imageObserver;
  let scrollTimeout;

  initLazyLoading();

  const tags = document.querySelectorAll('.project-tag-inline');
  tags.forEach(tag => {
    tag.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const tagText = this.textContent.trim();

      if (currentFilter === tagText) {
        resetFilters();
      } else {
        applyFilter(tagText);
      }
    });
  });

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
    allProjects.forEach(project => {
      project.style.display = 'block';
    });

    reobserveImages();
  }

  function filterProjects(filterTag) {
    const allProjects = document.querySelectorAll('.project-link');

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

  showAllProjects();
  
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