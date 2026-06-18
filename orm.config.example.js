/**
 * orm.config.js — Configuração de exemplo para o CLI do RomaTech ORM.
 *
 * Copie este arquivo para orm.config.js e ajuste as configurações.
 * Instale o provider desejado antes de usar.
 */

// Exemplo com SQL Server (requer @romatech/orm-providers-mssql):
// import { MsSqlProvider } from '@romatech/orm-providers-mssql';
// const provider = new MsSqlProvider({
//     server: 'localhost',
//     database: 'OrmTest',
//     user: 'sa',
//     password: 'yourPassword',
//     options: { trustServerCertificate: true }
// });

// Exemplo com PostgreSQL (requer @romatech/orm-providers-pgsql):
// import { PgSqlProvider } from '@romatech/orm-providers-pgsql';
// const provider = new PgSqlProvider({
//     host: 'localhost',
//     database: 'ormtest',
//     user: 'postgres',
//     password: 'yourPassword'
// });

// Exemplo com MySQL (requer @romatech/orm-providers-mysql):
// import { MySqlProvider } from '@romatech/orm-providers-mysql';
// const provider = new MySqlProvider({
//     host: 'localhost',
//     database: 'ormtest',
//     user: 'root',
//     password: 'yourPassword'
// });

// Exemplo com In-Memory (requer @romatech/orm-providers-memory):
import { MemoryProvider } from '@romatech/orm-providers-memory';
const provider = new MemoryProvider();

export default {
    provider,

    // Caminho onde os arquivos de migration serão armazenados
    migrationsPath: './migrations',

    // Pasta de saída para o comando scaffold
    outputDir: 'src/entities',

    // Pasta de saída para o DbContext gerado pelo scaffold
    contextDir: 'src/context',

    // Nome da classe do DbContext gerada pelo scaffold
    contextName: 'AppDbContext',

    // Módulos de entidades a pré-carregar (para que os decoradores registrem os metadados)
    entities: ['./dist/entities/*.js']
};
