export const intervals=[1,3,7,14];
export function studyDay(now=Date.now()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value=type=>Number(parts.find(p=>p.type===type).value);
  return Date.UTC(value('year'),value('month')-1,value('day'))/86400000;
}
export function scheduleReview(previous,recalled,today=studyDay()){
  const step=recalled?Math.min((previous?.step??-1)+1,intervals.length-1):0;
  return {step,due:today+intervals[step],reviews:(previous?.reviews??0)+1,last:today};
}
export function dueCards(cards,reviews,today=studyDay()){
  return cards.filter(c=>!reviews[c.id]||reviews[c.id].due<=today).sort((a,b)=>(reviews[a.id]?.due??today)-(reviews[b.id]?.due??today));
}
