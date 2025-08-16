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
  const unallocatedPercent = 100 - spendingPercent - savingPercent - billsPercent;

  return (
    <Card className="shadow-transaction">
      <div className="p-3">
        <h2 className="text-base font-semibold mb-3">Monthly Budget</h2>
        
        {/* Budget Breakdown Bar */}
        <div className="space-y-2">
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-accent transition-all duration-300" 
              style={{ width: `${spendingPercent}%` }}
            />
            <div 
              className="bg-primary transition-all duration-300" 
              style={{ width: `${billsPercent}%` }}
            />
            <div 
              className="bg-success transition-all duration-300" 
              style={{ width: `${savingPercent}%` }}
            />
            <div 
              className="bg-muted-foreground/20 transition-all duration-300" 
              style={{ width: `${unallocatedPercent}%` }}
            />
          </div>
          
          {/* Legend */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="text-muted-foreground">Spending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-muted-foreground">Bills</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-muted-foreground">Saving</span>
            </div>
          </div>
          
          {/* Income Total */}
          <div className="text-center pt-1">
            <span className="text-sm text-muted-foreground">
              ${income.toLocaleString('en-US', { minimumFractionDigits: 0 })} monthly income
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}