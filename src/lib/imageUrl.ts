/**
 * Convert image path to full URL
 * If the image is already a full URL (http/https), return as-is
 * If it's a relative path (starts with /), prepend the base API URL
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "";
  
  // Already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Relative path - prepend base URL
  const baseURL = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000";
  return `${baseURL}${imagePath}`;
};
