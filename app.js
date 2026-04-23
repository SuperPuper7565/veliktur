const express = require('express');
const path = require('path');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = '/veliktur';
const API_BASE_PATH = `${BASE_PATH}/api`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.basePath = BASE_PATH;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.locals.basePath = BASE_PATH;
  next();
});

app.get('/', (req, res) => {
  res.redirect(`${BASE_PATH}/`);
});

app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));
app.use(BASE_PATH, indexRouter);
app.use(API_BASE_PATH, apiRouter);

app.use((error, req, res, next) => {
  console.error(error);

  if (req.originalUrl.startsWith(API_BASE_PATH)) {
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(500).send('Internal server error');
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Страница не найдена' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${BASE_PATH}/`);
  });
}

module.exports = app;
