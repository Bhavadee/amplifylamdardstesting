import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body ?? {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required' });
    }

    const todo = await prisma.todo.create({
      data: { title: title.trim() },
    });
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const { id } = req.params;
    const todo = await prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Todo not found' });
    }
    next(error);
  }
});

export default router;
