const openMenuButton = document.querySelector('#open-menu');
const navigationMenu = document.querySelector('#navigation ul');

openMenuButton.addEventListener('click', () => {
    navigationMenu.style.display = navigationMenu.style.display === 'none' ? 'block' : 'none';
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 930) {
        navigationMenu.style.display = 'flex';
    } else {
        navigationMenu.style.display = 'none';
    }
});
