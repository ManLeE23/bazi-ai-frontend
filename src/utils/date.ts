import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format a date string to a specific format
 * @param dateStr - The date string to format (e.g., '2026-04-10T06:51:43.062406')
 * @param format - The desired format (default: 'YYYY-MM-DD HH:mm')
 * @returns The formatted date string, or empty string if invalid
 */
export const formatDate = (dateStr: string | Date | number | undefined | null, format: string = 'YYYY-MM-DD HH:mm'): string => {
  if (!dateStr) return '';
  // If the date string ends with Z or has timezone info, dayjs handles it.
  // If it's a raw UTC string like '2026-04-10T06:51:43.062406' without 'Z', we should parse it as UTC and convert to local
  let date = dayjs(dateStr);
  
  if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
    // Assume UTC if no timezone is specified in the string
    date = dayjs.utc(dateStr).local();
  }
  
  if (!date.isValid()) return '';
  return date.format(format);
};
