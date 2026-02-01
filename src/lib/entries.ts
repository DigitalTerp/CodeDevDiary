import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type DevDiaryEntryData = {
  date: string;
  title: string;
  tech: string[];
  notes: string;
  code: string;
  createdAt?: any;
  updatedAt?: any;
};

export type DevDiaryEntry = DevDiaryEntryData & {
  id: string;
};

export async function createEntry(uid: string, entry: DevDiaryEntryData) {
  const entriesRef = collection(db, 'users', uid, 'entries');
  return addDoc(entriesRef, {
    ...entry,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getEntries(uid: string): Promise<DevDiaryEntry[]> {
  const entriesRef = collection(db, 'users', uid, 'entries');
  const q = query(entriesRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => ({
    id: snap.id,
    ...(snap.data() as DevDiaryEntryData),
  }));
}

export async function getEntry(uid: string, entryId: string): Promise<DevDiaryEntry | null> {
  const ref = doc(db, 'users', uid, 'entries', entryId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...(snap.data() as DevDiaryEntryData) };
}

export const getEntryById = getEntry;

export async function updateEntry(
  uid: string,
  entryId: string,
  data: Partial<DevDiaryEntryData>
) {
  const ref = doc(db, 'users', uid, 'entries', entryId);
  return updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEntry(uid: string, entryId: string) {
  const ref = doc(db, 'users', uid, 'entries', entryId);
  return deleteDoc(ref);
}
