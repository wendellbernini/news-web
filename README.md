# NewsWeb - Portal de Notícias

Um portal de notícias moderno e responsivo construído com Next.js, Firebase e Cloudinary.

## Tecnologias Utilizadas

- Frontend: React.js + Next.js 14
- Estilização: Tailwind CSS
- Backend: Firebase (Authentication, Firestore Database)
- Armazenamento de Imagens: Cloudinary
- Gerenciamento de Estado: Zustand
- Autenticação: Firebase Authentication (Google, Email/Password)

## Funcionalidades

- Feed de notícias com paginação infinita
- Sistema de autenticação (Google e Email/Senha)
- Painel de administração para gerenciar notícias
- Upload e otimização de imagens
- Categorização de notícias
- Sistema de comentários
- Modo escuro
- Design responsivo
- SEO otimizado

## Pré-requisitos

- Node.js 18.17 ou superior
- NPM ou Yarn
- Conta no Firebase
- Conta no Cloudinary

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/news-web.git
cd news-web
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:

   - Copie o arquivo `.env.local.example` para `.env.local`
   - Preencha as variáveis com suas credenciais do Firebase e Cloudinary

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

5. Acesse http://localhost:3000

## Configuração do Firebase

1. Crie um novo projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Authentication e configure os provedores:
   - Google
   - Email/Password
3. Crie um banco de dados no Firestore
4. Copie as credenciais do projeto para o arquivo `.env.local`

## Configuração do Cloudinary

1. Crie uma conta no [Cloudinary](https://cloudinary.com)
2. Copie as credenciais para o arquivo `.env.local`:
   - Cloud Name
   - API Key
   - API Secret

## Estrutura do Projeto

```
src/
  ├── app/              # Páginas e rotas do Next.js
  ├── components/       # Componentes React
  │   ├── ui/          # Componentes de UI reutilizáveis
  │   ├── layout/      # Componentes de layout
  │   └── news/        # Componentes específicos de notícias
  ├── hooks/           # Hooks personalizados
  ├── lib/             # Configurações e utilitários
  │   ├── firebase/    # Configuração do Firebase
  │   └── cloudinary/  # Configuração do Cloudinary
  ├── store/           # Gerenciamento de estado (Zustand)
  └── types/           # Definições de tipos TypeScript
```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código com Prettier

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## LicençaProprietária

Este projeto é de propriedade de web-news. Você não tem permissão para copiar, modificar, distribuir ou sublicenciar este código sem a permissão explícita do proprietário - veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

## Autor

Wendell Bernini - [@wendellbernini](https://github.com/wendellbernini)

## Agradecimentos

- [Next.js](https://nextjs.org)
- [Firebase](https://firebase.google.com)
- [Cloudinary](https://cloudinary.com)
- [Tailwind CSS](https://tailwindcss.com)
