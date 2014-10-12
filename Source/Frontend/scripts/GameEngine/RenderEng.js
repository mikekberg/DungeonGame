/// <reference path="../Libraries/jquery-1.6.2.js" />

var RenderEng = function (ctx) {
    this.RenderLayers = {
        'Environment': [],
        'Sprites': [],
        'PostLitEffects': [],
        'Lighting': [],
        'Interface': [],
    };

    this.DefaultLayer = 'Sprites';

    this.RenderElements = new Array();
    this.context = ctx;
    this.backBuffer = null;
    this.showFPS = false;
    this.fpsData = { fps: 0, lastTime: (new Date()).getTime(), frameCount: 0 };

    this.Add = function (item, layer) {
        this.RenderLayers[layer || this.DefaultLayer].push(item);
    };

    this.CreateBackBuffer = function () {
        this.backBuffer = RenderEng.RenderUtils.createRenderBuffer(ctx.canvas.width, ctx.canvas.height);
    };

    this.Render = function (elapseTime, currentTime) {
        if (this.backBuffer == null ||
            this.backBuffer.width != this.context.canvas.width ||
                this.backBuffer.height != this.context.canvas.height) {
            this.CreateBackBuffer();
        }

        var bufferContext = this.backBuffer.getContext('2d');
        bufferContext.fillStyle = '#000000';
        bufferContext.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
        bufferContext.elapseTime = elapseTime;
        bufferContext.currentTime = currentTime;

        for (var layer in this.RenderLayers) {
            for (var i in this.RenderLayers[layer]) {
                bufferContext.save();
                this.RenderLayers[layer][i].Render(bufferContext);
                bufferContext.restore();
            }
        }

        if (this.showFPS) {
            now = (new Date()).getTime();
            if (now - this.fpsData.lastTime >= 1000) {
                this.fpsData.fps = Math.round(this.fpsData.frameCount / ((now - this.fpsData.lastTime) / 1000) * 100) / 100;
                this.fpsData.frameCount = 0;
                this.fpsData.lastTime = now;
            }
            this.fpsData.frameCount++;

            bufferContext.save();
            bufferContext.font = '8px PressStart'; // TODO: Convert to text overlay
            bufferContext.fillStyle = "white";
            bufferContext.fillRect(8, 1, 85, 11);
            bufferContext.fillStyle = "black";
            bufferContext.fillText(this.fpsData.fps + " FPS", 10, 10);
            bufferContext.restore();
        }

        this.context.drawImage(this.backBuffer, 0, 0);
    };

    
}



// RenderEngine Utilities
RenderEng.RenderUtils = {
    createRenderBuffer: function (width, height, renderFunction) {
        var buffer = document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;

        if (renderFunction) {
            renderFunction(buffer.getContext('2d'));
        }

        if (this._debug) {
            document.body.appendChild(buffer);
        }
        return buffer;
    },
    
    DeafultFontOptions: GameData.GameConsts.UI.DefaultFontOptions,
    CreateTextImage: function (text, fontOptions) {
        fontOptions = fontOptions || {};
        fontOptions.Family = fontOptions.Family || this.DeafultFontOptions.Family;
        fontOptions.Color = fontOptions.Color || this.DeafultFontOptions.Color;
        fontOptions.Size = fontOptions.Size || this.DeafultFontOptions.Size;
        fontOptions.StrokeStyle = fontOptions.StrokeStyle || null;

        var width = text.length * fontOptions.Size;
        var height = Number(fontOptions.Size) + 3;
        var image = RenderEng.RenderUtils.createRenderBuffer(width, height);
        var ctx = image.getContext("2d");

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = fontOptions.Color;
        ctx.font = fontOptions.Size + "px " + fontOptions.Family;
        ctx.fillText(text, 0, 16);

        if (fontOptions.StrokeStyle) {
            ctx.strokeStyle = fontOptions.StrokeStyle;
            ctx.strokeText(text, 0, 16);
        }

        return image;
    }
};