import React, {useState, useEffect, useDeferredValue, useCallback, memo} from 'react';

const row = 15;
const col = 15;
const number = 5;

export default function Game() {
  const [currentMove, setCurrentMove] = useState(0);
  const [history, setHistory] = useState([
    {
      squares: Array(row).fill(null).map(item => Array(col).fill(null)),
      myWin: Array(count).fill(0),
      AIWin: Array(count).fill(0),
      nextPlay: 'X'
    }
  ]);
  const deferredHistory = useDeferredValue(history);
  const deferredCurrentMove = useDeferredValue(currentMove);

  const handlePlay = useCallback((nextSquares, nextPosition)=>{
    const nextHistory = [...history.slice(0, currentMove + 1), {
      ...history[currentMove],
      squares: nextSquares,
      position: nextPosition,
      nextPlay: 'O'
    }];

    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }, [history, currentMove]);

  const autoPlay = useCallback(currentItem=>{
    setHistory(history.map((item, k) => {
      if (k === history.length - 1) {
        return {
          ...item,
          ...currentItem,
          nextPlay: 'X'
        };
      } else {
        return item;
      }
    }));
  }, [history]);

  return (
    <div className="game">
      <div className="game-board">
        <Board history={currentMove === deferredCurrentMove ? deferredHistory : history}
               currentMove={currentMove}
               onPlay={handlePlay}
               autoPlay={autoPlay} />
      </div>

      <div className="game-info">
        <HistoryList history={currentMove === deferredCurrentMove ? deferredHistory : history}
                     currentMove={currentMove}
                     jumpTo={(nextMove) => {
                      setCurrentMove(nextMove);
                    }} />
      </div>
    </div>
  );
}

const HistoryList = memo(({ history, currentMove, jumpTo }) => {
  console.log(currentMove);

  const [isAscending, setIsAscending] = useState(true);

  const moves = history.length === 1 ? null : history.map((item, move) => {
    let description;

    if (move === currentMove) {
      if (move === 0) {
        description = 'You are at game start';
      } else {
        const [pos_r, pos_c] = item.position;
        description = 'You are at move (' + pos_r + ', ' + pos_c + ')';
      }

      return (
        <li key={move}><small>{description}</small></li>
      );

    } else {
      if (move === 0) {
        description = 'Go to game start';
      } else {
        const [pos_r, pos_c] = item.position;
        description = 'Go to move (' + pos_r + ', ' + pos_c + ')';
      }

      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    }
  });

  return (
    <>
      {moves && <label>
        <input type="checkbox" checked={isAscending} onChange={(e) => { setIsAscending(e.target.checked); }} />
        {isAscending ? 'Asc' : 'Desc'}
      </label>}
      {moves && isAscending && <ol key="moves">{moves}</ol>}
      {moves && !isAscending && <ol key="moves_reverse" reversed>{moves.reverse()}</ol>}
    </>
  )
});

const Board = memo(({ history, currentMove, onPlay, autoPlay }) => {
  const squares = history[currentMove].squares;
  const line = history[currentMove].line;
  const winner = history[currentMove].winner;
  const nextPlay = history[currentMove].nextPlay;
  const status = winner ? 'Winner: ' + winner : 'Next player: ' + nextPlay;

  useEffect(() => {
    var timer = setTimeout(() => {
      if (nextPlay === 'O') autoPlay(calculateWinner(history[currentMove]));
    });

    return () => {
      clearTimeout(timer);
    }
  }, [history, currentMove, nextPlay, autoPlay]);

  function handleClick(r, c) {
    if (winner || squares[r][c] || nextPlay === 'O') return;

    const nextSquares = squares.map(row => [...row]);
    nextSquares[r][c] = 'X';
    onPlay(nextSquares, [r, c]);
  }

  return (
    <>
      <div className="status">{status}</div>
      {squares.map((rowArr, c) =>
        <div className="board-row" key={c}>
          {rowArr.map((row, r) =>
            <Square key={r + c * rowArr.length}
              value={squares[r][c]}
              onSquareClick={() => handleClick(r, c)}
              lineSucceed={line && squares[r][c] && line.some(item => r === item[0] && c === item[1])}
            />
          )}
        </div>
      )}
    </>
  );
});

function Square({ value, onSquareClick, lineSucceed }) {
  return (
    <button className={lineSucceed ? 'square strong' : 'square'} onClick={onSquareClick}>
      {value}
    </button>
  );
}

const myWeight = [200, 400, 2000, 10000];
const AIWeight = [220, 420, 2200, 20000];
const [count, wins, lines] = getWinsLines(row, col, number);
function calculateWinner(data) {
  const { squares, position, myWin, AIWin } = data;
  const nextSquares = squares.map(row => [...row]);
  const nextMyWin = [...myWin];
  const nextAIWin = [...AIWin];
  const [r, c] = position;

  for (let k = 0; k < count; k++) {
    if (wins[r][c][k]) {
      nextMyWin[k]++;
      nextAIWin[k] = number + 1;
      if (nextMyWin[k] === number) {
        return {
          winner: 'X',
          line: lines[k],
          squares: nextSquares,
          position: position,
          myWin: nextMyWin,
          AIWin: nextAIWin
        }
      }
    }
  }

  let myScore = nextSquares.map(row => row.map(col => 0));
  let AIScore = nextSquares.map(row => row.map(col => 0));
  let max = 0;
  let u = 0, v = 0;

  for (let i = 0; i < nextSquares.length; i++) {
    for (let j = 0; j < nextSquares[i].length; j++) {
      if (!nextSquares[i][j]) {
        for (let k = 0; k < count; k++) {
          if (wins[i][j][k]) {
            if (nextMyWin[k] > 0 && nextMyWin[k] < number) {
              myScore[i][j] += myWeight[nextMyWin[k] - 1];
            }

            if (nextAIWin[k] > 0 && nextAIWin[k] < number) {
              AIScore[i][j] += AIWeight[nextAIWin[k] - 1];
            }
          }
        }

        if (myScore[i][j] > max) {
          max = myScore[i][j];
          u = i;
          v = j;
        } else if (myScore[i][j] === max) {
          if (AIScore[i][j] > AIScore[u][v]) {
            u = i;
            v = j;
          }
        }

        if (AIScore[i][j] > max) {
          max = AIScore[i][j];
          u = i;
          v = j;
        } else if (AIScore[i][j] === max) {
          if (myScore[i][j] > myScore[u][v]) {
            u = i;
            v = j;
          }
        }
      }
    }
  }
  nextSquares[u][v] = 'O';

  for (let k = 0; k < count; k++) {
    if (wins[u][v][k]) {
      nextAIWin[k]++;
      nextMyWin[k] = number + 1;
      if (nextAIWin[k] === number) {
        return {
          winner: 'O',
          line: lines[k],
          squares: nextSquares,
          position: position,
          myWin: nextMyWin,
          AIWin: nextAIWin
        }
      }
    }
  }

  return {
    winner: null,
    line: null,
    squares: nextSquares,
    position: position,
    myWin: nextMyWin,
    AIWin: nextAIWin
  }
}

function getWinsLines(row, col, number) {
  var wins = [];
  for (var i = 0; i < row; i++) {
    wins[i] = [];
    for (var j = 0; j < col; j++) {
      wins[i][j] = [];
    }
  }

  let count = 0;
  let lines = [];

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      if (i < col - (number - 1)) { //横线
        lines[count] = [];
        for (let k = 0; k < number; k++) {
          wins[i + k][j][count] = true;
          lines[count].push([i + k, j]);
        }
        count++;
      }

      if (j < col - (number - 1)) { //竖线
        lines[count] = [];
        for (let k = 0; k < number; k++) {
          wins[i][j + k][count] = true;
          lines[count].push([i, j + k]);
        }
        count++;
      }

      if (i < col - (number - 1) && j < col - (number - 1)) { //斜线
        lines[count] = [];
        for (let k = 0; k < number; k++) {
          wins[i + k][j + k][count] = true;
          lines[count].push([i + k, j + k]);
        }
        count++;
      }

      if (i < col - (number - 1) && j > (number - 1) - 1) { //反斜线
        lines[count] = [];
        for (let k = 0; k < number; k++) {
          wins[i + k][j - k][count] = true;
          lines[count].push([i + k, j - k]);
        }
        count++;
      }
    }
  }

  return [count, wins, lines];
}