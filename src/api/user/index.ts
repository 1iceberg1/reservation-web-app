export default app => {
  app.post(`/user`, require('./userCreate').default);
  app.put(`/user/:id`, require('./userEdit').default);
  app.delete(`/user`, require('./userDestroy').default);
  app.get(`/user`, require('./userList').default);
  app.get(`/user/autocomplete`, require('./userAutocomplete').default);
  app.get(`/user/:id`, require('./userFind').default);
};
