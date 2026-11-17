const { execution = {}, workflow = {}, trigger } = $input.first().json;
const error = execution.error || (trigger && trigger.error) || {};
const report = {
  type: 'workflow.failure',
  executionId: String(execution.id || `trigger-${Date.now()}`),
  workflow: String(workflow.name || 'unknown'),
  node: String(execution.lastNodeExecuted || (error.node && error.node.name) || 'unknown'),
  message: String(error.message || 'Unknown error').slice(0, 500),
};
console.error(`[LendLoop error] ${report.workflow} failed at ${report.node}: ${report.message}`);
return [{ json: { writeBack: report } }];
