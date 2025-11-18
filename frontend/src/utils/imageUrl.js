function convertImgurUrl(url) {
  const galleryMatch = url.match(/imgur\.com\/gallery\/([a-zA-Z0-9]+)/i);
  if (galleryMatch) {
    const imageId = galleryMatch[1];
    return `https://i.imgur.com/${imageId}.jpg`;
  }
  
  const postMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/i);
  if (postMatch && !url.includes('/a/') && !url.includes('/gallery/')) {
    const imageId = postMatch[1];
    return `https://i.imgur.com/${imageId}.jpg`;
  }
  
  const albumMatch = url.match(/imgur\.com\/a\/([a-zA-Z0-9]+)/i);
  if (albumMatch) {
    return url;
  }
  
  if (url.includes('i.imgur.com')) {
    return url;
  }
  
  return url;
}

function convertGoogleDriveUrl(url) {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }
  
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }
  
  return url;
}

export function getDirectImageUrl(url) {
  if (!url || url.trim() === '') {
    return null;
  }
  
  let directUrl = url.trim();
  
  if (directUrl.includes('imgur.com')) {
    directUrl = convertImgurUrl(directUrl);
  }
  
  if (directUrl.includes('drive.google.com')) {
    directUrl = convertGoogleDriveUrl(directUrl);
  }
  
  return directUrl;
}

export function isValidImageHostingUrl(url) {
  if (!url || url.trim() === '') return true;
  
  const supportedHosts = [
    'imgur.com',
    'i.imgur.com',
    'drive.google.com',
    'photos.google.com',
    'i.ibb.co',
    'ibb.co',
    'cloudinary.com',
    'imageshack.us',
    'photobucket.com',
    'flickr.com',
    'tinypic.com',
  ];
  
  try {
    const urlObj = new URL(url);
    return supportedHosts.some(host => urlObj.hostname.includes(host)) || 
           url.startsWith('http://') || 
           url.startsWith('https://');
  } catch {
    return false;
  }
}
