document.addEventListener('DOMContentLoaded', function() {
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
    
    const items = document.querySelectorAll('.announcement-item');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageIndicator = document.getElementById('page-indicator');
    
    const itemsPerPage = 3;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    let currentPage = 1;
    
    function showPage(page) {
        items.forEach((item, index) => {
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            
            if (index >= startIndex && index < endIndex) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
        
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page === totalPages;
        pageIndicator.textContent = `${page} / ${totalPages}`;
    }
    
    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            showPage(currentPage);
        }
    });
    
    showPage(currentPage);
});