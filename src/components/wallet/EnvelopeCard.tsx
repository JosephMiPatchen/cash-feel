import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ExtendedBudgetAllocation } from "@/lib/budget/ui-types";

interface EnvelopeCardProps {
  allocation: ExtendedBudgetAllocation;
  onClick?: () => void;
}

export function EnvelopeCard({ allocation, onClick }: EnvelopeCardProps) {
  const percentUsed = (allocation.spent / allocation.amount) * 100;
  const remainingPercent = ((allocation.amount - allocation.spent) / allocation.amount) * 100;
  const isOverspent = allocation.spent > allocation.amount;
  
  // Determine envelope status color
  let statusColor = "envelope-full";
  if (remainingPercent <= 10) statusColor = "envelope-empty";
  else if (remainingPercent <= 25) statusColor = "envelope-low";
  else if (remainingPercent <= 50) statusColor = "envelope-half";

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-envelope hover:scale-[1.02] active:scale-[0.98] ${
        isOverspent ? 'border-destructive border-2 animate-pulse' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-3">
        {/* Envelope Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm text-foreground">{allocation.name}</h3>
          </div>
          <span className="font-semibold text-sm">
            ${allocation.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress 
            value={Math.min(percentUsed, 100)} 
            className={`h-1.5 ${isOverspent ? '[&>*]:!bg-destructive' : ''}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>of ${allocation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>{remainingPercent.toFixed(0)}% left</span>
          </div>
        </div>
      </div>
    </Card>
  );
}