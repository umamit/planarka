export interface HetZone {
  zone: number;
  name: string;
  description: string;
  coefficient: number;
}

export const HET_ZONES: HetZone[] = [
  { zone: 1, name: "Zona 1", description: "Jawa, Bali, Lampung", coefficient: 1.0 },
  { zone: 2, name: "Zona 2", description: "Sumatera, NTB, Kalsel, Sulsel", coefficient: 1.1 },
  { zone: 3, name: "Zona 3", description: "Kaltim, Kalbar, Sulteng, Sultra", coefficient: 1.2 },
  { zone: 4, name: "Zona 4", description: "NTT, Gorontalo, Kaltara, Sulbar", coefficient: 1.3 },
  { zone: 5, name: "Zona 5", description: "Maluku, Maluku Utara (Taliabu), Papua", coefficient: 1.45 },
];

export const DEFAULT_HET_ZONE = 5;
