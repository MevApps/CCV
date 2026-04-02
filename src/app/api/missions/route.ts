/**
 * API Route: /api/missions
 *
 * POST — CreateMission use case
 * GET  — SearchMissions (with query params)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/composition-root';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, context } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title' },
        { status: 400 },
      );
    }

    const { createMission, executeMission } = getContainer();

    const mission = await createMission.execute({
      type,
      title,
      description: description ?? '',
      context: {
        workingDirectory: context?.workingDirectory ?? process.cwd(),
        targetFiles: context?.targetFiles ?? [],
        constraints: context?.constraints ?? [],
        model: context?.model ?? 'claude-sonnet-4-6',
      },
    });

    // Launch execution in background (don't await)
    executeMission.execute(mission.id).catch((err) => {
      console.error(`Mission ${mission.id} execution failed:`, err);
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (err) {
    console.error('Failed to create mission:', err);
    return NextResponse.json(
      { error: 'Failed to create mission' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { searchMissions } = getContainer();

    const sinceParam = searchParams.get('since');
    const missions = await searchMissions.execute({
      status: searchParams.get('status')?.split(',') as any,
      type: searchParams.get('type')?.split(',') as any,
      search: searchParams.get('search') ?? undefined,
      since: sinceParam ? new Date(sinceParam) : undefined,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
      offset: searchParams.has('offset') ? Number(searchParams.get('offset')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) ?? 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) ?? 'desc',
    });

    return NextResponse.json(missions);
  } catch (err) {
    console.error('Failed to fetch missions:', err);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 },
    );
  }
}
