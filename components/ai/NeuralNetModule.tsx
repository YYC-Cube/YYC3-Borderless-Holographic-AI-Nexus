import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Server, GitBranch, X, Plus, Play, Settings, Database, Github, MessageSquare, FileText, CheckSquare, Cloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface NeuralNetModuleProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock MCP Servers
const MOCK_SERVERS = [
    { id: 'github', name: 'GitHub', icon: Github, connected: true, description: 'Repository access & PR management' },
    { id: 'slack', name: 'Slack', icon: MessageSquare, connected: false, description: 'Channel messaging & notifications' },
    { id: 'notion', name: 'Notion', icon: FileText, connected: true, description: 'Knowledge base synchronization' },
    { id: 'linear', name: 'Linear', icon: CheckSquare, connected: false, description: 'Issue tracking & project updates' },
    { id: 'postgres', name: 'PostgreSQL', icon: Database, connected: true, description: 'Direct database querying' },
    { id: 'drive', name: 'Google Drive', icon: Cloud, connected: false, description: 'File storage & document parsing' },
];

// Mock Workflows
const MOCK_WORKFLOWS = [
    { id: 1, name: 'Daily Standup Summary', nodes: 4, runCount: 128, active: true },
    { id: 2, name: 'Code Review Assistant', nodes: 6, runCount: 842, active: true },
    { id: 3, name: 'Competitor Analysis', nodes: 12, runCount: 45, active: false },
    { id: 4, name: 'Email Triaging Agent', nodes: 3, runCount: 2301, active: true },
];

export function NeuralNetModule({ isOpen, onClose }: NeuralNetModuleProps) {
    const [activeTab, setActiveTab] = useState<'mcp' | 'workflows'>('mcp');
    const [servers, setServers] = useState(MOCK_SERVERS);

    const toggleServer = (id: string) => {
        setServers(prev => prev.map(s => {
            if (s.id === id) {
                const newState = !s.connected;
                toast(newState ? `MCP CONNECTED: ${s.name.toUpperCase()}` : `MCP DISCONNECTED: ${s.name.toUpperCase()}`, {
                    icon: <Server className={`w-4 h-4 ${newState ? 'text-emerald-400' : 'text-gray-400'}`} />
                });
                return { ...s, connected: newState };
            }
            return s;
        }));
    };

    const runWorkflow = (name: string) => {
        toast.success(`WORKFLOW INITIATED: ${name}`, {
            description: "Agents dispatched. Monitoring execution...",
            icon: <Play className="w-4 h-4 text-emerald-400" />
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={(e) => {
                         if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <div className="w-full max-w-4xl h-[70vh] bg-[#0a0f18] border border-yellow-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-yellow-500/20 bg-yellow-950/20 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                    <Network className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-mono text-yellow-100 tracking-wider">NEURAL_NET_V4</h2>
                                    <p className="text-[10px] text-yellow-400/60 font-mono">EXTENSIONS & AUTOMATION</p>
                                </div>
                            </div>
                            
                            {/* Tab Switcher */}
                            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                <button 
                                    onClick={() => setActiveTab('mcp')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-mono transition-all ${activeTab === 'mcp' ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    MCP_SERVERS
                                </button>
                                <button 
                                    onClick={() => setActiveTab('workflows')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-mono transition-all ${activeTab === 'workflows' ? 'bg-orange-500/20 text-orange-300' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    WORKFLOWS
                                </button>
                            </div>

                            <Button variant="ghost" size="icon" onClick={onClose} className="text-yellow-400/50 hover:text-yellow-300 hover:bg-yellow-500/10">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-[#0a0f18] to-[#05070a] relative">
                            {/* Grid Background */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                            <AnimatePresence mode="wait">
                                {activeTab === 'mcp' ? (
                                    <motion.div 
                                        key="mcp"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10"
                                    >
                                        {/* Add New Card */}
                                        <div className="border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-white/30 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-mono tracking-widest">ADD SERVER</span>
                                        </div>

                                        {servers.map((server) => (
                                            <div key={server.id} className={`border rounded-xl p-5 relative group transition-all duration-300 ${server.connected ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-white/10 bg-white/5 grayscale'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-2 rounded-lg ${server.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                                        <server.icon className="w-5 h-5" />
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full ${server.connected ? 'bg-emerald-500 shadow-[0_0_8px_lime]' : 'bg-red-500/50'}`} />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-200 mb-1">{server.name}</h3>
                                                <p className="text-xs text-gray-500 h-8 line-clamp-2">{server.description}</p>
                                                
                                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                    <span className="text-[10px] font-mono text-gray-600">{server.connected ? 'PING: 24ms' : 'OFFLINE'}</span>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className={`h-6 text-[10px] border ${server.connected ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-white/10 text-gray-400 hover:bg-white/10'}`}
                                                        onClick={() => toggleServer(server.id)}
                                                    >
                                                        {server.connected ? 'DISCONNECT' : 'CONNECT'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="workflows"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4 relative z-10"
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                             <div className="relative w-64">
                                                 <Input placeholder="Search workflows..." className="bg-black/20 border-white/10 text-xs h-8 pl-8 font-mono" />
                                                 <RefreshCw className="w-3 h-3 absolute left-3 top-2.5 text-gray-500" />
                                             </div>
                                             <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white border-none h-8 text-xs font-mono">
                                                 <Plus className="w-3 h-3 mr-2" /> CREATE_FLOW
                                             </Button>
                                        </div>

                                        {MOCK_WORKFLOWS.map((flow) => (
                                            <div key={flow.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:border-orange-500/30 hover:bg-orange-950/10 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-linear-to-br from-orange-500/20 to-pink-500/20 rounded-lg border border-white/5">
                                                        <GitBranch className="w-5 h-5 text-orange-300" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-200">{flow.name}</h3>
                                                        <div className="flex gap-4 mt-1 text-[10px] font-mono text-gray-500">
                                                            <span>NODES: {flow.nodes}</span>
                                                            <span>RUNS: {flow.runCount}</span>
                                                            <span className={flow.active ? 'text-emerald-500' : 'text-red-500'}>{flow.active ? 'ACTIVE' : 'DISABLED'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        className="h-8 bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white border border-orange-500/30"
                                                        onClick={() => runWorkflow(flow.name)}
                                                    >
                                                        <Play className="w-3 h-3 mr-2" /> EXECUTE
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-black/40 border-t border-yellow-500/10 flex justify-between items-center px-6">
                            <span className="text-[9px] font-mono text-yellow-500/40">SERVER_TIME: {new Date().toISOString()}</span>
                            <div className="flex items-center gap-4 text-[9px] font-mono">
                                <span className="text-gray-500">NODES_ONLINE: 42</span>
                                <span className="text-gray-500">THROUGHPUT: 1.2GB/s</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
