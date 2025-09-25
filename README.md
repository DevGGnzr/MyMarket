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

## 🚀 Como Executar

1. **Clone o repositório:**
```bash
git clone https://github.com/DevGGnzr/MyMarket.git
cd MyMarket
```

2. **Abra o arquivo `index.html` em um navegador:**
```bash
# Ou use um servidor local como Live Server do VS Code
# Ou Python HTTP Server:
python -m http.server 8000
```

3. **Acesse no navegador:**
```
http://localhost:8000
```

## 📦 Produtos Disponíveis

O marketplace oferece uma variedade de produtos em diferentes categorias:

- **💻 Notebooks** - Asus, HP, Dell, Lenovo
- **🔧 Hardware** - Processadores, Placas-mãe, Memórias
- **🎮 Periféricos** - Mouses, Teclados, Headsets
- **⚡ Fontes e Refrigeração** - PSUs, Coolers, Water Coolers

## 🎮 Como Usar

1. **Faça login** na página inicial (usuário: `admin`, senha: `123`)
2. **Navegue** pelo catálogo de produtos
3. **Use os filtros** para encontrar produtos específicos
4. **Adicione produtos** ao carrinho
5. **Finalize a compra** seguindo o wizard de checkout
6. **Acompanhe seus pedidos** na seção "Minhas Compras"

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido por **DevGGnzr** com ❤️

---

⭐ Se este projeto te ajudou, deixe uma estrela no repositório!