import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { saveCanvas, getCanvas } from '@/lib/azure';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const canvas = await saveCanvas(body);

        return NextResponse.json(canvas, { status: 200 });
    } catch (error) {
        console.error('Error fetching user status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const projectId = request.nextUrl.searchParams.get('projectId');
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }
        const canvas = await getCanvas(projectId);
        return NextResponse.json(canvas, { status: 200 });
    } catch (error) {
        console.error('Error fetching user status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}