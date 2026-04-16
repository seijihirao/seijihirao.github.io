import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, orderBy, serverTimestamp, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { firebaseConfig } from '/boardgames/scripts/firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let currentFichaId = null;
let fichas = [];
let sharedFichas = [];
let saveTimeout = null;
let isReadOnly = false;

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
        sharedFichas = [];
        isReadOnly = false;
        setFormReadOnly(false);
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
    data._fam = [...document.querySelectorAll('.fam-row')].map(r => ({
        parentesco: r.querySelector('.fam-parentesco')?.value || '',
        condicoes: r.querySelector('.fam-condicoes')?.value || '',
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
    if (data._fam) {
        const container = document.getElementById('fam-container');
        container.querySelectorAll('.fam-row').forEach(r => r.remove());
        data._fam.forEach(f => {
            window.addFamRow();
            const rows = container.querySelectorAll('.fam-row');
            const last = rows[rows.length - 1];
            last.querySelector('.fam-parentesco').value = f.parentesco;
            last.querySelector('.fam-condicoes').value = f.condicoes;
        });
        if (data._fam.length < 4) {
            for (let i = data._fam.length; i < 4; i++) window.addFamRow();
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

        // Load fichas shared with this user
        const sharedQ = query(
            collection(db, COLLECTION),
            where('sharedWith', 'array-contains', currentUser.email)
        );
        const sharedSnapshot = await getDocs(sharedQ);
        sharedFichas = [];
        sharedSnapshot.forEach(d => {
            sharedFichas.push({ id: d.id, ...d.data(), _shared: true });
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
    let ficha = fichas.find(f => f.id === fichaId);
    const shared = sharedFichas.find(f => f.id === fichaId);
    if (!ficha) ficha = shared;
    isReadOnly = false;
    if (ficha && ficha.formData) {
        window.clearForm(true);
        populateForm(ficha.formData);
    }
    setFormReadOnly(isReadOnly);
    updateFichaSelector();
}

export async function saveFicha() {
    if (!currentUser || isReadOnly) return;

    const formData = collectFormData();
    const label = formData['nome'] || 'Sem nome';
    setSaveStatus('saving');

    try {
        if (currentFichaId) {
            const isShared = sharedFichas.some(f => f.id === currentFichaId);
            const updateData = { label, formData, updatedAt: serverTimestamp() };
            if (!isShared) updateData.userId = currentUser.uid;
            await setDoc(doc(db, COLLECTION, currentFichaId), updateData, { merge: true });
            const allFichas = isShared ? sharedFichas : fichas;
            const idx = allFichas.findIndex(f => f.id === currentFichaId);
            if (idx >= 0) {
                allFichas[idx].label = label;
                allFichas[idx].formData = formData;
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
    if (!currentUser || !currentFichaId || isReadOnly) return;
    setSaveStatus('unsaved');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        setSaveStatus('saving');
        const formData = collectFormData();
        const label = formData['nome'] || 'Sem nome';
        try {
            const isShared = sharedFichas.some(f => f.id === currentFichaId);
            const updateData = { label, formData, updatedAt: serverTimestamp() };
            if (!isShared) updateData.userId = currentUser.uid;
            await setDoc(doc(db, COLLECTION, currentFichaId), updateData, { merge: true });
            const allFichas = isShared ? sharedFichas : fichas;
            const idx = allFichas.findIndex(f => f.id === currentFichaId);
            if (idx >= 0) {
                allFichas[idx].label = label;
                allFichas[idx].formData = formData;
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
    isReadOnly = false;
    setFormReadOnly(false);
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

    if (fichas.length === 0 && sharedFichas.length === 0) {
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

    if (sharedFichas.length > 0) {
        const group = document.createElement('optgroup');
        group.label = 'Compartilhadas comigo';
        sharedFichas.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = (f.label || 'Sem nome') + ' (compartilhada)';
            if (f.id === currentFichaId) opt.selected = true;
            group.appendChild(opt);
        });
        selector.appendChild(group);
    }

    // Update share/delete button visibility based on read-only
    const shareBtn = document.getElementById('share-btn');
    const deleteBtn = document.querySelector('[onclick="deleteFicha()"]');
    const saveBtn = document.getElementById('save-btn');
    const isShared = sharedFichas.some(f => f.id === currentFichaId);
    if (shareBtn) shareBtn.classList.toggle('hidden', isShared || !currentFichaId);
    if (deleteBtn) deleteBtn.classList.toggle('hidden', isShared);
    if (saveBtn) saveBtn.classList.toggle('hidden', false);
}

function setFormReadOnly(readOnly) {
    const form = document.getElementById('ficha-form');
    if (!form) return;
    form.querySelectorAll('input, textarea, select').forEach(el => {
        el.disabled = readOnly;
    });
    // Hide add-row buttons
    form.querySelectorAll('.no-print.btn').forEach(btn => {
        btn.classList.toggle('hidden', readOnly);
    });
    // Show read-only banner
    let banner = document.getElementById('readonly-banner');
    if (readOnly) {
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'readonly-banner';
            banner.className = 'bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 text-sm text-center font-medium';
            banner.textContent = 'Ficha compartilhada — somente leitura';
            form.parentNode.insertBefore(banner, form);
        }
        banner.classList.remove('hidden');
    } else if (banner) {
        banner.classList.add('hidden');
    }
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

// ===== Sharing =====

export async function shareFicha(email) {
    if (!currentUser || !currentFichaId || isReadOnly) return;
    email = (email || '').trim().toLowerCase();
    if (!email) return;
    if (email === currentUser.email.toLowerCase()) {
        showToast('Voce nao pode compartilhar consigo mesmo', 'error');
        return;
    }
    try {
        await updateDoc(doc(db, COLLECTION, currentFichaId), {
            sharedWith: arrayUnion(email),
        });
        showToast(`Compartilhado com ${email}`, 'success');
        // Update local state
        const ficha = fichas.find(f => f.id === currentFichaId);
        if (ficha) {
            ficha.sharedWith = ficha.sharedWith || [];
            if (!ficha.sharedWith.includes(email)) ficha.sharedWith.push(email);
        }
        updateShareModal();
    } catch (error) {
        console.error('Error sharing ficha:', error);
        showToast('Erro ao compartilhar', 'error');
    }
}

export async function unshareFicha(email) {
    if (!currentUser || !currentFichaId || isReadOnly) return;
    try {
        await updateDoc(doc(db, COLLECTION, currentFichaId), {
            sharedWith: arrayRemove(email),
        });
        const ficha = fichas.find(f => f.id === currentFichaId);
        if (ficha && ficha.sharedWith) {
            ficha.sharedWith = ficha.sharedWith.filter(e => e !== email);
        }
        showToast(`Compartilhamento removido: ${email}`, 'success');
        updateShareModal();
    } catch (error) {
        console.error('Error unsharing ficha:', error);
        showToast('Erro ao remover compartilhamento', 'error');
    }
}

export function openShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.classList.remove('hidden');
        updateShareModal();
    }
}

export function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) modal.classList.add('hidden');
}

function updateShareModal() {
    const list = document.getElementById('share-list');
    if (!list) return;
    const ficha = fichas.find(f => f.id === currentFichaId);
    const shared = ficha?.sharedWith || [];
    if (shared.length === 0) {
        list.innerHTML = '<p class="text-sm text-gray-400 italic">Nenhum compartilhamento</p>';
        return;
    }
    list.innerHTML = shared.map(email => `
        <div class="flex items-center justify-between gap-2 py-1">
            <span class="text-sm text-gray-700">${email}</span>
            <button onclick="unshareFicha('${email}')" class="btn btn-xs btn-ghost text-red-500 hover:bg-red-50" title="Remover">
                <i class="ri-close-line"></i>
            </button>
        </div>
    `).join('');
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
window.shareFicha = shareFicha;
window.unshareFicha = unshareFicha;
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
