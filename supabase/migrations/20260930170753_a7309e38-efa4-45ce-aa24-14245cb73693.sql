CREATE TABLE public.experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  country text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  seniority_years int NOT NULL DEFAULT 5,
  availability text NOT NULL DEFAULT 'Available',
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experts TO authenticated;
GRANT ALL ON public.experts TO service_role;
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experts are publicly readable" ON public.experts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.knowledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  country text NOT NULL,
  topic text NOT NULL,
  sources jsonb NOT NULL DEFAULT '[]',
  validated_by text NOT NULL,
  valid_from date NOT NULL DEFAULT current_date,
  valid_until date,
  status text NOT NULL DEFAULT 'validated',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_entries TO authenticated;
GRANT ALL ON public.knowledge_entries TO service_role;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Knowledge entries are publicly readable" ON public.knowledge_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create knowledge entries" ON public.knowledge_entries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.handoff_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  country text NOT NULL,
  employee_context text,
  ai_draft text,
  sources jsonb NOT NULL DEFAULT '[]',
  expert_id uuid REFERENCES public.experts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  expert_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.handoff_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoff_requests TO authenticated;
GRANT ALL ON public.handoff_requests TO service_role;
ALTER TABLE public.handoff_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Handoffs are publicly readable" ON public.handoff_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create handoffs" ON public.handoff_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update handoffs" ON public.handoff_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.experts (name, title, country, specialties, seniority_years, availability, email) VALUES
('Annelies Peeters', 'Senior Payroll Consultant', 'Belgium', ARRAY['Social security', 'ONSS/RSZ contributions', 'Dimona declarations', 'Holiday pay'], 14, 'Available', 'annelies.peeters@payrollpassport.demo'),
('Jeroen van der Berg', 'Payroll Tax Specialist', 'Netherlands', ARRAY['Wage tax', '30% ruling', 'Loonheffing', 'Expat schemes'], 11, 'Available', 'jeroen.vandenberg@payrollpassport.demo'),
('Marie Lefèvre', 'Payroll Compliance Lead', 'France', ARRAY['Social charges', 'DSN reporting', 'Collective agreements', 'Paid leave'], 16, 'Limited availability', 'marie.lefevre@payrollpassport.demo'),
('Thomas Dubois', 'Cross-border Payroll Expert', 'Belgium', ARRAY['Cross-border employment', 'A1 certificates', 'Tax treaties', 'Posted workers'], 9, 'Available', 'thomas.dubois@payrollpassport.demo'),
('Sanne de Vries', 'Payroll Systems Analyst', 'Netherlands', ARRAY['Payroll automation', 'Pension schemes', 'Sectoral CAOs'], 7, 'Available', 'sanne.devries@payrollpassport.demo'),
('Claire Moreau', 'International Payroll Director', 'France', ARRAY['Multi-country payroll', 'Expatriate taxation', 'Split payroll'], 19, 'Limited availability', 'claire.moreau@payrollpassport.demo');

INSERT INTO public.knowledge_entries (question, answer, country, topic, sources, validated_by, valid_from, valid_until) VALUES
('What is the employer social security contribution rate in Belgium for 2026?', 'In Belgium, the standard employer ONSS/RSZ contribution is approximately 25% of gross salary for white-collar workers, with no ceiling. Certain reductions apply for low salaries, first hires, and specific target groups. Always verify the applicable reduction scheme for the specific employee profile.', 'Belgium', 'Social security', '[{"title": "RSZ/ONSS — Employer contributions", "url": "https://www.socialsecurity.be", "authority": "official", "date": "2026-01-01"}]', 'Annelies Peeters', '2026-01-01', '2026-12-31'),
('How does the 30% ruling work in the Netherlands?', 'The 30% ruling allows employers to pay up to 30% of an incoming employee''s gross salary tax-free as compensation for extraterritorial costs, subject to conditions: the employee must be recruited from abroad, meet a salary threshold, and have lived more than 150 km from the Dutch border for 16 of the 24 months before employment. From 2024 the facility is being phased down (30/20/10% over consecutive 20-month periods) and capped at the Balkenende norm.', 'Netherlands', 'Expat taxation', '[{"title": "Belastingdienst — 30% facility", "url": "https://www.belastingdienst.nl", "authority": "official", "date": "2026-01-01"}]', 'Jeroen van der Berg', '2026-01-01', '2026-12-31'),
('What is the minimum wage (SMIC) in France for 2026?', 'The French SMIC is revalued at least annually on 1 January (and intermediately if inflation exceeds 2%). As of the latest revaluation the gross hourly SMIC is approximately €11.88. Verify the current rate on service-public.fr before quoting to a client, as intermediate revaluations occur.', 'France', 'Minimum wage', '[{"title": "Service-Public — SMIC", "url": "https://www.service-public.fr", "authority": "official", "date": "2026-01-01"}]', 'Marie Lefèvre', '2026-01-01', '2026-12-31');