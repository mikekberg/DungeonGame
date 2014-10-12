/// <reference path="../Libraries/jquery-1.6.2.js" />

var Cameras = {
    SpriteWorldCamera: function (world, sprite) {
        world.AddSprite(sprite);
        return {
            attachedSprite: sprite,
            targetWorld: world,
            Render: function(ctx) {
                var viewWidth = ctx.canvas.width;
                var viewHeight = ctx.canvas.height;
                var spriteWidth = this.attachedSprite.getWidth();
                var spriteHeight = this.attachedSprite.getHeight();
                var sLocX = this.attachedSprite.LocX;
                var sLocY = this.attachedSprite.LocY;
                var worldViewX = 0;
                var worldViewY = 0;

                if (sLocX+(spriteWidth/2) > (viewWidth/2)) {
                    worldViewX = Math.min((sLocX+(spriteWidth/2)) - (viewWidth/2), (this.targetWorld.worldSize.width*this.targetWorld.tileSet.TileWidth)-viewWidth);
                }
                if (sLocY+(spriteHeight/2) > (viewHeight/2)) {
                    worldViewY = Math.min(sLocY+(spriteHeight/2) - (viewHeight/2), (this.targetWorld.worldSize.width*this.targetWorld.tileSet.TileHeight)-viewHeight);
                }
                
                this.attachedSprite.AbsLocX = (sLocX - worldViewX) < 0 ? sLocX : (sLocX - worldViewX);
                this.attachedSprite.AbsLocY = (sLocY - worldViewY) < 0 ? sLocY : (sLocY - worldViewY);
                this.targetWorld.worldViewX = worldViewX;
                this.targetWorld.worldViewY = worldViewY;

                this.targetWorld.Render(ctx, worldViewX, worldViewY);
            },
        };
    }
};