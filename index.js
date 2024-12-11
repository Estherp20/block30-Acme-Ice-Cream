const express = require("express");
const app = express();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_db')

app.use(express.json());
app.use(require('morgan')('dev'));


app.post('/api/flavors', async (req, res, next) => {
    try{
        const SQL = `
        INSERT INTO flavors(name) VALUES ($1)
        RETURNING *`;
        const response = await client.query(SQL, [req.body.name])
        res.send(response.rows[0])
    } catch(error){
        next(error);
    }
});

app.get('/api/flavors', async (req, res, next) => {
    try{
        const SQL = `
        SELECT * FROM flavors ORDER BY created_at DESC
        `;
        const response = await client.query(SQL)
        res.send(response.rows);
    } catch(error){
        next(error);
    }
});

app.put('/api/flavors/:id', async (req, res, next) => {
    try{
        const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3 RETURNING ALL`;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
        res.send(response.rows[0]);
    } catch(error){
        next(error)
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    try{
        const SQL = `
        DELETE FROM flavors
        WHERE id=$1`;
        const response = await client.query(SQL [req.params.id])
        res.sendStatus(204)
    } catch(error){
        next(error)
    }
});

const init = async () => {
    await client.connect();
    console.log('connected to database')
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NULL,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    is_favorite boolean default false not null);
    `;
    await client.query(SQL);
    console.log('tables created');

    SQL = `
    INSERT INTO flavors(name, is_favorite) values('Chocolate', false);
    INSERT INTO flavors(name, is_favorite) values('Vanilla', true);
    INSERT INTO flavors(name, is_favorite) values('Stawberry', false);
    `;
    await client.query(SQL)
    console.log('tables seeded')
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`));
};
init();