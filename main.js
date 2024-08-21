import { initSwiper, handleResume } from './utils/single-stories-swiper.js';
import { initItineraryPage, openItineraryPage, getItineraryPageTitle, getItineraryPageCloseButton, setIsActive } from './utils/single-stories-itinerary-page.js';

// Swiper
const swiperState = {
    isSlideChangedByCloseItineraryPage: false,
    pausedByController: false,
    activedDetailIndex: null,
    openItineraryPage: () => {}
};
const swiper = initSwiper(swiperState);


// Itinerary page
const onAfterEnd = () => {
    if (!swiper.isEnd) {
        handleResume(swiper, swiperState);
    }

    if (swiper.isEnd) {
        swiperState.isSlideChangedByCloseItineraryPage = true;
        swiper.slidePrev();
    }

    setIsActive(false);
}
const itineraryPageTitle = getItineraryPageTitle();
const itineraryPageCloseButton = getItineraryPageCloseButton();
const itineraryPage = initItineraryPage(onAfterEnd);
swiperState.openItineraryPage = (beforeOpen) => openItineraryPage({
    page: itineraryPage,
    title: itineraryPageTitle,
    closeButton: itineraryPageCloseButton,
    beforeOpen
});
