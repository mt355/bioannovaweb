import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next();
	const headers = response.headers;

	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("X-Frame-Options", "DENY");
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
	headers.set("X-DNS-Prefetch-Control", "on");

	// HSTS — only meaningful over HTTPS; harmless otherwise.
	if (!headers.has("Strict-Transport-Security")) {
		headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
	}

	// Content-Security-Policy — permissive enough for Google Fonts; tighten with
	// nonces if/when third-party scripts are added.
	const csp = [
		"default-src 'self'",
		"img-src 'self' data: https:",
		"font-src 'self' https://fonts.gstatic.com data:",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"script-src 'self' 'unsafe-inline'",
		"connect-src 'self'",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'",
	].join("; ");
	if (!headers.has("Content-Security-Policy")) {
		headers.set("Content-Security-Policy", csp);
	}

	return response;
});
