# RomaTech ORM – Test API

API de demonstração que integra todos os pacotes da RomaTech com o pattern de decorators.

| Pacote | Descrição |
|--------|-----------|
| [`@romatech/orm`](https://github.com/RomaTech-LTDA/orm) | ORM TypeScript inspirado no Entity Framework Core |
| [`@romatech/orm-providers-memory`](https://github.com/RomaTech-LTDA/orm-providers-memory) | Provider in-memory para testes |
| [`@romatech/swagger`](https://github.com/RomaTech-LTDA/swagger) | Gerador automático de Swagger/OpenAPI via AST |
| [`@romatech/linq`](https://github.com/RomaTech-LTDA/linq) | LINQ para JavaScript com lazy evaluation |
| [`@romatech/ai-extensions`](https://github.com/RomaTech-LTDA/ai-extensions-node) | AI enablement com MCP + RAG via decorators |

---

## Como funciona

A app usa **decorators** no estilo .NET para declarar rotas e AI metadata num só lugar:

```typescript
@Controller('/users')
class UserController {
    @Get('/')
    @AiDescription('Lists all users')
    @AiCategory('Users')
    static async getAll(req, res) { ... }

    @Post('/')
    @AiTool('create_user')
    @AiDescription('Creates a new user')
    @AiRateLimit(20)
    static async create(req, res) { ... }

    @Delete('/:id')
    @AiHidden()
    static async delete(req, res) { ... }
}
```

No `server.ts`, uma linha registra tudo:

```typescript
useController(app, UserController);
useController(app, ProductController);
useAi(app, { baseUrl: 'http://localhost:3000' });
```

---

## Instalação

```bash
npm install
```

---

## Executar

```bash
# Desenvolvimento (hot-reload)
npm run dev

# Produção
npm run build && npm start
```

---

## Endpoints

### Users

| Método | Rota | AI Exposure | Descrição |
|--------|------|-------------|-----------|
| GET | `/users` | ReadOnly (RAG) | Lista todos |
| GET | `/users/:id` | ReadOnly (RAG) | Busca por ID |
| POST | `/users` | **MCP Tool**: `create_user` | Cria um usuário |
| PUT | `/users/:id` | **MCP Tool**: `update_user` | Atualiza um usuário |
| DELETE | `/users/:id` | Hidden | Remove um usuário |

### Products

| Método | Rota | AI Exposure | Descrição |
|--------|------|-------------|-----------|
| GET | `/products` | ReadOnly (RAG) | Lista todos |
| GET | `/products/:id` | ReadOnly (RAG) | Busca por ID |
| GET | `/products/search` | **MCP Tool**: `search_products` | Busca com filtros |
| POST | `/products` | **MCP Tool**: `create_product` | Cria um produto |
| PUT | `/products/:id` | **MCP Tool**: `update_product` | Atualiza um produto |
| DELETE | `/products/:id` | Hidden | Remove um produto |

### Infraestrutura

| Rota | Descrição |
|------|-----------|
| GET `/health` | Health check |
| GET `/api-docs` | Swagger UI |
| GET `/api-docs.json` | OpenAPI JSON |
| POST `/mcp` | MCP endpoint (JSON-RPC) |
| GET `/mcp/health` | MCP health check |
| GET `/mcp/metrics` | Métricas de uso dos tools |

---

## Testando o MCP

```bash
# Listar tools disponíveis
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq

# Criar um produto via MCP
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"create_product","arguments":{"name":"Widget","price":9.99}}}' | jq

# Buscar na documentação via RAG
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"rag_search","arguments":{"query":"como criar produtos"}}}' | jq
```

---

## Seed Data

A app inicia com dados de demonstração (5 users + 8 products) para que o MCP tenha dados para consultar.

---

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **ORM**: @romatech/orm (DbContext, DbSet, decorators)
- **Database**: In-memory (MemoryProvider)
- **Documentação**: @romatech/swagger (zero-config, AST)
- **AI**: @romatech/ai-extensions (decorators → MCP + RAG)
- **Utilitários**: @romatech/linq (LINQ em Array.prototype)

---

## License

MIT © RomaTech / Leandro Romanelli
