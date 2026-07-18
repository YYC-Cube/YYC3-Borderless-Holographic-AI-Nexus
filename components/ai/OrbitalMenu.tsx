import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, History, Users, X, Keyboard, Grid } from 'lucide-react';

interface MenuItem {
    id: string;
    icon: React.ElementType;
    label: string;
    action: () => void;
    color: string;
}

interface OrbitalMenuProps {
    /** Legacy / explicit-action API. */
    onOpenSettings?: () => void;
    onOpenHistory?: () => void;
    onOpenDebate?: () => void;
    onToggleTextMode?: () => void;
    onOpenHub?: () => void;
    /** Newer / generic API — dispatched with the menu item id. */
    onSelect?: (id: string) => void;
    isOpen: boolean;
    /** Preferred setter. Falls back to `onClose` if provided. */
    setIsOpen?: (v: boolean) => void;
    /** Alternative close handler used when `setIsOpen` is not provided. */
    onClose?: () => void;
    position: { x: number, y: number };
}

export function OrbitalMenu({
    onOpenSettings,
    onOpenHistory,
    onOpenDebate,
    onToggleTextMode,
    onOpenHub,
    onSelect,
    isOpen,
    setIsOpen,
    onClose,
    position
}: OrbitalMenuProps) {
    /** Close the menu regardless of which API the caller used. */
    const close = () => {
        if (setIsOpen) setIsOpen(false);
        else if (onClose) onClose();
    };

    /** Dispatch a menu action via both APIs to remain backward compatible. */
    const dispatch = (id: string, fallback?: () => void) => {
        if (onSelect) onSelect(id);
        else if (fallback) fallback();
    };

    const menuItems: MenuItem[] = [
        { id: 'hub', icon: Grid, label: '智能中心', action: () => dispatch('hub', onOpenHub), color: 'bg-indigo-500' },
        { id: 'settings', icon: Settings, label: '设置', action: () => dispatch('config', onOpenSettings), color: 'bg-cyan-500' },
        { id: 'history', icon: History, label: '记忆', action: () => dispatch('history', onOpenHistory), color: 'bg-purple-500' },
        { id: 'debate', icon: Users, label: '辩论', action: () => dispatch('debate', onOpenDebate), color: 'bg-pink-500' },
        { id: 'textmode', icon: Keyboard, label: '输入', action: () => dispatch('textmode', onToggleTextMode), color: 'bg-emerald-500' },
    ];

    // Calculate orbital positions
    const radius = 90; // Slightly larger radius for 5 items
    const startAngle = -90; // Top
    const angleStep = 360 / menuItems.length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
                        onClick={close}
                    />

                    {/* Menu Container at touch position */}
                    <div
                        className="fixed z-50 pointer-events-none"
                        style={{ left: position.x, top: position.y }}
                    >
                        {/* Central Close Button */}
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-white/20 transition-colors"
                            onClick={close}
                        >
                            <X className="w-5 h-5" />
                        </motion.button>

                        {/* Orbiting Items */}
                        {menuItems.map((item, index) => {
                            const angle = (startAngle + index * angleStep) * (Math.PI / 180);
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;

                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                                    animate={{ 
                                        x, 
                                        y, 
                                        scale: 1, 
                                        opacity: 1,
                                        transition: { type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }
                                    }}
                                    exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full ${item.color} shadow-lg shadow-black/50 flex items-center justify-center text-white pointer-events-auto hover:scale-110 transition-transform`}
                                    onClick={() => {
                                        item.action();
                                        close();
                                    }}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {/* Label Tooltip */}
                                    <div className="absolute top-full mt-2 text-[10px] font-medium text-white/80 whitespace-nowrap bg-black/50 px-2 py-0.5 rounded-full pointer-events-none opacity-0 hover:opacity-100">
                                        {item.label}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
