document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const filterTasks = document.getElementById('filterTasks');
    const exportButton = document.getElementById('exportTasks');
    const importButton = document.getElementById('importTasks');
    const fileInput = document.getElementById('fileInput');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Add new task
    function addTask(taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        tasks.unshift(task); // Add new tasks to the beginning
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }

    // Delete task
    function deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        taskElement.classList.add('fade-out');
        
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }, 300);
    }

    // Toggle task completion
    function toggleTask(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    // Render tasks based on filter
    function renderTasks() {
        const filter = filterTasks.value;
        let filteredTasks = tasks;

        if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        taskList.innerHTML = '';
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="custom-checkbox" onclick="toggleTask(${task.id})">
                        <i class="fas fa-check"></i>
                    </div>
                    <span class="task-text">${task.text}</span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    // Export tasks to JSON file
    function exportTasksToFile() {
        const tasksJSON = JSON.stringify(tasks, null, 2);
        const blob = new Blob([tasksJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import tasks from JSON file
    function importTasksFromFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    // Merge with existing tasks, avoiding duplicates
                    const existingIds = new Set(tasks.map(task => task.id));
                    const newTasks = importedTasks.filter(task => !existingIds.has(task.id));
                    tasks = [...newTasks, ...tasks];
                    saveTasks();
                    renderTasks();
                    alert('Tasks imported successfully!');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                alert('Error importing tasks. Please make sure the file is valid JSON.');
            }
        };
        reader.readAsText(file);
    }

    // Event Listeners
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText);
        }
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const taskText = taskInput.value.trim();
            if (taskText) {
                addTask(taskText);
            }
        }
    });

    filterTasks.addEventListener('change', renderTasks);

    exportButton.addEventListener('click', exportTasksToFile);
    
    importButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importTasksFromFile(e.target.files[0]);
            e.target.value = ''; // Reset file input
        }
    });

    // Make functions available globally
    window.deleteTask = deleteTask;
    window.toggleTask = toggleTask;

    // Initial render
    renderTasks();
}); 