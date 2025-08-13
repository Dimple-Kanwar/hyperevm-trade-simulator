import { Button } from "@/app/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ToggleProps {
    isCollapsed: boolean
}
export function ThemeToggle({ isCollapsed }: ToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
        // <Button
        //     variant="ghost"
        //     size="sm"
        //     onClick={() => setTheme(theme === "light" ? "light" : "dark")}
        //     aria-label="Toggle theme"
        //     className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800"
        // >
        //     {theme === "dark" ? (
        //         <>
        //             <Sun className="w-4 h-4" />
        //             {!isCollapsed && <span className="text-sm">Light Mode</span>}
        //         </>
        //     ) : (
        //         <>
        //             <Moon className="w-4 h-4" />
        //             {!isCollapsed && <span className="text-sm">Dark Mode</span>}
        //         </>
        //     )}
        // </Button>
    );
}