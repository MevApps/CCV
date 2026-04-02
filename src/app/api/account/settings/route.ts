/**
 * API Route: /api/account/settings
 *
 * PATCH — update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/composition-root';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { manageAccount } = getContainer();
    manageAccount.updateSettings(body);
    return NextResponse.json(manageAccount.getSettings());
  } catch (err) {
    console.error('Failed to update settings:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
