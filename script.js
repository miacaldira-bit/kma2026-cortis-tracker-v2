/* ===========================================
   KMA 2026 CORTIS TRACKER
=========================================== */

/* ===========================================
   FIXED SESSION VOTES
=========================================== */

const SESSION1 = {

    "ALPHA DRIVE ONE": 249408,
    "LNGSHOT": 94346,
    "CORTIS": 106474

};

const SESSION2 = {

    "ALPHA DRIVE ONE": 401141,
    "LNGSHOT": 388690,
    "CORTIS": 99602

};

/* ===========================================
   SETTINGS
=========================================== */

const WORKER_URL =
    "https://kma-proxy.miacaldira.workers.dev";

/* ===========================================
   APP STATE
=========================================== */

let currentFilter = "overall";

let allGroups = [];

let filtersInitialized = false;
let previousGap = null;

/* ===========================================
   FETCH LIVE DATA
=========================================== */

async function fetchVotes() {

    try {

        const response = await fetch(

            WORKER_URL + "?t=" + Date.now(),

            {
                cache: "no-store"
            }

        );

        if (!response.ok)
            throw new Error("Worker unavailable");

        console.log("Loaded from Worker");

        return await response.json();

    }

    catch (err) {

        console.warn("Worker failed.");

        const response = await fetch(

            "data.json?t=" + Date.now(),

            {
                cache: "no-store"
            }

        );

        return await response.json();

    }

}

/* ===========================================
   BUILD GROUP DATA
=========================================== */

function buildGroups(data) {

    allGroups = [];

    data.list.forEach(group => {

        const name = group.name2;

        const session1 =
            SESSION1[name] || 0;

        const session2 =
            SESSION2[name] || 0;

        const final =
            group.total_vote_count;

     allGroups.push({

    name,

    session1,

    session2,

    final,

    total:
        session1 +
        session2 +
        final,

    my1pick: group.my1pick_vote_count,

    idol: group.idol_vote_count,

    upick: group.upick_vote_count

});

    });

}

/* ===========================================
   SORTING
=========================================== */

function getVoteValue(group, filter) {

    switch (filter) {

        case "session1":
            return group.session1;

        case "session2":
            return group.session2;

        case "final":
            return group.final;

        default:
            return group.total;

    }

}

function getSortedGroups(filter = currentFilter) {

    return [...allGroups].sort(

        (a, b) =>

        getVoteValue(b, filter) -

        getVoteValue(a, filter)

    );

}

/* ===========================================
   HELPERS
=========================================== */

function getCortis() {

    return allGroups.find(

        group => group.name === "CORTIS"

    );

}

function getOverallLeader() {

    return getSortedGroups("overall")[0];

}

function getOverallRank(name) {

    return getSortedGroups("overall")

        .findIndex(

            group => group.name === name

        ) + 1;

}

function getLiveRank(name) {

    return getSortedGroups("final")

        .findIndex(

            group => group.name === name

        ) + 1;

}
 /* ===========================================
   COUNTDOWN
=========================================== */

function updateCountdown() {

    const closing = new Date("2026-07-06T23:59:59+09:00");

    const now = new Date();

    const diff = closing - now;

    const banner = document.getElementById("countdownBanner");

    if (diff <= 0) {

        banner.textContent =
            "🏁 Voting Closed";

        return;

    }

    const totalSeconds = Math.floor(diff / 1000);

    const days = Math.floor(totalSeconds / 86400);

    const hours = Math.floor((totalSeconds % 86400) / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days === 0) {

        banner.textContent =
            `🔥 D-DAY • ${hours}h ${minutes}m remaining`;

    }

    else {

        banner.textContent =
            `⏳ D-${days} • ${days}d ${hours}h ${minutes}m remaining`;

    }

}

/* ===========================================
   SUMMARY
=========================================== */

function renderSummary() {

    const cortis = getCortis();

   const overall = getSortedGroups("overall");

const leader = overall[0];

const overallRank =
    overall.findIndex(
        group => group.name === "CORTIS"
    ) + 1;

    const liveRank = getLiveRank("CORTIS");

const heroCard = document.getElementById("heroCard");
const heroTitle = document.getElementById("heroTitle");
const heroValue = document.getElementById("heroValue");
const heroSubtitle = document.getElementById("heroSubtitle");
const heroMessage = document.getElementById("heroMessage");
const heroUpdated = document.getElementById("heroUpdated");
    const heroTrend = document.getElementById("heroTrend");

if (overallRank === 1) {

    const second = overall[1];

    const lead = cortis.total - second.total;

    heroCard.className = "card hero-card hero-green";

    heroTitle.textContent = "👑 CORTIS IS #1";

    heroValue.textContent =
        "+" + lead.toLocaleString();

    heroSubtitle.textContent =
        "Votes Ahead";

  heroTrend.className="hero-trend trend-good";
heroTrend.textContent="👑 CORTIS is leading!";

heroMessage.innerHTML=
    "Keep defending the lead 💜";

}
else{

    const gap = leader.total - cortis.total;
   if(previousGap===null){

    heroTrend.className="hero-trend trend-neutral";

    heroTrend.textContent=
        "Waiting for next refresh...";

}
else{

    const diff=
        previousGap-gap;

    if(diff>0){

        heroTrend.className="hero-trend trend-good";

        heroTrend.textContent=
            `🟢 Gap closed by ${diff.toLocaleString()} votes`;

    }

    else if(diff<0){

        heroTrend.className="hero-trend trend-bad";

        heroTrend.textContent=
            `🔴 Gap widened by ${Math.abs(diff).toLocaleString()} votes`;

    }

    else{

        heroTrend.className="hero-trend trend-neutral";

        heroTrend.textContent=
            "⚪ No change since last update";

    }

}

previousGap=gap;

    heroCard.className = "card hero-card hero-red";

    heroTitle.textContent =
        "🔥 GAP TO OVERALL #1";

    heroValue.textContent =
        gap.toLocaleString();

    heroSubtitle.textContent =
        "Votes Needed";

   const now = new Date();

const formatted =
    now.toLocaleString("en-MY",{

        day:"2-digit",

        month:"short",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit",

        second:"2-digit",

        hour12:false

    });

heroUpdated.textContent =
    `Updated: ${formatted}`;
}

    /* ===========================
       Summary Cards
    =========================== */

    document.getElementById("overallTotal").textContent =
        cortis.total.toLocaleString();

    document.getElementById("overallRank").textContent =
        "#" + overallRank;

    document.getElementById("liveRank").textContent =
        "#" + liveRank;

    document.getElementById("session1").textContent =
        cortis.session1.toLocaleString();

    document.getElementById("session2").textContent =
        cortis.session2.toLocaleString();

    document.getElementById("final").textContent =
        cortis.final.toLocaleString();

}

/* ===========================================
   TOP 3
=========================================== */

function renderTop3() {

    const container =
        document.getElementById("top3Container");

    container.innerHTML = "";

    const ranking =
        getSortedGroups(currentFilter).slice(0, 3);

   const styles = [

    "podium-first",

    "podium-small podium-second",

    "podium-small podium-third"

];

    const medals = [
        "🥇",
        "🥈",
        "🥉"
    ];

    ranking.forEach((group, index) => {

        const votes =
            getVoteValue(group, currentFilter);

        let gapText = "";

        if (index === 0) {

            const secondVotes =
                getVoteValue(ranking[1], currentFilter);

            gapText =
                `Lead +${(votes - secondVotes).toLocaleString()}`;

        }

        else {

            const higherVotes =
                getVoteValue(
                    ranking[index - 1],
                    currentFilter
                );

            gapText =
                `Need ${(higherVotes - votes).toLocaleString()}`;

        }

        container.insertAdjacentHTML(

            "beforeend",

            `
            <div class="${styles[index]}">

                <div class="podium-name">

                    ${medals[index]}
                    ${group.name}

                </div>

                <div class="podium-votes">

                    ${votes.toLocaleString()}

                </div>

                <div class="podium-gap">

                    ${gapText}

                </div>

            </div>
            `

        );

    });

}
/* ===========================================
   FILTER BUTTONS
=========================================== */

function initializeFilters() {

    if (filtersInitialized)
        return;

    filtersInitialized = true;

    document.querySelectorAll(".filter").forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".filter")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            currentFilter = button.dataset.filter;

            renderTop3();

        });

    });

}

/* ===========================================
   APP VOTES
=========================================== */

function renderAppVotes() {

    const container = document.getElementById("appVotes");

    container.innerHTML = "";

 const groups = [...allGroups]
    .filter(group =>
        ["CORTIS", "LNGSHOT", "ALPHA DRIVE ONE"]
            .includes(group.name)
    )
    .sort((a, b) => b.total - a.total);

    const leaders = {
    my1pick: Math.max(...groups.map(g => g.my1pick)),
    idol: Math.max(...groups.map(g => g.idol)),
    upick: Math.max(...groups.map(g => g.upick)),
    total: Math.max(...groups.map(g => g.total))
    };

    groups.forEach(group => {

        const myGap = leaders.my1pick - group.my1pick;
        const idolGap = leaders.idol - group.idol;
        const upickGap = leaders.upick - group.upick;

        container.insertAdjacentHTML("beforeend", `

        <div class="app-row">

            <div class="app-name">
                ${group.name}
            </div>

            <div class="app-value">

                ${group.my1pick === leaders.my1pick ? "👑" : ""}
                ${group.my1pick.toLocaleString()}

                <div class="gap">
                    ${
                        myGap === 0
                        ? "Leader"
                        : "-" + myGap.toLocaleString()
                    }
                </div>

            </div>

            <div class="app-value">

                ${group.idol === leaders.idol ? "👑" : ""}
                ${group.idol.toLocaleString()}

                <div class="gap">
                    ${
                        idolGap === 0
                        ? "Leader"
                        : "-" + idolGap.toLocaleString()
                    }
                </div>

            </div>

            <div class="app-value">

                ${group.upick === leaders.upick ? "👑" : ""}
                ${group.upick.toLocaleString()}

                <div class="gap">
                    ${
                        upickGap === 0
                        ? "Leader"
                        : "-" + upickGap.toLocaleString()
                    }
                </div>

            </div>

            <div class="app-value app-total">
                ${group.total.toLocaleString()}
            </div>

        </div>

        `);

    });

}
/* ===========================================
   LOAD APPLICATION
=========================================== */

async function loadVotes() {

    try {

        const data = await fetchVotes();

        buildGroups(data);

        renderSummary();

        renderTop3();

       renderAppVotes();
       updateCountdown();

        initializeFilters();

        document.getElementById("updated").textContent =
            "Updated " +
            new Date().toLocaleTimeString();

    }

    catch (error) {

        console.error(error);

        document.getElementById("updated").textContent =
            "Failed to load data.";

    }

}

loadVotes();

setInterval(updateCountdown,60000);
// Refresh every 60 seconds
setInterval(loadVotes, 60000);
