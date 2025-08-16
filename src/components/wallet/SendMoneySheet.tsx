import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import type { ExtendedBudgetAllocation } from "@/lib/budget/ui-types";
import { AllocationTypeEnum } from "@/lib/budget/types";
import { SpendingAnimationModal } from "./SpendingAnimationModal";

interface SendMoneySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (allocation: string, amount: number, recipient: string, description: string) => void;
  allocations: ExtendedBudgetAllocation[];
}

export function SendMoneySheet({ isOpen, onClose, onSend, allocations }: SendMoneySheetProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAllocation, setSelectedAllocation] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allowOverspend, setAllowOverspend] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState<{ allocation: ExtendedBudgetAllocation; amount: number } | null>(null);
  const { toast } = useToast();

  const selectedEnvelope = allocations.find(a => a.name === selectedAllocation);
  const amountValue = parseFloat(amount) || 0;
  const canAfford = selectedEnvelope ? amountValue <= selectedEnvelope.remaining : false;
  const willOverspend = selectedEnvelope ? amountValue > selectedEnvelope.remaining : false;
  const overspendAmount = selectedEnvelope && willOverspend ? amountValue - selectedEnvelope.remaining : 0;

  const handleSend = async () => {
    if (!recipient || !amount || !selectedAllocation) {
      toast({
        title: "Invalid transaction",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (willOverspend && !allowOverspend) {
      toast({
        title: "Budget Override Required",
        description: "Enable 'Allow Overspending' to proceed with this transaction.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock delay for transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSend(selectedAllocation, amountValue, recipient, description || `Payment to ${recipient}`);
      
      // Show animation modal
      if (selectedEnvelope) {
        setAnimationData({ allocation: selectedEnvelope, amount: amountValue });
        setShowAnimation(true);
      }
      
      toast({
        title: "Money sent successfully!",
        description: `$${amountValue.toFixed(2)} sent from ${selectedAllocation}`,
      });
      
      // Reset form
      setRecipient("");
      setAmount("");
      setSelectedAllocation("");
      setDescription("");
      onClose();
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Send Money</SheetTitle>
          <SheetDescription>
            Send money to recipients
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address or ENS</Label>
            <Input
              id="recipient"
              placeholder="0x... or username.eth"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (PYUSD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Spending Category Selection */}
          <div className="space-y-2">
            <Label>Spending Category</Label>
            <Select value={selectedAllocation} onValueChange={setSelectedAllocation}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select spending category" />
              </SelectTrigger>
              <SelectContent>
                {allocations
                  .filter(allocation => allocation.type === AllocationTypeEnum.EXPENSE)
                  .map((allocation) => (
                  <SelectItem key={allocation.id} value={allocation.name}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: allocation.color }}
                        />
                        <span>{allocation.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground ml-4">
                        ${allocation.remaining.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Envelope Status */}
          {selectedEnvelope && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{selectedEnvelope.name}</span>
                <span className="text-sm text-muted-foreground">
                  Available: ${selectedEnvelope.remaining.toFixed(2)}
                </span>
              </div>
              {amountValue > 0 && (
                <div className="text-sm">
                  {canAfford ? (
                    <span className="text-success">
                      ✓ After transaction: ${(selectedEnvelope.remaining - amountValue).toFixed(2)}
                    </span>
                  ) : willOverspend ? (
                    <div className="space-y-1">
                      <span className="text-destructive font-medium">
                        ⚠️ This will exceed your budget by ${overspendAmount.toFixed(2)}
                      </span>
                      <span className="text-destructive text-xs block">
                        Category will be -${Math.abs(selectedEnvelope.remaining - amountValue).toFixed(2)} after transaction
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Overspend Override Switch */}
          {willOverspend && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-overspend" className="text-sm font-medium text-destructive">
                    Allow Overspending
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Override budget limits for this transaction
                  </p>
                </div>
                <Switch
                  id="allow-overspend"
                  checked={allowOverspend}
                  onCheckedChange={setAllowOverspend}
                />
              </div>
              {allowOverspend && (
                <div className="text-xs text-destructive font-medium">
                  ⚠️ Budget override enabled - transaction will exceed category limit
                </div>
              )}
            </div>
          )}


          {/* Action Button */}
          <Button 
            onClick={handleSend}
            disabled={!recipient || !amount || !selectedAllocation || isLoading || (willOverspend && !allowOverspend)}
            className={`w-full h-12 text-lg font-semibold ${willOverspend && allowOverspend ? 'bg-destructive hover:bg-destructive/90' : ''}`}
            size="lg"
            variant={willOverspend && allowOverspend ? "destructive" : "default"}
          >
            {isLoading ? "Sending..." : willOverspend && allowOverspend ? `⚠️ Overspend $${overspendAmount.toFixed(2)}` : `Send $${amountValue.toFixed(2)}`}
          </Button>
        </div>
      </SheetContent>

      {/* Spending Animation Modal */}
      {animationData && (
        <SpendingAnimationModal
          isOpen={showAnimation}
          onClose={() => setShowAnimation(false)}
          allocation={animationData.allocation}
          spentAmount={animationData.amount}
        />
      )}
    </Sheet>
  );
}