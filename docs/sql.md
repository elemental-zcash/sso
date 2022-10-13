# SQL Documentation

## Getting Started

## Migrations

SQL migrations are currently not stable and are intended for first-party Elemental Zcash ecosystem apps. For now we would recommend using a database/storage adapter and your own database integration and/or handle/test migrations yourself.

Some reading on pros/cons of embedding schema with migrations: https://www.edgedb.com/blog/a-solution-to-the-sql-vs-orm-dilemma#migrations

## Migration Examples

### Adding a Column

```sql
ALTER TABLE my_table ADD COLUMN new_column INTEGER DEFAULT 1
ALTER TABLE my_table ADD COLUMN new_column INTEGER DEFAULT 1 NOT NULL
```

### Deleting a Column

```sql
ALTER TABLE my_table DROP COLUMN new_column
```

### Creating a Foreign Key

```sql
ALTER TABLE my_table ADD CONSTRAINT fk_group
  FOREIGN KEY (group_id) REFERENCES groups(id) -- locks both the tables
```

## Resources

- https://medium.com/miro-engineering/sql-migrations-in-postgresql-part-1-bc38ec1cbe75
- https://github.com/djrobstep/migra
