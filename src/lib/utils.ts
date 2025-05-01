import { format, parseISO, differenceInSeconds } from 'date-fns';

// Format time for display
export function formatTime(timeString: string | undefined): string {
  if (!timeString) return '-';
  try {
    return format(parseISO(timeString), 'HH:mm:ss');
  } catch (error) {
    return timeString;
  }
}

// Calculate time difference between finish and start
export function calculateElapsedTime(startTime: string | undefined, finishTime: string | undefined): string {
  if (!startTime || !finishTime) return '-';
  
  try {
    const start = parseISO(startTime);
    const finish = parseISO(finishTime);
    const diffInSeconds = differenceInSeconds(finish, start);
    
    if (diffInSeconds < 0) return '-';
    
    // Format as HH:MM:SS
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    return '-';
  }
}

// Get current time in ISO format
export function getCurrentTimeISOString(): string {
  return new Date().toISOString();
}

// Parse and validate time input
export function parseTimeInput(timeString: string): string | null {
  // Simple validation: should be in HH:MM:SS format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
  
  if (!timeRegex.test(timeString)) {
    return null;
  }
  
  // Create a date with today's date and the provided time
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  
  return date.toISOString();
}

// Generate a random ID for testing
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
} 