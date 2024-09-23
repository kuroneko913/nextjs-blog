import { NextRequest, NextResponse } from 'next/server';
const { cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Firebaseの初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
    }),
  });
}

const db = getFirestore();

// POSTリクエストに対応
export async function POST(req: NextRequest) {
  const COLLECTION_NAME = 'blog-likes';

  try {
    const body = await req.json(); // リクエストボディをJSONとしてパース
    const likesRef = db.collection(COLLECTION_NAME);

    const snapshot = await likesRef.where('article-slug', '==', body.slug).where('ip', '==', req.headers.get('x-forwarded-for') || req.ip).get()
    // すでにいいねしている場合は削除
    if (!snapshot.empty) {
      likesRef.doc(snapshot.docs[0].id).delete();
      return NextResponse.json({ message: 'You have already liked this post. so un liked.', liked: false}, { status: 200 });
    }

    const insertData = {
      "article-slug": body.slug,
      ip: req.headers.get('x-forwarded-for') || req.ip, // ユーザーのIPアドレス取得
    };

    await likesRef.doc().set(insertData);

    // 成功レスポンスを返す
    return NextResponse.json({ message: 'Like added successfully!', liked: true}, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add like' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const COLLECTION_NAME = 'blog-likes';
  const slug = req.nextUrl.searchParams.get('slug');

  try {
    const likesRef = db.collection(COLLECTION_NAME);
    // 特定の記事（slug）のいいねをカウントする
    const snapshot = await likesRef.where('article-slug', '==', slug).get();
    return NextResponse.json({ likes: snapshot.size}, { status: 200});  // ドキュメントのカウント
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get like' }, { status: 500 });
  }
}
