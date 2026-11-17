// Mock channel: logs the reminder instead of sending it.
const { loan } = $json;
const days = loan.daysOverdue === 1 ? '1 day' : `${loan.daysOverdue} days`;
const text = `Hi ${loan.borrower.firstName}, the ${loan.toolName} was due back on ${loan.endDate} (${days} ago). Please return it soon.`;
if (loan.borrower.email.endsWith('@fail.test')) throw new Error('Simulated delivery failure');
console.log(`[LendLoop reminder] to=${loan.borrower.email} key=${loan.reminderKey} :: ${text}`);
return { json: { writeBack: { type: 'reminder.result', reminderKey: loan.reminderKey, status: 'sent' } } };
