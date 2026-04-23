exports.submitContactForm = (req, res) => {
  res.redirect(`${req.baseUrl}/?sent=1#contact-form`);
};
