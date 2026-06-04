import React, { useState } from 'react';
import { Copy, Check, Terminal, GitBranch, Shield, Cpu, HelpCircle, Code, List, Award, CheckCircle2 } from 'lucide-react';
import { playNotificationSound } from '../lib/audio';

export default function GitAssistant() {
  const [gitUrl, setGitUrl] = useState('https://github.com/your-username/moscovium115.git');
  const [commitMsg, setCommitMsg] = useState('Initial commit: Moscovium115 Marketplace Beta v1.0');
  const [branch, setBranch] = useState('main');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    playNotificationSound();
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      id: 'step1',
      title: 'Initialize Git Locally',
      desc: 'Create a local Git tracking space in the root folder of your project.',
      command: `git init`,
    },
    {
      id: 'step2',
      title: 'Configure Your Git Identity',
      desc: 'Set up your developer profile. Skip this if you already have global configurations.',
      command: `git config user.name "Your Name"
git config user.email "your.email@example.com"`,
    },
    {
      id: 'step3',
      title: 'Stage and Commit Files',
      desc: 'Prepare all files (excluding node_modules or system files in .gitignore) and save the stable state.',
      command: `git add .
git commit -m "${commitMsg}"`,
    },
    {
      id: 'step4',
      title: 'Rename Branch & Link Remote',
      desc: 'Ensure your default local branch is named appropriately and link it directly to your remote origin.',
      command: `git branch -M ${branch}
git remote add origin ${gitUrl}`,
    },
    {
      id: 'step5',
      title: 'Deploy to Repository',
      desc: 'Push your secure codebase to your online repository (requires personal access token or SSH authorization).',
      command: `git push -u origin ${branch}`,
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-50 p-2.5 rounded-2xl text-red-600">
          <GitBranch className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 leading-tight">Git Deploy Assistant</h2>
          <p className="text-sm text-slate-500 font-sans">Deploy Moscovium115 code securely onto your private Git repository</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings & Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Repository Settings</h3>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Remote Repository URL</label>
              <input
                type="text"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="e.g. https://github.com/user/project.git"
                className="w-full text-xs font-mono rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Primary Commit Message</label>
              <input
                type="text"
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder="e.g. Initial commit"
                className="w-full text-xs font-sans rounded-xl border border-slate-300 bg-white p-2.5 text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Production Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 focus:outline-none"
              >
                <option value="main">main (Default)</option>
                <option value="master">master</option>
                <option value="production">production</option>
              </select>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Shield className="h-4 w-4" />
              <span>Recommended .gitignore</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We highly advise staging code cleanly. Ensure you exclude sensitive items such as private environment secrets from cloud uploads:
            </p>
            <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-xl max-h-40 overflow-y-auto leading-normal">
              <div># Logs and packages</div>
              <div>node_modules/</div>
              <div>dist/</div>
              <div>.env</div>
              <div>.env.local</div>
              <div>.DS_Store</div>
              <div>.firebase/</div>
            </div>
          </div>
        </div>

        {/* Deploy Steps Console */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Deploy Procedure (Step-by-Step)</h3>
            <span className="text-xs bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Terminal className="h-3 w-3" /> Copy-and-Paste Ready
            </span>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                className="bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-all p-4 relative flex items-start gap-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                  {idx + 1}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <h4 className="font-semibold text-slate-900 text-sm leading-none">{step.title}</h4>
                    <button
                      onClick={() => handleCopy(step.command, step.id)}
                      className="text-xs inline-flex items-center gap-1.5 hover:text-slate-900 text-slate-500 transition-all px-2.5 py-1 bg-slate-50 rounded-lg hover:bg-slate-100"
                    >
                      {copiedIndex === step.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Commands</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  
                  <pre className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-3 rounded-xl overflow-x-auto leading-normal select-all">
                    {step.command}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-700">
            <span className="text-lg">💡</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Troubleshooting Authentication:</p>
              <p>GitHub retired plain password usage. If Git prompts you for authentication during Step 5, paste your <strong>Personal Access Token (PAT)</strong> as the password instead. You can generate one under Settings &gt; Developer Settings &gt; Personal Access Tokens in GitHub.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
