import {TOTAL,CHAPTERS,generateRound,createGame,answer,nextRound,correctPlayer,rating,patternById} from './core.mjs';
const $=id=>document.getElementById(id);
const buttons=[...document.querySelectorAll('.theme')];
let mode='matchday',game=null,clockEnd=0,remaining=0,clockJob=null,paused=false,hintUsed=false;
const COLOURS=['#b63f52','#1b64a2','#bc742c','#2d715a'];
const bestKey='colourClashMatchVisionBestV2';
const safeGet=()=>{try{return Math.max(0,Number(localStorage.getItem(bestKey)||0)||0)}catch{return 0}};
const safeSet=v=>{try{localStorage.setItem(bestKey,String(v))}catch{}};
let best=safeGet();
function patternCSS(id){switch(id){
 case 'stripes':return 'repeating-linear-gradient(90deg,transparent 0 10px,#fff9 10px 17px)';
 case 'hoops':return 'repeating-linear-gradient(0deg,transparent 0 10px,#fff9 10px 17px)';
 case 'sash':return 'linear-gradient(60deg,transparent 0 36%,#fff9 37% 53%,transparent 54% 100%)';
 case 'chevrons':return 'linear-gradient(45deg,transparent 39%,#fff9 40% 48%,transparent 49%),linear-gradient(-45deg,transparent 39%,#fff9 40% 48%,transparent 49%)';
 case 'dots':return 'radial-gradient(circle,#fff9 0 3px,transparent 4px) 0 0/16px 16px';
 case 'halves':return 'linear-gradient(90deg,#fff9 0 50%,transparent 50% 100%)';
 default:return 'none';
}}
function message(title,text,kind=''){const el=$('feedback');el.classList.toggle('bad',kind==='bad');$('feedbackTitle').textContent=title;$('feedbackText').textContent=text;}
function setStatus(s){$('statusChip').textContent=s;}
function sync(){
 $('scoreVal').textContent=game?.score??0;$('streakVal').textContent=game?.streak??0;
 $('stageVal').textContent=game?`${game.stage+1} / ${TOTAL}`:`0 / ${TOTAL}`;
 $('shieldsVal').textContent=game?(game.mode==='practice'?'∞':game.shields):3;
 const progress=game?(game.finished?TOTAL:game.stage+(game.last?1:0)):0;
 $('progressVal').textContent=`${Math.round(progress/TOTAL*100)}%`;$('progressFill').style.width=`${progress/TOTAL*100}%`;
 $('bestVal').textContent=best;
}
function stopClock(){if(clockJob!==null){clearInterval(clockJob);clockJob=null}}
function setClock(){
 if(!game||game.mode==='practice'){$('clockText').textContent='∞';return;}
 $('clockText').textContent=`${Math.ceil(Math.max(0,remaining))}s`;
 $('clockBox').style.borderColor=remaining<=5?'#ff8a9d':'';
}
function tick(){if(!game||game.last||game.finished||paused)return;remaining=Math.max(0,(clockEnd-performance.now())/1000);setClock();if(remaining<=0){resolve('timeout');}}
function beginClock(){stopClock();if(game.mode==='practice'){remaining=Infinity;setClock();return}remaining=game.round.timeLimit;clockEnd=performance.now()+remaining*1000;clockJob=setInterval(tick,100);setClock();}
function slots(player,index){const button=document.createElement('button');button.type='button';button.className='player';button.dataset.player=player.id;button.dataset.slot=String(index+1);button.setAttribute('aria-label',`Option ${index+1}, player number ${player.number}, ${patternById(player.pattern).label}`);button.style.setProperty('--shirt',COLOURS[player.colour]);button.style.setProperty('--motif',patternCSS(player.pattern));
 const slot=document.createElement('span');slot.className='slot';slot.textContent=`0${index+1}`;
 const shirt=document.createElement('span');shirt.className='shirt';const number=document.createElement('span');number.className='shirt-number';number.textContent=player.number;shirt.append(number);
 const kit=document.createElement('span');kit.className='kit-meta';kit.textContent=patternById(player.pattern).label.toUpperCase();button.append(slot,shirt,kit);
 button.addEventListener('click',()=>resolve(player.id));return button;
}
function renderRound(){
 const round=game.round;hintUsed=false;paused=false;
 $('players').replaceChildren(...round.players.map(slots));
 $('chapterTag').textContent=`${CHAPTERS[round.chapter].name} · ${String(round.id).padStart(2,'0')} / 18`;
 $('taskTitle').textContent=round.chapter===0?'Scan the teammate':round.chapter===1?'Find the safe pass':'Matchday: make the call';
 $('taskDescription').textContent=`${CHAPTERS[round.chapter].desc}. One player matches both clues.`;
 $('targetNumber').textContent='#'+round.number;$('targetPattern').textContent=round.patternLabel.toUpperCase();
 $('hintBtn').disabled=false;$('pauseBtn').disabled=false;$('pauseBtn').textContent='PAUSE · P';
 $('nextBtn').hidden=true;$('startBtn').hidden=true;
 message('FIND BOTH CLUES',`Look for number ${round.number} and ${round.patternLabel}. Some players will share only one clue.`);
 setStatus(`STAGE ${round.id} / ${TOTAL}`);beginClock();sync();
}
function saveBest(){if(game?.mode==='matchday'&&game.score>best){best=game.score;safeSet(best)}}
function resolve(playerId){
 if(!game||game.finished||game.last||paused)return;
 stopClock();game=answer(game,playerId,Number.isFinite(remaining)?remaining:0,hintUsed);const result=game.last;
 const target=correctPlayer(game.round);for(const node of $('players').querySelectorAll('.player')){node.disabled=true;if(node.dataset.player===target.id)node.classList.add('correct');if(node.dataset.player===playerId&&!result.correct)node.classList.add('wrong')}
 if(result.correct){message(result.usedHint?'GREAT SCAN · CLUE USED':'GOAL! PERFECT PASS',`+${result.points} points. ${result.reason}`)}else{message(playerId==='timeout'?'TIME UP — WATCH THE REPLAY':'NOT QUITE — HERE IS THE ANSWER',result.reason,'bad')}
 saveBest();sync();setClock();$('hintBtn').disabled=true;$('pauseBtn').disabled=true;$('nextBtn').hidden=false;
 $('nextBtn').textContent=(game.stage===TOTAL-1||game.shields===0)?'VIEW YOUR RESULTS →':'NEXT CHALLENGE →';setStatus(result.correct?'PASS COMPLETE':'REVIEW THE CLUE');
}
function finish(){stopClock();paused=false;saveBest();$('nextBtn').hidden=true;$('startBtn').hidden=false;$('startBtn').textContent='PLAY AGAIN ↗';$('pauseBtn').disabled=true;$('hintBtn').disabled=true;
 $('taskTitle').textContent='FULL-TIME. WELL PLAYED.';$('taskDescription').textContent=rating(game);$('players').replaceChildren();
 const summary=document.createElement('div');summary.className='pitch-placeholder';summary.innerHTML='<strong>SEASON COMPLETE</strong><p>Score: <b></b> · Correct passes: <b></b> of 18</p><small>Ready for another match?</small>';summary.querySelectorAll('b')[0].textContent=game.score;summary.querySelectorAll('b')[1].textContent=game.correct;$('players').append(summary);
 message('YOUR MATCH REPORT',`${rating(game)} · ${game.correct} correct · ${game.errors} missed · ${game.score} points. Practice makes pattern recognition easier.`);setStatus('MATCH COMPLETE');sync();setClock();
}
function next(){if(!game||!game.last||paused)return;game=nextRound(game);if(game.finished){finish();return;}renderRound();}
function start(){stopClock();game=createGame(mode);renderRound();}
function changeMode(value){mode=value;const match=value==='matchday';$('modeMatchday').classList.toggle('active',match);$('modePractice').classList.toggle('active',!match);$('modeMatchday').setAttribute('aria-pressed',String(match));$('modePractice').setAttribute('aria-pressed',String(!match));reset();$('startBtn').textContent=match?'START MATCHDAY ↗':'START PRACTICE ↗';}
function reset(){stopClock();game=null;remaining=0;paused=false;hintUsed=false;
 $('players').innerHTML='<p class="pitch-placeholder">Choose Matchday or Practice, then press Start to see the players.</p>';
 $('chapterTag').textContent='THE ACADEMY · 01 / 18';$('taskTitle').textContent='Find the right teammate';$('taskDescription').textContent='Choose the player who matches both visible clues.';
 $('targetNumber').textContent='#12';$('targetPattern').textContent='VERTICAL STRIPES';$('clockText').textContent='—';$('clockBox').style.borderColor='';
 $('hintBtn').disabled=true;$('pauseBtn').disabled=true;$('nextBtn').hidden=true;$('startBtn').hidden=false;setStatus('READY TO PLAY');message('THE PITCH IS READY','Read the target number and pattern. Every round has precisely one correct shirt.');sync();
}
function pause(toggle){if(!game||game.last||game.finished)return;const nextState=toggle===undefined?!paused:toggle;if(nextState===paused)return;paused=nextState;if(paused){if(game.mode==='matchday'){remaining=Math.max(0,(clockEnd-performance.now())/1000)}stopClock();for(const player of $('players').querySelectorAll('button'))player.disabled=true;$('pauseBtn').textContent='RESUME · P';setStatus('PAUSED');message('MATCH PAUSED','Resume when ready. The countdown has stopped.');}else{if(game.mode==='matchday'){clockEnd=performance.now()+remaining*1000;clockJob=setInterval(tick,100);}for(const player of $('players').querySelectorAll('button'))player.disabled=false;$('pauseBtn').textContent='PAUSE · P';setStatus(`STAGE ${game.round.id} / ${TOTAL}`);message('BACK IN PLAY',`Find number ${game.round.number} with ${game.round.patternLabel}.`);}setClock();}
function hint(){if(!game||game.last||game.finished||paused)return;hintUsed=true;message('SCOUT TIP',`Read both clues together: player number ${game.round.number}, with ${game.round.patternLabel}. One shirt shares only the number, another shares only the pattern. A correct pass will now score fewer points.`);$('hintBtn').disabled=true;}
$('startBtn').addEventListener('click',start);$('nextBtn').addEventListener('click',next);$('restartBtn').addEventListener('click',()=>{reset();$('startBtn').textContent=mode==='matchday'?'START MATCHDAY ↗':'START PRACTICE ↗'});$('hintBtn').addEventListener('click',hint);$('pauseBtn').addEventListener('click',()=>pause());$('modeMatchday').addEventListener('click',()=>changeMode('matchday'));$('modePractice').addEventListener('click',()=>changeMode('practice'));
buttons.forEach(button=>button.addEventListener('click',()=>{const theme=button.dataset.theme;document.body.dataset.theme=theme;buttons.forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});try{localStorage.setItem('colourClashThemeV2',theme)}catch{}}));
try{let theme=localStorage.getItem('colourClashThemeV2');if(['stadium','electric','contrast'].includes(theme)){document.querySelector(`.theme[data-theme="${theme}"]`).click();}}catch{}
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.target.closest('input,textarea,select'))return;const key=e.key.toLowerCase();if(game&&game.last&&(key==='enter'||key===' ')){e.preventDefault();next();return;}if((key==='p'||key==='escape')&&game&&!game.last){e.preventDefault();pause();return;}if(key==='h'&&game){e.preventDefault();hint();return;}if(/^[1-8]$/.test(key)&&game&&!game.last&&!paused){const player=$('players').querySelector(`[data-slot="${key}"]`);if(player){e.preventDefault();player.click()}}if((key==='enter'||key===' ')&&!game&&document.activeElement===document.body){e.preventDefault();start();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game&&!game.last&&!paused)pause(true)});
window.addEventListener('pagehide',stopClock);
reset();