"use client";
import { useMemo } from "react";
import * as THREE from "three";

export interface BuildingConfig {
  width: number;      // feet (x-axis)
  length: number;     // feet (z-axis)
  wallHeight: number;  // feet (y-axis)
  roofPitch: number;   // rise per 12 run (e.g. 4:12)
  wallColor: string;
  roofColor: string;
  trimColor: string;
  windows: { wall: "front" | "back" | "left" | "right"; position: number }[];
  manDoors: { wall: "front" | "back" | "left" | "right"; position: number }[];
  garageDoors: { wall: "front" | "back" | "left" | "right"; position: number; width: number; height: number }[];
  wainscotEnabled: boolean;
  wainscotColor: string;
  wainscotHeight: number;
}

const SCALE = 0.1; // 1 foot = 0.1 units in scene

function CorrugatedMaterial({ color, side = THREE.FrontSide }: { color: string; side?: THREE.Side }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.6}
      metalness={0.4}
      side={side}
    />
  );
}

function WallPanel({
  position,
  size,
  rotation,
  color,
  cutouts = [],
}: {
  position: [number, number, number];
  size: [number, number];
  rotation?: [number, number, number];
  color: string;
  cutouts?: { x: number; y: number; w: number; h: number }[];
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const [w, h] = size;
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(w / 2, h);
    shape.lineTo(-w / 2, h);
    shape.lineTo(-w / 2, 0);

    cutouts.forEach((c) => {
      const hole = new THREE.Path();
      hole.moveTo(c.x - c.w / 2, c.y);
      hole.lineTo(c.x + c.w / 2, c.y);
      hole.lineTo(c.x + c.w / 2, c.y + c.h);
      hole.lineTo(c.x - c.w / 2, c.y + c.h);
      hole.lineTo(c.x - c.w / 2, c.y);
      shape.holes.push(hole);
    });

    const geo = new THREE.ShapeGeometry(shape);
    return geo;
  }, [size, cutouts]);

  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]} geometry={geometry}>
      <CorrugatedMaterial color={color} />
    </mesh>
  );
}

function WindowFrame({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const W = 4 * SCALE;
  const H = 3 * SCALE;
  const frameThick = 0.3 * SCALE;
  const frameDepth = 0.5 * SCALE;

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Glass */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[W - frameThick * 2, H - frameThick * 2]} />
        <meshPhysicalMaterial color="#88bbdd" transparent opacity={0.4} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Frame - top */}
      <mesh position={[0, H / 2 - frameThick / 2, 0]}>
        <boxGeometry args={[W, frameThick, frameDepth]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Frame - bottom */}
      <mesh position={[0, -H / 2 + frameThick / 2, 0]}>
        <boxGeometry args={[W, frameThick, frameDepth]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Frame - left */}
      <mesh position={[-W / 2 + frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, H, frameDepth]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Frame - right */}
      <mesh position={[W / 2 - frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, H, frameDepth]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Center mullion - vertical */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[frameThick * 0.6, H - frameThick * 2, frameDepth]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Center mullion - horizontal */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[W - frameThick * 2, frameThick * 0.6, frameDepth]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ManDoorFrame({ position, rotation, trimColor }: { position: [number, number, number]; rotation?: [number, number, number]; trimColor: string }) {
  const W = 3 * SCALE;
  const H = 7 * SCALE;
  const frameThick = 0.3 * SCALE;
  const frameDepth = 0.5 * SCALE;

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Door panel */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[W - frameThick * 2, H - frameThick]} />
        <meshStandardMaterial color="#3a4a5a" roughness={0.7} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Frame - top */}
      <mesh position={[0, H / 2 - frameThick / 2, 0]}>
        <boxGeometry args={[W, frameThick, frameDepth]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Frame - left */}
      <mesh position={[-W / 2 + frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, H, frameDepth]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Frame - right */}
      <mesh position={[W / 2 - frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, H, frameDepth]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Door handle */}
      <mesh position={[W / 2 - frameThick * 3, 0, frameDepth / 2 + 0.02]}>
        <sphereGeometry args={[frameThick * 0.8, 8, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function GarageDoorFrame({
  position,
  rotation,
  width,
  height,
  trimColor,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  trimColor: string;
}) {
  const W = width * SCALE;
  const H = height * SCALE;
  const frameThick = 0.4 * SCALE;
  const frameDepth = 0.6 * SCALE;
  const panelCount = Math.max(2, Math.round(height / 2));

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Door panels (horizontal sections) */}
      {Array.from({ length: panelCount }).map((_, i) => {
        const panelH = (H - frameThick) / panelCount;
        const y = -H / 2 + frameThick / 2 + panelH * i + panelH / 2;
        return (
          <group key={i}>
            <mesh position={[0, y, 0.01]}>
              <planeGeometry args={[W - frameThick * 2, panelH - frameThick * 0.3]} />
              <meshStandardMaterial color="#d0d0d0" roughness={0.5} metalness={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Panel divider line */}
            {i < panelCount - 1 && (
              <mesh position={[0, y + panelH / 2, 0.015]}>
                <boxGeometry args={[W - frameThick * 2, frameThick * 0.2, 0.01]} />
                <meshStandardMaterial color="#999" metalness={0.4} roughness={0.4} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* Frame - top */}
      <mesh position={[0, H / 2 - frameThick / 2, 0]}>
        <boxGeometry args={[W, frameThick, frameDepth]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Frame - left */}
      <mesh position={[-W / 2 + frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, H, frameDepth]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Frame - right */}
      <mesh position={[W / 2 - frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, H, frameDepth]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function GableWall({
  width,
  wallHeight,
  peakHeight,
  position,
  rotation,
  color,
  cutouts,
}: {
  width: number;
  wallHeight: number;
  peakHeight: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  cutouts?: { x: number; y: number; w: number; h: number }[];
}) {
  const geometry = useMemo(() => {
    const w = width * SCALE;
    const h = wallHeight * SCALE;
    const peak = peakHeight * SCALE;

    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(w / 2, h);
    shape.lineTo(0, h + peak);
    shape.lineTo(-w / 2, h);
    shape.lineTo(-w / 2, 0);

    if (cutouts) {
      cutouts.forEach((c) => {
        const hole = new THREE.Path();
        hole.moveTo(c.x - c.w / 2, c.y);
        hole.lineTo(c.x + c.w / 2, c.y);
        hole.lineTo(c.x + c.w / 2, c.y + c.h);
        hole.lineTo(c.x - c.w / 2, c.y + c.h);
        hole.lineTo(c.x - c.w / 2, c.y);
        shape.holes.push(hole);
      });
    }

    return new THREE.ShapeGeometry(shape);
  }, [width, wallHeight, peakHeight, cutouts]);

  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]} geometry={geometry}>
      <CorrugatedMaterial color={color} />
    </mesh>
  );
}

function RoofPanel({
  p0,
  p1,
  p2,
  p3,
  color,
}: {
  p0: [number, number, number]; // bottom-left
  p1: [number, number, number]; // bottom-right
  p2: [number, number, number]; // top-right (ridge)
  p3: [number, number, number]; // top-left (ridge)
  color: string;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      ...p0, ...p1, ...p2,
      ...p0, ...p2, ...p3,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, [p0, p1, p2, p3]);

  return (
    <mesh geometry={geometry}>
      <CorrugatedMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WainscotPanel({
  position,
  size,
  rotation,
  color,
}: {
  position: [number, number, number];
  size: [number, number];
  rotation?: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#2a3a2a" roughness={0.9} />
    </mesh>
  );
}

export default function BuildingModel({ config }: { config: BuildingConfig }) {
  const { width, length, wallHeight, roofPitch, wallColor, roofColor, trimColor } = config;

  const w = width * SCALE;
  const l = length * SCALE;
  const h = wallHeight * SCALE;
  const peakRise = (width / 2) * (roofPitch / 12);
  const peakH = peakRise * SCALE;
  const roofOverhang = 1 * SCALE;

  // Calculate cutouts for each wall
  const getWallCutouts = (wall: "front" | "back" | "left" | "right") => {
    const cutouts: { x: number; y: number; w: number; h: number }[] = [];
    const wallWidth = wall === "left" || wall === "right" ? length : width;

    config.windows
      .filter((win) => win.wall === wall)
      .forEach((win) => {
        const xPos = ((win.position / 100) * wallWidth - wallWidth / 2) * SCALE;
        cutouts.push({ x: xPos, y: (wallHeight / 2 + 1) * SCALE, w: 4 * SCALE, h: 3 * SCALE });
      });

    config.manDoors
      .filter((d) => d.wall === wall)
      .forEach((d) => {
        const xPos = ((d.position / 100) * wallWidth - wallWidth / 2) * SCALE;
        cutouts.push({ x: xPos, y: 3.5 * SCALE, w: 3 * SCALE, h: 7 * SCALE });
      });

    config.garageDoors
      .filter((d) => d.wall === wall)
      .forEach((d) => {
        const xPos = ((d.position / 100) * wallWidth - wallWidth / 2) * SCALE;
        cutouts.push({ x: xPos, y: (d.height / 2) * SCALE, w: d.width * SCALE, h: d.height * SCALE });
      });

    return cutouts;
  };

  // Get 3D placement position and rotation for items on a wall
  const getWallPlacement = (wall: "front" | "back" | "left" | "right", posPercent: number, yCenter: number) => {
    const wallWidth = wall === "left" || wall === "right" ? length : width;
    const localX = ((posPercent / 100) * wallWidth - wallWidth / 2) * SCALE;
    const offset = 0.02;

    switch (wall) {
      case "front":
        return { pos: [localX, yCenter, l / 2 + offset] as [number, number, number], rot: [0, 0, 0] as [number, number, number] };
      case "back":
        return { pos: [-localX, yCenter, -l / 2 - offset] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] };
      case "right":
        return { pos: [w / 2 + offset, yCenter, -localX] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] };
      case "left":
        return { pos: [-w / 2 - offset, yCenter, localX] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number] };
    }
  };

  const frontCutouts = getWallCutouts("front");
  const backCutouts = getWallCutouts("back");
  const leftCutouts = getWallCutouts("left");
  const rightCutouts = getWallCutouts("right");

  return (
    <group>
      <GroundPlane />

      {/* Front gable wall */}
      <GableWall
        width={width}
        wallHeight={wallHeight}
        peakHeight={peakRise}
        position={[0, 0, l / 2]}
        color={wallColor}
        cutouts={frontCutouts}
      />

      {/* Back gable wall */}
      <GableWall
        width={width}
        wallHeight={wallHeight}
        peakHeight={peakRise}
        position={[0, 0, -l / 2]}
        rotation={[0, Math.PI, 0]}
        color={wallColor}
        cutouts={backCutouts}
      />

      {/* Left side wall */}
      <WallPanel
        position={[-w / 2, 0, 0]}
        size={[l, h]}
        rotation={[0, Math.PI / 2, 0]}
        color={wallColor}
        cutouts={leftCutouts}
      />

      {/* Right side wall */}
      <WallPanel
        position={[w / 2, 0, 0]}
        size={[l, h]}
        rotation={[0, -Math.PI / 2, 0]}
        color={wallColor}
        cutouts={rightCutouts}
      />

      {/* Wainscot panels */}
      {config.wainscotEnabled && (
        <>
          <WainscotPanel position={[0, (config.wainscotHeight * SCALE) / 2, l / 2 + 0.01]} size={[w, config.wainscotHeight * SCALE]} color={config.wainscotColor} />
          <WainscotPanel position={[0, (config.wainscotHeight * SCALE) / 2, -l / 2 - 0.01]} size={[w, config.wainscotHeight * SCALE]} rotation={[0, Math.PI, 0]} color={config.wainscotColor} />
          <WainscotPanel position={[-w / 2 - 0.01, (config.wainscotHeight * SCALE) / 2, 0]} size={[l, config.wainscotHeight * SCALE]} rotation={[0, Math.PI / 2, 0]} color={config.wainscotColor} />
          <WainscotPanel position={[w / 2 + 0.01, (config.wainscotHeight * SCALE) / 2, 0]} size={[l, config.wainscotHeight * SCALE]} rotation={[0, -Math.PI / 2, 0]} color={config.wainscotColor} />
        </>
      )}

      {/* Roof - left slope (eave on -x side, ridge at center) */}
      <RoofPanel
        p0={[-w / 2 - roofOverhang * 0.3, h, -l / 2 - roofOverhang]}
        p1={[-w / 2 - roofOverhang * 0.3, h, l / 2 + roofOverhang]}
        p2={[0, h + peakH, l / 2 + roofOverhang]}
        p3={[0, h + peakH, -l / 2 - roofOverhang]}
        color={roofColor}
      />

      {/* Roof - right slope (eave on +x side, ridge at center) */}
      <RoofPanel
        p0={[w / 2 + roofOverhang * 0.3, h, l / 2 + roofOverhang]}
        p1={[w / 2 + roofOverhang * 0.3, h, -l / 2 - roofOverhang]}
        p2={[0, h + peakH, -l / 2 - roofOverhang]}
        p3={[0, h + peakH, l / 2 + roofOverhang]}
        color={roofColor}
      />

      {/* Ridge cap */}
      <mesh position={[0, h + peakH + 0.02, 0]}>
        <boxGeometry args={[0.15 * SCALE, 0.1 * SCALE, l + roofOverhang * 2]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Eave trim - front and back */}
      {[l / 2, -l / 2].map((z, i) => (
        <mesh key={`eave-fb-${i}`} position={[0, h - 0.5 * SCALE, z * 1.01]}>
          <boxGeometry args={[w + 0.2 * SCALE, 1 * SCALE, 0.15 * SCALE]} />
          <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Eave trim - left and right */}
      {[w / 2, -w / 2].map((x, i) => (
        <mesh key={`eave-lr-${i}`} position={[x * 1.01, h - 0.5 * SCALE, 0]}>
          <boxGeometry args={[0.15 * SCALE, 1 * SCALE, l + 0.2 * SCALE]} />
          <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Corner trim */}
      {[
        [w / 2, l / 2],
        [-w / 2, l / 2],
        [w / 2, -l / 2],
        [-w / 2, -l / 2],
      ].map(([x, z], i) => (
        <mesh key={`corner-${i}`} position={[x, h / 2, z]}>
          <boxGeometry args={[0.3 * SCALE, h, 0.3 * SCALE]} />
          <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Windows */}
      {config.windows.map((win, i) => {
        const { pos, rot } = getWallPlacement(win.wall, win.position, (wallHeight / 2 + 1) * SCALE);
        return <WindowFrame key={`win-${i}`} position={pos} rotation={rot} />;
      })}

      {/* Man Doors */}
      {config.manDoors.map((door, i) => {
        const { pos, rot } = getWallPlacement(door.wall, door.position, 3.5 * SCALE);
        return <ManDoorFrame key={`mandoor-${i}`} position={pos} rotation={rot} trimColor={trimColor} />;
      })}

      {/* Garage Doors */}
      {config.garageDoors.map((door, i) => {
        const { pos, rot } = getWallPlacement(door.wall, door.position, (door.height / 2) * SCALE);
        return (
          <GarageDoorFrame
            key={`garage-${i}`}
            position={pos}
            rotation={rot}
            width={door.width}
            height={door.height}
            trimColor={trimColor}
          />
        );
      })}

      {/* Foundation line */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, Math.max(w, l) * 0.8, 4]} />
        <meshStandardMaterial color="#444" transparent opacity={0} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[w + 0.3 * SCALE, 0.3 * SCALE, l + 0.3 * SCALE]} />
        <meshStandardMaterial color="#555555" roughness={0.9} />
      </mesh>
    </group>
  );
}
