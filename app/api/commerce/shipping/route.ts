import { NextResponse } from 'next/server';
import { quoteShipping } from '@/lib/commerce-adapters';
export async function POST() { return NextResponse.json(await quoteShipping(), { status: 503 }); }
