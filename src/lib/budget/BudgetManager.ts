import { v4 as uuidv4 } from 'uuid';
import { AllocationTypeEnum } from './types';
import type { 
  BudgetAllocation, 
  BudgetAllocationInput, 
  BudgetSummary, 
  ExpenseTransaction 
} from './types';

/**
 * BudgetManager class for creating and managing zero-based budgets
 * Allows users to allocate their monthly income to different categories
 * and track spending against these allocations
 */
export class BudgetManager {
  private monthlyIncome: number;
  private allocations: BudgetAllocation[] = [];
  private transactions: ExpenseTransaction[] = [];

  /**
   * Creates a new BudgetManager instance
   * @param monthlyIncome The monthly after-tax income amount
   */
  constructor(monthlyIncome: number) {
    if (monthlyIncome <= 0) {
      throw new Error('Monthly income must be greater than zero');
    }
    this.monthlyIncome = monthlyIncome;
  }

  /**
   * Creates a budget with specified allocations
   * @param allocations Array of budget allocations
   * @returns True if budget was created successfully
   */
  createBudget(allocations: BudgetAllocationInput[]): boolean {
    // Validate allocations
    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    
    if (totalAllocated > this.monthlyIncome) {
      throw new Error('Total allocations exceed monthly income');
    }

    // Create budget allocations with remaining amounts initialized to allocated amounts
    this.allocations = allocations.map(allocation => ({
      ...allocation,
      remaining: allocation.amount
    }));

    return true;
  }

  /**
   * Records an expense against a specific budget category
   * @param categoryName The name of the budget category
   * @param amount The expense amount
   * @param description Description of the expense
   * @returns The ID of the created transaction
   */
  recordExpense(categoryName: string, amount: number, description: string): string {
    if (amount <= 0) {
      throw new Error('Expense amount must be greater than zero');
    }

    const categoryIndex = this.allocations.findIndex(a => a.name === categoryName);
    
    if (categoryIndex === -1) {
      throw new Error(`Budget category "${categoryName}" not found`);
    }

    const category = this.allocations[categoryIndex];
    
    if (amount > category.remaining) {
      throw new Error(`Insufficient funds in "${categoryName}". Remaining: ${category.remaining}, Expense: ${amount}`);
    }

    // Update remaining amount in the category
    this.allocations[categoryIndex] = {
      ...category,
      remaining: category.remaining - amount
    };

    // Create and store transaction record
    const transaction: ExpenseTransaction = {
      id: uuidv4(),
      categoryName,
      amount,
      description,
      date: new Date()
    };

    this.transactions.push(transaction);
    return transaction.id;
  }

  /**
   * Gets the remaining amount in a specific budget category
   * @param categoryName The name of the budget category
   * @returns The remaining amount in the category
   */
  getRemainingAmount(categoryName: string): number {
    const category = this.allocations.find(a => a.name === categoryName);
    
    if (!category) {
      throw new Error(`Budget category "${categoryName}" not found`);
    }

    return category.remaining;
  }

  /**
   * Gets a summary of the current budget state
   * @returns Budget summary information
   */
  getBudgetSummary(): BudgetSummary {
    const totalAllocated = this.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    const totalRemaining = this.allocations.reduce((sum, allocation) => sum + allocation.remaining, 0);
    
    return {
      totalIncome: this.monthlyIncome,
      totalAllocated,
      totalRemaining,
      unallocated: this.monthlyIncome - totalAllocated,
      allocations: [...this.allocations]
    };
  }

  /**
   * Gets all transactions for the current budget period
   * @returns Array of expense transactions
   */
  getTransactions(): ExpenseTransaction[] {
    return [...this.transactions];
  }

  /**
   * Gets transactions for a specific budget category
   * @param categoryName The name of the budget category
   * @returns Array of expense transactions for the category
   */
  getCategoryTransactions(categoryName: string): ExpenseTransaction[] {
    return this.transactions.filter(t => t.categoryName === categoryName);
  }

  /**
   * Updates the monthly income amount
   * @param newIncome The new monthly income amount
   * @returns True if update was successful
   */
  updateMonthlyIncome(newIncome: number): boolean {
    if (newIncome <= 0) {
      throw new Error('Monthly income must be greater than zero');
    }
    
    this.monthlyIncome = newIncome;
    return true;
  }

  /**
   * Resets the budget for a new month
   * Clears transactions and resets remaining amounts to allocated amounts
   * @returns True if reset was successful
   */
  resetBudget(): boolean {
    // Reset remaining amounts to allocated amounts
    this.allocations = this.allocations.map(allocation => ({
      ...allocation,
      remaining: allocation.amount
    }));
    
    // Clear transactions
    this.transactions = [];
    
    return true;
  }

  /**
   * Updates an existing budget allocation
   * @param categoryName The name of the budget category to update
   * @param updates The updates to apply to the allocation
   * @returns True if update was successful
   */
  updateAllocation(categoryName: string, updates: Partial<BudgetAllocationInput>): boolean {
    const categoryIndex = this.allocations.findIndex(a => a.name === categoryName);
    
    if (categoryIndex === -1) {
      throw new Error(`Budget category "${categoryName}" not found`);
    }

    const currentAllocation = this.allocations[categoryIndex];
    
    // Calculate new amount if it's being updated
    const newAmount = updates.amount !== undefined ? updates.amount : currentAllocation.amount;
    
    // Validate that total allocations won't exceed monthly income
    const otherAllocationsTotal = this.allocations
      .filter((_, index) => index !== categoryIndex)
      .reduce((sum, allocation) => sum + allocation.amount, 0);
    
    if (otherAllocationsTotal + newAmount > this.monthlyIncome) {
      throw new Error('Total allocations would exceed monthly income');
    }

    // Calculate how much has been spent from this category
    const spent = currentAllocation.amount - currentAllocation.remaining;
    
    // Update the allocation
    this.allocations[categoryIndex] = {
      name: updates.name !== undefined ? updates.name : currentAllocation.name,
      amount: newAmount,
      type: updates.type !== undefined ? updates.type : currentAllocation.type,
      remaining: Math.max(0, newAmount - spent) // Ensure remaining doesn't go negative
    };

    return true;
  }

  /**
   * Adds a new budget allocation
   * @param allocation The new budget allocation to add
   * @returns True if allocation was added successfully
   */
  addAllocation(allocation: BudgetAllocationInput): boolean {
    // Check if category name already exists
    if (this.allocations.some(a => a.name === allocation.name)) {
      throw new Error(`Budget category "${allocation.name}" already exists`);
    }
    
    // Validate that total allocations won't exceed monthly income
    const currentTotal = this.allocations.reduce((sum, a) => sum + a.amount, 0);
    
    if (currentTotal + allocation.amount > this.monthlyIncome) {
      throw new Error('Total allocations would exceed monthly income');
    }
    
    // Add the new allocation
    this.allocations.push({
      ...allocation,
      remaining: allocation.amount
    });
    
    return true;
  }

  /**
   * Removes a budget allocation
   * @param categoryName The name of the budget category to remove
   * @returns True if allocation was removed successfully
   */
  removeAllocation(categoryName: string): boolean {
    const categoryIndex = this.allocations.findIndex(a => a.name === categoryName);
    
    if (categoryIndex === -1) {
      throw new Error(`Budget category "${categoryName}" not found`);
    }
    
    // Remove the allocation
    this.allocations.splice(categoryIndex, 1);
    
    return true;
  }
}