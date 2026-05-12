/**
 * Shared security utilities for API endpoints.
 *
 * Production note: this in-memory rate limiter is per-Worker-isolate and will
 * NOT enforce limits globally across Cloudflare's edge. Before going live,
 * swap to Cloudflare's native Rate Limiting binding (or Durable Objects /
 * Workers KV). See the `consume` function for the swap point.
 */

const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
	return (
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip") ||
		"unknown"
	);
}

export interface RateLimitResult {
	ok: boolean;
	retryAfterSec: number;
	remaining: number;
}

export function consume(key: string, limit: number): RateLimitResult {
	// TODO(prod): replace with Cloudflare Rate Limiting binding or Durable Object.
	const now = Date.now();
	const bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return { ok: true, retryAfterSec: 0, remaining: limit - 1 };
	}
	if (bucket.count >= limit) {
		return {
			ok: false,
			retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
			remaining: 0,
		};
	}
	bucket.count += 1;
	return { ok: true, retryAfterSec: 0, remaining: limit - bucket.count };
}

const ALLOWED_ORIGINS = new Set<string>([
	"https://bioannova.com",
	"https://www.bioannova.com",
]);

export function corsHeaders(origin: string | null): HeadersInit {
	const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
	return {
		"Access-Control-Allow-Origin": allowed,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Accept",
		"Access-Control-Max-Age": "600",
		Vary: "Origin",
	};
}

export function jsonResponse(
	body: unknown,
	init: ResponseInit & { extraHeaders?: HeadersInit } = {},
): Response {
	const { extraHeaders, headers, ...rest } = init;
	return new Response(JSON.stringify(body), {
		...rest,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
			"X-Content-Type-Options": "nosniff",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			...extraHeaders,
			...headers,
		},
	});
}

export function safeError(
	status: number,
	message: string,
	extraHeaders?: HeadersInit,
): Response {
	return jsonResponse({ ok: false, error: message }, { status, extraHeaders });
}

export function readJson<T = unknown>(request: Request): Promise<T> {
	const ct = request.headers.get("content-type") || "";
	if (!ct.toLowerCase().includes("application/json")) {
		throw new Error("unsupported-media-type");
	}
	return request.json() as Promise<T>;
}
