import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');

// Assurer que le dossier data existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const getFilePath = (filename) => path.join(dataDir, filename);

export const readJSON = (filename) => {
  try {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Erreur lecture ${filename}:`, error);
    return [];
  }
};

export const writeJSON = (filename, data) => {
  try {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Erreur écriture ${filename}:`, error);
    return false;
  }
};

export const appendJSON = (filename, item) => {
  const data = readJSON(filename);
  data.push(item);
  return writeJSON(filename, data);
};

export const updateJSON = (filename, id, updates) => {
  const data = readJSON(filename);
  const index = data.findIndex(item => item.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updates };
    writeJSON(filename, data);
    return data[index];
  }
  return null;
};

export const deleteJSON = (filename, id) => {
  const data = readJSON(filename);
  const filtered = data.filter(item => item.id !== id);
  writeJSON(filename, filtered);
  return true;
};

export default {
  readJSON,
  writeJSON,
  appendJSON,
  updateJSON,
  deleteJSON
};
