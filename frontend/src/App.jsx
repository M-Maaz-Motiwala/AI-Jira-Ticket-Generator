/*
================================================================================
|  File: frontend/src/App.jsx (--- UPDATED ---)                                |
================================================================================
*/
import React, { useState, useEffect } from "react";
import API from "./utils/api";
import { Wand2, AlertTriangle, CheckCircle } from 'lucide-react';

// Import Step Components
import { Step1_Configuration } from './components/steps/Step1_Configuration';
import { Step2_Upload } from './components/steps/Step2_Upload';
import { Step3_Preview } from './components/steps/Step3_Preview';
import { Step4_Results } from './components/steps/Step4_Results';

// Wizard Progress Bar
const ProgressIndicator = ({ currentStep }) => {
    const steps = ["Configure", "Upload", "Preview", "Results"];
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((name, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;
                    return (
                        <li key={name} className={`relative ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                            {index > 0 && (
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-full h-0.5 ${isCompleted || isCurrent ? 'bg-indigo-600' : 'bg-slate-200'}`} aria-hidden="true" />
                            )}
                            <div className="relative z-10 flex items-center gap-x-3 bg-slate-50 pr-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold
                                    ${isCompleted ? 'bg-indigo-600 text-white' : ''}
                                    ${isCurrent ? 'ring-2 ring-indigo-600 bg-white text-indigo-600' : ''}
                                    ${!isCompleted && !isCurrent ? 'bg-slate-200 text-slate-500' : ''}
                                `}>
                                    {isCompleted ? <CheckCircle size={20} /> : stepNumber}
                                </div>
                                <span className={`text-sm font-medium ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>{name}</span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default function App() {
    // Wizard State
    const [step, setStep] = useState(1);

    // Application State
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [error, setError] = useState('');
    const [bugs, setBugs] = useState([]);
    const [stories, setStories] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [config, setConfig] = useState({
        jiraUrl: '', projectKey: '', frontendAssignee: '', backendAssignee: '', qaAssignee: '',
        defaultSeverity: 'Medium', affectedVersion: '', geminiApiKey: '', module: '',
        jiraApiUser: '', jiraApiToken: '' // Added credentials
    });

    useEffect(() => {
        const savedConfig = localStorage.getItem('sqaAppConfig');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    const handleProcessIssues = async () => {
        setIsProcessing(true);
        setError('');
        try {
            const res = await API.post('/process-issues', { config, rows });
            setBugs(res.data.bugs || []);
            setStories(res.data.stories || []);
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.error || "An unknown error occurred while processing issues.");
        } finally {
            setIsProcessing(false);
        }
    };

    const restart = () => {
        setRows([]);
        setColumns([]);
        setBugs([]);
        setStories([]);
        setError('');
        setAttachments([]);
        setStep(1);
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <header className="bg-white border-b border-slate-200/80">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wand2 className="text-indigo-600" size={28} />
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tighter">
                            AI Jira Ticket Generator
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-8">
                <ProgressIndicator currentStep={step} />

                {error && (
                    <div className="p-4 my-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-lg flex items-center gap-3 shadow-md">
                        <AlertTriangle size={20} />
                        <p><strong className="font-semibold">Error:</strong> {error}</p>
                    </div>
                )}
                
                <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-8">
                    {step === 1 && <Step1_Configuration setStep={setStep} config={config} setConfig={setConfig} />}
                    {step === 2 && <Step2_Upload setStep={setStep} setRows={setRows} setColumns={setColumns} setError={setError} attachments={attachments} setAttachments={setAttachments} />}
                    {step === 3 && <Step3_Preview setStep={setStep} rows={rows} columns={columns} handleProcessIssues={handleProcessIssues} isProcessing={isProcessing} />}
                    {step === 4 && <Step4_Results bugs={bugs} stories={stories} restart={restart} config={config} attachments={attachments} />}
                </div>
            </main>
        </div>
    );
}
