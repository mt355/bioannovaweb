import type { APIRoute } from "astro";
import { z } from "astro/zod";
import {
	clientIp,
	consume,
	corsHeaders,
	jsonResponse,
	readJson,
	safeError,
} from "../../lib/security";

export const prerender = false;

const SubscribeSchema = z
	.object({
		email: z.string().email().max(254),
		// Honeypot — must be empty if present
		company: z.string().max(0).optional(),
	})
	.strict();

const RATE_LIMIT_PER_MIN = 5;

export const OPTIONS: APIRoute = ({ request }) => {
	return new Response(null, {
		status: 204,
		headers: corsHeaders(request.headers.get("origin")),
	});
};

export const POST: APIRoute = async ({ request }) => {
	const origin = request.headers.get("origin");
	const cors = corsHeaders(origin);

	const ip = clientIp(request);
	const limit = consume(`subscribe:${ip}`, RATE_LIMIT_PER_MIN);
	if (!limit.ok) {
		return safeError(429, "Too many requests", {
			...cors,
			"Retry-After": String(limit.retryAfterSec),
		});
	}

	let raw: unknown;
	try {
		raw = await readJson(request);
	} catch {
		return safeError(415, "Invalid request", cors);
	}

	const parsed = SubscribeSchema.safeParse(raw);
	if (!parsed.success) {
		return safeError(400, "Invalid request", cors);
	}
	if (parsed.data.company && parsed.data.company.length > 0) {
		// Honeypot triggered — quietly accept to avoid signalling to bots.
		return jsonResponse({ ok: true }, { extraHeaders: cors });
	}

	try {
		const { email } = parsed.data;
		// TODO(SUPABASE): persist email to Supabase newsletter table.
		//   Use anon-key or service-role key with INSERT-only policy on `subscribers`.
		//   Enforce least-privilege: no SELECT permission for this key.
		// TODO(SMTP): send confirmation email via cPanel SMTP transport.
		console.log("[subscribe] new signup", { email, ip });
		return jsonResponse({ ok: true }, { extraHeaders: cors });
	} catch {
		// Never leak internal error details.
		return safeError(500, "Something went wrong", cors);
	}
};

export const GET: APIRoute = () => safeError(405, "Method not allowed");
