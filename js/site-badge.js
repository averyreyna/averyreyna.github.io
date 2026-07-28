import { playhtml } from "/js/playhtml-init.js";

const VISITED_KEY = "site-badge-visited";

playhtml.ready
    .then(() => {
        const onlineEl = document.getElementById("site-badge-online");
        const visitsEl = document.getElementById("site-badge-visits");
        if (!onlineEl || !visitsEl) return;

        playhtml.users.onChange((users) => {
            onlineEl.textContent = String(users.length);
        });
        onlineEl.textContent = String(playhtml.users.getAll().length);

        const visits = playhtml.createPageData("total-visits", { count: 0 });
        visits.onUpdate((data) => {
            visitsEl.textContent = String(data.count);
        });
        visitsEl.textContent = String(visits.getData().count);

        // Count once per browser session, not once per page load: without
        // this, navigating index -> portfolio -> work (or just refreshing)
        // inflates "total visits" by several per actual visit.
        if (!sessionStorage.getItem(VISITED_KEY)) {
            sessionStorage.setItem(VISITED_KEY, "1");
            visits.setData((draft) => { draft.count += 1; });
        }
    })
    .catch((err) => {
        console.error("[site-badge] failed to connect:", err);
    });
