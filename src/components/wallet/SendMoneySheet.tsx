import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import type { ExtendedBudgetAllocation } from "@/lib/budget/ui-types";
import { AllocationTypeEnum } from "@/lib/budget/types";

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
  const { toast } = useToast();

  const selectedEnvelope = allocations.find(a => a.name === selectedAllocation);
  const amountValue = parseFloat(amount) || 0;
  const canAfford = selectedEnvelope ? amountValue <= selectedEnvelope.remaining : false;

  const handleSend = async () => {
    if (!recipient || !amount || !selectedAllocation || !canAfford) {
      toast({
        title: "Invalid transaction",
        description: "Please fill all fields and ensure sufficient funds.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock delay for transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSend(selectedAllocation, amountValue, recipient, description || `Payment to ${recipient}`);
      
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
                  ) : (
                    <span className="text-destructive">
                      ✗ Insufficient funds (need ${ (amountValue - selectedEnvelope.remaining).toFixed(2)} more)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}


          {/* Action Button */}
          <Button 
            onClick={handleSend}
            disabled={!canAfford || !recipient || !amount || !selectedAllocation || isLoading}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? "Sending..." : `Send $${amountValue.toFixed(2)}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}