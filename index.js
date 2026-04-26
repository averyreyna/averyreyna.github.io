document.addEventListener('DOMContentLoaded', function() {
    var asciiEl = document.getElementById('fishing-ascii');
    if (!asciiEl) return;

    asciiEl.textContent = [
        '      \\/)/)',
        "    _'  oo(_.-.",
        "  /'.     .---'",
        " /'-./    (",
        " )     ; __\\",
        " \\_.'\\ : __|",
        "     )  _/",
        "    (  (,.",
        "  mrf'-.-'"
    ].join('\n');
});
