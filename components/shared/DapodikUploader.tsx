"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle, FileWarning } from "lucide-react";
import { parseDapodikExcel, ParsedDapodikData } from "@/lib/calculations/dapodik-parser";

interface DapodikUploaderProps {
  onDataParsed: (data: ParsedDapodikData) => void;
}

export function DapodikUploader({ onDataParsed }: DapodikUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    setStatus("idle");
    
    try {
      const parsed = await parseDapodikExcel(file);
      
      // Cek apakah ada data siswa yang berhasil dideteksi
      const hasData = Object.values(parsed.students).some((val) => val > 0);
      if (hasData) {
        setStatus("success");
        onDataParsed(parsed);
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full text-xs">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-xl border border-dashed p-4 text-center transition-all ${
          dragActive
            ? "border-zinc-900 bg-zinc-50"
            : status === "success"
            ? "border-emerald-300 bg-emerald-50/30"
            : status === "error"
            ? "border-rose-300 bg-rose-50/30"
            : "border-zinc-300 bg-white hover:bg-zinc-50/30"
        }`}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-zinc-500 py-1">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
            <span className="text-[10px] font-medium">Membaca file Excel Dapodik...</span>
          </div>
        ) : (
          <>
            {status === "idle" && (
              <div className="flex flex-col items-center justify-center space-y-1 text-zinc-500">
                <UploadCloud className="h-6 w-6 text-zinc-400" />
                <span className="font-semibold text-zinc-700">Impor Otomatis Dapodik</span>
                <span className="text-[10px] text-zinc-400">Seret & lepas berkas Excel (.xlsx) SP Datadik di sini</span>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center space-y-1 text-emerald-800">
                <CheckCircle className="h-6 w-6 text-emerald-600 animate-bounce" />
                <span className="font-bold">Dapodik Berhasil Di-parse!</span>
                <span className="text-[10px] text-emerald-600 font-mono truncate max-w-[250px]">{fileName}</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center space-y-1 text-rose-800">
                <FileWarning className="h-6 w-6 text-rose-600" />
                <span className="font-bold">Format Excel Tidak Cocok</span>
                <span className="text-[10px] text-rose-500">Gunakan file Excel asli hasil unduhan portal SP Datadik</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
