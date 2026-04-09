import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';

export function useRealtimeAssets(userId) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.ASSETS),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        setAssets(data);
        setLoading(false);
      },
      (error) => {
        console.error('Realtime Assets Error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { assets, loading };
}
