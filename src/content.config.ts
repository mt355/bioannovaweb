import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const products = defineCollection({
	loader: glob({ base: "./src/content/products", pattern: "**/*.json" }),
	schema: z.object({
		name: z.string(),
		tagline: z.string(),
		concern: z.enum(["whitening", "sensitivity", "daily-care", "cavity-protection"]),
		concernLabel: z.string(),
		description: z.string(),
		shortDescription: z.string(),
		price: z.number().positive(),
		currency: z.string().default("GBP"),
		imageBase: z.string(),
		heroImage: z.string(),
		gallery: z.array(z.string()),
		ingredients: z.array(z.object({ name: z.string(), purpose: z.string() })),
		howToUse: z.array(z.string()),
		highlights: z.array(z.string()),
		order: z.number().int().nonnegative(),
	}),
});

export const collections = { products };
