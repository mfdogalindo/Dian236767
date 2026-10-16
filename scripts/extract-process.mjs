import { drills, processExplanations } from '../src/process-content.js';

export function extractProcessBank(report){
  const questions=[];
  for(const [index,drill] of drills.entries()){
    const start=report.indexOf('### '+drill.heading+'\n');
    if(start<0)throw Error(`No se encontró ${drill.heading}`);
    const next=report.indexOf('\n### ',start+4);
    const block=report.slice(start,next<0?report.length:next);
    const keys=[...block.matchAll(/(?:\*\*Soluciones:\*\*|;)\s*(\d+)-([ABC])/g)];
    if(keys.length!==10)throw Error(`Claves incompletas en ${drill.id}`);
    for(const row of block.matchAll(/^\| (\d+) \| (.+) \|.*$/gm)){
      const number=Number(row[1]);
      const cells=row[0].split('|').slice(1,-1).map(x=>x.trim());
      const combined=cells.slice(1).filter(Boolean).join(' ').replaceAll('**','');
      const optionStart=combined.indexOf('A)');
      const prompt=combined.slice(0,optionStart).trim();
      const options=[...combined.slice(optionStart).matchAll(/[ABC]\)\s*([\s\S]*?)(?=\s+[ABC]\)|$)/g)].map(m=>m[1].trim());
      const key=keys.find(m=>Number(m[1])===number)?.[2];
      const correct='ABC'.indexOf(key);
      if(!prompt||options.length<2||correct<0||correct>=options.length)throw Error(`Ítem inválido ${drill.id}-${number}`);
      let topic=drill.topic;
      if(index===0)topic=number>=5&&number<=8?'metodo':number===9?'transversal':'gestion';
      if(index===1&&number===10)topic='metodo';
      if(index===3&&number===7)topic='internacional';
      if(index===4)topic=['transversal','gestion','gestion','gestion','tributario','aduanero','cambiario','datos','metodo','metodo'][number-1];
      questions.push({id:`${drill.id}-${number}`,form:drill.id,number,type:'functional',topic,prompt,options,correct,explanation:processExplanations[index][number-1],origin:3,sourceRefs:drill.sources});
    }
    if(questions.filter(q=>q.form===drill.id).length!==10)throw Error(`Banco incompleto: ${drill.id}`);
  }
  if(questions.length!==50||new Set(questions.map(q=>q.id)).size!==50)throw Error('Se esperaban 50 preguntas únicas de proceso.md');
  return questions;
}
