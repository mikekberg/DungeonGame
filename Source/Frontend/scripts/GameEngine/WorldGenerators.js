/// <reference path="../Libraries/jquery-1.6.2.js" />

var WorldGenerators = {
    CaveGenerator: {
        startingClosed: 40,
        normalIterations: 100,
        specialIterations:0,
        r1CloseCheck: 4,
        r1OpenCheck: 5,
        r2CloseCheck: 9,
        maxOrphanSize: 2000,
        
        GenerateWorld: function(tileSet, width, height, options) {
            var rtnWorld = new Array();
            for(var x=0;x<width;x++) {
                rtnWorld.push([])
                for(var y=0;y<height;y++) {
                   rtnWorld[x].push((Math.random() * 100) > this.startingClosed);
                }
            }
            
            for (var i=0;i<this.normalIterations+1;i++) {
                this.DoIteration(rtnWorld);
            }
            
            for (var i=0;i<this.specialIterations+1;i++) {
                this.DoIteration(rtnWorld, true);
            }
            
            var orphanList = this.BuildOrphanList(rtnWorld);
            
            for (var o in orphanList) {
                if (orphanList[o].length < this.maxOrphanSize)  {
                    this.FillCave(rtnWorld, orphanList[o]);
                }
            }
            
            return this.CreateWorldObj(rtnWorld, tileSet, options);
        },
        
        FillCave: function(caveData, fillList) {
            for (var i in fillList) {
                var id = fillList[i];
                caveData[id.x][id.y] = false;
            }
        },
        
        
        BuildOrphanList: function(caveData) {
            var orphanList = new Array();
            var visitList = [];
            
            for (var x=0;x<caveData.length;x++) {
                visitList.push(new Array());
                for (var y=0;y<caveData[x].length;y++) {
                    visitList[x].push(false);
                }
            }
            
            for (var vx=0;vx<caveData.length;vx++) {
                for (var vy=0;vy<caveData[0].length;vy++) {
                    if (caveData[vx][vy]) {
                        var curList = new Array();
                        this.BuildFloodList(caveData, vx, vy, curList, visitList);
                        orphanList.push(curList);
                    }
                }
            }
            
            return orphanList;
        },
        
        FloodEntryExistsInArray: function(floodLists, x, y) {
            for (var i in floodLists) {
                if (this.FloodEntryExists(floodLists[i], x, y)) {
                    return true;
                }
            }
            return false;
        },
        
        FloodEntryExists: function(floodList, x, y) {
            for (entry in floodList) {
                if (floodList[entry].x == x && floodList[entry].y == y) {
                    return true;
                }
            }
            return false;
        },
        
        BuildFloodList: function(caveData, x, y, floodArray, visitList) {
            if (x < 0 || y < 0 || x > caveData.length || y > caveData[0].length || !caveData[x][y] || visitList[x][y]) {
                return;
            }
            
            floodArray.push({x: x, y: y});
            visitList[x][y] = true;
            
            for (var vx=-1;vx<2;vx++) {
                for (var vy=-1;vy<2;vy++) {
                    if (vx == 0 || vy == 0) {
                        this.BuildFloodList(caveData, x+vx, y+vy, floodArray, visitList);
                    }
                }
             }
        },
        
        GetWallCode: function(caveData, x, y) {
            var rtnCode = "";
            for (var yn = -1; yn<2; yn++) {
                for (var xn = -1; xn<2; xn++) {
                    if (x+xn < 0 || y+yn < 0 || x+xn > caveData.length-1 || y+yn > caveData[x+xn].length-1 || !caveData[x+xn][y+yn]) {
                        rtnCode += ((xn+2)+((yn+1)*3)).toString();
                    }
                }
            }
            
            return rtnCode;
        },
        
        CreateWorldObj: function(caveData, tileSet, options) {
            var rtnWorld = new World("GeneratedCave", caveData.length, caveData[0].length, tileSet);
            var mapData = new Array();
            
            function GetTileByName(name) {
                if (rtnWorld.tileSet.TileGroups[name]) {
                    var rndNum = Math.random();
                    var rTot = 0.00;
                    for (var grouptile in rtnWorld.tileSet.TileGroups[name]) {
                        rTot += rtnWorld.tileSet.TileGroups[name][grouptile].distribution;
                        if (rTot > rndNum) {
                            return GetTileByName(rtnWorld.tileSet.TileGroups[name][grouptile].tileName);
                        }
                    }
                    throw "Distributions do not add to 1.00 for group " + name;
                }
                
                for(var tile in rtnWorld.tileSet.Tiles) {
                    if (rtnWorld.tileSet.Tiles[tile].name == name)
                        return rtnWorld.tileSet.Tiles[tile];
                }
            }

            for (var x = 0; x < rtnWorld.worldSize.width; x++) {
                var linedata = new Array();
                for (var y = 0; y < rtnWorld.worldSize.height; y++) {
                    var tileName = this.GetCaveRule(this.GetWallCode(caveData, x, y), rtnWorld);
                    //Dearest Ryan, in case your wondering where the rules thing went
                    //I decided to make it less messy and put it in gameData.js
                    
                    linedata.push(GetTileByName(tileName == "" ? (caveData[x][y] ? rtnWorld.tileSet.CaveGeneratorRules.DefaultGroundTile : rtnWorld.tileSet.CaveGeneratorRules.DefaultWallTile) : 
                                                                  tileName));
                }
                mapData.push(linedata);
            }

            this.PlaceSingleTile(caveData, mapData, GetTileByName("StairsDown"), function (tileCode) { return tileCode.toString().indexOf("5") == -1; });

            if (options.lastMapDirection) {
                this.PlaceSingleTile(caveData, mapData, GetTileByName("StairsUp"), function (tileCode) { return tileCode.toString().indexOf("5") == -1; });
            }
            
            
            rtnWorld.levelData = mapData;
            
            return rtnWorld;
        },

        PlaceSingleTile: function (caveData, mapData, tile, condition) {
            var placed = false;

            while (!placed) {
                var x = Math.floor(Math.random() * caveData[0].length);
                var y = Math.floor(Math.random() * caveData.length);
                var tileCode = this.GetWallCode(caveData, x, y);

                if (condition(tileCode)) {
                    mapData[x][y] = tile;
                    placed = true;
                }
            }
        },
        
        GetCaveRule: function(tileCode, world) {
            var unknown = "";
            for (var tileName in world.tileSet.CaveGeneratorRules.EdgeRules) {
                for(var code in world.tileSet.CaveGeneratorRules.EdgeRules[tileName]) {
                    if (world.tileSet.CaveGeneratorRules.EdgeRules[tileName][code] == tileCode)
                        return tileName;
                    else if (world.tileSet.CaveGeneratorRules.EdgeRules[tileName][code] == "?")
                        unknown = tileName;
                }
            }
            
            return unknown;
        },
        
        DoIteration: function(world, special) {
            var doSpecial = special || false;
            var sizeX = world.length;
            var sizeY = world[0].length;
            
            for(var x=0;x<sizeX;x++) {
                for(var y=0;y<sizeY;y++) {
                    if (x == 0 || y == 0 || x == world.length-1 || y == world[x].length-1) {
                        world[x][y] = false;
                    }
                    else {
                        var r1Closed = 0;
                        var r1Open = 0;
                        for (var xn=-1;xn<2;xn++) {
                            for (var yn=-1;yn<2;yn++) {
                                if (!(xn == 0 && yn == 0)) {
                                    if (!world[x+xn][y+yn]) {
                                        r1Closed++;
                                    }
                                    else {
                                        r1Open++;
                                    }
                                }
                            }
                        }
                        
                        if (doSpecial && (x > 1 && y > 1) && (x < sizeX - 2 && y < sizeY - 2)) {
                            var r2Closed = 0;
                            var r2Open = 0;
                            
                            for (var xn=-2;xn<3;xn++) {
                                for (var yn=-2;yn<3;yn++) {
                                    if (Math.abs(yn) > 1 || Math.abs(xn) > 1) {
                                        if (!world[x+xn][y+yn]) {
                                            r2Closed++;
                                        }
                                        else {
                                            r2Open++;
                                        }
                                    }
                                }
                            }
                            
                            if (r2Closed > this.r2CloseCheck) {
                                world[x][y] = false;
                            }
                        }
                        
                        if (r1Closed > this.r1CloseCheck) {
                            world[x][y] = false;
                        }
                        
                        if (r1Open > this.r1OpenCheck) {
                            world[x][y] = true;
                        }
                    }
                }
            }
        }
    }
};