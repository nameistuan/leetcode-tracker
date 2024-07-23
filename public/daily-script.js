document.addEventListener('DOMContentLoaded', function() {
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');
    const todayButton = document.getElementById('today');
    const dailyCountElement = document.getElementById('daily-count');
    const plannedProblemsContainer = document.getElementById('planned-problems');

    let dayOffset = 0;

    const startDate = new Date('2024-07-20T00:00:00-05:00'); // Adjust the start date as needed
    const today = new Date();

    console.log(`Start date: ${startDate.toLocaleString()}, Today: ${today.toLocaleString()}`);

    const timeDifference = today - startDate;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    dailyCountElement.textContent = `day ${daysPassed + 1 + dayOffset}`;

    let problemsData = [];

    function fetchProblemsData() {
        fetch('daily.json')
            .then(response => response.json())
            .then(data => {
                problemsData = data;
                loadPlannedProblems(daysPassed + 1 + dayOffset, problemsData);
            })
            .catch(error => console.error('Error loading daily.json data:', error));
    }

    function loadPlannedProblems(currentDay, problemsData) {
        const plannedProblems = problemsData.find(dayData => dayData.day === currentDay)?.problems || [];
        plannedProblemsContainer.innerHTML = ''; // Clear existing problems
        dailyCountElement.textContent = `day ${daysPassed + 1 + dayOffset}`;

        if (plannedProblems.length === 0) {
            plannedProblemsContainer.textContent = 'No problems planned for today.';
        } else {
            plannedProblems.forEach(problem => {
                const li = document.createElement('li');
                li.textContent = problem;
                plannedProblemsContainer.appendChild(li);
            });
        }
    }

    // Arrow listeners
    leftArrow.addEventListener('click', () => {
        dayOffset--;
        console.log('Left arrow clicked');
        console.log(`Day offset: ${dayOffset}`);
        loadPlannedProblems(daysPassed + 1 + dayOffset, problemsData);
    });

    rightArrow.addEventListener('click', () => {
        dayOffset++;
        console.log('Right arrow clicked');
        console.log(`Day offset: ${dayOffset}`);
        loadPlannedProblems(daysPassed + 1 + dayOffset, problemsData);
    });

    todayButton.addEventListener('click', () => {
        dayOffset = 0;
        console.log('Today button clicked');
        loadPlannedProblems(daysPassed + 1, problemsData);
    });

    fetchProblemsData();
});
