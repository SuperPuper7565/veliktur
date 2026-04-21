exports.submitContactForm = (req, res) => {
  const { name, phone, email, address, orderItems } = req.body;

  let parsedItems = [];

  try {
    parsedItems = JSON.parse(orderItems || '[]');
  } catch (error) {
    parsedItems = [];
  }

  console.log('[ORDER_FORM]', {
    name,
    phone,
    email,
    address,
    items: parsedItems,
    createdAt: new Date().toISOString()
  });

  res.redirect('/?sent=1#contact-form');
};
