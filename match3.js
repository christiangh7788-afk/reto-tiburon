(()=>{
'use strict';
const SIZE=9;
const TYPES=[
  {name:'Recargas',icon:'📱'},
  {name:'Producto adoptado',icon:'★'},
  {name:'Cerveza',icon:'🍺'},
  {name:'Cañonetos',icon:'🧃'},
  {name:'Venta diaria',icon:'🛒'},
  {name:'Reto semanal',icon:'⚡'}
];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const pos=i=>({r:Math.floor(i/SIZE),c:i%SIZE});
const idx=(r,c)=>r*SIZE+c;
const inside=(r,c)=>r>=0&&r<SIZE&&c>=0&&c<SIZE;
const adjacent=(a,b)=>{const p=pos(a),q=pos(b);return Math.abs(p.r-q.r)+Math.abs(p.c-q.c)===1};

class Match3Game{
  constructor(){
    this.dialog=document.getElementById('match3Dialog');
    this.boardEl=document.getElementById('match3Board');
    this.objectivesEl=document.getElementById('match3Objectives');
    this.messageEl=document.getElementById('match3Message');
    this.resultEl=document.getElementById('match3Result');
    this.board=[];this.selected=null;this.busy=false;this.moves=0;this.level=1;this.score=0;this.objectives=[];this.createdPowerups=0;this.activated={rocket:0,bomb:0,color:0};this.pointerStart=null;this.onFinish=null;
    this.bind();
  }
  bind(){
    document.getElementById('match3Close').addEventListener('click',()=>this.close());
    document.getElementById('match3ResultContinue').addEventListener('click',()=>this.finishAndClose());
    document.getElementById('match3Retry').addEventListener('click',()=>this.start({level:this.level,onFinish:this.onFinish,retry:true}));
    document.getElementById('match3Exit').addEventListener('click',()=>this.close());
    document.getElementById('match3LoseExit').addEventListener('click',()=>this.close());
    document.querySelector('.match3-sound').addEventListener('click',e=>{const on=window.RetoTiburon?.toggleMusic?.();e.currentTarget.textContent=on?'🎵':'🔇'});
    this.dialog.addEventListener('close',()=>window.RetoTiburon?.setMatch3Active?.(false));
    this.boardEl.addEventListener('click',e=>{const gem=e.target.closest('.match3-gem');if(gem)this.select(Number(gem.dataset.index))});
    this.boardEl.addEventListener('pointerdown',e=>{const gem=e.target.closest('.match3-gem');if(!gem)return;this.pointerStart={index:Number(gem.dataset.index),x:e.clientX,y:e.clientY}});
    this.boardEl.addEventListener('pointerup',e=>{if(!this.pointerStart)return;const start=this.pointerStart;this.pointerStart=null;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;const p=pos(start.index);let r=p.r,c=p.c;if(Math.abs(dx)>Math.abs(dy))c+=dx>0?1:-1;else r+=dy>0?1:-1;if(inside(r,c))this.trySwap(start.index,idx(r,c))});
  }
  start({level=1,onFinish=null}={}){
    this.level=Math.max(1,Math.min(30,Number(level)||1));
    this.onFinish=onFinish||this.onFinish;
    this.moves=Math.max(18,25-Math.floor((this.level-1)/6));
    this.score=0;this.selected=null;this.busy=false;this.createdPowerups=0;this.activated={rocket:0,bomb:0,color:0};
    this.objectives=this.makeObjectives();
    this.board=this.makePlayableBoard();
    this.resultEl.hidden=true;
    document.getElementById('match3SuccessCard').hidden=false;
    document.getElementById('match3LoseCard').hidden=true;
    document.getElementById('match3Level').textContent=`BONO ${this.level}`;
    document.getElementById('match3Rank').textContent=window.RetoTiburon?.getRank?.()||'Aprendiz Tiburón';
    this.setMessage('Alinea 3 o más fichas. Toca dos fichas vecinas o desliza.');
    this.render(true);this.renderHud();
    if(!this.dialog.open)this.dialog.showModal();
    window.RetoTiburon?.setMatch3Active?.(true);
  }
  close(){
    if(this.dialog.open)this.dialog.close();
    window.RetoTiburon?.setMatch3Active?.(false);
  }
  finishAndClose(){this.close()}
  makeObjectives(){
    const a=(this.level-1)%TYPES.length;
    const b=(a+2+(this.level%2))%TYPES.length;
    const goals=[
      {kind:'type',type:a,target:10+(this.level%4)*2,current:0},
      {kind:'type',type:b,target:8+(this.level%3)*2,current:0}
    ];
    if(this.level>=4)goals.push({kind:'rocket',target:this.level>=18?2:1,current:0});
    return goals;
  }
  randomCell(){return {type:Math.floor(Math.random()*TYPES.length),special:null,isNew:true}}
  makePlayableBoard(){
    for(let attempt=0;attempt<100;attempt++){
      const board=[];
      for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
        let cell,guard=0;
        do{cell=this.randomCell();guard++}while(guard<50&&((c>=2&&board[idx(r,c-1)].type===cell.type&&board[idx(r,c-2)].type===cell.type)||(r>=2&&board[idx(r-1,c)].type===cell.type&&board[idx(r-2,c)].type===cell.type)));
        board.push(cell);
      }
      this.board=board;
      if(this.hasPossibleMove())return board;
    }
    return Array.from({length:SIZE*SIZE},()=>this.randomCell());
  }
  render(initial=false,extraClass=new Map()){
    this.boardEl.innerHTML='';
    this.board.forEach((cell,i)=>{
      const button=document.createElement('button');button.type='button';button.className='match3-gem';button.dataset.index=i;button.setAttribute('role','gridcell');
      if(!cell){button.classList.add('empty');button.setAttribute('aria-label','Espacio vacío');this.boardEl.appendChild(button);return}
      button.dataset.type=String(cell.type);button.textContent=TYPES[cell.type].icon;button.setAttribute('aria-label',`${TYPES[cell.type].name}${cell.special?' con potenciador '+cell.special:''}`);
      if(i===this.selected)button.classList.add('selected');
      if(cell.special){button.classList.add('special',cell.special)}
      if(initial||cell.isNew)button.classList.add('new-gem');
      const cls=extraClass.get(i);if(cls)button.classList.add(cls);
      cell.isNew=false;this.boardEl.appendChild(button);
    });
  }
  renderHud(){
    document.getElementById('match3Moves').textContent=this.moves;
    document.getElementById('match3Score').textContent=this.score.toLocaleString('es-MX');
    const preview=this.calculateReward();document.getElementById('match3Bonus').textContent=`${preview} nc`;
    this.objectivesEl.innerHTML='';
    this.objectives.forEach(goal=>{
      const remaining=Math.max(0,goal.target-goal.current);const card=document.createElement('div');card.className='match3-objective'+(remaining===0?' done':'');
      let icon='🚀',label='Activa cohetes';if(goal.kind==='type'){icon=TYPES[goal.type].icon;label=TYPES[goal.type].name}else if(goal.kind==='bomb'){icon='💣';label='Activa bombas'}else if(goal.kind==='color'){icon='🌈';label='Bolas de color'}
      card.innerHTML=`<span class="match3-objective-icon">${icon}</span><div><small>${label}</small><strong>${remaining===0?'✓':remaining+' restantes'}</strong></div>`;this.objectivesEl.appendChild(card);
    });
  }
  calculateReward(){return 45+this.level*2+Math.max(0,this.moves)*4+Math.min(60,Math.floor(this.score/120))}
  setMessage(text){this.messageEl.textContent=text}
  async select(index){
    if(this.busy||!this.board[index])return;
    if(this.selected===null){this.selected=index;this.render();return}
    if(this.selected===index){this.selected=null;this.render();return}
    const first=this.selected;this.selected=null;
    if(!adjacent(first,index)){this.selected=index;this.render();return}
    await this.trySwap(first,index);
  }
  swap(a,b){const t=this.board[a];this.board[a]=this.board[b];this.board[b]=t}
  async trySwap(a,b){
    if(this.busy||!adjacent(a,b)||!this.board[a]||!this.board[b])return;
    this.busy=true;this.selected=null;
    const specialSwap=Boolean(this.board[a].special||this.board[b].special);
    this.swap(a,b);this.render();await sleep(170);
    const groups=this.findGroups();
    if(!specialSwap&&groups.length===0){
      const cls=new Map([[a,'invalid'],[b,'invalid']]);this.render(false,cls);window.RetoTiburon?.playSfx?.('error');await sleep(270);this.swap(a,b);this.render();this.setMessage('Ese movimiento no forma una combinación.');this.busy=false;return;
    }
    this.moves--;window.RetoTiburon?.playSfx?.('click');
    if(specialSwap)await this.resolveSpecialSwap(a,b);else await this.resolveCascades([a,b]);
    this.renderHud();
    if(this.objectives.every(g=>g.current>=g.target)){await sleep(250);this.win();return}
    if(this.moves<=0){await sleep(250);this.lose();return}
    if(!this.hasPossibleMove()){this.setMessage('Sin movimientos posibles. Reorganizando tablero…');await sleep(420);this.board=this.makePlayableBoard();this.render(true)}
    this.busy=false;
  }
  findGroups(){
    const groups=[];
    for(let r=0;r<SIZE;r++){
      let start=0;
      while(start<SIZE){const cell=this.board[idx(r,start)];if(!cell){start++;continue}let end=start+1;while(end<SIZE&&this.board[idx(r,end)]&&this.board[idx(r,end)].type===cell.type)end++;if(end-start>=3)groups.push({dir:'h',indices:Array.from({length:end-start},(_,k)=>idx(r,start+k)),type:cell.type});start=end}
    }
    for(let c=0;c<SIZE;c++){
      let start=0;
      while(start<SIZE){const cell=this.board[idx(start,c)];if(!cell){start++;continue}let end=start+1;while(end<SIZE&&this.board[idx(end,c)]&&this.board[idx(end,c)].type===cell.type)end++;if(end-start>=3)groups.push({dir:'v',indices:Array.from({length:end-start},(_,k)=>idx(start+k,c)),type:cell.type});start=end}
    }
    return groups;
  }
  hasMatches(){return this.findGroups().length>0}
  hasPossibleMove(){
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
      const a=idx(r,c);for(const [dr,dc] of [[0,1],[1,0]]){const rr=r+dr,cc=c+dc;if(!inside(rr,cc))continue;const b=idx(rr,cc);this.swap(a,b);const valid=this.hasMatches()||this.board[a]?.special||this.board[b]?.special;this.swap(a,b);if(valid)return true}
    }return false;
  }
  chooseCreations(groups,preferred=[]){
    const creations=new Map();const hBy=new Map(),vBy=new Map();
    groups.forEach(g=>g.indices.forEach(i=>(g.dir==='h'?hBy:vBy).set(i,g)));
    for(const [i,h] of hBy){if(vBy.has(i)){creations.set(i,{type:h.type,special:'bomb'});break}}
    groups.forEach(g=>{
      if(g.indices.some(i=>creations.has(i)))return;
      let special=null;if(g.indices.length>=5)special='color';else if(g.indices.length===4)special=g.dir==='h'?'rocketH':'rocketV';if(!special)return;
      const place=preferred.find(i=>g.indices.includes(i))??g.indices[Math.floor(g.indices.length/2)];if(!creations.has(place))creations.set(place,{type:g.type,special});
    });
    return creations;
  }
  async resolveCascades(preferred=[]){
    let cascade=0;
    while(true){
      const groups=this.findGroups();if(!groups.length)break;cascade++;
      const creations=this.chooseCreations(groups,cascade===1?preferred:[]);
      const clear=new Set(groups.flatMap(g=>g.indices));
      creations.forEach((_,i)=>clear.delete(i));
      this.expandExistingSpecials(clear);
      await this.clearCells(clear,creations,cascade);
      await this.dropAndFill();
      if(cascade>1){this.score+=cascade*25;this.setMessage(`¡Cascada x${cascade}!`)}
    }
  }
  expandExistingSpecials(clear){
    const queue=[...clear];const seen=new Set();
    while(queue.length){const i=queue.pop();if(seen.has(i))continue;seen.add(i);const cell=this.board[i];if(!cell?.special)continue;this.countActivation(cell.special);for(const j of this.effectIndices(i,cell.special))if(!clear.has(j)){clear.add(j);queue.push(j)}}
  }
  effectIndices(i,special){
    const {r,c}=pos(i);const set=new Set([i]);
    if(special==='rocketH')for(let cc=0;cc<SIZE;cc++)set.add(idx(r,cc));
    if(special==='rocketV')for(let rr=0;rr<SIZE;rr++)set.add(idx(rr,c));
    if(special==='bomb')for(let rr=r-1;rr<=r+1;rr++)for(let cc=c-1;cc<=c+1;cc++)if(inside(rr,cc))set.add(idx(rr,cc));
    if(special==='color')for(let j=0;j<this.board.length;j++)if(this.board[j])set.add(j);
    return set;
  }
  countActivation(special){if(special==='rocketH'||special==='rocketV')this.activated.rocket++;else if(special==='bomb')this.activated.bomb++;else if(special==='color')this.activated.color++}
  async resolveSpecialSwap(a,b){
    const first=this.board[a],second=this.board[b];let clear=new Set([a,b]);
    const specials=[first?.special,second?.special].filter(Boolean);
    if(specials.includes('color')){
      const other=first?.special==='color'?second:first;
      if(other?.special==='color'){for(let i=0;i<this.board.length;i++)if(this.board[i])clear.add(i);this.activated.color+=2}
      else{const colorType=other?.type;for(let i=0;i<this.board.length;i++)if(this.board[i]?.type===colorType)clear.add(i);this.activated.color++;if(other?.special){this.countActivation(other.special);for(const i of [...clear])for(const j of this.effectIndices(i,other.special))clear.add(j)}}
    }else if(specials.length===2){
      const s1=first.special,s2=second.special;
      if((s1.startsWith('rocket')&&s2==='bomb')||(s2.startsWith('rocket')&&s1==='bomb')){
        const {r,c}=pos(b);for(let rr=r-1;rr<=r+1;rr++)if(inside(rr,c))for(let cc=0;cc<SIZE;cc++)clear.add(idx(rr,cc));for(let cc=c-1;cc<=c+1;cc++)if(inside(r,cc))for(let rr=0;rr<SIZE;rr++)clear.add(idx(rr,cc));this.activated.rocket++;this.activated.bomb++;
      }else if(s1==='bomb'&&s2==='bomb'){
        for(const center of [a,b]){const {r,c}=pos(center);for(let rr=r-2;rr<=r+2;rr++)for(let cc=c-2;cc<=c+2;cc++)if(inside(rr,cc))clear.add(idx(rr,cc))}this.activated.bomb+=2;
      }else{
        for(const center of [a,b]){const cell=this.board[center];this.countActivation(cell.special);for(const j of this.effectIndices(center,cell.special))clear.add(j)}
      }
    }else{
      const specialIndex=first?.special?a:b;const cell=this.board[specialIndex];this.countActivation(cell.special);for(const j of this.effectIndices(specialIndex,cell.special))clear.add(j);
    }
    this.expandExistingSpecials(clear);await this.clearCells(clear,new Map(),1);await this.dropAndFill();await this.resolveCascades([]);
  }
  updateObjectives(cells){
    cells.forEach(cell=>{if(!cell)return;this.objectives.forEach(goal=>{if(goal.kind==='type'&&goal.type===cell.type)goal.current++})});
    this.objectives.forEach(goal=>{if(goal.kind==='rocket')goal.current=this.activated.rocket;if(goal.kind==='bomb')goal.current=this.activated.bomb;if(goal.kind==='color')goal.current=this.activated.color});
  }
  async clearCells(clear,creations,cascade){
    const removed=[...clear].map(i=>this.board[i]).filter(Boolean);this.updateObjectives(removed);this.score+=removed.length*10*cascade;const cls=new Map([...clear].map(i=>[i,'removing']));this.render(false,cls);this.renderHud();window.RetoTiburon?.playSfx?.('coin');await sleep(220);
    clear.forEach(i=>{this.board[i]=null});
    creations.forEach((cell,i)=>{this.board[i]={...cell,isNew:true};this.createdPowerups++;this.score+=40});
    this.render();
  }
  async dropAndFill(){
    for(let c=0;c<SIZE;c++){
      let write=SIZE-1;
      for(let r=SIZE-1;r>=0;r--){const i=idx(r,c);if(this.board[i]){if(write!==r){this.board[idx(write,c)]=this.board[i];this.board[i]=null}write--}}
      while(write>=0){this.board[idx(write,c)]=this.randomCell();write--}
    }
    this.render();await sleep(260);
  }
  win(){
    this.busy=true;
    const reward=this.calculateReward();
    const result=window.RetoTiburon?.addBonusCoins?.({level:this.level,reward,movesLeft:this.moves,score:this.score})||{reward,rank:'Aprendiz Tiburón'};
    document.getElementById('match3SuccessCard').hidden=false;
    document.getElementById('match3LoseCard').hidden=true;
    document.getElementById('match3ResultText').textContent=`Objetivos completos con ${this.moves} movimientos`;
    document.getElementById('match3ResultReward').textContent=`+${result.reward??reward}`;
    document.getElementById('match3ResultRank').textContent=result.rank||'';
    this.resultEl.hidden=false;
    window.RetoTiburon?.playSfx?.('success');
    this.onFinish?.({won:true,reward:result.reward??reward,level:this.level});
  }
  lose(){
    this.busy=true;
    document.getElementById('match3SuccessCard').hidden=true;
    document.getElementById('match3LoseCard').hidden=false;
    document.getElementById('match3LoseTitle').textContent='Sin movimientos';
    document.getElementById('match3LoseText').textContent='Estuviste cerca. Puedes volver a intentarlo sin perder tu misión diaria.';
    this.resultEl.hidden=false;
    window.RetoTiburon?.playSfx?.('error');
    this.onFinish?.({won:false,level:this.level});
  }
}

document.addEventListener('DOMContentLoaded',()=>{window.RetoMatch3=new Match3Game()});
})();
