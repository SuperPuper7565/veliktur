const productService = require('../services/productService');

exports.renderHome = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    const categories = [...new Set(products.map((item) => item.category))];

    res.render('index', {
      title: 'VelikTur - велосипеды для города и приключений',
      products,
      categories,
      sent: req.query.sent === '1'
    });
  } catch (error) {
    next(error);
  }
};
