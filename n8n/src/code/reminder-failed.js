const { loan } = $('One item per loan').item.json;
const detail = String($json.error || 'reminder failed').slice(0, 200);
return { json: { writeBack: { type: 'reminder.result', reminderKey: loan.reminderKey, status: 'failed', detail } } };
