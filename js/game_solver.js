var UP      = 0;
var RIGHT   = 1;
var DOWN    = 2;
var LEFT    = 3;

function GameSolver(gameManager) {
    this.gameManager = gameManager;
    this.searchDepth = 0;
    this.solve();
}

GameSolver.prototype.solve = function () {
    var self = this;
    window.setInterval(function() {
        self.gameManager.move(self.nextMove(self.gameManager.grid));
    }, 100);
}

// Calculate for the next best move
GameSolver.prototype.nextMove = function (grid) {
    var up = this.move(this.cloneGrid(grid), UP);
    var right = this.move(this.cloneGrid(grid), RIGHT);
    var down = this.move(this.cloneGrid(grid), DOWN);
    var left = this.move(this.cloneGrid(grid), LEFT);

    var upFree = this.freeSpaces(up);
    var rightFree = this.freeSpaces(right);
    var downFree = this.freeSpaces(down);
    var leftFree = this.freeSpaces(left);

    var action = parseInt(Math.random() * 4) % 4;
    if (!(upFree==rightFree==downFree==leftFree)) {
        var list = _.shuffle([{action: UP, state:up},
                            {action: RIGHT, state:right},
                            {action: DOWN, state:down},
                            {action: LEFT, state:left}]);
        var max = _.max(list, this.freeSpaces);
        action = max.action;
    }
    return action;
}

GameSolver.prototype.freeSpaces = function (grid) {
    var space = 0;
    if (grid.state) grid = grid.state;

    for (var i=0; i<grid.length; i++) {
        var col = grid[i];
        for (var j=0; j<col.length; j++) {
            if (col[j] == null) space++;
        }
    }

    return space;    
}

GameSolver.prototype.cloneGrid = function (grid) {
    var newGrid = [];
    for (var i=0; i<grid.length; i++) {
        var col = grid[i];
        var newCol = []
        for (var j=0; j<col.length; j++) {
            if (col[j] == null) newCol.push(null);
            else {
                var newPos = {x: col[j].position.x, y: col[j].position.y};
                var newTile = {position: newPos, value: col[j].value};
                newCol.push(newTile);
            }
        }
        newGrid.push(newCol);
    }

    return newGrid;
}

GameSolver.prototype.move = function (grid, direction) {
    for (var i=0; i<grid.length; i++) {
        for (var j=0; j<grid[i].length; j++) {
            if (grid[i][j] != null) {
                grid[i][j].merged = false;
            }
        }
    }

    if (direction == UP) {
        for (var i=0; i<grid.length; i++) {
            var col = grid[i];
            for (var j=1; j<col.length; j++) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=j-1; k>=0; k--) {
                        if (grid[i][k] != null) {
                            tile = grid[i][k];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == grid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            grid[i][j] = null;
                        }
                        else {
                            grid[i][j].position.y = tile.position.y + 1;
                            grid[i][tile.position.y+1] = grid[i][j];
                            grid[i][j] = null;
                        }
                    }
                    else {
                        grid[i][j].position.y = 0;
                        grid[i][0] = grid[i][j];
                        grid[i][j] = null;
                    }
                }
            }
        }
    }
    else if (direction == RIGHT) {
        for (var i=grid.length-2; i>=0; i--) {
            var col = grid[i];
            for (var j=0; j<col.length; j++) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=i+1; k<grid.length; k++) {
                        if (grid[k][j] != null) {
                            tile = grid[k][j];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == grid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            grid[i][j] = null;
                        }
                        else {
                            grid[i][j].position.x = tile.position.x - 1;
                            grid[tile.position.x-1][j] = grid[i][j];
                            grid[i][j] = null;
                        }
                    }
                    else {
                        grid[i][j].position.x = grid.length - 1;
                        grid[grid.length-1][j] = grid[i][j];
                        grid[i][j] = null;
                    }
                }
            }
        }
    }
    else if (direction == DOWN) {
        for (var i=0; i<grid.length; i++) {
            var col = grid[i];
            for (var j=col.length-2; j>=0; j--) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=j+1; k<col.length; k++) {
                        if (grid[i][k] != null) {
                            tile = grid[i][k];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == grid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            grid[i][j] = null;
                        }
                        else {
                            grid[i][j].position.y = tile.position.y - 1;
                            grid[i][tile.position.y-1] = grid[i][j];
                            grid[i][j] = null;
                        }
                    }
                    else {
                        grid[i][j].position.y = col.length - 1;
                        grid[i][col.length - 1] = grid[i][j];
                        grid[i][j] = null;
                    }
                }
            }
        }
    }
    else if (direction == LEFT) {
        for (var i=1; i<grid.length; i++) {
            var col = grid[i];
            for (var j=0; j<col.length; j++) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=i-1; k>=0; k--) {
                        if (grid[k][j] != null) {
                            tile = grid[k][j];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == grid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            grid[i][j] = null;
                        }
                        else {
                            grid[i][j].position.x = tile.position.x + 1;
                            grid[tile.position.x+1][j] = grid[i][j];
                            grid[i][j] = null;
                        }
                    }
                    else {
                        grid[i][j].position.x = 0;
                        grid[0][j] = grid[i][j];
                        grid[i][j] = null;
                    }
                }
            }
        }
    }

    return grid;
}