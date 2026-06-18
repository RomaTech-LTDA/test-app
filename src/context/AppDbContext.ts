import { DbContext, DbContextOptions } from '@romatech/orm';
import { MemoryProvider } from '@romatech/orm-providers-memory';
import { User } from '../entities/User';
import { Product } from '../entities/Product';

export class AppDbContext extends DbContext {

    public users = this.set(User);
    public products = this.set(Product);

    constructor() {
        super(
            new DbContextOptions()
                .useProvider(AppDbContext.createProvider())
        );
    }

    private static createProvider() {
        // Use MemoryProvider by default for demo purposes.
        // To use MSSQL, install @romatech/orm-providers-mssql and change this.
        return new MemoryProvider();
    }
}
