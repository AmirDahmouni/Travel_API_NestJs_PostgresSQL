import { promises as fs } from 'fs'; // Use promises API for async operations
import mkdirp from 'mkdirp'; // Directory creation

interface UploadedFile {
  mimetype: string;
  size: number;
  name: string;
  mv: (path: string) => Promise<void>;
}

// Upload an image file to a given directory with size and type validation
export const uploadImage = async (
  directory: string,
  file: UploadedFile,
  type: string = 'any',
  maxSize: number = 5242880
): Promise<string> => {
  try {
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Invalid file extension. Must be an image.');
    }
    if (file.size > maxSize) {
      throw new Error('File size exceeds the allowed limit.');
    }

    await mkdirp(directory); // Create directory if it doesn't exist
    const filePath = `./${directory}/${file.name}`;
    await file.mv(filePath); // Move file to the specified path
    return filePath;
  } catch (error) {
    throw new Error(error.message); // Handle errors explicitly
  }
};

// Upload a non-image file (like PDFs, docs) with size and type validation
export const uploadFile = async (
  directory: string,
  file: UploadedFile,
  type: string = 'any',
  maxSize: number = 5242880
): Promise<string> => {
  try {
    if (!file.mimetype.startsWith('application/')) {
      throw new Error('Invalid file type. Must be an application file.');
    }
    if (file.size > maxSize) {
      throw new Error('File size exceeds the allowed limit.');
    }

    await mkdirp(directory); // Create directory if it doesn't exist
    const filePath = `./${directory}/${file.name}`;
    await file.mv(filePath); // Move file to the specified path
    return filePath;
  } catch (error) {
    throw new Error(error.message); // Handle errors explicitly
  }
};

// Delete a file by its path
export const deleteFile = async (path: string): Promise<boolean> => {
  try {
    await fs.unlink(path); // Use promises API for async file removal
    return true;
  } catch (error) {
    throw new Error('Error deleting the file: ' + error.message); // Handle errors
  }
};

// Remove a directory and its contents
export const removeDir = async (path: string): Promise<boolean> => {
  try {
    await fs.rmdir(path, { recursive: true }); // Option to remove non-empty directories
    return true;
  } catch (error) {
    throw new Error('Error removing the directory: ' + error.message); // Handle errors
  }
};
