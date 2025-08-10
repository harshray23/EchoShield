"use client";

import { useState, useRef } from 'react';
import { useAppContext } from '@/lib/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileUp, File as FileIcon, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function StoragePage() {
  const { files, addFile } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            addFile({ name: file.name, size: file.size, type: file.type });
            setUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Storage</h1>
        <p className="text-muted-foreground">Simulated file upload and management.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Click the button or drag and drop a file to simulate an upload.</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                    fileInputRef.current!.files = e.dataTransfer.files;
                    handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
                }
            }}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-semibold mb-2">Drag & drop files here or</p>
            <Button onClick={handleUploadClick} disabled={uploading}>
              <FileUp className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={uploading}
            />
          </div>
          {uploading && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center mt-2 text-muted-foreground">{progress}% uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>A list of files in your simulated storage bucket.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length > 0 ? files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{file.name}</span>
                  </TableCell>
                  <TableCell className="font-code">{file.type}</TableCell>
                  <TableCell>{formatBytes(file.size)}</TableCell>
                  <TableCell>{format(file.uploadedAt, 'PPp')}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No files uploaded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
