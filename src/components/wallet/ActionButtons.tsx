import { Button } from "@/components/ui/button";
import { Send, CreditCard, Plus, Settings } from "lucide-react";

interface ActionButtonsProps {
  onSendMoney: () => void;
  onTapToPay: () => void;
  onAddBudget: () => void;
  onManageBudget: () => void;
}

export function ActionButtons({ 
  onSendMoney, 
  onTapToPay, 
  onAddBudget, 
  onManageBudget 
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        size="lg" 
        className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        onClick={onSendMoney}
      >
        <Send className="w-5 h-5 mr-2" />
        Send Money
      </Button>
      
      <Button 
        size="lg" 
        variant="outline" 
        className="h-14 border-2 font-semibold"
        onClick={onTapToPay}
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Tap to Pay
      </Button>
      
      <Button 
        size="lg" 
        variant="secondary" 
        className="h-14 font-semibold"
        onClick={onAddBudget}
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Envelope
      </Button>
      
      <Button 
        size="lg" 
        variant="outline" 
        className="h-14 border-2 font-semibold"
        onClick={onManageBudget}
      >
        <Settings className="w-5 h-5 mr-2" />
        Manage Budget
      </Button>
    </div>
  );
}