function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.copy = function() {
	var ret = new Tile({x: this.x, y:this.y}, this.value);
	ret.x = this.x+0;
	ret.y = this.y+0;
	ret.value = this.value+0;
	ret.previousPosition = null;
	ret.mergedFrom = null;
	return ret;
};


