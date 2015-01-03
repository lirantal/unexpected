function rememberScrollPosition() {
    function rememberScrollPositionForElement(element) {
        var id = element.getAttribute('id');
        var scrollTimer;
        element.onscroll = function (e) {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () {
                localStorage.setItem(id + ' scrollTop', element.scrollTop);
                localStorage.setItem(id + ' scrollLeft', element.scrollLeft);
            }, 1000);
        };
    }
    function retrieveScrollPositionForElement(element) {
        var id = element.getAttribute('id');
        var scrollTop = localStorage.getItem(id + ' scrollTop');
        var scrollLeft = localStorage.getItem(id + ' scrollLeft');
        if (typeof scrollTop === 'string') {
            element.scrollTop = parseInt(scrollTop, 10);
            element.scrollLeft = parseInt(scrollLeft, 10);
        }
    }

    var elements = document.querySelectorAll('.js-remember-scroll-position');
    for (var i = 0; i < elements.length; i += 1) {
        try {
            var element = elements[i];
            retrieveScrollPositionForElement(element);
            rememberScrollPositionForElement(element);
        } catch (e) {
            // ignore
        }
    }
}

rememberScrollPosition();
