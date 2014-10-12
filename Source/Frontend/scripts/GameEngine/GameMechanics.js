/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="../Libraries/QEvent.js" />
/// <reference path="../gameData.js" />
/// <reference path="Effects.js" />
/// <reference path="Overlays.js" />
/// <reference path="Events.js" />

var GameMechanics = { };
GameMechanics.Combat = {};
GameMechanics.World = {};

GameMechanics.World.SpriteKilled = function (data) {
    
};

GameMechanics.Combat.PlayerCollidesWithSprite = function (player) {
    return function (data) {
        if (player.dead) {
            return;
        }

        if (data.target.enemy)
            GameMechanics.Combat.EnemyCollides(player)(data);
        else if (data.target.item && !data.target.item.taken) {
            GameMechanics.Combat.PlayerPicksupItem(player)(data);
        }
    }
};

GameMechanics.Combat.PlayerPicksupItem = function (player) {
    return function (data) {
        function getEmptyID() {
            for (var i = 0; i < player.inventory.length; i++) {
                if (player.inventory[i] == null)
                    return i;
            }

            return null;
        }

        var openSlot = getEmptyID();
        
        if (openSlot != null) {
            data.target.item.taken = true;
            player.inventory[openSlot] = data.target.item[0];

            var fadeEffect = new Effects.Fade(data.target, { fadeTime: GameData.GameConsts.UI.Overlays.PlayerHitFadeOptions.fadeTime });
            QEvent.add(fadeEffect, Events.Effects.EffectComplete, function () { data.target.dead = true; });
            EffectsMan.Add(fadeEffect)
        }
    };
};

GameMechanics.Combat.KillPlayer = function (player) {
    player.StopWalking();

    if (player.sprite.facing == 1 || player.sprite.facing == 4 || player.sprite.facing == 7)
        player.sprite.ChangeState("deathLeft");
    else
        player.sprite.ChangeState("deathRight");

    player.dead = true;
}

GameMechanics.Combat.EnemyCollides = function (player) {
    return function (data) {
        var dmg = 20;

        if (data.source._lastHit != null && (GameLoop.lastUpdateTime - data.source._lastHit) < GameData.GameConsts.Combat.PlayerHitCoolDown) {
            return;
        }

        player.hp -= dmg;

        if (player.hp <= 0) {
            GameMechanics.Combat.KillPlayer(player);
        }

        var hitOverlay = new Overlays.TextOverlay(dmg.toString(), data.source.LocX, data.source.LocY, { relative: true, world: data.source.world, fillColor: "rgb(255,255,0)" });
        var hitEffectOverlay = new Overlays.SpriteOverlay("hitEffect", { target: data.source, offsetX: -45, offsetY: -40 });
        var effects = new Effects.MultiEffect(
            new Effects.Fade(hitOverlay, { fadeTime: GameData.GameConsts.UI.Overlays.PlayerHitFadeOptions.fadeTime }),
            new Effects.AcceleratingSlide(hitOverlay, { vi: { x: 2, y: -3 }, accel: { x: 0, y: 5} }),
            new Effects.Blink(data.source, { blinkAlphaMin: 0.2, blinkSpeed: 70, blinkTime: GameData.GameConsts.Combat.PlayerHitCoolDown }),
            { endEffectIndex: 0 });

        var chain = new Effects.EffectChain(new Effects.Scale(hitOverlay, { scaleLocX: (hitOverlay.width / 2), scaleLocY: (hitOverlay.height / 2), pulseFunc: Effects.WaveFunctions.Linear({ start: 3.0, stop: 1.0, length: 300 }) }),
            effects);

        QEvent.add(effects, Events.Effects.EffectComplete, function () { hitOverlay.dead = true; });

        OverlayMan.Add(hitOverlay);
        OverlayMan.Add(hitEffectOverlay);
        EffectsMan.Add(chain);

        data.source._lastHit = GameLoop.lastUpdateTime;
    };
};

GameMechanics.Combat.PlayerHitsMob = function (player) {
    return function (data) {
        if (data.target.HP == 0) {
            return;
        }

        var dmgDealt = player.Dmg();

        data.target.HP -= dmgDealt;

        if (data.target.HP < 0) {
            data.target.HP = 0;
        }

        if (data.target.HP == 0) {
            QEvent.fire(data.target, Events.Sprites.Killed, { source: data.self, target: data.target });
            QEvent.fire(data.target.sprite.world, Events.World.SpriteKilled, { source: data.self, target: data.target, world: data.target.sprite.world });
        }

        GameMechanics.Combat.PlayerHitsMobEffects(dmgDealt, data);
    };
};

GameMechanics.Combat.PlayerHitsMobEffects = function (dmgDealt, data) {
    var hitOverlay = new Overlays.TextOverlay(dmgDealt.toString(), data.target.sprite.LocX, data.target.sprite.LocY, { relative: true, world: data.target.sprite.world, fillColor: "rgb(255,255,0)" });
    var hitEffectOverlay = new Overlays.SpriteOverlay("hitEffect", { target: data.target.sprite, offsetX: -45, offsetY: -40 });
    var effects = new Effects.MultiEffect(new Effects.Fade(hitOverlay, { fadeTime: GameData.GameConsts.UI.Overlays.PlayerHitFadeOptions.fadeTime }),
        new Effects.AcceleratingSlide(hitOverlay, { vi: { x: 2, y: -3 }, accel: { x: 0, y: 5} }),
    /*new Effects.TimedEffect(new Effects.Shake(data.target.sprite, { runTime: 5.0 }), { effectTime: 500 }),*/
        {endEffectIndex: 0 });

    var chain = new Effects.EffectChain(new Effects.Scale(hitOverlay, { scaleLocX: (hitOverlay.width / 2), scaleLocY: (hitOverlay.height / 2), pulseFunc: Effects.WaveFunctions.Linear({ start: 3.0, stop: 1.0, length: 300 }) }),
        effects);

    effects.effects[1].options.vi.x = effects.effects[1].options.vi.x * (data.self.LocX + data.self.CurrentState.clipX > data.target.sprite.LocX + data.target.sprite.CurrentState.clipX ? -1 : 1);

    QEvent.add(effects, Events.Effects.EffectComplete, function () { hitOverlay.dead = true; });

    OverlayMan.Add(hitOverlay);
    OverlayMan.Add(hitEffectOverlay);
    EffectsMan.Add(chain);
};

GameMechanics.Combat.EnemyKilled = function(data) {
    var fadeEffect = new Effects.Fade(data.target.sprite, GameData.GameConsts.UI.Overlays.EnemyKilledFadeOptions);
    var deathOverlay = new Overlays.SpriteOverlay("Death1", { target: data.target.sprite, offsetX: -20, offsetY: -70 });
    var mEffect = new Effects.MultiEffect(fadeEffect, deathOverlay, { endEffectIndex: 0 });
   
    data.target.AIDisabled = true;
    data.target.sprite.StopWalking();



    QEvent.add(mEffect, Events.Effects.EffectComplete, function () {
        data.target.sprite.dead = true;
        if (data.target.enemyData.Drops) {
            var rnd = Math.random();
            var dropItem = null;

            for (var itemInfo in data.target.enemyData.Drops) {
                if (rnd <= data.target.enemyData.Drops[itemInfo].chance && dropItem == null) {
                    dropItem = data.target.enemyData.Drops[itemInfo].item;
                }
                rnd -= data.target.enemyData.Drops[itemInfo.chance];
            }

            if (dropItem) {
                var sack = Sprite.GetByName("sack", data.target.sprite.LocX, data.target.sprite.LocY);
                var bounce = new Effects.Bounce(sack, { bounceTime: 300, fallOnly: true });

                sack.item = _.filter(GameData.Weapons, function (i) { return i.name == dropItem; });

                data.source.world.AddSprite(sack);
                EffectsMan.Add(bounce);
            }
        }
    });

    EffectsMan.Add(mEffect);
};

GameMechanics.Combat.PlayerAttackComplete = function (stateData) {
    var FLAG_UP = 0x8;
    var FLAG_DOWN = 0x4;
    var FLAG_LEFT = 0x2;
    var FLAG_RIGHT = 0x1;

    return function (data) {
        var movementState = stateData.getCurStateFunc();
        var moveDirection = 5 + ((movementState & (FLAG_UP | FLAG_DOWN)) > 0 ? (((movementState >> 2) & (FLAG_LEFT | FLAG_RIGHT)) == 1 ? 3 : -3) : 0) + ((movementState & (FLAG_LEFT | FLAG_RIGHT)) > 0 ? ((movementState & (FLAG_LEFT | FLAG_RIGHT)) == 1 ? 1 : -1) : 0);
        if (moveDirection != 5) {
            this.StartWalking(moveDirection);
        }
    }
}