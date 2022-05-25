import React from "react";
import ReactDOM from "react-dom/client";
import classNames from "classnames";
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
    /* 判断是否有胜方 */
    for (let i = 0; i < 3; i++) {
        /* 判断三行 */
        if (
            board[i][0] !== null &&
            board[i][0] === board[i][1] &&
            board[i][1] === board[i][2]
        ) {
            return board[i][0];
        }

        /* 判断三列 */
        if (
            board[0][i] !== null &&
            board[0][i] === board[1][i] &&
            board[1][i] === board[2][i]
        ) {
            return board[0][i];
        }
    }

    /* 判断两条交叉线 */
    if (board[1][1]) {
        if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            return board[1][1];
        }

        if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            return board[1][1];
        }
    }

    return null;
}

/* 棋盘类 */
class Board extends React.Component {
    /* 调用函数组件Square */
    /* 代表事件监听的prop命名为on[Event] */
    /* 处理的监听方法命名为handle[Event] */
    render() {
        /* map遍历得到所有行 */
        const rows = this.props.board.map((row, xIndex) => {
            /* map遍历得到一行中的所有格子 */
            const cells = row.map((value, yIndex) => (
                <Square
                    value={value}
                    key={yIndex}
                    onClick={() => {
                        this.props.onClick(xIndex, yIndex);
                    }}
                />
            ));

            return (
                <div className="board-row" key={xIndex}>
                    {cells}
                </div>
            );
        });
        return <div className="board">{rows}</div>;
    }
}

// 游戏类，包括棋盘以及信息两个部分
class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            histories: [
                {
                    squares: new Array(3)
                        .fill(0)
                        .map((row) => new Array(3).fill(null)),
                },
            ],
            curHistoryIndex: 0,
            xIsNext: true,
        };

        /* 全局维护获胜者，反正每次重新渲染都会算一遍 */
        this.winner = null;
        this.handleClick = this.handleClick.bind(this);
        this.timeTravel = this.timeTravel.bind(this);
    }

    /* 落子的方法 */
    handleClick(xIndex, yIndex) {
        const formerSquares =
            this.state.histories[this.state.curHistoryIndex].squares;
        /* 二维数组要深克隆一下 */
        const squares = formerSquares.map((row) => [...row]);
        /* 只有当没人获胜并且格子为空的情况下能落子 */
        if (this.winner === null && squares[xIndex][yIndex] === null) {
            /* 更新棋盘 */
            squares[xIndex][yIndex] = this.state.xIsNext === true ? "X" : "O";
            /* 保证后面多余的历史删掉 */
            const histories = this.state.histories.slice(
                0,
                this.state.curHistoryIndex + 1
            );
            /* 使用concat会返回一个新数组，明确修改不可变数据 */
            this.setState({
                histories: histories.concat({
                    squares: squares,
                    xIndex,
                    yIndex,
                }),
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
                index === 0 ? "The very Begining" : `Go to move No.${index}`;
            const cordinates =
                index === 0 ? "" : `\n(${move.xIndex}, ${move.yIndex})`;
            const selected =
                index === 0
                    ? ""
                    : `\n${move.squares[move.xIndex][move.yIndex]}`;
            const btnClass = classNames("history", {
                "cur-btn": index === this.state.curHistoryIndex,
            });
            return (
                <li key={index}>
                    <button
                        className={btnClass}
                        onClick={() => this.timeTravel(index)}
                    >
                        {description}
                    </button>
                    {cordinates}
                    <span className="selected">{selected}</span>
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
