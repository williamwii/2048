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
    var action = parseInt(Math.random() * 4) % 4;
    return action;
}