/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="../Libraries/QEvent.js" />
/// <reference path="sprite.js" />
/// <reference path="Events.js" />

Sprite.Extensions = Sprite.Extensions || { };

Sprite.Extensions.AttackExtension = function (sprite) {
    if (!sprite.SpriteData.attackInfo) {
        return;
    }

    sprite.Attack = function () {
        if (sprite.attacking || (sprite.weapon && (new Date()).getTime() - (sprite.lastAttack || 0) < (sprite.weapon.weaponInfo.coolDown || sprite.weapon.typeInfo.coolDown || 0)))
            return;

        sprite.ableToMove = false;


        if (sprite.moving) {
            sprite.StopWalking();
        }

        sprite.attacking = true;
        sprite.hasHit = false;

        if (sprite.weapon && (!sprite.weaponSprite || sprite.weaponSprite.name != sprite.weapon.typeInfo.sprite)) {
            sprite.weaponSprite = Sprite.GetByName(sprite.weapon.typeInfo.sprite);
            sprite.weaponSprite.ChangeState(sprite.weapon.typeInfo.attackStates[sprite.facing].state);
        }

        sprite.ChangeState(sprite.SpriteData.attackInfo.attackStates[sprite.facing].attackState);
    };

    var RenderAttackSprite = function (sprite) {
        return function (data) {
            if ((!sprite.weapon && sprite.CurrentCell == sprite.CurrentState.cells) || (sprite.weapon && sprite.weaponSprite.CurrentCell == sprite.weaponSprite.CurrentState.cells)) {
                sprite.attacking = false;
                sprite.ableToMove = true;
                sprite.ChangeState(sprite.movementInfo.directionStates[sprite.facing].facingState);
                sprite.lastAttack = (new Date()).getTime();

                QEvent.fire(sprite, Events.Sprites.AttackComplete, { source: sprite });
            }

            if (sprite.weapon && sprite.facing && sprite.attacking) {

                var atcInfo = sprite.SpriteData.attackInfo.attackStates[sprite.facing];
                sprite.weaponSprite.LocX = data.renderData.x + atcInfo.offsetX;
                sprite.weaponSprite.LocY = data.renderData.y + atcInfo.offsetY;
                sprite.weaponSprite.Render(data.ctx);

                if (sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name]) {
                    if (sprite._debug) {
                        data.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
                        data.ctx.fillRect(sprite.weaponSprite.LocX + sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].x,
                            sprite.weaponSprite.LocY + sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].y,
                            sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].width,
                            sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].height);
                    }

                    if (sprite.world && !sprite.hasHit) {
                        for (var enemy in sprite.world.enemies) {
                            var curSprite = sprite.world.enemies[enemy].sprite;

                            if (curSprite.renderedLastFrame &&
                                GameUtils.Collide({ x: sprite.weaponSprite.LocX + sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].x,
                                    y: sprite.weaponSprite.LocY + sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].y,
                                    width: sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].width,
                                    height: sprite.weaponSprite.SpriteData.attackFrames[sprite.weaponSprite.CurrentState.name][sprite.CurrentCell].height
                                },
                                    {
                                        x: curSprite.LocX + curSprite.CurrentState.clipX - sprite.world.worldViewX,
                                        y: curSprite.LocY + curSprite.CurrentState.clipY - sprite.world.worldViewY,
                                        width: curSprite.CurrentState.clipWidth,
                                        height: curSprite.CurrentState.clipHeight
                                    })) {

                                QEvent.fire(sprite, Events.Sprites.AttackHit, { self: sprite, target: sprite.world.enemies[enemy] });
                                QEvent.fire(sprite.world.enemies[enemy], Events.Sprites.Attacked, { self: sprite.world.enemies[enemy], source: sprite });
                                sprite.hasHit = true;
                            }
                        }
                    }
                }
            }
        };
    } (sprite);


    function SpriteAttackPreRender(data) {
        if (this.attacking) {
            var atcInfo = this.SpriteData.attackInfo.attackStates[this.facing];
            if (atcInfo.underlay) {
                RenderAttackSprite(data);
            }
        }
    }

    function SpriteAttackPostRender(data) {
        if (this.attacking) {
            var atcInfo = this.SpriteData.attackInfo.attackStates[this.facing];
            if (!atcInfo.underlay) {
                RenderAttackSprite(data);
            }
        }
    }

    QEvent.add(sprite, Events.Rendering.PreRender, SpriteAttackPreRender);
    QEvent.add(sprite, Events.Rendering.PostRender, SpriteAttackPostRender);
}