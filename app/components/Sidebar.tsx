"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Home,
    Zap,
    FileSearch,
    ListTodo,
    Wrench,
    BarChart3,
    Shield,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Moon,
    Sun,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

// 🔧 Navigation structure with optional submenus
const NAVIGATION_ITEMS = [
    {
        id: "overview",
        label: "Overview",
        icon: Home,
        href: "/",
    },
    {
        id: "simulator",
        label: "Transaction Simulator",
        icon: Zap,
        href: "/simulator",
    },
    {
        id: "bundle-simulator",
        label: "Bundle Simulation",
        icon: FileSearch,
        href: "/bundle",
    },
    {
        id: "advanced-tools",
        label: "Advanced Tools",
        icon: Wrench,
        submenu: [
            {
                id: "access-list",
                label: "Access List Generator",
                icon: ListTodo,
                href: "/tools/access-list",
            },
            {
                id: "gas-profiler",
                label: "Gas Profiler",
                icon: BarChart3,
                href: "/tools/gas-profiler",
            },
            {
                id: "contract-debugger",
                label: "Contract Debugger",
                icon: Wrench,
                href: "/tools/debugger",
            },
            {
                id: "risk-checker",
                label: "Risk Checker",
                icon: Shield,
                href: "/tools/risk",
            },
        ],
    },
];

export function Sidebar({
    className,
}: {
    className?: string;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const menuRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Sync active section from URL
    const getActiveSection = () => {
        const item = NAVIGATION_ITEMS.find((item) => item.href === pathname) ||
            NAVIGATION_ITEMS.find((item) =>
                item.submenu?.some((sub) => sub.href === pathname)
            );
        return item?.id || "overview";
    };

    const activeSection = getActiveSection();

    // Toggle submenu
    const toggleSubmenu = (id: string) => {
        const newOpenSubmenus = new Set(openSubmenus);
        if (newOpenSubmenus.has(id)) {
            newOpenSubmenus.delete(id);
        } else {
            newOpenSubmenus.add(id);
        }
        setOpenSubmenus(newOpenSubmenus);
    };

    // Auto-expand submenu if active item is inside
    useEffect(() => {
        NAVIGATION_ITEMS.forEach((item) => {
            if (item.submenu) {
                const hasActive = item.submenu.some((sub) => sub.href === pathname);
                if (hasActive) {
                    setOpenSubmenus((prev) => new Set(prev).add(item.id));
                }
            }
        });
    }, [pathname]);

    // Focus management
    const focusNext = () => {
        setFocusedIndex((i) => {
            const next = i === null ? 0 : Math.min(i + 1, menuRefs.current.length - 1);
            menuRefs.current[next]?.focus();
            return next;
        });
    };

    const focusPrev = () => {
        setFocusedIndex((i) => {
            const next = i === null ? 0 : Math.max(i - 1, 0);
            menuRefs.current[next]?.focus();
            return next;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                focusNext();
                break;
            case "ArrowUp":
                e.preventDefault();
                focusPrev();
                break;
            case "Enter":
                if (focusedIndex !== null && menuRefs.current[focusedIndex]) {
                    menuRefs.current[focusedIndex]?.click();
                }
                break;
            case "Escape":
                setIsCollapsed(false);
                break;
        }
    };

    // Navigate and close mobile menu
    const handleNavigate = (href: string) => {
        router.push(href);
    };

    return (
        <div
            className={cn(
                "flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        <span className="font-semibold text-white">HyperSim</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-400 hover:text-white"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1" role="menu">
                {NAVIGATION_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = item.href === pathname;
                    const hasSubmenu = !!item.submenu;

                    return (
                        <div key={item.id}>
                            {!hasSubmenu ? (
                                <Button
                                    ref={(el) => {(menuRefs.current[index] = el)}}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNavigate(item.href)}
                                    className={cn(
                                        "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 transition-colors",
                                        isActive && "bg-blue-900/30 text-blue-300 border-r-2 border-blue-500",
                                        isCollapsed && "px-3 justify-center"
                                    )}
                                    role="menuitem"
                                >
                                    <div
                                        className={cn(
                                            "flex items-center",
                                            isCollapsed ? "flex-col space-y-1" : "space-x-3"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                                    </div>
                                </Button>
                            ) : (
                                <div>
                                    <Button
                                        ref={(el) => {(menuRefs.current[index] = el)}}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSubmenu(item.id)}
                                        className={cn(
                                            "w-full justify-between text-gray-300 hover:text-white hover:bg-gray-700 transition-colors",
                                            isCollapsed && "px-3 justify-center"
                                        )}
                                        role="menuitem"
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center",
                                                isCollapsed ? "flex-col space-y-1" : "space-x-3"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {!isCollapsed && <span className="text-sm">{item.label}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown
                                                className={cn(
                                                    "w-4 h-4 transition-transform",
                                                    openSubmenus.has(item.id) ? "rotate-180" : ""
                                                )}
                                            />
                                        )}
                                    </Button>

                                    {/* Submenu */}
                                    {openSubmenus.has(item.id) && !isCollapsed && (
                                        <div className="mt-1 space-y-1 pl-4 border-l-2 border-gray-600">
                                            {item.submenu.map((sub, subIdx) => {
                                                const SubIcon = sub.icon;
                                                const isSubActive = sub.href === pathname;
                                                const subIndex = index + subIdx + 1; // Adjust focus index

                                                return (
                                                    <Button
                                                        key={sub.id}
                                                        ref={(el) => { (menuRefs.current[subIndex] = el) }}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleNavigate(sub.href)}
                                                        className={cn(
                                                            "w-full justify-start text-xs text-gray-400 hover:text-white hover:bg-gray-700",
                                                            isSubActive && "bg-green-900/20 text-green-300 border-r border-green-500"
                                                        )}
                                                        role="menuitem"
                                                    >
                                                        <SubIcon className="w-3 h-3 mr-2" />
                                                        {sub.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 space-y-2">
                {/* Theme Toggle */}
                <ThemeToggle isCollapsed={isCollapsed}/>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate("/settings")}
                    className={cn(
                        "w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800",
                        pathname === "/settings" && "text-blue-400"
                    )}
                >
                    <Settings className="w-4 h-4" />
                    {!isCollapsed && <span className="text-sm">Settings</span>}
                </Button>
            </div>
        </div>
    );
}