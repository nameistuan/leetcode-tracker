document.addEventListener('DOMContentLoaded', function () {
    console.log('JavaScript is loaded and working!');

    let problemsData = []; // Variable to store loaded data

    // Fetch JSON data and render table
    fetchDataAndReorder();

    async function fetchDataAndReorder() {
        try {
            const [newOrder, data] = await Promise.all([
                fetch('/newprob.txt').then(response => response.text()).then(text => text.split('\n').map(line => line.trim()).filter(line => line.length > 0)),
                fetch('/data.json').then(response => response.json())
            ]);

            const dataMap = new Map(data.map(problem => [problem.name, problem]));

            // Reorder data based on newOrder
            const orderedData = newOrder.map(name => dataMap.get(name)).filter(problem => problem !== undefined);

            problemsData = orderedData;

            renderTable(problemsData);
            
            const h1 = document.querySelector('h1');    
            const progress = document.querySelector('.progress');

            // Set the width of the progress bar to match the <h1> width
            progress.style.width = `${h1.offsetWidth}px`;
            const questionsDone = problemsData.filter(problem => problem.completed).length;
            const myProgressBar = document.querySelector(".progress");
            updateProgress(myProgressBar, questionsDone);

            addSortingEventListeners();
            addPartClickListeners(); 
            addHoverListeners();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function renderTable(data) {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = ''; // Clear existing table rows

        data.forEach(problem => {
            const row = document.createElement('tr');
            const difficultyClass = getDifficultyDotClass(problem.difficulty);
            row.innerHTML = `
                <td>
                    <span class="dot ${difficultyClass}"></span>
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

            const checkbox = row.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function () {
                problem.completed = this.checked; // Update problem data
                updateDataJson(problemsData); // Update data.json with new status

                const questionsDone = problemsData.filter(problem => problem.completed).length;
                const myProgressBar = document.querySelector(".progress");
                updateProgress(myProgressBar, questionsDone);

                // Trigger confetti only if the checkbox is checked
                if (this.checked) {
                    const rect = this.getBoundingClientRect();
                    const x = (rect.left + rect.width / 2) / window.innerWidth; // Center X
                    const y = (rect.top + rect.height / 2) / window.innerHeight; // Center Y
                    confetti({
                        particleCount: 300,
                        spread: 150,
                        origin: { x, y },
                    });
                }
            });

            const select = row.querySelector('select');
            select.addEventListener('change', function () {
                problem.confidence = parseInt(this.value); // Update problem data
                updateDataJson(problemsData); // Update data.json with new confidence level
            });
        });
    }

    function updateDataJson(data) {
        fetch('/update-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update data.json');
            }
            console.log('Data updated successfully');
        })
        .catch(error => console.error('Error updating data.json:', error));
    }

    function getDifficultyDotClass(difficulty) {
        switch (difficulty) {
            case 'Easy':
                return 'dot-Easy';
            case 'Medium':
                return 'dot-Medium';
            case 'Hard':
                return 'dot-Hard';
            default:
                return ''; // Default class or empty string if no match
        }
    }

    const statusMapping = {
        true: 1,
        false: 0
    };

    function addSortingEventListeners() {
        document.querySelectorAll("th[data-sort]").forEach(th => th.addEventListener("click", function() {
            const sortKey = th.getAttribute('data-sort');
            const asc = this.asc = !this.asc;
    
            console.log(`Sorting by ${sortKey} in ${asc ? 'ascending' : 'descending'} order`);
    
            problemsData.sort((a, b) => {
                if (typeof a[sortKey] === 'boolean' && typeof b[sortKey] === 'boolean') {
                    // Handle boolean values for sorting
                    if (asc) {
                        // Ascending: true (1) comes before false (0)
                        return (a[sortKey] === b[sortKey]) ? 0 : a[sortKey] ? -1 : 1;
                    } else {
                        // Descending: false (0) comes before true (1)
                        return (a[sortKey] === b[sortKey]) ? 0 : a[sortKey] ? 1 : -1;
                    }
                } else if (typeof a[sortKey] === 'string' && typeof b[sortKey] === 'string') {
                    // Handle string values for sorting
                    return asc ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
                } else {
                    // Handle numeric values for sorting
                    return asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
                }
            });
    
            renderTable(problemsData);
            updateDataJson(problemsData);
        }));
    }
    

    function addHoverListeners() {
        const statusCells = document.querySelectorAll('.table td:nth-child(2), .table td:nth-child(3), .table td:nth-child(4)');
        statusCells.forEach(cell => {
            cell.addEventListener('mouseenter', function() {
                this.parentElement.classList.add('hovered-row');
            });
            cell.addEventListener('mouseleave', function() {
                this.parentElement.classList.remove('hovered-row');
            });
        });
    }

    function addPartClickListeners() {
        const part1 = document.querySelector('.header-name .part1');
        const part2 = document.querySelector('.header-name .part2');
    
        part1.addEventListener('click', function () {
            const asc = this.asc = !this.asc;
            problemsData.sort((a, b) => {
                return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
    
            renderTable(problemsData);
        });
    
        part2.addEventListener('click', function () {
            const asc = this.asc = !this.asc;
            problemsData.sort((a, b) => {
                const difficultyOrder = {
                    'Easy': 1,
                    'Medium': 2,
                    'Hard': 3
                };
                const aValue = difficultyOrder[a.difficulty] || 0;
                const bValue = difficultyOrder[b.difficulty] || 0;
                return asc ? aValue - bValue : bValue - aValue;
            });
            renderTable(problemsData);
        });
    }

    function updateProgress(progressBar, questionsDone){
        value = ((questionsDone/problemsData.length)*100); // currently 125?
        console.log(`Number of problems: ${problemsData.length}, value: ${value}`);
        progressBar.querySelector(".progress-fill").style.width = `${value}%`;
        progressBar.querySelector(".progress-text").textContent = questionsDone;
    }
});
