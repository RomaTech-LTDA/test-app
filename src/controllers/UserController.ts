import { Request, Response, NextFunction } from 'express';
import '@romatech/linq';
import {
    Controller, Get, Post, Put, Delete,
    AiTool, AiHidden, AiDescription, AiCategory, AiRateLimit,
} from '@romatech/ai-extensions';
import { AppDbContext } from '../context/AppDbContext';
import { handleError, readNumber, readText } from '../validation';

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
        } catch (err) { handleError(err, res, next); }
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
        } catch (err) { handleError(err, res, next); }
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
            const fields = {
                name: readText(name, 'name'),
                email: readText(email, 'email'),
                age: readNumber(age, 'age', { integer: true })
            };

            const users = await db.users.ToList();
            const id = req.body.id === undefined
                ? users.reduce((max, u) => Math.max(max, u.id), 0) + 1
                : Number(req.body.id);
            if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid id' });
            if (users.some(u => u.id === id)) return res.status(409).json({ error: 'User already exists' });

            const user = { id, ...fields };
            db.users.add(user);
            await db.saveChanges();

            res.status(201).json(user);
        } catch (err) { handleError(err, res, next); }
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

            // Copy only the editable fields: the id comes from the route and
            // must not be changed (or the prototype touched) through the body.
            // Every field is validated before the entity is touched.
            const { name, email, age } = req.body ?? {};
            const changes = {
                name: name === undefined ? user.name : readText(name, 'name'),
                email: email === undefined ? user.email : readText(email, 'email'),
                age: age === undefined ? user.age : readNumber(age, 'age', { integer: true })
            };
            Object.assign(user, changes);
            db.users.update(user);
            await db.saveChanges();

            res.json(user);
        } catch (err) { handleError(err, res, next); }
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
        } catch (err) { handleError(err, res, next); }
    }
}
