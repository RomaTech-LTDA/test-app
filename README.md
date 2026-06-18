# RomaTech ORM – Test API

API de demonstração que integra os pacotes internos da RomaTech:

| Pacote | Descrição |
|--------|-----------|
| `@romatech/orm` | ORM TypeScript inspirado no Entity Framework Core |
| `@romatech/orm-providers-memory` | Provider in-memory para testes e demos |
| `@romatech/swagger` | Gerador automático de Swagger/OpenAPI via análise AST (zero-config) |
| `@romatech/linq` | LINQ para JavaScript com lazy evaluation e extensões de Array |

---

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9

Os pacotes `@romatech/orm`, `@romatech/swagger` e `@romatech/linq` são referenciados via `file:` no `package.json`, então o repositório precisa manter a estrutura de pastas esperada:

```
romatech/
├── linq/                           ← @romatech/linq
├── swagger/                        ← @romatech/swagger
├── romatech-orm/                   ← @romatech/orm
├── romatech-orm-providers-memory/  ← @romatech/orm-providers-memory
└── romatech-orm-test-app/          ← esta aplicação
```

---

## Instalação

```bash
cd orm/romatech-orm-test-app
npm install
```

Isso resolve todas as dependências, incluindo os links locais para os pacotes irmãos.

---

## Build

Compila o TypeScript para JavaScript no diretório `dist/`:

```bash
npm run build
```

---

## Executar

### Modo desenvolvimento (com hot-reload)

```bash
npm run dev
```

O servidor reinicia automaticamente a cada alteração nos arquivos `.ts`.

### Modo produção

```bash
npm run build
npm start
```

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT`   | `3000` | Porta HTTP do servidor |

---

## Endpoints

### Health-check

```
GET /health
```

### Users (CRUD)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users` | Lista todos (suporta `?sortBy=name` ou `?sortBy=age`) |
| GET | `/users/:id` | Busca por ID |
| POST | `/users` | Cria um usuário |
| PUT | `/users/:id` | Atualiza um usuário |
| DELETE | `/users/:id` | Remove um usuário |

### Products (CRUD)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/products` | Lista todos |
| GET | `/products/search` | Busca com filtros e paginação |
| GET | `/products/:id` | Busca por ID |
| POST | `/products` | Cria um produto |
| PUT | `/products/:id` | Atualiza um produto |
| DELETE | `/products/:id` | Remove um produto |

**Parâmetros de `/products/search`:**

| Query Param | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `minPrice` | number | 0 | Preço mínimo |
| `maxPrice` | number | MAX | Preço máximo |
| `page` | integer | 1 | Página atual |
| `pageSize` | integer | 10 | Itens por página (máx 50) |

---

## Swagger UI

A documentação da API é gerada automaticamente pelo `@romatech/swagger` via análise AST do código-fonte — sem decorators, sem anotações manuais.

Após iniciar o servidor, acesse:

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON:** [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **ORM:** @romatech/orm (Entity Framework-like com DbContext, DbSet, decorators)
- **Database:** In-memory (MemoryProvider) — troque para MSSQL, PostgreSQL, MySQL ou Oracle via providers
- **Documentação:** @romatech/swagger (zero-config, AST-based)
- **Utilitários:** @romatech/linq (LINQ operators em Array.prototype)
