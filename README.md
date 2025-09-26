# 🛒 MyMarket - E-commerce

Um marketplace moderno e completo desenvolvido com HTML, CSS e JavaScript puro, oferecendo uma experiência de compra fluida e intuitiva.

![MyMarket Logo](img/logo.png)

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- Login e cadastro de usuários
- Validação de senha com medidor de força
- Opção "Lembrar-me" para sessões persistentes
- Modal para alteração de senha

### 🛍️ Catálogo de Produtos
- Exibição dinâmica de produtos carregados via JSON
- Sistema de busca avançado
- Filtros por categoria, marca e faixa de preço
- Slider duplo para seleção de preços
- Modal detalhado para cada produto
- Sistema de avaliação com estrelas

### 🛒 Carrinho de Compras
- Adição/remoção de produtos
- Controle de quantidade
- Cálculo automático de subtotais e total
- Persistência no localStorage
- Badge de contagem no header

### 💳 Sistema de Checkout
- Wizard de checkout em 3 etapas:
  1. **Dados pessoais** - Nome, telefone, endereço
  2. **Pagamento** - Cartão, PIX ou Boleto
  3. **Revisão** - Confirmação do pedido
- Geração de códigos PIX
- Emissão de boletos fictícios
- Validações de formulário

### 📦 Minhas Compras
- Histórico completo de pedidos
- Status de entrega
- Detalhes de pagamento
- Opção de exclusão de pedidos

## 🏗️ Estrutura do Projeto

```
MyMarket/
├── 📄 index.html          # Página de login
├── 📄 catalogo.html       # Catálogo de produtos
├── 📄 carrinho.html       # Carrinho e checkout
├── 📄 compras.html        # Histórico de pedidos
├── 📄 produtos.json       # Base de dados dos produtos
├── 🎨 style.css          # Estilos globais
├── ⚡ script.js          # Lógica principal
├── ⚡ carrinho.js        # Lógica do carrinho/checkout
├── ⚡ compras.js         # Lógica das compras
└── 📁 img/               # Imagens dos produtos e logo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva com Flexbox e Grid
- **JavaScript (ES6+)** - Funcionalidades interativas
- **LocalStorage** - Persistência de dados local
- **JSON** - Estrutura de dados dos produtos

## 🎯 Características Técnicas

### 📱 Design Responsivo
- Layout adaptável para diferentes dispositivos
- Grid system flexível
- Mobile-first approach

### 🎨 Interface Moderna
- Design limpo e intuitivo
- Gradientes e sombras suaves
- Animações CSS para melhor UX
- Ícones SVG otimizados

### 📊 Gestão de Estado
- Carrinho sincronizado via localStorage
- Histórico de pedidos persistente
- Estado de login mantido entre sessões

### 🔒 Validações
- Validação de formulários em tempo real
- Verificação de força de senha
- Sanitização de dados de entrada

---

**Desenvolvido por DevGGnzr** 💻