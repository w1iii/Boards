export const PNLE_EXAM_CONTEXT = `
Philippine Nurse Licensure Exam (PNLE) — Professional Regulation Commission (PRC) Board of Nursing

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
  "pnle-i": {
    label: "PNLE I — Foundation of Professional Nursing Practice",
    topics: `
Nursing theories: Orem's self-care, Henderson's 14 needs, Watson's caring, Neuman's systems model, Roy's adaptation, Leininger's transcultural, Nightingale's environment
Nursing process: assessment (data gathering, validation, documentation), diagnosis (NANDA, actual vs risk), planning (goals, prioritizing), implementation (independent/dependent/interdependent), evaluation (formative vs summative)
Fundamentals: hygiene, mobility/positioning, vital signs, bed making, comfort, heat/cold therapy, wound care, specimen collection, perioperative care
Therapeutic communication: techniques (active listening, open-ended questioning, reflection, clarification), nontherapeutic blocks (false reassurance, advice, changing subject)
Leadership & management: staffing patterns (functional, team, primary, case method), patient classification, delegation (5 rights), conflict resolution, QA/QI, audits
Legal: RA 9173 (Nursing Act), Code of Ethics, informed consent, patient rights, RA 10173 (Data Privacy Act), DNR, living wills, RA 10912 (CME Act), RA 7305 (Magna Carta)
Research: steps of research process, EBP (PICO), sampling, quantitative vs qualitative, ethics in research, levels of evidence
Health education: learning domains (cognitive/affective/psychomotor), barriers, teaching strategies, evaluation of learning
Documentation: SOAP/PIE/DAR/focus charting, narrative charting, legal documentation, confidentiality
Pharmacology: drug classifications, pharmacokinetics, pharmacodynamics, 10 rights, drug calculations (oral, IV, insulin), IV flow rates
    `.trim(),
  },
  "pnle-ii": {
    label: "PNLE II — Community Health Nursing",
    topics: `
PH health system: DOH structure (central to barangay), PhilHealth (Z-benefits, case rates), devolution (LGC), primary health care, BHWs, RHUs, BHS
DOH programs: DOTS (National TB Program), EPI (BCG, DPT, OPV, measles, Hepa B), Family Planning (natural & artificial), National Dengue Control, Rabies Prevention, HIV/AIDS Program, RA 11036 (Mental Health Act), National Nutrition (Operation Timbang), Garantisadong Pambata, IMCI
Epidemiology: morbidity vs mortality, prevalence vs incidence, epidemic vs endemic vs pandemic, herd immunity, levels of prevention (primary/secondary/tertiary), epidemiological triad, notifiable diseases
Communicable disease control: TB (DOTS, sputum microscopy, categories), leprosy (paucibacillary vs multibacillary, MDT), STIs (syndromic approach), typhoid, cholera, hepatitis A/B, schistosomiasis, filariasis, malaria, rabies, leptospirosis, COVID-19
Environmental health: water sanitation, food safety, RA 9003 (Ecological Solid Waste), PD 856 (Sanitation Code), climate change & health
Disaster nursing: START triage (red/yellow/green/black), disaster phases, common PH disasters (typhoons, earthquakes)
Family health: family nursing process, genogram, APGAR, eco-map, home visit (bag technique), family care plan
Community organizing: COPAR, needs assessment, participatory action research, core group formation
Legal bases: RA 9173, RA 1054 (Occupational Health), RA 7305, PD 856, EO 51 (Milk Code), RA 6972
Occupational health: hazards (biological, chemical, physical, ergonomic, psychosocial), RA 11058 (OSH Standards)
    `.trim(),
  },
  "pnle-iii": {
    label: "PNLE III — Maternal & Child Health Nursing",
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
  "pnle-iv": {
    label: "PNLE IV — Medical-Surgical Nursing",
    topics: `
Cardiovascular: heart failure, MI (STEMI/NSTEMI), hypertension, CAD, angina, dysrhythmias (AF, V-tach, V-fib, heart blocks), valvular disease, cardiac monitoring/EKG, cardiac catheterization, CABG, pacemaker, ACLS
Respiratory: pneumonia, COPD, asthma, PTB, chest tube management, oxygen therapy, mechanical ventilation, pulmonary embolism, pneumothorax, thoracentesis, ABG, PFTs
Neurological: stroke (ischemic vs hemorrhagic), seizures, increased ICP, meningitis, encephalitis, head/spinal cord injury, GBS, myasthenia gravis, Parkinson's, GCS, neurovascular assessment (5 P's)
GI: PUD, cirrhosis (ascites, varices, encephalopathy), pancreatitis, IBD (Crohn's, UC), colostomy/ileostomy care, NG tube, TPN, GI bleeding, hepatitis
MSK: fractures (types, complications: compartment syndrome, fat embolism, DVT), traction, amputation, arthritis (OA, RA, gout), osteoporosis, cast care, CPM, joint replacement
Endocrine: DM type 1/2 (DKA, HHS), insulin therapy, thyroid disorders (hyperthyroidism, storm, hypothyroidism, myxedema coma), Cushing's, Addison's, SIADH, DI
Renal: AKI, CKD, UTI, pyelonephritis, glomerulonephritis, hemodialysis/peritoneal dialysis, renal calculi, BPH, prostatectomy
Oncology: cancer nursing, TNM staging, chemotherapy (administration, extravasation, side effects), radiation, brachytherapy, BMT, oncologic emergencies, palliative care
Fluids & electrolytes: FVD/FVE, electrolyte imbalances (Na, K, Ca, Mg, P), acid-base (resp/metabolic acidosis/alkalosis), IV fluids, blood transfusion
Surgery: preoperative (informed consent, NPO, prep), intraoperative (sterile technique, positioning), postoperative (hemorrhage, infection, DVT, PE, ileus, dehiscence/evisceration)
Integumentary: burns (TBSA rule of nines, Parkland formula, wound care), pressure ulcers (staging, prevention, treatment), wound healing (primary/secondary/tertiary)
Communicable diseases: dengue (warning signs, DHF grading), leptospirosis, rabies, schistosomiasis, tetanus, typhoid, cholera
Immunologic: HIV/AIDS (staging, HAART, OIs), SLE, systemic sclerosis, Sjogren's, anaphylaxis, transplant (graft types, rejection, immunosuppression)
Use PH brand names, PhilHealth Z-benefits, DOH clinical guidelines.
    `.trim(),
  },
  "pnle-v": {
    label: "PNLE V — Psychiatric Nursing",
    topics: `
Therapeutic communication: techniques (active listening, open-ended, reflection, clarification, focusing, empathy), nontherapeutic blocks (false reassurance, advice, changing subject), phases (preinteraction, orientation, working, termination), therapeutic milieu
MSE: appearance, speech (rate/rhythm/volume), mood/affect, thought process/content (delusions, obsessions, phobias), perception (hallucinations vs illusions), cognition (orientation, memory, attention), insight/judgment
Schizophrenia: positive symptoms (hallucinations — auditory most common, delusions — paranoid/grandiose/persecutory, disorganized speech), negative symptoms (avolition, flat affect, alogia, anhedonia), types (paranoid, disorganized, catatonic, undifferentiated, residual)
Mood disorders: major depression (SAD PERSONS scale, Columbia Suicide Severity), bipolar I/II (mania: grandiosity, flight of ideas, decreased sleep; depression), lithium (therapeutic 0.6-1.2, toxicity), ECT nursing care
Anxiety: GAD, panic disorder, phobias (agoraphobia, social, specific), PTSD, OCD, levels of anxiety (mild/moderate/severe/panic), grounding, systematic desensitization, CBT
Personality: Cluster A (paranoid, schizoid, schizotypal), Cluster B (antisocial, borderline, histrionic, narcissistic), Cluster C (dependent, avoidant, OCPD)
Crisis: phases, crisis intervention, suicide precautions (1:1 observation, environmental safety), rape trauma syndrome
Substance: alcohol (intoxication, withdrawal — DTs, CIWA), opioids, cocaine/amphetamines, cannabis, hallucinogens, benzodiazepines — detox, AA/NA 12-step, relapse prevention
Psychopharmacology: antipsychotics (typical — haloperidol, chlorpromazine; atypical — clozapine, risperidone, olanzapine — side effects: EPS, tardive dyskinesia, NMS, agranulocytosis), antidepressants (SSRIs, SNRIs, TCAs, MAOIs — tyramine-free diet), mood stabilizers (lithium, valproate, lamotrigine), anxiolytics (benzodiazepines, buspirone), stimulants (methylphenidate for ADHD)
Child/adolescent: ADHD, autism, conduct disorder, ODD, separation anxiety, childhood depression, eating disorders (anorexia, bulimia)
Geriatric: delirium vs dementia, Alzheimer's (stages), vascular dementia, sundowning, wandering, reality orientation
Legal/ethical: RA 11036 (Mental Health Act), confidentiality, voluntary vs involuntary admission, seclusion/restraint guidelines, patient rights
    `.trim(),
  },
}

export const PNLE_SCRAPE_URLS: Record<string, string[]> = {
  "pnle-i": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-i-for-foundation-of-professional-nursing-practice/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-i-for-foundation-of-nursing/",
  ],
  "pnle-ii": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-ii-for-community-health-nursing-and-care-of-the-mother-and-child/",
  ],
  "pnle-iii": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-ii-for-maternal-and-child-health/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iii-for-care-of-clients-with-physiologic-and-psychosocial-alterations-part-1/",
  ],
  "pnle-iv": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iv-for-care-of-clients-with-physiologic-and-psychosocial-alterations-part-2/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iii-for-medical-surgical-nursing/",
  ],
  "pnle-v": [
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-v-for-care-of-clients-with-physiologic-and-psychosocial-alterations-part-3/",
    "https://www.rnpedia.com/practice-exams/philippine-nursing-licensure-exam-pnle/pnle-iv-for-psychiatric-nursing/",
  ],
}
