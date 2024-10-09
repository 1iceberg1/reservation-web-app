const models = [
  require('./user').default,
  require('./reservation').default,
  require('./file').default,
  require('./consumption').default,
  require('./payment').default,
];

export default function init(database) {
  for (let model of models) {
    model(database);
  }

  return database;
}

export async function createCollections(database) {
  for (let model of models) {
    await model(database).createCollection();
  }

  return database;
}
