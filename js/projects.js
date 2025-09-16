document.addEventListener('DOMContentLoaded', function() {
  let currentFilter = null;
  const clearButtons = document.querySelectorAll('.clear-filter-btn');
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
        currentFilter = null;
        showAllProjects();
        clearActiveStates();
        resetClearButtonColor();
        hideAllClearButtons();
      } else {
        currentFilter = tagText;
        filterProjects(tagText);
        setActiveState(this);
        updateClearButtonColor(this);
        showClearButtonInVisibleSections();
      }
    });
  });
  
  clearButtons.forEach(button => {
    button.addEventListener('click', function() {
      currentFilter = null;
      showAllProjects();
      clearActiveStates();
      resetClearButtonColor();
      hideAllClearButtons();
    });
  });
  
  function showAllProjects() {
    const allProjects = document.querySelectorAll('.project-link');
    allProjects.forEach(project => {
      project.style.display = 'block';
    });
    
    const yearSections = document.querySelectorAll('.flex.flex-col.gap-6 > div');
    yearSections.forEach(section => {
      section.style.display = 'block';
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
    
    const yearSections = document.querySelectorAll('.flex.flex-col.gap-6 > div');
    yearSections.forEach(section => {
      const visibleProjects = section.querySelectorAll('.project-link[style*="block"]:not([style*="none"])');
      const hiddenProjects = section.querySelectorAll('.project-link[style*="none"]');
      const totalProjects = section.querySelectorAll('.project-link');
      
      if (totalProjects.length > 0 && hiddenProjects.length === totalProjects.length) {
        section.style.display = 'none';
      } else {
        section.style.display = 'block';
      }
    });
    
    reobserveImages();
  }
  
  function setActiveState(clickedTag) {
    const allTags = document.querySelectorAll('.project-tag-inline');
    allTags.forEach(tag => tag.classList.remove('active'));
    clickedTag.classList.add('active');
  }
  
  function clearActiveStates() {
    const allTags = document.querySelectorAll('.project-tag-inline');
    allTags.forEach(tag => tag.classList.remove('active'));
  }
  
  function updateClearButtonColor(activeTag) {
    const color = activeTag.style.color;
    clearButtons.forEach(button => {
      button.style.color = '';
      button.style.borderColor = '';
      button.style.backgroundColor = '';
    });
  }
  
  function resetClearButtonColor() {
    clearButtons.forEach(button => {
      button.style.color = '';
      button.style.borderColor = '';
      button.style.backgroundColor = '';
    });
  }
  
  function hideAllClearButtons() {
    clearButtons.forEach(button => {
      button.style.display = 'none';
    });
  }
  
  function showClearButtonInVisibleSections() {
    hideAllClearButtons();
    const yearSections = document.querySelectorAll('.flex.flex-col.gap-6 > div');
    
    for (let section of yearSections) {
      if (section.style.display !== 'none') {
        const clearButton = section.querySelector('.clear-filter-btn');
        if (clearButton) {
          clearButton.style.setProperty('display', 'inline-flex', 'important');
          break;
        }
      }
    }
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