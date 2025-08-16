import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ExtendedBudgetSummary } from "@/lib/budget/ui-types";
import { AllocationTypeEnum } from "@/lib/budget/types";

interface BudgetOverviewProps {
  budgetSummary: ExtendedBudgetSummary;
}

export function BudgetOverview({ budgetSummary }: BudgetOverviewProps) {
  const spendingAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.EXPENSE);
  const savingAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.SAVING);
  const billsAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.BILLS);
  
  const totalSpending = spendingAllocations.reduce((sum, a) => sum + a.amount, 0);
  const totalSaving = savingAllocations.reduce((sum, a) => sum + a.amount, 0);
  const totalBills = billsAllocations.reduce((sum, a) => sum + a.amount, 0);
  
  const income = budgetSummary.totalIncome;
  const spendingPercent = income > 0 ? (totalSpending / income) * 100 : 0;
  const savingPercent = income > 0 ? (totalSaving / income) * 100 : 0;
  const billsPercent = income > 0 ? (totalBills / income) * 100 : 0;

  // Pie chart data
  const pieData = [
    { name: 'Spending', value: totalSpending, color: '#f97316' },
    { name: 'Bills', value: totalBills, color: '#3b82f6' },
    { name: 'Saving', value: totalSaving, color: 'hsl(var(--success))' },
  ];

  return (
    <Card className="shadow-transaction">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Monthly Budget</h2>
          <span className="text-sm text-muted-foreground">${income.toLocaleString()} monthly income</span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Budget Table */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground mb-2">
              <div>Category</div>
              <div className="text-right">Amount</div>
              <div className="text-right">%</div>
            </div>
            
            <div className="space-y-2">
              {/* Spending */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500"></div>
                  <span className="text-sm font-medium">Spending</span>
                </div>
                <div className="text-right text-sm font-semibold">${totalSpending.toLocaleString()}</div>
                <div className="text-right text-xs text-muted-foreground">{spendingPercent.toFixed(0)}%</div>
              </div>

              {/* Bills */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500"></div>
                  <span className="text-sm font-medium">Bills</span>
                </div>
                <div className="text-right text-sm font-semibold">${totalBills.toLocaleString()}</div>
                <div className="text-right text-xs text-muted-foreground">{billsPercent.toFixed(0)}%</div>
              </div>

              {/* Saving */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span className="text-sm font-medium">Saving</span>
                </div>
                <div className="text-right text-sm font-semibold">${totalSaving.toLocaleString()}</div>
                <div className="text-right text-xs text-muted-foreground">{savingPercent.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="w-16 h-16 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={12}
                  outerRadius={32}
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}