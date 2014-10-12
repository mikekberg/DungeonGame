/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="../Libraries/QEvent.js" />
/// <reference path="Events.js" />


function EffectsManager() {
    this.effects = new Array();
    
    this.Add = function(effect) {
      this.effects.push(effect);
    };
    
    this.Render = function(ctx) {
        for (var item in this.effects) {
            if (this.effects[item].Render && !this.effects[item].dead) {
                this.effects[item].Render(ctx);
            }
        }
    };
    
    this.Update = function(elapseTime) {
        for (var item in this.effects) {
            if (this.effects[item].Update && !this.effects[item].dead) {
                this.effects[item].Update(elapseTime);
            }
        }
    };
};

var Effects = {
    // jQuery.easing.swing.toString().match(/function\s*\(((\w+,?)*?)\)/)[1].split(',').length
    // code for detecting easing functions.
    WaveFunctions: {
        Linear: function (options) {
            options = options || {};
            options.start = options.start || 0.0;
            options.stop = options.stop || 1.0;
            options.length = options.length || 1000;
            var slope = (options.stop - options.start) / options.length;

            var rtnFunc = function (t) {
                return (t > options.length ? options.length : t) * slope + options.start;
            };

            rtnFunc.options = options;

            return rtnFunc;
        },
        Square: function (options) {
            options = options || {};
            options.amp = options.amp || 0.5;
            options.freq = options.freq || 1;
            var totalTime = 0;
            var curVal = 1;
            var pulseTime = (1000 / options.freq);

            var rtnFunc = function (t) {
                totalTime += t;

                if (totalTime >= pulseTime) {
                    curVal *= -1;
                    totalTime -= pulseTime;
                }

                return options.amp * curVal;
            };

            rtnFunc.options = options;

            return rtnFunc;
        },
        Sin: function (options) {
            options = options || {};
            options.amp = options.amp || 1.0;
            options.freq = options.freq || Math.PI;
            options.phase = options.phase || (options.freq / 2);


            var rtnFunc = function (t) {
                return options.amp * Math.sin(options.freq * t + options.phase);
            };

            rtnFunc.options = options;

            return rtnFunc;
        }
    },

    EffectChain: function () {
        this.effects = new Array();
        this.activeEffectIndex = 0;
        for (var arg in arguments) {
            this.effects.push(arguments[arg]);
        }

        this.Update = function (elapseTime) {
            if (this.effects[this.activeEffectIndex].Update) {
                this.effects[this.activeEffectIndex].Update(elapseTime);
            }

        };

        this.Render = function (ctx) {
            if (this.effects[this.activeEffectIndex].Render) {
                this.effects[this.activeEffectIndex].Render(ctx);
            }

            if (this.effects[this.activeEffectIndex].dead) {
                this.activeEffectIndex++;
                if (this.activeEffectIndex >= this.effects.length) {
                    this.dead = true;
                    QEvent.fire(this, Events.Effects.EffectComplete, { effect: this });
                }
            }
        };
    },

    MultiEffect: function () {
        this.effects = new Array();

        for (var arg in arguments) {
            if (arguments[arg].endEffectIndex != null) {
                this.options = arguments[arg];
            }
            this.effects.push(arguments[arg]);
        }

        this.options = this.options || { endEffectIndex: -1 };

        this.Update = function (elapseTime) {
            for (var effect in this.effects) {
                if (this.effects[effect].Update) {
                    this.effects[effect].Update(elapseTime);
                }
            }

            if (this.options.endEffectIndex != -1 && this.effects[this.options.endEffectIndex].dead) {
                this.dead = true;
                QEvent.fire(this, Events.Effects.EffectComplete, { effect: this });
            }
        };

        this.Render = function (ctx) {
            for (var effect in this.effects) {
                if (this.effects[effect].Render) {
                    this.effects[effect].Render(ctx);
                }
            }
        };
    },

    TimedEffect: function (effect, options) {
        this.totalTime = 0;
        this.options = options || { effectTime: 1000 };
        this.effect = effect;

        this.Update = function (elapseTime) {
            if (this.totalTime >= this.options.effecttime) {
                if (!this.dead) {
                    this.dead = true;
                    QEvent.fire(this, Events.Effects.EffectComplete, { effect: this });
                }

                return;
            }

            this.totalTime += elapseTime;

            if (this.effect.Update) {
                this.effect.Update(elapseTime);
            }
        }

        this.Render = function (ctx) {
            if (this.effect.Render) {
                this.effect.Render(ctx);
            }
        }
    },

    Scale: function (target, options) {
        this.options = options || {};
        this.options.pulseFunc = this.options.pulseFunc || Effects.WaveFunctions.Linear();
        this.options.scaleTime = this.options.scaleTime || 1000;
        this.options.originX = this.options.originX || 0;
        this.options.originY = this.options.originY || 0;
        this.options.scaleLocX = this.options.scaleLocX || 0;
        this.options.scaleLocY = this.options.scaleLocY || 0;
        this.target = target;
        this.currentScale = this.options.startSize;
        this.totalTime = 0;
        this.currentScale = this.options.pulseFunc(this.totalTime);

        this.target.effects = this.target.effects || new Array();
        this.target.effects.push(this);

        this.Update = function (fx) {
            return function (elapseTime) {
                fx.totalTime += elapseTime;
                fx.currentScale = fx.options.pulseFunc(fx.totalTime);
                if (fx.currentScale == fx.options.pulseFunc.options.stop) {
                    fx.dead = true;

                    QEvent.fire(fx, Events.Effects.EffectComplete, { effect: fx });
                    QEvent.remove(fx.target, Events.Rendering.PreRender, fx.ScalePreRender);
                }
            };
        } (this);

        this.ScalePreRender = function (fx) {
            return function (data) {
                data.ctx.translate(data.renderData.x + fx.options.scaleLocX, data.renderData.y + fx.options.scaleLocY);
                data.ctx.scale(fx.currentScale, fx.currentScale);
                data.ctx.translate(-(data.renderData.x + fx.options.scaleLocX), -(data.renderData.y + fx.options.scaleLocY));
            };
        } (this);

        QEvent.add(this.target, Events.Rendering.PreRender, this.ScalePreRender);
    },

    Shake: function (target, options) {
        this.options = options || {};
        this.options.range = this.options.range || 4;
        this.options.pulseFunc = this.options.pulseFunc || Effects.WaveFunctions.Square({ freq: 5.0 });
        this.options.directionAmount = this.options.directionAmount || { x: 5.0, y: 0.0 };
        this.options.runTime = this.options.runTime || 0;
        this.totalTime = 0;
        var offset = { x: 0, y: 0 };
        var prevOffset = { x: 0, y: 0 };


        this.Update = function (elapseTime) {
            if (this.dead) {
                return;
            }

            this.totalTime += elapseTime;
            prevOffset = offset;
            offset.x = this.options.pulseFunc(this.totalTime) * this.options.directionAmount.x;
            offset.y = this.options.pulseFunc(this.totalTime) * this.options.directionAmount.y;

            target.LocX += offset.x;
            target.LocY += offset.y;
        };
    },

    AcceleratingSlide: function (target, options) {
        options = options || {};
        this.options = options;
        this.options.vi = options.vi || { x: 0, y: 0 };
        this.options.accel = options.accel || { x: 1, y: 1 };
        this.currentV = { x: this.options.vi.x, y: this.options.vi.y };
        this.target = target;
        this.options.checkbounds = options.checkbounds || false;

        this.Update = function (elapseTime) {
            if (this.dead) {
                return;
            }

            this.currentV.x = this.currentV.x + (this.options.accel.x * Number(elapseTime / 1000));
            this.currentV.y = this.currentV.y + (this.options.accel.y * Number(elapseTime / 1000));
            this.target.LocX += this.currentV.x;
            this.target.LocY += this.currentV.y;

            if (this.options.checkbounds && this.target.CanWalk && this.target.CanWalk(this.target.wLocX + this.currentV.x, this.target.wLocY + this.currentV.y)) {
                this.dead = true;
                QEvent.fire(this, Events.Effects.EffectComplete, { effect: this });
            }

            if (this.target.wLocX && this.target.wLocY) {
                this.target.wLocX += this.currentV.x;
                this.target.wLocY += this.currentV.y;
            }
        };
    },

    Blink: function (target, options) {
        var defaults = {
            blinkTime: 5000,
            blinkSpeed: 200,
            blinkAlphaMin: 0.0,
            blinkAlphaMax: 1.0
        };

        var self = this;
        this.target = target;
        this.options = $.extend(true, {}, defaults, options);
        this.blinkState = 1;
        this.timeCount = 0;
        this.totalTime = 0;

        this.Update = function (elapseTime) {
            self.timeCount += elapseTime;
            self.totalTime += elapseTime;

            if (self.timeCount / self.options.blinkSpeed > 1) {
                self.timeCount = 0;
                self.blinkState = self.blinkState == 0 ? 1 : 0;
            }

            if (self.totalTime >= self.options.blinkTime) {
                self.dead = true;
                this.blinkState = 1;

                QEvent.remove(self.target, Events.Rendering.PreRender, self.PreRender);
                QEvent.remove(self.target, Events.Rendering.PostRender, self.PostRender);
                QEvent.fire(self, Events.Effects.EffectComplete, { effect: self });
            }
        };

        this.PreRender = function (fx) {
            return function (data) {
                data.ctx.globalAlpha = fx.blinkState == 0 ? fx.options.blinkAlphaMin : fx.options.blinkAlphaMax;
            }
        } (this);

        this.PostRender = function (fx) {
            return function (data) {
                data.ctx.globalAlpha = 1;
            }
        } (this);

        QEvent.add(self.target, Events.Rendering.PreRender, self.PreRender);
        QEvent.add(self.target, Events.Rendering.PostRender, self.PostRender);
    },

    Bounce: function (target, options) {
        this.options =$.extend(true, {
            bounceHeight: 30,
            bounceTime: 1000,
            squishPerc: 0.35,
            fallOnly: false
        }, options || {});

        var self = this;
        this.target = target;
        this.currentSquish = self.options.fallOnly ? self.options.squishPerc : 0;
        this.currentHeight = self.options.fallOnly ? self.options.bounceHeight : 0;
        this.direction = self.options.fallOnly ? -1 : 1;

        this.Update = function (elapseTime) {
            self.currentHeight += ((elapseTime / (self.options.bounceTime / 2)) * self.options.bounceHeight) * self.direction;
            self.currentSquish += ((elapseTime / (self.options.bounceTime / 2)) * self.options.squishPerc) * self.direction;

            if (self.currentHeight >= self.options.bounceHeight) {
                self.direction = -1;
            }

            if (self.currentHeight <= 0 && self.direction == -1) {
                self.dead = true;

                QEvent.remove(self.target, Events.Rendering.PreRender, self.PreRender);
                QEvent.fire(self, Events.Effects.EffectComplete, { effect: self });
            }
        };

        this.PreRender = function (data) {
            data.renderData.y -= self.currentHeight;
            data.renderData.x += (data.renderData.width * self.currentSquish) / 2;
            data.renderData.width -= (data.renderData.width * self.currentSquish);
        };

        QEvent.add(this.target, Events.Rendering.PreRender, this.PreRender);
    },

    Fade: function (target, options) {
        this.options = options || {};
        this.options.fadeTime = this.options.fadeTime || 1000;
        this.options.killOnComplete = this.options.killOnComplete || true;
        this.options.fadeIn = this.options.fadeIn || false;
        this.options.pulseFunc = this.options.pulseFunc || Effects.WaveFunctions.Linear();
        this.currentAlpha = (this.options.fadeIn ? 0.0 : 1.0);
        this.target = target;
        this.target.effects = this.target.effects || new Array();
        this.target.effects.push(this);

        this.Update = function (elapseTime) {
            if (this.dead) {
                return;
            }

            this.currentAlpha += ((this.options.pulseFunc(elapseTime) * this.options.fadeTime) / this.options.fadeTime) * (this.options.fadeIn ? 1 : -1);

            if (this.currentAlpha <= 0 || this.currentAlpha > 1.0) {
                this.complete = true;
                this.dead = this.options.killOnComplete;

                QEvent.remove(this.target, this.PreRender);
                QEvent.remove(this.target, this.PostRender);
                QEvent.fire(this, Events.Effects.EffectComplete, { effect: this });
            }

        };

        this.PreRender = function (fx) {
            return function (data) {
                data.ctx.globalAlpha = fx.currentAlpha;
            }
        } (this);

        this.PostRender = function (fx) {
            return function (data) {
                data.ctx.globalAlpha = 1;
            }
        } (this);


        QEvent.add(this.target, Events.Rendering.PreRender, this.PreRender);
        QEvent.add(this.target, Events.Rendering.PostRender, this.PostRender);
    }
};