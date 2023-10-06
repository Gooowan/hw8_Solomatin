document.addEventListener('DOMContentLoaded', function() {
    class TodoItem {
        constructor(text) {
            this.text = text;
            this.date = new Date();
            this.completed = false;
            this.daysToDeadline = "No deadline set";
        }
    }

    class TodoItemPremium extends TodoItem {
        constructor(text, imageUrl) {
            super(text);
            this.imageUrl = imageUrl; // Additional attribute for the premium version
        }
    }

    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const removeAllBtn = document.getElementById('remove-all-btn');
    const removeCompletedBtn = document.getElementById('remove-completed-btn');
    const sortAscBtn = document.getElementById('sort-asc-btn');
    const sortDescBtn = document.getElementById('sort-desc-btn');
    const clearStorageBtn = document.getElementById('clear-storage-btn');
    const pickTodoBtn = document.getElementById('pick-todo-btn');

    let tasks = [];

    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    }

    function createTaskElement(task, index) {
        const li = document.createElement('li');
        if (task.completed) {
            li.classList.add('completed');
        }
        li.innerHTML = `
        <span class="checkbox" style="margin-left: 10px" data-index="${index}">${task.completed ? '✅' : '❌'}</span>
        <span class="task-text" data-index="${index}" style="display:inline;">${task.text}</span>
        <input type="text" class="edit-task-input" data-index="${index}" style="display:none;" value="${task.text}">
        <span class="days-to-deadline" data-index="${index}">${task.daysToDeadline} </span>
        <input type="number" class="edit-deadline-input" data-index="${index}" style="display:none;" min="1" value="${task.daysToDeadline}">
        <button class="edit-deadline-btn" data-index="${index}">Edit Deadline</button>
        <button class="remove-btn" style="margin-top: 5px" data-index="${index}">Remove</button>
        `;
        return li;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            taskList.appendChild(createTaskElement(task, index));
        });
        saveTasksToLocalStorage();
    }

    function addOrUpdateTask(e, editIndex = null) {
        if ((e.keyCode && e.keyCode !== 13 && e.keyCode !== 27) || !taskInput.value.trim()) return;

        if (e.keyCode === 27) {
            taskInput.value = '';
            saveTaskBtn.onclick = addOrUpdateTask;
            return;
        }

        if (editIndex !== null) {
            tasks[editIndex] = new TodoItem(taskInput.value.trim());
            tasks[editIndex].completed = tasks[editIndex].completed;
        } else {
            tasks.unshift(new TodoItem(taskInput.value.trim()));
        }
        taskInput.value = '';
        saveTaskBtn.onclick = addOrUpdateTask;
        renderTasks();
    }

    sortAscBtn.addEventListener('click', function() {
        tasks.sort((a, b) => a.date - b.date);
        renderTasks();
    });

    sortDescBtn.addEventListener('click', function() {
        tasks.sort((a, b) => b.date - a.date);
        renderTasks();
    });

    clearStorageBtn.addEventListener('click', function() {
        localStorage.clear();
        tasks = [];
        renderTasks();
    });

    pickTodoBtn.addEventListener('click', function() {
        const previousActive = taskList.querySelector('.active');
        if (previousActive) {
            previousActive.classList.remove('active');
        }

        const activeTodos = tasks.filter(task => !task.completed);
        if (activeTodos.length) {
            const randomTodo = activeTodos[Math.floor(Math.random() * activeTodos.length)];
            const index = tasks.indexOf(randomTodo);
            const todoElem = taskList.querySelector(`li [data-index="${index}"]`);
            todoElem.classList.add('active');
        }
    });

    taskList.addEventListener('click', function(e) {
        const index = e.target.dataset.index;
        if (e.target.classList.contains('checkbox')) {
            tasks[index].completed = !tasks[index].completed;
            renderTasks();
        } else if (e.target.classList.contains('remove-btn')) {
            tasks.splice(index, 1);
            renderTasks();
        } else if (e.target.classList.contains('edit-deadline-btn')) {
            const inputElem = document.querySelector(`.edit-deadline-input[data-index="${index}"]`);
            const spanElem = document.querySelector(`.days-to-deadline[data-index="${index}"]`);
            inputElem.style.display = "inline";
            spanElem.style.display = "none";
            inputElem.focus();
        }
    });

    taskList.addEventListener('dblclick', function(e) {
        e.preventDefault();
        const index = e.target.dataset.index;
        if (e.target.classList.contains('task-text')) {
            const inputElem = document.querySelector(`.edit-task-input[data-index="${index}"]`);
            const spanElem = e.target;

            spanElem.style.display = "none";
            inputElem.style.display = "inline";
            inputElem.focus();
        }
    });

    saveTaskBtn.addEventListener('click', addOrUpdateTask);
    taskInput.addEventListener('keydown', addOrUpdateTask);

    removeAllBtn.addEventListener('click', function() {
        if (!tasks.some(task => !task.completed) || confirm('Are you sure?')) {
            tasks = [];
            renderTasks();
        }
    });

    removeCompletedBtn.addEventListener('click', function() {
        tasks = tasks.filter(task => !task.completed);
        renderTasks();
    });

    taskList.addEventListener('blur', function(e) {
        if (e.target.classList.contains('edit-deadline-input')) {
            const index = e.target.dataset.index;
            tasks[index].daysToDeadline = `${parseInt(e.target.value, 10)} days to deadline`;
            const spanElem = document.querySelector(`.days-to-deadline[data-index="${index}"]`);
            spanElem.textContent = tasks[index].daysToDeadline;
            e.target.style.display = "none";
            spanElem.style.display = "inline";
            renderTasks();
        } else if (e.target.classList.contains('edit-task-input')) {
            const index = e.target.dataset.index;
            tasks[index].text = e.target.value.trim();
            const spanElem = document.querySelector(`.task-text[data-index="${index}"]`);
            spanElem.textContent = tasks[index].text;
            e.target.style.display = "none";
            spanElem.style.display = "inline";
            renderTasks();
        }
    }, true);

    loadTasksFromLocalStorage();
    renderTasks();  // Initial render of tasks
});