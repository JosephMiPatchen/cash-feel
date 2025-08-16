
import { useState, useEffect } from "react";
import { WalletBalance } from "./WalletBalance";
import { BudgetOverview } from "./BudgetOverview";
import { EnvelopeCard } from "./EnvelopeCard";
import { ActionButtons } from "./ActionButtons";
import { SendMoneySheet } from "./SendMoneySheet";
import { BudgetManager } from "@/lib/budget/BudgetManager";
import { AllocationTypeEnum } from "@/lib/budget/types";
import { extendBudgetSummary } from "@/lib/budget/ui-types";
import { useToast } from "@/hooks/use-toast";

export function WalletDashboard() {
  const { toast } = useToast();
  const [budgetManager] = useState(() => {
    // Initialize with sample data
    const manager = new BudgetManager(5000);
    manager.createBudget([
      { name: "Groceries", amount: 600, type: AllocationTypeEnum.EXPENSE },
      { name: "Coffee & Dining", amount: 250, type: AllocationTypeEnum.EXPENSE },
      { name: "Transportation", amount: 300, type: AllocationTypeEnum.EXPENSE },
      { name: "Entertainment", amount: 150, type: AllocationTypeEnum.EXPENSE },
      { name: "Emergency Fund", amount: 700, type: AllocationTypeEnum.SAVING },
      { name: "Rent", amount: 2000, type: AllocationTypeEnum.BILLS },
      { name: "Utilities", amount: 200, type: AllocationTypeEnum.BILLS },
      { name: "Phone", amount: 100, type: AllocationTypeEnum.BILLS },
      { name: "Internet", amount: 100, type: AllocationTypeEnum.BILLS },
      { name: "Vacation Fund", amount: 600, type: AllocationTypeEnum.SAVING },
    ]);
    
    // Add some sample transactions
    manager.recordExpense("Coffee & Dining", 45.50, "Coffee with friends");
    manager.recordExpense("Groceries", 124.75, "Weekly grocery shopping");
    manager.recordExpense("Transportation", 15.00, "Bus fare");
    
    return manager;
  });

  const [walletBalance] = useState(2847.50);
  const [budgetSummary, setBudgetSummary] = useState(() => 
    extendBudgetSummary(budgetManager.getBudgetSummary())
  );
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);

  const handleSendMoney = (
    allocationName: string, 
    amount: number, 
    recipient: string, 
    description: string,
    allowOverspend: boolean = false
  ) => {
    try {
      console.log('handleSendMoney called with:', { allocationName, amount, recipient, description, allowOverspend });

      const prevRemaining = budgetManager.getRemainingAmount(allocationName);

      if (allowOverspend && amount > prevRemaining) {
        console.log('Overspend path: using forceRecordExpense');
        budgetManager.forceRecordExpense(allocationName, amount, description);
      } else {
        budgetManager.recordExpense(allocationName, amount, description, allowOverspend);
        console.log('recordExpense completed');
      }
      
      const newSummary = extendBudgetSummary(budgetManager.getBudgetSummary());
      console.log('New budget summary:', newSummary);
      
      setBudgetSummary(newSummary);
      console.log('Budget summary state updated');
      
      const overspendBy = Math.max(0, amount - prevRemaining);
      toast({
        title: "Payment successful!",
        description: overspendBy > 0 && allowOverspend 
          ? `$${amount.toFixed(2)} sent from ${allocationName} (overspent by $${overspendBy.toFixed(2)})`
          : `$${amount.toFixed(2)} sent from ${allocationName}`,
      });
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleTapToPay = () => {
    toast({
      title: "Tap to Pay",
      description: "Feature coming soon!",
    });
  };

  const handleAllocationClick = (allocation: any) => {
    toast({
      title: allocation.name,
      description: `$${allocation.remaining.toFixed(2)} remaining of $${allocation.amount.toFixed(2)}`,
    });
  };

  // Separate allocations by type
  const spendingAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.EXPENSE);
  const billsAllocations = budgetSummary.allocations.filter(a => a.type === AllocationTypeEnum.BILLS);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 pt-6 pb-8 space-y-6">
        {/* Wallet Balance */}
        <div className="animate-fade-in">
          <WalletBalance balance={walletBalance} />
        </div>

        {/* Action Buttons */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <ActionButtons
            onSendMoney={() => setIsSendMoneyOpen(true)}
            onTapToPay={handleTapToPay}
          />
        </div>

        {/* Budget Overview */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <BudgetOverview budgetSummary={budgetSummary} />
        </div>

        {/* Spending Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Spending</h2>
            <span className="text-sm text-muted-foreground">
              {spendingAllocations.length} categories
            </span>
          </div>
          
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {spendingAllocations.map((allocation, index) => (
              <div 
                key={allocation.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <EnvelopeCard 
                  allocation={allocation}
                  onClick={() => handleAllocationClick(allocation)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bills Section */}
        {billsAllocations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bills</h2>
              <span className="text-sm text-muted-foreground">
                {billsAllocations.length} scheduled
              </span>
            </div>
            
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              {billsAllocations.map((allocation, index) => (
                <div 
                  key={allocation.id}
                  className="animate-fade-in bg-card border border-border/50 rounded-lg p-3 bg-blue-500/3"
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{allocation.name}</span>
                    <span className="font-semibold">
                      ${allocation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Send Money Sheet */}
      <SendMoneySheet
        isOpen={isSendMoneyOpen}
        onClose={() => setIsSendMoneyOpen(false)}
        onSend={handleSendMoney}
        allocations={budgetSummary.allocations}
      />
    </div>
  );
}
