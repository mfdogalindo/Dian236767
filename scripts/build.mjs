import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { extractBank } from './extract.mjs';
await mkdir('dist/assets', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'core.js', 'content.js']) await copyFile(`src/${file}`, `dist/${file}`);
const report = await readFile('deep-research-report.md', 'utf8');
const questions = extractBank(report);
await writeFile('dist/assets/questions.json', JSON.stringify(questions));
for (const [i, name] of ['deep-research-report.md', 'deep-research-report(1).md'].entries()) {
  await copyFile(name, `dist/assets/investigacion-${i + 1}.md`);
}
console.log(`Build completo: ${questions.length} preguntas, 2 investigaciones. Salida: dist/`);
