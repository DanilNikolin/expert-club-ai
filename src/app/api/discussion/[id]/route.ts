// src/app/api/discussion/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase.config.js';
import { doc, updateDoc } from 'firebase/firestore';

// ИЗМЕНЕНИЕ: Убрали { params } из аргументов, он нам больше не нужен
export async function PUT(req: Request) {
  try {
    // СНАЧАЛА дожидаемся тело запроса
    const body = await req.json();
    const { brief } = body;

    // И ТОЛЬКО ПОТОМ ВЫТАСКИВАЕМ ID ВРУЧНУЮ ИЗ URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const discussionId = pathParts[pathParts.length - 1]; // Забираем последний сегмент пути
    
    if (!discussionId || discussionId === 'undefined') {
      return NextResponse.json({ error: 'Invalid Discussion ID provided' }, { status: 400 });
    }

    if (typeof brief !== 'string') {
      return NextResponse.json({ error: 'Brief must be a string' }, { status: 400 });
    }

    const discussionRef = doc(db, 'discussions', discussionId);

    await updateDoc(discussionRef, {
      brief: brief
    });

    return NextResponse.json({ message: 'Brief updated successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Failed to update brief:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}