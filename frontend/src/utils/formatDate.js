export function formatLocalDate(utcDateString) {
  if (!utcDateString) return "—";
  
  // Append 'Z' if not present to tell JS it's UTC
  const utcString = utcDateString.endsWith("Z") 
    ? utcDateString 
    : utcDateString + "Z";
    
  return new Date(utcString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}