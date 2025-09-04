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

    const companies = [
        'Prince Mohammad Bin Fahd Program',
        'UNA-Orlando',
        'Progressive Turnout Project',
        'Main Street One',
        'BallotReady',
        'The COVID-19 Tracking Project',
        'Council on Foreign Relations',
        'The Hub Project',
        'Swing Left',
        'New America',
        'ActBlue',
        'KRC Research'
    ];
    
    let currentCompanyIndex = Math.floor(Math.random() * companies.length);
    const companyNameElement = document.getElementById('company-name');
    const prevIcon = document.getElementById('prev-company');
    const nextIcon = document.getElementById('next-company');
    
    if (companyNameElement && prevIcon && nextIcon) {
        updateCompanyDisplay();
        
        prevIcon.addEventListener('click', function() {
            currentCompanyIndex = (currentCompanyIndex - 1 + companies.length) % companies.length;
            updateCompanyDisplay();
        });
        
        nextIcon.addEventListener('click', function() {
            currentCompanyIndex = (currentCompanyIndex + 1) % companies.length;
            updateCompanyDisplay();
        });
    }
    
    function updateCompanyDisplay() {
        if (companyNameElement) {
            companyNameElement.textContent = companies[currentCompanyIndex];
        }
    }
});