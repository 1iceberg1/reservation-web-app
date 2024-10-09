export default app => {
  // app.post(`/payment`, require('./paymentCreate').default);
  app.put(`/payment/:id`, require('./paymentEdit').default);
  app.delete(`/payment`, require('./paymentDestroy').default);
  app.get(`/payment`, require('./paymentList').default);
  app.get(`/payment-latest`, require('./paymentLatest').default);
  app.get(`/payment/:id`, require('./paymentFind').default);
};
