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

    // Companies hover effect with cursor following
    const companiesTrigger = document.querySelector('.companies-hover-trigger');
    const companiesDetail = document.querySelector('.companies-detail');
    
    if (companiesTrigger && companiesDetail) {
        let isTouch = false;
        
        // Detect touch devices
        companiesTrigger.addEventListener('touchstart', function() {
            isTouch = true;
        });
        
        // Desktop hover behavior with cursor following
        companiesTrigger.addEventListener('mouseenter', function() {
            if (!isTouch) {
                companiesDetail.classList.add('show');
            }
        });
        
        companiesTrigger.addEventListener('mousemove', function(e) {
            if (!isTouch && companiesDetail.classList.contains('show')) {
                const rect = companiesTrigger.getBoundingClientRect();
                const x = e.clientX - rect.left + 15; // 15px offset to the right
                const y = e.clientY - rect.top - 10; // 10px offset above cursor
                
                companiesDetail.style.left = x + 'px';
                companiesDetail.style.top = y + 'px';
            }
        });
        
        companiesTrigger.addEventListener('mouseleave', function() {
            if (!isTouch) {
                companiesDetail.classList.remove('show');
            }
        });
        
        // Mobile tap behavior
        companiesTrigger.addEventListener('click', function(e) {
            if (isTouch) {
                e.preventDefault();
                if (companiesDetail.classList.contains('show')) {
                    companiesDetail.classList.remove('show');
                } else {
                    companiesDetail.classList.add('show');
                    // Position at a fixed location for mobile
                    companiesDetail.style.left = '100%';
                    companiesDetail.style.top = '-50px';
                    companiesDetail.style.marginLeft = '10px';
                }
            }
        });
        
        // Close on outside tap for mobile
        document.addEventListener('click', function(e) {
            if (isTouch && !companiesTrigger.contains(e.target) && companiesDetail.classList.contains('show')) {
                companiesDetail.classList.remove('show');
            }
        });
    }

    // XR Access hover effect with cursor following
    const xrAccessTrigger = document.querySelector('.xr-access-hover-trigger');
    const xrAccessDetail = document.querySelector('.xr-access-detail');
    
    if (xrAccessTrigger && xrAccessDetail) {
        let isTouch = false;
        
        xrAccessTrigger.addEventListener('touchstart', function() {
            isTouch = true;
        });
        
        xrAccessTrigger.addEventListener('mouseenter', function() {
            if (!isTouch) {
                xrAccessDetail.classList.add('show');
            }
        });
        
        xrAccessTrigger.addEventListener('mousemove', function(e) {
            if (!isTouch && xrAccessDetail.classList.contains('show')) {
                const rect = xrAccessTrigger.getBoundingClientRect();
                const x = e.clientX - rect.left + 15;
                const y = e.clientY - rect.top - 10;
                
                xrAccessDetail.style.left = x + 'px';
                xrAccessDetail.style.top = y + 'px';
            }
        });
        
        xrAccessTrigger.addEventListener('mouseleave', function() {
            if (!isTouch) {
                xrAccessDetail.classList.remove('show');
            }
        });
        
        xrAccessTrigger.addEventListener('click', function(e) {
            if (isTouch) {
                e.preventDefault();
                if (xrAccessDetail.classList.contains('show')) {
                    xrAccessDetail.classList.remove('show');
                } else {
                    xrAccessDetail.classList.add('show');
                    xrAccessDetail.style.left = '100%';
                    xrAccessDetail.style.top = '-50px';
                    xrAccessDetail.style.marginLeft = '10px';
                }
            }
        });
        
        document.addEventListener('click', function(e) {
            if (isTouch && !xrAccessTrigger.contains(e.target) && xrAccessDetail.classList.contains('show')) {
                xrAccessDetail.classList.remove('show');
            }
        });
    }

    // UW Tacoma hover effect with cursor following
    const uwTacomaTrigger = document.querySelector('.uw-tacoma-hover-trigger');
    const uwTacomaDetail = document.querySelector('.uw-tacoma-detail');
    
    if (uwTacomaTrigger && uwTacomaDetail) {
        let isTouch = false;
        
        uwTacomaTrigger.addEventListener('touchstart', function() {
            isTouch = true;
        });
        
        uwTacomaTrigger.addEventListener('mouseenter', function() {
            if (!isTouch) {
                uwTacomaDetail.classList.add('show');
            }
        });
        
        uwTacomaTrigger.addEventListener('mousemove', function(e) {
            if (!isTouch && uwTacomaDetail.classList.contains('show')) {
                const rect = uwTacomaTrigger.getBoundingClientRect();
                const x = e.clientX - rect.left + 15;
                const y = e.clientY - rect.top - 10;
                
                uwTacomaDetail.style.left = x + 'px';
                uwTacomaDetail.style.top = y + 'px';
            }
        });
        
        uwTacomaTrigger.addEventListener('mouseleave', function() {
            if (!isTouch) {
                uwTacomaDetail.classList.remove('show');
            }
        });
        
        uwTacomaTrigger.addEventListener('click', function(e) {
            if (isTouch) {
                e.preventDefault();
                if (uwTacomaDetail.classList.contains('show')) {
                    uwTacomaDetail.classList.remove('show');
                } else {
                    uwTacomaDetail.classList.add('show');
                    uwTacomaDetail.style.left = '100%';
                    uwTacomaDetail.style.top = '-50px';
                    uwTacomaDetail.style.marginLeft = '10px';
                }
            }
        });
        
        document.addEventListener('click', function(e) {
            if (isTouch && !uwTacomaTrigger.contains(e.target) && uwTacomaDetail.classList.contains('show')) {
                uwTacomaDetail.classList.remove('show');
            }
        });
    }
});