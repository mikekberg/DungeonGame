/// <reference path="../Libraries/jquery-1.6.2.js" />

var Enemy = function (enemyData, locX, locY) {
    this.enemyData = enemyData
    this.sprite = Sprite.GetByName(enemyData.sprite, locX, locY);
    this.HP = enemyData.HP;
    this.MaxHP = enemyData.HP;
    this.sprite.enemy = this;

    if (!AI[enemyData.AIScript]) {
        throw "Unable to load AI Script '" + enemyData.AIScript + "'"
    }

    this.AIScript = AI[enemyData.AIScript];
    this.AIScript.Init(this);

    this.Render = function (ctx, lx, ly) {
        this.sprite.Render(ctx, lx, ly);
    };

    this.Update = function (elapseTime) {
        if (!this.AIDisabled) {
            this.AIScript.UpdateAI(this, elapseTime);
        }
        this.sprite.Update(elapseTime);
    }
}

Enemy.Index = 0;

Enemy.GetByName = function (enemyName, locX, locY) {
    for (var enemy in GameData.Enemies) {
        if (GameData.Enemies[enemy].name == enemyName) {
            var e = new Enemy(GameData.Enemies[enemy], locX, locY);
            e.sprite._id = (Enemy.Index++);
            return e;
        }
    }
    throw "Enemy with name '" + enemyName + "' not found.";
}