document.addEventListener('DOMContentLoaded', function() {
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');
    const todayButton = document.getElementById('today');
    const dailyCountElement = document.getElementById('daily-count');
    const plannedProblemsContainer = document.getElementById('planned-problems');
    const currDate = document.getElementById('current-date');

    let dayOffset = 0;

    const startDate = new Date('2024-07-20T00:00:00-05:00');
    const today = new Date();

    console.log(`Start date: ${startDate.toLocaleString()}, Today: ${today.toLocaleString()}`);

    const timeDifference = today - startDate;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    dailyCountElement.textContent = `day ${daysPassed + 1 + dayOffset}`;

    let problemsData = [];
    let database = [];

    function fetchData() {
        // Fetch daily.json
        fetch('daily.json')
            .then(response => response.json())
            .then(dailyData => {
                problemsData = dailyData;
                console.log('daily.json:', problemsData); // Log daily.json data
                // Fetch data.json after daily.json
                return fetch('data.json');
            })
            .then(response => response.json())
            .then(data => {
                database = data;
                console.log('data.json:', database); // Log data.json data
                loadPlannedProblems(daysPassed + 1 + dayOffset, problemsData, database);
            })
            .catch(error => console.error('Error loading JSON data:', error));
    }
    

    function formatDate(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month < 10 ? '0' + month : month}.${day < 10 ? '0' + day : day}.${year}`;
    }

    function loadPlannedProblems(currentDay, problemsData, database) {
        const plannedProblems = problemsData.find(dayData => dayData.day === currentDay)?.problems || [];
        plannedProblemsContainer.innerHTML = ''; // Clear existing problems
        dailyCountElement.textContent = `day ${daysPassed + 1 + dayOffset}`;

        // Calculate and display the current date
        const tempDate = new Date(startDate);
        tempDate.setDate(startDate.getDate() + daysPassed + dayOffset);
        currDate.textContent = formatDate(tempDate);

        // Add problems from daily.json to today's problems
        if (plannedProblems.length === 0) {
            plannedProblemsContainer.textContent = 'No problems planned for today.';
        } else {
            plannedProblems.forEach(problemName => {
                // Find the problem details from the database
                const problemDetails = database.find(problem => problem.name === problemName);

                if (problemDetails) {
                    const li = document.createElement('li');
                    li.textContent = problemDetails.name;

                    // Add click event to open the problem URL
                    li.addEventListener('click', () => {
                        window.open(problemDetails.url, '_blank');
                    });

                    plannedProblemsContainer.appendChild(li);
                }
            });
        }
    }

    // Arrow listeners
    leftArrow.addEventListener('click', () => {
        dayOffset--;
        console.log('Left arrow clicked');
        console.log(`Day offset: ${dayOffset}`);
        loadPlannedProblems(daysPassed + 1 + dayOffset, problemsData, database);
    });

    rightArrow.addEventListener('click', () => {
        dayOffset++;
        console.log('Right arrow clicked');
        console.log(`Day offset: ${dayOffset}`);
        loadPlannedProblems(daysPassed + 1 + dayOffset, problemsData, database);
    });

    todayButton.addEventListener('click', () => {
        dayOffset = 0;
        console.log('Today button clicked');
        loadPlannedProblems(daysPassed + 1, problemsData, database);
    });

    fetchData();
});
