const productService = require('../services/productService');

const prependBasePath = (basePath, assetPath) => {
  if (!assetPath || !assetPath.startsWith('/')) {
    return assetPath;
  }

  return `${basePath}${assetPath}`;
};

exports.renderHome = async (req, res, next) => {
  try {
    const products = (await productService.getAllProducts()).map((product) => ({
      ...product,
      image: prependBasePath(res.locals.basePath, product.image)
    }));
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
