var UP      = 0;
var RIGHT   = 1;
var DOWN    = 2;
var LEFT    = 3;

function GameSolver(gameManager) {
    this.gameManager = gameManager;
    this.searchDepth = 5;
    this.solve();
}

GameSolver.prototype.solve = function () {
    var self = this;
    window.setInterval(function() {
        var grid = self.gameManager.grid.serialize();
        self.gameManager.move(self.nextMove(grid.cells));
    }, 500);
}

// Calculate for the next best move
GameSolver.prototype.nextMove = function (grid) {
    var paths = [];
    paths.push({grid: this.move(grid, UP), action: UP});
    paths.push({grid: this.move(grid, RIGHT), action: RIGHT});
    paths.push({grid: this.move(grid, DOWN), action: DOWN});
    paths.push({grid: this.move(grid, LEFT), action: LEFT});

    for (var i=1; i<=this.searchDepth; i++) {
        var length = Math.pow(4,i);
        for (var j=0; j<length; j++) {
            var path = paths.shift();
            paths.push({grid: this.move(path.grid, UP), action: path.action});
            paths.push({grid: this.move(path.grid, RIGHT), action: path.action});
            paths.push({grid: this.move(path.grid, DOWN), action: path.action});
            paths.push({grid: this.move(path.grid, LEFT), action: path.action});
        }
    }

    paths = _.shuffle(paths);
    var max = this.findBest(paths);

    return max.action;
}

GameSolver.prototype.findBest = function (paths) {
    var self = this;
    return _.max(paths, function(p) {
        return self.freeSpaces(p.grid);
    });
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
            if (col[j] == null)
                newCol.push(null);
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
    var newGrid = this.cloneGrid(grid);

    if (direction == UP) {
        for (var i=0; i<newGrid.length; i++) {
            var col = newGrid[i];
            for (var j=1; j<col.length; j++) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=j-1; k>=0; k--) {
                        if (newGrid[i][k] != null) {
                            tile = newGrid[i][k];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == newGrid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            newGrid[i][j] = null;
                        }
                        else {
                            var tmp = newGrid[i][j];
                            newGrid[i][j].position.y = tile.position.y + 1;
                            newGrid[i][j] = null;
                            newGrid[i][tile.position.y+1] = tmp;
                        }
                    }
                    else {
                        newGrid[i][j].position.y = 0;
                        newGrid[i][0] = newGrid[i][j];
                        newGrid[i][j] = null;
                    }
                }
            }
        }
    }
    else if (direction == RIGHT) {
        for (var i=newGrid.length-2; i>=0; i--) {
            var col = newGrid[i];
            for (var j=0; j<col.length; j++) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=i+1; k<newGrid.length; k++) {
                        if (newGrid[k][j] != null) {
                            tile = newGrid[k][j];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == newGrid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            newGrid[i][j] = null;
                        }
                        else {
                            var tmp = newGrid[i][j];
                            newGrid[i][j].position.x = tile.position.x - 1;
                            newGrid[i][j] = null;
                            newGrid[tile.position.x-1][j] = tmp;
                        }
                    }
                    else {
                        newGrid[i][j].position.x = newGrid.length - 1;
                        newGrid[newGrid.length-1][j] = newGrid[i][j];
                        newGrid[i][j] = null;
                    }
                }
            }
        }
    }
    else if (direction == DOWN) {
        for (var i=0; i<newGrid.length; i++) {
            var col = newGrid[i];
            for (var j=col.length-2; j>=0; j--) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=j+1; k<col.length; k++) {
                        if (newGrid[i][k] != null) {
                            tile = newGrid[i][k];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == newGrid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            newGrid[i][j] = null;
                        }
                        else {
                            var tmp = newGrid[i][j];
                            newGrid[i][j].position.y = tile.position.y - 1;
                            newGrid[i][j] = null;
                            newGrid[i][tile.position.y-1] = tmp;
                        }
                    }
                    else {
                        newGrid[i][j].position.y = col.length - 1;
                        newGrid[i][col.length - 1] = newGrid[i][j];
                        newGrid[i][j] = null;
                    }
                }
            }
        }
    }
    else if (direction == LEFT) {
        for (var i=1; i<newGrid.length; i++) {
            var col = newGrid[i];
            for (var j=0; j<col.length; j++) {
                if (col[j] != null) {
                    var tile = null;
                    for (var k=i-1; k>=0; k--) {
                        if (newGrid[k][j] != null) {
                            tile = newGrid[k][j];
                            break;
                        }
                    }
                    if (tile != null) {
                        if (!tile.merged && tile.value == newGrid[i][j].value) {
                            tile.value *= 2;
                            tile.merged = true;
                            newGrid[i][j] = null;
                        }
                        else {
                            var tmp = newGrid[i][j];
                            newGrid[i][j].position.x = tile.position.x + 1;
                            newGrid[i][j] = null;
                            newGrid[tile.position.x+1][j] = tmp;
                        }
                    }
                    else {
                        newGrid[i][j].position.x = 0;
                        newGrid[0][j] = newGrid[i][j];
                        newGrid[i][j] = null;
                    }
                }
            }
        }
    }

    return newGrid;
}