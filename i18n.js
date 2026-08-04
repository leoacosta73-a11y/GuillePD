/* GuillePD v3.6.1 · Sistema central de idiomas
 * La interfaz histórica conserva sus textos fuente en español. Este módulo
 * centraliza su equivalente inglés y traduce también contenido generado en
 * tiempo de ejecución, alertas, notificaciones e informes PDF.
 */
(function(){
  'use strict';

  const dictionaries={
    es:{
      'language.title':'Idioma',
      'language.subtitle':'Elegí el idioma de la aplicación y de los informes.',
      'notifications.title':'Notificaciones',
      'notifications.subtitle':'Recordatorios del horario previsto de drenaje.',
      'notifications.enable':'Activar recordatorios',
      'notifications.enableHelp':'GuillePD avisará cuando finalice la permanencia.',
      'notifications.repeat':'Repetición automática',
      'notifications.noRepeat':'No repetir',
      'notifications.every5':'Cada 5 minutos',
      'notifications.every10':'Cada 10 minutos',
      'notifications.every15':'Cada 15 minutos',
      'notifications.every30':'Cada 30 minutos',
      'notifications.sound':'Sonido',
      'notifications.vibration':'Vibración',
      'notifications.closed':'Mostrar con la aplicación cerrada',
      'notifications.background':'Permitir recordatorios en segundo plano',
      'notifications.enableButton':'Activar notificaciones en este dispositivo',
      'notifications.compatibility':'El horario queda guardado aunque cierres GuillePD. La entrega con la aplicación totalmente cerrada depende de las reglas de iOS, Android, Windows y del navegador; al volver a abrirla se recuperan los avisos vencidos.',
      'notifications.drainTitle':'Hora del drenaje',
      'notifications.drainBody':'El tiempo de permanencia finalizó. Es momento de realizar el drenaje.',
      'notifications.permissionGranted':'Notificaciones autorizadas en este dispositivo.',
      'notifications.permissionDenied':'Las notificaciones están bloqueadas. Podés habilitarlas desde los ajustes del dispositivo.',
      'notifications.permissionPending':'Todavía falta autorizar las notificaciones en este dispositivo.',
      'notifications.permissionUnsupported':'Este navegador no admite notificaciones web.',
      'fluid.home.eyebrow':'Registro diario',
      'fluid.home.title':'Líquidos y balance hídrico',
      'fluid.home.subtitle':'Ingresos, orina y diálisis reunidos en un solo cálculo.',
      'fluid.balance.oral':'Balance ingesta − orina',
      'fluid.balance.oralShort':'Solo líquidos por boca y orina',
      'fluid.balance.total':'Balance total con diálisis',
      'fluid.balance.totalShort':'Incluye los registros de diálisis',
      'fluid.balance.formula':'Cálculo: líquidos ingeridos + volumen infundido − orina − volumen drenado − UF APD.',
      'fluid.total.intake':'Líquidos ingeridos',
      'fluid.total.urine':'Orina',
      'fluid.total.infused':'Infundido en diálisis',
      'fluid.total.drained':'Drenado en diálisis',
      'fluid.total.apdUf':'UF total APD descontada',
      'fluid.action.open':'Registrar líquidos u orina',
      'fluid.modal.title':'Registrar líquidos u orina',
      'fluid.type.intake':'Ingreso de líquidos',
      'fluid.type.urine':'Orina',
      'fluid.field.datetime':'Fecha y hora',
      'fluid.field.amount':'Cantidad (mL)',
      'fluid.field.beverage':'Tipo de líquido',
      'fluid.field.note':'Observación (opcional)',
      'fluid.field.notePlaceholder':'Ej.: con medicación',
      'fluid.beverage.water':'Agua',
      'fluid.beverage.juice':'Jugo',
      'fluid.beverage.milk':'Leche',
      'fluid.beverage.infusion':'Infusión',
      'fluid.beverage.other':'Otro líquido',
      'fluid.action.close':'Cerrar',
      'fluid.action.save':'Guardar registro',
      'fluid.action.update':'Actualizar registro',
      'fluid.action.edit':'Editar',
      'fluid.action.delete':'Eliminar',
      'fluid.list.title':'Registros del día seleccionado',
      'fluid.list.empty':'No hay ingresos de líquidos ni orina registrados para este día.',
      'fluid.validation.required':'Ingresá la fecha, la hora y una cantidad mayor que cero.',
      'fluid.confirm.delete':'¿Eliminar este registro?',
      'fluid.saved':'Registro guardado.',
      'fluid.report.download':'Descargar informe diario',
      'fluid.report.share':'Compartir informe',
      'fluid.report.title':'Informe de balance hídrico',
      'fluid.report.patient':'Paciente',
      'fluid.report.date':'Fecha',
      'fluid.report.page':'Página',
      'fluid.report.oralSection':'Balance ingesta − orina',
      'fluid.report.totalSection':'Balance total con diálisis',
      'fluid.report.entries':'Detalle de líquidos por boca y orina',
      'fluid.report.time':'Hora',
      'fluid.report.type':'Tipo',
      'fluid.report.amount':'Cantidad',
      'fluid.report.note':'Observación',
      'fluid.report.noEntries':'Sin registros de líquidos por boca u orina.',
      'fluid.report.footer':'Registro personal de GuillePD. Sin interpretación clínica.'
    },
    en:{
      'language.title':'Language',
      'language.subtitle':'Choose the language for the app and reports.',
      'notifications.title':'Notifications',
      'notifications.subtitle':'Reminders for the scheduled drain time.',
      'notifications.enable':'Enable reminders',
      'notifications.enableHelp':'GuillePD will notify you when the dwell time ends.',
      'notifications.repeat':'Automatic repeat',
      'notifications.noRepeat':'Do not repeat',
      'notifications.every5':'Every 5 minutes',
      'notifications.every10':'Every 10 minutes',
      'notifications.every15':'Every 15 minutes',
      'notifications.every30':'Every 30 minutes',
      'notifications.sound':'Sound',
      'notifications.vibration':'Vibration',
      'notifications.closed':'Show when the app is closed',
      'notifications.background':'Allow background reminders',
      'notifications.enableButton':'Enable notifications on this device',
      'notifications.compatibility':'The scheduled time remains saved when GuillePD is closed. Delivery while the app is fully closed depends on iOS, Android, Windows and browser rules; overdue reminders are recovered when the app is reopened.',
      'notifications.drainTitle':'Drain time',
      'notifications.drainBody':'The dwell time has ended. It is time to drain.',
      'notifications.permissionGranted':'Notifications are authorized on this device.',
      'notifications.permissionDenied':'Notifications are blocked. You can enable them in the device settings.',
      'notifications.permissionPending':'Notifications still need to be authorized on this device.',
      'notifications.permissionUnsupported':'This browser does not support web notifications.',
      'fluid.home.eyebrow':'Daily record',
      'fluid.home.title':'Fluids and fluid balance',
      'fluid.home.subtitle':'Intake, urine output and dialysis combined in one calculation.',
      'fluid.balance.oral':'Intake − urine balance',
      'fluid.balance.oralShort':'Oral fluid intake and urine only',
      'fluid.balance.total':'Total balance with dialysis',
      'fluid.balance.totalShort':'Includes dialysis records',
      'fluid.balance.formula':'Calculation: fluid intake + infused volume − urine output − drained volume − APD UF.',
      'fluid.total.intake':'Fluid intake',
      'fluid.total.urine':'Urine output',
      'fluid.total.infused':'Dialysis infused volume',
      'fluid.total.drained':'Dialysis drained volume',
      'fluid.total.apdUf':'Total APD UF deducted',
      'fluid.action.open':'Record fluids or urine output',
      'fluid.modal.title':'Record fluids or urine output',
      'fluid.type.intake':'Fluid intake',
      'fluid.type.urine':'Urine output',
      'fluid.field.datetime':'Date and time',
      'fluid.field.amount':'Amount (mL)',
      'fluid.field.beverage':'Fluid type',
      'fluid.field.note':'Note (optional)',
      'fluid.field.notePlaceholder':'E.g. with medication',
      'fluid.beverage.water':'Water',
      'fluid.beverage.juice':'Juice',
      'fluid.beverage.milk':'Milk',
      'fluid.beverage.infusion':'Tea / infusion',
      'fluid.beverage.other':'Other fluid',
      'fluid.action.close':'Close',
      'fluid.action.save':'Save record',
      'fluid.action.update':'Update record',
      'fluid.action.edit':'Edit',
      'fluid.action.delete':'Delete',
      'fluid.list.title':'Records for selected day',
      'fluid.list.empty':'No fluid intake or urine output has been recorded for this day.',
      'fluid.validation.required':'Enter the date, time and an amount greater than zero.',
      'fluid.confirm.delete':'Delete this record?',
      'fluid.saved':'Record saved.',
      'fluid.report.download':'Download daily report',
      'fluid.report.share':'Share report',
      'fluid.report.title':'Fluid balance report',
      'fluid.report.patient':'Patient',
      'fluid.report.date':'Date',
      'fluid.report.page':'Page',
      'fluid.report.oralSection':'Intake − urine balance',
      'fluid.report.totalSection':'Total balance with dialysis',
      'fluid.report.entries':'Oral fluid intake and urine details',
      'fluid.report.time':'Time',
      'fluid.report.type':'Type',
      'fluid.report.amount':'Amount',
      'fluid.report.note':'Note',
      'fluid.report.noEntries':'No oral fluid intake or urine records.',
      'fluid.report.footer':'Personal GuillePD record. No clinical interpretation.'
    }
  };

  /* Traducciones de la interfaz existente. Es la única fuente para inglés. */
  const EN={
    'Inicio':'Home','Historial':'History','Resumen':'Summary','Ajustes':'Settings','Experiencia':'Experience','Acompañamiento':'Support',
    'Seguimiento diario':'Daily monitoring','Hola,':'Hello,','Estado actual':'Current status',
    'Sin intercambio activo':'No active exchange','Sin lavado activo':'No active exchange',
    'Podés iniciar un nuevo registro cuando corresponda.':'You can start a new record when appropriate.',
    'Próximo drenaje':'Next drain','No hay un intercambio en curso':'There is no exchange in progress',
    'Nuevo intercambio':'New exchange','Intercambios de hoy':'Today’s exchanges','Balance de hoy':'Today’s balance',
    'Tiempo acumulado':'Accumulated time','Último peso':'Latest weight','Objetivo diario':'Daily goal',
    'Último registro':'Latest record','Sin registros':'No records',
    'Cuando registres un intercambio, vas a ver acá sus datos principales.':'When you record an exchange, its main data will appear here.',
    'Tratamiento APD':'APD Treatment','Iniciar tratamiento APD':'Start APD treatment',
    'No hay tratamientos APD registrados hoy.':'There are no APD treatments recorded today.',
    'Consultá los controles e intercambios registrados por día.':'View controls and exchanges recorded by day.',
    'Fecha':'Date','Hoy':'Today','Día anterior':'Previous day','Día siguiente':'Next day',
    'Ver todos los días':'View all days','Sin datos para esta fecha':'No data for this date',
    'No hay registros':'No records','Todavía no se cargaron datos en el historial.':'No data has been added to the history yet.',
    'Control prediálisis':'Pre-dialysis control','Control posdiálisis':'Post-dialysis control',
    'Intercambio':'Exchange','Intercambios':'Exchanges','Infusión':'Infusion','Drenaje':'Drain',
    'Solución de diálisis':'Dialysis solution','Volumen infundido':'Infused Volume','Volumen drenado':'Drained volume',
    'Balance del día':'Daily Balance','Ultrafiltrado':'Ultrafiltration',
    'Balance del intercambio':'Exchange balance','Aspecto':'Appearance','Nota':'Note','Pendiente':'Pending',
    'Cargar drenaje':'Record drain','Editar':'Edit','Eliminar':'Delete','Completado':'Completed','En curso':'In progress',
    'Resumen de hoy':'Today’s summary','Fecha del resumen':'Summary date','Día':'Day','Semana':'Week','Mes':'Month',
    'Elegir día':'Choose day','Período':'Period','Intercambios registrados':'Recorded exchanges',
    'Intercambios completados':'Completed exchanges','Volumen total infundido':'Total infused volume',
    'Volumen total drenado':'Total drained volume','Balance total':'Total balance','Sin datos guardados.':'No saved data.',
    'Informes':'Reports','Registro clínico':'Clinical record',
    'Generá el informe clínico del paciente activo para guardar o compartir.':'Generate the active patient’s clinical report to save or share.',
    'Tipo de informe':'Report type','Período seleccionado':'Selected period','Sin registro':'No record',
    'Seleccioná el período para preparar el informe.':'Select a period to prepare the report.',
    'Descargar PDF':'Download PDF','Compartir PDF':'Share PDF','Exportar CSV':'Export CSV',
    'Seguridad':'Security','Respaldo completo':'Full backup','Descargar respaldo':'Download backup',
    'Incluye todos los pacientes y registros.':'Includes all patients and records.',
    'Restaurar respaldo':'Restore backup','Importar una copia guardada anteriormente.':'Import a previously saved copy.',
    'Los datos se guardan automáticamente en este dispositivo.':'Data is saved automatically on this device.',
    'Configuración clínica':'Clinical settings','Paciente y tratamiento':'Patient and treatment',
    'Estos datos se utilizan en el seguimiento y en los informes.':'This data is used for monitoring and reports.',
    'Cuenta':'Account','Sincronización entre dispositivos':'Sync across devices',
    'Iniciá sesión una vez para ver los mismos pacientes y registros en tu teléfono, tablet y computadora.':'Sign in once to see the same patients and records on your phone, tablet and computer.',
    'Estado':'Status','Solo en este dispositivo':'Only on this device','Correo electrónico':'Email',
    'Contraseña':'Password','Mínimo 6 caracteres':'Minimum 6 characters','Iniciar sesión':'Sign in',
    'Crear cuenta':'Create account','Leí y acepto los':'I have read and accept the',
    'Términos y Condiciones':'Terms and Conditions','Política de Privacidad':'Privacy Policy',
    'Cancelar':'Cancel','Exportación':'Export','Ver historial':'View history','Ir a Ajustes':'Go to Settings','o':'or',
    '← Ajustes':'← Settings','← Inicio':'← Home','en Ajustes.':'in Settings.',
    'Cicladora (APD)':'Cycler (APD)','Manual (CAPD) · Cicladora (APD) · Mixto':'Manual (CAPD) · Cycler (APD) · Mixed',
    'Especificar solución, medicación o aditivo':'Specify solution, medication or additive',
    'Peso real al cerrar':'Actual weight at clamp closure','Programa APD':'APD Program','Registro simple':'Simple record',
    'Prescripción Médica ·':'Medical Prescription ·','Todavía no hay intercambios registrados hoy.':'No exchanges have been recorded today.',
    'Olvidé mi contraseña':'Forgot my password','La aplicación sigue funcionando sin conexión y conserva el respaldo manual.':'The app continues to work offline and keeps manual backup available.',
    'Sesión iniciada':'Signed in','Sincronizar ahora':'Sync now','Cerrar sesión':'Sign out',
    'Los cambios se guardan automáticamente cuando hay conexión.':'Changes are saved automatically when there is a connection.',
    'Nueva contraseña':'New password','Guardar nueva contraseña':'Save new password',
    'Elegí una contraseña nueva para recuperar el acceso.':'Choose a new password to regain access.',
    'La cuenta sincroniza los datos de GuillePD. El archivo JSON de respaldo continúa disponible como copia adicional.':'Your account syncs GuillePD data. The JSON backup file remains available as an additional copy.',
    'Perfiles':'Profiles','Pacientes':'Patients','Cambiá de paciente o agregá un perfil nuevo sin mezclar los registros.':'Switch patients or add a new profile without mixing records.',
    'Paciente activo':'Active patient','Agregar paciente':'Add patient','Eliminar paciente actual':'Delete current patient',
    'Cada paciente conserva por separado su configuración, intercambios, controles e informes.':'Each patient keeps separate settings, exchanges, controls and reports.',
    'Paciente configurado':'Configured patient','Datos clínicos del tratamiento':'Clinical treatment data',
    'Tratamiento actual':'Current treatment','Modalidad de tratamiento':'Treatment modality',
    'Manual':'Manual','Cicladora':'Cycler','Mixto':'Mixed','Manual + APD':'Manual + APD',
    'Se mantiene el registro manual actual, sin ningún cambio.':'The current manual record remains unchanged.',
    'Prescripción Médica':'Medical Prescription','Identificación':'Identification','Datos del paciente':'Patient information',
    'Nombre y apellido':'Full name','Fecha de nacimiento':'Date of birth','Historia clínica':'Medical record number',
    'DNI':'ID number','Diagnóstico principal':'Primary diagnosis','Equipo tratante':'Care team',
    'Centro y profesionales':'Center and professionals','Hospital o centro':'Hospital or center','Nefrólogo/a':'Nephrologist',
    'Parámetros habituales':'Usual parameters','Tratamiento de diálisis':'Dialysis treatment','Peso seco (kg)':'Dry weight (kg)',
    'Intercambios diarios indicados':'Prescribed daily exchanges','Volumen habitual por intercambio (mL)':'Usual volume per exchange (mL)',
    'Objetivo de UF (g)':'UF target (g)','Soluciones habituales':'Usual solutions','Contacto':'Contact',
    'Cuidador responsable':'Responsible caregiver','Nombre del cuidador':'Caregiver name','Teléfono de contacto':'Contact phone',
    'Guardar configuración':'Save settings','Aplicar cambios':'Apply changes',
    'Los datos se guardan en este dispositivo y, si iniciás sesión, también en tu cuenta.':'Data is saved on this device and, when signed in, in your account as well.',
    'Guardar cambios':'Save changes','Configuración lista.':'Settings ready.',
    'Acerca de GuillePD':'About GuillePD','Historia e información legal':'Story and legal information',
    'Conocé el origen de GuillePD y consultá los documentos vigentes.':'Learn about GuillePD’s origin and read the current documents.',
    'Nuestra historia':'Our story','Términos':'Terms','Privacidad':'Privacy','Versión final':'Final version',
    'Estado de la aplicación':'Application status','Verificando':'Checking','Todo correcto':'Everything is correct',
    'Requiere revisión':'Needs review','Correcto':'Correct','Revisar':'Review','Versión estable':'Stable version',

    'Indicaciones del equipo tratante':'Care team instructions','Conservá cada indicación con su período de vigencia.':'Keep each prescription with its effective period.',
    'Anterior':'Previous','Nueva indicación':'New prescription','Prescripción APD':'APD Prescription',
    'Cada guardado crea una prescripción nueva. Las anteriores permanecen en el historial.':'Each save creates a new prescription. Previous prescriptions remain in the history.',
    'Datos generales':'General information','Nombre del programa (opcional)':'Program name (optional)',
    'Programa activo':'Active program','Inicio de vigencia':'Effective start date','Finalización (opcional)':'End date (optional)',
    'Equipo':'Equipment','Tipo de cicladora':'Cycler type','Especificar equipo':'Specify equipment',
    'Tratamiento':'Treatment','Duración total (horas)':'Total duration (hours)','Cantidad de ciclos':'Number of cycles',
    'Volumen por ciclo (mL)':'Volume per cycle (mL)','Último llenado':'Last fill','Sí':'Yes','No':'No',
    'Volumen del último llenado (mL)':'Last fill volume (mL)','Permanencia diurna':'Day dwell',
    'Solución utilizada':'Solution used','Glucosa 1.5 %':'Glucose 1.5%','Glucosa 2.5 %':'Glucose 2.5%',
    'Glucosa 4.25 %':'Glucose 4.25%','Icodextrina':'Icodextrin','Otra':'Other',
    'Especificar solución':'Specify solution','Aditivos':'Additives','Heparina':'Heparin','Antibióticos':'Antibiotics',
    'Otros':'Other additives','Especificar otros aditivos':'Specify other additives','Observaciones':'Notes',
    'Texto libre':'Free text','Guardar como nueva prescripción':'Save as new prescription',
    'Historial de prescripciones':'Prescription history','Todavía no hay prescripciones APD guardadas.':'No APD prescriptions have been saved yet.',
    'Tratamiento APD en curso':'APD treatment in progress','Inicio y finalización de tratamientos nocturnos con la prescripción médica activa.':'Start and completion of overnight treatments using the active medical prescription.',
    'Iniciar tratamiento':'Start treatment','Programa':'Program','Seleccioná una prescripción APD activa.':'Select an active APD prescription.',
    'Los parámetros se cargan automáticamente desde la prescripción seleccionada.':'Parameters are loaded automatically from the selected prescription.',
    'Fecha y hora de inicio':'Start date and time','Fecha y hora de finalización':'End date and time',
    'Ultrafiltrado total · UF (mL)':'Total ultrafiltration · UF (mL)','Peso (kg)':'Weight (kg)',
    'Presión arterial sistólica (mmHg)':'Systolic blood pressure (mmHg)','Presión arterial diastólica (mmHg)':'Diastolic blood pressure (mmHg)',
    'Temperatura (°C)':'Temperature (°C)','Diuresis (mL)':'Urine output (mL)',
    'Observaciones del tratamiento nocturno.':'Overnight treatment notes.','Completar tratamiento':'Complete treatment',
    'Guardar y finalizar tratamiento':'Save and complete treatment','Registrá solamente los resultados finales informados por la cicladora.':'Record only the final results reported by the cycler.',
    'Tratamientos APD del día':'APD treatments for the day','UF total':'Total UF','Presión arterial':'Blood pressure',
    'Prescripción':'Prescription','Duración':'Duration','Ciclos':'Cycles','Volumen/ciclo':'Volume/cycle',
    'Vigencia:':'Effective period:','Desde':'From','Activo':'Active','Inactivo':'Inactive',

    'Nuevo registro':'New record','Primer intercambio del día':'First exchange of the day',
    'Control prediálisis':'Pre-dialysis control','Peso (kg)':'Weight (kg)','Podés usar coma o punto.':'You can use a comma or a period.',
    'Presión sistólica (mmHg)':'Systolic blood pressure (mmHg)','Presión diastólica (mmHg)':'Diastolic blood pressure (mmHg)',
    'Guardar control y continuar después':'Save control and continue later','No hace falta iniciar todavía el primer intercambio.':'You do not need to start the first exchange yet.',
    'Fecha y hora de infusión':'Infusion date and time','Número de intercambio':'Exchange number',
    'Tiempo de permanencia (min)':'Dwell time (min)','Peso bolsa llena (g)':'Full bag weight (g)',
    'Volumen indicado a infundir (mL)':'Prescribed infusion volume (mL)','CERRAR LOS CLAMPS CUANDO LA BOLSA PESE':'CLOSE THE CLAMPS WHEN THE BAG WEIGHS',
    'HORARIO PREVISTO DE DRENAJE':'SCHEDULED DRAIN TIME','Peso real de la bolsa al cerrar clamps (g)':'Actual bag weight when clamps were closed (g)',
    'VOLUMEN INFUNDIDO':'INFUSED VOLUME','Guardar infusión':'Save infusion','Peso bolsa de drenaje vacía (g)':'Empty drain bag weight (g)',
    'Guardar bolsa vacía y continuar después':'Save empty bag and continue later','El intercambio queda abierto. Después volvés desde Historial para cargar el peso de la bolsa llena.':'The exchange remains open. Return from History later to enter the full drain bag weight.',
    'Peso bolsa de drenaje llena (g)':'Full drain bag weight (g)','VOLUMEN DRENADO':'DRAINED VOLUME','BALANCE DEL INTERCAMBIO':'EXCHANGE BALANCE',
    'Siguiente':'Next','Siguiente →':'Next →','← Anterior':'← Previous','Aspecto del líquido':'Effluent appearance',
    'Claro':'Clear','Levemente turbio':'Slightly cloudy','Turbio':'Cloudy','Con fibrina':'With fibrin','Hemático':'Blood-tinged',
    'Completá los valores al finalizar el intercambio. Quedarán asociados al control posdiálisis del día.':'Complete the values when the exchange ends. They will be linked to the day’s post-dialysis control.',
    'Al guardar, estos valores se registrarán como control posdiálisis del día.':'When saved, these values will be recorded as the day’s post-dialysis control.',
    'Síntomas, molestias, características del drenaje u otra observación relevante.':'Symptoms, discomfort, effluent characteristics or other relevant notes.',
    'Atrás':'Back','Continuar':'Continue','Guardar y finalizar intercambio':'Save and complete exchange','Limpiar':'Clear',

    'Bienvenido a GuillePD':'Welcome to GuillePD','Esta aplicación nació de una historia real.':'This application was born from a true story.',
    'Cuando mi hija Guillermina comenzó su tratamiento de diálisis peritoneal, entendí que cuidar también significaba aprender, registrar y estar presente en cada detalle.':'When my daughter Guillermina began peritoneal dialysis treatment, I understood that caring also meant learning, keeping records and being present in every detail.',
    'Así nació GuillePD.':'That is how GuillePD was born.',
    'Fue creada para acompañarla en su tratamiento, ordenar cada intercambio, cada control y toda la información que necesitábamos conservar para cuidarla mejor.':'It was created to support her treatment and organize every exchange, every check and all the information we needed to care for her better.',
    'Nació de una necesidad real: hacer un poco más simple un camino que, al principio, parecía lleno de incertidumbre.':'It came from a real need: to make a journey that initially seemed full of uncertainty a little simpler.',
    'Con el tiempo comprendí que esta herramienta también podía ayudar a otras personas y familias que atraviesan una experiencia similar.':'Over time, I realized that this tool could also help other people and families going through a similar experience.',
    'Por eso decidí desarrollarla y compartirla, buscando que pueda mantenerse, crecer y mejorar con el tiempo.':'That is why I decided to develop and share it, so it can be maintained, grow and improve over time.',
    'Deseo que GuillePD pueda acompañarte, ayudarte a organizar el tratamiento y permitirte dedicar más tiempo y atención a lo verdaderamente importante: la persona que está detrás de cada registro.':'I hope GuillePD can support you, help organize treatment and let you devote more time and attention to what truly matters: the person behind every record.',
    'Para Guille, quien inspiró cada paso de este proyecto.':'For Guille, who inspired every step of this project.',
    'Con amor, papá.':'With love, Dad.','Comenzar':'Get started',
    'Guillermina tenía apenas tres meses cuando atravesó un síndrome urémico hemolítico (SUH). Durante 27 días necesitó diálisis peritoneal y no produjo orina. En ese momento nos dijeron que probablemente volvería a casa con diálisis crónica, pero su riñón comenzó a responder y, poco a poco, volvió a funcionar.':'Guillermina was only three months old when she developed hemolytic uremic syndrome (HUS). She needed peritoneal dialysis for 27 days and produced no urine. At the time, we were told she would probably go home on chronic dialysis, but her kidney began to respond and gradually started working again.',
    'Desde entonces comenzó un camino largo: acompañar su enfermedad renal crónica con medicamentos, cuidados en la alimentación, estudios y laboratorios. Durante años aprendimos a convivir con controles, resultados y decisiones que formaban parte de nuestra vida familiar.':'A long journey followed: managing her chronic kidney disease with medication, dietary care, tests and laboratory work. Over the years, we learned to live with monitoring, results and decisions that became part of our family life.',
    'A los once años su función renal comenzó a desmejorar y llegó el momento de planificar un trasplante. Poco después tuvo que volver al quirófano para colocar un catéter e iniciar nuevamente la diálisis peritoneal.':'At age eleven, her kidney function began to decline and it was time to plan a transplant. Soon afterward, she returned to the operating room to have a catheter placed and restart peritoneal dialysis.',
    'Durante esa internación nació la idea de GuillePD. Mientras intentaba registrar cada intercambio, cada control y cada indicación, descubrí que no encontraba una aplicación que se adaptara a nuestras necesidades reales.':'The idea for GuillePD was born during that hospital stay. While trying to record every exchange, check and instruction, I realized I could not find an application that fit our real needs.',
    'Entonces decidí crearla: primero para acompañar a Guille y, con el tiempo, para ayudar también a otras personas y familias que recorren un camino parecido.':'So I decided to create it: first to support Guille and, over time, to help other people and families on a similar journey.',

    'Información legal':'Legal information','Leé esta información antes de continuar con GuillePD.':'Read this information before continuing with GuillePD.',
    'Aceptar y continuar':'Accept and continue','No aceptar y cerrar sesión':'Decline and sign out',
    'Términos y Privacidad':'Terms and Privacy','Responsable y alcance':'Controller and scope',
    'Diario':'Daily','Semanal':'Weekly','Mensual':'Monthly','Registro de intercambios':'Exchange record',
    'Resumen del período':'Period summary','Balance neto por día':'Net balance by day','Sin datos para el período':'No data for the period',
    'Cada registro ayuda a cuidar un riñón.':'Every record helps care for a kidney.','Paciente:':'Patient:','Fecha:':'Date:',
    'Informe:':'Report:','Peso:':'Weight:','Modalidad:':'Modality:','Centro:':'Center:','Médico:':'Physician:',
    'Responsable:':'Caregiver:','Tel:':'Phone:','Diálisis Peritoneal Manual (CAPD)':'Manual Peritoneal Dialysis (CAPD)',
    'N°':'No.','Fecha / hora':'Date / time','infusión':'infusion','Volumen':'Volume','infundido':'infused',
    'Tiempo de':'Dwell','permanencia':'time','Hora de':'Drain','drenaje':'time','drenado':'drained',
    'Balance':'Balance','parcial':'partial','Solución diálisis':'Dialysis solution',
    'Peso y presión':'Weight and blood pressure','Peso · kg':'Weight · kg','Presión · mmHg':'Blood pressure · mmHg',
    'Diuresis':'Urine output','Máx.':'Max.',
    'Identificación y aceptación':'Identification and acceptance','Finalidad y alcance':'Purpose and scope',
    'Uso de la cuenta':'Account use','Responsabilidad sobre los registros':'Responsibility for records',
    'Funcionamiento, conexión y respaldos':'Operation, connectivity and backups','Disponibilidad y cambios':'Availability and changes',
    'Planes y pagos futuros':'Future plans and payments','Uso permitido':'Permitted use','Propiedad intelectual':'Intellectual property',
    'Seguridad':'Security','Limitación de responsabilidad':'Limitation of liability','Legislación aplicable':'Applicable law',
    'Datos tratados':'Data processed','Finalidades':'Purposes','Base y autorización':'Legal basis and authorization',
    'Almacenamiento local y nube':'Local and cloud storage','Proveedores y transferencias':'Providers and transfers',
    'Conservación':'Retention','Derechos de las personas':'Individual rights','Menores de edad':'Minors',
    'Suspensión, eliminación y exportación':'Suspension, deletion and export','Cambios en esta Política':'Changes to this Policy',
    'GuillePD es una herramienta digital desarrollada y administrada por':'GuillePD is a digital tool developed and managed by',
    'GuillePD permite registrar, organizar, sincronizar y exportar información vinculada con diálisis peritoneal manual (CAPD), cicladora (APD), modalidad mixta, controles e indicaciones ingresadas por la persona usuaria.':'GuillePD lets users record, organize, synchronize and export information related to manual peritoneal dialysis (CAPD), cycler treatment (APD), mixed modality, clinical checks and instructions entered by the user.',
    'GuillePD puede ofrecer en el futuro funciones gratuitas y pagas. Antes de cualquier cobro se informarán precio, alcance, renovación y condiciones de cancelación, conforme a la normativa aplicable. Esta versión de prueba no habilita cobros.':'GuillePD may offer free and paid features in the future. Before any charge, the price, scope, renewal and cancellation conditions will be disclosed in accordance with applicable regulations. This trial version does not enable payments.',
    'GuillePD utiliza proveedores tecnológicos, actualmente':'GuillePD uses technology providers, currently',
    'GuillePD no brinda diagnóstico, prescripción ni consejo médico, no controla una cicladora y no reemplaza al nefrólogo, al equipo tratante ni a los servicios de emergencia.':'GuillePD does not provide diagnosis, prescriptions or medical advice, does not control a cycler, and does not replace a nephrologist, care team or emergency services.',
    'Las decisiones sobre soluciones, volúmenes, tiempos, medicación y tratamiento pertenecen exclusivamente a profesionales habilitados.':'Decisions about solutions, volumes, timing, medication and treatment belong exclusively to licensed professionals.',
    'La persona usuaria es responsable de verificar los datos antes de guardarlos y de revisar los informes antes de compartirlos. Los cálculos automáticos dependen de la información ingresada. Ante discrepancias, deben prevalecer las indicaciones y registros del equipo tratante.':'The user is responsible for verifying data before saving it and reviewing reports before sharing them. Automatic calculations depend on the information entered. If there is any discrepancy, the care team’s instructions and records take precedence.',
    'La aplicación puede trabajar localmente y sincronizar cuando existe conexión. La sincronización puede demorarse o interrumpirse por problemas de red, del dispositivo o de servicios externos. Se recomienda conservar respaldos periódicos y no utilizar GuillePD como única copia de información esencial.':'The application can work locally and synchronize when connected. Synchronization may be delayed or interrupted by network, device or third-party service issues. Keep regular backups and do not use GuillePD as the only copy of essential information.',
    'GuillePD no vende datos de salud ni los utiliza para publicidad médica personalizada.':'GuillePD does not sell health data or use it for personalized medical advertising.',
    'Los datos se utilizan para operar la cuenta, conservar y sincronizar registros, generar informes, ofrecer soporte, proteger el servicio y mejorar su estabilidad.':'Data is used to operate the account, store and synchronize records, generate reports, provide support, protect the service and improve its stability.',
    'Parte de la información se conserva en el dispositivo para permitir el uso sin conexión. Cuando la cuenta está iniciada, los datos pueden sincronizarse con la nube. Los cambios realizados sin conexión se mantienen localmente y se intentan sincronizar al recuperar conectividad.':'Some information is stored on the device to allow offline use. When signed in, data may be synchronized to the cloud. Offline changes remain local and synchronization is attempted when connectivity returns.',
    'Los datos de menores deben ser administrados por sus representantes legales o cuidadores debidamente autorizados. GuillePD no busca que menores creen cuentas de manera autónoma.':'Data about minors must be managed by their legal representatives or duly authorized caregivers. GuillePD is not intended for minors to create accounts independently.',
    'Se aplican controles de acceso por usuario, conexiones cifradas y medidas razonables de seguridad. Ningún sistema es invulnerable; por eso se recomienda usar una contraseña única, mantener los dispositivos protegidos y realizar respaldos.':'Per-user access controls, encrypted connections and reasonable security measures are applied. No system is invulnerable; use a unique password, keep devices protected and make backups.',
    'Las modificaciones relevantes se informarán en la aplicación. Cuando corresponda, se solicitará una nueva aceptación antes de continuar.':'Relevant changes will be announced in the application. When appropriate, renewed acceptance will be requested before continuing.'
    ,'Completá fecha, peso de bolsa llena, cantidad indicada y peso al cerrar.':'Complete the date, full bag weight, prescribed amount and weight when closed.'
    ,'Infusión guardada. Después entrá a Historial y tocá “Cargar drenaje”.':'Infusion saved. Later, open History and tap “Record drain”.'
    ,'Primero completá y guardá los datos de infusión del intercambio.':'First complete and save the exchange infusion data.'
    ,'Ingresá el peso de la bolsa de drenaje vacía.':'Enter the empty drain bag weight.'
    ,'Peso de la bolsa vacía guardado. El intercambio queda pendiente hasta cargar la bolsa llena.':'Empty bag weight saved. The exchange remains pending until the full bag is entered.'
    ,'Para cerrar el intercambio faltan datos de infusión o drenaje. Los controles clínicos son opcionales.':'Infusion or drainage data is missing. Clinical controls are optional.'
    ,'Intercambio finalizado y guardado.':'Exchange completed and saved.'
    ,'¿Eliminar este intercambio?':'Delete this exchange?'
    ,'Ingresá el nombre del paciente.':'Enter the patient’s name.'
    ,'Los intercambios diarios deben ser un número entre 1 y 12.':'Daily exchanges must be a number between 1 and 12.'
    ,'Configuración del paciente guardada.':'Patient settings saved.'
    ,'Ingresá al menos un dato del control prediálisis.':'Enter at least one pre-dialysis control value.'
    ,'Ingresá al menos un dato del control posdiálisis.':'Enter at least one post-dialysis control value.'
    ,'Control prediálisis guardado.':'Pre-dialysis control saved.'
    ,'Control posdiálisis guardado.':'Post-dialysis control saved.'
    ,'Control prediálisis guardado. Podés iniciar el primer intercambio más tarde.':'Pre-dialysis control saved. You can start the first exchange later.'
    ,'El control prediálisis de este día ya está guardado. Podés corregirlo o continuar con el intercambio.':'This day’s pre-dialysis control is already saved. You can edit it or continue with the exchange.'
    ,'Seleccioná la fecha y hora del control.':'Select the control date and time.'
    ,'Datos recuperados y actualizados correctamente.':'Data recovered and updated successfully.'
    ,'Todos los datos están actualizados en tus dispositivos.':'All data is up to date across your devices.'
    ,'Los cambios quedan guardados en este dispositivo y se enviarán al recuperar conexión.':'Changes remain saved on this device and will be sent when connectivity returns.'
    ,'Los cambios se guardan en este dispositivo y se sincronizarán al recuperar conexión.':'Changes are saved on this device and will sync when connectivity returns.'
    ,'Iniciá sesión para sincronizar.':'Sign in to synchronize.'
    ,'El correo o la contraseña no son correctos.':'The email or password is incorrect.'
    ,'Primero confirmá la cuenta desde el correo que te enviamos.':'First confirm the account using the email we sent you.'
    ,'Ya existe una cuenta con ese correo. Usá “Iniciar sesión”.':'An account already exists for that email. Use “Sign in”.'
    ,'La contraseña debe tener al menos 6 caracteres.':'The password must be at least 6 characters long.'
    ,'Revisá que el correo esté escrito correctamente.':'Check that the email address is entered correctly.'
    ,'No se pudo completar la operación. Intentá nuevamente.':'The operation could not be completed. Try again.'
    ,'Ingresá un correo válido y una contraseña de al menos 6 caracteres.':'Enter a valid email and a password of at least 6 characters.'
    ,'Creando la cuenta…':'Creating account…'
    ,'Cuenta creada. Revisá tu correo y tocá el enlace de confirmación para ingresar.':'Account created. Check your email and tap the confirmation link to sign in.'
    ,'Para crear la cuenta tenés que aceptar los Términos y la Política de Privacidad.':'You must accept the Terms and Privacy Policy to create an account.'
    ,'Te enviamos un correo para cambiar la contraseña.':'We sent you an email to change your password.'
    ,'Escribí primero el correo de tu cuenta.':'Enter your account email first.'
    ,'Sesión cerrada. Los datos permanecen guardados en este dispositivo.':'Signed out. Data remains saved on this device.'
    ,'No se pudo sincronizar ahora. Los datos siguen guardados en este dispositivo.':'Unable to synchronize now. Data remains saved on this device.'
    ,'La cuenta no está disponible sin conexión. La aplicación local sigue funcionando.':'The account is unavailable offline. The local app continues to work.'
    ,'No se pudo conectar. La copia local continúa disponible.':'Unable to connect. The local copy remains available.'
    ,'Guardar automático activo en este navegador.':'Automatic saving is active in this browser.'
    ,'Guardado automático activo en este navegador.':'Automatic saving is active in this browser.'
    ,'No se pudo abrir el menu de compartir. El PDF se descargó.':'The share menu could not be opened. The PDF was downloaded.'
    ,'El navegador no permite compartir archivos directamente. El PDF se descargó para que puedas enviarlo por WhatsApp desde Archivos.':'The browser cannot share files directly. The PDF was downloaded so you can send it from your files app.'
    ,'No se pudo leer el archivo seleccionado.':'The selected file could not be read.'
    ,'El archivo está vacío.':'The file is empty.'
    ,'El contenido no es un objeto JSON.':'The content is not a JSON object.'
    ,'El respaldo no contiene pacientes.':'The backup contains no patients.'
    ,'El archivo no contiene pacientes ni intercambios reconocibles.':'The file contains no recognizable patients or exchanges.'
    ,'Esto eliminará todos los registros guardados en este navegador.':'This will delete all records saved in this browser.'
    ,'Debe quedar al menos un paciente.':'At least one patient must remain.'
    ,'Ingresá la fecha de inicio de vigencia.':'Enter the effective start date.'
    ,'Ingresá la duración total indicada.':'Enter the prescribed total duration.'
    ,'Ingresá la cantidad de ciclos.':'Enter the number of cycles.'
    ,'Ingresá el volumen por ciclo.':'Enter the volume per cycle.'
    ,'Ingresá el volumen del último llenado.':'Enter the last fill volume.'
    ,'La finalización de vigencia no puede ser anterior al inicio.':'The effective end date cannot be before the start date.'
    ,'Seleccioná un programa APD activo.':'Select an active APD program.'
    ,'Ya hay un tratamiento APD en curso.':'There is already an APD treatment in progress.'
    ,'Ingresá la hora de inicio.':'Enter the start time.'
    ,'Tratamiento APD iniciado.':'APD treatment started.'
    ,'No hay un tratamiento APD en curso.':'There is no APD treatment in progress.'
    ,'Ingresá la hora de finalización.':'Enter the end time.'
    ,'La finalización no puede ser anterior al inicio.':'The end time cannot be before the start time.'
    ,'Ingresá el ultrafiltrado total informado por la cicladora.':'Enter the total ultrafiltration reported by the cycler.'
    ,'Tratamiento APD finalizado y guardado.':'APD treatment completed and saved.'
    ,'Registro APD eliminado.':'APD record deleted.'
    ,'Seleccioná Cicladora (APD) o Mixto en Ajustes.':'Select Cycler (APD) or Mixed in Settings.'
    ,'Indicación manual actual':'Current manual prescription'
    ,'El registro CAPD mantiene exactamente la configuración y los cálculos que ya utiliza GuillePD.':'The CAPD record keeps exactly the settings and calculations already used by GuillePD.'
    ,'Intercambios diarios':'Daily exchanges'
    ,'Volumen habitual':'Usual volume'
    ,'Modalidad seleccionada':'Selected modality'
    ,'Los parámetros manuales continúan administrándose desde Ajustes. Esta versión no modifica su funcionamiento.':'Manual parameters continue to be managed from Settings. This version does not change how they work.'
    ,'Tratamiento mixto':'Mixed treatment'
    ,'La modalidad Mixta combina el programa APD vigente con los intercambios manuales ya configurados.':'Mixed modality combines the current APD program with the configured manual exchanges.'
    ,'Programa APD activo':'Active APD program'
    ,'Intercambios manuales':'Manual exchanges'
    ,'Volumen manual habitual':'Usual manual volume'
    ,'Unificado por día':'Unified by day'
    ,'No se duplican indicaciones: APD utiliza su prescripción versionada y CAPD conserva los parámetros manuales actuales.':'Prescriptions are not duplicated: APD uses its versioned prescription and CAPD keeps the current manual parameters.'
    ,'Todavía no hay prescripciones APD guardadas.':'No APD prescriptions have been saved yet.'
    ,'Completá los datos al finalizar':'Complete the data at the end'
    ,'El registro APD de hoy está completo.':'Today’s APD record is complete.'
    ,'Podés iniciar el tratamiento cuando corresponda.':'You can start treatment when appropriate.'
    ,'Sin tratamiento APD activo':'No active APD treatment'
    ,'Tratamiento APD finalizado':'APD treatment completed'
    ,'Tratamiento APD en curso':'APD treatment in progress'
    ,'Finalización':'End'
    ,'Última UF':'Latest UF'
    ,', bajo la marca personal':', under the personal brand'
    ,', titular de GuillePD, desarrollada bajo la marca':', owner of GuillePD, developed under the brand'
    ,'. Al crear una cuenta, iniciar sesión o utilizar el servicio, la persona usuaria declara haber leído y aceptado estos Términos y la Política de Privacidad.':'. By creating an account, signing in or using the service, the user declares that they have read and accepted these Terms and the Privacy Policy.'
    ,'. Esta Política explica cómo se tratan los datos al utilizar la aplicación y su sincronización.':'. This Policy explains how data is processed when using the application and its synchronization features.'
    ,'Datos de cuenta, como correo electrónico, identificador y datos técnicos de sesión.':'Account data, such as email address, identifier and technical session data.'
    ,'Datos de salud y tratamiento, incluidos intercambios, APD, controles, prescripciones, observaciones e informes.':'Health and treatment data, including exchanges, APD, controls, prescriptions, notes and reports.'
    ,'Datos del paciente y del cuidador que la persona usuaria decida cargar.':'Patient and caregiver data the user chooses to enter.'
    ,'Datos legales pendientes:':'Pending legal information:'
    ,'Datos técnicos necesarios para seguridad, sincronización y diagnóstico de errores.':'Technical data required for security, synchronization and troubleshooting.'
    ,'Dentro de los límites permitidos por la ley, GuillePD y su titular no responden por decisiones clínicas tomadas sin consulta profesional, errores de carga, pérdida derivada de falta de respaldo, fallas de conexión o indisponibilidad de terceros. Esta cláusula no limita derechos inderogables de consumidores ni responsabilidades que legalmente no puedan excluirse.':'To the extent permitted by law, GuillePD and its owner are not liable for clinical decisions made without professional advice, data entry errors, loss caused by lack of backup, connection failures or third-party unavailability. This clause does not limit non-waivable consumer rights or liabilities that cannot legally be excluded.'
    ,'El correo público para consultas de privacidad, el CUIT y el domicilio legal se incorporarán antes del lanzamiento comercial.':'A public privacy contact email, tax ID and legal address will be added before commercial launch.'
    ,'el CUIT, domicilio legal y correo público de GuillePD se incorporarán antes de habilitar formalmente suscripciones o cobros.':'the tax ID, legal address and public GuillePD email will be added before subscriptions or payments are formally enabled.'
    ,'El nombre GuillePD, su identidad visual, diseño, textos y software pertenecen a su titular o se utilizan con autorización. El acceso al servicio no transfiere derechos de propiedad intelectual.':'The GuillePD name, visual identity, design, text and software belong to its owner or are used with authorization. Access to the service does not transfer intellectual property rights.'
    ,'El período del informe acompaña automáticamente al período mostrado en el resumen.':'The report period automatically follows the period shown in the summary.'
    ,'El responsable del tratamiento es':'The data controller is'
    ,'El tratamiento se realiza con el consentimiento y la solicitud de la persona usuaria, para prestar las funciones contratadas o elegidas y para cumplir obligaciones legales. Quien carga datos de otra persona declara contar con autorización o representación suficiente.':'Processing is performed with the user’s consent and request, to provide the selected or contracted functions and comply with legal obligations. Anyone entering another person’s data declares that they have sufficient authorization or representation.'
    ,'Estos Términos se rigen por las leyes de la República Argentina, incluyendo la Ley 24.240 de Defensa del Consumidor y la Ley 25.326 de Protección de Datos Personales cuando correspondan. Se respetarán las jurisdicciones obligatorias previstas por la normativa aplicable.':'These Terms are governed by the laws of the Argentine Republic, including Consumer Protection Law 24,240 and Personal Data Protection Law 25,326 where applicable. Mandatory jurisdictions established by applicable law will be respected.'
    ,'Inicio y finalización del tratamiento indicado por el nefrólogo.':'Start and completion of the treatment prescribed by the nephrologist.'
    ,'La persona titular podrá solicitar acceso, rectificación, actualización, exportación o supresión de sus datos, así como retirar su consentimiento cuando corresponda. El canal formal se publicará antes del lanzamiento comercial.':'The data subject may request access, correction, updating, export or deletion of their data, and withdraw consent where applicable. The formal contact channel will be published before commercial launch.'
    ,'La persona usuaria debe proporcionar datos correctos, proteger su contraseña y comunicar accesos no autorizados. Las cuentas son personales. Si se registran datos de un menor o de otra persona, quien utiliza GuillePD declara ser su representante, cuidador autorizado o contar con permiso suficiente.':'The user must provide accurate data, protect their password and report unauthorized access. Accounts are personal. When recording data for a minor or another person, the user declares that they are the representative, authorized caregiver or otherwise have sufficient permission.'
    ,'Los datos se conservarán mientras la cuenta permanezca activa o durante el tiempo necesario para prestar el servicio, atender solicitudes, resolver incidentes y cumplir obligaciones legales. La eliminación de la aplicación de un dispositivo no elimina automáticamente la copia sincronizada.':'Data will be retained while the account remains active or as long as needed to provide the service, handle requests, resolve incidents and comply with legal obligations. Removing the application from a device does not automatically delete the synchronized copy.'
    ,'No está permitido utilizar el servicio para acceder a cuentas ajenas, alterar su seguridad, cargar contenido ilícito, revender accesos sin autorización ni presentar la aplicación como reemplazo de atención médica profesional.':'The service may not be used to access other people’s accounts, compromise security, upload unlawful content, resell access without authorization or present the application as a substitute for professional medical care.'
    ,'para alojamiento y distribución. Estos servicios pueden procesar datos en otros países bajo sus medidas contractuales y de seguridad. Solo reciben la información necesaria para prestar sus servicios.':'for hosting and distribution. These services may process data in other countries under their contractual and security safeguards. They receive only the information needed to provide their services.'
    ,'para autenticación y base de datos, y':'for authentication and database services, and'
    ,'Para registrar APD, seleccioná':'To record APD, select'
    ,'Podrán suspenderse cuentas ante incumplimientos, riesgos de seguridad o exigencias legales. La persona usuaria podrá solicitar acceso, exportación, corrección o eliminación de sus datos, sujeto a obligaciones legales y técnicas aplicables.':'Accounts may be suspended for violations, security risks or legal requirements. Users may request access, export, correction or deletion of their data, subject to applicable legal and technical obligations.'
    ,'Se guarda en el historial diario y no permanece visible en el Home.':'It is saved in the daily history and does not remain visible on Home.'
    ,'Se procura mantener el servicio disponible y seguro, pero no se garantiza funcionamiento ininterrumpido ni ausencia absoluta de errores. Podrán realizarse actualizaciones, mantenimiento o cambios necesarios para seguridad, estabilidad y evolución del producto.':'Reasonable efforts are made to keep the service available and secure, but uninterrupted operation or complete absence of errors is not guaranteed. Updates, maintenance or changes may be made as needed for security, stability and product development.'
    ,'Tratamientos de hoy':'Today’s treatments'
    ,'Versión 1.0 · Vigente desde el 1 de agosto de 2026':'Version 1.0 · Effective August 1, 2026'
    ,'y la':'and the'
  };

  const sourceText=new WeakMap();
  const renderedText=new WeakMap();
  const sourceAttrs=new WeakMap();
  let observer=null;

  function language(){
    try{return root&&root.profile&&root.profile.language==='en'?'en':'es'}catch(_){return 'es'}
  }
  function locale(){return language()==='en'?'en-US':'es-AR'}
  function format(template,params){
    return String(template).replace(/\{(\w+)\}/g,(_,key)=>params&&params[key]!==undefined?params[key]:`{${key}}`);
  }
  function t(key,params){
    const selected=dictionaries[language()]||dictionaries.es;
    return format(selected[key]??dictionaries.es[key]??key,params);
  }
  function translateExact(value){
    if(language()!=='en')return value;
    const trimmed=String(value).trim();
    if(!trimmed)return value;
    const keyed=Object.keys(dictionaries.es).find(key=>dictionaries.es[key]===trimmed);
    if(keyed&&dictionaries.en[keyed])return dictionaries.en[keyed];
    if(EN[trimmed])return EN[trimmed];

    let match;
    if((match=trimmed.match(/^Hola,\s*(.+)$/)))return `Hello, ${match[1]}`;
    if((match=trimmed.match(/^(\d+) de (\d+) intercambios$/)))return `${match[1]} of ${match[2]} exchanges`;
    if((match=trimmed.match(/^Intercambio (.+) · (.+)$/)))return `Exchange ${match[1]} · ${EN[match[2]]||match[2]}`;
    if((match=trimmed.match(/^Intercambio (.+)$/)))return `Exchange ${match[1]}`;
    if((match=trimmed.match(/^(\d+)\. (.+)$/))&&EN[match[2]])return `${match[1]}. ${EN[match[2]]}`;
    if((match=trimmed.match(/^Drenaje previsto a las (.+)\.$/)))return `Drain scheduled for ${match[1]}.`;
    if((match=trimmed.match(/^Hoy (.+) · Intercambio (.+)$/)))return `Today ${match[1]} · Exchange ${match[2]}`;
    if((match=trimmed.match(/^Vencido hace (\d+) h (\d+) min · Intercambio (.+)$/)))return `Overdue by ${match[1]} h ${match[2]} min · Exchange ${match[3]}`;
    if((match=trimmed.match(/^Vencido hace (\d+) min · Intercambio (.+)$/)))return `Overdue by ${match[1]} min · Exchange ${match[2]}`;
    if((match=trimmed.match(/^Faltan (\d+) intercambios? para completar el objetivo\.$/)))return `${match[1]} exchange${match[1]==='1'?'':'s'} remaining to complete the goal.`;
    if((match=trimmed.match(/^(\d+) intercambios? registrados? hoy\.$/)))return `${match[1]} exchange${match[1]==='1'?'':'s'} recorded today.`;
    if((match=trimmed.match(/^Página (\d+) de (\d+)$/)))return `Page ${match[1]} of ${match[2]}`;
    if((match=trimmed.match(/^Desde (.+)$/)))return `From ${match[1]}`;
    if((match=trimmed.match(/^Vigencia: (.+)$/)))return `Effective period: ${match[1]}`;
    if((match=trimmed.match(/^Inicio (.+) · (.+)$/)))return `Start ${match[1]} · ${match[2]}`;
    if((match=trimmed.match(/^Iniciado a las (.+)\.$/)))return `Started at ${match[1]}.`;
    if((match=trimmed.match(/^Último tratamiento finalizado a las (.+)\.$/)))return `Latest treatment completed at ${match[1]}.`;
    if((match=trimmed.match(/^Máx\. (.+)$/)))return `Max. ${match[1]}`;
    if((match=trimmed.match(/^No hay datos registrados para (.+)\.$/)))return `No data was recorded for ${match[1]}.`;
    if((match=trimmed.match(/^¿Eliminar a (.+) y todos sus registros\?$/)))return `Delete ${match[1]} and all records?`;
    if((match=trimmed.match(/^Modalidad (.+) seleccionada\.$/)))return `${EN[match[1]]||match[1]} modality selected.`;
    if((match=trimmed.match(/^Programa APD N\.º (\d+)$/)))return `APD Program No. ${match[1]}`;
    if((match=trimmed.match(/^El intercambio (.+) ya alcanzó el horario previsto de drenaje\.$/)))return `Exchange ${match[1]} has reached its scheduled drain time.`;
    if((match=trimmed.match(/^Inicio: (.+) · (.+)$/)))return `Start: ${match[1]} · ${match[2]}`;
    return value;
  }
  function preserveWhitespace(original,translated){
    const leading=String(original).match(/^\s*/)?.[0]||'';
    const trailing=String(original).match(/\s*$/)?.[0]||'';
    return leading+String(translated).trim()+trailing;
  }
  function applyTextNode(node){
    if(!node||!node.parentElement||['SCRIPT','STYLE','NOSCRIPT'].includes(node.parentElement.tagName))return;
    const current=node.nodeValue;
    const last=renderedText.get(node);
    if(!sourceText.has(node)||current!==last)sourceText.set(node,current);
    const source=sourceText.get(node);
    const output=language()==='en'?preserveWhitespace(source,translateExact(source)):source;
    if(current!==output)node.nodeValue=output;
    renderedText.set(node,output);
  }
  function applyAttributes(element){
    if(!element||element.nodeType!==1)return;
    const translationKey=element.getAttribute('data-i18n');
    if(translationKey){
      const translated=t(translationKey);
      if(element.textContent!==translated)element.textContent=translated;
    }
    const placeholderKey=element.getAttribute('data-i18n-placeholder');
    if(placeholderKey){
      const translated=t(placeholderKey);
      if(element.getAttribute('placeholder')!==translated)element.setAttribute('placeholder',translated);
    }
    const attrs=['placeholder','title','aria-label'];
    let store=sourceAttrs.get(element);
    if(!store){store={};sourceAttrs.set(element,store)}
    for(const name of attrs){
      if(!element.hasAttribute(name))continue;
      const current=element.getAttribute(name);
      const rendered=store[name]?.rendered;
      if(!store[name]||current!==rendered)store[name]={source:current,rendered:current};
      const source=store[name].source;
      const output=language()==='en'?translateExact(source):source;
      if(current!==output)element.setAttribute(name,output);
      store[name].rendered=output;
    }
  }
  function applyNode(node){
    if(!node)return;
    if(node.nodeType===3){applyTextNode(node);return}
    if(node.nodeType!==1&&node.nodeType!==9&&node.nodeType!==11)return;
    if(node.nodeType===1)applyAttributes(node);
    const walker=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    let item;
    while((item=walker.nextNode())){
      if(item.nodeType===3)applyTextNode(item);else applyAttributes(item);
    }
  }
  function apply(){
    document.documentElement.lang=language();
    applyNode(document.body);
    const selected=document.querySelector(`input[name="appLanguage"][value="${language()}"]`);
    if(selected)selected.checked=true;
    if(window.GuillePDNotifications)window.GuillePDNotifications.renderSettings();
  }
  function setLanguage(next,{persist:shouldPersist=true}={}){
    const normalized=next==='en'?'en':'es';
    try{
      root.profile=(root.profile&&typeof root.profile==='object')?root.profile:{};
      root.profile.language=normalized;
      if(shouldPersist&&typeof persist==='function')persist();
    }catch(_){}
    if(typeof renderAll==='function')renderAll();
    else apply();
    return normalized;
  }
  function translateRuntime(value){return language()==='en'?translateExact(String(value)):String(value)}
  function wrapDialogs(){
    if(window.__guillepdI18nDialogs)return;
    window.__guillepdI18nDialogs=true;
    const alertFn=window.alert.bind(window);
    const confirmFn=window.confirm.bind(window);
    window.alert=message=>alertFn(translateRuntime(message));
    window.confirm=message=>confirmFn(translateRuntime(message));
  }
  function wrapPdf(){
    if(window.__guillepdI18nPdf||typeof window.pdfText!=='function')return;
    window.__guillepdI18nPdf=true;
    const original=window.pdfText;
    window.pdfText=function(stream,x,y,text,size,bold){
      return original(stream,x,y,translateRuntime(text),size,bold);
    };
  }
  function startObserver(){
    if(observer)return;
    observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='characterData')applyTextNode(mutation.target);
        else for(const node of mutation.addedNodes)applyNode(node);
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  function init(){wrapDialogs();wrapPdf();apply();startObserver()}

  window.GuillePDI18n={dictionaries,legacyEnglish:EN,t,language,locale,setLanguage,translate:translateRuntime,apply};
  window.selectAppLanguage=function(value){setLanguage(value)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
