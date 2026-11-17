// Fixed so errorWorkflow references survive import.
export const IDS = {
  notifications: "llLoanNotify0001",
  overdue: "llOverdueRemind1",
  errors: "llErrorHandler01",
};

export const settings = (withErrorWorkflow = true) => ({
  executionOrder: "v1",
  saveManualExecutions: true,
  saveDataErrorExecution: "all",
  ...(withErrorWorkflow ? { errorWorkflow: IDS.errors } : {}),
});
