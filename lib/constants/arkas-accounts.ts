export interface ArkasAccount {
  code: string;
  name: string;
  category: "barang_jasa" | "modal" | "operasional" | "honor";
  isRestricted?: boolean;
}

export const ARKAS_ACCOUNTS: ArkasAccount[] = [
  { code: "5.1.02.01.01.0024", name: "Belanja Alat Tulis Kantor (ATK)", category: "barang_jasa" },
  { code: "5.1.02.01.01.0026", name: "Belanja Bahan Praktik Pembelajaran", category: "barang_jasa" },
  { code: "5.1.02.02.01.0013", name: "Belanja Langganan Daya & Jasa Listrik", category: "operasional" },
  { code: "5.1.02.02.01.0014", name: "Belanja Langganan Internet & Komunikasi", category: "operasional" },
  { code: "5.1.02.02.01.0026", name: "Belanja Jasa Tenaga Kependidikan / Honor Guru Non-ASN", category: "honor" },
  { code: "5.1.02.02.01.0061", name: "Belanja Pemeliharaan Sarana Gedung Ringan", category: "barang_jasa" },
  { code: "5.2.02.05.01.0001", name: "Belanja Modal Komputer / Laptop Pembelajaran", category: "modal" },
  { code: "5.2.05.01.01.0001", name: "Belanja Modal Buku Teks Kurikulum Merdeka", category: "modal" },
];
