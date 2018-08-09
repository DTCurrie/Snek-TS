define("grid/grid-coordinates", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridCoordinates {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
            this.Equals = (other) => (this.x === other.x && this.y === other.y);
            this.Add = (other) => new GridCoordinates(this.x + other.x, this.y + other.y);
        }
    }
    exports.GridCoordinates = GridCoordinates;
});
define("grid/grid-tile", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GridTile {
        constructor(coordinates, content = null) {
            this.coordinates = coordinates;
            this.content = content;
        }
    }
    exports.GridTile = GridTile;
});
define("grid/grid", ["require", "exports", "entity/index", "grid/grid-coordinates", "grid/grid-tile"], function (require, exports, entity_1, grid_coordinates_1, grid_tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Grid {
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
    }
    exports.Grid = Grid;
});
define("grid/index", ["require", "exports", "grid/grid-coordinates", "grid/grid", "grid/grid-tile"], function (require, exports, grid_coordinates_2, grid_1, grid_tile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GridCoordinates = grid_coordinates_2.GridCoordinates;
    exports.Grid = grid_1.Grid;
    exports.GridTile = grid_tile_2.GridTile;
});
define("entity/entity-type.enum", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EntityType;
    (function (EntityType) {
        EntityType[EntityType["Player"] = 0] = "Player";
        EntityType[EntityType["Segment"] = 1] = "Segment";
        EntityType[EntityType["Food"] = 2] = "Food";
        EntityType[EntityType["Wall"] = 3] = "Wall";
    })(EntityType = exports.EntityType || (exports.EntityType = {}));
});
define("entity/entity.interface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("entity/food", ["require", "exports", "grid/index", "entity/entity-type.enum"], function (require, exports, grid_2, entity_type_enum_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Food {
        constructor(coordinates = new grid_2.GridCoordinates()) {
            this.coordinates = coordinates;
            this.type = entity_type_enum_1.EntityType.Food;
            this.color = "#999999";
        }
    }
    exports.Food = Food;
});
define("entity/player", ["require", "exports", "grid/index", "entity/entity-type.enum"], function (require, exports, grid_3, entity_type_enum_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Player {
        constructor(coordinates = new grid_3.GridCoordinates()) {
            this.coordinates = coordinates;
            this.type = entity_type_enum_2.EntityType.Player;
            this.color = "#333333";
            this.segmentCoordinates = new Array();
        }
        addSegment(coordinates) {
            this.segmentCoordinates.unshift(coordinates);
        }
    }
    exports.Player = Player;
});
define("entity/segment", ["require", "exports", "grid/index", "entity/entity-type.enum"], function (require, exports, grid_4, entity_type_enum_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Segment {
        constructor(coordinates = new grid_4.GridCoordinates()) {
            this.coordinates = coordinates;
            this.type = entity_type_enum_3.EntityType.Segment;
            this.color = "#666666";
        }
    }
    exports.Segment = Segment;
});
define("entity/index", ["require", "exports", "entity/entity-type.enum", "entity/food", "entity/player", "entity/segment"], function (require, exports, entity_type_enum_4, food_1, player_1, segment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EntityType = entity_type_enum_4.EntityType;
    exports.Food = food_1.Food;
    exports.Player = player_1.Player;
    exports.Segment = segment_1.Segment;
});
define("emitters", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Emitter {
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
    }
    exports.Emitter = Emitter;
    class TypedEmitter {
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
    }
    exports.TypedEmitter = TypedEmitter;
});
define("input.service", ["require", "exports", "emitters", "grid/index"], function (require, exports, emitters_1, grid_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InputService {
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
    }
    exports.InputService = InputService;
});
define("window", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function nativeWindow() {
        return window;
    }
    exports.nativeWindow = nativeWindow;
});
define("app", ["require", "exports", "entity/index", "emitters", "grid/index", "input.service", "window"], function (require, exports, entity_2, emitters_2, grid_6, input_service_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
    * The main app for the page.
    * @export
    */
    class App {
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
    }
    exports.App = App;
});
define("bootstrap", ["require", "exports", "app"], function (require, exports, app_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function bootstrapApp() { new app_1.App(); }
    require(["./app"], (app) => bootstrapApp());
});
