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
  let fileId = null;
  
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch) {
    fileId = fileDMatch[1];
  }
  
  if (!fileId) {
    const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }
  }
  
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  if (url.includes('drive.google.com/uc?export=view')) {
    return url;
  }
  
  return url;
}

export function getDirectImageUrl(url) {
  if (!url || url.trim() === '') {
    return null;
  }
  
  let directUrl = url.trim();
  
  if (directUrl.startsWith('http://') || directUrl.startsWith('https://')) {
    if (directUrl.includes('imgur.com')) {
      directUrl = convertImgurUrl(directUrl);
    }
    if (directUrl.includes('drive.google.com')) {
      directUrl = convertGoogleDriveUrl(directUrl);
    }
    return directUrl;
  }
  
  if (directUrl.includes('backend/uploads/') || directUrl.includes('uploads/tucson')) {
    const filename = directUrl.split('/').pop();
    return `http://localhost:4000/uploads/${filename}`;
  }
  
  if (directUrl.startsWith('/uploads/')) {
    return `http://localhost:4000${directUrl}`;
  }
  
  if (directUrl.startsWith('uploads/')) {
    return `http://localhost:4000/${directUrl}`;
  }
  
  if (directUrl.includes('/')) {
    if (directUrl.startsWith('/')) {
      return `http://localhost:4000${directUrl}`;
    }
    return `http://localhost:4000/${directUrl}`;
  }
  
  return `http://localhost:4000/uploads/${directUrl}`;
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
