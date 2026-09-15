import { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const sizeParts = pathname.split('/').slice(-2);
  const parts = (sizeParts.length === 2 ? sizeParts : [sizeParts[0], sizeParts[0]])
    .map((part) => Number(part));
  const width = Number.isFinite(parts[0]) ? parts[0] : 80;
  const height = Number.isFinite(parts[1]) ? parts[1] : width;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 120 120"><rect width="120" height="120" fill="#dff3d9"/><path d="M61 111C56 81 58 55 79 26c-2 34-13 58-18 85Z" fill="#76bd70"/><path d="M61 78C34 77 20 61 22 40c22 1 38 12 39 38ZM62 57c1-18 12-31 32-35 1 20-10 32-32 35Z" fill="#3e9144"/><path d="M59 109C54 75 42 59 25 43M61 76c10-15 19-27 30-44" fill="none" stroke="#246c2d" stroke-width="3"/></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
