/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="sprite.js" />
/// <reference path="Events.js" />

var MovementDirection = { NW: 1,
                          N: 2,
                          NE: 3,
                          W: 4,
                          None: 5,
                          E: 6,
                          SW: 7,
                          S: 8,
                          SE: 9
                        };

Sprite.Extensions = Sprite.Extensions || { };

Sprite.Extensions.MovementExtension = function (sprite) {
    if (!sprite.SpriteData.movementInfo)
        return;

    sprite.StartWalking = function (direction) {
        if (this.movementDirection == direction && this.moving)
            return;
        if (!this.ableToMove)
            return;
         
        var y = Math.floor((direction - 1) / 3) - 1;
        var x = direction - ((y + 1) * 3) - 2;

        this.movementVector.x = sprite.SpriteData.movementInfo.moveSpeed * (x / (y != 0 ? 1.3 : 1));
        this.movementVector.y = sprite.SpriteData.movementInfo.moveSpeed * (y / (x != 0 ? 1.3 : 1));
        this.facing = direction;

        this.movementDirection = direction;

        if (!this.CanWalk(this.LocX, this.LocY)) {
            this.StopWalking();
            return;
        }

        if (!this.movementInfo.directionStates[direction])
            return;

        if (this.CurrentState.name != this.movementInfo.directionStates[direction].movingState) {
            this.ChangeState(this.movementInfo.directionStates[direction].movingState);
        }

        this.moving = true;
        this.lastWalkTime = (new Date()).getTime();
    }

    sprite.StopWalking = function () {
        if (!this.moving) {
            return;
        }
        this.moving = false;
        this.movementVector.x = 0;
        this.movementVector.y = 0;
        this.movementDirection = MovementDirection.None;
        this.ChangeState(this.movementInfo.directionStates[this.facing].facingState);
    };

    sprite.movementInfo = sprite.SpriteData.movementInfo;
    sprite.movementVector = { x: 0, y: 0 };
    sprite.movementDirection = MovementDirection.None;
    sprite.facing = MovementDirection.S;
    sprite.ableToMove = true;

    sprite.CanWalk = function (locX, locY) {
        if (this.world) {
            for (var x = 0; x < 2; x++) {
                for (var y = 0; y < 2; y++) {
                    var spriteStepLocation = this.world.GetTileLocationInd((locX + this.CurrentState.clipX) + (x * this.CurrentState.clipWidth), (locY + this.CurrentState.clipY) + (x * this.CurrentState.clipHeight));

                    if ((spriteStepLocation.x >= 0 && spriteStepLocation.x < this.world.worldSize.width &&
                        spriteStepLocation.y >= 0 && spriteStepLocation.x < this.world.worldSize.height)) {

                        var spriteFloorTile = this.world.levelData[spriteStepLocation.x][spriteStepLocation.y];

                        if (!spriteFloorTile || !spriteFloorTile.walkable) {
                            return false;
                        } else if (spriteFloorTile.trigger) {
							QEvent.fire(this.world, spriteFloorTile.trigger, { tile: spriteFloorTile })
						}
                    }
                }
            }
        }

        return true;
    };

    QEvent.add(sprite, Events.Engine.Update, function (data) {
        if (this.moving) {
            var moveAmount = Number((data.elapseTime) / 1000);

            var dX = this.movementVector.x > 0 ? Math.floor(moveAmount * this.movementVector.x) : Math.ceil(moveAmount * this.movementVector.x);
            var dY = this.movementVector.y > 0 ? Math.floor(moveAmount * this.movementVector.y) : Math.ceil(moveAmount * this.movementVector.y);

            if (dX != 0 || dY != 0) {
                if (!this.CanWalk(this.LocX + dX, this.LocY + dY)) {
                    this.StopWalking();
                    return;
                }

                this.LocX += dX;
                this.LocY += dY;
            }
        }
    });

}