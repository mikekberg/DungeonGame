/// <reference path="../Libraries/jquery-1.6.2.js" />
/// <reference path="../Libraries/underscore-min.js" />

function GarbageCollector() {
    this.collections = new Array();
    this.collectTimer = 0;
    this.lastCheck = 0;
    
    this.Add = function(object, collection, testFunc) {
        this.collections.push({ obj: object, col: collection, testFunc: testFunc});
    }

    this.Update = function(elapseTime) {
        this.collectTimer += elapseTime;
        
        if (this.collectTimer > 1000) {
            var curObj = this.collections[this.lastCheck];
            var curCol = curObj.obj[curObj.col];
            this.collectTimer = 0;
            
            if (curCol != null && _.detect(curCol, curObj.testFunc) != null) {
                this.collections[this.lastCheck].obj[curObj.col] = _.select(curCol, function(item) { return !curObj.testFunc(item) });
            }
            
            this.lastCheck++;
            if (this.lastCheck >= this.collections.length) {
                this.lastCheck = 0;
            }
        }
    }
}