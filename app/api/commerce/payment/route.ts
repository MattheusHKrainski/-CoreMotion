import { NextResponse } from 'next/server';
/** Fail-closed, including forged client-side status/amount. No gateway or credentials enabled. */
export async function POST() { return NextResponse.json({ success: false, code: 'PAYMENTS_DISABLED', error: 'Pagamentos desativados até homologação comercial, técnica e de segurança.' }, { status: 503 }); }
