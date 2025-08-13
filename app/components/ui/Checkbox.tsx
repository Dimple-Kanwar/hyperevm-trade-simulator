import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  className?: string;
}

export const Checkbox = React.forwardRef<
  HTMLButtonElement,
  CheckboxProps
>(({ label, className, ...props }, ref) => {
  return (
    <div className="flex items-start gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "mt-1 h-4 w-4 rounded border border-gray-400 dark:border-gray-600",
          "flex items-center justify-center bg-white dark:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
          "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
          "transition-colors duration-150",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          {props.checked === "indeterminate" ? (
            <Minus className="h-3 w-3 text-white" />
          ) : (
            <Check className="h-3 w-3 text-white" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";