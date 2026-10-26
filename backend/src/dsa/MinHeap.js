/**
 * Custom Min-Heap Implementation for Urgency-Based Priority Doctor Queue Management.
 * 
 * Queue Ordering Rules:
 * Rule 1: Urgency level (ascending numeric ordering: 1 = Level 1 Critical, 2 = Level 2 Urgent, 3 = Level 3 Standard).
 *         Note: These are illustrative categories for queue prototype sorting and do not constitute a clinically validated protocol.
 * Rule 2: Arrival timestamp (joinedAt: earlier arrival served first).
 * Rule 3: Deterministic tie-breaker (stable comparison of unique identifiers).
 * Rule 4: No weighted formula, emergency multipliers, or waiting-time point inflation.
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }

  /**
   * Validates staff-assigned urgency level.
   * Explicitly handles invalid or missing urgency values.
   * @param {*} level 
   * @returns {number} 1, 2, or 3
   */
  static validateUrgency(level) {
    if (level === undefined || level === null || level === '') {
      throw new Error('Urgency level is required and cannot be empty.');
    }
    const num = Number(level);
    if (!Number.isInteger(num) || num < 1 || num > 3) {
      throw new Error(`Invalid urgency level "${level}". Must be 1 (Critical), 2 (Urgent), or 3 (Standard).`);
    }
    return num;
  }

  /**
   * Strict 3-tier comparator for queue items:
   * Returns:
   *   < 0 if a has higher priority than b (a served before b)
   *   > 0 if b has higher priority than a (b served before a)
   *   0 if completely identical
   */
  static compare(a, b) {
    // 1. Urgency level comparison (ascending: lower number = higher priority)
    const urgencyA = a.urgencyLevel !== undefined ? Number(a.urgencyLevel) : 3;
    const urgencyB = b.urgencyLevel !== undefined ? Number(b.urgencyLevel) : 3;

    if (urgencyA !== urgencyB) {
      return urgencyA - urgencyB;
    }

    // 2. Arrival timestamp comparison (earlier joinedAt served first)
    const timeA = new Date(a.joinedAt || 0).getTime();
    const timeB = new Date(b.joinedAt || 0).getTime();

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 3. Deterministic tie-breaking using unique identifier
    const idA = String(a.queueEntryId || a.appointmentId || '');
    const idB = String(b.queueEntryId || b.appointmentId || '');

    return idA.localeCompare(idB);
  }

  /**
   * Returns true if item at indexA has higher priority than item at indexB.
   */
  isHigherPriority(indexA, indexB) {
    return MinHeap.compare(this.heap[indexA], this.heap[indexB]) < 0;
  }

  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  swap(i1, i2) {
    const temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
  }

  /**
   * Sift-up balancing step preserving MinHeap invariant
   */
  siftUp(index) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = this.getParentIndex(currentIndex);
      if (this.isHigherPriority(currentIndex, parentIndex)) {
        this.swap(currentIndex, parentIndex);
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Sift-down balancing step preserving MinHeap invariant
   */
  siftDown(index) {
    let currentIndex = index;
    const size = this.heap.length;

    while (true) {
      let highestPriorityIndex = currentIndex;
      const leftIndex = this.getLeftChildIndex(currentIndex);
      const rightIndex = this.getRightChildIndex(currentIndex);

      if (leftIndex < size && this.isHigherPriority(leftIndex, highestPriorityIndex)) {
        highestPriorityIndex = leftIndex;
      }

      if (rightIndex < size && this.isHigherPriority(rightIndex, highestPriorityIndex)) {
        highestPriorityIndex = rightIndex;
      }

      if (highestPriorityIndex !== currentIndex) {
        this.swap(currentIndex, highestPriorityIndex);
        currentIndex = highestPriorityIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Inserts an item into the MinHeap.
   * @param {Object} item 
   */
  insert(item) {
    const validatedUrgency = MinHeap.validateUrgency(item.urgencyLevel);
    const joinedAt = item.joinedAt ? new Date(item.joinedAt) : new Date();

    const node = {
      ...item,
      urgencyLevel: validatedUrgency,
      joinedAt
    };

    this.heap.push(node);
    this.siftUp(this.heap.length - 1);
    return node;
  }

  /**
   * Returns and removes the highest priority item from the queue.
   */
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.siftDown(0);
    return min;
  }

  /**
   * Returns highest priority item without removing it.
   */
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Updates the urgency level of a waiting patient and restores the heap invariant in O(log n).
   * @param {string} appointmentIdOrEntryId 
   * @param {number} newUrgencyLevel 
   * @returns {Object|null} The updated node or null if not found
   */
  updateUrgency(appointmentIdOrEntryId, newUrgencyLevel) {
    const validatedUrgency = MinHeap.validateUrgency(newUrgencyLevel);
    const targetStr = appointmentIdOrEntryId.toString();

    const index = this.heap.findIndex(node => 
      (node.appointmentId && node.appointmentId.toString() === targetStr) ||
      (node.queueEntryId && node.queueEntryId.toString() === targetStr)
    );

    if (index === -1) return null;

    const targetNode = this.heap[index];
    const oldUrgency = targetNode.urgencyLevel;
    targetNode.urgencyLevel = validatedUrgency;

    if (validatedUrgency < oldUrgency) {
      // Increased urgency -> sift up
      this.siftUp(index);
    } else if (validatedUrgency > oldUrgency) {
      // Decreased urgency -> sift down
      this.siftDown(index);
    }

    return targetNode;
  }

  /**
   * Removes an entry by appointmentId or queueEntryId.
   */
  removeByAppointmentId(appointmentIdOrEntryId) {
    const targetStr = appointmentIdOrEntryId.toString();
    const index = this.heap.findIndex(node => 
      (node.appointmentId && node.appointmentId.toString() === targetStr) ||
      (node.queueEntryId && node.queueEntryId.toString() === targetStr)
    );

    if (index === -1) return null;

    if (index === this.heap.length - 1) {
      return this.heap.pop();
    }

    const removedNode = this.heap[index];
    this.heap[index] = this.heap.pop();

    this.siftUp(index);
    this.siftDown(index);
    return removedNode;
  }

  /**
   * Returns a copy of the queue sorted by priority without mutating the heap.
   */
  toSortedArray() {
    const clone = new MinHeap();
    clone.heap = this.heap.map(node => ({ ...node }));
    const result = [];
    while (!clone.isEmpty()) {
      result.push(clone.extractMin());
    }
    return result;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }
}

module.exports = MinHeap;
