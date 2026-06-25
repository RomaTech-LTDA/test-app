import { Request, Response, NextFunction } from 'express';
import '@romatech/linq';
import {
    Controller, Get, Post, Put, Delete,
    AiTool, AiHidden, AiDescription, AiCategory, AiRateLimit, AiContextPriority,
} from '@romatech/ai-extensions';
import { AppDbContext } from '../context/AppDbContext';

const db = new AppDbContext();

@Controller('/products')
export class ProductController {

    @Get('/')
    @AiDescription('Lists all products')
    @AiCategory('Products')
    static async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const products = await db.products.ToList();
            res.json(products);
        } catch (err) { next(err); }
    }

    @Get('/:id')
    @AiDescription('Gets a product by ID')
    @AiCategory('Products')
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const product = await db.products.Where(p => p.id === id).FirstOrDefault();
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (err) { next(err); }
    }

    @Post('/')
    @AiTool('create_product')
    @AiDescription('Creates a new product in the catalog')
    @AiCategory('Products')
    @AiRateLimit(20)
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description, price, stock } = req.body ?? {};
            if (!name || price === undefined) {
                return res.status(400).json({ error: 'Fields name and price are required' });
            }

            const product = {
                id: req.body.id,
                name,
                description: description ?? '',
                price: Number(price),
                stock: Number(stock ?? 0)
            };

            db.products.add(product);
            await db.saveChanges();

            res.status(201).json(product);
        } catch (err) { next(err); }
    }

    @Put('/:id')
    @AiTool('update_product')
    @AiDescription('Updates an existing product by ID')
    @AiCategory('Products')
    @AiRateLimit(20)
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const product = await db.products.Where(p => p.id === id).FirstOrDefault();
            if (!product) return res.status(404).json({ error: 'Product not found' });

            Object.assign(product, req.body);
            db.products.update(product);
            await db.saveChanges();

            res.json(product);
        } catch (err) { next(err); }
    }

    @Delete('/:id')
    @AiHidden()
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const product = await db.products.Where(p => p.id === id).FirstOrDefault();
            if (!product) return res.status(404).json({ error: 'Product not found' });

            db.products.remove(product);
            await db.saveChanges();

            res.status(204).send();
        } catch (err) { next(err); }
    }

    @Get('/search')
    @AiTool('search_products')
    @AiDescription('Searches products by price range with pagination')
    @AiCategory('Products')
    @AiContextPriority(50)
    static async search(req: Request, res: Response, next: NextFunction) {
        try {
            const minPrice = Number(req.query.minPrice ?? 0);
            const maxPrice = Number(req.query.maxPrice ?? Number.MAX_SAFE_INTEGER);
            const page = Math.max(1, Number(req.query.page ?? 1));
            const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 10)));

            const allProducts = await db.products.ToList();

            const items = allProducts
                .where(p => p.price >= minPrice && p.price <= maxPrice)
                .orderBy(p => p.name)
                .skip((page - 1) * pageSize)
                .take(pageSize);

            const total = allProducts
                .where(p => p.price >= minPrice && p.price <= maxPrice)
                .count();

            res.json({ page, pageSize, total, items });
        } catch (err) { next(err); }
    }
}
