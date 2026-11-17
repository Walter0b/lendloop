const { loans = [] } = $input.first().json;
console.log(`[LendLoop overdue] ${loans.length} overdue loan(s) to remind`);
return loans.map((loan) => ({ json: { loan } }));
