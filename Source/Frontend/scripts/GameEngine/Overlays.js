/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="Events.js" />
/// <reference path="Sprite.js" />
/// <reference path="RenderEng.js" />

function OverlayManager(world) {
    this.overlays = new Array();
    this.world = world;
    
    this.Add = function(overlay) {
      overlay.options.world = this.world;
      this.overlays.push(overlay);
    };
    
    this.Render = function(ctx) {
        for (var item in this.overlays) {
            if (!this.overlays[item].dead) {
                ctx.save();
                this.overlays[item].Render(ctx);
                ctx.restore();
            }
        }
    };
    
    this.Update = function(elapseTime) {
        for (var item in this.overlays) {
            if (this.overlays[item].Update && !this.overlays[item].dead) {
                this.overlays[item].Update(elapseTime);
            }
        }
    };
}

Overlays  = {
    MiniMap: function(world, options) {
        this.world = world;
        this.options = options || { };
        this.options.width = options.width || 100;
        this.options.height = options.height || 100;
        this.options.posX = options.posX || 0;
        this.options.posY = options.posY || 0;
        this.options.trackSprites = options.trackSprites || [];

        this.Render = function (ctx) {
			if (this.world.worldLayers == null) return;
			
            var pX = this.options.posX <= 1 ? ctx.canvas.width * this.options.posX : this.options.posX;
            var pY = this.options.posY <= 1 ? ctx.canvas.height * this.options.posY : this.options.posY;

            for (var sprite in this.options.trackSprites) {
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.drawImage(this.world.worldLayers[0], pX, pY, this.options.width, this.options.height);
                ctx.beginPath();
                ctx.fillStyle = "red";
                ctx.arc((this.options.trackSprites[sprite].LocX / this.world.worldLayers[0].width) * this.options.width + pX,
                    (this.options.trackSprites[sprite].LocY / this.world.worldLayers[0].height) * this.options.height + pY,
                    2,
                    0,
                    Math.PI * 2,
                    true);
                ctx.fill();
                ctx.restore();
            }
        };
    },

    ScrollingSpriteOverlay: function (spriteName, options) {
        this.options = $.extend({}, options, {
            speed: 5,
            vector: { x: 1, y: 1 },
            tile: true
        });

        this.position = { x: 0, y: 0 };
        this.sprite = Sprite.GetByName(spriteName, 0, 0);
        this.buffer = null;

        this.Render = function (ctx) {
            if (this.buffer == null || this.buffer.width != ctx.canvas.width || this.buffer.height != ctx.canvas.height) {
                this.buffer = RenderEng.RenderUtils.createRenderBuffer(ctx.canvas.width + (this.sprite.SpriteBuffer.width * 2), ctx.canvas.height + (this.sprite.SpriteBuffer.height * 2));
                var bctx = this.buffer.getContext('2d');
                var pattern = bctx.createPattern(this.sprite.SpriteBuffer, 'repeat');
                bctx.clearRect(0, 0, bctx.canvas.width, bctx.canvas.height);
                bctx.fillStyle = pattern;
                bctx.fillRect(0, 0, bctx.canvas.width, bctx.canvas.height);
            }

            
            ctx.drawImage(this.buffer, -this.sprite.SpriteBuffer.width + this.position.x, -this.sprite.SpriteBuffer.height + this.position.y);
        }

        this.Update = function (elapseTime) {
            this.position.x += this.options.speed * this.options.vector.x * (elapseTime/1000);
            this.position.y += this.options.speed * this.options.vector.y * (elapseTime/1000);

            if (this.position.x >= this.sprite.SpriteBuffer.width) {
                this.position.x = 0;
            }

            if (this.position.y >= this.sprite.SpriteBuffer.height) {
                this.position.y = 0;
            }
        }
    },

    SpriteOverlay: function(spriteName, options) {
        this.options = options || {};
        this.options.offsetX = this.options.offsetX || 0;
        this.options.offsetY = this.options.offsetY || 0;
        this.options.target = this.options.target;
		this.options.stretch = !!this.options.stretch;
        this.sprite = Sprite.GetByName(spriteName, this.options.target.LocX, this.options.target.LocY)
        this.options.spriteState = this.options.spriteState || this.sprite.StateData.startState;
        this.options.killOnComplete = this.options.killOnComplete || true;
        this.sprite.ChangeState(this.options.spriteState);
		
		
		if (this.options.stretch) {
			QEvent.add(this.sprite, Events.Rendering.PreRender, function(data) { 
				data.renderData.width = window.innerWidth;
				data.renderData.height = window.innerHeight;
			});
		}

        this.Render = function(ctx) {
            this.sprite.Render(ctx, this.options.target.LocX - (this.options.target.world ? this.options.target.world.worldViewX : 0) + this.options.offsetX,
                                    this.options.target.LocY - (this.options.target.world ? this.options.target.world.worldViewY : 0) + this.options.offsetY);

            if (this.options.killOnComplete && this.sprite.loopComplete) {
                this.dead = true;
            }
        },

        this.Update = function(elapseTime) {
            if (this.sprite.Update) {
                this.sprite.Update(elapseTime);
            }
        }
    },

    ProgressBar: function(options) {
        this.options = options || { };        
        this.options.color = options.color || "Green";
        this.options.backColor = options.backColor || "Red";
        this.options.target = options.target || null;
        this.options.height = options.height || 4;
        this.options.targetOffsetX = options.targetOffsetX || 0;
        this.options.targetOffsetY = options.targetOffsetX || (this.options.target ? this.options.target.getHeight() + 4 : 0);
        this.options.strokeColor = options.strokeColor || "";
        this.options.maxValue = options.maxValue || 100;
        this.options.getValue = options.getValue || null;
        this.options.value = options.value || options.maxValue;

        this.options.target.overlays = this.options.target.overlays ||  [ ];
        this.options.target.overlays.push(this);

        this.Render = function(ctx) {
            var locX = this.options.target ? (this.options.target.LocX - (this.options.target.world ? this.options.target.world.worldViewX : 0) + this.options.targetOffsetX)
                                           : this.options.x;
            var locY = this.options.target ? (this.options.target.LocY - (this.options.target.world ? this.options.target.world.worldViewY : 0) + this.options.targetOffsetY)
                                           : this.options.y;
            var width = this.options.target ? this.options.target.getWidth()
                                            : this.options.width;
            var height = this.options.height;

            if (this.options.target && this.options.target.world) {
                if (locX < 0 || locX > ctx.canvas.width ||
                    locY < 0 || locY > ctx.canvas.height) {
                    return;
                }
            }

            if (this.options.getValue) {
                this.options.value = this.options.getValue();
            }


            if (this.options.backColor != null || this.options.backColor != "") {
                ctx.fillStyle = this.options.backColor;
                ctx.fillRect(locX, locY, width, height);
            }

            ctx.fillStyle = this.options.color;
            ctx.fillRect(locX, locY, (width*(this.options.value / this.options.maxValue)), height);

            if (this.options.strokeColor != null && this.options.strokeColor != "") {
                ctx.strokeStyle = this.options.strokeColor;
                ctx.lineWidth = 1;
                ctx.lineJoin = "bevel";
                ctx.globalAlpha = 0.75;
                ctx.strokeRect(locX, locY, width, height);
            }
        }
    },

    EquipmentOverlay: function (target, options) {
        var $this = this;

        $this.options = $.extend(options, {
            EquipScreenTemplate: "<div id='EquipMenuContainer'><div id='EquipContainer'><div id='Equip'><h1 class='MenuText'>EQUIP</h1></div><div id='EquipSlots'></div></div></div>",
            EquipItemTemplate: "<div class='EquipSlot'><div></div></div>",
            ContainerID: "MainContainer",

            Slots: ["Weapon", "Shield", "Armour", "Shirt", "Pants", "Shoes"]
        });

        $this.Target = target;
        $this.EquipOverlay = null;
        $this.Visible = false;
        $this.SelectedItem = null;
        $this.SelectedElement = null;
        $this.Items = {};

        $this.ItemClicked = function (e) {
            if ($this.SelectedElement != null) {
                $this.SelectedElement.css("background-image", "url('sprites/menu/slot.png')");
                $this.SelectedItem = null;
                $this.SelectedElement = null;
            }

            $(e.target).parent().css("background-image", "url('sprites/menu/slot_select.png')");
            $this.SelectedItem = $this.Items[e.target.parentElement.slotName];
            $this.SelectedElement = $(e.target.parentElement);
            QEvent.fire($this, "SlotClicked", { slotName: e.target.parentElement.slotName, element: e.target, Overlay: $this, Item: $this.Items[e.target.parentElement.slotName] });
        }


        $this.Init = function () {
            var container = $($this.options.EquipScreenTemplate);
            var itemContainer = container.find("#EquipSlots");

            for (var i = 0; i < $this.options.Slots.length; i++) {
                var newItem = $($this.options.EquipItemTemplate);

                newItem[0].slotName = $this.options.Slots[i];
                newItem.find("div").attr("id", "Equip-" + $this.options.Slots[i]);

                newItem.click($this.ItemClicked);

                itemContainer.append(newItem);
            }

            container.hide();

            $this.EquipOverlay = container;
            $("#" + $this.options.ContainerID).append($this.EquipOverlay);
        };

        $this.Refresh = function () {
            for (var item in $this.options.Slots) {
                var itemName = $this.options.Slots[item];
                var itemObj = $this.Target.equipment[itemName];

                if (itemObj) {
                    $this.EquipOverlay.find("#Equip-" + itemName).css("background-image", "url('sprites/menu/icons/" + (itemObj.typeInfo.thumb || "mark.png") + "')");
                    $this.Items[itemName] = itemObj;
                }
                else {
                    $this.EquipOverlay.find("#Equip-" + itemName).css("background-image", "");
                }
            }
        }

        $this.Hide = function () {
            $this.EquipOverlay.hide();
        };

        $this.Show = function () {
            $this.Refresh();
            $this.EquipOverlay.show();
        }

        $this.Render = function (ctx) { };

        $this.Init();
    },

    InventoryOverlay: function (target, options) {
        var $this = this;

        $this.options = $.extend(options, {
            InvScreenTemplate: "<div id='InvContainer'></div>",
            InvGroupTemplate: "<div class='InvBag{n}'></div>",
            InvItemTemplate: "<div class='InvSlotRow'><div id='InvIcon-{i}'></div></div>",

            ContainerID: "MainContainer",
            PosX: "15%",
            PosY: "10%",

            GroupCount: 1,
            ItemsPerGroup: 15, 
        });

        $this.Target = target;
        $this.InventoryOverlay = null;
        $this.Visible = false;
        $this.SelectedItem = null;

        $this.RefreshInv = function () {
            if ($this.Target.inventory) {
                for (var i = 0; i < $this.Target.inventory.length; i++) {
                    var io = $this.InventoryOverlay.find("#InvIcon-" + (i + 1));
                    if ($this.Target.inventory[i] != null) {
                        var w = $(GameData.WeaponTypes).filter(function () { return this.name == ($this.Target.inventory[i].type || $this.Target.inventory[i].typeInfo.name)  })[0];
                        io.css("background-image", "url('sprites/menu/icons/" + (w.thumb || "mark.png") + "')");
                        io[0].item = w;
                    }
                    else {
                        io.css("background-image", "none");
                    }
                }
            }
        }

        $this.SlotClicked = function (e) {
            if ($this.SelectedElement == e.target) {
                $($this.SelectedElement).parent().css("background-image", "url('sprites/menu/slot.png')");
                $this.SelectedItem = null;
                $this.SelectedElement = null;
                return;
            }

            if ($this.SelectedElement && e.target != $this.SelectedElement) {
                $($this.SelectedElement).parent().css("background-image", "url('sprites/menu/slot.png')");
                var prevImg = $($this.SelectedElement).css("background-image");
                
                $($this.SelectedElement).css("background-image", $(e.target).css("background-image"));
                $(e.target).css("background-image", prevImg);
                

                $this.SelectedElement = null;
                return;
            }

            $(e.target).parent().css("background-image", "url('sprites/menu/slot_select.png')");
            $this.SelectedItem = e.target.item;
            $this.SelectedElement = e.target;

            QEvent.fire($this, "SlotClicked", { slot: e.target, selectedItem: e.target.item, selectedItemElement: e.target });
        };

        $this.Init = function () {
            var container = $($this.options.InvScreenTemplate);
            var item = 1;

            for (var g = 0; g < $this.options.GroupCount; g++) {
                var curGroup = $($this.options.InvGroupTemplate.replace("{n}", g+1));
                for (var i = 0; i < $this.options.ItemsPerGroup; i++) {
                    var cont = $($this.options.InvItemTemplate.replace("{n}", g + 1).replace("{i}", (item++)));
                    cont.click($this.SlotClicked);
                    curGroup.append(cont);
                }

                container.append(curGroup);
            }

            $this.InventoryOverlay = container;
            $this.InventoryOverlay.css("left", $this.options.PosX);
            $this.InventoryOverlay.css("top", $this.options.PosY);

            $("#" + $this.options.ContainerID).append($this.InventoryOverlay);
            $this.RefreshInv();
            $this.Hide();
        };

        $this.Show = function () {
            $this.RefreshInv();
            $this.InventoryOverlay.show();
            $this.Visible = true;
        }

        $this.Hide = function () {
            $this.InventoryOverlay.hide();
            $this.Visible = false;
            if ($this.SelectedElement) {
                $($this.SelectedElement).parent().css("background-image", "url('sprites/menu/slot.png')");
                $this.SelectedItem = null;
                $this.SelectedElement = null;
            }
        }

        $this.Render = function (ctx) { };

        $this.Init();
    },

    TextOverlay: function(text, locX, locY, options) {
        this.options = options || { };
        this.options.fillColor = this.options.fillColor || "white";
        this.options.fontFamily = this.options.font || "PressStart";
        this.options.fontSize = this.options.fontSize || "18";
        this.options.relative = this.options.relative || false;
        this.options.world = this.options.world || null;
        this.text = text;
        this.loadedImage = RenderEng.RenderUtils.CreateTextImage(this.text, {Family: this.options.fontFamily, Color: this.options.fillColor, Size: this.options.fontSize, StrokeStyle: "black"});
        this.width = this.loadedImage.width;
        this.height = this.loadedImage.height;
        this.LocX = locX;
        this.LocY = locY;

        if (this.options.relative && this.options.world) {
            this.wLocX = locX;
            this.wLocY = locY;
            this.LocX = this.wLocX - this.options.world.worldViewX;
            this.LocY = this.wLocY - this.options.world.worldViewY;
        }

        this.Update = function(elapseTime) {
            if (this.options.relative && this.options.world) {
                this.LocX = this.wLocX - this.options.world.worldViewX;
                this.LocY = this.wLocY - this.options.world.worldViewY;
            }
        };

        this.Render = function(ctx, lx, ly) {
            var renderData = { 
                x: lx || this.LocX,
                y: ly || this.LocY,
                buffer: this.loadedImage
            };

            ctx.font = this.options.font;
            ctx.fillStyle = this.options.fillColor;
            
            QEvent.fire(this, Events.Rendering.PreRender, { renderData: renderData, ctx: ctx, target: this });
            ctx.drawImage(renderData.buffer, renderData.x, renderData.y);
            QEvent.fire(this, Events.Rendering.PostRender, { renderData: renderData, ctx: ctx, target: this });
        };
    },
};