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
      { name: "Groceries", amount: 800, type: AllocationTypeEnum.EXPENSE },
      { name: "Coffee & Dining", amount: 300, type: AllocationTypeEnum.EXPENSE },
      { name: "Transportation", amount: 400, type: AllocationTypeEnum.EXPENSE },
      { name: "Entertainment", amount: 200, type: AllocationTypeEnum.EXPENSE },
      { name: "Emergency Fund", amount: 500, type: AllocationTypeEnum.SAVING },
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


  const handleEnvelopeClick = (allocation: any) => {
    toast({
      title: allocation.name,
      description: `$${allocation.remaining.toFixed(2)} remaining of $${allocation.amount.toFixed(2)}`,
    });
  };

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

        {/* Envelopes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Envelopes</h2>
            <span className="text-sm text-muted-foreground">
              {budgetSummary.allocations.length} active
            </span>
          </div>
          
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {budgetSummary.allocations.map((allocation, index) => (
              <div 
                key={allocation.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <EnvelopeCard 
                  allocation={allocation}
                  onClick={() => handleEnvelopeClick(allocation)}
                />
              </div>
            ))}
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