import React from "react";
import './game.css'

//сетка
function shallowEquals(arrY, arrX) {
    let equals
    if (!arrY || !arrX || arrY.length !== arrX.length) {
        return false;
    }else {
        equals = true;
        for (var i = 0; i < arrY.length; i++) {
            if (arrY[i] !== arrX[i]){
                equals = false
            }
        }
        return equals;
    }
}

//поїдання квадрата
function arrayDiff(arrY, arrX){
    return arrY.map((a, i)=>{ 
        return a - arrX[i]
    })
}

//дів зі стилями
  function GridCell(props) {
    const classes = `grid-cell 
  ${props.foodCell ? "grid-cell--food" : ""} 
  ${props.snakeCell ? "grid-cell--snake" : ""}
  `;
    return (
        <div
        className={classes}
        style={{ height: props.size + "px", width: props.size + "px" }}
        />
    );
  }
  
// головне вікно
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        snake: [],
        food: [],
        status: 0,
        direction: 39
      };
  
      this.moveFood = this.moveFood.bind(this);
      this.checkIfAteFood = this.checkIfAteFood.bind(this);
      this.startGame = this.startGame.bind(this);
      this.endGame = this.endGame.bind(this);
      this.moveSnake = this.moveSnake.bind(this);
      this.doesntOverlap = this.doesntOverlap.bind(this);
      this.setDirection = this.setDirection.bind(this);
      this.removeTimers = this.removeTimers.bind(this);
    }

// рандом їжі
    moveFood() {
      if (this.moveFoodTimeout) clearTimeout(this.moveFoodTimeout)
      const x = parseInt(Math.random() * this.numCells);
      const y = parseInt(Math.random() * this.numCells);
      this.setState({ food: [x, y] });
      this.moveFoodTimeout = setTimeout(this.moveFood, 5000)
    }

//управління
    setDirection({ keyCode }) {
      let changeDirection = true;
      [[38, 40], [37, 39]].forEach(dir => {
        if (dir.indexOf(this.state.direction) > -1 && dir.indexOf(keyCode) > -1) {
          changeDirection = false;
        }
      });
      if (changeDirection) this.setState({ direction: keyCode });
    }

    moveSnake() {
      const newSnake = [];
      switch (this.state.direction) {
          // down
        case 40:
          newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] + 1];
          break;
          // up
        case 38:
          newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] - 1];
          break;
          // right
        case 39:
          newSnake[0] = [this.state.snake[0][0] + 1, this.state.snake[0][1]];
          break;
          // left
        case 37:
          newSnake[0] = [this.state.snake[0][0] - 1, this.state.snake[0][1]];
          break;
                                  }
      [].push.apply(
        newSnake,
        this.state.snake.slice(1).map((s, i) => {
          return this.state.snake[i];
        })
      );
  
      this.setState({ snake: newSnake });
  
      this.checkIfAteFood(newSnake);
      if (!this.isValid(newSnake[0]) || !this.doesntOverlap(newSnake)) {
        // програш
        this.endGame()
      } 
    }
  
//подовження змії
    checkIfAteFood(newSnake) {
      if (!shallowEquals(newSnake[0], this.state.food)) return
        let newSnakeSegment;
        const lastSegment = newSnake[newSnake.length - 1];
        let lastPositionOptions = [[-1, 0], [0, -1], [0, 1], [1, 0]];

        if ( newSnake.length > 1 ) {
          lastPositionOptions[0] = arrayDiff(lastSegment, newSnake[newSnake.length - 2]);
        }
  
        for (var i = 0; i < lastPositionOptions.length; i++) {
          newSnakeSegment = [
            lastSegment[0] + lastPositionOptions[i][0],
            lastSegment[1] + lastPositionOptions[i][1]
          ];
          if (this.isValid(newSnakeSegment)) {
            break;
          }
        }
  
        this.setState({
          snake: newSnake.concat([newSnakeSegment]),
          food: []
        });
      this.moveFood();
    }
    
    isValid(cell) {
      return (
        cell[0] > -1 &&
        cell[1] > -1 &&
        cell[0] < this.numCells &&
        cell[1] < this.numCells
      );
    }
  
    doesntOverlap(snake) {
      return (
        snake.slice(1).filter(c => {
          return shallowEquals(snake[0], c);
        }).length === 0
      );
    }
  
    startGame() {
      this.removeTimers();
      this.moveSnakeInterval = setInterval(this.moveSnake, 130);
      this.moveFood();
  
      this.setState({
        status: 1,
        snake: [[5, 5]],
        food: [10, 10]
      });
      //need to focus so keydown listener will work!
      this.el.focus();
    }
    
    endGame(){
      this.removeTimers();
      this.setState({
        status : 2
      })
    }
  
    removeTimers() {
      if (this.moveSnakeInterval) clearInterval(this.moveSnakeInterval);
      if (this.moveFoodTimeout) clearTimeout(this.moveFoodTimeout)
    }
  
    componentWillUnmount() {
      this.removeTimers();
    }
  
    render() {
      this.numCells = Math.floor(this.props.size / 30);
      const cellSize = this.props.size / this.numCells;
      const cellIndexes = Array.from(Array(this.numCells).keys());
      const cells = cellIndexes.map(y => {
        return cellIndexes.map(x => {
          const foodCell = this.state.food[0] === x && this.state.food[1] === y;
          let snakeCell = this.state.snake.filter(c => c[0] === x && c[1] === y);
          snakeCell = snakeCell.length && snakeCell[0];
  
          return (
            <GridCell
              foodCell={foodCell}
              snakeCell={snakeCell}
              size={cellSize}
              key={x + " " + y}
              />
          );
        });
      });
  
      let overlay;
      if (this.state.status === 0) {
        overlay = (
          <div className="snake-app__overlay">
            <button onClick={this.startGame}>розпочати гру</button>
          </div>
        );
      } else if (this.state.status === 2) {
        overlay = (
          <div className="snake-app__overlay">
            <div className="mb-1"><b>Гру програно</b></div>
            <div className="mb-1">Твій результа: {this.state.snake.length} </div>
            <button onClick={this.startGame}>Розпочати нову гру</button>
          </div>
        );
      }
      return (
        <div
          className="snake-app"
          onKeyDown={this.setDirection}
          style={{
            width: this.props.size + "px",
              height: this.props.size + "px"
          }}
          ref={el => (this.el = el)}
          tabIndex={-1}
          >
          {overlay}
          <div
            className="grid"
            style={{
              width: this.props.size + "px",
                height: this.props.size + "px"
            }}
            >
            {cells}
          </div>
        </div>
      );
    }
  }
  
export default Game