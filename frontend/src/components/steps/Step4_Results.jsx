/*
================================================================================
|  File: frontend/src/components/steps/Step4_Results.jsx                               |
================================================================================
*/
import React from 'react';
import { ActionableIssues } from '../ActionableIssues';

export const Step4_Results = ({ bugs, stories, restart, config, attachments }) => {
    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Generated Tickets</h2>
                    <p className="text-slate-500 mb-6">The AI has generated the following bugs and stories based on your data.</p>
                </div>
                <button
                    onClick={restart}
                    className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-all"
                >
                    Start Over
                </button>
            </div>

            {/* Pass config & attachments down */}
            <ActionableIssues
                bugs={bugs}
                stories={stories}
                config={config}
                attachments={attachments}
            />
        </div>
    );
};
