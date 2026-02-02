"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CsvExportProps {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

export function CsvExport({ filename, headers, rows }: CsvExportProps) {
  const handleExport = () => {
    const escape = (v: string | number) => {
      const str = String(v);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      headers.map(escape).join(","),
      ...rows.map((row) => row.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button size="sm" variant="outline" onClick={handleExport}>
      <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
    </Button>
  );
}
