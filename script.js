let plan = {
    destination: "",
    days: []
};

function createTrip() {

    const destination =
        document.getElementById("destination").value;

    const numDays =
        parseInt(document.getElementById("days").value);

    plan.destination = destination;
    plan.days = [];

    for (let i = 1; i <= numDays; i++) {

        plan.days.push({
            day: i,
            activities: []
        });
    }

    renderDays();
}

function renderDays() {

    const container =
        document.getElementById("planner-container");

    container.innerHTML = "";

    plan.days.forEach((day,index)=>{

        let activitiesHTML = "";

        day.activities.forEach(activity => {

            activitiesHTML += `
            <div class="border p-2 mt-2">

                ${activity.name}

                <button
                    class="btn btn-danger btn-sm float-end"
                    onclick="deleteActivity(${index}, ${activity.id})">

                    X

                </button>

            </div>
            `;
        });

        container.innerHTML += `
        <div class="card mt-3">

            <div class="card-header">
                Day ${day.day}
            </div>

            <div class="card-body">

                <button
                    class="btn btn-primary"
                    onclick="addActivity(${index})">

                    Add Activity

                </button>

                ${activitiesHTML}

            </div>

        </div>
        `;
    });

    updateSummary();
}




function addActivity(dayIndex) {

    const activity =
        prompt("Enter Activity Name");

    if (!activity) return;

    plan.days[dayIndex].activities.push({
        id: Date.now(),
        name: activity
    });

    renderDays();
}
function updateSummary() {

    document.getElementById(
        "total-days"
    ).innerText =
        plan.days.length;

    let total = 0;

    plan.days.forEach(day => {
        total += day.activities.length;
    });

    document.getElementById(
        "total-activities"
    ).innerText =
        total;
}


function exportPlan() {

    let output =
        "Trip Itinerary\n\n";

    plan.days.forEach(day => {

        output += "Day " +
        day.day + "\n";

        day.activities.forEach(activity => {
            output +=
            "- " + activity.name + "\n";
        });

        output += "\n";
    });

    alert(output);
}
function deleteActivity(dayIndex, activityId) {

    plan.days[dayIndex].activities =
        plan.days[dayIndex].activities.filter(
            activity => activity.id !== activityId
        );

    renderDays();
}
