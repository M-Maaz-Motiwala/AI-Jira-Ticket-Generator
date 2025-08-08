/*
================================================================================
|  File: frontend/src/components/ActionableIssues.jsx                          |
================================================================================
*/
import React, { useState, useMemo } from 'react';
import API from "../utils/api";
import { ChevronDown, ChevronUp, Copy, Check, Bug, Lightbulb, AlertTriangle, Send, LoaderCircle, CheckCircle, ExternalLink } from 'lucide-react';

const parseAIResponse = (aiResponse) => {
  try {
    const cleanedResponse = aiResponse.replace(/```json\n|```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (e) {
    return { error: `Failed to parse AI response. Raw text: ${aiResponse}` };
  }
};

const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-slate-200 transition-colors" title="Copy">
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-500" />}
        </button>
    );
};

const IssueCard = ({ issue, type, config, attachments }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const aiContent = useMemo(() => parseAIResponse(issue.ai_response || '{}'), [issue.ai_response]);
  const hasError = !!aiContent.error;

  // State for editable fields
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');
  const [domain, setDomain] = useState('Backend');
  
  // State for Jira creation
  const [creationStatus, setCreationStatus] = useState('idle');
  const [jiraKey, setJiraKey] = useState('');
  const [jiraUrl, setJiraUrl] = useState('');
  const [creationError, setCreationError] = useState('');

  useMemo(() => {
    if (!hasError) {
      setSummary(aiContent.summary || '');
      setDescription(aiContent.description || '');
      setLabel(aiContent.label || 'Functionality_Issue');
      setDomain(aiContent.domain || 'Backend');
    }
  }, [aiContent, hasError]);

  const handleCreateTicket = async (e) => {
      e.stopPropagation();
      setCreationStatus('loading');
      setCreationError('');
      try {
          const payload = {
              config,
              issueType: type === 'bug' ? 'Bug' : 'Story',
              summary,
              description,
              label: type === 'bug' ? label : null,
              domain,
              originalData: issue,
              proofs: attachments
          };
          const res = await API.post('/create-jira-ticket', payload);
          setJiraKey(res.data.ticket_key);
          setJiraUrl(res.data.ticket_url);
          setCreationStatus('success');
      } catch (err) {
          setCreationStatus('error');
          setCreationError(err.response?.data?.error || "Failed to create ticket.");
      }
  };

  const cardColor = hasError ? 'bg-amber-50 border-amber-300' : (type === 'bug' ? 'bg-red-50/70 border-red-200' : 'bg-green-50/70 border-green-200');
  
  return (
    <div className={`p-4 rounded-xl border ${cardColor} shadow-sm transition-all`}>
      <div className="flex justify-between items-start gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h4 className={`font-bold text-slate-800`}>{hasError ? `Error: ${issue['Test Case ID']}` : summary}</h4>
        <div className="text-slate-500 hover:text-slate-800 flex-shrink-0 p-1">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200/80">
          {hasError ? (
            <div className="text-red-800 bg-red-100 p-3 rounded-md">
              <p className="font-bold">An error occurred during generation:</p>
              <pre className="whitespace-pre-wrap font-mono text-xs mt-2">{aiContent.error}</pre>
            </div>
          ) : (
            <div className="space-y-4">
                <div>
                    <label className="font-semibold text-slate-700 text-sm mb-1 block">Summary</label>
                    <input 
                        type="text"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full text-sm text-slate-800 bg-white p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                        disabled={creationStatus !== 'idle'}
                    />
                </div>
                {/* ... other fields ... */}
                <div>
                    <label className="font-semibold text-slate-700 text-sm mb-1 block">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-sm text-slate-800 bg-white p-3 rounded-lg border border-slate-300 h-48 font-mono focus:ring-2 focus:ring-indigo-500"
                        disabled={creationStatus !== 'idle'}
                    />
                </div>
                <div className="pt-2 text-right">
                    {creationStatus === 'idle' && (
                        <button onClick={handleCreateTicket} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2">
                            <Send size={16} /> Create Jira Ticket
                        </button>
                    )}
                    {/* ... other statuses ... */}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function ActionableIssues({ bugs, stories, config }) {
  const bugCount = bugs?.length || 0;
  const storyCount = stories?.length || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Generated Results</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="flex items-center text-xl font-semibold text-red-700 mb-4 pb-3 border-b-2 border-red-200"><Bug size={22} className="mr-2.5"/>Bugs ({bugCount})</h3>
              {bugCount > 0 ? (
                <div className="space-y-4">
                  {bugs.map((bug, index) => <IssueCard key={`bug-${index}`} issue={bug} type="bug" config={config} />)}
                </div>
              ) : (<p className="text-slate-500 italic mt-4">No bugs were generated.</p>)}
            </div>
            <div>
              <h3 className="flex items-center text-xl font-semibold text-green-700 mb-4 pb-3 border-b-2 border-green-200"><Lightbulb size={22} className="mr-2.5"/>Stories ({storyCount})</h3>
              {storyCount > 0 ? (
                <div className="space-y-4">
                  {stories.map((story, index) => <IssueCard key={`story-${index}`} issue={story} type="story" config={config} />)}
                </div>
              ) : (<p className="text-slate-500 italic mt-4">No stories were generated.</p>)}
            </div>
        </div>
    </div>
  );
}