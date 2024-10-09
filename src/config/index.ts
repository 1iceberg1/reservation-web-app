import dotenv from 'dotenv';
dotenv.config();

export function getConfig(): any {
  return process.env;
}
