const SPACING_FROM_TOP = 80; // pixels
const selectors = {
    bottomSheetTarget: '#storyItineraryPage',
    itineraryPageContent: '#storyItineraryPageContent',
    itineraryPageTitle: '#storyItineraryPageTitle',
    itineraryPageCloseButton: '#storyItineraryPageCloseButton',
    content: '.story-itinerary-page-content',
    sheetClass: 'story-itinerary-page-sheet',
    contentClass: 'story-itinerary-page-content',
    overlayClass: 'story-itinerary-page-overlay',
    closeButton: '.story-itinerary-page-close',
    measureContentHeight: '.story-page-container',
    measureVh: '#measureVh',
};

export const initItineraryPage = (onAfterEnd) => {
    const { element: contentElement, html: contentHtml } = getContent();
    const page = new BottomSheet(selectors.bottomSheetTarget, contentHtml);
    page.height = getHeightVhCalculateFromStoryArea();
    page.sheetClass = selectors.sheetClass;
    page.contentsClass = selectors.contentClass;
    page.backgroundClass = selectors.overlayClass;
    page.afterEnd = () => onAfterEnd();

    // Clean up HTML after injected into the itinerary page
    contentElement?.remove();

    return page;
};

export const openItineraryPage = ({ page, title, closeButton, beforeOpen }) => {
    if (!!beforeOpen) {
        beforeOpen();
    }

    page.open();
    injectTitle(title);
    injectCloseButton(page, closeButton);
    setIsActive(true);
};

const getHeightVhCalculateFromStoryArea = () => {
    const story = document.querySelector(selectors.measureContentHeight);
    const storyHeight = story?.clientHeight ? story?.clientHeight - SPACING_FROM_TOP : 0;
    const measureVh = document.querySelector(selectors.measureVh);
    const measureVhHeight = measureVh?.clientHeight ?? 0;

    return Math.floor((storyHeight * 100) / measureVhHeight);
};

const injectTitle = ({ element: titleElement, html: titleHtml }) => {
    const pageElement = document.querySelector(selectors.content);
    pageElement.innerHTML = pageElement.innerHTML + titleHtml;

    // Clean up HTML after injected into the itinerary page
    titleElement?.remove();
};

const injectCloseButton = (page, { element: closeButtonElement, html: closeButtonHtml }) => {
    const pageElement = document.querySelector(selectors.content);
    pageElement.innerHTML = pageElement.innerHTML + closeButtonHtml;

    // Add event to close button
    addEventToCloseItineraryPageButton(page);

    // Clean up HTML after injected into the itinerary page
    closeButtonElement?.remove();
};

const addEventToCloseItineraryPageButton = (page) => {
    const element = document.querySelector(selectors.closeButton);
    element?.addEventListener('click', () => {
        const bottomSheetId = document.querySelector('.frontleBottomSheet')?.getAttribute('id');
        page.close(bottomSheetId);
    });
};

const getElementAndHtml = (selector) => {
    const element = document.querySelector(selector);
    const html = element?.innerHTML ?? '';
    return { element, html };
};

const getContent = () => getElementAndHtml(selectors.itineraryPageContent);
export const getItineraryPageTitle = () => getElementAndHtml(selectors.itineraryPageTitle);
export const getItineraryPageCloseButton = () => getElementAndHtml(selectors.itineraryPageCloseButton);

export const setIsActive = (isActive) => {
    document.querySelector(selectors.bottomSheetTarget)?.setAttribute('data-is-active', isActive);
};
