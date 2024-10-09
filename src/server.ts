import dotenv from 'dotenv';
import api from './api';

dotenv.config();

const PORT = process.env.PORT || 8080;

api.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
