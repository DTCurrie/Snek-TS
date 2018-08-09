System.register("grid/grid-coordinates", [], function (exports_1, context_1) {
    "use strict";
    var GridCoordinates;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            GridCoordinates = class GridCoordinates {
                constructor(x = 0, y = 0) {
                    this.x = x;
                    this.y = y;
                    this.Equals = (other) => (this.x === other.x && this.y === other.y);
                    this.Add = (other) => new GridCoordinates(this.x + other.x, this.y + other.y);
                }
            };
            exports_1("GridCoordinates", GridCoordinates);
        }
    };
});
System.register("grid/grid-tile", [], function (exports_2, context_2) {
    "use strict";
    var GridTile;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            GridTile = class GridTile {
                constructor(coordinates, content = null) {
                    this.coordinates = coordinates;
                    this.content = content;
                }
            };
            exports_2("GridTile", GridTile);
        }
    };
});
System.register("grid/grid", ["entity/index", "grid/grid-coordinates", "grid/grid-tile"], function (exports_3, context_3) {
    "use strict";
    var entity_1, grid_coordinates_1, grid_tile_1, Grid;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (entity_1_1) {
                entity_1 = entity_1_1;
            },
            function (grid_coordinates_1_1) {
                grid_coordinates_1 = grid_coordinates_1_1;
            },
            function (grid_tile_1_1) {
                grid_tile_1 = grid_tile_1_1;
            }
        ],
        execute: function () {
            Grid = class Grid {
                constructor(canvas, ctx, width = 10, height = 10, tileSize = 13) {
                    this.canvas = canvas;
                    this.ctx = ctx;
                    this.width = width;
                    this.height = height;
                    this.tileSize = tileSize;
                    this.tiles = new Array();
                    for (let x = 0; x < this.width; x++) {
                        for (let y = 0; y < this.height; y++) {
                            this.tiles.push(new grid_tile_1.GridTile(new grid_coordinates_1.GridCoordinates(x, y), null));
                        }
                    }
                }
                randomTile() {
                    const randomCoordinates = new grid_coordinates_1.GridCoordinates(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
                    let tile = this.getTileByCoordinates(randomCoordinates);
                    if (tile.content) {
                        tile = this.randomTile();
                    }
                    return tile;
                }
                getCoordinatePixel(coordinate) {
                    return coordinate * this.tileSize;
                }
                drawTile(tile) {
                    this.ctx.fillStyle = tile.content.color;
                    this.ctx.fillRect(this.getCoordinatePixel(tile.coordinates.x), this.getCoordinatePixel(tile.coordinates.y), this.tileSize, this.tileSize);
                }
                getTileByCoordinates(coordinates) {
                    return this.tiles.find((tile) => tile.coordinates.Equals(coordinates));
                }
                getTileByContentType(contentType) {
                    return this.tiles.find((tile) => tile.content && tile.content.type === contentType);
                }
                generateFood() {
                    const tile = this.randomTile();
                    tile.content = new entity_1.Food(tile.coordinates);
                }
                drawGrid() {
                    this.canvas.width = this.width * (this.tileSize);
                    this.canvas.height = this.height * (this.tileSize);
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    const playerTile = this.getTileByContentType(entity_1.EntityType.Player);
                    if (playerTile) {
                        this.drawTile(playerTile);
                    }
                    this.tiles.forEach((tile) => {
                        if (!tile.content) {
                            return;
                        }
                        if (tile.content.type == entity_1.EntityType.Segment || tile.content.type == entity_1.EntityType.Food) {
                            this.drawTile(tile);
                        }
                    });
                }
            };
            exports_3("Grid", Grid);
        }
    };
});
System.register("grid/index", ["grid/grid-coordinates", "grid/grid", "grid/grid-tile"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (grid_coordinates_2_1) {
                exports_4({
                    "GridCoordinates": grid_coordinates_2_1["GridCoordinates"]
                });
            },
            function (grid_1_1) {
                exports_4({
                    "Grid": grid_1_1["Grid"]
                });
            },
            function (grid_tile_2_1) {
                exports_4({
                    "GridTile": grid_tile_2_1["GridTile"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("entity/entity-type.enum", [], function (exports_5, context_5) {
    "use strict";
    var EntityType;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            (function (EntityType) {
                EntityType[EntityType["Player"] = 0] = "Player";
                EntityType[EntityType["Segment"] = 1] = "Segment";
                EntityType[EntityType["Food"] = 2] = "Food";
                EntityType[EntityType["Wall"] = 3] = "Wall";
            })(EntityType || (EntityType = {}));
            exports_5("EntityType", EntityType);
        }
    };
});
System.register("entity/entity.interface", [], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("entity/food", ["grid/index", "entity/entity-type.enum"], function (exports_7, context_7) {
    "use strict";
    var grid_2, entity_type_enum_1, Food;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (grid_2_1) {
                grid_2 = grid_2_1;
            },
            function (entity_type_enum_1_1) {
                entity_type_enum_1 = entity_type_enum_1_1;
            }
        ],
        execute: function () {
            Food = class Food {
                constructor(coordinates = new grid_2.GridCoordinates()) {
                    this.coordinates = coordinates;
                    this.type = entity_type_enum_1.EntityType.Food;
                    this.color = "#999999";
                }
            };
            exports_7("Food", Food);
        }
    };
});
System.register("entity/player", ["grid/index", "entity/entity-type.enum"], function (exports_8, context_8) {
    "use strict";
    var grid_3, entity_type_enum_2, Player;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (grid_3_1) {
                grid_3 = grid_3_1;
            },
            function (entity_type_enum_2_1) {
                entity_type_enum_2 = entity_type_enum_2_1;
            }
        ],
        execute: function () {
            Player = class Player {
                constructor(coordinates = new grid_3.GridCoordinates()) {
                    this.coordinates = coordinates;
                    this.type = entity_type_enum_2.EntityType.Player;
                    this.color = "#333333";
                    this.segmentCoordinates = new Array();
                }
                addSegment(coordinates) {
                    this.segmentCoordinates.unshift(coordinates);
                }
            };
            exports_8("Player", Player);
        }
    };
});
System.register("entity/segment", ["grid/index", "entity/entity-type.enum"], function (exports_9, context_9) {
    "use strict";
    var grid_4, entity_type_enum_3, Segment;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (grid_4_1) {
                grid_4 = grid_4_1;
            },
            function (entity_type_enum_3_1) {
                entity_type_enum_3 = entity_type_enum_3_1;
            }
        ],
        execute: function () {
            Segment = class Segment {
                constructor(coordinates = new grid_4.GridCoordinates()) {
                    this.coordinates = coordinates;
                    this.type = entity_type_enum_3.EntityType.Segment;
                    this.color = "#666666";
                }
            };
            exports_9("Segment", Segment);
        }
    };
});
System.register("entity/index", ["entity/entity-type.enum", "entity/food", "entity/player", "entity/segment"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (entity_type_enum_4_1) {
                exports_10({
                    "EntityType": entity_type_enum_4_1["EntityType"]
                });
            },
            function (food_1_1) {
                exports_10({
                    "Food": food_1_1["Food"]
                });
            },
            function (player_1_1) {
                exports_10({
                    "Player": player_1_1["Player"]
                });
            },
            function (segment_1_1) {
                exports_10({
                    "Segment": segment_1_1["Segment"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("emitters", [], function (exports_11, context_11) {
    "use strict";
    var Emitter, TypedEmitter;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function () {
            Emitter = class Emitter {
                constructor() {
                    this.listeners = [];
                    this.triggers = [];
                    this.on = (listener) => {
                        this.listeners.push(listener);
                        return { dispose: () => this.off(listener) };
                    };
                    this.once = (listener) => this.triggers.push(listener);
                    this.off = (listener) => {
                        const index = this.listeners.indexOf(listener);
                        if (index > -1) {
                            this.listeners.splice(index, 1);
                        }
                    };
                    this.emit = () => {
                        this.listeners.forEach((listener) => listener());
                        for (let i = this.triggers.length; i > 0; i--) {
                            this.triggers.pop()();
                        }
                    };
                }
                clear() {
                    this.listeners = [];
                    this.triggers = [];
                }
            };
            exports_11("Emitter", Emitter);
            TypedEmitter = class TypedEmitter {
                constructor() {
                    this.listeners = [];
                    this.triggers = [];
                    this.on = (listener) => {
                        this.listeners.push(listener);
                        return { dispose: () => this.off(listener) };
                    };
                    this.once = (listener) => this.triggers.push(listener);
                    this.off = (listener) => {
                        const index = this.listeners.indexOf(listener);
                        if (index > -1) {
                            this.listeners.splice(index, 1);
                        }
                    };
                    this.emit = (event) => {
                        this.listeners.forEach((listener) => listener(event));
                        for (let i = this.triggers.length; i > 0; i--) {
                            this.triggers.pop()(event);
                        }
                    };
                }
                clear() {
                    this.listeners = [];
                    this.triggers = [];
                }
            };
            exports_11("TypedEmitter", TypedEmitter);
        }
    };
});
System.register("input.service", ["emitters", "grid/index"], function (exports_12, context_12) {
    "use strict";
    var emitters_1, grid_5, InputService;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (emitters_1_1) {
                emitters_1 = emitters_1_1;
            },
            function (grid_5_1) {
                grid_5 = grid_5_1;
            }
        ],
        execute: function () {
            InputService = class InputService {
                constructor() {
                    this.onMove = new emitters_1.TypedEmitter();
                    this.onSpace = new emitters_1.Emitter();
                    document.addEventListener('keydown', ($event) => this.keyboardInput($event));
                }
                keyboardInput(event) {
                    if (event.keyCode === 38) { // up
                        this.onMove.emit(new grid_5.GridCoordinates(0, -1));
                    }
                    else if (event.keyCode === 40) { // down
                        this.onMove.emit(new grid_5.GridCoordinates(0, 1));
                    }
                    else if (event.keyCode === 37) { // left
                        this.onMove.emit(new grid_5.GridCoordinates(-1, 0));
                    }
                    else if (event.keyCode === 39) { // right
                        this.onMove.emit(new grid_5.GridCoordinates(1, 0));
                    }
                    else if (event.keyCode === 32) { // space
                        this.onSpace.emit();
                    }
                }
                buttonInput(input) {
                    if (input === 'up') {
                        this.onMove.emit(new grid_5.GridCoordinates(0, -1));
                    }
                    else if (input === "down") {
                        this.onMove.emit(new grid_5.GridCoordinates(0, 1));
                    }
                    else if (input === "left") {
                        this.onMove.emit(new grid_5.GridCoordinates(-1, 0));
                    }
                    else if (input === "right") {
                        this.onMove.emit(new grid_5.GridCoordinates(1, 0));
                    }
                    else if (input === "space") {
                        this.onSpace.emit();
                    }
                }
            };
            exports_12("InputService", InputService);
        }
    };
});
System.register("window", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    function nativeWindow() {
        return window;
    }
    exports_13("nativeWindow", nativeWindow);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("app", ["entity/index", "emitters", "grid/index", "input.service", "window"], function (exports_14, context_14) {
    "use strict";
    var entity_2, emitters_2, grid_6, input_service_1, window_1, App;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (entity_2_1) {
                entity_2 = entity_2_1;
            },
            function (emitters_2_1) {
                emitters_2 = emitters_2_1;
            },
            function (grid_6_1) {
                grid_6 = grid_6_1;
            },
            function (input_service_1_1) {
                input_service_1 = input_service_1_1;
            },
            function (window_1_1) {
                window_1 = window_1_1;
            }
        ],
        execute: function () {
            /**
            * The main app for the page.
            * @export
            */
            App = class App {
                /** Creates and initializes a new instance of App on the Window */
                constructor() {
                    this.onScore = new emitters_2.Emitter();
                    this.startInstructions = "PRESS SPACE TO START";
                    this.playInstructions = "USE THE ARROW KEYS";
                    this.gameOverInstructions = "PRESS SPACE TO RESTART";
                    this.buttonClick = (button) => this.input.buttonInput(button);
                    window_1.nativeWindow().App = this;
                    this.initialize();
                    setTimeout(() => document.querySelector('main[role="main"]').classList.remove('hidden'), 0);
                }
                drawText(size, text, y) {
                    this.ctx.font = `bold ${size}px Nokian`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillText(text, this.canvas.width / 2, y, this.canvas.width);
                }
                startGame() {
                    this.input.onMove.once((coordinates) => {
                        this.nextCoordinates = coordinates;
                        this.moveCoordinates = this.nextCoordinates;
                        this.startGameLoop();
                        this.input.onMove.on((coordinates) => this.nextCoordinates = coordinates);
                    });
                    this.score = 0;
                    this.scoreElement.textContent = `${this.score}`;
                    this.grid = new grid_6.Grid(this.canvas, this.ctx);
                    this.player = new entity_2.Player(new grid_6.GridCoordinates(Math.floor(this.grid.width / 2), Math.floor(this.grid.width / 2)));
                    this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;
                    this.grid.generateFood();
                    this.grid.drawGrid();
                    this.drawText(10, this.playInstructions, this.canvas.height / 2 + 25);
                }
                newGame() {
                    this.grid = new grid_6.Grid(this.canvas, this.ctx);
                    this.onScore.on(() => {
                        this.score++;
                        this.scoreElement.textContent = `${this.score}`;
                    });
                    this.input.onSpace.once(() => this.startGame());
                    this.grid.drawGrid();
                    this.drawText(10, this.startInstructions, this.canvas.height / 2);
                }
                initialize() {
                    this.input = new input_service_1.InputService();
                    this.nextCoordinates = new grid_6.GridCoordinates();
                    this.moveCoordinates = this.nextCoordinates;
                    document.getElementById('up').addEventListener('click', () => this.buttonClick('up'));
                    document.getElementById('down').addEventListener('click', () => this.buttonClick('down'));
                    document.getElementById('left').addEventListener('click', () => this.buttonClick('left'));
                    document.getElementById('right').addEventListener('click', () => this.buttonClick('right'));
                    document.getElementById('space').addEventListener('click', () => this.buttonClick('space'));
                    this.canvas = document.getElementById('canvas');
                    this.ctx = this.canvas.getContext('2d');
                    this.scoreElement = document.getElementById('score');
                    this.newGame();
                }
                checkMovement() {
                    if (this.moveCoordinates.x > 0 && this.nextCoordinates.x < 0) {
                        return this.moveCoordinates;
                    }
                    if (this.moveCoordinates.x < 0 && this.nextCoordinates.x > 0) {
                        return this.moveCoordinates;
                    }
                    if (this.moveCoordinates.y > 0 && this.nextCoordinates.y < 0) {
                        return this.moveCoordinates;
                    }
                    if (this.moveCoordinates.y < 0 && this.nextCoordinates.y > 0) {
                        return this.moveCoordinates;
                    }
                    return this.nextCoordinates;
                }
                calculateCollision(coordinates) {
                    if (coordinates.x < 0 || coordinates.x > this.grid.width - 1) {
                        return entity_2.EntityType.Wall;
                    }
                    if (coordinates.y < 0 || coordinates.y > this.grid.height - 1) {
                        return entity_2.EntityType.Wall;
                    }
                    const other = this.grid.getTileByCoordinates(coordinates);
                    if (!other.content) {
                        return null;
                    }
                    return other.content.type;
                }
                movePlayer(coordinates) {
                    const oldCoordinates = this.player.coordinates;
                    this.grid.getTileByCoordinates(oldCoordinates).content = null;
                    this.player.coordinates = coordinates;
                    this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;
                    if (this.player.segmentCoordinates.length) {
                        this.grid.getTileByCoordinates(this.player.segmentCoordinates.pop()).content = null;
                        this.grid.getTileByCoordinates(oldCoordinates).content = new entity_2.Segment(oldCoordinates);
                        this.player.addSegment(oldCoordinates);
                    }
                }
                gameOver() {
                    this.drawText(20, 'GAME OVER', this.canvas.height / 2);
                    this.drawText(10, this.gameOverInstructions, this.canvas.height / 2 + 25);
                    clearInterval(this.loop);
                    this.input.onMove.clear();
                    this.input.onSpace.once(() => this.startGame());
                }
                startGameLoop() {
                    this.loop = window_1.nativeWindow().setInterval(() => {
                        this.moveCoordinates = this.checkMovement();
                        const coordinates = this.player.coordinates.Add(this.moveCoordinates);
                        const collision = this.calculateCollision(coordinates);
                        if (!collision) {
                            this.movePlayer(coordinates);
                        }
                        if (collision === entity_2.EntityType.Food) {
                            this.movePlayer(coordinates);
                            this.player.addSegment(coordinates);
                            this.grid.generateFood();
                            this.onScore.emit();
                        }
                        if (collision === entity_2.EntityType.Wall || collision === entity_2.EntityType.Segment) {
                            this.gameOver();
                            return;
                        }
                        setTimeout(this.grid.drawGrid(), 0);
                    }, 100);
                }
            };
            exports_14("App", App);
        }
    };
});
System.register("bootstrap", ["app"], function (exports_15, context_15) {
    "use strict";
    var app_1;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (app_1_1) {
                app_1 = app_1_1;
            }
        ],
        execute: function () {
            /** Create a new instance of the app to bootstrap the site */
            new app_1.App();
        }
    };
});
//# sourceMappingURL=app.js.map