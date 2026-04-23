const productService = require('../services/productService');

const prependBasePath = (basePath, assetPath) => {
  if (!assetPath || !assetPath.startsWith('/')) {
    return assetPath;
  }

  return `${basePath}${assetPath}`;
};

exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      brand,
      wheel,
      speeds,
      frame,
      brakeType,
      targetGender,
      ageGroup,
      maxPrice
    } = req.query;

    const products = (await productService.getFilteredProducts({
      category,
      search,
      brand,
      wheel,
      speeds,
      frame,
      brakeType,
      targetGender,
      ageGroup,
      maxPrice
    })).map((product) => ({
      ...product,
      image: prependBasePath(res.locals.basePath, product.image)
    }));

    res.json({
      total: products.length,
      items: products
    });
  } catch (error) {
    next(error);
  }
};
