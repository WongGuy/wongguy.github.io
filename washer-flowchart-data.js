// Static flowchart text shown on the washer selector page. Edit this string
// directly to update the flowchart (kept in sync by hand with
// washer-flowchart.txt, the plain-text authoring copy).

const washerFlowchart =
`What is going through the washer?

[Clevis Pin] ─────────────────────────► ISO 8738   ⌀3-100
[Captive Screw] ──────────────────────► ISO 10673  M2-M12

[Regular Bolt/Screw, Up to Class 10.9] (Grade A, Default)
 ├─ Small ───── (~1.7-2x Screw Diam) ─► ISO 7092   M1.6-M36
 ├─ Normal      (~2x Screw Diam)
 │  ├─ Default ───────────────────────► ISO 7089   M1.6-M64
 │  └─ Chamfered ─────────────────────► ISO 7090   M5-M64
 └─ Large ───── (~3x Screw Diam) ─────► ISO 7093-1 M3-M36

[Regular Bolt/Screw, Up to Class 6.8] (Grade C)
 ├─ Normal ──── (~2x Screw Diam) ─────► ISO 7091   M1.6-M64
 ├─ Large ───── (~3x Screw Diam) ─────► ISO 7093-2 M3-M36
 └─ Extra large (~3.5x Screw Diam) ───► ISO 7094   M5-M36`; 
(function () {
  const flowchartEl = document.getElementById("flowchart");
  flowchartEl.textContent = washerFlowchart;
})();
