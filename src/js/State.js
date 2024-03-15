export default class State {
	constructor() {
		this.nextId = 0;
		this.taskList = {};

		this.movingPositions = {
			startTop: null,
			startLeft: null,
			startY: null,
			startX: null,
		};
	}

	clearState() {
		this.nextId = 0;
		this.taskList = {};
		this.moving = {
			selectedItem: null,
			movingItem: null,
			blankItem: null,
			positions: {
				startTop: null,
				startLeft: null,
				startY: null,
				startX: null,
			},
		};
	}

	loadState() {
		const savedBoards = localStorage.getItem("taskList");

		if (!savedBoards) {
			return null;
		}

		const loadedState = JSON.parse(savedBoards);
		this.clearState();

		this.nextId = loadedState.nextId;
		this.taskList = loadedState.taskList;

		return loadedState;
	}

	saveState() {
		const thisState = {
			nextId: this.nextId,
			taskList: this.taskList,
		};
		const taskList = JSON.stringify(thisState);
		localStorage.setItem("taskList", taskList);
	}

	updateBoardAfterMove(updateData) {
		const { id, oldTag, newTag, newIndex } = updateData;
		const oldBoard = this.taskList[oldTag];
		const task = oldBoard.find((item) => {
			return item.id === id;
		});
		const oldIndex = oldBoard.indexOf(task);
		oldBoard.splice(oldIndex, 1);

		if (!(newTag in this.taskList)) {
			this.taskList[newTag] = [];
		}

		const newBoard = this.taskList[newTag];
		newBoard.splice(newIndex, 0, task);
	}

	clearMovingPosition() {
		this.movingPositions = {
			startTop: null,
			startLeft: null,
			startY: null,
			startX: null,
		};
	}
}
