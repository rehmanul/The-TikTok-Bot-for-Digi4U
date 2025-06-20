import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Sparkles } from "lucide-react";
import { Button } from "./button";

interface FeatureCalloutProps {
  title: string;
  description: string;
  onDismiss?: () => void;
  variant?: "default" | "success" | "info" | "warning";
  className?: string;
  children?: React.ReactNode;
}

const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  title,
  description,
  onDismiss,
  variant = "default",
  className,
  children
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800";
      default:
        return "bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30";
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-xl p-4 border transition-all duration-300",
        "animate-in slide-in-from-top-2 fade-in-0",
        "hover:shadow-lg hover:scale-[1.02]",
        getVariantStyles(),
        className
      )}
    >
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-60 hover:opacity-100"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            {description}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
};

export { FeatureCallout };