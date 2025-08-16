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
  
  // Determine envelope status color
  let statusColor = "envelope-full";
  if (remainingPercent <= 10) statusColor = "envelope-empty";
  else if (remainingPercent <= 25) statusColor = "envelope-low";
  else if (remainingPercent <= 50) statusColor = "envelope-half";

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-envelope hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="p-4">
        {/* Envelope Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className={`w-4 h-4 rounded-full bg-${statusColor}`}
              style={{ backgroundColor: allocation.color }}
            />
            <h3 className="font-semibold text-foreground">{allocation.name}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {allocation.type === 'EXPENSE' ? '💸' : '💰'}
          </div>
        </div>

        {/* Amount Display */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <span className="font-semibold text-lg">
              ${allocation.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              of ${allocation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground">
              {remainingPercent.toFixed(0)}% left
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress 
            value={percentUsed} 
            className="h-2"
            // Custom progress color based on status
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Spent: ${allocation.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span>{percentUsed.toFixed(0)}%</span>
          </div>
        </div>

        {/* Visual Envelope Indicator */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 border-2 border-muted-foreground/30 rounded-sm relative overflow-hidden">
              <div 
                className={`absolute bottom-0 left-0 bg-${statusColor} transition-all duration-500`}
                style={{ 
                  height: `${remainingPercent}%`,
                  backgroundColor: allocation.color,
                  opacity: 0.6
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {remainingPercent > 75 ? "Full" : 
               remainingPercent > 50 ? "Good" : 
               remainingPercent > 25 ? "Low" : "Empty"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}