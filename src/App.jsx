import { useState, useMemo, useEffect } from "react";

const MONTHS_S = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MONTHS_L = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const ROUNDS = ["Fase Regular","Cuartos de Final","Semifinal","Tercer Lugar","Final"];

function getUpcomingSundays(n = 12) {
  const result = [];
  const today = new Date();
  const d = new Date(today);
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? 7 : 7 - dow));
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) { result.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return result;
}

function isoDate(d) { return d.toISOString().split("T")[0]; }
function formatDateES(date) {
  return `Domingo ${date.getDate()} de ${MONTHS_L[date.getMonth()]} ${date.getFullYear()}`;
}

const LS_KEY = "bk_torneo_v1";
function loadState() {
  try { const raw = localStorage.getItem(LS_KEY); if (!raw) return null; return JSON.parse(raw); } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

const INIT_TEAMS = [
  { id: 1, name: "Sello Oro",           category: "Masculino", wins: 0, losses: 0, pf: 0, pa: 0 },
  { id: 2, name: "Llamas Negras",        category: "Masculino", wins: 0, losses: 0, pf: 0, pa: 0 },
  { id: 3, name: "Los Esclavos",         category: "Masculino", wins: 0, losses: 0, pf: 0, pa: 0 },
  { id: 4, name: "Los Esclavos Jr.",     category: "Masculino", wins: 0, losses: 0, pf: 0, pa: 0 },
  { id: 5, name: "Super Stars",          category: "Femenino",  wins: 0, losses: 0, pf: 0, pa: 0 },
  { id: 6, name: "Magisterio Femenino",  category: "Femenino",  wins: 0, losses: 0, pf: 0, pa: 0 },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500;600&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,600&display=swap');
:root{--bg:#070A13;--bg2:#0D1120;--bg3:#141825;--card:#192030;--border:#222C44;--orange:#FF6600;--gold:#FFD600;--green:#00C896;--red:#FF3D6B;--blue:#5AB4FF;--purple:#A78BFA;--text:#E6EAF4;--muted:#6B7A9F;}
*{box-sizing:border-box;margin:0;padding:0;}
.bk{font-family:'Barlow',sans-serif;background:var(--bg);min-height:100vh;color:var(--text);}
.hdr{background:linear-gradient(160deg,#05080f 0%,#0e1428 60%,#080e1e 100%);border-bottom:2px solid var(--orange);padding:14px 16px 0;position:relative;overflow:hidden;}
.hdr::after{content:'ðŸ€';position:absolute;font-size:140px;opacity:.03;right:-10px;top:-30px;}
.hdr-top{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.hdr-ball{font-size:38px;flex-shrink:0;}
.hdr-title{font-family:'Oswald',sans-serif;font-size:20px;font-weight:700;color:var(--gold);letter-spacing:2.5px;text-transform:uppercase;line-height:1;text-shadow:0 0 20px rgba(255,214,0,.35);}
.hdr-sub{font-size:10px;color:var(--orange);letter-spacing:3px;text-transform:uppercase;font-weight:600;margin-top:3px;}
.hdr-venue{font-size:11px;color:var(--muted);margin-top:3px;}
.tabs{display:flex;overflow-x:auto;scrollbar-width:none;}
.tabs::-webkit-scrollbar{display:none;}
.tab{font-family:'Oswald',sans-serif;font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:var(--muted);padding:10px 13px;cursor:pointer;border-bottom:3px solid transparent;white-space:nowrap;flex-shrink:0;transition:.2s all;}
.tab:hover{color:var(--text);}
.tab.on{color:var(--orange);border-bottom-color:var(--orange);}
.body{padding:14px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;}
.card-ttl{font-family:'Oswald',sans-serif;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.divider{border:none;border-top:1px solid var(--border);margin:12px 0;}
.tbl{width:100%;border-collapse:collapse;font-size:12px;}
.tbl th{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);padding:7px 5px;text-align:center;border-bottom:1px solid var(--border);}
.tbl th:nth-child(2){text-align:left;}
.tbl td{padding:9px 5px;text-align:center;border-bottom:1px solid rgba(34,44,68,.4);}
.tbl td:nth-child(2){text-align:left;}
.tbl tr:last-child td{border-bottom:none;}
.rank{font-family:'Oswald',sans-serif;font-size:15px;font-weight:700;}
.r1{color:var(--gold)} .r2{color:#C0C0C0} .r3{color:#CD7F32}
.tnm{font-weight:600;font-size:13px;}
.pts{font-family:'Oswald',sans-serif;font-size:16px;font-weight:700;color:var(--green);}
.filters{display:flex;gap:7px;margin-bottom:12px;flex-wrap:wrap;}
.pill{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:4px 13px;border-radius:20px;cursor:pointer;border:1px solid var(--border);color:var(--muted);background:transparent;transition:.2s all;}
.pill.on,.pill:hover{background:var(--orange);border-color:var(--orange);color:#fff;}
.cat{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.8px;padding:2px 6px;border-radius:20px;text-transform:uppercase;margin-left:5px;}
.cat-m{background:rgba(90,180,255,.15);color:var(--blue);}
.cat-f{background:rgba(255,102,0,.15);color:var(--orange);}
.rnd{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.8px;padding:2px 8px;border-radius:20px;text-transform:uppercase;background:rgba(90,180,255,.12);color:var(--blue);}
.rnd-fin{background:rgba(255,214,0,.12);color:var(--gold);}
.suns{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;scrollbar-width:none;}
.suns::-webkit-scrollbar{display:none;}
.sun{flex-shrink:0;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:8px 11px;cursor:pointer;text-align:center;transition:.2s all;min-width:60px;}
.sun.on{background:var(--orange);border-color:var(--orange);}
.sun .d{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;line-height:1;}
.sun .m{font-size:9px;text-transform:uppercase;color:var(--muted);margin-top:2px;}
.sun.on .m{color:rgba(255,255,255,.75);}
.sun .gc{font-size:8px;background:var(--bg3);padding:2px 5px;border-radius:10px;margin-top:4px;color:var(--muted);}
.sun.on .gc{background:rgba(0,0,0,.2);color:#fff;}
.game{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px;margin-bottom:9px;}
.game.done{border-color:rgba(0,200,150,.25);}
.gm-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;gap:6px;flex-wrap:wrap;}
.gm-time{font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;color:var(--orange);}
.matchup{display:flex;align-items:center;justify-content:space-between;gap:6px;}
.team-s{flex:1;text-align:center;}
.team-nm{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;line-height:1.1;}
.sc-area{display:flex;align-items:center;gap:5px;flex-shrink:0;}
.sc{font-family:'Oswald',sans-serif;font-size:27px;font-weight:700;min-width:34px;text-align:center;}
.sc-w{color:var(--green)} .sc-l{color:var(--muted)} .vs{font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;color:var(--muted);letter-spacing:1px;}
.lbl{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;display:block;}
.inp{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 11px;color:var(--text);font-family:'Barlow',sans-serif;font-size:13px;width:100%;outline:none;}
.inp:focus{border-color:var(--orange);}
.sel{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 11px;color:var(--text);font-family:'Barlow',sans-serif;font-size:13px;width:100%;-webkit-appearance:none;outline:none;}
.sel:focus{border-color:var(--orange);}
.fr{margin-bottom:9px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.btn{font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:9px 18px;border-radius:8px;cursor:pointer;border:none;transition:.2s all;}
.btn-p{background:var(--orange);color:#fff;}
.btn-p:hover{background:#e05800;}
.btn-g{background:var(--green);color:#000;}
.btn-g:hover{filter:brightness(1.1);}
.btn-d{background:rgba(255,61,107,.1);color:var(--red);border:1px solid rgba(255,61,107,.25);padding:4px 9px;font-size:10px;}
.btn-s{background:var(--bg3);color:var(--text);border:1px solid var(--border);}
.btn-full{width:100%;margin-top:4px;}
.btn-reset{background:rgba(255,61,107,.1);color:var(--red);border:1px solid rgba(255,61,107,.25);font-size:10px;padding:6px 14px;width:100%;margin-top:8px;}
.btn-reset:hover{background:rgba(255,61,107,.2);}
.sc-inp{font-family:'Oswald',sans-serif;font-size:36px;font-weight:700;text-align:center;background:var(--bg3);border:2px solid var(--border);border-radius:8px;color:var(--text);width:88px;padding:8px;}
.sc-inp:focus{border-color:var(--orange);outline:none;}
.t-sel{background:transparent;border:none;border-bottom:1px dashed var(--orange);color:var(--orange);font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;cursor:pointer;}
.poster{background:linear-gradient(180deg,#0a0f20 0%,#0d1835 50%,#070d1a 100%);border:2px solid var(--gold);border-radius:16px;overflow:hidden;font-family:'Oswald',sans-serif;}
.poster-hdr{background:linear-gradient(135deg,#1c0900,#2a1000);border-bottom:3px solid var(--gold);padding:18px 16px;text-align:center;position:relative;}
.poster-hdr::before{content:'ðŸ€';position:absolute;font-size:80px;opacity:.06;left:8px;top:4px;}
.poster-hdr::after{content:'ðŸ€';position:absolute;font-size:80px;opacity:.06;right:8px;top:4px;}
.poster-title{font-size:26px;font-weight:700;color:var(--gold);letter-spacing:3px;text-transform:uppercase;text-shadow:0 0 25px rgba(255,214,0,.5);}
.poster-sub{font-size:11px;color:var(--orange);letter-spacing:4px;text-transform:uppercase;margin-top:5px;}
.poster-info{background:rgba(255,102,0,.08);border-bottom:1px solid rgba(255,102,0,.25);padding:10px 14px;display:flex;flex-direction:column;gap:6px;}
.poster-info-row{display:flex;align-items:center;gap:7px;font-size:12px;}
.poster-info-lbl{color:var(--muted);}
.poster-info-val{color:var(--text);font-weight:600;}
.poster-game{padding:14px 16px;border-bottom:1px solid rgba(34,44,68,.6);}
.poster-game:last-child{border-bottom:none;}
.poster-game-hd{font-size:10px;color:var(--orange);letter-spacing:2px;margin-bottom:9px;display:flex;align-items:center;gap:7px;}
.poster-matchup{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.poster-team{flex:1;text-align:center;}
.poster-tnm{font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#fff;line-height:1.1;}
.poster-vs{flex-shrink:0;background:rgba(255,102,0,.18);border:1px solid var(--orange);border-radius:8px;padding:6px 11px;font-size:13px;font-weight:700;color:var(--orange);letter-spacing:2px;}
.poster-score-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;}
.poster-score{font-size:22px;font-weight:700;color:var(--green);}
.poster-ft{background:rgba(0,0,0,.4);padding:10px;text-align:center;font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;}
.empty{text-align:center;padding:30px 12px;color:var(--muted);}
.empty-i{font-size:38px;margin-bottom:8px;}
.empty-t{font-size:13px;}
.notice{background:rgba(255,214,0,.07);border:1px solid rgba(255,214,0,.2);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--gold);margin-top:6px;text-align:center;}
.warn{background:rgba(255,102,0,.08);border:1px solid rgba(255,102,0,.2);border-radius:8px;padding:8px 12px;font-size:11px;color:var(--orange);text-align:center;}
.save-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);margin-left:8px;vertical-align:middle;animation:pulse 2s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
`;

export default function App() {
  const saved = loadState();
  const [tab,setTab] = useState("standings");
  const [teams,setTeams] = useState(saved?.teams ?? INIT_TEAMS);
  const [games,setGames] = useState(saved?.games ?? []);
  const [venue,setVenue] = useState(saved?.venue ?? "SalÃ³n SeÃ±o Zulema");
  const [tourney,setTourney] = useState(saved?.tourney ?? "TORNEO RELÃMPAGO 2025");
  const sundays = useMemo(() => getUpcomingSundays(12), []);
  const [selSun,setSelSun] = useState(0);
  const [posterSun,setPosterSun] = useState(0);
  const [catFilter,setCatFilter] = useState("Todos");
  const [newGame,setNewGame] = useState({team1:"",team2:"",time:"10:00",category:"Masculino",round:"Fase Regular"});
  const [selGameId,setSelGameId] = useState(null);
  const [scores,setScores] = useState({s1:"",s2:""});
  const [newTeam,setNewTeam] = useState({name:"",category:"Masculino"});

  useEffect(() => { saveState({teams,games,venue,tourney}); }, [teams,games,venue,tourney]);

  const gamesOn = (idx) => games.filter(g=>g.date===isoDate(sundays[idx])).sort((a,b)=>a.time.localeCompare(b.time));

  // âœ… FIX PÃ“STER: Cuando cambian los juegos, auto-seleccionar el primer domingo
  // que tenga partidos, para que el pÃ³ster no quede siempre vacÃ­o.
  useEffect(() => {
    const firstIdx = sundays.findIndex((_,i) => gamesOn(i).length > 0);
    if (firstIdx !== -1) setPosterSun(firstIdx);
  }, [games]);

  const standings = useMemo(() =>
    teams.map(t=>({...t,played:t.wins+t.losses,diff:t.pf-t.pa,pts:t.wins*2+t.losses*1}))
         .sort((a,b)=>b.pts-a.pts||b.diff-a.diff),[teams]);

  const pending = games.filter(g=>!g.completed);
  const completed = games.filter(g=>g.completed);
  const getTeam = id => teams.find(t=>t.id===id);
  const filtered = catFilter==="Todos" ? standings : standings.filter(t=>t.category===catFilter);

  const addGame = () => {
    if(!newGame.team1||!newGame.team2||newGame.team1===newGame.team2) return;
    const d=isoDate(sundays[selSun]);
    if(games.filter(g=>g.date===d).length>=4){alert("MÃ¡ximo 4 partidos por domingo.");return;}
    setGames(p=>[...p,{id:Date.now(),date:d,time:newGame.time,team1:+newGame.team1,team2:+newGame.team2,category:newGame.category,round:newGame.round,score1:null,score2:null,completed:false}]);
    setNewGame({team1:"",team2:"",time:"10:00",category:"Masculino",round:"Fase Regular"});
  };

  const recordScore = () => {
    const s1=parseInt(scores.s1),s2=parseInt(scores.s2);
    if(isNaN(s1)||isNaN(s2)||!selGameId) return;
    const g=games.find(x=>x.id===selGameId);
    // âœ… FIX MARCADOR: Si el partido ya fue completado, no procesar de nuevo
    // para evitar que las estadÃ­sticas de los equipos se dupliquen.
    if(!g || g.completed) return;
    setGames(p=>p.map(x=>x.id===selGameId?{...x,score1:s1,score2:s2,completed:true}:x));
    setTeams(p=>p.map(t=>{
      if(t.id===g.team1){const w=s1>s2;return{...t,wins:t.wins+(w?1:0),losses:t.losses+(w?0:1),pf:t.pf+s1,pa:t.pa+s2};}
      if(t.id===g.team2){const w=s2>s1;return{...t,wins:t.wins+(w?1:0),losses:t.losses+(w?0:1),pf:t.pf+s2,pa:t.pa+s1};}
      return t;
    }));
    setSelGameId(null);setScores({s1:"",s2:""});
  };

  const removeGame = id => setGames(p=>p.filter(g=>g.id!==id));
  const addTeam = () => {
    if(!newTeam.name.trim()) return;
    setTeams(p=>[...p,{id:Date.now(),name:newTeam.name.trim(),category:newTeam.category,wins:0,losses:0,pf:0,pa:0}]);
    setNewTeam({name:"",category:"Masculino"});
  };
  const removeTeam = id => setTeams(p=>p.filter(t=>t.id!==id));
  const updateTime = (id,t) => setGames(p=>p.map(g=>g.id===id?{...g,time:t}:g));
  const resetAll = () => {
    if(!window.confirm("Â¿Reiniciar TODO el torneo?")) return;
    setTeams(INIT_TEAMS);setGames([]);setVenue("SalÃ³n SeÃ±o Zulema");setTourney("TORNEO RELÃMPAGO 2025");
    localStorage.removeItem(LS_KEY);
  };

  const TABS=[{id:"standings",label:"ðŸ“Š Tabla"},{id:"schedule",label:"ðŸ“… Calendario"},{id:"scores",label:"âš¡ Marcador"},{id:"poster",label:"ðŸŽ¨ PÃ³ster"},{id:"teams",label:"âš™ï¸ Equipos"}];

  return (
    <div className="bk">
      <style>{CSS}</style>
      <div className="hdr">
        <div className="hdr-top">
          <span className="hdr-ball">ðŸ€</span>
          <div>
            <div className="hdr-title">{tourney}<span className="save-dot" title="Guardado automÃ¡tico"></span></div>
            <div className="hdr-sub">Control de Torneo</div>
            <div className="hdr-venue">ðŸ“ {venue}</div>
          </div>
        </div>
        <div className="tabs">{TABS.map(t=><div key={t.id} className={`tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</div>)}</div>
      </div>
      <div className="body">

        {tab==="standings" && <>
          <div className="filters">{["Todos","Masculino","Femenino"].map(c=><div key={c} className={`pill ${catFilter===c?"on":""}`} onClick={()=>setCatFilter(c)}>{c}</div>)}</div>
          <div className="card">
            <div className="card-ttl">ðŸ† Tabla de Posiciones</div>
            {filtered.length===0
              ? <div className="empty"><div className="empty-i">ðŸ“‹</div><div className="empty-t">Sin equipos</div></div>
              : <table className="tbl"><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>P</th><th>+/-</th><th>PTS</th></tr></thead>
                <tbody>{filtered.map((t,i)=><tr key={t.id}>
                  <td><span className={`rank ${i===0?"r1":i===1?"r2":i===2?"r3":""}`}>{i===0?"ðŸ¥‡":i===1?"ðŸ¥ˆ":i===2?"ðŸ¥‰":i+1}</span></td>
                  <td><span className="tnm">{t.name}</span><span className={`cat ${t.category==="Masculino"?"cat-m":"cat-f"}`}>{t.category==="Masculino"?"M":"F"}</span></td>
                  <td style={{color:"var(--muted)"}}>{t.played}</td>
                  <td style={{color:"var(--green)",fontWeight:600}}>{t.wins}</td>
                  <td style={{color:"var(--red)",fontWeight:600}}>{t.losses}</td>
                  <td style={{color:t.diff>=0?"var(--green)":"var(--red)"}}>{t.diff>0?"+":""}{t.diff}</td>
                  <td><div className="pts">{t.pts}</div></td>
                </tr>)}</tbody></table>}
          </div>
          {completed.length>0 && <div className="card">
            <div className="card-ttl">âš¡ Ãšltimos Resultados</div>
            {completed.slice(-4).reverse().map(g=>{const t1=getTeam(g.team1),t2=getTeam(g.team2);if(!t1||!t2)return null;return<div key={g.id} className="game done"><div className="gm-meta"><span className="gm-time">{g.time}</span><span style={{fontSize:"10px",color:"var(--muted)"}}>{g.date}</span><span className={`rnd ${g.round==="Final"?"rnd-fin":""}`}>{g.round}</span></div><div className="matchup"><div className="team-s"><div className="team-nm" style={{color:g.score1>g.score2?"var(--green)":"var(--muted)"}}>{t1.name}</div></div><div className="sc-area"><div className={`sc ${g.score1>g.score2?"sc-w":"sc-l"}`}>{g.score1}</div><div className="vs">-</div><div className={`sc ${g.score2>g.score1?"sc-w":"sc-l"}`}>{g.score2}</div></div><div className="team-s" style={{textAlign:"right"}}><div className="team-nm" style={{color:g.score2>g.score1?"var(--green)":"var(--muted)"}}>{t2.name}</div></div></div></div>;})}
          </div>}
        </>}

        {tab==="schedule" && <>
          <div className="suns">{sundays.map((s,i)=>{const cnt=gamesOn(i).length;return<div key={i} className={`sun ${selSun===i?"on":""}`} onClick={()=>setSelSun(i)}><div className="d">{s.getDate()}</div><div className="m">{MONTHS_S[s.getMonth()]}</div><div className="gc">{cnt}/4</div></div>;})}</div>
          <div className="card">
            <div className="card-ttl">ðŸ“… {formatDateES(sundays[selSun])}</div>
            <div className="fr"><label className="lbl">ðŸ“ Cancha / Lugar</label><input className="inp" value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Lugar del partido..." /></div>
            <hr className="divider" />
            {gamesOn(selSun).length===0
              ? <div className="empty"><div className="empty-i">ðŸ“…</div><div className="empty-t">Sin partidos agendados</div></div>
              : gamesOn(selSun).map(g=>{const t1=getTeam(g.team1),t2=getTeam(g.team2);if(!t1||!t2)return null;return<div key={g.id} className={`game ${g.completed?"done":""}`}><div className="gm-meta"><select className="t-sel" value={g.time} onChange={e=>updateTime(g.id,e.target.value)}>{TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}</select><span className={`rnd ${g.round==="Final"?"rnd-fin":""}`}>{g.round}</span><span className={`cat ${g.category==="Masculino"?"cat-m":"cat-f"}`}>{g.category}</span>{!g.completed&&<button className="btn btn-d" onClick={()=>removeGame(g.id)}>âœ•</button>}{g.completed&&<span style={{fontSize:"10px",color:"var(--green)",fontWeight:600}}>âœ… Jugado</span>}</div><div className="matchup"><div className="team-s"><div className="team-nm">{t1.name}</div></div><div className="sc-area">{g.completed?<><div className={`sc ${g.score1>g.score2?"sc-w":"sc-l"}`}>{g.score1}</div><div className="vs">-</div><div className={`sc ${g.score2>g.score1?"sc-w":"sc-l"}`}>{g.score2}</div></>:<div className="vs" style={{fontSize:"15px"}}>VS</div>}</div><div className="team-s" style={{textAlign:"right"}}><div className="team-nm">{t2.name}</div></div></div></div>;})}
            {gamesOn(selSun).length<4 && <>
              <hr className="divider" />
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:"12px",fontWeight:600,letterSpacing:"2px",textTransform:"uppercase",color:"var(--gold)",marginBottom:"12px"}}>âž• Agregar Partido</div>
              <div className="g2">
                <div className="fr"><label className="lbl">Equipo 1</label><select className="sel" value={newGame.team1} onChange={e=>setNewGame({...newGame,team1:e.target.value})}><option value="">Seleccionar...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div className="fr"><label className="lbl">Equipo 2</label><select className="sel" value={newGame.team2} onChange={e=>setNewGame({...newGame,team2:e.target.value})}><option value="">Seleccionar...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div className="fr"><label className="lbl">Horario</label><select className="sel" value={newGame.time} onChange={e=>setNewGame({...newGame,time:e.target.value})}>{TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div className="fr"><label className="lbl">CategorÃ­a</label><select className="sel" value={newGame.category} onChange={e=>setNewGame({...newGame,category:e.target.value})}><option>Masculino</option><option>Femenino</option></select></div>
              </div>
              <div className="fr"><label className="lbl">Fase / Ronda</label><select className="sel" value={newGame.round} onChange={e=>setNewGame({...newGame,round:e.target.value})}>{ROUNDS.map(r=><option key={r}>{r}</option>)}</select></div>
              <button className="btn btn-p btn-full" onClick={addGame}>âž• AGREGAR PARTIDO</button>
            </>}
            {gamesOn(selSun).length>=4 && <div className="warn" style={{marginTop:"10px"}}>âš ï¸ LÃ­mite de 4 partidos alcanzado</div>}
          </div>
        </>}

        {tab==="scores" && <>
          <div className="card">
            <div className="card-ttl">âš¡ Registrar Marcador</div>
            {pending.length===0
              ? <div className="empty"><div className="empty-i">ðŸŽ¯</div><div className="empty-t">Sin partidos pendientes.</div></div>
              : <><div className="fr"><label className="lbl">Seleccionar Partido</label><select className="sel" value={selGameId||""} onChange={e=>setSelGameId(+e.target.value||null)}><option value="">Elige un partido...</option>{pending.map(g=>{const t1=getTeam(g.team1),t2=getTeam(g.team2);if(!t1||!t2)return null;return<option key={g.id} value={g.id}>{g.date} {g.time} â€” {t1.name} vs {t2.name}</option>;})}</select></div>
                {selGameId&&(()=>{const g=games.find(x=>x.id===selGameId);if(!g)return null;const t1=getTeam(g.team1),t2=getTeam(g.team2);return<><hr className="divider"/><div style={{textAlign:"center",marginBottom:"16px"}}><span className={`rnd ${g.round==="Final"?"rnd-fin":""}`} style={{display:"inline-block",marginBottom:"6px"}}>{g.round}</span><div style={{fontSize:"11px",color:"var(--muted)"}}>{g.date} â€¢ {g.time}</div></div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",marginBottom:"16px"}}><div style={{flex:1,textAlign:"center"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"15px",fontWeight:700,marginBottom:"10px"}}>{t1.name}</div><input type="number" className="sc-inp" value={scores.s1} onChange={e=>setScores({...scores,s1:e.target.value})} placeholder="0" min={0}/></div><div style={{fontFamily:"'Oswald',sans-serif",fontSize:"18px",fontWeight:700,color:"var(--muted)"}}>VS</div><div style={{flex:1,textAlign:"center"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"15px",fontWeight:700,marginBottom:"10px"}}>{t2.name}</div><input type="number" className="sc-inp" value={scores.s2} onChange={e=>setScores({...scores,s2:e.target.value})} placeholder="0" min={0}/></div></div>{scores.s1!==""&&scores.s2!==""&&<div style={{textAlign:"center",marginBottom:"12px",fontSize:"13px",color:"var(--muted)"}}>{+scores.s1>+scores.s2?`ðŸ† Ganador: ${t1.name}`:+scores.s2>+scores.s1?`ðŸ† Ganador: ${t2.name}`:"ðŸ¤ Empate"}</div>}<button className="btn btn-g btn-full" onClick={recordScore}>âœ… CONFIRMAR MARCADOR</button></>;})()} </>}
          </div>
          {completed.length>0&&<div className="card"><div className="card-ttl">âœ… Resultados ({completed.length})</div>{completed.slice().reverse().map(g=>{const t1=getTeam(g.team1),t2=getTeam(g.team2);if(!t1||!t2)return null;return<div key={g.id} className="game done"><div className="gm-meta"><span className="gm-time">{g.time}</span><span style={{fontSize:"10px",color:"var(--muted)"}}>{g.date}</span><span className={`rnd ${g.round==="Final"?"rnd-fin":""}`}>{g.round}</span></div><div className="matchup"><div className="team-s"><div className="team-nm" style={{color:g.score1>g.score2?"var(--green)":"var(--muted)"}}>{t1.name}</div></div><div className="sc-area"><div className={`sc ${g.score1>g.score2?"sc-w":"sc-l"}`}>{g.score1}</div><div className="vs">-</div><div className={`sc ${g.score2>g.score1?"sc-w":"sc-l"}`}>{g.score2}</div></div><div className="team-s" style={{textAlign:"right"}}><div className="team-nm" style={{color:g.score2>g.score1?"var(--green)":"var(--muted)"}}>{t2.name}</div></div></div></div>;})} </div>}
        </>}

        {tab==="poster" && <>
          <div className="suns">{sundays.map((s,i)=>{const cnt=gamesOn(i).length;if(cnt===0)return null;return<div key={i} className={`sun ${posterSun===i?"on":""}`} onClick={()=>setPosterSun(i)}><div className="d">{s.getDate()}</div><div className="m">{MONTHS_S[s.getMonth()]}</div><div className="gc">{cnt} partidos</div></div>;})}</div>
          {gamesOn(posterSun).length===0
            ? <div className="empty"><div className="empty-i">ðŸŽ¨</div><div className="empty-t">Agrega partidos al Calendario para generar el pÃ³ster</div></div>
            : <div className="poster"><div className="poster-hdr"><div className="poster-title">ðŸ€ {tourney}</div><div className="poster-sub">Programa de Partidos â€” Domingo</div></div>
              <div className="poster-info"><div className="poster-info-row"><span>ðŸ“…</span><span className="poster-info-lbl">Fecha:</span><span className="poster-info-val">{formatDateES(sundays[posterSun])}</span></div><div className="poster-info-row"><span>ðŸ“</span><span className="poster-info-lbl">Lugar:</span><span className="poster-info-val">{venue}</span></div></div>
              {gamesOn(posterSun).map((g,i)=>{const t1=getTeam(g.team1),t2=getTeam(g.team2);if(!t1||!t2)return null;return<div key={g.id} className="poster-game" style={{background:i%2===0?"rgba(255,102,0,.03)":"transparent"}}><div className="poster-game-hd"><span>ðŸ• {g.time}</span><span style={{color:"var(--text)",fontWeight:600}}>{g.round}</span><span className={`cat ${g.category==="Masculino"?"cat-m":"cat-f"}`}>{g.category}</span></div><div className="poster-matchup"><div className="poster-team"><div className="poster-tnm">{t1.name}</div></div>{g.completed?<div className="poster-score-row"><span className="poster-score" style={{color:g.score1>g.score2?"var(--green)":"var(--muted)"}}>{g.score1}</span><span style={{color:"var(--muted)"}}>-</span><span className="poster-score" style={{color:g.score2>g.score1?"var(--green)":"var(--muted)"}}>{g.score2}</span></div>:<div className="poster-vs">VS</div>}<div className="poster-team"><div className="poster-tnm">{t2.name}</div></div></div></div>;})}
              <div className="poster-ft">ðŸ€ Â¡Los esperamos a todos! â€¢ Entrada Libre â€¢ {venue}</div></div>}
        </>}

        {tab==="teams" && <>
          <div className="card">
            <div className="card-ttl">âš™ï¸ ConfiguraciÃ³n del Torneo</div>
            <div className="fr"><label className="lbl">Nombre del Torneo</label><input className="inp" value={tourney} onChange={e=>setTourney(e.target.value)}/></div>
            <div className="fr"><label className="lbl">Lugar / Cancha</label><input className="inp" value={venue} onChange={e=>setVenue(e.target.value)}/></div>
            <div className="notice">ðŸ’¾ Los cambios se guardan automÃ¡ticamente</div>
            <button className="btn btn-reset" onClick={resetAll}>ðŸ—‘ï¸ REINICIAR TORNEO COMPLETO</button>
          </div>
          <div className="card">
            <div className="card-ttl">âž• Agregar Equipo</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"9px",alignItems:"end"}}>
              <div><div className="fr"><label className="lbl">Nombre del Equipo</label><input className="inp" value={newTeam.name} onChange={e=>setNewTeam({...newTeam,name:e.target.value})} placeholder="Ej: Los Ãguilas"/></div><div className="fr" style={{marginBottom:0}}><label className="lbl">CategorÃ­a</label><select className="sel" value={newTeam.category} onChange={e=>setNewTeam({...newTeam,category:e.target.value})}><option>Masculino</option><option>Femenino</option></select></div></div>
              <button className="btn btn-p" style={{height:"38px",alignSelf:"flex-end"}} onClick={addTeam}>âž•</button>
            </div>
          </div>
          <div className="card">
            <div className="card-ttl">ðŸ‘¥ Equipos Registrados ({teams.length})</div>
            {teams.length===0
              ? <div className="empty"><div className="empty-i">ðŸ‘¥</div><div className="empty-t">Sin equipos</div></div>
              : teams.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}><div><div className="tnm">{t.name}</div><div style={{display:"flex",gap:"8px",marginTop:"4px",alignItems:"center"}}><span className={`cat ${t.category==="Masculino"?"cat-m":"cat-f"}`}>{t.category}</span><span style={{fontSize:"11px",color:"var(--muted)"}}>{t.wins}G / {t.losses}P</span></div></div><button className="btn btn-d" onClick={()=>removeTeam(t.id)}>âœ• Eliminar</button></div>)}
          </div>
        </>}

      </div>
    </div>
  );
}
