export default app => {
  app.post(`/consumption`, require('./consumptionCreate').default);
  app.put(`/consumption/:id`, require('./consumptionUpdate').default);
  app.delete(`/consumption`, require('./consumptionDestroy').default);
  app.get(`/consumption`, require('./consumptionList').default);
  app.get(`/consumption/:id`, require('./consumptionFind').default);
};
