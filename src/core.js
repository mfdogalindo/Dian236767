export function shuffle(items, random=Math.random) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function prepareQuestions(questions, random=Math.random){
  return questions.map(q=>{
    if(q.type!=='functional')return {...q};
    const order=shuffle(q.options.map((_,i)=>i),random);
    return {...q,options:order.map(i=>q.options[i]),correct:order.indexOf(q.correct),...(q.rationales?{rationales:order.map(i=>q.rationales[i])}:{})};
  });
}
export function findQuestionVersion(question, current, previous=[]){
  return [...current,...previous].find(q=>q.id===question.id&&(q.revision??1)===(question.revision??1)&&q.prompt===question.prompt);
}
export function grade(session){
  const functional=session.questions.filter(q=>q.type==='functional');
  const correct=functional.filter(q=>session.answers[q.id]===q.correct).length;
  const answered=session.questions.filter(q=>Number.isInteger(session.answers[q.id])).length;
  const topics={};
  for(const q of functional){const t=topics[q.topic]??={correct:0,total:0};t.total++;if(session.answers[q.id]===q.correct)t.correct++;}
  return {correct,total:functional.length,percentage:functional.length?Math.floor(correct/functional.length*10000)/100:null,answered,omitted:session.questions.length-answered,topics};
}
export function remaining(session,now=Date.now()){return session.deadline?Math.max(0,Math.ceil((session.deadline-now)/1000)):null;}
export function duration(seconds){return `${Math.floor(seconds/3600).toString().padStart(2,'0')}:${Math.floor(seconds%3600/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
