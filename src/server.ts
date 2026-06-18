import 'reflect-metadata';
import '@romatech/linq';
import express, { NextFunction, Request, Response } from 'express';
import { useSwagger, useSwaggerUi } from '@romatech/swagger';
import { useAi, registerAiMetadata, aiTool, aiHidden, aiReadOnly } from '@romatech/ai-extensions';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import { AppDbContext } from './context/AppDbContext';
import { seedDatabase } from './context/seed';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Health-check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- AI Metadata ---

// Users
registerAiMetadata('GET', '/users', aiReadOnly({
    description: 'Lists all users with optional sorting',
    category: 'Users',
}));

registerAiMetadata('GET', '/users/:id', aiReadOnly({
    description: 'Gets a user by ID',
    category: 'Users',
}));

registerAiMetadata('POST', '/users', aiTool({
    toolName: 'create_user',
    description: 'Creates a new user',
    category: 'Users',
    rateLimit: 20,
}));

registerAiMetadata('PUT', '/users/:id', aiTool({
    toolName: 'update_user',
    description: 'Updates an existing user by ID',
    category: 'Users',
    rateLimit: 20,
}));

registerAiMetadata('DELETE', '/users/:id', aiHidden());

// Products
registerAiMetadata('GET', '/products', aiReadOnly({
    description: 'Lists all products',
    category: 'Products',
}));

registerAiMetadata('GET', '/products/search', aiTool({
    toolName: 'search_products',
    description: 'Searches products by price range with pagination',
    category: 'Products',
    contextPriority: 50,
}));

registerAiMetadata('GET', '/products/:id', aiReadOnly({
    description: 'Gets a product by ID',
    category: 'Products',
}));

registerAiMetadata('POST', '/products', aiTool({
    toolName: 'create_product',
    description: 'Creates a new product in the catalog',
    category: 'Products',
    rateLimit: 20,
}));

registerAiMetadata('PUT', '/products/:id', aiTool({
    toolName: 'update_product',
    description: 'Updates an existing product by ID',
    category: 'Products',
    rateLimit: 20,
}));

registerAiMetadata('DELETE', '/products/:id', aiHidden());

// Health
registerAiMetadata('GET', '/health', aiHidden());

// --- AI Enablement ---
const { ragSearch, metrics } = useAi(app, {
    baseUrl: `http://localhost:${PORT}`,
    mcp: {
        route: '/mcp',
        serverName: 'romatech-orm-test-app',
        serverVersion: '1.0.0',
        enableRateLimiting: true,
    },
});

// Metrics endpoint
app.get('/mcp/metrics', (_req, res) => {
    res.json(metrics.getAll());
});

// Swagger — auto-generated from AST analysis (zero-config)
useSwagger(app, {
    title: 'RomaTech ORM – Test API',
    description: 'API de demonstração do RomaTech ORM com MCP + RAG habilitados',
    version: '1.0.0',
    sourcePatterns: ['./src/**/*.ts'],
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local' }],
    tags: [
        { name: 'Users', description: 'CRUD de usuários' },
        { name: 'Products', description: 'CRUD de produtos' }
    ]
});
useSwaggerUi(app);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
});

app.listen(PORT, async () => {
    // Seed demo data
    await seedDatabase(new AppDbContext());

    console.log(`API running at http://localhost:${PORT}`);
    console.log(`Swagger UI  at http://localhost:${PORT}/api-docs`);
    console.log(`MCP endpoint at http://localhost:${PORT}/mcp`);
});

export default app;
