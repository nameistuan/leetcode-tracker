document.addEventListener('DOMContentLoaded', function () {
    console.log('JavaScript is loaded and working!');

    let problemsData = []; // Variable to store loaded data
    let dailyProblems = []; // Array to store today's problems for highlighting
    let currentDayCount = 1; // Initial day count (should be updated dynamically)

    const tableBody = document.getElementById('tableBody');
    const progress = document.querySelector('.progress');
    const progressBarFill = progress.querySelector(".progress-fill");
    const progressText = progress.querySelector(".progress-text");

    async function fetchData() {
        try {
            // Fetch all data at once
            const [newOrder, data, daily] = await Promise.all([
                fetch('/newprob.txt').then(response => response.text()).then(text => text.split('\n').map(line => line.trim()).filter(line => line.length > 0)),
                fetch('/data.json').then(response => response.json()),
                fetch('/daily.json').then(response => response.json())
            ]);

            problemsData = reorderData(newOrder, data);
            dailyProblems = getDailyProblems(currentDayCount, daily);

            renderTable(); // Render the table once
            updateProgressBar(); // Update progress bar once

            addSortingEventListeners();
            addHoverListeners();
            addPartClickListeners();

            // Listen for day change event
            document.addEventListener('dayChanged', function (event) {
                currentDayCount = event.detail;
                dailyProblems = getDailyProblems(currentDayCount, daily);
                renderTable(); // Re-render only when day changes
            });

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function reorderData(order, data) {
        const dataMap = new Map(data.map(problem => [problem.name, problem]));
        return order.map(name => dataMap.get(name)).filter(problem => problem !== undefined);
    }

    function getDailyProblems(currentDay, daily) {
        const todayData = daily.find(entry => entry.day === currentDay);
        return todayData ? todayData.problems : [];
    }

    function renderTable() {
        tableBody.innerHTML = ''; // Clear existing table rows

        problemsData.forEach(problem => {
            const row = document.createElement('tr');
            row.className = dailyProblems.includes(problem.name) ? 'highlight-row' : '';

            row.innerHTML = `
                <td>
                    <span class="dot ${getDifficultyDotClass(problem.difficulty)}"></span>
                    <a href="${problem.url}" target="_blank">${problem.name}</a>
                </td>
                <td>${problem.topic}</td>
                <td><input type="checkbox" ${problem.completed ? 'checked' : ''}></td>
                <td>
                    <select>
                        <option value="1" ${problem.confidence === 1 ? 'selected' : ''}>Low</option>
                        <option value="2" ${problem.confidence === 2 ? 'selected' : ''}>Medium</option>
                        <option value="3" ${problem.confidence === 3 ? 'selected' : ''}>High</option>
                    </select>
                </td>
            `;

            tableBody.appendChild(row);

            setupEventListeners(row, problem);
        });
    }

    function setupEventListeners(row, problem) {
        // Checkbox event listener
        row.querySelector('input[type="checkbox"]').addEventListener('change', function () {
            problem.completed = this.checked;
            updateDataJson(); // Update data.json with new status
            updateProgressBar(); // Update progress bar on status change

            if (this.checked) {
                triggerConfetti(this);
            }
        });

        // Select event listener
        row.querySelector('select').addEventListener('change', function () {
            problem.confidence = parseInt(this.value);
            updateDataJson(); // Update data.json with new confidence level
        });
    }

    function updateDataJson() {
        fetch('/update-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(problemsData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update data.json');
            console.log('Data updated successfully');
        })
        .catch(error => console.error('Error updating data.json:', error));
    }

    function updateProgressBar() {
        const questionsDone = problemsData.filter(problem => problem.completed).length;
        const value = ((questionsDone / problemsData.length) * 100);
        console.log(`Progress: ${value}% (${questionsDone}/${problemsData.length})`);
        progressBarFill.style.width = `${value}%`;
        progressText.textContent = questionsDone;
    }
    

    function getDifficultyDotClass(difficulty) {
        const difficultyClassMap = {
            'Easy': 'dot-Easy',
            'Medium': 'dot-Medium',
            'Hard': 'dot-Hard'
        };
        return difficultyClassMap[difficulty] || '';
    }

    function triggerConfetti(element) {
        const rect = element.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 300,
            spread: 150,
            origin: { x, y },
        });
    }

    function addSortingEventListeners() {
        document.querySelectorAll("th[data-sort]").forEach(th => th.addEventListener("click", function() {
            const sortKey = th.getAttribute('data-sort');
            const asc = this.asc = !this.asc;

            console.log(`Sorting by ${sortKey} in ${asc ? 'ascending' : 'descending'} order`);

            problemsData.sort((a, b) => {
                if (typeof a[sortKey] === 'boolean') return asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
                if (typeof a[sortKey] === 'string') return asc ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
                return asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
            });

            renderTable();
            updateDataJson(); // Persist sorted data
        }));
    }

    function addHoverListeners() {
        tableBody.addEventListener('mouseenter', function(event) {
            if (event.target.tagName === 'TD') {
                event.target.parentElement.classList.add('hovered-row');
            }
        }, true);

        tableBody.addEventListener('mouseleave', function(event) {
            if (event.target.tagName === 'TD') {
                event.target.parentElement.classList.remove('hovered-row');
            }
        }, true);
    }

    function addPartClickListeners() {
        const part1 = document.querySelector('.header-name .part1');
        const part2 = document.querySelector('.header-name .part2');

        part1.addEventListener('click', function () {
            const asc = this.asc = !this.asc;
            problemsData.sort((a, b) => asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
            renderTable();
        });

        part2.addEventListener('click', function () {
            const asc = this.asc = !this.asc;
            const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
            problemsData.sort((a, b) => asc ? difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty] : difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
            renderTable();
        });
    }

    fetchData();
});
