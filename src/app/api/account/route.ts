/**
 * API Route: /api/account
 *
 * GET — usage stats + settings
 */

import { NextResponse } from 'next/server';
import { getContainer } from '@/composition-root';

export async function GET() {
  try {
    const { manageAccount } = getContainer();

    return NextResponse.json({
      settings: manageAccount.getSettings(),
      usageStats: manageAccount.getUsageStats(),
      tokensByDay: manageAccount.getTokensByDay(30),
    });
  } catch (err) {
    console.error('Failed to fetch account:', err);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}
