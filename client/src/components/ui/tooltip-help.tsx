import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Info, Lightbulb } from "lucide-react";

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-lg bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg",
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "border border-border/50 backdrop-blur-sm bg-background/95",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface HelpTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  variant?: "default" | "info" | "tip";
  className?: string;
  children?: React.ReactNode;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  side = "top",
  variant = "default",
  className,
  children
}) => {
  const getIcon = () => {
    switch (variant) {
      case "info":
        return <Info className="w-4 h-4" />;
      case "tip":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "info":
        return "text-blue-500 hover:text-blue-600";
      case "tip":
        return "text-yellow-500 hover:text-yellow-600";
      default:
        return "text-muted-foreground hover:text-foreground";
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children || (
            <button
              className={cn(
                "inline-flex items-center justify-center transition-all duration-200",
                "hover:scale-110 hover:rotate-12 active:scale-95",
                getIconColor(),
                className
              )}
              type="button"
            >
              {getIcon()}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className={cn(
            "max-w-xs",
            variant === "info" && "border-blue-200 bg-blue-50/90 text-blue-900 dark:border-blue-800 dark:bg-blue-950/90 dark:text-blue-100",
            variant === "tip" && "border-yellow-200 bg-yellow-50/90 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/90 dark:text-yellow-100"
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-current" />
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
};

export { HelpTooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };