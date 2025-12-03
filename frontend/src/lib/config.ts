const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8080`;
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080';
};

export const BACKEND_URL = getBackendUrl();
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  return `${BACKEND_URL}${imagePath}`;
};
