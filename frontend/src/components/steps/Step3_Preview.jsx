/*
================================================================================
|  File: frontend/src/components/steps/Step3_Preview.jsx                               |
================================================================================
*/
import React from 'react';
import { InteractiveDataTable } from '../InteractiveDataTable'; // The new component
import { Wand2 } from 'lucide-react';

export const Step3_Preview = ({ setStep, rows, columns, handleProcessIssues, isProcessing }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Preview & Generate</h2>
            <p className="text-slate-500 mb-6">Review your data below. Use the search box to filter, or click headers to sort. When ready, click "Generate Tickets".</p>
            
            <InteractiveDataTable data={rows} columns={columns} />

            <div className="mt-8 pt-6 border-t border-slate-200/80 flex justify-between items-center">
                 <button
                    onClick={() => setStep(2)}
                    className="bg-slate-200 text-slate-700 font-semibold py-2 px-5 rounded-lg hover:bg-slate-300 transition-all"
                >
                    Previous Step
                </button>
                <button
                    onClick={handleProcessIssues}
                    disabled={isProcessing}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all disabled:bg-slate-400 disabled:cursor-wait text-lg inline-flex items-center shadow-lg hover:shadow-indigo-300"
                >
                    <Wand2 size={20} className="mr-2"/>
                    {isProcessing ? 'Generating...' : 'Generate Tickets'}
                </button>
            </div>
        </div>
    );
};