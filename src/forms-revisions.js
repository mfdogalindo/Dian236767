import {formARevisions} from './forms-a.js';
import {formBRevisions} from './forms-b.js';
import {formCRevisions} from './forms-c.js';
import {conciseDecisions,distractorEdits} from './forms-option-edits.js';

// Bibliografía de estudio, no afirmación de validación psicométrica ni cobertura OPEC.
const frameworks={
  tributario:['et','ET, artículos 684 y 742: facultades de investigación y decisiones fundadas en hechos probados.','Relacionar evidencia, hipótesis y actuación tributaria.'],
  aduanero:['aduanero','Régimen aduanero: Decreto 1165 de 2019 y reglamentación, con notas de vigencia. El caso no establece una causal sancionatoria real nueva.','Reconstruir identidad, soportes y alcance del control aduanero.'],
  cambiario:['cambiario','Control cambiario: Decreto Ley 2245 de 2011; complementar con regulación Banrep para la operación.','Delimitar operación, competencia y trazabilidad de flujos.'],
  internacional:['et','ET, régimen de precios de transferencia, en particular criterios de comparabilidad del artículo 260-4.','Distinguir vinculación y comparabilidad económica.'],
  transversal:['cpaca','CPACA, principios de la actuación administrativa. Aplicar el régimen especial cuando corresponda.','Relacionar competencia, garantías y necesidad del usuario.'],
  gestion:['merf','MERF como referencia del rol; las reglas operativas expresas del caso son supuestos de entrenamiento.','Aplicar criterios de gestión, calidad y responsabilidad al caso.'],
  datos:['merf','Perfil de trabajo como contexto; la solución se fundamenta en los datos y relaciones descritos en el caso.','Validar calidad, correspondencia y límites de los datos.'],
  metodo:['merf','Método de análisis aplicado a una situación hipotética de trabajo; las reglas del caso no son reglas adicionales del concurso.','Seleccionar hechos y requisitos determinantes para decidir.']
};
const specific={
  A25:['et','ET, artículo 260-4: criterios de comparabilidad; no se determina un precio definitivo.'],
  B4:['et','ET, artículo 711: correspondencia entre declaración, requerimiento y liquidación de revisión.'],
  B8:['et','ET, artículo 714 y reglas especiales de firmeza: identificar supuesto y cronología antes del cómputo.'],
  B9:['et','ET, artículos 588 y 589: distinguir efecto y régimen de la corrección; revisar vigencia y supuesto.'],
  C10:['et','ET, artículos 869 y siguientes: examinar presupuestos y procedimiento; el beneficio no prueba por sí solo abuso.'],
  A11:['peticion','Ley 1755 de 2015: respuesta pertinente a los componentes solicitados.'],
  A12:['peticion','Ley 1755 de 2015, artículos 24 y 25: reserva y motivación. La reserva del anexo es un hecho dado en el caso.'],
  C26:['peticion','Ley 1755 de 2015, artículo 14: distinguir modalidades por el objeto de la petición.'],
  C27:['peticion','Ley 1755 de 2015, artículo 14: documentos y consultas tienen tratamiento diferenciado.'],
  A13:['mipg','MIPG: distinguir ejecución de actividades y evaluación de resultados.'],
  C31:['mipg','MIPG: mejora de procesos y controles. La obligatoriedad del control es un supuesto explícito del caso.']
};
export const completeFormRows=[...formARevisions,...formBRevisions,...formCRevisions];
export function completeFormRevisions(bank){
  const result={};
  for(const [id,title,scenario,prompt,originalOptions,originalRationales] of completeFormRows){
    const options=[...originalOptions],rationales=[...originalRationales];
    if(conciseDecisions[id])options[0]=conciseDecisions[id];
    for(const [index,[option,rationale]] of Object.entries(distractorEdits[id]??{})){
      options[Number(index)]=option;rationales[Number(index)]=rationale;
    }
    const original=bank.find(q=>q.id===id);
    if(!original||original.type!=='functional'||result[id])throw Error(`Revisión funcional inválida: ${id}`);
    const [source,reference,skill]=frameworks[original.topic];
    // Distribución de claves en el archivo, además de la mezcla al iniciar cada sesión.
    const shift=original.number%3;
    const order=[0,1,2].map(i=>(i+shift)%3);
    result[id]={revision:2,title,scenario,prompt,options:order.map(i=>options[i]),rationales:order.map(i=>rationales[i]),
      correct:order.indexOf(0),explanation:rationales[0],sourceRefs:[specific[id]?.[0]??source],
      reference:specific[id]?.[1]??reference,skill};
  }
  return result;
}
