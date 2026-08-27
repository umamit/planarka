export interface PlanarkaDraftState {
  version: string;
  savedAt: string;
  npsn: string;
  schoolName: string;
  headmasterName: string;
  headmasterNip: string;
  fiscalYear: number;
  hetZone: number;
  studentCount: number;
  unitCost: number;
  silpa: number;
  bosKinerja: number;
  shiftItems: any[];
}

const STORAGE_KEY = "planarka_rkas_draft_v1";

const DEFAULT_STATE: PlanarkaDraftState = {
  version: "1.0",
  savedAt: new Date().toISOString(),
  npsn: "60200589",
  schoolName: "SD Negeri 1 Bobong",
  headmasterName: "Husnita Usman, S.Pd., M.Pd.",
  headmasterNip: "19820514 200801 2 015",
  fiscalYear: 2026,
  hetZone: 5,
  studentCount: 0,
  unitCost: 0,
  silpa: 0,
  bosKinerja: 0,
  shiftItems: [],
};

export function saveDraftLocally(state: Partial<PlanarkaDraftState>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadDraftLocally() || DEFAULT_STATE;
    const updated: PlanarkaDraftState = {
      ...existing,
      ...state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Gagal menyimpan draft lokal:", e);
  }
}

export function loadDraftLocally(): PlanarkaDraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function exportBackupJson(state: PlanarkaDraftState): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Backup_RKAS_${state.schoolName.replace(/\s+/g, "_")}_${state.fiscalYear}.planarka.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
