import { Request, Response, NextFunction } from 'express';
import '@romatech/linq';
import {
    Controller, Get, Post, Put, Delete,
    AiTool, AiHidden, AiDescription, AiCategory, AiRateLimit, AiContextPriority,
} from '@romatech/ai-extensions';
import { AppDbContext } from '../context/AppDbContext';
import { handleError, readNumber, readOptionalText, readText } from '../validation';

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
        } catch (err) { handleError(err, res, next); }
    }

    // Declared before '/:id' so Express does not treat 'search' as an id.
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
        } catch (err) { handleError(err, res, next); }
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
        } catch (err) { handleError(err, res, next); }
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
            const fields = {
                name: readText(name, 'name'),
                description: description === undefined ? '' : readOptionalText(description, 'description'),
                price: readNumber(price, 'price'),
                stock: stock === undefined ? 0 : readNumber(stock, 'stock', { integer: true })
            };

            const products = await db.products.ToList();
            const id = req.body.id === undefined
                ? products.reduce((max, p) => Math.max(max, p.id), 0) + 1
                : Number(req.body.id);
            if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid id' });
            if (products.some(p => p.id === id)) return res.status(409).json({ error: 'Product already exists' });

            const product = { id, ...fields };

            db.products.add(product);
            await db.saveChanges();

            res.status(201).json(product);
        } catch (err) { handleError(err, res, next); }
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

            // Copy only the editable fields: the id comes from the route and
            // must not be changed (or the prototype touched) through the body.
            // Every field is validated before the entity is touched.
            const { name, description, price, stock } = req.body ?? {};
            const changes = {
                name: name === undefined ? product.name : readText(name, 'name'),
                description: description === undefined ? product.description : readOptionalText(description, 'description'),
                price: price === undefined ? product.price : readNumber(price, 'price'),
                stock: stock === undefined ? product.stock : readNumber(stock, 'stock', { integer: true })
            };
            Object.assign(product, changes);
            db.products.update(product);
            await db.saveChanges();

            res.json(product);
        } catch (err) { handleError(err, res, next); }
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
        } catch (err) { handleError(err, res, next); }
    }
}
