export interface Listener { (): void; }
export interface TypedListener<T> { (event: T): any; }

export interface Disposable { dispose(): void; }

export class EventEmitter {
  public listeners: Listener[] = [];
  public triggers: Listener[] = [];

  public clear(): void {
    this.listeners = [];
    this.triggers = [];
  }

  public on = (listener: Listener): Disposable => {
    this.listeners.push(listener);
    return { dispose: () => this.off(listener) };
  }

  public once = (listener: Listener): number => this.triggers.push(listener);

  public off = (listener: Listener): void => {
    const index = this.listeners.indexOf(listener);
    if (index > -1) { this.listeners.splice(index, 1); }
  }

  public emit = (): void => {
    this.listeners.forEach((listener) => listener());
    for (let i = this.triggers.length; i > 0; i--) { this.triggers.pop()(); }
  };
}

export class TypedEventEmitter<T>  {
  public listeners: TypedListener<T>[] = [];
  public triggers: TypedListener<T>[] = [];

  public clear(): void {
    this.listeners = [];
    this.triggers = [];
  }

  public on = (listener: TypedListener<T>): Disposable => {
    this.listeners.push(listener);
    return { dispose: () => this.off(listener) };
  }

  public once = (listener: TypedListener<T>): number => this.triggers.push(listener);

  public off = (listener: TypedListener<T>): void => {
    const index = this.listeners.indexOf(listener);
    if (index > -1) { this.listeners.splice(index, 1); }
  }

  public emit = (event: T): void => {
    this.listeners.forEach((listener: TypedListener<T>) => listener(event));
    for (let i = this.triggers.length; i > 0; i--) { this.triggers.pop()(event); }
  };
}
