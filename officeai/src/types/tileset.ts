export interface TileDefinition {
  sheet: string;
  x: number;
  y: number;
  w: number;
  h: number;
  offsetX?: number;
  offsetY?: number;
}

export interface SheetDefinition {
  src: string;
}

export interface TilesetConfig {
  sheets: Record<string, SheetDefinition>;
  tiles: Record<string, TileDefinition>;
}

export interface WhiteboardConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  title: string;
  description: string;
}

export interface RoomGridConfig {
  cols: number;
  rows: number;
  tileSize: number;
  walkable: boolean[][];
  whiteboard: WhiteboardConfig;
}

