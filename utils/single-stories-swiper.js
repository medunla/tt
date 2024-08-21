const selectors = {
    container: '.story-swiper',
    autoplayController: '.story-autoplay-controller',
    prevButton: '.story-button-prev',
    nextButton: '.story-button-next',
    openItineraryButton: '.story-detail-summary-button',
    expandDetailButton: '.story-detail-expand-detail',
    collapseDetailButton: '.story-detail-collapse-detail',
    closeDetailButton: '.story-page-navigation-close-detail',
    dataIsPaused: '[data-is-paused]',
};

export { selectors as swiperSelectors };

export const initSwiper = (state) => {
    const swiper = new Swiper(selectors.container, {
        loop: false,
        centeredSlides: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
          stopOnLastSlide: true,
        },
        effect: 'fade',
        speed: 100,
        pagination: {
            el: '.story-pagination',
            clickable: false,
            type: 'bullets',
            bulletClass: 'story-pagination-item',
            bulletActiveClass: 'story-pagination-item-active',
            modifierClass: 'story-pagination-',
            renderBullet: (index, className) => {
                return `<div class="${className}" data-index="${index}"><span></span></div>`;
            },
        },
        on: {
            autoplayTimeLeft(swiper, _, progress) { onAutoplayTimeLeft(swiper, progress) },
            slideChange(swiper) { onSlideChange(swiper, state) }
        }
    });
    setupControllers(swiper, state);
    initMarketingCardSwipers(swiper, state);

    return swiper;
}

const initMarketingCardSwipers = (swiper, state) => {
    new Swiper('.story-marketing-cards .swiper', {
        slidesPerView: 'auto',
        spaceBetween: 12,
        freeMode: true,
        nested: true,
        grabCursor: true,
        touchStartForcePreventDefault: true,
        mousewheel: true,
        on: {
            touchStart() {
                swiper.allowTouchMove = false;
            },
            touchEnd() {
                if (state.activedDetailIndex === null && swiper.allowTouchMove === false) {
                    swiper.allowTouchMove = true;
                }
            }
        }
    });
};

const setProgressWidth = (slideIndex, percent) => {
    const item = document.querySelector(`.story-pagination-item[data-index="${slideIndex}"] > span`);
    item.style.width = `${percent}%`;
};

const onAutoplayTimeLeft = (swiper, progress) => {
    if (!swiper.isEnd && swiper.autoplay.running) {
        const percent = 100 - (progress.toFixed(2) * 100);
        setProgressWidth(swiper.realIndex, percent);
    }
};

const onSlideChange = (swiper, state) => {
    // Clear pause state when slide changed
    handleResume(swiper, state, true);
    state.pausedByController = false;

    const isChangedToNextSlide = swiper.realIndex > swiper.previousIndex;

    if (isChangedToNextSlide) {
        setProgressWidth(swiper.previousIndex, 100);
    } else {
        setProgressWidth(swiper.previousIndex, 0);
    }

    if (state.isSlideChangedByCloseItineraryPage) {
        // Prevent change progress width when slide changed by close itinerary page
        state.isSlideChangedByCloseItineraryPage = false;
    } else {
        setProgressWidth(swiper.realIndex, 0);
    }

    const isLastTwoPages = swiper.isEnd || swiper.realIndex === swiper.slides.length - 2;
    if (!isLastTwoPages && !swiper.autoplay.running) {
        swiper.autoplay.start();
    }

    if (swiper.isEnd) {
        // Stop autoplay when open itinerary page
        state.openItineraryPage(swiper.autoplay.stop);
    }
};

const setupControllers = (swiper, state) => {
    const prevElements = document.querySelectorAll(selectors.prevButton);
    prevElements.forEach((element) => {
        element.addEventListener('click', () => {
            swiper.slidePrev();
        });
    });

    const nextElements = document.querySelectorAll(selectors.nextButton);
    nextElements.forEach((element) => {
        element.addEventListener('click', () => {
            swiper.slideNext();
        });
    });

    const autoplayControllerElements = document.querySelectorAll(selectors.autoplayController);
    autoplayControllerElements.forEach((element) => {
        element.addEventListener('click', () => {
        if (swiper.autoplay.running) {
            if (swiper.autoplay.paused) {
                state.pausedByController = false;
                handleResume(swiper, state);
            } else {
                state.pausedByController = true;
                handlePause(swiper);
            }
        }
        });
    });

    const openItineraryButtonElements = document.querySelectorAll(selectors.openItineraryButton);
    openItineraryButtonElements.forEach((element) => {
        element.addEventListener('click', () => {
            state.openItineraryPage(handlePause(swiper));
        });
    });

    const expandDetailElements = document.querySelectorAll(selectors.expandDetailButton);
    expandDetailElements.forEach((element) => {
        element.addEventListener('click', () => {
            const index = element.closest('[data-slide-index]').getAttribute('data-slide-index');
            setContentIsActive(swiper, state, index, true);
            handlePause(swiper, state);
        });
    });

    const collapseDetailElements = document.querySelectorAll(`${selectors.collapseDetailButton}, ${selectors.closeDetailButton}`);
    collapseDetailElements.forEach((element) => {
        element.addEventListener('click', () => {
            setContentIsActive(swiper, state, state.activedDetailIndex, false);
            handleResume(swiper, state);
        });
    });
};

const handlePause = (swiper) => {
    if (!swiper.autoplay.paused && swiper.autoplay.running) {
        swiper.autoplay.pause();
        document.querySelectorAll(selectors.dataIsPaused).forEach((element) => element.setAttribute('data-is-paused', true));
    }
};

export const handleResume = (swiper, state, isForceResume) => {
    const requireConditions = swiper.autoplay.paused && swiper.autoplay.running;
    const passConditions = requireConditions && (isForceResume || !state.pausedByController);
    if (passConditions) {
        swiper.autoplay.resume();
        document.querySelectorAll(selectors.dataIsPaused).forEach((element) => element.setAttribute('data-is-paused', false));
    }
};

const setContentIsActive = (swiper, state, index, isActive) => {
    const pageElement = document.querySelector('.story-page');
    const slideElement = document.querySelector(`[data-slide-index="${index}"]`);

    pageElement.setAttribute('data-is-active-detail', isActive);
    slideElement.setAttribute('data-is-slide-active-detail', isActive);
    state.activedDetailIndex = isActive ? index : null;

    // Disable page swipe behavior when detail is active then enable it back when detail is inactive
    swiper.allowTouchMove = !isActive;
};
