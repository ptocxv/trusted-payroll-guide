export type SourceAuthority = "official" | "government_portal" | "secondary";

export interface PayrollSource {
  id: string;
  title: string;
  url: string;
  country: string;
  topics: string[];
  authority: SourceAuthority;
  publishedDate: string;
  lastVerified: string;
  summary: string;
}

/**
 * Curated registry of live public payroll sources for BE / NL / FR.
 * The AI answer engine grounds its answers in this registry and links out.
 */
export const PAYROLL_SOURCES: PayrollSource[] = [
  // Belgium
  {
    id: "be-onss",
    title: "RSZ/ONSS — Employer social security contributions",
    url: "https://www.socialsecurity.be/employer/instructions/dmfa/en/latest/instructions/salary/contributions.html",
    country: "Belgium",
    topics: ["social security", "contributions", "ONSS", "RSZ"],
    authority: "official",
    publishedDate: "2026-01-01",
    lastVerified: "2026-09-15",
    summary:
      "Official National Social Security Office instructions on employer and employee contribution rates, reductions and ceilings.",
  },
  {
    id: "be-fod-finance",
    title: "FPS Finance — Withholding tax on professional income",
    url: "https://finance.belgium.be/en/enterprises/withholding-tax",
    country: "Belgium",
    topics: ["withholding tax", "bedrijfsvoorheffing", "tax"],
    authority: "official",
    publishedDate: "2026-01-01",
    lastVerified: "2026-09-10",
    summary:
      "Federal tax authority guidance on payroll withholding tax scales, exemptions and reductions.",
  },
  {
    id: "be-holiday-pay",
    title: "RJV/ONVA — Holiday pay for employees",
    url: "https://www.rjv-onva.fgov.be/",
    country: "Belgium",
    topics: ["holiday pay", "vacation", "annual leave"],
    authority: "official",
    publishedDate: "2025-06-01",
    lastVerified: "2026-08-20",
    summary:
      "National Office for Annual Holidays: rules on single and double holiday pay for workers and employees.",
  },
  {
    id: "be-minimum-wage",
    title: "National Labour Council — Guaranteed average minimum monthly income",
    url: "https://www.cnt-nar.be/",
    country: "Belgium",
    topics: ["minimum wage", "GGMMI", "RMMMG"],
    authority: "government_portal",
    publishedDate: "2025-04-01",
    lastVerified: "2026-07-01",
    summary:
      "Collective agreements and indexed minimum income levels. Note: sectoral joint committees may set higher minima.",
  },
  // Netherlands
  {
    id: "nl-belastingdienst-loonheffing",
    title: "Belastingdienst — Wage tax and national insurance contributions",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontenten/belastingdienst/business/payroll_taxes/",
    country: "Netherlands",
    topics: ["wage tax", "loonheffing", "payroll tax"],
    authority: "official",
    publishedDate: "2026-01-01",
    lastVerified: "2026-09-12",
    summary:
      "Dutch Tax Administration guidance on wage tax, national insurance and employed person's insurance contributions.",
  },
  {
    id: "nl-30-ruling",
    title: "Belastingdienst — 30% facility for incoming employees",
    url: "https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/content/coming-to-work-in-the-netherlands-30-percent-facility",
    country: "Netherlands",
    topics: ["30% ruling", "expat", "extraterritorial costs"],
    authority: "official",
    publishedDate: "2026-01-01",
    lastVerified: "2026-09-12",
    summary:
      "Conditions for the 30% ruling: recruitment from abroad, salary threshold, 150 km rule, phase-down and Balkenende cap.",
  },
  {
    id: "nl-minimum-wage",
    title: "Government.nl — Minimum wage",
    url: "https://www.government.nl/topics/minimum-wage",
    country: "Netherlands",
    topics: ["minimum wage", "WML"],
    authority: "government_portal",
    publishedDate: "2026-07-01",
    lastVerified: "2026-08-30",
    summary:
      "Statutory hourly minimum wage, indexed every 1 January and 1 July. Since 2024 expressed per hour, not per month.",
  },
  {
    id: "nl-svb",
    title: "SVB — Social insurance when working abroad",
    url: "https://www.svb.nl/en/",
    country: "Netherlands",
    topics: ["social insurance", "A1", "cross-border"],
    authority: "official",
    publishedDate: "2025-03-01",
    lastVerified: "2026-06-15",
    summary:
      "Sociale Verzekeringsbank information on A1 certificates and social insurance coverage for cross-border workers.",
  },
  // France
  {
    id: "fr-urssaf",
    title: "Urssaf — Employer social contributions",
    url: "https://www.urssaf.fr/",
    country: "France",
    topics: ["social charges", "cotisations", "contributions"],
    authority: "official",
    publishedDate: "2026-01-01",
    lastVerified: "2026-09-08",
    summary:
      "Official rates for employer and employee social contributions, reductions (réduction générale) and ceilings.",
  },
  {
    id: "fr-service-public-smic",
    title: "Service-Public — SMIC minimum wage",
    url: "https://www.service-public.fr/particuliers/vosdroits/F2300",
    country: "France",
    topics: ["minimum wage", "SMIC"],
    authority: "official",
    publishedDate: "2026-01-01",
    lastVerified: "2026-09-01",
    summary:
      "Current gross hourly and monthly SMIC. Revalued every 1 January and intermediately when inflation exceeds 2%.",
  },
  {
    id: "fr-dsn",
    title: "net-entreprises — DSN (Déclaration Sociale Nominative)",
    url: "https://www.net-entreprises.fr/dsn/",
    country: "France",
    topics: ["DSN", "reporting", "declarations"],
    authority: "official",
    publishedDate: "2025-09-01",
    lastVerified: "2026-08-25",
    summary:
      "Monthly nominative social declaration replacing most payroll reporting obligations; deadlines on the 5th or 15th.",
  },
  {
    id: "fr-conventions",
    title: "Légifrance — Collective agreements",
    url: "https://www.legifrance.gouv.fr/",
    country: "France",
    topics: ["collective agreements", "conventions collectives", "paid leave"],
    authority: "government_portal",
    publishedDate: "2025-01-01",
    lastVerified: "2026-05-10",
    summary:
      "Official legal portal for collective bargaining agreements that can set rules above the statutory baseline.",
  },
  // Cross-border
  {
    id: "eu-a1",
    title: "European Commission — Posted workers and A1 certificates",
    url: "https://ec.europa.eu/social/main.jsp?catId=471",
    country: "EU",
    topics: ["A1", "posted workers", "cross-border", "tax treaties"],
    authority: "official",
    publishedDate: "2025-01-01",
    lastVerified: "2026-07-20",
    summary:
      "EU social security coordination rules (Regulation 883/2004) determining which country's system applies.",
  },
];

export const COUNTRIES = ["Belgium", "Netherlands", "France"] as const;

export function sourcesForCountry(country: string): PayrollSource[] {
  return PAYROLL_SOURCES.filter((s) => s.country === country || s.country === "EU");
}
