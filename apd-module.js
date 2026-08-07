/* GuillePD v3.6.6
 * Módulo aislado de modalidades CAPD/APD/Mixta.
 * No modifica cálculos, balances ni generación de informes del modo Manual.
 */
(function(){
'use strict';

const MODE_LABELS={
 manual:'Manual (CAPD)',
 apd:'Cicladora (APD)',
 mixed:'Mixto'
};
const EQUIPMENT_LABELS={
 'baxter-homechoice':'Baxter HomeChoice',
 'baxter-amia':'Baxter AMIA',
 fresenius:'Fresenius',
 other:'Otra'
};
const SOLUTION_LABELS={
 'glucose-1.5':'Glucosa 1.5 %',
 'glucose-2.5':'Glucosa 2.5 %',
 'glucose-4.25':'Glucosa 4.25 %',
 icodextrin:'Icodextrina',
 other:'Otra'
};

let prescriptionTab='manual';
let apdModuleReady=false;
let activeLastFillDrainTreatmentId=null;
let editingAPDTreatmentId=null;

function text(value){
 return String(value??'')
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;')
  .replaceAll("'",'&#039;');
}
function uid(prefix){
 return prefix+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
}
function optionalNumber(id){
 const el=$(id);
 if(!el)return null;
 const raw=String(el.value??'').trim().replace(',','.');
 if(raw==='')return null;
 const value=Number(raw);
 return Number.isFinite(value)?value:null;
}
function value(id){
 const el=$(id);
 return el?String(el.value??'').trim():'';
}
function checked(id){
 const el=$(id);
 return !!(el&&el.checked);
}
function findAPDTreatment(id){
 return apdTreatments().find(item=>String(item.id)===String(id));
}
function setAPDResultFields(record,includeStart=false){
 if(includeStart&&$('apdEditStartTime'))$('apdEditStartTime').value=String(record?.startTime||'').slice(0,16);
 if($('apdEndTime'))$('apdEndTime').value=String(record?.endTime||'').slice(0,16);
 if($('apdTotalUf'))$('apdTotalUf').value=record?.totalUf??'';
 if($('apdWeight'))$('apdWeight').value=record?.weight??'';
 if($('apdSys'))$('apdSys').value=record?.sys??'';
 if($('apdDia'))$('apdDia').value=record?.dia??'';
 if($('apdTemp'))$('apdTemp').value=record?.temp??'';
 if($('apdUrine'))$('apdUrine').value=record?.urine??'';
 if($('apdNotes'))$('apdNotes').value=record?.notes??'';
}
function clearAPDResultFields(){
 setAPDResultFields({startTime:'',endTime:'',totalUf:null,weight:null,sys:null,dia:null,temp:null,urine:null,notes:''},true);
}
function modeLabel(mode){
 return MODE_LABELS[mode]||MODE_LABELS.manual;
}
function equipmentLabel(prescription){
 if(!prescription)return '—';
 return prescription.equipment?.type==='other'
  ? (prescription.equipment.other||'Otra')
  : (EQUIPMENT_LABELS[prescription.equipment?.type]||'—');
}
function solutionLabel(prescription){
 if(!prescription)return '—';
 return prescription.treatment?.solution==='other'
  ? (prescription.treatment.solutionOther||'Otra')
  : (SOLUTION_LABELS[prescription.treatment?.solution]||'—');
}
function prescriptionName(prescription,index){
 return prescription?.name||`Programa APD N.º ${prescription?.number||index||1}`;
}
function clone(value){
 return JSON.parse(JSON.stringify(value));
}
function ensurePatientExtensions(patient=data){
 if(!patient||typeof patient!=='object')return false;
 let changed=false;
 patient.settings=patient.settings||{};
 if(!['manual','apd','mixed'].includes(patient.settings.treatmentMode)){
  patient.settings.treatmentMode='manual';
  changed=true;
 }
 if(!patient.prescriptions||typeof patient.prescriptions!=='object'){
  patient.prescriptions={manual:[],apd:[],mixed:[]};
  changed=true;
 }
 ['manual','apd','mixed'].forEach(type=>{
  if(!Array.isArray(patient.prescriptions[type])){
   patient.prescriptions[type]=[];
   changed=true;
  }
 });
 if(!Array.isArray(patient.apdTreatments)){
  patient.apdTreatments=[];
  changed=true;
 }
 patient.apdTreatments.forEach(record=>{
  if(!record.future||typeof record.future!=='object'){
   record.future={alarms:[],events:[],import:null};
   changed=true;
  }else{
   if(!Array.isArray(record.future.alarms)){record.future.alarms=[];changed=true}
   if(!Array.isArray(record.future.events)){record.future.events=[];changed=true}
   if(!('import' in record.future)){record.future.import=null;changed=true}
  }
  if(record.lastFillDrain&&typeof record.lastFillDrain==='object'){
   if(!record.lastFillDrain.linkedTreatmentId){record.lastFillDrain.linkedTreatmentId=record.id;changed=true}
   if(!['pending','completed','not-required'].includes(record.lastFillDrain.status)){
    record.lastFillDrain.status=record.lastFillDrain.completedAt?'completed':'pending';
    changed=true;
   }
  }
 });
 return changed;
}
function ensureAllPatientExtensions(){
 let changed=false;
 (root.patients||[]).forEach(patient=>{
  if(ensurePatientExtensions(patient))changed=true;
 });
 return changed;
}
function currentMode(){
 ensurePatientExtensions();
 return data.settings.treatmentMode||'manual';
}
function apdPrescriptions(){
 ensurePatientExtensions();
 return data.prescriptions.apd;
}
function apdTreatments(){
 ensurePatientExtensions();
 return data.apdTreatments;
}
function activeAPDPrescriptions(at=new Date()){
 const day=dateKey(at);
 return apdPrescriptions()
  .filter(p=>p.active&&(!p.validFrom||p.validFrom<=day)&&(!p.validTo||p.validTo>=day))
  .sort((a,b)=>String(b.validFrom||'').localeCompare(String(a.validFrom||'')));
}
function activeAPDTreatment(){
 return apdTreatments()
  .filter(record=>record.status==='active')
  .sort((a,b)=>new Date(b.startTime)-new Date(a.startTime))[0]||null;
}
function pendingAPDLastFillDrain(){
 if(currentMode()!=='mixed')return null;
 return apdTreatments()
  .filter(record=>record.status==='completed'&&record.lastFillDrain?.required===true&&record.lastFillDrain.status==='pending')
  .sort((a,b)=>new Date(a.endTime||a.startTime)-new Date(b.endTime||b.startTime))[0]||null;
}
function hasAPDLastFill(record){
 return record?.prescriptionSnapshot?.treatment?.lastFill===true;
}
function APDLastFillVolume(record){
 const volume=Number(record?.prescriptionSnapshot?.treatment?.lastFillVolume);
 return Number.isFinite(volume)?Math.round(volume):null;
}
function treatmentModeAllowsAPD(){
 const mode=currentMode();
 return mode==='apd'||mode==='mixed';
}
function treatmentModeAllowsManual(){
 const mode=currentMode();
 return mode==='manual'||mode==='mixed';
}

function changeTreatmentMode(mode){
 if(!['manual','apd','mixed'].includes(mode))return;
 ensurePatientExtensions();
 data.settings.treatmentMode=mode;
 persist();
 renderAll();
 showToast(`Modalidad ${modeLabel(mode)} seleccionada.`,'success');
}

function renderTreatmentModeUI(){
 const mode=currentMode();
 document.querySelectorAll('input[name="treatmentMode"]').forEach(input=>{
  input.checked=input.value===mode;
 });
 const help=$('treatmentModeHelp');
 if(help){
  help.textContent=mode==='manual'
   ? 'Se mantiene el registro manual actual, sin ningún cambio.'
   : mode==='apd'
    ? 'Inicio y finalización de tratamientos nocturnos con la prescripción médica activa.'
    : 'Permite registrar tratamientos APD e intercambios manuales en un mismo día.';
 }
 const summary=$('prescriptionModeSummary');
 if(summary)summary.textContent=modeLabel(mode);
}

function showPrescriptionTab(tab){
 prescriptionTab=['manual','apd','mixed'].includes(tab)?tab:'manual';
 document.querySelectorAll('.prescription-tab').forEach(button=>{
  button.classList.toggle('active',button.dataset.tab===prescriptionTab);
 });
 document.querySelectorAll('.prescription-panel').forEach(panel=>{
  panel.classList.toggle('active',panel.id===`prescription-${prescriptionTab}`);
 });
 renderPrescriptionPanels();
}

function openPrescriptions(){
 prescriptionTab=currentMode();
 if(prescriptionTab==='mixed')prescriptionTab='mixed';
 renderPrescriptionPanels();
 showScreen('prescriptions');
 showPrescriptionTab(prescriptionTab);
}

function clearAPDPrescriptionForm(){
 const ids=[
  'apdProgramName','apdValidTo','apdEquipmentOther','apdDurationHours',
  'apdCycles','apdCycleVolume','apdLastFillVolume','apdSolutionOther',
  'apdAdditiveOther','apdPrescriptionNotes'
 ];
 ids.forEach(id=>{if($(id))$(id).value=''});
 if($('apdProgramActive'))$('apdProgramActive').checked=true;
 if($('apdValidFrom'))$('apdValidFrom').value=dateKey(new Date());
 if($('apdEquipment'))$('apdEquipment').value='baxter-homechoice';
 if($('apdLastFill'))$('apdLastFill').value='no';
 if($('apdDaytimeDwell'))$('apdDaytimeDwell').value='no';
 if($('apdSolution'))$('apdSolution').value='glucose-1.5';
 ['apdAdditiveHeparin','apdAdditiveAntibiotics','apdAdditiveOtherEnabled'].forEach(id=>{
  if($(id))$(id).checked=false;
 });
 toggleAPDFields();
}

function toggleAPDFields(){
 const equipmentOther=$('apdEquipmentOtherWrap');
 const lastFillVolume=$('apdLastFillVolumeWrap');
 const solutionOther=$('apdSolutionOtherWrap');
 const additiveOther=$('apdAdditiveOtherWrap');
 if(equipmentOther)equipmentOther.classList.toggle('hidden',value('apdEquipment')!=='other');
 if(lastFillVolume)lastFillVolume.classList.toggle('hidden',value('apdLastFill')!=='yes');
 if(solutionOther)solutionOther.classList.toggle('hidden',value('apdSolution')!=='other');
 if(additiveOther)additiveOther.classList.toggle('hidden',!checked('apdAdditiveOtherEnabled'));
}

function saveAPDPrescription(){
 ensurePatientExtensions();
 const validFrom=value('apdValidFrom');
 const duration=optionalNumber('apdDurationHours');
 const cycles=optionalNumber('apdCycles');
 const cycleVolume=optionalNumber('apdCycleVolume');
 const lastFill=value('apdLastFill')==='yes';
 const lastFillVolume=optionalNumber('apdLastFillVolume');

 if(!validFrom){
  showToast('Ingresá la fecha de inicio de vigencia.','error');
  $('apdValidFrom')?.focus();
  return;
 }
 const validTo=value('apdValidTo');
 if(validTo&&validTo<validFrom){
  showToast('La finalización de vigencia no puede ser anterior al inicio.','error');
  $('apdValidTo')?.focus();
  return;
 }
 if(duration===null||duration<=0){
  showToast('Ingresá la duración total indicada.','error');
  $('apdDurationHours')?.focus();
  return;
 }
 if(cycles===null||cycles<1){
  showToast('Ingresá la cantidad de ciclos.','error');
  $('apdCycles')?.focus();
  return;
 }
 if(cycleVolume===null||cycleVolume<=0){
  showToast('Ingresá el volumen por ciclo.','error');
  $('apdCycleVolume')?.focus();
  return;
 }
 if(lastFill&&(lastFillVolume===null||lastFillVolume<0)){
  showToast('Ingresá el volumen del último llenado.','error');
  $('apdLastFillVolume')?.focus();
  return;
 }

 const list=apdPrescriptions();
 const isActive=checked('apdProgramActive');
 if(isActive)list.forEach(p=>{p.active=false});
 const record={
  id:uid('rx_apd'),
  type:'apd',
  number:list.length+1,
  name:value('apdProgramName'),
  active:isActive,
  validFrom,
  validTo:validTo||null,
  equipment:{
   type:value('apdEquipment')||'other',
   other:value('apdEquipmentOther')
  },
  treatment:{
   durationHours:duration,
   cycles:Math.round(cycles),
   cycleVolume:Math.round(cycleVolume),
   lastFill,
   lastFillVolume:lastFill?Math.round(lastFillVolume):null,
   daytimeDwell:value('apdDaytimeDwell')==='yes',
   solution:value('apdSolution')||'other',
   solutionOther:value('apdSolutionOther'),
   additives:{
    heparin:checked('apdAdditiveHeparin'),
    antibiotics:checked('apdAdditiveAntibiotics'),
    other:checked('apdAdditiveOtherEnabled'),
    otherText:value('apdAdditiveOther')
   }
  },
  notes:value('apdPrescriptionNotes'),
  createdAt:new Date().toISOString()
 };
 list.push(record);
 persist();
 clearAPDPrescriptionForm();
 renderPrescriptionPanels();
 renderAPDTreatmentScreen();
 showToast('Nueva prescripción APD guardada.','success');
}

function renderManualPrescriptionPanel(){
 const target=$('manualPrescriptionSummary');
 if(!target)return;
 const settings=data.settings||{};
 target.innerHTML=`
  <h4>Indicación manual actual</h4>
  <p>El registro CAPD mantiene exactamente la configuración y los cálculos que ya utiliza GuillePD.</p>
  <div class="prescription-summary-grid">
   <div><span>Intercambios diarios</span><strong>${text(settings.planned||'—')}</strong></div>
   <div><span>Volumen habitual</span><strong>${settings.usualVolume?text(settings.usualVolume)+' mL':'—'}</strong></div>
   <div><span>Soluciones habituales</span><strong>${text(settings.solutions||'—')}</strong></div>
   <div><span>Modalidad seleccionada</span><strong>${text(modeLabel(currentMode()))}</strong></div>
  </div>
  <p class="mode-note">Los parámetros manuales continúan administrándose desde Ajustes. Esta versión no modifica su funcionamiento.</p>`;
}

function renderMixedPrescriptionPanel(){
 const target=$('mixedPrescriptionSummary');
 if(!target)return;
 const active=activeAPDPrescriptions()[0];
 target.innerHTML=`
  <h4>Tratamiento mixto</h4>
  <p>La modalidad Mixta combina el programa APD vigente con los intercambios manuales ya configurados.</p>
  <div class="prescription-summary-grid">
   <div><span>Programa APD activo</span><strong>${active?text(prescriptionName(active)):'Sin programa activo'}</strong></div>
   <div><span>Intercambios manuales</span><strong>${text(data.settings.planned||'—')} por día</strong></div>
   <div><span>Volumen manual habitual</span><strong>${data.settings.usualVolume?text(data.settings.usualVolume)+' mL':'—'}</strong></div>
   <div><span>Historial</span><strong>Unificado por día</strong></div>
  </div>
  <p class="mode-note">No se duplican indicaciones: APD utiliza su prescripción versionada y CAPD conserva los parámetros manuales actuales.</p>`;
}

function renderAPDPrescriptionHistory(){
 const target=$('apdPrescriptionHistory');
 if(!target)return;
 const list=[...apdPrescriptions()].sort((a,b)=>{
  return String(b.validFrom||'').localeCompare(String(a.validFrom||''))||(Number(b.number)||0)-(Number(a.number)||0);
 });
 if(!list.length){
  target.innerHTML='<div class="prescription-empty">Todavía no hay prescripciones APD guardadas.</div>';
  return;
 }
 target.innerHTML=list.map((p,index)=>{
  const additives=[];
  if(p.treatment?.additives?.heparin)additives.push('Heparina');
  if(p.treatment?.additives?.antibiotics)additives.push('Antibióticos');
  if(p.treatment?.additives?.other)additives.push(p.treatment.additives.otherText||'Otros');
  const validity=p.validTo
   ? `${fmtDate(p.validFrom+'T12:00:00')} al ${fmtDate(p.validTo+'T12:00:00')}`
   : `Desde ${fmtDate(p.validFrom+'T12:00:00')}`;
  return `<article class="prescription-record ${p.active?'active-program':''}">
   <div class="prescription-record-head">
    <div>
     <h4>${text(prescriptionName(p,list.length-index))}</h4>
     <p>Vigencia: ${text(validity)}</p>
    </div>
    <span class="program-status ${p.active?'active':''}">${p.active?'Activo':'Histórico'}</span>
   </div>
   <div class="prescription-record-values">
    <div><span>Equipo</span><strong>${text(equipmentLabel(p))}</strong></div>
    <div><span>Duración</span><strong>${text(p.treatment?.durationHours??'—')} h</strong></div>
    <div><span>Ciclos</span><strong>${text(p.treatment?.cycles??'—')}</strong></div>
    <div><span>Volumen/ciclo</span><strong>${text(p.treatment?.cycleVolume??'—')} mL</strong></div>
    <div><span>Solución</span><strong>${text(solutionLabel(p))}</strong></div>
    <div><span>Aditivos</span><strong>${text(additives.join(', ')||'Ninguno')}</strong></div>
   </div>
   ${p.notes?`<p class="mode-note">${text(p.notes)}</p>`:''}
  </article>`;
 }).join('');
}

function renderPrescriptionPanels(){
 if(!$('screen-prescriptions'))return;
 renderManualPrescriptionPanel();
 renderMixedPrescriptionPanel();
 renderAPDPrescriptionHistory();
}

function renderAPDProgramPreview(){
 const target=$('apdSelectedProgramPreview');
 const select=$('apdProgramSelect');
 if(!target||!select)return;
 const prescription=apdPrescriptions().find(p=>p.id===select.value);
 if(!prescription){
  target.className='apd-program-preview empty';
  target.textContent='Seleccioná una prescripción APD activa.';
  return;
 }
 target.className='apd-program-preview';
 target.innerHTML=`
  <h4>${text(prescriptionName(prescription))}</h4>
  <div class="apd-program-preview-grid">
   <div><span>Equipo</span><strong>${text(equipmentLabel(prescription))}</strong></div>
   <div><span>Duración</span><strong>${text(prescription.treatment?.durationHours??'—')} h</strong></div>
   <div><span>Ciclos</span><strong>${text(prescription.treatment?.cycles??'—')}</strong></div>
   <div><span>Volumen/ciclo</span><strong>${text(prescription.treatment?.cycleVolume??'—')} mL</strong></div>
   <div><span>Último llenado</span><strong>${prescription.treatment?.lastFill?text(prescription.treatment.lastFillVolume)+' mL':'No'}</strong></div>
   <div><span>Solución</span><strong>${text(solutionLabel(prescription))}</strong></div>
  </div>`;
}

function startAPDTreatment(){
 if(!treatmentModeAllowsAPD()){
  showToast('Seleccioná Cicladora (APD) o Mixto en Ajustes.','error');
  return;
 }
 if(activeAPDTreatment()){
  showToast('Ya hay un tratamiento APD en curso.','error');
  return;
 }
 const prescription=apdPrescriptions().find(p=>p.id===value('apdProgramSelect'));
 if(!prescription){
  showToast('Seleccioná un programa APD activo.','error');
  return;
 }
 const startTime=value('apdStartTime');
 if(!startTime){
  showToast('Ingresá la hora de inicio.','error');
  return;
 }
 const record={
  id:uid('apd'),
  type:'apd',
  prescriptionId:prescription.id,
  prescriptionSnapshot:clone(prescription),
  programName:prescriptionName(prescription),
  status:'active',
  startTime,
  endTime:null,
  totalUf:null,
  weight:null,
  sys:null,
  dia:null,
  temp:null,
  urine:null,
  notes:'',
  source:'manual-entry',
  future:{alarms:[],events:[],import:null},
  createdAt:new Date().toISOString(),
  updatedAt:new Date().toISOString()
 };
 apdTreatments().push(record);
 editingAPDTreatmentId=null;
 clearAPDResultFields();
 persist();
 renderAll();
 showScreen('apd-treatment');
 showToast('Tratamiento APD iniciado.','success');
}

function finishAPDTreatment(){
 const editingRecord=editingAPDTreatmentId?findAPDTreatment(editingAPDTreatmentId):null;
 const editing=!!(editingRecord&&editingRecord.status==='completed');
 const record=editing?editingRecord:activeAPDTreatment();
 if(!record){
  showToast('No hay un tratamiento APD en curso.','error');
  return;
 }
 const endTime=value('apdEndTime');
 const totalUf=optionalNumber('apdTotalUf');
 const startTime=editing?value('apdEditStartTime'):record.startTime;
 if(editing&&!startTime){
  showToast('Ingresá la hora de inicio.','error');
  $('apdEditStartTime')?.focus();
  return;
 }
 if(!endTime){
  showToast('Ingresá la hora de finalización.','error');
  $('apdEndTime')?.focus();
  return;
 }
 if(new Date(endTime)<new Date(startTime)){
  showToast('La finalización no puede ser anterior al inicio.','error');
  $('apdEndTime')?.focus();
  return;
 }
 if(totalUf===null){
  showToast('Ingresá el ultrafiltrado total informado por la cicladora.','error');
  $('apdTotalUf')?.focus();
  return;
 }
 if(editing)record.startTime=startTime;
 record.status='completed';
 record.endTime=endTime;
 record.totalUf=totalUf;
 record.weight=optionalNumber('apdWeight');
 record.sys=optionalNumber('apdSys');
 record.dia=optionalNumber('apdDia');
 record.temp=optionalNumber('apdTemp');
 record.urine=optionalNumber('apdUrine');
 record.notes=value('apdNotes');
 let needsLastFillDrain=false;
 if(!editing){
  needsLastFillDrain=currentMode()==='mixed'&&hasAPDLastFill(record);
  record.lastFillDrain=needsLastFillDrain
   ? {
      required:true,
      status:'pending',
      linkedTreatmentId:record.id,
      expectedVolume:APDLastFillVolume(record),
      drainTime:null,
      emptyDrain:null,
      fullDrain:null,
      drained:null,
      balance:null,
      appearance:'',
      notes:'',
      completedAt:null
     }
   : {required:false,status:'not-required',linkedTreatmentId:record.id};
  record.cavityFluidPresent=needsLastFillDrain;
 }
 record.updatedAt=new Date().toISOString();
 editingAPDTreatmentId=null;
 persist();
 renderAll();
 showScreen('history');
 $('historyDate').value=dateKey(record.startTime);
 renderHistory();
 showToast(editing?'Cambios del tratamiento APD guardados.':(needsLastFillDrain?'Tratamiento APD finalizado. Quedó pendiente drenar el último llenado.':'Tratamiento APD finalizado y guardado.'),'success');
}

function calculateAPDLastFillDrain(){
 const record=apdTreatments().find(item=>item.id===activeLastFillDrainTreatmentId)||pendingAPDLastFillDrain();
 const expected=Number(record?.lastFillDrain?.expectedVolume);
 const empty=optionalNumber('apdLastFillEmptyDrain');
 const full=optionalNumber('apdLastFillFullDrain');
 const drained=empty!==null&&full!==null?full-empty:null;
 const balance=drained!==null&&Number.isFinite(expected)?expected-drained:null;
 const drainedEl=$('apdLastFillDrained');
 const balanceEl=$('apdLastFillBalance');
 if(drainedEl)drainedEl.textContent=drained===null?'—':`${Math.round(drained)} mL`;
 if(balanceEl){
  balanceEl.textContent=balance===null?'—':`${balance>0?'+':''}${Math.round(balance)} mL`;
  balanceEl.className=balance===null?'':balanceClass(balance);
 }
}

function closeAPDLastFillDrain(){
 const modal=$('apdLastFillDrainModal');
 if(modal)modal.classList.add('hidden');
 document.body.style.overflow='';
 activeLastFillDrainTreatmentId=null;
}

function openAPDLastFillDrain(treatmentId=null){
 const record=treatmentId
  ? apdTreatments().find(item=>item.id===treatmentId&&item.lastFillDrain?.status==='pending')
  : pendingAPDLastFillDrain();
 if(!record){
  showToast('No hay un drenaje de último llenado APD pendiente.','error');
  return;
 }
 activeLastFillDrainTreatmentId=record.id;
 const drain=record.lastFillDrain;
 if($('apdLastFillProgram'))$('apdLastFillProgram').textContent=record.programName||'Tratamiento APD';
 if($('apdLastFillExpected'))$('apdLastFillExpected').textContent=drain.expectedVolume!=null?`${drain.expectedVolume} mL`:'—';
 if($('apdLastFillDrainTime'))$('apdLastFillDrainTime').value=drain.drainTime?String(drain.drainTime).slice(0,16):localDT(new Date());
 if($('apdLastFillEmptyDrain'))$('apdLastFillEmptyDrain').value=drain.emptyDrain??'';
 if($('apdLastFillFullDrain'))$('apdLastFillFullDrain').value=drain.fullDrain??'';
 if($('apdLastFillAppearance'))$('apdLastFillAppearance').value=drain.appearance||'Claro';
 if($('apdLastFillNotes'))$('apdLastFillNotes').value=drain.notes||'';
 calculateAPDLastFillDrain();
 $('apdLastFillDrainModal')?.classList.remove('hidden');
 document.body.style.overflow='hidden';
 window.GuillePDI18n?.apply?.();
}

function saveAPDLastFillDrain(){
 const record=apdTreatments().find(item=>item.id===activeLastFillDrainTreatmentId);
 if(!record||record.lastFillDrain?.status!=='pending'){
  showToast('No se encontró el drenaje pendiente.','error');
  return;
 }
 const drainTime=value('apdLastFillDrainTime');
 const empty=optionalNumber('apdLastFillEmptyDrain');
 const full=optionalNumber('apdLastFillFullDrain');
 if(!drainTime||empty===null||full===null){
  showToast('Completá la fecha y los pesos de la bolsa de drenaje.','error');
  return;
 }
 if(full<empty){
  showToast('El peso de la bolsa llena no puede ser menor que el de la bolsa vacía.','error');
  return;
 }
 const drained=Math.round(full-empty);
 const expected=Number(record.lastFillDrain.expectedVolume);
 record.lastFillDrain={
  ...record.lastFillDrain,
  status:'completed',
  drainTime,
  emptyDrain:empty,
  fullDrain:full,
  drained,
  balance:Number.isFinite(expected)?Math.round(expected-drained):null,
  appearance:value('apdLastFillAppearance')||'Claro',
  notes:value('apdLastFillNotes'),
  completedAt:new Date().toISOString()
 };
 record.cavityFluidPresent=false;
 record.updatedAt=new Date().toISOString();
 persist();
 closeAPDLastFillDrain();
 renderAll();
 showToast('Drenaje del último llenado APD guardado. Ya podés iniciar un nuevo intercambio manual.','success');
}

function editAPDTreatment(id){
 const record=findAPDTreatment(id);
 if(!record||record.status!=='completed'){
  showToast('Solo se pueden editar tratamientos APD finalizados.','error');
  return;
 }
 editingAPDTreatmentId=record.id;
 showScreen('apd-treatment');
 renderAPDTreatmentScreen();
 window.scrollTo({top:0,behavior:'smooth'});
}

function cancelAPDTreatmentEdit(){
 editingAPDTreatmentId=null;
 clearAPDResultFields();
 showScreen('history');
 renderHistory();
}

function deleteAPDTreatment(id){
 const record=findAPDTreatment(id);
 if(!record)return;
 const description=record.status==='active'?'tratamiento APD en curso':'tratamiento APD finalizado';
 const pendingWarning=record.lastFillDrain?.status==='pending'?' También se eliminará el drenaje pendiente del último llenado.':'';
 if(!confirm(`¿Eliminar este ${description}?${pendingWarning}`))return;
 data.apdTreatments=data.apdTreatments.filter(item=>String(item.id)!==String(record.id));
 if(String(editingAPDTreatmentId)===String(record.id))editingAPDTreatmentId=null;
 persist();
 renderAll();
 renderHistory();
 showToast('Registro APD eliminado.','success');
}

function renderAPDTodayList(){
 const target=$('apdTodayList');
 if(!target)return;
 const today=dateKey(new Date());
 const list=apdTreatments()
  .filter(record=>dateKey(record.startTime)===today)
  .sort((a,b)=>new Date(b.startTime)-new Date(a.startTime));
 if(!list.length){
  target.innerHTML='<div class="prescription-empty">No hay tratamientos APD registrados hoy.</div>';
  return;
 }
 target.innerHTML=list.map(record=>{
  const completed=record.status==='completed';
  const treatment=record.prescriptionSnapshot?.treatment||{};
  const pressure=record.sys!=null||record.dia!=null?`${record.sys??'—'} / ${record.dia??'—'} mmHg`:'—';
  const lastFill=treatment.lastFill
   ? `${treatment.lastFillVolume??'—'} mL`
   : 'No';
  const pendingLastFill=record.lastFillDrain?.status==='pending';
  return `<article class="apd-mini-record apd-day-record-detail">
   <div class="apd-mini-record-head">
    <div>
     <h4>${text(record.programName||'Tratamiento APD')}</h4>
     <p>${fmtDate(record.startTime)} · ${fmtTime(record.startTime)}${record.endTime?' – '+fmtTime(record.endTime):' · En curso'}</p>
    </div>
    <span class="program-status ${completed?'active':''}">${completed?'Finalizado':'Activo'}</span>
   </div>
   <div class="apd-day-record-values">
    <div><span>UF total</span><strong>${record.totalUf!=null?text(record.totalUf)+' mL':'Pendiente'}</strong></div>
    <div><span>Duración indicada</span><strong>${treatment.durationHours!=null?text(treatment.durationHours)+' h':'—'}</strong></div>
    <div><span>Ciclos</span><strong>${treatment.cycles!=null?text(treatment.cycles):'—'}</strong></div>
    <div><span>Volumen por ciclo</span><strong>${treatment.cycleVolume!=null?text(treatment.cycleVolume)+' mL':'—'}</strong></div>
    <div><span>Último llenado</span><strong>${text(lastFill)}</strong></div>
    <div><span>Peso</span><strong>${record.weight!=null?text(record.weight)+' kg':'—'}</strong></div>
    <div><span>Presión arterial</span><strong>${text(pressure)}</strong></div>
    <div><span>Temperatura</span><strong>${record.temp!=null?text(record.temp)+' °C':'—'}</strong></div>
    <div><span>Diuresis</span><strong>${record.urine!=null?text(record.urine)+' mL':'—'}</strong></div>
   </div>
   ${pendingLastFill?'<div class="apd-day-last-fill-warning">Drenaje pendiente del último llenado APD</div>':''}
   ${record.notes?`<div class="apd-card-notes">${text(record.notes)}</div>`:''}
   <div class="apd-history-actions no-print">
    ${completed
      ? `<button class="btn btn-secondary" onclick="editAPDTreatment('${text(record.id)}')">Editar</button>`
      : '<button class="btn btn-secondary" onclick="openAPDTreatment()">Completar tratamiento</button>'}
    <button class="btn btn-danger" onclick="deleteAPDTreatment('${text(record.id)}')">Eliminar</button>
   </div>
  </article>`;
 }).join('');
}

function renderAPDTreatmentScreen(){
 if(!$('screen-apd-treatment'))return;
 ensurePatientExtensions();
 const allowed=treatmentModeAllowsAPD();
 const notice=$('apdModeBlocked');
 const startCard=$('apdStartCard');
 const finishCard=$('apdFinishCard');
 const current=activeAPDTreatment();
 const editing=editingAPDTreatmentId?findAPDTreatment(editingAPDTreatmentId):null;
 if(notice)notice.classList.toggle('hidden',allowed);

 if(!allowed){
  if(startCard)startCard.classList.add('hidden');
  if(finishCard)finishCard.classList.add('hidden');
  renderAPDTodayList();
  return;
 }

 if(editing&&editing.status==='completed'){
  if(startCard)startCard.classList.add('hidden');
  if(finishCard)finishCard.classList.remove('hidden');
  if($('apdFinishBannerLabel'))$('apdFinishBannerLabel').textContent='Editando tratamiento APD finalizado';
  if($('apdActiveProgramName'))$('apdActiveProgramName').textContent=editing.programName||'Tratamiento APD';
  if($('apdActiveTiming'))$('apdActiveTiming').textContent=`Registrado: ${fmtDate(editing.startTime)} · ${fmtTime(editing.startTime)} a ${fmtTime(editing.endTime)}`;
  if($('apdFinishEyebrow'))$('apdFinishEyebrow').textContent='Edición';
  if($('apdFinishHeading'))$('apdFinishHeading').textContent='Modificar tratamiento finalizado';
  if($('apdFinishHelp'))$('apdFinishHelp').textContent='Corregí los datos registrados. La prescripción médica y el drenaje del último llenado se conservarán.';
  $('apdEditStartTimeWrap')?.classList.remove('hidden');
  $('apdCancelEditBtn')?.classList.remove('hidden');
  if($('apdFinishPrimaryBtn'))$('apdFinishPrimaryBtn').textContent='Guardar cambios';
  setAPDResultFields(editing,true);
 }else if(current){
  if(startCard)startCard.classList.add('hidden');
  if(finishCard)finishCard.classList.remove('hidden');
  if($('apdFinishBannerLabel'))$('apdFinishBannerLabel').textContent='Tratamiento APD en curso';
  if($('apdFinishEyebrow'))$('apdFinishEyebrow').textContent='Finalización';
  if($('apdFinishHeading'))$('apdFinishHeading').textContent='Completar tratamiento';
  if($('apdFinishHelp'))$('apdFinishHelp').textContent='Registrá solamente los resultados finales informados por la cicladora.';
  $('apdEditStartTimeWrap')?.classList.add('hidden');
  $('apdCancelEditBtn')?.classList.add('hidden');
  if($('apdFinishPrimaryBtn'))$('apdFinishPrimaryBtn').textContent='Guardar y finalizar tratamiento';
  const title=$('apdActiveProgramName');
  const timing=$('apdActiveTiming');
  if(title)title.textContent=current.programName||'Tratamiento APD';
  if(timing)timing.textContent=`Inicio: ${fmtDate(current.startTime)} · ${fmtTime(current.startTime)}`;
  if($('apdEndTime')&&!$('apdEndTime').value)$('apdEndTime').value=localDT(new Date());
 }else{
  if(finishCard)finishCard.classList.add('hidden');
  if(startCard)startCard.classList.remove('hidden');
  $('apdEditStartTimeWrap')?.classList.add('hidden');
  $('apdCancelEditBtn')?.classList.add('hidden');
  if($('apdFinishPrimaryBtn'))$('apdFinishPrimaryBtn').textContent='Guardar y finalizar tratamiento';
  const select=$('apdProgramSelect');
  const active=activeAPDPrescriptions();
  if(select){
   const prior=select.value;
   select.innerHTML=active.length
    ? active.map(p=>`<option value="${text(p.id)}">${text(prescriptionName(p))}</option>`).join('')
    : '<option value="">Sin prescripción APD activa</option>';
   if(active.some(p=>p.id===prior))select.value=prior;
  }
  if($('apdStartTime')&&!$('apdStartTime').value)$('apdStartTime').value=localDT(new Date());
  renderAPDProgramPreview();
 }
 renderAPDTodayList();
}

function renderAPDHistoryCards(records){
 if(!records||!records.length)return '';
 return [...records]
  .sort((a,b)=>new Date(b.startTime)-new Date(a.startTime))
  .map(record=>{
   const completed=record.status==='completed';
   const pressure=record.sys!=null||record.dia!=null
    ? `${record.sys??'—'} / ${record.dia??'—'} mmHg`
    : '—';
   const lastFill=record.lastFillDrain;
   const lastFillBlock=lastFill?.required===true
    ? lastFill.status==='completed'
      ? `<div class="apd-last-fill-history complete">
          <div><span>Último llenado APD</span><strong>Drenaje completado</strong></div>
          <div><span>Hora</span><strong>${lastFill.drainTime?fmtTime(lastFill.drainTime):'—'}</strong></div>
          <div><span>Volumen drenado</span><strong>${lastFill.drained!=null?text(lastFill.drained)+' mL':'—'}</strong></div>
          <div><span>Balance</span><strong class="${balanceClass(lastFill.balance)}">${lastFill.balance!=null?balanceText(lastFill.balance):'—'}</strong></div>
         </div>`
      : `<div class="apd-last-fill-history pending">
          <div><span>Último llenado APD</span><strong>Drenaje pendiente</strong></div>
          <div><span>Volumen en cavidad</span><strong>${lastFill.expectedVolume!=null?text(lastFill.expectedVolume)+' mL':'—'}</strong></div>
          <button class="btn btn-primary" type="button" onclick="openAPDLastFillDrain('${text(record.id)}')">Drenar último llenado APD</button>
         </div>`
    : '';
   return `<article class="clinical-apd-card ${completed?'':'is-active'}">
    <div class="apd-card-head">
     <div>
      <span>Tratamiento APD</span>
      <strong>${text(record.programName||'Programa APD')}</strong>
     </div>
     <span class="apd-card-status ${completed?'':'pending'}">${completed?'Finalizado':'En curso'}</span>
    </div>
    <div class="apd-time-line">
     <div><span>Inicio</span><b>${fmtTime(record.startTime)}</b></div>
     <div class="apd-time-arrow">→</div>
     <div><span>Finalización</span><b>${completed&&record.endTime?fmtTime(record.endTime):'Pendiente'}</b></div>
    </div>
    <div class="apd-card-values">
     <div><span>UF total</span><strong>${record.totalUf!=null?text(record.totalUf)+' mL':'Pendiente'}</strong></div>
     <div><span>Peso</span><strong>${record.weight!=null?text(record.weight)+' kg':'—'}</strong></div>
     <div><span>Presión arterial</span><strong>${text(pressure)}</strong></div>
     <div><span>Temperatura</span><strong>${record.temp!=null?text(record.temp)+' °C':'—'}</strong></div>
     <div><span>Diuresis</span><strong>${record.urine!=null?text(record.urine)+' mL':'—'}</strong></div>
     <div><span>Prescripción</span><strong>${text(record.prescriptionSnapshot?.number?'N.º '+record.prescriptionSnapshot.number:'Guardada')}</strong></div>
    </div>
    ${lastFillBlock}
    ${record.notes?`<div class="apd-card-notes">${text(record.notes)}</div>`:''}
    <div class="apd-history-actions no-print">
     ${completed
       ? `<button class="btn btn-secondary" onclick="editAPDTreatment('${text(record.id)}')">Editar</button>`
       : `<button class="btn btn-secondary" onclick="openAPDTreatment()">Completar tratamiento</button>`}
     <button class="btn btn-danger" onclick="deleteAPDTreatment('${text(record.id)}')">Eliminar</button>
    </div>
   </article>`;
  }).join('');
}

function updateAPDHome(){
 const mode=currentMode();
 const pendingLastFill=mode==='mixed'?pendingAPDLastFillDrain():null;
 const manualButton=$('manualNewWashBtn');
 const apdButton=$('apdHomeButton');
 const actions=$('homeTreatmentActions');
 const manualMetrics=$('manualHomeMetrics');
 const manualProgress=$('manualHomeProgress');
 const manualLatest=$('manualLatestCard');
 const apdCard=$('apdHomeCard');
 const manualAllowed=mode!=='apd';
 const apdAllowed=mode!=='manual';

 if(manualButton)manualButton.classList.toggle('hidden',!manualAllowed);
 if(apdButton)apdButton.classList.toggle('hidden',!apdAllowed);
 if(actions)actions.classList.toggle('two-actions',manualAllowed&&apdAllowed);
 if(manualMetrics)manualMetrics.classList.toggle('hidden',!manualAllowed);
 if(manualProgress)manualProgress.classList.toggle('hidden',!manualAllowed);
 if(manualLatest)manualLatest.classList.toggle('hidden',!manualAllowed);
 if(apdCard)apdCard.classList.toggle('hidden',!apdAllowed);
 if(manualButton){
  const label=manualButton.querySelectorAll('span')[1];
  if(label)label.textContent=pendingLastFill?'Drenar último llenado APD':'Nuevo intercambio';
  manualButton.classList.toggle('apd-last-fill-action',!!pendingLastFill);
 }

 if(!apdAllowed)return;
 const today=dateKey(new Date());
 const todayRecords=apdTreatments().filter(record=>dateKey(record.startTime)===today);
 const current=activeAPDTreatment();
 const completed=todayRecords.filter(record=>record.status==='completed');
 const latest=[...completed].sort((a,b)=>new Date(b.endTime)-new Date(a.endTime))[0];
 const badge=$('apdHomeBadge');
 const title=$('apdHomeTitle');
 const subtitle=$('apdHomeSubtitle');
 if(current){
  if(badge){badge.textContent='En curso';badge.className='apd-home-badge pending'}
  if(title)title.textContent=current.programName||'Tratamiento APD';
  if(subtitle)subtitle.textContent=`Iniciado a las ${fmtTime(current.startTime)}.`;
 }else if(latest){
  if(badge){badge.textContent='Finalizado';badge.className='apd-home-badge'}
  if(title)title.textContent=latest.programName||'Tratamiento APD';
  if(subtitle)subtitle.textContent=pendingLastFill
   ? 'El último llenado permanece en cavidad y debe drenarse antes de iniciar otro intercambio manual.'
   : `Último tratamiento finalizado a las ${fmtTime(latest.endTime)}.`;
 }else{
  if(badge){badge.textContent='Sin registro';badge.className='apd-home-badge'}
  if(title)title.textContent='Tratamiento APD';
  if(subtitle)subtitle.textContent='No hay tratamientos APD registrados hoy.';
 }
 const count=$('apdHomeCount');
 const uf=$('apdHomeUf');
 const program=$('apdHomeProgram');
 if(count)count.textContent=String(todayRecords.length);
 if(uf)uf.textContent=latest&&latest.totalUf!=null?`${latest.totalUf} mL`:'—';
 if(program)program.textContent=current?.programName||latest?.programName||activeAPDPrescriptions()[0]?.name||'—';

 if(mode==='apd'||(mode==='mixed'&&current&&!getPendingWash())){
  const stateTitle=$('heroStateTitle');
  const stateText=$('heroStateText');
  const countdownLabel=$('countdownLabel');
  const countdown=$('countdown');
  const countdownSub=$('countdownSub');
  if(pendingLastFill){
   if(stateTitle)stateTitle.textContent='Drenaje pendiente del último llenado APD';
   if(stateText)stateText.textContent='Drená el líquido dejado por la cicladora antes de iniciar un intercambio manual.';
   if(countdownLabel)countdownLabel.textContent='Estado actual';
   if(countdown)countdown.textContent='DRENAR';
   if(countdownSub)countdownSub.textContent=`${pendingLastFill.lastFillDrain.expectedVolume??'—'} mL en cavidad`;
  }else if(current){
   if(stateTitle)stateTitle.textContent='Tratamiento APD en curso';
   if(stateText)stateText.textContent=`${current.programName||'Programa APD'} iniciado a las ${fmtTime(current.startTime)}.`;
   if(countdownLabel)countdownLabel.textContent='Estado del tratamiento';
   if(countdown)countdown.textContent='EN CURSO';
   if(countdownSub)countdownSub.textContent='Completá los datos al finalizar';
  }else{
   if(stateTitle)stateTitle.textContent=todayRecords.length?'Tratamiento APD finalizado':'Sin tratamiento APD activo';
   if(stateText)stateText.textContent=todayRecords.length?'El registro APD de hoy está completo.':'Podés iniciar el tratamiento cuando corresponda.';
   if(countdownLabel)countdownLabel.textContent='Modalidad';
   if(countdown)countdown.textContent='APD';
   if(countdownSub)countdownSub.textContent='Cicladora';
  }
 }
}

function openAPDTreatment(){
 editingAPDTreatmentId=null;
 renderAPDTreatmentScreen();
 showScreen('apd-treatment');
}

const coreRenderHome=renderHome;
renderHome=function(){
 coreRenderHome();
 ensurePatientExtensions();
 updateAPDHome();
};

const coreShowScreen=showScreen;
showScreen=function(name,button){
 if(name!=='apd-treatment')editingAPDTreatmentId=null;
 const moduleNames=['prescriptions','apd-treatment'];
 document.querySelectorAll('.module-screen-host').forEach(screen=>screen.classList.add('hidden'));
 if(moduleNames.includes(name)){
  ['home','history','summary','settings'].forEach(existing=>{
   const screen=$('screen-'+existing);
   if(screen)screen.classList.add('hidden');
  });
  document.querySelectorAll('.navbtn').forEach(item=>item.classList.remove('active'));
  const target=$('screen-'+name);
  if(target)target.classList.remove('hidden');
  if(name==='prescriptions')renderPrescriptionPanels();
  if(name==='apd-treatment')renderAPDTreatmentScreen();
  window.scrollTo({top:0,behavior:'smooth'});
  return;
 }
 coreShowScreen(name,button);
};

const coreRenderAll=renderAll;
renderAll=function(){
 ensureAllPatientExtensions();
 coreRenderAll();
 renderTreatmentModeUI();
 renderPrescriptionPanels();
 renderAPDTreatmentScreen();
 updateAPDHome();
};

window.changeTreatmentMode=changeTreatmentMode;
window.openPrescriptions=openPrescriptions;
window.showPrescriptionTab=showPrescriptionTab;
window.toggleAPDFields=toggleAPDFields;
window.saveAPDPrescription=saveAPDPrescription;
window.clearAPDPrescriptionForm=clearAPDPrescriptionForm;
window.renderAPDProgramPreview=renderAPDProgramPreview;
window.openAPDTreatment=openAPDTreatment;
window.startAPDTreatment=startAPDTreatment;
window.finishAPDTreatment=finishAPDTreatment;
window.editAPDTreatment=editAPDTreatment;
window.cancelAPDTreatmentEdit=cancelAPDTreatmentEdit;
window.deleteAPDTreatment=deleteAPDTreatment;
window.renderAPDHistoryCards=renderAPDHistoryCards;
window.getPendingAPDLastFillDrain=pendingAPDLastFillDrain;
window.openAPDLastFillDrain=openAPDLastFillDrain;
window.closeAPDLastFillDrain=closeAPDLastFillDrain;
window.calculateAPDLastFillDrain=calculateAPDLastFillDrain;
window.saveAPDLastFillDrain=saveAPDLastFillDrain;

const coreOpenWashModal=window.openWashModal;
window.openWashModal=function(){
 const pending=pendingAPDLastFillDrain();
 if(pending){
  openAPDLastFillDrain(pending.id);
  return;
 }
 coreOpenWashModal();
};

function initializeAPDModule(){
 if(apdModuleReady)return;
 apdModuleReady=true;
 const lastFillModal=$('apdLastFillDrainModal');
 lastFillModal?.addEventListener('click',event=>{
  if(event.target===lastFillModal)closeAPDLastFillDrain();
 });
 const changed=ensureAllPatientExtensions();
 clearAPDPrescriptionForm();
 renderAll();
 if(changed)persist();
}

if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',initializeAPDModule);
}else{
 initializeAPDModule();
}
})();
