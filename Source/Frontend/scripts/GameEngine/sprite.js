/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="../Libraries/QEvent.js" />
/// <reference path="Events.js" />
/// <reference path="RenderEng.js" />

var Sprite = function (spriteData, locX, locY) {
    this.Render = function (ctx, lx, ly) {
        var stateData = this.CurrentState || this.SpriteData;
        var renderData = { 
            x: lx || this.LocX,
            y: ly || this.LocY,
            width: stateData.cellWidth,
            height: stateData.cellHeight,
            buffer: this.SpriteBuffer
        };
        
        QEvent.fire(this, Events.Rendering.PreRender, { renderData: renderData, state: stateData, ctx: ctx, target: this });

        if (stateData.cells && (stateData.cells == 1 || stateData.framerate)) {
            if ((this.CurrentCell > stateData.cells) || stateData.cells > 1) {
                currentTime = ctx.currentTime || (new Date()).getTime();

                if (this.lastFrameTime == null) {
                    this.lastFrameTime = currentTime;
                    this.CurrentCell = 1;
                }
                else if (Number(currentTime) >= Number(this.lastFrameTime + ((1.0 / stateData.framerate) * 1000))) {
                    if (this.CurrentCell < stateData.cells || stateData.loop) {
                        this.CurrentCell = this.CurrentCell < stateData.cells ? this.CurrentCell + 1 : 1;
                        this.lastFrameTime = currentTime;
                    }
                    else if (this.CurrentCell == stateData.cells && !stateData.loop) {
                        this.loopComplete = true;
                    }
                }
            }

            ctx.drawImage(renderData.buffer,
                (this.CurrentCell - 1) * stateData.cellWidth + (stateData.startX || 0),
                (stateData.startY || 0),
                stateData.cellWidth,
                stateData.cellHeight,
                renderData.x,
                renderData.y,
                renderData.width,
                renderData.height);

            if (this._debug) {
                ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
                ctx.fillRect((locX + this.CurrentState.clipX),
                    (locY + this.CurrentState.clipY),
                    this.CurrentState.clipWidth,
                    this.CurrentState.clipHeight);
            }
        }
        else {
            ctx.drawImage(this.SpriteBuffer, this.LocX + (this.getWidth() / 2), this.LocY + (this.getHeight() / 2));
        }

        QEvent.fire(this, Events.Rendering.PostRender, { renderData: renderData, state: stateData, ctx: ctx, target: this });
    };

    this.LoadSpriteStates = function (states) {
        var rtnStates = new Array();

        for (var i in states) {
            var data = states[i];

            if (!data.src) {
                data.SpriteImage = this.SpriteData.SpriteImage;
            }
            data.cellWidth = data.cellWidth || this.SpriteData.cellWidth;
            data.cellHeight = data.cellHeight || this.SpriteData.cellHeight;
            data.cells = data.cells || this.SpriteData.cells;
            data.framerate = data.framerate || this.SpriteData.framerate;
            data.src = data.src || this.SpriteData.src;
            data.clipX = data.clipX || this.SpriteData.clipX || 0;
            data.clipY = data.clipY || this.SpriteData.clipY || 0;
            data.clipWidth = data.clipWidth || this.SpriteData.clipWidth || ((data.cellWidth || this.SpriteData.cellWidth) - data.clipX);
            data.clipHeight = data.clipHeight || this.SpriteData.clipHeight || ((data.cellHeight || this.SpriteData.cellHeight) - data.clipY);
            data.loop = data.loop == null ? true : data.loop;

            rtnStates.push(data);
        }

        return rtnStates;
    };

    this.ChangeState = function (stateName) {
        if (!this.StateData) {
            return;
        }

        var oldState = this.CurrentState;

        for (var i in this.StateData) {
            if (this.StateData[i].name == stateName) {
                this.CurrentState = this.StateData[i];
                this.CurrentCell = 1;
                this.lastFrameTime = null;
            }
        }

        QEvent.fire(this, Events.Sprites.StateChanged, { newState: this.CurrentState, oldState: oldState });
    };

    this.getWidth = function () {
        if (this.SpriteData.states) {
            return this.CurrentState.cellWidth;
        }
        else {
            return this.SpriteImage.width;
        }
    };

    this.getHeight = function () {
        if (this.SpriteData.states) {
            return this.CurrentState.cellHeight;
        }
        else {
            return this.SpriteImage.height;
        }
    };

    this.AddOverlaySprite = function (sprite) {
        if (!sprite)
            return;

        if (typeof (sprite) == "string") {
            sprite = Sprite.GetByName(sprite, 0, 0);
        }

        var ctx = this.SpriteBuffer.getContext('2d');
        ctx.drawImage(sprite.SpriteData.SpriteImage, 0, 0);
    };

    this.ResetSpriteBuffer = function () {
        var ctx = this.SpriteBuffer.getContext('2d');
        ctx.clearRect(0, 0, this.SpriteBuffer.width, this.SpriteBuffer.height);
        ctx.drawImage(this.SpriteData.SpriteImage, 0, 0);
    };


    this.Update = function (elapseTime) {
        QEvent.fire(this, Events.Engine.Update, { elapseTime: elapseTime });
    };

    this.LocX = locX;
    this.LocY = locY;
    this.SpriteData = spriteData;
    this.SpriteData.SpriteImage = this.SpriteData.SpriteImage || ImageCacher.GetCacheData("Sprites")[this.SpriteData.name];
    this.StateData = this.SpriteData.states ? this.LoadSpriteStates(this.SpriteData.states) : null;
    this.CurrentState = this.SpriteData.states ? this.StateData[0] : null;
    this.SpriteBuffer = RenderEng.RenderUtils.createRenderBuffer(this.SpriteData.SpriteImage.width, this.SpriteData.SpriteImage.height, function (img) { return function (ctx) { ctx.drawImage(img, 0, 0); }; } (this.SpriteData.SpriteImage));

    if (this.SpriteData.startState) {
        this.ChangeState(this.SpriteData.startState);
    }

    for (var ext in (Sprite.Extensions || {})) {
        Sprite.Extensions[ext](this);
    }
};

Sprite.GetByName = function(name, locX, locY) {
    for (var i = 0; i < GameData.Sprites.length; i++) {
        if (GameData.Sprites[i].name == name) {
            return new Sprite(GameData.Sprites[i], locX || 0, locY || 0);
        }
    }

    throw "Sprite with name '" + name + "' was not found";
};

