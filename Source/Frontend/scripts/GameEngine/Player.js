/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="../Libraries/QEvent.js" />
/// <reference path="Events.js" />
/// <reference path="RenderEng.js" />
/// <reference path="../gameData.js" />

var Player = function (name, sprite) {
    var self = this;

    self.equipment = {
        Weapon: null,
        OffHand: null,
        Armour: null,
        Shirt: null,
        Pants: null,
        Shoes: null,
        WAug: [null, null, null],
        AAug: [null, null, null]
    };

    self.dead = false;
    self.inventory = new Array(39);

    self.stats = {
        str: 1,
        agi: 1,
        int: 1,
        con: 15
    };

    self.Dmg = function () {
        var wDmg = self.equipment.Weapon.weaponInfo.dmgMin + Math.round((Math.random() * (self.equipment.Weapon.weaponInfo.dmgMax - self.equipment.Weapon.weaponInfo.dmgMin)));
        return Math.round(wDmg + (self.stats.str / GameData.GameConsts.Player.StrMod));
    };

    self.MaxHP = function () {
        return GameData.GameConsts.Player.BaseHP +
               (self.level * GameData.GameConsts.Player.LevelHPBonus) +
               (self.stats.con * GameData.GameConsts.Player.ConHPBonus);
    };

    self.EquipWeapon = function (equipName) {
        var weap = Weapon.GetByName(equipName);
        self.sprite.weapon = weap;
        self.equipment.Weapon = weap;
    };

    self.EquipShirt = function (equipName) {
        self.EquipAny(equipName, GameData.Clothing.Shirts, "Shirt");
    };

    self.EquipPants = function (equipName) {
        self.EquipAny(equipName, GameData.Clothing.Pants, "Pants");
    };

    self.EquipShoes = function (equipName) {
        self.EquipAny(equipName, GameData.Clothing.Shoes, "Shoes");
    };

    self.EquipArmour = function (equipName) {
        self.EquipAny(equipName, GameData.Armour, "Armour");
    };

    self.UnEquip = function (slotName) {
        var itm = self.equipment[slotName];
        self.equipment[slotName] = null;

        for (var i = 0; i < self.inventory.length; i++) {
            if (self.inventory[i] == null) {
                self.inventory[i] = itm;
                break;
            }
        }

        this.RefreshOverlays();
        return itm;
    };

    self.EquipAny = function (equipName, itemCollection, slotName) {
        var itm = $(itemCollection).filter(function () { return this.name == equipName; })[0];

        if (itm == null) return;
        self.equipment[slotName] = itm;
        this.RefreshOverlays();
    };

    self.Equip = function (equipName) {
        if ($(GameData.Armour).filter(function () { return this.name == equipName; })[0])
            self.EquipArmour(equipName);
        else if ($(GameData.Clothing.Shoes).filter(function () { return this.name == equipName; })[0])
            self.EquipShoes(equipName);
        else if ($(GameData.Clothing.Pants).filter(function () { return this.name == equipName; })[0])
            self.EquipPants(equipName);
        else if ($(GameData.Clothing.Shirts).filter(function () { return this.name == equipName; })[0])
            self.EquipShirt(equipName);
        else if (Weapon.GetByName(equipName))
            self.EquipWeapon(equipName);
    }

    self.RefreshOverlays = function () {
        self.sprite.ResetSpriteBuffer();
        if (self.equipment.Shoes)
            self.sprite.AddOverlaySprite(self.equipment.Shoes.sprite);
        if (self.equipment.Pants)
            self.sprite.AddOverlaySprite(self.equipment.Pants.sprite);
        if (self.equipment.Shirt)
            self.sprite.AddOverlaySprite(self.equipment.Shirt.sprite);
        if (self.equipment.Armour)
            self.sprite.AddOverlaySprite(self.equipment.Armour.sprite);
    };

    self.Render = function (ctx, lx, ly) {
        self.sprite.Render(ctx, lx, ly);
    };

    self.Attack = function () {
        self.sprite.Attack();
    };

    self.StopWalking = function () {
        self.sprite.StopWalking();
    };

    self.StartWalking = function (mdir) {
        if (self.dead) {
            return;
        }
        
        self.sprite.StartWalking(mdir);
    };

    self.Update = function (time) {
        self.LocX = self.sprite.LocX;
        self.LocY = self.sprite.LocY;
        self.sprite.world.CollideTest(self.sprite, function (s) { return s.CurrentState.clipWidth }, function (s) { return s.CurrentState.clipHeight });
        self.sprite.Update(time);
    };

    self.getWidth = function () {
        return self.sprite.getWidth();
    };

    self.getHeight = function () {
        return self.sprite.getHeight();
    };

    self.sprite = sprite;
    self.name = name;
    self.level = 1;
    self.hp = self.MaxHP();
    self.LocX = self.sprite.LocX;
    self.LocY = self.sprite.LocY;


    QEvent.add(self.sprite, "AttackComplete", GameMechanics.Combat.PlayerAttackComplete({ player: self, getCurStateFunc: function GetMovementState() { return self.sprite.movementState; } }));
    QEvent.add(self.sprite, "AttackHit", GameMechanics.Combat.PlayerHitsMob(self));
    QEvent.add(self.sprite, Events.Sprites.Collision, GameMechanics.Combat.PlayerCollidesWithSprite(self));
}