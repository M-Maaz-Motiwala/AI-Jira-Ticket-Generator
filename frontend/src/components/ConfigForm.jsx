/*
================================================================================
|  File: frontend/src/components/ConfigForm.jsx (--- UPDATED ---)              |
================================================================================
*/
import React from 'react';
import { Link, Briefcase, Users, Tag, Key, Box, Mail } from 'lucide-react';

const InputField = ({ label, name, value, onChange, placeholder = '', icon: Icon, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
        </div>
    </div>
);

export function ConfigForm({ config, setConfig }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8">
            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-sm font-semibold text-slate-600">Jira Credentials</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InputField label="Jira Email" name="JIRA_EMAIL" value={config.JIRA_EMAIL} onChange={handleChange} placeholder="your.email@example.com" icon={Mail} />
                    <InputField label="Jira Password" name="JIRA_PASSWORD" value={config.JIRA_PASSWORD} onChange={handleChange} placeholder="Password" icon={Key} type="password"/>
                </div>
            </fieldset>

            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-sm font-semibold text-slate-600">Jira Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InputField label="Jira URL" name="JIRA_URL" value={config.JIRA_URL} onChange={handleChange} placeholder="https://your-domain.atlassian.net" icon={Link} />
                    <InputField label="Jira Project Key" name="JIRA_PROJECT_KEY" value={config.JIRA_PROJECT_KEY} onChange={handleChange} placeholder="e.g., PRIV" icon={Briefcase} />
                    <InputField label="Affected Version" name="AFFECTED_VERSION" value={config.AFFECTED_VERSION} onChange={handleChange} placeholder="e.g., 1.135" icon={Tag} />
                    <InputField label="Module Name" name="MODULE" value={config.MODULE} onChange={handleChange} placeholder="e.g., Policy, Compliance" icon={Box} />
                </div>
            </fieldset>

             <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-sm font-semibold text-slate-600">Assignees & Defaults</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InputField label="Frontend Assignee" name="FRONTEND_ASSIGNEE" value={config.FRONTEND_ASSIGNEE} onChange={handleChange} placeholder="Jira Username" icon={Users} />
                    <InputField label="Backend Assignee" name="BACKEND_ASSIGNEE" value={config.BACKEND_ASSIGNEE} onChange={handleChange} placeholder="Jira Username" icon={Users} />
                    <InputField label="QA Assignee" name="QA_ASSIGNEE" value={config.QA_ASSIGNEE} onChange={handleChange} placeholder="Jira Username" icon={Users} />
                    <InputField label="Attachment Path" name="ATTACHMENTS" value={config.ATTACHMENTS} onChange={handleChange} placeholder='Attachment Path' icon={Link} />
                </div>
                 <div className="mt-5">
                    <label htmlFor="defaultSeverity" className="block text-sm font-medium text-slate-600 mb-1.5">Default Severity</label>
                    <select id="defaultSeverity" name="DEFAULT_SEVERITY" value={config.DEFAULT_SEVERITY} onChange={handleChange} className="w-full md:w-1/3 px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500">
                        <option>Blocker</option><option>Major</option><option>Medium</option><option>Low</option>
                    </select>
                </div>
            </fieldset>

            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-sm font-semibold text-slate-600">AI Configuration</legend>
                <InputField label="Gemini API Key (Optional)" name="GEMINI_API_KEY" value={config.GEMINI_API_KEY} onChange={handleChange} placeholder="Leave blank to use default key" icon={Key} type="password"/>
            </fieldset>
        </div>
    );
};