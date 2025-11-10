import { NextRequest, NextResponse } from "next/server";

const IGDB_BASE = "https://api.igdb.com/v4";
const CLIENT_ID =
  process.env.IGDB_CLIENT_ID || process.env.NEXT_PUBLIC_IGDB_CLIENT_ID;
const TOKEN =
  process.env.IGDB_APP_ACCESS_TOKEN || process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;

type Ctx = { params: Promise<{ path?: string[] }> };

export async function POST(
  req: NextRequest,
  ctx:Ctx
) {
  if (!CLIENT_ID || !TOKEN) {
    return NextResponse.json(
      { error: "IGDB credentials missing" },
      { status: 500 }
    );
  }

  const {path = []} = await ctx.params
  const endpoint = path.join("/");
  const target = `${IGDB_BASE}/${endpoint}`;
  const body = await req.text();

  const igdbRes = await fetch(target, {
    method: "POST",
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!igdbRes.ok) {
    const text = await igdbRes.text();
    console.error(`[IGDB ${igdbRes.status}] ${endpoint}:`, text);
    return NextResponse.json(
      { status: igdbRes.status, error: text },
      { status: igdbRes.status }
    );
  }

  const buf = await igdbRes.arrayBuffer();
  return new NextResponse(buf, {
    status: igdbRes.status,
    headers: {
      "Content-Type": igdbRes.headers.get("Content-Type") ?? "application/json",
    },
  });
}
