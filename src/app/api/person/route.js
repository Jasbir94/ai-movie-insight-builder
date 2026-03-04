import { NextResponse } from 'next/server';
import { getPersonDetailsAndCredits } from '@/lib/tmdb';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing person ID' }, { status: 400 });
    }

    try {
        const personData = await getPersonDetailsAndCredits(id);
        return NextResponse.json(personData);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
