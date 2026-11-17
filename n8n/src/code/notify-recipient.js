// Mock channel: logs the message instead of sending it.
const e = $json.event;
const { toolName, startDate, endDate, counterpartFirstName: who } = e.loan;
const lines = {
  'loan.requested': `${who} would like to borrow your ${toolName} from ${startDate} to ${endDate}.`,
  'loan.approved': `${who} approved your request for the ${toolName} (${startDate} to ${endDate}).`,
  'loan.declined': `${who} cannot lend the ${toolName} for ${startDate} to ${endDate} this time.`,
  'loan.cancelled': e.recipient.role === 'borrower'
    ? `your loan of the ${toolName} (${startDate} to ${endDate}) was cancelled.`
    : `${who} cancelled the request for your ${toolName}.`,
  'loan.returned': `${who} marked the ${toolName} as returned. Thanks for borrowing!`,
};
const text = `Hi ${e.recipient.firstName}, ${lines[e.type]}`;
if (e.recipient.email.endsWith('@fail.test')) throw new Error('Simulated delivery failure');
console.log(`[LendLoop notify] to=${e.recipient.email} event=${e.eventId} :: ${text}`);
return { json: { writeBack: { type: 'notification.result', eventId: e.eventId, status: 'notified' } } };
