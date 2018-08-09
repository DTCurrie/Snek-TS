"use strict";

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

System.register("grid/grid-coordinates", [], function (exports_1, context_1) {
    "use strict";

    var GridCoordinates;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function execute() {
            GridCoordinates = function GridCoordinates() {
                var _this = this;

                var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
                var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

                _classCallCheck(this, GridCoordinates);

                this.x = x;
                this.y = y;
                this.Equals = function (other) {
                    return _this.x === other.x && _this.y === other.y;
                };
                this.Add = function (other) {
                    return new GridCoordinates(_this.x + other.x, _this.y + other.y);
                };
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
        execute: function execute() {
            GridTile = function GridTile(coordinates) {
                var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

                _classCallCheck(this, GridTile);

                this.coordinates = coordinates;
                this.content = content;
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
        setters: [function (entity_1_1) {
            entity_1 = entity_1_1;
        }, function (grid_coordinates_1_1) {
            grid_coordinates_1 = grid_coordinates_1_1;
        }, function (grid_tile_1_1) {
            grid_tile_1 = grid_tile_1_1;
        }],
        execute: function execute() {
            Grid = function () {
                function Grid(canvas, ctx) {
                    var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
                    var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
                    var tileSize = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 13;

                    _classCallCheck(this, Grid);

                    this.canvas = canvas;
                    this.ctx = ctx;
                    this.width = width;
                    this.height = height;
                    this.tileSize = tileSize;
                    this.tiles = new Array();
                    for (var x = 0; x < this.width; x++) {
                        for (var y = 0; y < this.height; y++) {
                            this.tiles.push(new grid_tile_1.GridTile(new grid_coordinates_1.GridCoordinates(x, y), null));
                        }
                    }
                }

                _createClass(Grid, [{
                    key: "randomTile",
                    value: function randomTile() {
                        var randomCoordinates = new grid_coordinates_1.GridCoordinates(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
                        var tile = this.getTileByCoordinates(randomCoordinates);
                        if (tile.content) {
                            tile = this.randomTile();
                        }
                        return tile;
                    }
                }, {
                    key: "getCoordinatePixel",
                    value: function getCoordinatePixel(coordinate) {
                        return coordinate * this.tileSize;
                    }
                }, {
                    key: "drawTile",
                    value: function drawTile(tile) {
                        this.ctx.fillStyle = tile.content.color;
                        this.ctx.fillRect(this.getCoordinatePixel(tile.coordinates.x), this.getCoordinatePixel(tile.coordinates.y), this.tileSize, this.tileSize);
                    }
                }, {
                    key: "getTileByCoordinates",
                    value: function getTileByCoordinates(coordinates) {
                        return this.tiles.find(function (tile) {
                            return tile.coordinates.Equals(coordinates);
                        });
                    }
                }, {
                    key: "getTileByContentType",
                    value: function getTileByContentType(contentType) {
                        return this.tiles.find(function (tile) {
                            return tile.content && tile.content.type === contentType;
                        });
                    }
                }, {
                    key: "generateFood",
                    value: function generateFood() {
                        var tile = this.randomTile();
                        tile.content = new entity_1.Food(tile.coordinates);
                    }
                }, {
                    key: "drawGrid",
                    value: function drawGrid() {
                        var _this2 = this;

                        this.canvas.width = this.width * this.tileSize;
                        this.canvas.height = this.height * this.tileSize;
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        var playerTile = this.getTileByContentType(entity_1.EntityType.Player);
                        if (playerTile) {
                            this.drawTile(playerTile);
                        }
                        this.tiles.forEach(function (tile) {
                            if (!tile.content) {
                                return;
                            }
                            if (tile.content.type == entity_1.EntityType.Segment || tile.content.type == entity_1.EntityType.Food) {
                                _this2.drawTile(tile);
                            }
                        });
                    }
                }]);

                return Grid;
            }();
            exports_3("Grid", Grid);
        }
    };
});
System.register("grid/index", ["grid/grid-coordinates", "grid/grid", "grid/grid-tile"], function (exports_4, context_4) {
    "use strict";

    var __moduleName = context_4 && context_4.id;
    return {
        setters: [function (grid_coordinates_2_1) {
            exports_4({
                "GridCoordinates": grid_coordinates_2_1["GridCoordinates"]
            });
        }, function (grid_1_1) {
            exports_4({
                "Grid": grid_1_1["Grid"]
            });
        }, function (grid_tile_2_1) {
            exports_4({
                "GridTile": grid_tile_2_1["GridTile"]
            });
        }],
        execute: function execute() {}
    };
});
System.register("entity/entity-type.enum", [], function (exports_5, context_5) {
    "use strict";

    var EntityType;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function execute() {
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
        execute: function execute() {}
    };
});
System.register("entity/food", ["grid/index", "entity/entity-type.enum"], function (exports_7, context_7) {
    "use strict";

    var grid_2, entity_type_enum_1, Food;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [function (grid_2_1) {
            grid_2 = grid_2_1;
        }, function (entity_type_enum_1_1) {
            entity_type_enum_1 = entity_type_enum_1_1;
        }],
        execute: function execute() {
            Food = function Food() {
                var coordinates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new grid_2.GridCoordinates();

                _classCallCheck(this, Food);

                this.coordinates = coordinates;
                this.type = entity_type_enum_1.EntityType.Food;
                this.color = "#999999";
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
        setters: [function (grid_3_1) {
            grid_3 = grid_3_1;
        }, function (entity_type_enum_2_1) {
            entity_type_enum_2 = entity_type_enum_2_1;
        }],
        execute: function execute() {
            Player = function () {
                function Player() {
                    var coordinates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new grid_3.GridCoordinates();

                    _classCallCheck(this, Player);

                    this.coordinates = coordinates;
                    this.type = entity_type_enum_2.EntityType.Player;
                    this.color = "#333333";
                    this.segmentCoordinates = new Array();
                }

                _createClass(Player, [{
                    key: "addSegment",
                    value: function addSegment(coordinates) {
                        this.segmentCoordinates.unshift(coordinates);
                    }
                }]);

                return Player;
            }();
            exports_8("Player", Player);
        }
    };
});
System.register("entity/segment", ["grid/index", "entity/entity-type.enum"], function (exports_9, context_9) {
    "use strict";

    var grid_4, entity_type_enum_3, Segment;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [function (grid_4_1) {
            grid_4 = grid_4_1;
        }, function (entity_type_enum_3_1) {
            entity_type_enum_3 = entity_type_enum_3_1;
        }],
        execute: function execute() {
            Segment = function Segment() {
                var coordinates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new grid_4.GridCoordinates();

                _classCallCheck(this, Segment);

                this.coordinates = coordinates;
                this.type = entity_type_enum_3.EntityType.Segment;
                this.color = "#666666";
            };
            exports_9("Segment", Segment);
        }
    };
});
System.register("entity/index", ["entity/entity-type.enum", "entity/food", "entity/player", "entity/segment"], function (exports_10, context_10) {
    "use strict";

    var __moduleName = context_10 && context_10.id;
    return {
        setters: [function (entity_type_enum_4_1) {
            exports_10({
                "EntityType": entity_type_enum_4_1["EntityType"]
            });
        }, function (food_1_1) {
            exports_10({
                "Food": food_1_1["Food"]
            });
        }, function (player_1_1) {
            exports_10({
                "Player": player_1_1["Player"]
            });
        }, function (segment_1_1) {
            exports_10({
                "Segment": segment_1_1["Segment"]
            });
        }],
        execute: function execute() {}
    };
});
System.register("emitters", [], function (exports_11, context_11) {
    "use strict";

    var Emitter, TypedEmitter;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function execute() {
            Emitter = function () {
                function Emitter() {
                    var _this3 = this;

                    _classCallCheck(this, Emitter);

                    this.listeners = [];
                    this.triggers = [];
                    this.on = function (listener) {
                        _this3.listeners.push(listener);
                        return { dispose: function dispose() {
                                return _this3.off(listener);
                            } };
                    };
                    this.once = function (listener) {
                        return _this3.triggers.push(listener);
                    };
                    this.off = function (listener) {
                        var index = _this3.listeners.indexOf(listener);
                        if (index > -1) {
                            _this3.listeners.splice(index, 1);
                        }
                    };
                    this.emit = function () {
                        _this3.listeners.forEach(function (listener) {
                            return listener();
                        });
                        for (var i = _this3.triggers.length; i > 0; i--) {
                            _this3.triggers.pop()();
                        }
                    };
                }

                _createClass(Emitter, [{
                    key: "clear",
                    value: function clear() {
                        this.listeners = [];
                        this.triggers = [];
                    }
                }]);

                return Emitter;
            }();
            exports_11("Emitter", Emitter);
            TypedEmitter = function () {
                function TypedEmitter() {
                    var _this4 = this;

                    _classCallCheck(this, TypedEmitter);

                    this.listeners = [];
                    this.triggers = [];
                    this.on = function (listener) {
                        _this4.listeners.push(listener);
                        return { dispose: function dispose() {
                                return _this4.off(listener);
                            } };
                    };
                    this.once = function (listener) {
                        return _this4.triggers.push(listener);
                    };
                    this.off = function (listener) {
                        var index = _this4.listeners.indexOf(listener);
                        if (index > -1) {
                            _this4.listeners.splice(index, 1);
                        }
                    };
                    this.emit = function (event) {
                        _this4.listeners.forEach(function (listener) {
                            return listener(event);
                        });
                        for (var i = _this4.triggers.length; i > 0; i--) {
                            _this4.triggers.pop()(event);
                        }
                    };
                }

                _createClass(TypedEmitter, [{
                    key: "clear",
                    value: function clear() {
                        this.listeners = [];
                        this.triggers = [];
                    }
                }]);

                return TypedEmitter;
            }();
            exports_11("TypedEmitter", TypedEmitter);
        }
    };
});
System.register("input.service", ["emitters", "grid/index"], function (exports_12, context_12) {
    "use strict";

    var emitters_1, grid_5, InputService;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [function (emitters_1_1) {
            emitters_1 = emitters_1_1;
        }, function (grid_5_1) {
            grid_5 = grid_5_1;
        }],
        execute: function execute() {
            InputService = function () {
                function InputService() {
                    var _this5 = this;

                    _classCallCheck(this, InputService);

                    this.onMove = new emitters_1.TypedEmitter();
                    this.onSpace = new emitters_1.Emitter();
                    document.addEventListener('keydown', function ($event) {
                        return _this5.keyboardInput($event);
                    });
                }

                _createClass(InputService, [{
                    key: "keyboardInput",
                    value: function keyboardInput(event) {
                        if (event.keyCode === 38) {
                            // up
                            this.onMove.emit(new grid_5.GridCoordinates(0, -1));
                        } else if (event.keyCode === 40) {
                            // down
                            this.onMove.emit(new grid_5.GridCoordinates(0, 1));
                        } else if (event.keyCode === 37) {
                            // left
                            this.onMove.emit(new grid_5.GridCoordinates(-1, 0));
                        } else if (event.keyCode === 39) {
                            // right
                            this.onMove.emit(new grid_5.GridCoordinates(1, 0));
                        } else if (event.keyCode === 32) {
                            // space
                            this.onSpace.emit();
                        }
                    }
                }, {
                    key: "buttonInput",
                    value: function buttonInput(input) {
                        if (input === 'up') {
                            this.onMove.emit(new grid_5.GridCoordinates(0, -1));
                        } else if (input === "down") {
                            this.onMove.emit(new grid_5.GridCoordinates(0, 1));
                        } else if (input === "left") {
                            this.onMove.emit(new grid_5.GridCoordinates(-1, 0));
                        } else if (input === "right") {
                            this.onMove.emit(new grid_5.GridCoordinates(1, 0));
                        } else if (input === "space") {
                            this.onSpace.emit();
                        }
                    }
                }]);

                return InputService;
            }();
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
        execute: function execute() {}
    };
});
System.register("app", ["entity/index", "emitters", "grid/index", "input.service", "window"], function (exports_14, context_14) {
    "use strict";

    var entity_2, emitters_2, grid_6, input_service_1, window_1, App;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [function (entity_2_1) {
            entity_2 = entity_2_1;
        }, function (emitters_2_1) {
            emitters_2 = emitters_2_1;
        }, function (grid_6_1) {
            grid_6 = grid_6_1;
        }, function (input_service_1_1) {
            input_service_1 = input_service_1_1;
        }, function (window_1_1) {
            window_1 = window_1_1;
        }],
        execute: function execute() {
            /**
            * The main app for the page.
            * @export
            */
            App = function () {
                /** Creates and initializes a new instance of App on the Window */
                function App() {
                    var _this6 = this;

                    _classCallCheck(this, App);

                    this.onScore = new emitters_2.Emitter();
                    this.startInstructions = "PRESS SPACE TO START";
                    this.playInstructions = "USE THE ARROW KEYS";
                    this.gameOverInstructions = "PRESS SPACE TO RESTART";
                    this.buttonClick = function (button) {
                        return _this6.input.buttonInput(button);
                    };
                    window_1.nativeWindow().App = this;
                    this.initialize();
                    setTimeout(function () {
                        return document.querySelector('main[role="main"]').classList.remove('hidden');
                    }, 0);
                }

                _createClass(App, [{
                    key: "drawText",
                    value: function drawText(size, text, y) {
                        this.ctx.font = "bold " + size + "px Nokian";
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillStyle = '#000000';
                        this.ctx.fillText(text, this.canvas.width / 2, y, this.canvas.width);
                    }
                }, {
                    key: "startGame",
                    value: function startGame() {
                        var _this7 = this;

                        this.input.onMove.once(function (coordinates) {
                            _this7.nextCoordinates = coordinates;
                            _this7.moveCoordinates = _this7.nextCoordinates;
                            _this7.startGameLoop();
                            _this7.input.onMove.on(function (coordinates) {
                                return _this7.nextCoordinates = coordinates;
                            });
                        });
                        this.score = 0;
                        this.scoreElement.textContent = "" + this.score;
                        this.grid = new grid_6.Grid(this.canvas, this.ctx);
                        this.player = new entity_2.Player(new grid_6.GridCoordinates(Math.floor(this.grid.width / 2), Math.floor(this.grid.width / 2)));
                        this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;
                        this.grid.generateFood();
                        this.grid.drawGrid();
                        this.drawText(10, this.playInstructions, this.canvas.height / 2 + 25);
                    }
                }, {
                    key: "newGame",
                    value: function newGame() {
                        var _this8 = this;

                        this.grid = new grid_6.Grid(this.canvas, this.ctx);
                        this.onScore.on(function () {
                            _this8.score++;
                            _this8.scoreElement.textContent = "" + _this8.score;
                        });
                        this.input.onSpace.once(function () {
                            return _this8.startGame();
                        });
                        this.grid.drawGrid();
                        this.drawText(10, this.startInstructions, this.canvas.height / 2);
                    }
                }, {
                    key: "initialize",
                    value: function initialize() {
                        var _this9 = this;

                        this.input = new input_service_1.InputService();
                        this.nextCoordinates = new grid_6.GridCoordinates();
                        this.moveCoordinates = this.nextCoordinates;
                        document.getElementById('up').addEventListener('click', function () {
                            return _this9.buttonClick('up');
                        });
                        document.getElementById('down').addEventListener('click', function () {
                            return _this9.buttonClick('down');
                        });
                        document.getElementById('left').addEventListener('click', function () {
                            return _this9.buttonClick('left');
                        });
                        document.getElementById('right').addEventListener('click', function () {
                            return _this9.buttonClick('right');
                        });
                        document.getElementById('space').addEventListener('click', function () {
                            return _this9.buttonClick('space');
                        });
                        this.canvas = document.getElementById('canvas');
                        this.ctx = this.canvas.getContext('2d');
                        this.scoreElement = document.getElementById('score');
                        this.newGame();
                    }
                }, {
                    key: "checkMovement",
                    value: function checkMovement() {
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
                }, {
                    key: "calculateCollision",
                    value: function calculateCollision(coordinates) {
                        if (coordinates.x < 0 || coordinates.x > this.grid.width - 1) {
                            return entity_2.EntityType.Wall;
                        }
                        if (coordinates.y < 0 || coordinates.y > this.grid.height - 1) {
                            return entity_2.EntityType.Wall;
                        }
                        var other = this.grid.getTileByCoordinates(coordinates);
                        if (!other.content) {
                            return null;
                        }
                        return other.content.type;
                    }
                }, {
                    key: "movePlayer",
                    value: function movePlayer(coordinates) {
                        var oldCoordinates = this.player.coordinates;
                        this.grid.getTileByCoordinates(oldCoordinates).content = null;
                        this.player.coordinates = coordinates;
                        this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;
                        if (this.player.segmentCoordinates.length) {
                            this.grid.getTileByCoordinates(this.player.segmentCoordinates.pop()).content = null;
                            this.grid.getTileByCoordinates(oldCoordinates).content = new entity_2.Segment(oldCoordinates);
                            this.player.addSegment(oldCoordinates);
                        }
                    }
                }, {
                    key: "gameOver",
                    value: function gameOver() {
                        var _this10 = this;

                        this.drawText(20, 'GAME OVER', this.canvas.height / 2);
                        this.drawText(10, this.gameOverInstructions, this.canvas.height / 2 + 25);
                        clearInterval(this.loop);
                        this.input.onMove.clear();
                        this.input.onSpace.once(function () {
                            return _this10.startGame();
                        });
                    }
                }, {
                    key: "startGameLoop",
                    value: function startGameLoop() {
                        var _this11 = this;

                        this.loop = window_1.nativeWindow().setInterval(function () {
                            _this11.moveCoordinates = _this11.checkMovement();
                            var coordinates = _this11.player.coordinates.Add(_this11.moveCoordinates);
                            var collision = _this11.calculateCollision(coordinates);
                            if (!collision) {
                                _this11.movePlayer(coordinates);
                            }
                            if (collision === entity_2.EntityType.Food) {
                                _this11.movePlayer(coordinates);
                                _this11.player.addSegment(coordinates);
                                _this11.grid.generateFood();
                                _this11.onScore.emit();
                            }
                            if (collision === entity_2.EntityType.Wall || collision === entity_2.EntityType.Segment) {
                                _this11.gameOver();
                                return;
                            }
                            setTimeout(_this11.grid.drawGrid(), 0);
                        }, 100);
                    }
                }]);

                return App;
            }();
            exports_14("App", App);
        }
    };
});
System.register("bootstrap", ["app"], function (exports_15, context_15) {
    "use strict";

    var app_1;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [function (app_1_1) {
            app_1 = app_1_1;
        }],
        execute: function execute() {
            /** Create a new instance of the app to bootstrap the site */
            new app_1.App();
        }
    };
});
//# sourceMappingURL=app.js.map