/**
 * File Download Utility
 * Handles downloading files from URLs to device storage
 */

import { Alert, Linking } from 'react-native';

// Base URL for file storage
const getStorageBaseURL = () => {
  return 'https://engine-rebuild.co.uk/mbest/public/storage';
};

export interface DownloadOptions {
  url: string;
  filename: string;
  fileType?: string;
}

/**
 * Download/Open a file from a URL
 * Opens the file URL in the default browser/viewer which handles the download
 * @param options - Download options including URL and filename
 */
export const downloadFile = async (options: DownloadOptions): Promise<void> => {
  const { url, filename } = options;

  try {
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open the file URL.');
    }
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Download Failed', 'Unable to download the file. Please try again.');
    throw error;
  }
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Get file icon name based on file type
 * Returns valid IconName values from the Icon component
 */
export const getFileIcon = (fileType: string | null, fileName: string): string => {
  if (!fileType && !fileName) return 'file';

  const type = fileType?.toLowerCase() || '';
  const ext = getFileExtension(fileName).toLowerCase();

  // Image files - use 'file' icon since 'image' doesn't exist
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'file';
  }

  // PDF files
  if (type.includes('pdf') || ext === 'pdf') {
    return 'file-text';
  }

  // Document files
  if (type.includes('word') || type.includes('document') || ['doc', 'docx'].includes(ext)) {
    return 'file-text';
  }

  // Spreadsheet files
  if (type.includes('sheet') || type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
    return 'file-text';
  }

  // Presentation files
  if (type.includes('presentation') || type.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) {
    return 'file-text';
  }

  // Video files
  if (type.includes('video') || ['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
    return 'video';
  }

  // Default
  return 'file';
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
