const jsonServer = require('json-server');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Memory = require('lowdb/adapters/Memory');
const fs = require('fs');
const path = require('path');

const app = jsonServer.create();
const dbFilePath = path.join(__dirname, 'db.json');
const adapter = process.env.NODE_ENV === 'production' ? new Memory() : new FileSync(dbFilePath);
const db = low(adapter);

if (process.env.NODE_ENV === 'production') {
  const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  db.defaults(dbData).write();
}

const middlewares = jsonServer.defaults();
const router = jsonServer.router(db); // Используем базу данных из lowdb напрямую

app.use(middlewares);
app.use(jsonServer.bodyParser);

app.use((req, res, next) => {
  req.app.db = db;
  next();
});

app.use(router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});