import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.BACKEND_INTERNAL_URL ?? "http://127.0.0.1:8080";

// shared proxy
async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  // 👇 this is the important change
  const { path = [] } = await context.params;
  const backendPath = path.join("/");

  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_BASE}/${backendPath}${search}`;

  // forward body for non-GET/HEAD
  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const text = await req.text();
    if (text.length) body = text;
  }

  const headers: HeadersInit = {};

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers["content-type"] = contentType;
  }

  // forward cookies to backend
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers["cookie"] = cookie;
  }

  const backendRes = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  const buf = await backendRes.arrayBuffer();

  const res = new NextResponse(buf, {
    status: backendRes.status,
    headers: backendRes.headers,
  });

  // make sure Set-Cookie reaches browser
  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, context);
}

export async function OPTIONS(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, context);
}
