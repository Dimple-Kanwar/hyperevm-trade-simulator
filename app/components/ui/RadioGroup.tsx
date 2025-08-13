import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export const RadioGroup = React.forwardRef<
  HTMLDivElement,
  RadioGroupProps
>(({ label, className, children, ...props }, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <RadioGroupPrimitive.Root
        ref={ref}
        className="flex flex-col gap-2"
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Root>
    </div>
  );
});
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
}

export const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  RadioGroupItemProps
>(({ label, ...props }, ref) => {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "h-4 w-4 rounded-full border-2 border-gray-400 dark:border-gray-600",
          "flex items-center justify-center bg-white dark:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
          "data-[state=checked]:border-blue-600"
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2 w-2 fill-blue-600" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        {label}
      </label>
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";