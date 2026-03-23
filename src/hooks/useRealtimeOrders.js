import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';

export function useRealtimeOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          // In-memory sort to avoid needing a composite index in Firestore
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error('Realtime Orders Error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { orders, loading };
}
