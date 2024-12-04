document.addEventListener('DOMContentLoaded', function () {
    const navigationMenu = document.querySelector('#navigation ul.main-menu');
    const openMenuButton = document.querySelector('#open-menu');
    let isMenuOpen = false;

    // Toggle main mobile menu
    function toggleMainMenu(forceClose = false) {
        isMenuOpen = forceClose ? false : !isMenuOpen;
        navigationMenu.style.display = isMenuOpen ? 'block' : 'none';
        openMenuButton.setAttribute('aria-expanded', isMenuOpen);

        if (!isMenuOpen) {
            // Close all dropdowns when closing main menu
            closeAllDropdowns();
        }
    }

    // Close all dropdown menus
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown.open, .sub-dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
        });
        document.querySelectorAll('.dropdown-arrow.rotated').forEach(arrow => {
            arrow.classList.remove('rotated');
        });
        document.querySelectorAll('[aria-expanded="true"]').forEach(element => {
            element.setAttribute('aria-expanded', 'false');
        });
    }

    // Toggle specific dropdown
    function toggleDropdown(dropdownElement, arrowElement, event) {
        event.preventDefault();
        event.stopPropagation();

        // Find the closest parent li and its dropdown
        const parentLi = arrowElement.closest('li');
        const dropdown = parentLi.querySelector('.dropdown, .sub-dropdown');

        if (dropdown) {
            // Close sibling dropdowns at the same level
            const parentUl = parentLi.parentElement;
            parentUl.querySelectorAll('.dropdown, .sub-dropdown').forEach(d => {
                if (d !== dropdown && d.classList.contains('open')) {
                    d.classList.remove('open');
                    const siblingHeader = d.parentElement.querySelector('.menu-item-header');
                    const siblingArrow = siblingHeader?.querySelector('.dropdown-arrow');
                    const siblingLink = siblingHeader?.querySelector('a');
                    
                    if (siblingArrow) {
                        siblingArrow.classList.remove('rotated');
                    }
                    if (siblingLink) {
                        siblingLink.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            // Toggle current dropdown
            const isOpen = dropdown.classList.toggle('open');
            arrowElement.classList.toggle('rotated', isOpen);

            // Update ARIA attributes
            const associatedLink = arrowElement.previousElementSibling;
            if (associatedLink) {
                associatedLink.setAttribute('aria-expanded', isOpen);
            }
        }
    }

    // Main menu toggle button
    openMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMainMenu();
    });

    // Dropdown arrow buttons
    document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            toggleDropdown(null, arrow, e);
        });
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const width = window.innerWidth;
            if (width >= 1010) {
                navigationMenu.style.display = 'flex';
                closeAllDropdowns();
                isMenuOpen = false;
            } else {
                navigationMenu.style.display = isMenuOpen ? 'block' : 'none';
            }
        }, 150);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1010) {
            const isClickInsideMenu = e.target.closest('.navigation-container');
            if (!isClickInsideMenu) {
                toggleMainMenu(true);
            }
        }
    });

    // Prevent menu item clicks from bubbling
    navigationMenu.addEventListener('click', (e) => {
        const isLink = e.target.tagName === 'A';
        const hasDropdown = e.target.closest('li')?.querySelector('.dropdown, .sub-dropdown');
        
        if (isLink && !hasDropdown) {
            e.stopPropagation();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isMenuOpen) {
                toggleMainMenu(true);
            } else {
                closeAllDropdowns();
            }
        }
    });

    // Initialize menu state
    if (window.innerWidth >= 1010) {
        navigationMenu.style.display = 'flex';
    } else {
        navigationMenu.style.display = 'none';
    }
});