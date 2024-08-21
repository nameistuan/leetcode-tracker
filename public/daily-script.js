document.addEventListener('DOMContentLoaded', function() {
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');
    const todayButton = document.getElementById('today');
    const dailyCountElement = document.getElementById('daily-count');
    const plannedProblemsContainer = document.getElementById('planned-problems');
    const currDate = document.getElementById('current-date');
    const headerElement = document.querySelector('.planned-container h2'); // Select the <h2> element

    let dayOffset = 0;

    const startDate = new Date('2024-08-07T00:00:00-05:00');
    const today = new Date();

    console.log(`Start date: ${startDate.toLocaleString()}, Today: ${today.toLocaleString()}`);

    const timeDifference = today - startDate;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    // Global variable to store the current day count
    let currentDayCount = daysPassed + 1 + dayOffset;

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
                loadPlannedProblems(currentDayCount, problemsData, database);
            })
            .catch(error => console.error('Error loading JSON data:', error));
    }

    function formatDate(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month < 10 ? '0' + month : month}.${day < 10 ? '0' + day : day}.${year}`;
    }

    function isWeekend(date) {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 6 || dayOfWeek === 0; // Saturday (6) or Sunday (0)
    }

    function loadPlannedProblems(currentDay, problemsData, database) {
        currentDayCount = currentDay; // Update the global variable

        const plannedDayData = problemsData.find(dayData => dayData.day === currentDay);
        const plannedProblems = plannedDayData?.problems || [];
        plannedProblemsContainer.innerHTML = ''; // Clear existing problems
        dailyCountElement.textContent = `day ${currentDay}`;

        // Set the current date
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + currentDay - 1);
        currDate.textContent = formatDate(currentDate);

        // Update the header based on whether it's a review day
        if (isWeekend(currentDate)) {
            headerElement.textContent = "review day"; // Set header text for review day
        } else {
            headerElement.textContent = "today's problems!"; // Set header text for regular day
        }

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

        // Trigger an event to re-render the table with highlighted problems
        document.dispatchEvent(new CustomEvent('dayChanged', { detail: currentDayCount }));
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
