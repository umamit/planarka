"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle, FileWarning } from "lucide-react";
import { parseDapodikFile, ParsedDapodikData } from "@/lib/calculations/dapodik-parser";

interface DapodikUploaderProps {
  onDataParsed: (data: ParsedDapodikData) => void;
}

export function DapodikUploader({ onDataParsed }: DapodikUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseDapodikFile(text, file.name);
        
        // Validasi apakah ada data yang berhasil diekstrak
        const hasData = Object.values(parsed.students).some((val) => val > 0);
        if (hasData) {
          setStatus("success");
          onDataParsed(parsed);
        } else {
          setStatus("error");
        }
      } else {
        setStatus("error");
      }
    };
    reader.onerror = () => setStatus("error");
    reader.readAsText(file);
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
          accept=".json,.xml"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {status === "idle" && (
          <div className="flex flex-col items-center justify-center space-y-1 text-zinc-500">
            <UploadCloud className="h-6 w-6 text-zinc-400" />
            <span className="font-semibold text-zinc-700">Impor Otomatis Dapodik</span>
            <span className="text-[10px] text-zinc-400">Seret & lepas berkas ekspor .json / .xml Dapodik di sini</span>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-1 text-emerald-800">
            <CheckCircle className="h-6 w-6 text-emerald-600 animate-bounce" />
            <span className="font-bold">Parsing Dapodik Berhasil!</span>
            <span className="text-[10px] text-emerald-600 font-mono truncate max-w-[250px]">{fileName}</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-1 text-rose-800">
            <FileWarning className="h-6 w-6 text-rose-600" />
            <span className="font-bold">Format Berkas Tidak Valid</span>
            <span className="text-[10px] text-rose-500">Gunakan berkas ekspor JSON/XML asli dari aplikasi Dapodik</span>
          </div>
        )}
      </div>
    </div>
  );
}
