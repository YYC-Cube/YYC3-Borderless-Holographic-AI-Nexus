import { Button } from '@/components/ui/button';
import { GestureContainer } from '@/components/ui/GestureContainer';
import { Input } from '@/components/ui/input';
import { Activity, ArrowLeft, Database, Edit2, GitMerge, Globe, Plus, RefreshCw, Save, Server, Trash2, Wifi, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
const bgImage = "/Family-AI-001.png";

interface ServerData {
  id: number;
  name: string;
  status: 'connected' | 'disconnected';
  latency: string;
  type: string;
  icon: React.ElementType;
}

interface MCPServerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSwitcher: () => void;
}

export function MCPServerPanel({ isOpen, onClose, onShowSwitcher }: MCPServerPanelProps) {
  const [servers, setServers] = useState<ServerData[]>([
    { id: 1, name: 'GitHub Protocol', status: 'connected', latency: '45ms', type: 'Repo Access', icon: GitMerge },
    { id: 2, name: 'PostgreSQL DB', status: 'connected', latency: '12ms', type: 'Vector Store', icon: Database },
    { id: 3, name: 'Slack Integration', status: 'disconnected', latency: '--', type: 'Communication', icon: Globe },
  ]);

  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [formData, setFormData] = useState<Partial<ServerData>>({});
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.success("Discovery Complete", { description: "No new local MCP servers found." });
    }, 2000);
  };

  const toggleServer = (id: number) => {
    setServers(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'connected' ? 'disconnected' : 'connected';
        toast(newStatus === 'connected' ? "Link Established" : "Link Severed", {
          description: `${s.name} is now ${newStatus}.`,
          icon: newStatus === 'connected' ? <Wifi className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />
        });
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleEdit = (server: ServerData) => {
    setFormData(server);
    setViewMode('form');
  };

  const handleAddNew = () => {
    setFormData({
      id: Date.now(),
      name: '',
      type: 'Custom Service',
      status: 'disconnected',
      latency: '--',
      icon: Server
    });
    setViewMode('form');
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Validation Error", { description: "Server name is required." });
      return;
    }

    setServers(prev => {
      const existing = prev.find(s => s.id === formData.id);
      if (existing) {
        return prev.map(s => s.id === formData.id ? { ...s, ...formData } as ServerData : s);
      } else {
        return [...prev, { ...formData, icon: Server } as ServerData];
      }
    });

    toast.success("Configuration Saved", { description: "Server matrix updated." });
    setViewMode('list');
  };

  const handleDelete = (id: number) => {
    setServers(prev => prev.filter(s => s.id !== id));
    toast.success("Node Removed", { description: "Server disconnected and removed from matrix." });
    setViewMode('list');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          {/* Background Image Container */}
          <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/50" />
          </div>

          <GestureContainer
            onClose={() => {
              if (viewMode === 'form') {
                setViewMode('list');
              } else {
                onClose();
              }
            }}
            onMenu={onShowSwitcher}
            className="w-full h-full md:max-w-5xl md:h-[85vh] md:border md:border-white/10 md:rounded-3xl overflow-hidden relative z-10 flex flex-col bg-black/20 shadow-2xl"
          >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 shrink-0 relative">
              {/* Glassmorphism Header Background */}
              <div className="absolute inset-0 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10">
                {viewMode === 'form' && (
                  <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className="mr-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <Server className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-widest text-white font-sans">MCP MATRIX</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/40 uppercase">System Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                {viewMode === 'list' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleScan}
                    disabled={scanning}
                    className="bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-200 backdrop-blur-sm rounded-full px-6"
                  >
                    {scanning ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <Activity className="w-3 h-3 mr-2" />}
                    {scanning ? "SCANNING..." : "SCAN"}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/30 hover:text-white rounded-full hover:bg-white/10">
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
              <AnimatePresence mode="wait">
                {viewMode === 'list' ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                  >
                    {/* Add New Card - Dashed Style matching image */}
                    <button
                      onClick={handleAddNew}
                      className="h-48 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 text-white/30 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-white/5 transition-all group backdrop-blur-[2px]"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors border border-white/10 group-hover:border-cyan-500/30">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs tracking-widest uppercase">ADD SERVER NODE</span>
                    </button>

                    {/* Server Cards */}
                    {servers.map(server => (
                      <motion.div
                        key={server.id}
                        layout
                        className={`h-48 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all group backdrop-blur-md ${server.status === 'connected'
                            ? 'border border-white/10 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-900/10'
                            : 'border border-red-500/20 bg-red-900/[0.05] hover:border-red-500/40'
                          }`}
                      >
                        <div className="flex justify-between items-start z-10">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl border ${server.status === 'connected' ? 'bg-white/5 border-white/10 text-cyan-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                              <server.icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white tracking-wide">{server.name}</h3>
                              <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{server.type}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/20 hover:text-white -mr-2 -mt-2"
                            onClick={() => handleEdit(server)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="z-10 mt-auto">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${server.status === 'connected' ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-red-500'}`} />
                              <span className={`text-[10px] font-mono tracking-wider ${server.status === 'connected' ? 'text-white/60' : 'text-red-400'}`}>
                                {server.status === 'connected' ? 'ONLINE' : 'OFFLINE'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-white/30">PING: {server.latency}</span>
                          </div>

                          <Button
                            className={`w-full h-10 text-xs font-mono tracking-widest border transition-all ${server.status === 'connected'
                                ? 'bg-transparent border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                                : 'bg-transparent border-white/10 text-white/50 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                              }`}
                            onClick={() => toggleServer(server.id)}
                          >
                            {server.status === 'connected' ? 'DISCONNECT' : 'CONNECT'}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="max-w-md mx-auto mt-8 relative z-20"
                  >
                    <div className="bg-[#05080e]/80 border border-white/10 rounded-2xl p-8 space-y-8 backdrop-blur-xl shadow-2xl">
                      <h3 className="text-lg font-mono text-cyan-400 border-b border-white/10 pb-4 tracking-widest">
                        {formData.id && servers.find(s => s.id === formData.id) ? 'EDIT NODE CONFIG' : 'NEW SERVER NODE'}
                      </h3>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono pl-1">Server Name</label>
                          <Input
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="bg-black/40 border-white/10 text-white font-mono h-12 focus:border-cyan-500/50 transition-colors"
                            placeholder="e.g. Production DB"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono pl-1">Type / Description</label>
                          <Input
                            value={formData.type || ''}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="bg-black/40 border-white/10 text-white font-mono h-12 focus:border-cyan-500/50 transition-colors"
                            placeholder="e.g. Database, Filesystem..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        {formData.id && servers.find(s => s.id === formData.id) && (
                          <Button
                            variant="destructive"
                            className="flex-1 bg-red-900/20 text-red-400 hover:bg-red-900/50 border border-red-500/20 h-12"
                            onClick={() => handleDelete(formData.id!)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> DELETE
                          </Button>
                        )}
                        <Button
                          className="flex-[2] bg-white text-black hover:bg-white/90 h-12 font-bold tracking-wide"
                          onClick={handleSave}
                        >
                          <Save className="w-4 h-4 mr-2" /> SAVE CHANGES
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GestureContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
