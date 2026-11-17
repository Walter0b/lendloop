const event = $('Verify signature').first().json.event;
const detail = String($json.error || 'notification failed').slice(0, 200);
return { json: { writeBack: { type: 'notification.result', eventId: event.eventId, status: 'failed', detail } } };
