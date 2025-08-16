/**
 * Types for the budget management module
 */

/**
 * Type of budget allocation
 */
export const AllocationTypeEnum = {
  SAVING: 'SAVING',
  EXPENSE: 'EXPENSE',
  BILLS: 'BILLS'
} as const;

export type AllocationTypeEnum = typeof AllocationTypeEnum[keyof typeof AllocationTypeEnum];

/**
 * Budget allocation input for creating a budget
 */
export interface BudgetAllocationInput {
  name: string;
  amount: number;
  type: AllocationTypeEnum;
}

/**
 * Budget allocation with tracking of remaining amount
 */
export interface BudgetAllocation extends BudgetAllocationInput {
  remaining: number;
}

/**
 * Transaction record for expenses
 */
export interface ExpenseTransaction {
  id: string;
  categoryName: string;
  amount: number;
  description: string;
  date: Date;
}

/**
 * Budget summary information
 */
export interface BudgetSummary {
  totalIncome: number;
  totalAllocated: number;
  totalRemaining: number;
  unallocated: number;
  allocations: BudgetAllocation[];
}