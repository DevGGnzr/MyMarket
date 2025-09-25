// script.js — Lógica global do site
// Páginas:
// - Login (index): autenticação simples com lembrar-me, toggle de senha, cadastro com validação e medidor de força
// - Catálogo (catalogo): renderização de produtos, filtros (busca topo, facetas, preço com slider duplo), modal de produto, contador do carrinho
// - Perfil: popover do usuário e modal "Alterar senha" com validação e medidor de força
// Observação: carrinho/checkout estão em carrinho.js
document.addEventListener('DOMContentLoaded', () => {
    // Atualiza ano do rodapé
    document.querySelectorAll('.js-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });

    /* ======== MODAL DE CADASTRO ======== */
  const cadModal = document.getElementById('cadModal');
  const openCadastro = document.getElementById('openCadastro');
  const closeModal = document.getElementById('closeModal');
  
    // Limpa mensagens/estilos do modal de cadastro
    function resetCadastroUI() {
      const cadastroForm = document.getElementById('cadastroForm');
      if (!cadastroForm) return;
      const msg = document.getElementById('cadMsg');
      const helper = document.getElementById('cadConfirmHelper');
      msg.textContent = '';
      msg.classList.remove('msg-success', 'msg-error');
      helper.textContent = '';
      cadastroForm.cadPass?.classList.remove('input-error');
      cadastroForm.cadPassConfirm?.classList.remove('input-error');
    }

    if (openCadastro) {
      openCadastro.addEventListener('click', e => {
        e.preventDefault();
        resetCadastroUI();
        cadModal.classList.remove('hidden');
      });
    }
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        cadModal.classList.add('hidden');
        resetCadastroUI();
      });
    }
    window.addEventListener('click', e => {
      if (e.target === cadModal) {
        cadModal.classList.add('hidden');
        resetCadastroUI();
      }
    });
  
    // Mede força da senha (0 fraca, 1 média, 2 forte) — critério mínimo: 8+ com maiúscula e número
    function avaliarForcaSenha(pwd) {
      if (!pwd) return 0; // vazio -> fraca
      const hasLen = pwd.length >= 8;
      const hasUpperAndNum = /[A-Z]/.test(pwd) && /\d/.test(pwd);
      // Política mínima atendida => considerar BOA (verde)
      if (hasLen && hasUpperAndNum) return 2; // strong
      // Se tem uma das duas condições, considerar MEDIANA para dar direção
      if (hasLen || hasUpperAndNum) return 1; // medium
      // Senão, RUIM
      return 0; // weak
    }

    // Atualiza o componente visual do medidor de força
    function atualizarStrengthMeter(container, pwd, inputEl) {
      if (!container) return;
      const level = avaliarForcaSenha(pwd);
      container.classList.remove('is-weak','is-medium','is-strong');
      const labelEl = container.querySelector('.label');
      const bar = container.querySelector('.bar');
      // Reset input tint
      if (inputEl) inputEl.classList.remove('pwd-weak','pwd-medium','pwd-strong');
      // Empty state -> clear bar
      if (!pwd) {
        container.classList.add('is-weak');
        container.style.setProperty('--pwd-strength','0%');
        if (labelEl) labelEl.textContent = 'Força: ruim';
        return;
      }
      if (level === 0) {
        container.classList.add('is-weak');
        container.style.setProperty('--pwd-strength','33%');
        if (labelEl) labelEl.textContent = 'Força: ruim';
        if (inputEl) inputEl.classList.add('pwd-weak');
      } else if (level === 1) {
        container.classList.add('is-medium');
        container.style.setProperty('--pwd-strength','66%');
        if (labelEl) labelEl.textContent = 'Força: mediana';
        if (inputEl) inputEl.classList.add('pwd-medium');
      } else {
        container.classList.add('is-strong');
        container.style.setProperty('--pwd-strength','100%');
        if (labelEl) labelEl.textContent = 'Força: boa';
        if (inputEl) inputEl.classList.add('pwd-strong');
      }
    }
  
    /* ===== VARIÁVEIS GERAIS ===== */
  const loginForm = document.getElementById('loginForm');
  const cadastroForm = document.getElementById('cadastroForm');
  const listaProdutos = document.getElementById('listaProdutos');
  const topSearchForm = document.getElementById('topSearch');
  const topSearchInput = document.getElementById('topSearchInput');
  const perfilBtn = document.getElementById('perfilBtn');
  const perfilMenu = document.getElementById('perfilMenu');
  const openCarrinhoBtn = document.getElementById('openCarrinho');
  const cartDot = document.getElementById('cartDot');
  const perfilNome = document.getElementById('perfilNome');
  const carrinhoQtd = document.getElementById('carrinhoQtd');
  const listaCarrinho = document.getElementById('listaCarrinho');
  const headerEl = document.querySelector('.header');
  const collapsibleGroups = document.querySelectorAll('[data-collapsible]');
  const menuAlterarSenha = document.getElementById('menuAlterarSenha');
  // Modal de alterar senha (catálogo)
  const alterarSenhaModal = document.getElementById('alterarSenhaModal');
  const alterarSenhaClose = document.getElementById('alterarSenhaClose');
  const alterarSenhaCancelar = document.getElementById('alterarSenhaCancelar');
  const alterarSenhaForm = document.getElementById('alterarSenhaForm');
  const alterarSenhaMsg = document.getElementById('alterarSenhaMsg');
  const altStrength = document.getElementById('altStrength');
  const senhaNova = document.getElementById('senhaNova');
  // (Modal de perfil removido) refs não são mais necessários
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  
  // Header dinâmico ao rolar a página
  function updateHeaderOnScroll() {
    if (!headerEl) return;
    const scrolled = window.scrollY > 8;
    headerEl.classList.toggle('header--scrolled', scrolled);
  }
  updateHeaderOnScroll();
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

  // Ajusta o offset da sidebar para caber sob o header sticky
  function updateSidebarTopOffset() {
    const header = document.querySelector('.header');
    const root = document.documentElement;
    if (!header || !root) return;
    const rect = header.getBoundingClientRect();
    // Usa a altura atual do header (sticky) como base
    const headerHeight = rect.height || header.offsetHeight || 74;
    root.style.setProperty('--sidebar-top', headerHeight + 10 + 'px');
  }
  updateSidebarTopOffset();
  window.addEventListener('resize', updateSidebarTopOffset);
  window.addEventListener('scroll', updateSidebarTopOffset, { passive: true });

  // Colapsar/expandir grupos de filtros (facetas)
  function setupCollapsibles() {
    collapsibleGroups.forEach(group => {
      const btn = group.querySelector('.group-toggle');
      const list = group.querySelector('.facet-list');
      if (!btn || !list) return;
      btn.addEventListener('click', () => {
        const isCollapsed = group.classList.toggle('is-collapsed');
        group.classList.toggle('is-expanded', !isCollapsed);
        btn.setAttribute('aria-expanded', String(!isCollapsed));
        list.hidden = isCollapsed;
      });
      // Começa colapsado por padrão
      group.classList.add('is-collapsed');
      group.classList.remove('is-expanded');
      btn.setAttribute('aria-expanded', 'false');
      list.hidden = true;
    });
  }
  setupCollapsibles();
  
  // Sincroniza carrinho no storage e atualiza badge/lista do header
  function atualizarCarrinho() {
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      if (carrinhoQtd) carrinhoQtd.textContent = carrinho.length;
      if (cartDot) cartDot.classList.toggle('hidden', carrinho.length === 0);
      if (listaCarrinho) {
        listaCarrinho.innerHTML = carrinho.map(item =>
          `<div>${item.nome} - R$ ${item.preco}</div>`).join('');
      }
    }
    atualizarCarrinho();
  
    /* ===== LOGIN ===== */
    if (loginForm) {
      // Preenche usuário salvo (lembrar-me)
      const savedUser = localStorage.getItem('rememberUser');
      if (savedUser) {
        loginForm.loginUser.value = savedUser;
        const remember = document.getElementById('rememberMe');
        if (remember) remember.checked = true;
      }

      // Alternar visibilidade da senha
      const toggleBtn = document.getElementById('toggleLoginPass');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const inp = document.getElementById('loginPass');
          if (!inp) return;
          const isPassword = inp.type === 'password';
          inp.type = isPassword ? 'text' : 'password';
          // Atualiza ícone e rótulo acessível
          toggleBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
          toggleBtn.title = isPassword ? 'Ocultar senha' : 'Mostrar senha';
          const svg = toggleBtn.querySelector('svg');
          if (svg) {
            // Alterna ícone entre eye e eye-off
            if (isPassword) {
              svg.innerHTML = '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.08-5.96"/>\
                <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 3-3"/>\
                <path d="M1 1l22 22"/>\
              </g>';
            } else {
              svg.innerHTML = '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>\
                <circle cx="12" cy="12" r="3"/>\
              </g>';
            }
          }
        });
      }

      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const user = loginForm.loginUser.value;
        const pass = loginForm.loginPass.value;
        const found = usuarios.find(u => u.nome === user && u.senha === pass);
  
        if (found) {
          const remember = document.getElementById('rememberMe');
          if (remember && remember.checked) localStorage.setItem('rememberUser', user);
          else localStorage.removeItem('rememberUser');
          localStorage.setItem('usuarioLogado', user);
          window.location = 'catalogo.html';
        } else {
          document.getElementById('loginMsg').innerText = 'Usuário ou senha inválidos';
        }
      });
    }
  
    /* ===== CADASTRO ===== */
    if (cadastroForm) {
      const passEl = cadastroForm.querySelector('#cadPass');
      const confirmEl = cadastroForm.querySelector('#cadPassConfirm');
      const helper = document.getElementById('cadConfirmHelper');
      const cadStrength = document.getElementById('cadStrength');

      // Valida confirmação de senha e aplica feedback visual
      function validarConfirmacao() {
        const pass = passEl.value;
        const confirm = confirmEl.value;
        if (!confirm) {
          helper.textContent = '';
          passEl.classList.remove('input-error');
          confirmEl.classList.remove('input-error');
          return true;
        }
        if (pass !== confirm) {
          helper.textContent = 'As senhas não coincidem';
          passEl.classList.add('input-error');
          confirmEl.classList.add('input-error');
          return false;
        } else {
          helper.textContent = 'As senhas coincidem ✓';
          helper.style.color = '#1a7f37';
          passEl.classList.remove('input-error');
          confirmEl.classList.remove('input-error');
          return true;
        }
      }

      passEl.addEventListener('input', validarConfirmacao);
  passEl.addEventListener('input', () => atualizarStrengthMeter(cadStrength, passEl.value, passEl));
      confirmEl.addEventListener('input', validarConfirmacao);

      cadastroForm.addEventListener('submit', e => {
        e.preventDefault();
        const user = cadastroForm.cadUser.value.trim();
        const pass = passEl.value;
        const confirm = confirmEl.value;
        const msg = document.getElementById('cadMsg');
        msg.classList.remove('msg-success', 'msg-error');
        msg.style.color = '';

        if (usuarios.find(u => u.nome === user)) {
          msg.textContent = 'Usuário já existe!';
          msg.classList.add('msg-error');
          return;
        }
        if (!/(?=.*[A-Z])(?=.*\d).{8,}/.test(pass)) {
          msg.textContent = 'Senha deve ter no mínimo 8 caracteres (incluindo 1 maiúscula e 1 número)';
          msg.classList.add('msg-error');
          passEl.classList.add('input-error');
          return;
        }
        if (pass !== confirm) {
          msg.textContent = 'As senhas não coincidem';
          msg.classList.add('msg-error');
          passEl.classList.add('input-error');
          confirmEl.classList.add('input-error');
          return;
        }

        usuarios.push({ nome: user, senha: pass });
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        msg.textContent = 'Cadastrado com sucesso!';
        msg.classList.add('msg-success');
        cadastroForm.reset();
        resetCadastroUI();
        cadModal.classList.add('hidden'); // fecha modal após cadastro
  atualizarStrengthMeter(cadStrength, '', passEl);
      });
    }
  
    /* ===== CATÁLOGO ===== */
    if (listaProdutos) {
      // Preenche nome no menu de perfil
      const usuario = localStorage.getItem('usuarioLogado');
      if (perfilNome && usuario) perfilNome.textContent = usuario;
      const logoutBtn = document.getElementById('logout');
      if (logoutBtn) {
        logoutBtn.onclick = () => {
          localStorage.removeItem('usuarioLogado');
          window.location = 'index.html';
        };
      }

      // ===== Alterar Senha (modal) =====
      function abrirAlterarSenhaModal() {
        if (!alterarSenhaModal) return;
        if (alterarSenhaForm) alterarSenhaForm.reset();
        if (alterarSenhaMsg) {
          alterarSenhaMsg.textContent = '';
          alterarSenhaMsg.classList.remove('msg-success','msg-error');
          alterarSenhaMsg.style.color = '';
        }
        const a = document.getElementById('senhaAtual');
        const n = document.getElementById('senhaNova');
        const c = document.getElementById('senhaConf');
        a?.classList.remove('input-error');
        n?.classList.remove('input-error','pwd-weak','pwd-medium','pwd-strong');
        c?.classList.remove('input-error');
        // Reset meter
        atualizarStrengthMeter(altStrength, '', n);
        alterarSenhaModal.classList.remove('hidden');
      }
      function fecharAlterarSenhaModal() {
        if (!alterarSenhaModal) return;
        alterarSenhaModal.classList.add('hidden');
      }
      if (alterarSenhaClose) alterarSenhaClose.addEventListener('click', fecharAlterarSenhaModal);
      if (alterarSenhaCancelar) alterarSenhaCancelar.addEventListener('click', fecharAlterarSenhaModal);
      if (alterarSenhaModal) {
        alterarSenhaModal.addEventListener('click', (e) => { if (e.target === alterarSenhaModal) fecharAlterarSenhaModal(); });
      }
      if (alterarSenhaForm) {
        alterarSenhaForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const a = document.getElementById('senhaAtual');
          const n = document.getElementById('senhaNova');
          const c = document.getElementById('senhaConf');
          const msg = alterarSenhaMsg;
          [a,n,c].forEach(inp => inp && inp.classList.remove('input-error'));
          if (!a || !n || !c || !msg) return;
  
          const usuario = localStorage.getItem('usuarioLogado');
          if (!usuario) { msg.textContent = 'Nenhum usuário logado.'; msg.classList.add('msg-error'); return; }
          const users = JSON.parse(localStorage.getItem('usuarios')) || [];
          const idx = users.findIndex(u => u.nome === usuario);
          if (idx === -1) { msg.textContent = 'Usuário não encontrado.'; msg.classList.add('msg-error'); return; }
  
          const atual = String(a.value || '');
          const nova = String(n.value || '');
          const conf = String(c.value || '');
  
          if (users[idx].senha !== atual) {
            msg.textContent = 'Senha atual incorreta';
            msg.classList.add('msg-error');
            a.classList.add('input-error');
            return;
          }
          if (!/(?=.*[A-Z])(?=.*\d).{8,}/.test(nova)) {
            msg.textContent = 'Nova senha deve ter no mínimo 8 caracteres (incluindo 1 maiúscula e 1 número)';
            msg.classList.add('msg-error');
            n.classList.add('input-error');
            return;
          }
          if (nova !== conf) {
            msg.textContent = 'As senhas não coincidem';
            msg.classList.add('msg-error');
            n.classList.add('input-error');
            c.classList.add('input-error');
            return;
          }
  
          users[idx].senha = nova;
          localStorage.setItem('usuarios', JSON.stringify(users));
          msg.textContent = 'Senha alterada com sucesso!';
          msg.classList.add('msg-success');
          msg.style.color = '#1a7f37';
          setTimeout(() => fecharAlterarSenhaModal(), 600);
        });
      }
      // Bind live meter para Alterar Senha
      if (senhaNova) {
        senhaNova.addEventListener('input', () => atualizarStrengthMeter(altStrength, senhaNova.value, senhaNova));
      }

      // Menu de perfil (popover)
      if (perfilBtn && perfilMenu) {
        const profile = document.getElementById('profile');
        const toggleMenu = (open) => {
          const willOpen = open ?? perfilMenu.classList.contains('hidden');
          if (willOpen) {
            perfilMenu.classList.remove('hidden');
            perfilBtn.setAttribute('aria-expanded', 'true');
          } else {
            perfilMenu.classList.add('hidden');
            perfilBtn.setAttribute('aria-expanded', 'false');
          }
        };
        perfilBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(true); });
        // Fecha ao clicar fora
        window.addEventListener('click', (e) => {
          if (!profile.contains(e.target)) toggleMenu(false);
        });
        // Fecha com ESC
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

        // Opção de menu: Alterar senha
        if (menuAlterarSenha) {
          menuAlterarSenha.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu(false);
            abrirAlterarSenhaModal();
          });
        }
       }
 
       // Carrega produtos e inicializa filtros/UI
       fetch('produtos.json')
         .then(r => r.json())
         .then(produtos => {
           renderProdutos(produtos);
           // UI do range (exemplo legado)
           const minRange = document.getElementById('minOrder');
           const bubble = document.getElementById('minOrderBubble');
           const updateRangeUI = () => {
             if (!minRange || !bubble) return;
             const min = Number(minRange.min || 0);
             const max = Number(minRange.max || 100);
             const val = Number(minRange.value || 0);
             const pct = ((val - min) * 100) / (max - min);
             minRange.style.setProperty('--range-pct', pct + '%');
             bubble.style.setProperty('--bubble-left', pct + '%');
             bubble.textContent = '$' + val;
           };
           updateRangeUI();
           if (minRange) minRange.addEventListener('input', updateRangeUI);
          // Busca do topo: filtra por nome em tempo real
          if (topSearchForm && topSearchInput) {
            const filtrarPorTopo = () => {
              const termo = topSearchInput.value.trim().toLowerCase();
              const filtrados = produtos.filter(p => p.nome.toLowerCase().includes(termo));
              renderProdutos(filtrados);
            };
            topSearchForm.addEventListener('submit', e => { e.preventDefault(); });
            topSearchInput.addEventListener('input', filtrarPorTopo);
          }
              // ==== Facetas dinâmicas: Marcas, Categorias e Faixas de preço ====
              const brands = new Map();
              const categories = new Map();
              produtos.forEach(p => {
                const b = p.marca || 'Outros'; brands.set(b, (brands.get(b)||0)+1);
                const c = p.categoria || 'Outros'; categories.set(c, (categories.get(c)||0)+1);
              });

              const facetBrands = document.getElementById('facetBrands');
              const facetPrices = document.getElementById('facetPrices');
              const facetCategories = document.getElementById('facetCategories');

              function renderFacetList(ul, entries) {
                if (!ul) return;
                ul.innerHTML = '';
                entries.forEach(([label, count]) => {
                  const li = document.createElement('li');
                  li.innerHTML = `<span class="label">${label}</span><span class="count">(${count})</span>`;
                  ul.appendChild(li);
                });
              }

              renderFacetList(facetBrands, Array.from(brands.entries()));
              renderFacetList(facetCategories, Array.from(categories.entries()));
              // Faixas de preço fixas com teto no produto mais caro
              const maxPreco = Math.max(...produtos.map(p=>p.preco));
              const minPreco = Math.min(...produtos.map(p=>p.preco));

              // Preço personalizado: placeholders e limites dinâmicos
              const precoMinInp = document.getElementById('precoMin');
              const precoMaxInp = document.getElementById('precoMax');
              const fmtPlain = (n) => 'R$ ' + Number(n).toLocaleString('pt-BR');
              if (precoMinInp) {
                // min começa em 0 conforme pedido
                precoMinInp.placeholder = fmtPlain(0);
                precoMinInp.step = '1';
                precoMinInp.min = '0';
                precoMinInp.max = String(maxPreco);
              }
              if (precoMaxInp) {
                precoMaxInp.placeholder = fmtPlain(maxPreco);
                // Define o valor inicial do Máximo como o maior valor disponível
                precoMaxInp.value = String(maxPreco);
                precoMaxInp.step = '1';
                precoMaxInp.min = '0';
                precoMaxInp.max = String(maxPreco);
              }

              // Slider duplo: inicia min=0 e max=maxPreco
              const rangeMin = document.getElementById('precoRangeMin');
              const rangeMax = document.getElementById('precoRangeMax');
              const range = document.getElementById('precoRange');
              const lblMin = document.getElementById('precoRangeMinLabel');
              const lblMax = document.getElementById('precoRangeMaxLabel');
              const MIN_SCALE = 0;
              const toPct = (v) => ((v - MIN_SCALE) * 100) / (maxPreco - MIN_SCALE);
              // CSS aplica o offset/track; usamos percentuais sobre a escala
              const STEP = 1; // garante granularidade
              const fmtBRL = (n) => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              function applyTrack() {
                const v1 = Number(rangeMin.value);
                const v2 = Number(rangeMax.value);
                const left = Math.min(v1, v2);
                const right = Math.max(v1, v2);
                if (range) {
                  range.style.setProperty('--left', toPct(left) + '%');
                  range.style.setProperty('--right', toPct(right) + '%');
                }
                // Labels exibem limites: 0 (min) e maxPreco (max)
                if (lblMin) lblMin.textContent = fmtBRL(MIN_SCALE);
                if (lblMax) lblMax.textContent = fmtBRL(maxPreco);
              }
              function clampRanges() {
                let vMin = Math.max(0, Math.min(Number(rangeMin.value || 0), maxPreco));
                let vMax = Math.max(0, Math.min(Number(rangeMax.value || maxPreco), maxPreco));
                // Impede cruzamento visual; mantém gap mínimo
                if (vMin > vMax - STEP) {
                  if (document.activeElement === rangeMin) vMin = vMax - STEP;
                  else vMax = vMin + STEP;
                }
                vMin = Math.max(0, Math.min(vMin, maxPreco));
                vMax = Math.max(0, Math.min(vMax, maxPreco));
                rangeMin.value = String(Math.max(0, Math.floor(vMin)));
                rangeMax.value = String(Math.min(maxPreco, Math.ceil(vMax)));
              }
              if (rangeMin && rangeMax) {
                rangeMin.min = '0';
                rangeMin.max = String(maxPreco);
                rangeMax.min = '0';
                rangeMax.max = String(maxPreco);
                rangeMin.value = '0';
                rangeMax.value = String(maxPreco);
                clampRanges();
                applyTrack();
                rangeMin.addEventListener('input', () => { clampRanges(); applyTrack(); syncInputsFromSlider(); });
                rangeMax.addEventListener('input', () => { clampRanges(); applyTrack(); syncInputsFromSlider(); });
              }

              function syncInputsFromSlider() {
                if (precoMinInp) precoMinInp.value = rangeMin.value;
                if (precoMaxInp) precoMaxInp.value = rangeMax.value;
              }
              function syncSliderFromInputs() {
                if (rangeMin && precoMinInp) rangeMin.value = String(Math.max(0, Math.min(Number(precoMinInp.value||0), maxPreco)));
                if (rangeMax && precoMaxInp) rangeMax.value = String(Math.max(0, Math.min(Number(precoMaxInp.value||maxPreco), maxPreco)));
                clampRanges();
                applyTrack();
              }
              precoMinInp?.addEventListener('input', syncSliderFromInputs);
              precoMaxInp?.addEventListener('input', syncSliderFromInputs);
              const fmt = (n) => 'R$ ' + Number(n).toLocaleString('pt-BR');
              // Thresholds fixos; o último é o maior preço do catálogo
              const baseThresholds = [0, 1000, 3000, 6000];
              const thresholds = baseThresholds.filter(t => t < maxPreco);
              thresholds.push(maxPreco);
              const priceRanges = [];
              for (let i = 0; i < thresholds.length - 1; i++) {
                const a = thresholds[i];
                const b = thresholds[i+1];
                if (i === 0) {
                  priceRanges.push({ label: `Até ${fmt(b)}`, test: p => p.preco <= b });
                } else if (i < thresholds.length - 2) {
                  priceRanges.push({ label: `${fmt(a)} a ${fmt(b)}`, test: p => p.preco > a && p.preco <= b });
                } else {
                  priceRanges.push({ label: `${fmt(a)} a ${fmt(b)}`, test: p => p.preco > a && p.preco <= b });
                }
              }
              if (facetPrices) {
                facetPrices.innerHTML = '';
                priceRanges.forEach(range => {
                  const count = produtos.filter(range.test).length;
                  const li = document.createElement('li');
                  li.innerHTML = `<span class="label">${range.label}</span><span class="count">(${count})</span>`;
                  li.addEventListener('click', () => {
                    renderProdutos(produtos.filter(range.test));
                  });
                  facetPrices.appendChild(li);
                });
              }

              // Interações: clique em marcas/categorias
              function attachFacetFilter(ul, predicateFactory) {
                if (!ul) return;
                ul.querySelectorAll('li').forEach(li => {
                  li.addEventListener('click', () => {
                    const label = li.querySelector('.label').textContent;
                    renderProdutos(produtos.filter(predicateFactory(label)));
                  });
                });
              }
              attachFacetFilter(facetBrands, (label) => (p) => (p.marca || 'Outros') === label);
              attachFacetFilter(facetCategories, (label) => (p) => (p.categoria || 'Outros') === label);
          document.getElementById('filtrar').addEventListener('click', () => {
            // Nome é filtrado pelo top search; aqui apenas preço
            const minEl = document.getElementById('precoMin');
            const maxEl = document.getElementById('precoMax');
            let min = parseFloat(minEl?.value);
            let max = parseFloat(maxEl?.value);
            if (Number.isNaN(min)) min = 0;
            if (Number.isNaN(max)) max = maxPreco;
            // Clamps e coerções
            if (min < 0) min = 0; // min começa em 0
            if (max > maxPreco) max = maxPreco;
            if (min > max) { const t = min; min = max; max = t; }
            // Reflete clamps no UI
            if (minEl) minEl.value = String(Math.floor(min));
            if (maxEl) maxEl.value = String(Math.ceil(max));
            // Sincroniza slider
            const rangeMin = document.getElementById('precoRangeMin');
            const rangeMax = document.getElementById('precoRangeMax');
            if (rangeMin && rangeMax) { rangeMin.value = String(min); rangeMax.value = String(max); }
            const range = document.getElementById('precoRange');
            if (range) {
              const toPct = (v) => ((v - 0) * 100) / (maxPreco - 0);
              range.style.setProperty('--left', toPct(min) + '%');
              range.style.setProperty('--right', toPct(max) + '%');
            }

            const filtrados = produtos.filter(p => p.preco >= min && p.preco <= max);
            renderProdutos(filtrados);
          });

          // Botão: Limpar filtros
          const btnLimpar = document.getElementById('limparFiltros');
          if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
              // 1) Limpa busca do topo
              if (topSearchInput) topSearchInput.value = '';
              // 2) Reseta inputs numéricos
              if (precoMinInp) precoMinInp.value = '0';
              if (precoMaxInp) precoMaxInp.value = String(maxPreco);
              // 3) Reseta slider
              if (rangeMin && rangeMax) {
                rangeMin.value = '0';
                rangeMax.value = String(maxPreco);
                clampRanges();
                applyTrack();
              }
              // 4) Re-renderiza todos os produtos
              renderProdutos(produtos);
            });
          }
        });
  
      // Renderiza os cards de produto e associa interações (avaliação, modal, carrinho)
      function renderProdutos(produtos) {
        listaProdutos.innerHTML = '';
        produtos.forEach(p => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <img src="${p.imagem}" alt="${p.nome}" class="produto-img">
            <h3>${p.nome}</h3>
            <p>${p.descricao}</p>
            <strong>${formatarPreco(p.preco)}</strong>
            <div class="estrelas" data-id="${p.id}">
              ${[1,2,3,4,5].map(n=>`<span data-star="${n}">★</span>`).join('')}
              <p class="media"></p>
            </div>
            <button class="addCarrinho">Adicionar ao Carrinho</button>
          `;
          listaProdutos.appendChild(card);

          // Abre modal ao clicar na imagem
          const img = card.querySelector('.produto-img');
          if (img) {
            img.addEventListener('click', () => abrirModalProduto(p));
          }
  
          const spans = card.querySelectorAll('.estrelas span');
          const mediaEl = card.querySelector('.media');
          spans.forEach(s => {
            s.addEventListener('click', () => {
              const nota = Number(s.dataset.star);
              let aval = JSON.parse(localStorage.getItem('avaliacoes')) || {};
              if (!aval[p.id]) aval[p.id] = [];
              aval[p.id].push(nota);
              localStorage.setItem('avaliacoes', JSON.stringify(aval));
              atualizarMedia(p.id, mediaEl, spans);
            });
            s.addEventListener('mouseenter', () => highlight(spans, s.dataset.star));
            s.addEventListener('mouseleave', () => highlight(spans, 0));
          });
          atualizarMedia(p.id, mediaEl, spans);
  
          card.querySelector('.addCarrinho').addEventListener('click', () => {
            carrinho.push({ id: p.id, nome: p.nome, preco: p.preco, imagem: p.imagem });
            atualizarCarrinho();
            // Animações visuais no botão/badge do carrinho
            const btn = document.getElementById('openCarrinho');
            const dot = document.getElementById('cartDot');
            if (btn) {
              btn.classList.remove('bump');
              void btn.offsetWidth; // reflow para reiniciar animação
              btn.classList.add('bump');
              btn.addEventListener('animationend', () => btn.classList.remove('bump'), { once: true });
            }
            if (dot) {
              dot.classList.remove('pop');
              void dot.offsetWidth;
              dot.classList.add('pop');
            }
          });
        });
      }
      // ===== Modal de Produto =====
      const produtoModal = document.getElementById('produtoModal');
      const produtoModalClose = document.getElementById('produtoModalClose');
      const produtoAddBtn = document.getElementById('produtoAddCarrinho');
      let produtoAtualModal = null;
      function abrirModalProduto(produto) {
        if (!produtoModal) return;
        const img = document.getElementById('produtoImagem');
        const titulo = document.getElementById('produtoTitulo');
        const desc = document.getElementById('produtoDescricao');
        const preco = document.getElementById('produtoPreco');
        const marca = document.getElementById('produtoMarca');
        const categoria = document.getElementById('produtoCategoria');
        const media = document.getElementById('produtoMedia');
        if (img) { img.src = produto.imagem; img.alt = produto.nome; }
        if (titulo) titulo.textContent = produto.nome;
        if (desc) desc.textContent = produto.descricao;
  if (preco) preco.innerHTML = formatarPreco(produto.preco);
        if (marca) marca.textContent = produto.marca || '-';
        if (categoria) categoria.textContent = produto.categoria || '-';
        if (media) {
          const aval = JSON.parse(localStorage.getItem('avaliacoes')) || {};
          if (!aval[produto.id] || aval[produto.id].length === 0) media.innerText = 'Sem avaliações';
          else {
            const m = (aval[produto.id].reduce((a,b)=>a+b,0) / aval[produto.id].length).toFixed(1);
            media.innerText = `Média: ${m} ★`;
          }
        }
        produtoAtualModal = produto;
        produtoModal.classList.remove('hidden');
      }
      if (produtoModal) {
        produtoModal.addEventListener('click', (e) => {
          if (e.target === produtoModal) produtoModal.classList.add('hidden');
        });
      }
      if (produtoModalClose) {
        produtoModalClose.addEventListener('click', () => produtoModal.classList.add('hidden'));
      }
      if (produtoAddBtn) {
        produtoAddBtn.addEventListener('click', () => {
          if (!produtoAtualModal) return;
          carrinho.push({ id: produtoAtualModal.id, nome: produtoAtualModal.nome, preco: produtoAtualModal.preco, imagem: produtoAtualModal.imagem });
          atualizarCarrinho();
          // animações no botão do header
          const btn = document.getElementById('openCarrinho');
          const dot = document.getElementById('cartDot');
          if (btn) {
            btn.classList.remove('bump');
            void btn.offsetWidth;
            btn.classList.add('bump');
            btn.addEventListener('animationend', () => btn.classList.remove('bump'), { once: true });
          }
          if (dot) {
            dot.classList.remove('pop');
            void dot.offsetWidth;
            dot.classList.add('pop');
          }
        });
      }
      function highlight(spans, star) {
        spans.forEach(st =>
          st.classList.toggle('ativo', Number(st.dataset.star) <= star));
      }
      // Formata preço como R$ 259,90 com centavos menores
      function formatarPreco(valor) {
        const n = Number(valor) || 0;
        const parts = n.toFixed(2).split('.')
        const reais = Number(parts[0]).toLocaleString('pt-BR');
        const centavos = parts[1];
        return `<span class="currency">R$</span> <span class="reais">${reais}</span><span class="centavos">${centavos}</span>`;
      }
      function atualizarMedia(id, el, spans) {
        const aval = JSON.parse(localStorage.getItem('avaliacoes')) || {};
        if (!aval[id] || aval[id].length === 0) el.innerText = 'Sem avaliações';
        else {
          const m = (aval[id].reduce((a,b)=>a+b,0) / aval[id].length).toFixed(1);
          el.innerText = `Média: ${m} ★`;
          // Preenche as estrelas conforme a média
          const avg = parseFloat(m);
          if (spans) {
            spans.forEach(st => {
              const starVal = Number(st.dataset.star);
              const diff = avg - starVal + 1; // valor relativo da estrela atual
              const pct = Math.max(0, Math.min(diff, 1)) * 100; // 0% a 100%
              st.style.setProperty('--fill', pct + '%');
              // também mantém classe ativo para as inteiras
              st.classList.toggle('ativo', starVal <= Math.floor(avg));
            });
          }
        }
      }
    }
  
  });
 
