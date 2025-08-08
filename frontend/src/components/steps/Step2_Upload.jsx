/*
================================================================================
|  File: frontend/src/components/steps/Step2_Upload.jsx                        |
================================================================================
*/
import React from 'react';
import { CsvUploader } from '../CsvUploader';

export const Step2_Upload = ({ setStep, setRows, setColumns, setError, attachments, setAttachments }) => {
    
    const handleSuccess = (data, cols) => {
        setRows(data);
        setColumns(cols);
        setError('');
        setStep(3); // Automatically move to next step on successful upload
    };

    return (
         <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Test Cases</h2>
                <p className="text-slate-500 mb-6">Drag and drop your CSV file below, or click to select a file from your computer.</p>
                <CsvUploader onPreview={handleSuccess} onError={setError} />
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex justify-between items-center">
                <button
                    onClick={() => setStep(1)}
                    className="bg-slate-200 text-slate-700 font-semibold py-2 px-5 rounded-lg hover:bg-slate-300 transition-all"
                >
                    Previous Step
                </button>
            </div>
        </div>
    );
};