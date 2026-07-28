import { playhtml } from "https://unpkg.com/playhtml@2.13.2";

export const PLAY_COLORS = ["#22c55e", "#ec4899", "#3b82f6"];

playhtml.init({
    room: "avryryn-site",
    cursors: {
        enabled: true,
        room: "domain",
        playerIdentity: {
            playerStyle: { colorPalette: PLAY_COLORS },
        },
    },
});

export { playhtml };
