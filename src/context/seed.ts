import { AppDbContext } from './AppDbContext';

/**
 * Seeds the database with demo data if empty.
 */
export async function seedDatabase(db: AppDbContext): Promise<void> {
    const existingUsers = await db.users.ToList();
    if (existingUsers.length > 0) return; // Already seeded

    // Users
    db.users.addRange([
        { id: 1, name: 'Alice Silva', email: 'alice@example.com', age: 30 },
        { id: 2, name: 'Bob Santos', email: 'bob@example.com', age: 25 },
        { id: 3, name: 'Carol Oliveira', email: 'carol@example.com', age: 35 },
        { id: 4, name: 'Dave Lima', email: 'dave@example.com', age: 28 },
        { id: 5, name: 'Eva Costa', email: 'eva@example.com', age: 22 },
    ] as any[]);

    // Products
    db.products.addRange([
        { id: 1, name: 'Notebook Pro', description: 'Laptop 16GB RAM', price: 4999.90, stock: 15 },
        { id: 2, name: 'Mouse Wireless', description: 'Ergonomic mouse', price: 149.90, stock: 100 },
        { id: 3, name: 'Teclado Mecânico', description: 'Cherry MX switches', price: 599.90, stock: 30 },
        { id: 4, name: 'Monitor 4K', description: '27" IPS panel', price: 2499.90, stock: 8 },
        { id: 5, name: 'Webcam HD', description: '1080p with mic', price: 299.90, stock: 50 },
        { id: 6, name: 'Hub USB-C', description: '7 ports', price: 199.90, stock: 75 },
        { id: 7, name: 'SSD 1TB', description: 'NVMe M.2', price: 449.90, stock: 40 },
        { id: 8, name: 'Headset Gamer', description: '7.1 surround', price: 349.90, stock: 25 },
    ] as any[]);

    await db.saveChanges();
    console.log('Database seeded with demo data');
}
