document.addEventListener('DOMContentLoaded', function () {
    // despliega la barra de navegación
    const navigationMenu = document.querySelector('#navigation ul');

    const toggleNavigationMenu = () => {
        if (navigationMenu.style.display === 'none' || navigationMenu.style.display === '') {
            navigationMenu.style.display = 'block';
        } else {
            navigationMenu.style.display = 'none';
        }
    };
    // Alternar la visibilidad del menú de navegación al hacer clic en el botón de menú
    document.querySelector('#open-menu').addEventListener('click', (e) => {
        toggleNavigationMenu();
        e.stopPropagation();
    });
    // Alternar la visibilidad de los submenús al hacer clic en el dropdown-arrow
    document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            if (arrow.style.display === 'block') {
                arrow.style.display = 'none';
            } else {
                arrow.style.display = 'block';
            }
            console.log(arrow.style.display);
        });
    });
    // Ajustar la visibilidad del menú de navegación al redimensionar la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1009) {
            navigationMenu.style.display = 'flex';
        } else {
            navigationMenu.style.display = 'none';
        }
    });
    // TODO: que se vuelva a reiniciar la función y permita desplegar nuevamente las opciones
    // Cerrar los menús cuando se hace clic fuera del menú
    document.addEventListener('click', (e) => {
        const isClickInsideMenu = e.target.closest('#navigation');
        if (!isClickInsideMenu && isClickInsideMenu < 1009) {
            // Cerrar todos los submenús
            document.querySelectorAll('.dropdown, .sub-dropdown').forEach(menu => {
                menu.style.display = 'none';
            });
            // Cerrar el menú principal en móvil
            if (window.innerWidth < 1009) {
                navigationMenu.style.display = 'none';
            }
        }
    });

    // bloqueo de menús con hijos
    const toggleDropdown = function (event, dropdownClass) {
        const parentLi = event.target.closest('li');
        const dropdown = parentLi.querySelector(dropdownClass);

        if (dropdown) {
            event.preventDefault();
            const isOpen = dropdown.classList.toggle('open');
            event.target.setAttribute('aria-expanded', isOpen);
        }
    };
    const setupLinks = function (linkSelector, dropdownClass) {
        const links = document.querySelectorAll(linkSelector);

        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                toggleDropdown(event, dropdownClass);
            });
            link.setAttribute('aria-haspopup', 'true');
            link.setAttribute('aria-expanded', 'false');
        });
    };
    setupLinks('.parent-link', '.dropdown');
    setupLinks('.child-link', '.sub-dropdown');

});

