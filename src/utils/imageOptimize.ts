/**
 * Cloudinary on-the-fly image optimization utility.
 *
 * The original uploaded images are 4–10 MB each (full resolution JPEG).
 * For card thumbnails we only need ~500px wide at q70 → ~200 KB (40x smaller).
 * For detail pages we can use ~1200px at q80.
 *
 * This function injects Cloudinary transformation parameters into the URL
 * without re-uploading anything. The transformed image is generated and
 * cached on Cloudinary's CDN on first request.
 */

type ImageSize = 'thumbnail' | 'card' | 'detail' | 'full';

const SIZE_CONFIG: Record<ImageSize, string> = {
  // ~100 KB – for tiny thumbnails (bottom carousel in lightbox, etc.)
  thumbnail: 'w_200,c_limit,q_auto:low,f_auto',
  // ~200 KB – for design cards in the grid
  card: 'w_500,c_limit,q_70,f_auto',
  // ~500 KB – for detail page main image
  detail: 'w_1200,c_limit,q_auto,f_auto',
  // No transform – original resolution
  full: '',
};

/**
 * Transform a Cloudinary image URL to serve an optimized version.
 *
 * @param url - The original Cloudinary image URL
 * @param size - The target size preset
 * @returns The optimized URL, or the original URL if it's not a Cloudinary URL
 *
 * @example
 * // Original: https://res.cloudinary.com/xxx/image/upload/v123/folder/img.jpg  (9 MB)
 * // Optimized: https://res.cloudinary.com/xxx/image/upload/w_500,c_limit,q_70,f_auto/v123/folder/img.jpg  (200 KB)
 */
export function optimizeCloudinaryUrl(url: string, size: ImageSize = 'card'): string {
  if (!url) return url;

  const transforms = SIZE_CONFIG[size];
  if (!transforms) return url;

  // Match Cloudinary upload URLs:
  // https://res.cloudinary.com/{cloud}/image/upload/{optional-existing-transforms/}v{version}/{path}
  const cloudinaryPattern = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;
  const match = url.match(cloudinaryPattern);

  if (!match) {
    // Not a Cloudinary URL, return as-is
    return url;
  }

  // Insert transforms between /upload/ and v{version}/
  return `${match[1]}${transforms}/${match[2]}`;
}
