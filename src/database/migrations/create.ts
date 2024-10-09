import dotenv from 'dotenv';
import { createCollections } from '../models';
import { databaseInit } from '../databaseConnection';

dotenv.config();

databaseInit()
  .then(createCollections)
  .then(() => console.log('Collections successfully created'))
  .then(() => process.exit())
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
