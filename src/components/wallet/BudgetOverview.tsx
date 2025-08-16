import { Card } from "@/components/ui/card";
import type { ExtendedBudgetSummary } from "@/lib/budget/ui-types";
import { AllocationTypeEnum } from "@/lib/budget/types";

interface BudgetOverviewProps {
  budgetSummary: ExtendedBudgetSummary;
}

export function BudgetOverview({ budgetSummary }: BudgetOverviewProps) {
  const spendingAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.EXPENSE);
  const savingAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.SAVING);
  
  const totalSpending = spendingAllocations.reduce((sum, a) => sum + a.amount, 0);
  const totalSaving = savingAllocations.reduce((sum, a) => sum + a.amount, 0);
  const totalBills = 0; // For now, assuming bills are separate from spending/saving
  
  const income = budgetSummary.totalIncome;
  const spendingPercent = income > 0 ? (totalSpending / income) * 100 : 0;
  const savingPercent = income > 0 ? (totalSaving / income) * 100 : 0;
  const billsPercent = income > 0 ? (totalBills / income) * 100 : 0;

  return (
    <Card className="shadow-transaction">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Monthly Budget</h2>
          <span className="text-sm text-muted-foreground">${income.toLocaleString()}</span>
        </div>
        
        {/* Budget Items */}
        <div className="space-y-2">
          {/* Spending */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-sm">Spending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">${totalSpending.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground w-8 text-right">{spendingPercent.toFixed(0)}%</span>
            </div>
          </div>

          {/* Bills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm">Bills</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">${totalBills.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground w-8 text-right">{billsPercent.toFixed(0)}%</span>
            </div>
          </div>

          {/* Saving */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm">Saving</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">${totalSaving.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground w-8 text-right">{savingPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="mt-3">
          <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-accent transition-all duration-500" 
              style={{ width: `${spendingPercent}%` }}
            />
            <div 
              className="bg-primary transition-all duration-500" 
              style={{ width: `${billsPercent}%` }}
            />
            <div 
              className="bg-success transition-all duration-500" 
              style={{ width: `${savingPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}