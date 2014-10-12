/// <reference path="../Libraries/jquery-1.6.2.js" />

var World = function (worldName, width, height, tileSet) {
    this.levelData = null;
    this.imageCache = null;
    this.worldName = worldName;
    this.worldSize = null;
    this.sprites = new Array();
    this.enemies = new Array();
    this.showGrid = false;
    this.tileSet = null;
    this.collisionTree;
    this.worldLayers = [];

    this.Init = function (worldSizeX, worldSizeY, tileSet) {
        if (!GameData.TileSets[tileSet])
            throw "Tileset '" + tileSet + "' not found in GameData.";

        this.tileSet = GameData.TileSets[tileSet];

        this.worldSize = { width: worldSizeX,
            height: worldSizeY
        };

        this.collisionTree = QUAD.init({x: 0, y: 0, h: this.tileSet.TileHeight * this.worldSize.height, w: this.tileSet.TileWidth * this.worldSize.width, maxChildren : 10, maxDepth : 5});
        this.imageCache = ImageCacher.CreateCache(this.worldName);
        this.LoadImageCache(this.tileSet);
    };

    this.RenderWorld = function (ctx, layer) {
        for (var x = 0; x < this.worldSize.width; x++) {
            for (var y = 0; y < this.worldSize.height; y++) {
                if (!layer || this.levelData[x][y].layer == layer) {
                    ctx.drawImage(this.imageCache.get(this.levelData[x][y].name),
                                  this.levelData[x][y].x || 0,
                                  this.levelData[x][y].y || 0,
                                  this.tileSet.TileWidth,
                                  this.tileSet.TileHeight,
                                  x * this.tileSet.TileWidth,
                                  y * this.tileSet.TileHeight,
                                  this.tileSet.TileWidth,
                                  this.tileSet.TileHeight);
                    if (this.showGrid) {
                        ctx.strokeStyle = "rgba(0,0,0,0.1)";
                        ctx.strokeRect(x * this.tileSet.TileWidth, y * this.tileSet.TileWidth,
                                      (x + 1) * this.tileSet.TileWidth, (y + 1) * this.tileSet.TileHeight);
                        ctx.strokeStyle = "rgba(0,0,0,1)";
                    }
                }
            }
        }
    };

    this.LoadWorldBuffer = function () {
        var maxLayers = _.max(_.map(World1.tileSet.Tiles, function (d) { return d.layer || 0; }));
        for (var i = 0; i < maxLayers + 1; i++) {
            this.worldLayers.push(RenderEng.RenderUtils.createRenderBuffer(this.worldSize.width * this.tileSet.TileWidth, this.worldSize.height * this.tileSet.TileHeight));
            this.RenderWorld(this.worldLayers[i].getContext('2d'), i);
        }
    };

    this.Render = function (ctx, vx, vy) {
        var viewX = vx || 0;
        var viewY = vy || 0;

        if (!this.imageCache.isReady()) {
            return;
        }
        if (this.worldLayers.length == 0) {
            this.LoadWorldBuffer();
        }

        var viewWidth = Math.min(ctx.canvas.width, (this.worldSize.width * this.tileSet.TileWidth) - viewX);
        var viewHeight = Math.min(ctx.canvas.height, (this.worldSize.height * this.tileSet.TileHeight) - viewY);

        if (this.lastViewWidth != viewWidth || this.lastViewHeight != viewHeight) {
            this.frameBuffer = null;
        }


        if (this.frameBuffer == null) {
            this.frameBuffer = RenderEng.RenderUtils.createRenderBuffer(ctx.canvas.width, ctx.canvas.height);
            this.lastViewWidth = ctx.canvas.width;
            this.lastViewHeight = ctx.canvas.height;
        }

        if (this.lastViewX != viewX || this.lastViewY != viewY) {
            for (var i = 0; i < this.worldLayers.length; i++) {
                this.frameBuffer.getContext('2d').drawImage(this.worldLayers[i],
                              viewX,
                              viewY,
                              viewWidth,
                              viewHeight,
                              0,
                              0,
                              viewWidth,
                              viewHeight);
            }


            this.lastViewX == viewX;
            this.lastViewY == viewY;
        }

        ctx.drawImage(this.frameBuffer, 0, 0);

        this.sprites.sort(function (s1, s2) {
            var s1cLocY = s1.LocY;
            var s2cLocY = s2.LocY + s2.CurrentState.clipHeight;
            return s1cLocY == s2cLocY ? 0 : (s1cLocY < s2cLocY ? -1 : 1);
        });

        for (var sprite in this.sprites) {
            var curSprite = this.sprites[sprite];

            if (!curSprite.dead) {
                if (!sprite.AbsLocX && !sprite.AbsLocY) {
                    if ((curSprite.LocX + curSprite.getWidth()) - vx > 0 && curSprite.LocX - vx < viewWidth &&
                        (curSprite.LocY + curSprite.getHeight()) - vy > 0 && curSprite.LocY - vy < viewHeight) {
                        this.sprites[sprite].Render(ctx, curSprite.LocX - vx, curSprite.LocY - vy);
                        this.sprites[sprite].renderedLastFrame = true;
                    }
                    else {
                        this.sprites[sprite].renderedLastFrame = false;
                    }
                }
                else {
                    this.sprites[sprite].Render(ctx, curSprite.AbsLocX, curSprite.AbsLocY);
                }
            }
        }
    };

    this.Update = function (elapseTime) {
        for (var enemy in this.enemies) {
            if (!this.enemies[enemy].dead) {
                this.enemies[enemy].Update(elapseTime);
            }
        }
    }

    this.CollideTest = function (sprite) {
        var items = _.map(this.sprites, function (s) { return { x: { value: s.WorldLocX }, y: { value: s.WorldLocY }, sprite: s }; });
        this.collisionTree.clear();
        this.collisionTree.insert(items);
        for (var i = 0; i < items.length; i++) {
            this.collisionTree.retrieve(items[i], function (item) {
                if (item == items[i])
                    return;

                if (GameUtils.Collide(
                    { x: (item.sprite.LocX + item.sprite.CurrentState.clipX), y: (item.sprite.LocY + item.sprite.CurrentState.clipY), width: item.sprite.CurrentState.clipWidth, height: item.sprite.CurrentState.clipHeight },
                    { x: (sprite.LocX + sprite.CurrentState.clipX), y: (sprite.LocY + sprite.CurrentState.clipY), width: sprite.CurrentState.clipWidth, height: sprite.CurrentState.clipHeight })) {
                    QEvent.fire(sprite, Events.Sprites.Collision, { source: sprite, target: item.sprite });
                    QEvent.fire(item.sprite, Events.Sprites.Collision, { source: item.sprite, target: sprite });
                }
            });
        }
    }

    this.AddEnemy = function (enemy) {
        this.enemies.push(enemy);
        this.AddSprite(enemy.sprite);
    };

    this.AddSprite = function (sprite) {
        var spriteLoc = this.GetTileLocation(sprite.LocX, sprite.LocY);
        sprite.WorldLocX = spriteLoc.x;
        sprite.WorldLocY = spriteLoc.y;
        sprite.world = this;

        this.sprites.push(sprite);
    };

    this.LoadImageCache = function (tileMap) {
        for (var tile in tileMap.Tiles) {
            this.imageCache.cacheImageBySrc(tileMap.Tiles[tile].name, tileMap.Tiles[tile].src);
        }
    };

    this.CheckCacheReady = function () {
        for (var c in this.imageCache) {
            if (!this.imageCache[c].complete)
                return false;
        }

        return true;
    };

    this.CalculatePath = function (startBlockX, startBlockY, endBlockX, endBlockY) {
        var pather = GameData.GameConsts.PATH_FINDER
        pather.init(this);
        var path = pather.search(this, startBlockX, startBlockY, endBlockX, endBlockY);
        path.unshift({ x: startBlockX, y: startBlockY });

        return path;
    };

    this.GetTileLocation = function (tileX, tileY) {
        return { x: tileX * this.tileSet.TileWidth,
            y: tileY * this.tileSet.TileHeight
        };
    };

    this.GetTileLocationCenter = function (tileX, tileY) {
        return { x: tileX * this.tileSet.TileWidth + (this.tileSet.TileWidth / 2),
            y: tileY * this.tileSet.TileHeight + (this.tileSet.TileHeight / 2)
        };
    };

    this.GetTileLocationInd = function (locX, locY) {
        return { x: Math.floor(locX / this.tileSet.TileWidth),
            y: Math.floor(locY / this.tileSet.TileHeight)
        };
    };


    this.Init(width, height, tileSet);
}