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
  orderBy
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
 * Submits a new Mixing/Mastering order.
 */
export async function submitOrder(userId, orderData) {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  return await addDoc(ordersRef, {
    userId,
    ...orderData,
    status: 'queued', // Default initial status
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
 */
export async function submitRevision(orderId, userId, revisionData) {
  const revRef = collection(db, COLLECTIONS.REVISIONS);
  return await addDoc(revRef, {
    orderId,
    userId,
    ...revisionData,
    createdAt: serverTimestamp(),
  });
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
