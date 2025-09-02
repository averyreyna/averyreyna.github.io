document.addEventListener('DOMContentLoaded', function() {
  let currentFilter = null;
  const clearButtons = document.querySelectorAll('.clear-filter-btn');
  
  const tags = document.querySelectorAll('.project-tag');
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
  }
  
  function filterProjects(filterTag) {
    const allProjects = document.querySelectorAll('.project-link');
    
    allProjects.forEach(project => {
      const projectTag = project.querySelector('.project-tag');
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
  }
  
  function setActiveState(clickedTag) {
    const allTags = document.querySelectorAll('.project-tag');
    allTags.forEach(tag => tag.classList.remove('active'));
    clickedTag.classList.add('active');
  }
  
  function clearActiveStates() {
    const allTags = document.querySelectorAll('.project-tag');
    allTags.forEach(tag => tag.classList.remove('active'));
  }
  
  function updateClearButtonColor(activeTag) {
    const color = activeTag.style.color;
    clearButtons.forEach(button => {
      button.style.color = color;
      button.style.borderColor = color;
      button.style.backgroundColor = 'transparent';
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
  
  function createMobileTags() {
    document.querySelectorAll('.mobile-tag').forEach(tag => tag.remove());
    document.querySelectorAll('.mobile-year-container').forEach(container => container.remove());
    
    if (window.innerWidth <= 768) {
      const projectLinks = document.querySelectorAll('.project-link');
      projectLinks.forEach(link => {
        const originalTag = link.querySelector('.project-tag');
        const titleContainer = link.querySelector('.flex.items-center.justify-between');
        const yearElement = link.querySelector('.project-year');
        const flexRow = link.querySelector('.flex.flex-row');
        
        if (originalTag && titleContainer) {
          // Create mobile tag next to title
          const mobileTag = originalTag.cloneNode(true);
          mobileTag.classList.remove('project-tag');
          mobileTag.classList.add('mobile-tag');
          mobileTag.style.color = originalTag.style.color;
          mobileTag.style.borderColor = originalTag.style.borderColor;
          titleContainer.appendChild(mobileTag);
          
          mobileTag.addEventListener('click', function(e) {
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
              setActiveState(originalTag);
              updateClearButtonColor(originalTag);
              showClearButtonInVisibleSections();
            }
          });
        }
        
        if (yearElement && flexRow) {
          // Create mobile year container at the bottom
          const mobileYearContainer = document.createElement('div');
          mobileYearContainer.classList.add('mobile-year-container');
          mobileYearContainer.appendChild(yearElement.cloneNode(true));
          flexRow.appendChild(mobileYearContainer);
        }
      });
    }
  }
  
  function transformProjectsLayout() {
    if (window.innerWidth > 768) {
      const projectLinks = document.querySelectorAll('.project-link');
      projectLinks.forEach(link => {
        if (link.dataset.transformed) return;
        
        const contentDiv = link.querySelector('div > div:not(.flex-1)');
        if (contentDiv && !contentDiv.classList.contains('flex-1')) {
          const titleDiv = contentDiv.querySelector('.project-title');
          const descDiv = contentDiv.querySelector('.project-desc');
          const yearDiv = contentDiv.querySelector('.project-year');
          
          if (titleDiv && descDiv && yearDiv) {
            contentDiv.classList.add('flex-1');
            
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'flex items-center justify-between';
            
            contentDiv.insertBefore(titleWrapper, descDiv);
            titleWrapper.appendChild(titleDiv);
            titleWrapper.appendChild(yearDiv);
            
            link.dataset.transformed = 'true';
          }
        }
      });
    }
  }
  
  showAllProjects();
  transformProjectsLayout();
  createMobileTags();
  
  window.addEventListener('resize', function() {
    document.querySelectorAll('.project-link').forEach(link => {
      delete link.dataset.transformed;
    });
    createMobileTags();
    transformProjectsLayout();
  });
  
  const menuToggle = document.getElementById('menu-toggle');
  const menuDropdown = document.getElementById('menu-dropdown');
  
  menuToggle.addEventListener('click', function() {
    menuDropdown.classList.toggle('hidden');
  });
  
  document.addEventListener('click', function(event) {
    if (!menuToggle.contains(event.target) && !menuDropdown.contains(event.target)) {
      menuDropdown.classList.add('hidden');
    }
  });
});