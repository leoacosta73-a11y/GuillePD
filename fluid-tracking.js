(function(){
 'use strict';

 let editingId=null;

 function tr(key,fallback){
  const translated=window.GuillePDI18n?.t?.(key);
  return translated&&translated!==key?translated:fallback;
 }
 function escapeHtml(value){
  return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
 }
 function localDateKey(value){
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))return '';
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,'0');
  const day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
 }
 function localDateTime(date=new Date()){
  const offset=date.getTimezoneOffset();
  return new Date(date.getTime()-offset*60000).toISOString().slice(0,16);
 }
 function number(value){
  const parsed=Number(String(value??'').replace(',','.'));
  return Number.isFinite(parsed)?parsed:0;
 }
 function entries(){
  if(typeof data==='undefined'||!data)return [];
  if(!Array.isArray(data.fluidEntries))data.fluidEntries=[];
  return data.fluidEntries;
 }
 function entryDate(){
  const input=document.getElementById('fluidEntryDateTime');
  return localDateKey(input?.value||new Date());
 }
 function selectedType(){
  return document.querySelector('input[name="fluidEntryType"]:checked')?.value||'intake';
 }
 function beverageLabel(value){
  const labels={
   water:['fluid.beverage.water','Agua'],juice:['fluid.beverage.juice','Jugo'],
   milk:['fluid.beverage.milk','Leche'],infusion:['fluid.beverage.infusion','Infusión'],
   other:['fluid.beverage.other','Otro líquido']
  };
  const item=labels[value]||labels.other;
  return tr(item[0],item[1]);
 }
 function typeLabel(type,beverage){
  if(type==='urine')return tr('fluid.type.urine','Orina');
  return beverageLabel(beverage);
 }
 function patientAPDTreatments(){
  return typeof data!=='undefined'&&Array.isArray(data?.apdTreatments)?data.apdTreatments:[];
 }
 function computeDailyBalance(day=localDateKey(new Date())){
  const dayEntries=entries().filter(item=>localDateKey(item.datetime)===day);
  const intake=Math.round(dayEntries.filter(item=>item.type==='intake').reduce((sum,item)=>sum+number(item.amount),0));
  const urine=Math.round(dayEntries.filter(item=>item.type==='urine').reduce((sum,item)=>sum+number(item.amount),0));
  const washes=(typeof data!=='undefined'&&Array.isArray(data?.washes)?data.washes:[]).filter(wash=>localDateKey(wash.datetime)===day);
  const infused=Math.round(washes.reduce((sum,wash)=>sum+number(wash.actualIn),0));
  const drained=Math.round(washes.reduce((sum,wash)=>sum+number(wash.drained),0));
  const apdUf=Math.round(patientAPDTreatments()
   .filter(record=>record.status==='completed'&&localDateKey(record.startTime)===day)
   .reduce((sum,record)=>sum+number(record.totalUf),0));
  const oralBalance=Math.round(intake-urine);
  const total=Math.round(intake+infused-urine-drained-apdUf);
  return {day,intake,urine,oralBalance,infused,drained,apdUf,total,entries:dayEntries};
 }
 function signed(value){return `${value>0?'+':''}${Math.round(value)} mL`}
 function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value}

 function renderHome(){
  if(!document.getElementById('fluidBalanceCard'))return;
  const totals=computeDailyBalance();
  setText('fluidTodayIntake',`${totals.intake} mL`);
  setText('fluidTodayUrine',`${totals.urine} mL`);
  setText('fluidTodayInfused',`${totals.infused} mL`);
  setText('fluidTodayDrained',`${totals.drained} mL`);
  setText('fluidTodayApdUf',`${totals.apdUf} mL`);
  setText('fluidTodayOralBalance',signed(totals.oralBalance));
  setText('fluidTodayBalance',signed(totals.total));
  const apdItem=document.getElementById('fluidApdUfItem');
  if(apdItem)apdItem.classList.toggle('hidden',totals.apdUf===0);
 }
 function renderEntryList(){
  const target=document.getElementById('fluidEntryList');
  if(!target)return;
  const day=entryDate()||localDateKey(new Date());
  const list=entries().filter(item=>localDateKey(item.datetime)===day).sort((a,b)=>new Date(b.datetime)-new Date(a.datetime));
  const totals=computeDailyBalance(day);
  setText('fluidListDateSummary',`${totals.intake} mL / ${totals.urine} mL`);
  setText('fluidSelectedOralBalance',signed(totals.oralBalance));
  setText('fluidSelectedTotalBalance',signed(totals.total));
  if(!list.length){
   target.innerHTML=`<div class="fluid-entry-empty">${escapeHtml(tr('fluid.list.empty','No hay ingresos de líquidos ni orina registrados para este día.'))}</div>`;
   return;
  }
  const locale=window.GuillePDI18n?.locale?.()||'es-AR';
  target.innerHTML=list.map(item=>{
   const time=new Date(item.datetime).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'});
   const note=item.note?` · ${escapeHtml(item.note)}`:'';
   return `<article class="fluid-entry-row">
    <div class="fluid-entry-main"><strong>${escapeHtml(typeLabel(item.type,item.beverage))} · ${Math.round(number(item.amount))} mL</strong><small>${escapeHtml(time)}${note}</small></div>
    <div class="fluid-entry-buttons">
     <button class="fluid-mini-btn" type="button" onclick="GuillePDFluids.edit('${escapeHtml(item.id)}')" aria-label="${escapeHtml(tr('fluid.action.edit','Editar'))}">✎</button>
     <button class="fluid-mini-btn delete" type="button" onclick="GuillePDFluids.remove('${escapeHtml(item.id)}')" aria-label="${escapeHtml(tr('fluid.action.delete','Eliminar'))}">×</button>
    </div>
   </article>`;
  }).join('');
 }
 function toggleFields(){
  const beverage=document.getElementById('fluidBeverageField');
  if(beverage)beverage.classList.toggle('hidden',selectedType()!=='intake');
 }
 function resetForm(){
  editingId=null;
  const intake=document.querySelector('input[name="fluidEntryType"][value="intake"]');
  if(intake)intake.checked=true;
  const dt=document.getElementById('fluidEntryDateTime');if(dt)dt.value=localDateTime();
  const beverage=document.getElementById('fluidBeverage');if(beverage)beverage.value='water';
  const amount=document.getElementById('fluidEntryAmount');if(amount)amount.value='';
  const note=document.getElementById('fluidEntryNote');if(note)note.value='';
  const saveButton=document.getElementById('fluidSaveButton');
  if(saveButton)saveButton.setAttribute('data-i18n','fluid.action.save');
  setText('fluidSaveButton',tr('fluid.action.save','Guardar registro'));
  toggleFields();
  renderEntryList();
 }
 function open(){
  resetForm();
  document.getElementById('fluidModal')?.classList.remove('hidden');
  document.body.style.overflow='hidden';
  window.GuillePDI18n?.apply?.();
 }
 function close(){
  document.getElementById('fluidModal')?.classList.add('hidden');
  document.body.style.overflow='';
 }
 function save(){
  const datetime=document.getElementById('fluidEntryDateTime')?.value;
  const amount=number(document.getElementById('fluidEntryAmount')?.value);
  if(!datetime||amount<=0){
   alert(tr('fluid.validation.required','Ingresá la fecha, la hora y una cantidad mayor que cero.'));
   return;
  }
  const current=editingId?entries().find(item=>item.id===editingId):null;
  const record={
   id:current?.id||`fluid_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
   type:selectedType(),datetime,amount:Math.round(amount),
   beverage:selectedType()==='intake'?(document.getElementById('fluidBeverage')?.value||'water'):null,
   note:String(document.getElementById('fluidEntryNote')?.value||'').trim(),
   createdAt:current?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()
  };
  if(current)Object.assign(current,record);else entries().push(record);
  if(typeof persist==='function')persist();
  if(typeof renderAll==='function')renderAll();else renderHome();
  resetForm();
  if(typeof showToast==='function')showToast(tr('fluid.saved','Registro guardado.'),'success');
 }
 function edit(id){
  const item=entries().find(entry=>String(entry.id)===String(id));
  if(!item)return;
  editingId=item.id;
  const type=document.querySelector(`input[name="fluidEntryType"][value="${item.type}"]`);if(type)type.checked=true;
  const dt=document.getElementById('fluidEntryDateTime');if(dt)dt.value=String(item.datetime).slice(0,16);
  const beverage=document.getElementById('fluidBeverage');if(beverage)beverage.value=item.beverage||'water';
  const amount=document.getElementById('fluidEntryAmount');if(amount)amount.value=item.amount;
  const note=document.getElementById('fluidEntryNote');if(note)note.value=item.note||'';
  const saveButton=document.getElementById('fluidSaveButton');
  if(saveButton)saveButton.setAttribute('data-i18n','fluid.action.update');
  setText('fluidSaveButton',tr('fluid.action.update','Actualizar registro'));
  toggleFields();
  window.GuillePDI18n?.apply?.();
 }
 function remove(id){
  if(!confirm(tr('fluid.confirm.delete','¿Eliminar este registro?')))return;
  data.fluidEntries=entries().filter(item=>String(item.id)!==String(id));
  if(typeof persist==='function')persist();
  if(typeof renderAll==='function')renderAll();else renderHome();
  renderEntryList();
 }
 function reportDateLabel(day){
  const date=new Date(`${day}T12:00:00`);
  const locale=window.GuillePDI18n?.locale?.()||'es-AR';
  return Number.isNaN(date.getTime())?day:date.toLocaleDateString(locale,{day:'2-digit',month:'long',year:'numeric'});
 }
 function makeReportBlob(day=entryDate()||localDateKey(new Date())){
  const totals=computeDailyBalance(day);
  const W=595,H=842,M=36;
  const rows=[...totals.entries].sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  const pages=[];
  if(!rows.length)pages.push([]);
  else{
   pages.push(rows.slice(0,16));
   for(let i=16;i<rows.length;i+=27)pages.push(rows.slice(i,i+27));
  }
  const objects=[];
  const add=value=>(objects.push(value),objects.length);
  const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pageIds=[],contentIds=[];
  const patient=String(data?.settings?.patient||'-');
  const locale=window.GuillePDI18n?.locale?.()||'es-AR';
  const fmt=value=>`${value>0?'+':''}${Math.round(value)} mL`;
  const pdfLabel=value=>String(value??'').replace(/[−–—]/g,'-');
  const field=(stream,x,y,w,label,value)=>{
   stream=pdfFill(stream,.95,.98,.98);stream=pdfStroke(stream,.80,.88,.89);stream=pdfRoundRect(stream,x,y,w,50,8,true,true,.6);
   stream=pdfFill(stream,.32,.42,.45);stream=pdfText(stream,x+12,y+31,pdfLabel(label),7.5,true);
   stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,x+12,y+12,value,12,true);
   return stream;
  };
  pages.forEach((pageRows,pageIndex)=>{
   let stream='';
   stream=pdfFill(stream,.04,.57,.59);stream=pdfRect(stream,0,H-88,W,88,true,false);
   stream=pdfFill(stream,1,1,1);stream=pdfText(stream,M,H-47,tr('fluid.report.title','Informe de balance hídrico'),19,true);
   stream=pdfText(stream,M,H-69,`${tr('fluid.report.patient','Paciente')}: ${patient}`,9);
   stream=pdfText(stream,390,H-69,`${tr('fluid.report.page','Página')} ${pageIndex+1}/${pages.length}`,8);
   stream=pdfFill(stream,.08,.14,.20);
   stream=pdfText(stream,M,H-116,`${tr('fluid.report.date','Fecha')}: ${reportDateLabel(day)}`,10,true);
   let tableTop;
   if(pageIndex===0){
    stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,M,H-151,pdfLabel(tr('fluid.report.oralSection','Balance ingesta - orina')),11,true);
    stream=field(stream,M,H-218,160,tr('fluid.total.intake','Líquidos ingeridos'),`${totals.intake} mL`);
    stream=field(stream,M+170,H-218,160,tr('fluid.total.urine','Orina'),`${totals.urine} mL`);
    stream=field(stream,M+340,H-218,183,tr('fluid.balance.oral','Balance ingesta − orina'),fmt(totals.oralBalance));
    stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,M,H-250,tr('fluid.report.totalSection','Balance total con diálisis'),11,true);
    stream=field(stream,M,H-317,118,tr('fluid.total.infused','Infundido'),`${totals.infused} mL`);
    stream=field(stream,M+128,H-317,118,tr('fluid.total.drained','Drenado'),`${totals.drained} mL`);
    stream=field(stream,M+256,H-317,118,tr('fluid.total.apdUf','UF APD'),`${totals.apdUf} mL`);
    stream=field(stream,M+384,H-317,139,tr('fluid.balance.total','Balance total'),fmt(totals.total));
    tableTop=H-360;
   }else tableTop=H-145;
   stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,M,tableTop,tr('fluid.report.entries','Detalle de líquidos por boca y orina'),10,true);
   const headerY=tableTop-25;
   stream=pdfFill(stream,.88,.95,.96);stream=pdfRect(stream,M,headerY,W-M*2,24,true,false);
   stream=pdfFill(stream,.08,.24,.29);
   stream=pdfText(stream,M+8,headerY+8,tr('fluid.report.time','Hora'),7.5,true);
   stream=pdfText(stream,M+70,headerY+8,tr('fluid.report.type','Tipo'),7.5,true);
   stream=pdfText(stream,M+245,headerY+8,tr('fluid.report.amount','Cantidad'),7.5,true);
   stream=pdfText(stream,M+335,headerY+8,tr('fluid.report.note','Observación'),7.5,true);
   if(!pageRows.length){
    stream=pdfFill(stream,.42,.49,.52);stream=pdfText(stream,M+8,headerY-25,tr('fluid.report.noEntries','Sin registros de líquidos por boca u orina.'),8.5);
   }else pageRows.forEach((item,index)=>{
    const y=headerY-24-(index*23);
    const time=new Date(item.datetime).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'});
    if(index%2===1){stream=pdfFill(stream,.97,.98,.98);stream=pdfRect(stream,M,y-5,W-M*2,23,true,false)}
    stream=pdfFill(stream,.12,.20,.24);
    stream=pdfText(stream,M+8,y,time,7.5);
    stream=pdfText(stream,M+70,y,shortText(typeLabel(item.type,item.beverage),30),7.5);
    stream=pdfText(stream,M+245,y,`${Math.round(number(item.amount))} mL`,7.5,true);
    stream=pdfText(stream,M+335,y,shortText(item.note||'-',29),7.5);
   });
   stream=pdfStroke(stream,.82,.88,.89);stream=pdfLine(stream,M,30,W-M,30,.5);
   stream=pdfFill(stream,.38,.46,.49);stream=pdfText(stream,M,16,tr('fluid.report.footer','Registro personal de GuillePD. Sin interpretación clínica.'),7);
   const content=add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
   const page=add('');contentIds.push(content);pageIds.push(page);
  });
  const pagesObject=add('');
  const catalog=add(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);
  pageIds.forEach((pageId,index)=>{objects[pageId-1]=`<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${font} 0 R /F2 ${bold} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`});
  objects[pagesObject-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  let pdf='%PDF-1.4\n',offsets=[0];
  objects.forEach((object,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${object}\nendobj\n`});
  const xref=pdf.length;
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const cp1252={0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,0x0153:0x9C,0x017E:0x9E,0x0178:0x9F};
  const bytes=new Uint8Array(pdf.length);
  for(let i=0;i<pdf.length;i++){const code=pdf.charCodeAt(i);bytes[i]=code<=255?code:(cp1252[code]??63)}
  return new Blob([bytes],{type:'application/pdf'});
 }
 function reportFileName(day){
  const patient=String(data?.settings?.patient||'Paciente').replace(/[^0-9A-Za-záéíóúÁÉÍÓÚñÑ]+/g,'_');
  return `GuillePD_Balance_hidrico_${patient}_${day}.pdf`;
 }
 function downloadReport(){
  const day=entryDate()||localDateKey(new Date());
  const blob=makeReportBlob(day);
  if(typeof download==='function')download(reportFileName(day),blob);
 }
 async function shareReport(){
  const day=entryDate()||localDateKey(new Date());
  const blob=makeReportBlob(day),name=reportFileName(day);
  try{
   const file=new File([blob],name,{type:'application/pdf'});
   if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
    await navigator.share({title:tr('fluid.report.title','Informe de balance hídrico'),files:[file]});
   }else downloadReport();
  }catch(error){if(error?.name!=='AbortError')downloadReport()}
 }
 function render(){renderHome();if(!document.getElementById('fluidModal')?.classList.contains('hidden'))renderEntryList()}
 function init(){
  document.querySelectorAll('input[name="fluidEntryType"]').forEach(input=>input.addEventListener('change',toggleFields));
  document.getElementById('fluidEntryDateTime')?.addEventListener('change',renderEntryList);
  render();
 }

 window.GuillePDFluids={open,close,save,edit,remove,render,renderEntryList,computeDailyBalance,resetForm,makeReportBlob,downloadReport,shareReport};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
