import { NextResponse } from 'next/server';
import citiesData from '@/data/cities.json';

export async function GET() {
  const cities = [
    ...citiesData.indonesia.map(city => ({ name: city, country: 'Indonesia' })),
    ...citiesData.japan.map(city => ({ name: city, country: 'Japan' })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ cities });
}
