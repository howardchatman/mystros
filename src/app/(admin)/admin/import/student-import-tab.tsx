"use client";

import { useState, useTransition, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { parseCSV, validateHeaders } from "@/lib/utils/csv-parser";
import { importStudents, type ImportResult } from "@/lib/actions/import";

const REQUIRED_HEADERS = ["first_name", "last_name", "email", "program_code", "campus_code"];
const ALL_HEADERS = [...REQUIRED_HEADERS, "phone", "student_number", "enrollment_date", "status"];

export function StudentImportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;

    setFile(f);
    setResult(null);
    setHeaderErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setHeaderErrors(["CSV file is empty or has no data rows."]);
        setParsedRows([]);
        return;
      }

      const headers = Object.keys(rows[0]!);
      const { valid, missing } = validateHeaders(headers, REQUIRED_HEADERS);
      if (!valid) {
        setHeaderErrors(missing.map((m) => `Missing required column: ${m}`));
      }
      setParsedRows(rows);
    };
    reader.readAsText(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleImport = () => {
    startTransition(async () => {
      const res = await importStudents(parsedRows as any);
      setResult(res);
    });
  };

  const handleClear = () => {
    setFile(null);
    setParsedRows([]);
    setHeaderErrors([]);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Template download */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Download Template</p>
              <p className="text-xs text-muted-foreground">
                Required columns: {REQUIRED_HEADERS.join(", ")}
              </p>
            </div>
            <a href="/templates/students-import-template.csv" download>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Template CSV
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* File upload */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Drop a CSV file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Accepted: .csv files</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {file.name}
                <Badge variant="secondary">{parsedRows.length} rows</Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Header validation errors */}
            {headerErrors.length > 0 && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {headerErrors.map((e, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" /> {e}
                  </p>
                ))}
              </div>
            )}

            {/* Preview table */}
            {parsedRows.length > 0 && headerErrors.length === 0 && (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 pr-3 text-left font-medium">#</th>
                        {ALL_HEADERS.map((h) => (
                          <th key={h} className="pb-2 pr-3 text-left font-medium">
                            {h}
                            {REQUIRED_HEADERS.includes(h) && <span className="text-destructive">*</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="py-1.5 pr-3 text-muted-foreground">{i + 1}</td>
                          {ALL_HEADERS.map((h) => (
                            <td
                              key={h}
                              className={`py-1.5 pr-3 max-w-[120px] truncate ${
                                REQUIRED_HEADERS.includes(h) && !row[h]?.trim() ? "text-destructive" : ""
                              }`}
                            >
                              {row[h] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 10 && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Showing first 10 of {parsedRows.length} rows.
                  </p>
                )}
              </>
            )}

            {/* Import button */}
            {parsedRows.length > 0 && headerErrors.length === 0 && !result && (
              <Button onClick={handleImport} isLoading={isPending}>
                Import {parsedRows.length} Students
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {result.failed === 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <Badge variant="default">{result.imported} imported</Badge>
              {result.failed > 0 && (
                <Badge variant="destructive">{result.failed} failed</Badge>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-60 overflow-y-auto text-sm space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-destructive text-xs">
                    Row {e.row}{e.field ? ` (${e.field})` : ""}: {e.error}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
