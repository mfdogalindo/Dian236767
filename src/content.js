export const sources = {
  concurso:{label:'Proceso DIAN 2676 · CNSC',url:'https://www.cnsc.gov.co/convocatorias/dian-2676'},
  acuerdo:{label:'Acuerdo 21 de 2025',url:'https://www.cnsc.gov.co/sites/default/files/2025-11/acuerdo-no-21-dian-2676-de-20251.pdf'},
  anexo:{label:'Anexo técnico del proceso',url:'https://www.cnsc.gov.co/sites/default/files/2025-11/anexo_ps-dian-2676-de-2025.pdf'},
  simo:{label:'SIMO · consulta tu citación',url:'https://simo-opec.cnsc.gov.co/'},
  merf:{label:'Manual de funciones · DIAN',url:'https://www.dian.gov.co/dian/entidad/Paginas/Manual_de_Funciones.aspx'},
  et:{label:'Estatuto Tributario · Normograma DIAN',url:'https://normograma.dian.gov.co/dian/compilacion/docs/estatuto_tributario.htm'},
  aduanero:{label:'Decreto 1165 de 2019',url:'https://normograma.dian.gov.co/dian/compilacion/docs/decreto_1165_2019.htm'},
  cambiario:{label:'Decreto Ley 2245 de 2011',url:'https://normograma.dian.gov.co/dian/compilacion/docs/decreto_2245_2011.htm'},
  cpaca:{label:'Ley 1437 de 2011 · CPACA',url:'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41249'},
  peticion:{label:'Ley 1755 de 2015 · petición',url:'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65334'},
  mipg:{label:'MIPG · Función Pública',url:'https://www.funcionpublica.gov.co/web/mipg'}
};
export const topics = [
  {id:'tributario',name:'Fiscalización tributaria',short:'Tributario',icon:'scale',color:'green',description:'De la hipótesis de riesgo a una decisión motivada.',sources:['et','merf'],lessons:[
    ['Investigar antes de decidir','Un cruce de información identifica una inconsistencia, no acredita por sí solo una infracción. Delimita el período, la obligación, la competencia y los hechos a verificar. El artículo 684 del ET estructura las facultades de investigación; el artículo 742 exige fundar la determinación en los hechos probados.','Un tercero reporta un ingreso mayor al declarado. Contrasta identificaciones, períodos y soportes antes de proponer una glosa.'],
    ['Secuencia y correspondencia','Distingue requerimiento ordinario, requerimiento especial y liquidación de revisión. El requerimiento especial antecede a la revisión según el régimen aplicable; la correspondencia del artículo 711 limita la liquidación a la declaración y a los hechos contemplados en el requerimiento o su ampliación.','Una glosa completamente nueva no debe introducirse sin respetar el procedimiento y el derecho de defensa.'],
    ['Firmeza, correcciones y sanciones','La firmeza limita temporalmente la modificación oficial de una declaración. No apliques un plazo único sin revisar supuestos, notificación, suspensiones y regímenes especiales. Distingue una corrección voluntaria de una provocada y revisa los requisitos de cada sanción.','Antes de ordenar una actuación, construye una línea de tiempo con presentación, vencimiento, notificaciones y posibles suspensiones.']
  ]},
  {id:'aduanero',name:'Fiscalización aduanera',short:'Aduanero',icon:'box',color:'orange',description:'Mercancía, soportes y control de las operaciones.',sources:['aduanero','merf'],lessons:[
    ['Reconstruir la operación','Identifica mercancía, declaración, documentos soporte, usuario y etapa del control. Clasificación, valor y origen tienen efectos distintos. Una diferencia exige análisis técnico y documental antes de concluir incumplimiento.','Una factura y una declaración presentan valores diferentes. Reconstruye sus conceptos y soportes; no impongas una consecuencia por la diferencia aislada.'],
    ['Aprehensión y decomiso','Distingue la medida de aprehensión de la decisión de decomiso. Cada actuación exige causal, competencia y procedimiento. Una sospecha general no reemplaza la identificación de una causal legal ni la motivación de la medida.','En una diligencia, retener la mercancía no equivale por sí solo a haber decidido definitivamente su decomiso.'],
    ['Corte normativo','Consulta el Decreto 1165 de 2019 y su reglamentación. Las investigaciones advierten cambios en el régimen sancionatorio: comprueba la vigencia y el corte de la GOA antes de trasladar una disposición actual a una pregunta de examen.','Elabora una ficha que indique norma, fecha, vigencia y disposición examinable. Evita memorizar una compilación sin sus notas de vigencia.']
  ]},
  {id:'cambiario',name:'Control cambiario',short:'Cambiario',icon:'arrows',color:'blue',description:'Competencia DIAN y trazabilidad de pagos al exterior.',sources:['cambiario','merf'],lessons:[
    ['Delimitar la competencia','La DIAN no controla indistintamente todas las operaciones de cambio. Identifica el tipo de operación y el ámbito de control antes de investigar o proponer sanciones. Distingue control cambiario, régimen aduanero y política monetaria.','Una importación con pago al exterior puede tener dimensiones aduaneras y cambiarias simultáneamente.'],
    ['Soportes y canalización','Relaciona contratos, documentos de comercio exterior, pagos, declaraciones y demás soportes exigibles. Una inconsistencia exige reconstruir el flujo y verificar obligaciones. La falta de un soporte debe valorarse según la regla aplicable.','Si el flujo financiero no coincide con el soporte comercial, documenta la diferencia y solicita la evidencia pertinente sin presumir automáticamente un delito.']
  ]},
  {id:'internacional',name:'Fiscalización internacional',short:'Internacional',icon:'globe',color:'purple',description:'Vinculados, comparabilidad y plena competencia.',sources:['et','merf'],lessons:[
    ['Plena competencia','El análisis de precios de transferencia considera operaciones con vinculados y las condiciones que observarían partes independientes en circunstancias comparables. No confundir un precio intragrupo con un arancel o una tasa de cambio.','Una transacción entre vinculados no prueba por sí sola un incumplimiento: identifica relación, operación y reglas aplicables.'],
    ['Análisis sin prejuicios','La residencia extranjera no acredita simulación. Reconstruye hechos, relación entre partes, documentación y régimen. Profundiza en convenios, RUB y obligaciones internacionales cuando los ejes individuales lo incluyan.','La condición de inglés B2 mencionada en el perfil está ligada a la ubicación en Fiscalización Internacional; confirma tu plaza en SIMO.']
  ]},
  {id:'transversal',name:'Procedimiento y servicio',short:'Transversales',icon:'book',color:'green',description:'CPACA, petición, transparencia y debido proceso.',sources:['cpaca','peticion'],lessons:[
    ['Decisiones con garantías','Determina competencia, hechos y derecho aplicable. Motiva la decisión y garantiza contradicción y notificación conforme al régimen especial; revisa la aplicación supletoria del CPACA. La eficiencia no autoriza omitir etapas obligatorias.','Una prueba favorable al administrado debe valorarse junto con el resto del expediente.'],
    ['Clasificar la petición','Distingue petición general, documentos e información y consulta. La Ley 1755 prevé términos generales de 15, 10 y 30 días respectivamente, con excepciones y reglas especiales. Ante incompetencia, aplica la remisión y comunicación previstas en la ley.','No respondas una consulta compleja usando automáticamente el término de una solicitud de copias. Primero clasifica el objeto.'],
    ['Publicidad y reserva','La transparencia opera dentro de límites legales. La reserva requiere fundamento normativo y motivación; no puede inventarse por conveniencia. Atiende de fondo, con claridad y respeto, protegiendo los datos y la información reservada.','Una solicitud de un expediente no habilita a enviar datos reservados a un correo personal ni a negar todo acceso sin examinar su fundamento.']
  ]},
  {id:'gestion',name:'Gestión pública e integridad',short:'Gestión pública',icon:'building',color:'blue',description:'MIPG, archivo, valores y trabajo institucional.',sources:['mipg','merf','cpaca'],lessons:[
    ['Gestión orientada a resultados','MIPG articula gestión y desempeño institucional. Relaciona objetivos, riesgos, controles, información y evaluación. Una meta de resultado nunca justifica alterar un dato ni omitir una garantía legal.','Si un indicador es desfavorable, verifica sus causas y propone mejoras; conserva la información real.'],
    ['Expediente y trazabilidad','La gestión documental permite reconstruir qué se hizo, quién intervino y con qué soporte. Conserva integridad, clasificación y versiones conforme a los instrumentos institucionales. Corrige mediante mecanismos auditables.','Un error de digitación se corrige con registro de la modificación, sin borrar el rastro de la actuación.'],
    ['Valores en la actuación','Honestidad, respeto, compromiso, diligencia y justicia orientan el servicio. Declara los posibles conflictos de interés, actúa por los canales correspondientes y comunica errores. Estudia las competencias del diccionario DIAN.','Si una orden contradice la legalidad, aclara y gestiona la instrucción por canales institucionales; la jerarquía no vuelve legítima cualquier actuación.']
  ]},
  {id:'datos',name:'Datos y herramientas',short:'Datos',icon:'chart',color:'orange',description:'Analítica, hojas de cálculo y evidencia confiable.',sources:['et','merf'],lessons:[
    ['Validar antes de concluir','La analítica orienta la selección de casos. Revisa calidad de datos, fuentes, atribución, duplicados y limitaciones de la muestra. Diferencia observación, hipótesis y conclusión. Un algoritmo no sustituye la prueba del expediente.','Si una fórmula cambia al ordenar filas, revisa referencias y rangos antes de usar el resultado.'],
    ['Seguridad de la información','Usa sistemas y canales institucionales. Preserva trazabilidad de la evidencia electrónica y restringe accesos por función. Ante un envío erróneo, gestiona el incidente según el procedimiento institucional.','No uses dispositivos personales como respaldo informal de un expediente reservado.']
  ]},
  {id:'metodo',name:'Método PJS y examen',short:'Método PJS',icon:'target',color:'purple',description:'Decidir por norma, etapa, competencia y evidencia.',sources:['concurso','anexo'],lessons:[
    ['Resolver con una secuencia','Lee el enunciado y localiza la decisión requerida. Identifica autoridad, etapa y hecho determinante. Descarta opciones que exceden competencia, omiten defensa o convierten un indicio en prueba definitiva. Compara las alternativas restantes.','Dos respuestas parecen útiles: prefiere la que también cumple el procedimiento y valora la evidencia relevante.'],
    ['Entrenar con métricas honestas','El porcentaje bruto de aciertos es una métrica de estudio. No equivale a la transformación psicométrica oficial. La cantidad de preguntas y la distribución de estos simulacros corresponden al material de investigación, no al cuadernillo oficial.','Establece metas de práctica de 90 %, luego 95 %, y revisa cada error repetido.'],
    ['Autoinformes auténticos','Los autoinformes comportamentales y de integridad no tienen una clave convencional de aciertos. Lee las afirmaciones completas y responde con honestidad. Marcar siempre la opción más favorable no garantiza ningún puntaje.','Esta plataforma registra que completaste la práctica Likert, sin convertir tus respuestas en una nota.']
  ]},
  {id:'comportamental',name:'Competencias comportamentales',short:'Comportamental',icon:'users',color:'blue',description:'Adaptabilidad, comunicación y trabajo en equipo.',sources:['merf','concurso'],lessons:[['Leer y responder con autenticidad','Practica la lectura de afirmaciones directas e inversas. Reflexiona sobre comunicación efectiva, adaptabilidad y trabajo en equipo a partir de experiencias propias. No se calcula una nota ni un perfil ideal.','Reconocer cuándo necesitas retroalimentación es parte del aprendizaje. Contesta según tu comportamiento habitual.']]},
  {id:'integridad',name:'Autoinforme de integridad',short:'Integridad',icon:'shield',color:'purple',description:'Reflexión sobre valores, imparcialidad y reserva.',sources:['merf','concurso'],lessons:[['Consistencia y reflexión','Reflexiona sobre conflictos de interés, manejo de recursos e información reservada. Estas afirmaciones son ejercicios del informe, no instrumentos psicométricos validados. No se asignan respuestas correctas.','Lee con atención palabras como «siempre», «únicamente» y «aunque». No respondas siguiendo un patrón de letras.']]}
];
export const forms=[
  {id:'A',name:'Fundamentos y procedimiento',tag:'CONSTRUYE TU BASE',description:'Competencia, evidencia y garantías de la actuación administrativa.',icon:'book',color:'green'},
  {id:'B',name:'Fiscalización en acción',tag:'APLICA LO APRENDIDO',description:'Control tributario, aduanero, cambiario e internacional.',icon:'scale',color:'orange'},
  {id:'C',name:'Integración y criterio',tag:'AFINA TUS DECISIONES',description:'Cruza conceptos y reconoce distractores de juicio situacional.',icon:'target',color:'purple'}
];
export const plan=[
  ['ET: facultades, prueba y liquidaciones',12,'Construye el flujo: investigación → requerimiento → respuesta → decisión. Revisa firmeza, sanciones y correspondencia.'],
  ['Régimen y fiscalización aduanera',12,'Estudia mercancía, control posterior, aprehensión y decomiso. Verifica la vigencia de las normas al corte.'],
  ['Operaciones y control cambiario',8,'Reconstruye pagos y soportes; delimita la competencia DIAN.'],
  ['Fiscalización internacional',8,'Vinculados, plena competencia y comparabilidad. Confirma tus ejes individuales.'],
  ['CPACA, petición y transparencia',8,'Practica competencia, motivación, modalidades de petición, publicidad y reserva.'],
  ['MIPG, archivo y herramientas',4,'Relaciona riesgos y controles; valida fórmulas, fuentes y trazabilidad.'],
  ['Perfil AT-FL-3008',4,'Relaciona cada función con su norma, actuación y garantía.'],
  ['Comportamentales e integridad',4,'Lee el diccionario DIAN y practica afirmaciones sin buscar una clave ideal.'],
  ['Simulacro A y diagnóstico',4,'Reserva una sesión continua. Registra las causas de los errores.'],
  ['Reparar las tres mayores brechas',8,'Relee las fuentes de los temas con peor desempeño; practica por tema.'],
  ['Simulacro B',4,'Comprueba tiempo, omisiones y reincidencia. Usa la forma C como refuerzo adicional.'],
  ['Remediación final',8,'Revisa errores repetidos, flujos de procedimiento y pruebas.'],
  ['Precisión y logística',3,'Practica un bloque breve. Confirma citación, documento, lugar y materiales en SIMO.'],
  ['Repaso ligero y descanso',2,'Repasa tu bitácora; prepara la logística y protege el descanso.']
];
