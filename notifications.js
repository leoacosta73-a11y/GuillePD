/* GuillePD v3.6.10 · Recordatorios locales de tratamiento
 *
 * Los horarios se guardan por dispositivo. Las preferencias pertenecen al
 * perfil sincronizado. La entrega se realiza por el Service Worker cuando el
 * navegador permite notificaciones. En iOS y algunos navegadores, una PWA
 * totalmente cerrada puede ser suspendida; al volver a abrirla se recupera el
 * horario y se muestra cualquier aviso vencido.
 */
(function(){
  'use strict';

  const JOBS_KEY='guillepd_notification_jobs_v1';
  const DEFAULTS=Object.freeze({
    enabled:false,
    repeatMinutes:0,
    infusionEnabled:true,
    infusionFirstMinutes:5,
    infusionRepeatMinutes:2,
    sound:true,
    vibration:true,
    showWhenClosed:true,
    background:true
  });

  // Reservado para ampliar APD sin cambiar la estructura de los recordatorios.
  const EVENT_TYPES=Object.freeze({
    MANUAL_DRAIN:'manual.drain',
    MANUAL_INFUSION:'manual.infusion',
    APD_CONNECT:'apd.connect',
    APD_START:'apd.start',
    APD_FINISH:'apd.finish',
    APD_LAST_FILL:'apd.lastFill',
    CUSTOM:'custom'
  });

  let timer=null;
  let processing=false;
  let audioContext=null;

  function cloneDefaults(){return {...DEFAULTS}}
  function normalizePreferences(value){
    const source=(value&&typeof value==='object')?value:{};
    const repeat=[0,5,10,15,30].includes(Number(source.repeatMinutes))?Number(source.repeatMinutes):0;
    const infusionFirst=[2,5,10].includes(Number(source.infusionFirstMinutes))?Number(source.infusionFirstMinutes):5;
    const infusionRepeat=[0,2,5].includes(Number(source.infusionRepeatMinutes))?Number(source.infusionRepeatMinutes):2;
    return {
      enabled:source.enabled===true,
      repeatMinutes:repeat,
      infusionEnabled:source.infusionEnabled!==false,
      infusionFirstMinutes:infusionFirst,
      infusionRepeatMinutes:infusionRepeat,
      sound:source.sound!==false,
      vibration:source.vibration!==false,
      showWhenClosed:source.showWhenClosed!==false,
      background:source.background!==false
    };
  }
  function getPreferences(){
    try{return normalizePreferences(root&&root.profile&&root.profile.notificationPreferences)}catch(_){return cloneDefaults()}
  }
  function readJobs(){
    try{
      const value=JSON.parse(localStorage.getItem(JOBS_KEY)||'[]');
      return Array.isArray(value)?value.filter(job=>job&&job.id&&job.dueAt):[];
    }catch(_){return []}
  }
  function writeJobs(jobs){
    try{localStorage.setItem(JOBS_KEY,JSON.stringify(jobs))}catch(_){}
  }
  function translate(key,params){
    return window.GuillePDI18n&&typeof window.GuillePDI18n.t==='function'
      ? window.GuillePDI18n.t(key,params)
      : key;
  }
  function findWash(job){
    try{
      const patient=(root.patients||[]).find(item=>item.id===job.patientId);
      return patient&&Array.isArray(patient.washes)
        ? patient.washes.find(item=>String(item.id)===String(job.washId))
        : null;
    }catch(_){return null}
  }
  function activeJob(job){
    if(job.type===EVENT_TYPES.MANUAL_INFUSION){
      return !job.expiresAt||Number(job.expiresAt)>Date.now();
    }
    const wash=findWash(job);
    return !!(wash&&wash.status==='open');
  }

  function unlockAlertAudio(){
    try{
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)return false;
      if(!audioContext)audioContext=new AudioContext();
      if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
      return true;
    }catch(_){return false}
  }
  function playAlertSound(type){
    if(!unlockAlertAudio()||!audioContext)return false;
    try{
      const drain=type===EVENT_TYPES.MANUAL_DRAIN;
      const notes=drain
        ? [[880,0,.2],[880,.28,.2],[1046,.56,.34]]
        : [[740,0,.16],[880,.24,.22]];
      const start=audioContext.currentTime+.02;
      for(const [frequency,offset,duration] of notes){
        const oscillator=audioContext.createOscillator();
        const gain=audioContext.createGain();
        oscillator.type='sine';
        oscillator.frequency.setValueAtTime(frequency,start+offset);
        gain.gain.setValueAtTime(.0001,start+offset);
        gain.gain.exponentialRampToValueAtTime(.22,start+offset+.02);
        gain.gain.exponentialRampToValueAtTime(.0001,start+offset+duration);
        oscillator.connect(gain);gain.connect(audioContext.destination);
        oscillator.start(start+offset);oscillator.stop(start+offset+duration+.03);
      }
      return true;
    }catch(_){return false}
  }
  function signalDevice(job,prefs){
    const result={sound:false,vibration:false};
    if(prefs.sound)result.sound=playAlertSound(job.type);
    if(prefs.vibration&&navigator&&typeof navigator.vibrate==='function'){
      try{
        const pattern=job.type===EVENT_TYPES.MANUAL_DRAIN
          ? [500,180,500,180,750]
          : [300,150,300];
        result.vibration=navigator.vibrate(pattern)!==false;
      }catch(_){result.vibration=false}
    }
    return result;
  }
  async function displayNotification(job){
    const prefs=getPreferences();
    if(document.visibilityState!=='visible'&&(!prefs.showWhenClosed||!prefs.background))return false;
    const isInfusion=job.type===EVENT_TYPES.MANUAL_INFUSION;
    const hasTarget=isInfusion&&job.targetWeight!==null&&job.targetWeight!==undefined&&job.targetWeight!=='';
    const title=hasTarget
      ? `${translate('notifications.infusionTargetPrefix')} ${job.targetWeight} g`
      : translate(isInfusion?'notifications.infusionTitle':'notifications.drainTitle');
    const body=translate(isInfusion?'notifications.infusionBody':'notifications.drainBody');
    const foreground=document.visibilityState==='visible';
    const signaled=foreground?signalDevice(job,prefs):{sound:false,vibration:false};
    if(!('Notification' in window)||Notification.permission!=='granted')return signaled.sound||signaled.vibration;
    const handledInForeground=foreground
      &&(!prefs.sound||signaled.sound)
      &&(!prefs.vibration||signaled.vibration);
    const options={
      body,
      icon:'./icon-192.png',
      badge:'./icon-192.png',
      tag:job.id,
      renotify:true,
      silent:handledInForeground||(!prefs.sound&&!prefs.vibration),
      requireInteraction:true,
      timestamp:Date.now(),
      data:{url:'./',type:job.type,washId:job.washId,patientId:job.patientId}
    };
    if(isInfusion){
      options.actions=[
        {action:'repeat-infusion',title:translate('notifications.repeatAction')},
        {action:'finish-infusion',title:translate('notifications.infusionFinishedAction')}
      ];
    }
    if(prefs.vibration&&!options.silent){
      options.vibrate=isInfusion?[300,150,300]:[500,180,500,180,750];
    }
    try{
      if('serviceWorker' in navigator){
        const registration=await navigator.serviceWorker.ready;
        await registration.showNotification(title,options);
      }else{
        new Notification(title,options);
      }
      return true;
    }catch(error){
      console.warn('GuillePD: no se pudo mostrar la notificación.',error);
      return false;
    }
  }
  function nextCheck(jobs){
    clearTimeout(timer);
    timer=null;
    const prefs=getPreferences();
    if(!prefs.enabled||!jobs.length)return;
    const soonest=Math.min(...jobs.map(job=>Number(job.nextAt??(job.delivered?NaN:job.dueAt))).filter(Number.isFinite));
    if(!Number.isFinite(soonest))return;
    const delay=Math.max(250,Math.min(60000,soonest-Date.now()));
    timer=setTimeout(processDueJobs,delay);
  }
  async function processDueJobs(){
    if(processing)return;
    processing=true;
    try{
      const prefs=getPreferences();
      let jobs=readJobs();
      if(!prefs.enabled){nextCheck([]);return}
      const now=Date.now();
      const kept=[];
      for(const job of jobs){
        if(![EVENT_TYPES.MANUAL_DRAIN,EVENT_TYPES.MANUAL_INFUSION].includes(job.type)){kept.push(job);continue}
        if(job.type===EVENT_TYPES.MANUAL_INFUSION&&!prefs.infusionEnabled)continue;
        if(!activeJob(job))continue;
        const repeatMinutes=job.type===EVENT_TYPES.MANUAL_INFUSION
          ? prefs.infusionRepeatMinutes
          : prefs.repeatMinutes;
        if(job.delivered&&repeatMinutes===0){kept.push(job);continue}
        const nextAt=Number(job.nextAt??job.dueAt);
        if(nextAt>now){kept.push(job);continue}
        const shown=await displayNotification(job);
        if(!shown){kept.push({...job,nextAt:now+60000});continue}
        if(repeatMinutes>0){
          kept.push({...job,lastShownAt:new Date().toISOString(),nextAt:now+(repeatMinutes*60000)});
        }else{
          kept.push({...job,lastShownAt:new Date().toISOString(),delivered:true,nextAt:null});
        }
      }
      writeJobs(kept);
      nextCheck(kept);
    }finally{processing=false}
  }
  function scheduleManualDrain(wash){
    if(!wash||wash.status!=='open')return;
    const prefs=getPreferences();
    const due=new Date(wash.drainTime||'');
    if(Number.isNaN(due.getTime()))return;
    let jobs=readJobs().filter(job=>!(job.type===EVENT_TYPES.MANUAL_DRAIN&&String(job.washId)===String(wash.id)));
    if(prefs.enabled){
      jobs.push({
        id:`manual-drain-${wash.id}`,
        type:EVENT_TYPES.MANUAL_DRAIN,
        washId:wash.id,
        patientId:(typeof root!=='undefined'&&root.activePatientId)||null,
        dueAt:due.getTime(),
        nextAt:due.getTime(),
        createdAt:new Date().toISOString()
      });
    }
    writeJobs(jobs);
    nextCheck(jobs);
  }
  function cancelManualDrain(washId){
    const jobs=readJobs().filter(job=>!(job.type===EVENT_TYPES.MANUAL_DRAIN&&String(job.washId)===String(washId)));
    writeJobs(jobs);
    nextCheck(jobs);
  }
  function startInfusionReminder(details={}){
    const prefs=getPreferences();
    const patientId=(typeof root!=='undefined'&&root.activePatientId)||null;
    let jobs=readJobs().filter(job=>!(job.type===EVENT_TYPES.MANUAL_INFUSION&&job.patientId===patientId));
    unlockAlertAudio();
    if(prefs.enabled&&prefs.infusionEnabled){
      const now=Date.now();
      const dueAt=now+(prefs.infusionFirstMinutes*60000);
      jobs.push({
        id:`manual-infusion-${patientId||'local'}-${now}`,
        type:EVENT_TYPES.MANUAL_INFUSION,
        patientId,
        dueAt,
        nextAt:dueAt,
        expiresAt:now+(60*60000),
        targetWeight:details.targetWeight??null,
        prescribedVolume:details.prescribedVolume??null,
        createdAt:new Date(now).toISOString()
      });
    }
    writeJobs(jobs);
    nextCheck(jobs);
  }
  function cancelInfusionReminder(patientId){
    const target=patientId??((typeof root!=='undefined'&&root.activePatientId)||null);
    const jobs=readJobs().filter(job=>!(job.type===EVENT_TYPES.MANUAL_INFUSION&&(target===null||job.patientId===target)));
    writeJobs(jobs);
    nextCheck(jobs);
  }
  function snoozeInfusionReminder(patientId){
    const prefs=getPreferences();
    const target=patientId??((typeof root!=='undefined'&&root.activePatientId)||null);
    const delay=Math.max(1,prefs.infusionRepeatMinutes||2)*60000;
    const now=Date.now();
    const jobs=readJobs().map(job=>{
      if(job.type!==EVENT_TYPES.MANUAL_INFUSION||(target!==null&&job.patientId!==target))return job;
      return {...job,delivered:false,nextAt:now+delay,snoozedAt:new Date(now).toISOString()};
    });
    writeJobs(jobs);
    nextCheck(jobs);
  }
  function handleNotificationAction(action){
    if(action==='finish-infusion')cancelInfusionReminder();
    if(action==='repeat-infusion')snoozeInfusionReminder();
  }
  function recoverNotificationActionFromUrl(){
    try{
      const url=new URL(window.location.href);
      const action=url.searchParams.get('notificationAction');
      if(!action)return;
      handleNotificationAction(action);
      url.searchParams.delete('notificationAction');
      if(window.history&&typeof window.history.replaceState==='function'){
        window.history.replaceState({},'',url.pathname+url.search+url.hash);
      }
    }catch(_){ }
  }
  function rebuildManualJobs(){
    const stored=readJobs();
    const previousManual=new Map(stored.filter(job=>job.type===EVENT_TYPES.MANUAL_DRAIN).map(job=>[String(job.washId),job]));
    let jobs=stored.filter(job=>job.type!==EVENT_TYPES.MANUAL_DRAIN);
    if(getPreferences().enabled){
      try{
        for(const patient of (root.patients||[])){
          for(const wash of (patient.washes||[])){
            if(wash.status!=='open')continue;
            const due=new Date(wash.drainTime||'');
            if(Number.isNaN(due.getTime()))continue;
            const previous=previousManual.get(String(wash.id));
            const dueAt=due.getTime();
            jobs.push(previous&&Number(previous.dueAt)===dueAt?previous:{
              id:`manual-drain-${wash.id}`,
              type:EVENT_TYPES.MANUAL_DRAIN,
              washId:wash.id,
              patientId:patient.id,
              dueAt,
              nextAt:dueAt,
              createdAt:new Date().toISOString()
            });
          }
        }
      }catch(_){}
    }
    writeJobs(jobs);
    nextCheck(jobs);
    processDueJobs();
  }
  function permissionState(){
    if(!('Notification' in window))return 'unsupported';
    return Notification.permission;
  }
  async function requestPermission(){
    const prefs=getPreferences();
    if(!('Notification' in window)){
      renderSettings();
      return 'unsupported';
    }
    let result=Notification.permission;
    if(result==='default')result=await Notification.requestPermission();
    if(result==='granted'){
      prefs.enabled=true;
      if(root&&root.profile)root.profile.notificationPreferences=prefs;
      if(typeof persist==='function')persist();
      rebuildManualJobs();
    }
    renderSettings();
    return result;
  }
  function renderSettings(){
    const prefs=getPreferences();
    const byId=id=>document.getElementById(id);
    const enabled=byId('notificationsEnabled');
    if(enabled)enabled.checked=prefs.enabled;
    const repeat=byId('notificationRepeat');
    if(repeat)repeat.value=String(prefs.repeatMinutes);
    const infusionFirst=byId('notificationInfusionFirst');
    if(infusionFirst)infusionFirst.value=String(prefs.infusionFirstMinutes);
    const infusionRepeat=byId('notificationInfusionRepeat');
    if(infusionRepeat)infusionRepeat.value=String(prefs.infusionRepeatMinutes);
    for(const [id,key] of [['notificationSound','sound'],['notificationVibration','vibration'],['notificationClosed','showWhenClosed'],['notificationBackground','background']]){
      const element=byId(id);if(element)element.checked=!!prefs[key];
    }
    const infusionEnabled=byId('notificationInfusionEnabled');
    if(infusionEnabled)infusionEnabled.checked=!!prefs.infusionEnabled;
    const options=byId('notificationOptions');
    if(options)options.classList.toggle('is-disabled',!prefs.enabled);
    const button=byId('notificationPermissionButton');
    const status=byId('notificationPermissionStatus');
    const state=permissionState();
    if(button){
      button.classList.toggle('hidden',state==='granted');
      button.textContent=translate('notifications.enableButton');
    }
    if(status){
      const config={
        granted:['notifications.permissionGranted','ok'],
        denied:['notifications.permissionDenied','warn'],
        default:['notifications.permissionPending',''],
        unsupported:['notifications.permissionUnsupported','warn']
      }[state];
      status.textContent=translate(config[0]);
      status.className='notification-status'+(config[1]?' '+config[1]:'');
    }
  }
  function readPreferencesFromForm(){
    const byId=id=>document.getElementById(id);
    return normalizePreferences({
      enabled:!!byId('notificationsEnabled')?.checked,
      repeatMinutes:Number(byId('notificationRepeat')?.value||0),
      infusionEnabled:!!byId('notificationInfusionEnabled')?.checked,
      infusionFirstMinutes:Number(byId('notificationInfusionFirst')?.value||5),
      infusionRepeatMinutes:Number(byId('notificationInfusionRepeat')?.value||2),
      sound:!!byId('notificationSound')?.checked,
      vibration:!!byId('notificationVibration')?.checked,
      showWhenClosed:!!byId('notificationClosed')?.checked,
      background:!!byId('notificationBackground')?.checked
    });
  }
  function configure(preferences){
    const normalized=normalizePreferences(preferences);
    if(root&&root.profile)root.profile.notificationPreferences=normalized;
    if(normalized.enabled&&permissionState()==='granted')rebuildManualJobs();
    else if(!normalized.enabled){
      writeJobs(readJobs().filter(job=>![EVENT_TYPES.MANUAL_DRAIN,EVENT_TYPES.MANUAL_INFUSION].includes(job.type)));
      nextCheck([]);
    }
    renderSettings();
    return normalized;
  }
  function init(){
    renderSettings();
    rebuildManualJobs();
    recoverNotificationActionFromUrl();
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')processDueJobs()});
    document.addEventListener('pointerdown',unlockAlertAudio,{once:true});
    document.addEventListener('touchstart',unlockAlertAudio,{once:true,passive:true});
    window.addEventListener('focus',processDueJobs);
    window.addEventListener('online',processDueJobs);
    if('serviceWorker' in navigator){
      navigator.serviceWorker.addEventListener?.('message',event=>{
        const message=event.data||{};
        if(message.type==='NOTIFICATION_ACTION')handleNotificationAction(message.action);
      });
    }
  }

  window.GuillePDNotifications={
    DEFAULTS,
    EVENT_TYPES,
    normalizePreferences,
    getPreferences,
    readPreferencesFromForm,
    configure,
    requestPermission,
    permissionState,
    renderSettings,
    scheduleManualDrain,
    cancelManualDrain,
    startInfusionReminder,
    cancelInfusionReminder,
    snoozeInfusionReminder,
    handleNotificationAction,
    rebuildManualJobs,
    processDueJobs,
    init
  };
  window.requestNotificationPermission=requestPermission;
  window.toggleNotificationControls=function(){
    const prefs=readPreferencesFromForm();
    configure(prefs);
    if(typeof persist==='function')persist();
    if(prefs.enabled&&permissionState()==='default')requestPermission();
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
