"use client";

import React, { useEffect, useRef, useState } from "react";
import gridConfigRaw from "../../../data/room-1-grid.json";
import { RoomGridConfig } from "@/types/tileset";

const gridConfig = gridConfigRaw as RoomGridConfig;

export default function Room1() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgImageLoaded, setBgImageLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  // Native dimensions of TXjh2o.png
  const imageWidth = 1254;
  const imageHeight = 1254;
  const tileSize = gridConfig.tileSize; // 64

  // Player position states (in grid coordinates)
  const playerGridXRef = useRef<number>(9); // Start in front of the door
  const playerGridYRef = useRef<number>(10);

  // Interpolated visual positions for smooth movement (lerping)
  const playerVisualXRef = useRef<number>(9 * 64);
  const playerVisualYRef = useRef<number>(10 * 64);

  // Background image ref
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Hover detection ref
  const isHoveringWhiteboardRef = useRef<boolean>(false);

  // Key tracking
  const keysPressedRef = useRef<Record<string, boolean>>({});

  // Frame count for animation cycles (floating effect)
  const animFrameCountRef = useRef<number>(0);

  // Preload background image
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = "/assets/TXjh2o.png";
    img.onload = () => {
      if (!active) return;
      bgImageRef.current = img;
      setBgImageLoaded(true);
    };
    img.onerror = () => {
      if (!active) return;
      setLoadingError("Failed to load background image: /assets/TXjh2o.png");
    };

    return () => {
      active = false;
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Prevent browser scrolling with arrow keys / space
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key)) {
        e.preventDefault();
      }

      keysPressedRef.current[key] = true;
      keysPressedRef.current[e.key] = true; // Support original case
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current[key] = false;
      keysPressedRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Game loop
  useEffect(() => {
    if (!bgImageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animationFrameId: number;
    let moveCooldown = 0;

    const gameLoop = () => {
      animFrameCountRef.current++;

      // Handle player movement input with grid-alignment cooldown
      if (moveCooldown > 0) {
        moveCooldown--;
      } else {
        let dx = 0;
        let dy = 0;

        if (keysPressedRef.current["w"] || keysPressedRef.current["arrowup"]) {
          dy = -1;
        } else if (keysPressedRef.current["s"] || keysPressedRef.current["arrowdown"]) {
          dy = 1;
        } else if (keysPressedRef.current["a"] || keysPressedRef.current["arrowleft"]) {
          dx = -1;
        } else if (keysPressedRef.current["d"] || keysPressedRef.current["arrowright"]) {
          dx = 1;
        }

        if (dx !== 0 || dy !== 0) {
          const nextX = playerGridXRef.current + dx;
          const nextY = playerGridYRef.current + dy;

          // Boundary checks and walkability checks
          if (
            nextX >= 0 &&
            nextX < gridConfig.cols &&
            nextY >= 0 &&
            nextY < gridConfig.rows
          ) {
            if (gridConfig.walkable[nextY][nextX]) {
              playerGridXRef.current = nextX;
              playerGridYRef.current = nextY;
              moveCooldown = 12; // cooldown frames between moves
            }
          }
        }
      }

      // Smooth position LERP (Linear Interpolation)
      const targetVisualX = playerGridXRef.current * tileSize;
      const targetVisualY = playerGridYRef.current * tileSize;

      playerVisualXRef.current += (targetVisualX - playerVisualXRef.current) * 0.18;
      playerVisualYRef.current += (targetVisualY - playerVisualYRef.current) * 0.18;

      // --- RENDERING ---
      ctx.clearRect(0, 0, imageWidth, imageHeight);

      // Draw background room image
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, imageWidth, imageHeight);
      }

      // Render collision grid if enabled (for debugging/visual validation)
      if (showGrid) {
        for (let r = 0; r < gridConfig.rows; r++) {
          for (let c = 0; c < gridConfig.cols; c++) {
            const x = c * tileSize;
            const y = r * tileSize;
            
            // Draw grid outline
            ctx.strokeStyle = "rgba(255, 0, 0, 0.15)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, tileSize, tileSize);

            // Red tint for obstacles, green tint for walkable
            if (!gridConfig.walkable[r][c]) {
              ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
              ctx.fillRect(x, y, tileSize, tileSize);
            } else {
              ctx.fillStyle = "rgba(34, 197, 94, 0.05)";
              ctx.fillRect(x, y, tileSize, tileSize);
            }
          }
        }

        // Highlight Whiteboard Bounding Box
        const wb = gridConfig.whiteboard;
        ctx.strokeStyle = "rgba(6, 182, 212, 0.8)";
        ctx.lineWidth = 3;
        ctx.strokeRect(wb.x1, wb.y1, wb.x2 - wb.x1, wb.y2 - wb.y1);
        ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
        ctx.fillRect(wb.x1, wb.y1, wb.x2 - wb.x1, wb.y2 - wb.y1);
      }

      // Draw custom player avatar (floating retro office bot)
      const px = playerVisualXRef.current + tileSize / 2;
      const py = playerVisualYRef.current + tileSize / 2;
      const floatOffset = Math.sin(animFrameCountRef.current * 0.08) * 4;

      // 1. Draw avatar shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(px, py + 22, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw robot body
      const botY = py + floatOffset;

      // Glowing aura
      const aura = ctx.createRadialGradient(px, botY, 5, px, botY, 25);
      aura.addColorStop(0, "rgba(6, 182, 212, 0.4)");
      aura.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(px, botY, 25, 0, Math.PI * 2);
      ctx.fill();

      // Core body (rounded cube)
      ctx.fillStyle = "#1e293b"; // Slate-800
      ctx.strokeStyle = "#0891b2"; // Cyan-600
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.roundRect(px - 16, botY - 20, 32, 36, 8);
      ctx.fill();
      ctx.stroke();

      // Face display screen
      ctx.fillStyle = "#0f172a"; // Slate-900
      ctx.beginPath();
      ctx.roundRect(px - 11, botY - 14, 22, 16, 4);
      ctx.fill();

      // Eyes (glowing cyan orbs)
      ctx.fillStyle = "#22d3ee"; // Cyan-400
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(px - 5, botY - 6, 2.5, 0, Math.PI * 2);
      ctx.arc(px + 5, botY - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadows
      ctx.shadowBlur = 0;

      // Antenna
      ctx.strokeStyle = "#0891b2";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, botY - 20);
      ctx.lineTo(px, botY - 28);
      ctx.stroke();

      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(px, botY - 29, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [bgImageLoaded, showGrid]);

  // Handle canvas clicks & mouse movement for interactive TodoList board
  const getMouseCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    // Scale client mouse coordinates to the logical 1254x1254 space
    const x = ((e.clientX - rect.left) / rect.width) * imageWidth;
    const y = ((e.clientY - rect.top) / rect.height) * imageHeight;
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoords(e);
    if (!coords) return;

    const wb = gridConfig.whiteboard;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if mouse is within the whiteboard box
    const inBox =
      coords.x >= wb.x1 && coords.x <= wb.x2 && coords.y >= wb.y1 && coords.y <= wb.y2;

    if (inBox) {
      if (!isHoveringWhiteboardRef.current) {
        isHoveringWhiteboardRef.current = true;
        canvas.style.cursor = "pointer";
      }
    } else {
      if (isHoveringWhiteboardRef.current) {
        isHoveringWhiteboardRef.current = false;
        canvas.style.cursor = "default";
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoords(e);
    if (!coords) return;

    const wb = gridConfig.whiteboard;
    const inBox =
      coords.x >= wb.x1 && coords.x <= wb.x2 && coords.y >= wb.y1 && coords.y <= wb.y2;

    if (inBox) {
      alert(`📋 ${wb.title}\n\n${wb.description}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      {/* Control Panel */}
      <div className="flex items-center justify-between w-full p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl backdrop-blur-md">
        <div>
          <h3 className="font-bold text-zinc-100 text-lg">Room 1: Office Simulator</h3>
          <p className="text-cyan-400 text-xs font-mono mt-0.5">Use WASD / Arrow Keys to walk around</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-zinc-400 font-medium cursor-pointer hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="w-3.5 h-3.5 accent-cyan-500 rounded border-zinc-800 bg-zinc-900 text-zinc-950 focus:ring-cyan-500"
            />
            Show Collision Grid
          </label>
        </div>
      </div>

      {/* Screen Container */}
      <div className="relative w-full aspect-[1/1] max-w-[640px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center p-1">
        {loadingError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 text-red-400 p-6 text-center text-sm font-medium z-10">
            {loadingError}
          </div>
        )}

        {!bgImageLoaded && !loadingError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 gap-3 z-10">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-zinc-400 text-xs font-mono">Loading simulator...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={imageWidth}
          height={imageHeight}
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain select-none"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Stats/Debug indicators */}
      <div className="flex gap-6 justify-center text-[10px] font-mono text-zinc-500">
        <span>GRID: {gridConfig.cols}x{gridConfig.rows} (64px)</span>
        <span>SIZE: {imageWidth}x{imageHeight}px</span>
        <span>BOARD: Click whiteboard for TODO List</span>
        <span>UPS: 60hz (RAF)</span>
      </div>
    </div>
  );
}
