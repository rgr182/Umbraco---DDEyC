let prevWindowWidth = window.innerWidth;
function initNewsCarousel(data) {
    const { blocksList, defaultImageUrl, carouselId } = data;
    const carouselInner = document.querySelector(`#${carouselId} .carousel-inner`);
    const carouselIndicators = document.querySelector(`#${carouselId} .carousel-indicators`);

    renderCarouselLayout(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators);
    window.addEventListener('resize', function() {
        handleResize(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators);
    });
}

function renderCarouselLayout(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators) {
    const isMobile = window.innerWidth <= 767;
    carouselIndicators.innerHTML = '';
    carouselInner.innerHTML = '';

    if (isMobile) {
        console.log ('Mobile');
        renderMobileLayout(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators);
    } else {
        renderDesktopLayout(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators);
    }
}

function renderMobileLayout(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators) {
    blocksList.forEach((block, index) => {
        const { content, imageUrl } = block;
        const isActive = index === 0 ? 'active' : '';

        const carouselItemHTML = `
            <div class="carousel-item text-and-image-carousel ${isActive}">
            <div class="carousel-item-content">
                    <div class="row">
                        <div class="col-12">
                            <div class="text-content">
                                <p>${content.NewsCarouselItemText1}</p>
                                <p>${content.NewsCarouselItemText2}</p>
                            </div>
                            <div class="text-center carousel-img-container">
                                <a href="${content.NewsCarouselItemUrl?.Url}">
                                    <img src="${imageUrl}" class="img-fluid carousel-img" alt="..."
                                        onerror="handleImageError(this, '${defaultImageUrl}')">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        carouselInner.insertAdjacentHTML('beforeend', carouselItemHTML);
        carouselIndicators.insertAdjacentHTML('beforeend', `
            <li data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${isActive}"></li>
        `);
    });
}

function renderDesktopLayout(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators) {
    for (let i = 0; i < blocksList.length; i += 2) {
        const isFirst = i === 0;
        const carouselItemHTML = `
            <div class="carousel-item text-and-image-carousel ${isFirst ? 'active' : ''}">
                <div class="carousel-item-content">
                    <div class="row">
                        ${renderDesktopColumns(blocksList, i, defaultImageUrl)}
                    </div>
                </div>
            </div>
        `;

        carouselInner.insertAdjacentHTML('beforeend', carouselItemHTML);
        carouselIndicators.insertAdjacentHTML('beforeend', `
            <li data-bs-target="#${carouselId}" data-bs-slide-to="${i / 2}" class="${isFirst ? 'active' : ''}"></li>
        `);
    }
}

function renderDesktopColumns(blocksList, startIndex, defaultImageUrl) {
    let columnsHTML = '';

    for (let j = 0; j < 2 && startIndex + j < blocksList.length; j++) {
        const block = blocksList[startIndex + j];
        const { content, imageUrl } = block;

        columnsHTML += `
            <div class="col-md-6 d-flex align-items-center flex-wrap">
                <div class="col-6 text-content">
                    <p class="text-ellipsis">${content.NewsCarouselItemText1}</p>
                    <p class="text-ellipsis">${content.NewsCarouselItemText2}</p>
                </div>
                <div class="col-6 text-center carousel-img-container">
                    <a href="${content.NewsCarouselItemUrl?.Url}">
                        <img src="${imageUrl}" class="img-fluid carousel-img" alt="..."
                            onerror="handleImageError(this, '${defaultImageUrl}')">
                    </a>
                </div>
            </div>
        `;
    }

    return columnsHTML;
}

function handleResize(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators) {
    const currentWindowWidth = window.innerWidth;
    const isMobile = currentWindowWidth <= 767;
    const wasMobile = prevWindowWidth <= 767;

    if (isMobile !== wasMobile) {
        renderCarouselLayout(blocksList, defaultImageUrl, carouselId, carouselInner, carouselIndicators);
    }

    prevWindowWidth = currentWindowWidth;
}