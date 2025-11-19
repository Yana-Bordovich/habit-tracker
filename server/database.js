const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Создаем и настраиваем базу данных
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Промисфицируем методы базы данных для использования async/await
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbExec = promisify(db.exec.bind(db));

module.exports = {
    run: dbRun,
    get: dbGet,
    all: dbAll,
    exec: dbExec,
    close: () => new Promise(resolve => db.close(resolve))
};
