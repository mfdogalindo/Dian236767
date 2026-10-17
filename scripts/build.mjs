import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { situationalBank } from '../src/situational.js';
import { revisePractice } from '../src/revised-practice.js';
import { extractBank } from './extract.mjs';
import { extractProcessBank } from './extract-process.mjs';
await mkdir('dist/assets', { recursive: true });
for (const file of ['index.html', 'styles.css', 'study.css', 'simple.css', 'app.js', 'core.js', 'content.js', 'process-content.js', 'review.js', 'study.js', 'guide.js']) await copyFile(`src/${file}`, `dist/${file}`);
const report = await readFile('deep-research-report.md', 'utf8');
const original = [...extractBank(report), ...extractProcessBank(await readFile('proceso.md','utf8'))];
const questions = [...revisePractice(original), ...situationalBank];
await writeFile('dist/assets/questions.json', JSON.stringify(questions));
// Solo para validar intentos guardados: estas versiones no entran en nuevas prácticas.
await writeFile('dist/assets/previous-questions.json', JSON.stringify(original.filter(q=>questions.find(n=>n.id===q.id)?.revision===2)));
const coverage=questions.filter(q=>['A','B','C'].includes(q.form)&&q.type==='functional');
if(coverage.length!==120||coverage.some(q=>!q.scenario||q.options.length!==3||q.rationales?.length!==3))throw Error('Las formas A/B/C requieren 120 casos completos');
const csvCell=value=>'"'+String(value).replaceAll('"','""')+'"';
await writeFile('dist/assets/cobertura-abc.csv','\uFEFF'+[['Pregunta','Tema de entrenamiento','Caso','Habilidad','Referencia de estudio','Cobertura OPEC'],...coverage.map(q=>[q.id,q.topic,q.title,q.skill,q.reference,'Pendiente de contrastar con indicadores individuales'])].map(row=>row.map(csvCell).join(',')).join('\n'));
for (const [i, name] of ['deep-research-report.md', 'deep-research-report(1).md', 'proceso.md'].entries()) {
  await copyFile(name, `dist/assets/investigacion-${i + 1}.md`);
}
await copyFile('guia_orientacion_dian_2676.md', 'dist/assets/guia_orientacion_dian_2676.md');
console.log(`Build completo: ${questions.length} preguntas, 3 investigaciones. Salida: dist/`);
