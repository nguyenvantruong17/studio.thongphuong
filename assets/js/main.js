function getWindowHeight() {
    return "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
}

function getBodyHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    );
}

function detectScrolUpDown() {
    const windowHeight = getWindowHeight();
    const docHeight = getBodyHeight();
    const windowBottom = windowHeight + window.pageYOffset;
 
    if(windowHeight === docHeight) { // When the body element does not have scrollbar
        console.log('pageYOffset', window.pageYOffset);
        return windowBottom === docHeight || window.pageYOffset === 0;
    } else {
        if(windowBottom === docHeight) {
            return 'DOWN';
        } else if (window.pageYOffset === 0) {
            return "UP";
        }

    }
    return false;
}

function main() {
    $(document).ready(function() {
        $("#tps-customer_list").owlCarousel({
            loop: true,
            margin: 40,
            autoplay: 500,
            items: 1,
            responsiveClass:true,
            responsive:{
            0:{
                items:1,
            },
            600:{
                items: 2,
            },
            1140:{
                items:3,
            },
        }
        });
    });

    var isEligibleToTriggerScrollEvent = false;
    var currentActiveIndex = 0;
    var sections = Array.from(document.querySelectorAll('.tps-section'));
    var tooltipContainer = document.querySelector('.tps-tooltip');
    var tooltips = Array.from(tooltipContainer.querySelectorAll('.tps-tooltip_item'));
    var brandContainer = document.querySelector('.tps-brand');
    var copyrightContainer = document.querySelector('.tps-copyright');

    sections.forEach(s => s.style.zIndex = s.className.includes('tps-section-active') ? '2' : '1');
    tooltips.forEach(t => t.addEventListener('click', function() {
        if (!t.className.includes('tps-tooltip_item-active') && !isEligibleToTriggerScrollEvent) {
            const newIndex = parseInt(t.getAttribute('data-index') || '0', 10)
            isEligibleToTriggerScrollEvent = true;
            tooltips[currentActiveIndex].classList.remove('tps-tooltip_item-active');
            t.classList.add('tps-tooltip_item-active');
            triggerScrollUpDown(currentActiveIndex, newIndex, newIndex > currentActiveIndex ? 'DOWN' : 'UP');
            currentActiveIndex = newIndex;
        }
    }));

    function triggerScrollUpDown(currentIndex, newIndex, isUp) {
        const oldSection = sections[currentIndex];
        const newSection = sections[newIndex];
        const windowHeight = getWindowHeight();
        const docHeight = getBodyHeight();
        const typeNewSection = newSection.classList[1].split('-')[2];

        if(newSection.className.includes('tps-section-customers')) {
            document.body.style.backgroundColor = '#f8f9fa';
        } else if(newSection.className.includes('tps-section-contact')) {
            document.body.style.backgroundColor = '#f9f9f9';
        } else {
            document.body.style.backgroundColor = null;
        }

        document.querySelector('html').style.overflow = 'hidden';
        document.body.style.overflowY = 'hidden';

        tooltipContainer.classList.remove(tooltipContainer.classList[1]);
        tooltipContainer.classList.add(`tps-tooltip-${['banner', 'gallery'].includes(typeNewSection) ? 'white' : 'gray'}`);
        tooltips[currentIndex].classList.remove('tps-tooltip_item-active');
        tooltips[newIndex].classList.add(['tps-tooltip_item-active']);

        brandContainer.classList.remove(brandContainer.classList[1]);
        brandContainer.classList.add(`tps-brand-${['banner', 'gallery'].includes(typeNewSection) ? 'white' : 'black'}`);

        copyrightContainer.classList.remove(copyrightContainer.classList[1]);
        copyrightContainer.classList.add(`tps-copyright-${['banner', 'gallery'].includes(typeNewSection) ? 'white' : 'black'}`);

        newSection.classList.add('tps-section-active');

        newSection.classList.add('tps-section-visible');
        
        if(windowHeight !== docHeight) {
            oldSection.style.height = 'auto';
        }

        if(oldSection.className.includes('tps-section-gallery')) {
            oldSection.querySelector('.tps-gallery').style.pointerEvents = 'none';
        }

        oldSection.style.transition = `top 1.2s ease-in-out`;
        oldSection.style.top= isUp = `${isUp === 'UP' ? oldSection.clientHeight : -oldSection.clientHeight}px`;
        
        newSection.classList.remove('tps-section-visible');

        setTimeout(() => {
            oldSection.style = {
                ...oldSection.style,
                height: null,
                transition: null,
                top: null,
                overflow: null,
                zIndex: null,
            }
            oldSection.classList.remove('tps-section-active');
            
            document.querySelector('html').style.overflow = null;
            document.body.style.overflowY = 'auto';
            
            newSection.style.zIndex = 2;

            window.scrollTo(0, 0);

            if(oldSection.className.includes('tps-section-gallery')) {
                oldSection.querySelector('.tps-gallery').style.pointerEvents = null;
            }

            setTimeout(() => {
                currentActiveIndex = newIndex;
                isEligibleToTriggerScrollEvent = false;
            }, 100);
        }, 1200);
    }

    //================================ Detect Up/Down ===================================== //
    window.addEventListener('mousewheel', function ( event ) { // https://stackoverflow.com/questions/7154967/how-to-detect-scroll-direction/11746221
        if(!isEligibleToTriggerScrollEvent) {
            isEligibleToTriggerScrollEvent = true;
            const isEligibleToScrolUpDown = detectScrolUpDown();
            if(event.detail > 0 || event.wheelDelta < 0) { //scroll down to top
                if(typeof isEligibleToScrolUpDown === 'boolean' ? isEligibleToScrolUpDown : isEligibleToScrolUpDown === 'DOWN') {
                    const newIndex = currentActiveIndex === tooltips.length - 1 ? 0 : currentActiveIndex + 1;
                    triggerScrollUpDown(currentActiveIndex, newIndex, 'DOWN');
                } else {
                    isEligibleToTriggerScrollEvent = false;
                }
            } else if(typeof isEligibleToScrolUpDown === 'boolean' ? isEligibleToScrolUpDown : isEligibleToScrolUpDown === 'UP') { //scroll up to bottom
                const newIndex = currentActiveIndex === 0 ? tooltips.length - 1 : currentActiveIndex - 1;
                triggerScrollUpDown(currentActiveIndex, newIndex, 'UP');
            } else {
                isEligibleToTriggerScrollEvent = false;
            }
            //prevent page fom scrolling
            return false;
        }
    });
    //================================ Detect Up/Down ===================================== //
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('html').style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        document.querySelector('.tps-loading').style.display = 'none';
        document.querySelector('.tps-section-active').classList.remove('tps-section-visible');
        setTimeout(() => {
            document.querySelector('html').style.overflow = null;
            document.body.style.overflow = null;
            main();
        }, 1200);
    }, 500);
})