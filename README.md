
# User Manager Backend API

Este projeto é uma API REST desenvolvida com **NestJS** e **TypeScript**, projetada para o gerenciamento de usuários com autenticação segura, operações CRUD, filtros, ordenação e testes automatizados. O sistema visa oferecer uma base escalável, segura e bem documentada para sistemas administrativos internos.

### ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white) Deploy 

Deploy foi realizado no render.com, segue URL da api: https://user-manager-with-oauth2.onrender.com/

## 🔧 Funcionalidades

- Registro de usuários (`/auth/register`)
- Login com geração de token JWT (`/auth/login`)
- Integração com OAuth2 (Google, Microsoft)
- Operações CRUD:
  - Criação de usuários
  - Atualização e remoção (restrito a admins)
  - Leitura de dados próprios (usuários regulares) ou de todos (admins)
- Filtros e ordenação:
  - Por papel de usuário (`?role=admin`)
  - Por nome ou data de criação (`?sortBy=name&order=asc`)
- Listagem de usuários inativos (sem login nos últimos 30 dias)

## 🛠 Tecnologias Utilizadas

- **NestJS** `^11.0.1`
- **TypeScript** `^5.7.3`
- **JWT** para autenticação (`@nestjs/jwt`)
- **BcryptJS** para hash de senha (`bcryptjs`)
- **Passport** e `passport-google-oauth20` para OAuth2
- **Prisma ORM** com suporte a PostgreSQL ou MySQL
- **Dotenv CLI** para gerenciamento de ambientes
- **UUID** para geração de identificadores únicos
- **Class-validator** e **Class-transformer** para validações
- **Swagger** (`@nestjs/swagger`) para documentação da API
- **Jest** para testes unitários e de integração
- **ESLint** e **Prettier** para padronização de código

## 📦 Scripts Disponíveis

```bash
npm run start          # Inicia a aplicação
npm run start:dev      # Inicia em modo desenvolvimento com dotenv
npm run start:prod     # Inicia em modo produção
npm run test           # Executa os testes
npm run prisma:generate # Gera os artefatos do Prisma
npm run prisma:migrate  # Executa as migrações Prisma
```

## 🚀 Instalação

```bash
# Clone o repositório
https://github.com/AnGabSS/user-manager-with-oauth2/
cd user-manager-with-oauth2

# Instale as dependências
npm install

# Configure as variáveis de ambiente (.env ou .env.development) baseado no .env.example

# Rode as migrações (se necessário)
npm run prisma:migrate

# Inicie o servidor
npm run start:dev
```

## 🧪 Testes

```bash
# Execute os testes
npm run test

```
## 📘 Documentação da API

```bash
A documentação Swagger está disponível em:
https://user-manager-with-oauth2.onrender.com/swagger-ui.html
```

## 🏗 Arquitetura

O projeto segue os princípios da arquitetura limpa, com módulos independentes e serviços bem definidos:

- **Módulo de Autenticação**
- **Módulo de Usuários**
- **Guards e Decorators personalizados**
- **Validações com DTOs**

## 📌 Considerações

- Apenas administradores podem deletar e listar todos os usuários
- Autenticação baseada em JWT com expiração configurável
- As senhas são armazenadas com hashing seguro usando BcryptJS
- Todas as rotas protegidas requerem token JWT válido
- Scripts para Prisma e ambiente de desenvolvimento prontos para uso

---

Desenvolvido como parte de um desafio técnico da Conéctar 🚀
