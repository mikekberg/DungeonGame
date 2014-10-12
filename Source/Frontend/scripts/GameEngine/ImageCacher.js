/// <reference path="../Libraries/jquery-1.6.2.js" />

var ImageCacher = {
	cacheData: {},
	CreateCache: function(cacheName) {
		this.cacheData[cacheName] = {
									 data: {}, 
									 imageCount: 0,
									 imagesLoaded: 0, 
									 isReady: function() { return this.imagesLoaded == this.imageCount; },
									 cacheImageBySrc: function(itemName, imageSrc) {
                                            var cacheImage = new Image();
                                            cacheImage.src = imageSrc;
                                            this.cacheImage(itemName, cacheImage);
									 },
									 cacheImage: function(itemName, image) {
										var thisWrap = this;
										image.onload = function() { thisWrap.imagesLoaded++; };
										this.data[itemName] = image;
										this.imageCount++;
									 },
									 get: function(itemName) {
										return this.data[itemName];
									 },
									};
									
		return this.cacheData[cacheName];
	},
	RemoveCache: function(cacheName) {
		delete cacheData[cacheName];
	},
	GetCacheData: function(cacheName) {
		if (!this.cacheData[cacheName]) {
			throw "There is no registered cache with name '" + cacheName + "'";
		}
		
		return this.cacheData[cacheName].data;
	},
	AreCachesLoaded: function() {
		for (var item in this.cacheData) {
			if (!this.cacheData[item].isReady()) {
				return false;
			}
		}
		return true;
	},
	
	LoadSpriteCache: function() {
		var sprites = ImageCacher.CreateCache("Sprites");
		for (var spriteDataName in GameData.Sprites) {
			var spriteData = GameData.Sprites[spriteDataName];
			sprites.cacheImageBySrc(spriteData.name, spriteData.src);
		}
	},

	LoadCaches: function() {
		this.LoadSpriteCache();
	},

    WaitForCacheThenCall: function(callFunc, ttc) {
		var timeToWait = ttc || 100;
		var fun = function() {
			if (ImageCacher.AreCachesLoaded()) {
				callFunc();
			}
			else {
				setTimeout(fun, timeToWait);
			}
		}
		setTimeout(fun, timeToWait);
	},
}