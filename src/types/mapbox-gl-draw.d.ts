declare module "@mapbox/mapbox-gl-draw" {
  import type { Map } from "mapbox-gl";

  interface MapboxDrawOptions {
    displayControls?: boolean;
    controls?: Record<string, boolean>;
    defaultMode?: string;
    modes?: Record<string, unknown>;
  }

  interface IControl {
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
  }

  export default class MapboxDraw implements IControl {
    constructor(options?: MapboxDrawOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    addControl(map?: Map): Map;
    removeControl(map?: Map): Map;
    getAll(): unknown;
    set(features: unknown): void;
    add(geojson: unknown): string[];
    get(featureId: string): unknown;
    getSelected(): unknown;
    getSelectedIds(): string[];
    delete(ids: string[]): void;
    deleteAll(): void;
    changeMode(mode: string, options?: Record<string, unknown>): void;
    on(type: string, handler: () => void): void;
    off(type: string, handler: () => void): void;
    static modes: Record<string, unknown>;
  }
}
