import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';

/**
 * Upload a single file to the user's stem vault.
 * @param {string} userId - Firebase Auth UID
 * @param {string} orderId - Order ID to group files
 * @param {File} file - File object from an input
 * @param {Function} onProgress - Callback for progress (0-100)
 * @returns {Promise<{ name: string, url: string, ref: string }>}
 */
export const uploadStem = (userId, orderId, file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!storage) return reject(new Error('Firebase Storage not initialized'));
    if (!userId) return reject(new Error('User must be signed in to upload'));

    const path = `stems/${userId}/${orderId}/${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Vault upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          resolve({
            name: file.name,
            url: downloadURL,
            ref: task.snapshot.ref.fullPath,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

/**
 * List all files uploaded for a specific order.
 * @param {string} userId - Firebase Auth UID
 * @param {string} orderId - Order ID
 * @returns {Promise<Array<{ name: string, url: string, ref: string }>>}
 */
export const listStems = async (userId, orderId) => {
  if (!storage || !userId || !orderId) return [];

  const listRef = ref(storage, `stems/${userId}/${orderId}`);

  try {
    const res = await listAll(listRef);
    const files = await Promise.all(
      res.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          url,
          ref: item.fullPath,
        };
      })
    );
    return files;
  } catch (error) {
    console.error('List vault error:', error);
    return [];
  }
};
