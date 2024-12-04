document.addEventListener('DOMContentLoaded', function () {
    const navigationMenu = document.querySelector('#navigation ul.main-menu');
    const openMenuButton = document.querySelector('#open-menu');
    let isMenuOpen = false;

    // Check if submenu would overflow viewport - only for side-spawning menus
    function wouldOverflow(element) {
        // Make the element temporarily visible but hidden to get true dimensions
        const originalDisplay = element.style.display;
        const originalVisibility = element.style.visibility;
        element.style.display = 'block';
        element.style.visibility = 'hidden';

        // Get the full measurements including content
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Get the widest child element
        let maxChildWidth = 0;
        element.querySelectorAll('a').forEach(link => {
            const linkRect = link.getBoundingClientRect();
            maxChildWidth = Math.max(maxChildWidth, linkRect.width);
        });

        // Calculate total space needed including padding and any fixed width
        const totalWidth = Math.max(rect.width, maxChildWidth + 40);
        const spaceNeededRight = parentRect.right + totalWidth + 50;

        // Reset the element's visibility
        element.style.display = originalDisplay;
        element.style.visibility = originalVisibility;

        return spaceNeededRight > viewportWidth;
    }

    // Position submenus based on viewport space - only for .sub-dropdown
    function positionSubmenu(dropdown) {
        if (window.innerWidth >= 1010 && dropdown.classList.contains('sub-dropdown')) {
            if (wouldOverflow(dropdown)) {
                dropdown.style.left = 'auto';
                dropdown.style.right = '100%';
            } else {
                dropdown.style.left = '100%';
                dropdown.style.right = 'auto';
            }
        }
    }

    // Pre-position submenus on parent hover
    function setupHoverHandlers() {
        if (window.innerWidth >= 1010) {
            document.querySelectorAll('.has-subdropdown').forEach(item => {
                const parentDropdown = item.closest('.dropdown');
                const subDropdown = item.querySelector('.sub-dropdown');
                
                if (parentDropdown && subDropdown) {
                    parentDropdown.addEventListener('mouseenter', () => {
                        setTimeout(() => {
                            if (wouldOverflow(subDropdown)) {
                                subDropdown.style.left = 'auto';
                                subDropdown.style.right = '100%';
                            } else {
                                subDropdown.style.left = '100%';
                                subDropdown.style.right = 'auto';
                            }
                        }, 50);
                    });
                }
            });
        }
    }

    // Toggle main mobile menu
    function toggleMainMenu(forceClose = false) {
        isMenuOpen = forceClose ? false : !isMenuOpen;
        navigationMenu.style.display = isMenuOpen ? 'block' : 'none';
        openMenuButton.setAttribute('aria-expanded', isMenuOpen);

        if (!isMenuOpen) {
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
                    
                    if (siblingArrow) siblingArrow.classList.remove('rotated');
                    if (siblingLink) siblingLink.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current dropdown
            const isOpen = dropdown.classList.toggle('open');
            arrowElement.classList.toggle('rotated', isOpen);

            // Position the submenu if it's being opened and it's a sub-dropdown
            if (isOpen && dropdown.classList.contains('sub-dropdown')) {
                positionSubmenu(dropdown);
            }

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
                setupHoverHandlers();
            } else {
                navigationMenu.style.display = isMenuOpen ? 'block' : 'none';
            }

            // Reset all sub-dropdown positions
            document.querySelectorAll('.sub-dropdown').forEach(dropdown => {
                dropdown.style.left = '';
                dropdown.style.right = '';
            });
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

    // Initialize menu state and hover handlers
    if (window.innerWidth >= 1010) {
        navigationMenu.style.display = 'flex';
        setupHoverHandlers();
    } else {
        navigationMenu.style.display = 'none';
    }
});