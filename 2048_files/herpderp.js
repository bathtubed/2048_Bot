function AIGrid(size) {
  this.size         = size; // Size of the grid

  this.startTiles   = 2;
  this.setup();
}

// Restart the game
AIGrid.prototype.restart = function () {
  this.setup();
};

// Keep playing after winning
AIGrid.prototype.keepPlaying = function () {
  this.keepPlaying = true;
};

AIGrid.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
AIGrid.prototype.setup = function () {
  this.grid        = new Grid(this.size);

  this.score       = 0;
  this.over        = false;
  this.won         = false;
  this.keepPlaying = false;
  this.bestTile	   = 2;

  // Add the initial tiles
  this.addStartTiles();
};

// Set up the initial tiles to start the game with
AIGrid.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
AIGrid.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
  
  if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }  
};

// Save all tile positions and remove merger info
AIGrid.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
AIGrid.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
AIGrid.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;
  console.log("Moving "+direction);

  if (this.isGameTerminated()) return false; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;
  // Save the current tile positions and remove merger information
  this.prepareTiles();
  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);
      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;
		  
		  if(merged.value > self.bestTile)
			self.bestTile = merged.value;
		  
          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }
		

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });
  if (moved) {
    //this.addRandomTile();
    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }
  }
  return moved;
};

// Get the vector representing the chosen direction
AIGrid.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
AIGrid.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

AIGrid.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

AIGrid.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
AIGrid.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

AIGrid.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};

function getBest(gameManager, depth)
{
	var max = -1;
	var rtrn = -1;
	for(var i = 0; i < 4; i++)
	{
		var moves = [];
		moves.push(i);
		console.log("testing "+moves.pop());
		moves.push(i);
		var ret = randMove(gameManager, moves, depth);
		console.log("best move as "+moves[0]+" with ret="+ret+" and max ="+max);
		moves.pop();
		if(ret > max)
		{
			max = ret;
			rtrn = i;
		}
	}
	return rtrn;
}

function randMove(gameManager, moves, depth)
{
	console.log("rand move of "+moves);
	var temp = new AIGrid(gameManager.size);
	temp.startTiles = gameManager.startTiles;
	temp.grid = gameManager.grid.copy();
	temp.score = gameManager.score;
	temp.won = gameManager.won;
	temp.keepPlaying = gameManager.keepPlaying;
	temp.bestTile = gameManager.bestTile;
	
	for(var m in moves)
	{
		if(m % 2 === 0)
		{
			if(!temp.move(moves[m]))
			{
				return -depth;
			}
		}
		else
		{
			if(moves[m] > temp.size*temp.size-1)
				temp.grid.insertTile(new Tile({x:(Math.floor(moves[m]/temp.size))-temp.size, y:moves[m]%temp.size}, 4));
			else
				temp.grid.insertTile(new Tile({x:Math.floor(moves[m]/temp.size), y:moves[m]%temp.size}, 2));
		}
	}
	if(depth === 0)
	{
		return evaluate(temp);
	}
	if(temp.isGameTerminated())
	{
		if(temp.won)
			return evaluate(temp)*1000;
		else if(temp.over)
			return -depth;
		return evaluate(temp);
	}
	
	var cells = temp.grid.availableCells();
	var avg = 0;
	for(var c in cells)
	{
		moves.push(cells[c].x*temp.size+cells[c].y);
		avg += bestMove(gameManager, moves, depth-1);
		moves.pop();
		moves.pop();
	}
	avg/=cells.length;
	avg*=9;
	for(var c in cells)
	{
		moves.push(cells[c].x*temp.size+cells[c].y+temp.size*temp.size);
		avg += bestMove(gameManager, moves, depth-1);
		moves.pop();
		moves.pop();
	}
	
	return avg/10;
}

function bestMove(gameManager, moves, depth)
{
	console.log("best move of "+moves);
	var temp = new AIGrid(gameManager.size);
	temp.startTiles = gameManager.startTiles;
	temp.grid = gameManager.grid.copy();
	temp.score = gameManager.score;
	temp.won = gameManager.won;
	temp.keepPlaying = gameManager.keepPlaying;
	temp.bestTile = gameManager.bestTile;
	
	for(var m in moves)
	{
		if(m % 2 === 0)
		{
			if(!temp.move(moves[m]))
			{
				moves.push(-1);
				return -depth;
			}
		}
		else
		{
			console.log("inserting "+moves[m])
			if(moves[m] > temp.size*temp.size-1)
				temp.grid.insertTile(new Tile({ x:(Math.floor(moves[m]/temp.size))-temp.size, y:moves[m]%temp.size}, 4));
			else
				temp.grid.insertTile(new Tile({x:Math.floor(moves[m]/temp.size), y:moves[m]%temp.size}, 2));
		}
	}
	if(depth === 0)
	{
		moves.push(-1);
		return evaluate(temp);
	}
	if(temp.isGameTerminated())
	{
		moves.push(-1);	
		if(temp.won)
			return evaluate(temp)*1000;
		else if(temp.over)
			return -depth;
		return evaluate(temp);
	}
	var max = 0;
	var best;
	for(var i = 0; i < 4; i++)
	{
		moves.push(i);
		var ret = randMove(gameManager, moves, depth-1);
		if(ret > max)
		{
			max = ret;
			best = i;
		}
		moves.pop();
	}
	
	moves.push(best);
	return max;
}


function evaluate(g) 
{
	var corner = g.cells[0][0];
	var adder = 0;
	if(g.bestTile < 256)
		return g.score;
	if(corner !== null)
	{
		if(corner.value === g.bestTile)
			adder += g.bestTile*0.5;
	}
	for(var i=1; i < 4; i++)
	{
		if(cells[i][0] !== null)
		{
			if(cells[i][0].value >= 256)
			{
				adder += cells[i][0].value*0.125;
				if(cells[i-1][0] !== null && cells[i-1][0] >= cells[i][0])
					adder += cells[i][0].value*0.125;
			}
		}
	}
	
	return g.score + adder;
}

function AIGameManager(size, Actuator, ScoreManager) {
  this.size         = size; // Size of the grid
  this.scoreManager = new ScoreManager;
  this.actuator     = new Actuator;
  
  this.startTiles   = 2;
  this.setup();
}

// Restart the game
AIGameManager.prototype.restart = function () {
  this.actuator.continue();
  this.setup();
};

// Keep playing after winning
AIGameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continue();
};

AIGameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
AIGameManager.prototype.setup = function () {
  this.grid        = new Grid(this.size);

  this.score       = 0;
  this.over        = false;
  this.won         = false;
  this.keepPlaying = false;
  this.bestTile = 2;

  // Add the initial tiles
  this.addStartTiles();

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
AIGameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
AIGameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
AIGameManager.prototype.actuate = function () {
  if (this.scoreManager.get() < this.score) {
    this.scoreManager.set(this.score);
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.scoreManager.get(),
    terminated: this.isGameTerminated()
  });

};

// Save all tile positions and remove merger info
AIGameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
AIGameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
AIGameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

		  
		  if(merged.value > self.bestTile)
			self.bestTile = merged.value;
		  
		  
          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
AIGameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
AIGameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

AIGameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

AIGameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
AIGameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

AIGameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};




