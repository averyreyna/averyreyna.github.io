document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navDropdown = document.getElementById('nav-dropdown');
    
    navToggle.addEventListener('click', function() {
        navDropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navDropdown.contains(event.target)) {
            navDropdown.classList.add('hidden');
        }
    });
});