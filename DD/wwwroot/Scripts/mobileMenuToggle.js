const dropdownArrows = document.querySelectorAll('.dropdown-arrow');
const openMenuButton = document.querySelector('#open-menu');
const navigationMenu = document.querySelector('#navigation ul');

// Alternar la visibilidad del menú de navegación al hacer clic en el botón de menú
openMenuButton.addEventListener('click', () => {
    if (navigationMenu.style.display === 'none' || navigationMenu.style.display === '') {
        navigationMenu.style.display = 'block';
    } else {
        navigationMenu.style.display = 'none';
    }
});

// Alternar la visibilidad de los submenús al hacer clic en el dropdown-arrow
dropdownArrows.forEach((arrow) => {
    arrow.addEventListener('click', (e) => {
        const dropdownMenu = arrow.nextElementSibling;
        // Alternar la visibilidad del menú desplegable
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        } else {
            dropdownMenu.style.display = 'block';
        }
        e.stopPropagation(); // Evitar que el clic se propague a elementos superiores
    });
});

// Ajustar la visibilidad del menú de navegación al redimensionar la ventana
window.addEventListener('resize', () => {
    if (window.innerWidth > 930) {
        navigationMenu.style.display = 'flex';
    } else {
        navigationMenu.style.display = 'none';
    }
});

// Ocultar el menú de navegación y los submenús si se hace clic fuera de ellos
document.addEventListener('click', (e) => {
    if (!e.target.closest('#navigation')) {
        navigationMenu.style.display = 'none';
        dropdownArrows.forEach((arrow) => {
            arrow.nextElementSibling.style.display = 'none';
        });
    }
});
