//D:\expert-club-ai\expert-club-ai\src\app\api\discussion\route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase.config.js';
import { doc, getDoc, deleteDoc, collection, getDocs, writeBatch, query } from 'firebase/firestore';

// Эта функция будет удалять документ и все его вложенные документы в под-коллекциях
async function deleteCollection(collectionPath: string) {
  const collectionRef = collection(db, collectionPath);
  const q = query(collectionRef);
  const querySnapshot = await getDocs(q);

  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

export async function DELETE(request: Request) {
  try {
    const { discussionId, userId } = await request.json();

    if (!discussionId || !userId) {
      return NextResponse.json({ error: 'Discussion ID and User ID are required' }, { status: 400 });
    }

    const docRef = doc(db, 'discussions', discussionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Проверка безопасности: убеждаемся, что ID пользователя совпадает
    if (docSnap.data().userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Сначала удаляем все "прогоны" (runs) во вложенной коллекции
    await deleteCollection(`discussions/${discussionId}/runs`);

    // Затем удаляем основной документ дискуссии
    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: 'Discussion deleted successfully' });

  } catch (error) {
    console.error('Error deleting discussion:', error);
    return NextResponse.json({ error: 'Failed to delete discussion' }, { status: 500 });
  }
}