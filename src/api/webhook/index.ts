export default app => {
  app.post(`/webhook`, require('./paymentResult').default);
};
