document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const carouselImages = document.querySelectorAll('.carousel-item img');
    const closeButton = document.querySelector(".modal-close");
    let touchStartTime;
    let touchTimeout;
    function openModal(img) {
        if (window.innerWidth <= 767) {
            modal.style.display = "flex";
            modalImg.src = img.src;
            document.body.style.overflow = "hidden";
        }
    }
    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
    if (modal && modalImg && closeButton) {
        carouselImages.forEach(img => {
            const link = img.parentElement; // assuming <img> is wrapped in <a>
            img.addEventListener('touchstart', function (e) {
                touchStartTime = Date.now();
                touchTimeout = setTimeout(() => {
                    openModal(img);
                }, 500); // 500 ms for long press
            });
            img.addEventListener('touchend', function (e) {
                clearTimeout(touchTimeout);
                if (Date.now() - touchStartTime < 500) {
                    link.click(); // trigger the link's click event
                }
            });
            img.addEventListener('touchmove', function (e) {
                clearTimeout(ttouchTimeout);
            });
        });
        closeButton.addEventListener('click', function () {
            closeModal();
        });
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
});