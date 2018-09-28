var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var isIE = navigator.userAgent.toLowerCase().indexOf('msie') > -1 || navigator.userAgent.toLowerCase().indexOf('trident') > -1;
var pageLoaded = false;
var isNavOpen = false;
var manualSlide = false;

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function isMobile() {
    return ('ontouchstart' in document.documentElement);
}

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var requestFrame = function() { // requestAnimationFrame cross browser
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(func) {
            window.setTimeout(func, 1000 / 60);
        }
    );
}();

window.requestTimeout = function(fn, delay) {
    if( !window.requestAnimationFrame      	&&
        !window.webkitRequestAnimationFrame &&
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame      &&
        !window.msRequestAnimationFrame)
        return window.setTimeout(fn, delay);

    var start = new Date().getTime(),
        handleTimeout = new Object();

    function loop(){
        var current = new Date().getTime(),
            delta = current - start;
        if (typeof fn !== 'undefined') {
            delta >= delay ? fn.call() : handleTimeout.value = requestFrame(loop);
        }
    };

    handleTimeout.value = requestFrame(loop);
    return handleTimeout;
};


Math.inOutQuintic = function(t, b, c, d) {
    var ts = (t/=d)*t,
        tc = ts*t;
    return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};

function scrollTo(element, duration, incrementScroll, callback) {
    var scrollingElement = (document.documentElement || document.body.parentNode || document.body);
    var start = scrollingElement.scrollTop,
        change = element.offsetTop + incrementScroll - start,
        currentTime = 0,
        increment = 20;

    clickedNavItem = true;
    duration = (typeof(duration) === 'undefined') ? 500 : duration;
    var animateScroll = function() {
        // increment the time
        currentTime += increment;
        // find the value with the quadratic in-out easing function
        var val = Math.inOutQuintic(currentTime, start, change, duration);
        // move the document.body
        scrollingElement.scrollTop = val;
        // do the animation unless its over
        if (currentTime < duration) {
            requestFrame(animateScroll);
        } else {
            setTimeout(function() { clickedNavItem = false}, 100);
            if (callback && typeof(callback) === 'function') {
                // the animation is done so lets callback
                callback();
            }
        }
    };
    animateScroll();
}

var recalculateClientHeight = false;
function smoothScroll(target, speed, smooth, bottomLimit) {
    if (target == document) {
        target = (document.documentElement || document.body.parentNode || document.body);
    }// cross browser support for document scrolling
    var moving = false;
    var pos = target.scrollTop;
    var reqFrameId;
    var checkChangeScroll = target.scrollTop;
    var footerScrollLimit = target.scrollHeight - target.clientHeight - bottomLimit;
    var bodyElement = document.querySelector('body');
    target.addEventListener('mousewheel', scrolled, false);
    target.addEventListener('DOMMouseScroll', scrolled, false);


    function scrolled(e) {
        e.preventDefault(); // disable default scrolling
        if (recalculateClientHeight) {
            footerScrollLimit = target.scrollHeight - target.clientHeight - bottomLimit;
            recalculateClientHeight = false;
        }

        if (!moving && checkChangeScroll !== target.scrollTop) {
            cancelAnimationFrame(reqFrameId);
            pos = checkChangeScroll = target.scrollTop;
        }
        if (!moving && !isNavOpen) {
            var delta = manualSlide ? e.detail : (e.delta || e.wheelDelta);
            if (delta === undefined) {
                //we are on firefox
                delta = -e.detail;
            }
            delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency

            pos += -delta * speed;

            pos = delta == -1 || manualSlide ? Math.round(pos/target.clientHeight)*target.clientHeight :
            Math.ceil(pos/target.clientHeight)*target.clientHeight;
            pos = Math.max(0, Math.min(pos, target.scrollHeight - target.clientHeight)); // limit scrolling
            if (pos > footerScrollLimit) {
                bodyElement.classList.add('overscrolled');
            }
            moving = true;
            update();
        }
    }

    function update() {
        if (checkChangeScroll === target.scrollTop && Math.abs(pos - target.scrollTop) > smooth) {
            var delta = (pos - target.scrollTop) / smooth;
            target.scrollTop += delta;

            if (pos <= footerScrollLimit && target.scrollTop >= footerScrollLimit) {
                bodyElement.classList.remove('overscrolled');
                pos = footerScrollLimit;
            }

            if (Math.abs(delta) > 0.5) {
                reqFrameId = requestFrame(update);
                checkChangeScroll = target.scrollTop;
            } else {
                moving = false;
                cancelAnimationFrame(reqFrameId);
                checkChangeScroll = target.scrollTop;
            }
        } else {
            moving = false;
            cancelAnimationFrame(reqFrameId);
            checkChangeScroll = target.scrollTop;
        }


    }
}

//Global Nav Easing Fn
function cubicInOut(t) {
    return t < 0.5
        ? 4.0 * t * t * t
        : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
};

class ShapeOverlays {
    constructor(elm) {
        this.elm = elm;
        this.path = elm.querySelectorAll('path');
        this.numPoints = 10;
        this.duration = 900;
        this.delayPointsArray = [];
        this.delayPointsMax = 300;
        this.delayPerPath = 250;
        this.timeStart = Date.now();
        this.isOpened = false;
        this.isAnimating = false;
    }
    toggle() {
        this.isAnimating = true;
        for (var i = 0; i < this.numPoints; i++) {
            this.delayPointsArray[i] = Math.random() * this.delayPointsMax;
        }
        if (this.isOpened === false) {
            this.open();
        } else {
            this.close();
        }
    }
    open() {
        this.isOpened = true;
        isNavOpen = true;
        //this.elm.classList.add('is-opened');
        this.timeStart = Date.now();
        this.renderLoop();
    }
    close() {
        this.isOpened = false;
        isNavOpen = false;
        //this.elm.classList.remove('is-opened');
        this.timeStart = Date.now();
        this.renderLoop();
    }
    updatePath(time) {
        const points = [];
        for (var i = 0; i < this.numPoints; i++) {
            points[i] = (cubicInOut(Math.min(Math.max(time - this.delayPointsArray[i], 0) / this.duration, 1)));

            points[i] = (this.isOpened ? points[i] : 1 - points[i])*100;
        }

        let str = '';
        str += `M 0 ${points[0]}`;
        for (var i = 0; i < this.numPoints - 1; i++) {
            const p = (i + 1) / (this.numPoints - 1) * 100;
            const cp = p - (1 / (this.numPoints - 1) * 100) / 2;
            str += `C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]} `;
        }
        str += `V 0 H 0`;
        return str;
    }
    render() {
        if (this.isOpened) {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * i)));
            }
        } else {
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * (this.path.length - i - 1))));
            }
        }
    }
    renderLoop() {
        this.render();
        if (Date.now() - this.timeStart < this.duration + this.delayPerPath * (this.path.length - 1) + this.delayPointsMax) {
            requestAnimationFrame(() => {
                this.renderLoop();
            });
        }
        else {
            this.isAnimating = false;
        }
    }
}

ready(function() {
    Pace.on('done', function() {pageLoaded = true});

    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var footerHeight = parseInt(window.getComputedStyle(document.querySelector('footer')).getPropertyValue('height')) + parseInt(window.getComputedStyle(document.querySelector('footer')).getPropertyValue('border-top-width'));
    var projectCounter = document.querySelector('#project-counter');
    var bodyElement = document.querySelector('body');
    var footerElement = document.querySelector('footer');

    if (viewportWidth > 960) {
        new smoothScroll(document, viewportHeight, 20, footerHeight);
    }

    // Global Navigation Liquid effect
    var $elmntHamburger = document.querySelector('#menu-hamburger');
    var $globalNav = document.querySelector('#global-nav');
    var $elmntOverlay = document.querySelector('.shape-overlays');
    var $contactLinks = document.querySelectorAll('.contact-trigger');
    var overlay = new ShapeOverlays($elmntOverlay);
    var body = document.querySelector('body');

    var navFunction = function (e, contactsClick) {
        if (overlay.isAnimating) {
            return false;
        }
        overlay.toggle();

        if (contactsClick) {
            $globalNav.classList.add('contact-triggered');
        }

        if (overlay.isOpened === true) {
            body.classList.add('nav-open');
            $elmntHamburger.classList.add('is-opened');
            $globalNav.classList.add('is-opened');
        } else {
            $elmntHamburger.classList.remove('is-opened');
            $globalNav.classList.remove('is-opened');
            $globalNav.classList.remove('contact-triggered');
            body.classList.remove('nav-open');

        }
    }

    $elmntHamburger.addEventListener('click', navFunction);
    $contactLinks.forEach(function (element) {
        element.addEventListener('click', function (e) {
            navFunction(e, true);
        });
    });

    //Fix class for sticky hover effects.
    if (isMobile()) {
        $elmntHamburger.classList.add('remove-touch-efx');
    }

    //Portfolio content slider
    var $portfolio_slider = document.querySelector('.portfolio-slider');
    var sliderNavBtns = document.querySelectorAll('.slider-nav button');
    var dispatchScrollElement = (document.documentElement || document.body.parentNode || document.body);

    if (viewportWidth > 960) {
        for (var j = 0; j < sliderNavBtns.length; j++) {
            sliderNavBtns[j].addEventListener('click', function (e) {
                var targetTagName = e.target.tagName.toLowerCase();
                var targetElement = targetTagName === 'use' ? e.target.parentElement.parentElement :
                    (targetTagName === 'svg' ? e.target.parentElement : e.target);
                if(!targetElement.classList.contains('disabled')) {
                    sliderNavBtns.forEach(function (element) {
                        element.setAttribute('disabled', 'disabled');
                    });
                    manualSlide = true;
                    var scrollEvent;
                    if (targetElement.classList.contains('js_next')) {
                        scrollEvent = new WheelEvent('DOMMouseScroll', {
                            bubbles: true,
                            cancelable: true,
                            wheelDelta: -1,
                            delta: -1,
                            detail: -1
                        });
                    } else {
                        scrollEvent = new WheelEvent('DOMMouseScroll', {
                            bubbles: true,
                            cancelable: true,
                            wheelDelta: 1,
                            delta: 1,
                            detail: 1
                        });
                    }

                    dispatchScrollElement.dispatchEvent(scrollEvent);
                }
            });
        }

        var handleSliderChangeFn = function(e) {
            var $sliderNavLabel = e.target.querySelector('.label-quantity');
            if (e.detail.currentSlide < parseInt($sliderNavLabel.innerHTML.split('/')[1]) &&
                e.detail.currentSlide >= 0) {
                $sliderNavLabel.innerHTML = e.detail.currentSlide + 1 + ' /' + $sliderNavLabel.innerHTML.split('/')[1];
            }
        };

        var handleInitSliderFn = function(e) {
            var slidesNumber = e.target.querySelectorAll('li.js_slide').length;
            var $sliderNavLabel = e.target.querySelector('.label-quantity');

            $sliderNavLabel.innerHTML = '1  /  ' + slidesNumber;
        };

        $portfolio_slider.addEventListener('after.lory.slide', handleSliderChangeFn);
        $portfolio_slider.addEventListener('before.lory.init', handleInitSliderFn);
        $portfolio_slider.addEventListener('on.lory.resize', handleInitSliderFn);

        var sliderOptions = {
            enableMouseEvents: true,
            slideSpeed: 1300,
            ease: 'cubic-bezier(0.7, 0.2, 0.5, 0.9)',
            rewind: false
        };


        var sliderObj = lory($portfolio_slider, sliderOptions);
    }


    // Portfolio Images EFX
    var projectListWrapper = document.querySelector('.portfolio-slider .js_slides');
    var allProjects = document.querySelectorAll('.portfolio-slider .js_slide');
    var allImagesParent = document.querySelector('.portfolio-images');
    var allImages = document.querySelectorAll('.portfolio-images .project-img-wrapper');
    var filterOptions = document.querySelectorAll('.portfolio-filter .filter-option');
    var allProjectNodes = [];
    var allImagesNodes = [];
    var firstLoad = true;

    //Save all project nodes for filtering later.
    allProjects.forEach(function(node) {
        allProjectNodes.push(node.cloneNode(true));
    });

    allImages.forEach(function(node) {
        allImagesNodes.push(node.cloneNode(true));
    });

    if (viewportWidth > 960) {
        window.sr = ScrollReveal({reset: true});
        var portfolioImages = document.querySelector('.portfolio-images').children;
        for (var i = 0; i < portfolioImages.length; i++) {
            var image = portfolioImages[i];
            let imageIndex = i;
            sr.reveal(image, {
                duration: 1000,
                viewFactor: 0.5,
                delay: 0,
                opacity: 0,
                scale: 1,
                beforeReveal: function (domEl) {
                    sliderNavBtns.forEach(function (element) {
                        element.setAttribute('disabled', 'disabled');
                    });
                    projectCounter.innerHTML = (imageIndex + 1) < 10 ? '0' + (imageIndex + 1).toString() : imageIndex + 1;
                    if (!manualSlide) {
                        sliderObj.slideTo(imageIndex);
                    } else {
                        manualSlide = false;
                    }

                },
                afterReveal: function () {
                    sliderNavBtns.forEach(function (element) {
                        if ((element.classList.contains('js_next') && (imageIndex + 1 !== portfolioImages.length))
                         || (element.classList.contains('js_prev') &&  imageIndex !== 0)) {
                            element.removeAttribute('disabled');
                        }

                    });
                    if (imageIndex + 1 !== portfolioImages.length) {
                        bodyElement.classList.remove('overscrolled');
                    }
                }
            });
        };

        sr.reveal(footerElement, {
            duration: 500,
            viewFactor: 0.5,
            delay: 0,
            opacity: 1,
            scale: 1,
            beforeReveal: function () {
                bodyElement.classList.add('overscrolled');
            },
            afterReset: function () {
                bodyElement.classList.remove('overscrolled');
            }
        });
    }

    // Filtering portfolio functionality.
    filterOptions.forEach(function(filter) {
        filter.addEventListener('click', function () {
            if (!filter.classList.contains('active') || firstLoad) {
                firstLoad = false;
                recalculateClientHeight = true;
                document.querySelector('.portfolio-filter .active').classList.remove('active');
                filter.classList.add('active');

                var filterValue = filter.getAttribute('value');
                var filteredProjects = allProjectNodes.filter(function(project) {
                    if (filterValue === 'all') {
                       return true;
                    } else {
                        return project.classList.contains(filterValue);
                    }
                });

                var filteredImages = allImagesNodes.filter(function(projectImg) {
                    if (filterValue === 'all') {
                        return true;
                    } else {
                        return projectImg.classList.contains(filterValue);
                    }
                });

                while (projectListWrapper.lastChild) {
                    projectListWrapper.removeChild(projectListWrapper.lastChild);
                }

                while (allImagesParent.lastChild) {
                    allImagesParent.removeChild(allImagesParent.lastChild);
                }

                filteredProjects.forEach(function(node) {
                    projectListWrapper.appendChild(node.cloneNode(true));
                });

                filteredImages.forEach(function(node) {
                    allImagesParent.appendChild(node.cloneNode(true));
                });

                if (viewportWidth > 960) {
                    sliderObj.setup();
                    portfolioImages = document.querySelector('.portfolio-images').children;
                    for (var i = 0; i < portfolioImages.length; i++) {
                        var image = portfolioImages[i];
                        let imageIndex = i;
                        sr.reveal(image, {
                            duration: 1000,
                            viewFactor: 0.5,
                            delay: 0,
                            opacity: 0,
                            scale: 1,
                            beforeReveal: function (domEl) {
                                sliderNavBtns.forEach(function (element) {
                                    element.setAttribute('disabled', 'disabled');
                                });
                                projectCounter.innerHTML = (imageIndex + 1) < 10 ? '0' + (imageIndex + 1).toString() : imageIndex + 1;
                                if (!manualSlide) {
                                    sliderObj.slideTo(imageIndex);
                                } else {
                                    manualSlide = false;
                                }

                            },
                            afterReveal: function () {
                                sliderNavBtns.forEach(function (element) {
                                    if ((element.classList.contains('js_next') &&
                                        (imageIndex + 1 !== portfolioImages.length)) ||
                                        (element.classList.contains('js_prev') &&  imageIndex !== 0)) {
                                        element.removeAttribute('disabled');
                                    }
                                });
                                if (imageIndex + 1 !== portfolioImages.length)  {
                                    bodyElement.classList.remove('overscrolled');
                                }
                            }
                        });


                        var scrollEvent = new WheelEvent('DOMMouseScroll', {
                            bubbles: true,
                            cancelable: true,
                            wheelDelta: -1,
                            delta: -1,
                            detail: -1
                        });

                        dispatchScrollElement.scrollTop = 0;
                        dispatchScrollElement.dispatchEvent(scrollEvent);
                    }
                }
            }
        });

    });

    var clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
    });
    document.querySelector('.portfolio-filter .active').dispatchEvent(clickEvent);
});

