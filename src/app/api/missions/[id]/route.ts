/**
 * API Route: /api/missions/:id
 *
 * GET    — GetMission
 * PATCH  — UpdateMission (pause, cancel, retry)
 * DELETE — DeleteMission
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/composition-root';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { missionRepo } = getContainer();
    const mission = await missionRepo.findById(id);

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json(mission);
  } catch (err) {
    console.error('Failed to fetch mission:', err);
    return NextResponse.json({ error: 'Failed to fetch mission' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { missionRepo } = getContainer();

    if (body.status) {
      await missionRepo.updateStatus(id, body.status);
    }

    const mission = await missionRepo.findById(id);
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json(mission);
  } catch (err) {
    console.error('Failed to update mission:', err);
    return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { missionRepo } = getContainer();
    await missionRepo.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete mission:', err);
    return NextResponse.json({ error: 'Failed to delete mission' }, { status: 500 });
  }
}
