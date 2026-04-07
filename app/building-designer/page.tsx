"use client";
import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import BuildingModel, { type BuildingConfig } from "./components/BuildingModel";
import ControlPanel from "./components/ControlPanel";

const LOGO_URL =
  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/mePxnP9KVEs5oWkD/true-north-steelworks-final---transparent-logo-YNqB7l2OLJF8rz5o.png";

const DEFAULT_CONFIG: BuildingConfig = {
  width: 40,
  length: 60,
  wallHeight: 14,
  roofPitch: 4,
  wallColor: "#4a5568",
  roofColor: "#8b2500",
  trimColor: "#e8e8e8",
  windows: [
    { wall: "right", position: 25 },
    { wall: "right", position: 50 },
    { wall: "right", position: 75 },
    { wall: "left", position: 25 },
    { wall: "left", position: 75 },
  ],
  manDoors: [{ wall: "front", position: 25 }],
  garageDoors: [{ wall: "front", position: 65, width: 12, height: 12 }],
  wainscotEnabled: false,
  wainscotColor: "#1a1a1a",
  wainscotHeight: 4,
};

const colors = {
  bg: "#060f1e",
  panel: "#0d1f35",
  border: "#1a3355",
  accent: "#c8a96e",
  text: "#d4dde8",
  muted: "#6a8aaa",
  dim: "#3a5570",
};

function LoadingFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: colors.accent,
        fontSize: 14,
        letterSpacing: 3,
        fontFamily: "'DM Mono', monospace",
      }}
    >
      LOADING 3D ENGINE...
    </div>
  );
}

function SceneContent({ config }: { config: BuildingConfig }) {
  const maxDim = Math.max(config.width, config.length) * 0.1;
  const camDist = maxDim * 1.8;

  return (
    <>
      <PerspectiveCamera makeDefault position={[camDist, camDist * 0.6, camDist]} fov={45} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={maxDim * 0.5}
        maxDistance={maxDim * 5}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, config.wallHeight * 0.1 * 0.4, 0]}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 10, -6]} intensity={0.4} />
      <Environment preset="city" />
      <BuildingModel config={config} />
    </>
  );
}

export default function BuildingDesigner() {
  const [config, setConfig] = useState<BuildingConfig>(DEFAULT_CONFIG);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  return (
    <div
      style={{
        fontFamily: "'DM Mono', 'Courier New', monospace",
        background: colors.bg,
        height: "100vh",
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          background: "#080f1c",
          borderBottom: `2px solid ${colors.accent}`,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/">
            <img src={LOGO_URL} alt="True North Steelworks" style={{ height: 42, objectFit: "contain" }} />
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                letterSpacing: 3,
                color: colors.accent,
              }}
            >
              BUILDING DESIGN TOOL
            </div>
            <div style={{ fontSize: 9, color: colors.muted, letterSpacing: 2 }}>
              {config.width}&apos; x {config.length}&apos; x {config.wallHeight}&apos; &mdash; {config.roofPitch}:12
              PITCH
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setPanelCollapsed(!panelCollapsed)}
            style={{
              background: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.muted,
              padding: "8px 16px",
              fontSize: 10,
              letterSpacing: 2,
              cursor: "pointer",
              borderRadius: 4,
              fontFamily: "inherit",
            }}
          >
            {panelCollapsed ? "SHOW PANEL" : "HIDE PANEL"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* 3D Viewport */}
        <div style={{ flex: 1, position: "relative" }}>
          <Suspense fallback={<LoadingFallback />}>
            <Canvas shadows style={{ background: "#1a2a3a" }}>
              <SceneContent config={config} />
            </Canvas>
          </Suspense>

          {/* Viewport Controls Hint */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              background: "rgba(6, 15, 30, 0.85)",
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: "10px 14px",
              fontSize: 10,
              color: colors.dim,
              letterSpacing: 1,
              lineHeight: 1.8,
            }}
          >
            <span style={{ color: colors.muted }}>ROTATE</span> Left Click + Drag &nbsp;|&nbsp;{" "}
            <span style={{ color: colors.muted }}>ZOOM</span> Scroll &nbsp;|&nbsp;{" "}
            <span style={{ color: colors.muted }}>PAN</span> Right Click + Drag
          </div>

          {/* Building Summary Overlay */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(6, 15, 30, 0.9)",
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: "12px 16px",
              fontSize: 11,
              lineHeight: 1.8,
            }}
          >
            <div style={{ color: colors.accent, fontWeight: 600, letterSpacing: 2, marginBottom: 4 }}>SPECS</div>
            <div>
              <span style={{ color: colors.dim }}>Footprint:</span>{" "}
              <span style={{ color: colors.text }}>
                {config.width}&apos; x {config.length}&apos;
              </span>
            </div>
            <div>
              <span style={{ color: colors.dim }}>Sq Ft:</span>{" "}
              <span style={{ color: colors.text }}>
                {(config.width * config.length).toLocaleString()} ft&sup2;
              </span>
            </div>
            <div>
              <span style={{ color: colors.dim }}>Eave Height:</span>{" "}
              <span style={{ color: colors.text }}>{config.wallHeight}&apos;</span>
            </div>
            <div>
              <span style={{ color: colors.dim }}>Peak Height:</span>{" "}
              <span style={{ color: colors.text }}>
                {(config.wallHeight + (config.width / 2) * (config.roofPitch / 12)).toFixed(1)}&apos;
              </span>
            </div>
            <div>
              <span style={{ color: colors.dim }}>Windows:</span>{" "}
              <span style={{ color: colors.text }}>{config.windows.length}</span>
            </div>
            <div>
              <span style={{ color: colors.dim }}>Man Doors:</span>{" "}
              <span style={{ color: colors.text }}>{config.manDoors.length}</span>
            </div>
            <div>
              <span style={{ color: colors.dim }}>Overhead Doors:</span>{" "}
              <span style={{ color: colors.text }}>{config.garageDoors.length}</span>
            </div>
          </div>
        </div>

        {/* Control Panel Sidebar */}
        {!panelCollapsed && (
          <div style={{ width: 360, flexShrink: 0, padding: "16px 16px 16px 0" }}>
            <ControlPanel config={config} onChange={setConfig} />
          </div>
        )}
      </div>
    </div>
  );
}
