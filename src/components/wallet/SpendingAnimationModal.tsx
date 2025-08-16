import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { ExtendedBudgetAllocation } from "@/lib/budget/ui-types";

interface SpendingAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: ExtendedBudgetAllocation;
  spentAmount: number;
  transactionAmount: number;
}

export function SpendingAnimationModal({ 
  isOpen, 
  onClose, 
  allocation, 
  spentAmount, 
  transactionAmount 
}: SpendingAnimationModalProps) {
  const [currentSpent, setCurrentSpent] = useState(spentAmount);
  const [currentRemaining, setCurrentRemaining] = useState(allocation.remaining);
  const [animationProgress, setAnimationProgress] = useState(0);

  const newSpent = spentAmount + transactionAmount;
  const newRemaining = allocation.remaining - transactionAmount;
  const initialProgress = (spentAmount / allocation.amount) * 100;
  const finalProgress = (newSpent / allocation.amount) * 100;

  useEffect(() => {
    if (!isOpen) {
      // Reset values when modal closes
      setCurrentSpent(spentAmount);
      setCurrentRemaining(allocation.remaining);
      setAnimationProgress(0);
      return;
    }

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 FPS
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      setAnimationProgress(easeOutCubic);
      
      // Animate spent amount
      const spentDiff = newSpent - spentAmount;
      setCurrentSpent(spentAmount + (spentDiff * easeOutCubic));
      
      // Animate remaining amount
      const remainingDiff = newRemaining - allocation.remaining;
      setCurrentRemaining(allocation.remaining + (remainingDiff * easeOutCubic));
      
      if (progress >= 1) {
        clearInterval(interval);
        // Auto close after animation completes
        setTimeout(() => onClose(), 500);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isOpen, spentAmount, transactionAmount, allocation.remaining, allocation.amount, newSpent, newRemaining, onClose]);

  const currentProgress = initialProgress + ((finalProgress - initialProgress) * animationProgress);
  
  // Color intensity based on animation progress (gets more red as it animates)
  const colorIntensity = Math.min(animationProgress * 1.5, 1);
  const redIntensity = Math.floor(255 * colorIntensity);
  const greenIntensity = Math.floor(100 * (1 - colorIntensity));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-6 p-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div 
              className="w-4 h-4 rounded-full mx-auto mb-2"
              style={{ backgroundColor: allocation.color }}
            />
            <h3 className="text-xl font-semibold">{allocation.name}</h3>
            <p className="text-sm text-muted-foreground">Updating spending...</p>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Progress 
                value={currentProgress} 
                className="h-4 transition-all duration-100"
              />
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  background: `linear-gradient(to right, transparent ${currentProgress}%, rgba(255, 255, 255, 0.1) ${currentProgress}%)`
                }}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                of ${allocation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={`font-medium transition-colors duration-200 ${
                animationProgress > 0.3 ? 'text-destructive' : 'text-foreground'
              }`}>
                ${currentSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })} spent
              </span>
            </div>
          </div>

          {/* Animated Remaining Amount */}
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Remaining</p>
            <div 
              className="text-3xl font-bold transition-all duration-200 transform"
              style={{ 
                color: `rgb(${redIntensity}, ${greenIntensity}, 0)`,
                transform: `scale(${1 + (animationProgress * 0.1)})`
              }}
            >
              ${currentRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            
            {/* Pulse effect during animation */}
            {animationProgress > 0 && animationProgress < 1 && (
              <div 
                className="absolute inset-0 rounded-lg border-2 animate-pulse"
                style={{ 
                  borderColor: `rgba(${redIntensity}, ${greenIntensity}, 0, 0.3)`,
                  animation: 'pulse 0.5s ease-in-out infinite'
                }}
              />
            )}
          </div>

          {/* Transaction Details */}
          <div className="text-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              Processing ${transactionAmount.toFixed(2)} transaction
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}