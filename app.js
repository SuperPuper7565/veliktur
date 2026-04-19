const express = require('express');
const path = require('path');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

app.use((error, req, res, next) => {
  console.error(error);

  if (req.path.startsWith('/api')) {
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(500).send('Internal server error');
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Страница не найдена' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;

