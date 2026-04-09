// src/lib/storage.js
// ─────────────────────────────────────────────────────────────
// STORAGE LAYER: Firebase Storage upload/download helpers.
//
// KEY FIXES IN THIS VERSION:
//   FIX-1 "0% Hang": Progress callback now guards against snapshot.totalBytes===0
//          which was causing NaN% at task start, freezing the progress bar.
//   FIX-2 Orphan Cleanup: deleteStorageFile() exported so callers can clean up
//          storage files when a subsequent Firestore write fails.
//   FIX-3 Error Codes: error.code is logged to identify CORS/auth/quota issues.
// ─────────────────────────────────────────────────────────────

import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

/**
 * Upload a stem file scoped to a specific project.
 * Path: orders/{orderId}/stems/{timestamp}_{fileName}
 *
 * @param {string}   orderId    - The order/project ID
 * @param {File}     file       - The File object to upload
 * @param {Function} onProgress - Callback (percent: number) => void
 * @returns {Promise<{ name: string, url: string, refPath: string }>}
 */
export const uploadProjectStem = (orderId, file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!storage)  return reject(new Error('Firebase Storage not initialized'));
    if (!orderId)  return reject(new Error('orderId is required to upload a stem'));

    const path       = `orders/${orderId}/stems/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const task       = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        // FIX-1: totalBytes can be 0 at the very start of a task.
        // We report 1% immediately to "Initiating" the progress bar for feedback.
        let progressPercent = 0;
        if (snapshot.totalBytes > 0) {
          progressPercent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        } else {
          progressPercent = 1;
        }
        
        if (onProgress) onProgress(progressPercent);
      },
      (error) => {
        // FIX-3: Log the error.code so it's identifiable in the console.
        console.error(`[Storage] Upload failed for "${file.name}" — code: ${error.code}`, error.message);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ name: file.name, url, refPath: task.snapshot.ref.fullPath });
        } catch (err) {
          console.error(`[Storage] getDownloadURL failed for "${file.name}":`, err);
          reject(err);
        }
      }
    );
  });
};

/**
 * Upload a file to the user's personal Vault folder.
 */
export const uploadVaultFile = (userId, folderId, file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!storage)             return reject(new Error('Firebase Storage not initialized'));
    if (!userId || !folderId) return reject(new Error('userId and folderId are required'));

    const path       = `vault/${userId}/${folderId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const task       = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        // FIX-1: Consistent feedback for Vault uploads too.
        let progressPercent = 0;
        if (snapshot.totalBytes > 0) {
          progressPercent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        } else {
          progressPercent = 1;
        }

        if (onProgress) onProgress(progressPercent);
      },
      (error) => {
        console.error(`[Storage] Vault upload failed for "${file.name}" — code: ${error.code}`, error.message);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ name: file.name, url, refPath: task.snapshot.ref.fullPath });
        } catch (err) {
          console.error(`[Storage] getDownloadURL failed for vault file "${file.name}":`, err);
          reject(err);
        }
      }
    );
  });
};

/**
 * Admin: Upload a finalized master file for an order.
 * Path: orders/{orderId}/master/{timestamp}_{fileName}
 * 
 * @param {string}   orderId    - The order ID
 * @param {File}     file       - The master File object
 * @param {Function} onProgress - Callback (percent: number) => void
 * @returns {Promise<{ name: string, url: string, refPath: string }>}
 */
export const uploadFinalMaster = (orderId, file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!storage)  return reject(new Error('Firebase Storage not initialized'));
    if (!orderId)  return reject(new Error('orderId is required'));

    const path       = `orders/${orderId}/master/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const task       = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        let progressPercent = 0;
        if (snapshot.totalBytes > 0) {
          progressPercent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        } else {
          progressPercent = 1;
        }
        if (onProgress) onProgress(progressPercent);
      },
      (error) => {
        console.error(`[Storage] Master upload failed: code=${error.code}`, error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ name: file.name, url, refPath: task.snapshot.ref.fullPath });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

/**
 * FIX-2 — ORPHAN CLEANUP:
 * Deletes a file from Firebase Storage by its full storage path.
 *
 * Call this when a Firestore write fails after a successful Storage upload.
 * This prevents "orphaned" files that exist in Storage but have no Firestore record,
 * which would make them invisible to the UI and un-deletable.
 *
 * Silently ignores "object-not-found" errors (file was never written).
 *
 * @param {string} refPath - Full storage path e.g. "orders/abc123/stems/123_kick.wav"
 */
export const deleteStorageFile = async (refPath) => {
  if (!storage || !refPath) return;
  try {
    const fileRef = ref(storage, refPath);
    await deleteObject(fileRef);
    console.log(`[Storage] Orphan cleaned: ${refPath}`);
  } catch (err) {
    if (err.code !== 'storage/object-not-found') {
      console.error(`[Storage] Failed to delete orphan at "${refPath}" — code: ${err.code}`, err.message);
    }
  }
};

/**
 * List all stem files uploaded for a specific order.
 * Path must match uploadProjectStem(): orders/{orderId}/stems/
 *
 * @param {string} orderId - Order ID
 * @returns {Promise<Array<{ name: string, url: string, ref: string }>>}
 */
export const listStems = async (orderId) => {
  if (!storage || !orderId) return [];
  const listRef = ref(storage, `orders/${orderId}/stems`);
  try {
    const res   = await listAll(listRef);
    const files = await Promise.all(
      res.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { name: item.name, url, ref: item.fullPath };
      })
    );
    return files;
  } catch (error) {
    console.error('[Storage] listStems error:', error);
    return [];
  }
};
