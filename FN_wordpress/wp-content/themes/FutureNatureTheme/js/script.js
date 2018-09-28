var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
var isIE = navigator.userAgent.toLowerCase().indexOf('msie') > -1 || navigator.userAgent.toLowerCase().indexOf('trident') > -1;
var pageLoaded = false;

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

function swipedetect(el, callback){

    var touchsurface = el,
        swipedir,
        startX,
        startY,
        distX,
        distY,
        threshold = 75, //required min distance traveled to be considered swipe
        restraint = 100, // maximum distance allowed at the same time in perpendicular direction
        handleswipe = callback || function (swipedir) {};

    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0];
        swipedir = 'none';
        dist = 0;
        startX = touchobj.pageX;
        startY = touchobj.pageY;
    }, false);

    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
            swipedir = (distX < 0)? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
        }
        else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
            swipedir = (distY < 0)? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
        }
        handleswipe(swipedir);
    }, false)
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

var clickedNavItem = false;
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

function smoothScroll(target, speed, smooth) {
    if (target == document) {
        target = (document.documentElement || document.body.parentNode || document.body);
    }// cross browser support for document scrolling
    var moving = false;
    var pos = target.scrollTop;
    var reqFrameId;
    var checkChangeScroll = target.scrollTop;
    target.addEventListener('mousewheel', scrolled, false);
    target.addEventListener('DOMMouseScroll', scrolled, false);


    function scrolled(e) {
        e.preventDefault(); // disable default scrolling
        if (!moving && checkChangeScroll !== target.scrollTop) {
            cancelAnimationFrame(reqFrameId);
            pos = checkChangeScroll = target.scrollTop;
        }

        var delta = e.delta || e.wheelDelta;
        if (delta === undefined) {
            //we are on firefox
            delta = -e.detail;
        }
        delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency

        pos += -delta * speed;
        pos = Math.max(0, Math.min(pos, target.scrollHeight - target.clientHeight)); // limit scrolling

        if (!moving) {
            moving = true;
            update();
        }
    }

    function update() {
        if (checkChangeScroll === target.scrollTop && Math.abs(pos - target.scrollTop) > smooth) {
            var delta = (pos - target.scrollTop) / smooth;
            target.scrollTop += delta;
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ShapeOverlays = function () {
    function ShapeOverlays(elm) {
        _classCallCheck(this, ShapeOverlays);

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

    _createClass(ShapeOverlays, [{
        key: 'toggle',
        value: function toggle() {
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
    }, {
        key: 'open',
        value: function open() {
            this.isOpened = true;
            //this.elm.classList.add('is-opened');
            this.timeStart = Date.now();
            this.renderLoop();
        }
    }, {
        key: 'close',
        value: function close() {
            this.isOpened = false;
            //this.elm.classList.remove('is-opened');
            this.timeStart = Date.now();
            this.renderLoop();
        }
    }, {
        key: 'updatePath',
        value: function updatePath(time) {
            var points = [];
            for (var i = 0; i < this.numPoints; i++) {
                points[i] = cubicInOut(Math.min(Math.max(time - this.delayPointsArray[i], 0) / this.duration, 1));

                points[i] = (this.isOpened ? points[i] : 1 - points[i]) * 100;
            }

            var str = '';
            str += 'M 0 ' + points[0];
            for (var i = 0; i < this.numPoints - 1; i++) {
                var p = (i + 1) / (this.numPoints - 1) * 100;
                var cp = p - 1 / (this.numPoints - 1) * 100 / 2;
                str += 'C ' + cp + ' ' + points[i] + ' ' + cp + ' ' + points[i + 1] + ' ' + p + ' ' + points[i + 1] + ' ';
            }
            str += 'V 0 H 0';
            return str;
        }
    }, {
        key: 'render',
        value: function render() {
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
    }, {
        key: 'renderLoop',
        value: function renderLoop() {
            var _this = this;

            this.render();
            if (Date.now() - this.timeStart < this.duration + this.delayPerPath * (this.path.length - 1) + this.delayPointsMax) {
                requestAnimationFrame(function () {
                    _this.renderLoop();
                });
            } else {
                this.isAnimating = false;
            }
        }
    }]);

    return ShapeOverlays;
}();

ready(function() {
    Pace.on('done', function() {pageLoaded = true});
    //new smoothScroll(document,120,12);
    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    //SVG icons drawing options
    var iconsDrawingOptions = {
        type: 'sync',
        duration: 75,
        pathTimingFunction: Vivus.EASE,
        start: 'manual'
    };

    //Blinds EFX functions
    var blindsPrepareFn = function (domEl) {
        var elmntStyle = window.getComputedStyle(domEl);
        var lineHeight = parseInt(elmntStyle.getPropertyValue('line-height'));
        var numberOfLines = parseInt(elmntStyle.getPropertyValue('height')) / lineHeight;
        var html = '';
        domEl.classList.add('blinds-parent');
        for (var i = 0; i <= numberOfLines; i++) {
            html += '<div style="height: ' + lineHeight +'px; bottom: ' + i*lineHeight +'px;" class="blinds"></div>';
        };

        domEl.innerHTML += html;
    };

    var blindsEffectFn = function (domEl) {
        var lineHeight = parseInt(window.getComputedStyle(domEl).getPropertyValue('line-height'));
        domEl.style = 'transform: translateY(' + lineHeight + 'px);';
        requestTimeout(function () {
            domEl.classList.add('animated');
            domEl.style = 'transform: translateY(0);';
        }, 500);
    };

    //Parallax EFX
    window.sr = ScrollReveal({ reset: true });

    sr.reveal('#intro p', {
        duration: 0,
        viewFactor: 0.1,
        delay: 0,
        opacity: 0,
        reset: false,
        beforeReveal: function (domEl) {
            blindsPrepareFn(domEl);
        },
        afterReveal: function (domEl) {
            var recursionFn = function () {
                if (pageLoaded) {
                    blindsEffectFn(domEl);
                } else {
                    requestTimeout(recursionFn, 100);
                }
            };


            requestTimeout(recursionFn, 100);
        }
    });

    var valuesContainers = document.querySelectorAll('#values .value-bubble');
    for (var j = 0; j < valuesContainers.length; j++) {
        valuesContainers[j].id = 'value' + (j+1);
        var revealOptions = {
            reset: false,
            origin: j == 1 ? 'right' : 'left',
            distance: '100%',
            duration: 700,
            delay: 100,
            viewFactor: 0.5,
            opacity: 0,
            easing: 'ease-out',
            beforeReveal: function (domEl) {
                var valueVivusObj = new Vivus(domEl.querySelector('.rellax svg.icon'), iconsDrawingOptions);
                requestTimeout(function () {
                    valueVivusObj.play();
                }, 400);

                var paragraphEl = domEl.querySelector('p');
                var linkEl = domEl.querySelector('a');
                blindsPrepareFn(paragraphEl);
                blindsPrepareFn(linkEl);
                requestTimeout(function () {
                    blindsEffectFn(paragraphEl);
                    blindsEffectFn(linkEl);
                }, 100);
            },
            afterReveal: function (domEl) {
                new Rellax('#' + domEl.id + ' .icon-container', {
                    vertical: true,
                    horizontal: false
                });
            }
        };

        if (viewportWidth > 1024) {
            sr.reveal(valuesContainers[j], revealOptions);
        } else if (viewportWidth > 767){
            revealOptions.distance = '0';
            revealOptions.delay = 0;
            revealOptions.viewFactor = 0.2;
            sr.reveal(valuesContainers[j], revealOptions);
        } else {
            revealOptions.distance = '0';
            revealOptions.delay = 0;
            revealOptions.viewFactor = 0.2;
            revealOptions.afterReveal = function() {};
            sr.reveal(valuesContainers[j], revealOptions);
        }
    }


    if(viewportWidth > 960) {
        var sideShapeSpeed = isFirefox ? -1 : -5;
        new Rellax('#liquid-shape');
        new Rellax('#liquid-shape-side', {
            speed: sideShapeSpeed
        });

        sr.reveal('.dash-path-inner', {
            duration: 0,
            viewFactor: 0.1,
            delay: 0,
            opacity: 0,
            reset: false,
            afterReveal: function (domEl) {
                domEl.querySelector('animate').beginElement();
                domEl.classList.add('active');
                requestTimeout(function () {
                    var processBubbles = document.querySelectorAll('.process-bubble');
                    var k = 0;
                    var animateProcessIcons = function (index, length) {
                        var bubble = processBubbles[index];
                        bubble.classList.add('animated');

                        var bubbleSVG = bubble.querySelector('svg');
                        if (bubbleSVG) {
                            var processVivusObj = new Vivus(bubbleSVG.id, iconsDrawingOptions);
                            processVivusObj.play();
                        } else {
                            bubble.querySelector('.text-icon').classList.add('animated');
                        }

                        index += 1;
                        if (index < length) {
                            requestTimeout(function () {
                                animateProcessIcons(index, length);
                            }, 900);
                        }
                    };

                    animateProcessIcons(k, processBubbles.length);
                }, 700);
            }
        });
    } else {
        var processBubbles = document.querySelectorAll('.process-bubble');
        for (var j = 0; j < processBubbles.length; j++) {
            sr.reveal(processBubbles[j], {
                reset: false,
                origin: j == 1 ? 'right' : 'left',
                distance: '0',
                duration: 700,
                delay: 100,
                viewFactor: 0.5,
                opacity: 0,
                easing: 'ease-out',
                beforeReveal: function (domEl) {
                    var processIcon = domEl.querySelector('svg');
                    var paragraphEl = domEl.querySelector('p');
                    blindsPrepareFn(paragraphEl);
                    requestTimeout(function () {
                        blindsEffectFn(paragraphEl);
                    }, 100);

                    if (processIcon) {
                        var valueVivusObj = new Vivus(processIcon, iconsDrawingOptions);
                        requestTimeout(function () {
                            valueVivusObj.play();
                        }, 400);
                    } else {
                        domEl.querySelector('.text-icon').classList.add('animated');
                    }

                }
            });
        }
    }


    //End of parallax EFX

    //Vertical Navigation Animation
    var hashLinks = document.querySelectorAll('.hash-link');
    var verticalNav = document.getElementById('vertical-nav');
    var introNavLink = verticalNav.querySelectorAll('li')[0];
    var valuesNavLink = verticalNav.querySelectorAll('li')[1];
    var projectsNavLink = verticalNav.querySelectorAll('li')[2];
    var processNavLink = verticalNav.querySelectorAll('li')[3];
    var testimonialsNavLink = verticalNav.querySelectorAll('li')[4];

    for (var i = 0; i < hashLinks.length; i++) {
        var hashLink = hashLinks[i];
        hashLink.addEventListener('click', function (e) {
            e.preventDefault();
            var correction = 0;
            var elmntId = (e.target.href || e.target.parentNode.href).split('#')[1];
            e.target.parentNode.parentNode.querySelectorAll('li.selected')[0].className = '';
            e.target.parentNode.className = 'selected';
            e.target.parentNode.blur();
            if (elmntId === 'values' || elmntId === 'process' || elmntId === 'projects') {
                correction = 100;
                verticalNav.className = '';
            } else if (elmntId === 'testimonials') {
                requestTimeout(function() {
                    verticalNav.className = 'color-inverted';
                }, 1000);
            } else {
                verticalNav.className = '';
            }
            scrollTo(document.getElementById(elmntId), 1300, correction);
        });
    }

    var values = document.getElementById('values');
    var projects = document.getElementById('projects');
    var process = document.getElementById('process');
    var testimonials = document.getElementById('testimonials');

    window.addEventListener('scroll', function () {
        if (!clickedNavItem) {
            verticalNav.className = '';
            verticalNav.querySelectorAll('li.selected')[0].className = '';
            if (window.pageYOffset < values.offsetTop - 250) {
                introNavLink.className = 'selected';
            } else if (window.pageYOffset < projects.offsetTop - 250) {
                valuesNavLink.className = 'selected';
            } else if (window.pageYOffset < process.offsetTop - 250) {
                projectsNavLink.className = 'selected';
            } else if (window.pageYOffset < testimonials.offsetTop - 250) {
                processNavLink.className = 'selected';
            } else {
                testimonialsNavLink.className = 'selected';
                verticalNav.className = 'color-inverted';
            }
        }
    });

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
    for (var i = 0; i < $contactLinks.length; i++) {
        $contactLinks[i].addEventListener('click', function (e) {
            navFunction(e, true);
        });
    }

    //Fix class for sticky hover effects.
    if (isMobile()) {
        $elmntHamburger.classList.add('remove-touch-efx');
    }

    //Projects & Testimonials sliders
    var $projects_slider = document.querySelector('.projects_slider');
    var $testimonials_slider = document.querySelector('.testimonials_slider');

    var handleSliderChangeFn = function(e) {
        var $sliderNavLabel = e.target.querySelector('.label-quantity');
        if (e.detail.nextSlide < parseInt($sliderNavLabel.innerHTML.split('/')[1]) &&
            e.detail.nextSlide >= 0) {
            $sliderNavLabel.innerHTML = e.detail.nextSlide + 1 + ' /' + $sliderNavLabel.innerHTML.split('/')[1];
        }
    };

    var handleInitSliderFn = function(e) {
        var slidesNumber = e.target.querySelectorAll('li.js_slide').length;
        var $sliderNavLabel = e.target.querySelector('.label-quantity');

        if (e.target.className.indexOf('testimonials_slider') !== -1) {
            elapsed = 0;
            var $sliderNavButons = e.target.querySelectorAll('.slider-nav button');
            for (var i = 0; i < $sliderNavButons.length; i++) {
                $sliderNavButons[i].addEventListener('click', function () {
                    resetTimer();
                    stop = false;
                })
            }
        }

        $sliderNavLabel.innerHTML = '1  /  ' + slidesNumber;
    };

    $projects_slider.addEventListener('before.lory.slide', handleSliderChangeFn);
    $testimonials_slider.addEventListener('before.lory.slide', handleSliderChangeFn);

    $projects_slider.addEventListener('before.lory.init', handleInitSliderFn);
    $testimonials_slider.addEventListener('before.lory.init', handleInitSliderFn);

    $projects_slider.addEventListener('on.lory.resize', handleInitSliderFn);
    $testimonials_slider.addEventListener('on.lory.resize', handleInitSliderFn);

    var sliderOptions = {
        enableMouseEvents: true,
        slideSpeed: 1000,
        ease: 'cubic-bezier(0.7, 0.2, 0.5, 0.9)',
        rewind: true,
        rewindSpeed: 1000,
    };

    if (viewportWidth <= 1024) {
        sliderOptions.slideSpeed = 100;
        sliderOptions.ease = 'linear';
    }

    lory($projects_slider, sliderOptions);
    var testimonialsSlider = lory($testimonials_slider, sliderOptions);

    //Slider autoplay functions
    var stop = false;
    var slideIndex = 0;
    var fpsInterval, startTime, now, then, elapsed;

    function startAnimating(fps) {
        fpsInterval = 1000 / fps;
        then = Date.now();
        startTime = then;
        animate();
    }

    // animate (autoplay)
    function animate() {
        requestFrame(animate);

        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval && !stop) {
            then = now - (elapsed % fpsInterval);

            testimonialsSlider.next();
            if(slideIndex === testimonialsSlider.returnIndex()) {
                for (var i = 0; i < slideIndex; i++) {
                    requestTimeout(testimonialsSlider.prev(), 100);
                }
                slideIndex = 0;
            } else {
                slideIndex = testimonialsSlider.returnIndex();
            }
        }
    }

    // reset timer
    function resetTimer() {
        now = Date.now();
        elapsed = now - then;
        then = now - (elapsed % fpsInterval);
    }

    // start the animation process with seed time
    startAnimating(.2); // every five seconds

    // mouseover
    $testimonials_slider.addEventListener('mouseover', function() {
        stop = true;
        elapsed = 0;
    });

    // mouseout
    $testimonials_slider.addEventListener('mouseout', function() {
        resetTimer();
        stop = false;
        elapsed = 0;
    });

});

