const MinHeap = require('./MinHeap');
const QueueManager = require('./QueueManager');

console.log('===========================================================');
console.log('🧪 CareQueue Urgency-Based Min-Heap Comprehensive Test Suite');
console.log('===========================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// -------------------------------------------------------------
// Test 1: More urgent patient selected before less urgent, even if less urgent arrived earlier
// -------------------------------------------------------------
(() => {
  const heap = new MinHeap();
  const earlier = new Date('2026-10-27T08:00:00Z');
  const later = new Date('2026-10-27T08:30:00Z');

  // Arrived earlier, but standard urgency (Level 3)
  heap.insert({
    appointmentId: 'apt_standard_early',
    urgencyLevel: 3,
    joinedAt: earlier
  });

  // Arrived later, but critical urgency (Level 1)
  heap.insert({
    appointmentId: 'apt_critical_late',
    urgencyLevel: 1,
    joinedAt: later
  });

  // Arrived middle, urgent (Level 2)
  heap.insert({
    appointmentId: 'apt_urgent_mid',
    urgencyLevel: 2,
    joinedAt: new Date('2026-10-27T08:15:00Z')
  });

  const next = heap.extractMin();
  assert(next.appointmentId === 'apt_critical_late', 'Test 1: Level 1 Critical patient selected first despite arriving later.');
  const second = heap.extractMin();
  assert(second.appointmentId === 'apt_urgent_mid', 'Test 1: Level 2 Urgent patient selected second.');
  const third = heap.extractMin();
  assert(third.appointmentId === 'apt_standard_early', 'Test 1: Level 3 Standard patient selected last despite arriving earliest.');
})();

// -------------------------------------------------------------
// Test 2: Equal urgency ordered strictly by arrival time
// -------------------------------------------------------------
(() => {
  const heap = new MinHeap();
  const t1 = new Date('2026-10-27T09:00:00Z');
  const t2 = new Date('2026-10-27T09:05:00Z');
  const t3 = new Date('2026-10-27T09:10:00Z');

  heap.insert({ appointmentId: 'apt_c', urgencyLevel: 2, joinedAt: t3 });
  heap.insert({ appointmentId: 'apt_a', urgencyLevel: 2, joinedAt: t1 });
  heap.insert({ appointmentId: 'apt_b', urgencyLevel: 2, joinedAt: t2 });

  const sorted = heap.toSortedArray();
  assert(
    sorted[0].appointmentId === 'apt_a' &&
    sorted[1].appointmentId === 'apt_b' &&
    sorted[2].appointmentId === 'apt_c',
    'Test 2: Equal urgency patients strictly ordered by earlier joinedAt timestamp.'
  );
})();

// -------------------------------------------------------------
// Test 3: Deterministic tie-breaking when urgency and joinedAt are identical
// -------------------------------------------------------------
(() => {
  const heap = new MinHeap();
  const sameTime = new Date('2026-10-27T10:00:00Z');

  heap.insert({ queueEntryId: 'entry_z', appointmentId: 'apt_z', urgencyLevel: 2, joinedAt: sameTime });
  heap.insert({ queueEntryId: 'entry_a', appointmentId: 'apt_a', urgencyLevel: 2, joinedAt: sameTime });
  heap.insert({ queueEntryId: 'entry_m', appointmentId: 'apt_m', urgencyLevel: 2, joinedAt: sameTime });

  const sorted = heap.toSortedArray();
  assert(sorted[0].queueEntryId === 'entry_a', 'Test 3: Tie-break selects entry_a first.');
  assert(sorted[1].queueEntryId === 'entry_m', 'Test 3: Tie-break selects entry_m second.');
  assert(sorted[2].queueEntryId === 'entry_z', 'Test 3: Tie-break selects entry_z third.');
})();

// -------------------------------------------------------------
// Test 4 & 5: Inserting and extracting preserve binary heap invariant
// -------------------------------------------------------------
(() => {
  const heap = new MinHeap();
  const items = [
    { appointmentId: 'p3', urgencyLevel: 3, joinedAt: new Date('2026-10-27T10:30:00Z') },
    { appointmentId: 'p1', urgencyLevel: 1, joinedAt: new Date('2026-10-27T10:35:00Z') },
    { appointmentId: 'p2a', urgencyLevel: 2, joinedAt: new Date('2026-10-27T10:10:00Z') },
    { appointmentId: 'p2b', urgencyLevel: 2, joinedAt: new Date('2026-10-27T10:20:00Z') },
    { appointmentId: 'p1_early', urgencyLevel: 1, joinedAt: new Date('2026-10-27T10:00:00Z') }
  ];

  items.forEach(item => heap.insert(item));

  // Verify heap invariant for every node: parent <= children
  function verifyHeapProperty(h) {
    for (let i = 0; i < h.heap.length; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < h.heap.length) {
        if (MinHeap.compare(h.heap[left], h.heap[i]) < 0) return false;
      }
      if (right < h.heap.length) {
        if (MinHeap.compare(h.heap[right], h.heap[i]) < 0) return false;
      }
    }
    return true;
  }

  assert(verifyHeapProperty(heap), 'Test 4: Inserting preserves MinHeap invariant at all levels.');
  assert(heap.peek().appointmentId === 'p1_early', 'Test 4: Peek correctly identifies top priority node in O(1).');

  const extracted = [];
  while (!heap.isEmpty()) {
    extracted.push(heap.extractMin());
    assert(verifyHeapProperty(heap), 'Test 5: Extracting preserves MinHeap invariant after each extraction.');
  }

  assert(extracted.map(x => x.appointmentId).join(',') === 'p1_early,p1,p2a,p2b,p3', 'Test 5: Full extraction sequence correctly ordered.');
})();

// -------------------------------------------------------------
// Test 6: Updating patient urgency dynamically reorders heap
// -------------------------------------------------------------
(() => {
  const heap = new MinHeap();
  const baseTime = new Date('2026-10-27T11:00:00Z');

  heap.insert({ appointmentId: 'patient_A', urgencyLevel: 3, joinedAt: baseTime });
  heap.insert({ appointmentId: 'patient_B', urgencyLevel: 2, joinedAt: baseTime });

  assert(heap.peek().appointmentId === 'patient_B', 'Test 6: patient_B originally ahead of patient_A.');

  // Escalate patient_A to Level 1 Critical
  const updated = heap.updateUrgency('patient_A', 1);
  assert(updated !== null && updated.urgencyLevel === 1, 'Test 6: patient_A successfully updated to urgency 1.');
  assert(heap.peek().appointmentId === 'patient_A', 'Test 6: patient_A sifted up to root position after urgency escalation.');

  // Downgrade patient_A to Level 3 Standard
  heap.updateUrgency('patient_A', 3);
  assert(heap.peek().appointmentId === 'patient_B', 'Test 6: patient_B returned to root position after patient_A downgrade.');
})();

// -------------------------------------------------------------
// Test 7: Removing a patient does not corrupt the heap
// -------------------------------------------------------------
(() => {
  const heap = new MinHeap();
  for (let i = 1; i <= 7; i++) {
    heap.insert({
      appointmentId: `apt_${i}`,
      urgencyLevel: (i % 3) + 1,
      joinedAt: new Date(Date.now() + i * 1000)
    });
  }

  const initialSize = heap.size();
  const removed = heap.removeByAppointmentId('apt_3');
  assert(removed && removed.appointmentId === 'apt_3', 'Test 7: Target node found and removed.');
  assert(heap.size() === initialSize - 1, 'Test 7: Heap size decremented accurately.');

  // Validate heap invariant after removal
  let invariantValid = true;
  for (let i = 0; i < heap.heap.length; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < heap.heap.length && MinHeap.compare(heap.heap[left], heap.heap[i]) < 0) invariantValid = false;
    if (right < heap.heap.length && MinHeap.compare(heap.heap[right], heap.heap[i]) < 0) invariantValid = false;
  }
  assert(invariantValid, 'Test 7: Heap invariant maintained after node removal.');
})();

// -------------------------------------------------------------
// Test 8: Status handling - non-waiting patients not reinserted
// -------------------------------------------------------------
(() => {
  const qm = QueueManager;
  const docId = 'doc_test_status';

  qm.addToQueue(docId, {
    appointmentId: 'apt_done',
    queueEntryId: 'q_done',
    urgencyLevel: 2,
    status: 'waiting'
  });

  assert(qm.peekNextPatient(docId).appointmentId === 'apt_done', 'Test 8: Waiting patient available in queue.');

  // Extract / simulate Call Next
  const called = qm.getNextPatient(docId);
  called.status = 'in-progress';

  // Verify heap is now empty and in-progress patient is not waiting
  assert(qm.peekNextPatient(docId) === null, 'Test 8: In-progress patient successfully extracted from waiting heap.');
  assert(qm.toSortedList(docId).length === 0, 'Test 8: No ghost waiting patients in live queue.');
})();

// -------------------------------------------------------------
// Test 9: Queue hydration from persistent store
// -------------------------------------------------------------
(async () => {
  const docId = 'doc_hydrate_test';
  const mockDBEntries = [
    {
      _id: 'q_db_1',
      doctorId: docId,
      appointmentId: { _id: 'apt_db_1' },
      patientId: { _id: 'pat_1', name: 'Alice', isSeniorCitizen: false },
      urgencyLevel: 3,
      joinedAt: new Date('2026-10-27T08:00:00Z'),
      status: 'waiting'
    },
    {
      _id: 'q_db_2',
      doctorId: docId,
      appointmentId: { _id: 'apt_db_2' },
      patientId: { _id: 'pat_2', name: 'Bob', isSeniorCitizen: true },
      urgencyLevel: 1, // Critical
      joinedAt: new Date('2026-10-27T08:30:00Z'),
      status: 'waiting'
    }
  ];

  const mockModel = {
    find: () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            lean: async () => mockDBEntries
          })
        })
      })
    })
  };

  await QueueManager.hydrateFromDB(mockModel);
  const hydratedList = QueueManager.toSortedList(docId);

  assert(hydratedList.length === 2, 'Test 9: QueueManager hydrated all waiting records from DB.');
  assert(hydratedList[0].patientName === 'Bob', 'Test 9: Hydrated queue ordered by urgency (Bob Level 1 first).');
  assert(hydratedList[1].patientName === 'Alice', 'Test 9: Alice (Level 3) placed second in hydrated queue.');
})();

// -------------------------------------------------------------
// Test 10: Validation rejects invalid urgency levels
// -------------------------------------------------------------
(() => {
  let threwZero = false;
  let threwFive = false;
  let threwString = false;

  try { MinHeap.validateUrgency(0); } catch (e) { threwZero = true; }
  try { MinHeap.validateUrgency(5); } catch (e) { threwFive = true; }
  try { MinHeap.validateUrgency('invalid'); } catch (e) { threwString = true; }

  assert(threwZero && threwFive && threwString, 'Test 10: Strict validation rejects invalid urgency levels (only 1, 2, 3 allowed).');
})();

// -------------------------------------------------------------
// Test 11: No old weighted score influences ordering
// -------------------------------------------------------------
(() => {
  const heap = new MinHeap();
  const time = new Date();

  // Non-emergency, standard age, Level 1
  heap.insert({
    appointmentId: 'apt_no_weights',
    urgencyLevel: 1,
    isEmergency: false,
    isSeniorCitizen: false,
    joinedAt: time
  });

  // Emergency flag true and Senior Citizen true, BUT Level 2
  heap.insert({
    appointmentId: 'apt_senior_emergency_flag',
    urgencyLevel: 2,
    isEmergency: true,
    isSeniorCitizen: true,
    joinedAt: new Date(time.getTime() - 60 * 60 * 1000) // waited an hour
  });

  const top = heap.peek();
  assert(
    top.appointmentId === 'apt_no_weights',
    'Test 11: Urgency level strictly overrides metadata flags (Level 1 served before Level 2 despite senior/emergency flags).'
  );
  assert(top.priorityScore === undefined, 'Test 11: Obsolete priorityScore attribute removed.');
})();

console.log('\n===========================================================');
console.log(`🎉 ALL ${passedTests} OF ${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('===========================================================\n');
