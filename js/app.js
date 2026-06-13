document.addEventListener('DOMContentLoaded', () => {
  
  const todoForm = document.getElementById('todo-form');
  const taskInput = document.getElementById('task-input');
  const todoList = document.getElementById('todo-list');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const statusAnnouncer = document.getElementById('list-status');

  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';


  function renderTodos() {
    
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true; 
    });

    if (filteredTodos.length === 0) {
      todoList.innerHTML = `<li class="empty-state-msg">No tasks found in this view.</li>`;
      return;
    }

    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.setAttribute('data-id', todo.id);

      li.innerHTML = `
        <div class="todo-item-left">
          <input 
            type="checkbox" 
            id="check-${todo.id}" 
            ${todo.completed ? 'checked' : ''} 
            aria-label="Mark '${todo.text}' as completed"
          >
          <span class="todo-text" id="text-${todo.id}">${todo.text}</span>
        </div>
        <div class="todo-actions">
          <button type="button" class="edit-btn" aria-label="Edit task: ${todo.text}">Edit</button>
          <button type="button" class="delete-btn" aria-label="Delete task: ${todo.text}">Delete</button>
        </div>
      `;
      todoList.appendChild(li);
    });
  }

  function saveStateAndRefresh(announcementText) {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
    if (announcementText) {
      statusAnnouncer.textContent = announcementText;
    }
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now().toString(), 
      text: text,
      completed: false
    };

    todos.push(newTodo);
    taskInput.value = '';
    saveStateAndRefresh(`Task "${text}" successfully added.`);
  });

  todoList.addEventListener('click', (e) => {
    const target = e.target;
    const todoItemRow = target.closest('.todo-item');
    if (!todoItemRow) return;
    
    const id = todoItemRow.getAttribute('data-id');
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) return;

    if (target.type === 'checkbox') {
      todos[todoIndex].completed = target.checked;
      const status = todos[todoIndex].completed ? 'completed' : 'active';
      saveStateAndRefresh(`Task status updated to ${status}.`);
    }

    if (target.classList.contains('edit-btn')) {
      const currentText = todos[todoIndex].text;
      const newText = prompt('Update task name:', currentText);
      if (newText && newText.trim() !== '') {
        todos[todoIndex].text = newText.trim();
        saveStateAndRefresh(`Task renamed to "${newText.trim()}".`);
      }
    }

    if (target.classList.contains('delete-btn')) {
      const removedText = todos[todoIndex].text;
      todos.splice(todoIndex, 1);
      saveStateAndRefresh(`Task "${removedText}" has been deleted.`);
    }
  });

  const filterContainer = document.querySelector('.filter-controls');
  filterContainer.addEventListener('click', (e) => {
    const targetButton = e.target.closest('.filter-btn');
    if (!targetButton) return;

    filterButtons.forEach(btn => btn.classList.remove('active'));
    targetButton.classList.add('active');

    currentFilter = targetButton.getAttribute('data-filter');
    renderTodos();
    statusAnnouncer.textContent = `Showing ${currentFilter} views items.`;
  });

  renderTodos();
});