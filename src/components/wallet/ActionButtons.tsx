import { Button } from "@/components/ui/button";
import { Send, Smartphone } from "lucide-react";

interface ActionButtonsProps {
  onSendMoney: () => void;
  onTapToPay: () => void;
}

export function ActionButtons({ 
  onSendMoney, 
  onTapToPay
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        onClick={onSendMoney}
        className="h-12 bg-gradient-primary hover:bg-gradient-primary/90 text-white border-0 shadow-wallet"
      >
        <Send className="w-4 h-4 mr-2" />
        Send Money
      </Button>
      
      <Button 
        onClick={onTapToPay}
        variant="outline"
        className="h-12 border-primary/20 hover:bg-primary/5"
      >
        <Smartphone className="w-4 h-4 mr-2" />
        Tap to Pay
      </Button>
    </div>
  );
}