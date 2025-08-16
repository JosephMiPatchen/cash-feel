
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
    description: string
  ) => {
    try {
      budgetManager.recordExpense(allocationName, amount, description);
      setBudgetSummary(extendBudgetSummary(budgetManager.getBudgetSummary()));
      
      toast({
        title: "Payment successful!",
        description: `$${amount.toFixed(2)} sent from ${allocationName}`,
      });
    } catch (error) {
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

  // All allocations in one section
  const allAllocations = budgetSummary.allocations;

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

        {/* All Allocations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Budget Categories</h2>
            <span className="text-sm text-muted-foreground">
              {allAllocations.length} categories
            </span>
          </div>
          
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {allAllocations.map((allocation, index) => {
              const bgColor = allocation.type === AllocationTypeEnum.BILLS ? 'bg-blue-500/3' : 
                             allocation.type === AllocationTypeEnum.SAVING ? 'bg-success/3' : 'bg-orange-500/3';
              
              return (
                <div 
                  key={allocation.id}
                  className={`animate-fade-in bg-card border border-border/50 rounded-lg p-3 ${bgColor}`}
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  onClick={() => handleAllocationClick(allocation)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{allocation.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        ${allocation.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        of ${allocation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
