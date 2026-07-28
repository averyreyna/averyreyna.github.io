import { playhtml } from "https://unpkg.com/playhtml@2.13.2";

export const PLAY_COLORS = ["#22c55e", "#ec4899", "#3b82f6"];

// playhtml requires a publicKey on any custom playerIdentity we hand it
// (it replaces its own auto-generated identity rather than merging into
// it), so we generate and persist one ourselves the same way it does.
const PUBLIC_KEY_STORAGE_KEY = "avryryn-site-player-public-key";

function getOrCreatePublicKey() {
    let key = localStorage.getItem(PUBLIC_KEY_STORAGE_KEY);
    if (!key) {
        key = crypto.randomUUID();
        localStorage.setItem(PUBLIC_KEY_STORAGE_KEY, key);
    }
    return key;
}

// Draggable widgets store position as a fraction (0-1) of the current
// valid drag range, not raw pixels — a spot dragged 80% of the way to the
// right edge on a wide desktop window renders 80% of the way to the right
// edge on a narrow phone screen too, instead of replaying the same pixel
// offset and potentially landing off-screen.
const draggablePositions = new Map();

function getDragPoint(event) {
    const touch = event.touches?.[0];
    return { x: touch ? touch.clientX : event.clientX, y: touch ? touch.clientY : event.clientY };
}

function applyDragPosition(element, data) {
    if (data.xFrac == null || data.yFrac == null) return;
    const maxLeft = Math.max(window.innerWidth - element.offsetWidth, 0);
    const maxTop = Math.max(window.innerHeight - element.offsetHeight, 0);
    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.left = `${data.xFrac * maxLeft}px`;
    element.style.top = `${data.yFrac * maxTop}px`;
}

function makeDraggable(element) {
    element.defaultData = { xFrac: null, yFrac: null };
    element.resetShortcut = "shiftKey";

    element.updateElement = ({ element, data }) => {
        draggablePositions.set(element, data);
        applyDragPosition(element, data);
    };

    element.onDragStart = (event, { setLocalData }) => {
        const point = getDragPoint(event);
        const rect = element.getBoundingClientRect();
        setLocalData({
            startX: point.x,
            startY: point.y,
            startLeft: rect.left,
            startTop: rect.top,
            width: rect.width,
            height: rect.height,
        });
    };

    element.onDrag = (event, { localData, setData }) => {
        const point = getDragPoint(event);
        const left = localData.startLeft + (point.x - localData.startX);
        const top = localData.startTop + (point.y - localData.startY);
        const maxLeft = Math.max(window.innerWidth - localData.width, 0);
        const maxTop = Math.max(window.innerHeight - localData.height, 0);
        setData({
            xFrac: maxLeft > 0 ? Math.min(Math.max(left, 0), maxLeft) / maxLeft : 0,
            yFrac: maxTop > 0 ? Math.min(Math.max(top, 0), maxTop) / maxTop : 0,
        });
    };
}

for (const id of ["site-badge", "site-switch", "site-chat", "past-life"]) {
    const element = document.getElementById(id);
    if (element) makeDraggable(element);
}

window.addEventListener("resize", () => {
    for (const [element, data] of draggablePositions) {
        applyDragPosition(element, data);
    }
});

playhtml.init({
    room: "avryryn-site",
    cursors: {
        enabled: true,
        room: "domain",
        playerIdentity: {
            publicKey: getOrCreatePublicKey(),
            playerStyle: { colorPalette: PLAY_COLORS },
        },
    },
});

export { playhtml };
