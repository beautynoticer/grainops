import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════
const T = {
  bgWarm: "#FAFAF7",
  oxblood: "#4A0404",
  oxblood2: "#6B1010",
  ink: "#1E1B16",
  ink2: "#3B342E",
  muted: "#6B645E",
  hairline: "#E7DED3",
  paper: "#FFFFFF",
  darkBg: "#0E0D0B",
  darkPanel: "#171614",
  darkBorder: "#2A2725",
  darkMuted: "#5A5550",
  darkText: "#C8C0B6",
  darkHighlight: "#E7DED3",
  sev1: "#6B645E", sev2: "#8B7E72", sev3: "#B8956A", sev4: "#A04A2F", sev5: "#4A0404",
};

const typeColors = {
  decision: "#C49A3C",
  ambiguity: "#8B7E72",
  exception: "#A04A2F",
  handoff: "#5A8B6E",
  access: "#7B6A8B",
  stakeholder: "#8B5A6E",
};

// ═══════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════
const NODES = [
  { id: "n_intake", label: "Intake Gate", col: 0, row: 0 },
  { id: "n_stake", label: "Stakeholder Surface", col: 0, row: 2 },
  { id: "n_scope", label: "Scoping Boundary", col: 1, row: 0 },
  { id: "n_prior", label: "Prioritization", col: 1, row: 1 },
  { id: "n_decide", label: "Decision Node", col: 1, row: 2 },
  { id: "n_owner", label: "Ownership Registry", col: 2, row: 0 },
  { id: "n_dod", label: "Definition of Done", col: 2, row: 1 },
  { id: "n_handoff", label: "Handoff Interface", col: 2, row: 2 },
  { id: "n_except", label: "Exception Corridor", col: 3, row: 0 },
  { id: "n_tools", label: "Tooling / Access", col: 3, row: 2 },
  { id: "n_resolve", label: "Resolution Hub", col: 4, row: 1 },
];

const EDGES = [
  { from: "n_intake", to: "n_scope" }, { from: "n_scope", to: "n_prior" },
  { from: "n_prior", to: "n_decide" }, { from: "n_decide", to: "n_owner" },
  { from: "n_owner", to: "n_dod" }, { from: "n_dod", to: "n_handoff" },
  { from: "n_handoff", to: "n_stake" }, { from: "n_handoff", to: "n_except" },
  { from: "n_except", to: "n_resolve" }, { from: "n_tools", to: "n_resolve" },
  { from: "n_stake", to: "n_resolve" }, { from: "n_scope", to: "n_decide" },
  { from: "n_prior", to: "n_owner" },
];

const EVENTS = [
  { id: "ev01", ts: "Mon 10:15", day: 0, am: true, type: "ambiguity", severity: 3, summary: "Scope unclear — work started without boundary, escalated when mismatch discovered.", origin: "n_scope", dest: "n_resolve", failure: { key: "missing_threshold", node: "n_scope", desc: "No threshold for 'ready to start'" }, route: ["n_scope", "n_owner", "n_resolve"], install: "Ready-to-Start Gate standard", upstream: ["No scoping template", "Verbal intake only"], downstream: ["Rework loop", "2-day delay", "Downstream handoff blocked"] },
  { id: "ev02", ts: "Mon 15:40", day: 0, am: false, type: "handoff", severity: 4, summary: "Handoff rejected — missing acceptance criteria triggered rework and escalation.", origin: "n_handoff", dest: "n_resolve", failure: { key: "broken_handoff", node: "n_handoff", desc: "No acceptance checklist at handoff" }, route: ["n_handoff", "n_dod", "n_resolve"], install: "Acceptance Checklist standard", upstream: ["DoD never specified", "Owner assumed criteria"], downstream: ["Stakeholder delay", "Trust erosion", "Emergency meeting"] },
  { id: "ev03", ts: "Tue 09:00", day: 1, am: true, type: "decision", severity: 5, summary: "Priority conflict between two initiatives — no ranking framework, escalated to resolution hub.", origin: "n_prior", dest: "n_resolve", failure: { key: "conflicting_priorities", node: "n_prior", desc: "No ranking criteria for competing work" }, route: ["n_prior", "n_decide", "n_resolve"], install: "Prioritization Matrix with weighted criteria", upstream: ["No strategic alignment doc", "Both sponsors present"], downstream: ["Both teams stalled", "4-day delay", "Morale dip"] },
  { id: "ev04", ts: "Tue 14:20", day: 1, am: false, type: "access", severity: 2, summary: "Tooling permission missing — new team member blocked for 3 hours on first task.", origin: "n_tools", dest: "n_resolve", failure: { key: "access_blocked", node: "n_tools", desc: "No onboarding access checklist" }, route: ["n_tools", "n_resolve"], install: "Access Provisioning Checklist", upstream: ["No onboarding template", "IT backlog"], downstream: ["First-day friction", "Workaround habits form"] },
  { id: "ev05", ts: "Wed 11:30", day: 2, am: true, type: "exception", severity: 4, summary: "Edge case with no documented path — exception corridor undefined, routed to resolver by default.", origin: "n_except", dest: "n_resolve", failure: { key: "no_exception_path", node: "n_except", desc: "Exception corridor has no documented handling" }, route: ["n_except", "n_resolve"], install: "Exception Handling Protocol", upstream: ["No edge-case registry", "Process assumed happy path"], downstream: ["Precedent without record", "Will recur"] },
  { id: "ev06", ts: "Wed 16:00", day: 2, am: false, type: "stakeholder", severity: 3, summary: "Stakeholder changed requirements mid-cycle — no change control, downstream rework.", origin: "n_stake", dest: "n_resolve", failure: { key: "missing_threshold", node: "n_stake", desc: "No change control threshold" }, route: ["n_stake", "n_scope", "n_resolve"], install: "Change Control Gate", upstream: ["No change freeze window", "Direct stakeholder access"], downstream: ["Scope reset", "Team overtime", "Quality risk"] },
  { id: "ev07", ts: "Thu 08:45", day: 3, am: true, type: "ambiguity", severity: 2, summary: "Definition of done unclear for recurring deliverable — team interpreted differently each cycle.", origin: "n_dod", dest: "n_resolve", failure: { key: "unclear_dod", node: "n_dod", desc: "No explicit completion criteria" }, route: ["n_dod", "n_owner", "n_resolve"], install: "Completion Criteria Template", upstream: ["Template never created", "Assumed shared understanding"], downstream: ["Inconsistent output", "Review bottleneck"] },
  { id: "ev08", ts: "Thu 13:15", day: 3, am: false, type: "handoff", severity: 3, summary: "Ownership not established at intake — work drifted without a responsible party for 2 days.", origin: "n_intake", dest: "n_resolve", failure: { key: "missing_owner", node: "n_owner", desc: "No DRI assigned at intake" }, route: ["n_intake", "n_scope", "n_owner", "n_resolve"], install: "Intake-to-Owner Assignment Rule", upstream: ["No intake form", "Verbal request only"], downstream: ["2-day drift", "Duplicate effort risk"] },
  { id: "ev09", ts: "Fri 10:00", day: 4, am: true, type: "decision", severity: 4, summary: "Decision pending for 6 days — no cadence forcing resolution, downstream work stalled.", origin: "n_decide", dest: "n_resolve", failure: { key: "decision_latency", node: "n_decide", desc: "No SLA on decision turnaround" }, route: ["n_decide", "n_resolve"], install: "Decision SLA (48hr default)", upstream: ["No decision queue", "No escalation timer"], downstream: ["6-day stall", "Downstream cascade", "3 teams blocked"] },
  { id: "ev10", ts: "Fri 15:30", day: 4, am: false, type: "exception", severity: 3, summary: "Missing template for new deliverable type — team improvised, inconsistent output.", origin: "n_dod", dest: "n_resolve", failure: { key: "missing_artifact", node: "n_dod", desc: "No template for this deliverable class" }, route: ["n_dod", "n_handoff", "n_except", "n_resolve"], install: "Template Registry + Creation Protocol", upstream: ["No template library", "New deliverable type"], downstream: ["Inconsistent deliverable", "Extra review cycles"] },
];

const LEDGER = [
  { id: "c1", title: "Ready-to-start threshold", node: "Scoping Boundary", invariant: "Work does not begin until scope boundary is explicit", risk: "High", owner: "Ops/Lead", review: "Mar 3", reopen: "2+ ambiguity interrupts/week", evidence: ["ev01", "ev06"] },
  { id: "c2", title: "Acceptance checklist", node: "Handoff Interface", invariant: "Handoffs include verifiable completion criteria", risk: "High", owner: "Delivery Lead", review: "Mar 3", reopen: "Any rework loop from handoff rejection", evidence: ["ev02"] },
  { id: "c3", title: "Decision turnaround SLA", node: "Decision Node", invariant: "No decision unresolved longer than 48 hours", risk: "Medium", owner: "Ops Manager", review: "Mar 10", reopen: "Decision latency >5 days twice in a month", evidence: ["ev09"] },
  { id: "c4", title: "Exception handling protocol", node: "Exception Corridor", invariant: "Every exception class has a documented path", risk: "High", owner: "Ops/Lead", review: "Mar 3", reopen: "3+ unpathed exceptions in a week", evidence: ["ev05", "ev10"] },
  { id: "c5", title: "Access provisioning", node: "Tooling / Access", invariant: "New team members have full tooling access within 4 hours", risk: "Low", owner: "IT/Ops", review: "Mar 17", reopen: "Access block delays >1 day", evidence: ["ev04"] },
];

const FAILURE_TAX = [
  { key: "missing_owner", label: "Missing owner" },
  { key: "missing_threshold", label: "Missing threshold" },
  { key: "unclear_dod", label: "Unclear definition of done" },
  { key: "broken_handoff", label: "Broken handoff contract" },
  { key: "no_exception_path", label: "No exception path" },
  { key: "access_blocked", label: "Access/tooling blocked" },
  { key: "decision_latency", label: "Decision latency" },
  { key: "conflicting_priorities", label: "Conflicting priorities" },
  { key: "missing_artifact", label: "Missing artifact/template" },
];

// ═══════════════════════════════════════════
// LAYOUT HELPERS
// ═══════════════════════════════════════════
const getNodePos = (node) => {
  const colX = [40, 145, 250, 355, 450];
  const rowY = [40, 115, 190];
  return { x: colX[node.col] || 0, y: rowY[node.row] || 0 };
};

const riskColor = (r) => r === "High" ? T.oxblood : r === "Medium" ? "#B8956A" : T.muted;

// ═══════════════════════════════════════════
// TOPOGRAPHIC LINES
// ═══════════════════════════════════════════
const TopoLines = ({ color = T.hairline, opacity = 0.4 }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} preserveAspectRatio="none" viewBox="0 0 1200 800">
    {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((y, i) => (
      <path key={i} d={`M0 ${y} Q300 ${y + (i % 2 === 0 ? 20 : -20)} 600 ${y + (i % 3 === 0 ? -15 : 12)} Q900 ${y + (i % 2 === 0 ? -18 : 22)} 1200 ${y}`}
        fill="none" stroke={color} strokeWidth={0.8} />
    ))}
  </svg>
);

// ═══════════════════════════════════════════
// TERRAIN MAP PANEL
// ═══════════════════════════════════════════
const TerrainMap = ({ selectedEvent, animStep, onNodeClick, highlightNodes }) => {
  const nodeMap = {};
  NODES.forEach(n => { nodeMap[n.id] = getNodePos(n); });
  const activeRoute = selectedEvent ? selectedEvent.route : [];

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 240" style={{ overflow: "visible" }}>
      {/* Column labels */}
      {["Sources", "Interfaces", "Work", "Exceptions", "Resolution"].map((label, i) => (
        <text key={label} x={[40, 145, 250, 355, 450][i]} y={12} textAnchor="middle"
          fill={T.darkMuted} fontSize={8} fontFamily="Inter, system-ui" fontWeight={500} opacity={0.5}>
          {label}
        </text>
      ))}
      {/* Edges */}
      {EDGES.map((e, i) => {
        const from = nodeMap[e.from]; const to = nodeMap[e.to];
        if (!from || !to) return null;
        const isOnRoute = selectedEvent && activeRoute.includes(e.from) && activeRoute.includes(e.to) &&
          Math.abs(activeRoute.indexOf(e.to) - activeRoute.indexOf(e.from)) === 1;
        const lit = isOnRoute && animStep >= activeRoute.indexOf(e.to);
        return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
          stroke={lit ? T.oxblood : T.darkBorder} strokeWidth={lit ? 2 : 0.8} opacity={lit ? 0.85 : 0.25}
          style={{ transition: "all 0.35s ease" }} />;
      })}
      {/* Nodes */}
      {NODES.map(n => {
        const p = nodeMap[n.id];
        const isOnRoute = selectedEvent && activeRoute.includes(n.id);
        const isFailure = selectedEvent && selectedEvent.failure.node === n.id;
        const isCurrent = isOnRoute && activeRoute.indexOf(n.id) <= animStep;
        const isResolution = n.id === "n_resolve";
        const isHighlighted = highlightNodes && highlightNodes.includes(n.id);
        const r = isResolution ? 14 : 10;
        return (
          <g key={n.id} transform={`translate(${p.x},${p.y})`}
            onClick={() => onNodeClick && onNodeClick(n.id)} style={{ cursor: onNodeClick ? "pointer" : "default" }}>
            <circle r={r}
              fill={isFailure && isCurrent ? T.oxblood : isCurrent ? T.oxblood2 : isHighlighted ? `${T.oxblood}40` : T.darkPanel}
              stroke={isCurrent ? T.oxblood : isHighlighted ? T.oxblood2 : T.darkBorder}
              strokeWidth={isCurrent || isHighlighted ? 1.5 : 0.8}
              style={{ transition: "all 0.3s" }} />
            {isFailure && isCurrent && (
              <circle r={r + 5} fill="none" stroke={T.oxblood} strokeWidth={1} opacity={0.3}>
                <animate attributeName="r" from={r} to={r + 10} dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            <text y={r + 14} textAnchor="middle"
              fill={isCurrent || isHighlighted ? T.darkHighlight : T.darkMuted}
              fontSize={8} fontFamily="Inter, system-ui" fontWeight={isCurrent ? 600 : 400}
              style={{ transition: "fill 0.3s" }}>
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ═══════════════════════════════════════════
// CAUSAL WEB PANEL
// ═══════════════════════════════════════════
const CausalWeb = ({ selectedEvent }) => {
  if (!selectedEvent) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: T.darkMuted, fontSize: 11 }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ border: `1px dashed ${T.darkBorder}` }}>
            <span style={{ fontSize: 16, opacity: 0.4 }}>⟡</span>
          </div>
          <p>Select an interrupt to see<br />upstream causes &amp; downstream effects</p>
        </div>
      </div>
    );
  }

  const fp = selectedEvent.failure;
  const up = selectedEvent.upstream || [];
  const down = selectedEvent.downstream || [];
  const cx = 140, cy = 100;

  return (
    <div className="relative h-full">
      <svg width="100%" height="100%" viewBox="0 0 280 200" style={{ overflow: "visible" }}>
        {/* Upstream lines */}
        {up.map((_, i) => {
          const angle = -Math.PI / 2 + ((i - (up.length - 1) / 2) * 0.7);
          const ex = cx + Math.cos(angle) * 70;
          const ey = cy + Math.sin(angle) * 55;
          return <line key={`ul${i}`} x1={ex} y1={ey} x2={cx} y2={cy} stroke={T.darkBorder} strokeWidth={0.8} strokeDasharray="3 3" />;
        })}
        {/* Downstream lines */}
        {down.map((_, i) => {
          const angle = Math.PI / 2 + ((i - (down.length - 1) / 2) * 0.6);
          const ex = cx + Math.cos(angle) * 70;
          const ey = cy + Math.sin(angle) * 55;
          return <line key={`dl${i}`} x1={cx} y1={cy} x2={ex} y2={ey} stroke={T.oxblood} strokeWidth={0.8} opacity={0.5} />;
        })}
        {/* Center failure node */}
        <circle cx={cx} cy={cy} r={16} fill={T.oxblood} opacity={0.9} />
        <circle cx={cx} cy={cy} r={20} fill="none" stroke={T.oxblood} strokeWidth={1} opacity={0.25}>
          <animate attributeName="r" from="16" to="24" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x={cx} y={cy + 3} textAnchor="middle" fill={T.paper} fontSize={7} fontFamily="Inter, system-ui" fontWeight={600}>
          ⚑
        </text>
        {/* Upstream nodes */}
        {up.map((label, i) => {
          const angle = -Math.PI / 2 + ((i - (up.length - 1) / 2) * 0.7);
          const ex = cx + Math.cos(angle) * 70;
          const ey = cy + Math.sin(angle) * 55;
          return (
            <g key={`u${i}`}>
              <circle cx={ex} cy={ey} r={6} fill={T.darkPanel} stroke={T.darkBorder} strokeWidth={1} />
              <text x={ex} y={ey + 16} textAnchor="middle" fill={T.darkMuted} fontSize={7} fontFamily="Inter, system-ui">{label}</text>
            </g>
          );
        })}
        {/* Downstream nodes */}
        {down.map((label, i) => {
          const angle = Math.PI / 2 + ((i - (down.length - 1) / 2) * 0.6);
          const ex = cx + Math.cos(angle) * 70;
          const ey = cy + Math.sin(angle) * 55;
          return (
            <g key={`d${i}`}>
              <circle cx={ex} cy={ey} r={6} fill={`${T.oxblood}30`} stroke={T.oxblood2} strokeWidth={1} />
              <text x={ex} y={ey + 16} textAnchor="middle" fill={T.darkText} fontSize={7} fontFamily="Inter, system-ui">{label}</text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center gap-4" style={{ fontSize: 9, color: T.darkMuted }}>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-px" style={{ background: T.darkBorder, borderTop: "1px dashed" }} /> upstream</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-px" style={{ background: T.oxblood }} /> downstream</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// TIMELINE PANEL
// ═══════════════════════════════════════════
const Timeline = ({ selectedId, onSelect, height = 220 }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 220 ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Day grid */}
        {days.map((d, i) => (
          <g key={d}>
            <text x={12} y={30 + i * 42} fill={T.darkMuted} fontSize={9} fontFamily="Inter, system-ui" fontWeight={500}>{d}</text>
            <line x1={38} y1={25 + i * 42} x2={210} y2={25 + i * 42} stroke={T.darkBorder} strokeWidth={0.5} />
          </g>
        ))}
        {/* Event dots */}
        {EVENTS.map((ev) => {
          const y = 30 + ev.day * 42;
          const x = ev.am ? 80 + (ev.severity * 8) : 155 + (ev.severity * 5);
          const sel = selectedId === ev.id;
          const r = 3.5 + ev.severity * 1;
          return (
            <g key={ev.id} transform={`translate(${x},${y})`} onClick={() => onSelect(ev.id)} style={{ cursor: "pointer" }}>
              <circle r={r} fill={sel ? T.oxblood : typeColors[ev.type]} opacity={sel ? 1 : 0.55}
                style={{ transition: "all 0.2s" }} />
              {sel && <circle r={r + 4} fill="none" stroke={T.oxblood} strokeWidth={1} opacity={0.5} />}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ═══════════════════════════════════════════
// FULL INSTRUMENT (3 panels + event detail)
// ═══════════════════════════════════════════
const Instrument = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [animStep, setAnimStep] = useState(-1);
  const [autoIdx, setAutoIdx] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [ledgerHighlight, setLedgerHighlight] = useState(null);
  const selectedEvent = EVENTS.find(e => e.id === selectedId);

  // Attract mode
  useEffect(() => {
    if (userInteracted) return;
    const interval = setInterval(() => {
      setAutoIdx(prev => {
        const next = (prev + 1) % EVENTS.length;
        setSelectedId(EVENTS[next].id);
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [userInteracted]);

  // Route animation
  useEffect(() => {
    if (!selectedEvent) { setAnimStep(-1); return; }
    setAnimStep(0);
    const steps = selectedEvent.route.length;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) { clearInterval(timer); return; }
      setAnimStep(step);
    }, 450);
    return () => clearInterval(timer);
  }, [selectedId]);

  const handleSelect = (id) => {
    setUserInteracted(true);
    setLedgerHighlight(null);
    setSelectedId(id === selectedId ? null : id);
  };

  const highlightNodes = ledgerHighlight
    ? LEDGER.find(l => l.id === ledgerHighlight)?.evidence.flatMap(eid => {
        const ev = EVENTS.find(e => e.id === eid);
        return ev ? ev.route : [];
      })
    : null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: T.darkBg, border: `1px solid ${T.darkBorder}` }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${T.darkBorder}` }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: `${T.oxblood}25`, color: T.oxblood, border: `1px solid ${T.oxblood}35`, fontSize: 10 }}>DEMO</span>
          <span style={{ color: T.darkMuted, fontSize: 11, fontFamily: "Inter, system-ui" }}>Terrain–Interruption Instrument</span>
        </div>
        <div className="flex items-center gap-4">
          {!userInteracted && (
            <span className="text-xs" style={{ color: T.darkMuted, fontSize: 10 }}>
              <span style={{ color: T.oxblood }}>●</span> Auto-cycling — click to explore
            </span>
          )}
          {/* Type legend */}
          <div className="flex items-center gap-2" style={{ fontSize: 9 }}>
            {Object.entries(typeColors).slice(0, 4).map(([k, c]) => (
              <span key={k} className="flex items-center gap-1" style={{ color: T.darkMuted }}>
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: c }} />{k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex" style={{ minHeight: 320 }}>
        {/* Panel 1: Timeline */}
        <div className="flex-shrink-0" style={{ width: "22%", borderRight: `1px solid ${T.darkBorder}`, padding: "10px 8px" }}>
          <div className="text-xs font-medium mb-2 tracking-wider flex items-center gap-2" style={{ color: T.darkMuted, fontSize: 9 }}>
            <span>TIMELINE</span>
            <span className="text-xs" style={{ color: T.darkMuted, fontWeight: 400 }}>W09</span>
          </div>
          <Timeline selectedId={selectedId} onSelect={handleSelect} height={220} />
        </div>

        {/* Panel 2: Terrain */}
        <div className="flex-1" style={{ borderRight: `1px solid ${T.darkBorder}`, padding: "10px 8px" }}>
          <div className="text-xs font-medium mb-2 tracking-wider" style={{ color: T.darkMuted, fontSize: 9 }}>TERRAIN</div>
          <TerrainMap selectedEvent={selectedEvent} animStep={animStep} highlightNodes={highlightNodes ? [...new Set(highlightNodes)] : null} />
        </div>

        {/* Panel 3: Causal Web */}
        <div className="flex-shrink-0" style={{ width: "28%", padding: "10px 8px" }}>
          <div className="text-xs font-medium mb-2 tracking-wider" style={{ color: T.darkMuted, fontSize: 9 }}>CAUSAL WEB</div>
          <CausalWeb selectedEvent={selectedEvent} />
        </div>
      </div>

      {/* Event detail bar */}
      {selectedEvent && (
        <div className="px-4 py-3" style={{ borderTop: `1px solid ${T.darkBorder}`, background: T.darkPanel }}>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: `${typeColors[selectedEvent.type]}25`, color: typeColors[selectedEvent.type], fontSize: 10 }}>{selectedEvent.type}</span>
                <span className="text-xs" style={{ color: T.darkMuted, fontSize: 10 }}>severity {selectedEvent.severity} · {selectedEvent.ts}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: T.darkText, fontSize: 11 }}>{selectedEvent.summary}</p>
            </div>
            <div className="flex-shrink-0" style={{ maxWidth: 220 }}>
              <div className="text-xs mb-1" style={{ color: T.oxblood, fontSize: 10 }}>⚑ {selectedEvent.failure.desc}</div>
              <div className="text-xs" style={{ fontSize: 10 }}>
                <span style={{ color: T.darkMuted }}>I would install → </span>
                <span style={{ color: T.darkHighlight }}>{selectedEvent.install}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// CONSIDERATIONS LEDGER (collapsible)
// ═══════════════════════════════════════════
const LedgerSection = () => {
  const [open, setOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div className="mt-4 rounded-xl overflow-hidden" style={{ background: T.darkBg, border: `1px solid ${T.darkBorder}` }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 transition-all"
        style={{ background: T.darkPanel, borderBottom: open ? `1px solid ${T.darkBorder}` : "none" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium tracking-wider" style={{ color: T.darkMuted, fontSize: 9 }}>CONSIDERATIONS LEDGER</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${T.oxblood}20`, color: T.oxblood, fontSize: 9 }}>{LEDGER.length} items</span>
        </div>
        <span style={{ color: T.darkMuted, fontSize: 12, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 11 }}>
            <thead>
              <tr>
                {["Consideration", "Protects", "Risk", "Owner", "Review", "Reopen trigger"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 font-medium tracking-wider"
                    style={{ color: T.darkMuted, fontSize: 9, borderBottom: `1px solid ${T.darkBorder}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((row, i) => (
                <tr key={row.id}
                  onMouseEnter={() => setHoveredRow(row.id)} onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: hoveredRow === row.id ? `${T.oxblood}08` : (i % 2 === 0 ? T.darkBg : T.darkPanel),
                    cursor: "pointer", transition: "background 0.15s"
                  }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: T.darkHighlight }}>{row.title}</td>
                  <td className="px-4 py-2.5" style={{ color: T.darkText, maxWidth: 180 }}>{row.invariant}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${riskColor(row.risk)}20`, color: riskColor(row.risk), fontSize: 9 }}>{row.risk}</span>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: T.darkText }}>{row.owner}</td>
                  <td className="px-4 py-2.5" style={{ color: T.darkMuted }}>{row.review}</td>
                  <td className="px-4 py-2.5" style={{ color: T.darkMuted, maxWidth: 160 }}>{row.reopen}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 flex items-center gap-2" style={{ borderTop: `1px solid ${T.darkBorder}` }}>
            <span className="text-xs" style={{ color: T.darkMuted, fontSize: 9 }}>Governance: going backward requires evidence. Each consideration has a reopen trigger — not a meeting.</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
const HomePage = ({ onNav }) => (
  <div style={{ background: T.bgWarm }}>
    {/* Hero */}
    <section className="relative overflow-hidden" style={{ minHeight: "65vh" }}>
      <TopoLines color={T.hairline} opacity={0.3} />
      <div className="relative max-w-5xl mx-auto px-8 pt-20 pb-12">
        <span className="text-xs font-medium tracking-widest" style={{ color: T.muted }}>GRAIN OPS</span>
        <h1 className="text-5xl font-bold leading-tight mt-4 mb-5" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>
          Interruptions are<br />unowned plans.
        </h1>
        <p className="text-lg leading-relaxed max-w-lg mb-7" style={{ color: T.ink2 }}>
          I design the operating system that actually exists: thresholds, ownership, closure, and governance — made visible as terrain.
        </p>
        <div className="flex gap-3 mb-3">
          <button onClick={() => onNav("deck")} className="px-6 py-3 rounded-lg text-sm font-medium transition-all hover:shadow-lg"
            style={{ background: T.oxblood, color: T.paper }}>Open the brief</button>
          <button className="px-6 py-3 rounded-lg text-sm font-medium"
            style={{ color: T.oxblood, border: `1px solid ${T.oxblood}40` }}>Book Diagnostic</button>
        </div>
        <div className="h-px w-48" style={{ background: T.oxblood }} />
      </div>
    </section>

    {/* Instrument */}
    <section className="max-w-5xl mx-auto px-8 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-px" style={{ background: T.oxblood }} />
        <span className="text-xs font-medium tracking-widest" style={{ color: T.muted }}>THE INSTRUMENT</span>
      </div>
      <p className="text-sm mb-5 max-w-lg" style={{ color: T.ink2 }}>
        Click an interrupt to replay its route — where it entered, where it failed, and what I would install to prevent it.
      </p>
      <Instrument />
      <LedgerSection />
    </section>

    {/* Operating taste */}
    <section className="max-w-5xl mx-auto px-8 py-16" style={{ borderTop: `1px solid ${T.hairline}` }}>
      <div className="grid grid-cols-5 gap-12">
        <div className="col-span-2">
          <span className="text-xs font-medium tracking-widest" style={{ color: T.oxblood }}>04 · TASTE</span>
          <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Operating taste</h2>
          <p className="text-sm leading-relaxed" style={{ color: T.ink2 }}>
            How the system judges "good": what it tolerates, what it escalates, what it considers done.
            Most organizations have never made any of these explicit.
          </p>
        </div>
        <div className="col-span-3 space-y-3">
          {[
            { label: "Thresholds", desc: "What triggers escalation? What can be decided locally? Without explicit thresholds, everything routes to the Resolver." },
            { label: "Ownership", desc: "Who is accountable for closure at each interface? Without ownership, uncertainty drifts until someone volunteers or escalates." },
            { label: "Closure", desc: "What counts as done, and what reopens it? Without closure criteria, decisions get relitigated and standards decay." },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-lg" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
              <span className="text-sm font-bold" style={{ color: T.oxblood }}>{item.label}</span>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: T.ink2 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Failure taxonomy */}
    <section className="max-w-5xl mx-auto px-8 py-14" style={{ borderTop: `1px solid ${T.hairline}` }}>
      <span className="text-xs font-medium tracking-widest" style={{ color: T.oxblood }}>02 · INSTRUMENT</span>
      <h2 className="text-2xl font-bold mt-3 mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Failure points are finite</h2>
      <p className="text-sm mb-6" style={{ color: T.muted }}>Once the taxonomy is stable, fixes become reusable standards — not heroics.</p>
      <div className="grid grid-cols-3 gap-2.5">
        {FAILURE_TAX.map(f => (
          <div key={f.key} className="px-4 py-3 rounded-lg text-sm" style={{ background: T.paper, border: `1px solid ${T.hairline}`, color: T.ink2 }}>
            {f.label}
          </div>
        ))}
      </div>
    </section>

    {/* Constraint field */}
    <section className="max-w-5xl mx-auto px-8 py-14" style={{ borderTop: `1px solid ${T.hairline}` }}>
      <span className="text-xs font-medium tracking-widest" style={{ color: T.oxblood }}>03 · CONSTRAINTS</span>
      <h2 className="text-2xl font-bold mt-3 mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Constraint field → feasible forms</h2>
      <p className="text-sm mb-6" style={{ color: T.muted }}>Constraints are the highest-signal truth. The job is to design what can persist inside them.</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { head: "BINDING CONSTRAINTS", items: ["Attention budget", "Decision latency", "Compliance gates", "Dependency limits"], type: "neutral" },
          { head: "FEASIBLE FORMS", items: ["Thresholds", "Owners", "Exception paths", "Cadence + review"], type: "good" },
          { head: "FORBIDDEN FORMS", items: ["Everything escalates", "Vibes as governance", "Docs without tests", "No reopen rules"], type: "bad" },
        ].map(col => (
          <div key={col.head} className="p-5 rounded-xl" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
            <span className="text-xs font-bold tracking-wider" style={{ color: col.type === "bad" ? T.oxblood : col.type === "good" ? "#5A8B6E" : T.muted }}>{col.head}</span>
            <div className="mt-3 space-y-2">
              {col.items.map((item, j) => (
                <p key={j} className="text-sm" style={{ color: T.ink2 }}>{item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Offer */}
    <section className="max-w-5xl mx-auto px-8 py-14" style={{ borderTop: `1px solid ${T.hairline}` }}>
      <span className="text-xs font-medium tracking-widest" style={{ color: T.oxblood }}>05 · OFFER</span>
      <h2 className="text-2xl font-bold mt-3 mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Start with a paid Diagnostic</h2>
      <p className="text-sm mb-3 max-w-lg" style={{ color: T.ink2 }}>In 1–2 weeks, I deliver your interruption geography, control plane watchlist, and a standards plan.</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
          <span className="text-xs font-bold tracking-wider" style={{ color: T.oxblood }}>DIAGNOSTIC DELIVERABLES</span>
          <div className="mt-3 space-y-2">
            {["Terrain map v1 (channels + hotspots)", "Instrument demo (representative interrupts)", "Considerations Ledger v1 (8–15 items)", "Draft Standards Pack (5–10 with quick tests)", "Install plan aligned to tiers", "Governance cadence (weekly + drift checks)"].map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: T.oxblood }} />
                <span className="text-sm" style={{ color: T.ink }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {[
            { tier: "Surface", price: "$1,500", wf: "2 workflows" },
            { tier: "Core", price: "$3,000", wf: "3 workflows", featured: true },
            { tier: "Foundation", price: "$5,000", wf: "5 workflows" },
          ].map(t => (
            <div key={t.tier} className="p-4 rounded-xl flex items-center justify-between" style={{
              background: T.paper, border: t.featured ? `2px solid ${T.oxblood}` : `1px solid ${T.hairline}`
            }}>
              <div>
                <span className="text-sm font-bold" style={{ color: T.ink }}>{t.tier}</span>
                <span className="text-sm ml-2" style={{ color: T.muted }}>{t.wf}</span>
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.oxblood }}>{t.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Close */}
    <section className="max-w-5xl mx-auto px-8 py-16 text-center" style={{ borderTop: `1px solid ${T.hairline}` }}>
      <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>
        Let's give them owners,<br />thresholds, and closure.
      </h2>
      <p className="text-sm mb-6" style={{ color: T.muted }}>Start with the Diagnostic.</p>
      <button className="px-8 py-3.5 rounded-lg text-sm font-medium" style={{ background: T.oxblood, color: T.paper }}>Book Diagnostic</button>
      <div className="mt-10 flex justify-center gap-6 text-sm" style={{ color: T.muted }}>
        <span>casey@grainops.co</span><span>·</span><span>LinkedIn</span><span>·</span><span>Upwork</span>
      </div>
      <p className="text-xs mt-4" style={{ color: T.hairline }}>Grain Ops · Casey W.</p>
    </section>
  </div>
);

// ═══════════════════════════════════════════
// DECK — SLIDE COMPONENTS
// ═══════════════════════════════════════════
const SlideFrame = ({ section, sectionLabel, children, footer }) => (
  <div className="relative w-full" style={{ background: T.bgWarm, minHeight: 520, fontFamily: "Inter, system-ui" }}>
    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: T.oxblood }} />
    <div className="flex h-full" style={{ minHeight: 520 }}>
      {section && (
        <div className="flex-shrink-0 w-44 pt-10 pl-6 pr-3" style={{ borderRight: `2px solid ${T.oxblood}15` }}>
          <span className="text-sm font-medium" style={{ color: T.oxblood }}>{section}</span>
          <p className="text-sm font-bold mt-1" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>{sectionLabel}</p>
        </div>
      )}
      <div className="flex-1 pt-10 pb-10 px-8">{children}</div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6 py-2.5" style={{ borderTop: `1px solid ${T.hairline}` }}>
      <span className="text-xs" style={{ color: T.muted }}>Grain Ops</span>
      <span className="text-xs" style={{ color: T.muted }}>{footer || ""}</span>
    </div>
  </div>
);

const ThreeCol = ({ cols }) => (
  <div className="grid grid-cols-3 gap-3 mt-5">
    {cols.map((col, i) => (
      <div key={i} className="p-4 rounded-xl" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
        <span className="text-xs font-bold tracking-wider" style={{ color: col.color || T.oxblood }}>{col.head}</span>
        <div className="mt-3 space-y-1.5">
          {col.items.map((item, j) => <p key={j} className="text-sm" style={{ color: T.ink2 }}>{item}</p>)}
        </div>
      </div>
    ))}
  </div>
);

const SLIDES = [
  // S01 Cover
  () => (
    <SlideFrame footer="v2">
      <div className="flex flex-col justify-center" style={{ minHeight: 400 }}>
        <span className="text-xs font-medium tracking-widest px-3 py-1.5 rounded-full inline-block mb-8 self-start"
          style={{ border: `1px solid ${T.oxblood}40`, color: T.oxblood }}>HEAVY-HITTER BRIEF</span>
        <h1 className="text-4xl font-bold leading-tight mb-5" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>
          Interruptions are<br />unowned plans.
        </h1>
        <div className="h-px w-full mb-4" style={{ background: T.hairline }} />
        <p className="text-base max-w-md" style={{ color: T.muted }}>
          I design the operating system that actually exists: thresholds, ownership, closure, and governance — made visible as terrain.
        </p>
        <div className="mt-8"><div className="h-1 w-36 rounded" style={{ background: T.oxblood }} /><p className="text-sm mt-2" style={{ color: T.muted }}>Grain Ops · Casey W.</p></div>
      </div>
    </SlideFrame>
  ),
  // S02 Outline
  () => (
    <SlideFrame footer="outline">
      <div className="flex flex-col justify-center" style={{ minHeight: 400 }}>
        <span className="text-xs font-bold tracking-widest mb-5" style={{ color: T.oxblood }}>OUTLINE</span>
        <h2 className="text-2xl font-bold mb-7" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>How this works</h2>
        <div className="space-y-3.5">
          {[["01", "The problem as a routing failure"], ["02", "The instrument (timeline · terrain · causal web)"], ["03", "Constraint field → feasible forms"], ["04", "Operating taste (thresholds · ownership · closure)"], ["05", "Diagnostic → install → governance"]].map(([n, t]) => (
            <div key={n} className="flex items-center gap-4">
              <span className="text-sm font-bold w-8" style={{ color: T.oxblood }}>{n}</span>
              <span className="text-sm" style={{ color: T.ink }}>{t}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-8" style={{ color: T.muted }}>This deck is intentionally dense. The portfolio sells the idea; this is the implementation logic.</p>
      </div>
    </SlideFrame>
  ),
  // S03 Problem
  () => (
    <SlideFrame section="01" sectionLabel="Problem" footer="problem">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Interruptions are not "people problems."</h2>
      <p className="text-sm mb-4" style={{ color: T.ink2 }}>They are a routing failure: uncertainty flows until it hits a Resolver (founder, lead, ops, whoever always answers).</p>
      <ThreeCol cols={[
        { head: "UNCERTAINTY", items: ["Ambiguity", "Exceptions", "Missing context"] },
        { head: "ROUTING", items: ["No thresholds", "No owners", "Broken handoffs"] },
        { head: "INTERRUPT", items: ["Escalation to a Resolver", "+ downstream debt"] },
      ]} />
    </SlideFrame>
  ),
  // S04 Instrument
  () => (
    <SlideFrame section="02" sectionLabel="Instrument" footer="instrument">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Terrain–Interruption Instrument</h2>
      <p className="text-sm mb-4" style={{ color: T.ink2 }}>A full-screen operational instrument: timeline → terrain route → causal web. Click an interrupt; replay where it came from, where it failed, and what it will cause next.</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "TIMELINE", content: (
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              {EVENTS.slice(0, 7).map((ev, i) => (
                <div key={i} className="rounded-full" style={{ width: 6 + ev.severity * 2, height: 6 + ev.severity * 2, background: i === 4 ? T.oxblood : T.darkMuted, opacity: i === 4 ? 1 : 0.35 }} />
              ))}
            </div>
          )},
          { label: "TERRAIN", content: (
            <svg width="100%" viewBox="0 0 120 70" style={{ marginTop: 8 }}>
              {[[15,20,45,35],[45,35,85,15],[45,35,85,55],[85,15,105,35],[85,55,105,35]].map(([x1,y1,x2,y2],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i===1?T.oxblood:T.darkBorder} strokeWidth={i===1?2:1} />
              ))}
              {[[15,20],[45,35],[85,15],[85,55],[105,35]].map(([cx,cy],i) => (
                <circle key={i} cx={cx} cy={cy} r={i===4?7:5} fill={i===1?T.oxblood:T.darkPanel} stroke={T.darkBorder} strokeWidth={1} />
              ))}
            </svg>
          )},
          { label: "CAUSAL WEB", content: (
            <svg width="100%" viewBox="0 0 120 70" style={{ marginTop: 8 }}>
              <circle cx={60} cy={35} r={7} fill={T.oxblood} />
              {[[25,15],[95,15],[20,55],[100,55],[60,5]].map(([cx,cy],i) => (
                <g key={i}><line x1={60} y1={35} x2={cx} y2={cy} stroke={T.darkBorder} strokeWidth={0.8} />
                <circle cx={cx} cy={cy} r={4} fill={T.darkPanel} stroke={T.darkBorder} /></g>
              ))}
            </svg>
          )},
        ].map(panel => (
          <div key={panel.label} className="rounded-xl p-4 flex flex-col items-center" style={{ background: T.darkBg, border: `1px solid ${T.darkBorder}`, minHeight: 140 }}>
            <span className="text-xs font-bold tracking-wider" style={{ color: T.darkMuted, fontSize: 9 }}>{panel.label}</span>
            {panel.content}
          </div>
        ))}
      </div>
    </SlideFrame>
  ),
  // S05 Event anatomy
  () => (
    <SlideFrame section="02" sectionLabel="Instrument" footer="event">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Interrupt = episode + route + failure point</h2>
      <p className="text-sm mb-4" style={{ color: T.ink2 }}>Each event is a traceable object. This is how taste becomes legible and governance becomes durable.</p>
      <ThreeCol cols={[
        { head: "EPISODE", items: ["Trigger → attempted resolution → outcome", "Who · Where · What it blocked"] },
        { head: "ROUTE", items: ["Origin node → steps → escalation", "Shows channels the system makes easy"] },
        { head: "FAILURE POINT", items: ["Missing owner", "Missing threshold", "Unclear done", "Broken handoff", "No exception path", "Access blocked"] },
      ]} />
    </SlideFrame>
  ),
  // S06 Failure taxonomy
  () => (
    <SlideFrame section="02" sectionLabel="Instrument" footer="taxonomy">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Failure points are finite</h2>
      <p className="text-sm mb-5" style={{ color: T.ink2 }}>Once the taxonomy is stable, fixes become reusable standards instead of one-off heroics.</p>
      <div className="grid grid-cols-3 gap-2.5">
        {FAILURE_TAX.map(f => (
          <div key={f.key} className="px-4 py-3 rounded-lg text-sm" style={{ background: T.paper, border: `1px solid ${T.hairline}`, color: T.ink }}>{f.label}</div>
        ))}
      </div>
    </SlideFrame>
  ),
  // S07 Constraints
  () => (
    <SlideFrame section="03" sectionLabel="Constraints" footer="constraints">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Constraint field → feasible forms</h2>
      <p className="text-sm mb-4" style={{ color: T.ink2 }}>Constraints are the highest-signal truth. The job is to design what can persist inside them.</p>
      <ThreeCol cols={[
        { head: "BINDING CONSTRAINTS", items: ["Attention budget", "Decision latency", "Compliance", "Dependency limits"], color: T.muted },
        { head: "FEASIBLE FORMS", items: ["Thresholds", "Owners", "Exception paths", "Cadence + review"], color: "#5A8B6E" },
        { head: "FORBIDDEN FORMS", items: ["Everything escalates", "Vibes as governance", "Docs w/o tests", "No reopen rules"], color: T.oxblood },
      ]} />
    </SlideFrame>
  ),
  // S08 Operating taste
  () => (
    <SlideFrame section="04" sectionLabel="Taste" footer="taste">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Operating taste</h2>
      <p className="text-sm mb-4" style={{ color: T.ink2 }}>How the system judges "good": what it tolerates, what it escalates, what it considers done.</p>
      <ThreeCol cols={[
        { head: "THRESHOLDS", items: ["What triggers escalation?", "What can be decided locally?"] },
        { head: "OWNERSHIP", items: ["Who is accountable for closure", "at each interface?"] },
        { head: "CLOSURE", items: ["What counts as done,", "and what reopens it?"] },
      ]} />
    </SlideFrame>
  ),
  // S09 Ledger
  () => (
    <SlideFrame section="04" sectionLabel="Taste" footer="ledger">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Considerations Ledger = control plane watchlist</h2>
      <p className="text-sm mb-4" style={{ color: T.ink2 }}>A living watchlist of invariants, owners, review cadence, and reopen triggers — linked to evidence.</p>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.hairline}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: T.paper }}>{["CONSIDERATION", "PROTECTS", "OWNER", "REOPEN"].map(h => (
              <th key={h} className="text-left px-3 py-2.5 text-xs font-bold tracking-wider" style={{ color: T.oxblood, borderBottom: `1px solid ${T.hairline}`, fontSize: 9 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>{LEDGER.slice(0, 3).map((row, i) => (
            <tr key={row.id} style={{ background: i % 2 === 0 ? T.bgWarm : T.paper }}>
              <td className="px-3 py-2.5 font-medium" style={{ color: T.ink }}>{row.title}</td>
              <td className="px-3 py-2.5" style={{ color: T.ink2 }}>{row.invariant.substring(0, 45)}…</td>
              <td className="px-3 py-2.5" style={{ color: T.ink2 }}>{row.owner}</td>
              <td className="px-3 py-2.5" style={{ color: T.muted, fontSize: 12 }}>{row.reopen}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </SlideFrame>
  ),
  // S10 Diagnostic
  () => (
    <SlideFrame section="05" sectionLabel="Offer" footer="diagnostic">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Start with a paid Diagnostic</h2>
      <p className="text-sm mb-5" style={{ color: T.ink2 }}>In 1–2 weeks, I deliver your interruption geography + control plane watchlist + a standards plan.</p>
      <div className="rounded-xl p-5" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
        <span className="text-xs font-bold tracking-wider" style={{ color: T.oxblood }}>DELIVERABLES</span>
        <div className="mt-3 space-y-2">
          {["Terrain map v1 (channels + hotspots)", "Instrument demo (representative interrupts; severity-only)", "Considerations Ledger v1 (8–15 watch items)", "Draft Standards Pack (5–10 with quick tests)", "Install plan aligned to Surface / Core / Foundation", "Governance cadence (weekly ops review + drift checks)"].map((d, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: T.oxblood }} />
              <span className="text-sm" style={{ color: T.ink }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4"><span className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: T.oxblood, color: T.paper }}>Book Diagnostic</span></div>
    </SlideFrame>
  ),
  // S11 Tiers
  () => (
    <SlideFrame section="05" sectionLabel="Offer" footer="tiers">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Install depths (after Diagnostic)</h2>
      <p className="text-sm mb-5" style={{ color: T.ink2 }}>2 / 3 / 5 workflows installed as standards with tests + owners + reopen rules. Agreement handled off-site.</p>
      <div className="grid grid-cols-3 gap-3">
        {[["SURFACE", "$1,500", "2 workflows"], ["CORE", "$3,000", "3 workflows", true], ["FOUNDATION", "$5,000", "5 workflows"]].map(([tier, price, wf, featured]) => (
          <div key={tier} className="p-4 rounded-xl" style={{ background: T.paper, border: featured ? `2px solid ${T.oxblood}` : `1px solid ${T.hairline}` }}>
            <span className="text-xs font-bold tracking-wider" style={{ color: T.oxblood }}>{tier}</span>
            <p className="text-2xl font-bold mt-2 mb-1" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>{price}</p>
            <p className="text-sm" style={{ color: T.muted }}>{wf}</p>
            <p className="text-xs mt-2" style={{ color: T.muted }}>Terrain updates, standards pack, ledger seeding, training Looms.</p>
          </div>
        ))}
      </div>
    </SlideFrame>
  ),
  // S12 Governance
  () => (
    <SlideFrame section="05" sectionLabel="Offer" footer="governance">
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Governance: make it survive handoff</h2>
      <p className="text-sm mb-5" style={{ color: T.ink2 }}>Standards without tests drift. Governance makes the control plane durable.</p>
      <div className="space-y-2.5">
        {[["Weekly", "Review interrupts + ledger due items"], ["Monthly", "Tighten thresholds + prune dead standards"], ["Quarterly", "Audit drift + refresh terrain hotspots"]].map(([c, a]) => (
          <div key={c} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
            <span className="text-sm font-bold w-20" style={{ color: T.oxblood }}>{c}</span>
            <span className="text-sm" style={{ color: T.ink }}>{a}</span>
          </div>
        ))}
      </div>
      <p className="text-sm font-medium mt-5" style={{ color: T.ink2 }}>Reopen rules: going backward requires evidence.</p>
    </SlideFrame>
  ),
  // S13 Transition
  () => (
    <SlideFrame footer="">
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ border: `3px solid ${T.oxblood}`, background: T.bgWarm }}>
            <div className="w-7 h-7 rounded-full" style={{ background: T.paper, border: `2px solid ${T.oxblood}25` }} />
          </div>
        </div>
      </div>
    </SlideFrame>
  ),
  // S14 Close
  () => (
    <SlideFrame footer="">
      <div className="flex flex-col justify-center" style={{ minHeight: 400 }}>
        <span className="text-xs font-bold tracking-widest mb-5" style={{ color: T.oxblood }}>CLOSE</span>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink }}>Next step</h2>
        <p className="text-lg mt-4 leading-relaxed" style={{ fontFamily: "Fraunces, Georgia, serif", color: T.ink2 }}>
          If interruptions are unowned plans,<br />let's give them<br /><strong style={{ color: T.ink }}>owners, thresholds,<br />and closure.</strong>
        </p>
        <div className="h-px w-full my-5" style={{ background: T.hairline }} />
        <p className="text-sm mb-5" style={{ color: T.muted }}>Start with the Diagnostic. I'll map your interruption geography, seed the Considerations Ledger, and deliver the Standards Pack.</p>
        <div><span className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: T.oxblood, color: T.paper }}>Book Diagnostic</span></div>
        <div className="mt-6"><div className="h-1 w-36 rounded" style={{ background: T.oxblood }} /><p className="text-sm mt-2" style={{ color: T.muted }}>Grain Ops · Casey W.</p></div>
      </div>
    </SlideFrame>
  ),
];

// ═══════════════════════════════════════════
// DECK VIEWER
// ═══════════════════════════════════════════
const DeckViewer = ({ onNav }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setCurrent(p => Math.min(p + 1, SLIDES.length - 1)); }
      if (e.key === "ArrowLeft") setCurrent(p => Math.max(p - 1, 0));
      if (e.key === "Escape") onNav("home");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNav]);

  useEffect(() => {
    let startX = 0;
    const ts = (e) => { startX = e.touches[0].clientX; };
    const te = (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 50) setCurrent(p => Math.min(p + 1, SLIDES.length - 1));
      if (diff < -50) setCurrent(p => Math.max(p - 1, 0));
    };
    window.addEventListener("touchstart", ts);
    window.addEventListener("touchend", te);
    return () => { window.removeEventListener("touchstart", ts); window.removeEventListener("touchend", te); };
  }, []);

  const Slide = SLIDES[current];

  return (
    <div style={{ background: T.ink, minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="rounded-xl overflow-hidden" style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.5)" }}>
          <Slide />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(p => Math.max(0, p - 1))} className="text-sm"
            style={{ color: current === 0 ? `${T.muted}30` : T.darkHighlight }}>← Previous</button>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === current ? T.oxblood : `${T.muted}50` }} />
              ))}
            </div>
            <span className="text-xs ml-2" style={{ color: T.muted }}>{current + 1}/{SLIDES.length}</span>
          </div>
          <button onClick={() => setCurrent(p => Math.min(SLIDES.length - 1, p + 1))} className="text-sm"
            style={{ color: current === SLIDES.length - 1 ? `${T.muted}30` : T.darkHighlight }}>Next →</button>
        </div>
        <p className="text-center text-xs mt-1.5" style={{ color: `${T.muted}60` }}>Arrow keys · Space · Swipe · Esc to close</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// APP
// ═══════════════════════════════════════════
export default function GrainOps() {
  const [view, setView] = useState("home");

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{
        background: view === "deck" ? `${T.ink}F0` : `${T.bgWarm}E8`,
        borderBottom: `1px solid ${view === "deck" ? T.darkBorder : T.hairline}`
      }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-11">
          <button onClick={() => setView("home")} className="font-bold text-sm"
            style={{ fontFamily: "Fraunces, Georgia, serif", color: view === "deck" ? T.darkHighlight : T.ink }}>
            Grain Ops
          </button>
          <div className="flex gap-1">
            {[["home", "Home"], ["deck", "Brief"]].map(([id, label]) => (
              <button key={id} onClick={() => setView(id)}
                className="px-3 py-1 rounded-md text-xs transition-all"
                style={{
                  background: view === id ? (view === "deck" ? `${T.oxblood}20` : `${T.oxblood}10`) : "transparent",
                  color: view === id ? T.oxblood : (view === "deck" ? T.darkMuted : T.muted),
                  fontWeight: view === id ? 600 : 400
                }}>{label}</button>
            ))}
          </div>
        </div>
      </nav>
      {view === "home" && <HomePage onNav={setView} />}
      {view === "deck" && <DeckViewer onNav={setView} />}
    </div>
  );
}
