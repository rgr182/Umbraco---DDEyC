let prevWindowWidth = window.innerWidth;

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function initNewsCarousel(data) {
  const { blocksList, defaultImageUrl, carouselId } = data;
  const carouselInner = document.querySelector(
    `#${carouselId} .carousel-inner`
  );
  const carouselIndicators = document.querySelector(
    `#${carouselId} .carousel-indicators`
  );

  renderCarouselLayout(
    blocksList,
    defaultImageUrl,
    carouselId,
    carouselInner,
    carouselIndicators
  );

  // Add listeners for slide events
  const carouselElement = document.getElementById(carouselId);

  // Calculate clamps for all slides initially
  calculateAndSetLineClamps();

  // Calculate again on slide events, using requestAnimationFrame for timing
  carouselElement.addEventListener("slide.bs.carousel", () => {
    requestAnimationFrame(calculateAndSetLineClamps);
  });

  window.addEventListener("resize", function () {
    handleResize(
      blocksList,
      defaultImageUrl,
      carouselId,
      carouselInner,
      carouselIndicators
    );
    calculateAndSetLineClamps();
  });
}

function renderCarouselLayout(
  blocksList,
  defaultImageUrl,
  carouselId,
  carouselInner,
  carouselIndicators
) {
  const isMobile = window.innerWidth <= 767;
  carouselIndicators.innerHTML = "";
  carouselInner.innerHTML = "";
  if (isMobile) {
    renderMobileLayout(
      blocksList,
      defaultImageUrl,
      carouselId,
      carouselInner,
      carouselIndicators
    );
  } else {
    renderDesktopLayout(
      blocksList,
      defaultImageUrl,
      carouselId,
      carouselInner,
      carouselIndicators
    );
  }
  calculateAndSetLineClamps();
}

function renderMobileLayout(
  blocksList,
  defaultImageUrl,
  carouselId,
  carouselInner,
  carouselIndicators
) {
  blocksList.forEach((block, index) => {
    const { content, imageUrl } = block;
    const isActive = index === 0 ? "active" : "";
    const titleText = stripHtml(content.NewsCarouselItemText1);
    const carouselItemHTML = `
            <div class="carousel-item text-and-image-carousel ${isActive}">
                <div class="carousel-item-content news-carousel">
                    <div class="row">
                        <div class="col-12">
                            <div class="text-content">
                                <div class="news-title" title="${titleText}">${content.NewsCarouselItemText1}</div>
                                <div class="news-body">${content.NewsCarouselItemText2}</div>
                            </div>
                            <div class="text-center carousel-img-container not-footer">
                                <a href="${content.NewsCarouselItemUrl}">
                                    <img src="${imageUrl}" class="img-fluid carousel-img" alt="News image"
                                        onerror="handleImageError(this, '${defaultImageUrl}')">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    carouselInner.insertAdjacentHTML("beforeend", carouselItemHTML);
    carouselIndicators.insertAdjacentHTML(
      "beforeend",
      `
            <li data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${isActive}"></li>
        `
    );
  });
}

function renderDesktopLayout(
  blocksList,
  defaultImageUrl,
  carouselId,
  carouselInner,
  carouselIndicators
) {
  for (let i = 0; i < blocksList.length; i += 2) {
    const isFirst = i === 0;
    const carouselItemHTML = `
            <div class="carousel-item news-carousel text-and-image-carousel ${
              isFirst ? "active" : ""
            }">
                <div class="carousel-item-content news-carousel h-100">
                    <div class="row h-100">
                        ${renderDesktopColumns(blocksList, i, defaultImageUrl)}
                    </div>
                </div>
            </div>
        `;

    carouselInner.insertAdjacentHTML("beforeend", carouselItemHTML);
    carouselIndicators.insertAdjacentHTML(
      "beforeend",
      `
            <li data-bs-target="#${carouselId}" data-bs-slide-to="${
        i / 2
      }" class="${isFirst ? "active" : ""}"></li>
        `
    );
  }
}

function renderDesktopColumns(blocksList, startIndex, defaultImageUrl) {
  let columnsHTML = "";

  for (let j = 0; j < 2 && startIndex + j < blocksList.length; j++) {
    const block = blocksList[startIndex + j];
    const { content, imageUrl } = block;
    const titleText = stripHtml(content.NewsCarouselItemText1);
    columnsHTML += `
            <div class="col-md-6 d-flex align-items-center flex-wrap h-100">
                <div class="col-6 text-content">
                    <div class="news-title" title="${titleText}">${content.NewsCarouselItemText1}</div>
                    <div class="news-body">${content.NewsCarouselItemText2}</div>
                </div>
                <div class="col-6 text-center carousel-img-container not-footer">
                    <a href="${content.NewsCarouselItemUrl}">
                        <img src="${imageUrl}" class="img-fluid carousel-img" alt="News image"
                            onerror="handleImageError(this, '${defaultImageUrl}')">
                    </a>
                </div>
            </div>
        `;
  }

  return columnsHTML;
}

function calculateAndSetLineClamps() {
  const textContents = document.querySelectorAll(".text-content");

  textContents.forEach((content) => {
    const containerHeight = content.clientHeight;
    const lineHeight = parseInt(window.getComputedStyle(content).lineHeight);
    const totalLines = Math.floor(containerHeight / lineHeight);

    const title = content.querySelector(".news-title");
    const body = content.querySelector(".news-body");

    // Allocate ~1/3 to title, 2/3 to body
    title.style.webkitLineClamp = Math.max(2, Math.floor(totalLines * 0.35));
    body.style.webkitLineClamp = Math.max(3, Math.floor(totalLines * 0.65));
  });
}

function handleResize(
  blocksList,
  defaultImageUrl,
  carouselId,
  carouselInner,
  carouselIndicators
) {
  const currentWindowWidth = window.innerWidth;
  const isMobile = currentWindowWidth <= 767;
  const wasMobile = prevWindowWidth <= 767;

  if (isMobile !== wasMobile) {
    renderCarouselLayout(
      blocksList,
      defaultImageUrl,
      carouselId,
      carouselInner,
      carouselIndicators
    );
  }

  prevWindowWidth = currentWindowWidth;
}