import Render from "./Render";
import State from "./State";

export default class Widget {
	constructor(container) {
		this.widget = document.querySelector(container);
		this.render = new Render(this.widget);
		this.state = new State();

		this.init();
	}

	init() {
		this.addEventListeners();
	}

	addEventListeners() {
		this.render.addMouseListeners("down", this.byMouseDown.bind(this));
		this.render.addMouseListeners("move", this.byMouseMove.bind(this));
		this.render.addMouseListeners("up", this.byMouseUp.bind(this));

		this.render.addTouchListeners("start", this.byTouchStart.bind(this));
		this.render.addTouchListeners("move", this.byTouchMove.bind(this));
		this.render.addTouchListeners("end", this.byTouchEnd.bind(this));

		this.render.addHeaderButtonsListeners("clickClear", this.byHeaderButtonsClickClear.bind(this));
		this.render.addHeaderButtonsListeners("clickLoad", this.byHeaderButtonsClickLoad.bind(this));
		this.render.addHeaderButtonsListeners("clickSave", this.byHeaderButtonsClickSave.bind(this));

		this.render.addBoardsListeners("click", this.byBoardsTaskСlick.bind(this));
		this.render.addBoardsListeners("keypress", this.byBoardsTaskKeypress.bind(this));

		this.render.addFullTaskListeners("clickEdit", this.byFullTaskClickEdit.bind(this));
		this.render.addFullTaskListeners("clickSave", this.byFullTaskClickSave.bind(this));
		this.render.addFullTaskListeners("clickCancel", this.byFullTaskClickCancel.bind(this));

		this.render.addModalListeners("clickConfirm", this.byModalClickConfirm.bind(this));
		this.render.addModalListeners("clickCancel", this.byModalClickCancel.bind(this));

		this.render.addMessageListeners("clickOk", this.byMessageClickOk.bind(this));
	}

	byMouseDown(event) {
		const classes = event.target.classList;
		if (classes.contains("task-item-button__open") || classes.contains("task-item__delete") || classes.contains("task-item__option")) {
			return;
		}

		const isTask = event.target.closest("li.task-wrap");

		if (isTask) {
			this.state.movingPositions.startX = event.pageX;
			this.state.movingPositions.startY = event.pageY;
			this.startMovedTask(isTask);
		}
	}

	byMouseMove(event) {
		if (!this.render.movingItems.moving) {
			return;
		}

		this.calcNewCoord(event.pageX, event.pageY);
		this.render.movingItems.moving.style.display = "none";

		const elementUnderCursor = document.elementFromPoint(event.pageX, event.pageY);

		const isWindowArea = elementUnderCursor || false;

		if (isWindowArea) {
			const isNewTaskPanel = elementUnderCursor.closest("section.newtask");

			if (isNewTaskPanel) {
				this.chekBlankItem(isNewTaskPanel, "add");
			}

			const isTask = elementUnderCursor.closest("li.task-wrap");

			if (isTask) {
				if (!isTask.classList.contains("selected")) {
					this.chekBlankItem(isTask, "task");
				}
			}
		}
		this.render.movingItems.moving.style.removeProperty("display");
	}

	byMouseUp() {
		if (!this.render.movingItems.moving) {
			return;
		}

		if (this.render.movingItems.blank) {
			this.replaceSelectedAndBlank();
			this.render.movingItems.blank.remove();
		}

		const updateData = this.render.updateTagBoard();
		this.state.updateBoardAfterMove(updateData);

		this.render.endingMoving();
		this.state.clearMovingPosition();
	}

	byTouchStart(event) {
		this.touch = setTimeout(() => {
			window.navigator.vibrate(100);
			const classes = event.target.classList;
			if (classes.contains("task-item-button__open") || classes.contains("task-item__delete") || classes.contains("task-item__option")) {
				return;
			}

			const isTask = event.target.closest("li.task-wrap");
			if (isTask) {
				document.body.classList.add("no-touch-action");
				this.state.movingPositions.startX = event.changedTouches[0].pageX;
				this.state.movingPositions.startY = event.changedTouches[0].pageY;
				this.startMovedTask(isTask);
			}
		}, 1000);
	}

	byTouchMove(event) {
		console.log(event.targetTouches[0].clientY, event.view.innerHeight);

		if (event.targetTouches[0].clientX <= 25) {
			this.render.boards.scrollBy(-25, 0);
		}

		if (event.targetTouches[0].clientX >= event.view.innerWidth - 25) {
			this.render.boards.scrollBy(25, 0);
		}

		if (!this.render.movingItems.moving) {
			return;
		}

		this.calcNewCoord(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
		this.render.movingItems.moving.style.display = "none";

		const elementUnderCursor = document.elementFromPoint(event.changedTouches[0].pageX, event.changedTouches[0].pageY);

		const isWindowArea = elementUnderCursor || false;

		if (isWindowArea) {
			const isNewTaskPanel = elementUnderCursor.closest("section.newtask");

			if (isNewTaskPanel) {
				this.chekBlankItem(isNewTaskPanel, "add");
			}

			const isTask = elementUnderCursor.closest("li.task-wrap");

			if (isTask) {
				if (!isTask.classList.contains("selected")) {
					this.chekBlankItem(isTask, "task");
				}
			}
		}
		this.render.movingItems.moving.style.removeProperty("display");
	}

	byTouchEnd() {
		clearTimeout(this.touch);
		if (!this.render.movingItems.moving) {
			return;
		}

		document.body.classList.remove("no-touch-action");

		if (this.render.movingItems.blank) {
			this.replaceSelectedAndBlank();
			this.render.movingItems.blank.remove();
		}

		const updateData = this.render.updateTagBoard();
		this.state.updateBoardAfterMove(updateData);

		this.render.endingMoving();
		this.state.clearMovingPosition();
	}

	byHeaderButtonsClickClear() {
		this.render.showModal("Очистить доски?", "Текущие задачи будут стерты!", "clear");
	}

	byHeaderButtonsClickLoad() {
		this.render.showModal("Загрузить старые доски?", "Текущие задачи будут стерты!", "load");
	}

	byHeaderButtonsClickSave() {
		this.state.saveState();

		const idMessage = setTimeout(() => {
			this.render.hideMessage(idMessage);
		}, 3000);
		this.render.showMessage("Список задач сохранен", idMessage);
	}

	byBoardsTaskСlick(event) {
		if (event.target.classList.contains("newtask-openform")) {
			this.render.showOrHideAddTask(event.target.dataset.board);
			return;
		}

		if (event.target.classList.contains("newtask-button-add")) {
			this.addNewTask(event.target.dataset.board);
			return;
		}

		if (event.target.classList.contains("newtask-button-clear")) {
			this.render.clearNewTask(event.target.dataset.board);
			return;
		}

		if (event.target.classList.contains("newtask-button__delete")) {
			const board = event.target.dataset.board;
			this.render.hideNewTask(board);
			return;
		}

		if (event.target.classList.contains("task-item-button__open")) {
			const idTask = Number(event.target.dataset.id);
			const board = event.target.dataset.board;
			const task = this.state.taskList[board].find((item) => item.id === idTask);

			this.render.showFullTask(task, board);
			return;
		}

		if (event.target.classList.contains("task-item__delete")) {
			const idTask = Number(event.target.dataset.id);
			const board = event.target.dataset.board;
			const task = this.state.taskList[board].find((item) => item.id === idTask);

			this.render.showConfirmDeleteTask(task, board);
			return;
		}
	}

	byBoardsTaskKeypress() {
		return;
	}

	byFullTaskClickEdit() {
		this.render.enableEditingTask();
		this.render.hideButtonEditTask();
		this.render.showButtonSaveTask();
	}

	byFullTaskClickSave(event) {
		const title = this.render.fullTask.title.textContent.trim();

		if (title.length < 5) {
			const idMessage = setTimeout(() => {
				this.render.fullTask.wrap.classList.remove("hidden-item");
				this.render.hideMessage(idMessage);
			}, 3000);
			this.render.showMessage("Слишком короткая задача", idMessage);
			return;
		}

		const idTask = Number(event.target.dataset.id);
		const board = event.target.dataset.board;

		const newTitle = this.render.fullTask.title.innerHTML.trim();
		const newText = this.render.fullTask.text.innerHTML.trim();

		const task = this.state.taskList[board].find((item) => item.id === idTask);

		task.title = newTitle;
		task.text = newText;

		this.render.updateTask(idTask, board, newTitle);
		this.render.disableEditingTask();
		this.render.hideButtonSaveTask();
		this.render.showButtonEditTask();
		this.render.hideFullTask();
	}

	byFullTaskClickCancel() {
		this.render.disableEditingTask();
		this.render.hideButtonSaveTask();
		this.render.showButtonEditTask();
		this.render.hideFullTask();
	}

	byModalClickConfirm(event) {
		const action = event.target.dataset.action;

		if (action === "del") {
			this.deleteTask(event);
			return;
		}

		if (action === "load") {
			this.loadBoards();
		}

		if (action === "clear") {
			this.clearBoards();
		}
	}

	byModalClickCancel() {
		this.render.hideModal();
	}

	byMessageClickOk(event) {
		const idMessage = event.target.dataset.id;
		this.render.hideMessage(idMessage);
		clearTimeout(idMessage);
	}

	addNewTask(tag) {
		const newTaskTitle = this.render.newTaskPanels.text[tag].value.trim();

		if (newTaskTitle.length < 5) {
			const idMessage = setTimeout(() => {
				this.render.hideMessage(idMessage);
			}, 3000);
			this.render.showMessage("Слишком короткая задача", idMessage);
			return;
		}

		const chekBoard = tag in this.state.taskList;
		if (!chekBoard) {
			this.state.taskList[tag] = [];
		}
		const titleWithTags = newTaskTitle.split("\n").join("</div><div>");
		const fullNewTitle = `<p>${titleWithTags}</p>`;

		const newTask = {
			id: this.state.nextId,
			title: fullNewTitle,
			text: "",
		};

		this.state.taskList[tag].push(newTask);
		this.state.nextId += 1;

		this.render.addTaskItem(newTask, tag);
		this.render.clearNewTask(tag);
		this.render.hideNewTask(tag);
	}

	deleteTask(event) {
		const idTask = Number(event.target.dataset.id);
		const board = event.target.dataset.board;

		const boardInState = this.state.taskList[board];
		const task = boardInState.find((item) => item.id === idTask);
		const indexTask = task.id;

		boardInState.splice(indexTask, 1);
		this.render.removeTask(idTask, board);
		this.render.hideModal();
	}

	clearBoards() {
		this.render.hideModal();
		this.state.clearState();
		this.render.clearBoards();
		const idMessage = setTimeout(() => {
			this.render.hideMessage(idMessage);
		}, 3000);
		this.render.showMessage("Доски очищены", idMessage);
	}

	loadBoards() {
		this.render.hideModal();
		this.state.clearState();
		this.render.clearBoards();
		const loadedTask = this.state.loadState();

		if (loadedTask) {
			this.render.loadBoards(loadedTask.taskList);
		}

		const idMessage = setTimeout(() => {
			this.render.hideMessage(idMessage);
		}, 3000);
		this.render.showMessage("Список задач загружен", idMessage);
	}

	startMovedTask(task) {
		const movingItem = this.render.cloningItem(task);

		this.render.movingItems.moving = movingItem;
		this.render.movingItems.selected = task;

		this.calcStartCoort(task, movingItem);
		this.render.selectingTask(task);
	}

	calcStartCoort(item, movingItem) {
		const coord = item.getBoundingClientRect();

		const height = coord.height;
		const width = coord.width;
		const top = coord.top + window.pageYOffset;
		const left = coord.left + window.pageXOffset;

		this.state.movingPositions.startTop = top;
		this.state.movingPositions.startLeft = left;

		movingItem.style.height = `${height}px`;
		movingItem.style.width = `${width}px`;
		movingItem.style.top = `${top}px`;
		movingItem.style.left = `${left}px`;
	}

	calcNewCoord(pageX, pageY) {
		const shiftY = pageY - this.state.movingPositions.startY;
		const shiftX = pageX - this.state.movingPositions.startX;

		const newTop = this.state.movingPositions.startTop + shiftY;
		const newLeft = this.state.movingPositions.startLeft + shiftX;

		this.render.moveItem(newTop, newLeft);
	}

	chekBlankItem(underCursor, section) {
		if (!this.render.movingItems.blank) {
			this.render.createBlankItem();
		}

		if (section === "add") {
			const tagBoard = underCursor.dataset.board;
			const activeBoard = this.render.boardsList[tagBoard];
			const activeUl = activeBoard.querySelector("ul.board-list");
			const lastLi = activeUl.lastChild;

			if (lastLi && lastLi.classList.contains("blank-task")) {
				return;
			}
			activeUl.append(this.render.movingItems.blank);
		}

		if (section === "task") {
			const previeLi = underCursor.previousSibling;

			if (previeLi && previeLi.classList.contains("blank-task")) {
				return;
			}
			const activeUl = underCursor.closest("ul.board-list");
			activeUl.insertBefore(this.render.movingItems.blank, underCursor);
		}
	}

	replaceSelectedAndBlank() {
		const { blank, selected } = this.render.movingItems;
		const activeUl = blank.closest("ul.board-list");

		activeUl.replaceChild(selected, blank);
	}
}
