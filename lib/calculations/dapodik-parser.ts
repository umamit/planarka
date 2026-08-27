import * as XLSX from "xlsx";

export interface ParsedDapodikData {
  students: { [grade: number]: number };
  rombels: { [grade: number]: number };
}

// Mengurai berkas Excel (.xlsx / .csv) hasil unduhan portal SP Datadik / Dapodik
export async function parseDapodikExcel(file: File): Promise<ParsedDapodikData> {
  const students: { [grade: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  const rombels: { [grade: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ students, rombels });
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Konversi sheet ke array baris 2D
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        // Pindai baris-baris Excel untuk mencari informasi Kelas (Tingkat) dan Jumlah Murid
        rows.forEach((row: any) => {
          if (!Array.isArray(row)) return;

          // Cari kolom tingkat kelas (biasanya angka 1-9 atau romawi I-IX)
          const rowStr = row.map(cell => String(cell || "").trim());
          
          let detectedGrade = 0;
          let detectedStudentsCount = 0;
          let detectedRombelsCount = 0;

          rowStr.forEach((cell, idx) => {
            const cellClean = cell.toLowerCase();

            // Deteksi baris yang memuat info Kelas/Tingkat
            if (cellClean.includes("kelas") || cellClean.includes("tingkat")) {
              // Cari angka di dalam teks cell (misal "Kelas 1", "Tingkat 4", "Kelas VII")
              const numMatch = cellClean.match(/\d+/);
              if (numMatch) {
                detectedGrade = Number(numMatch[0]);
              } else if (cellClean.includes("vii")) {
                detectedGrade = 7;
              } else if (cellClean.includes("viii")) {
                detectedGrade = 8;
              } else if (cellClean.includes("ix")) {
                detectedGrade = 9;
              } else if (cellClean.includes("vi")) {
                detectedGrade = 6;
              } else if (cellClean.includes("iv")) {
                detectedGrade = 4;
              } else if (cellClean.includes("v")) {
                detectedGrade = 5;
              } else if (cellClean.includes("iii")) {
                detectedGrade = 3;
              } else if (cellClean.includes("ii")) {
                detectedGrade = 2;
              } else if (cellClean.includes("i")) {
                detectedGrade = 1;
              }
            }

            // Jika sel adalah angka tingkat 1-9 langsung
            const directNum = Number(cell);
            if (!isNaN(directNum) && directNum >= 1 && directNum <= 9 && detectedGrade === 0) {
              detectedGrade = directNum;
            }
          });

          // Jika tingkat kelas terdeteksi, cari angka jumlah siswa di baris yang sama
          if (detectedGrade >= 1 && detectedGrade <= 9) {
            row.forEach((cell) => {
              const num = Number(cell);
              // Jumlah siswa biasanya bernilai puluhan (misal 10-40 siswa per kelas)
              if (!isNaN(num) && num > 0 && num !== detectedGrade) {
                if (detectedStudentsCount === 0 && num > 5) {
                  detectedStudentsCount = num;
                } else if (detectedRombelsCount === 0 && num >= 1 && num <= 5) {
                  detectedRombelsCount = num;
                }
              }
            });

            // Set ke data state hasil parse
            if (detectedStudentsCount > 0) {
              students[detectedGrade] = detectedStudentsCount;
            }
            rombels[detectedGrade] = detectedRombelsCount || 1;
          }
        });

        resolve({ students, rombels });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
