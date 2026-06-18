# RomaTech ORM – Test API

API de demonstração que integra os pacotes da RomaTech:

| Pacote | Descrição |
|--------|-----------|
| [`@romatech/orm`](https://github.com/RomaTech-LTDA/orm) | ORM TypeScript inspirado no Entity Framework Core |
| [`@romatech/orm-providers-memory`](https://github.com/RomaTech-LTDA/orm-providers-memory) | Provider in-memory para testes e demos |
| [`@romatech/swagger`](https://github.com/RomaTech-LTDA/swagger) | Gerador automático de Swagger/OpenAPI via análise AST (zero-config) |
| [`@romatech/linq`](https://github.com/RomaTech-LTDA/linq) | LINQ para JavaScript com lazy evaluation e extensões de Array |
| [`@romatech/ai-extensions`](https://github.com/RomaTech-LTDA/ai-extensions-node) | Framework de AI enablement com MCP + RAG |

---

## Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9

---

## Instalação

```bash
npm install
```

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

| Método | Rota | Descrição | AI Exposure |
|--------|------|-----------|-------------|
| GET | `/users` | Lista todos (suporta `?sortBy=name` ou `?sortBy=age`) | Read-only |
| GET | `/users/:id` | Busca por ID | Read-only |
| POST | `/users` | Cria um usuário | MCP Tool: `create_user` |
| PUT | `/users/:id` | Atualiza um usuário | MCP Tool: `update_user` |
| DELETE | `/users/:id` | Remove um usuário | Hidden |

### Products (CRUD)

| Método | Rota | Descrição | AI Exposure |
|--------|------|-----------|-------------|
| GET | `/products` | Lista todos | Read-only |
| GET | `/products/search` | Busca com filtros e paginação | MCP Tool: `search_products` |
| GET | `/products/:id` | Busca por ID | Read-only |
| POST | `/products` | Cria um produto | MCP Tool: `create_product` |
| PUT | `/products/:id` | Atualiza um produto | MCP Tool: `update_product` |
| DELETE | `/products/:id` | Remove um produto | Hidden |

**Parâmetros de `/products/search`:**

| Query Param | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `minPrice` | number | 0 | Preço mínimo |
| `maxPrice` | number | MAX | Preço máximo |
| `page` | integer | 1 | Página atual |
| `pageSize` | integer | 10 | Itens por página (máx 50) |

---

## MCP (Model Context Protocol)

A API expõe um endpoint MCP em `POST /mcp` via `@romatech/ai-extensions`.

```bash
# Initialize
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'

# List tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# Call a tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"create_product","arguments":{"name":"Widget","price":9.99}}}'
```

---

## Swagger UI

A documentação da API é gerada automaticamente pelo `@romatech/swagger` via análise AST do código-fonte — sem decorators, sem anotações manuais.

Após iniciar o servidor, acesse:

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON:** [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)
- **MCP Endpoint:** [http://localhost:3000/mcp](http://localhost:3000/mcp) (POST)

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **ORM:** @romatech/orm (Entity Framework-like com DbContext, DbSet, decorators)
- **Database:** In-memory (MemoryProvider) — troque para MSSQL, PostgreSQL, MySQL ou Oracle via providers
- **Documentação:** @romatech/swagger (zero-config, AST-based)
- **AI Enablement:** @romatech/ai-extensions (MCP + RAG)
- **Utilitários:** @romatech/linq (LINQ operators em Array.prototype)

---

## License

MIT © RomaTech / Leandro Romanelli
