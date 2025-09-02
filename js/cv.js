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
        'BallotReady',
        'The COVID-19 Tracking Project',
        'Council on Foreign Relations',
        'The Hub Project',
        'Swing Left',
        'New America',
        'ActBlue'
    ];
    
    let currentCompanyIndex = Math.floor(Math.random() * companies.length);
    const companyNameElement = document.getElementById('company-name');
    const cycleButton = document.getElementById('cycle-company-btn');
    
    if (cycleButton && companyNameElement) {
        companyNameElement.textContent = companies[currentCompanyIndex];
        
        cycleButton.addEventListener('click', function() {
            currentCompanyIndex = (currentCompanyIndex + 1) % companies.length;
            companyNameElement.textContent = companies[currentCompanyIndex];
        });
    }
});