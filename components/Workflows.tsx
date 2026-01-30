
import React, { useState, useMemo } from 'react';
import { MOCK_PROJECTS } from '../lib/mockData';
import { Project, UserProfile, TriggerRequest } from '../types';
import { Play, Users, FileText, BarChart, X, Loader2, CheckCircle, Zap, Shield } from 'lucide-react';

interface WorkflowsProps {
  user: UserProfile;
}

export const Workflows: React.FC<WorkflowsProps> = ({ user }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [success, setSuccess] = useState(false);

  // FETCH: Get projects where userId == currentUser.uid AND public_form_enabled == true
  const myProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => p.userId === user.uid && p.public_form_enabled);
  }, [user.uid]);

  const icons = {
    Users: <Users className="w-6 h-6" />,
    FileText: <FileText className="w-6 h-6" />,
    BarChart: <BarChart className="w-6 h-6" />,
    Shield: <Shield className="w-6 h-6" />
  };

  const handleOpen = (project: Project) => {
    setSelectedProject(project);
    setFormData({});
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setExecuting(true);
    
    // ACTION: ADD document to 'trigger_queue' in LocalStorage (Simulating Firebase)
    const newRequest: TriggerRequest = {
        id: `req-${Date.now()}`,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        userId: user.uid,
        payload: formData,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        cost: Math.floor(Math.random() * 20) + 5 // Random cost between 5-25 credits
    };

    const existingQueue = JSON.parse(localStorage.getItem('trigger_queue') || '[]');
    localStorage.setItem('trigger_queue', JSON.stringify([...existingQueue, newRequest]));

    // Simulate Network Delay (Just for UI feedback, the Worker handles the real logic)
    await new Promise(r => setTimeout(r, 800));

    setExecuting(false);
    setSuccess(true);
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-white">Active Workflows</h1>
        <p className="text-slate-400">Launch automations directly from your trigger configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProjects.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500">No active workflows found for your account.</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Create New Workflow</button>
            </div>
        ) : (
            myProjects.map((project) => (
                <div key={project.id} className="glass-panel p-6 rounded-xl border border-nexus-border hover:border-blue-500/30 transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-nexus-card border border-nexus-border text-blue-400">
                            {icons[project.icon as keyof typeof icons] || <Zap />}
                        </div>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">
                            READY
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
                    <p className="text-sm text-slate-400 mb-6 h-10 line-clamp-2">{project.description}</p>
                    <button 
                        onClick={() => handleOpen(project)}
                        className="w-full py-2 bg-slate-800 hover:bg-blue-600 text-white rounded-lg border border-slate-700 hover:border-blue-500 transition-all font-medium flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" /> Run Workflow
                    </button>
                </div>
            ))
        )}
      </div>

      {/* Dynamic Form Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-nexus-dark border border-nexus-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                
                <div className="p-6 border-b border-nexus-border flex justify-between items-center bg-nexus-card">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Play className="w-4 h-4 text-blue-400" /> Run: {selectedProject.name}
                    </h3>
                    <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {selectedProject.triggerConfig.map((field) => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select 
                                        required={field.required}
                                        className="w-full bg-nexus-card border border-nexus-border rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none"
                                        onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                                    >
                                        <option value="">Select...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input 
                                        type={field.type}
                                        required={field.required}
                                        className="w-full bg-nexus-card border border-nexus-border rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none placeholder:text-slate-600 transition-colors"
                                        placeholder={`Enter ${field.label}...`}
                                        onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={executing}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                            >
                                {executing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Sending to Queue...
                                    </>
                                ) : "Execute Workflow"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Request Queued!</h3>
                        <p className="text-slate-400 mb-6">Your automation request has been sent to the execution engine. Monitor the Dashboard for results.</p>
                        <button 
                            onClick={() => setSelectedProject(null)}
                            className="px-6 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
