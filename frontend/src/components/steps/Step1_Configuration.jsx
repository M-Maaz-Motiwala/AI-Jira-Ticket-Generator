/*
================================================================================
|  File: frontend/src/components/steps/Step1_Configuration.jsx                               |
================================================================================
*/
import React, { useState } from 'react';
import { ConfigForm } from '../ConfigForm'; // We'll reuse the form component
import { CheckCircle } from 'lucide-react';

export const Step1_Configuration = ({ setStep, config, setConfig }) => {
    const [isSaved, setIsSaved] = useState(false);

    const handleSaveConfig = () => {
        const requiredFields = ['jiraUrl', 'projectKey', 'frontendAssignee', 'backendAssignee', 'qaAssignee', 'affectedVersion', 'module'];
        const missingField = requiredFields.find(field => !config[field]);
        if (missingField) {
            alert(`Configuration is incomplete. Please provide a value for: ${missingField}`);
            return;
        }
        localStorage.setItem('sqaAppConfig', JSON.stringify(config));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Configuration</h2>
            <p className="text-slate-500 mb-6">First, let's set up the connection details for your Jira project.</p>
            
            <ConfigForm config={config} setConfig={setConfig} />

            <div className="mt-8 pt-6 border-t border-slate-200/80 flex justify-between items-center">
                <div>
                     {isSaved && (
                        <span className="text-green-600 flex items-center gap-2 text-sm font-medium transition-opacity">
                            <CheckCircle size={16} /> Configuration Saved!
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSaveConfig}
                        className="bg-slate-200 text-slate-700 font-semibold py-2 px-5 rounded-lg hover:bg-slate-300 transition-all"
                    >
                        Save for Later
                    </button>
                    <button
                        onClick={() => setStep(2)}
                        className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-all"
                    >
                        Next Step
                    </button>
                </div>
            </div>
        </div>
    );
};