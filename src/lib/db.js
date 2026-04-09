// src/lib/db.js
// ─────────────────────────────────────────────────────────────
// DATA ACCESS LAYER: Firestore helper functions.
// This is the bridge between our UI and the Database.
// ─────────────────────────────────────────────────────────────

import { 
  setDoc, 
  doc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  Timestamp,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';

/**
 * Creates/Updates a user profile in Firestore.
 */
export async function createOrUpdateUser(uid, userData) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Fetches all assets (independent stems) for a specific user.
 */
export async function getUserAssets(userId) {
  const assetsRef = collection(db, 'assets');
  const q = query(
    assetsRef, 
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/**
 * Submits a new Mixing/Mastering order.
 */
export async function submitOrder(userId, orderData) {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  return await addDoc(ordersRef, {
    userId,
    ...orderData,
    status: 'queued', 
    revisionCount: 0,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetches all orders for a specific artist (User).
 */
export async function getUserOrders(userId) {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef, 
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  // Sort in-memory to avoid composite index requirement
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/**
 * Submits a new timestamped revision feedback.
 * Increments order revisionCount.
 */
export async function submitRevision(orderId, userId, revisionData) {
  const revRef = collection(db, COLLECTIONS.REVISIONS);
  
  // Create revision
  const res = await addDoc(revRef, {
    orderId,
    userId,
    ...revisionData,
    createdAt: serverTimestamp(),
  });

  // Increment revision count atomically
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await setDoc(orderRef, {
    revisionCount: increment(1)
  }, { merge: true });

  return res;
}

/**
 * Fetches all revisions for a specific order.
 */
export async function getOrderRevisions(orderId) {
  const revRef = collection(db, COLLECTIONS.REVISIONS);
  const q = query(
    revRef, 
    where('orderId', '==', orderId)
  );
  const snap = await getDocs(q);
  // Sort in-memory to avoid composite index requirement
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/**
 * Deletes a revision note.
 */
export async function deleteRevision(revId) {
  const revRef = doc(db, COLLECTIONS.REVISIONS, revId);
  return await deleteDoc(revRef);
}

/**
 * Updates a revision note in Firestore.
 */
export async function updateRevision(revId, data) {
  const revRef = doc(db, COLLECTIONS.REVISIONS, revId);
  return await setDoc(revRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Admin: Fetch all orders for management.
 */
export async function getAllOrders() {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Updates an order in Firestore.
 */
export async function updateOrder(orderId, updateData) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  return await setDoc(orderRef, updateData, { merge: true });
}

/**
 * Deletes a vault folder.
 */
export async function deleteVaultFolder(folderId) {
  const ref = doc(db, COLLECTIONS.FOLDERS, folderId);
  return await deleteDoc(ref);
}

/**
 * Renames an order's projectName field in Firestore.
 */
export async function updateOrderName(orderId, newName) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  return await setDoc(orderRef, { projectName: newName, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Fetch all users for admin management.
 */
export async function getAllUsers() {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const snap = await getDocs(usersRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Toggle a user's vault access (hasPaidMixMaster).
 */
export async function toggleUserVaultAccess(uid, currentStatus) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  return await setDoc(userRef, { hasPaidMixMaster: !currentStatus, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Renames a vault folder's name field in Firestore.
 */
export async function updateFolderName(folderId, newName) {
  const folderRef = doc(db, 'vault_folders', folderId);
  return await setDoc(folderRef, { name: newName, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Saves metadata for files uploaded to Storage into Firestore.
 */
export async function saveAssetMetadata(userId, assetData) {
  const assetsRef = collection(db, COLLECTIONS.ASSETS);
  return await addDoc(assetsRef, {
    userId,
    ...assetData, // Should include folderId and isVaulted if applicable
    createdAt: serverTimestamp(),
  });
}

/**
 * Creates a new folder in the user's Vault.
 */
export async function createVaultFolder(userId, folderName) {
  const foldersRef = collection(db, 'vault_folders');
  return await addDoc(foldersRef, {
    userId,
    name: folderName,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetches all vault folders for a specific user.
 */
export async function getVaultFolders(userId) {
  const foldersRef = collection(db, 'vault_folders');
  const q = query(foldersRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/**
 * Verifies a Stripe checkout session and unlocks the user's features.
 * (Client-side bridge implementation)
 */
export async function verifyPaymentAndUnlock(userId, sessionId) {
  if (!userId || !sessionId) return false;
  
  // In a real app, you would call a cloud function here to verify the sessionId with Stripe.
  // For the client-side bridge, we trust the redirect and unlock the profile.
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, {
    hasPaidMixMaster: true,
    lastPaymentSession: sessionId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  
  return true;
}

/**
 * The Capacity Governor: Checks how many orders were placed in the last 14 days.
 * Limit is 3 per fortnight.
 */
export async function getActiveClientCount() {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const cutoff = Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
  
  const q = query(
    ordersRef,
    where('createdAt', '>=', cutoff)
  );
  
  const snap = await getDocs(q);
  return snap.size; // returns the number of active projects in the window
}
