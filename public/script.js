document.addEventListener('DOMContentLoaded', function () {
    console.log('JavaScript is loaded and working!');

    let problemsData = []; // Variable to store loaded data

    // Fetch JSON data and render table
    fetch('/data.json')
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log the data to see what's being fetched
        problemsData = data;

        const h1 = document.querySelector('h1');    
        const progress = document.querySelector('.progress');

            // Set the width of the progress bar to match the <h1> width
        progress.style.width = `${h1.offsetWidth}px`;
        const questionsDone = problemsData.filter(problem => problem.completed).length;
        const myProgressBar = document.querySelector(".progress");
        updateProgress(myProgressBar, questionsDone);

        renderTable(problemsData);
        addSortingEventListeners();
        // addDotClickListener(); 
        addPartClickListeners(); 
    })
    .catch(error => console.error('Error loading JSON data:', error));

    // Function to render the table based on current data
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
            });

            const select = row.querySelector('select');
            select.addEventListener('change', function () {
                problem.confidence = parseInt(this.value); // Update problem data
                updateDataJson(problemsData); // Update data.json with new confidence level
            });
        });

        addHoverListeners();
    }

    // Function to update data.json file with new status and confidence level
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

    // Function to determine the class for difficulty dot based on difficulty level
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
                // Handle different data types
                if (typeof a[sortKey] === 'boolean' && typeof b[sortKey] === 'boolean') {
                    // Custom comparison for boolean status
                    const aValue = statusMapping[a[sortKey]];
                    const bValue = statusMapping[b[sortKey]];
                    console.log(`Comparing boolean: a[${sortKey}] = ${a[sortKey]}, b[${sortKey}] = ${b[sortKey]}`);
                    return asc ? aValue - bValue : bValue - aValue;
                } else if (typeof a[sortKey] === 'string' && typeof b[sortKey] === 'string') {
                    // Compare strings
                    console.log(`Comparing strings: a[${sortKey}] = ${a[sortKey]}, b[${sortKey}] = ${b[sortKey]}`);
                    return asc ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
                } else {
                    // Default to numeric comparison for other types
                    console.log(`Comparing numeric: a[${sortKey}] = ${a[sortKey]}, b[${sortKey}] = ${b[sortKey]}`);
                    return asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
                }
            });

            renderTable(problemsData);
            updateDataJson(problemsData);

            // // Toggle sorting indicator classes
            // document.querySelectorAll("th").forEach(th => th.classList.remove("sort-asc", "sort-desc"));
            // th.classList.toggle("sort-asc", asc);
            // th.classList.toggle("sort-desc", !asc);
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

    addHoverListeners();

    // function addDotClickListener() {
    //     const headerDot = document.querySelector('#sortDifficultyDot');
    //     headerDot.addEventListener('click', function() {
    //         const asc = this.asc = !this.asc;

    //         console.log(`Sorting by difficulty in ${asc ? 'ascending' : 'descending'} order`);
    //         console.log('Before sorting:', JSON.stringify(problemsData, null, 2));

    //         problemsData.sort((a, b) => {
    //             const difficultyOrder = {
    //                 'Easy': 1,
    //                 'Medium': 2,
    //                 'Hard': 3
    //             };
    //             const aValue = difficultyOrder[a.difficulty] || 0;
    //             const bValue = difficultyOrder[b.difficulty] || 0;
    //             return asc ? aValue - bValue : bValue - aValue;
    //         });

    //         console.log('After sorting:', JSON.stringify(problemsData, null, 2));
    //         renderTable(problemsData);
    //     });
    // }

    function addPartClickListeners() {
        const part1 = document.querySelector('.header-name .part1');
        const part2 = document.querySelector('.header-name .part2');
    
        part1.addEventListener('click', function () {
            const asc = this.asc = !this.asc;
            console.log(`Sorting by part1 (na) in ${asc ? 'ascending' : 'descending'} order`);
    
            problemsData.sort((a, b) => {
                return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
    
            renderTable(problemsData);
        });
    
        part2.addEventListener('click', function () {
            const asc = this.asc = !this.asc;
    
            console.log(`Sorting by difficulty in ${asc ? 'ascending' : 'descending'} order`);
            console.log('Before sorting:', JSON.stringify(problemsData, null, 2));
    
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
    
            console.log('After sorting:', JSON.stringify(problemsData, null, 2));
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
