/** Colour Clash Football — original educational game created by Cornelius Aurelius. */
export const PATTERNS = Object.freeze([
  {id:'stripes', label:'vertical stripes', symbol:'▥'},
  {id:'hoops', label:'horizontal hoops', symbol:'☰'},
  {id:'sash', label:'diagonal sash', symbol:'╱'},
  {id:'chevrons', label:'chevrons', symbol:'⌄'},
  {id:'dots', label:'dots', symbol:'•'},
  {id:'halves', label:'split halves', symbol:'◧'}
]);
export const CHAPTERS = Object.freeze([
  {name:'THE ACADEMY',desc:'Recognise the player before the colour',size:4,seconds:23},
  {name:'THE MATCH',desc:'Scan quickly, use two independent clues',size:6,seconds:19},
  {name:'THE FINAL',desc:'Championship-level recognition',size:8,seconds:17}
]);
// Curated targets, no generated target ambiguity; six unique challenges per chapter.
const SPECS = [
  [7,'stripes'],[12,'hoops'],[9,'sash'],[4,'chevrons'],[10,'dots'],[8,'halves'],
  [14,'sash'],[6,'dots'],[11,'stripes'],[3,'halves'],[17,'hoops'],[5,'chevrons'],
  [18,'chevrons'],[15,'halves'],[19,'dots'],[22,'sash'],[16,'stripes'],[21,'hoops']
];
export const TOTAL= SPECS.length;
const CHAPTER_LINES = [
  'Combining a visible number with a shirt pattern gives you two useful clues.',
  'Contrast and pattern can help, but small details may be difficult at match speed.',
  'Good kit choices should be distinguishable before a player has to make a split-second decision.'
];
export function chapterFor(index){return Math.min(2, Math.floor(index/6));}
export function patternById(id){return PATTERNS.find(p=>p.id===id);}
function numberCandidate(seed){return 2+((seed*7+11)%22);}
function shuffle(arr,seed){const a=arr.slice();let s=seed>>>0;for(let i=a.length-1;i>0;i--){s=(1664525*s+1013904223)>>>0;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function generateRound(index){
 if(!Number.isInteger(index)||index<0||index>=TOTAL)throw new RangeError('Invalid challenge');
 const [targetNumber,targetPattern] = SPECS[index],chap=chapterFor(index),size=CHAPTERS[chap].size;
 const patterns=PATTERNS.map(p=>p.id);
 const other=patterns.filter(x=>x!==targetPattern);
 const numbers=new Set([targetNumber]);
 const uniqueNumber=(salt)=>{let v=numberCandidate(index*13+salt);while(numbers.has(v))v=v===23?2:v+1;numbers.add(v);return v;};
 const players=[
  {id:'t',number:targetNumber,pattern:targetPattern,colour:0,role:'target'},
  {id:'number',number:targetNumber,pattern:other[(index+1)%other.length],colour:1,role:'number-decoy'},
  {id:'pattern',number:uniqueNumber(2),pattern:targetPattern,colour:2,role:'pattern-decoy'}
 ];
 while(players.length<size){const slot=players.length;players.push({id:'d'+slot,number:uniqueNumber(slot+10),pattern:other[(index+slot*2)%other.length],colour:slot%4,role:'decoy'});}
 const mixed=shuffle(players,index*971+71);
 return {
  id:index+1,chapter:chap,number:targetNumber,pattern:targetPattern,
  patternLabel:patternById(targetPattern).label,players:mixed,
  explanation:`Number ${targetNumber} has ${patternById(targetPattern).label}. Checking both visible cues beats guessing by colour. ${CHAPTER_LINES[chap]}`,
  timeLimit:CHAPTERS[chap].seconds
 };
}
export function correctPlayer(round){return round.players.find(p=>p.number===round.number&&p.pattern===round.pattern);}
export function hasUniqueAnswer(round){return round.players.filter(p=>p.number===round.number&&p.pattern===round.pattern).length===1;}
export function createGame(mode='matchday'){
 if(mode!=='matchday'&&mode!=='practice')throw new Error('Unknown mode');
 return {mode,stage:0,score:0,streak:0,correct:0,errors:0,shields:mode==='matchday'?3:Infinity,finished:false,round:generateRound(0),last:null};
}
export function answer(game,playerId,secondsRemaining=0,hintUsed=false){
 if(game.finished||game.last) return game;
 const correct=correctPlayer(game.round),hit=correct.id===playerId,combo=hit?Math.min(5,game.streak):0;
 const timeBoost=(game.mode==='matchday'&&hit)?Math.min(45,Math.max(0,Math.floor(secondsRemaining*2))):0;
 const points=hit?Math.max(35,100+timeBoost+combo*12-(hintUsed?65:0)):0;
 const shields=game.mode==='practice'?Infinity:Math.max(0,game.shields-(hit?0:1));
 const next={...game,score:game.score+points,correct:game.correct+(hit?1:0),errors:game.errors+(hit?0:1),streak:hit?game.streak+1:0,shields};
 next.last={correct:hit,chosen:playerId,expected:correct.id,points,reason:game.round.explanation,usedHint:hintUsed,timeout:playerId==='timeout'};
 return next;
}
export function nextRound(game){
 if(!game.last||game.finished)return game;
 const ending=game.stage===TOTAL-1||game.shields===0;
 if(ending)return {...game,finished:true};
 const n=game.stage+1;return {...game,stage:n,round:generateRound(n),last:null};
}
export function rating(game){
 if(game.correct===TOTAL&&game.errors===0)return 'PERFECT VISIONARY';
 if(game.correct>=15)return 'ELITE PLAYMAKER';
 if(game.correct>=10)return 'FIRST TEAM SCOUT';
 if(game.correct>=5)return 'RISING TALENT';
 return 'ACADEMY ROOKIE';
}