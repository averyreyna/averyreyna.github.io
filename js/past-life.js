import { playhtml } from "/js/playhtml-init.js";

const MYSTERY_COUNT = 3;

const FACTS = [
    { id: "award-0", text: "national academic all-american in debate" },
    { id: "award-1", text: "earned nsda's top individual rank, degree of superior distinction" },
    { id: "award-2", text: "qualified silver for the tournament of champions in public forum debate" },
    { id: "award-3", text: "named an ap scholar" },
    { id: "award-4", text: "placed 3rd at deca regionals in marketing team decision making" },
    { id: "award-5", text: "made semifinals in student congress at the nyc invitational" },
    { id: "award-6", text: "earned a superior rating in bassoon at state band evaluations, four years running" },
    { id: "award-7", text: "qualified for deca nationals in marketing team decision making" },
    { id: "award-8", text: "qualified gold for the tournament of champions in student congress" },
    { id: "award-9", text: "made finals in varsity student congress at the colt invitational" },
    { id: "award-10", text: "made semifinals in student congress at barkley forum" },
    { id: "award-11", text: "made semifinals in varsity student congress at florida blue key" },
    { id: "award-12", text: "made semifinals in jv public forum at florida blue key" },
    { id: "award-13", text: "placed 6th at deca state in marketing team decision making" },
    { id: "award-14", text: "placed 2nd in legislation writing at democracy in action" },
    { id: "award-15", text: "placed top 12 at deca regionals in business management" },
    { id: "award-16", text: "won outstanding distinction in fine arts" },
    { id: "award-17", text: "made semifinals in student congress at nsda qualifiers" },
    { id: "activity-0", text: "led the student congress squad on my debate team" },
    { id: "activity-1", text: "was president of the hope sunshine club" },
    { id: "activity-2", text: "was president of the college advisory club" },
    { id: "activity-3", text: "was first chair and section leader for bassoon in the school band" },
    { id: "teaching-0", text: "ta'd an honors english class my senior year" },
    { id: "summer-0", text: "spent a summer at a debate camp at nova southeastern university" },
    { id: "service-0", text: "coached middle schoolers in debate" },
    { id: "service-1", text: "sat on the fundraising committee for relay for life" },
    { id: "service-2", text: "mentored newer debaters on my high school team" },
];

const toggle = document.getElementById("past-life-toggle");
const panel = document.getElementById("past-life-panel");
const revealedList = document.getElementById("past-life-revealed");
const mysteryRow = document.getElementById("past-life-mystery");

if (toggle && panel && revealedList && mysteryRow) {
    toggle.addEventListener("click", () => {
        const willOpen = panel.hidden;
        panel.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", String(willOpen));
    });

    let pastLife = null;

    // Stable across re-renders: only swapped out once a specific offered
    // fact actually gets revealed (by us or someone else), so the mystery
    // buttons don't reshuffle under a visitor's cursor on every remote update.
    let mysteryIds = [];

    function pickMysteryIds(revealed) {
        mysteryIds = mysteryIds.filter((id) => !revealed[id]);
        const pool = FACTS.filter((f) => !revealed[f.id] && !mysteryIds.includes(f.id));
        while (mysteryIds.length < MYSTERY_COUNT && pool.length) {
            const index = Math.floor(Math.random() * pool.length);
            mysteryIds.push(pool.splice(index, 1)[0].id);
        }
    }

    function render(data) {
        const revealed = data.revealed || {};
        pickMysteryIds(revealed);

        revealedList.innerHTML = "";
        const revealedFacts = FACTS.filter((f) => revealed[f.id]);
        if (!revealedFacts.length) {
            const empty = document.createElement("p");
            empty.className = "past-life-empty";
            empty.textContent = "nothing uncovered yet";
            revealedList.appendChild(empty);
        }
        for (const fact of revealedFacts) {
            const row = document.createElement("p");
            row.className = "past-life-fact";
            row.textContent = fact.text;
            revealedList.appendChild(row);
        }

        mysteryRow.innerHTML = "";
        if (!mysteryIds.length) {
            const done = document.createElement("p");
            done.className = "past-life-empty";
            done.textContent = "that's all of them";
            mysteryRow.appendChild(done);
        }
        for (const id of mysteryIds) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "past-life-mystery-btn";
            button.textContent = "?";
            button.addEventListener("click", () => {
                pastLife?.setData((draft) => {
                    draft.revealed[id] = true;
                });
            });
            mysteryRow.appendChild(button);
        }
    }

    playhtml.ready
        .then(() => {
            pastLife = playhtml.createPageData("past-life-revealed", { revealed: {} });
            pastLife.onUpdate(render);
            render(pastLife.getData());
        })
        .catch((err) => {
            console.error("[past-life] failed to connect:", err);
            revealedList.innerHTML = "";
            const errEl = document.createElement("p");
            errEl.className = "past-life-empty";
            errEl.textContent = "unavailable";
            revealedList.appendChild(errEl);
        });
}
