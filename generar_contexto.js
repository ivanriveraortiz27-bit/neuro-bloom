import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración básica
const NOMBRE_ARCHIVO_SALIDA = 'PROYECTO_NEURO_BLOOM.txt';
const CARPETAS_A_IGNORAR = ['node_modules', '.git', 'dist', 'build', '.vscode'];
const EXTENSIONES_PERMITIDAS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md'];
const ARCHIVOS_A_IGNORAR = ['package-lock.json', 'yarn.lock', NOMBRE_ARCHIVO_SALIDA, 'generar_contexto.js'];

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let contenidoTotal = '';

function leerDirectorio(directorio) {
    const archivos = fs.readdirSync(directorio);

    archivos.forEach(archivo => {
        const rutaCompleta = path.join(directorio, archivo);
        const stats = fs.statSync(rutaCompleta);
        const rutaRelativa = path.relative(__dirname, rutaCompleta);

        if (stats.isDirectory()) {
            if (!CARPETAS_A_IGNORAR.includes(archivo)) {
                leerDirectorio(rutaCompleta);
            }
        } else {
            const ext = path.extname(archivo);
            if (EXTENSIONES_PERMITIDAS.includes(ext) && !ARCHIVOS_A_IGNORAR.includes(archivo)) {
                try {
                    const contenido = fs.readFileSync(rutaCompleta, 'utf-8');
                    contenidoTotal += `\n\n=================================================================\n`;
                    contenidoTotal += `ARCHIVO: ${rutaRelativa}\n`;
                    contenidoTotal += `=================================================================\n\n`;
                    contenidoTotal += contenido;
                    console.log(`Agregado: ${rutaRelativa}`);
                } catch (error) {
                    console.error(`Error leyendo ${rutaRelativa}: ${error.message}`);
                }
            }
        }
    });
}

console.log('Generando archivo de contexto...');
leerDirectorio(__dirname);

fs.writeFileSync(NOMBRE_ARCHIVO_SALIDA, contenidoTotal);
console.log(`\n¡Listo! Se ha creado el archivo: ${NOMBRE_ARCHIVO_SALIDA}`);