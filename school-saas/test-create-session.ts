
global.WebSocket = require('ws');

import { createAcademicSession } from './src/app/actions/academic-sessions';

async function main() {
  console.log('Testing createAcademicSession...');
  const res = await createAcademicSession('albert-academy-pm', {
    name: '2027/2028',
    startDate: '2027-09-01',
    endDate: '2028-07-31',
    isCurrent: false,
    terms: [
      { name: 'First Term', startDate: '2027-09-01', endDate: '2027-12-20', isCurrent: true },
      { name: 'Second Term', startDate: '2028-01-05', endDate: '2028-04-10', isCurrent: false },
      { name: 'Third Term', startDate: '2028-04-25', endDate: '2028-07-20', isCurrent: false }
    ]
  });
  console.log('Result:', res);
}

main().catch(console.error);
