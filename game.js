(() => {
"use strict";
const $ = id => document.getElementById(id);
const ITEMS = {
 glasses:{name:"パキスラのメガネ",icon:"🕶️",desc:"レンズ越しに見ると、普通の壁や紙に隠された文字が浮かび上がる。",use:"hidden"},
 radio:{name:"ぐーばのラジオ",icon:"📻",desc:"ノイズの向こうに、部屋の仕掛けと数字のヒントが混じっている。",use:"radio"},
 pc:{name:"テオのPC",icon:"💻",desc:"起動中の小型PC。入力画面から記録ファイルへアクセスできそうだ。",use:"pc"},
 hammer:{name:"破壊のハンマー",icon:"🔨",desc:"古い錠前なら壊せる。大切な機械まで壊さないように。",use:"hammer"},
 battery:{name:"予備バッテリー",icon:"🔋",desc:"ラジオの電源を復活させる電池。",use:"battery"},
 note:{name:"破れたメモ",icon:"📄",desc:"「鏡の裏、時計の下、音のない場所」と書かれている。",use:"note"},
 keycard:{name:"青いキーカード",icon:"🪪",desc:"研究棟のカードリーダーに反応する。",use:"keycard"},
 prism:{name:"小さなプリズム",icon:"🔷",desc:"光を分けるガラス片。暗号の一部を照らし出せる。",use:"prism"},
 fuse:{name:"ヒューズ",icon:"🧩",desc:"配電盤に使う部品。",use:"fuse"},
 charm:{name:"遼のチャーム",icon:"🧿",desc:"遼が最初から身につけていた、不思議なチャーム。",use:"charm"}
};
const ROOMS = {
 bedroom:{chapter:"CHAPTER 01",tag:"ROOM 01",title:"目覚めの部屋",art:"bedroom",text:"遼は見知らぬ部屋で目を覚ました。窓の外は真っ暗。扉には古いダイヤル錠、机の上には何かを置いた跡がある。\n\n壁のスピーカーから、かすかな声が聞こえた。「……見えるものだけを信じるな」",actions:[
 ["部屋をくまなく調べる","inspect","room"],
 ["机の引き出し","drawer","drawer"],
 ["扉のダイヤル錠","lock","lock"],
 ["壁の時計","clock","clock"],
 ["床の通気口","vent","vent"]
 ]},
 hall:{chapter:"CHAPTER 02",tag:"ROOM 02",title:"音のない廊下",art:"hall",text:"扉の向こうは、異様なほど静かな廊下だった。非常灯が赤く点滅し、奥に「記録室」と書かれた扉がある。壁の額縁はすべて裏返されている。",actions:[
 ["額縁を調べる","frame","frame"],
 ["非常灯の下を調べる","emergency","emergency"],
 ["記録室へ進む","goto","records"],
 ["来た道を振り返る","lookback","lookback"]
 ]},
 records:{chapter:"CHAPTER 03",tag:"ROOM 03",title:"記録室",art:"records",text:"棚には日付の消えたファイルが並ぶ。部屋の中央にはテオのPC。画面にはログイン欄と、未送信のメッセージが開いている。",actions:[
 ["テオのPCを操作","pcscreen","pc"],
 ["棚のファイルを調べる","shelf","shelf"],
 ["壁の暗号パネル","panel","panel"],
 ["廊下に戻る","goto","hall"]
 ]},
 radioRoom:{chapter:"CHAPTER 04",tag:"ROOM 04",title:"放送室",art:"radio",text:"古い放送卓と、アンテナの折れたラジオ。壁には音声波形のような線が刻まれている。スピーカーは沈黙しているが、電源ランプだけが一度点滅した。",actions:[
 ["ラジオを調べる","radiodevice","radio"],
 ["配電盤を調べる","fusebox","fusebox"],
 ["波形の壁を読む","wave","wave"],
 ["記録室に戻る","goto","records"]
 ]},
 lab:{chapter:"CHAPTER 05",tag:"ROOM 05",title:"反射実験室",art:"lab",text:"床には割れた鏡、天井からは細い光が差している。中央の装置は三つの光を正しい順番に並べないと動かないらしい。奥には非常口が見える。",actions:[
 ["鏡の破片を調べる","mirror","mirror"],
 ["光の装置を操作","prismPuzzle","prismPuzzle"],
 ["非常口を調べる","exit","exit"],
 ["放送室へ戻る","goto","radioRoom"]
 ]},
 core:{chapter:"CHAPTER 06",tag:"ROOM 06",title:"中枢区画",art:"core",text:"施設の中枢。壁一面にモニターが並び、中央の扉にはカードリーダーと手動の錠前がある。ここまでの記録が、ひとつの真相につながろうとしている。",actions:[
 ["中枢端末を調べる","corepc","corepc"],
 ["カードリーダー","cardreader","cardreader"],
 ["手動の錠前","finalLock","finalLock"],
 ["反射実験室へ戻る","goto","lab"]
 ]}
};
let state;
function fresh(){return {room:"bedroom",inv:["charm"],flags:{},journal:["目が覚めた。ここがどこかも分からない。"],seen:[],progress:0,ended:false,radioTune:0,volume:0};}
state=fresh();
const flag=k=>!!state.flags[k], set=(k,v=true)=>state.flags[k]=v;
function has(k){return state.inv.includes(k)}
function addItem(k){if(!has(k)){state.inv.push(k);say(`${ITEMS[k].name}を手に入れた。`);note(`入手：${ITEMS[k].name}`);renderInventory();}}
function removeItem(k){state.inv=state.inv.filter(x=>x!==k);renderInventory();}
function note(s){if(!state.journal.includes(s)){state.journal.unshift(s);if(state.journal.length>14)state.journal.pop();renderJournal();}}
function say(s){$("sceneNotice").textContent=s;}
function openModal(title,html){$("modalTitle").textContent=title;$("modalBody").innerHTML=html;$("modal").classList.remove("hidden");}
function closeModal(){$("modal").classList.add("hidden");}
$("closeModal").onclick=closeModal;$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
function setRoom(id){state.room=id;render();if(!state.seen.includes(id)){state.seen.push(id);state.progress=Math.min(100,Math.round(state.seen.length/6*55+(Object.keys(state.flags).filter(k=>state.flags[k]).length/15*45)));}}
function render(){const r=ROOMS[state.room];$("chapterLabel").textContent=r.chapter;$("roomTag").textContent=r.tag;$("sceneTitle").textContent=r.title;$("sceneText").textContent=r.text;$("sceneArt").className="scene-art "+r.art;$("actions").innerHTML="";r.actions.forEach(([label,type,arg])=>{const b=document.createElement("button");b.textContent=label;if(["pcscreen","lock","finalLock","prismPuzzle"].includes(type))b.classList.add("special");if(type==="goto")b.classList.add("primary");b.onclick=()=>act(type,arg);$("actions").appendChild(b)});renderInventory();renderJournal();updateProgress();}
function renderInventory(){$("itemCount").textContent=state.inv.length;const el=$("inventory");el.innerHTML="";if(!state.inv.length){el.innerHTML='<p class="muted">まだ何も持っていない。</p>';return;}state.inv.forEach(k=>{const it=ITEMS[k],b=document.createElement("button");b.className="item";b.innerHTML=`<span class="item-icon">${it.icon}</span><span><strong>${it.name}</strong><small>${it.desc}</small></span>`;b.onclick=()=>useItem(k);el.appendChild(b);});}
function renderJournal(){$("journal").innerHTML=state.journal.map(x=>`<li>${escapeHTML(x)}</li>`).join("");}
function updateProgress(){let n=Object.keys(state.flags).filter(k=>state.flags[k]).length;let p=Math.min(100,Math.round(state.seen.length/6*45+n/14*55));if(state.ended)p=100;$("progressBar").style.width=p+"%";$("progressText").textContent=`探索 ${p}%`;}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function act(type,arg){
switch(type){
case"goto": if(arg==="records"&&!flag("hallUnlocked")){say("記録室の扉はロックされている。ラジオの音声を聞けば開くかもしれない。");return;} if(arg==="lab"&&!flag("labUnlocked")){say("実験室の扉には三つの光を示す印がある。");return;} if(arg==="core"&&!flag("coreUnlocked")){say("中枢区画への扉はまだ開かない。");return;}setRoom(arg);return;
case"inspect":openModal("部屋をくまなく調べる",`<p>埃の上に、最近誰かが歩いた跡がある。机の下には小さな黒いケース。壁の隅に、肉眼では読めないほど薄い文字のようなものが見える。</p><div class="row-actions"><button onclick="window.gameAction('getGlasses')">黒いケースを開ける</button><button onclick="window.gameAction('wallText')">壁の文字を見る</button></div>`);return;
case"drawer":if(!flag("drawer")){set("drawer");addItem("battery");addItem("note");say("引き出しから予備バッテリーと破れたメモを見つけた。");}else say("引き出しは空だ。");return;
case"lock":lockPuzzle();return;
case"clock":openModal("壁の時計",`<p>針は4時45分で止まっている。文字盤の裏に「見えない数字は、レンズの向こう」と刻まれている。</p><button onclick="window.gameAction('clockSeen')">時計の裏を確認</button>`);return;
case"vent":if(has("hammer")&&!flag("ventOpened")){openModal("通気口",`<p>ネジが固く、格子も歪んでいる。ハンマーで壊せそうだ。</p><button onclick="window.gameAction('breakVent')">ハンマーで格子を壊す</button>`)}else if(flag("ventOpened"))say("通気口の奥は狭く、人が通れる大きさではない。中にあったものは回収済みだ。");else say("通気口の奥で金属が光った。何か道具が必要そうだ。");return;
case"frame":if(has("glasses"))openModal("額縁の裏",`<p>メガネを通すと、額縁の裏に薄い文字が現れた。</p><div class="ending"><h3>隠し文字</h3><p>「音を合わせろ。低・高・低。記録室の扉はそのあとだ」</p></div><button onclick="window.gameAction('frameRead')">メモに記録</button>`);else say("額縁は壁を向いている。裏側に何かありそうだが、文字は読めない。");return;
case"emergency":if(!has("glasses"))say("非常灯の下に数字のような傷があるが、読み取れない。");else{say("メガネ越しに『3-1-4』と見えた。記録室のパネル用かもしれない。");note("隠し文字：記録室パネルは 3-1-4。");set("panelClue");}return;
case"lookback":say("最初の部屋の扉は閉じている。けれど、ここまでの手がかりはつながり始めている。");return;
case"pcscreen":pcScreen();return;
case"shelf":if(has("glasses"))openModal("棚のファイル",`<p>メガネをかけると、背表紙に隠された日付が浮かぶ。ファイルの中には、遼の名前と「記憶同期テスト」の記録。</p><p class="hint">メモ：テスト番号は 4545。音声ログを再生すると最後の記録が開く。</p><button onclick="window.gameAction('shelfRead')">ファイルを記録</button>`);else say("ファイルはどれも白紙に見える。何かを通して読む必要がありそうだ。");return;
case"panel":panelPuzzle();return;
case"radiodevice":radioDevice();return;
case"fusebox":fusePuzzle();return;
case"wave":if(has("radio")&&flag("radioSolved")){openModal("波形の壁",`<p>ラジオの周波数と同じ波形が刻まれている。メガネ越しに読むと「高・低・低・高」。</p><button onclick="window.gameAction('waveRead')">波形を記録</button>`)}else say("波形の線がある。まずラジオを直す必要がありそうだ。");return;
case"mirror":if(has("prism"))say("プリズムを鏡の破片にかざすと、床に三色の光が伸びた。装置の順番が見える。");else{addItem("prism");say("鏡の裏に小さなプリズムが挟まっていた。");}return;
case"prismPuzzle":prismPuzzle();return;
case"exit":if(flag("labSolved")){set("coreUnlocked");say("光の装置が動き、非常口のロックが解除された。中枢区画へ進める。");openModal("非常口",`<p>扉の先に、中枢区画へ続く階段がある。</p><button onclick="window.gameAction('toCore')">中枢区画へ進む</button>`)}else say("非常口はロックされている。光の装置を起動しよう。");return;
case"corepc":if(!flag("coreUnlocked")){say("端末は起動しているが、アクセス権がない。");return;}openModal("中枢端末",`<p>最後の記録を開くには、PCで確認した同期コードと、ラジオで聞いた音声キーが必要だ。</p><label>同期コード</label><input id="syncCode" placeholder="4桁のコード" inputmode="numeric" maxlength="4><label>音声キー</label><input id="voiceKey" placeholder="例：低高低" maxlength="8><div class="row-actions"><button onclick="window.gameAction('coreSubmit')">記録を開く</button></div>`);return;
case"cardreader":if(has("keycard")){set("cardAccepted");say("青いキーカードが認証された。中枢端末の補助電源が入った。");}else say("カードリーダーは青く点滅している。青いキーカードが必要だ。");return;
case"finalLock":finalLock();return;
default:break;
}}
window.gameAction=function(k){
closeModal();
switch(k){
case"getGlasses":addItem("glasses");set("glassesFound");say("パキスラのメガネを手に入れた。");break;
case"wallText":if(has("glasses")){say("レンズ越しに『時計は時刻ではなく番号を示す』と読めた。");note("壁の隠し文字：時計は時刻ではなく番号を示す。");}else say("文字は薄すぎて読めない。");break;
case"clockSeen":if(has("glasses")){say("文字盤の裏に「4545」と浮かび上がった。鍵の番号だ。");note("ダイヤル錠の番号は 4545。");set("codeFound");}else say("裏側に傷があるが、数字は読めない。");break;
case"breakVent":set("ventOpened");addItem("hammer");addItem("keycard");say("格子を壊すと、奥から青いキーカードが見つかった。");break;
case"frameRead":set("frameRead");note("隠し文字：音を合わせろ。低・高・低。");say("音声のヒントを記録した。");break;
case"shelfRead":set("shelfRead");note("テオの記録：テスト番号4545。音声ログが最後の記録を開く。");say("ファイルの情報を記録した。");break;
case"waveRead":set("waveRead");note("波形の壁：高・低・低・高。");say("音声の追加ヒントを記録した。");break;
case"toCore":setRoom("core");break;
case"coreSubmit":{let a=$("syncCode")?.value.trim(),b=($("voiceKey")?.value||"").replace(/\s/g,"");if(a==="4545"&&["低高低","低・高・低","lowhighlow"].includes(b.toLowerCase())){set("trueEndingReady");openEnding("真相の記録","遼の記憶は消されたのではなかった。遼自身が、誰かを守るために記録を封じていたのだ。テオのPCに残った最後のメッセージは、遼本人の声だった。「ここまで来てくれて、ありがとう」","TRUE END：記憶の向こう");}else{say("認証失敗。番号は4545。音声キーは放送室で聞いたヒントを思い出そう。");}break;}
case"endingEscape":openEnding("脱出成功","遼は外の空気を吸い込んだ。施設の謎はまだ残っているが、今は自分の足でここを離れられる。","END：夜明け");break;
case"endingSmash":openEnding("強行突破","ハンマーで錠前を砕き、遼は外へ飛び出した。真相の記録は失われたが、生きて帰ることを選んだ。","END：強行突破");break;
case"coreSubmit":break;
}
render();
};
function lockPuzzle(){openModal("ダイヤル錠",`<p>古い4桁のダイヤル錠。数字を入力してください。</p><input id="lockCode" placeholder="4桁" inputmode="numeric" maxlength="4><div class="row-actions"><button onclick="window.gameAction('unlockDoor')">番号を試す</button><button onclick="window.gameAction('smashDoor')">ハンマーで破壊</button></div><p class="hint">ヒント：時計と、見えない文字。</p>`);}
const oldGameAction=window.gameAction;
window.gameAction=function(k){if(k==="unlockDoor"){let v=$("lockCode")?.value;if(v==="4545"){closeModal();set("doorUnlocked");set("hallUnlocked");setRoom("hall");note("ダイヤル錠を4545で解除。廊下へ進んだ。");say("カチリ。鍵が開いた。");return;}say("違う番号だ。手がかりを探そう。");return;}if(k==="smashDoor"){if(!has("hammer")){say("ハンマーがない。");return;}closeModal();set("doorUnlocked");set("hallUnlocked");setRoom("hall");note("ハンマーで錠前を破壊して廊下へ。");say("大きな音とともに錠前が壊れた。");return;}oldGameAction(k);};
function pcScreen(){if(!has("pc")){addItem("pc");}openModal("テオのPC — ログイン",`<p>ログイン画面には「4桁の同期番号」と表示されている。入力欄の下に、誰かが残したメモがある。</p><p class="hint">「数字は見つけるもの。声は合わせるもの。」</p><label>同期番号</label><input id="pcCode" placeholder="4桁の番号" inputmode="numeric" maxlength="4><div class="row-actions"><button onclick="window.gameAction('pcLogin')">ログイン</button><button onclick="window.gameAction('pcOffline')">オフライン記録</button></div>`);}
const priorAction=window.gameAction;
window.gameAction=function(k){if(k==="pcLogin"){const v=$("pcCode")?.value;if(v==="4545"||flag("codeFound")){closeModal();set("pcLogged");set("labUnlocked");addItem("fuse");note("テオのPC：同期番号4545。実験室のアクセス権を確認。");say("ログイン成功。実験室の扉が解放された。");}else say("認証に失敗。番号の手がかりは部屋のどこかにある。");return;}if(k==="pcOffline"){closeModal();set("offlineRead");note("オフライン記録：『声の鍵は低・高・低。記憶の鍵は4545。』");say("オフライン記録を読んだ。");return;}priorAction(k);};
function panelPuzzle(){if(!has("glasses")){say("パネルは無地に見える。隠された文字を読む道具が必要だ。");return;}openModal("暗号パネル",`<p>メガネをかけると「3・1・4」の数字が見える。正しい順番で押そう。</p><div class="row-actions"><button onclick="window.gameAction('panelWrong')">1 → 3 → 4</button><button onclick="window.gameAction('panelRight')">3 → 1 → 4</button><button onclick="window.gameAction('panelWrong')">4 → 3 → 1</button></div>`);}
const prior2=window.gameAction;
window.gameAction=function(k){if(k==="panelRight"){closeModal();set("panelSolved");set("radioRoomUnlocked");set("labUnlocked");say("パネルが緑に光り、放送室の扉が開いた。");note("暗号パネル解除：314。");return;}if(k==="panelWrong"){say("警告音。順番が違う。");return;}prior2(k);};
function radioDevice(){if(!has("battery")){say("ラジオは電池切れだ。予備バッテリーを探そう。");return;}if(!flag("batteryInstalled")){openModal("ぐーばのラジオ",`<p>電池を入れれば、周波数を合わせられそうだ。</p><button onclick="window.gameAction('installBattery')">予備バッテリーを入れる</button>`);return;}openModal("ぐーばのラジオ",`<p>ノイズの中に三つの音が聞こえる。順番を合わせてください。</p><p class="hint">ヒント：額縁の裏にあった言葉。</p><div class="row-actions"><button onclick="window.gameAction('radioCorrect')">低 → 高 → 低</button><button onclick="window.gameAction('radioWrong')">高 → 低 → 高</button><button onclick="window.gameAction('radioWrong')">低 → 低 → 高</button></div>`);}
const prior3=window.gameAction;
window.gameAction=function(k){if(k==="installBattery"){closeModal();set("batteryInstalled");say("ラジオの電源が入った。ノイズの奥に声が聞こえる。");return;}if(k==="radioCorrect"){closeModal();set("radioSolved");set("hallUnlocked");set("labUnlocked");addItem("hammer");note("ラジオ音声：低・高・低。『番号は4545。記録室へ』");say("音声が鮮明になり、ハンマーが入った保管箱のロックも外れた。");return;}if(k==="radioWrong"){say("ノイズが強くなった。音の順番が違うようだ。");return;}prior3(k);};
function fusePuzzle(){if(!has("fuse")){say("配電盤のヒューズが抜けている。テオのPCの近くを調べよう。");return;}openModal("配電盤",`<p>ヒューズを差し込み、スイッチを入れますか？</p><button onclick="window.gameAction('insertFuse')">ヒューズを設置する</button>`);}
const prior4=window.gameAction;
window.gameAction=function(k){if(k==="insertFuse"){closeModal();set("fuseFixed");set("radioRoomUnlocked");say("電源が復旧した。ラジオの受信感度が上がった。");return;}prior4(k);};
function prismPuzzle(){if(!has("prism")){say("光を分けるものが必要だ。鏡の破片を調べよう。");return;}openModal("光の装置",`<p>装置の刻印が光る。赤、青、白の順番に光を通す。</p><div class="row-actions"><button onclick="window.gameAction('prismWrong')">青 → 赤 → 白</button><button onclick="window.gameAction('prismRight')">赤 → 青 → 白</button><button onclick="window.gameAction('prismWrong')">白 → 青 → 赤</button></div>`);}
const prior5=window.gameAction;
window.gameAction=function(k){if(k==="prismRight"){closeModal();set("labSolved");set("coreUnlocked");addItem("keycard");note("光の装置：赤→青→白。");say("プリズムが光を分け、実験室のロックが解除された。");return;}if(k==="prismWrong"){say("光が散った。順番が違う。");return;}prior5(k);};
function finalLock(){openModal("中枢区画の錠前",`<p>手動の錠前は頑丈だが、ハンマーなら破壊できる。端末の記録を失う危険もある。</p><div class="row-actions"><button onclick="window.gameAction('endingEscape')">カードと端末で正規解除</button><button onclick="window.gameAction('endingSmash')">ハンマーで強行突破</button></div><p class="hint">正規解除にはカード認証が必要です。</p>`);}
function openEnding(title,body,tag){state.ended=true;updateProgress();openModal("ENDING",`<div class="ending"><span class="eyebrow">${tag}</span><h3>${title}</h3><p>${body}</p><p>探索記録：${state.seen.length}/6エリア</p><button onclick="window.gameAction('restart')">もう一度遊ぶ</button></div>`);}
const finalAction=window.gameAction;
window.gameAction=function(k){if(k==="restart"){state=fresh();closeModal();render();say("新しい探索を始めよう。");return;}if(k==="endingEscape"){if(!flag("cardAccepted")){say("カード認証がまだです。先にカードリーダーを調べてください。");return;}finalAction(k);return;}if(k==="endingSmash"){if(!has("hammer")){say("ハンマーがありません。");return;}finalAction(k);return;}finalAction(k);};
$("saveBtn").onclick=()=>{try{localStorage.setItem("ryoEscapeSave",JSON.stringify(state));say("セーブしました。次回もこのブラウザから続けられます。");}catch(e){say("保存できませんでした。ブラウザの保存設定を確認してください。")}};
$("loadBtn").onclick=()=>{try{const raw=localStorage.getItem("ryoEscapeSave");if(!raw){say("セーブデータがありません。");return;}const data=JSON.parse(raw);if(!data.room||!ROOMS[data.room])throw Error();state=data;closeModal();render();say("セーブデータをロードしました。");}catch(e){say("ロードできませんでした。セーブデータが壊れている可能性があります。")}};
$("resetBtn").onclick=()=>openModal("最初から",`<p>進行状況をリセットします。よろしいですか？</p><button onclick="window.gameAction('restart')">リセットする</button>`);
$("soundToggle").onclick=()=>{const b=$("soundToggle");const on=b.getAttribute("aria-pressed")!=="true";b.setAttribute("aria-pressed",String(on));b.textContent=on?"♪ 音: ON":"♪ 音: OFF";say(on?"音の演出をONにしました（環境音の代わりに画面演出を楽しめます）。":"音の演出をOFFにしました。");};
render();
})();