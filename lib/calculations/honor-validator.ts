export interface HonorTeacher {
  id: string;
  name: string;
  nuptk: string;
  isRegisteredDapodik: boolean;
  isNonAsn: boolean;
  hasCertificationTpg: boolean;
  monthlyHonor: number;
  monthsCount: number;
}

export interface TeacherValidationResult {
  teacher: HonorTeacher;
  isEligible: boolean;
  annualTotal: number;
  ineligibilityReasons: string[];
}

export function validateHonorTeachers(
  teachers: HonorTeacher[]
): {
  results: TeacherValidationResult[];
  totalEligibleHonor: number;
  totalIneligibleHonor: number;
} {
  let totalEligibleHonor = 0;
  let totalIneligibleHonor = 0;

  const results: TeacherValidationResult[] = teachers.map((teacher) => {
    const reasons: string[] = [];
    const annualTotal = teacher.monthlyHonor * teacher.monthsCount;

    if (!teacher.isNonAsn) {
      reasons.push("Berstatus ASN/PPPK (Dilarang menerima honor BOS)");
    }
    if (!teacher.isRegisteredDapodik) {
      reasons.push("Belum terdaftar di Dapodik");
    }
    if (!teacher.nuptk || teacher.nuptk.trim().length < 10) {
      reasons.push("NUPTK belum valid/tidak terdaftar");
    }
    if (teacher.hasCertificationTpg) {
      reasons.push("Sudah menerima Tunjangan Profesi Guru (TPG/Sertifikasi)");
    }

    const isEligible = reasons.length === 0;

    if (isEligible) {
      totalEligibleHonor += annualTotal;
    } else {
      totalIneligibleHonor += annualTotal;
    }

    return {
      teacher,
      isEligible,
      annualTotal,
      ineligibilityReasons: reasons,
    };
  });

  return { results, totalEligibleHonor, totalIneligibleHonor };
}
