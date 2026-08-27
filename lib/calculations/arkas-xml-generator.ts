export interface ArkasXmlItem {
  snpCode: string;
  accountCode: string;
  activityName: string;
  initialBudget: number;
  shiftDelta: number;
  finalBudget: number;
}

export function generateArkasXml(
  schoolName: string,
  npsn: string,
  fiscalYear: number,
  items: ArkasXmlItem[]
): string {
  // Melakukan HTML/XML entity escape untuk mengamankan karakter khusus
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case "\"": return "&quot;";
        default: return c;
      }
    });
  };

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rkas_shift_document>\n`;
  xml += `  <metadata>\n`;
  xml += `    <school_name>${escapeXml(schoolName)}</school_name>\n`;
  xml += `    <npsn>${escapeXml(npsn)}</npsn>\n`;
  xml += `    <fiscal_year>${fiscalYear}</fiscal_year>\n`;
  xml += `    <district>Kabupaten Pulau Taliabu</district>\n`;
  xml += `    <province>Maluku Utara</province>\n`;
  xml += `    <export_timestamp>${new Date().toISOString()}</export_timestamp>\n`;
  xml += `  </metadata>\n`;
  xml += `  <budget_items>\n`;

  items.forEach((item) => {
    xml += `    <budget_item>\n`;
    xml += `      <snp_code>${escapeXml(item.snpCode)}</snp_code>\n`;
    xml += `      <account_code>${escapeXml(item.accountCode)}</account_code>\n`;
    xml += `      <activity_name>${escapeXml(item.activityName)}</activity_name>\n`;
    xml += `      <initial_budget>${item.initialBudget}</initial_budget>\n`;
    xml += `      <shifted_amount>${item.shiftDelta}</shifted_amount>\n`;
    xml += `      <final_budget>${item.finalBudget}</final_budget>\n`;
    xml += `    </budget_item>\n`;
  });

  xml += `  </budget_items>\n`;
  xml += `</rkas_shift_document>`;

  return xml;
}
