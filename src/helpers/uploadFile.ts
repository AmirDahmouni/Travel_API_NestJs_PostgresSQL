import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import { mkdir } from 'fs/promises'; // Native Node.js promise-based mkdir

const writeFile = util.promisify(fs.writeFile); // Promisify fs.writeFile for easier async use

export const uploadFile = async (
  directory: string,
  file: Express.Multer.File,
  type: string = 'any',
  maxSize: number = 5242880 // Default max size to 5MB
): Promise<string> => {
  try {
    // Validate file type
    if (!file.mimetype.startsWith(type)) {
      throw new Error(`Invalid file type. Must be of type: ${type}`);
    }
    // Validate file size
    if (file.size > maxSize) {
      throw new Error('File size exceeds the allowed limit.');
    }
    mkdir(directory, { recursive: true });

    const filePath = path.join(directory, file.originalname);
    await writeFile(filePath, file.buffer);

    return filePath;
  } catch (error) {
    // Throw explicit errors for better handling
    throw new Error(`File upload error: ${error.message}`);
  }
};

// Delete a file by its path
export const deleteFile = async (path: string): Promise<boolean> => {
  try {
    fs.unlink(path, () => console.log("success"));
    return true;
  } catch (error) {
    throw new Error('Error deleting the file: ' + error.message); // Handle errors
  }
};

// Remove a directory and its contents
export const removeDir = async (path: string): Promise<boolean> => {
  try {
    fs.rmdir(path, () => console.log("success"));
    return true;
  } catch (error) {
    throw new Error('Error removing the directory: ' + error.message); // Handle errors
  }
};



