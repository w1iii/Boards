export const NLP_EXAM_CONTEXT = `
Philippine Nurse Licensure Exam (NLP) — Professional Regulation Commission (PRC) Board of Nursing

Exam structure:
- 500 items total across 5 nursing practice areas
- Passing: 75% general weighted average, no subject below 60%
- Questions are situational (Socratic method) — not recall or definition
- Follow the nursing process: Assessment → Diagnosis → Planning → Implementation → Evaluation
- Use Philippine drug names, brand names, and national formulary
- Reference DOH programs and Philippine healthcare system
- Apply BON 11 Key Areas of Responsibility
`.trim()

export const AREA_TOPICS: Record<string, { label: string; topics: string }> = {
  "nlp-i": {
    label: "NP I — Community Health Nursing",
    topics: `
PH health system: DOH structure (central to barangay), PhilHealth (Z-benefits, case rates), devolution (LGC), primary health care, BHWs, RHUs, BHS
DOH programs: DOTS (National TB Program), EPI (BCG, DPT, OPV, measles, Hepa B), Family Planning (natural & artificial), National Dengue Control, Rabies Prevention, HIV/AIDS Program, RA 11036 (Mental Health Act), National Nutrition (Operation Timbang), Garantisadong Pambata, IMCI
Epidemiology: morbidity vs mortality, prevalence vs incidence, epidemic vs endemic vs pandemic, herd immunity, levels of prevention (primary/secondary/tertiary), epidemiological triad, notifiable diseases
Communicable disease control: TB (DOTS, sputum microscopy, categories), leprosy (paucibacillary vs multibacillary, MDT), STIs (syndromic approach), typhoid, cholera, hepatitis A/B, schistosomiasis, filariasis, malaria, rabies, leptospirosis, COVID-19
Environmental health: water sanitation, food safety, RA 9003 (Ecological Solid Waste), PD 856 (Sanitation Code), climate change & health
Population groups: maternal and child, elderly, school-age, occupational, indigenous peoples, barangay health management
Family health: family nursing process, genogram, APGAR, eco-map, home visit (bag technique), family care plan
Community organizing: COPAR, needs assessment, participatory action research, core group formation
Legal bases: RA 9173, RA 1054 (Occupational Health), RA 7305, PD 856, EO 51 (Milk Code), RA 6972
Occupational health: hazards (biological, chemical, physical, ergonomic, psychosocial), RA 11058 (OSH Standards)
    `.trim(),
  },
  "nlp-ii": {
    label: "NP II — Maternal & Child Health Nursing",
    topics: `
Antepartum: prenatal assessment, danger signs of pregnancy, hyperemesis gravidarum, PIH (preeclampsia/eclampsia), gestational diabetes, RH incompatibility, Leopold's maneuvers, fundic height, GTPAL
Intrapartum: stages of labor (1-4), true vs false labor, fetal monitoring (FHR patterns, decelerations), nursing interventions per stage, pain management, amniotomy, episiotomy, vacuum/forceps, C-section
Postpartum: BUBBLE-HE assessment, postpartum hemorrhage (uterine atony, lacerations), postpartum infection, lactation/breastfeeding support, postpartum blues vs depression, lochia (rubra/serosa/alba)
Newborn: APGAR, immediate care (thermoregulation, ID, Vit K, eye prophylaxis), newborn reflexes (Moro, rooting, sucking, Babinski), neonatal jaundice (physiologic vs pathologic), cephalhematoma vs caput succedaneum, hypoglycemia, congenital anomalies, circumcision care
Pediatrics: growth & development (Freud, Erikson, Piaget, Kohlberg), EPI immunizations, common childhood illnesses (dengue, pneumonia, diarrhea/dehydration, UTI), pediatric drug calculations (Clark's, Fried's, BSA), child abuse, SIDS prevention, IMCI guidelines
High-risk: placenta previa, abruptio placentae, cord prolapse, shoulder dystocia, meconium aspiration, RDS, retinopathy of prematurity, preterm labor
Family planning: natural (rhythm, BBT, cervical mucus, LAM), artificial (OCPs, IUD, implant, injectable, condom, sterilization), emergency contraception
DOH programs: Garantisadong Pambata, EPI, IMCI, Milk Code (EO 51), rooming-in, newborn screening (RA 9288), National Safe Motherhood
    `.trim(),
  },
  "nlp-iii": {
    label: "NP III — Adult Health and Illness Care (Part 1)",
    topics: `
Oxygenation: cardiovascular (heart failure, MI, hypertension, CAD, angina, dysrhythmias, valvular disease, EKG, cardiac catheterization, CABG, pacemaker, ACLS), respiratory (pneumonia, COPD, asthma, PTB, chest tube, oxygen therapy, mechanical ventilation, pulmonary embolism, pneumothorax, ABG, PFTs)
Fluids & electrolytes: FVD/FVE, electrolyte imbalances (Na, K, Ca, Mg, P), acid-base (resp/metabolic acidosis/alkalosis), IV fluids, blood transfusion
Nutrition & metabolism: GI (PUD, cirrhosis, pancreatitis, IBD, colostomy/ileostomy, NG tube, TPN, GI bleeding, hepatitis), Endocrine (DM type 1/2, DKA, HHS, insulin therapy, thyroid disorders, Cushing's, Addison's, SIADH, DI)
Perioperative care: preoperative (informed consent, NPO, prep), intraoperative (sterile technique, positioning), postoperative (hemorrhage, infection, DVT, PE, ileus, dehiscence/evisceration)
Neurological: stroke (ischemic vs hemorrhagic), seizures, increased ICP, meningitis, encephalitis, head/spinal cord injury, GBS, myasthenia gravis, Parkinson's, GCS, neurovascular assessment (5 P's)
Renal: AKI, CKD, UTI, pyelonephritis, glomerulonephritis, hemodialysis/peritoneal dialysis, renal calculi, BPH, prostatectomy
MSK: fractures (types, complications: compartment syndrome, fat embolism, DVT), traction, amputation, arthritis (OA, RA, gout), osteoporosis, cast care, CPM, joint replacement
Integumentary: burns (TBSA rule of nines, Parkland formula, wound care), pressure ulcers (staging, prevention, treatment), wound healing (primary/secondary/tertiary)
Use PH brand names, PhilHealth Z-benefits, DOH clinical guidelines.
    `.trim(),
  },
  "nlp-iv": {
    label: "NP IV — Adult Health and Illness Care (Part 2)",
    topics: `
Acute biologic crises: shock (hypovolemic, cardiogenic, septic, neurogenic, anaphylactic), DIC, sepsis/SIRS, MODS, acute respiratory distress syndrome, acute kidney injury, acute liver failure
Emergency & disaster nursing: START triage (red/yellow/green/black), disaster phases, common PH disasters (typhoons, earthquakes), mass casualty incident management, emergency preparedness, code blue management
Cellular aberrations (Oncology): cancer nursing, TNM staging, chemotherapy (administration, extravasation, side effects), radiation, brachytherapy, BMT, oncologic emergencies (SVC syndrome, tumor lysis, spinal cord compression, hypercalcemia), palliative care
Immunologic responses: HIV/AIDS (staging, HAART, OIs), SLE, systemic sclerosis, Sjogren's, anaphylaxis, transplant (graft types, rejection, immunosuppression)
Communicable diseases: dengue (warning signs, DHF grading), leptospirosis, rabies, schistosomiasis, tetanus, typhoid, cholera, emerging PH infections
Use PH brand names, PhilHealth Z-benefits, DOH clinical guidelines.
    `.trim(),
  },
  "nlp-v": {
    label: "NP V — Mental Health and Psychiatric Nursing",
    topics: `
Therapeutic communication: techniques (active listening, open-ended, reflection, clarification, focusing, empathy), nontherapeutic blocks (false reassurance, advice, changing subject), phases (preinteraction, orientation, working, termination), therapeutic milieu
MSE: appearance, speech (rate/rhythm/volume), mood/affect, thought process/content (delusions, obsessions, phobias), perception (hallucinations vs illusions), cognition (orientation, memory, attention), insight/judgment
Schizophrenia: positive symptoms (hallucinations, delusions, disorganized speech), negative symptoms (avolition, flat affect, alogia, anhedonia), types (paranoid, disorganized, catatonic, undifferentiated, residual)
Mood disorders: major depression (SAD PERSONS scale, Columbia Suicide Severity), bipolar I/II, lithium (therapeutic 0.6-1.2, toxicity), ECT nursing care
Anxiety disorders: GAD, panic disorder, phobias, PTSD, OCD, levels of anxiety, grounding, systematic desensitization, CBT
Personality disorders: Cluster A (paranoid, schizoid, schizotypal), Cluster B (antisocial, borderline, histrionic, narcissistic), Cluster C (dependent, avoidant, OCPD)
Crisis intervention: crisis phases, suicide precautions (1:1 observation, environmental safety), rape trauma syndrome
Substance use: alcohol (intoxication, withdrawal — DTs, CIWA), opioids, cocaine/amphetamines, cannabis, hallucinogens, benzodiazepines, detox, AA/NA 12-step
Psychopharmacology: antipsychotics (typical, atypical, side effects: EPS, tardive dyskinesia, NMS, agranulocytosis), antidepressants (SSRIs, SNRIs, TCAs, MAOIs), mood stabilizers, anxiolytics
Leadership & management: staffing patterns (functional, team, primary, case method), patient classification, delegation (5 rights), conflict resolution, QA/QI, audits
Legal/ethical: RA 9173 (Nursing Act), Code of Ethics, informed consent, patient rights, RA 11036 (Mental Health Act), RA 10173 (Data Privacy Act), confidentiality, voluntary vs involuntary admission, seclusion/restraint guidelines
    `.trim(),
  },
}

export const NLP_SCRAPE_URLS: Record<string, string[]> = {
  "nlp-i": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-i-for-foundation-of-professional-nursing-practice/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-i-for-foundation-of-nursing/",
  ],
  "nlp-ii": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-ii-for-community-health-nursing-and-care-of-the-mother-and-child/",
  ],
  "nlp-iii": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-ii-for-maternal-and-child-health/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iii-for-care-of-clients-with-physiologic-and-psychosocial-alterations-part-1/",
  ],
  "nlp-iv": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iv-for-care-of-clients-with-physiologic-and-psychosocial-alterations-part-2/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iii-for-medical-surgical-nursing/",
  ],
  "nlp-v": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-v-for-care-of-clients-with-physiologic-and-psychosocial-alterations-part-3/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iv-for-psychiatric-nursing/",
  ],
}
