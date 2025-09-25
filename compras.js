// compras.js — Minhas Compras
// Responsabilidades:
// 1) Carregar pedidos do localStorage (chave: 'meusPedidos')
// 2) Renderizar cartões de pedido (data, total, status, pagamento, itens)
// 3) Excluir pedidos com confirmação e persistir a atualização
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-year').forEach(el => el.textContent = new Date().getFullYear());
    const ordersList = document.getElementById('ordersList');
    const empty = document.getElementById('ordersEmpty');
    let pedidos = JSON.parse(localStorage.getItem('meusPedidos')) || [];

    if (!ordersList) return;

    /**
     * Persiste o array "pedidos" no localStorage.
     * Efeito colateral: sobrescreve a chave 'meusPedidos'.
     */
    function save() {
      localStorage.setItem('meusPedidos', JSON.stringify(pedidos));
    }

    /**
     * Renderiza a lista de pedidos.
     * - Exibe mensagem de vazio quando não há pedidos
     * - Gera HTML dos cards com dados básicos
     * - Associa listeners para exclusão
     */
    function render() {
      if (!pedidos.length) {
        if (empty) empty.style.display = 'block';
        ordersList.innerHTML = '';
        return;
      }
      if (empty) empty.style.display = 'none';

      ordersList.innerHTML = pedidos.map(p => {
        const dt = new Date(p.data);
        const total = Number(p.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const items = (p.itens||[]).map(i => `${i.nome} x${i.qtd||1}`).join(', ');
        const status = p.status || 'Processando';
        return `
          <article class="order-card">
            <div class="order-head">
              <h3>Pedido #${p.id}</h3>
              <button class="btn-trash" data-del="${p.id}" title="Excluir pedido" aria-label="Excluir pedido">
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="7" width="12" height="14" rx="2"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M4 7h16"/>
                    <rect x="9" y="3" width="6" height="2" rx="1"/>
                  </g>
                </svg>
              </button>
            </div>
            <div class="order-meta">
              <span><strong>Data:</strong> ${dt.toLocaleDateString('pt-BR')} ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
              <span><strong>Total:</strong> ${total}</span>
              <span><strong>Status:</strong> ${status}</span>
              <span><strong>Pagamento:</strong> ${p.pagamento}</span>
            </div>
            <div class="order-items"><strong>Itens:</strong> ${items}</div>
          </article>
        `;
      }).join('');

      // Associação dos botões de exclusão por card
      ordersList.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = String(btn.getAttribute('data-del'));
          const ok = window.confirm('Deseja excluir este pedido? Essa ação não pode ser desfeita.');
          if (!ok) return;
          pedidos = pedidos.filter(p => String(p.id) !== id);
          save();
          render();
        });
      });
    }

    render();
  });
})();
