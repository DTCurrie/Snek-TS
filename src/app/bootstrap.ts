import { App } from 'app';

declare function require(moduleNames: string[], onLoad: (...args: any[]) => void): void;
function bootstrapApp(): void { new App(); }
require(["./app"], (app: typeof App) => bootstrapApp());
