import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';

export function useRealtimeRevisions(orderId) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setRevisions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.REVISIONS),
      where('orderId', '==', orderId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          // In-memory sort
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setRevisions(data);
        setLoading(false);
      },
      (error) => {
        console.error('Realtime Revisions Error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  return { revisions, loading };
}
