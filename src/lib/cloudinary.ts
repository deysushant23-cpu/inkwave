// src/lib/cloudinary.ts

/**
 * Cloudinary Next.js Custom Image Loader
 * Automates optimal format (WebP/AVIF) and quality delivery
 */
export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // If the src is not a Cloudinary URL, return it as is (e.g. Unsplash placeholders during dev)
  if (!src.includes('res.cloudinary.com')) {
    return src;
  }

  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
  
  // Basic parsing assuming src is a standard cloudinary URL
  // E.g. https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg
  // This loader inserts the optimization flags before the version/filename.
  
  try {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${params.join(',')}/${parts[1]}`;
    }
  } catch (error) {
    console.error('Cloudinary Loader Error parsing URL', error);
  }
  
  return src;
}
