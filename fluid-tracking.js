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
 function isEnabled(){
  return typeof data!=='undefined'&&data?.settings?.fluidTrackingEnabled===true;
 }
 function isCompletedManualWash(wash){
  if(!wash||wash.status==='open')return false;
  const hasInfused=wash.actualIn!==null&&wash.actualIn!==undefined&&wash.actualIn!=='';
  const hasDrained=wash.drained!==null&&wash.drained!==undefined&&wash.drained!=='';
  return hasInfused&&hasDrained&&Number.isFinite(Number(wash.actualIn))&&Number.isFinite(Number(wash.drained));
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
  const washes=(typeof data!=='undefined'&&Array.isArray(data?.washes)?data.washes:[])
   .filter(wash=>localDateKey(wash.datetime)===day&&isCompletedManualWash(wash));
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
  const card=document.getElementById('fluidBalanceCard');
  if(!card)return;
  card.classList.toggle('hidden',!isEnabled());
  if(!isEnabled())return;
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
  if(!isEnabled())return;
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
 function reportLogoJpeg(){
  try{
   const source=document.querySelector('.brand-full-logo');
   if(!source||!source.complete||!source.naturalWidth||!source.naturalHeight)return null;
   const width=1251,height=519,canvas=document.createElement('canvas');
   canvas.width=width;canvas.height=height;
   const context=canvas.getContext('2d');
   if(!context)return null;
   context.fillStyle='#ffffff';context.fillRect(0,0,width,height);
   const scale=Math.min(width/source.naturalWidth,height/source.naturalHeight);
   const drawWidth=source.naturalWidth*scale,drawHeight=source.naturalHeight*scale;
   context.drawImage(source,(width-drawWidth)/2,(height-drawHeight)/2,drawWidth,drawHeight);
   const encoded=canvas.toDataURL('image/jpeg',.92).split(',')[1];
   return encoded?{binary:atob(encoded),width,height}:null;
  }catch(_error){return null}
 }
 function makeReportBlob(day=entryDate()||localDateKey(new Date())){
  const totals=computeDailyBalance(day);
  const W=842,H=595,M=20;
  const intakeRows=totals.entries.filter(item=>item.type==='intake').sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  const urineRows=totals.entries.filter(item=>item.type==='urine').sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  const longest=Math.max(intakeRows.length,urineRows.length);
  const pages=[];
  if(!longest)pages.push({intake:[],urine:[]});
  else{
   pages.push({intake:intakeRows.slice(0,7),urine:urineRows.slice(0,7)});
   for(let i=7;i<longest;i+=12)pages.push({intake:intakeRows.slice(i,i+12),urine:urineRows.slice(i,i+12)});
  }
  const objects=[];
  const add=value=>(objects.push(value),objects.length);
  const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const logo=reportLogoJpeg();
  const logoObject=logo?add(`<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.binary.length} >>\nstream\n${logo.binary}\nendstream`):null;
  const pageIds=[],contentIds=[];
  const settings=data?.settings||{};
  const patient=String(settings.patient||'-');
  const locale=window.GuillePDI18n?.locale?.()||'es-AR';
  const language=window.GuillePDI18n?.language?.()||'es';
  const fmt=value=>`${value>0?'+':''}${Math.round(value)} mL`;
  const pdfLabel=value=>String(value??'').replace(/[−–—]/g,'-');
  const idValue=`${settings.dni||'-'} / ${settings.hc||'-'}`;
  const responsible=settings.contactName||'-';
  const contactPhone=settings.contactPhone||'-';
  const center=settings.hospital||'-';
  const nephro=settings.nephrologist||'-';
  const treatmentMode=settings.treatmentMode||'manual';
  const modality=language==='en'
   ? ({manual:'Manual (CAPD)',apd:'Cycler (APD)',mixed:'Mixed (Manual + APD)'}[treatmentMode]||'Manual (CAPD)')
   : ({manual:'Manual (CAPD)',apd:'Cicladora (APD)',mixed:'Mixto (Manual + APD)'}[treatmentMode]||'Manual (CAPD)');
  const currentWeight=(()=>{
   const washes=Array.isArray(data?.washes)?data.washes:[];
   const weighted=[...washes].reverse().find(wash=>number(wash.weight)>0);
   if(weighted)return `${number(weighted.weight).toFixed(1)} kg`;
   return settings.dryWeight?`${settings.dryWeight} kg`:'-';
  })();
  const field=(stream,x,y,w,label,value)=>{
   stream=pdfFill(stream,.98,.99,1);stream=pdfStroke(stream,.78,.83,.85);stream=pdfRoundRect(stream,x,y,w,40,5,true,true,.6);
   stream=pdfFill(stream,.32,.42,.45);stream=pdfText(stream,x+10,y+25,pdfLabel(label),6.8,true);
   stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,x+10,y+9,value,10.5,true);
   return stream;
  };
  const headerBlock=stream=>{
   stream=pdfStroke(stream,.78,.83,.85);
   stream=pdfRoundRect(stream,6,6,W-12,H-12,4,false,true,.7);
   if(logoObject)stream+='q 145 0 0 60 20 521 cm /Logo Do Q\n';
   else{
    stream=pdfFill(stream,.03,.20,.45);stream=pdfText(stream,27,551,'Guille',23,true);
    stream=pdfFill(stream,.10,.66,.64);stream=pdfText(stream,91,551,'PD',23,true);
   }
   stream=pdfStroke(stream,.82,.86,.88);stream=pdfLine(stream,176,518,176,579,.7);
   const colX=[194,407,620];
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[0],568,tr('fluid.report.patient','Paciente')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[0]+44,568,shortText(patient,26),8.5);
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[0],544,tr('fluid.report.idHistory','DNI / HC')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[0]+48,544,shortText(idValue,27),8.5);
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[0],526,tr('fluid.report.responsible','Responsable')+':',7.2,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[0]+54,526,shortText(responsible,17),7.2);
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[0]+128,526,tr('fluid.report.phone','Tel.')+':',7.2,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[0]+149,526,shortText(contactPhone,14),7.2);

   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[1],568,tr('fluid.report.date','Fecha')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[1]+34,568,shortText(reportDateLabel(day),22),8);
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[1],550,tr('fluid.report.kind','Informe')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[1]+40,550,shortText(tr('fluid.report.kindValue','Balance hídrico'),24),8);
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[1],532,tr('fluid.report.weight','Peso')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[1]+32,532,currentWeight,8);

   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[2],568,tr('fluid.report.modality','Modalidad')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[2]+50,568,shortText(modality,28),7.5);
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[2],550,tr('fluid.report.center','Centro')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[2]+38,550,shortText(center,40),7.5);
   stream=pdfFill(stream,.02,.26,.35);stream=pdfText(stream,colX[2],532,tr('fluid.report.clinician','Médico')+':',8,true);
   stream=pdfFill(stream,.08,.14,.20);stream=pdfText(stream,colX[2]+40,532,shortText(nephro,28),7.5);
   stream=pdfStroke(stream,.58,.68,.72);stream=pdfLine(stream,20,517,W-20,517,.8);
   return stream;
  };
  const ledgerHeader=(stream,top)=>{
   const gap=14,sideWidth=(W-M*2-gap)/2,leftX=M,rightX=M+sideWidth+gap;
   stream=pdfFill(stream,.02,.45,.49);stream=pdfStroke(stream,.02,.38,.43);stream=pdfRoundRect(stream,leftX,top-28,sideWidth,28,3,true,true,.6);
   stream=pdfFill(stream,1,1,1);stream=pdfText(stream,leftX+10,top-18,tr('fluid.report.inflows','INGRESOS - LÍQUIDOS POR BOCA'),8.3,true);
   stream=pdfText(stream,leftX+sideWidth-83,top-18,`${totals.intake} mL`,8.3,true);
   stream=pdfFill(stream,.03,.20,.45);stream=pdfStroke(stream,.02,.16,.36);stream=pdfRoundRect(stream,rightX,top-28,sideWidth,28,3,true,true,.6);
   stream=pdfFill(stream,1,1,1);stream=pdfText(stream,rightX+10,top-18,tr('fluid.report.outflows','EGRESOS - ORINA'),8.3,true);
   stream=pdfText(stream,rightX+sideWidth-83,top-18,`${totals.urine} mL`,8.3,true);
   [leftX,rightX].forEach(x=>{
    stream=pdfFill(stream,.88,.95,.96);stream=pdfRect(stream,x,top-49,sideWidth,21,true,false);
    stream=pdfFill(stream,.08,.24,.29);
    stream=pdfText(stream,x+8,top-42,tr('fluid.report.time','Hora'),7,true);
    stream=pdfText(stream,x+63,top-42,tr('fluid.report.type','Tipo'),7,true);
    stream=pdfText(stream,x+181,top-42,tr('fluid.report.amount','Cantidad'),7,true);
    stream=pdfText(stream,x+260,top-42,tr('fluid.report.note','Observación'),7,true);
   });
   return {stream,rowTop:top-49,leftX,rightX,sideWidth};
  };
  const ledgerRow=(stream,item,index,x,width,rowTop)=>{
   const y=rowTop-index*28,bottom=y-28;
   if(index%2===1){stream=pdfFill(stream,.97,.98,.98);stream=pdfRect(stream,x,bottom,width,28,true,false)}
   stream=pdfStroke(stream,.83,.87,.89);stream=pdfLine(stream,x,bottom,x+width,bottom,.4);
   stream=pdfFill(stream,.12,.20,.24);
   if(!item){
    if(index===0)stream=pdfText(stream,x+8,y-18,tr('fluid.report.noSideEntries','Sin registros.'),7.5);
    return stream;
   }
   const time=new Date(item.datetime).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'});
   stream=pdfText(stream,x+8,y-18,time,7.5);
   stream=pdfText(stream,x+63,y-18,shortText(typeLabel(item.type,item.beverage),18),7.5);
   stream=pdfText(stream,x+181,y-18,`${Math.round(number(item.amount))} mL`,8,true);
   stream=pdfText(stream,x+260,y-18,shortText(item.note||'-',21),7.2);
   return stream;
  };
  const footer=(stream,pageIndex)=>{
   stream=pdfFill(stream,.06,.12,.24);stream=pdfText(stream,740,60,`${tr('fluid.report.page','Página')} ${pageIndex+1} ${tr('fluid.report.of','de')} ${pages.length}`,7);
   stream=pdfStroke(stream,.10,.66,.64);
   stream+='1.5 w 272 34 m 264 42 252 37 252 28 c 252 18 272 10 272 10 c 272 10 292 18 292 28 c 292 37 280 42 272 34 c S\n';
   stream+='1.0 w 267 30 m 263 31 261 28 262 25 c S\n';
   stream+='1.0 w 277 30 m 281 31 283 28 282 25 c S\n';
   stream+='1.2 w 272 24 m 270 20 270 17 272 15 c 274 17 274 20 272 24 c S\n';
   stream=pdfFill(stream,.03,.20,.45);stream=pdfText(stream,310,26,tr('fluid.report.footerLead','Cada registro ayuda a '),11,true);
   stream=pdfFill(stream,.10,.66,.64);stream=pdfText(stream,447,26,tr('fluid.report.footerEnd','cuidar un riñón.'),11,true);
   stream=pdfStroke(stream,.10,.66,.64);
   stream+='1.2 w 570 29 m 566 33 561 30 561 26 c 561 21 570 16 570 16 c 570 16 579 21 579 26 c 579 30 574 33 570 29 c S\n';
   stream=pdfFill(stream,.16,.70,.68);stream+=`0 0 m 0 52 l 120 15 l 300 0 l h f\n`;
   stream=pdfFill(stream,.02,.25,.48);stream+=`${W} 0 m ${W} 55 l 700 19 l 520 0 l h f\n`;
   stream=pdfFill(stream,.02,.47,.53);stream+=`${W} 0 m ${W} 36 l 690 10 l 560 0 l h f\n`;
   return stream;
  };
  pages.forEach((pageRows,pageIndex)=>{
    let stream='';
    stream=headerBlock(stream);
    let tableTop;
    if(pageIndex===0){
     stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,M,498,tr('fluid.report.title','Informe de balance hídrico'),12,true);
     stream=pdfText(stream,M,480,pdfLabel(tr('fluid.report.oralSection','Balance ingesta - orina')),8.5,true);
     stream=field(stream,M,430,250,tr('fluid.total.intake','Líquidos ingeridos'),`${totals.intake} mL`);
     stream=field(stream,M+260,430,250,tr('fluid.total.urine','Orina'),`${totals.urine} mL`);
     stream=field(stream,M+520,430,282,tr('fluid.balance.oral','Balance ingesta - orina'),fmt(totals.oralBalance));
     stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,M,413,tr('fluid.report.totalSection','Balance total con diálisis'),8.5,true);
     stream=field(stream,M,363,190,tr('fluid.total.infused','Infundido'),`${totals.infused} mL`);
     stream=field(stream,M+198,363,190,tr('fluid.total.drained','Drenado'),`${totals.drained} mL`);
     stream=field(stream,M+396,363,190,tr('fluid.total.apdUf','UF APD'),`${totals.apdUf} mL`);
     stream=field(stream,M+594,363,208,tr('fluid.balance.total','Balance total'),fmt(totals.total));
     stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,M,344,tr('fluid.report.entries','Detalle de líquidos por boca y orina'),9,true);
     tableTop=330;
    }else{
     stream=pdfFill(stream,.03,.20,.34);stream=pdfText(stream,M,498,tr('fluid.report.title','Informe de balance hídrico'),12,true);
     stream=pdfText(stream,M,477,tr('fluid.report.entries','Detalle de líquidos por boca y orina'),9,true);
     tableTop=463;
    }
    const ledger=ledgerHeader(stream,tableTop);stream=ledger.stream;
    const rowCount=Math.max(pageRows.intake.length,pageRows.urine.length,1);
    for(let index=0;index<rowCount;index++){
     stream=ledgerRow(stream,pageRows.intake[index],index,ledger.leftX,ledger.sideWidth,ledger.rowTop);
     stream=ledgerRow(stream,pageRows.urine[index],index,ledger.rightX,ledger.sideWidth,ledger.rowTop);
    }
    stream=footer(stream,pageIndex);
    const content=add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const page=add('');contentIds.push(content);pageIds.push(page);
   });
   const pagesObject=add('');
   const catalog=add(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);
   pageIds.forEach((pageId,index)=>{objects[pageId-1]=`<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${font} 0 R /F2 ${bold} 0 R >>${logoObject?` /XObject << /Logo ${logoObject} 0 R >>`:''} >> /Contents ${contentIds[index]} 0 R >>`});
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
 function render(){
  renderHome();
  if(!isEnabled()){
   close();
   return;
  }
  if(!document.getElementById('fluidModal')?.classList.contains('hidden'))renderEntryList();
 }
 function init(){
  document.querySelectorAll('input[name="fluidEntryType"]').forEach(input=>input.addEventListener('change',toggleFields));
  document.getElementById('fluidEntryDateTime')?.addEventListener('change',renderEntryList);
  render();
 }

 window.GuillePDFluids={open,close,save,edit,remove,render,renderEntryList,computeDailyBalance,resetForm,makeReportBlob,downloadReport,shareReport,isEnabled};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
