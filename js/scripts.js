"use strict";
/* ESSENCE — Protótipo acadêmico exploratório.
   Sem servidor, autenticação, pagamentos ou mensagens reais.
   Dados e reservas são locais ao navegador (localStorage). */
const STORE = 'essence_demo_v4'; // Mantém os estabelecimentos já cadastrados
const seed = {
    businesses: [
        {
            id: 'b1',
            name: '027 Barbearia',
            category: 'Barbearia',
            description: 'Cortes modernos, barba e cuidado masculino em um ambiente acolhedor.',
            location: 'Belo Horizonte · Centro',
            icon: '✂',
            colors: ['#315879', '#132c43'],
            services: [{id: 's1', name: 'Corte masculino', price: 45, duration: 30}, {
                id: 's2',
                name: 'Barba',
                price: 30,
                duration: 30
            }, {id: 's3', name: 'Corte + barba', price: 70, duration: 60}],
            professionals: [{id: 'p1', name: 'Phellipe'}, {id: 'p2', name: 'Vitória'}]
        }
    ],
    bookings: [],
    clients: [],
    orders: []
};
const $ = id => document.getElementById(id);
const clone = value => JSON.parse(JSON.stringify(value));

function load() {
    try {
        const data = JSON.parse(localStorage.getItem(STORE));
        if (data && Array.isArray(data.businesses) && Array.isArray(data.bookings)) return data;
    } catch {
    }
    return clone(seed)
}

let data = load();
data.clients = Array.isArray(data.clients) ? data.clients : [];
data.orders = Array.isArray(data.orders) ? data.orders : [];
let category = 'Todos', selectedBusiness = null, editingId = null, adminTab = 'appointments';
let calendarView = null;

function save() {
    try {
        localStorage.setItem(STORE, JSON.stringify(data))
    } catch {
        notify('Não foi possível salvar neste navegador.')
    }
}

/* Contas locais de demonstração: nenhum segredo/senha é armazenado. */
const CLIENT_SESSION = 'essence_client_session_v1';
let pendingBooking = null;
let accountMode = 'login';
function currentClient() { return data.clients.find(c => c.id === sessionStorage.getItem(CLIENT_SESSION)) || null; }
function openAccount(mode = 'login') {
    $('accountError').textContent = '';
    if (mode === 'signup' || mode === 'login') accountMode = mode;
    renderAccount();
    if (!$('accountDialog').open) $('accountDialog').showModal();
}
function renderAccount() {
    const client = currentClient();
    $('accountGuest').hidden = !!client;
    $('accountLogged').hidden = !client;
    $('loginForm').hidden = accountMode !== 'login';
    $('signupForm').hidden = accountMode !== 'signup';
    $('showLogin').classList.toggle('active', accountMode === 'login');
    $('showSignup').classList.toggle('active', accountMode === 'signup');
    $('showLogin').setAttribute('aria-pressed', String(accountMode === 'login'));
    $('showSignup').setAttribute('aria-pressed', String(accountMode === 'signup'));
    $('accountNav').textContent = client ? 'Minha conta' : 'Entrar / Cadastre-se';
    if (!client) return;
    $('accountProfile').innerHTML = `<p><strong>${escapeHtml(client.name)}</strong><br><small>${escapeHtml(client.email)} · ${escapeHtml(client.phone)}</small></p>`;
    renderAccountDetails('appointments');
}
function renderAccountDetails(section) {
    const client = currentClient(); if (!client) return;
    if (section === 'edit') {
        $('accountDetails').innerHTML = `<form id="profileForm" class="essence-account-form"><label>Nome<input name="name" required maxlength="80" value="${escapeHtml(client.name)}"></label><label>Telefone<input name="phone" required maxlength="20" value="${escapeHtml(client.phone)}"></label><button class="primary-button" type="submit">Salvar perfil</button></form>`;
        return;
    }
    if (section === 'orders') {
        const orders = data.orders.filter(o => o.clientId === client.id).slice().reverse();
        $('accountDetails').innerHTML = orders.length ? orders.map(o => `<div class="admin-item"><div><strong>${escapeHtml(findBusiness(o.businessId)?.name || 'Estabelecimento')}</strong><small>${new Date(o.createdAt).toLocaleDateString('pt-BR')} · ${o.items.map(x => `${escapeHtml(x.name)} (${x.quantity}x)`).join(', ')} · ${money(o.total)} · Sem pagamento real</small></div></div>`).join('') : '<p class="muted">Nenhum pedido demonstrativo registrado.</p>';
        return;
    }
    const bookings = data.bookings.filter(b => b.clientId === client.id).slice().sort((a,b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
    $('accountDetails').innerHTML = bookings.length ? bookings.map(b => `<div class="admin-item"><div><strong>${escapeHtml(findBusiness(b.businessId)?.name || 'Estabelecimento')} · ${escapeHtml(findService(findBusiness(b.businessId),b.serviceId)?.name || 'Serviço')}</strong><small>${localDate(b.date)} às ${escapeHtml(b.time)} · ${b.status === 'cancelled' ? 'Cancelado' : 'Ativo'}</small></div>${b.status === 'active' ? `<div class="admin-actions"><button type="button" data-my-edit="${escapeHtml(b.id)}">Reagendar</button><button type="button" data-my-cancel="${escapeHtml(b.id)}">Cancelar</button></div>` : ''}</div>`).join('') : '<p class="muted">Você ainda não possui agendamentos vinculados à conta.</p>';
}
$('accountNav').addEventListener('click', () => openAccount());
$('showLogin').addEventListener('click', () => {accountMode='login';renderAccount();});
$('showSignup').addEventListener('click', () => {accountMode='signup';renderAccount();});
/* Fluxo exclusivamente demonstrativo: qualquer senha não vazia funciona.
   Senhas digitadas nunca são persistidas nem comparadas com dados anteriores. */
function finishDemoEntry(client) {
    sessionStorage.setItem(CLIENT_SESSION, client.id);
    $('loginCode').value = '';
    $('signupPassword').value = '';
    $('signupPasswordConfirm').value = '';
    $('accountError').textContent = '';
    renderAccount();
    if (pendingBooking) {
        const next = pendingBooking;
        pendingBooking = null;
        $('accountDialog').close();
        openBooking(next.businessId, next.bookingId);
    }
}
$('signupForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('signupName').value.trim();
    const email = $('signupEmail').value.trim().toLowerCase();
    const phone = $('signupPhone').value.trim();
    const password = $('signupPassword').value;
    const confirmation = $('signupPasswordConfirm').value;
    if (!name || !email || !phone || !password || !confirmation) {
        $('accountError').textContent = 'Preencha todos os campos para continuar.';
        return;
    }
    if (password !== confirmation) {
        $('accountError').textContent = 'A confirmação de senha deve ser igual à senha digitada.';
        return;
    }
    let client = data.clients.find(c => c.email === email);
    if (client) {
        // Evita duplicar o mesmo e-mail e preserva seus agendamentos anteriores.
        client.name = name;
        client.phone = phone;
    } else {
        client = {id:'c'+Date.now()+'_'+Math.random().toString(36).slice(2,6), name, email, phone};
        data.clients.push(client);
    }
    save();
    finishDemoEntry(client);
    notify('Conta demonstrativa pronta.');
});
$('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('loginEmail').value.trim().toLowerCase();
    const password = $('loginCode').value;
    if (!email || !password) {
        $('accountError').textContent = 'Informe um e-mail e qualquer senha fictícia.';
        return;
    }
    let client = data.clients.find(c => c.email === email);
    if (!client) {
        const fallbackName = email.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Cliente demonstração';
        client = {
            id:'c'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
            name:fallbackName, email, phone:'Não informado'
        };
        data.clients.push(client);
        save();
    }
    finishDemoEntry(client);
    notify('Entrada demonstrativa realizada.');
});
$('accountLogout').addEventListener('click',()=>{sessionStorage.removeItem(CLIENT_SESSION);renderAccount();notify('Você saiu da conta demonstrativa.');});
$('accountAppointments').addEventListener('click',()=>renderAccountDetails('appointments'));
$('accountOrders').addEventListener('click',()=>renderAccountDetails('orders'));
$('accountEdit').addEventListener('click',()=>renderAccountDetails('edit'));
$('accountDetails').addEventListener('submit',e=>{
    if(e.target.id!=='profileForm')return;e.preventDefault();
    const name=e.target.elements.name.value.trim(),phone=e.target.elements.phone.value.trim(),client=currentClient();
    if(name.length<2 || phone.replace(/\D/g,'').length<10){notify('Confira nome e telefone.');return;}
    client.name=name;client.phone=phone;save();renderAccount();notify('Perfil demonstrativo atualizado.');
});
$('accountDetails').addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn)return;
    const id=btn.dataset.myEdit || btn.dataset.myCancel;
    const booking=data.bookings.find(b=>b.id===id && b.clientId===currentClient()?.id);if(!booking)return;
    if(btn.dataset.myEdit){$('accountDialog').close();openBooking(booking.businessId,booking.id);}
    if(btn.dataset.myCancel){askConfirmation('Cancelar agendamento','Deseja cancelar seu agendamento?',()=>{booking.status='cancelled';save();renderAccountDetails('appointments');notify('Agendamento cancelado.');},true);}
});
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]))
}

/* Máscara monetária: cada dígito representa centavos (100 -> R$ 1,00). */
function formatPriceInput(input, initial = null) {
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.dataset.currency = 'true';
    const display = cents => money(cents / 100);
    if (initial !== null) input.value = display(Math.round(Number(initial || 0) * 100));
    input.addEventListener('input', () => {
        const digits = input.value.replace(/\D/g, '').slice(0, 12);
        input.value = display(Number(digits || 0));
    });
}
function parsePriceInput(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return Number(digits || 0) / 100;
}

function money(v) {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(v)
}

function localDate(d) {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('pt-BR')
}

function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateTime(date, time) {
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time.split(':').map(Number);
    return new Date(y, m - 1, d, h, min)
}

function minutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m
}

function findBusiness(id) {
    return data.businesses.find(b => b.id === id)
}

function findService(b, id) {
    return b?.services.find(s => s.id === id)
}

function findProfessional(b, id) {
    return b?.professionals.find(p => p.id === id)
}

function notify(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => el.classList.remove('visible'), 3400)
}

function renderFilters() {
    const cats = ['Todos', ...new Set(data.businesses.map(b => b.category))];
    $('filters').innerHTML = cats.map(c => `<button class="filter ${category === c ? 'active' : ''}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')
}

/* Catálogo opcional e links externos: versão acadêmica, dados locais. */
function safeExternalUrl(raw) {
    const value = String(raw || '').trim();
    if (!value) return '';
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
}
function contactLinks(b) {
    const links = [];
    const instagram = safeExternalUrl(b.instagram);
    const maps = safeExternalUrl(b.maps);
    const phone = String(b.whatsapp || '').replace(/\D/g, '');
    if (instagram) links.push(`<a href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>`);
    if (phone.length >= 10 && phone.length <= 13) links.push(`<a href="https://wa.me/55${escapeHtml(phone.replace(/^55(?=\d{10,11}$)/, ''))}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);
    if (maps) links.push(`<a href="${escapeHtml(maps)}" target="_blank" rel="noopener noreferrer">Como chegar</a>`);
    return links.length ? `<div class="essence-contact-links">${links.join('')}</div>` : '';
}
function renderCatalog(businessId) {
    const b = findBusiness(businessId);
    if (!b || !b.catalogEnabled) return;
    window.location.assign(`index.html?catalogo=${encodeURIComponent(businessId)}`);
}
function catalogButton(b) {
    return b.catalogEnabled ? `<button type="button" class="essence-catalog-button" data-catalog="${escapeHtml(b.id)}">Ver produtos</button>` : '';
}

function renderBusinesses() {
    const q = $('search').value.trim().toLocaleLowerCase('pt-BR');
    const list = data.businesses.filter(b => (category === 'Todos' || b.category === category) && [b.name, b.category, b.description, b.location, ...b.services.map(s => s.name)].join(' ').toLocaleLowerCase('pt-BR').includes(q));
    $('resultCount').textContent = `${list.length} estabelecimento${list.length === 1 ? '' : 's'}`;
    $('businessGrid').innerHTML = list.length ? list.map(b => `<article class="business-card"><div class="card-cover" style="--cover1:${b.colors[0]};--cover2:${b.colors[1]}"><span class="category-tag">${escapeHtml(b.category)}</span>${b.image ? `<img class="business-logo" src="${escapeHtml(b.image)}" alt="Logo de ${escapeHtml(b.name)}" loading="lazy">` : b.id === 'b1' ? '<img class="business-logo" src="assets/027-barbearia.png" alt="Logo 027 Barbearia" loading="lazy">' : `<span class="cover-icon">${escapeHtml(b.icon)}</span>`}</div><div class="card-content"><h3>${escapeHtml(b.name)}</h3><p>${escapeHtml(b.description)}</p><div class="card-meta">⌖ ${escapeHtml(b.location)} · ${b.professionals.length} profissional(is)</div><div class="card-footer"><span>A partir de ${money(Math.min(...b.services.map(s => s.price)))}</span><div class="essence-card-buttons"><button type="button" data-profile="${escapeHtml(b.id)}">Conhecer estabelecimento →</button></div></div></div></article>`).join('') : '<p class="empty">Nenhum estabelecimento encontrado. Experimente outra busca.</p>'
}

/* Perfil público dinâmico: rota hash compartilhável, sem novo HTML ou backend. */
function businessSlug(b) {
    return (b.name || 'estabelecimento').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + b.id;
}
function profileUrl(b) {
    return `${location.origin}${location.pathname}#/estabelecimento/${encodeURIComponent(businessSlug(b))}`;
}
function findProfileFromHash() {
    const match = location.hash.match(/^#\/estabelecimento\/([^/?]+)/);
    if (!match) return null;
    let slug;
    try { slug = decodeURIComponent(match[1]); } catch { return null; }
    return data.businesses.find(b => businessSlug(b) === slug || b.id === slug) || null;
}
function profileContacts(b) {
    const links = [];
    const insta = safeExternalUrl(b.instagram);
    const site = safeExternalUrl(b.website);
    const maps = safeExternalUrl(b.maps);
    const digits = String(b.whatsapp || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (insta) links.push(`<a href="${escapeHtml(insta)}" target="_blank" rel="noopener noreferrer">◎ Instagram</a>`);
    if (digits.length === 10 || digits.length === 11) links.push(`<a href="https://wa.me/55${escapeHtml(digits)}" target="_blank" rel="noopener noreferrer">◉ WhatsApp</a>`);
    if (site) links.push(`<a href="${escapeHtml(site)}" target="_blank" rel="noopener noreferrer">↗ Site</a>`);
    if (maps) links.push(`<a href="${escapeHtml(maps)}" target="_blank" rel="noopener noreferrer">⌖ Como chegar</a>`);
    return links.length ? `<div class="essence-profile-links">${links.join('')}</div>` : '<p class="muted">Contatos disponíveis em breve.</p>';
}
function renderBusinessProfile(b) {
    const target = $('businessProfile');
    const notices = getNotices(b);
    const services = (b.services || []).map(s => `<div class="essence-profile-line"><span>${escapeHtml(s.name)} <small>· ${Number(s.duration)||30} min</small></span><strong>${money(s.price)}</strong></div>`).join('');
    const noticeHtml = notices.length ? notices.map(n => `<article class="essence-profile-notice ${n.color === 'red' ? 'is-important' : ''}"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.message)}</p></article>`).join('') : '<p class="muted">Nenhum comunicado geral ativo no momento.</p>';
    const absences = getBlocks(b).filter(block => block.end >= today()).sort((a, z) => a.start.localeCompare(z.start));
    const absenceHtml = absences.length ? absences.map(block => `<article class="essence-profile-notice is-important"><strong>${escapeHtml(blockTitle(block, b))}</strong><p>${escapeHtml(block.reason || 'Indisponibilidade programada')}</p></article>`).join('') : '<p class="muted">Nenhuma indisponibilidade programada.</p>';
    const logo = b.image ? `<img src="${escapeHtml(b.image)}" alt="Logo de ${escapeHtml(b.name)}">` : b.id === 'b1' ? `<img src="assets/027-barbearia.png" alt="Logo 027 Barbearia">` : `<span>${escapeHtml(b.icon || '✦')}</span>`;
    target.innerHTML = `<div class="essence-profile-wrap">
        <a class="essence-profile-back" href="#explorar">← Voltar aos estabelecimentos</a>
        <div class="essence-profile-cover" style="--cover1:${escapeHtml(b.colors?.[0] || '#315879')};--cover2:${escapeHtml(b.colors?.[1] || '#132c43')}">${b.cover ? `<img class="essence-profile-cover-photo" src="${escapeHtml(b.cover)}" alt="Foto de capa de ${escapeHtml(b.name)}">` : ''}</div>
        <div class="essence-profile-intro"><div class="essence-profile-logo">${logo}</div><div><span class="eyebrow dark">${escapeHtml(b.category)}</span><h1>${escapeHtml(b.name)}</h1><p>${escapeHtml(b.description)}</p><p class="essence-profile-location">⌖ ${escapeHtml(b.location)}</p></div></div>
        <div class="essence-profile-actions"><button type="button" class="primary-button" data-profile-book="${escapeHtml(b.id)}">Agendar agora →</button>${b.catalogEnabled ? `<button type="button" class="secondary-button" data-profile-catalog="${escapeHtml(b.id)}">Ver produtos</button>` : ''}<button type="button" class="secondary-button" data-profile-share="${escapeHtml(b.id)}">Compartilhar página</button></div>
        <div class="essence-profile-columns"><div class="essence-profile-card"><h2>✦ Serviços</h2>${services || '<p class="muted">Serviços em breve.</p>'}<button type="button" class="essence-profile-inline" data-profile-book="${escapeHtml(b.id)}">Escolher horário →</button></div>
        <div class="essence-profile-card essence-profile-announcements"><h2>📣 Avisos e novidades ${notices.length ? `<span class="essence-profile-count">${notices.length}</span>` : ''}</h2><p class="muted">Confira os comunicados antes de agendar.</p>${noticeHtml}</div>
        <div class="essence-profile-card essence-profile-announcements"><h2>📅 Avisos de indisponibilidade ${absences.length ? `<span class="essence-profile-count">${absences.length}</span>` : ''}</h2><p class="muted">Folgas, feriados e horários bloqueados.</p>${absenceHtml}</div>
        <div class="essence-profile-card"><h2>⌖ Contato e localização</h2><p>${escapeHtml(b.location)}</p>${profileContacts(b)}</div>
        <div class="essence-profile-card"><h2>✂ Profissionais</h2><p>${(b.professionals || []).map(p => escapeHtml(p.name)).join(' · ') || 'Equipe em breve'}</p></div></div>
        <p class="essence-profile-demo">Protótipo acadêmico: dados e reservas são locais a este navegador.</p>
    </div>`;
}
function syncBusinessRoute() {
    const match = location.hash.startsWith('#/estabelecimento/');
    const b = findProfileFromHash();
    const profile = $('businessProfile');
    if (!match) {
        document.body.classList.remove('essence-show-profile');
        profile.hidden = true;
        return;
    }
    document.body.classList.add('essence-show-profile');
    profile.hidden = false;
    if (b) renderBusinessProfile(b);
    else profile.innerHTML = '<div class="essence-profile-wrap"><h1>Estabelecimento não encontrado</h1><p>Os estabelecimentos demonstrativos são salvos neste navegador.</p><a class="essence-profile-back" href="#explorar">← Voltar à busca</a></div>';
    window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange', syncBusinessRoute);
$('businessProfile').addEventListener('click', async e => {
    const book = e.target.closest('[data-profile-book]');
    const catalog = e.target.closest('[data-profile-catalog]');
    const share = e.target.closest('[data-profile-share]');
    if (book) openBooking(book.dataset.profileBook);
    if (catalog) renderCatalog(catalog.dataset.profileCatalog);
    if (share) {
        const b = findBusiness(share.dataset.profileShare);
        if (!b) return;
        const url = profileUrl(b);
        try {
            if (navigator.share) await navigator.share({title:b.name,url});
            else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); notify('Link copiado!'); }
            else { window.prompt('Copie o link do estabelecimento:',url); }
        } catch (err) { if (err.name !== 'AbortError') notify('Não foi possível compartilhar o link.'); }
    }
});

function selectOptions(items, label) {
    return items.map(x => `<option value="${escapeHtml(x.id)}">${escapeHtml(label(x))}</option>`).join('')
}

function openBooking(businessId, bookingId = null) {
    if (!currentClient()) {
        pendingBooking = {businessId, bookingId};
        openAccount('login');
        notify('Entre ou cadastre-se para agendar.');
        return;
    }
    if (bookingId) {
        const existingBooking = data.bookings.find(x => x.id === bookingId);
        if (existingBooking?.clientId && existingBooking.clientId !== currentClient().id) {
            notify('Este agendamento pertence a outra conta demonstrativa.'); return;
        }
    }
    selectedBusiness = businessId;
    editingId = bookingId;
    const b = findBusiness(businessId);
    if (!b) return;
    const existing = bookingId ? data.bookings.find(x => x.id === bookingId) : null;
    $('bookingTitle').textContent = existing ? 'Reagendar atendimento' : b.name;
    $('serviceSelect').innerHTML = selectOptions(b.services, s => `${s.name} · ${money(s.price)} · ${s.duration} min`);
    $('professionalSelect').innerHTML = selectOptions(b.professionals, p => p.name);
    const initialDate = existing?.date || today();
    $('dateInput').value = isEntireDayUnavailable(b, initialDate) ? '' : initialDate;
    calendarView = (existing?.date || today()).slice(0, 7);
    $('bookingCalendar').hidden = true;
    $('calendarToggle').setAttribute('aria-expanded', 'false');
    $('serviceSelect').value = existing?.serviceId || b.services[0]?.id;
    $('professionalSelect').value = existing?.professionalId || b.professionals[0]?.id;
    $('clientName').value = currentClient()?.name || '';
    $('clientPhone').value = currentClient()?.phone || '';
    $('timeInput').value = existing?.time || '';
    $('bookingError').textContent = '';
    renderCalendar();
    renderSlots();
    $('adminDialog').close();
    $('bookingDialog').showModal()
}

function conflicts(businessId, professionalId, date, start, duration, exceptId) {
    const end = start + duration;
    return data.bookings.some(x => x.id !== exceptId && x.status === 'active' && x.businessId === businessId && x.professionalId === professionalId && x.date === date && start < minutes(x.time) + x.duration && end > minutes(x.time))
}

/* Bloqueios estruturados: dia, intervalo de datas ou horário parcial por profissional. */
function getBlocks(b) {
    const blocks = Array.isArray(b.blocks) ? b.blocks : [];
    const legacy = (b.blockedDates || []).map(date => ({
        id: `legacy_${date}`, start: date, end: date, from: '00:00', to: '24:00',
        professionalId: 'all', reason: 'Data indisponível'
    }));
    return [...blocks, ...legacy];
}

function getNotices(b) {
    return (b.notices || []).filter(n => !n.until || n.until >= today());
}

function blockTitle(block, b) {
    const pro = block.professionalId === 'all' ? 'Toda a equipe' :
        (findProfessional(b, block.professionalId)?.name || 'Profissional');
    const dateLabel = block.start === block.end ? localDate(block.start) :
        `${localDate(block.start)} a ${localDate(block.end)}`;
    const hoursLabel = block.from === '00:00' && block.to === '24:00' ? 'Dia inteiro' :
        `${block.from} às ${block.to}`;
    return `${dateLabel} · ${hoursLabel} · ${pro}`;
}

function blockedFor(b, professionalId, date, start, duration) {
    const end = start + duration;
    return getBlocks(b).some(block =>
        block.start <= date && date <= block.end &&
        (block.professionalId === 'all' || block.professionalId === professionalId) &&
        start < minutes(block.to) && end > minutes(block.from)
    );
}

/* Calendário próprio: impede seleção de dias fechados para toda a equipe. */
function isEntireDayUnavailable(b, date) {
    if (date < today()) return true;
    const hours = b.hours || {open: '09:00', close: '18:00', days: [0, 1, 2, 3, 4, 5, 6]};
    const day = new Date(date + 'T12:00:00').getDay();
    if (!hours.days.includes(day)) return true;
    const pros = b.professionals || [];
    if (!pros.length) return true;
    // Uma combinação de bloqueios também pode fechar o dia inteiro.
    const opening = minutes(hours.open), closing = minutes(hours.close);
    return pros.every(pro => {
        for (let t = opening; t < closing; t++) {
            if (!blockedFor(b, pro.id, date, t, 1)) return false;
        }
        return true;
    });
}

function renderCalendar() {
    const b = findBusiness(selectedBusiness);
    if (!b) return;
    const date = $('dateInput').value;
    $('calendarSelectedLabel').textContent = date ? localDate(date) : 'Selecione uma data';
    if (!calendarView) calendarView = today().slice(0, 7);
    const [year, month] = calendarView.split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    $('calendarMonthLabel').textContent = first.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'});
    $('calendarPrev').disabled = calendarView <= today().slice(0, 7);
    const days = [];
    for (let i = 0; i < first.getDay(); i++) days.push('<span class="calendar-empty"></span>');
    for (let day = 1; day <= daysInMonth; day++) {
        const value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const unavailable = isEntireDayUnavailable(b, value);
        const selected = value === date;
        days.push(`<button type="button" class="calendar-day ${selected ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}" data-calendar-day="${value}" ${unavailable ? 'disabled title="Indisponível — confira os avisos de ausência"' : ''} aria-label="${localDate(value)}" aria-pressed="${selected}">${day}</button>`);
    }
    $('calendarDays').innerHTML = days.join('');
}

function bookingNoticeEntries() {
    const b = findBusiness(selectedBusiness);
    if (!b) return {absences: [], general: []};
    const selected = $('dateInput').value;
    const blocks = getBlocks(b)
        .filter(block => block.end >= today())
        .sort((a, z) => a.start.localeCompare(z.start));
    return {
        absences: blocks.map(block => {
            const selectedDate = selected && block.start <= selected && selected <= block.end;
            return `<article class="essence-notice red ${selectedDate ? 'notice-current' : ''}">
                <strong>${escapeHtml(blockTitle(block, b))}</strong>
                <p>${escapeHtml(block.reason || 'Ausência programada')}</p>
            </article>`;
        }),
        general: getNotices(b).map(notice => `<article class="essence-notice ${notice.color === 'red' ? 'red' : 'green'}">
            <strong>${escapeHtml(notice.title)}</strong>
            <p>${escapeHtml(notice.message)}</p>
        </article>`)
    };
}

function renderBookingNotices() {
    const target = $('bookingNotices');
    const {absences} = bookingNoticeEntries();
    const buttons = [];
    if (absences.length) {
        buttons.push(`<button type="button" class="notice-open-button" data-open-notices="absences">
            <span>Avisos de indisponibilidade</span>
            <span class="notice-count">${absences.length}</span>
            <span aria-hidden="true">›</span>
        </button>`);
    }
    target.innerHTML = buttons.join('');
    target.hidden = !buttons.length;
}

function openBookingNotices(type) {
    const {absences, general} = bookingNoticeEntries();
    const isAbsence = type === 'absences';
    const entries = isAbsence ? absences : general;
    if (!entries.length) return;
    $('noticesDialogTitle').textContent = isAbsence ? 'Avisos de indisponibilidade' : 'Avisos gerais';
    $('noticesDialogContent').innerHTML = entries.join('');
    $('noticesDialog').showModal();
}

function renderSlots() {
    const b = findBusiness(selectedBusiness);
    if (!b) return;
    const service = findService(b, $('serviceSelect').value);
    const date = $('dateInput').value;
    const professionalId = $('professionalSelect').value;
    const previous = $('timeInput').value;
    $('slotsContainer').innerHTML = '';
    $('timeInput').value = '';
    renderBookingNotices();
    if (!service || !date || !professionalId) return;
    if (isEntireDayUnavailable(b, date)) {
        $('slotsContainer').textContent = 'Esta data está indisponível. Confira os avisos de ausência.';
        return;
    }
    const day = new Date(date + 'T12:00:00').getDay();
    const hours = b.hours || {open: '09:00', close: '18:00', days: [0, 1, 2, 3, 4, 5, 6]};
    if (!hours.days.includes(day)) {
        $('slotsContainer').textContent = 'O estabelecimento não atende neste dia.';
        return
    }
    const opening = minutes(hours.open), closing = minutes(hours.close);
    for (let start = opening; start + service.duration <= closing; start += 15) {
        const time = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`;
        const disabled = dateTime(date, time) <= new Date() || blockedFor(b, professionalId, date, start, service.duration) || conflicts(b.id, professionalId, date, start, service.duration, editingId);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'slot';
        button.textContent = time;
        button.disabled = disabled;
        button.dataset.time = time;
        if (!disabled && time === previous) {
            button.classList.add('selected');
            $('timeInput').value = time
        }
        $('slotsContainer').append(button)
    }
    if (!$('slotsContainer').children.length) $('slotsContainer').textContent = 'Nenhum horário disponível.'
}

function submitBooking(e) {
    e.preventDefault();
    const b = findBusiness(selectedBusiness), service = findService(b, $('serviceSelect').value),
        pro = findProfessional(b, $('professionalSelect').value), date = $('dateInput').value,
        time = $('timeInput').value, name = $('clientName').value.trim(), phone = $('clientPhone').value.trim();
    const err = $('bookingError');
    err.textContent = '';
    if (!currentClient()) { err.textContent='Entre em sua conta demonstrativa antes de confirmar.'; return; }
    if (!b || !service || !pro || !date || !time || name.length < 2 || phone.replace(/\D/g, '').length < 10) {
        err.textContent = 'Preencha nome, telefone válido, data e selecione um horário disponível.';
        return
    }
    if (dateTime(date, time) <= new Date()) {
        err.textContent = 'Escolha um horário futuro.';
        renderSlots();
        return
    }
    const hours = b.hours || {open: '09:00', close: '18:00', days: [0, 1, 2, 3, 4, 5, 6]};
    const day = new Date(date + 'T12:00:00').getDay();
    if (isEntireDayUnavailable(b, date) || !hours.days.includes(day) || minutes(time) < minutes(hours.open) || minutes(time) + service.duration > minutes(hours.close)) {
        err.textContent = 'Esta data ou horário não está disponível.';
        renderSlots();
        return;
    }
    if (blockedFor(b, pro.id, date, minutes(time), service.duration)) {
        err.textContent = 'O profissional está indisponível nesse período. Escolha outro horário.';
        renderSlots();
        return;
    }
    if (conflicts(b.id, pro.id, date, minutes(time), service.duration, editingId)) {
        err.textContent = 'Este horário acabou de ficar indisponível. Escolha outro.';
        renderSlots();
        return
    }
    const booking = {
        id: editingId || `a${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        businessId: b.id,
        serviceId: service.id,
        professionalId: pro.id,
        clientId: currentClient().id,
        clientName: name,
        clientPhone: phone,
        date,
        time,
        duration: service.duration,
        price: service.price,
        status: 'active'
    };
    if (editingId) {
        const idx = data.bookings.findIndex(x => x.id === editingId);
        if (idx < 0) {
            err.textContent = 'Agendamento não encontrado.';
            return
        }
        data.bookings[idx] = booking
    } else data.bookings.push(booking);
    save();
    $('bookingDialog').close();
    $('confirmationText').textContent = `${name}, seu horário para ${service.name}, com ${pro.name}, está reservado para ${localDate(date)} às ${time}, em ${b.name}.`;
    $('confirmationDialog').showModal();
    renderAdmin()
}

function renderAdmin() {
    const b = findBusiness($('adminBusiness').value);
    if (!b) return;
    const active = data.bookings.filter(x => x.businessId === b.id && x.status === 'active');
    $('statBookings').textContent = active.length;
    $('statClients').textContent = new Set(data.bookings.filter(x=>x.businessId===b.id).map(x=>x.clientId || x.clientPhone)).size;
    $('statServices').textContent = b.services.length;
    document.querySelectorAll('[data-tab]').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === adminTab));
    let html = '';
    if (adminTab === 'appointments') {
        const bookings = data.bookings.filter(x => x.businessId === b.id).sort((a, z) => `${a.date}${a.time}`.localeCompare(`${z.date}${z.time}`));
        html = bookings.length ? bookings.map(x => `<div class="admin-item"><div><strong>${escapeHtml(x.clientName)} ${x.status === 'cancelled' ? '· Cancelado' : ''}</strong><small>${localDate(x.date)} às ${x.time} · ${escapeHtml(findService(b, x.serviceId)?.name || 'Serviço removido')}<br>${escapeHtml(findProfessional(b, x.professionalId)?.name || 'Profissional removido')} · ${escapeHtml(x.clientPhone)}</small></div><div class="admin-actions">${x.status === 'active' ? `<button data-edit="${x.id}">Reagendar</button><button data-cancel="${x.id}">Cancelar</button>` : ''}</div></div>`).join('') : '<p class="muted">Ainda não há agendamentos. Faça uma reserva pelo site para testar.</p>'
    } else if (adminTab === 'services') {
        html = b.services.map(s => `<div class="admin-item"><div><strong>${escapeHtml(s.name)}</strong><small>${money(s.price)} · ${s.duration} minutos</small></div><div class="admin-actions"><button data-edit-service="${s.id}">Editar</button><button data-delete-service="${s.id}" class="danger-outline">Excluir</button></div></div>`).join('') + '<button class="secondary-button" data-add-service="1">+ Adicionar serviço</button>'
    } else if (adminTab === 'settings') {
        const blocks = getBlocks(b);
        const notices = getNotices(b);
        const proOptions = b.professionals.map(pro => `<option value="${escapeHtml(pro.id)}">${escapeHtml(pro.name)}</option>`).join('');
        html = `<div class="admin-settings">
            <section class="settings-section">
                <h3>Dados do estabelecimento</h3>
                <p class="muted">${escapeHtml(b.name)} · ${escapeHtml(b.description)}</p>
                <div class="settings-actions">
                    <button type="button" class="settings-button primary" data-edit-business="1">✎ Editar estabelecimento</button>
                    ${b.id !== 'b1' ? '<button type="button" class="settings-button danger-outline" data-delete-business="1">▤ Excluir estabelecimento</button>' : '<small>A 027 Barbearia é o estabelecimento padrão e não pode ser excluída.</small>'}
                </div>
            </section>
            <section class="settings-section">
                <h3>Loja e produtos</h3>
                <p class="muted">${b.catalogEnabled ? 'O botão Ver produtos está visível para os clientes.' : 'O catálogo está oculto para os clientes.'} Os produtos cadastrados são mantidos ao desativar a loja.</p>
                <button type="button" class="settings-button primary" data-toggle-catalog="1">${b.catalogEnabled ? 'Desativar catálogo' : 'Ativar catálogo'}</button>
                <p class="muted">Cadastre e edite produtos na aba Produtos.</p>
            </section>
            <section class="settings-section">
                <h3>Folgas, feriados e férias</h3>
                <p class="muted">Bloqueie um dia, vários dias ou apenas parte do expediente. Escolha um profissional ou toda a equipe.</p>
                <div class="date-block-form">
                    <label>Tipo de ausência
                        <select id="blockMode"><option value="day">Dia inteiro</option><option value="hours">Horário parcial</option><option value="range">Período de dias</option></select>
                    </label>
                    <label>Profissional
                        <select id="blockProfessional"><option value="all">Toda a equipe</option>${proOptions}</select>
                    </label>
                    <label>Data inicial<input id="blockStart" type="date" min="${today()}"></label>
                    <label id="blockEndLabel" hidden>Data final<input id="blockEnd" type="date" min="${today()}"></label>
                    <label id="blockTimeStartLabel" hidden>Das<input id="blockTimeStart" type="time" value="12:00"></label>
                    <label id="blockTimeEndLabel" hidden>Até às<input id="blockTimeEnd" type="time" value="18:00"></label>
                    <label class="form-full">Motivo da ausência<textarea id="blockReason" maxlength="240" placeholder="Ex.: Férias, consulta médica, saída antecipada..." required></textarea></label>
                    <button type="button" class="settings-button danger form-full" data-add-block="1">▣ Bloquear na agenda</button>
                </div>
                <h3 class="essence-blocks-heading">Ausências cadastradas</h3>
                ${blocks.length ? blocks.map(block => `<div class="essence-notice red"><strong>${escapeHtml(blockTitle(block, b))}</strong><p>${escapeHtml(block.reason || 'Indisponibilidade programada')}</p><div class="notice-actions"><button type="button" data-remove-block-id="${escapeHtml(block.id)}">Remover bloqueio</button></div></div>`).join('') : '<p class="muted">Nenhuma ausência cadastrada.</p>'}
            </section>
            <section class="settings-section">
                <h3>Avisos aos clientes</h3>
                <p class="muted">Divulgue eventos, promoções e comunicados. Os avisos gerais aparecem na página pública do estabelecimento. As indisponibilidades também são exibidas na agenda.</p>
                <div class="notice-form">
                    <label class="form-full">Título<input id="noticeTitle" maxlength="80" placeholder="Ex.: Agenda de fim de ano"></label>
                    <label class="form-full">Mensagem<textarea id="noticeMessage" maxlength="400" placeholder="Escreva o comunicado..."></textarea></label>
                    <label>Cor do aviso<select id="noticeColor"><option value="green">Verde</option><option value="red">Vermelho</option></select></label>
                    <label>Exibir até (opcional)<input id="noticeUntil" type="date" min="${today()}"></label>
                    <button type="button" class="settings-button primary form-full" data-add-notice="1">＋ Publicar aviso</button>
                </div>
                ${notices.length ? notices.map(notice => `<div class="essence-notice ${notice.color === 'red' ? 'red' : 'green'}"><strong>${escapeHtml(notice.title)}</strong><p>${escapeHtml(notice.message)}${notice.until ? `\nVálido até ${localDate(notice.until)}` : ''}</p><div class="notice-actions"><button type="button" data-remove-notice="${escapeHtml(notice.id)}">Excluir aviso</button></div></div>`).join('') : '<p class="muted">Nenhum aviso publicado.</p>'}
            </section>
        </div>`;
    } else if (adminTab === 'products') {
        const products = Array.isArray(b.products) ? b.products : [];
        html = `<p class="muted">${b.catalogEnabled ? 'Catálogo visível para clientes.' : 'Catálogo oculto. Ative-o na aba Configurações.'}</p>` +
            products.map(p => `<div class="admin-item"><div><strong>${escapeHtml(p.name)}</strong><small>${money(p.price)} · ${escapeHtml(p.description || '')}</small></div><div class="admin-actions"><button data-edit-product="${escapeHtml(p.id)}">Editar</button><button class="danger-outline" data-delete-product="${escapeHtml(p.id)}">Excluir</button></div></div>`).join('') +
            '<button class="secondary-button" data-add-product="1">+ Adicionar produto</button>';
    } else if (adminTab === 'professionals') {
        html = b.professionals.map(p => `<div class="admin-item"><strong>${escapeHtml(p.name)}</strong><button data-edit-professional="${p.id}">Editar</button></div>`).join('') + '<button class="secondary-button" data-add-professional="1">+ Adicionar profissional</button>'
    } else {
        html = '<p class="muted">Selecione uma seção do painel.</p>';
    }
    $('adminContent').innerHTML = `<div class="admin-list">${html}</div>`
}

/* Formulários internos: substituem os prompts nativos do navegador. */
function openEditor({title, fields, onSave}) {
    const dialog = $('editorDialog');
    const form = $('editorForm');
    $('editorTitle').textContent = title;
    $('editorError').textContent = '';
    $('editorFields').replaceChildren();

    for (const field of fields) {
        const label = document.createElement('label');
        label.textContent = field.label;
        const input = document.createElement('input');
        input.name = field.name;
        input.type = field.type === 'currency' ? 'text' : (field.type || 'text');
        input.required = field.required !== false;
        if (field.type === 'file') {
            input.accept = 'image/png,image/jpeg,image/webp';
        }
        if (field.type !== 'file') input.value = String(field.value ?? '');
        if (field.type === 'currency') formatPriceInput(input, field.value);
        if (field.type === 'number') {
            input.min = String(field.min ?? 0);
            input.step = String(field.step ?? 1);
            if (field.max != null) input.max = String(field.max);
        }
        if (field.type === 'file' && field.preview) {
            const preview = document.createElement('img');
            preview.className = 'essence-image-preview';
            preview.alt = 'Imagem atual cadastrada';
            preview.src = field.preview;
            label.appendChild(preview);
            const caption = document.createElement('small');
            caption.textContent = 'Imagem atual. Escolha outro arquivo somente se quiser substituir.';
            label.appendChild(caption);
            input.addEventListener('change', () => {
                const file = input.files?.[0];
                if (!file) { preview.src = field.preview; return; }
                const reader = new FileReader();
                reader.onload = () => { preview.src = reader.result; };
                reader.readAsDataURL(file);
            });
        }
        label.appendChild(input);
        $('editorFields').appendChild(label);
    }

    form.onsubmit = async event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form));
        form.querySelectorAll('[data-currency]').forEach(input => { values[input.name] = parsePriceInput(input.value); });
        const error = await onSave(values);
        if (error) {
            $('editorError').textContent = error;
            return;
        }
        dialog.close();
    };
    dialog.showModal();
    form.querySelector('input')?.focus();
}

function editService(id) {
    const b = findBusiness($('adminBusiness').value);
    if (!b) return;
    const s = b.services.find(x => x.id === id);
    openEditor({
        title: s ? 'Editar serviço' : 'Adicionar serviço',
        fields: [
            {name: 'name', label: 'Nome do serviço', value: s?.name || ''},
            {name: 'price', label: 'Preço (R$)', type: 'currency', value: s?.price ?? 50},
            {name: 'duration', label: 'Duração (minutos)', type: 'number', min: 15, max: 240, step: 15, value: s?.duration ?? 30}
        ],
        onSave(values) {
            const name = values.name.trim();
            const price = Number(values.price);
            const duration = Number(values.duration);
            if (!name) return 'Informe o nome do serviço.';
            if (!Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 15 || duration > 240 || duration % 15 !== 0) {
                return 'Informe um preço válido e duração entre 15 e 240 minutos, em múltiplos de 15.';
            }
            if (s) Object.assign(s, {name, price, duration});
            else b.services.push({id: `s${Date.now()}`, name, price, duration});
            save();
            renderAdmin();
            renderBusinesses();
            notify('Serviço salvo.');
        }
    });
}

function editProfessional(id) {
    const b = findBusiness($('adminBusiness').value);
    if (!b) return;
    const p = b.professionals.find(x => x.id === id);
    openEditor({
        title: p ? 'Editar profissional' : 'Adicionar profissional',
        fields: [{name: 'name', label: 'Nome do profissional', value: p?.name || ''}],
        onSave(values) {
            const name = values.name.trim();
            if (!name) return 'Informe o nome do profissional.';
            if (p) p.name = name;
            else b.professionals.push({id: `p${Date.now()}`, name});
            save();
            renderAdmin();
            renderBusinesses();
            notify('Profissional salvo.');
        }
    });
}

function editBusiness() {
    const b = findBusiness($('adminBusiness').value);
    if (!b) return;
    openEditor({
        title: 'Editar estabelecimento',
        fields: [
            {name: 'name', label: 'Nome do estabelecimento', value: b.name},
            {name: 'description', label: 'Descrição', value: b.description},
            {name: 'location', label: 'Localização', value: b.location},
            {name: 'category', label: 'Categoria', value: b.category},
            {name: 'open', label: 'Abertura (HH:MM)', value: b.hours?.open || '09:00'},
            {name: 'close', label: 'Fechamento (HH:MM)', value: b.hours?.close || '18:00'},
            {name: 'days', label: 'Dias da semana (0=Dom, 1=Seg ... 6=Sáb; separados por vírgula)', value: (b.hours?.days || [0,1,2,3,4,5,6]).join(',')},
            {name: 'instagram', label: 'Instagram (URL opcional)', value: b.instagram || '', required: false},
            {name: 'website', label: 'Site oficial (URL opcional)', value: b.website || '', required: false},
            {name: 'whatsapp', label: 'WhatsApp com DDD (opcional)', value: b.whatsapp || '', required: false},
            {name: 'maps', label: 'Google Maps (URL opcional)', value: b.maps || '', required: false},
            {name: 'cover', label: 'Foto de capa (opcional, até 250 KB)', type: 'file', required: false, preview: b.cover || ''},
            {name: 'image', label: 'Nova imagem (opcional, até 250 KB)', type: 'file', required: false, preview: b.image || (b.id === 'b1' ? 'assets/027-barbearia.png' : '')}
        ],
        async onSave(values) {
            const name = values.name.trim(), description = values.description.trim(), location = values.location.trim();
            if (!name || !description || !location || !values.category.trim()) return 'Preencha nome, descrição, categoria e localização.';
            const open = values.open.trim(), close = values.close.trim();
            const days = [...new Set(values.days.split(',').map(x => Number(x.trim())))];
            if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(open) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(close) || minutes(close) <= minutes(open)) return 'Informe horários válidos.';
            if (!days.length || days.some(d => !Number.isInteger(d) || d < 0 || d > 6)) return 'Informe dias entre 0 e 6 separados por vírgula.';
            if ((values.instagram && !safeExternalUrl(values.instagram)) || (values.maps && !safeExternalUrl(values.maps)) || (values.website && !safeExternalUrl(values.website))) return 'Use links completos com https://';
            const whatsapp = values.whatsapp.replace(/\D/g, '');
            if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 13)) return 'Informe WhatsApp com DDD.';
            const conflictsHours = data.bookings.some(x => x.businessId === b.id && x.status === 'active' && (!days.includes(new Date(x.date + 'T12:00:00').getDay()) || minutes(x.time) < minutes(open) || minutes(x.time) + x.duration > minutes(close)));
            if (conflictsHours) return 'Há agendamentos ativos fora dos novos dias/horários. Reagende ou cancele antes de alterar.';
            let image = b.image;
            if (values.image?.size) {
                if (values.image.size > 250000) return 'A imagem deve ter até 250 KB.';
                if (!['image/png', 'image/jpeg', 'image/webp'].includes(values.image.type)) return 'Escolha uma imagem PNG, JPG ou WebP.';
                try {
                    image = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(values.image);
                    });
                } catch { return 'Não foi possível ler a imagem.'; }
            }
            let cover = b.cover || '';
            if (values.cover?.size) {
                if (values.cover.size > 250000) return 'A foto de capa deve ter até 250 KB.';
                if (!['image/png','image/jpeg','image/webp'].includes(values.cover.type)) return 'Escolha uma capa PNG, JPG ou WebP.';
                try { cover = await new Promise((resolve,reject) => {const reader = new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(values.cover);}); }
                catch { return 'Não foi possível ler a foto de capa.'; }
            }
            Object.assign(b, {name, description, location, image, cover, website: values.website.trim(), category: values.category.trim(), hours: {open, close, days}, instagram: values.instagram.trim(), whatsapp, maps: values.maps.trim()});
            save(); renderFilters(); renderBusinesses(); if (findProfileFromHash()) syncBusinessRoute();
            $('adminBusiness').querySelector(`option[value="${b.id}"]`).textContent = b.name;
            renderAdmin();
            notify('Estabelecimento atualizado.');
        }
    });
}

/* Converte imagens anexadas para JPEG compacto, pois a demonstração usa localStorage. */
async function productImageFromFile(file) {
    if (!file || !file.size) return null;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Use uma imagem PNG, JPG ou WebP.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Escolha uma imagem de até 8 MB.');
    const url = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.src = url;
        await img.decode();
        const scale = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.72);
    } finally { URL.revokeObjectURL(url); }
}

function editProduct(id) {
    const b = findBusiness($('adminBusiness').value);
    if (!b) return;
    b.products ||= [];
    const product = b.products.find(p => p.id === id);
    openEditor({
        title: product ? 'Editar produto' : 'Adicionar produto',
        fields: [
            {name: 'name', label: 'Nome do produto', value: product?.name || ''},
            {name: 'description', label: 'Descrição (opcional)', value: product?.description || '', required: false},
            {name: 'price', label: 'Preço (R$)', type: 'currency', value: product?.price ?? 0},
            {name: 'image', label: 'Anexar imagem (opcional — PNG, JPG ou WebP)', type: 'file', required: false, preview: product?.image || ''},
            ...(product?.image ? [{name: 'removeImage', label: 'Remover imagem atual? (digite SIM, se desejar)', required: false}] : [])
        ],
        async onSave(values) {
            const name = String(values.name || '').trim();
            const description = String(values.description || '').trim();
            const price = Number(values.price);
            if (!name || !Number.isFinite(price) || price < 0) return 'Informe nome e preço válido.';
            let image = product?.image || '';
            if (String(values.removeImage || '').trim().toUpperCase() === 'SIM') image = '';
            try {
                const uploaded = await productImageFromFile(values.image);
                if (uploaded) image = uploaded;
            } catch (error) { return error.message; }
            const oldProducts = JSON.stringify(b.products);
            if (product) Object.assign(product, {name, description, price, image});
            else b.products.push({id: 'prod' + Date.now(), name, description, price, image});
            try {
                localStorage.setItem(STORE, JSON.stringify(data));
            } catch {
                b.products = JSON.parse(oldProducts);
                return 'Sem espaço no navegador para salvar. Tente uma imagem menor ou sem foto.';
            }
            renderAdmin(); notify('Produto salvo.');
        }
    });
}

function deleteBusiness() {
    const b = findBusiness($('adminBusiness').value);
    if (!b || b.id === 'b1') return;
    askConfirmation('Excluir estabelecimento', `Excluir ${b.name} e todos os seus agendamentos? Esta ação não pode ser desfeita.`, () => {
        data.businesses = data.businesses.filter(x => x.id !== b.id);
        data.bookings = data.bookings.filter(x => x.businessId !== b.id);
        save(); renderFilters(); renderBusinesses(); openAdmin();
        notify('Estabelecimento excluído.');
    }, true);
}

function deleteService(id) {
    const b = findBusiness($('adminBusiness').value);
    const service = b?.services.find(x => x.id === id);
    if (!service) return;
    if (b.services.length <= 1) { notify('Mantenha pelo menos um serviço cadastrado.'); return; }
    const active = data.bookings.some(x => x.businessId === b.id && x.serviceId === id && x.status === 'active');
    if (active) { notify('Cancele os agendamentos ativos desse serviço antes de excluí-lo.'); return; }
    askConfirmation('Excluir serviço', `Excluir o serviço ${service.name}?`, () => {
        b.services = b.services.filter(x => x.id !== id);
        save(); renderAdmin(); renderBusinesses(); notify('Serviço excluído.');
    }, true);
}

function addBlockedDates() {
    const b = findBusiness($('adminBusiness').value);
    const mode = $('blockMode')?.value;
    const start = $('blockStart')?.value;
    const end = mode === 'range' ? $('blockEnd')?.value : start;
    const professionalId = $('blockProfessional')?.value;
    const reason = $('blockReason')?.value.trim();
    const from = mode === 'hours' ? $('blockTimeStart')?.value : '00:00';
    const to = mode === 'hours' ? $('blockTimeEnd')?.value : '24:00';
    if (!b || !start || !end || end < start || start < today()) {
        notify('Informe datas válidas a partir de hoje.'); return;
    }
    if (!reason) { notify('Informe o motivo da ausência.'); return; }
    if (!from || !to || minutes(to) <= minutes(from)) {
        notify('Informe um intervalo de horas válido.'); return;
    }
    const count = Math.round((new Date(end + 'T12:00:00') - new Date(start + 'T12:00:00')) / 86400000) + 1;
    if (count > 366) { notify('O período pode ter no máximo 366 dias.'); return; }
    if (mode === 'hours' && start === today() && minutes(to) <= new Date().getHours() * 60 + new Date().getMinutes()) {
        notify('Escolha um horário futuro para o bloqueio.'); return;
    }
    const active = data.bookings.filter(booking => booking.businessId === b.id && booking.status === 'active' &&
        booking.date >= start && booking.date <= end &&
        (professionalId === 'all' || booking.professionalId === professionalId) &&
        minutes(booking.time) < minutes(to) && minutes(booking.time) + booking.duration > minutes(from));
    if (active.length) {
        notify(`Há ${active.length} agendamento(s) ativo(s) afetado(s). Cancele ou reagende antes de bloquear.`);
        return;
    }
    b.blocks ||= [];
    b.blocks.push({id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        start, end, from, to, professionalId, reason});
    save(); renderAdmin(); notify('Ausência registrada e horários bloqueados.');
}

function addNotice() {
    const b = findBusiness($('adminBusiness').value);
    const title = $('noticeTitle')?.value.trim();
    const message = $('noticeMessage')?.value.trim();
    const color = $('noticeColor')?.value;
    const until = $('noticeUntil')?.value || '';
    if (!b || !title || !message) { notify('Informe título e mensagem do aviso.'); return; }
    if (until && until < today()) { notify('Escolha uma data de validade futura.'); return; }
    b.notices ||= [];
    b.notices.push({id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title, message, color: color === 'red' ? 'red' : 'green', until});
    save(); renderAdmin(); notify('Aviso publicado.');
}

/* Confirmações personalizadas, sem confirm() do navegador. */
function askConfirmation(title, message, onConfirm, destructive = false) {
    const dialog = $('confirmDialog');
    $('confirmTitle').textContent = title;
    $('confirmMessage').textContent = message;
    const button = $('confirmAccept');
    button.textContent = destructive ? 'Sim, confirmar' : 'Confirmar';
    button.classList.toggle('danger-action', destructive);
    button.onclick = () => {
        dialog.close();
        onConfirm();
    };
    dialog.showModal();
}

function openAdmin() {
    const select = $('adminBusiness');
    const prev = select.value;
    select.innerHTML = selectOptions(data.businesses, b => b.name);
    if (data.businesses.some(b => b.id === prev)) select.value = prev;
    adminTab = 'appointments';
    renderAdmin();
    $('adminDialog').showModal()
}

$('filters').addEventListener('click', e => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    category = btn.dataset.category;
    renderFilters();
    renderBusinesses()
});
$('businessGrid').addEventListener('click', e => {
    const profile = e.target.closest('[data-profile]');
    if (profile) {
        const b = findBusiness(profile.dataset.profile);
        if (b) location.hash = '/estabelecimento/' + encodeURIComponent(businessSlug(b));
        return;
    }
    const book = e.target.closest('[data-book]');
    const catalog = e.target.closest('[data-catalog]');
    if (book) openBooking(book.dataset.book);
    else if (catalog) renderCatalog(catalog.dataset.catalog);
});
$('search').addEventListener('input', renderBusinesses);
$('clearSearch').addEventListener('click', () => {
    $('search').value = '';
    renderBusinesses();
    $('search').focus()
});
$('adminNav').addEventListener('click', openAdmin);
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => $(btn.dataset.close).close()));
['serviceSelect', 'professionalSelect'].forEach(id => $(id).addEventListener('change', renderSlots));
$('bookingNotices').addEventListener('click', event => {
    const button = event.target.closest('[data-open-notices]');
    if (button) openBookingNotices(button.dataset.openNotices);
});

$('calendarToggle').addEventListener('click', () => {
    const calendar = $('bookingCalendar');
    calendar.hidden = !calendar.hidden;
    $('calendarToggle').setAttribute('aria-expanded', String(!calendar.hidden));
    if (!calendar.hidden) renderCalendar();
});
function moveCalendarMonth(delta) {
    const [year, month] = calendarView.split('-').map(Number);
    const next = new Date(year, month - 1 + delta, 1);
    calendarView = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    renderCalendar();
}
$('calendarPrev').addEventListener('click', () => moveCalendarMonth(-1));
$('calendarNext').addEventListener('click', () => moveCalendarMonth(1));
$('calendarDays').addEventListener('click', event => {
    const button = event.target.closest('[data-calendar-day]');
    if (!button || button.disabled) return;
    $('dateInput').value = button.dataset.calendarDay;
    $('bookingCalendar').hidden = true;
    $('calendarToggle').setAttribute('aria-expanded', 'false');
    renderCalendar();
    renderSlots();
});
$('slotsContainer').addEventListener('click', e => {
    const btn = e.target.closest('[data-time]');
    if (!btn || btn.disabled) return;
    document.querySelectorAll('.slot').forEach(x => x.classList.remove('selected'));
    btn.classList.add('selected');
    $('timeInput').value = btn.dataset.time
});
$('bookingForm').addEventListener('submit', submitBooking);
$('adminBusiness').addEventListener('change', renderAdmin);
document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
    adminTab = btn.dataset.tab;
    renderAdmin()
}));
$('adminContent').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.cancel) {
        const booking = data.bookings.find(x => x.id === btn.dataset.cancel);
        if (booking) askConfirmation(
            'Cancelar agendamento',
            'Deseja cancelar este agendamento? Esta ação não pode ser desfeita.',
            () => {
                booking.status = 'cancelled';
                save();
                renderAdmin();
                notify('Agendamento cancelado.');
            },
            true
        );
    } else if (btn.dataset.deleteService) deleteService(btn.dataset.deleteService);
    else if (btn.dataset.addProduct) editProduct(null);
    else if (btn.dataset.editProduct) editProduct(btn.dataset.editProduct);
    else if (btn.dataset.deleteProduct) {
        const b = findBusiness($('adminBusiness').value);
        askConfirmation('Excluir produto', 'Deseja excluir este produto do catálogo?', () => {
            b.products = (b.products || []).filter(p => p.id !== btn.dataset.deleteProduct);
            save(); renderAdmin(); notify('Produto excluído.');
        }, true);
    }
    else if (btn.dataset.toggleCatalog) {
        const b = findBusiness($('adminBusiness').value);
        b.catalogEnabled = !b.catalogEnabled;
        save(); renderAdmin(); renderBusinesses(); notify(b.catalogEnabled ? 'Catálogo ativado.' : 'Catálogo desativado.');
    }
    else if (btn.dataset.editBusiness) editBusiness();
    else if (btn.dataset.deleteBusiness) deleteBusiness();
    else if (btn.dataset.addBlock) addBlockedDates();
    else if (btn.dataset.addNotice) addNotice();
    else if (btn.dataset.removeNotice) {
        const b = findBusiness($('adminBusiness').value);
        b.notices = (b.notices || []).filter(n => n.id !== btn.dataset.removeNotice);
        save(); renderAdmin(); notify('Aviso removido.');
    }
    else if (btn.dataset.removeBlockId) {
        const b = findBusiness($('adminBusiness').value);
        if (btn.dataset.removeBlockId.startsWith('legacy_')) {
            b.blockedDates = (b.blockedDates || []).filter(d => `legacy_${d}` !== btn.dataset.removeBlockId);
        } else {
            b.blocks = (b.blocks || []).filter(block => block.id !== btn.dataset.removeBlockId);
        }
        save(); renderAdmin(); notify('Bloqueio removido.');
    }
    else if (btn.dataset.removeBlock) {
        const b = findBusiness($('adminBusiness').value);
        b.blockedDates = (b.blockedDates || []).filter(d => d !== btn.dataset.removeBlock);
        save(); renderAdmin(); notify('Data liberada.');
    } else if (btn.dataset.edit) {
        const booking = data.bookings.find(x => x.id === btn.dataset.edit);
        if (booking) openBooking(booking.businessId, booking.id)
    } else if (btn.dataset.editService) editService(btn.dataset.editService); else if (btn.dataset.addService) editService(null); else if (btn.dataset.editProfessional) editProfessional(btn.dataset.editProfessional); else if (btn.dataset.addProfessional) editProfessional(null)
});
$('adminContent').addEventListener('change', event => {
    if (event.target?.id !== 'blockMode') return;
    const mode = event.target.value;
    $('blockEndLabel').hidden = mode !== 'range';
    $('blockTimeStartLabel').hidden = mode !== 'hours';
    $('blockTimeEndLabel').hidden = mode !== 'hours';
});

$('resetDemo').addEventListener('click', () => {
    askConfirmation(
        'Restaurar demonstração',
        'Todos os agendamentos e estabelecimentos cadastrados nesta demonstração serão apagados. Apenas a 027 Barbearia permanecerá.',
        () => {
            data = clone(seed);
            sessionStorage.removeItem(CLIENT_SESSION);
            renderAccount();
            category = 'Todos';
            save();
            renderFilters();
            renderBusinesses();
            openAdmin();
            notify('Dados de demonstração restaurados.');
        },
        true
    );
});
renderFilters();
renderBusinesses();
syncBusinessRoute();

$('partnerInterest').addEventListener('click', () => {
    $('partnerError').textContent = '';
    $('partnerDialog').showModal()
});
/* Cadastro guiado de serviços, sem sintaxe de ponto e vírgula. */
function addPartnerServiceRow(name = '', price = 0, duration = 30) {
    const container = $('partnerServices');
    const row = document.createElement('div');
    row.className = 'essence-service-row';
    row.innerHTML = `<label>Nome do serviço<input class="partner-service-name" required maxlength="80" placeholder="Ex.: Corte masculino"></label>
        <label>Preço (R$)<input class="partner-service-price" required></label>
        <label>Duração (minutos)<input class="partner-service-duration" type="number" min="15" max="240" step="15" required></label>
        <button type="button" class="essence-remove-service" aria-label="Remover serviço">Remover</button>`;
    row.querySelector('.partner-service-name').value = name;
    row.querySelector('.partner-service-duration').value = duration;
    formatPriceInput(row.querySelector('.partner-service-price'), price);
    row.querySelector('.essence-remove-service').addEventListener('click', () => {
        if (container.children.length > 1) row.remove();
        else notify('Cadastre pelo menos um serviço.');
    });
    container.appendChild(row);
}
$('addPartnerService').addEventListener('click', () => addPartnerServiceRow());
addPartnerServiceRow();

$('partnerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget, fd = new FormData(form), error = $('partnerError');
    error.textContent = '';
    const name = String(fd.get('businessName') || '').trim(), description = String(fd.get('description') || '').trim(),
        location = String(fd.get('location') || '').trim();
    const open = String(fd.get('open')), close = String(fd.get('close')), days = fd.getAll('day').map(Number);
    const pros = String(fd.get('professionals') || '').split('\n').map(x => x.trim()).filter(Boolean);
    const services = [];
    for (const row of $('partnerServices').querySelectorAll('.essence-service-row')) {
        const serviceName = row.querySelector('.partner-service-name').value.trim();
        const price = parsePriceInput(row.querySelector('.partner-service-price').value);
        const duration = Number(row.querySelector('.partner-service-duration').value);
        if (!serviceName || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 15 || duration > 240 || duration % 15 !== 0) {
            error.textContent = 'Confira o nome, preço e duração de cada serviço (15 a 240 minutos, em múltiplos de 15).';
            return;
        }
        services.push({id: 's' + Date.now() + services.length, name: serviceName, price, duration});
    }
    if (!name || !description || !location || !pros.length || !services.length || !days.length || minutes(close) <= minutes(open)) {
        error.textContent = 'Preencha todos os campos e selecione ao menos um dia. O fechamento deve ser após a abertura.';
        return
    }
    let image = null;
    const file = fd.get('image');
    if (file && file.size) {
        if (file.size > 250000) {
            error.textContent = 'Escolha uma imagem com até 250 KB para esta demonstração local.';
            return
        }
        image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file)
        })
    }
    const instagram = String(fd.get('instagram') || '').trim();
    const website = String(fd.get('website') || '').trim();
    const maps = String(fd.get('maps') || '').trim();
    const whatsapp = String(fd.get('whatsapp') || '').replace(/\D/g, '');
    if ((instagram && !safeExternalUrl(instagram)) || (website && !safeExternalUrl(website)) || (maps && !safeExternalUrl(maps)) || (whatsapp && (whatsapp.length < 10 || whatsapp.length > 13))) {
        error.textContent = 'Confira os links de Instagram, Maps e o WhatsApp com DDD.';
        return;
    }
    const id = 'b' + Date.now();
    data.businesses.push({
        catalogEnabled: fd.get('catalogEnabled') === 'yes',
        products: [], instagram, website, whatsapp, maps,
        id,
        name,
        category: String(fd.get('category')),
        description,
        location,
        image,
        icon: '✦',
        colors: ['#315879', '#132c43'],
        hours: {open, close, days},
        services,
        professionals: pros.map((name, i) => ({id: 'p' + Date.now() + i, name}))
    });
    save();
    renderFilters();
    category = 'Todos';
    renderFilters();
    renderBusinesses();
    form.reset();
    $('partnerServices').replaceChildren();
    addPartnerServiceRow();
    $('partnerDialog').close();
    notify('Estabelecimento criado nesta demonstração!');
    $('explorar').scrollIntoView({behavior: 'smooth'});
});



/* ============================================================
   ESSENCE — PERSISTÊNCIA DE INTERFACE APÓS F5
   Dados comerciais permanecem no localStorage. O estado temporário
   de navegação e formulários fica somente nesta aba (sessionStorage).
   ============================================================ */
const UI_STORE = 'essence_ui_v1';
let lastEditorAction = null;

function snapshotFields(root) {
    if (!root) return {};
    const result = {};
    root.querySelectorAll('input, textarea, select').forEach(el => {
        if (!el.id && !el.name) return;
        if (el.type === 'file' || el.type === 'password') return;
        const key = el.id || el.name;
        if (el.type === 'checkbox' || el.type === 'radio') {
            if (!el.name || el.type === 'checkbox') result[key] = el.checked;
        } else result[key] = el.value;
    });
    return result;
}

function restoreFields(root, values) {
    if (!root || !values) return;
    root.querySelectorAll('input, textarea, select').forEach(el => {
        const key = el.id || el.name;
        if (!key || !(key in values) || el.type === 'file') return;
        if (el.type === 'checkbox') el.checked = !!values[key];
        else if (el.type !== 'radio') el.value = values[key];
    });
}

function saveInterfaceState() {
    try {
        const dialogs = ['accountDialog', 'partnerDialog', 'bookingDialog', 'adminDialog', 'editorDialog', 'confirmDialog', 'noticesDialog', 'confirmationDialog'];
        const state = {
            dialogs: dialogs.filter(id => $(id)?.open),
            category,
            search: $('search').value,
            scrollY: window.scrollY,
            adminBusiness: $('adminBusiness').value,
            adminTab,
            adminFields: snapshotFields($('adminContent')),
            partnerFields: snapshotFields($('partnerForm')),
            partnerServices: [...$('partnerServices').querySelectorAll('.essence-service-row')].map(row => ({name: row.querySelector('.partner-service-name').value, price: parsePriceInput(row.querySelector('.partner-service-price').value), duration: row.querySelector('.partner-service-duration').value})),
            booking: {
                businessId: selectedBusiness,
                editingId,
                fields: snapshotFields($('bookingForm')),
                calendarView,
                calendarOpen: !$('bookingCalendar').hidden
            },
            noticesType: $('noticesDialogTitle').textContent.includes('indisponibilidade') ? 'absences' : 'general',
            editorAction: lastEditorAction,
            editorFields: snapshotFields($('editorForm')),
            confirmTitle: $('confirmTitle').textContent
        };
        sessionStorage.setItem(UI_STORE, JSON.stringify(state));
    } catch (error) {
        // Falha de armazenamento não pode impedir o uso do site.
        console.warn('Estado da interface não pôde ser salvo:', error);
    }
}

function restoreInterfaceState() {
    let state;
    try { state = JSON.parse(sessionStorage.getItem(UI_STORE) || 'null'); }
    catch { return; }
    if (!state || !Array.isArray(state.dialogs)) return;
    // Restaurar somente em recarregamento, não em uma visita nova.
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation?.type !== 'reload') return;

    $('search').value = state.search || '';
    category = ['Todos', ...data.businesses.map(b => b.category)].includes(state.category) ? state.category : 'Todos';
    renderFilters();
    renderBusinesses();

    const opened = state.dialogs;
    if (opened.includes('accountDialog')) openAccount();
    if (opened.includes('adminDialog') || opened.includes('editorDialog') || opened.includes('confirmDialog')) {
        openAdmin();
        if (findBusiness(state.adminBusiness)) $('adminBusiness').value = state.adminBusiness;
        const validTabs = ['appointments', 'services', 'professionals', 'settings', 'products'];
        adminTab = validTabs.includes(state.adminTab) ? state.adminTab : 'appointments';
        renderAdmin();
        restoreFields($('adminContent'), state.adminFields);
        if ($('blockMode')) $('blockMode').dispatchEvent(new Event('change', {bubbles: true}));
    }
    if (opened.includes('partnerDialog')) {
        $('partnerDialog').showModal();
        restoreFields($('partnerForm'), state.partnerFields);
        if (Array.isArray(state.partnerServices) && state.partnerServices.length) {
            $('partnerServices').replaceChildren();
            state.partnerServices.forEach(s => addPartnerServiceRow(s.name, s.price, s.duration));
        }
    }
    if (opened.includes('bookingDialog') && findBusiness(state.booking?.businessId)) {
        const bk = state.booking;
        const existing = bk.editingId && data.bookings.some(x => x.id === bk.editingId);
        openBooking(bk.businessId, existing ? bk.editingId : null);
        restoreFields($('bookingForm'), bk.fields);
        // O calendário e os horários são sempre recalculados contra os bloqueios atuais.
        if ($('dateInput').value && isEntireDayUnavailable(findBusiness(bk.businessId), $('dateInput').value)) {
            $('dateInput').value = '';
        }
        calendarView = /^\d{4}-\d{2}$/.test(bk.calendarView || '') ? bk.calendarView : today().slice(0, 7);
        renderCalendar();
        renderSlots();
        $('bookingCalendar').hidden = !bk.calendarOpen;
        $('calendarToggle').setAttribute('aria-expanded', String(!!bk.calendarOpen));
    }
    if (opened.includes('noticesDialog') && $('bookingDialog').open) openBookingNotices(state.noticesType);
    if (opened.includes('editorDialog') && $('adminDialog').open && state.editorAction) {
        const action = state.editorAction;
        const button = [...$('adminContent').querySelectorAll('button')].find(btn =>
            btn.dataset[action.key] === action.value);
        if (button) {
            button.click();
            restoreFields($('editorForm'), state.editorFields);
        }
    }
    // Confirmações destrutivas não são reexecutadas nem recriadas sem callback válido.
    if (opened.includes('confirmationDialog')) $('confirmationDialog').showModal();
    requestAnimationFrame(() => window.scrollTo(0, Math.max(0, Number(state.scrollY) || 0)));
}

// Captura a origem do editor para recriar corretamente sua lógica de salvamento.
$('adminContent').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    for (const key of ['editBusiness', 'editService', 'addService', 'editProfessional', 'addProfessional']) {
        if (key in button.dataset) {
            lastEditorAction = {key, value: button.dataset[key]};
            return;
        }
    }
}, true);

window.addEventListener('pagehide', saveInterfaceState);
window.addEventListener('beforeunload', saveInterfaceState);
restoreInterfaceState();
renderAccount();
