document.addEventListener('DOMContentLoaded', function() {
    const startDate = new Date('2024-07-20T00:00:00-05:00'); // Adjust the start date as needed
    const today = new Date();

    console.log(`Start date ${startDate.toLocaleString()}, today ${today.toLocaleString()}`);

    const timeDifference = today - startDate;
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    const dailyCountElement = document.getElementById('daily-count');
    dailyCountElement.textContent = `day ${daysPassed + 1}`;


    fetch('daily.json')
        .then(response => response.json())
        .then(data => {
            loadPlannedProblems(daysPassed + 1, data);
        })
        .catch(error => console.error('Error loading daily.json data:', error));
});


function loadPlannedProblems(currentDay, problemsData) {
    const plannedProblems = problemsData.find(dayData => dayData.day === currentDay)?.problems || [];
    const plannedProblemsContainer = document.getElementById('planned-problems');
    plannedProblemsContainer.innerHTML = ''; // Clear existing problems

    plannedProblems.forEach(problem => {
        const li = document.createElement('li');
        li.textContent = problem;
        plannedProblemsContainer.appendChild(li);
    });
}