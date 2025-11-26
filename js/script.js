document.addEventListener('DOMContentLoaded', () => {
    // GSAP Animations
    // Suavidade ao scrollar ao clicar na navbar
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    const animate = {
        icons: () => {
            if (!window.gsap) return;
            gsap.from('.icon-add svg', { scale: 0.7, opacity: 0, duration: 0.7, ease: 'back.out(2)', delay: 1.2 });
            gsap.from('.icon-arrow svg', { x: -20, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.2, delay: 1.3 });

            document.querySelectorAll('.notion-btn, .calendar-nav-btn').forEach(btn => {
                const icon = btn.querySelector('.icon-add, .icon-arrow');
                if (!icon) return;
                const animation = gsap.to(icon, { y: -5, scale: 1.1, duration: 0.4, ease: 'power2.out', paused: true });
                btn.addEventListener('mouseenter', () => animation.play());
                btn.addEventListener('mouseleave', () => animation.reverse());
            });
        },
        entry: () => {
            if (!window.gsap) return;
            const timeline = gsap.timeline({ delay: 0.2 });
            timeline.from('.notion-section', { opacity: 0, y: 40, stagger: 0.1, duration: 0.8, ease: 'power2.out' })
                   .from('.notion-h2, .notion-h3', { opacity: 0, y: -20, duration: 0.7, ease: 'power2.out' }, "-=0.6")
                   .from('.resumo-cards .card', { opacity: 0, y: 30, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, "-=0.5")
                   .from('.calendar-tags .tag-badge', { opacity: 0, scale: 0.8, stagger: 0.05, duration: 0.5, ease: 'back.out(1.7)' }, "-=0.4");
        },
        modal: (modalElement) => {
            if (!window.gsap) return;
            gsap.fromTo(modalElement, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        },
        loading: (callback) => {
            const loadingScreen = document.getElementById('welcome-loading');
            if (!loadingScreen) return;
            if (window.gsap) {
                gsap.to(loadingScreen, { opacity: 0, duration: 0.8, delay: 1.5, onComplete: () => {
                    loadingScreen.classList.add('hidden');
                    if (callback) callback();
                }});
            } else {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    if (callback) callback();
                }, 2000);
            }
        },
        updateCards: (selector) => {
            if (!window.gsap) return;
            gsap.from(selector, { opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: 'power2.out' });
        }
    };

    // State
    let gastos = [];
    let categorias = new Set();
    let categoriaSelecionada = '';
    let dataAtual = new Date();
    let gastoEditIndex = null;

    // DOM Elements
    const elements = {
        btnAdicionar: document.getElementById('btn-adicionar'),
        modalForm: document.getElementById('modal-form'),
        btnCancelar: document.getElementById('btn-cancelar'),
        formGasto: document.getElementById('form-gasto'),
        tabelaBody: document.getElementById('tabela-body'),
        calendarDiv: document.getElementById('calendar'),
        calendarTags: document.getElementById('calendar-tags'),
        prevMesBtn: document.getElementById('prev-mes'),
        nextMesBtn: document.getElementById('next-mes'),
        calendarMesSpan: document.getElementById('calendar-mes'),
        gastosDiaCards: document.getElementById('gastos-dia-cards'),
        totalDividas: document.getElementById('total-dividas'),
        totalFaturas: document.getElementById('total-faturas'),
        totalPagamentos: document.getElementById('total-pagamentos'),
        themeBtn: document.getElementById('toggle-theme'),
        themeIcon: document.getElementById('theme-icon'),
    };

        // Funções AJAX para CRUD com PHP
        const apiUrl = 'php/gastos_crud.php';

        // CREATE
        async function criarGasto(gasto) {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', gasto })
            });
            return res.json();
        }

        // READ
        async function lerGastos() {
            const res = await fetch(apiUrl + '?action=read');
            return res.json();
        }

        // UPDATE
        async function atualizarGasto(id, gasto) {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', id, gasto })
            });
            return res.json();
        }

        // DELETE
        async function apagarGasto(id) {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            return res.json();
        }

    // Functions
        // Alert personalizado
        function showCustomAlert(message, type = 'info', icon = 'info') {
            const alertDiv = document.getElementById('custom-alert');
            if (!alertDiv) return;
            alertDiv.innerHTML = `<span class="material-icons">${icon}</span> ${message}`;
            alertDiv.className = `custom-alert ${type}`;
            setTimeout(() => {
                alertDiv.classList.remove('hidden');
            }, 10);
            setTimeout(() => {
                alertDiv.classList.add('hidden');
            }, 2200);
        }
    const saveData = () => localStorage.setItem('gastos', JSON.stringify(gastos));
    // Substituir saveData por função que atualiza categorias
    const updateCategorias = () => {
        categorias = new Set(gastos.map(g => g.categoria).filter(Boolean));
    };

    const updateResumo = () => {
        const totais = gastos.reduce((acc, g) => {
            const valor = parseFloat(g.valor) || 0;
            acc.faturas += valor;
            if (g.status === 'pendente') acc.dividas += valor;
            if (g.status === 'pago') acc.pagamentos += valor;
            return acc;
        }, { dividas: 0, faturas: 0, pagamentos: 0 });

        elements.totalDividas.textContent = `R$ ${totais.dividas.toFixed(2)}`;
        elements.totalFaturas.textContent = `R$ ${totais.faturas.toFixed(2)}`;
        elements.totalPagamentos.textContent = `R$ ${totais.pagamentos.toFixed(2)}`;
    };

    const updateTabela = () => {
        elements.tabelaBody.innerHTML = '';
        const filteredGastos = gastos.filter(g => categoriaSelecionada === '' || g.categoria === categoriaSelecionada);

        if (filteredGastos.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6;
            td.textContent = 'Nenhum gasto encontrado.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            elements.tabelaBody.appendChild(tr);
            return;
        }

        filteredGastos.forEach((gasto, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.index = gastos.indexOf(gasto);
                tr.innerHTML = `
                    <td>${gasto.nome}</td>
                    <td>R$ ${parseFloat(gasto.valor).toFixed(2)}</td>
                    <td>${new Date(gasto.vencimento + 'T00:00:00-03:00').toLocaleDateString()}</td>
                    <td class="status-${gasto.status}">${gasto.status}</td>
                    <td><span class="categoria-badge">${gasto.categoria || ''}</span></td>
                    <td class="actions" style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                        <button class="edit-btn icon-btn" title="Editar">
                            <span class="material-icons" style="color:#4F8EF7;font-size:22px;">edit</span>
                        </button>
                        <button class="delete-btn icon-btn" title="Excluir">
                            <span class="material-icons" style="color:#F75F4F;font-size:22px;">delete</span>
                        </button>
                    </td>
                `;
            elements.tabelaBody.appendChild(tr);
        });
        updateResumo();
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(elements.formGasto);
        const data = Object.fromEntries(formData.entries());

        if (gastoEditIndex !== null && gastos[gastoEditIndex] && gastos[gastoEditIndex].id) {
            // Atualizar gasto
            atualizarGasto(gastos[gastoEditIndex].id, data).then(res => {
                if (res.success) {
                    showCustomAlert('Gasto atualizado com sucesso!', 'success', 'check_circle');
                    carregarGastos();
                } else {
                    showCustomAlert('Erro ao atualizar gasto!', 'error', 'error');
                }
            });
        } else {
            // Criar gasto
            criarGasto(data).then(res => {
                if (res.success) {
                    showCustomAlert('Gasto cadastrado com sucesso!', 'success', 'check_circle');
                    carregarGastos();
                } else {
                    showCustomAlert('Erro ao cadastrar gasto!', 'error', 'error');
                }
            });
        }
        closeModal();
    };

    const openModal = (gasto, index) => {
        gastoEditIndex = index;
        elements.formGasto.reset();
        if (gasto) {
            Object.entries(gasto).forEach(([key, value]) => {
                if (elements.formGasto[key]) elements.formGasto[key].value = value;
            });
        }
        elements.modalForm.classList.remove('hidden');
        animate.modal(elements.modalForm);
    };

    const closeModal = () => {
        elements.modalForm.classList.add('hidden');
        gastoEditIndex = null;
    };

    const handleTableClick = (e) => {
        let btn = e.target;
        if (btn.tagName === 'SPAN' && btn.classList.contains('material-icons')) {
            btn = btn.closest('button');
        }
        const tr = btn.closest('tr');
        if (!tr) return;
        const index = parseInt(tr.dataset.index, 10);
        if (isNaN(index) || !gastos[index]) return;

        if (btn.classList.contains('edit-btn')) {
            openModal(gastos[index], index);
        } else if (btn.classList.contains('delete-btn')) {
            if (btn.classList.contains('confirming')) return;
            btn.classList.add('confirming');
            showCustomAlert(`Clique novamente para confirmar exclusão de "${gastos[index].nome}"`, 'error', 'warning');
            btn.disabled = true;
            setTimeout(() => { btn.disabled = false; }, 2200);
            btn.addEventListener('click', function confirmar(e2) {
                btn.classList.remove('confirming');
                btn.removeEventListener('click', confirmar);
                const trAtual = btn.closest('tr');
                const idxAtual = trAtual ? parseInt(trAtual.dataset.index, 10) : index;
                if (!isNaN(idxAtual) && gastos[idxAtual] && gastos[idxAtual].id) {
                    apagarGasto(gastos[idxAtual].id).then(res => {
                        if (res.success) {
                            showCustomAlert('Gasto excluído com sucesso!', 'success', 'check_circle');
                            carregarGastos();
                        } else {
                            showCustomAlert('Erro ao excluir gasto!', 'error', 'error');
                        }
                    });
                }
            }, { once: true });
        }
    };

    const renderCategoriaTags = () => {
        elements.calendarTags.innerHTML = '';
        const allTag = document.createElement('span');
        allTag.className = `tag-badge ${categoriaSelecionada === '' ? 'selected' : ''}`;
        allTag.textContent = 'Todas';
        allTag.addEventListener('click', () => {
            categoriaSelecionada = '';
            renderCategoriaTags();
            updateTabela();
            renderCalendario();
        });
        elements.calendarTags.appendChild(allTag);

        categorias.forEach(cat => {
            const tag = document.createElement('span');
            tag.className = `tag-badge ${categoriaSelecionada === cat ? 'selected' : ''}`;
            tag.textContent = cat;
            tag.addEventListener('click', () => {
                categoriaSelecionada = categoriaSelecionada === cat ? '' : cat;
                renderCategoriaTags();
                updateTabela();
                renderCalendario();
            });
            elements.calendarTags.appendChild(tag);
        });
    };

    const renderCalendario = () => {
        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();
        elements.calendarMesSpan.textContent = `${dataAtual.toLocaleString('default', { month: 'long' })} ${ano}`;

        const primeiroDia = new Date(ano, mes, 1).getDay();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();

        let html = '<div class="calendar-grid">';
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(dia => {
            html += `<div class="calendar-header">${dia}</div>`;
        });

        for (let i = 0; i < primeiroDia; i++) html += '<div class="other-month"></div>';

        for (let dia = 1; dia <= diasNoMes; dia++) {
            const data = new Date(ano, mes, dia);
            const dataStr = data.toISOString().slice(0, 10);
            const eventos = gastos.filter(g => g.vencimento === dataStr && (categoriaSelecionada === '' || g.categoria === categoriaSelecionada));
            const isToday = data.toDateString() === new Date().toDateString();
            html += `<div class="calendar-day ${isToday ? 'today' : ''} ${eventos.length > 0 ? 'event' : ''}" data-date="${dataStr}">${dia}</div>`;
        }
        html += '</div>';
        elements.calendarDiv.innerHTML = html;
    };

    const renderGastosDoDia = (dateStr) => {
        const gastosDia = gastos.filter(g => g.vencimento === dateStr && (categoriaSelecionada === '' || g.categoria === categoriaSelecionada));
        elements.gastosDiaCards.innerHTML = '';

        if (gastosDia.length === 0) {
            elements.gastosDiaCards.innerHTML = '<p class="no-gastos">Nenhum gasto para este dia.</p>';
            return;
        }

        gastosDia.forEach(g => {
            const card = document.createElement('div');
            card.className = 'gasto-dia-card';
            card.dataset.status = g.status;
            card.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
            card.style.borderRadius = '14px';
            card.style.border = '1px solid #282828';
            card.style.background = 'rgba(30,30,40,0.98)';
            card.style.padding = '18px 20px 12px 20px';
            card.style.marginBottom = '16px';
            card.style.transition = 'box-shadow 0.3s';
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = '0 4px 24px rgba(124,108,247,0.18)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
            });
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 6px;">
                    <span style="display: flex; align-items: center; justify-content: center; background: #222; border-radius: 50%; width: 38px; height: 38px; min-width: 38px;">
                        <span class="material-icons" style="color: #7c6cf7; font-size: 24px;">account_balance_wallet</span>
                    </span>
                    <div style="display: flex; flex-direction: column; justify-content: center; flex: 1;">
                        <strong class="gasto-nome" style="font-size: 1.13em; color: #b7aaff; line-height: 1.1;">${g.nome}</strong>
                        <span class="gasto-valor" style="color: #4af77a; font-weight: bold; font-size: 1.08em; margin-top: 2px;">R$ ${parseFloat(g.valor).toFixed(2)}</span>
                        <span class="gasto-status" style="color: ${g.status === 'pendente' ? '#F75F4F' : '#4af77a'}; font-weight: 500; font-size: 1em; letter-spacing: 0.5px;">${g.status}</span>
                    </div>
                    <span class="gasto-categoria" style="background: #444; color: #ffe08a; border-radius: 8px; padding: 6px 18px; font-size: 0.97em; font-weight: 500; display: flex; align-items: center; justify-content: center; height: 32px;">${g.categoria}</span>
                </div>

            `;
            elements.gastosDiaCards.appendChild(card);
        });
        animate.updateCards('.gasto-dia-card');
    };

    // Corrigir lógica do tema claro/escuro
    const setupTheme = () => {
        const setTheme = (isLight) => {
            document.body.classList.toggle('light', isLight);
            if (elements.themeIcon) {
                elements.themeIcon.textContent = isLight ? '🌞' : '🌙';
            }
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        };
        if (elements.themeBtn) {
            elements.themeBtn.addEventListener('click', () => {
                const isLight = !document.body.classList.contains('light');
                setTheme(isLight);
            });
        }
        setTheme(localStorage.getItem('theme') === 'light');
    };

    // Event Listeners
    elements.btnAdicionar.addEventListener('click', () => openModal(null, null));
    elements.btnCancelar.addEventListener('click', closeModal);
    elements.formGasto.addEventListener('submit', handleFormSubmit);
    elements.tabelaBody.addEventListener('click', handleTableClick);

    elements.prevMesBtn.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderCalendario();
    });
    elements.nextMesBtn.addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderCalendario();
    });

    elements.calendarDiv.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('calendar-day') && target.dataset.date) {
            document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
            target.classList.add('selected');
            renderGastosDoDia(target.dataset.date);
        }
    });

    // Initial Load
    // Função para carregar gastos do backend
    function carregarGastos() {
        lerGastos().then(res => {
            if (res.success && Array.isArray(res.gastos)) {
                gastos = res.gastos;
                updateCategorias();
                updateTabela();
                renderCategoriaTags();
                renderCalendario();
            } else {
                gastos = [];
                updateCategorias();
                updateTabela();
                renderCategoriaTags();
                renderCalendario();
            }
        });
    }

    const init = () => {
        animate.loading(() => {
            animate.entry();
            animate.icons();
        });
        setupTheme();
        carregarGastos();
        // Select today by default
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayEl = document.querySelector(`.calendar-day[data-date="${todayStr}"]`);
        if (todayEl) {
            todayEl.classList.add('selected');
            renderGastosDoDia(todayStr);
        }
        // Relógio ao vivo na navbar
        const clockEl = document.getElementById('navbar-clock');
        function updateClock() {
            const now = new Date();
            const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const diaSemana = dias[now.getDay()];
            const dia = String(now.getDate()).padStart(2, '0');
            const mes = meses[now.getMonth()];
            const ano = now.getFullYear();
            const hora = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const seg = String(now.getSeconds()).padStart(2, '0');
            const dateStr = `${dia} de ${mes} de ${ano}`;
            //const timeStr = `${hora}:${min}:${seg}`;
            if (clockEl) clockEl.textContent = `${diaSemana} - ${dateStr}`; //`${timeStr}`;
        }
        updateClock();
        setInterval(updateClock, 1000);
    };

    init();
});