"use strict";
/* ESSENCE — Protótipo acadêmico exploratório.
   Sem servidor, autenticação, pagamentos ou mensagens reais.
   Dados e reservas são locais ao navegador (localStorage). */
const STORE = 'essence_demo_v3';
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
        },
        {
            id: 'b2',
            name: 'Studio Aurora',
            category: 'Salão',
            description: 'Beleza e autoestima com atendimento personalizado para todos os estilos.',
            location: 'Belo Horizonte · Savassi',
            icon: '✦',
            colors: ['#9b7898', '#463d69'],
            services: [{id: 's4', name: 'Escova', price: 65, duration: 60}, {
                id: 's5',
                name: 'Corte feminino',
                price: 95,
                duration: 60
            }, {id: 's6', name: 'Hidratação', price: 110, duration: 90}],
            professionals: [{id: 'p3', name: 'Marina Lopes'}, {id: 'p4', name: 'Camila Souza'}]
        },
        {
            id: 'b3',
            name: 'Pet & Care',
            category: 'Petshop',
            description: 'Banho, tosa e carinho para o seu melhor amigo.',
            location: 'Belo Horizonte · Funcionários',
            icon: '♧',
            colors: ['#4b8d94', '#244d66'],
            services: [{id: 's7', name: 'Banho', price: 55, duration: 60}, {
                id: 's8',
                name: 'Banho e tosa',
                price: 100,
                duration: 90
            }],
            professionals: [{id: 'p5', name: 'Renata Lima'}, {id: 'p6', name: 'Pedro Alves'}]
        },
        {
            id: 'b4',
            name: 'Serena Spa',
            category: 'Spa',
            description: 'Uma pausa na rotina com experiências de relaxamento e bem-estar.',
            location: 'Belo Horizonte · Lourdes',
            icon: '❋',
            colors: ['#698e84', '#284f58'],
            services: [{id: 's9', name: 'Massagem relaxante', price: 150, duration: 60}, {
                id: 's10',
                name: 'Spa dos pés',
                price: 85,
                duration: 45
            }],
            professionals: [{id: 'p7', name: 'Bianca Ribeiro'}]
        },
        {
            id: 'b5',
            name: 'Ateliê das Unhas',
            category: 'Estética',
            description: 'Manicure, pedicure e cuidado com cada detalhe.',
            location: 'Belo Horizonte · Floresta',
            icon: '✧',
            colors: ['#b783a1', '#694e79'],
            services: [{id: 's11', name: 'Manicure', price: 35, duration: 45}, {
                id: 's12',
                name: 'Manicure e pedicure',
                price: 65,
                duration: 90
            }],
            professionals: [{id: 'p8', name: 'Juliana Reis'}, {id: 'p9', name: 'Fernanda Melo'}]
        },
        {
            id: 'b6',
            name: 'Essencial Beauty',
            category: 'Estética',
            description: 'Tratamentos faciais e cuidados estéticos para renovar sua essência.',
            location: 'Belo Horizonte · Pampulha',
            icon: '◇',
            colors: ['#6985a5', '#283f67'],
            services: [{id: 's13', name: 'Limpeza de pele', price: 120, duration: 60}, {
                id: 's14',
                name: 'Design de sobrancelhas',
                price: 45,
                duration: 30
            }],
            professionals: [{id: 'p10', name: 'Aline Castro'}]
        }
    ],
    bookings: []
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

let data = load(), category = 'Todos', selectedBusiness = null, editingId = null, adminTab = 'appointments';

function save() {
    try {
        localStorage.setItem(STORE, JSON.stringify(data))
    } catch {
        notify('Não foi possível salvar neste navegador.')
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]))
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

function renderBusinesses() {
    const q = $('search').value.trim().toLocaleLowerCase('pt-BR');
    const list = data.businesses.filter(b => (category === 'Todos' || b.category === category) && [b.name, b.category, b.description, b.location, ...b.services.map(s => s.name)].join(' ').toLocaleLowerCase('pt-BR').includes(q));
    $('resultCount').textContent = `${list.length} estabelecimento${list.length === 1 ? '' : 's'}`;
    $('businessGrid').innerHTML = list.length ? list.map(b => `<article class="business-card"><div class="card-cover" style="--cover1:${b.colors[0]};--cover2:${b.colors[1]}"><span class="category-tag">${escapeHtml(b.category)}</span>${b.image ? `<img class="business-logo" src="${escapeHtml(b.image)}" alt="Logo de ${escapeHtml(b.name)}" loading="lazy">` : b.id === 'b1' ? '<img class="business-logo" src="assets/027-barbearia.png" alt="Logo 027 Barbearia" loading="lazy">' : `<span class="cover-icon">${escapeHtml(b.icon)}</span>`}</div><div class="card-content"><h3>${escapeHtml(b.name)}</h3><p>${escapeHtml(b.description)}</p><div class="card-meta">⌖ ${escapeHtml(b.location)} · ${b.professionals.length} profissional(is)</div><div class="card-footer"><span>A partir de ${money(Math.min(...b.services.map(s => s.price)))}</span><button type="button" data-book="${b.id}">Agendar →</button></div></div></article>`).join('') : '<p class="empty">Nenhum estabelecimento encontrado. Experimente outra busca.</p>'
}

function selectOptions(items, label) {
    return items.map(x => `<option value="${escapeHtml(x.id)}">${escapeHtml(label(x))}</option>`).join('')
}

function openBooking(businessId, bookingId = null) {
    selectedBusiness = businessId;
    editingId = bookingId;
    const b = findBusiness(businessId);
    if (!b) return;
    const existing = bookingId ? data.bookings.find(x => x.id === bookingId) : null;
    $('bookingTitle').textContent = existing ? 'Reagendar atendimento' : b.name;
    $('serviceSelect').innerHTML = selectOptions(b.services, s => `${s.name} · ${money(s.price)} · ${s.duration} min`);
    $('professionalSelect').innerHTML = selectOptions(b.professionals, p => p.name);
    $('dateInput').min = today();
    $('dateInput').value = existing?.date || today();
    $('serviceSelect').value = existing?.serviceId || b.services[0]?.id;
    $('professionalSelect').value = existing?.professionalId || b.professionals[0]?.id;
    $('clientName').value = existing?.clientName || '';
    $('clientPhone').value = existing?.clientPhone || '';
    $('timeInput').value = existing?.time || '';
    $('bookingError').textContent = '';
    renderSlots();
    $('adminDialog').close();
    $('bookingDialog').showModal()
}

function conflicts(businessId, professionalId, date, start, duration, exceptId) {
    const end = start + duration;
    return data.bookings.some(x => x.id !== exceptId && x.status === 'active' && x.businessId === businessId && x.professionalId === professionalId && x.date === date && start < minutes(x.time) + x.duration && end > minutes(x.time))
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
    if (!service || !date || !professionalId) return;
    const day = new Date(date + 'T12:00:00').getDay();
    const hours = b.hours || {open: '09:00', close: '18:00', days: [0, 1, 2, 3, 4, 5, 6]};
    if (!hours.days.includes(day)) {
        $('slotsContainer').textContent = 'O estabelecimento não atende neste dia.';
        return
    }
    const opening = minutes(hours.open), closing = minutes(hours.close);
    for (let start = opening; start + service.duration <= closing; start += 30) {
        const time = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`;
        const disabled = dateTime(date, time) <= new Date() || conflicts(b.id, professionalId, date, start, service.duration, editingId);
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
    if (!b || !service || !pro || !date || !time || name.length < 2 || phone.replace(/\D/g, '').length < 10) {
        err.textContent = 'Preencha nome, telefone válido, data e selecione um horário disponível.';
        return
    }
    if (dateTime(date, time) <= new Date()) {
        err.textContent = 'Escolha um horário futuro.';
        renderSlots();
        return
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
    $('statClients').textContent = new Set(active.map(x => x.clientPhone)).size;
    $('statServices').textContent = b.services.length;
    document.querySelectorAll('[data-tab]').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === adminTab));
    let html = '';
    if (adminTab === 'appointments') {
        const bookings = data.bookings.filter(x => x.businessId === b.id).sort((a, z) => `${a.date}${a.time}`.localeCompare(`${z.date}${z.time}`));
        html = bookings.length ? bookings.map(x => `<div class="admin-item"><div><strong>${escapeHtml(x.clientName)} ${x.status === 'cancelled' ? '· Cancelado' : ''}</strong><small>${localDate(x.date)} às ${x.time} · ${escapeHtml(findService(b, x.serviceId)?.name || 'Serviço removido')}<br>${escapeHtml(findProfessional(b, x.professionalId)?.name || 'Profissional removido')} · ${escapeHtml(x.clientPhone)}</small></div><div class="admin-actions">${x.status === 'active' ? `<button data-edit="${x.id}">Reagendar</button><button data-cancel="${x.id}">Cancelar</button>` : ''}</div></div>`).join('') : '<p class="muted">Ainda não há agendamentos. Faça uma reserva pelo site para testar.</p>'
    } else if (adminTab === 'services') {
        html = b.services.map(s => `<div class="admin-item"><div><strong>${escapeHtml(s.name)}</strong><small>${money(s.price)} · ${s.duration} minutos</small></div><button data-edit-service="${s.id}">Editar</button></div>`).join('') + '<button class="secondary-button" data-add-service="1">+ Adicionar serviço</button>'
    } else if (adminTab === 'professionals') {
        html = b.professionals.map(p => `<div class="admin-item"><strong>${escapeHtml(p.name)}</strong><button data-edit-professional="${p.id}">Editar</button></div>`).join('') + '<button class="secondary-button" data-add-professional="1">+ Adicionar profissional</button>'
    } else {
        const clients = [...new Map(data.bookings.filter(x => x.businessId === b.id).map(x => [x.clientPhone, {
            name: x.clientName,
            phone: x.clientPhone
        }])).values()];
        html = clients.length ? clients.map(c => `<div class="admin-item"><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.phone)}</small></div>`).join('') : '<p class="muted">Clientes aparecem após realizar um agendamento.</p>'
    }
    $('adminContent').innerHTML = `<div class="admin-list">${html}</div>`
}

function editService(id) {
    const b = findBusiness($('adminBusiness').value), s = b.services.find(x => x.id === id);
    const name = prompt('Nome do serviço:', s?.name || '');
    if (name === null) return;
    if (!name.trim()) return notify('Informe um nome.');
    const priceText = prompt('Preço em reais:', String(s?.price ?? 50));
    if (priceText === null) return;
    const durationText = prompt('Duração em minutos (múltiplo de 30):', String(s?.duration ?? 30));
    if (durationText === null) return;
    const price = Number(priceText.replace(',', '.')), duration = Number(durationText);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 30 || duration % 30 !== 0 || duration > 240) return notify('Preço ou duração inválidos.');
    if (s) {
        Object.assign(s, {name: name.trim(), price, duration})
    } else b.services.push({id: `s${Date.now()}`, name: name.trim(), price, duration});
    save();
    renderAdmin();
    renderBusinesses();
    notify('Serviço salvo.')
}

function editProfessional(id) {
    const b = findBusiness($('adminBusiness').value), p = b.professionals.find(x => x.id === id);
    const name = prompt('Nome do profissional:', p?.name || '');
    if (name === null) return;
    if (!name.trim()) return notify('Informe um nome.');
    if (p) p.name = name.trim(); else b.professionals.push({id: `p${Date.now()}`, name: name.trim()});
    save();
    renderAdmin();
    renderBusinesses();
    notify('Profissional salvo.')
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
    const btn = e.target.closest('[data-book]');
    if (btn) openBooking(btn.dataset.book)
});
$('search').addEventListener('input', renderBusinesses);
$('clearSearch').addEventListener('click', () => {
    $('search').value = '';
    renderBusinesses();
    $('search').focus()
});
$('adminNav').addEventListener('click', openAdmin);
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => $(btn.dataset.close).close()));
['serviceSelect', 'professionalSelect', 'dateInput'].forEach(id => $(id).addEventListener('change', renderSlots));
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
        if (booking && confirm('Cancelar este agendamento?')) {
            booking.status = 'cancelled';
            save();
            renderAdmin();
            notify('Agendamento cancelado.')
        }
    } else if (btn.dataset.edit) {
        const booking = data.bookings.find(x => x.id === btn.dataset.edit);
        if (booking) openBooking(booking.businessId, booking.id)
    } else if (btn.dataset.editService) editService(btn.dataset.editService); else if (btn.dataset.addService) editService(null); else if (btn.dataset.editProfessional) editProfessional(btn.dataset.editProfessional); else if (btn.dataset.addProfessional) editProfessional(null)
});
$('resetDemo').addEventListener('click', () => {
    if (!confirm('Restaurar os dados? Todos os agendamentos e alterações desta demonstração serão apagados.')) return;
    data = clone(seed);
    save();
    renderFilters();
    renderBusinesses();
    openAdmin();
    notify('Dados de demonstração restaurados.')
});
renderFilters();
renderBusinesses();

$('partnerInterest').addEventListener('click', () => {
    $('partnerError').textContent = '';
    $('partnerDialog').showModal()
});
$('partnerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget, fd = new FormData(form), error = $('partnerError');
    error.textContent = '';
    const name = String(fd.get('businessName') || '').trim(), description = String(fd.get('description') || '').trim(),
        location = String(fd.get('location') || '').trim();
    const open = String(fd.get('open')), close = String(fd.get('close')), days = fd.getAll('day').map(Number);
    const pros = String(fd.get('professionals') || '').split('\n').map(x => x.trim()).filter(Boolean);
    const rows = String(fd.get('services') || '').split('\n').map(x => x.trim()).filter(Boolean);
    const services = [];
    for (const line of rows) {
        const parts = line.split(';').map(x => x.trim());
        const price = Number((parts[1] || '').replace(',', '.')), duration = Number(parts[2]);
        if (parts.length !== 3 || !parts[0] || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 30 || duration > 240 || duration % 30 !== 0) {
            error.textContent = 'Serviços: use uma linha por serviço, no formato Nome; preço; duração (múltiplo de 30).';
            return
        }
        services.push({id: 's' + Date.now() + services.length, name: parts[0], price, duration})
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
    const id = 'b' + Date.now();
    data.businesses.push({
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
    $('partnerDialog').close();
    notify('Estabelecimento criado nesta demonstração!');
    $('explorar').scrollIntoView({behavior: 'smooth'});
});
