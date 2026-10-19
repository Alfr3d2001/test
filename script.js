'use strict';
const $ = id => document.getElementById(id);
const storage = {
 get(key, fallback = null) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
 set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { mostrarNotificacion('No se pudo guardar en este navegador. Conserva esta pestaña abierta.', 'warn'); return false; } },
 remove(key) { try { localStorage.removeItem(key); } catch { /* Storage can be disabled. */ } }
};
let toastTimer;
function mostrarNotificacion(message, type = 'ok') {
 document.querySelector('.notificacion')?.remove(); clearTimeout(toastTimer);
 const el = document.createElement('div'); el.className = `notificacion ${type}`; el.setAttribute('role', type === 'warn' ? 'alert' : 'status'); el.textContent = message; document.body.append(el);
 toastTimer = setTimeout(() => el.remove(), 4500);
}
function draftData(step) { return {tipo: $('tipo').value, motivo: $('motivo').value.trim(), documento: $('doc').value.trim(), observaciones: $('obs').value.trim(), paso: step, fecha: new Date().toLocaleDateString('es-ES')}; }
function renderDrafts() {
 const list = document.querySelector('#borradores .list'); list.replaceChildren();
 const draft = storage.get('facilgest_borradores', {})?.solicitud_activa;
 if (!draft || typeof draft !== 'object') { const el = document.createElement('p'); el.className='empty-state'; el.textContent='Todo despejado. Tus trámites guardados aparecerán aquí.'; list.append(el); return; }
 const a = document.createElement('a'); a.className='item'; a.id='borradorActivo'; const step = [1,2,3].includes(draft.paso) ? draft.paso : 1; a.href=`#tramite-${step}`;
 const div = document.createElement('div'), h = document.createElement('h3'), p = document.createElement('p'), tag = document.createElement('span');
 h.textContent=draft.tipo || 'Trámite guardado'; p.textContent=`Guardado: ${draft.fecha || 'Sin fecha'} · Paso ${step} de 3`; tag.className='tag ok'; tag.textContent='Continuar →'; div.append(h,p); a.append(div,tag); list.append(a);
 a.addEventListener('click', () => { for (const [field,key] of [['tipo','tipo'],['motivo','motivo'],['doc','documento'],['obs','observaciones']]) $(field).value=typeof draft[key]==='string'?draft[key]:''; updateSummary(); mostrarNotificacion('Borrador recuperado. Seguimos donde lo dejaste.'); });
}
function saveDraft(step) {
 if(storage.set('facilgest_borradores',{solicitud_activa:draftData(step)})) {renderDrafts(); location.hash='borradores'; mostrarNotificacion('Borrador guardado. Puedes continuar más tarde.');}
}
function validReason() { const valid=Boolean($('motivo').value.trim()); $('motivo').setAttribute('aria-invalid',String(!valid)); if(!valid){mostrarNotificacion('Cuéntanos el motivo del trámite para continuar.','warn'); $('motivo').focus();} return valid; }
function updateSummary(){ $('resumenTramite').textContent=$('tipo').value; $('resumenDocumento').textContent=$('doc').value.trim() || 'Sin documento'; }
function filterCases(){
 const term=$('q').value.trim().toLocaleLowerCase('es'), filter=$('filtro').value.toLocaleLowerCase('es'); let count=0;
 document.querySelectorAll('#expedientes .list .item').forEach(item=>{const match=item.textContent.toLocaleLowerCase('es').includes(term)&&(filter==='todos'||item.querySelector('.tag').textContent.toLocaleLowerCase('es').includes(filter)); item.hidden=!match; item.style.display=match?'':'none'; if(match)count++;});
 $('resultados').textContent=count?`${count} expediente${count===1?'':'s'} · Datos de demostración`:'No encontramos expedientes. Prueba otra búsqueda o estado.';
}
function route(){
 let id=location.hash.slice(1)||'login';
 if(!document.getElementById(id)?.classList.contains('screen')){id='home'; history.replaceState(null,'','#home');}
 document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===id));
 document.body.classList.toggle('login-view',id==='login');
 document.querySelectorAll('.sidebar>a,.tab').forEach(a=>{const active=a.hash===`#${id}`||(id.startsWith('tramite')&&a.hash==='#tramite-1'); a.classList.toggle('active',active); if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(id==='tramite-3')updateSummary();
 document.title=`${document.querySelector(`#${id} .title`)?.textContent || 'Tu espacio'} · FacilGest`;
 window.scrollTo({top:0,behavior:'instant'});
 const heading=document.querySelector(`#${id} .title`); heading?.setAttribute('tabindex','-1'); heading?.focus({preventScroll:true});
}
document.addEventListener('DOMContentLoaded',()=>{
 // Accept the original prototype's plain-text name without losing existing drafts.
 let name=storage.get('facilgest_usuario');
 if(!name){try{name=localStorage.getItem('facilgest_usuario');}catch{}}
 if(typeof name==='string')document.querySelector('.hello').textContent=`Hola, ${name}`;
 renderDrafts();
 $('q').addEventListener('input',filterCases); $('filtro').addEventListener('change',filterCases);
 $('btnEntrar').addEventListener('click',e=>{if(!$('dni').value.trim()||!$('pin').value.trim()){e.preventDefault();mostrarNotificacion('Completa tu nombre y un PIN de prueba.','warn'); (!$('dni').value.trim()?$('dni'):$('pin')).focus();return;}const name=$('dni').value.trim();storage.set('facilgest_usuario',name);document.querySelector('.hello').textContent=`Hola, ${name}`; $('pin').value='';});
 for(const id of ['dni','pin']) $(id).addEventListener('keydown',e=>{if(e.key==='Enter')$('btnEntrar').click();});
 document.querySelectorAll('[data-logout]').forEach(a=>a.addEventListener('click',()=>{storage.remove('facilgest_usuario');storage.remove('facilgest_sesion');$('dni').value='';$('pin').value='';document.querySelector('.hello').textContent='Hola, Usuario';}));
 $('btnContinuar1').addEventListener('click',e=>{if(!validReason())e.preventDefault();else updateSummary();});
 $('btnContinuar2').addEventListener('click',updateSummary);
 [1,2,3].forEach(step=>$(`btnBorrador${step}`).addEventListener('click',e=>{e.preventDefault();saveDraft(step);}));
 $('btnEnviar').addEventListener('click',e=>{if(!validReason()){e.preventDefault();location.hash='tramite-1';return;}storage.remove('facilgest_borradores');renderDrafts();$('fechaRegistro').textContent=new Date().toLocaleDateString('es-ES');$('registroCodigo').textContent=`DEMO-${Date.now().toString(36).toUpperCase()}`;mostrarNotificacion('Solicitud de demostración completada.');});
 $('motivo').addEventListener('input',()=>$('motivo').removeAttribute('aria-invalid'));
 window.addEventListener('hashchange',route);route();
});
