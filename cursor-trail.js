(function() {
    if (window.__siteCursorTrail) return;
    window.__siteCursorTrail = true;

    document.addEventListener('DOMContentLoaded', function() {
        if (!window.matchMedia('(pointer: fine)').matches) return;

        var trailChars = ['!', '@', '#', '$', '%', '&'];
        var lastTrailTime = 0;
        var lastX = null;
        var lastY = null;
        var idleHideTimer = null;
        var IDLE_HIDE_MS = 120;

        var cursorHead = document.createElement('span');
        cursorHead.className = 'cursor-trail-head';
        cursorHead.textContent = trailChars[Math.floor(Math.random() * trailChars.length)];
        cursorHead.setAttribute('aria-hidden', 'true');
        cursorHead.style.visibility = 'hidden';
        document.body.appendChild(cursorHead);

        document.documentElement.addEventListener('mouseleave', function() {
            cursorHead.style.visibility = 'hidden';
        });

        document.addEventListener('mousemove', function(e) {
            var moved = lastX !== e.clientX || lastY !== e.clientY;
            lastX = e.clientX;
            lastY = e.clientY;
            if (!moved) return;

            cursorHead.style.left = e.clientX + 'px';
            cursorHead.style.top = e.clientY + 'px';
            cursorHead.style.visibility = 'visible';
            if (idleHideTimer) clearTimeout(idleHideTimer);
            idleHideTimer = setTimeout(function() {
                cursorHead.style.visibility = 'hidden';
            }, IDLE_HIDE_MS);

            var now = Date.now();
            if (now - lastTrailTime < 80) return;
            lastTrailTime = now;
            var span = document.createElement('span');
            span.className = 'cursor-trail-char';
            span.textContent = trailChars[Math.floor(Math.random() * trailChars.length)];
            span.style.left = (e.clientX + Math.round((Math.random() - 0.5) * 16)) + 'px';
            span.style.top  = (e.clientY + Math.round((Math.random() - 0.5) * 16)) + 'px';
            document.body.appendChild(span);
            setTimeout(function() { span.remove(); }, 600);
        });
    });
})();
