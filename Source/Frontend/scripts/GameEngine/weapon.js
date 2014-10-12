/// <reference path="../Libraries/jquery-1.6.2.js" />

var Weapon = function(weaponInfo) {
    this.GetWeaponType = function(typeName) {
        for (var type in GameData.WeaponTypes) {
            if (GameData.WeaponTypes[type].name == typeName) {
                return GameData.WeaponTypes[type];
            }
        }
    }
    
    this.name = weaponInfo.name;
    this.weaponInfo = weaponInfo;
    this.typeInfo = this.GetWeaponType(weaponInfo.type);
}

Weapon.GetByName = function(name) {
    for (var nm in GameData.Weapons) {
        if (GameData.Weapons[nm].name == name) {
            return new Weapon(GameData.Weapons[nm]);
        }
    }
}