import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.BACKEND_INTERNAL_URL ?? "http://127.0.0.1:8080";

type PathParams = {
  path?: string[];
};

async function proxy(
  req: NextRequest,
  params: PathParams
) {
  const { path = [] } = params;
  const backendPath = path.join("/");

  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_BASE}/${backendPath}${search}`;

  const headers: HeadersInit = {};
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower.startsWith("x-nextjs-")) return;
    if (lower === "host") return;
    headers[key] = value;
  });

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    headers["cookie"] = cookieHeader;
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (init as any).duplex = "half";
  }

  const backendRes = await fetch(targetUrl, init);

  const resBody = await backendRes.arrayBuffer();
  const resHeaders = new Headers(backendRes.headers);

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    resHeaders.set("set-cookie", setCookie);
  }

  return new NextResponse(resBody, {
    status: backendRes.status,
    headers: resHeaders,
  });
}

// Note: params is now Promise<PathParams> per Next.js' new API

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<PathParams> }
) {
  return proxy(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<PathParams> }
) {
  return proxy(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<PathParams> }
) {
  return proxy(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<PathParams> }
) {
  return proxy(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<PathParams> }
) {
  return proxy(req, await params);
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<PathParams> }
) {
  return proxy(req, await params);
}
