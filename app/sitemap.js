export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vaastushree.com";
  const routes = [
    "",
    "/services",
    "/about",
    "/property-consultation",
    "/book-reading",
    "/numerology",
    "/contact",
    "/faq",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
