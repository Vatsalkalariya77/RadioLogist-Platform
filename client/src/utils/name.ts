/**
 * Generates uppercase initials from a user's full name.
 * - If there are multiple names, it returns the first letter of the first name and the first letter of the last name.
 * - If there is only one name, it returns the first two letters of that name.
 * - Trims extra spaces and filters out multiple spaces.
 * 
 * Examples:
 * - "Veer Kalariya" => "VK"
 * - "Vatsal Kalariya" => "VK"
 * - "John Doe" => "JD"
 * - "Madonna" => "MA"
 * - "  Prince  " => "PR"
 */
export const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  if (parts.length > 1) {
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }

  // Single name, use first 2 characters
  return parts[0].substring(0, 2).toUpperCase();
};
