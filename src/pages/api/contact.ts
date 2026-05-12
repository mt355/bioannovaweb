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

const ContactSchema = z
	.object({
		name: z.string().trim().min(1).max(120),
		email: z.string().email().max(254),
		subject: z.enum(["general", "wholesale", "press", "support"]).default("general"),
		message: z.string().trim().min(5).max(5000),
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
	const limit = consume(`contact:${ip}`, RATE_LIMIT_PER_MIN);
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

	const parsed = ContactSchema.safeParse(raw);
	if (!parsed.success) {
		return safeError(400, "Invalid request", cors);
	}
	if (parsed.data.company && parsed.data.company.length > 0) {
		// Honeypot triggered — pretend success.
		return jsonResponse({ ok: true }, { extraHeaders: cors });
	}

	try {
		const { name, email, subject, message } = parsed.data;
		// TODO(SUPABASE): insert into `contact_messages` with INSERT-only RLS.
		// TODO(SMTP): relay via cPanel SMTP — never expose creds client-side.
		// Note: log truncated message length only — don't dump PII into logs.
		console.log("[contact] new message", {
			subject,
			fromHash: hash(`${email}|${ip}`),
			nameLen: name.length,
			msgLen: message.length,
		});
		return jsonResponse({ ok: true }, { extraHeaders: cors });
	} catch {
		return safeError(500, "Something went wrong", cors);
	}
};

export const GET: APIRoute = () => safeError(405, "Method not allowed");

function hash(input: string): string {
	let h = 0;
	for (let i = 0; i < input.length; i++) {
		h = (h << 5) - h + input.charCodeAt(i);
		h |= 0;
	}
	return h.toString(36);
}
