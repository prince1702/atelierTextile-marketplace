// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const SYMPTOMS = [
    { id: 'fever', label: '🌡️ Fever', cat: 'general' }, { id: 'fatigue', label: '😴 Fatigue', cat: 'general' },
    { id: 'weakness', label: '💪 Weakness', cat: 'general' }, { id: 'chills', label: '🥶 Chills', cat: 'general' },
    { id: 'sweating', label: '💦 Sweating', cat: 'general' }, { id: 'weight_loss', label: '⚖️ Weight Loss', cat: 'general' },
    { id: 'night_sweats', label: '🌙 Night Sweats', cat: 'general' }, { id: 'loss_appetite', label: '🚫 Loss of Appetite', cat: 'general' },
    { id: 'joint_pain', label: '🦵 Joint Pain', cat: 'general' }, { id: 'body_ache', label: '💢 Body Ache', cat: 'general' },
    { id: 'back_pain', label: '🪑 Back Pain', cat: 'general' }, { id: 'swollen_lymph', label: '🔵 Swollen Lymph', cat: 'general' },
    { id: 'freq_urine', label: '🚿 Frequent Urination', cat: 'general' }, { id: 'thirst', label: '💧 Excessive Thirst', cat: 'general' },
    { id: 'muscle_cramp', label: '⚡ Muscle Cramps', cat: 'general' }, { id: 'mild_fever', label: '🌡️ Mild Fever', cat: 'general' },
    { id: 'cough', label: '😷 Cough', cat: 'respiratory' }, { id: 'breathless', label: '💨 Breathlessness', cat: 'respiratory' },
    { id: 'sore_throat', label: '🤒 Sore Throat', cat: 'respiratory' }, { id: 'runny_nose', label: '🤧 Runny Nose', cat: 'respiratory' },
    { id: 'chest_pain', label: '❤️ Chest Pain', cat: 'respiratory' }, { id: 'wheezing', label: '🫁 Wheezing', cat: 'respiratory' },
    { id: 'sneezing', label: '🤧 Sneezing', cat: 'respiratory' }, { id: 'nasal_cong', label: '😤 Nasal Congestion', cat: 'respiratory' },
    { id: 'throat_itch', label: '😮 Throat Itch', cat: 'respiratory' },
    { id: 'nausea', label: '🤢 Nausea', cat: 'gastro' }, { id: 'vomiting', label: '🤮 Vomiting', cat: 'gastro' },
    { id: 'diarrhea', label: '🚽 Diarrhea', cat: 'gastro' }, { id: 'abdominal', label: '🫃 Abdominal Pain', cat: 'gastro' },
    { id: 'bloating', label: '🎈 Bloating', cat: 'gastro' }, { id: 'constipation', label: '🔒 Constipation', cat: 'gastro' },
    { id: 'jaundice', label: '🟡 Jaundice', cat: 'gastro' }, { id: 'indigestion', label: '🫃 Indigestion', cat: 'gastro' },
    { id: 'heartburn', label: '🔥 Heartburn', cat: 'gastro' }, { id: 'mouth_sore', label: '🦷 Mouth Sores', cat: 'gastro' },
    { id: 'headache', label: '🤕 Headache', cat: 'neuro' }, { id: 'dizziness', label: '😵 Dizziness', cat: 'neuro' },
    { id: 'confusion', label: '😕 Confusion', cat: 'neuro' }, { id: 'neck_stiff', label: '🦴 Neck Stiffness', cat: 'neuro' },
    { id: 'sensitivity', label: '💡 Light Sensitivity', cat: 'neuro' }, { id: 'seizures', label: '⚡ Seizures', cat: 'neuro' },
    { id: 'blur_vis', label: '👁️ Blurred Vision', cat: 'neuro' }, { id: 'watery_eyes', label: '👀 Watery Eyes', cat: 'neuro' },
    { id: 'eye_strain', label: '👁️ Eye Strain', cat: 'neuro' },
    { id: 'rash', label: '🔴 Skin Rash', cat: 'skin' }, { id: 'itching', label: '🤌 Itching', cat: 'skin' },
    { id: 'blisters', label: '💧 Blisters', cat: 'skin' }, { id: 'yellow_skin', label: '🟡 Yellow Skin', cat: 'skin' },
    { id: 'pale_skin', label: '⬜ Pale Skin', cat: 'skin' }, { id: 'dry_skin', label: '🏜️ Dry Skin', cat: 'skin' },
    { id: 'peeling', label: '🧻 Peeling Skin', cat: 'skin' }, { id: 'dandruff', label: '❄️ Dandruff', cat: 'skin' },
    { id: 'eye_redness', label: '🔴 Eye Redness', cat: 'skin' }, { id: 'cracked_lips', label: '💋 Cracked Lips', cat: 'skin' },
    { id: 'hair_loss', label: '💇 Hair Loss', cat: 'skin' }
];

// Configuration
const API_BASE = 'http://localhost:5000/api';

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let currentUser = null;
let authToken = null;
let predHistory = [];
const selected = new Map(); // id -> severity weight: 1=low, 1.5=med, 2=high
let fetchedDiseases = [];

// Handle on mount
document.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('mp_token');
    const savedUser = localStorage.getItem('mp_user');

    if (savedToken && savedUser) {
        authToken = savedToken;
        loginOK(JSON.parse(savedUser));
    }
});

// ═══════════════════════════════════════════
// PAGE ROUTING
// ═══════════════════════════════════════════
function goPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(name + 'Page').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('anav'));
    const nb = document.getElementById('nav-' + name);
    if (nb) nb.classList.add('anav');
}

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
document.getElementById('tabLogin').addEventListener('click', () => {
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabReg').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('regForm').classList.remove('active');
});
document.getElementById('tabReg').addEventListener('click', () => {
    document.getElementById('tabReg').classList.add('active');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('regForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
});

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('lPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

document.getElementById('regBtn').addEventListener('click', doRegister);
document.getElementById('rPass').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

function showErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }

async function doLogin() {
    const email = document.getElementById('lEmail').value.trim();
    const pass = document.getElementById('lPass').value;
    const err = document.getElementById('loginErr');
    const btn = document.getElementById('loginBtn');
    
    err.style.display = 'none';
    if (!email || !pass) { showErr(err, 'Please fill in all fields.'); return; }
    
    btn.textContent = "Checking...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Login failed');
        
        const payload = data.data || data;
        authToken = payload.token;
        localStorage.setItem('mp_token', authToken);
        localStorage.setItem('mp_user', JSON.stringify(payload.user));
        
        loginOK(payload.user);
    } catch (error) {
        showErr(err, error.message);
    } finally {
        btn.textContent = "Sign In →";
        btn.disabled = false;
    }
}

async function doRegister() {
    const first = document.getElementById('rFirst').value.trim();
    const last = document.getElementById('rLast').value.trim();
    const email = document.getElementById('rEmail').value.trim();
    const age = document.getElementById('rAge').value;
    const pass = document.getElementById('rPass').value;
    const err = document.getElementById('regErr');
    const btn = document.getElementById('regBtn');
    
    err.style.display = 'none';
    if (!first || !last || !email || !age || !pass) { showErr(err, 'Please fill in all fields.'); return; }
    if (pass.length < 6) { showErr(err, 'Password must be at least 6 characters.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { showErr(err, 'Please enter a valid email.'); return; }

    btn.textContent = "Creating...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName: first, lastName: last, email, age, password: pass })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Registration failed');
        
        const payload = data.data || data;
        authToken = payload.token;
        localStorage.setItem('mp_token', authToken);
        localStorage.setItem('mp_user', JSON.stringify(payload.user));
        
        loginOK(payload.user);
    } catch (error) {
        showErr(err, error.message);
    } finally {
        btn.textContent = "Create Account →";
        btn.disabled = false;
    }
}

function loginOK(user) {
    currentUser = user;
    document.getElementById('authPage').classList.add('hide');
    setTimeout(() => document.getElementById('authPage').style.display = 'none', 450);
    document.getElementById('topnav').style.display = 'flex';
    document.getElementById('uAvatar').textContent = user.firstName.charAt(0).toUpperCase();
    document.getElementById('uName').textContent = user.firstName;
    
    renderSymGrid('all');
    fetchDiseases();
    fetchHistory();
    goPage('home');
    showToast('Welcome, ' + user.firstName + '! 👋');
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null; 
    authToken = null;
    predHistory = []; 
    selected.clear();
    fetchedDiseases = [];
    localStorage.removeItem('mp_token');
    localStorage.removeItem('mp_user');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('topnav').style.display = 'none';
    const ap = document.getElementById('authPage');
    ap.style.display = 'flex'; ap.classList.remove('hide');
    document.getElementById('lEmail').value = '';
    document.getElementById('lPass').value = '';
    showToast('Logged out successfully.');
});

// ═══════════════════════════════════════════
// DATA FETCHING
// ═══════════════════════════════════════════
async function fetchDiseases() {
    try {
        const resp = await fetch(`${API_BASE}/diseases`);
        if(resp.ok) {
            const data = await resp.json();
            const payload = data.data || data;
            fetchedDiseases = payload.diseases || payload;
            renderDisGrid(fetchedDiseases);
        }
    } catch(err) {
        console.error("Error fetching diseases:", err);
    }
}

async function fetchHistory() {
    if (!authToken || !currentUser) return;
    try {
        const resp = await fetch(`${API_BASE}/history/${currentUser.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if(resp.ok) {
            const data = await resp.json();
            const payload = data.data || data;
            const historyList = payload.history || payload;
            predHistory = (historyList || []).map(item => {
                const disName = typeof item.predictedDisease === 'object' && item.predictedDisease !== null
                    ? (item.predictedDisease.name || 'Prediction')
                    : (item.predictedDisease || 'Prediction');
                return {
                    dis: disName,
                    time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'
                };
            });
            renderHistory();
        }
    } catch(err) {
        console.error("Error fetching history:", err);
    }
}

// ═══════════════════════════════════════════
// NAV BUTTONS
// ═══════════════════════════════════════════
document.getElementById('navLogo').addEventListener('click', () => goPage('home'));
document.getElementById('nav-home').addEventListener('click', () => goPage('home'));
document.getElementById('nav-checker').addEventListener('click', () => goPage('checker'));
document.getElementById('nav-diseases').addEventListener('click', () => goPage('diseases'));
document.getElementById('heroCheckerBtn').addEventListener('click', () => goPage('checker'));
document.getElementById('heroDisBtn').addEventListener('click', () => goPage('diseases'));
document.getElementById('fc1').addEventListener('click', () => goPage('checker'));
document.getElementById('fc2').addEventListener('click', () => goPage('diseases'));
document.getElementById('fc3').addEventListener('click', () => goPage('checker'));
document.getElementById('detailBackBtn').addEventListener('click', () => goPage('diseases'));
document.getElementById('detailCheckerBtn').addEventListener('click', () => goPage('checker'));

// ═══════════════════════════════════════════
// DARK MODE
// ═══════════════════════════════════════════
const dmToggle = document.getElementById('dmToggle');
const dmIcon = document.getElementById('dmIcon');
const dmLabel = document.getElementById('dmLabel');

function applyDarkMode(on) {
    document.body.classList.toggle('dark-mode', on);
    dmIcon.textContent = on ? '☀️' : '🌙';
    dmLabel.textContent = on ? 'Light' : 'Dark';
    localStorage.setItem('mp_darkmode', on ? '1' : '0');
}

dmToggle.addEventListener('click', () => {
    applyDarkMode(!document.body.classList.contains('dark-mode'));
});

if (localStorage.getItem('mp_darkmode') === '1') applyDarkMode(true);

// ═══════════════════════════════════════════
// SYMPTOM CHECKER
// ═══════════════════════════════════════════
let currentCat = 'all';

function highlight(text, query) {
    if (!query) return text;
    const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + esc + ')', 'gi'), '<mark>$1</mark>');
}

function renderSymGrid(cat, searchQuery) {
    if (cat !== undefined) currentCat = cat;
    const query = (searchQuery !== undefined ? searchQuery : document.getElementById('symSearch').value).trim().toLowerCase();
    const grid = document.getElementById('symGrid');

    let list = currentCat === 'all' ? [...SYMPTOMS] : SYMPTOMS.filter(s => s.cat === currentCat);
    if (query) list = SYMPTOMS.filter(s => s.label.toLowerCase().includes(query));

    if (list.length === 0) {
        grid.innerHTML = '<div class="search-empty" style="grid-column:1/-1"><span>\u{1F50D}</span>No symptoms match \"' + query + '\"<br/><small style="opacity:.6">Try a shorter word like \"fever\" or \"pain\"</small></div>';
        return;
    }

    grid.innerHTML = list.map(s => {
        const lbl = query ? highlight(s.label, query) : s.label;
        return '<button role="listitem" class="sym-chip ' + (selected.has(s.id) ? 'active' : '') + '" data-id="' + s.id + '">' + lbl + '</button>';
    }).join('');

    grid.querySelectorAll('.sym-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const id = chip.dataset.id;
            if (selected.has(id)) {
                selected.delete(id);
                chip.classList.remove('active');
            } else {
                selected.set(id, 1);
                chip.classList.add('active');
            }
            document.getElementById('selCount').textContent = selected.size;
            renderSevPanel();
        });
    });
}

function renderSevPanel() {
    const panel = document.getElementById('sevPanel');
    const rows = document.getElementById('sevRows');
    if (!panel || !rows) return;
    if (selected.size === 0) { panel.classList.remove('show'); rows.innerHTML = ''; return; }
    panel.classList.add('show');

    const wLabel = { 1: 'Low ×1.0', 1.5: 'Med ×1.5', 2: 'High ×2.0' };
    rows.innerHTML = [...selected.keys()].map(id => {
        const sym = SYMPTOMS.find(s => s.id === id);
        if (!sym) return '';
        const cur = selected.get(id);
        const emoji = sym.label.split(' ')[0];
        const name = sym.label.split(' ').slice(1).join(' ');
        return `<div class="sev-row" data-symid="${id}">
<div class="sev-row-label"><span class="sym-emoji">${emoji}</span>${name}</div>
<div class="sev-btns">
<button class="sev-btn low  ${cur === 1 ? 'active' : ''}" data-w="1">🟢 Low</button>
<button class="sev-btn med  ${cur === 1.5 ? 'active' : ''}" data-w="1.5">🟡 Medium</button>
<button class="sev-btn high ${cur === 2 ? 'active' : ''}" data-w="2">🔴 High</button>
</div>
<div class="sev-weight-badge" id="wb-${id}">${wLabel[cur]}</div>
</div>`;
    }).join('');

    rows.querySelectorAll('.sev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.sev-row');
            const symid = row.dataset.symid;
            const w = parseFloat(btn.dataset.w);
            selected.set(symid, w);
            row.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const wb = document.getElementById('wb-' + symid);
            if (wb) wb.textContent = wLabel[w];
        });
    });
}

document.getElementById('symSearch').addEventListener('input', function () {
    const q = this.value.trim();
    document.getElementById('symSearchClear').classList.toggle('show', q.length > 0);
    const tabs = document.getElementById('catTabsRow');
    tabs.style.opacity = q ? '0.4' : '1';
    tabs.style.pointerEvents = q ? 'none' : 'auto';
    renderSymGrid(undefined, q.toLowerCase());
});

document.getElementById('symSearchClear').addEventListener('click', () => {
    document.getElementById('symSearch').value = '';
    document.getElementById('symSearchClear').classList.remove('show');
    const tabs = document.getElementById('catTabsRow');
    tabs.style.opacity = '1';
    tabs.style.pointerEvents = 'auto';
    renderSymGrid(currentCat, '');
    document.getElementById('symSearch').focus();
});

document.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('symSearch').value = '';
        document.getElementById('symSearchClear').classList.remove('show');
        document.getElementById('catTabsRow').style.opacity = '1';
        document.getElementById('catTabsRow').style.pointerEvents = 'auto';
        renderSymGrid(btn.dataset.cat, '');
    });
});

document.getElementById('predictBtn').addEventListener('click', doPredict);
document.getElementById('clearBtn').addEventListener('click', () => {
    selected.clear();
    document.querySelectorAll('.sym-chip').forEach(c => c.classList.remove('active'));
    document.getElementById('selCount').textContent = 0;
    document.getElementById('resultBox').classList.remove('show');
    document.getElementById('sevPanel').classList.remove('show');
    document.getElementById('sevRows').innerHTML = '';
});

async function doPredict() {
    if (!selected.size) { showToast('⚠️ Please select at least one symptom.'); return; }

    const reqSymptoms = Array.from(selected.entries()).map(([id, weight]) => ({ id, weight }));
    const btn = document.getElementById('predictBtn');
    btn.innerHTML = `<span>⏳ Predicting...</span>`;
    btn.style.pointerEvents = 'none';

    try {
        const resp = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ symptoms: reqSymptoms })
        });

        const data = await resp.json();
        if(!resp.ok) throw new Error(data.message || data.error || 'Prediction failed');

        const payload = data.data || data;
        const best = payload.predictedDisease;
        const conf = payload.confidence;
        const displaySev = payload.severity;

        const sevCls = { low: 'sev-low', medium: 'sev-med', high: 'sev-high' }[displaySev];
        const sevLbl = { low: '🟢 Low Severity', medium: '🟡 Medium Severity', high: '🔴 High Severity — See Doctor' }[displaySev];

        const avgWeight = [...selected.values()].reduce((a, b) => a + b, 0) / selected.size;
        const highSevSyms = [...selected.entries()].filter(([, w]) => w === 2).map(([id]) => {
            const s = SYMPTOMS.find(x => x.id === id);
            return s ? s.label.split(' ').slice(1).join(' ') : id;
        });

        document.getElementById('resDis').textContent = best.icon + ' ' + best.name;
        document.getElementById('resSev').innerHTML = `<div class="res-sev ${sevCls}">${sevLbl}</div>`;
        document.getElementById('resConf').textContent =
            `Confidence: ${conf}% · ${selected.size} symptom(s) · Avg severity: ${avgWeight === 1 ? 'Low' : avgWeight === 2 ? 'High' : 'Medium'}`;
        document.getElementById('resPrec').innerHTML =
            (highSevSyms.length ? `<div style="background:rgba(192,57,43,.18);border:1px solid rgba(192,57,43,.35);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:.8rem;color:#f9a8a1;"><strong>⚠️ High severity noted:</strong> ${highSevSyms.join(', ')}. Please seek medical attention promptly.</div>` : '') +
            `<strong style="color:rgba(242, 250, 247,.9)">Precautions:</strong><br/>${best.prec}`;

        const medsList = best.meds || ['Paracetamol', 'ORS / Hydration', 'Rest', 'Consult a doctor'];
        document.getElementById('resMeds').innerHTML = `
<div class="med-box">
  <div class="med-box-title">💉 Suggested Medicines</div>
  <div class="med-list">${medsList.map(m => `<span class="med-pill">💊 ${m}</span>`).join('')}</div>
  <div class="med-disclaimer">⚠️ General suggestions only. Always consult a qualified doctor before taking any medication.</div>
</div>`;
        document.getElementById('resultBox').classList.add('show');

        // Save prediction automatically
        await fetch(`${API_BASE}/save-prediction`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                symptoms: reqSymptoms.map(s => s.id), 
                predictedDisease: best, 
                confidence: conf,
                severity: displaySev
            })
        });

        fetchHistory();
        showToast('Predicted: ' + best.name);

    } catch (err) {
        showToast('Error: ' + err.message);
    } finally {
        btn.innerHTML = `🔍 Predict Disease`;
        btn.style.pointerEvents = 'auto';
    }
}

function renderHistory() {
    const el = document.getElementById('histList');
    if (!predHistory.length) { el.innerHTML = '<div class="no-hist">No predictions yet</div>'; return; }
    el.innerHTML = predHistory.slice(0,5).map(h =>
        `<div class="h-item"><span class="h-dis">${h.dis}</span><span class="h-time">${h.time}</span></div>`
    ).join('');
}

// ═══════════════════════════════════════════
// DISEASES PAGE
// ═══════════════════════════════════════════
function renderDisGrid(list) {
    const dc = { low: 'dot-low', medium: 'dot-med', high: 'dot-high' };
    const bc = { low: 'badge-low', medium: 'badge-med', high: 'badge-high' };
    const bl = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };
    document.getElementById('disGrid').innerHTML = list.map((d, index) => {
        const symLabels = (d.syms || []).slice(0, 3).map(sid => {
            const s = SYMPTOMS.find(x => x.id === sid);
            return s ? s.label.replace(/^\S+\s/, '') : sid;
        }).join(', ');
        return `<div class="dis-card" data-idx="${index}">
<div class="dis-ico">${d.icon}</div>
<div class="dis-name"><span class="dis-dot ${dc[d.sev]}"></span>${d.name}</div>
<div class="dis-syms">Key symptoms: ${symLabels}${(d.syms || []).length > 3 ? '…' : ''}</div>
<span class="dis-sev-badge ${bc[d.sev]}">${bl[d.sev]}</span>
<div style="margin-top:12px;font-size:.78rem;font-weight:700;color:var(--or)">View Details →</div>
</div>`;
    }).join('');
    document.getElementById('disGrid').querySelectorAll('.dis-card').forEach(card => {
        card.addEventListener('click', () => openDisease(parseInt(card.dataset.idx)));
    });
}

document.querySelectorAll('.df-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.df-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sev = btn.dataset.sev;
        renderDisGrid(sev === 'all' ? fetchedDiseases : fetchedDiseases.filter(d => d.sev === sev));
    });
});

// ═══════════════════════════════════════════
// DISEASE DETAIL
// ═══════════════════════════════════════════
function openDisease(idx) {
    const d = fetchedDiseases[idx];
    if (!d) return;

    const sevColor = { low: '#2d7d4a', medium: '#0F6E56', high: '#c0392b' }[d.sev];
    const sevLabel = { low: '🟢 Low Severity', medium: '🟡 Medium Severity', high: '🔴 High Severity' }[d.sev];
    const sevPct = { low: 30, medium: 62, high: 92 }[d.sev];

    document.getElementById('dIcon').textContent = d.icon;
    document.getElementById('dName').textContent = d.name;
    document.getElementById('dConf').textContent = 'ML Prediction Confidence: ' + d.conf + '%';
    document.getElementById('dSevPill').textContent = sevLabel;

    document.getElementById('dSyms').innerHTML = (d.syms || []).map(sid => {
        const s = SYMPTOMS.find(x => x.id === sid);
        return `<span class="sym-tag">${s ? s.label : sid}</span>`;
    }).join('');

    const precs = d.prec.split('.').map(p => p.trim()).filter(p => p.length > 3);
    document.getElementById('dPrecs').innerHTML = precs.map((p, i) =>
        `<div class="prec-item"><div class="prec-num">${i + 1}</div><div class="prec-txt">${p}.</div></div>`
    ).join('');

    document.getElementById('dSevInfo').innerHTML = `
<div class="sev-bar-wrap">
<div class="sev-bar-lbl"><span>Severity Level</span><span style="color:${sevColor};font-weight:700">${d.sev.charAt(0).toUpperCase() + d.sev.slice(1)}</span></div>
<div class="sev-bar"><div class="sev-bar-fill" style="width:${sevPct}%;background:${sevColor}"></div></div>
</div>
<div class="sev-desc">${d.sevDesc || 'Consult a medical professional for personalised advice.'}</div>`;

    const doctorList = d.doctor || ['Consult a doctor if symptoms are severe or worsening.'];
    document.getElementById('dDoctor').innerHTML = doctorList.map(item =>
        `<div class="doc-item"><div class="doc-dot"></div><div class="doc-txt">${item}</div></div>`
    ).join('');

    const medsList = d.meds || ['Paracetamol', 'ORS / Hydration', 'Rest', 'Consult a doctor'];
    document.getElementById('dMeds').innerHTML = medsList.map(m =>
        `<span class="med-tag">💊 ${m}</span>`
    ).join('');

    goPage('detail');
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
