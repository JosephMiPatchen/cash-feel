/**
 * Extended types for the budget management UI components
 */
import type { BudgetAllocation, BudgetSummary } from './types';

/**
 * Extended budget allocation with UI-specific properties
 */
export interface ExtendedBudgetAllocation extends BudgetAllocation {
  id: string;
  color: string;
  spent: number;
}

/**
 * Extended budget summary with UI-specific properties
 */
export interface ExtendedBudgetSummary extends BudgetSummary {
  totalAmount: number;
  totalSpent: number;
  allocations: ExtendedBudgetAllocation[];
}

/**
 * Utility function to convert BudgetAllocation to ExtendedBudgetAllocation
 * with UI-specific properties
 */
export function extendAllocation(allocation: BudgetAllocation, index: number): ExtendedBudgetAllocation {
  // Generate a unique ID based on name (for demo purposes)
  const id = `allocation-${index}-${allocation.name.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Generate a color based on allocation type and index
  const colors = [
    '#4299E1', // blue-500
    '#48BB78', // green-500
    '#ED8936', // orange-500
    '#9F7AEA', // purple-500
    '#F56565', // red-500
    '#38B2AC', // teal-500
    '#ED64A6', // pink-500
    '#667EEA', // indigo-500
    '#F6AD55', // orange-400
    '#4FD1C5', // teal-400
  ];
  
  const color = colors[index % colors.length];
  
  // Calculate spent amount (amount - remaining)
  const spent = allocation.amount - allocation.remaining;
  
  return {
    ...allocation,
    id,
    color,
    spent
  };
}

/**
 * Utility function to convert BudgetSummary to ExtendedBudgetSummary
 */
export function extendBudgetSummary(summary: BudgetSummary): ExtendedBudgetSummary {
  const extendedAllocations = summary.allocations.map(extendAllocation);
  
  // Calculate total amount and spent
  const totalAmount = summary.totalAllocated;
  const totalSpent = extendedAllocations.reduce((sum, allocation) => sum + allocation.spent, 0);
  
  return {
    ...summary,
    totalAmount,
    totalSpent,
    allocations: extendedAllocations
  };
}