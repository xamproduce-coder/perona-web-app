import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlEndEqF247KAiU2q1jlVMc3hM122Mt2c",
  authDomain: "maxm-media-studio.firebaseapp.com",
  projectId: "maxm-media-studio",
  storageBucket: "maxm-media-studio.firebasestorage.app",
  messagingSenderId: "391775737606",
  appId: "1:391775737606:web:b10aa0d4708ed191b67087"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runSeed() {
  console.log("🌱 Starting automated test environment setup...");

  // 1. Create Admin Account
  let adminUid;
  try {
    const adminCred = await createUserWithEmailAndPassword(auth, "admin@maxm.test", "password123");
    adminUid = adminCred.user.uid;
    console.log("✅ Admin account created: admin@maxm.test");
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      const adminCred = await signInWithEmailAndPassword(auth, "admin@maxm.test", "password123");
      adminUid = adminCred.user.uid;
      console.log("✅ Admin account logged in.");
    } else {
      throw e;
    }
  }

  // Elevate Admin in DB
  await setDoc(doc(db, "users", adminUid), {
    artistName: "MAXM Admin",
    email: "admin@maxm.test",
    role: "admin",
    createdAt: new Date().toISOString()
  }, { merge: true });
  console.log("✅ Admin privileges injected.");

  // 2. Create Artist Account
  let artistUid;
  try {
    const artistCred = await createUserWithEmailAndPassword(auth, "artist@maxm.test", "password123");
    artistUid = artistCred.user.uid;
    console.log("✅ Test Artist account created: artist@maxm.test");
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      const artistCred = await signInWithEmailAndPassword(auth, "artist@maxm.test", "password123");
      artistUid = artistCred.user.uid;
      console.log("✅ Test Artist account logged in.");
    } else {
      throw e;
    }
  }

  // Save Artist DB profile
  await setDoc(doc(db, "users", artistUid), {
    artistName: "Sonic Youth (Test)",
    email: "artist@maxm.test",
    role: "artist",
    createdAt: new Date().toISOString()
  }, { merge: true });
  console.log("✅ Artist profile injected.");

  // 3. Create a Test Order
  console.log("🛒 Submitting a test order as the artist...");
  const orderRef = await addDoc(collection(db, "orders"), {
    userId: artistUid,
    artistName: "Sonic Youth (Test)",
    projectName: "Neon Nights (Demo)",
    serviceType: "Mixing & Mastering",
    price: 450,
    stemsLink: "https://wetransfer.com/test-stems",
    referenceLink: "https://open.spotify.com/track/test",
    notes: "Make the vocals punchy like The Weeknd, but keep the bass heavy like Travis Scott.",
    status: "queued",
    createdAt: serverTimestamp()
  });
  console.log(`✅ Order [${orderRef.id}] created.`);

  // 4. Admin fulfills the order (Delivering a Master)
  console.log("⚙️ Admin is fulfilling the order...");
  await updateDoc(doc(db, "orders", orderRef.id), {
    status: "review",
    masterUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Public test MP3
    deliveredAt: serverTimestamp()
  });
  console.log(`✅ Master delivered to project [Neon Nights (Demo)].`);

  console.log("\n🎉 SEED COMPLETE! You can now log into your web app using:");
  console.log("ADMIN => Email: admin@maxm.test | Pass: password123");
  console.log("ARTIST => Email: artist@maxm.test | Pass: password123");
  
  process.exit(0);
}

runSeed().catch(err => {
  console.error("❌ Seed Failed:", err);
  process.exit(1);
});
