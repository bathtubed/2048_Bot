// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
	var game = new AIGameManager(4, HTMLActuator, LocalScoreManager);
	var won = false;
	  setInterval(function () {
	  if(!game.over)
      {
		//alert("wassuppppp");
		var grid = new AIGrid(game.size);
		grid.grid = game.grid;
		grid.score = game.score;
		grid.over = game.over
		grid.won = game.won;
		grid.keepPlaying = game.keepPlaying;
		//game.move(getBest(game, 16-game.grid.availableCells().length));
		if(game.grid.availableCells().length === 2)
			game.move(getBest(game, 4));
		else if(game.grid.availableCells().length === 1)
			game.move(getBest(game, 4));
		else if(game.grid.availableCells().length === 0)
			game.move(getBest(game, 6));
		else
			game.move(getBest(game, 2));
			
		if(game.won && !won)
		{
			alert("HOLY FUCK WE WON");
			won = true;
			game.keepPlaying();
		}
	  }
	  else
	  {
		  game.restart();
	  }
	  }, 300);
    console.log("HI");
});