# Mix Papelaria e Presentes - Sistema de Gestão

Sistema completo de estoque e vendas para papelaria, desenvolvido com React, TypeScript, Node.js e SQLite.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com estatísticas de vendas, produtos e gráficos
- **Gestão de Produtos**: Cadastro completo com controle de estoque e alertas
- **PDV (Ponto de Venda)**: Interface intuitiva para vendas com múltiplas formas de pagamento
- **Relatórios**: Análises detalhadas de vendas e produtos
- **Autenticação**: Sistema seguro com JWT

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🔧 Instalação

1. Instalar dependências:
```bash
npm run install:all
```

## ▶️ Executar o Sistema

### Desenvolvimento (recomendado)

Execute servidor e cliente simultaneamente:
```bash
npm run dev
```

Ou execute separadamente:

**Backend (API):**
```bash
npm run dev:server
```
API disponível em: http://localhost:3001

**Frontend:**
```bash
npm run dev:client
```
Interface disponível em: http://localhost:3000

### Produção

1. Build:
```bash
npm run build
```

2. Iniciar servidor:
```bash
npm start
```

## 🔐 Acesso Padrão

- **Usuário**: admin
- **Senha**: admin123

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- JWT para autenticação
- bcryptjs para senhas

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Recharts (gráficos)
- Axios

## 📁 Estrutura do Projeto

```
/
├── server/          # Backend API
│   ├── src/
│   │   ├── database/    # Configuração do banco
│   │   ├── middleware/  # Autenticação
│   │   ├── routes/      # Rotas da API
│   │   └── index.ts     # Servidor principal
│   └── database.sqlite  # Banco de dados
│
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes
│   │   ├── contexts/    # Context API
│   │   ├── pages/       # Páginas
│   │   ├── services/    # API calls
│   │   └── App.tsx
│   └── index.html
│
└── package.json     # Scripts principais
```

## 📊 Banco de Dados

O sistema usa SQLite com as seguintes tabelas:
- `users` - Usuários do sistema
- `categories` - Categorias de produtos
- `products` - Produtos
- `sales` - Vendas
- `sale_items` - Itens das vendas

## 🎯 Uso do Sistema

### Cadastrar Produtos
1. Acesse "Produtos" no menu
2. Clique em "Novo Produto"
3. Preencha os dados e salve

### Realizar Vendas
1. Acesse "PDV (Vendas)"
2. Digite ou escaneie o código de barras
3. Ajuste quantidades se necessário
4. Selecione a forma de pagamento
5. Finalize a venda

### Visualizar Relatórios
1. Acesse "Relatórios"
2. Escolha o tipo de relatório
3. Defina o período (para vendas)
4. Clique em "Gerar Relatório"

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Proteção de rotas
- Validação de dados

## 📝 Licença

MIT

## 👨‍💻 Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.
