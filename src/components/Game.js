import React from 'react';
import { Board, BOARD_SIZE } from './Board'
import '../index.css';
import { Settings } from './Settings';

function winLines(size) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];
	return lines;
}
function calculateWinner(squares, step) {
	const lines = winLines(BOARD_SIZE);
	let winLine = []
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			winLine = lines[i]
			return { state: "win", line: winLine }
		}
	}
	if (step === BOARD_SIZE * BOARD_SIZE) {
		return { state: "draw" }
	}
	return { state: null };
}

export class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
					lastPosition: [-1, -1],
					lastChar: ''
				}
			],
			stepNumber: 0,
			xIsNext: true,
			moveSelecting: 0,
			reverseHistory: false
		};

		this.handleClick = this.handleClick.bind(this)
		this.jumpTo = this.jumpTo.bind(this)
		this.changeHistoryMode = this.changeHistoryMode.bind(this)
		this.isSelected = this.isSelected.bind(this)

	}

	handleClick = (i) => {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		if (calculateWinner(squares, history.length - 1).state || squares[i]) {
			return;
		}

		squares[i] = this.state.xIsNext ? "X" : "O";
		this.setState({
			history: history.concat([
				{
					squares: squares,
					lastPosition: [i % BOARD_SIZE, Math.floor(i / BOARD_SIZE)],
					lastChar: squares[i]
				}
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
			moveSelecting: history.length
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
			moveSelecting: step
		});
	}

	isSelected(move) {
		return move === this.state.moveSelecting
	}

	changeHistoryMode = () => {
		this.setState({
			reverseHistory: !this.state.reverseHistory
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares, history.length - 1);
		const reverse = this.state.reverseHistory;
		const step = 'Current move: ' + this.state.moveSelecting;
		let status;

		switch (winner.state) {
			case "win":
				status = "Winner: " + current.squares[winner.line[0]];
				break;
			// Feature 6. When no one wins, display a message about the result being a draw.
			case "draw":
				status = "We have a draw game"
				break;
			case null:
				status = "Next player: " + (this.state.xIsNext ? "X" : "O");
				break;
			default:

				break;
		}

		let moves = history.map((h, move) => {
			// Feature 1. Display the location for each move in the format(col, row) in the move history list.
			const desc = move ?
				`Go to move #${move}: ${h.lastChar} at (${h.lastPosition[0]}, ${h.lastPosition[1]})` :
				'Go to game start';

			return (
				<li key={move} >
					{/* Feature 2. Bold the currently selected item in the move list. */}
					<button
						className={this.isSelected(move) ? 'selected' : 'unselected'}
						onClick={() => this.jumpTo(move)}>
						{desc}
					</button>
				</li>
			);
		});

		if (reverse) {
			moves = moves.reverse();
		}

		return (
			<div className="game">
				<div className="game-settings">
					<h1>Settings</h1>
					<Settings className="game-settings__detail"
						onChange={this.changeHistoryMode} />
				</div>

				<div className="game-play">
					<h1>Game Play</h1>

					<div className="game-board">
						<Board
							squares={current.squares}
							onClick={i => this.handleClick(i)}
							winLine={winner.line}
						/>
					</div>

					<div className="game-info">
						<ol className="game-info__status">{status}</ol>
						<ol>{step}</ol>
						<ol>{moves}</ol>
					</div>
				</div>

			</div>
		);
	}
}