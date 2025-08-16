import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { ExtendedBudgetAllocation } from "@/lib/budget/ui-types";

interface SpendingAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: ExtendedBudgetAllocation;
  spentAmount: number;
}

export function SpendingAnimationModal({ 
  isOpen, 
  onClose, 
  allocation, 
  spentAmount 
}: SpendingAnimationModalProps) {
  const [animatedSpent, setAnimatedSpent] = useState(allocation.spent);
  const [animatedRemaining, setAnimatedRemaining] = useState(allocation.remaining);
  const [progressValue, setProgressValue] = useState((allocation.spent / allocation.amount) * 100);

  useEffect(() => {
    if (!isOpen) return;

    // Reset to initial values
    setAnimatedSpent(allocation.spent);
    setAnimatedRemaining(allocation.remaining);
    setProgressValue((allocation.spent / allocation.amount) * 100);

    // Start animation after a brief delay
    const timer = setTimeout(() => {
      // Check if transaction would go over budget
      const wouldGoOverBudget = spentAmount > allocation.remaining;
      
      // For over budget transactions, keep amounts unchanged
      const newSpent = wouldGoOverBudget ? allocation.spent : allocation.spent + spentAmount;
      const newRemaining = wouldGoOverBudget ? allocation.remaining : allocation.remaining - spentAmount;
      const newProgress = (newSpent / allocation.amount) * 100;

      // Dynamic duration based on transaction size relative to category total
      const transactionPercentage = (spentAmount / allocation.amount) * 100;
      const duration = transactionPercentage < 10 ? 1500 : 3000; // 1.5s for <10%, 3s for >=10%
      const steps = 60; // 60 steps for smooth animation
      const interval = duration / steps;

      let currentStep = 0;
      const animationInterval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        // Use easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setAnimatedSpent(allocation.spent + ((newSpent - allocation.spent) * easedProgress));
        setAnimatedRemaining(allocation.remaining + ((newRemaining - allocation.remaining) * easedProgress));
        setProgressValue((allocation.spent / allocation.amount) * 100 + (((newSpent - allocation.spent) / allocation.amount) * 100 * easedProgress));

        if (currentStep >= steps) {
          clearInterval(animationInterval);
          // Auto close after animation completes
          setTimeout(() => {
            onClose();
          }, 500);
        }
      }, interval);

      return () => clearInterval(animationInterval);
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, allocation, spentAmount, onClose]);

  const remainingPercentage = (animatedRemaining / allocation.amount) * 100;
  const isOverBudget = animatedRemaining < 0;
  const overspentAmount = isOverBudget ? Math.abs(animatedRemaining) : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Spending Animation</DialogTitle>
        <DialogDescription className="sr-only">
          Animation showing spending update for {allocation.name}
        </DialogDescription>
        <div className="text-center space-y-6 p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{allocation.name}</h3>
            <p className={`text-sm ${isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              {isOverBudget ? '⚠️ Budget Exceeded!' : 'Spending Update'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent</span>
                <span>${animatedSpent.toFixed(2)} / ${allocation.amount.toFixed(2)}</span>
              </div>
              <Progress 
                value={Math.min(progressValue, 100)} 
                className={`h-3 ${isOverBudget ? 'animate-pulse' : ''}`} 
              />
              {isOverBudget && (
                <div className="text-xs text-destructive font-medium">
                  ${((animatedSpent - allocation.amount) / allocation.amount * 100).toFixed(1)}% over budget
                </div>
              )}
            </div>

            {/* Remaining Amount with Color Animation */}
            <div className="p-4 rounded-lg border-2 transition-all duration-300"
                 style={{
                   borderColor: isOverBudget ? '#ef4444' : remainingPercentage < 20 ? '#ef4444' : remainingPercentage < 50 ? '#f97316' : '#22c55e',
                   backgroundColor: isOverBudget ? 'rgba(239, 68, 68, 0.15)' : remainingPercentage < 20 ? 'rgba(239, 68, 68, 0.1)' : remainingPercentage < 50 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(34, 197, 94, 0.1)'
                 }}>
              <div className="text-sm text-muted-foreground">
                {isOverBudget ? 'Over Budget' : 'Remaining'}
              </div>
              <div 
                className="text-2xl font-bold transition-colors duration-300"
                style={{
                  color: isOverBudget ? '#ef4444' : remainingPercentage < 20 ? '#ef4444' : remainingPercentage < 50 ? '#f97316' : '#22c55e'
                }}
              >
                {isOverBudget ? `+$${overspentAmount.toFixed(2)}` : `$${animatedRemaining.toFixed(2)}`}
              </div>
              {isOverBudget && (
                <div className="text-xs text-destructive mt-1">
                  You've exceeded this category's budget
                </div>
              )}
            </div>

            {/* Category Color Indicator */}
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: allocation.color }}
              />
              <span className="text-sm font-medium">{allocation.name}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}