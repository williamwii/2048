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
    }, 100);
}

// Calculate for the next best move
GameSolver.prototype.nextMove = function (grid) {
    var paths = [];
    var actions = [UP, RIGHT, DOWN, LEFT];

    for (var i=0; i<actions.length; i++) {
        var newGrid =  this.move(grid, actions[i]);
        if (!this.equalGrid(grid, newGrid))
            paths.push({grid: newGrid, action: actions[i]});
    }

    for (var i=1; i<=this.searchDepth; i++) {
        var length = paths.length;
        for (var j=0; j<length; j++) {
            var path = paths.shift();
            for (var k=0; k<actions.length; k++) {
                var newGrid =  this.move(path.grid, actions[k]);
                paths.push({grid: newGrid, action: path.action});
            }
        }
    }

    return this.findBest(paths);
}

GameSolver.prototype.findBest = function (paths) {
    paths = _.shuffle(paths);

    var pathGroups = _.groupBy(paths, function (p) {
        return p.action;
    });
    
    var maxAction = -1;
    var maxScore = -1;
    for (var action in pathGroups) {
        var group = pathGroups[action];
        var score = 0;
        for (var j=0; j<group.length; j++) {
            score += this.getScore(group[j].grid);
        }

        if (score > maxScore) {
            maxScore = score;
            maxAction = action;
        }
    }
    
    return maxAction;
}

GameSolver.prototype.getScore = function (grid) {
    var valScore = 0;
    var spaceScore = 0;
    for (var i=0; i<grid.length; i++) {
        var col = grid[i];
        for (var j=0; j<col.length; j++) {
            if (col[j] != null)
                valScore += col[j].value / 2048;
            else
                spaceScore += 1 / 16;

        }
    }

    return spaceScore / valScore;
}

GameSolver.prototype.maxValue = function (grid) {
    var maxVal = 0;
    for (var i=0; i<grid.length; i++) {
        var col = grid[i];
        for (var j=0; j<col.length; j++) {
            if (col[j] > maxVal) maxVal = col[j];
        }
    }

    return maxVal;
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

GameSolver.prototype.equalGrid = function (g1, g2) {
    var equal = true;

    for (var i=0; i<g1.length; i++) {
        for (var j=0; j<g1.length; j++) {
            if ((g1[i][j]==null && g2[i][j]!=null) || (g1[i][j]!=null && g2[i][j]==null)) {
                equal = false;
                break;
            }
            else if (g1[i][j]!=null && g2[i][j]!=null) {
                if (g1[i][j].value!=g2[i][j].value
                || g1[i][j].position.x!=g2[i][j].position.x
                || g1[i][j].position.y!=g2[i][j].position.y) {
                    equal = false;
                    break;
                }
            }
        }
    }

    return equal;
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