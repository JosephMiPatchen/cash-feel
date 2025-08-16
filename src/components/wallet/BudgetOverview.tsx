import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ExtendedBudgetSummary } from "@/lib/budget/ui-types";

interface BudgetOverviewProps {
  budgetSummary: ExtendedBudgetSummary;
}

export function BudgetOverview({ budgetSummary }: BudgetOverviewProps) {
  const spentPercentage = (budgetSummary.totalSpent / budgetSummary.totalAllocated) * 100;
  const remainingAmount = budgetSummary.totalRemaining;
  
  return (
    <Card className="shadow-transaction">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Monthly Budget</h2>
          <div className="text-sm text-muted-foreground">
            {budgetSummary.allocations.length} envelope{budgetSummary.allocations.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Total Remaining */}
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-success">
              ${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Remaining this month</p>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={spentPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Spent: ${budgetSummary.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span>Total: ${budgetSummary.totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
            <div className="text-center">
              <div className="text-sm font-semibold">
                ${budgetSummary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">Income</p>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold">
                ${budgetSummary.unallocated.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">Unallocated</p>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-success">
                {(100 - spentPercentage).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}