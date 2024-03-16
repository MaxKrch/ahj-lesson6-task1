const startBoards = [
	{
		name: "Planned",
		tag: "planned",
	},
	{
		name: "In progress",
		tag: "progress",
	},
	{
		name: "Done",
		tag: "done",
	},
];

export default class Render {
	constructor(widget) {
		this.widget = widget;
		this.boards;
		this.headerButtons = {};
		this.boardsList = {};
		this.newTaskPanels = {
			section: {},
			form: {},
			text: {},
			open: {},
			add: {},
			clear: {},
			close: {},
		};

		this.fullTask = {};
		this.modal = {};
		this.message = {};

		this.movingItems = {
			selected: null,
			moving: null,
			blank: null,
		};

		this.mouseListeners = {
			down: [],
			move: [],
			up: [],
		};

		this.touchListeners = {
			start: [],
			move: [],
			end: [],
		};

		this.headerButtonsListeners = {
			clickClear: [],
			clickLoad: [],
			clickSave: [],
		};

		this.boardsListeners = {
			click: [],
			keypress: [],
		};

		this.fullTaskListeners = {
			clickEdit: [],
			clickSave: [],
			clickCancel: [],
		};

		this.modalListeners = {
			clickConfirm: [],
			clickCancel: [],
		};

		this.messageListeners = {
			clickOk: [],
		};

		this.init();
	}

	init() {
		this.renderPage();
		this.registerEvent();
	}

	renderPage() {
		const header = this.renderHeader();
		this.widget.append(header);

		const main = this.renderMain();
		this.widget.append(main);
	}

	registerEvent() {
		document.addEventListener("mousedown", (event) => {
			this.mouseListeners.down.forEach((item) => item(event));
		});
		document.addEventListener("mousemove", (event) => {
			this.mouseListeners.move.forEach((item) => item(event));
		});
		document.addEventListener("mouseup", (event) => {
			this.mouseListeners.up.forEach((item) => item(event));
		});

		document.addEventListener("touchstart", (event) => {
			this.touchListeners.start.forEach((item) => item(event));
		});
		document.addEventListener("touchmove", (event) => {
			if(this.activeTouch) {
				event.preventDefault()
			}
			this.touchListeners.move.forEach((item) => item(event));
		});
		document.addEventListener("touchend", (event) => {
			this.touchListeners.end.forEach((item) => item(event));
		});

		this.headerButtons.load.addEventListener("click", (event) => {
			this.headerButtonsListeners.clickLoad.forEach((item) => item(event));
		});
		this.headerButtons.clear.addEventListener("click", (event) => {
			this.headerButtonsListeners.clickClear.forEach((item) => item(event));
		});
		this.headerButtons.save.addEventListener("click", (event) => {
			this.headerButtonsListeners.clickSave.forEach((item) => item(event));
		});

		this.boards.addEventListener("click", (event) => {
			event.preventDefault();
			this.boardsListeners.click.forEach((item) => item(event));
		});
		// this.boards.addEventListener('keypress', event => {
		// 	if(event.keyCode === 13 && !event.shiftKey) {
		// 		event.preventDefault();
		// 		this.boardsListeners.keypress.forEach(item => item(event))
		// 	}
		// });

		this.fullTask.edit.addEventListener("click", () => {
			this.fullTaskListeners.clickEdit.forEach((item) => item());
		});
		this.fullTask.save.addEventListener("click", (event) => {
			this.fullTaskListeners.clickSave.forEach((item) => item(event));
		});
		this.fullTask.cancel.addEventListener("click", (event) => {
			this.fullTaskListeners.clickCancel.forEach((item) => item(event));
		});

		this.modal.confirm.addEventListener("click", (event) => {
			this.modalListeners.clickConfirm.forEach((item) => item(event));
		});
		this.modal.cancel.addEventListener("click", (event) => {
			this.modalListeners.clickCancel.forEach((item) => item(event));
		});

		this.message.ok.addEventListener("click", (event) => {
			this.messageListeners.clickOk.forEach((item) => item(event));
		});
	}

	renderHeader() {
		const header = document.createElement("header");
		header.classList.add("container", "header");
		header.innerHTML = `
			<div class="header-button-block">
				<button class="button-visible main-button header-button-load">
					Load
				</button>
				
				<button class="button-visible main-button header-button-clear">
					Clear
				</button>				
				
				<button class="button-visible main-button header-button-save">
					Save
				</button>
			</div>
		`;
		this.saveElementsHeader(header);
		return header;
	}

	renderMain() {
		const main = document.createElement("main");
		main.classList.add("container", "main");

		const boardList = this.renderBoardList();
		main.append(boardList);

		const fullTask = this.renderShowFullTask();
		main.append(fullTask);

		const modal = this.renderModal();
		main.append(modal);

		const message = this.renderMessage();
		main.append(message);

		this.saveElementsMain(main);
		return main;
	}

	renderBoardList() {
		const boardList = document.createElement("article");
		boardList.classList.add("boards-list", "not-selecting");

		const planned = this.renderBoard(startBoards[0]);
		boardList.append(planned);

		const progress = this.renderBoard(startBoards[1]);
		boardList.append(progress);

		const done = this.renderBoard(startBoards[2]);
		boardList.append(done);

		return boardList;
	}

	renderBoard(board) {
		const newBoard = document.createElement("section");
		newBoard.classList.add(`board`);
		newBoard.dataset.board = board.tag;

		const boardTitle = document.createElement("h2");
		boardTitle.classList.add(`board-title`);
		boardTitle.dataset.board = board.tag;
		boardTitle.textContent = board.name;
		newBoard.append(boardTitle);

		const boardUl = document.createElement("ul");
		boardUl.classList.add(`board-list`);
		boardUl.dataset.board = board.tag;
		newBoard.append(boardUl);

		const boardNewTask = this.renderNewTaskSection(board);
		newBoard.append(boardNewTask);

		return newBoard;
	}

	renderNewTaskSection(board) {
		const newTask = document.createElement("section");
		newTask.classList.add(`newtask`);
		newTask.dataset.board = board.tag;
		newTask.innerHTML = `
			<div class="newtask-openform" data-board="${board.tag}">
				<span class="newtask-mark">+</span> Add New Task
			</div>
			
			<form action="#" class="newtask-form hidden-item" data-board="${board.tag}" method="POST">
				<textarea maxlength="150" type="text" class="newtask-form__area" data-board="${board.tag}" placeholder="New Task"></textarea>
	  
				<div class="newtask-buttons" data-board="${board.tag}">
					<button class="button-visible newtask-button-visible newtask-button-add" data-board="${board.tag}">
						Add
					</button>
							
					<button class="button-visible newtask-button-visible newtask-button-clear" data-board="${board.tag}">
						Clear
					</button>
	
					<div class="button-inline newtask-button__delete" data-board="${board.tag}">
						&times;
					</div>
				</div>
			</form>
		`;
		return newTask;
	}

	renderTaskItem(task, tag) {
		const taskLi = document.createElement("li");
		taskLi.classList.add("task-wrap");
		taskLi.dataset.id = task.id;
		taskLi.dataset.board = tag;
		taskLi.innerHTML = `
			<article class="task-item" data-board="${tag}">
				<h3 class="task-item__title">
					${task.title}
				</h3>
				
				<button class="button-visible task-item-button task-item-button__open" data-id="${task.id}" data-board="${tag}">
					Open Task
				</button>
				
				<div class="button-inline-block">
					<div class="button-inline task-item__delete" data-id="${task.id}" data-board="${tag}">
						&times;
					</div>
					<div class="button-inline task-item__option">
						&hellip;
					</div>
				</div>
			</article>
		`;
		return taskLi;
	}

	renderShowFullTask() {
		const fullTask = document.createElement("article");
		fullTask.classList.add(`backdor`, `article-wrap`, `hidden-item`);

		fullTask.innerHTML = `
			<div class="article">
				<h3 class="article-header" contenteditable="false">
					Title
				</h3>
					
				<div class="article-body" contenteditable="false">
					Descriprion
				</div>
					
				<div class="article-buttons">
					<button class="button-visible main-button article-button-edit">
						Edit
					</button>
			
					<button class="button-visible main-button article-button-save hidden-item">
						Save
					</button>
					
					<button class="button-visible main-button article-button-cancel">
						Cancel
					</button>

				</div>
			</div>
		`;
		return fullTask;
	}

	renderModal() {
		const modal = document.createElement("aside");
		modal.classList.add(`backdor`, `modal-wrap`, `hidden-item`);

		modal.innerHTML = `
				<div class="modal">
				
					<p class="modal-header">
						Are you sure you want to delete this task?
					</p>
			
					<div class="modal-body">
					</div>
				
					<div class="modal-buttons">
						<button class="button-visible main-button modal-confirm">
							Yes
						</button>
						<button class="button-visible main-button modal-cancel">
							Cancel
						</button>
					</div>
				</div>
			`;
		return modal;
	}

	renderMessage() {
		const message = document.createElement("aside");
		message.classList.add(`backdor`, `message-wrap`, `hidden-item`);

		message.innerHTML = `
				<div class="message">
					<div class="message-text">
						Title task
					</div>
		
					<button class="button-visible main-button message-button message-ok">
						Ok
					</button>
				</div>
			`;
		return message;
	}

	saveElementsHeader(header) {
		this.headerButtons.load = header.querySelector(".header-button-load");
		this.headerButtons.clear = header.querySelector(".header-button-clear");
		this.headerButtons.save = header.querySelector(".header-button-save");
	}

	saveElementsMain(main) {
		this.boards = main.querySelector(".boards-list");

		startBoards.forEach((item) => {
			const board = main.querySelector(`[data-board="${item.tag}"]`);
			this.boardsList[item.tag] = board;
			this.saveElementsBoard(board, item.tag);
		});

		const fullTask = main.querySelector(".article-wrap");
		this.saveElementsFullTask(fullTask);

		const modal = main.querySelector(".modal-wrap");
		this.saveElementsModal(modal);

		const message = main.querySelector(".message-wrap");
		this.saveElementsMessage(message);
	}

	saveElementsBoard(board, tag) {
		const newTaskPanel = board.querySelector(".newtask");

		this.newTaskPanels.section[tag] = newTaskPanel;

		this.newTaskPanels.open[tag] = newTaskPanel.querySelector(".newtask-openform");

		this.newTaskPanels.form[tag] = newTaskPanel.querySelector(".newtask-form");
		this.newTaskPanels.text[tag] = newTaskPanel.querySelector(".newtask-form__area");

		this.newTaskPanels.add[tag] = newTaskPanel.querySelector(".newtask-button-add");
		this.newTaskPanels.clear[tag] = newTaskPanel.querySelector(".newtask-button-clear");
		this.newTaskPanels.close[tag] = newTaskPanel.querySelector(".newtask-button__delete");
	}

	saveElementsFullTask(article) {
		this.fullTask.wrap = article;
		this.fullTask.body = article.querySelector(".article");
		this.fullTask.title = article.querySelector(".article-header");
		this.fullTask.text = article.querySelector(".article-body");
		this.fullTask.edit = article.querySelector(".article-button-edit");
		this.fullTask.save = article.querySelector(".article-button-save");
		this.fullTask.cancel = article.querySelector(".article-button-cancel");
	}

	saveElementsModal(modal) {
		this.modal.wrap = modal;
		this.modal.body = modal.querySelector(".modal");
		this.modal.title = modal.querySelector(".modal-header");
		this.modal.text = modal.querySelector(".modal-body");
		this.modal.confirm = modal.querySelector(".modal-confirm");
		this.modal.cancel = modal.querySelector(".modal-cancel");
	}

	saveElementsMessage(message) {
		this.message.wrap = message;
		this.message.body = message.querySelector(".message");
		this.message.text = message.querySelector(".message-text");
		this.message.ok = message.querySelector(".message-ok");
	}

	addMouseListeners(field, callback) {
		this.mouseListeners[field].push(callback);
	}
	addTouchListeners(field, callback) {
		this.touchListeners[field].push(callback);
	}
	addHeaderButtonsListeners(field, callback) {
		this.headerButtonsListeners[field].push(callback);
	}
	addBoardsListeners(field, callback) {
		this.boardsListeners[field].push(callback);
	}
	addFullTaskListeners(field, callback) {
		this.fullTaskListeners[field].push(callback);
	}
	addModalListeners(field, callback) {
		this.modalListeners[field].push(callback);
	}
	addMessageListeners(field, callback) {
		this.messageListeners[field].push(callback);
	}

	showOrHideAddTask(boardTag) {
		const form = this.newTaskPanels.form[boardTag];
		const mark = this.newTaskPanels.section[boardTag].querySelector(".newtask-mark");
		const newMark = mark.innerHTML === "+" ? "&times;" : "+";

		mark.innerHTML = newMark;
		form.classList.toggle("hidden-item");
	}

	showMessage(message, idmessage) {
		this.message.text.textContent = message;
		this.message.wrap.classList.remove("hidden-item");
		this.message.ok.dataset.id = idmessage;
		this.showDarkBase();
	}

	hideMessage() {
		this.message.wrap.classList.add("hidden-item");
		this.message.text.textContent = "";
		this.hideDarkBase();
	}

	addTaskItem(task, board) {
		const newTask = this.renderTaskItem(task, board);

		this.boardsList[board].querySelector(".board-list").append(newTask);
	}

	clearNewTask(board) {
		this.newTaskPanels.text[board].value = "";
	}

	hideNewTask(board) {
		this.showOrHideAddTask(board);
	}

	showFullTask(task, board) {
		this.fullTask.body.dataset.id = task.id;
		this.fullTask.save.dataset.id = task.id;
		this.fullTask.save.dataset.board = board;

		this.showDarkBase();
		this.fullTask.title.innerHTML = task.title;
		this.fullTask.text.innerHTML = task.text;
		this.fullTask.wrap.classList.remove("hidden-item");
	}

	hideFullTask() {
		this.fullTask.title.textContent = "";
		this.fullTask.text.textContent = "";

		this.fullTask.wrap.classList.add("hidden-item");
		this.hideDarkBase();
	}

	showConfirmDeleteTask(task, board) {
		const title = "Вы действительно хотите навсегда удалить эту задачу?";
		this.showModal(title, task.title, "del", board, task.id);
	}

	showModal(title, text, action, board, id) {
		this.modal.wrap.classList.remove("hidden-item");
		this.showDarkBase();

		this.modal.title.innerHTML = title;
		this.modal.text.innerHTML = text;
		this.modal.confirm.dataset.action = action;
		this.modal.confirm.dataset.id = id;
		this.modal.confirm.dataset.board = board;
	}

	hideModal() {
		this.modal.wrap.classList.add("hidden-item");
		this.hideDarkBase();

		this.modal.title.innerHTML = "";
		this.modal.text.innerHTML = "";
		this.modal.confirm.dataset.action = "";
		this.modal.confirm.dataset.id = "";
	}

	removeTask(id, board) {
		const boardEl = this.boardsList[board];
		const task = boardEl.querySelector(`[data-id="${id}"`);
		task.remove();
	}

	showDarkBase() {
		document.body.classList.add("hide");
	}

	hideDarkBase() {
		document.body.classList.remove("hide");
	}

	enableEditingTask() {
		this.fullTask.title.setAttribute("contenteditable", "true");
		this.fullTask.text.setAttribute("contenteditable", "true");

		this.fullTask.title.classList.add("editingTask");
		this.fullTask.text.classList.add("editingTask");

		this.fullTask.text.focus();
	}

	disableEditingTask() {
		this.fullTask.title.setAttribute("contenteditable", "false");
		this.fullTask.text.setAttribute("contenteditable", "false");

		this.fullTask.title.classList.remove("editingTask");
		this.fullTask.text.classList.remove("editingTask");
	}

	showButtonEditTask() {
		this.fullTask.edit.classList.remove("hidden-item");
	}

	hideButtonEditTask() {
		this.fullTask.edit.classList.add("hidden-item");
	}

	showButtonSaveTask() {
		this.fullTask.save.classList.remove("hidden-item");
	}

	hideButtonSaveTask() {
		this.fullTask.save.classList.add("hidden-item");
	}

	updateTask(id, board, title) {
		const task = this.boardsList[board].querySelector(`[data-id="${id}"]`);
		const titleTask = task.querySelector(".task-item__title");
		titleTask.innerHTML = title;
	}

	clearBoards() {
		for (let key in this.boardsList) {
			const board = this.boardsList[key];
			const listTask = board.querySelector(".board-list");
			listTask.innerHTML = "";
		}
	}

	loadBoards(boards) {
		for (let key in boards) {
			const board = boards[key];
			for (let task of board) {
				this.addTaskItem(task, key);
			}
		}
	}

	selectingTask(task) {
		task.classList.add("selected");
	}

	cloningItem(item) {
		const clone = item.cloneNode(true);
		clone.classList.add("moving");

		document.body.append(clone);
		this.movingItems.moving = clone;
		return clone;
	}

	moveItem(top, left) {
		this.movingItems.moving.style.top = `${top}px`;
		this.movingItems.moving.style.left = `${left}px`;
	}

	createBlankItem() {
		const blankLi = document.createElement("li");
		blankLi.classList.add("task-wrap", "blank-task");

		const sizes = this.movingItems.selected.getBoundingClientRect();
		const height = sizes.height;
		const width = sizes.width;
		blankLi.style.height = `${height}px`;
		blankLi.style.width = `${width}px`;

		this.movingItems.blank = blankLi;

		this.removeSelectedFromDOM();
	}

	removeSelectedFromDOM() {
		this.movingItems.selected.classList.add("hidden-item");
	}

	endingMoving() {
		this.movingItems.moving.remove();
		this.movingItems.selected.classList.remove("selected", "hidden-item");

		this.movingItems = {
			selected: null,
			moving: null,
			blank: null,
		};
	}

	updateTagBoard() {
		const selected = this.movingItems.selected;
		const tagTask = selected.dataset.board;

		const activeUl = this.movingItems.selected.closest("ul.board-list");
		const tagBoard = activeUl.dataset.board;

		const listLi = [...activeUl.querySelectorAll("li.task-wrap")];
		const index = listLi.indexOf(selected);

		const updateData = {
			id: Number(selected.dataset.id),
			oldTag: tagTask,
			newTag: tagBoard,
			newIndex: index,
		};

		if (tagBoard !== tagTask) {
			selected.dataset.board = tagBoard;
		}

		return updateData;
	}
}
