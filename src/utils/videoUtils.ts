// Convert YouTube URL to embed format
export const convertToEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // Already embed format
  if (url.includes('/embed/')) return url;
  
  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  
  return url;
};

// Convert supabase://<path> to public URL (if bucket is public)
export const convertSupabaseUrl = (url: string, projectId?: string, bucket = 'make-2e8b32fc-storage') => {
  if (!url) return url;
  if (!url.startsWith('supabase://')) return url;
  const path = url.replace('supabase://', '');
  if (!projectId) return url;
  return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${path}`;
};
