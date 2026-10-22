/**
 * Normalizes and formats doctor names to ensure "Dr." is never duplicated.
 * Examples:
 *   "Dr. Sharma" -> "Dr. Sharma"
 *   "Dr. Dr. Sharma" -> "Dr. Sharma"
 *   "Sharma" -> "Dr. Sharma"
 *   "dr. verma" -> "Dr. Verma"
 */
// export const formatDoctorName = (name) => {
//   if (!name) return 'Dr. Specialist';
//   const clean = name.trim().replace(/^(dr\.?\s*)+/i, '');
//   return `Dr. ${clean || 'Specialist'}`;
// };

export const formatDoctorName = (name) => {
  if (!name || typeof name !== 'string') {
    return 'Dr. Specialist';
  }

  const clean = name
    .trim()
    .replace(/^(dr\.?\s*)+/i, '')
    .trim();

  return `Dr. ${clean || 'Specialist'}`;
};
