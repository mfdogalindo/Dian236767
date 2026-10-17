import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { situationalBank } from '../src/situational.js';
import { revisePractice, revisedPractice } from '../src/revised-practice.js';
import { extractBank } from './extract.mjs';
import { extractProcessBank } from './extract-process.mjs';
await mkdir('dist/assets', { recursive: true });
for (const file of ['index.html', 'styles.css', 'study.css', 'simple.css', 'app.js', 'core.js', 'content.js', 'process-content.js', 'review.js', 'study.js', 'guide.js']) await copyFile(`src/${file}`, `dist/${file}`);
const report = await readFile('deep-research-report.md', 'utf8');
const original = [...extractBank(report), ...extractProcessBank(await readFile('proceso.md','utf8'))];
const questions = [...revisePractice(original), ...situationalBank];
await writeFile('dist/assets/questions.json', JSON.stringify(questions));
// Solo para validar intentos guardados: estas versiones no entran en nuevas prácticas.
await writeFile('dist/assets/previous-questions.json', JSON.stringify(original.filter(q=>revisedPractice[q.id])));
for (const [i, name] of ['deep-research-report.md', 'deep-research-report(1).md', 'proceso.md'].entries()) {
  await copyFile(name, `dist/assets/investigacion-${i + 1}.md`);
}
await copyFile('guia_orientacion_dian_2676.md', 'dist/assets/guia_orientacion_dian_2676.md');
console.log(`Build completo: ${questions.length} preguntas, 3 investigaciones. Salida: dist/`);
