import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

/* 函数组件，接收一个props，返回jsx */
function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// 判断获胜方
function judgeWinner(board) {
    /* 判断是否有胜者，分别从三行三列以及两条交叉线判断 */
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [i, j, k] of lines) {
        if (board[i] !== null) {
            if (board[i] === board[j] && board[j] === board[k]) {
                return board[i];
            }
        }
    }
    return null;
}

/* 棋盘类 */
class Board extends React.Component {
    /* 调用函数组件 */
    /* 代表事件监听的prop命名为on[Event] */
    /* 处理的监听方法命名为handle[Event] */
    renderSquare(i) {
        return (
            <Square
                value={this.props.board[i]}
                onClick={() => {
                    this.props.onClick(i);
                }}
            />
        );
    }

    render() {
        return (
            <div className="board">
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

// 游戏类，包括棋盘以及信息两个部分
class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            histories: [{ squares: new Array(9).fill(null) }],
            curHistoryIndex: 0,
            xIsNext: true,
        };

        this.winner = null;
        this.handleClick = this.handleClick.bind(this);
        this.timeTravel = this.timeTravel.bind(this);
    }

    /* 落子的方法 */
    handleClick(i) {
        const squares = [
            ...this.state.histories[this.state.curHistoryIndex].squares,
        ];
        /* 只有当没人获胜并且格子为空的情况下能落子 */
        if (this.winner === null && squares[i] === null) {
            /* 更新棋盘 */
            squares[i] = this.state.xIsNext === true ? "X" : "O";
            /* 保证后面多余的历史删掉 */
            const histories = this.state.histories.slice(
                0,
                this.state.curHistoryIndex + 1
            );
            /* 使用concat会返回一个新数组，明确修改不可变数据 */
            this.setState({
                histories: histories.concat({ squares: squares }),
                curHistoryIndex: this.state.curHistoryIndex + 1,
                xIsNext: !this.state.xIsNext,
            });
        }
    }

    /* 回退历史记录 */
    timeTravel(index) {
        /* 偶数的时候下一步才是X */
        if (index !== this.state.curHistoryIndex) {
            this.setState({
                curHistoryIndex: index,
                xIsNext: (index & 1) === 0,
            });
        }
    }

    render() {
        const curBoard =
            this.state.histories[this.state.curHistoryIndex].squares;

        /* 得到所有按钮 */
        const gotoBtns = this.state.histories.map((move, index) => {
            const description =
                index === 0 ? "Go to the Begining" : `Go to move No.${index}`;
            return (
                <li key={index}>
                    <button
                        className="history"
                        onClick={() => this.timeTravel(index)}
                    >
                        {description}
                    </button>
                </li>
            );
        });

        /* 判断当前状态 */
        const winner = judgeWinner(curBoard);
        this.winner = winner;
        let status;
        if (winner !== null) {
            status = `The winner is ${winner}`;
        } else {
            status = `Next goes to ${this.state.xIsNext === true ? "X" : "O"}`;
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        board={curBoard}
                        onClick={this.handleClick}
                        xIsNext={this.state.xIsNext}
                    />
                </div>

                <div className="game-info">
                    <div className="status">{status}</div>
                    <ol className="histories">{gotoBtns}</ol>
                </div>
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
/* 将虚拟DOM渲染到真实的root节点上去 */
root.render(<Game />);
