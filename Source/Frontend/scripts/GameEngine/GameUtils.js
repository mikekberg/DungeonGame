/// <reference path="../Libraries/jquery-1.6.2.js" />

GameUtils = {
    Collide: function (object1, object2) {
        return !(object1.y + object1.height < object2.y || 
                 object1.y > (object2.y + object2.height) ||
                 object1.x + object1.width < object2.x ||
                 object1.x > object2.x + object2.width);
    }
}