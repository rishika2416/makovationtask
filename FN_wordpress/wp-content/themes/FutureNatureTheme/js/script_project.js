var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var isIE = navigator.userAgent.toLowerCase().indexOf('msie') > -1 || navigator.userAgent.toLowerCase().indexOf('trident') > -1;
var pageLoaded = false;
var isNavOpen = false;

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
    window.sr = ScrollReveal();

    //Blinds EFX functions
    var blindsPrepareFn = function (domEl) {
        var elmntStyle = window.getComputedStyle(domEl);
        var lineHeight = parseInt(elmntStyle.getPropertyValue('line-height'));
        var numberOfLines = parseInt(elmntStyle.getPropertyValue('height')) / lineHeight;
        var html = '';
        domEl.classList.add('blinds-parent');
        domEl.style = 'transform: translateY(' + lineHeight + 'px);';
        for (var i = 0; i <= numberOfLines; i++) {
            html += '<div style="height: ' + lineHeight +'px; bottom: ' + i*lineHeight +'px;" class="blinds"></div>';
        };

        domEl.innerHTML += html;
    };

    var blindsEffectFn = function (domEl) {
        domEl.classList.add('animated');
        domEl.style = 'transform: translateY(0);';
    };

    var blindsResetFn = function (domEl) {
        var lineHeight = parseInt(window.getComputedStyle(domEl).getPropertyValue('line-height'));
        var blinds = domEl.querySelectorAll('.blinds');
        domEl.classList.remove('animated');
        domEl.style = 'transform: translateY(' + lineHeight + 'px);';
        for (var i = 0; i < blinds.length; i++) {
            blinds[i].style='height: ' + lineHeight +'px; bottom: ' + i*lineHeight +'px;';
        }
    }


    // Global Navigation Liquid effect
    var $elmntHamburger = document.querySelector('#menu-hamburger');
    var $globalNav = document.querySelector('#global-nav');
    var $elmntOverlay = document.querySelector('.shape-overlays');
    var overlay = new ShapeOverlays($elmntOverlay);
    var body = document.querySelector('body');

    $elmntHamburger.addEventListener('click', () => {
        if (overlay.isAnimating) {
            return false;
        }
        overlay.toggle();
        if (overlay.isOpened === true) {
            body.classList.add('nav-open');
            $elmntHamburger.classList.add('is-opened');
            $globalNav.classList.add('is-opened');
        } else {
            $elmntHamburger.classList.remove('is-opened');
            $globalNav.classList.remove('is-opened');
            body.classList.remove('nav-open');
        }
    });

    //Fix class for sticky hover effects.
    if (isMobile()) {
        $elmntHamburger.classList.add('remove-touch-efx');
    }


    if (viewportWidth > 767) {
        new Rellax('.img-wrapper img', {
            speed: 4
        });
    }



    if (viewportWidth > 1024) {
        //Draggable effect variables
        var clipPathFxElement = document.querySelector('.clip-path-efx');
        var clipPathSvg = document.querySelector('#goalsClipPath circle');
        var initialX, initialY, dx, dy, cx, cy, coords, xLimit, yBottomLimit, visualContainerWidth, visualContainerHeight, clipPathSvgRadius;

        var recursionFn = function () {
            if (pageLoaded) {

                var summaryWrapper = document.querySelector('.summary-wrapper');
                sr.reveal(summaryWrapper, {
                    duration: 0,
                    viewFactor: 0.5,
                    delay: 0,
                    opacity: 0,
                    reset: false,
                    afterReveal: function (domEl) {
                        requestTimeout(function () {
                            var allParagraphs = domEl.querySelectorAll('p');
                            var allHeadings = domEl.querySelectorAll('h4');
                            allParagraphs.forEach(function (element) {
                                blindsEffectFn(element);
                            });
                            allHeadings.forEach(function (element) {
                                blindsEffectFn(element);
                            });
                        }, 250);
                    }
                });

                if (document.querySelector('.project-goals')) {
                    visualContainerWidth = parseInt(window.getComputedStyle(document.querySelector('.visual-container')).getPropertyValue('width'));
                    visualContainerHeight = parseInt(window.getComputedStyle(document.querySelector('.visual-container')).getPropertyValue('height'));
                    clipPathSvgRadius = parseInt(clipPathSvg.getAttribute('r'));
                    xLimit = visualContainerWidth - clipPathSvgRadius;
                    yBottomLimit = visualContainerHeight - clipPathSvgRadius + 100;

                    var clientParagraph = summaryWrapper.querySelector('.project-client p');
                    var goalsContent = document.querySelector('.project-goals .content');

                    //Check fo small content
                    if (clientParagraph.textContent.length < 270) {
                        clientParagraph.classList.add('small-content');
                    }

                    if (goalsContent.textContent.length < 1150) {
                        goalsContent.classList.add('sticky');
                    }

                    var allParagraphs = summaryWrapper.querySelectorAll('p');
                    var allHeadings = summaryWrapper.querySelectorAll('h4');
                    allParagraphs.forEach(function (element) {
                        blindsPrepareFn(element);
                    });
                    allHeadings.forEach(function (element) {
                        blindsPrepareFn(element);
                    });

                    sr.reveal(document.querySelector('.project-goals .content'), {
                        duration: 0,
                        viewFactor: 0.2,
                        delay: 0,
                        opacity: 0,
                        reset: false,
                        beforeReveal: function (domEl) {
                            var allParagraphs = domEl.querySelectorAll('p');
                            var allHeadings = domEl.querySelectorAll('h2');
                            allParagraphs.forEach(function (element) {
                                blindsPrepareFn(element);
                            });
                            allHeadings.forEach(function (element) {
                                blindsPrepareFn(element);
                            });
                        },
                        afterReveal: function (domEl) {
                            requestTimeout(function () {
                                var allParagraphs = domEl.querySelectorAll('p');
                                var allHeadings = domEl.querySelectorAll('h2');
                                allParagraphs.forEach(function (element) {
                                    blindsEffectFn(element);
                                });
                                allHeadings.forEach(function (element) {
                                    blindsEffectFn(element);
                                });
                            }, 250);
                        }
                    });
                }

            } else {
                requestTimeout(recursionFn, 100);
            }
        };
        requestTimeout(recursionFn, 100);

        function getLayerCoords(evt) {
            var el = evt.target,
                x = 0,
                y = 0;

            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                x += el.offsetLeft - el.scrollLeft;
                y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }

            x = evt.clientX - x;
            y = evt.clientY - y;

            return {x: x, y: y};
        };

        //Draggable effect
        if (document.querySelector('.project-goals') && !document.querySelector('.project-goals').classList.contains('short-project')) {
            clipPathFxElement.addEventListener('mousedown', function (e) {
                coords = getLayerCoords(e);
                initialX = coords.x;
                initialY = coords.y;

                cx = parseInt(clipPathSvg.getAttribute('cx'));
                cy = parseInt(clipPathSvg.getAttribute('cy'));

                clipPathFxElement.classList.add('active');
                body.classList.add('faded-out');
            });

            var mouseMoveFn = function (e) {
                if (clipPathFxElement.classList.contains('active')) {
                    coords = getLayerCoords(e);
                    dx = coords.x - initialX + cx;
                    dy = coords.y - initialY + cy;


                    //Limit draggable area;
                    dx = dx < clipPathSvgRadius ? clipPathSvgRadius : (dx > xLimit ? xLimit : dx);
                    dy = dy < clipPathSvgRadius ? clipPathSvgRadius : (dy > yBottomLimit ? yBottomLimit : dy);

                    clipPathFxElement.style = 'transform: translate3d(' + Math.max(-126, Math.min(126, (dx - 450))) + 'px, ' + Math.max(-100, Math.min(yBottomLimit, (dy - 425))) + 'px, 0);';

                    clipPathSvg.setAttribute('cx', dx);
                    clipPathSvg.setAttribute('cy', dy);
                }
            };

            clipPathFxElement.addEventListener('mousemove', function (e) {
                mouseMoveFn(e);
            });

            var mouseUpFn = function (e) {
                body.classList.remove('faded-out');
                clipPathFxElement.classList.remove('active');
            };

            clipPathFxElement.addEventListener('mouseout', function (e) {
                mouseUpFn(e);
            });

            document.addEventListener('mouseup', function (e) {
                mouseUpFn(e);
            });
        }
    }


    //Solutions rotator
    if (viewportWidth > 1024) {
        var solutionSlider = document.querySelector('.solutions-slider');

        if (solutionSlider) {
            var solutionSlides = solutionSlider.querySelectorAll('.slide');
            var slidesLength = solutionSlides.length;
            var currentSlide = 1;
            var labelQuantity = document.querySelector('.label-quantity');
            var projectCounter = document.querySelector('.project-counter');
            var sliderPrev = document.querySelector('.js_prev');
            var sliderNext = document.querySelector('.js_next');
            var solutionSection = document.querySelector('.project-solutions');

            labelQuantity.innerHTML = '1  /  ' + slidesLength;
            if (slidesLength == 1) {
                sliderNext.setAttribute('disabled', 'disabled');
            }

            var recursionSetUpSlider = function () {
                if (pageLoaded) {
                    solutionSlider.style = 'height: ' + (parseInt(window.getComputedStyle(solutionSlides[0]).getPropertyValue('height')) - 3) + 'px';

                    solutionSlides[0].style = solutionSlides[0].getAttribute('style') + 'height: ' + (parseInt(window.getComputedStyle(solutionSlides[0]).getPropertyValue('height')) - 3) + 'px;';
                    for (var i = 0; i < slidesLength; i++) {
                        blindsPrepareFn(solutionSlides[i].querySelector('p'));
                        if (solutionSlides[i].querySelector('p').textContent.length < 850) {
                            solutionSlides[i].querySelector('.content').classList.add('sticky');
                        }
                    }
                } else {
                    requestTimeout(recursionSetUpSlider, 100);
                }
            };
            requestTimeout(recursionSetUpSlider, 100);

            sr.reveal(projectCounter, {
                duration: 0,
                viewFactor: 0.1,
                delay: 0,
                opacity: 0,
                reset: true,
                afterReveal: function () {
                    solutionSection.classList.remove('hidden-controls');
                },
                beforeReset: function () {
                    solutionSection.classList.add('hidden-controls');
                }
            });

            sr.reveal(solutionSlides[0], {
                duration: 0,
                viewFactor: 0.2,
                delay: 0,
                opacity: 0,
                reset: false,
                afterReveal: function (domEl) {
                    requestTimeout(function() {
                        blindsEffectFn(domEl.querySelector('p'));
                    }, 500);
                }
            });



            var updateSlider = function(e) {
                var currentButton = this;
                var visibleSlider = solutionSlider.querySelector('.slide.active');
                visibleSlider.classList.remove('active');
                blindsResetFn(visibleSlider.querySelector('p'));

                sliderPrev.setAttribute('disabled', 'disabled');
                sliderNext.setAttribute('disabled', 'disabled');

                if (currentButton.classList.contains('js_next')) {
                    currentSlide += 1;
                } else {
                    currentSlide -= 1;
                }

                scrollTo(solutionSection, 800, -100);

                projectCounter.innerHTML = currentSlide < 10 ? '0' + currentSlide : currentSlide;
                labelQuantity.innerHTML = currentSlide + labelQuantity.innerHTML.substr(1, labelQuantity.innerHTML.length);
                solutionSlider.style = 'height: ' + (parseInt(window.getComputedStyle(solutionSlides[currentSlide - 1]).getPropertyValue('height')) - 3) + 'px';
                solutionSlides[currentSlide - 1].style = solutionSlides[currentSlide - 1].getAttribute('style') + 'height: ' + (parseInt(window.getComputedStyle(solutionSlides[currentSlide - 1]).getPropertyValue('height')) - 3) + 'px;';

                requestTimeout(function() {
                    solutionSlides[currentSlide - 1].classList.add('active');
                    blindsEffectFn(solutionSlides[currentSlide - 1].querySelector('p'));
                    sliderPrev.removeAttribute('disabled');
                    sliderNext.removeAttribute('disabled');
                    if (currentSlide === 1 || currentSlide === slidesLength) {
                        currentButton.setAttribute('disabled', 'disabled');
                    }
                }, 800);
            };

            sliderPrev.addEventListener('click', updateSlider);
            sliderNext.addEventListener('click', updateSlider);
        }

    }

});

