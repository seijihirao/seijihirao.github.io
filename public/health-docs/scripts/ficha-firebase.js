import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { firebaseConfig } from '/boardgames/scripts/firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let currentFichaId = null;
let fichas = [];
let saveTimeout = null;

const COLLECTION = 'health-docs';

// ===== Auth =====

function updateAuthUI() {
    const loginBtn = document.getElementById('auth-login-btn');
    const userMenu = document.getElementById('auth-user-menu');
    const userName = document.getElementById('auth-user-name');
    const userAvatar = document.getElementById('auth-user-avatar');
    const fichaControls = document.getElementById('ficha-controls');

    if (currentUser) {
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        fichaControls.classList.remove('hidden');
        userName.textContent = currentUser.displayName || currentUser.email;
        if (currentUser.photoURL) {
            userAvatar.src = currentUser.photoURL;
            userAvatar.classList.remove('hidden');
        }
    } else {
        loginBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
        fichaControls.classList.add('hidden');
        userAvatar.classList.add('hidden');
    }
}

export async function signIn() {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Sign-in error:', error);
        showToast('Erro ao fazer login', 'error');
    }
}

export async function signOut() {
    try {
        await firebaseSignOut(auth);
        currentUser = null;
        currentFichaId = null;
        fichas = [];
        updateAuthUI();
        updateFichaSelector();
    } catch (error) {
        console.error('Sign-out error:', error);
    }
}

// ===== Fichas CRUD =====

function collectFormData() {
    const data = {};
    document.querySelectorAll('#ficha-form input[id], #ficha-form textarea[id], #ficha-form select[id]').forEach(el => {
        data[el.id] = el.value;
    });
    data._doencas = [...document.querySelectorAll('.doenca-row')].map(r => ({
        nome: r.querySelector('.doenca-nome')?.value || '',
    }));
    data._meds = [...document.querySelectorAll('.med-row')].map(r => ({
        nome: r.querySelector('.med-nome')?.value || '',
        dose: r.querySelector('.med-dose')?.value || '',
        hora: r.querySelector('.med-hora')?.value || '',
        motivo: r.querySelector('.med-motivo')?.value || '',
    }));
    data._docs = [...document.querySelectorAll('.doc-row')].map(r => ({
        esp: r.querySelector('.doc-esp')?.value || '',
        nome: r.querySelector('.doc-nome')?.value || '',
        tel: r.querySelector('.doc-tel')?.value || '',
    }));
    data._exams = [...document.querySelectorAll('.exam-row')].map(r => ({
        nome: r.querySelector('.exam-nome')?.value || '',
        data: r.querySelector('.exam-data')?.value || '',
        res: r.querySelector('.exam-res')?.value || '',
    }));
    return data;
}

function populateForm(data) {
    if (!data) return;
    // Simple fields
    document.querySelectorAll('#ficha-form input[id], #ficha-form textarea[id], #ficha-form select[id]').forEach(el => {
        if (data[el.id] !== undefined) el.value = data[el.id];
    });
    // Dynamic rows
    if (data._doencas) {
        // Clear existing, re-add
        const container = document.getElementById('doencas-container');
        container.querySelectorAll('.doenca-row').forEach(r => r.remove());
        data._doencas.forEach(d => {
            window.addDoencaRow();
            const rows = container.querySelectorAll('.doenca-row');
            const last = rows[rows.length - 1];
            last.querySelector('.doenca-nome').value = d.nome;
        });
        // Ensure at least some empty rows
        if (data._doencas.length < 4) {
            for (let i = data._doencas.length; i < 4; i++) window.addDoencaRow();
        }
    }
    if (data._meds) {
        const container = document.getElementById('meds-container');
        container.querySelectorAll('.med-row').forEach(r => r.remove());
        data._meds.forEach(m => {
            window.addMedRow();
            const rows = container.querySelectorAll('.med-row');
            const last = rows[rows.length - 1];
            last.querySelector('.med-nome').value = m.nome;
            last.querySelector('.med-dose').value = m.dose;
            last.querySelector('.med-hora').value = m.hora;
            last.querySelector('.med-motivo').value = m.motivo;
        });
        if (data._meds.length < 5) {
            for (let i = data._meds.length; i < 5; i++) window.addMedRow();
        }
    }
    if (data._docs) {
        const container = document.getElementById('docs-container');
        container.querySelectorAll('.doc-row').forEach(r => r.remove());
        data._docs.forEach(d => {
            window.addDocRow();
            const rows = container.querySelectorAll('.doc-row');
            const last = rows[rows.length - 1];
            last.querySelector('.doc-esp').value = d.esp;
            last.querySelector('.doc-nome').value = d.nome;
            last.querySelector('.doc-tel').value = d.tel;
        });
        if (data._docs.length < 4) {
            for (let i = data._docs.length; i < 4; i++) window.addDocRow();
        }
    }
    if (data._exams) {
        const container = document.getElementById('exams-container');
        container.querySelectorAll('.exam-row').forEach(r => r.remove());
        data._exams.forEach(e => {
            window.addExamRow();
            const rows = container.querySelectorAll('.exam-row');
            const last = rows[rows.length - 1];
            last.querySelector('.exam-nome').value = e.nome;
            last.querySelector('.exam-data').value = e.data;
            last.querySelector('.exam-res').value = e.res;
        });
        if (data._exams.length < 4) {
            for (let i = data._exams.length; i < 4; i++) window.addExamRow();
        }
    }
}

async function loadFichas() {
    if (!currentUser) return;
    try {
        const q = query(
            collection(db, COLLECTION),
            where('userId', '==', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        fichas = [];
        snapshot.forEach(d => {
            fichas.push({ id: d.id, ...d.data() });
        });
        updateFichaSelector();

        // Auto-select first ficha if available
        if (fichas.length > 0 && !currentFichaId) {
            await selectFicha(fichas[0].id);
        }
    } catch (error) {
        console.error('Error loading fichas:', error);
        showToast('Erro ao carregar fichas', 'error');
    }
}

async function selectFicha(fichaId) {
    currentFichaId = fichaId;
    const ficha = fichas.find(f => f.id === fichaId);
    if (ficha && ficha.formData) {
        window.clearForm(true); // clear without removing session storage prompt
        populateForm(ficha.formData);
    }
    updateFichaSelector();
}

export async function saveFicha() {
    if (!currentUser) return;

    const formData = collectFormData();
    const label = formData['nome'] || 'Sem nome';
    setSaveStatus('saving');

    try {
        if (currentFichaId) {
            await setDoc(doc(db, COLLECTION, currentFichaId), {
                userId: currentUser.uid,
                label,
                formData,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            const idx = fichas.findIndex(f => f.id === currentFichaId);
            if (idx >= 0) {
                fichas[idx].label = label;
                fichas[idx].formData = formData;
            }
        } else {
            const docRef = doc(collection(db, COLLECTION));
            await setDoc(docRef, {
                userId: currentUser.uid,
                label,
                formData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            currentFichaId = docRef.id;
            fichas.unshift({ id: docRef.id, label, formData });
        }
        updateFichaSelector();
        setSaveStatus('saved');
    } catch (error) {
        console.error('Error saving ficha:', error);
        setSaveStatus('error');
    }
}

function debouncedAutoSave() {
    if (!currentUser || !currentFichaId) return;
    setSaveStatus('unsaved');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        setSaveStatus('saving');
        const formData = collectFormData();
        const label = formData['nome'] || 'Sem nome';
        try {
            await setDoc(doc(db, COLLECTION, currentFichaId), {
                userId: currentUser.uid,
                label,
                formData,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            const idx = fichas.findIndex(f => f.id === currentFichaId);
            if (idx >= 0) {
                fichas[idx].label = label;
                fichas[idx].formData = formData;
            }
            updateFichaSelector();
            setSaveStatus('saved');
        } catch (error) {
            console.error('Auto-save error:', error);
            setSaveStatus('error');
        }
    }, 2000);
}

export async function newFicha() {
    currentFichaId = null;
    window.clearForm(true);
    updateFichaSelector();
}

export async function deleteFicha() {
    if (!currentFichaId || !currentUser) return;
    const ficha = fichas.find(f => f.id === currentFichaId);
    if (!confirm(`Excluir ficha "${ficha?.label || 'Sem nome'}"?`)) return;

    try {
        await deleteDoc(doc(db, COLLECTION, currentFichaId));
        fichas = fichas.filter(f => f.id !== currentFichaId);
        currentFichaId = null;
        window.clearForm(true);
        if (fichas.length > 0) {
            await selectFicha(fichas[0].id);
        }
        updateFichaSelector();
        showToast('Ficha excluida', 'success');
    } catch (error) {
        console.error('Error deleting ficha:', error);
        showToast('Erro ao excluir ficha', 'error');
    }
}

// ===== UI Helpers =====

function updateFichaSelector() {
    const selector = document.getElementById('ficha-selector');
    if (!selector) return;

    selector.innerHTML = '';

    if (fichas.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Nova ficha';
        selector.appendChild(opt);
        return;
    }

    fichas.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.label || 'Sem nome';
        if (f.id === currentFichaId) opt.selected = true;
        selector.appendChild(opt);
    });
}

let saveStatusTimeout = null;

function setSaveStatus(state) {
    const btn = document.getElementById('save-btn');
    const icon = document.getElementById('save-icon');
    const label = document.getElementById('save-label');
    if (!btn || !icon || !label) return;
    clearTimeout(saveStatusTimeout);

    // Reset
    icon.classList.remove('animate-spin');
    btn.disabled = false;

    switch (state) {
        case 'unsaved':
            btn.className = 'btn btn-sm border-0 shadow transition-all duration-300 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold';
            icon.className = 'ri-edit-circle-line';
            label.textContent = 'Salvar';
            break;
        case 'saving':
            btn.className = 'btn btn-sm border-0 shadow transition-all duration-300 bg-white/20 text-white';
            icon.className = 'ri-loader-4-line animate-spin';
            label.textContent = 'Salvando...';
            btn.disabled = true;
            break;
        case 'saved':
            btn.className = 'btn btn-sm border-0 shadow transition-all duration-300 bg-green-500 text-white';
            icon.className = 'ri-check-line';
            label.textContent = 'Salvo';
            saveStatusTimeout = setTimeout(() => {
                btn.className = 'btn btn-sm border-0 shadow transition-all duration-300 bg-white/20 text-white hover:bg-white/30';
                icon.className = 'ri-save-line';
                label.textContent = 'Salvar';
            }, 2500);
            break;
        case 'error':
            btn.className = 'btn btn-sm border-0 shadow transition-all duration-300 bg-red-500 text-white';
            icon.className = 'ri-error-warning-line';
            label.textContent = 'Erro';
            saveStatusTimeout = setTimeout(() => {
                btn.className = 'btn btn-sm border-0 shadow transition-all duration-300 bg-white/20 text-white hover:bg-white/30';
                icon.className = 'ri-save-line';
                label.textContent = 'Salvar';
            }, 4000);
            break;
        default:
            btn.className = 'btn btn-sm border-0 shadow transition-all duration-300 bg-white/20 text-white hover:bg-white/30';
            icon.className = 'ri-save-line';
            label.textContent = 'Salvar';
    }
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 transition-opacity duration-300 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===== Init =====

export function initFirebase() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            updateAuthUI();
            await loadFichas();
        } else {
            currentUser = null;
            currentFichaId = null;
            fichas = [];
            updateAuthUI();
            updateFichaSelector();
        }
    });

    // Ficha selector change
    document.getElementById('ficha-selector')?.addEventListener('change', (e) => {
        if (e.target.value) {
            selectFicha(e.target.value);
        }
    });

    // Auto-save on input when logged in with a selected ficha
    document.getElementById('ficha-form')?.addEventListener('input', () => {
        debouncedAutoSave();
    });
}

// Expose to window for inline handlers
window.firebaseSignIn = signIn;
window.firebaseSignOut = signOut;
window.saveFicha = saveFicha;
window.newFicha = newFicha;
window.deleteFicha = deleteFicha;
