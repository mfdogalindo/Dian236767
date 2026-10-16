const topics = ['tributario', 'aduanero', 'cambiario', 'internacional', 'transversal', 'gestion', 'datos', 'metodo'];
export function topicFor(form, n) {
  if (n > 52) return 'integridad';
  if (n > 40) return 'comportamental';
  if (form === 'B') return n <= 12 ? 'tributario' : n <= 20 ? 'aduanero' : n <= 23 ? 'cambiario' : n <= 25 ? 'internacional' : n <= 29 ? 'transversal' : n <= 32 ? 'datos' : n <= 37 ? 'gestion' : 'metodo';
  if (form === 'C') return n <= 8 ? 'tributario' : n <= 10 ? 'tributario' : n <= 15 ? 'datos' : n <= 20 ? 'aduanero' : n <= 23 ? 'cambiario' : n <= 25 ? 'internacional' : n <= 30 ? 'transversal' : n <= 36 ? 'gestion' : 'metodo';
  const map = { 3:4,4:6,6:5,7:7,8:4,11:4,12:4,13:5,14:5,15:5,18:7,21:1,22:1,23:2,24:2,25:3,27:4,28:5,29:5,30:4,31:6,32:7,33:4,34:7,35:4,36:4,38:7,39:7,40:7 };
  return topics[map[n] ?? 0];
}
export function extractBank(report) {
  const bank = [];
  const section = report.slice(report.indexOf('### Simulacro A'), report.indexOf('## Plantillas operativas'));
  for (const form of ['A', 'B', 'C']) {
    const start = section.indexOf(`### Simulacro ${form}`);
    const end = form === 'C' ? section.length : section.indexOf(`### Simulacro ${String.fromCharCode(form.charCodeAt(0)+1)}`);
    const block = section.slice(start, end);
    for (const match of block.matchAll(new RegExp(`\\*\\*${form}(\\d+)\\.\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*${form}\\d+\\.|\\n\\n\\*\\*Clave)`, 'g'))) {
      const n = Number(match[1]);
      const parts = match[2].trim().match(/^([\s\S]*?)A\)\s*([\s\S]*?)B\)\s*([\s\S]*?)C\)\s*([\s\S]*)$/);
      if (!parts) throw new Error(`Opciones inválidas: ${form}${n}`);
      const key = form === 'A' ? block.match(new RegExp(`\\| A${n} \\| ([ABC]) \\| ([^\\n]+) \\|`)) : null;
      const explanation = key?.[2] ?? (form === 'B' ? explainB(n) : explainC(n));
      bank.push({ id: `${form}${n}`, form, number:n, type:'functional', topic:topicFor(form,n), prompt:parts[1].trim(), options:parts.slice(2).map(x=>x.trim()), correct:key ? 'ABC'.indexOf(key[1]) : 0, explanation, origin:1 });
    }
    for (const match of block.matchAll(new RegExp(`^${form}(\\d+)\\. (.+)$`, 'gm'))) {
      const n = Number(match[1]);
      if (n < 41 || n > 60) continue;
      bank.push({id:`${form}${n}`,form,number:n,type:n<=52?'behavioral':'integrity',topic:topicFor(form,n),prompt:match[2].trim(), options:['Totalmente en desacuerdo','En desacuerdo','De acuerdo','Totalmente de acuerdo'],origin:1});
    }
  }
  if (bank.length !== 180 || new Set(bank.map(q=>q.id)).size !== 180) throw new Error(`Banco incompleto: ${bank.length}/180`);
  return bank;
}
function explainB(n) {
  if(n<=12) return 'La investigación exige evidencia pertinente, valoración de los soportes y respeto del debido proceso. Una inconsistencia orienta la verificación; no sustituye una decisión motivada. Revisa las facultades de fiscalización y la prueba en el Estatuto Tributario.';
  if(n<=20) return 'El control aduanero requiere identificar la mercancía, verificar documentos y aplicar las causales, competencias y procedimiento correspondientes. Revisa el Decreto 1165 de 2019 y su reglamentación.';
  if(n<=23) return 'El control cambiario de la DIAN tiene un ámbito específico. Reconstruye la operación y sus soportes, y verifica la competencia antes de decidir. Consulta el Decreto Ley 2245 de 2011.';
  if(n<=25) return 'Las operaciones entre vinculados exigen examinar las reglas aplicables y las condiciones comparables entre independientes: principio de plena competencia. Revisa el régimen de precios de transferencia del ET.';
  if(n<=38) return 'La legalidad, la protección de la información y el control de calidad acompañan toda actuación. Elige una decisión verificable, imparcial y respetuosa de las competencias. Revisa CPACA, gestión documental y el diccionario de competencias DIAN.';
  return 'Las investigaciones describen la categoría de ingreso sin experiencia: funcionales 70 %, comportamentales 20 %, integridad 10 %, sin valoración de antecedentes. Confirma la categoría en tu inscripción y en el Acuerdo del proceso.';
}
function explainC(n) {
  if(n<=4) return 'La competencia, la secuencia del procedimiento y la confiabilidad de la evidencia son condiciones de una actuación válida. La aparente eficacia no permite omitirlas.';
  if(n<=8) return 'Los efectos jurídicos deben estar previstos por la norma. Respeta los términos y la trazabilidad; un patrón de riesgo exige verificación, sin prejuzgar.';
  if(n<=12) return 'Distingue las categorías jurídicas, los hechos acreditados y las conclusiones. Una muestra o un indicador debe interpretarse dentro de sus limitaciones.';
  if(n<=15) return 'Las herramientas requieren validación de fórmulas, seguridad de la información y responsabilidad humana. Conserva trazabilidad y utiliza los canales institucionales.';
  if(n<=20) return 'La actuación aduanera depende de las características de la mercancía, los soportes, la causal legal y la competencia. Valora también la evidencia del interesado.';
  if(n<=25) return 'Reconstruye la trazabilidad y delimita el régimen aplicable. La condición extranjera de una contraparte no constituye prueba de incumplimiento.';
  if(n<=30) return 'La Ley 1755 distingue modalidades de petición. La publicidad coexiste con reservas legales; la buena fe no impide verificar y la imparcialidad exige decidir sin favoritismos.';
  if(n<=36) return 'Los principios de integridad y gestión exigen legalidad, calidad, oportunidad, imparcialidad y claridad. La eficacia no autoriza omitir controles ni derechos.';
  return 'Practica con respuestas auténticas en autoinformes. En PJS, usa competencia, norma, procedimiento y evidencia como criterios. Administra el tiempo y revisa las omisiones al finalizar.';
}
