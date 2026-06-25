import { Request, Response, NextFunction } from 'express';
import '@romatech/linq';
import {
    Controller, Get, Post, Put, Delete,
    AiTool, AiHidden, AiDescription, AiCategory, AiRateLimit,
} from '@romatech/ai-extensions';
import { AppDbContext } from '../context/AppDbContext';

const db = new AppDbContext();

@Controller('/users')
export class UserController {

    @Get('/')
    @AiDescription('Lists all users with optional sorting')
    @AiCategory('Users')
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await db.users.ToList();

            const sortBy = req.query.sortBy as string | undefined;
            if (sortBy === 'name') return res.json(users.orderBy(u => u.name));
            if (sortBy === 'age') return res.json(users.orderBy(u => u.age));

            res.json(users);
        } catch (err) { next(err); }
    }

    @Get('/:id')
    @AiDescription('Gets a user by ID')
    @AiCategory('Users')
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const user = await db.users.Where(x => x.id === id).FirstOrDefault();
            if (!user) return res.status(404).json({ error: 'User not found' });

            res.json(user);
        } catch (err) { next(err); }
    }

    @Post('/')
    @AiTool('create_user')
    @AiDescription('Creates a new user')
    @AiCategory('Users')
    @AiRateLimit(20)
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, age } = req.body ?? {};
            if (!name || !email || age === undefined) {
                return res.status(400).json({ error: 'Fields name, email and age are required' });
            }

            const user = { id: req.body.id, name, email, age: Number(age) };
            db.users.add(user);
            await db.saveChanges();

            res.status(201).json(user);
        } catch (err) { next(err); }
    }

    @Put('/:id')
    @AiTool('update_user')
    @AiDescription('Updates an existing user by ID')
    @AiCategory('Users')
    @AiRateLimit(20)
    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const user = await db.users.Where(x => x.id === id).FirstOrDefault();
            if (!user) return res.status(404).json({ error: 'User not found' });

            Object.assign(user, req.body);
            db.users.update(user);
            await db.saveChanges();

            res.json(user);
        } catch (err) { next(err); }
    }

    @Delete('/:id')
    @AiHidden()
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const user = await db.users.Where(x => x.id === id).FirstOrDefault();
            if (!user) return res.status(404).json({ error: 'User not found' });

            db.users.remove(user);
            await db.saveChanges();

            res.status(204).send();
        } catch (err) { next(err); }
    }
}
