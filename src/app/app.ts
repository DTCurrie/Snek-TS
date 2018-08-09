import { EntityType, Player, Segment } from 'entity';
import { Emitter } from 'emitters';
import { Grid, GridCoordinates } from 'grid';
import { InputService } from 'input.service';
import { nativeWindow } from 'window';

/**
* The main app for the page.
* @export
*/
export class App {
  private input: InputService;
  private nextCoordinates: GridCoordinates;
  private moveCoordinates: GridCoordinates;

  private loop: number;

  private onScore: Emitter = new Emitter();

  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public scoreElement: HTMLElement;
  public grid: Grid;
  public player: Player;

  public score: number;
  public startInstructions = "PRESS SPACE TO START";
  public playInstructions = "USE THE ARROW KEYS";
  public gameOverInstructions = "PRESS SPACE TO RESTART";

  /** Creates and initializes a new instance of App on the Window */
  constructor() {
    nativeWindow().App = this;
    this.initialize();
    setTimeout(() => document.querySelector('main[role="main"]').classList.remove('hidden'), 0);
  }

  private drawText(size: number, text: string, y: number): void {
    this.ctx.font = `bold ${size}px Nokian`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText(text, this.canvas.width / 2, y, this.canvas.width);
  }

  private startGame(): void {
    this.input.onMove.once((coordinates: GridCoordinates) => {
      this.nextCoordinates = coordinates;
      this.moveCoordinates = this.nextCoordinates;
      this.startGameLoop();
      this.input.onMove.on((coordinates: GridCoordinates) => this.nextCoordinates = coordinates);
    });

    this.score = 0;
    this.scoreElement.textContent = `${this.score}`;

    this.grid = new Grid(this.canvas, this.ctx);
    this.player = new Player(new GridCoordinates(Math.floor(this.grid.width / 2), Math.floor(this.grid.width / 2)));
    this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;
    this.grid.generateFood();
    this.grid.drawGrid();

    this.drawText(10, this.playInstructions, this.canvas.height / 2 + 25);
  }

  private newGame(): void {
    this.grid = new Grid(this.canvas, this.ctx);

    this.onScore.on(() => {
      this.score++;
      this.scoreElement.textContent = `${this.score}`;
    });

    this.input.onSpace.once(() => this.startGame());
    this.grid.drawGrid();
    this.drawText(10, this.startInstructions, this.canvas.height / 2);
  }

  private initialize(): void {
    this.input = new InputService();
    this.nextCoordinates = new GridCoordinates();
    this.moveCoordinates = this.nextCoordinates;

    document.getElementById('up').addEventListener('click', () => this.buttonClick('up'));
    document.getElementById('down').addEventListener('click', () => this.buttonClick('down'));
    document.getElementById('left').addEventListener('click', () => this.buttonClick('left'));
    document.getElementById('right').addEventListener('click', () => this.buttonClick('right'));
    document.getElementById('space').addEventListener('click', () => this.buttonClick('space'));

    this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = document.getElementById('score');

    this.newGame();
  }

  private checkMovement(): GridCoordinates {
    if (this.moveCoordinates.x > 0 && this.nextCoordinates.x < 0) { return this.moveCoordinates; }
    if (this.moveCoordinates.x < 0 && this.nextCoordinates.x > 0) { return this.moveCoordinates; }
    if (this.moveCoordinates.y > 0 && this.nextCoordinates.y < 0) { return this.moveCoordinates; }
    if (this.moveCoordinates.y < 0 && this.nextCoordinates.y > 0) { return this.moveCoordinates; }
    return this.nextCoordinates;
  }

  private calculateCollision(coordinates: GridCoordinates): EntityType | null {
    if (coordinates.x < 0 || coordinates.x > this.grid.width - 1) { return EntityType.Wall; }
    if (coordinates.y < 0 || coordinates.y > this.grid.height - 1) { return EntityType.Wall; }
    const other = this.grid.getTileByCoordinates(coordinates);
    if (!other.content) { return null; }
    return other.content.type;
  }

  private movePlayer(coordinates: GridCoordinates): void {
    const oldCoordinates = this.player.coordinates;
    this.grid.getTileByCoordinates(oldCoordinates).content = null;
    this.player.coordinates = coordinates;
    this.grid.getTileByCoordinates(this.player.coordinates).content = this.player;

    if (this.player.segmentCoordinates.length) {
      this.grid.getTileByCoordinates(this.player.segmentCoordinates.pop()).content = null;
      this.grid.getTileByCoordinates(oldCoordinates).content = new Segment(oldCoordinates);
      this.player.addSegment(oldCoordinates);
    }
  }

  private gameOver(): void {
    this.drawText(20, 'GAME OVER', this.canvas.height / 2);
    this.drawText(10, this.gameOverInstructions, this.canvas.height / 2 + 25);

    clearInterval(this.loop);

    this.input.onMove.clear();
    this.input.onSpace.once(() => this.startGame());
  }

  private startGameLoop(): void {
    this.loop = nativeWindow().setInterval(() => {
      this.moveCoordinates = this.checkMovement();
      const coordinates = this.player.coordinates.Add(this.moveCoordinates);
      const collision = this.calculateCollision(coordinates);

      if (!collision) { this.movePlayer(coordinates); }

      if (collision === EntityType.Food) {
        this.movePlayer(coordinates);
        this.player.addSegment(coordinates);
        this.grid.generateFood();
        this.onScore.emit();
      }

      if (collision === EntityType.Wall || collision === EntityType.Segment) {
        this.gameOver();
        return;
      }

      setTimeout(this.grid.drawGrid(), 0);
    }, 100);
  }

  public buttonClick = (button: string) => this.input.buttonInput(button);
}
