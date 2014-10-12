var GameData = {
	Server: { ip: "127.0.0.1", port: "" },
	
	TileSets: {
        Cave: {
            TileWidth: 70,
            TileHeight: 70,
            Tiles: [ {name:"Spike", src: "tiles/cave_test.png", walkable: false, x: 0, y: 0},
                     {name:"TopOuterLeft", src: "tiles/cave_test.png", walkable: false, x: 70, y: 0},
                     {name:"TopMiddle", src: "tiles/cave_test.png", walkable: false, x: 140, y: 0},
                     {name:"TopOuterRight", src: "tiles/cave_test.png", walkable: false, x: 210, y: 0},
                     {name:"Ground1", src: "tiles/cave_test.png", walkable: true, x: 280, y: 0},
                     {name:"Ground2", src: "tiles/cave_test.png", walkable: true, x: 140, y: 70},
                     {name:"Ground3", src: "tiles/cave_test.png", walkable: true, x: 70, y: 140},
                     {name:"Ground4", src: "tiles/cave_test.png", walkable: true, x: 210, y: 140},
					 {name:"Ground5", src: "tiles/cave_test.png", walkable: true, x: 140, y: 210},
                     {name:"TopInnerLeft", src: "tiles/cave_test.png", walkable: false, x: 70, y: 70},
                     {name:"TopInnerRight", src: "tiles/cave_test.png", walkable: false, x: 210, y: 70},
					 {name:"MiddleLeft", src: "tiles/cave_test.png", walkable: false, x: 0, y: 140},
					 {name:"Wall", src: "tiles/cave_test.png", walkable: false, x: 140, y: 140},
					 {name:"MiddleRight", src: "tiles/cave_test.png", walkable: false, x: 280, y: 140},
					 {name:"BottomOuterLeft", src: "tiles/cave_test.png", walkable: false, x: 0, y: 210},
					 {name:"BottomInnerLeft", src: "tiles/cave_test.png", walkable: false, x: 70, y: 210},
					 {name:"BottomInnerRight", src: "tiles/cave_test.png", walkable: false, x: 210, y: 210},
					 {name:"BottomOuterRight", src: "tiles/cave_test.png", walkable: false, x: 280, y: 210},
					 {name:"BottomMiddle", src: "tiles/cave_test.png", walkable: false, x: 140, y: 280},
					 {name:"AngleRight", src: "tiles/cave_test.png", walkable: false, x: 0, y: 280},
					 { name: "AngleLeft", src: "tiles/cave_test.png", walkable: false, x: 280, y: 280 },
                     { name: "StairsDown", src: "tiles/cave_test.png", walkable: true, x: 0, y: 350, trigger: 'StairsDown' },
                     { name: "StairsUp", src: "tiles/cave_test.png", walkable: true, x: 70, y: 350, trigger: 'StairsUp' }
            ],
            
            TileGroups: { "Ground": [ { tileName: "Ground1", distribution: 0.10 },
                                      { tileName: "Ground2", distribution: 0.05 },
                                      { tileName: "Ground3", distribution: 0.10 },
                                      { tileName: "Ground4", distribution: 0.38 },
									  { tileName: "Ground5", distribution: 0.37 }
                                    ]
                        },
                        
            CaveGeneratorRules: {
                DefaultWallTile: "Wall",
                DefaultGroundTile: "Ground",
                EdgeRules: {
                    "BottomOuterLeft":  ["12356", "23569", "2356", "123569", "23568", "234568", "234569", "234567", "123567","23567", "235678", "1235678", "235679", "23456", "2345679", "123568", "1235679"],
                    "BottomInnerRight": ["12345678"],
                    "TopOuterLeft":     ["1356789", "5689", "35689", "356789", "56789", "245689", "145689", "1256789", "125689", "15689", "135689", "45689", "256789", "345689", "25689", "1345689", "1345689", "156789"],
                    "BottomOuterRight": ["1245", "123457", "12457", "12345", "124568", "12458", "12456", "124569", "124589", "123458", "12459", "1234589", "124579", "123459", "124567", "1245679", "1234579"],
                    "BottomMiddle":     ["1234567", "123456", "1234569", "12345679", "1234568"],
                    "TopMiddle":        ["456789", "1456789", "3456789", "13456789", "2456789"],
                    "MiddleLeft":       ["235689", "2356789", "1235689", "12356789", "2345689"],
                    "MiddleRight":      ["1245789", "12345789", "124578", "1234578", "1245678"],
                    "TopOuterRight":    ["4578", "14578", "145789", "45789", "45789", "34578", "345789", "245678", "2456789", "345678", "45678", "245789", "145678", "234578", "24578", "134578", "2345789", "1345678", "1345789"],
                    "TopInnerRight":    ["12456789"],
                    "TopInnerLeft":     ["23456789"],
                    "BottomInnerLeft":  ["12345689"],
                    "Spike":            ["2456", "57", "59", "25", "35", "56", "4569", "2458", "1578", "145", "34568", "24567", "145679", "234579", "24569", "45", "15", "257", "58", "23458", "134567", "24568", "5789", "3569", "1457", "1235", "3578", "1457", "12359", "14579", "13569", "1569", "4589", "12569", "14589", "1459", "35678", "23457", "35678", "12358", "25789", "123578", "34567", "35789", "1458", "1259", "125789", "3567", "3457", "1589", "14569", "12589", "3568", "5679", "345", "2569", "14567", "3456", "23578", "15789", "2457", "1258", "2578", "4579", "1256", "578", "2359", "213578", "2345", "5678", "24589", "4568", "569", "25678", "245", "12578", "2357", "34569", "13457", "1235789", "1345679", "213578", "2358", "1345", "4567", "13589", "1356", "12578", "35679", "1257", "3589", "345679", "235789", "12357", "13578", "134569", "1456", "2589", "123589", "45679", "234589"],
                    "AngleLeft":        ["1245689"],
                    "AngleRight":       ["2345678"],
               },
            },
        }
	},

	Sprites: [
		{name:"fog", src: "sprites/fog.png", cellWidth: 686, cellHeight: 680, startState: "static",
			states: [{name:"static", cells: 1, startX: 0}]
		},
        {name:"chest", src: "sprites/chest.png", cellWidth: 50, cellHeight: 50, startY: 0, startState: "closed",
            states: [{name:"opened", cells: 1, startX: 50},
                     { name: "closed", cells: 1, startX: 0 }]
        },

        {name: "sack", src: "sprites/sack.png", cellWidth: 50, cellHeight: 50, startY: 0, startState: "large",
            states: [{ name: "large", cells: 1, startX: 0 },
                     { name: "small", cells: 1, startX: 50 }]
        },
                     
        {name:"jelly", src: "sprites/enemies/jellyB.png", cellWidth: 50, cellHeight: 50, startX: 0, 
         startState: "standing", framerate: 3, clipX: 6, clipY: 18, clipWidth: 38, clipHeight: 24,
            states: [{name:"moveLeft", cells: 2, startY: 0},
                     {name:"moveRight", cells: 2, startY: 50},
                     {name:"moveUp", cells: 2, startY: 100},
                     {name:"moveDown", cells: 2, startY: 150},
                     {name:"standing", cells: 1, startY: 0}
                     ],
            movementInfo: { 
                directionStates: {
                    1: {movingState: "moveLeft", facingState: "standing"},
                    2: {movingState: "moveUp", facingState: "standing"},
                    3: {movingState: "moveRight", facingState: "standing"},
                    4: {movingState: "moveLeft", facingState: "standing"},
                    6: {movingState: "moveRight", facingState: "standing"},
                    7: {movingState: "moveLeft", facingState: "standing"},
                    8: {movingState: "moveDown", facingState: "standing"},
                    9: {movingState: "moveRight", facingState: "standing"},
                },
                moveSpeed: 75},
        },
		
		{name:"rat", src: "sprites/enemies/rat.png", cellWidth: 80, cellHeight: 80, startX: 0, 
         startState: "standing", framerate: 8, clipX: 6, clipY: 18, clipWidth: 38, clipHeight: 24,
            states: [{name:"moveLeft", cells: 2, startY: 0},
                     {name:"moveRight", cells: 2, startY: 80},
                     {name:"moveUp", cells: 2, startY: 160},
                     {name:"moveDown", cells: 2, startY: 240},
                     {name:"standingLeft", cells: 1, startY: 0},
					 {name:"standingRight", cells: 1, startY: 80},
					 {name:"standingUp", cells: 1, startY: 160},
					 {name:"standingDown", cells: 1, startY: 240},
                     ],
            movementInfo: { 
                directionStates: {
                    1: {movingState: "moveLeft", facingState: "standingLeft"},
                    2: {movingState: "moveUp", facingState: "standingUp"},
                    3: {movingState: "moveRight", facingState: "standingRight"},
                    4: {movingState: "moveLeft", facingState: "standingLeft"},
                    6: {movingState: "moveRight", facingState: "standingRight"},
                    7: {movingState: "moveLeft", facingState: "standingLeft"},
                    8: {movingState: "moveDown", facingState: "standingDown"},
                    9: {movingState: "moveRight", facingState: "standingRight"},
                },
                moveSpeed: 300},
        },
        
        {name:"playerSprite", src: "sprites/char_sheet.png", cellWidth: 60, cellHeight: 60, startY: 0, 
            startState: "standingDown", framerate: 10, clipX: 15, clipY: 50, clipWidth: 20, clipHeight: 1,
            states: [{ name: "standingDown", cells: 1, startX: 60},
                     { name: "standingUp", cells: 1, startX: 60, startY: 120},
                     { name: "standingLeft", cells: 1, startX: 60, startY: 60},
                     { name: "standingRight", cells: 1, startX: 60, startY: 180},
                     { name: "walkingLeft", cells: 4, startY: 60},
                     { name: "walkingRight", cells: 4, startY: 180},
                     { name: "walkingUp", cells: 4, startY: 120},
                     { name: "walkingDown", cells: 4, startY: 0},
                     { name: "attackDown", cells: 5, startY: 240, framerate: 12},
                     { name: "attackLeft", cells: 5, startY: 300, framerate: 12},
                     { name: "attackUp", cells: 5, startY: 360, framerate: 12 },
                     { name: "attackRight", cells: 5, startY: 420, framerate: 12 },
                     { name: "attack2Down", cells: 5, startY: 480, framerate: 12 },
                     { name: "attack2Left", cells: 5, startY: 540, framerate: 12 },
                     { name: "attack2Up", cells: 5, startY: 600, framerate: 12 },
                     { name: "attack2Right", cells: 5, startY: 660, framerate: 12 },
                     { name: "attack3Down", cells: 5, startY: 720, framerate: 12 },
                     { name: "attack3Left", cells: 5, startY: 780, framerate: 12 },
                     { name: "attack3Up", cells: 5, startY: 840, framerate: 12 },
                     { name: "attack3Right", cells: 5, startY: 900, framerate: 12 },
                     { name: "castDownStart", cells: 1, startY: 960, framerate: 16 },
                     { name: "castLeftStart", cells: 1, startY: 1020, framerate: 16 },
                     { name: "castUpStart", cells: 1, startY: 1080, framerate: 16 },
                     { name: "castRightStart", cells: 1, startY: 1140, framerate: 16 },
                     { name: "castDownEnd", cells: 1, startY: 960, startX: 60, framerate: 16 },
                     { name: "castLeftEnd", cells: 1, startY: 1020, startX: 60, framerate: 16 },
                     { name: "castUpEnd", cells: 1, startY: 1080, startX: 60, framerate: 16 },
                     { name: "castRightEnd", cells: 1, startY: 1140, startX: 60, framerate: 16 },
                     { name: "deathRight", cells: 3, startY: 1200, framerate: 4, loop: false },
                     { name: "deathLeft", cells: 3, startY: 1260, framerate: 4, loop: false }
                     ],
                     
            attackInfo: {
                attackStates: {
                    1: {attackState: "attackLeft", offsetX: -40, offsetY: -10},
                    2: {attackState: "attackUp", offsetX: -18, offsetY: -30, underlay: true},
                    3: {attackState: "attackRight", offsetX: 12, offsetY: -10},
                    4: {attackState: "attackLeft", offsetX: -40, offsetY: -10},
                    6: {attackState: "attackRight", offsetX: 20, offsetY: -10},
                    7: {attackState: "attackLeft", offsetX: -40, offsetY: -10},
                    8: {attackState: "attackDown", offsetX: 3, offsetY: 14},
                    9: {attackState: "attackRight", offsetX: 12, offsetY: -10},
                },
            },
            
            movementInfo: { directionStates: {
                                1: {movingState: "walkingLeft", facingState: "standingLeft"},
                                2: {movingState: "walkingUp", facingState: "standingUp"},
                                3: {movingState: "walkingRight", facingState: "standingRight"},
                                4: {movingState: "walkingLeft", facingState: "standingLeft"},
                                6: {movingState: "walkingRight", facingState: "standingRight"},
                                7: {movingState: "walkingLeft", facingState: "standingLeft"},
                                8: {movingState: "walkingDown", facingState: "standingDown"},
                                9: {movingState: "walkingRight", facingState: "standingRight"},
                            },
                            moveSpeed: 300},
                    
        },
        { name: "plasmaSword", src: "sprites/weapons/SwordSwing_plasma.png", cellWidth: 80, cellHeight: 80, startX: 0, framerate: 16,
            states: [{name: "swingRight", cells: 5, startY: 0},
                     {name: "swingLeft", cells: 5, startY: 80},
                     {name: "swingDown", cells: 5, startY: 160},
                     {name: "swingUp", cells: 5, startY: 240}
                     ],
           attackFrames: {
                "swingRight": {
                                1: { x: 8, y: 45, width: 25, height: 35 },
                                2: { x: 30, y: 40, width: 33, height: 35 },
                                3: { x: 34, y: 30, width: 45, height: 18 },
                                4: { x: 32, y: 4, width: 33, height: 35 },
                                5: { x: 30, y: 2, width: 33, height: 35 },
                              },
                "swingLeft": {
                                1: { x: 48, y: 45, width: 25, height: 35 },
                                2: { x: 18, y: 40, width: 33, height: 35 },
                                3: { x: 2, y: 30, width: 45, height: 18 },
                                4: { x: 17, y: 4, width: 33, height: 35 },
                                5: { x: 19, y: 2, width: 33, height: 35 },
                              },
                "swingUp": {
                                1: { x: 48, y: 48, width: 35, height: 25 },
                                2: { x: 40, y: 15, width: 35, height: 33 },
                                3: { x: 30, y: 0, width: 18, height: 45 },
                                4: { x: 5, y: 16, width: 35, height: 33 },
                                5: { x: 3, y: 18, width: 35, height: 33 },
                              },
                "swingDown": {
                                1: { x: 0, y: 0, width: 35, height: 25 },
                                2: { x: 8, y: 27, width: 35, height: 33 },
                                3: { x: 33, y: 37, width: 18, height: 45 },
                                4: { x: 40, y: 25, width: 35, height: 33 },
                                5: { x: 42, y: 23, width: 35, height: 33 },
                              },
           }
        },
        { name: "hitEffect", src: "sprites/effects/hit1.png", cellWidth: 140, cellHeight: 140, startX: 0, framerate: 30,
            states: [{name: "hit", cells: 12, startY: 0, loop: false}]},

        { name: "longSword", src: "sprites/weapons/SwordSwing_longsword.png", cellWidth: 80, cellHeight: 80, startX: 0, framerate: 16,
            states: [{name: "swingRight", cells: 5, startY: 0},
                     {name: "swingLeft", cells: 5, startY: 80},
                     {name: "swingDown", cells: 5, startY: 160},
                     {name: "swingUp", cells: 5, startY: 240}
                     ],
           attackFrames: {
                "swingRight": {
                                1: { x: 8, y: 45, width: 25, height: 35 },
                                2: { x: 30, y: 40, width: 33, height: 35 },
                                3: { x: 34, y: 30, width: 45, height: 18 },
                                4: { x: 32, y: 4, width: 33, height: 35 },
                                5: { x: 30, y: 2, width: 33, height: 35 },
                              },
                "swingLeft": {
                                1: { x: 48, y: 45, width: 25, height: 35 },
                                2: { x: 18, y: 40, width: 33, height: 35 },
                                3: { x: 2, y: 30, width: 45, height: 18 },
                                4: { x: 17, y: 4, width: 33, height: 35 },
                                5: { x: 19, y: 2, width: 33, height: 35 },
                              },
                "swingUp": {
                                1: { x: 48, y: 48, width: 35, height: 25 },
                                2: { x: 40, y: 15, width: 35, height: 33 },
                                3: { x: 30, y: 0, width: 18, height: 45 },
                                4: { x: 5, y: 16, width: 35, height: 33 },
                                5: { x: 3, y: 18, width: 35, height: 33 },
                              },
                "swingDown": {
                                1: { x: 0, y: 0, width: 35, height: 25 },
                                2: { x: 8, y: 27, width: 35, height: 33 },
                                3: { x: 33, y: 37, width: 18, height: 45 },
                                4: { x: 40, y: 25, width: 35, height: 33 },
                                5: { x: 42, y: 23, width: 35, height: 33 },
                              },
           }
        },
		{ name: "fishBone", src: "sprites/weapons/SwordSwing_fishbone.png", cellWidth: 80, cellHeight: 80, startX: 0, framerate: 16,
            states: [{name: "swingRight", cells: 5, startY: 0},
                     {name: "swingLeft", cells: 5, startY: 80},
                     {name: "swingDown", cells: 5, startY: 160},
                     {name: "swingUp", cells: 5, startY: 240}
                     ],
           attackFrames: {
                "swingRight": {
                                1: { x: 8, y: 45, width: 25, height: 35 },
                                2: { x: 30, y: 40, width: 33, height: 35 },
                                3: { x: 34, y: 30, width: 45, height: 18 },
                                4: { x: 32, y: 4, width: 33, height: 35 },
                                5: { x: 30, y: 2, width: 33, height: 35 },
                              },
                "swingLeft": {
                                1: { x: 48, y: 45, width: 25, height: 35 },
                                2: { x: 18, y: 40, width: 33, height: 35 },
                                3: { x: 2, y: 30, width: 45, height: 18 },
                                4: { x: 17, y: 4, width: 33, height: 35 },
                                5: { x: 19, y: 2, width: 33, height: 35 },
                              },
                "swingUp": {
                                1: { x: 48, y: 48, width: 35, height: 25 },
                                2: { x: 40, y: 15, width: 35, height: 33 },
                                3: { x: 30, y: 0, width: 18, height: 45 },
                                4: { x: 5, y: 16, width: 35, height: 33 },
                                5: { x: 3, y: 18, width: 35, height: 33 },
                              },
                "swingDown": {
                                1: { x: 0, y: 0, width: 35, height: 25 },
                                2: { x: 8, y: 27, width: 35, height: 33 },
                                3: { x: 33, y: 37, width: 18, height: 45 },
                                4: { x: 40, y: 25, width: 35, height: 33 },
                                5: { x: 42, y: 23, width: 35, height: 33 },
                              },
           }
        },
		{ name: "ragnarSword", src: "sprites/weapons/SwordSwing_ragnar.png", cellWidth: 80, cellHeight: 80, startX: 0, framerate: 16,
            states: [{name: "swingRight", cells: 5, startY: 0},
                     {name: "swingLeft", cells: 5, startY: 80},
                     {name: "swingDown", cells: 5, startY: 160},
                     {name: "swingUp", cells: 5, startY: 240}
                     ],
           attackFrames: {
                "swingRight": {
                                1: { x: 8, y: 45, width: 25, height: 35 },
                                2: { x: 30, y: 40, width: 33, height: 35 },
                                3: { x: 34, y: 30, width: 45, height: 18 },
                                4: { x: 32, y: 4, width: 33, height: 35 },
                                5: { x: 30, y: 2, width: 33, height: 35 },
                              },
                "swingLeft": {
                                1: { x: 48, y: 45, width: 25, height: 35 },
                                2: { x: 18, y: 40, width: 33, height: 35 },
                                3: { x: 2, y: 30, width: 45, height: 18 },
                                4: { x: 17, y: 4, width: 33, height: 35 },
                                5: { x: 19, y: 2, width: 33, height: 35 },
                              },
                "swingUp": {
                                1: { x: 48, y: 48, width: 35, height: 25 },
                                2: { x: 40, y: 15, width: 35, height: 33 },
                                3: { x: 30, y: 0, width: 18, height: 45 },
                                4: { x: 5, y: 16, width: 35, height: 33 },
                                5: { x: 3, y: 18, width: 35, height: 33 },
                              },
                "swingDown": {
                                1: { x: 0, y: 0, width: 35, height: 25 },
                                2: { x: 8, y: 27, width: 35, height: 33 },
                                3: { x: 33, y: 37, width: 18, height: 45 },
                                4: { x: 40, y: 25, width: 35, height: 33 },
                                5: { x: 42, y: 23, width: 35, height: 33 },
                              },
           }
        },
	    
        { name: "chainmail", src: "sprites/clothes/armor/chainmail.png"},
        { name: "platemail", src: "sprites/clothes/armor/platemail.png"},
        
        { name: "bluepants", src: "sprites/clothes/pants/blue.png"},
        { name: "greypants", src: "sprites/clothes/pants/grey.png"},
        { name: "redpants", src: "sprites/clothes/pants/red.png"},
        
        { name: "redshirt", src: "sprites/clothes/shirt/red.png"},
        { name: "greenshirt", src: "sprites/clothes/shirt/green.png"},
        { name: "blueshirt", src: "sprites/clothes/shirt/blue.png"},
        
        { name: "blueshoes", src: "sprites/clothes/shoes/blue.png"},
        { name: "blackshoes", src: "sprites/clothes/shoes/black.png"},
        { name: "brownshoes", src: "sprites/clothes/shoes/brown.png" },

        { name: "Death1", src: "sprites/effects/death.png", cellWidth: 100, cellHeight: 154, startX: 0, framerate: 15,
            states: [{ name: "Death1", startY: 0, cells: 17 }]
        },
        { name: "Death2", src: "sprites/effects/death_alt.png", cellWidth: 100, cellHeight: 154, startX: 0, framerate: 15,
            states: [{ name: "Death1", startY: 0, cells: 17 }]
        }
	],
    
    Enemies: [
        { name: "RedJelly", sprite: "jelly", AIScript: "EnemyDefault", HP: 20, Drops: [{ chance: 1.00, item: "TestSword" }] },
        {name: "Rat", sprite: "rat", AIScript: "EnemyDefault", HP: 10},
    ],
    
    Weapons: [
        { name: "TestSword", type: "PlasmaSword", dmgMin: 2, dmgMax: 5, coolDown: 200 },
        { name: "PlasmaSword", type: "PlasmaSword", dmgMin: 10, dmgMax: 20, coolDown: 200 },
        { name: "FishBoneSword", type: "FishBone", dmgMin: 20, dmgMax: 100, coolDown: 500 }
    ],

    Armour: [
        { name: "Chainmail", sprite: "chainmail", typeInfo: {} },
        { name: "Platemail", sprite: "platemail", typeInfo: {} }
    ],

    Clothing: {
        Shirts: [
            { name: "BlueShirt", sprite: "blueshirt", typeInfo: {} }
        ],
        Pants: [
            { name: "BluePants", sprite: "bluepants", typeInfo: {} },
            { name: "RedPants", sprite: "redpants", typeInfo: {} }
        ],
        Shoes: [
            { name: "BlueShoes", sprite: "blueshoes", typeInfo: {} }
        ]
    },
    
    WeaponTypes: [
        {name: "LongSword", sprite: "longSword", thumb: "longsword.png",
            attackStates: {
                1: { state: "swingLeft" },
                2: { state: "swingUp" },
                3: { state: "swingRight" },
                4: { state: "swingLeft" },
                6: { state: "swingRight" },
                7: { state: "swingLeft" },
                8: { state: "swingDown" },
                9: { state: "swingRight" },
            }
        },
        {name: "PlasmaSword", sprite: "plasmaSword", 
            attackStates: {
                1: { state: "swingLeft" },
                2: { state: "swingUp" },
                3: { state: "swingRight" },
                4: { state: "swingLeft" },
                6: { state: "swingRight" },
                7: { state: "swingLeft" },
                8: { state: "swingDown" },
                9: { state: "swingRight" },
            }
        },
		{name: "FishBone", sprite: "fishBone", 
            attackStates: {
                1: { state: "swingLeft" },
                2: { state: "swingUp" },
                3: { state: "swingRight" },
                4: { state: "swingLeft" },
                6: { state: "swingRight" },
                7: { state: "swingLeft" },
                8: { state: "swingDown" },
                9: { state: "swingRight" },
            }
        },
		{name: "RagnarSword", sprite: "ragnarSword", 
            attackStates: {
                1: { state: "swingLeft" },
                2: { state: "swingUp" },
                3: { state: "swingRight" },
                4: { state: "swingLeft" },
                6: { state: "swingRight" },
                7: { state: "swingLeft" },
                8: { state: "swingDown" },
                9: { state: "swingRight" },
            }
        },
    ],
			  
	GameConsts: {
	  MAIN_CONTAINER: "mainCanvas",
	  PATH_FINDER: astar,

      Combat: {
        PlayerHitCoolDown: 1000,
      },

      Player: {
        StrMod: 10,
        BaseHP: 25,
        LevelHPBonus: 5,
        ConHPBonus: 10
      },
      
      UI: {
        DefaultFontOptions: { Family: "PressStart",
                              Color: "white",
                              Size: 16
                            },
        
        Overlays: {
            PlayerHitSlideOptions: { vi: { x: 2, y: -3 }, accel: {x: 0, y: 5}},
            PlayerHitFadeOptions:  { fadeTime: 1000 },
            EnemyKilledFadeOptions: { fadeTime: 500 }
        }
      }
	}
}