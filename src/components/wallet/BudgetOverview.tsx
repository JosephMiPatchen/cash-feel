
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ExtendedBudgetSummary } from "@/lib/budget/ui-types";
import { AllocationTypeEnum } from "@/lib/budget/types";

interface BudgetOverviewProps {
  budgetSummary: ExtendedBudgetSummary;
}

export function BudgetOverview({ budgetSummary }: BudgetOverviewProps) {
  const spendingAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.EXPENSE);
  const savingAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.SAVING);
  
  const totalSpending = spendingAllocations.reduce((sum, a) => sum + a.amount, 0);
  const spendingSpent = spendingAllocations.reduce((sum, a) => sum + a.spent, 0);
  const spendingRemaining = spendingAllocations.reduce((sum, a) => sum + a.remaining, 0);
  const spentPercentage = totalSpending > 0 ? (spendingSpent / totalSpending) * 100 : 0;
  
  const totalSaving = savingAllocations.reduce((sum, a) => sum + a.amount, 0);
  
  return (
    <Card className="shadow-transaction">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Monthly Budget</h2>
        
        <div className="space-y-3">
          {/* Total Remaining */}
          <div className="text-center py-1">
            <div className="text-2xl font-bold text-success">
              ${spendingRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Remaining this month</p>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={spentPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Spent: ${spendingSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span>Total: ${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
                ${totalSaving.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">Saving/Investing</p>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-success">
                {totalSpending > 0 ? (100 - spentPercentage).toFixed(0) : 100}%
              </div>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
