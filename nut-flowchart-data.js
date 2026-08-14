// Static flowchart text shown on the nut selector page. Edit this string
// directly to update the flowchart (kept in sync by hand with
// nut-selection-flowchart.txt, which is the plain-text authoring copy).

const nutFlowchart = 
`Do you need a locking feature?
├─ No  ─► Do you need a flange?
│         ├─ No  ─► What nut height?
│         │         ├─ Thin   ─► Coarse: ISO 4035 | Fine: ISO 8675
│         │         ├─ Normal ─► Coarse: ISO 4032 | Fine: ISO 8673
│         │         └─ Tall   ─► Coarse: ISO 4033 | Fine: ISO 8674
│         └─ Yes ─► Coarse: ISO 4161 | Fine: ISO 10663
│
└─ Yes ─► Do you need a flange?
          ├─ No  ─► What type of insert?
          │         ├─ Nylon ─► What nut height?
          │         │           ├─ Thin   ─► Coarse: ISO 10511 | Fine: NO
          │         │           ├─ Normal ─► Coarse: ISO 7040  | Fine: ISO 10512
          │         │           └─ Tall   ─► Coarse: ISO 7041  | Fine: NO
          │         └─ Metal ─► What nut height?
          │                     ├─ Normal ─► Coarse: ISO 7719  | Fine: NO
          │                     ├─ Tall   ─► Coarse: ISO 7042  | Fine: ISO 10513
          │                     └─ Taller ─► Coarse: ISO 7720† | Fine: NO
          └─ Yes ─► What type of insert?
                    ├─ Nylon ─► Coarse: ISO 7043 | Fine: ISO 12125
                    └─ Metal ─► Coarse: ISO 7044 | Fine: ISO 12126

†In 2025, ISO completely changed what ISO 7720 means.`;

document.getElementById("flowchart").textContent = nutFlowchart;
