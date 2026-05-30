export type ConnectProvider =
  | "gmail"
  | "google_calendar"
  | "slack"
  | "telegram"
  | "hubspot"
  | "linkedin"
  | "zendesk";

export type ConfigField =
  | {
      kind: "input";
      key: string;
      label: string;
      type: "text" | "email" | "url" | "textarea" | "password";
      placeholder?: string;
      required?: boolean;
    }
  | {
      kind: "connect";
      key: string;
      label: string;
      provider: ConnectProvider;
      required?: boolean;
      description?: string;
    };

export type Agent = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  skills: string[];
  price: number;
  avatarSeed: string;
  accent: string;
  configFields: ConfigField[];
};

export const agents: Agent[] = [
  {
    id: "ada",
    name: "Ada",
    role: "Executive Secretary",
    tagline: "Schedules meetings, organizes your inbox, never sleeps.",
    bio: "Ada handles calendar logistics, drafts replies in your voice, triages email, and prepares briefings before every meeting. She learns your preferences within a week.",
    skills: ["Calendar", "Email triage", "Briefings", "Travel booking"],
    price: 49,
    avatarSeed: "Ada",
    accent: "from-amber-200 to-yellow-400",
    configFields: [
      { kind: "input", key: "fullName", label: "Your full name", type: "text", placeholder: "Jane Doe", required: true },
      { kind: "connect", key: "gmail", label: "Gmail", provider: "gmail", required: true, description: "Read, triage and reply to your inbox." },
      { kind: "connect", key: "calendar", label: "Google Calendar", provider: "google_calendar", required: true, description: "Schedule and reschedule meetings." },
      { kind: "input", key: "timezone", label: "Timezone", type: "text", placeholder: "Europe/Berlin" },
      { kind: "input", key: "workingHours", label: "Working hours", type: "text", placeholder: "9:00 – 18:00" },
    ],
  },
  {
    id: "milo",
    name: "Milo",
    role: "Sales Development Rep",
    tagline: "Researches leads and writes cold emails that get replies.",
    bio: "Milo runs prospect research, enriches CRM records, and drafts personalized outbound sequences. Plugs into HubSpot, Salesforce, and Apollo.",
    skills: ["Lead research", "Email sequences", "CRM sync", "LinkedIn"],
    price: 89,
    avatarSeed: "Milo",
    accent: "from-sky-200 to-blue-400",
    configFields: [
      { kind: "input", key: "company", label: "Company name", type: "text", placeholder: "Acme Inc.", required: true },
      { kind: "input", key: "icp", label: "Ideal customer profile", type: "textarea", placeholder: "Series A SaaS, 50–200 employees, US/EU" },
      { kind: "connect", key: "hubspot", label: "HubSpot CRM", provider: "hubspot", description: "Enrich leads and sync activity." },
      { kind: "connect", key: "linkedin", label: "LinkedIn", provider: "linkedin", description: "Research prospects and send connection requests." },
      { kind: "input", key: "sendingDomain", label: "Sending domain", type: "url", placeholder: "outbound.acme.com" },
      { kind: "input", key: "tone", label: "Voice & tone", type: "text", placeholder: "Friendly, direct, no fluff" },
    ],
  },
  {
    id: "nova",
    name: "Nova",
    role: "Data Analyst",
    tagline: "Turns spreadsheets into decisions.",
    bio: "Nova ingests CSVs, queries your warehouse, and produces weekly dashboards with plain-English insights. SQL fluent in seven dialects.",
    skills: ["SQL", "Dashboards", "Forecasting", "ETL"],
    price: 129,
    avatarSeed: "Nova",
    accent: "from-emerald-200 to-teal-400",
    configFields: [
      { kind: "input", key: "warehouse", label: "Data warehouse", type: "text", placeholder: "BigQuery / Snowflake / Postgres", required: true },
      { kind: "input", key: "connectionString", label: "Read-only connection string", type: "password", placeholder: "postgres://readonly@…" },
      { kind: "input", key: "kpis", label: "Key metrics to track", type: "textarea", placeholder: "MRR, churn, activation rate…" },
      { kind: "input", key: "cadence", label: "Report cadence", type: "text", placeholder: "Weekly on Monday 9am" },
    ],
  },
  {
    id: "kira",
    name: "Kira",
    role: "Content Strategist",
    tagline: "Plans, writes, and ships content on a schedule.",
    bio: "Kira researches topics, drafts long-form articles, schedules social posts, and tracks performance. Works in your brand voice.",
    skills: ["SEO", "Copywriting", "Social", "Editorial calendar"],
    price: 69,
    avatarSeed: "Kira",
    accent: "from-rose-200 to-pink-400",
    configFields: [
      { kind: "input", key: "brand", label: "Brand name", type: "text", placeholder: "Acme", required: true },
      { kind: "input", key: "website", label: "Website", type: "url", placeholder: "https://acme.com" },
      { kind: "input", key: "audience", label: "Target audience", type: "textarea", placeholder: "Indie founders building B2B SaaS" },
      { kind: "input", key: "voice", label: "Brand voice", type: "text", placeholder: "Witty, sharp, slightly nerdy" },
      { kind: "connect", key: "linkedin", label: "LinkedIn", provider: "linkedin", description: "Publish posts and reply to comments." },
    ],
  },
  {
    id: "rex",
    name: "Rex",
    role: "Customer Support Lead",
    tagline: "Answers tickets in seconds, escalates the hard ones.",
    bio: "Rex resolves 70% of support tickets autonomously, drafts responses for the rest, and produces weekly CSAT reports.",
    skills: ["Zendesk", "Intercom", "Macros", "QA"],
    price: 99,
    avatarSeed: "Rex",
    accent: "from-violet-200 to-purple-400",
    configFields: [
      { kind: "connect", key: "zendesk", label: "Zendesk", provider: "zendesk", required: true, description: "Read and reply to support tickets." },
      { kind: "connect", key: "slack", label: "Slack", provider: "slack", description: "Escalate hard tickets to your team channel." },
      { kind: "input", key: "kbUrl", label: "Knowledge base URL", type: "url", placeholder: "https://help.acme.com" },
      { kind: "input", key: "escalationEmail", label: "Escalation contact", type: "email", placeholder: "support-lead@acme.com" },
      { kind: "input", key: "sla", label: "Target first-response SLA", type: "text", placeholder: "Under 10 minutes" },
    ],
  },
  {
    id: "june",
    name: "June",
    role: "Recruiter",
    tagline: "Sources, screens, and schedules candidates.",
    bio: "June searches LinkedIn, scores resumes against your job description, sends outreach, and books interviews on your calendar.",
    skills: ["Sourcing", "Screening", "Scheduling", "ATS"],
    price: 119,
    avatarSeed: "June",
    accent: "from-orange-200 to-red-400",
    configFields: [
      { kind: "input", key: "role", label: "Role to hire for", type: "text", placeholder: "Senior Frontend Engineer", required: true },
      { kind: "input", key: "jd", label: "Job description", type: "textarea", placeholder: "Paste the JD or key requirements…" },
      { kind: "connect", key: "linkedin", label: "LinkedIn", provider: "linkedin", required: true, description: "Source and message candidates." },
      { kind: "connect", key: "calendar", label: "Google Calendar", provider: "google_calendar", description: "Book interviews on your calendar." },
      { kind: "input", key: "location", label: "Location / remote policy", type: "text", placeholder: "Remote EU, ±3h CET" },
    ],
  },
];

export const findAgent = (id: string) => agents.find((a) => a.id === id);
