"use client";

import React, { useState } from "react";

export default function ExplorerPage() {
  const [selectedSheet, setSelectedSheet] = useState("structures");
  const [hoveredTile, setHoveredTile] = useState<{ c: number; r: number } | null>(null);

  const sheets = {
    structures: {
      name: "Wall/Floor/Door/Windows",
      src: "/assets/tileset-wall-floor-door-windows.png",
    },
    furniture: {
      name: "Chair/Table (Standard)",
      src: "/assets/tileset-chair-table.png",
    },
    cyber_furniture: {
      name: "Chair/Table (Cyber Theme)",
      src: "/assets/tileset-chair-table-cyber-theme.png",
    },
  };

  const currentSheet = sheets[selectedSheet as keyof typeof sheets];

  return (
    <div className="p-8 bg-zinc-900 min-h-screen text-zinc-100 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Tileset Asset Atlas Explorer
        </h1>
        <div className="flex gap-4">
          {Object.entries(sheets).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedSheet(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSheet === key
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {value.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="relative border border-zinc-700 bg-zinc-950 p-4 rounded-xl overflow-auto inline-block">
          <div className="relative" style={{ width: "1024px", height: "1024px" }}>
            {/* Base tileset image */}
            <img
              src={currentSheet.src}
              alt={currentSheet.name}
              className="absolute top-0 left-0 w-[1024px] h-[1024px] pointer-events-none select-none"
            />
            {/* Grid overlay */}
            <div 
              className="absolute top-0 left-0 w-[1024px] h-[1024px] grid"
              style={{
                gridTemplateColumns: "repeat(16, 64px)",
                gridTemplateRows: "repeat(16, 64px)"
              }}
            >
              {Array.from({ length: 256 }).map((_, idx) => {
                const c = idx % 16;
                const r = Math.floor(idx / 16);
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredTile({ c, r })}
                    onMouseLeave={() => setHoveredTile(null)}
                    className="relative w-16 h-16 border border-red-500/20 hover:border-cyan-400 hover:bg-cyan-400/20 cursor-crosshair transition-all flex items-start p-1"
                  >
                    <span className="text-[9px] font-mono text-white/50 bg-black/60 px-1 rounded">
                      {c},{r}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md bg-zinc-800 border border-zinc-700 p-6 rounded-xl self-start">
          <h2 className="text-xl font-bold mb-4">Tile Information</h2>
          {hoveredTile ? (
            <div className="space-y-4">
              <div>
                <span className="text-zinc-400 text-sm">Grid Coordinate:</span>
                <p className="text-2xl font-mono text-cyan-400">
                  Col: {hoveredTile.c}, Row: {hoveredTile.r}
                </p>
              </div>
              <div>
                <span className="text-zinc-400 text-sm">Pixel Coordinates (64x64 Grid):</span>
                <p className="text-lg font-mono text-zinc-200">
                  X: {hoveredTile.c * 64} px
                  <br />
                  Y: {hoveredTile.r * 64} px
                  <br />
                  W: 64 px
                  <br />
                  H: 64 px
                </p>
              </div>
              <div className="border-t border-zinc-700 pt-4">
                <span className="text-zinc-400 text-sm">JSON format helper:</span>
                <pre className="mt-2 p-3 bg-zinc-950 rounded text-xs font-mono text-emerald-400 overflow-x-auto">
                  {JSON.stringify(
                    {
                      sheet: selectedSheet,
                      x: hoveredTile.c * 64,
                      y: hoveredTile.r * 64,
                      w: 64,
                      h: 64,
                      offsetX: 0,
                      offsetY: 0,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 italic">Hover over any grid tile to see coordinate info.</p>
          )}
        </div>
      </div>
    </div>
  );
}
