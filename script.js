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
                final

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

    /* ===========================
       Gap Card
    =========================== */

    if (overallRank === 1) {

        const second = getSortedGroups("overall")[1];

        const lead = cortis.total - second.total;

        document.getElementById("gapTitle").textContent =
            "👑 Overall Lead";

        document.getElementById("gap").textContent =
            lead.toLocaleString();

        document.getElementById("gapGoal").textContent =
            "Leading by " +
            lead.toLocaleString() +
            " votes";

        document.getElementById("status").textContent =
            "🟢 CORTIS is leading overall";

    }

    else {

        const need = leader.total - cortis.total;

        document.getElementById("gapTitle").textContent =
            "🎯 Gap to #1";

        document.getElementById("gap").textContent =
            need.toLocaleString();

        document.getElementById("gapGoal").textContent =
            "Need " +
            need.toLocaleString() +
            " votes";

        document.getElementById("status").textContent =
            "🔥 Catch " + leader.name;

    }

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
   LEADERBOARD
=========================================== */

function renderLeaderboard() {

    const leaderboard =
        document.getElementById("leaderboard");

    leaderboard.innerHTML = "";

    const ranking = getSortedGroups(currentFilter);

    ranking.forEach((group, index) => {

        const votes =
            getVoteValue(group, currentFilter);

        let medal = index + 1;
        let rowClass = "";

        if (index === 0) {
            medal = "🥇";
            rowClass = "gold";
        }

        else if (index === 1) {
            medal = "🥈";
            rowClass = "silver";
        }

        else if (index === 2) {
            medal = "🥉";
            rowClass = "bronze";
        }

        if (group.name === "CORTIS") {
            rowClass += " cortis";
        }

        leaderboard.insertAdjacentHTML(

            "beforeend",

            `
            <div class="rank-item ${rowClass}">

                <div class="rank-left">

                    <div class="rank-number">

                        ${medal}

                    </div>

                    <div>

                        <div class="rank-name">

                            ${group.name}

                        </div>

                    </div>

                </div>

                <div class="rank-votes">

                    ${votes.toLocaleString()}

                </div>

            </div>
            `

        );

    });

}

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

            currentFilter =
                button.dataset.filter;

            renderTop3();

            renderLeaderboard();

        });

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

        renderLeaderboard();

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
// Refresh every 60 seconds
setInterval(loadVotes, 60000);
