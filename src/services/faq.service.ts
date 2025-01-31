import { db } from '@/firebase/firebaseConfig';
import { FAQ } from '@/types/faq';
import { collection, getDocs } from 'firebase/firestore';

export async function getFAQ() {
  const querySnapshot = await getDocs(collection(db, 'faq'));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FAQ[];
}
