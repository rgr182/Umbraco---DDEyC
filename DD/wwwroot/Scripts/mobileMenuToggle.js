document.addEventListener('DOMContentLoaded', function () {

    const navigationMenu = document.querySelector('#navigation ul');
    const toggleNavigationMenu = () => {
        if (navigationMenu.style.display === 'none' || navigationMenu.style.display === '') {
            navigationMenu.style.display = 'block';
        } else {
            navigationMenu.style.display = 'none';
        }
    };

    // Alternar la visibilidad de los submenús al hacer clic en el dropdown-arrow
    document.querySelectorAll('.dropdown-arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            const dropdownMenu = e.target.nextElementSibling;
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            } else {
                dropdownMenu.style.display = 'block';
            }
            e.stopPropagation();
        });
    });

    // Alternar la visibilidad del menú de navegación al hacer clic en el botón de menú
    document.querySelector('#open-menu').addEventListener('click', () => {
        toggleNavigationMenu();
    });

    // Ajustar la visibilidad del menú de navegación al redimensionar la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1010) {
            navigationMenu.style.display = 'flex';
        } else {
            navigationMenu.style.display = 'none';
        }
    });
});