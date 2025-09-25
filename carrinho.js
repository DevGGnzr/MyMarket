// carrinho.js — Carrinho e Checkout
// Responsabilidades:
// 1) Renderizar itens e resumo (total) do carrinho a partir do localStorage
// 2) Alterar quantidade/remoção de itens com atualização reativa do total
// 3) Wizard de checkout em 3 passos (dados, pagamento, revisão) com validações básicas
// 4) Gerar dados de pagamento (PIX copia e cola, boleto fictício) e salvar pedido em 'meusPedidos'
document.addEventListener('DOMContentLoaded', () => {
  // Atualiza ano no footer
  document.querySelectorAll('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Header dinâmico ao rolar
  const headerEl = document.querySelector('.header');
  function updateHeaderOnScroll() {
    if (!headerEl) return;
    const scrolled = window.scrollY > 8;
    headerEl.classList.toggle('header--scrolled', scrolled);
  }
  updateHeaderOnScroll();
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

  // ===== Estado do carrinho =====
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  function atualizarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  // ===== Elementos =====
  const itensCarrinho = document.getElementById('itensCarrinho');
  const finalizarBtn   = document.getElementById('finalizarCompra');
  const resumoProdutos = document.getElementById('resumoProdutos');
  const resumoTotal    = document.getElementById('resumoTotal');
  const checkoutModal  = document.getElementById('checkoutModal');
  const checkoutClose  = document.getElementById('checkoutClose');
  const formCheckout   = document.getElementById('formCheckout');

  // Wizard controls
  const stepsEl        = document.getElementById('checkoutSteps');
  const panes          = document.querySelectorAll('.checkout-pane');
  const btnVoltar      = document.getElementById('btnVoltar');
  const btnProximo     = document.getElementById('btnProximo');
  const btnFinalizar   = document.getElementById('btnFinalizar');
  const checkoutResumo = document.getElementById('checkoutResumo');
  let currentStep = 1;

  if (!itensCarrinho) return; // executa somente na página do carrinho

  // Migração: preenche imagem ausente a partir do catálogo (compatibilidade)
  const precisaImagem = carrinho.some(i => !i.imagem);
  if (precisaImagem) {
    fetch('produtos.json').then(r=>r.json()).then(produtos => {
      carrinho = carrinho.map(i => {
        if (i.imagem) return i;
        const prod = produtos.find(p => String(p.id) == String(i.id));
        return { ...i, imagem: prod?.imagem };
      });
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      // Recarrega para renderizar com imagens
      window.location.reload();
    }).catch(() => {
      // segue sem imagem caso falhe
    });
    return;
  }

  // Garante campo de quantidade padrão
  carrinho = carrinho.map(p => ({ ...p, qtd: p.qtd ? Number(p.qtd) : 1 }));

  // Recalcula e exibe totais; controla habilitação do checkout
  function renderResumo() {
    const totalAtual = carrinho.reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd || 1), 0);
    if (resumoProdutos) resumoProdutos.textContent = totalAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (resumoTotal) resumoTotal.textContent = totalAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    // Habilita/desabilita botão de checkout
    if (finalizarBtn) {
      const vazio = carrinho.length === 0;
      finalizarBtn.disabled = vazio;
      finalizarBtn.setAttribute('aria-disabled', vazio ? 'true' : 'false');
      finalizarBtn.title = vazio ? 'Adicione produtos ao carrinho para continuar' : '';
    }
  }

  // Monta a lista de itens e associa eventos de quantidade/remoção
  function renderCarrinho() {
    if (carrinho.length === 0) {
      itensCarrinho.innerHTML = '<p>Seu carrinho está vazio.</p>';
      renderResumo();
      return;
    }
    let total = 0;
    itensCarrinho.innerHTML = carrinho.map((item, idx) => {
      const subtotal = Number(item.preco) * Number(item.qtd);
      total += subtotal;
      const preco = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `
        <div class="item" data-index="${idx}">
          <img class="thumb" src="${item.imagem || 'img/logo.png'}" alt="${item.nome}">
          <div>
            <div class="title">${item.nome}</div>
            <a href="#" class="remove" data-remove="${idx}">Excluir</a>
          </div>
          <div class="qty" data-qty="${idx}">
            <button class="btn-qty" data-action="dec" aria-label="Diminuir">–</button>
            <span class="value">${item.qtd}</span>
            <button class="btn-qty" data-action="inc" aria-label="Aumentar">+</button>
          </div>
          <div class="price">${preco}</div>
        </div>`;
    }).join('');

    renderResumo();

    // Remover item
    itensCarrinho.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(btn.getAttribute('data-remove'));
        carrinho.splice(idx, 1);
        atualizarCarrinho();
        window.location.reload();
      });
    });

    // Quantidade +/−
    itensCarrinho.querySelectorAll('[data-qty]').forEach(box => {
      const idx = Number(box.getAttribute('data-qty'));
      box.querySelectorAll('.btn-qty').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          let q = Number(carrinho[idx].qtd || 1);
          if (action === 'dec' && q <= 1) {
            carrinho.splice(idx, 1);
            atualizarCarrinho();
            window.location.reload();
            return;
          }
          q = action === 'inc' ? q + 1 : q - 1;
          carrinho[idx].qtd = q;
          // Atualiza UI local
          box.querySelector('.value').textContent = q;
          // Atualiza preço da linha
          const subtotal = Number(carrinho[idx].preco) * q;
          box.parentElement.querySelector('.price').textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          renderResumo();
        });
      });
    });
  }

  renderCarrinho();
  // Garante estado correto do botão na inicialização
  renderResumo();

  // ===== Wizard Checkout =====
  function showStep(n) {
    currentStep = n;
    panes.forEach(p => {
      const paneNum = Number(p.getAttribute('data-pane'));
      p.classList.toggle('hidden', paneNum !== n);
    });
    if (stepsEl) {
      stepsEl.querySelectorAll('.step').forEach(li => {
        const s = Number(li.getAttribute('data-step'));
        li.classList.toggle('is-active', s === n);
        li.classList.toggle('is-done', s < n);
      });
    }
    if (btnVoltar) btnVoltar.disabled = n === 1;
    if (btnProximo) btnProximo.classList.toggle('hidden', n === 3);
    if (btnFinalizar) btnFinalizar.classList.toggle('hidden', n !== 3);
    if (n === 3 && checkoutResumo) {
      const nome = document.getElementById('nome')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const endereco = document.getElementById('endereco')?.value || '';
      const cep = document.getElementById('cep')?.value || '';
      const method = getPayMethod();
      const card = (document.getElementById('card')?.value || '').replace(/\s+/g,'');
      const final4 = card ? card.slice(-4) : '****';
      let pagamentoTxt = '';
      if (method === 'cartao') pagamentoTxt = `Cartão final •••• ${final4}`;
      else if (method === 'pix') pagamentoTxt = `PIX (chave ${document.getElementById('pixKey')?.value || 'pix@mymarket.com'})`;
      else if (method === 'boleto') pagamentoTxt = 'Boleto bancário';
      const totalAtual = carrinho.reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd || 1), 0);
      const itensHtml = carrinho.map(i => `<li>${i.nome} x${i.qtd || 1} — ${(Number(i.preco)*Number(i.qtd||1)).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</li>`).join('');
      checkoutResumo.innerHTML = `
        <div>
          <h3 style="margin:0 0 8px">Seus dados</h3>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Endereço:</strong> ${endereco} — ${cep}</p>
          <p><strong>Pagamento:</strong> ${pagamentoTxt}</p>
        </div>
        <hr style="margin:12px 0;border:none;border-top:1px solid #eee"/>
        <div>
          <h3 style="margin:0 0 8px">Itens</h3>
          <ul style="padding-left:18px;margin:0">${itensHtml}</ul>
          <p style="margin-top:8px"><strong>Total:</strong> ${totalAtual.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p>
        </div>`;
    }
  }

  // Retorna o método de pagamento selecionado
  function getPayMethod() {
    const sel = document.querySelector('input[name="payMethod"]:checked');
    return sel ? sel.value : 'cartao';
  }

  // Mostra/oculta blocos de pagamento e ajusta campos obrigatórios
  function togglePaymentSections() {
    const method = getPayMethod();
    const secCartao = document.getElementById('payCartao');
    const secPix = document.getElementById('payPix');
    const secBoleto = document.getElementById('payBoleto');
    secCartao?.classList.toggle('hidden', method !== 'cartao');
    secPix?.classList.toggle('hidden', method !== 'pix');
    secBoleto?.classList.toggle('hidden', method !== 'boleto');
    ['card','cardVal','cardCvv','cardNome'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (method === 'cartao') el.setAttribute('required',''); else el.removeAttribute('required');
    });
  }

  // Gera string PIX "copia e cola" simplificada
  function buildPixPayload(total) {
    const valor = total.toFixed(2);
    const chave = 'pix@mymarket.com';
    const desc = 'Pagamento MyMarket';
    return `PIX|CHAVE=${chave}|VALOR=${valor}|DESC=${encodeURIComponent(desc)}`;
  }

  // Boleto fictício utilitários
  function randomDigits(n) { return Array.from({length:n},()=>Math.floor(Math.random()*10)).join(''); }
  function mod10(num) {
    let sum = 0, alt = true;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = parseInt(num[i]);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return (10 - (sum % 10)) % 10;
  }
  // Gera linha digitável plausível (não real) com DV mod10
  function generateLinhaDigitavel(valor) {
    const valorCent = Math.round(valor * 100).toString().padStart(10,'0');
    const bloco1 = '23790' + randomDigits(4);
    const dv1 = mod10(bloco1).toString();
    const bloco2 = randomDigits(10);
    const dv2 = mod10(bloco2).toString();
    const bloco3 = randomDigits(10);
    const dv3 = mod10(bloco3).toString();
    const bloco4 = '1';
    const bloco5 = valorCent + randomDigits(4);
    return `${bloco1}${dv1} ${bloco2}${dv2} ${bloco3}${dv3} ${bloco4} ${bloco5}`;
  }
  // Renderiza um "barcode" decorativo no canvas a partir do texto
  function drawFakeBarcode(text) {
    const canvas = document.getElementById('boletoBarcode');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#000';
    const paddingX = Math.max(6, Math.round(w * 0.03));
    const paddingY = Math.max(6, Math.round(h * 0.15));
    let x = paddingX;
    for (let i=0;i<text.length;i++) {
      const v = ((text.charCodeAt(i) % 4) + 1);
      const barH = h - paddingY * 2;
      ctx.fillRect(x, paddingY, v, barH);
      x += v + 2;
      if (x > w - paddingX) break;
    }
  }

  // Validação rápida dos campos do passo atual
  function validateCurrentStep() {
    const pane = document.querySelector(`.checkout-pane[data-pane="${currentStep}"]`);
    if (!pane) return true;
    const inputs = Array.from(pane.querySelectorAll('input'));
    for (const inp of inputs) {
      if (inp.hasAttribute('required') && !inp.value.trim()) {
        inp.focus();
        inp.reportValidity?.();
        return false;
      }
    }
    if (currentStep === 2) {
      const method = getPayMethod();
      if (method === 'cartao') {
        const card = document.getElementById('card');
        const val  = document.getElementById('cardVal');
        const cvv  = document.getElementById('cardCvv');
        if (card && card.value.replace(/\D/g,'').length < 12) { card.focus(); return false; }
        if (val && !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(val.value.trim())) { val.focus(); return false; }
        if (cvv && !/^\d{3,4}$/.test(cvv.value.trim())) { cvv.focus(); return false; }
      }
    }
    return true;
  }

  finalizarBtn?.addEventListener('click', () => {
    if (finalizarBtn.disabled) return; // evita abrir se desabilitado
    if (checkoutModal) {
      const msg = document.getElementById('msgFinal');
      if (msg) msg.textContent = '';
      if (checkoutResumo) checkoutResumo.innerHTML = '';
      showStep(1);
      checkoutModal.classList.remove('hidden');
    }
  });
  checkoutClose?.addEventListener('click', () => checkoutModal.classList.add('hidden'));
  checkoutModal?.addEventListener('click', (e) => { if (e.target === checkoutModal) checkoutModal.classList.add('hidden'); });

  btnVoltar?.addEventListener('click', () => { if (currentStep > 1) showStep(currentStep - 1); });
  btnProximo?.addEventListener('click', () => { if (!validateCurrentStep()) return; if (currentStep < 3) showStep(currentStep + 1); });

  // Finalização: cria pedido, salva, limpa carrinho e fecha modal
  formCheckout?.addEventListener('submit', e => {
    e.preventDefault();
    const method = getPayMethod();
    const via = method === 'cartao' ? 'Cartão' : method === 'pix' ? 'PIX' : 'Boleto';
    const totalAtual = carrinho.reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd || 1), 0);
    // Persiste pedido
    const pedidos = JSON.parse(localStorage.getItem('meusPedidos')||'[]');
    const novoPedido = {
      id: String(Date.now()),
      data: new Date().toISOString(),
      itens: carrinho.map(i => ({ id: i.id, nome: i.nome, qtd: i.qtd || 1, preco: i.preco })),
      total: totalAtual,
      status: method === 'boleto' ? 'Aguardando pagamento' : 'Processando',
      pagamento: via
    };
    pedidos.unshift(novoPedido);
    localStorage.setItem('meusPedidos', JSON.stringify(pedidos));

    // Limpa carrinho
    carrinho = [];
    localStorage.removeItem('carrinho');
    atualizarCarrinho();
    document.getElementById('msgFinal').textContent = `Pedido realizado com sucesso via ${via}! Obrigado, ${document.getElementById('nome').value}.`;
    formCheckout.reset();
    checkoutModal.classList.add('hidden');
  });

  // Troca de método de pagamento: preenche infos PIX/boleto conforme seleção
  document.querySelectorAll('input[name="payMethod"]').forEach(r => {
    r.addEventListener('change', () => {
      togglePaymentSections();
      const totalAtual = carrinho.reduce((acc, i) => acc + Number(i.preco) * Number(i.qtd || 1), 0);
      const payload = buildPixPayload(totalAtual);
      if (getPayMethod() === 'pix') {
        const pixKey = document.getElementById('pixKey');
        const cc = document.getElementById('pixCopiaCola');
        if (cc) cc.value = payload;
        if (pixKey) pixKey.value = 'pix@mymarket.com';
      } else if (getPayMethod() === 'boleto') {
        const venc = new Date();
        venc.setDate(venc.getDate() + 3);
        const linha = generateLinhaDigitavel(totalAtual);
        const vencStr = venc.toLocaleDateString('pt-BR');
        const valorStr = totalAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const linhaEl = document.getElementById('linhaDigitavel');
        const vencEl = document.getElementById('boletoVenc');
        const valorEl = document.getElementById('boletoValor');
        if (linhaEl) linhaEl.value = linha;
        if (vencEl) vencEl.textContent = vencStr;
        if (valorEl) valorEl.textContent = valorStr;
        drawFakeBarcode(linha.replace(/\s/g,''));
      }
    });
  });

  // Inicializa estado dos blocos de pagamento
  togglePaymentSections();
});
