# Rio de Fato - Portal de Notícias

Portal de notícias do Rio de Janeiro, trazendo as últimas informações com credibilidade e transparência.

## Sobre o Projeto

O Rio de Fato é um portal de notícias moderno e dinâmico desenvolvido com Next.js 14, focado em performance, usabilidade e escalabilidade. O projeto utiliza as mais recentes tecnologias web para oferecer uma experiência completa de consumo e gerenciamento de notícias.

## Tecnologias Principais

- Frontend: Next.js 14 com React e TypeScript
- Estilização: Tailwind CSS para design responsivo
- Backend: Firebase (Authentication, Firestore)
- Armazenamento: Cloudinary para imagens
- Estado: Zustand para gerenciamento global
- Autenticação: Firebase Auth (Google e Email/Senha)

## Funcionalidades

- Sistema completo de notícias
- Área administrativa
- Autenticação de usuários
- Perfis personalizados
- Comentários e interações
- Sistema de busca
- Categorização de conteúdo
- Analytics e métricas

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/rio-de-fato.git
cd rio-de-fato
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código com Prettier
- `npm run cleanup-images`: Limpa imagens órfãs da Cloudinary

## Gerenciamento de Imagens

O projeto utiliza a Cloudinary para armazenar e gerenciar imagens. Quando uma notícia é excluída, a imagem associada a ela também é excluída automaticamente da Cloudinary.

Para limpar imagens órfãs (que não estão associadas a nenhuma notícia), execute o comando `npm run cleanup-images`.

Para mais detalhes sobre o gerenciamento de imagens, consulte a [documentação específica](docs/cloudinary-management.md).

## Estrutura do Projeto

```
.
├── public/                    # Arquivos públicos estáticos
├── src/                      # Código fonte
│   ├── app/                  # Páginas da aplicação (App Router)
│   ├── components/          # Componentes React
│   ├── hooks/              # Hooks personalizados
│   ├── lib/                # Configurações e utilitários
│   ├── store/             # Gerenciamento de estado
│   └── types/             # Definições de tipos TypeScript
└── docs/                  # Documentação adicional
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das alterações (`git commit -m 'feat: nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.

## Contato

- Email: contato@riodefato.com.br
- Website: https://riodefato.com.br
- Twitter: [@riodefato](https://twitter.com/riodefato)
