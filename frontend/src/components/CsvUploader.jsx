/*
================================================================================
|  File: frontend/src/components/CsvUploader.jsx                               |
================================================================================
*/
import React, { useState, useCallback } from "react";
import API from "../utils/api";
import { UploadCloud, CheckCircle, LoaderCircle } from 'lucide-react';

export function CsvUploader({ onPreview, onError }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (fileToUpload) => {
    if (!fileToUpload) return;
    setIsUploading(true);
    onError(''); // Clear previous errors
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
      const res = await API.post("/upload-csv", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(fileToUpload);
      onPreview(res.data.preview, res.data.columns);
    } catch (error) {
      onError(error.response?.data?.error || "Upload failed. Please check the file and try again.");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [onPreview, onError]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="csv-upload"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl transition-all
        ${isUploading 
          ? 'border-indigo-500 bg-indigo-50 cursor-wait' 
          : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'}`
        }
      >
        <div className="text-center">
          {isUploading ? (
            <>
              <LoaderCircle size={48} className="mx-auto mb-4 text-indigo-600 animate-spin" />
              <p className="font-semibold text-lg text-indigo-700">Uploading...</p>
            </>
          ) : file ? (
            <>
              <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
              <p className="font-semibold text-lg text-green-700">{file.name}</p>
              <p className="text-sm text-slate-500">File uploaded successfully!</p>
            </>
          ) : (
            <>
              <UploadCloud size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="font-semibold text-lg text-slate-600">Click or drag & drop to upload</p>
              <p className="text-sm text-slate-500">CSV file up to 10MB</p>
            </>
          )}
        </div>
        <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="sr-only" disabled={isUploading} />
      </label>
      {file && !isUploading && (
        <div className="mt-4 text-center text-sm text-slate-500">
          To re-upload, simply drag a new file or click the box again.
        </div>
      )}
    </div>
  );
}