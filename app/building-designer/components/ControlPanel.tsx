"use client";
import type { BuildingConfig } from "./BuildingModel";

const WALLS = ["front", "back", "left", "right"] as const;
const WALL_LABELS: Record<string, string> = { front: "Front", back: "Back", left: "Left Side", right: "Right Side" };

const PRESET_COLORS = [
  { name: "Charcoal", value: "#3a3a3a" },
  { name: "Burnished Slate", value: "#4a5568" },
  { name: "Gallery Blue", value: "#2d5a7b" },
  { name: "Barn Red", value: "#8b2500" },
  { name: "Forest Green", value: "#2d5a2d" },
  { name: "Sandstone", value: "#c2a878" },
  { name: "Polar White", value: "#e8e8e8" },
  { name: "Light Stone", value: "#b8a88a" },
  { name: "Black", value: "#1a1a1a" },
  { name: "Rustic Red", value: "#6b2020" },
];

const colors = {
  bg: "#060f1e",
  panel: "#0d1f35",
  border: "#1a3355",
  accent: "#c8a96e",
  text: "#d4dde8",
  muted: "#6a8aaa",
  dim: "#3a5570",
  input: "#0a1628",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 20,
  paddingBottom: 16,
  borderBottom: `1px solid ${colors.border}`,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: colors.accent,
  letterSpacing: 3,
  display: "block",
  marginBottom: 12,
  fontWeight: 600,
};

const subLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: colors.muted,
  letterSpacing: 2,
  display: "block",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: colors.input,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  padding: "8px 12px",
  fontSize: 13,
  fontFamily: "inherit",
  borderRadius: 4,
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  background: colors.accent,
  border: "none",
  color: "#000",
  padding: "8px 16px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 2,
  cursor: "pointer",
  borderRadius: 4,
  fontFamily: "inherit",
};

const removeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: `1px solid #5a2020`,
  color: "#aa4444",
  padding: "4px 10px",
  fontSize: 10,
  cursor: "pointer",
  borderRadius: 4,
  fontFamily: "inherit",
};

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label style={subLabelStyle}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step || 1}
          style={inputStyle}
        />
        {suffix && <span style={{ fontSize: 11, color: colors.dim, whiteSpace: "nowrap" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={subLabelStyle}>{label}</label>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            title={c.name}
            style={{
              width: 22,
              height: 22,
              borderRadius: 3,
              background: c.value,
              border: value === c.value ? `2px solid ${colors.accent}` : "2px solid transparent",
              cursor: "pointer",
              outline: value === c.value ? `1px solid ${colors.accent}` : "none",
              outlineOffset: 1,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 24, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
        />
        <span style={{ fontSize: 10, color: colors.dim }}>{value}</span>
      </div>
    </div>
  );
}

function WallSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
    >
      {WALLS.map((w) => (
        <option key={w} value={w}>
          {WALL_LABELS[w]}
        </option>
      ))}
    </select>
  );
}

interface ControlPanelProps {
  config: BuildingConfig;
  onChange: (config: BuildingConfig) => void;
}

export default function ControlPanel({ config, onChange }: ControlPanelProps) {
  const update = <K extends keyof BuildingConfig>(key: K, value: BuildingConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const addWindow = () => {
    update("windows", [...config.windows, { wall: "front" as const, position: 50 }]);
  };

  const addManDoor = () => {
    update("manDoors", [...config.manDoors, { wall: "front" as const, position: 50 }]);
  };

  const addGarageDoor = () => {
    update("garageDoors", [...config.garageDoors, { wall: "front" as const, position: 50, width: 12, height: 12 }]);
  };

  const updateWindow = (index: number, field: string, value: string | number) => {
    const updated = [...config.windows];
    updated[index] = { ...updated[index], [field]: value };
    update("windows", updated);
  };

  const updateManDoor = (index: number, field: string, value: string | number) => {
    const updated = [...config.manDoors];
    updated[index] = { ...updated[index], [field]: value };
    update("manDoors", updated);
  };

  const updateGarageDoor = (index: number, field: string, value: string | number) => {
    const updated = [...config.garageDoors];
    updated[index] = { ...updated[index], [field]: value };
    update("garageDoors", updated);
  };

  const removeWindow = (index: number) => {
    update("windows", config.windows.filter((_, i) => i !== index));
  };

  const removeManDoor = (index: number) => {
    update("manDoors", config.manDoors.filter((_, i) => i !== index));
  };

  const removeGarageDoor = (index: number) => {
    update("garageDoors", config.garageDoors.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        background: colors.panel,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: 20,
        overflowY: "auto",
        maxHeight: "calc(100vh - 100px)",
        fontFamily: "'DM Mono', 'Courier New', monospace",
      }}
    >
      {/* Dimensions */}
      <div style={sectionStyle}>
        <div style={labelStyle}>BUILDING DIMENSIONS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumberInput label="WIDTH (ft)" value={config.width} onChange={(v) => update("width", Math.max(10, v))} min={10} max={200} suffix="ft" />
          <NumberInput label="LENGTH (ft)" value={config.length} onChange={(v) => update("length", Math.max(10, v))} min={10} max={400} suffix="ft" />
          <NumberInput label="WALL HEIGHT (ft)" value={config.wallHeight} onChange={(v) => update("wallHeight", Math.max(8, v))} min={8} max={40} suffix="ft" />
          <NumberInput label="ROOF PITCH" value={config.roofPitch} onChange={(v) => update("roofPitch", Math.max(0.5, Math.min(12, v)))} min={0.5} max={12} step={0.5} suffix=":12" />
        </div>
      </div>

      {/* Colors */}
      <div style={sectionStyle}>
        <div style={labelStyle}>COLORS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ColorPicker label="WALL COLOR" value={config.wallColor} onChange={(v) => update("wallColor", v)} />
          <ColorPicker label="ROOF COLOR" value={config.roofColor} onChange={(v) => update("roofColor", v)} />
          <ColorPicker label="TRIM COLOR" value={config.trimColor} onChange={(v) => update("trimColor", v)} />
        </div>
      </div>

      {/* Wainscot */}
      <div style={sectionStyle}>
        <div style={labelStyle}>WAINSCOT</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={config.wainscotEnabled}
            onChange={(e) => update("wainscotEnabled", e.target.checked)}
            style={{ accentColor: colors.accent, cursor: "pointer", width: 16, height: 16 }}
          />
          <label style={{ fontSize: 11, color: colors.muted, cursor: "pointer" }} onClick={() => update("wainscotEnabled", !config.wainscotEnabled)}>
            Enable Wainscot
          </label>
        </div>
        {config.wainscotEnabled && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <NumberInput label="HEIGHT (ft)" value={config.wainscotHeight} onChange={(v) => update("wainscotHeight", Math.max(1, Math.min(config.wallHeight / 2, v)))} min={1} max={config.wallHeight / 2} suffix="ft" />
            <ColorPicker label="WAINSCOT COLOR" value={config.wainscotColor} onChange={(v) => update("wainscotColor", v)} />
          </div>
        )}
      </div>

      {/* Windows */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={labelStyle}>WINDOWS ({config.windows.length})</div>
          <button onClick={addWindow} style={buttonStyle}>+ ADD</button>
        </div>
        <div style={{ fontSize: 10, color: colors.dim, marginBottom: 8 }}>4&apos; x 3&apos; standard windows</div>
        {config.windows.map((win, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "end", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...subLabelStyle, marginBottom: 4 }}>WALL</label>
              <WallSelect value={win.wall} onChange={(v) => updateWindow(i, "wall", v)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ ...subLabelStyle, marginBottom: 4 }}>POSITION</label>
              <input
                type="range"
                min={10}
                max={90}
                value={win.position}
                onChange={(e) => updateWindow(i, "position", Number(e.target.value))}
                style={{ width: "100%", accentColor: colors.accent }}
              />
            </div>
            <button onClick={() => removeWindow(i)} style={removeButtonStyle}>X</button>
          </div>
        ))}
      </div>

      {/* Man Doors */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={labelStyle}>MAN DOORS ({config.manDoors.length})</div>
          <button onClick={addManDoor} style={buttonStyle}>+ ADD</button>
        </div>
        <div style={{ fontSize: 10, color: colors.dim, marginBottom: 8 }}>3&apos; x 7&apos; walk doors</div>
        {config.manDoors.map((door, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "end", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...subLabelStyle, marginBottom: 4 }}>WALL</label>
              <WallSelect value={door.wall} onChange={(v) => updateManDoor(i, "wall", v)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ ...subLabelStyle, marginBottom: 4 }}>POSITION</label>
              <input
                type="range"
                min={10}
                max={90}
                value={door.position}
                onChange={(e) => updateManDoor(i, "position", Number(e.target.value))}
                style={{ width: "100%", accentColor: colors.accent }}
              />
            </div>
            <button onClick={() => removeManDoor(i)} style={removeButtonStyle}>X</button>
          </div>
        ))}
      </div>

      {/* Garage / Overhead Doors */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={labelStyle}>OVERHEAD DOORS ({config.garageDoors.length})</div>
          <button onClick={addGarageDoor} style={buttonStyle}>+ ADD</button>
        </div>
        <div style={{ fontSize: 10, color: colors.dim, marginBottom: 8 }}>Configurable overhead / roll-up doors</div>
        {config.garageDoors.map((door, i) => (
          <div key={i} style={{ background: colors.input, borderRadius: 6, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ ...subLabelStyle, marginBottom: 4 }}>WALL</label>
                <WallSelect value={door.wall} onChange={(v) => updateGarageDoor(i, "wall", v)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ ...subLabelStyle, marginBottom: 4 }}>POSITION</label>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={door.position}
                  onChange={(e) => updateGarageDoor(i, "position", Number(e.target.value))}
                  style={{ width: "100%", accentColor: colors.accent }}
                />
              </div>
              <button onClick={() => removeGarageDoor(i)} style={removeButtonStyle}>X</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <NumberInput label="WIDTH (ft)" value={door.width} onChange={(v) => updateGarageDoor(i, "width", Math.max(8, Math.min(30, v)))} min={8} max={30} suffix="ft" />
              <NumberInput label="HEIGHT (ft)" value={door.height} onChange={(v) => updateGarageDoor(i, "height", Math.max(7, Math.min(20, v)))} min={7} max={20} suffix="ft" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
