exports.submitContactForm = (req, res) => {
  const { name, phone, email, message } = req.body;

  // Placeholder обработка формы: в реальном проекте добавить БД или email-сервис.
  console.log('[CONTACT_FORM]', {
    name,
    phone,
    email,
    message,
    createdAt: new Date().toISOString()
  });

  res.redirect('/?sent=1#contact-form');
};

