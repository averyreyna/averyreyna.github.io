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
});