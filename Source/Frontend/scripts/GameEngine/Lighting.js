var Lighting = {};

Lighting.AmbientLight = function (options) {
    var self = this;
    self.options = $.extend({}, {
        intensity: 0.6,
        getSource: null
    }, options);

    self.BufferedFX = null;
    self.Gradient = null;
    self.LastSource = {x: 0, y: 0};

    self.Render = function (ctx) {
        var source = self.options.getSource ? self.options.getSource() : { x: (ctx.canvas.width / 2), y: (ctx.canvas.height / 2) };

        if (self.Gradient == null || source.x != self.LastSource.x || source.y != self.LastSource.y) {
            self.Gradient = ctx.createRadialGradient(source.x, source.y, (ctx.canvas.width / 2) * 0.2, source.x, source.y, ctx.canvas.width * 0.7);
            self.Gradient.addColorStop(0, 'rgba(0,0,0,0)');
            self.Gradient.addColorStop(1, 'rgba(0,0,0,1)');
            self.BufferedFX = null;
        }

        if (self.BufferedFX == null) {
            self.BufferedFX = RenderEng.RenderUtils.createRenderBuffer(ctx.canvas.width, ctx.canvas.height);
            var bCtx = self.BufferedFX.getContext("2d");
            bCtx.rect(0, 0, bCtx.canvas.width, bCtx.canvas.height);
            bCtx.fillStyle = self.Gradient;
            bCtx.fill();
        }
        
        ctx.drawImage(self.BufferedFX, 0, 0);

        self.LastSource.x = source.x;
        self.LastSource.y = source.y;
    }
};

Lighting.SpritePointLight = function (sprite, world, options) {
    var self = this;
    self.sprite = sprite;
    self.world = world;
    self.options = $.extend({}, {
        rays: 500,
        ambientLightStart:0,
        ambientLightEnd: 0,
        ambientLightItensityStart: 0,
        ambientLightItensityEnd: 0,
        LightRayIntensityStart: 0,
        LightRayIntensityEnd: 0,
    }, options);

    self.lastLoc = null;
    self.lightBox = null;

    self.Render = function (ctx) {
        if (self.lightBox == null) {
            self.lightBox = RenderEng.RenderUtils.createRenderBuffer(ctx.canvas.width, ctx.canvas.height);
        }

        var source = {
            x: self.sprite.LocX + (self.sprite.getWidth() / 2) - self.world.worldViewX,
            y: self.sprite.LocY + (self.sprite.getHeight() / 2) - self.world.worldViewY,
        };

        if (self.lastLoc == null || self.lastLoc.x != self.sprite.LocX || self.lastLoc.y != self.sprite.LocY) {
            var lCtx = self.lightBox.getContext('2d');

           
            
            
            lCtx.clearRect(0, 0, lCtx.canvas.width, lCtx.canvas.height);

            var radial = lCtx.createRadialGradient(source.x, source.y, (lCtx.canvas.width / 2) * self.options.ambientLightStart, source.x, source.y, (lCtx.canvas.width / 2) * self.options.ambientLightEnd);
            radial.addColorStop(0, 'rgba(0,0,0,' + self.options.ambientLightItensityStart + ')');
            radial.addColorStop(1, 'rgba(0,0,0,' + self.options.ambientLightItensityEnd + ')');
            lCtx.rect(0, 0, lCtx.canvas.width, lCtx.canvas.height);
            lCtx.fillStyle = radial;
            lCtx.fill();


            lCtx.save();
            lCtx.globalCompositeOperation = 'destination-out';
            lCtx.fillStyle = 'rgba(1,1,1,0.1)';
            
            for (var i = 0; i < self.options.rays; i++) {
                ray = { x: self.sprite.LocX + (self.sprite.getWidth() / 2), y: self.sprite.LocY + (self.sprite.getHeight() / 2) };
                var inc = ((2 * Math.PI) / self.options.rays);
                var rads = inc * i;
                var vect = {
                    x: Math.cos(rads),
                    y: Math.sin(rads)
                };

                do {
                    ray.y += 5 * vect.y;
                    ray.x += 5 * vect.x;
                    var tileLoc = self.world.GetTileLocationInd(Math.floor(ray.x), Math.floor(ray.y));
                    var tile = self.world.levelData[tileLoc.x][tileLoc.y];
                } while (tile && tile.walkable);
            
                lCtx.beginPath();
                lCtx.moveTo(source.x, source.y);
            
                var length = Math.sqrt(Math.pow((self.sprite.LocX - ray.x), 2) + Math.pow((self.sprite.LocY - ray.y), 2));

                length = Math.min(length,1200);

                lCtx.arc(source.x, source.y, length, rads - (inc), rads + (inc), false);
                
                
                var radial2 = lCtx.createRadialGradient(source.x, source.y, length - 25 > 0 ? length - 25 : 0, source.x, source.y, length);
                radial2.addColorStop(0, 'rgba(0,0,0,' + self.options.LightRayIntensityStart + ')');
                radial2.addColorStop(1, 'rgba(0,0,0,' + self.options.LightRayIntensityEnd + ')');
                lCtx.fillStyle = radial2;
                

                lCtx.fill();
            }

            lCtx.restore();
            
        
            self.lastLoc = { x: self.sprite.LocX, y: self.sprite.LocY };
        }

        ctx.drawImage(self.lightBox, 0, 0);
    }
}