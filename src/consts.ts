export const SITE_TITLE = "BioAnnova — Clean Oral Care, Naturally Formulated";
export const SITE_DESCRIPTION =
	"BioAnnova crafts clean, dentist-aligned toothpaste — bamboo charcoal whitening, sensitivity relief, daily care, and anti-cavity protection. A Herbapharmedica brand.";

export const BRAND = {
	name: "BioAnnova",
	parent: "Herbapharmedica Ltd",
	parentSince: 2012,
	address: "78 York Street, London, United Kingdom",
	phone: "+44 750 880 5859",
	parentSite: "https://herbapharmedica.co.uk",
	email: "hello@bioannova.com",
};

export const CONCERNS = [
	{ slug: "whitening", label: "Whitening", productSlug: "bamboo-charcoal" },
	{ slug: "sensitivity", label: "Sensitivity", productSlug: "sensitive-soothing-relief" },
	{ slug: "daily-care", label: "Daily Care", productSlug: "daily-care" },
	{ slug: "cavity-protection", label: "Cavity Protection", productSlug: "whitening-anti-cavity" },
] as const;
