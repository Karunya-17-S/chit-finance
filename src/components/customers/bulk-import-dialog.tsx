"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataStore } from "@/store/data-store";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (customers: any[]) => void;
  branchId?: string;
}

interface ImportPreview {
  row: number;
  data: Record<string, any>;
  errors: string[];
  valid: boolean;
}

// Required fields that must be present in the file
const REQUIRED_FIELDS = [
  "name",
  "phone",
  "address",
  "aadhaarNumber",
  "panNumber",
  "occupation",
  "monthlyIncome",
  "nomineeName",
  "nomineePhone",
  "joinedDate",
];

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  alternatePhone: "Alternate Phone",
  address: "Address",
  aadhaarNumber: "Aadhaar Number",
  panNumber: "PAN Number",
  occupation: "Occupation",
  monthlyIncome: "Monthly Income",
  nomineeName: "Nominee Name",
  nomineePhone: "Nominee Phone",
  joinedDate: "Joined Date",
  status: "Status",
};

export function BulkImportDialog({
  open,
  onOpenChange,
  onImport,
  branchId,
}: BulkImportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<ImportPreview[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState<"upload" | "preview" | "importing" | "complete">("upload");
  const [progress, setProgress] = React.useState(0);
  const [fileHeaders, setFileHeaders] = React.useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        let data: any[] = [];
        let headers: string[] = [];

        if (file.name.endsWith(".csv")) {
          const csv = Papa.parse(event.target?.result as string, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header: string) => header.trim(),
          });

          data = csv.data as any[];
          headers = csv.meta.fields || [];
        } else {
          const workbook = XLSX.read(event.target?.result, {
            type: "array",
          });

          const sheet = workbook.Sheets[workbook.SheetNames[0]];

          // Read sheet as 2D array
          const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            blankrows: false,
          }) as any[][];

          // Find the header row automatically
          let headerRowIndex = rows.findIndex((row) => {
            return (
              row &&
              row.some(
                (cell: any) =>
                  String(cell).trim().toLowerCase() === "name"
              )
            );
          });

          if (headerRowIndex === -1) {
            throw new Error(
              'Cannot find header row. The file must contain a "name" column.'
            );
          }

          headers = rows[headerRowIndex].map((h: any) =>
            String(h).trim()
          );

          data = rows.slice(headerRowIndex + 1).map((row) => {
            const obj: Record<string, any> = {};

            headers.forEach((header, index) => {
              obj[header] =
                row[index] !== undefined
                  ? String(row[index]).trim()
                  : "";
            });

            return obj;
          });
        }

        console.log("Headers:", headers);
        console.log("Data:", data);

        setFileHeaders(headers);

        const previewData = data.map((row, index) => {
          const errors: string[] = [];

          REQUIRED_FIELDS.forEach((field) => {
            if (!row[field] || row[field].toString().trim() === '') {
              errors.push(`Missing "${FIELD_LABELS[field]}"`);
            }
          });

          // Validate phone
          if (row.phone && !/^[0-9]{10}$/.test(row.phone.toString().trim())) {
            errors.push("Phone must be 10 digits");
          }

          // Validate alternate phone
          if (row.alternatePhone && !/^[0-9]{10}$/.test(row.alternatePhone.toString().trim())) {
            errors.push("Alternate phone must be 10 digits");
          }

          // Validate Aadhaar
          if (row.aadhaarNumber && !/^[0-9]{12}$/.test(row.aadhaarNumber.toString().trim())) {
            errors.push("Aadhaar must be 12 digits");
          }

          // Validate PAN
          const pan = row.panNumber?.toString().trim().toUpperCase() || '';
          if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
            errors.push("Invalid PAN format (e.g., ABCDE1234F)");
          }

          // Validate monthly income
          if (row.monthlyIncome && isNaN(Number(row.monthlyIncome))) {
            errors.push("Monthly Income must be numeric");
          }

          // Validate joined date
          if (row.joinedDate) {
            const d = new Date(row.joinedDate);
            if (isNaN(d.getTime())) {
              errors.push("Invalid Joined Date (use YYYY-MM-DD)");
            }
          }

          return {
            row: index + 2,
            data: row,
            errors,
            valid: errors.length === 0,
          };
        });

        setPreview(previewData);
        setStep("preview");
      } catch (err) {
        console.error(err);
        alert("Unable to parse the file: " + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = async () => {
    // Filter valid rows
    const validRows = preview.filter((p) => p.valid);
    
    if (validRows.length === 0) {
      alert("No valid rows to import. Please fix the errors.");
      return;
    }

    setStep("importing");
    setProgress(0);

    // Get current customers to find max ID
    const currentCustomers = useDataStore.getState().customers;
    const maxId = currentCustomers.reduce((max, c) => {
      const num = parseInt(c.id.replace('cust-', ''));
      return num > max ? num : max;
    }, 0);

    // Map valid rows to customer objects with unique IDs
    const customers = validRows.map((p, index) => {
      const data = p.data;
      const newId = `cust-${String(maxId + index + 1).padStart(3, "0")}`;
      return {
        id: newId,
        customerCode: `SVCF-C${String(maxId + index + 1).padStart(3, "0")}`,
        passbookNumber: data.passbookNumber || `SVCF-PB-${String(maxId + index + 1).padStart(3, "0")}`,
        assignedEmployeeId: null,
        name: data.name || "",
        phone: data.phone || "",
        alternatePhone: data.alternatePhone || undefined,
        address: data.address || "",
        aadhaarNumber: data.aadhaarNumber || "",
        panNumber: data.panNumber?.toUpperCase() || "",
        occupation: data.occupation || "",
        monthlyIncome: Number(data.monthlyIncome) || 0,
        nomineeName: data.nomineeName || "",
        nomineePhone: data.nomineePhone || "",
        joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
        branchId: branchId || data.branchId || "br-001",
        status: (data.status?.toLowerCase() === "inactive" ? "inactive" : "active") as any,
        avatarUrl: undefined,
      };
    });

    console.log("Importing customers:", customers);

    // Simulate progress
    const total = customers.length;
    for (let i = 0; i <= total; i++) {
      setProgress(Math.round((i / total) * 100));
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Call the import function
    onImport(customers);
    setStep("complete");
    
    setTimeout(() => {
      onOpenChange(false);
      resetState();
    }, 2000);
  };

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setStep("upload");
    setProgress(0);
    setIsLoading(false);
    setFileHeaders([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "name",
      "phone",
      "alternatePhone",
      "address",
      "aadhaarNumber",
      "panNumber",
      "occupation",
      "monthlyIncome",
      "nomineeName",
      "nomineePhone",
      "joinedDate",
      "status",
      "passbookNumber",
    ];

    const sampleData = {
      name: "Rajesh Kumar",
      phone: "9876543210",
      alternatePhone: "9876543211",
      address: "123 Main Street, City",
      aadhaarNumber: "123456789012",
      panNumber: "ABCDE1234F",
      occupation: "Business",
      monthlyIncome: "50000",
      nomineeName: "Jane Doe",
      nomineePhone: "9876543212",
      joinedDate: new Date().toISOString().split('T')[0],
      status: "active",
      passbookNumber: "SVCF-PB-001",
    };

    const ws = XLSX.utils.json_to_sheet([sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customer_import_template.xlsx");
  };

  const validCount = preview.filter((p) => p.valid).length;
  const errorCount = preview.filter((p) => !p.valid).length;

  // Check if headers match expected format
  const hasValidHeaders = fileHeaders.some(h => 
    REQUIRED_FIELDS.some(f => h.toLowerCase().trim() === f.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Customers
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with customer data.
            <Button 
              variant="link" 
              className="px-1 h-auto text-maroon font-semibold"
              onClick={downloadTemplate}
            >
              <Download className="h-3 w-3 mr-1" />
              Download Template
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-4 pr-2">
            {step === "upload" && (
              <>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-300">📋 How to import:</p>
                  <ol className="mt-2 list-decimal pl-5 text-blue-700 dark:text-blue-400 space-y-1">
                    <li>Click <strong>"Download Template"</strong> above to get the Excel file</li>
                    <li>Fill in customer details (required fields are marked)</li>
                    <li>Save the file as CSV or Excel format</li>
                    <li>Upload the file using the box below</li>
                  </ol>
                </div>

                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors",
                    file ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border hover:border-maroon"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setFile(file);
                      parseFile(file);
                    }
                  }}
                >
                  {file ? (
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="h-12 w-12 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-destructive"
                          onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          <X className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports .csv, .xlsx, .xls
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-medium">⚠️ Required Fields:</p>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <span>• Name</span>
                    <span>• Phone</span>
                    <span>• Address</span>
                    <span>• Aadhaar Number</span>
                    <span>• PAN Number</span>
                    <span>• Occupation</span>
                    <span>• Monthly Income</span>
                    <span>• Nominee Name</span>
                    <span>• Nominee Phone</span>
                    <span>• Joined Date</span>
                  </div>
                </div>
              </>
            )}

            {step === "preview" && (
              <>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      <span className="text-green-600">{validCount}</span> valid
                      {errorCount > 0 && (
                        <span className="ml-2 text-red-600">{errorCount} with errors</span>
                      )}
                    </span>
                    {!hasValidHeaders && fileHeaders.length > 0 && (
                      <span className="text-xs text-amber-600">
                        ⚠️ Headers may not match expected format. Use the template.
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStep("upload");
                        setPreview([]);
                      }}
                    >
                      Back
                    </Button>
                  </div>
                </div>

                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {preview.map((item) => (
                      <div
                        key={item.row}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3",
                          item.valid ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"
                        )}
                      >
                        <div className="mt-0.5">
                          {item.valid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium">Row {item.row}</p>
                          <p className="text-muted-foreground">{item.data.name || "Unnamed"}</p>
                          {item.errors.length > 0 && (
                            <ul className="mt-1 list-disc pl-4 text-red-600">
                              {item.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            {step === "importing" && (
              <div className="space-y-4 py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
                  <p className="mt-4 font-medium">Importing customers...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we process your data</p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">{progress}% complete</p>
              </div>
            )}

            {step === "complete" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="mt-4 text-lg font-semibold">Import Complete!</p>
                <p className="text-sm text-muted-foreground">
                  Successfully imported {validCount} customers.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer with Import Button */}
        <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
          {step === "preview" && (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("upload");
                  setFile(null);
                  setPreview([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Choose Different File
              </Button>
              <Button
                className="flex-1 bg-maroon hover:bg-maroon-dark"
                onClick={handleImport}
                disabled={validCount === 0}
              >
                Import {validCount} Customers
              </Button>
            </div>
          )}
          {(step === "upload" || step === "importing" || step === "complete") && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetState();
              }}
              disabled={step === "importing"}
            >
              {step === "upload" ? "Cancel" : "Close"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}