export default app => {
  app.post(`/reservation`, require('./reservationCreate').default);
  app.put(`/reservation/:id`, require('./reservationUpdate').default);
  app.delete(`/reservation`, require('./reservationDestroy').default);
  app.get(
    `/reservation/autocomplete`,
    require('./reservationAutocomplete').default
  );
  app.get(`/reservation`, require('./reservationList').default);
  app.get(`/reservation/:id`, require('./reservationFind').default);
};
