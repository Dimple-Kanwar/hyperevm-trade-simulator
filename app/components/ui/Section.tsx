import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Section: React.FC<React.PropsWithChildren<{ title: string; defaultOpen?: boolean }>> = ({ title, defaultOpen = true, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50" onClick={() => setOpen(v => !v)}>
                <span className="text-sm font-semibold text-gray-800">{title}</span>
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 space-y-3">
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};