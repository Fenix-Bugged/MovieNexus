const fs = require('fs');

// Si no está configurada la variable en Vercel, usamos la clave por defecto para que funcione out-of-the-box
const apiKey = process.env.API_KEY || '5a0d01d8dd4118e73182c8828d58f5c7';

const envConfigFile = `export const environment = {
  production: true,
  baseUrl: 'https://api.themoviedb.org/3',
  apiKey: '${apiKey}',
  imgPath: 'https://image.tmdb.org/t/p'
};
`;

const targetFolderPath = './src/environments';

// Aseguramos la existencia de la carpeta environments
if (!fs.existsSync(targetFolderPath)) {
  fs.mkdirSync(targetFolderPath, { recursive: true });
}

const targetPath = './src/environments/environment.ts';

fs.writeFileSync(targetPath, envConfigFile);
console.log('🤖 Archivo environment.ts generado de forma segura para producción.');
