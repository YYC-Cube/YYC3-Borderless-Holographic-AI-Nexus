import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Database, X, Plus, RefreshCw, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { YYC3_DESIGN } from '@/utils/design-system';

interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  type: 'local' | 'remote';
  latency?: number;
}

export function MCPServerManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [servers, setServers] = useState<MCPServer[]>([
    { id: '1', name: 'Localhost Primary', url: 'http://localhost:3000/mcp', status: 'connected', type: 'local', latency: 4 },
    { id: '2', name: 'Research DB', url: 'https://api.research-mcp.io', status: 'connected', type: 'remote', latency: 120 },
    { id: '3', name: 'Code Analyst', url: 'ws://mcp.analyst-engine.dev', status: 'disconnected', type: 'remote' },
  ]);

  const [newServerUrl, setNewServerUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddServer = () => {
    if (!newServerUrl) return;
    setServers(prev => [...prev, {
      id: Math.random().toString(),
      name: `New Server ${prev.length + 1}`,
      url: newServerUrl,
      status: 'connected', // Mock success
      type: 'remote',
      latency: Math.floor(Math.random() * 200)
    }]);
    setNewServerUrl('');
    setIsAdding(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${YYC3_DESIGN.blur.glass} p-4`}
        >
          <div className="w-full max-w-3xl bg-[#0a0f18] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/20 bg-linear-to-r from-cyan-950/30 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                  <Server className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide font-mono">MCP SERVER MATRIX</h2>
                  <p className="text-xs text-cyan-500/60 font-mono">MODEL CONTEXT PROTOCOL // V1.0.4</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-950/50">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar List */}
              <div className="w-1/3 border-r border-white/5 overflow-y-auto bg-black/20">
                <div className="p-4 space-y-2">
                   {servers.map(server => (
                     <div 
                        key={server.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            server.status === 'connected' 
                            ? 'bg-cyan-900/10 border-cyan-500/30 hover:bg-cyan-900/20' 
                            : 'bg-red-900/5 border-red-500/20 hover:bg-red-900/10'
                        }`}
                     >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-semibold text-gray-200">{server.name}</span>
                            <div className={`w-2 h-2 rounded-full ${server.status === 'connected' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-500'}`} />
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono truncate">{server.url}</div>
                        {server.status === 'connected' && (
                             <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-400/80">
                                 <RefreshCw className="w-3 h-3" />
                                 <span>{server.latency}ms latency</span>
                             </div>
                        )}
                     </div>
                   ))}
                   
                   <Button 
                      onClick={() => setIsAdding(true)} 
                      variant="outline" 
                      className="w-full mt-4 border-dashed border-white/20 text-white/40 hover:text-cyan-400 hover:border-cyan-500/50"
                   >
                      <Plus className="w-4 h-4 mr-2" /> Add Connection
                   </Button>
                </div>
              </div>

              {/* Detail View / Add Form */}
              <div className="flex-1 p-6 relative bg-[url('/grid.svg')] bg-opacity-5">
                 {isAdding ? (
                    <div className="max-w-md mx-auto mt-10 space-y-6">
                        <h3 className="text-lg text-cyan-400 font-mono border-b border-white/10 pb-2">ESTABLISH NEW UPLINK</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-mono">SERVER ENDPOINT URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <Input 
                                        value={newServerUrl}
                                        onChange={(e) => setNewServerUrl(e.target.value)}
                                        placeholder="https://mcp.example.com/v1" 
                                        className="pl-9 bg-black/50 border-white/10 text-cyan-100 font-mono focus:border-cyan-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-mono">ACCESS TOKEN (OPTIONAL)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <Input 
                                        type="password"
                                        placeholder="sk-..." 
                                        className="pl-9 bg-black/50 border-white/10 text-cyan-100 font-mono focus:border-cyan-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1 text-gray-400">Cancel</Button>
                                <Button onClick={handleAddServer} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white">
                                    Connect
                                </Button>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center gap-4">
                        <Database className="w-20 h-20 text-cyan-500" />
                        <div>
                            <p className="text-lg font-mono text-cyan-300">SELECT A SERVER NODE</p>
                            <p className="text-sm text-cyan-500/50">View capabilities, tools, and resources</p>
                        </div>
                    </div>
                 )}
                 
                 {/* Terminal Log Decorator */}
                 <div className="absolute bottom-0 left-0 right-0 h-32 bg-black/80 border-t border-white/10 p-4 font-mono text-[10px] text-green-500/80 overflow-hidden">
                     <div className="opacity-50 mb-1"> SYSTEM LOGS // STREAM ACTIVE</div>
                     <div className="space-y-1">
                         <p>{'>'} Initializing handshake protocol...</p>
                         <p>{'>'} Discovery service active.</p>
                         <p>{'>'} Ping: Localhost (4ms)</p>
                         <p>{'>'} Validating schemas for Research DB...</p>
                     </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
