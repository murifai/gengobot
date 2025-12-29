'use client';

import { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MondaiConfig } from '@/config/jlpt-mondai-config';

interface BulkImportModalProps {
  level: string;
  section: string;
  mondai: number;
  mondaiConfig: MondaiConfig;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportModal({
  level,
  section,
  mondai,
  mondaiConfig,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
      setWarnings([]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setErrors([]);
    setWarnings([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('level', level);
      formData.append('section', section);
      formData.append('mondai', mondai.toString());

      const response = await fetch('/api/jlpt/questions/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setWarnings(data.warnings || []);
        if (data.warnings.length === 0) {
          // Auto-close on success with no warnings
          setTimeout(() => onSuccess(), 1500);
        }
      } else {
        setErrors(data.errors || ['Import failed']);
        setWarnings(data.warnings || []);
      }
    } catch (error) {
      console.error('Import error:', error);
      setErrors(['Failed to import questions. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        `/api/jlpt/questions/template?level=${level}&section=${section}&mondai=${mondai}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jlpt_${level}_${section}_mondai${mondai}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Bulk Import Questions - {level} / Mondai {mondai}
          </DialogTitle>
          <DialogDescription>
            {mondaiConfig.name} - Import multiple questions from Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Download Template */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                1
              </span>
              Download Template
            </h3>
            <div className="pl-8">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Excel Template
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Template includes {mondaiConfig.questionNumbers.length} question slots
                {mondaiConfig.requiresPassage &&
                  ` and ${mondaiConfig.passageCount || 1} passage(s)`}
              </p>
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                2
              </span>
              Upload Completed File
            </h3>
            <div className="pl-8">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Choose Excel File</span>
                  </Button>
                </label>
                {file && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Results */}
          {(errors.length > 0 || warnings.length > 0 || result) && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                  3
                </span>
                Results
              </h3>
              <div className="pl-8 space-y-2">
                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Errors found:</strong>
                      <ul className="list-disc pl-5 mt-2">
                        {errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warnings:</strong>
                      <ul className="list-disc pl-5 mt-2">
                        {warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {result && errors.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Successfully imported!</strong>
                      <ul className="list-disc pl-5 mt-2">
                        <li>{result.data.questions_created} questions created</li>
                        {result.data.passages_created > 0 && (
                          <li>{result.data.passages_created} passages created</li>
                        )}
                        {result.data.units_created > 0 && (
                          <li>{result.data.units_created} question units created</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {result && errors.length === 0 ? 'Close' : 'Cancel'}
          </Button>
          <Button
            onClick={result && errors.length === 0 ? onSuccess : handleImport}
            disabled={!file || loading}
          >
            {loading
              ? 'Importing...'
              : result && errors.length === 0
                ? 'Done'
                : 'Import Questions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
