/* Data Fútbol Colombia - MVP. Datos de ejemplo (ficticios) + lógica + vistas. */
'use strict';

/* ================= 1. DATOS ================= */
const EQUIPOS = [
  [1,'Atlético Nacional','Medellín'],[2,'Millonarios','Bogotá'],[3,'América de Cali','Cali'],
  [4,'Deportivo Cali','Cali'],[5,'Junior','Barranquilla'],[6,'Independiente Medellín','Medellín'],
  [7,'Santa Fe','Bogotá'],[8,'Once Caldas','Manizales']
].map(([id,nombre,ciudad]) => ({id,nombre,ciudad}));

const JUGADORES = [
  [1,1,'Andrés Mosquera','Delantero'],[2,1,'Camilo Zapata','Mediocampista'],
  [3,2,'Felipe Ospina','Delantero'],[4,2,'Sebastián Rincón','Mediocampista'],
  [5,3,'Jhon Caicedo','Delantero'],[6,3,'Mateo Lozano','Defensa'],
  [7,4,'Brayan Arboleda','Delantero'],[8,4,'Kevin Payán','Mediocampista'],
  [9,5,'Luis Barrios','Delantero'],[10,5,'Yeison Mejía','Mediocampista'],
  [11,6,'Julián Rodríguez','Delantero'],[12,6,'Esteban Vélez','Mediocampista'],
  [13,7,'Dubán Herrera','Delantero'],[14,7,'Nicolás Pardo','Mediocampista'],
  [15,8,'Carlos Giraldo','Delantero'],[16,8,'Tomás Ríos','Defensa']
].map(([id,equipo,nombre,posicion]) => ({id,equipo,nombre,posicion}));

// [id, jornada, fecha, local, visitante, golesLocal, golesVisitante]  (null = por jugar)
const PARTIDOS = [
  [1,1,'2026-09-05',1,2,2,1],[2,1,'2026-09-05',3,4,0,0],[3,1,'2026-09-06',5,6,1,1],[4,1,'2026-09-06',7,8,3,0],
  [5,2,'2026-09-12',1,3,1,0],[6,2,'2026-09-12',2,4,2,2],[7,2,'2026-09-13',5,7,0,1],[8,2,'2026-09-13',6,8,2,0],
  [9,3,'2026-09-19',1,4,3,1],[10,3,'2026-09-19',2,3,1,0],[11,3,'2026-09-20',5,8,2,2],[12,3,'2026-09-20',6,7,0,1],
  [13,4,'2026-10-03',1,5,null,null],[14,4,'2026-10-03',2,6,null,null],
  [15,4,'2026-10-04',3,7,null,null],[16,4,'2026-10-04',4,8,null,null]
].map(([id,jornada,fecha,local,visita,gl,gv]) => ({id,jornada,fecha,local,visita,gl,gv}));

// [partido, jugador, goles, asistencias, minutos]
const STATS = [
  [1,1,2,0,90],[1,2,0,1,90],[1,3,1,0,90],[3,9,1,0,90],[3,11,1,0,88],[4,13,2,0,90],[4,14,1,2,90],
  [5,2,1,0,90],[5,1,0,1,85],[6,3,1,0,90],[6,4,1,1,90],[6,7,1,0,90],[6,8,1,0,90],[7,13,0,0,90],[7,14,1,0,90],
  [8,11,1,0,90],[8,12,1,1,90],[9,1,2,0,90],[9,2,1,2,90],[9,7,1,0,90],[10,4,1,0,90],[10,3,0,1,90],
  [11,9,1,0,90],[11,10,1,1,90],[11,15,2,0,90],[12,13,1,0,90],[12,14,0,1,90]
].map(([partido,jugador,goles,asist,min]) => ({partido,jugador,goles,asist,min}));

const ALERTAS = [
  {tipo:'lesion', equipo:6, texto:'Lesión de J. Rodríguez'},
  {tipo:'sancion',equipo:2, texto:'S. Rincón sancionado por acumulación de tarjetas'},
  {tipo:'racha',  equipo:1, texto:'Suma 3 victorias seguidas'}
];
const ALERTA_UI = {lesion:['hospital','Lesión','mal'], sancion:['block','Sanción','aviso'], racha:['fire','Racha','ok']};
// Íconos: símbolos <symbol id="i-..."> definidos en index.html
const ic = (n, c='') => `<svg class="ico ${c}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;

/* ================= 2. LÓGICA ================= */
const $ = s => document.querySelector(s);
const eq = id => EQUIPOS.find(e => e.id === id);
const jug = id => JUGADORES.find(j => j.id === id);
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jugado = p => p.gl !== null && p.gv !== null;
const fmtFecha = f => new Date(f + 'T00:00:00').toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'});

function tabla() {
  const t = Object.fromEntries(EQUIPOS.map(e => [e.id,{id:e.id,nombre:e.nombre,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}]));
  PARTIDOS.filter(jugado).forEach(p => {
    [[p.local,p.gl,p.gv],[p.visita,p.gv,p.gl]].forEach(([id,f,c]) => {
      const r = t[id]; r.pj++; r.gf += f; r.gc += c;
      if (f > c) { r.g++; r.pts += 3; } else if (f === c) { r.e++; r.pts += 1; } else r.p++;
    });
  });
  return Object.values(t).map(r => ({...r, dg:r.gf-r.gc}))
    .sort((a,b) => b.pts-a.pts || b.dg-a.dg || b.gf-a.gf || a.nombre.localeCompare(b.nombre));
}

function statsJugadores(filtro) {
  return JUGADORES.filter(j => !filtro || j.equipo === filtro).map(j => {
    const s = STATS.filter(x => x.jugador === j.id);
    return {...j, pj:s.length, goles:s.reduce((a,x)=>a+x.goles,0),
      asist:s.reduce((a,x)=>a+x.asist,0), min:s.reduce((a,x)=>a+x.min,0)};
  });
}

function jugadorSemana() {
  const ult = Math.max(...PARTIDOS.filter(jugado).map(p => p.jornada));
  const ids = PARTIDOS.filter(p => p.jornada === ult && jugado(p)).map(p => p.id);
  const pts = {};
  STATS.filter(s => ids.includes(s.partido)).forEach(s => {
    const r = pts[s.jugador] ??= {goles:0,asist:0,min:0};
    r.goles += s.goles; r.asist += s.asist; r.min += s.min;
  });
  const top = Object.entries(pts).sort((a,b) =>
    (b[1].goles*3+b[1].asist*2)-(a[1].goles*3+a[1].asist*2) || b[1].min-a[1].min)[0];
  return top ? {jugador:jug(+top[0]), ...top[1], jornada:ult} : null;
}

function forma(id) {
  return PARTIDOS.filter(p => jugado(p) && (p.local===id || p.visita===id)).slice(-5).map(p => {
    const [f,c] = p.local===id ? [p.gl,p.gv] : [p.gv,p.gl];
    return f>c ? 'G' : f===c ? 'E' : 'P';
  });
}
const FORMA = {G:['ok','check','Ganó'],E:['aviso','equal','Empató'],P:['mal','cancel','Perdió']};

/* Pruebas de integridad (diagrama de flujo: datos faltantes y errores de carga) */
function integridad() {
  const errores = [], manual = [];
  PARTIDOS.forEach(p => {
    const ref = `Partido ${p.id} (${eq(p.local).nombre} vs ${eq(p.visita).nombre})`;
    if ((p.gl === null) !== (p.gv === null)) errores.push(`${ref}: marcador incompleto`);
    if (p.local === p.visita) errores.push(`${ref}: un equipo juega contra sí mismo`);
    if (!jugado(p)) return;
    const sts = STATS.filter(s => s.partido === p.id);
    if (p.gl + p.gv > 0 && !sts.length) manual.push(`${ref}: faltan estadísticas de jugadores`);
    [[p.local,p.gl],[p.visita,p.gv]].forEach(([id,g]) => {
      const suma = sts.filter(s => jug(s.jugador).equipo === id).reduce((a,s)=>a+s.goles,0);
      if (suma > g) errores.push(`${ref}: jugadores de ${eq(id).nombre} suman ${suma} goles y el equipo hizo ${g}`);
    });
    sts.forEach(s => { const e = jug(s.jugador).equipo;
      if (e !== p.local && e !== p.visita) errores.push(`${ref}: ${jug(s.jugador).nombre} no jugó este partido`); });
  });
  return {errores, manual, ok: !errores.length && !manual.length};
}

/* Predicción simple y transparente (Poisson con goles a favor/en contra y ventaja de local) */
function prediccion(idL, idV) {
  const T = Object.fromEntries(tabla().map(r => [r.id, r]));
  const L = T[idL], V = T[idV];
  const lamL = Math.max(0.2, ((L.gf + V.gc) / 2 / Math.max(1,(L.pj+V.pj)/2)) * 1.1);
  const lamV = Math.max(0.2, ((V.gf + L.gc) / 2 / Math.max(1,(L.pj+V.pj)/2)) * 0.9);
  const pois = (l,k) => Math.exp(-l) * l**k / [...Array(k).keys()].reduce((f,i)=>f*(i+1),1);
  let gl = 0, em = 0, gv = 0;
  for (let a = 0; a <= 8; a++) for (let b = 0; b <= 8; b++) {
    const p = pois(lamL,a) * pois(lamV,b);
    if (a > b) gl += p; else if (a === b) em += p; else gv += p;
  }
  const s = gl + em + gv;
  return {local:gl/s*100, empate:em/s*100, visita:gv/s*100, lamL, lamV};
}

/* ================= 3. VISTAS ================= */
let vista = 'panel';
const filtro = () => +$('#filtro-equipo').value || 0;

const COLS = [['Pos','pos'],['Equipo','nombre'],['PJ','pj','Partidos jugados'],['G','g','Ganados'],['E','e','Empatados'],
  ['P','p','Perdidos'],['GF','gf','Goles a favor'],['GC','gc','Goles en contra'],['DG','dg','Diferencia de gol'],['Puntos','pts']];
const COMPACTO = ['pos','nombre','pj','dg','pts'];

const tablaPos = (filas, titulo, compacto) => {
  const cols = COLS.filter(c => !compacto || COMPACTO.includes(c[1]));
  const celda = (r,k) => k==='nombre' ? esc(r.nombre)+(r.pos===1?' '+ic('trophy'):'') : k==='dg' ? (r.dg>0?'+':'')+r.dg
    : k==='pts' ? `<strong>${r.pts}</strong>` : r[k];
  return `<div class="scroll" tabindex="0"><table class="${compacto?'compacta':''}"><caption>${titulo}</caption><thead><tr>${cols.map(c =>
    `<th scope="col">${c[2] ? `<abbr title="${c[2]}">${c[0]}</abbr>` : c[0]}</th>`).join('')}</tr></thead><tbody>${filas.map(r =>
    `<tr class="${r.pos===1?'lider':''}">${cols.map(c => `<td>${celda(r,c[1])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
};

/* ---- Gráficos (SVG/HTML propios, sin librerías) ---- */
const asistEq = id => STATS.filter(s => jug(s.jugador).equipo === id).reduce((a,s) => a+s.asist, 0);

const barras = items => { const m = Math.max(1, ...items.map(i => i.valor));
  return `<div class="barras">${items.map(i => `<div class="bar-fila"><span>${esc(i.etq)}</span>
  <span class="pista" aria-hidden="true"><i style="width:${Math.round(i.valor/m*100)}%"></i></span><strong>${i.valor}</strong></div>`).join('')}</div>`; };

const serieEquipo = id => PARTIDOS.filter(p => jugado(p) && (p.local===id || p.visita===id)).map((p,i) => ({
  n:i+1, rival:eq(p.local===id ? p.visita : p.local).nombre, gf:p.local===id ? p.gl : p.gv,
  asist:STATS.filter(s => s.partido===p.id && jug(s.jugador).equipo===id).reduce((a,s) => a+s.asist, 0)})).slice(-8);

const lineas = serie => {
  const W=440, H=270, l=44, r=18, t=16, b=44, ymax=Math.max(3, ...serie.map(s => Math.max(s.gf, s.asist)));
  const X = i => serie.length < 2 ? (l+W-r)/2 : l + i*(W-l-r)/(serie.length-1);
  const Y = v => H-b - v/ymax*(H-t-b);
  const pts = k => serie.map((s,i) => `${X(i)},${Y(s[k])}`).join(' ');
  const rej = Array.from({length:ymax+1}, (_,v) => `<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" class="g-rej"/><text x="${l-8}" y="${Y(v)+5}" text-anchor="end">${v}</text>`).join('');
  const ejeX = serie.map((s,i) => `<text x="${X(i)}" y="${H-b+24}" text-anchor="middle">P${s.n}</text>`).join('');
  return `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de líneas de goles y asistencias en los últimos ${serie.length} partidos. Los valores están en la tabla siguiente.">
    ${rej}${ejeX}<polyline points="${pts('gf')}" class="l-gol"/><polyline points="${pts('asist')}" class="l-asi"/>
    ${serie.map((s,i) => `<circle cx="${X(i)}" cy="${Y(s.gf)}" r="7" class="m-gol"/><rect x="${X(i)-6}" y="${Y(s.asist)-6}" width="12" height="12" class="m-asi"/>`).join('')}</svg>
    <p class="leyenda"><span class="etq"><i class="leg leg-gol"></i>Goles: línea continua</span> <span class="etq"><i class="leg leg-asi"></i>Asistencias: línea punteada</span></p>
    <div class="scroll" tabindex="0"><table class="compacta"><caption class="solo-lectores">Datos del gráfico</caption><thead><tr><th scope="col">Partido</th><th scope="col">Rival</th><th scope="col">Goles</th><th scope="col">Asistencias</th></tr></thead><tbody>
    ${serie.map(s => `<tr><td>P${s.n}</td><td>${esc(s.rival)}</td><td>${s.gf}</td><td>${s.asist}</td></tr>`).join('')}</tbody></table></div>`;
};

const radar = id => {
  const T = tabla(), me = T.find(r => r.id===id), mx = k => Math.max(1, ...T.map(r => r[k]));
  const maxA = Math.max(1, ...EQUIPOS.map(e => asistEq(e.id))), maxGc = Math.max(1, ...T.map(r => r.gc));
  const ej = [['Puntos',me.pts/mx('pts')],['Goles a favor',me.gf/mx('gf')],['Asistencias',asistEq(id)/maxA],
              ['Defensa',(maxGc-me.gc)/maxGc],['Victorias',me.g/mx('g')]];
  const cx=190, cy=120, R=70, ang = i => (-90+i*72)*Math.PI/180;
  const xy = (i,f) => [cx+Math.cos(ang(i))*R*f, cy+Math.sin(ang(i))*R*f];
  const P = (i,f) => xy(i,f).map(v => v.toFixed(1)).join(',');
  const anillo = f => `<polygon points="${ej.map((_,i) => P(i,f)).join(' ')}" class="g-rej"/>`;
  const etq = ej.map((e,i) => { const c = Math.cos(ang(i)), [x,y] = xy(i,(R+14)/R);
    return `<text x="${x.toFixed(1)}" y="${(y+5).toFixed(1)}" text-anchor="${Math.abs(c)<0.2?'middle':c>0?'start':'end'}">${e[0]}</text>`; }).join('');
  const desc = ej.map(e => `${e[0]} ${Math.round(e[1]*100)} %`).join(', ');
  return `<svg class="grafico radar" viewBox="0 0 380 240" role="img" aria-label="Perfil del equipo comparado con el mejor de la liga: ${desc}">
    ${anillo(1)}${anillo(.66)}${anillo(.33)}${ej.map((_,i) => `<line x1="${cx}" y1="${cy}" x2="${xy(i,1)[0].toFixed(1)}" y2="${xy(i,1)[1].toFixed(1)}" class="g-rej"/>`).join('')}
    <polygon points="${ej.map((e,i) => P(i,e[1])).join(' ')}" class="r-area"/>${etq}</svg>`;
};

const SILUETA = `<svg class="foto" viewBox="0 0 100 100" role="img" aria-label="Foto no disponible"><rect width="100" height="100" class="foto-fondo"/><circle cx="50" cy="38" r="18" class="foto-fig"/><path d="M14 100c0-24 16-38 36-38s36 14 36 38z" class="foto-fig"/></svg>`;

const listaProximos = f => {
  const l = PARTIDOS.filter(p => !jugado(p) && (!f || p.local===f || p.visita===f)).slice(0,4);
  return l.length ? `<ul class="partidos">${l.map(p => `<li><div class="vs"><strong>${esc(eq(p.local).nombre)}</strong><span>vs</span>
    <strong>${esc(eq(p.visita).nombre)}</strong></div><span class="fecha">${ic('event')}${fmtFecha(p.fecha)} · Jornada ${p.jornada}</span></li>`).join('')}</ul>`
    : '<p>No hay partidos programados para este equipo.</p>';
};

const tablaJug = (l, titulo) => `<div class="scroll" tabindex="0"><table><caption>${titulo}</caption>
  <thead><tr><th scope="col">Pos</th><th scope="col">Jugador</th><th scope="col">Equipo</th><th scope="col">Posición</th>
  <th scope="col">Goles</th><th scope="col">Asistencias</th><th scope="col">Minutos</th></tr></thead><tbody>
  ${l.map((j,i) => `<tr><td>${i+1}</td><td>${esc(j.nombre)}</td><td>${esc(eq(j.equipo).nombre)}</td><td>${j.posicion}</td>
  <td><strong>${j.goles}</strong></td><td>${j.asist}</td><td>${j.min}</td></tr>`).join('')}</tbody></table></div>`;

const ordenar = l => [...l].sort((a,b) => b.goles-a.goles || b.asist-a.asist || a.nombre.localeCompare(b.nombre));
const conPos = t => t.map((r,i) => ({...r,pos:i+1}));

const KPI = (icono, valor, etiqueta) => `<div class="kpi"><span class="chip-ico">${ic(icono)}</span><div><strong>${valor}</strong><span>${etiqueta}</span></div></div>`;
const tit = (icono, texto, sub) => `<div class="tit"><span class="tit-ico">${ic(icono)}</span><div><h2 tabindex="-1">${texto}</h2>${sub ? `<p class="sub-h">${sub}</p>` : ''}</div></div>`;
const cab = (icono, texto) => `<div class="card-h"><span class="chip-ico">${ic(icono)}</span><h3>${texto}</h3></div>`;
const estado = (ok, texto) => `<span class="etq ${ok ? 'ok' : 'mal'}">${ic(ok ? 'check' : 'error')}${texto}</span>`;
const dato = (v, t) => `<div><strong>${v}</strong><span>${t}</span></div>`;

const VISTAS = {
  panel(f) {
    const js = jugadorSemana(), ig = integridad(), ps = PARTIDOS.filter(jugado);
    const tot = ps.reduce((a,p) => a+p.gl+p.gv, 0);
    const gol = ordenar(statsJugadores(f)).filter(j => j.goles>0).slice(0,5);
    const al = ALERTAS.filter(a => !f || a.equipo===f);
    const idR = f || tabla()[0].id;
    return `${tit('home','Panel principal','Resumen de la Liga BetPlay 2026')}
    <div class="kpis">${KPI('event',ps.length,'Partidos jugados')}${KPI('ball',tot,'Goles marcados')}${KPI('bar',(tot/ps.length).toFixed(1),'Goles por partido')}</div>
    <div class="panel-grid">
      <section class="tarjeta g-stats">${cab('ball','Máximos goleadores')}${gol.length ?
        barras(gol.map(j => ({etq:`${j.nombre} (${eq(j.equipo).nombre})`, valor:j.goles}))) : '<p>Sin goles registrados.</p>'}</section>
      <section class="tarjeta g-liga">${cab('trophy','Resumen de la liga')}<h4>Próximos partidos</h4>${listaProximos(f)}
        <h4>Tabla de posiciones</h4>${tablaPos(conPos(tabla()),'Posiciones de la Liga BetPlay',true)}</section>
      <section class="tarjeta hero g-semana">${cab('star','Jugador de la semana')}${js ? `<div class="jug">${SILUETA}<div>
        <p class="grande">${esc(js.jugador.nombre)}</p><p>${esc(eq(js.jugador.equipo).nombre)} · Jornada ${js.jornada}</p>
        <div class="datos">${dato(js.goles,'Goles')}${dato(js.asist,'Asistencias')}${dato(js.min,'Minutos')}</div></div></div>` : '<p>Sin datos.</p>'}</section>
      <section class="tarjeta verde g-rend">${cab('trending','Rendimiento últimos partidos: '+esc(eq(idR).nombre))}${lineas(serieEquipo(idR))}</section>
      <section class="tarjeta g-alertas">${cab('bell','Alertas inteligentes')}${al.length ? `<ul class="alertas">${al.map(a => { const [i,t,c] = ALERTA_UI[a.tipo];
        return `<li class="alerta ${c}"><span class="alerta-ico">${ic(i)}</span><div><strong>${t}: ${esc(eq(a.equipo).nombre)}</strong><span>${esc(a.texto)}</span></div></li>`; }).join('')}</ul>`
        : '<p>Sin alertas para este equipo.</p>'}</section>
      <section class="tarjeta g-verif">${cab('verified','Verificación de datos')}${ig.ok
        ? `<p>${estado(true,'Correcto')} Los datos pasaron todas las pruebas de integridad.</p>`
        : `<p>${estado(false,'Revisar')}</p><ul>${[...ig.errores,...ig.manual].map(x => `<li>${esc(x)}</li>`).join('')}</ul>`}</section>
    </div>`;
  },
  jugadores(f) {
    const l = ordenar(statsJugadores(f)), top = l.filter(j => j.goles>0).slice(0,8);
    return `${tit('person','Jugadores', f ? eq(f).nombre : 'Todos los equipos')}<div class="apilado">
      <section class="tarjeta">${cab('ball','Máximos goleadores')}${top.length ?
        barras(top.map(j => ({etq:`${j.nombre} (${eq(j.equipo).nombre})`, valor:j.goles}))) : '<p>Sin goles registrados.</p>'}</section>
      <section class="tarjeta verde">${tablaJug(l, f ? 'Jugadores de '+eq(f).nombre : 'Todos los jugadores (ordenados por goles)')}</section></div>`;
  },
  equipos(f) {
    const T = Object.fromEntries(tabla().map((r,i) => [r.id,{...r,pos:i+1}]));
    return `${tit('shield','Equipos','Rendimiento y perfil de cada club')}<div class="rejilla">${EQUIPOS.filter(e => !f || e.id===f).map(e => { const r = T[e.id]; return `
      <section class="tarjeta"><div class="card-h"><span class="chip-ico">${ic('shield')}</span><div><h3>${esc(e.nombre)}</h3><span class="muted">${esc(e.ciudad)}</span></div>
        <span class="puesto" aria-label="Puesto ${r.pos}">${r.pos}º</span></div>
      <div class="datos">${dato(r.pts,'Puntos')}${dato(r.gf,'Goles a favor')}${dato(r.gc,'Goles en contra')}${dato(asistEq(e.id),'Asistencias')}</div>
      <h4>Perfil del equipo</h4>${radar(e.id)}
      <h4>Últimos partidos</h4><div class="forma">${forma(e.id).map(x => { const [c,i,t] = FORMA[x]; return `<span class="etq ${c}">${ic(i)}${t}</span>`; }).join('')}</div></section>`; }).join('')}</div>`;
  },
  liga(f) {
    const jornadas = [...new Set(PARTIDOS.map(p => p.jornada))], T = tabla();
    return `${tit('trophy','Liga BetPlay 2026','Categoría Primera A')}<div class="apilado">
    <section class="tarjeta">${cab('leaderboard','Tabla de posiciones')}${tablaPos(conPos(T),'Posiciones')}</section>
    <section class="tarjeta">${cab('bar','Goles a favor por equipo')}${barras([...T].sort((a,b) => b.gf-a.gf).map(r => ({etq:r.nombre, valor:r.gf})))}</section>
    <div class="rejilla">${jornadas.map(j => { const ps = PARTIDOS.filter(p => p.jornada===j && (!f || p.local===f || p.visita===f));
      return ps.length ? `<section class="tarjeta verde">${cab('event','Jornada '+j)}<ul class="partidos">${ps.map(p => `<li><div class="vs">${esc(eq(p.local).nombre)}
        <strong>${jugado(p) ? `${p.gl} - ${p.gv}` : 'vs'}</strong> ${esc(eq(p.visita).nombre)}</div>
        <span class="fecha">${jugado(p) ? 'Finalizado' : ic('event')+fmtFecha(p.fecha)}</span></li>`).join('')}</ul></section>` : ''; }).join('')}</div></div>`;
  },
  predicciones() {
    const op = sel => EQUIPOS.map(e => `<option value="${e.id}" ${e.id===sel?'selected':''}>${esc(e.nombre)}</option>`).join('');
    return `${tit('trending','Predicciones','Probabilidad estimada de un partido')}<section class="tarjeta">
      <p class="nota">${ic('info')}<span>Estimación simple según los goles a favor y en contra de cada equipo, con una ligera ventaja para el local. <strong>Es solo orientativa, no es consejo de apuestas.</strong></span></p>
      <div class="form-pred" style="margin-top:1.25rem"><div><label for="p-local">Equipo local</label><select id="p-local">${op(2)}</select></div>
      <div><label for="p-visita">Equipo visitante</label><select id="p-visita">${op(1)}</select></div>
      <button type="button" id="p-calc" class="primario">${ic('play')}Calcular</button></div>
      <div id="p-res" aria-live="polite"></div></section>`;
  }
};

function calcularPrediccion() {
  const l = +$('#p-local').value, v = +$('#p-visita').value, out = $('#p-res');
  if (l === v) { out.innerHTML = `<p>${estado(false,'Elija dos equipos distintos.')}</p>`; return; }
  const r = prediccion(l, v);
  const fila = (t,x) => `<div class="fila-prob"><strong>${t}: ${x.toFixed(0)} %</strong>
    <div class="pista" aria-hidden="true"><i style="width:${x.toFixed(0)}%"></i></div></div>`;
  out.innerHTML = fila('Gana '+esc(eq(l).nombre), r.local) + fila('Empate', r.empate) + fila('Gana '+esc(eq(v).nombre), r.visita) +
    `<p class="muted">Goles esperados: ${r.lamL.toFixed(1)} - ${r.lamV.toFixed(1)}. Hay pocos partidos jugados, por eso la estimación es limitada.</p>`;
}

function mostrar() {
  $('#contenido').innerHTML = VISTAS[vista](filtro());
  document.querySelectorAll('.menu button').forEach(b =>
    b.dataset.vista === vista ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current'));
  $('.filtro').hidden = vista === 'predicciones';
  if (vista === 'predicciones') $('#p-calc').addEventListener('click', calcularPrediccion);
}

/* ================= 4. ACCESIBILIDAD Y ARRANQUE ================= */
const guardar = (k,v) => { try { localStorage.setItem(k,v); } catch {} };
const leer = k => { try { return localStorage.getItem(k); } catch { return null; } };
const aplicarTema = t => { document.documentElement.dataset.tema = t; $('#tema').setAttribute('aria-pressed', t==='oscuro'); guardar('df-tema', t); };

document.addEventListener('DOMContentLoaded', () => {
  $('#filtro-equipo').innerHTML = '<option value="0">Todos los equipos</option>' +
    EQUIPOS.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
  $('#filtro-equipo').addEventListener('change', mostrar);
  document.querySelectorAll('.menu button').forEach(b => b.addEventListener('click', () => {
    vista = b.dataset.vista; mostrar(); $('#contenido h2').focus(); }));
  $('#tema').addEventListener('click', () => aplicarTema(document.documentElement.dataset.tema === 'claro' ? 'oscuro' : 'claro'));
  const preferido = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  aplicarTema(leer('df-tema') || preferido); mostrar();
});
