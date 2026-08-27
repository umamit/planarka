import { MasterBook } from "../constants/sample-books";

export interface BookProcurementItem {
  book: MasterBook;
  rombelCount: number;
  studentCount: number;
  exemplarsNeeded: number;
  hetUnitCost: number;
  shippingUnitCost: number;
  totalCost: number;
}

export function calculateBookProcurement(
  books: MasterBook[],
  studentCountsPerGrade: { [grade: number]: number },
  rombelCountsPerGrade: { [grade: number]: number },
  hetZone: number,
  shippingCostPerItem: number = 0
): {
  items: BookProcurementItem[];
  totalProcurementCost: number;
  totalExemplars: number;
} {
  let totalProcurementCost = 0;
  let totalExemplars = 0;

  const items: BookProcurementItem[] = books.map((book) => {
    const students = studentCountsPerGrade[book.classGrade] || 0;
    const rombels = rombelCountsPerGrade[book.classGrade] || 1;
    // Buku Siswa = 1 per siswa, Buku Guru = 1 per rombel
    const exemplars = book.bookType === "Siswa" ? students : rombels;
    const hetUnitCost = book.hetZones[hetZone] || book.hetZones[1];
    const totalCost = exemplars * (hetUnitCost + shippingCostPerItem);

    totalProcurementCost += totalCost;
    totalExemplars += exemplars;

    return {
      book,
      rombelCount: rombels,
      studentCount: students,
      exemplarsNeeded: exemplars,
      hetUnitCost,
      shippingUnitCost: shippingCostPerItem,
      totalCost,
    };
  });

  return { items, totalProcurementCost, totalExemplars };
}
