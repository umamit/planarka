"use client";

import React from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

interface LetterheadLogoUploadProps {
  leftLogo: string | null;
  rightLogo: string | null;
  onLeftLogoChange: (base64: string | null) => void;
  onRightLogoChange: (base64: string | null) => void;
}

export function LetterheadLogoUpload({
  leftLogo,
  rightLogo,
  onLeftLogoChange,
  onRightLogoChange,
}: LetterheadLogoUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isLeft: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (isLeft) onLeftLogoChange(reader.result as string);
        else onRightLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-dashed border-zinc-300 p-3 text-center bg-zinc-50/50">
        <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
          Logo Kiri (Pemda / Tut Wuri)
        </label>
        {leftLogo ? (
          <div className="relative inline-block">
            <img src={leftLogo} alt="Logo Kiri" className="h-12 w-12 object-contain mx-auto rounded-lg border bg-white p-1" />
            <button
              onClick={() => onLeftLogoChange(null)}
              className="text-[10px] text-rose-600 font-semibold block mt-1 hover:underline"
            >
              Hapus
            </button>
          </div>
        ) : (
          <label className="cursor-pointer inline-flex flex-col items-center justify-center p-2 text-zinc-500 hover:text-zinc-900">
            <UploadCloud className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Unggah Logo Kiri</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, true)} />
          </label>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 p-3 text-center bg-zinc-50/50">
        <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
          Logo Kanan (Logo Sekolah)
        </label>
        {rightLogo ? (
          <div className="relative inline-block">
            <img src={rightLogo} alt="Logo Kanan" className="h-12 w-12 object-contain mx-auto rounded-lg border bg-white p-1" />
            <button
              onClick={() => onRightLogoChange(null)}
              className="text-[10px] text-rose-600 font-semibold block mt-1 hover:underline"
            >
              Hapus
            </button>
          </div>
        ) : (
          <label className="cursor-pointer inline-flex flex-col items-center justify-center p-2 text-zinc-500 hover:text-zinc-900">
            <UploadCloud className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Unggah Logo Kanan</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, false)} />
          </label>
        )}
      </div>
    </div>
  );
}
