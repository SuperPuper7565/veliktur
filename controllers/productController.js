const productService = require('../services/productService');

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
    } =
      req.query;

    const products = await productService.getFilteredProducts({
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
    });

    res.json({
      total: products.length,
      items: products
    });
  } catch (error) {
    next(error);
  }
};

