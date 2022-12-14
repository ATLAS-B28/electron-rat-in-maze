const BRICK = 0;
const SPACE = 1;
const RAT = 2;
const BREADCRUMB = 3;

// A 2-D grid that can draw with different colors
class Grid {
    constructor(rootElmt, grid) {
        this.rootElmt = rootElmt;
        this.grid = grid;
        this.colorMap = ['black', 'white', 'lime', 'blue'];
    }
    draw() {
        console.log('[Start] Grid.draw()');
        let numRows = this.grid.length;
        let tableElmt = document.createElement('table');
        tableElmt.className = 'grid';
        for (let i = 0; i < numRows; i++) {
            let row = this.grid[i];
            let numCol = row.length;
            let trElmt = document.createElement('tr');
            for (let j = 0; j < numCol; j++) {
                let colorId = row[j];
                let tdElmt = document.createElement('td');
                tdElmt.style.backgroundColor = this.getColor(colorId);
                trElmt.appendChild(tdElmt);
            }
            tableElmt.appendChild(trElmt);
        }
        this.rootElmt.innerHTML = '';
        this.rootElmt.appendChild(tableElmt);
        console.log('[End] Grid.draw()');
    }
    getColor(id) {

        if (id < 0 || id >= this.colorMap.length) {
            return 'gray';
        } else {
            return this.colorMap[id];
        }
    }
    // Get a random grid
    static getRandomGrid(numRows, numCols) {
        return Array(numRows).fill([], 0, numRows).map((dummyRow) => {
            return Array(numCols).fill(0, 0, numCols).map((dummyCell) => {
                return Math.floor(Math.random() * 3); // [0, 2]
            });
        });
    }
}

// A collection of Grid that can play in sequence
class GridMovement {
    constructor(rootElmt, grids, interval) {
        console.log('[Start] GridMovement.constructor()');
        this.rootElmt = rootElmt;
        this.interval = interval;
        this.currIndex = 0;
        this.grids = grids.map((grid) => {
            return new Grid(rootElmt, grid);
        });
        console.log('[End] GridMovement.constructor()');
    }
    reset() {
        this.currIndex = 0;
    }
    play() {
        
        if (this.currIndex >= this.grids.length) {
            return;
        }
        this.grids[this.currIndex].draw();
        this.currIndex ++;
        console.log('[End] GridMovement.play(), currIndex=' + this.currIndex);
        setTimeout(this.play.bind(this), this.interval);
    }
    // Get an array of random grids
    static getRandomMovie(numFrames, numRows, numCols) {
        return Array(numFrames).fill([], 0, numFrames).map((dummyGrid) => {
            return Grid.getRandomGrid(numRows, numCols);
        });
    }
}

class MazeSolver {
    constructor(rootElmt, mazeGrid) {
        console.log('[Start] MazeSolver.constructor()');
        this.rootElmt = rootElmt;
        this.originalGrid = this.copyObj(mazeGrid);
        this.grid = this.copyObj(mazeGrid);
        this.trace = [];
        this.foundSolution = false;
        this.directions = [
            { 'rowDelta': -1, 'colDelta': 0 },
            { 'rowDelta': 1, 'colDelta': 0 },
            { 'rowDelta': 0, 'colDelta': -1 },
            { 'rowDelta': 0, 'colDelta': 1 }
        ];
        console.log('[End] MazeSolver.constructor()');
    }
    copyObj(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    isSolved(row, col) {
        return (row === this.grid.length - 1 && col === this.grid[0].length -1);
    }
    displaySolution() {
        console.log('[Start] MazeSolver.displaySolution()');
        let grid = this.copyObj(this.originalGrid);
        let grids = [this.copyObj(grid)];
        for (let i = 0; i < this.trace.length; i ++) {
            let step = this.trace[i];
            grid[step.row][step.col] = BREADCRUMB;
            grids.push(this.copyObj(grid));
        }
        let movie = new GridMovement(
            this.rootElmt,
            grids,
            200
        );
        movie.play();
        console.log('[End] MazeSolver.displaySolution()');
    }
    solve(row, col) {
        console.log('[Start] MazeSolver.solve()');
        if (this.grid[row][col] != SPACE) {
            console.log('Cannot solve, because the starting point is not space');
            return;
        } else {
            this.grid[row][col] = BREADCRUMB;
            this.trace.push({row: row, col: col});
            this.solveInternal(row, col);
        }
        console.log('[End] MazeSolver.solve()');
    }
    solveInternal(row, col) {
        console.log('solve: ' + row + ', ' + col);
        if (this.foundSolution) {
            return;
        }
        if (this.isSolved(row, col)) {
            console.log('Solved!!! Display the solution.');
            this.foundSolution = true;
            this.displaySolution();
            return;
        }
        for (let i = 0; i < this.directions.length; i ++) {
          
            let nextRow = row + this.directions[i].rowDelta;
            let nextCol = col + this.directions[i].colDelta;

            if (nextRow >= 0 && nextRow < this.grid.length &&
                nextCol >= 0 && nextCol < this.grid[0].length) {
                let next = this.grid[nextRow][nextCol];
                console.log('[' + nextRow + ', ' + nextCol + '] = ' + next + ': ' + (next === SPACE));
                if (next === SPACE) {
                    // We can go
                    this.grid[nextRow][nextCol] = BREADCRUMB;
                    this.trace.push({row: nextRow, col: nextCol});
                    this.solveInternal(nextRow, nextCol);
                    this.trace.pop();
                    this.grid[nextRow][nextCol] = SPACE;
                }
            }
        }
    }
}

// Entry point
let root = document.getElementById('root');
let mazeGrid = [
      [ 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 , 1 ],
      [ 1 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
      [ 1 , 1 , 1 , 1 , 0 , 0 , 0 , 0 , 0 , 1 ],
      [ 0 , 0 , 0 , 1 , 1 , 1 , 0 , 1 , 1 , 1 ],
      [ 0 , 0 , 0 , 0 , 0 , 1 , 0 , 1 , 1 , 1 ],
      [ 1 , 0 , 0 , 0 , 0 , 1 , 0 , 0 , 0 , 1 ],
      [ 1 , 1 , 1 , 0 , 1 , 1 , 1, 0 ,  0 , 0 ],
      [ 1 , 0 , 1 , 1 , 0 , 1 , 1 , 1 , 0 , 1 ],
      [ 1 , 0 , 0 , 0 , 0 , 0 , 0 , 1 , 1 , 1 ],
      [ 1 , 1 , 1 , 0 , 0 , 0 , 0 , 0 , 1 , 1 ]
];

let initGrid = new Grid(root, mazeGrid);
initGrid.draw();

let solver = new MazeSolver(root, mazeGrid);

function main() {
    solver.solve(0, 0);
}