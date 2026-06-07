import dotenv from 'dotenv';

dotenv.config({quiet: true});

export function envValue(name, defaultValue = null) {
  const value = process.env[name];

  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value;
}
