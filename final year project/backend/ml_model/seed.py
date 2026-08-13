import sys
import os
import pandas as pd
import numpy as np
import random

# Add parent directory to path since we're in ml_model directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db
from models.database import Symptom, Disease, User

SYMPTOMS = [
    { "id": 'fever', "label": '🌡️ Fever', "cat": 'general' }, { "id": 'fatigue', "label": '😴 Fatigue', "cat": 'general' },
    { "id": 'weakness', "label": '💪 Weakness', "cat": 'general' }, { "id": 'chills', "label": '🥶 Chills', "cat": 'general' },
    { "id": 'sweating', "label": '💦 Sweating', "cat": 'general' }, { "id": 'weight_loss', "label": '⚖️ Weight Loss', "cat": 'general' },
    { "id": 'night_sweats', "label": '🌙 Night Sweats', "cat": 'general' }, { "id": 'loss_appetite', "label": '🚫 Loss of Appetite', "cat": 'general' },
    { "id": 'joint_pain', "label": '🦵 Joint Pain', "cat": 'general' }, { "id": 'body_ache', "label": '💢 Body Ache', "cat": 'general' },
    { "id": 'back_pain', "label": '🪑 Back Pain', "cat": 'general' }, { "id": 'swollen_lymph', "label": '🔵 Swollen Lymph', "cat": 'general' },
    { "id": 'freq_urine', "label": '🚿 Frequent Urination', "cat": 'general' }, { "id": 'thirst', "label": '💧 Excessive Thirst', "cat": 'general' },
    { "id": 'muscle_cramp', "label": '⚡ Muscle Cramps', "cat": 'general' }, { "id": 'mild_fever', "label": '🌡️ Mild Fever', "cat": 'general' },
    { "id": 'cough', "label": '😷 Cough', "cat": 'respiratory' }, { "id": 'breathless', "label": '💨 Breathlessness', "cat": 'respiratory' },
    { "id": 'sore_throat', "label": '🤒 Sore Throat', "cat": 'respiratory' }, { "id": 'runny_nose', "label": '🤧 Runny Nose', "cat": 'respiratory' },
    { "id": 'chest_pain', "label": '❤️ Chest Pain', "cat": 'respiratory' }, { "id": 'wheezing', "label": '🫁 Wheezing', "cat": 'respiratory' },
    { "id": 'sneezing', "label": '🤧 Sneezing', "cat": 'respiratory' }, { "id": 'nasal_cong', "label": '😤 Nasal Congestion', "cat": 'respiratory' },
    { "id": 'throat_itch', "label": '😮 Throat Itch', "cat": 'respiratory' },
    { "id": 'nausea', "label": '🤢 Nausea', "cat": 'gastro' }, { "id": 'vomiting', "label": '🤮 Vomiting', "cat": 'gastro' },
    { "id": 'diarrhea', "label": '🚽 Diarrhea', "cat": 'gastro' }, { "id": 'abdominal', "label": '🫃 Abdominal Pain', "cat": 'gastro' },
    { "id": 'bloating', "label": '🎈 Bloating', "cat": 'gastro' }, { "id": 'constipation', "label": '🔒 Constipation', "cat": 'gastro' },
    { "id": 'jaundice', "label": '🟡 Jaundice', "cat": 'gastro' }, { "id": 'indigestion', "label": '🫃 Indigestion', "cat": 'gastro' },
    { "id": 'heartburn', "label": '🔥 Heartburn', "cat": 'gastro' }, { "id": 'mouth_sore', "label": '🦷 Mouth Sores', "cat": 'gastro' },
    { "id": 'headache', "label": '🤕 Headache', "cat": 'neuro' }, { "id": 'dizziness', "label": '😵 Dizziness', "cat": 'neuro' },
    { "id": 'confusion', "label": '😕 Confusion', "cat": 'neuro' }, { "id": 'neck_stiff', "label": '🦴 Neck Stiffness', "cat": 'neuro' },
    { "id": 'sensitivity', "label": '💡 Light Sensitivity', "cat": 'neuro' }, { "id": 'seizures', "label": '⚡ Seizures', "cat": 'neuro' },
    { "id": 'blur_vis', "label": '👁️ Blurred Vision', "cat": 'neuro' }, { "id": 'watery_eyes', "label": '👀 Watery Eyes', "cat": 'neuro' },
    { "id": 'eye_strain', "label": '👁️ Eye Strain', "cat": 'neuro' },
    { "id": 'rash', "label": '🔴 Skin Rash', "cat": 'skin' }, { "id": 'itching', "label": '🤌 Itching', "cat": 'skin' },
    { "id": 'blisters', "label": '💧 Blisters', "cat": 'skin' }, { "id": 'yellow_skin', "label": '🟡 Yellow Skin', "cat": 'skin' },
    { "id": 'pale_skin', "label": '⬜ Pale Skin', "cat": 'skin' }, { "id": 'dry_skin', "label": '🏜️ Dry Skin', "cat": 'skin' },
    { "id": 'peeling', "label": '🧻 Peeling Skin', "cat": 'skin' }, { "id": 'dandruff', "label": '❄️ Dandruff', "cat": 'skin' },
    { "id": 'eye_redness', "label": '🔴 Eye Redness', "cat": 'skin' }, { "id": 'cracked_lips', "label": '💋 Cracked Lips', "cat": 'skin' },
    { "id": 'hair_loss', "label": '💇 Hair Loss', "cat": 'skin' }
]

DISEASES = [
    {
        "name": 'Influenza (Flu)', "icon": '🤧', "sev": 'medium', "syms": ['fever', 'fatigue', 'body_ache', 'chills', 'headache', 'cough', 'sore_throat'], 
        "prec": ['Rest and stay hydrated', 'Take paracetamol for fever', 'Avoid contact with others', 'Consult a doctor if symptoms persist beyond 3 days'], 
        "doctor_advice": ['Fever above 103°F (39.4°C) that does not reduce', 'Difficulty breathing or shortness of breath', 'Symptoms that improve then return with fever and worsening cough', 'Persistent vomiting or dehydration'],
        "meds": ['Paracetamol (Calpol)', 'Oseltamivir (Tamiflu)', 'Ibuprofen', 'ORS / Electrolytes', 'Vitamin C', 'Nasal Decongestant']
    },
    {
        "name": 'Common Cold', "icon": '😤', "sev": 'low', "syms": ['runny_nose', 'sore_throat', 'cough', 'headache', 'fatigue', 'fever'], 
        "prec": ['Drink warm fluids', 'Take paracetamol', 'Steam inhalation helps', 'Vitamin C supplements', 'Resolves in 7–10 days'], 
        "doctor_advice": ['Fever above 101°F lasting more than 3 days', 'Severe headache or sinus pain', 'Earache or discharge from ears', 'Symptoms lasting more than 10 days without improvement'],
        "meds": ['Paracetamol', 'Cetirizine (Antihistamine)', 'Nasal Decongestant Spray', 'Throat Lozenges', 'Vitamin C', 'Steam Inhalation']
    },
    {
        "name": 'Dengue Fever', "icon": '🦟', "sev": 'high', "syms": ['fever', 'joint_pain', 'rash', 'headache', 'nausea', 'body_ache', 'fatigue'], 
        "prec": ['See a doctor immediately for blood platelet tests', 'Avoid aspirin/NSAIDs', 'Stay hydrated with ORS', 'Use mosquito repellent'], 
        "doctor_advice": ['Sudden severe headache or pain behind the eyes', 'Any sign of bleeding (nose, gums, skin bruising)', 'Persistent vomiting more than 3 times in 24 hours', 'Rapid drop in platelet count on blood test'],
        "meds": ['Paracetamol (avoid Aspirin/NSAIDs)', 'ORS / Oral Rehydration', 'Papaya Leaf Extract', 'IV Fluids (hospital)', 'Platelet Transfusion (if needed)']
    },
    {
        "name": 'Malaria', "icon": '🌡️', "sev": 'high', "syms": ['fever', 'chills', 'sweating', 'headache', 'fatigue', 'body_ache', 'nausea'], 
        "prec": ['Get a blood smear test urgently', 'Take prescribed antimalarials', 'Use mosquito nets and repellent', 'Complete full treatment course'], 
        "doctor_advice": ['High fever with shivering that comes in cycles', 'Severe headache, vomiting or jaundice', 'Confusion, drowsiness or seizures', 'Any symptoms after travel to a malaria-endemic region'],
        "meds": ['Chloroquine / Hydroxychloroquine', 'Artemisinin Combination Therapy (ACT)', 'Primaquine', 'Paracetamol (for fever)', 'ORS / Hydration', 'Quinine (severe cases)']
    },
    {
        "name": 'Typhoid Fever', "icon": '🦠', "sev": 'high', "syms": ['fever', 'headache', 'abdominal', 'weakness', 'loss_appetite', 'constipation', 'rash'], 
        "prec": ['Take prescribed antibiotics', 'Drink only purified water', 'Eat light digestible food', 'Maintain strict hygiene', 'Widal test recommended'], 
        "doctor_advice": ['Persistent fever lasting more than 5 days', 'Rose-coloured spots appearing on the abdomen', 'Severe abdominal pain or distension', 'Blood in stools or signs of internal bleeding'],
        "meds": ['Ciprofloxacin (Antibiotic)', 'Azithromycin', 'Ceftriaxone (IV)', 'Paracetamol (fever)', 'ORS / Hydration', 'Typhoid Vaccine (prevention)']
    },
    {
        "name": 'COVID-19', "icon": '😷', "sev": 'high', "syms": ['fever', 'cough', 'breathless', 'fatigue', 'body_ache', 'loss_appetite', 'headache'], 
        "prec": ['Isolate immediately', 'Get RT-PCR tested', 'Monitor oxygen levels', 'Stay hydrated', 'Seek emergency care if O2 falls below 95%'], 
        "doctor_advice": ['Oxygen saturation dropping below 95%', 'Severe chest pain or persistent pressure in the chest', 'Difficulty breathing or inability to complete sentences', 'Bluish tinge on lips or fingertips'],
        "meds": ['Paracetamol (fever & pain)', 'Dexamethasone (severe cases)', 'Remdesivir (antiviral)', 'Vitamin D & Zinc', 'ORS / Hydration', 'Pulse Oximeter monitoring']
    },
    {
        "name": 'Pneumonia', "icon": '🫁', "sev": 'high', "syms": ['cough', 'fever', 'breathless', 'chest_pain', 'fatigue', 'chills', 'wheezing'], 
        "prec": ['Seek immediate medical attention', 'Chest X-ray required', 'Take prescribed antibiotics', 'Rest completely', 'Hospitalisation may be needed'], 
        "doctor_advice": ['Breathing rate above 30 breaths per minute', 'Oxygen levels below 94% on pulse oximeter', 'Confusion or altered mental state', 'Coughing up rust-coloured or bloody mucus'],
        "meds": ['Amoxicillin (Antibiotic)', 'Azithromycin', 'Ceftriaxone (IV, hospital)', 'Paracetamol / Ibuprofen', 'Oxygen Therapy', 'Bronchodilators (if wheezing)']
    },
    {
        "name": 'Tuberculosis (TB)', "icon": '🫀', "sev": 'high', "syms": ['cough', 'night_sweats', 'weight_loss', 'fatigue', 'fever', 'chest_pain'], 
        "prec": ['Start DOTS therapy immediately', 'Complete full 6-month treatment', 'Isolate initially', 'Regular sputum tests', 'Nutritious diet essential'], 
        "doctor_advice": ['Persistent cough lasting more than 3 weeks', 'Coughing up blood or blood-streaked mucus', 'Unexplained weight loss of more than 5 kg', 'Drenching night sweats with evening fever'],
        "meds": ['Isoniazid (INH)', 'Rifampicin', 'Pyrazinamide', 'Ethambutol', 'Vitamin B6 (Pyridoxine)', 'DOTS Therapy (6 months)']
    },
    {
        "name": 'Asthma', "icon": '🌬️', "sev": 'medium', "syms": ['wheezing', 'breathless', 'cough', 'chest_pain', 'fatigue'], 
        "prec": ['Use prescribed inhaler', 'Identify and avoid triggers', 'Carry rescue inhaler always', 'Avoid dusty or polluted environments'], 
        "doctor_advice": ['Reliever inhaler not working after 10 puffs', 'Breathing difficulty that prevents speaking in full sentences', 'Blue or grey tinge on lips or fingernails', 'Asthma attack lasting more than 15–20 minutes'],
        "meds": ['Salbutamol Inhaler (Reliever)', 'Budesonide Inhaler (Preventer)', 'Montelukast', 'Prednisolone (severe attacks)', 'Ipratropium Bromide', 'Avoid Triggers']
    },
    {
        "name": 'Gastroenteritis', "icon": '🤮', "sev": 'medium', "syms": ['nausea', 'vomiting', 'diarrhea', 'abdominal', 'fatigue', 'fever'], 
        "prec": ['Stay hydrated with ORS', 'Eat BRAT diet', 'Avoid dairy and spicy food', 'See doctor if vomiting persists over 24 hours'], 
        "doctor_advice": ['Signs of severe dehydration: sunken eyes, no urination for 8+ hours', 'Blood or mucus in stools', 'Vomiting that prevents keeping any fluids down', 'Fever above 39°C (102°F)'],
        "meds": ['ORS (Oral Rehydration Salts)', 'Ondansetron (anti-nausea)', 'Metronidazole (bacterial)', 'Zinc Supplements', 'Probiotics (Lactobacillus)', 'BRAT Diet']
    },
    {
        "name": 'Hepatitis', "icon": '🟡', "sev": 'high', "syms": ['jaundice', 'yellow_skin', 'fatigue', 'abdominal', 'nausea', 'fever', 'loss_appetite'], 
        "prec": ['Liver function tests required', 'Avoid alcohol completely', 'Antiviral medication for Hep B/C', 'Regular liver checkups'], 
        "doctor_advice": ['Yellowing of the eyes and skin (jaundice)', 'Dark cola-coloured urine or pale chalky stools', 'Severe fatigue that prevents daily activity', 'Swelling or severe pain in the upper right abdomen'],
        "meds": ['Tenofovir / Entecavir (Hep B)', 'Sofosbuvir / Daclatasvir (Hep C)', 'Paracetamol (low dose only)', 'Vitamin K (if bleeding)', 'Lactulose (liver encephalopathy)', 'Avoid Alcohol completely']
    },
    {
        "name": 'Diabetes', "icon": '🩸', "sev": 'medium', "syms": ['freq_urine', 'thirst', 'blur_vis', 'fatigue', 'weight_loss', 'weakness'], 
        "prec": ['Monitor blood sugar daily', 'Follow diabetic diet', 'Exercise regularly', 'Take prescribed medication', 'Regular HbA1c checkups'], 
        "doctor_advice": ['Blood sugar consistently above 300 mg/dL', 'Signs of diabetic ketoacidosis', 'Non-healing wounds', 'Sudden blurring of vision'],
        "meds": ['Metformin (Type 2)', 'Insulin (Type 1 & severe Type 2)', 'Glipizide / Glibenclamide', 'Empagliflozin (SGLT2)', 'Vitamin D & B12', 'Blood Glucose Monitor']
    },
    {
        "name": 'Hypertension', "icon": '❤️', "sev": 'medium', "syms": ['headache', 'dizziness', 'chest_pain', 'blur_vis', 'fatigue', 'weakness'], 
        "prec": ['Monitor BP regularly', 'Reduce salt intake', 'Exercise 30 min daily', 'Avoid smoking', 'Take prescribed antihypertensives'], 
        "doctor_advice": ['Blood pressure reading above 180/120 mmHg', 'Sudden severe headache with vision changes', 'Chest pain, shortness of breath, or irregular heartbeat', 'Sudden weakness or numbness in the face, arm, or leg'],
        "meds": ['Amlodipine (Calcium Channel Blocker)', 'Lisinopril (ACE Inhibitor)', 'Losartan (ARB)', 'Atenolol (Beta Blocker)', 'Hydrochlorothiazide (Diuretic)', 'Low-Sodium Diet']
    },
    {
        "name": 'Meningitis', "icon": '🧠', "sev": 'high', "syms": ['fever', 'headache', 'neck_stiff', 'sensitivity', 'nausea', 'vomiting', 'seizures', 'confusion'], 
        "prec": ['EMERGENCY — Seek immediate care', 'Antibiotic treatment must start within hours', 'Life-threatening if untreated'], 
        "doctor_advice": ['Sudden severe headache unlike any experienced before', 'Stiff neck that prevents touching chin to chest', 'Rash that does not fade when a glass is pressed against it', 'Sensitivity to light and sound with high fever'],
        "meds": ['Benzylpenicillin (IV, emergency)', 'Ceftriaxone (IV antibiotic)', 'Dexamethasone (reduce inflammation)', 'Paracetamol (fever & pain)', 'IV Fluids', 'Diazepam (if seizures)']
    },
    {
        "name": 'Chickenpox', "icon": '🔴', "sev": 'low', "syms": ['fever', 'rash', 'itching', 'blisters', 'fatigue', 'loss_appetite', 'headache'], 
        "prec": ['Isolate for 7–10 days', 'Calamine lotion for itching', 'Avoid scratching', 'Take antihistamines', 'Keep skin clean'], 
        "doctor_advice": ['Blisters spreading to eyes, mouth, or genitals', 'Signs of bacterial skin infection: increasing redness and pus', 'Severe headache, stiff neck, or confusion', 'Blisters in an adult who has never had chickenpox before'],
        "meds": ['Calamine Lotion (itching)', 'Cetirizine / Chlorphenamine (antihistamine)', 'Paracetamol (fever, avoid Aspirin)', 'Acyclovir (antiviral, early stage)', 'Trimethoprim (if skin infection)', 'Varicella Vaccine (prevention)']
    },
    {
        "name": 'Migraine', "icon": '🤯', "sev": 'medium', "syms": ['headache', 'nausea', 'sensitivity', 'blur_vis', 'dizziness', 'fatigue'], 
        "prec": ['Rest in a dark quiet room', 'Take prescribed triptans', 'Cold compress on forehead', 'Identify and avoid triggers'], 
        "doctor_advice": ['Sudden worst headache of your life (thunderclap headache)', 'Headache with fever, stiff neck, rash, confusion, or vision loss', 'New severe headache after age 50 or after a head injury', 'Migraine lasting more than 72 hours continuously'],
        "meds": ['Sumatriptan (Triptan)', 'Ibuprofen / Naproxen', 'Paracetamol + Caffeine (Migraleve)', 'Metoclopramide (anti-nausea)', 'Propranolol (prevention)', 'Topiramate (prevention)']
    },
    {
        "name": 'UTI', "icon": '🚿', "sev": 'medium', "syms": ['freq_urine', 'abdominal', 'fever', 'fatigue', 'back_pain', 'weakness'], 
        "prec": ['Complete prescribed antibiotic course', 'Drink 3+ litres of water daily', 'Avoid caffeine', 'Urine culture test recommended'], 
        "doctor_advice": ['Fever above 38.5°C with back or flank pain (kidney infection)', 'Blood visible in the urine', 'Symptoms not improving after 2 days of antibiotic treatment', 'Third UTI or more within 12 months (recurrent UTI evaluation needed)'],
        "meds": ['Nitrofurantoin (antibiotic)', 'Trimethoprim', 'Ciprofloxacin (if resistant)', 'Phenazopyridine (pain relief)', 'Cranberry Extract', 'ORS / High Fluid Intake']
    },
    {
        "name": 'Anaemia', "icon": '🩸', "sev": 'medium', "syms": ['fatigue', 'weakness', 'pale_skin', 'dizziness', 'breathless', 'headache', 'blur_vis'], 
        "prec": ['Iron-rich diet (spinach, lentils)', 'Iron and folic acid supplements', 'Complete blood count test', 'Treat underlying cause'], 
        "doctor_advice": ['Extreme fatigue making it impossible to carry out daily tasks', 'Rapid or irregular heartbeat while resting', 'Chest pain, shortness of breath, or fainting spells', 'Haemoglobin level below 8 g/dL on blood test'],
        "meds": ['Ferrous Sulphate (Iron supplement)', 'Folic Acid', 'Vitamin B12 injection', 'Vitamin C (aids iron absorption)', 'Erythropoietin (severe anaemia)', 'Iron-rich Diet (spinach, lentils)']
    },
    {
        "name": 'Arthritis', "icon": '🦴', "sev": 'medium', "syms": ['joint_pain', 'swollen_lymph', 'fatigue', 'weakness', 'back_pain', 'fever'], 
        "prec": ['Physiotherapy and gentle exercise', 'Anti-inflammatory medication', 'Hot/cold therapy', 'Regular rheumatology checkups'], 
        "doctor_advice": ['Joint swelling, warmth, and redness that does not improve', 'Morning stiffness lasting more than 1 hour daily', 'Joints becoming visibly deformed or losing range of motion', 'Systemic symptoms: fatigue, fever, weight loss alongside joint pain'],
        "meds": ['Ibuprofen / Naproxen (NSAID)', 'Methotrexate (RA)', 'Hydroxychloroquine (RA)', 'Prednisolone (flare-ups)', 'Calcium + Vitamin D', 'Physiotherapy']
    },
    {
        "name": 'Malnutrition', "icon": '⚖️', "sev": 'medium', "syms": ['weight_loss', 'fatigue', 'weakness', 'pale_skin', 'swollen_lymph', 'loss_appetite'], 
        "prec": ['Balanced nutrient-rich diet', 'Protein and vitamin supplements', 'Gradual refeeding program', 'Dietitian consultation'], 
        "doctor_advice": ['Significant unintentional weight loss over a short period', 'Swelling (oedema) in the legs, feet, or abdomen', 'Child not growing or gaining weight as expected', 'Extreme weakness, hair loss, and skin changes occurring together'],
        "meds": ['Multivitamin Supplement', 'Protein Supplement (Whey / PEM formula)', 'Zinc Supplement', 'Iron + Folic Acid', 'Ready-to-Use Therapeutic Food (RUTF)', 'Vitamin A (if deficient)']
    },
    {
        "name": 'Seasonal Allergies', "icon": '🌸', "sev": 'low', "syms": ['sneezing', 'runny_nose', 'watery_eyes', 'itching', 'nasal_cong', 'throat_itch', 'eye_redness'], 
        "prec": ['Avoid known allergens', 'Take antihistamines (cetirizine)', 'Use nasal sprays if needed', 'Stay indoors during high pollen seasons'], 
        "doctor_advice": ['Wheezing or difficulty breathing along with allergy symptoms', 'Symptoms not improving with over-the-counter antihistamines', 'Severe swelling of the face, lips, or throat (anaphylaxis risk)', 'Recurring sinus infections triggered by allergies'],
        "meds": ['Cetirizine (Antihistamine)', 'Loratadine / Fexofenadine', 'Fluticasone Nasal Spray', 'Montelukast (Singulair)', 'Azelastine Eye Drops', 'Epinephrine (anaphylaxis emergency)']
    },
    {
        "name": 'Mouth Ulcers', "icon": '🦷', "sev": 'low', "syms": ['mouth_sore', 'fatigue', 'loss_appetite', 'mild_fever'], 
        "prec": ['Use antiseptic mouthwash', 'Apply topical gels (Bonjela)', 'Eat soft, non-spicy food', 'Avoid acidic drinks', 'Ulcers usually heal in 1–2 weeks'], 
        "doctor_advice": ['Ulcers larger than 1 cm that do not heal after 3 weeks', 'Multiple ulcers appearing at the same time repeatedly', 'Ulcers accompanied by high fever or skin rash', 'Difficulty swallowing or speaking due to ulcer pain'],
        "meds": ['Bonjela Gel (topical)', 'Benzydamine Mouthwash', 'Triamcinolone Paste (steroid)', 'Vitamin B12 Supplement', 'Zinc Lozenges', 'Chlorhexidine Mouthwash']
    },
    {
        "name": 'Dehydration', "icon": '💧', "sev": 'low', "syms": ['thirst', 'fatigue', 'dizziness', 'headache', 'weakness', 'cracked_lips'], 
        "prec": ['Drink 8–10 glasses of water daily', 'Have ORS or electrolyte drinks', 'Avoid caffeine and alcohol', 'Rest in a cool environment'], 
        "doctor_advice": ['No urination for more than 8 hours', 'Sunken eyes, dry mouth, and extreme thirst', 'Rapid heartbeat or rapid breathing', 'Confusion, dizziness, or fainting'],
        "meds": ['ORS (Oral Rehydration Salts)', 'Electrolyte Sachets (Dioralyte)', 'Coconut Water', 'IV Normal Saline (severe)', 'Potassium Chloride (if low K+)', 'Pedialyte (children)']
    },
    {
        "name": 'Indigestion', "icon": '🫃', "sev": 'low', "syms": ['indigestion', 'heartburn', 'bloating', 'nausea', 'abdominal'], 
        "prec": ['Eat smaller, frequent meals', 'Avoid fatty and spicy foods', 'Do not lie down right after eating', 'Antacids can provide quick relief'], 
        "doctor_advice": ['Heartburn more than twice a week for several weeks', 'Difficulty or pain when swallowing food', 'Vomiting blood or passing black tarry stools', 'Unexplained weight loss alongside digestive symptoms'],
        "meds": ['Antacid (Gaviscon / Eno)', 'Omeprazole (PPI)', 'Ranitidine / Famotidine (H2 blocker)', 'Metoclopramide (motility)', 'Simethicone (gas / bloating)', 'Domperidone']
    },
    {
        "name": 'Vitamin Deficiency', "icon": '🥦', "sev": 'low', "syms": ['fatigue', 'weakness', 'pale_skin', 'cracked_lips', 'muscle_cramp', 'hair_loss', 'dry_skin'], 
        "prec": ['Eat a balanced diet rich in fruits and vegetables', 'Take a multivitamin supplement', 'Get 15–20 min of sunlight for Vitamin D', 'Blood test to identify specific deficiency'], 
        "doctor_advice": ['Extreme fatigue that does not improve with rest', 'Numbness or tingling in hands and feet', 'Bone pain or muscle weakness', 'Hair falling out in patches or brittle nails'],
        "meds": ['Vitamin D3 Supplement', 'Vitamin B12 (Methylcobalamin)', 'Folic Acid', 'Iron (Ferrous Sulphate)', 'Multivitamin Tablet', 'Calcium + Magnesium']
    },
    {
        "name": 'Eye Strain', "icon": '👁️', "sev": 'low', "syms": ['eye_strain', 'headache', 'blur_vis', 'eye_redness', 'fatigue', 'dizziness'], 
        "prec": ['Follow the 20-20-20 rule', 'Reduce screen brightness', 'Use lubricating eye drops', 'Ensure proper lighting while reading'], 
        "doctor_advice": ['Headaches that persist even after resting from screens', 'Double or blurred vision that does not clear up', 'Eye pain or seeing flashes of light or floaters', 'No improvement after reducing screen time for 1 week'],
        "meds": ['Lubricating Eye Drops (Refresh / Systane)', 'Carboxymethylcellulose Drops', 'Blue-light Blocking Glasses', 'Vitamin A Supplement', 'Omega-3 Fatty Acids']
    },
    {
        "name": 'Dandruff', "icon": '❄️', "sev": 'low', "syms": ['dandruff', 'itching', 'dry_skin', 'peeling'], 
        "prec": ['Use an anti-dandruff shampoo', 'Avoid oily hair products', 'Manage stress levels', 'Stay hydrated'], 
        "doctor_advice": ['Scalp becoming red, inflamed, or very itchy', 'Dandruff spreading to eyebrows, nose, or ears', 'Large greasy yellow flakes with skin irritation', 'No improvement after 4 weeks of using anti-dandruff shampoo'],
        "meds": ['Ketoconazole Shampoo (Nizoral)', 'Zinc Pyrithione Shampoo (Head & Shoulders)', 'Selenium Sulphide Shampoo', 'Coal Tar Shampoo', 'Salicylic Acid Shampoo', 'Tea Tree Oil (diluted)']
    },
    {
        "name": 'Heat Exhaustion', "icon": '☀️', "sev": 'low', "syms": ['fatigue', 'weakness', 'headache', 'nausea', 'sweating', 'dizziness', 'muscle_cramp'], 
        "prec": ['Move to a cool shaded area immediately', 'Drink cool water or sports drinks', 'Apply cold wet cloth to neck and forehead', 'Rest completely'], 
        "doctor_advice": ['Skin becomes hot, dry, and you stop sweating (heat stroke warning)', 'Body temperature rises above 40°C (104°F)', 'Confusion, loss of consciousness, or seizures', 'Symptoms do not improve after 30 minutes of cooling measures'],
        "meds": ['ORS / Electrolyte Drinks', 'Sports Drinks (Gatorade)', 'IV Normal Saline (hospital)', 'Paracetamol (fever if present)', 'Cool Water / Ice Packs (first aid)', 'Potassium Supplement']
    },
    {
        "name": 'Insomnia', "icon": '🌙', "sev": 'low', "syms": ['fatigue', 'headache', 'weakness', 'eye_strain', 'confusion'], 
        "prec": ['Maintain a consistent sleep schedule', 'Avoid screens 1 hour before bed', 'Reduce caffeine intake', 'Practice relaxation techniques'], 
        "doctor_advice": ['Unable to sleep despite being exhausted for more than 3 weeks', 'Sleeplessness causing serious impact on daily work or mood', 'Sleep problems accompanied by chest pain or breathing difficulty', 'Dependence on sleeping pills or alcohol to fall asleep'],
        "meds": ['Melatonin (sleep hormone)', 'Diphenhydramine (Nytol)', 'Zolpidem (short-term, prescription)', 'Chamomile Tea / Valerian Root', 'Magnesium Glycinate', 'Cognitive Behavioural Therapy (CBT-I)']
    }
]

def seed_database():
    print("Seeding database using SQLAlchemy...")
    with app.app_context():
        # Clear existing
        db.session.query(Symptom).delete()
        db.session.query(Disease).delete()
        
        # 1. Seed Symptoms
        for sym_data in SYMPTOMS:
            symItem = Symptom(id=sym_data['id'], label=sym_data['label'], cat=sym_data['cat'])
            db.session.add(symItem)
            
        # 2. Seed Diseases
        for dis_data in DISEASES:
            disItem = Disease(
                name=dis_data['name'], 
                icon=dis_data['icon'], 
                severity=dis_data['sev'], 
                syms=dis_data['syms'], 
                prec=dis_data['prec'], 
                doctor_advice=dis_data['doctor_advice'], 
                meds=dis_data['meds']
            )
            db.session.add(disItem)
            
        db.session.commit()
        print(f"Inserted {len(SYMPTOMS)} symptoms and {len(DISEASES)} diseases to SQLite.")

def generate_dataset():
    print("Generating synthetic dataset mapping symptoms to diseases...")
    
    records = []
    
    # Extract list of all symptom ids
    symp_ids = [s['id'] for s in SYMPTOMS]
    
    # Number of samples we want per disease
    SAMPLES_PER_DISEASE = 50
    
    for disease in DISEASES:
        # Base symptoms defined for this disease
        base_syms = disease['syms']
        
        for _ in range(SAMPLES_PER_DISEASE):
            row = {symp: 0 for symp in symp_ids}
            
            # The synthetic patient must have at least majority of the base symptoms
            num_base_to_pick = random.randint(max(1, len(base_syms)-2), len(base_syms))
            chosen_base = random.sample(base_syms, num_base_to_pick)
            for s in chosen_base:
                if s in row:
                    row[s] = 1
            
            # They might have 0-2 random noise symptoms
            noise_syms = random.sample(symp_ids, random.randint(0, 2))
            for s in noise_syms:
                if s in row:
                    row[s] = 1
            
            row['disease'] = disease['name']
            records.append(row)
            
    df = pd.DataFrame(records)
    csv_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
    df.to_csv(csv_path, index=False)
    print(f"Dataset generated at {csv_path} with {len(records)} records.")

if __name__ == '__main__':
    seed_database()
    generate_dataset()
    print("Done!")
