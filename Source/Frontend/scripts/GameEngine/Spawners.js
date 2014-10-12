/// <reference path="../Libraries/jquery-1.6.2.js" />

var Spawners = {
    SpawnRandomly: function(world, enemyName, freq) {
      var spawnFreq = freq || 0.10;
      
      for (var x=0;x<world.worldSize.width;x++) {
        for (var y=0;y<world.worldSize.height;y++) {
            if (world.levelData[x][y].walkable) {
                if (Math.random() <= spawnFreq) {
                    var loc = world.GetTileLocation(x,y);
                    var newEnemy = Enemy.GetByName(enemyName, loc.x, loc.y);
                    world.AddEnemy(newEnemy);
                }
            }
        }
      }
    }
};