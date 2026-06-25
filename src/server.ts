import 'reflect-metadata';
import '@romatech/linq';
import express, { NextFunction, Request, Response } from 'express';
import { useSwagger, useSwaggerUi } from '@romatech/swagger';
import { useAi, useController } from '@romatech/ai-extensions';
import { UserController } from './controllers/UserController';
import { ProductController } from './controllers/ProductController';
import { AppDbContext } from './context/AppDbContext';
import { seedDatabase } from './context/seed';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ─── Controllers (decorators handle routes + AI metadata) ────────────────────
useController(app, UserController);
useController(app, ProductController);

// Health (no controller needed for simple endpoints)
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Swagger ─────────────────────────────────────────────────────────────────
useSwagger(app, {
    title: 'RomaTech ORM – Test API',
    description: 'API de demonstração do RomaTech ORM com MCP + RAG',
    version: '1.0.0',
    sourcePatterns: ['./src/**/*.ts'],
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local' }],
    tags: [
        { name: 'Users', description: 'CRUD de usuários' },
        { name: 'Products', description: 'CRUD de produtos' }
    ]
});
useSwaggerUi(app);

// ─── AI Enablement (reads Swagger + decorator metadata → MCP + RAG) ─────────
const { metrics } = useAi(app, {
    baseUrl: `http://localhost:${PORT}`,
    mcp: {
        route: '/mcp',
        serverName: 'romatech-orm-test-app',
        serverVersion: '1.0.0',
    },
});

// Metrics endpoint
app.get('/mcp/metrics', (_req, res) => res.json(metrics.getAll()));

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
    await seedDatabase(new AppDbContext());
    console.log(`API running at http://localhost:${PORT}`);
    console.log(`Swagger UI  at http://localhost:${PORT}/api-docs`);
    console.log(`MCP endpoint at http://localhost:${PORT}/mcp`);
});

export default app;
