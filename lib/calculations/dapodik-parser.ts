export interface ParsedDapodikData {
  students: { [grade: number]: number };
  rombels: { [grade: number]: number };
}

export function parseDapodikFile(fileContent: string, fileName: string): ParsedDapodikData {
  const students: { [grade: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  const rombels: { [grade: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  const isJson = fileName.toLowerCase().endsWith(".json") || fileContent.trim().startsWith("{");

  if (isJson) {
    try {
      const parsed = JSON.parse(fileContent);
      // Mendukung format json dapodik bersarang atau flat
      const rows = Array.isArray(parsed) ? parsed : parsed.data || parsed.rows || [];
      
      rows.forEach((row: any) => {
        const grade = Number(row.tingkat_kelas || row.class_grade || row.grade);
        const count = Number(row.jumlah_siswa || row.student_count || row.students || 0);
        const rombelCount = Number(row.jumlah_rombel || row.rombel_count || row.rombels || 1);

        if (grade >= 1 && grade <= 9) {
          students[grade] = count;
          rombels[grade] = rombelCount;
        }
      });
    } catch (e) {
      console.error("Gagal mengurai JSON Dapodik:", e);
    }
  } else {
    // Parser XML sederhana menggunakan regex/string ops untuk kompatibilitas Next.js Edge & Client
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, "text/xml");
      const items = xmlDoc.getElementsByTagName("rombel") || xmlDoc.getElementsByTagName("kelas");

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const gradeText = item.getElementsByTagName("tingkat_kelas")[0]?.textContent || item.getAttribute("grade") || "0";
        const studentsText = item.getElementsByTagName("jumlah_siswa")[0]?.textContent || item.getAttribute("students") || "0";
        const rombelText = item.getElementsByTagName("jumlah_rombel")[0]?.textContent || item.getAttribute("rombels") || "1";

        const grade = Number(gradeText);
        if (grade >= 1 && grade <= 9) {
          students[grade] = Number(studentsText);
          rombels[grade] = Number(rombelText);
        }
      }
    } catch (e) {
      console.error("Gagal mengurai XML Dapodik:", e);
    }
  }

  return { students, rombels };
}
