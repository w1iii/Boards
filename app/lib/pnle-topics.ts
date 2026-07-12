export const PNLE_EXAM_CONTEXT = `
Philippine Nurse Licensure Exam (PNLE) — Professional Regulation Commission (PRC) Board of Nursing

Exam structure:
- 500 items total across 5 practice areas
- Passing: 75% GWA, no subject below 60%
- Questions are situational (Socratic method) — not recall or definition
- Follow the nursing process: Assessment → Diagnosis → Planning → Implementation → Evaluation
- Use Philippine drug names, brand names, and national formulary
- Reference DOH programs and Philippine healthcare system
- Apply BON 11 Key Areas of Responsibility:
  Patient Care: Safe & Quality Nursing Care, Communication, Collaboration & Teamwork, Health Education
  Empowering: Legal Responsibilities, Ethico-Moral-Spiritual Responsibilities, Personal & Professional Development
  Enabling: Management of Resources & Environment, Records Management
  Enhancing: Research, Quality Improvement
`.trim()

export const AREA_TOPICS: Record<string, { label: string; topics: string }> = {
  "medical-surgical": {
    label: "Nursing Practice III & IV — Care of Clients with Physiologic and Psychosocial Alterations (Medical-Surgical Nursing)",
    topics: `
Cardiovascular: heart failure, myocardial infarction, hypertension, dysrhythmias, nursing management of cardiac patients, interpretation of cardiac monitoring
Respiratory: pneumonia, COPD, asthma, pulmonary tuberculosis, chest tube management, oxygen therapy
Neurological: stroke, seizures, increased intracranial pressure, meningitis, Glasgow Coma Scale, neurovascular assessment
Gastrointestinal: peptic ulcer disease, liver cirrhosis, inflammatory bowel disease, colostomy care, NG tube management
Musculoskeletal: fractures, traction, amputation, arthritis, osteoporosis, cast care
Endocrine: diabetes mellitus (DKA, HHS), thyroid disorders (hyperthyroidism, hypothyroidism), Cushing's syndrome, Addison's disease
Renal: acute kidney injury, chronic kidney disease, urinary tract infections, hemodialysis and peritoneal dialysis nursing
Oncology: cancer nursing, chemotherapy administration and side effects, radiation therapy precautions, palliative care
Fluid & Electrolytes: fluid volume deficit/excess, electrolyte imbalances (Na, K, Ca), acid-base balance (respiratory/metabolic acidosis/alkalosis)
Surgery: preoperative nursing assessment, intraoperative sterile technique, postoperative complications (hemorrhage, infection, DVT, pulmonary embolism)
Integumentary: burns (classification, fluid resuscitation, wound care), pressure ulcers (staging, prevention, treatment)
Communicable diseases: dengue hemorrhagic fever, leptospirosis, rabies, schistosomiasis — Philippine epidemiology and DOH control programs
Use Philippine brand names, PhilHealth Z-benefits for catastrophic illnesses, and DOH clinical practice guidelines.
    `.trim(),
  },
  "mother-child": {
    label: "Nursing Practice II — Care of Mother, Adolescent, and Child (Maternal & Child Nursing)",
    topics: `
Antepartum: prenatal assessment and visits, danger signs of pregnancy, hyperemesis gravidarum, pregnancy-induced hypertension, gestational diabetes, RH incompatibility, Leopold's maneuvers
Intrapartum: stages of labor (1-4), true vs false labor, fetal monitoring (FHR patterns, decelerations), nursing interventions per stage, pain management, amnioinfusion, episiotomy care
Postpartum: normal postpartum assessment (BUBBLE-HE), postpartum hemorrhage (causes, nursing management), postpartum infection, lactation and breastfeeding support, postpartum blues vs depression
Newborn: APGAR scoring, immediate newborn care (thermoregulation, identification, Vitamin K, eye prophylaxis), newborn reflexes, neonatal jaundice (physiologic vs pathologic), cephalhematoma vs caput succedaneum, hypoglycemia in newborns, congenital anomalies
Pediatrics: growth and development milestones (Freud, Erikson, Piaget), childhood immunizations (DOH EPI schedule — BCG, DPT, OPV, measles, hepa B), common childhood illnesses (dengue, pneumonia, diarrhea/dehydration, UTI), pediatric medication calculations, child abuse identification and reporting
DOH Programs: Garantisadong Pambata, Expanded Program on Immunization (EPI), Integrated Management of Childhood Illness (IMCI), National Nutrition Council programs
    `.trim(),
  },
  psychiatric: {
    label: "Nursing Practice V — Care of Clients with Maladaptive Patterns of Behavior (Psychiatric Nursing)",
    topics: `
Therapeutic communication: techniques (Active listening, open-ended questioning, reflection, clarification), nontherapeutic blocks (false reassurance, giving advice, changing subject, undue reassurance), phases of therapeutic relationship (orientation, working, termination)
Mental Status Examination: general appearance, behavior, speech, mood and affect, thought process/content, perception (hallucinations vs illusions), cognition (orientation, memory, attention), insight and judgment
Schizophrenia: positive symptoms (hallucinations, delusions, disorganized speech), negative symptoms (avolition, anergia, flat affect), types (paranoid, disorganized, catatonic, undifferentiated, residual), nursing interventions during acute episodes, milieu therapy
Mood disorders: major depressive disorder (signs, suicide risk assessment, SAD PERSONS scale), bipolar disorder (mania vs depression phases, lithium therapy monitoring — therapeutic levels, toxicity signs), ECT nursing care
Anxiety disorders: GAD, panic disorder, phobias, PTSD, OCD — levels of anxiety (mild, moderate, severe, panic), nursing interventions per level, grounding techniques, relaxation techniques
Personality disorders: cluster A (paranoid, schizoid), cluster B (borderline, antisocial, histrionic in the Philippines), cluster C (dependent, avoidant) — nursing approaches and milieu management
Crisis intervention: phases of crisis, crisis intervention models, suicide precautions, emergency psychiatric care, rape trauma syndrome
Psychopharmacology: antipsychotics (typical vs atypical — side effects: EPS, tardive dyskinesia, NMS, agranulocytosis), antidepressants (SSRIs, SNRIs, MAOIs — dietary restrictions), mood stabilizers (lithium, valproate), anxiolytics (benzodiazepines), therapeutic levels and nursing responsibilities
Legal and ethical issues: RA 11036 (Mental Health Act of the Philippines), therapeutic milieu, patient rights, voluntary vs involuntary admission, seclusion and restraint guidelines
    `.trim(),
  },
  "community-health": {
    label: "Nursing Practice I — Care of Individuals, Families, Population Groups and Community (Community Health Nursing)",
    topics: `
Philippine health care delivery system: DOH structure (central, regional, provincial, municipal, barangay health stations), PhilHealth (benefits, Z-benefits, case rates), local government code (devolution of health services), primary health care (PHC), barangay health workers (BHWs)
DOH programs: National TB Program (DOTS strategy), Family Planning Program (natural and artificial methods), Expanded Program on Immunization, National Dengue Control Program, National Rabies Prevention Program, National HIV/AIDS Program, Mental Health Program (RA 11036 implementation), National Nutrition Program (operation timbang, micronutrient supplementation)
Epidemiology and vital statistics: morbidity vs mortality rates, prevalence vs incidence, epidemic vs endemic vs pandemic, herd immunity, levels of prevention (primary, secondary, tertiary), epidemiological triad (agent-host-environment), notifiable diseases
Communicable disease control: tuberculosis (DOTS, sputum microscopy, category I-IV regimens), leprosy (Hansen's disease — MDT regimen), STIs (HIV screening, syndromic approach), typhoid fever, cholera, hepatitis A/B, schistosomiasis, filariasis, malaria, rabies (post-exposure prophylaxis), COVID-19 (PH protocols)
Environmental health: water sanitation (chlorination, boiling, filtration), food safety, waste management (RA 9003 Ecological Solid Waste Management Act), air pollution, noise pollution, climate change and health impacts
Disaster nursing: triage (START system — red, yellow, green, black tags), disaster phases (preparedness, mitigation, response, rehabilitation), common PH disasters (typhoons, earthquakes, volcanic eruptions), emergency supplies and kits
Family health: family nursing process, family health assessment tools (family genogram, APGAR, eco-map), family care plan, home visit (steps, bag technique, nursing bag contents and protocols)
Community organizing: COPAR process, community needs assessment, participatory action research, inter-sectoral collaboration
Legal bases: RA 9173 (Philippine Nursing Act of 2002), RA 1054 (Occupational Health), RA 7305 (Magna Carta for Public Health Workers), PD 856 (Sanitation Code), EO 51 (Milk Code)
    `.trim(),
  },
  "leadership-management": {
    label: "Integrated — Nursing Leadership, Management, and Legal Responsibilities",
    topics: `
Nursing service administration: organizational structure, staffing patterns (functional, team, primary, case method nursing), patient classification systems (acuity levels), staff scheduling, shift assignments
Patient care assignment: principles of delegation, responsibility vs accountability vs authority, delegation criteria (right task, right circumstance, right person, right direction/communication, right supervision/evaluation), tasks that cannot be delegated (assessment, diagnosis, evaluation, care planning)
Quality improvement: QA vs QI, audit types (structure, process, outcome), indicators, benchmarking, continuous quality improvement (CQI) models, sentinel events, root cause analysis
Leadership styles: autocratic, democratic, laissez-faire, bureaucratic, situational, transformational, transactional — which style for which situation
Conflict management: types of conflict (intrapersonal, interpersonal, intergroup), conflict resolution styles (competing, collaborating, compromising, avoiding, accommodating), negotiation and mediation
Nursing laws in the Philippines: RA 9173 (Nursing Act of 2002 — scope of practice, qualifications, duties of nurses), RA 7305 (Magna Carta for Public Health Workers — benefits, rights, overtime, hazardous duty pay), RA 10912 (CME Act), RA 7875 (PhilHealth), PD 223 (PRC modernization), Code of Ethics for Nurses (2004 PNA Board Resolution — nurse and person, practice, society, co-workers, profession)
Records management: legal documentation guidelines, charting methods (narrative, SOAP, PIE, focus charting, DAR), electronic medical records, confidentiality (RA 10173 Data Privacy Act), informed consent, do-not-resuscitate orders
Research in nursing: nursing theories (Orem's self-care, Henderson's 14 needs, Watson's caring theory, Neuman's systems model, Roy's adaptation), research process (steps), ethics in research (informed consent, IRB/ethics committee), evidence-based practice (PICO framework, levels of evidence)
Resource management: inventory control, budgeting, supplies management, cost containment
    `.trim(),
  },
}
