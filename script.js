// DOM REFS

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const counter = document.getElementById('counter');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterBtns = document.querySelectorAll('.filter-btn');


// STATE

let todos = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed'


// STORAGE HELPERS

function loadFromStorage() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (e) {
            todos = [];
        }
    } else {
        todos = [];
    }
}

function saveToStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// RENDER

function render() {
    const filtered = getFilteredTodos();

    if (filtered.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <span>📭</span>
                <p>Nothing here yet</p>
            </div>
        `;
    } else {
        let html = '';
        filtered.forEach(function(todo) {
            const checkedClass = todo.completed ? 'checked' : '';
            const itemClass = todo.completed ? 'todo-item completed' : 'todo-item';
            html += `
                <li class="${itemClass}" data-id="${todo.id}">
                    <div class="todo-check ${checkedClass}" data-action="toggle"></div>
                    <span class="task-text" data-action="toggle">${escapeHtml(todo.text)}</span>
                    <div class="task-actions">
                        <button class="btn-edit" data-action="edit">✎</button>
                        <button class="btn-delete" data-action="delete">✕</button>
                    </div>
                </li>
            `;
        });
        todoList.innerHTML = html;
    }

    updateCounter();
    updateClearBtn();
    updateFilterButtons();
}

function getFilteredTodos() {
    if (currentFilter === 'all') {
        return todos.slice();
    } else if (currentFilter === 'active') {
        return todos.filter(function(t) {
            return !t.completed;
        });
    } else if (currentFilter === 'completed') {
        return todos.filter(function(t) {
            return t.completed;
        });
    }
    return todos.slice();
}

function updateCounter() {
    const total = todos.length;
    const activeCount = todos.filter(function(t) {
        return !t.completed;
    }).length;

    if (total === 0) {
        counter.textContent = 'No tasks';
    } else {
        counter.textContent = activeCount + ' remaining · ' + total + ' total';
    }
}

function updateClearBtn() {
    const hasCompleted = todos.some(function(t) {
        return t.completed;
    });
    clearAllBtn.disabled = !hasCompleted;
}

function updateFilterButtons() {
    filterBtns.forEach(function(btn) {
        const filter = btn.getAttribute('data-filter');
        if (filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}


// HELPERS

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}


// CRUD OPERATIONS

function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') {
        todoInput.focus();
        return;
    }

    const newTodo = {
        id: generateId(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    saveToStorage();
    render();
    todoInput.value = '';
    todoInput.focus();
}

function deleteTodo(id) {
    const todo = todos.find(function(t) {
        return t.id === id;
    });
    if (!todo) return;

    const confirmDelete = confirm('Delete "' + todo.text + '" ?');
    if (!confirmDelete) return;

    todos = todos.filter(function(t) {
        return t.id !== id;
    });
    saveToStorage();
    render();
}

function toggleTodo(id) {
    const todo = todos.find(function(t) {
        return t.id === id;
    });
    if (!todo) return;

    todo.completed = !todo.completed;
    saveToStorage();
    render();
}

function editTodo(id) {
    const todo = todos.find(function(t) {
        return t.id === id;
    });
    if (!todo) return;

    const newText = prompt('Edit task:', todo.text);
    if (newText === null) return;

    const trimmed = newText.trim();
    if (trimmed === '') {
        alert('Task cannot be empty');
        return;
    }

    todo.text = trimmed;
    saveToStorage();
    render();
}

function clearCompleted() {
    const hasCompleted = todos.some(function(t) {
        return t.completed;
    });
    if (!hasCompleted) return;

    const confirmClear = confirm('Delete all completed tasks?');
    if (!confirmClear) return;

    todos = todos.filter(function(t) {
        return !t.completed;
    });
    saveToStorage();
    render();
}


// EVENT HANDLERS (Event Delegation)

function handleListClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const listItem = target.closest('.todo-item');
    if (!listItem) return;

    const id = listItem.getAttribute('data-id');

    if (action === 'toggle') {
        toggleTodo(id);
    } else if (action === 'delete') {
        deleteTodo(id);
    } else if (action === 'edit') {
        editTodo(id);
    }
}

// EVENT LISTENERS

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
    }
});

todoList.addEventListener('click', handleListClick);

clearAllBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        if (filter === currentFilter) return;
        currentFilter = filter;
        render();
    });
});


// INIT

loadFromStorage();
render();

// Auto-focus input on load
todoInput.focus();