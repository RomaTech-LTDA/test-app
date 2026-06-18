import { Request, Response, NextFunction } from 'express';
import '@romatech/linq';
import { AppDbContext } from '../context/AppDbContext';

const db = new AppDbContext();

export class ProductController {

    static async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const products = await db.products.ToList();
            res.json(products);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const product = await db.products
                .Where(p => p.id === id)
                .FirstOrDefault();

            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (err) {
            next(err);
        }
    }

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
        } catch (err) {
            next(err);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const product = await db.products
                .Where(p => p.id === id)
                .FirstOrDefault();

            if (!product) return res.status(404).json({ error: 'Product not found' });

            Object.assign(product, req.body);
            db.products.update(product);
            await db.saveChanges();

            res.json(product);
        } catch (err) {
            next(err);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const product = await db.products
                .Where(p => p.id === id)
                .FirstOrDefault();

            if (!product) return res.status(404).json({ error: 'Product not found' });

            db.products.remove(product);
            await db.saveChanges();

            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    /**
     * Demo: query with orderBy, skip, take (paging)
     * GET /products/search?minPrice=10&maxPrice=100&page=1&pageSize=5
     */
    static async search(req: Request, res: Response, next: NextFunction) {
        try {
            const minPrice = Number(req.query.minPrice ?? 0);
            const maxPrice = Number(req.query.maxPrice ?? Number.MAX_SAFE_INTEGER);
            const page = Math.max(1, Number(req.query.page ?? 1));
            const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 10)));

            const allProducts = await db.products.ToList();

            // Using @romatech/linq for filtering, sorting, and pagination
            const items = allProducts
                .where(p => p.price >= minPrice && p.price <= maxPrice)
                .orderBy(p => p.name)
                .skip((page - 1) * pageSize)
                .take(pageSize);

            const total = allProducts
                .where(p => p.price >= minPrice && p.price <= maxPrice)
                .count();

            res.json({ page, pageSize, total, items });
        } catch (err) {
            next(err);
        }
    }
}
