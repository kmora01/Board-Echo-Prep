/* ============================================================
   EchoBoard — Banco de preguntas ORIGINAL
   Preguntas escritas de novo sobre el temario del examen de
   ecocardiografía (física, valvulopatías, función VI/VD,
   hemodinámica, miocardiopatías, congénitas, TEE, strain/3D).
   No reproduce ningún libro con derechos de autor: los conceptos
   y valores de corte de las guías ASE son de dominio público.

   Cómo AÑADIR preguntas: copia un objeto del array STATIC_QUESTIONS
   y edítalo. Cada opción lleva su propia explicación (e), que se
   muestra para TODAS las opciones en el modo entrenamiento.
   ============================================================ */

const CATEGORIES = [
  { id: 'fisica',          name: 'Física e Instrumentación',        color: '#38bdf8' },
  { id: 'hemodinamica',    name: 'Hemodinámica y Doppler',          color: '#5eead4' },
  { id: 'sistolica',       name: 'Función Sistólica del VI',        color: '#34d399' },
  { id: 'diastolica',      name: 'Función Diastólica del VI',       color: '#a78bfa' },
  { id: 'aortica',         name: 'Valvulopatía Aórtica',            color: '#f472b6' },
  { id: 'mitral',          name: 'Valvulopatía Mitral',             color: '#fbbf24' },
  { id: 'tricuspide',      name: 'Válvula Tricúspide y Pulmonar',   color: '#22d3ee' },
  { id: 'protesis',        name: 'Válvulas Protésicas',             color: '#fb7185' },
  { id: 'miocardiopatias', name: 'Miocardiopatías',                 color: '#4ade80' },
  { id: 'pericardio',      name: 'Enfermedad Pericárdica',          color: '#c084fc' },
  { id: 'congenitas',      name: 'Cardiopatías Congénitas',         color: '#60a5fa' },
  { id: 'aorta',           name: 'Enfermedad de la Aorta',          color: '#f59e0b' },
  { id: 'masas',           name: 'Masas Cardíacas y Embolia',       color: '#2dd4bf' },
  { id: 'endocarditis',    name: 'Endocarditis',                    color: '#f87171' },
  { id: 'derecho',         name: 'Corazón Derecho e HTP',           color: '#818cf8' },
  { id: 'isquemia',        name: 'Isquemia y Eco de Estrés',        color: '#fca5a5' },
  { id: 'tee',             name: 'Ecocardiografía Transesofágica',  color: '#93c5fd' },
  { id: 'strain3d',        name: 'Strain, 3D e Imagen Avanzada',    color: '#fde68a' },
];

/* -------- Preguntas conceptuales (opción: t=texto, ok=correcta, e=explicación) -------- */
const STATIC_QUESTIONS = [
  /* ===== FÍSICA ===== */
  { id: 'fis-01', cat: 'fisica', dif: 'básico',
    q: 'Un operador cambia de un transductor de 2 MHz a uno de 5 MHz para evaluar una estructura. ¿Cuál es el efecto esperado?',
    ref: 'Compromiso frecuencia–resolución–penetración',
    opts: [
      { t: 'Mejora la resolución axial pero disminuye la penetración', ok: true,  e: 'Correcto. Mayor frecuencia = menor longitud de onda = mejor resolución axial, pero mayor atenuación = menor penetración. Es el compromiso fundamental del ultrasonido.' },
      { t: 'Mejora la penetración pero empeora la resolución axial', ok: false, e: 'Al revés: la penetración disminuye al subir la frecuencia porque la atenuación aumenta con la frecuencia.' },
      { t: 'No cambia la resolución, solo la ganancia', ok: false, e: 'La frecuencia sí determina la resolución axial a través de la longitud de onda/pulso; no es un simple ajuste de ganancia.' },
      { t: 'Mejora tanto la resolución como la penetración', ok: false, e: 'No es posible optimizar ambas subiendo la frecuencia: existe un compromiso inherente entre ellas.' },
    ]},
  { id: 'fis-02', cat: 'fisica', dif: 'intermedio',
    q: '¿Qué determina principalmente la resolución axial en ecocardiografía?',
    ref: 'Resolución axial vs lateral',
    opts: [
      { t: 'La longitud del pulso espacial (a menor longitud, mejor resolución)', ok: true, e: 'Correcto. La resolución axial ≈ ½ de la longitud del pulso espacial; pulsos más cortos (mayor frecuencia, menos "ringing") la mejoran.' },
      { t: 'El ancho del haz en la zona focal', ok: false, e: 'Eso determina la resolución lateral, que es mejor en la zona focal, no la resolución axial.' },
      { t: 'La frecuencia de repetición de pulsos (PRF)', ok: false, e: 'La PRF afecta el límite de Nyquist y la profundidad no ambigua, no la resolución axial.' },
      { t: 'La densidad de líneas de barrido', ok: false, e: 'La densidad de líneas influye en la resolución lateral y temporal, no en la axial.' },
    ]},
  { id: 'fis-03', cat: 'fisica', dif: 'intermedio',
    q: 'El aliasing en Doppler pulsado ocurre cuando…',
    ref: 'Límite de Nyquist',
    opts: [
      { t: 'El desplazamiento Doppler supera el límite de Nyquist (½ de la PRF)', ok: true, e: 'Correcto. Por encima de PRF/2 la señal se "envuelve" (wrap-around) y aparece aliasing. Bajar la profundidad o la línea de base ayuda.' },
      { t: 'La velocidad es demasiado baja para ser detectada', ok: false, e: 'El aliasing es un problema de velocidades altas, no bajas.' },
      { t: 'El ángulo de insonación es 0°', ok: false, e: 'Un ángulo de 0° optimiza la medición; no causa aliasing por sí mismo.' },
      { t: 'Se utiliza Doppler continuo', ok: false, e: 'El Doppler continuo no presenta aliasing porque no muestrea de forma intermitente (a cambio pierde resolución en profundidad).' },
    ]},
  { id: 'fis-04', cat: 'fisica', dif: 'básico',
    q: 'Comparado con el Doppler pulsado (PW), el Doppler continuo (CW)…',
    ref: 'CW vs PW',
    opts: [
      { t: 'Mide velocidades altas sin aliasing pero pierde resolución en profundidad', ok: true, e: 'Correcto. El CW integra toda la línea de interrogación (ambigüedad de rango) pero no tiene aliasing; es ideal para gradientes altos (EAo, IT).' },
      { t: 'Permite localizar la profundidad exacta de la señal', ok: false, e: 'Esa es una ventaja del PW; el CW tiene ambigüedad de rango (no localiza).' },
      { t: 'Está limitado por el límite de Nyquist', ok: false, e: 'El CW no muestrea de forma intermitente, por lo que no tiene límite de Nyquist.' },
      { t: 'No sirve para medir estenosis aórtica', ok: false, e: 'Precisamente el CW es el método de elección para las velocidades altas de la estenosis aórtica.' },
    ]},
  { id: 'fis-05', cat: 'fisica', dif: 'intermedio',
    q: 'Al medir una velocidad con un ángulo de insonación de 60° respecto al flujo, la velocidad real será…',
    ref: 'Ecuación Doppler y ángulo',
    opts: [
      { t: 'Subestimada en ~50% (cos 60° = 0,5)', ok: true, e: 'Correcto. v_medida = v_real × cos θ. A 60°, cos = 0,5, se subestima ~50%. Por eso se busca un ángulo <20° (cos 20° ≈ 0,94).' },
      { t: 'Sobreestimada en un 50%', ok: false, e: 'El ángulo produce subestimación, nunca sobreestimación de la velocidad.' },
      { t: 'Igual a la real porque el ángulo no importa', ok: false, e: 'El ángulo sí importa: la velocidad se subestima según cos θ.' },
      { t: 'Subestimada solo un 6%', ok: false, e: 'Esa subestimación (~6%) corresponde a un ángulo de ~20°, no de 60°.' },
    ]},
  { id: 'fis-06', cat: 'fisica', dif: 'básico',
    q: 'El imaging armónico tisular mejora la calidad de imagen principalmente porque…',
    ref: 'Imaging armónico',
    opts: [
      { t: 'Aumenta la relación señal/ruido y define mejor el borde endocárdico', ok: true, e: 'Correcto. Los armónicos se generan en el tejido al doble de la frecuencia transmitida, reduciendo artefactos de campo cercano y reverberación.' },
      { t: 'Aumenta la frecuencia de cuadros (frame rate)', ok: false, e: 'No es su mecanismo; el frame rate depende de profundidad, sector y densidad de líneas.' },
      { t: 'Elimina por completo el aliasing', ok: false, e: 'El imaging armónico es de escala de grises (2D); no afecta el aliasing del Doppler.' },
      { t: 'Reduce el índice mecánico a cero', ok: false, e: 'No anula el índice mecánico ni ese es su objetivo.' },
    ]},
  { id: 'fis-07', cat: 'fisica', dif: 'intermedio',
    q: '¿Qué cambio mejora la resolución temporal (frame rate)?',
    ref: 'Resolución temporal',
    opts: [
      { t: 'Reducir la profundidad y estrechar el sector de imagen', ok: true, e: 'Correcto. Menos profundidad y un sector más estrecho (menor densidad de líneas) permiten más cuadros por segundo.' },
      { t: 'Aumentar la profundidad de exploración', ok: false, e: 'Mayor profundidad alarga el tiempo de ida y vuelta del pulso y reduce el frame rate.' },
      { t: 'Añadir múltiples zonas focales', ok: false, e: 'Cada zona focal exige más disparos por línea y baja el frame rate.' },
      { t: 'Ampliar el sector al máximo', ok: false, e: 'Un sector más ancho requiere más líneas y reduce el frame rate.' },
    ]},

  /* ===== HEMODINÁMICA (conceptual; los cálculos están en los generadores) ===== */
  { id: 'hem-01', cat: 'hemodinamica', dif: 'avanzado',
    q: 'La ecuación simplificada de Bernoulli (ΔP = 4V²) puede sobreestimar el gradiente cuando…',
    ref: 'Bernoulli — límites',
    opts: [
      { t: 'La velocidad proximal es alta (>1,5 m/s) y no se resta; debe usarse 4(V₂² − V₁²)', ok: true, e: 'Correcto. Con TSVI de alta velocidad (estados hiperdinámicos, estenosis en serie) hay que usar la forma ampliada para no sobreestimar.' },
      { t: 'La velocidad proximal es despreciable (<1 m/s)', ok: false, e: 'En ese caso la simplificación 4V² es válida y no sobreestima.' },
      { t: 'Se mide con Doppler continuo bien alineado', ok: false, e: 'Una buena alineación mejora la exactitud; no es causa de sobreestimación.' },
      { t: 'El flujo es laminar y único', ok: false, e: 'Esas son condiciones ideales para aplicar 4V².' },
    ]},
  { id: 'hem-02', cat: 'hemodinamica', dif: 'avanzado',
    q: 'El fenómeno de "recuperación de presión" (pressure recovery) tiende a…',
    ref: 'Pressure recovery',
    opts: [
      { t: 'Hacer que el Doppler sobreestime el gradiente frente al catéter, sobre todo con aorta ascendente pequeña o algunas prótesis', ok: true, e: 'Correcto. Parte de la energía cinética se reconvierte en presión distal; el Doppler mide el pico y puede dar un gradiente mayor que el del cateterismo.' },
      { t: 'Hacer que el Doppler subestime siempre el gradiente', ok: false, e: 'El efecto va en sentido de sobreestimación por Doppler respecto al catéter.' },
      { t: 'No tener relevancia clínica en ningún escenario', ok: false, e: 'Es relevante en aorta ascendente pequeña y en algunas prótesis mecánicas bivalvas.' },
      { t: 'Ocurrir únicamente en la válvula mitral', ok: false, e: 'Es un fenómeno clásico del tracto de salida/aorta, no específico de la mitral.' },
    ]},

  /* ===== FUNCIÓN SISTÓLICA ===== */
  { id: 'sis-01', cat: 'sistolica', dif: 'básico',
    q: 'Según la ASE, el método 2D recomendado para calcular la FEVI es…',
    ref: 'Cuantificación de FEVI',
    opts: [
      { t: "Simpson biplano (suma de discos) en 4 y 2 cámaras", ok: true, e: 'Correcto. Suma discos apilados y depende menos de la geometría; es el método 2D recomendado, especialmente con alteraciones segmentarias.' },
      { t: 'Teichholz a partir de diámetros en modo M', ok: false, e: 'Teichholz asume geometría elipsoidal y no debe usarse con anomalías segmentarias; ya no se recomienda.' },
      { t: 'Fracción de acortamiento del VI', ok: false, e: 'Refleja el acortamiento de fibras en un solo eje corto; no equivale a la FEVI global.' },
      { t: 'Estimación visual como estándar de referencia', ok: false, e: 'Es útil en manos expertas, pero no es el método cuantitativo recomendado.' },
    ]},
  { id: 'sis-02', cat: 'sistolica', dif: 'intermedio',
    q: 'De acuerdo con los rangos de referencia ASE, la FEVI normal es aproximadamente…',
    ref: 'Rangos ASE de FEVI',
    opts: [
      { t: '≥52% en hombres y ≥54% en mujeres', ok: true, e: 'Correcto. Rangos ASE: hombres 52–72%, mujeres 54–74%. Por debajo se considera disfunción sistólica.' },
      { t: '≥40% en ambos sexos', ok: false, e: 'El rango 41–51% ya se considera levemente reducido; 40% no es el límite de normalidad.' },
      { t: '≥60% de forma obligatoria', ok: false, e: '60% está dentro de lo normal, pero el límite inferior de normalidad es ~52–54%, no 60%.' },
      { t: '≥30% en ambos sexos', ok: false, e: '30% corresponde a disfunción moderada–severa, no a normalidad.' },
    ]},
  { id: 'sis-03', cat: 'sistolica', dif: 'avanzado',
    q: 'Un paciente hipertenso tiene grosor parietal relativo (RWT) de 0,50 con masa del VI normal. La geometría es…',
    ref: 'Geometría del VI (RWT)',
    opts: [
      { t: 'Remodelado concéntrico', ok: true, e: 'Correcto. RWT >0,42 con masa normal = remodelado concéntrico. Si la masa estuviera elevada, sería hipertrofia concéntrica.' },
      { t: 'Hipertrofia excéntrica', ok: false, e: 'La hipertrofia excéntrica tiene RWT ≤0,42 con masa aumentada.' },
      { t: 'Geometría normal', ok: false, e: 'Un RWT >0,42 ya es anormal; define remodelado/hipertrofia concéntricos.' },
      { t: 'Hipertrofia concéntrica', ok: false, e: 'Requeriría además masa del VI aumentada; aquí la masa es normal.' },
    ]},

  /* ===== FUNCIÓN DIASTÓLICA ===== */
  { id: 'dia-01', cat: 'diastolica', dif: 'avanzado',
    q: 'En un paciente con FEVI normal, ¿cuáles son los 4 parámetros del algoritmo ASE para detectar disfunción diastólica?',
    ref: 'Algoritmo diastólico ASE',
    opts: [
      { t: "e' septal <7 o lateral <10 cm/s, E/e' promedio >14, velocidad de IT >2,8 m/s y volumen indexado de AI >34 mL/m²", ok: true, e: 'Correcto. Se necesitan ≥3 parámetros positivos para disfunción diastólica; 2 positivos = indeterminado.' },
      { t: 'Únicamente la relación E/A', ok: false, e: 'La E/A aislada es insuficiente con FEVI normal; el algoritmo integra 4 variables.' },
      { t: 'FEVI, masa del VI, RWT y diámetro aórtico', ok: false, e: 'Esos parámetros no forman parte del algoritmo diastólico.' },
      { t: "TAPSE, S', FAC y diámetro del VD", ok: false, e: 'Son parámetros de función del VD, no de la diástole del VI.' },
    ]},
  { id: 'dia-02', cat: 'diastolica', dif: 'intermedio',
    q: "Un patrón mitral con E/A >2, tiempo de desaceleración corto y E/e' elevado corresponde a…",
    ref: 'Grados de disfunción diastólica',
    opts: [
      { t: 'Disfunción diastólica grado III (patrón restrictivo)', ok: true, e: 'Correcto. E/A >2 con TD corto refleja presiones de llenado muy elevadas y baja distensibilidad del VI.' },
      { t: 'Grado I (alteración de la relajación)', ok: false, e: 'El grado I tiene E/A <0,8 con relajación prolongada y presiones normales.' },
      { t: 'Patrón normal', ok: false, e: 'Un E/A >2 con TD corto no es normal en el adulto; sugiere restricción.' },
      { t: 'Constricción pericárdica por definición', ok: false, e: 'El patrón restrictivo sugiere enfermedad miocárdica; la constricción requiere otros signos (rebote septal, variación respiratoria).' },
    ]},
  { id: 'dia-03', cat: 'diastolica', dif: 'intermedio',
    q: '¿Cómo se desenmascara un patrón de llenado pseudonormal (grado II)?',
    ref: 'Maniobra de Valsalva',
    opts: [
      { t: 'Con Valsalva: al reducir la precarga, el E/A disminuye ≥0,5 y revela el patrón subyacente', ok: true, e: 'Correcto. La maniobra reduce el retorno venoso y "desnuda" la alteración de la relajación.' },
      { t: 'Con ejercicio isométrico, que normaliza el E/A', ok: false, e: 'El ejercicio no es la maniobra estándar para desenmascarar el pseudonormal.' },
      { t: 'Aumentando la precarga con elevación de piernas', ok: false, e: 'Aumentar la precarga acentúa el pseudonormal en vez de desenmascararlo.' },
      { t: 'No es posible diferenciarlo del patrón normal', ok: false, e: "Sí se puede: con Valsalva, e' reducida, E/e' elevado, IT y volumen de AI." },
    ]},

  /* ===== AÓRTICA ===== */
  { id: 'aor-01', cat: 'aortica', dif: 'básico',
    q: '¿Qué conjunto define estenosis aórtica severa?',
    ref: 'Criterios de EAo severa',
    opts: [
      { t: 'Vmax ≥4 m/s, gradiente medio ≥40 mmHg y AVA <1,0 cm²', ok: true, e: 'Correcto. Criterios clásicos ASE; el área indexada <0,6 cm²/m² apoya la severidad.' },
      { t: 'Vmax 2–3 m/s y gradiente medio 20 mmHg', ok: false, e: 'Eso corresponde a estenosis aórtica leve.' },
      { t: 'AVA 1,5–2,0 cm²', ok: false, e: 'Ese rango es leve; severa es <1,0 cm².' },
      { t: 'Gradiente medio 25–39 mmHg con AVA 1,0–1,5 cm²', ok: false, e: 'Eso define estenosis aórtica moderada.' },
    ]},
  { id: 'aor-02', cat: 'aortica', dif: 'intermedio',
    q: 'El índice de velocidad adimensional (DVI = VTI_TSVI / VTI_Ao) es útil cuando no se puede medir el diámetro del TSVI. Un DVI <0,25 indica…',
    ref: 'DVI (índice adimensional)',
    opts: [
      { t: 'Estenosis aórtica severa', ok: true, e: 'Correcto. Es independiente del diámetro del TSVI; <0,25 refleja severidad (el TSVI mueve <25% del flujo de la válvula).' },
      { t: 'Válvula aórtica normal', ok: false, e: 'Un DVI normal es >0,50; <0,25 es severo.' },
      { t: 'Insuficiencia aórtica severa', ok: false, e: 'El DVI evalúa estenosis, no insuficiencia.' },
      { t: 'Estenosis leve', ok: false, e: 'La estenosis leve tendría DVI >0,50 aprox.; <0,25 es severa.' },
    ]},
  { id: 'aor-03', cat: 'aortica', dif: 'avanzado',
    q: 'Paciente con AVA 0,8 cm², gradiente medio 25 mmHg y FEVI 30%. ¿Cuál es el siguiente paso para diferenciar EAo verdaderamente severa de pseudosevera?',
    ref: 'EAo de bajo flujo y bajo gradiente',
    opts: [
      { t: 'Eco de estrés con dobutamina a dosis baja, buscando reserva contráctil y cambios en área/gradiente', ok: true, e: 'Correcto. Si con más flujo el gradiente sube y el AVA sigue <1,0 → severa verdadera; si el AVA aumenta >1,0 → pseudosevera.' },
      { t: 'Repetir el eco en reposo dentro de 6 meses', ok: false, e: 'Retrasa el diagnóstico; existe una prueba específica (dobutamina).' },
      { t: 'Asumir que es leve por el gradiente bajo', ok: false, e: 'Con FEVI baja el gradiente puede ser bajo pese a haber severidad (bajo flujo).' },
      { t: 'Angio-TC para descartar disección', ok: false, e: 'No responde a la pregunta sobre la severidad de la estenosis.' },
    ]},
  { id: 'aor-04', cat: 'aortica', dif: 'intermedio',
    q: '¿Qué hallazgo Doppler es más específico de insuficiencia aórtica severa?',
    ref: 'Severidad de la IAo',
    opts: [
      { t: 'Inversión holodiastólica del flujo en la aorta descendente/abdominal', ok: true, e: 'Correcto. La reversión holodiastólica en la aorta abdominal es un signo específico de IAo severa.' },
      { t: 'Tiempo de hemipresión (PHT) del jet >500 ms', ok: false, e: 'Al revés: un PHT corto (<200 ms) indica severidad por equalización rápida de presiones.' },
      { t: 'Vena contracta de 0,2 cm', ok: false, e: 'Sugiere IAo leve; severa es >0,6 cm.' },
      { t: 'Jet central estrecho que no alcanza el ápex', ok: false, e: 'Describe un jet no severo.' },
    ]},

  /* ===== MITRAL ===== */
  { id: 'mit-01', cat: 'mitral', dif: 'básico',
    q: '¿Qué define estenosis mitral severa?',
    ref: 'Criterios de EM severa',
    opts: [
      { t: 'Área valvular ≤1,5 cm²', ok: true, e: 'Correcto. Severa ≤1,5 cm² (muy severa ≤1,0). El gradiente medio depende de la frecuencia cardíaca.' },
      { t: 'Gradiente medio de 3 mmHg con área 2,0 cm²', ok: false, e: 'Eso es leve o no significativo.' },
      { t: 'PHT de 100 ms', ok: false, e: 'AVM = 220/PHT → 220/100 = 2,2 cm² (no severa).' },
      { t: 'Área 1,6–2,0 cm²', ok: false, e: 'Ese rango es leve–moderado, no severo.' },
    ]},
  { id: 'mit-02', cat: 'mitral', dif: 'avanzado',
    q: 'El cálculo del área mitral por PHT (220/PHT) NO es fiable en…',
    ref: 'Limitaciones del PHT',
    opts: [
      { t: 'El período inmediato tras valvuloplastia mitral con balón', ok: true, e: 'Correcto. Los cambios agudos de distensibilidad AI/VI alteran el PHT; también es poco fiable con IAo significativa importante.' },
      { t: 'Estenosis mitral reumática crónica y estable', ok: false, e: 'Precisamente ahí se validó el método.' },
      { t: 'Ritmo sinusal normal', ok: false, e: 'El ritmo sinusal no invalida el método.' },
      { t: 'Frecuencia cardíaca de 70 lpm', ok: false, e: 'Una FC normal no invalida el PHT.' },
    ]},
  { id: 'mit-03', cat: 'mitral', dif: 'intermedio',
    q: 'En insuficiencia mitral primaria, ¿qué combinación indica severidad?',
    ref: 'Criterios de IM severa primaria',
    opts: [
      { t: 'EROA ≥0,40 cm², volumen regurgitante ≥60 mL y vena contracta ≥0,7 cm', ok: true, e: 'Correcto. Criterios cuantitativos de IM severa primaria; la inversión sistólica de venas pulmonares apoya.' },
      { t: 'EROA 0,10 cm² y volumen 20 mL', ok: false, e: 'Eso corresponde a IM leve.' },
      { t: 'Vena contracta 0,2 cm', ok: false, e: 'Sugiere IM leve; severa es ≥0,7 cm.' },
      { t: 'Fracción regurgitante 20%', ok: false, e: 'La IM severa tiene fracción regurgitante ≥50%.' },
    ]},
  { id: 'mit-04', cat: 'mitral', dif: 'intermedio',
    q: 'El diagnóstico ecocardiográfico de prolapso de la válvula mitral requiere…',
    ref: 'Prolapso mitral',
    opts: [
      { t: 'Desplazamiento ≥2 mm de la valva por encima del plano anular en el eje largo paraesternal', ok: true, e: 'Correcto. Se define en PLAX por la forma en silla de montar del anillo; el "flail" implica cuerda rota con la punta hacia la AI.' },
      { t: 'Cualquier engrosamiento valvular visto en 4 cámaras', ok: false, e: 'La vista apical de 4 cámaras da falsos positivos; se usa el eje largo.' },
      { t: 'Movimiento anterior sistólico (SAM)', ok: false, e: 'El SAM es típico de la MCH obstructiva, no la definición de prolapso.' },
      { t: 'Calcificación del anillo mitral', ok: false, e: 'La calcificación anular (MAC) es otra entidad; no define prolapso.' },
    ]},

  /* ===== TRICÚSPIDE / PULMONAR ===== */
  { id: 'tri-01', cat: 'tricuspide', dif: 'básico',
    q: 'La presión sistólica del VD (≈PSAP en ausencia de estenosis pulmonar) se estima con…',
    ref: 'PSVD por IT',
    opts: [
      { t: '4 × (Vmax de la IT)² + presión de la AD', ok: true, e: 'Correcto. Bernoulli simplificado más la PAD estimada por la VCI; es el método estándar.' },
      { t: '4 × Vmax de la IT, sin elevar al cuadrado', ok: false, e: 'Falta el cuadrado; Bernoulli usa 4V².' },
      { t: 'Gradiente medio mitral + 10', ok: false, e: 'No se relaciona con la presión del VD.' },
      { t: 'Tiempo de aceleración pulmonar × 2', ok: false, e: 'El TAP se relaciona con HTP pero no da la PSAP por esa fórmula.' },
    ]},
  { id: 'tri-02', cat: 'tricuspide', dif: 'intermedio',
    q: 'VCI de 2,5 cm con colapso inspiratorio <50%. La presión estimada de la AD es…',
    ref: 'Estimación de PAD por VCI',
    opts: [
      { t: '~15 mmHg', ok: true, e: 'Correcto. VCI dilatada (>2,1 cm) con colapso <50% → PAD alta (~15 mmHg, rango 10–20).' },
      { t: '~3 mmHg', ok: false, e: '3 mmHg corresponde a VCI ≤2,1 cm con colapso >50%.' },
      { t: '~0 mmHg', ok: false, e: 'Una VCI dilatada y no colapsable no indica PAD baja.' },
      { t: '~8 mmHg', ok: false, e: '8 mmHg es el valor intermedio cuando no se cumplen ambos criterios de un extremo.' },
    ]},
  { id: 'tri-03', cat: 'tricuspide', dif: 'intermedio',
    q: '¿Qué signo apoya insuficiencia tricúspide severa?',
    ref: 'Severidad de la IT',
    opts: [
      { t: 'Inversión sistólica del flujo en las venas suprahepáticas', ok: true, e: 'Correcto. Signo específico; también apoyan vena contracta >0,7 cm y una señal de IT densa, triangular y de pico temprano.' },
      { t: 'Señal de IT tenue e incompleta', ok: false, e: 'Sugiere IT leve.' },
      { t: 'Vena contracta de 0,2 cm', ok: false, e: 'Sugiere IT leve.' },
      { t: 'Predominio sistólico normal del flujo suprahepático', ok: false, e: 'El patrón normal (S > D) va en contra de IT severa.' },
    ]},

  /* ===== PROTÉSICAS ===== */
  { id: 'pro-01', cat: 'protesis', dif: 'avanzado',
    q: 'Una prótesis aórtica muestra gradiente elevado. ¿Qué favorece mismatch paciente–prótesis (PPM) sobre obstrucción intrínseca?',
    ref: 'PPM vs obstrucción',
    opts: [
      { t: 'Área efectiva del orificio indexada baja, con DVI normal y movimiento normal de los velos/discos', ok: true, e: 'Correcto. En el PPM la prótesis funciona bien pero es pequeña para el paciente (EOAi ≤0,85 moderado, ≤0,65 severo).' },
      { t: 'DVI muy bajo con velos inmóviles', ok: false, e: 'Eso sugiere obstrucción intrínseca (trombo/pannus), no PPM.' },
      { t: 'Aparición de un jet excéntrico nuevo de insuficiencia', ok: false, e: 'Orienta a disfunción/dehiscencia, no a PPM.' },
      { t: 'Vegetación móvil sobre la prótesis', ok: false, e: 'Sugiere endocarditis, no PPM.' },
    ]},
  { id: 'pro-02', cat: 'protesis', dif: 'intermedio',
    q: 'En una válvula mecánica bivalva normofuncionante, los pequeños jets regurgitantes centrales…',
    ref: 'Jets de lavado ("washing jets")',
    opts: [
      { t: 'Son normales ("washing jets") y ayudan a prevenir la trombosis', ok: true, e: 'Correcto. Son jets de lavado esperados; deben distinguirse de la regurgitación patológica/paravalvular, mejor por TEE.' },
      { t: 'Siempre indican dehiscencia', ok: false, e: 'La dehiscencia produce jets paravalvulares, no los centrales de lavado.' },
      { t: 'Indican trombosis obligatoriamente', ok: false, e: 'Los jets de lavado son fisiológicos, no signo de trombosis.' },
      { t: 'Contraindican la anticoagulación', ok: false, e: 'No modifican la indicación de anticoagulación de una válvula mecánica.' },
    ]},

  /* ===== MIOCARDIOPATÍAS ===== */
  { id: 'mio-01', cat: 'miocardiopatias', dif: 'intermedio',
    q: 'Diferencia entre la obstrucción dinámica de la MCH y la estenosis aórtica valvular fija en el Doppler continuo:',
    ref: 'MCH obstructiva vs EAo',
    opts: [
      { t: 'La obstrucción dinámica da una señal tardía "en daga" que aumenta con Valsalva; la EAo fija es de pico más temprano y no aumenta con Valsalva', ok: true, e: 'Correcto. La obstrucción del TSVI depende de la carga y aumenta al reducir precarga/poscarga (Valsalva, bipedestación).' },
      { t: 'Ambas producen señales idénticas', ok: false, e: 'Difieren en morfología (tardía vs temprana) y en la respuesta a maniobras.' },
      { t: 'La EAo fija aumenta marcadamente con Valsalva', ok: false, e: 'La EAo fija cambia poco con Valsalva; es la dinámica la que aumenta.' },
      { t: 'La MCH nunca produce gradiente en el TSVI', ok: false, e: 'La MCH obstructiva sí produce gradiente dinámico, con frecuencia asociado a SAM.' },
    ]},
  { id: 'mio-02', cat: 'miocardiopatias', dif: 'intermedio',
    q: 'Hallazgos que sugieren amiloidosis cardíaca incluyen…',
    ref: 'Amiloidosis cardíaca',
    opts: [
      { t: 'Paredes engrosadas, strain con "apical sparing" (preservación apical) y bajo voltaje en el ECG pese a paredes gruesas', ok: true, e: 'Correcto. El patrón "cherry on top" / ojo de buey con GLS preservado en el ápex es muy sugestivo; contrasta con la MCH (voltajes altos).' },
      { t: 'Paredes delgadas y dilatación con FEVI normal', ok: false, e: 'La amiloidosis engrosa las paredes; no las adelgaza.' },
      { t: 'GLS normal y homogéneo', ok: false, e: 'Típicamente el GLS está reducido con un gradiente base–ápex.' },
      { t: 'Voltajes altos en el ECG', ok: false, e: 'La amiloidosis suele dar voltajes bajos pese a paredes gruesas (pseudohipertrofia).' },
    ]},
  { id: 'mio-03', cat: 'miocardiopatias', dif: 'avanzado',
    q: 'Un hallazgo que apunta a constricción pericárdica más que a miocardiopatía restrictiva es…',
    ref: 'Constricción vs restricción',
    opts: [
      { t: "e' del anillo mitral preservada o aumentada, con \"annulus reversus\" (medial > lateral)", ok: true, e: 'Correcto. En la constricción el miocardio está sano (e\' preservada) y hay interdependencia ventricular; en la restricción la e\' está reducida.' },
      { t: "e' mitral muy reducida en ambos anillos", ok: false, e: 'Eso favorece enfermedad miocárdica (restrictiva).' },
      { t: 'Ausencia de variación respiratoria de los flujos', ok: false, e: 'La constricción se caracteriza por marcada variación respiratoria/interdependencia.' },
      { t: 'Aurículas de tamaño normal', ok: false, e: 'No es discriminador; ambas entidades pueden cursar con aurículas grandes.' },
    ]},

  /* ===== PERICARDIO ===== */
  { id: 'per-01', cat: 'pericardio', dif: 'intermedio',
    q: '¿Qué signo ecocardiográfico es más específico de taponamiento cardíaco?',
    ref: 'Taponamiento',
    opts: [
      { t: 'Colapso diastólico del ventrículo derecho', ok: true, e: 'Correcto. El colapso del VD en diástole es específico; el colapso sistólico de la AD es más sensible pero menos específico.' },
      { t: 'Colapso sistólico de la aurícula derecha', ok: false, e: 'Es sensible pero poco específico (puede verse sin taponamiento).' },
      { t: 'Derrame pericárdico pequeño', ok: false, e: 'El tamaño del derrame no define taponamiento; importa la repercusión hemodinámica.' },
      { t: 'VCI pequeña y muy colapsable', ok: false, e: 'En el taponamiento la VCI suele estar pletórica (dilatada), no pequeña.' },
    ]},
  { id: 'per-02', cat: 'pericardio', dif: 'avanzado',
    q: 'La variación respiratoria en el taponamiento se manifiesta como…',
    ref: 'Interdependencia ventricular',
    opts: [
      { t: 'Caída >25% de la E mitral en inspiración y aumento >40–60% de la E tricúspide', ok: true, e: 'Correcto. Refleja la interdependencia ventricular exagerada (pulso paradójico ecocardiográfico).' },
      { t: 'Ausencia de cambios respiratorios en los flujos', ok: false, e: 'La variación exagerada es un sello del taponamiento.' },
      { t: 'Aumento de la E mitral en inspiración', ok: false, e: 'En inspiración la E mitral disminuye (el llenado izquierdo cae).' },
      { t: 'Disminución de la E tricúspide en inspiración', ok: false, e: 'La tricúspide aumenta en inspiración, no disminuye.' },
    ]},

  /* ===== CONGÉNITAS ===== */
  { id: 'con-01', cat: 'congenitas', dif: 'básico',
    q: 'El tipo más frecuente de comunicación interauricular (CIA) es…',
    ref: 'Tipos de CIA',
    opts: [
      { t: 'Ostium secundum', ok: true, e: 'Correcto. Representa ~75%. El ostium primum se asocia a defectos del canal AV y el seno venoso a drenaje venoso pulmonar anómalo.' },
      { t: 'Ostium primum', ok: false, e: 'Es menos frecuente y se asocia a hendidura mitral/canal AV.' },
      { t: 'Seno venoso', ok: false, e: 'Es poco frecuente y se asocia a drenaje venoso pulmonar anómalo parcial.' },
      { t: 'Seno coronario', ok: false, e: 'Es el tipo más raro de CIA.' },
    ]},
  { id: 'con-02', cat: 'congenitas', dif: 'intermedio',
    q: 'En una CIA con cortocircuito significativo, un hallazgo esperado es…',
    ref: 'Sobrecarga de volumen del VD',
    opts: [
      { t: 'Dilatación del VD con movimiento septal paradójico y Qp/Qs elevado', ok: true, e: 'Correcto. El exceso de flujo pulmonar dilata el VD; el tabique se mueve paradójicamente en diástole (sobrecarga de volumen).' },
      { t: 'VD pequeño e hipertrofiado', ok: false, e: 'La sobrecarga de volumen dilata el VD, no lo reduce.' },
      { t: 'Qp/Qs <1', ok: false, e: 'Un cortocircuito izquierda–derecha da Qp/Qs >1.' },
      { t: 'Aurícula derecha pequeña', ok: false, e: 'Suele haber dilatación de las cavidades derechas.' },
    ]},
  { id: 'con-03', cat: 'congenitas', dif: 'avanzado',
    q: 'La anomalía de Ebstein se caracteriza por…',
    ref: 'Anomalía de Ebstein',
    opts: [
      { t: 'Desplazamiento apical de la valva septal tricúspide (≥0,8 cm/m²) con "atrialización" del VD', ok: true, e: 'Correcto. La valva septal se implanta apicalmente; parte del VD queda "atrializado", con IT frecuente.' },
      { t: 'Estenosis aórtica supravalvular', ok: false, e: 'No corresponde a la anomalía de Ebstein.' },
      { t: 'Ausencia de válvula pulmonar', ok: false, e: 'Describe otra malformación, no Ebstein.' },
      { t: 'Desplazamiento de la valva mitral hacia el ápex', ok: false, e: 'Ebstein afecta la tricúspide (lado derecho), no la mitral.' },
    ]},

  /* ===== AORTA ===== */
  { id: 'ao-01', cat: 'aorta', dif: 'intermedio',
    q: 'En sospecha de disección aórtica, ¿qué afirmación es correcta sobre la ecocardiografía?',
    ref: 'Disección aórtica',
    opts: [
      { t: 'El TEE tiene alta sensibilidad para el flap intimal y ayuda a distinguir la luz verdadera de la falsa', ok: true, e: 'Correcto. El TEE visualiza bien la aorta torácica; la luz falsa suele ser mayor y con flujo lento o trombo.' },
      { t: 'El eco transtorácico descarta con certeza una disección tipo B', ok: false, e: 'El TTE tiene ventana limitada para la aorta descendente; no la descarta.' },
      { t: 'La luz verdadera siempre es la de mayor tamaño', ok: false, e: 'Suele ser la falsa la de mayor tamaño; la verdadera se expande en sístole.' },
      { t: 'La disección tipo A se maneja médicamente de forma electiva', ok: false, e: 'La tipo A (aorta ascendente) es una urgencia quirúrgica.' },
    ]},

  /* ===== MASAS ===== */
  { id: 'mas-01', cat: 'masas', dif: 'básico',
    q: 'El tumor cardíaco primario más frecuente en el adulto es…',
    ref: 'Tumores cardíacos',
    opts: [
      { t: 'Mixoma, típicamente en la AI y unido a la fosa oval por un pedículo', ok: true, e: 'Correcto. Es el primario más común; puede prolapsar por la mitral y causar obstrucción o embolia.' },
      { t: 'Fibroelastoma papilar en la aorta', ok: false, e: 'Es el segundo más frecuente y de localización valvular; no el más común.' },
      { t: 'Angiosarcoma en la aurícula derecha', ok: false, e: 'Es el primario maligno más frecuente, pero mucho menos común que el mixoma.' },
      { t: 'Rabdomioma ventricular', ok: false, e: 'Es el más frecuente en niños (asociado a esclerosis tuberosa), no en adultos.' },
    ]},
  { id: 'mas-02', cat: 'masas', dif: 'básico',
    q: 'Antes de una cardioversión en fibrilación auricular, ¿qué estudio evalúa mejor el trombo en la orejuela izquierda?',
    ref: 'Trombo en la orejuela',
    opts: [
      { t: 'Ecocardiograma transesofágico', ok: true, e: 'Correcto. La orejuela izquierda no se visualiza bien por vía transtorácica; el TEE es el estándar para descartar trombo.' },
      { t: 'Eco transtorácico en 4 cámaras', ok: false, e: 'La ventana transtorácica no visualiza adecuadamente la orejuela.' },
      { t: 'Doppler de arterias carótidas', ok: false, e: 'No evalúa la orejuela izquierda.' },
      { t: 'Modo M paraesternal', ok: false, e: 'No permite ver la orejuela.' },
    ]},

  /* ===== ENDOCARDITIS ===== */
  { id: 'end-01', cat: 'endocarditis', dif: 'intermedio',
    q: 'Respecto a la endocarditis infecciosa en ecocardiografía…',
    ref: 'Endocarditis',
    opts: [
      { t: 'El TEE es más sensible que el TTE para vegetaciones y complicaciones como el absceso perianular', ok: true, e: 'Correcto. Especialmente en prótesis y para abscesos/perforaciones; la vegetación es una masa oscilante independiente en el lado de baja presión.' },
      { t: 'El TTE detecta abscesos perianulares con mayor sensibilidad que el TEE', ok: false, e: 'Es al revés: el TEE es superior para los abscesos.' },
      { t: 'Una vegetación es una masa fija y calcificada', ok: false, e: 'Típicamente es móvil/oscilante y adherida al lado de baja presión de la válvula.' },
      { t: 'Un eco normal descarta la endocarditis con certeza', ok: false, e: 'Un eco negativo no la excluye; se integran los criterios de Duke.' },
    ]},

  /* ===== CORAZÓN DERECHO / HTP ===== */
  { id: 'der-01', cat: 'derecho', dif: 'básico',
    q: 'Un TAPSE de 12 mm indica…',
    ref: 'Función sistólica del VD',
    opts: [
      { t: 'Función sistólica del VD reducida', ok: true, e: 'Correcto. TAPSE <17 mm es anormal; también S\' del anillo tricúspide <9,5 cm/s y FAC <35% indican disfunción.' },
      { t: 'Función del VD normal', ok: false, e: 'Un TAPSE <17 mm es anormal; 12 mm es claramente bajo.' },
      { t: 'Hipertrofia del VD', ok: false, e: 'El TAPSE mide función longitudinal, no grosor parietal.' },
      { t: 'Sobrecarga de volumen del VI', ok: false, e: 'El TAPSE evalúa el VD, no el VI.' },
    ]},
  { id: 'der-02', cat: 'derecho', dif: 'avanzado',
    q: 'Un tiempo de aceleración pulmonar (TAP) <105 ms con muesca mesosistólica sugiere…',
    ref: 'HTP y resistencia pulmonar',
    opts: [
      { t: 'Hipertensión pulmonar, con la muesca orientando a resistencia vascular pulmonar elevada', ok: true, e: 'Correcto. Un TAP corto y el "notching" mesosistólico reflejan alta impedancia/RVP; el signo 60/60 apoya el diagnóstico.' },
      { t: 'Presiones pulmonares normales', ok: false, e: 'Un TAP corto sugiere presiones elevadas, no normales.' },
      { t: 'Estenosis mitral severa', ok: false, e: 'El TAP evalúa el lecho pulmonar, no directamente la mitral.' },
      { t: 'Función normal del VD', ok: false, e: 'No evalúa la función del VD y además sugiere HTP.' },
    ]},
  { id: 'der-03', cat: 'derecho', dif: 'intermedio',
    q: 'El signo de McConnell (acinesia de la pared libre media del VD con preservación apical) sugiere…',
    ref: 'Signo de McConnell',
    opts: [
      { t: 'Embolia pulmonar aguda / sobrecarga aguda de presión del VD', ok: true, e: 'Correcto. Es relativamente específico de cor pulmonale agudo; el ápex se "tracciona" por el VI.' },
      { t: 'Miocardiopatía dilatada crónica', ok: false, e: 'No es el patrón típico de McConnell.' },
      { t: 'Infarto inferior del VI', ok: false, e: 'Describe otra entidad; McConnell es del VD.' },
      { t: 'Taponamiento cardíaco', ok: false, e: 'El taponamiento tiene otros signos (colapsos de cámaras).' },
    ]},

  /* ===== ISQUEMIA / ESTRÉS ===== */
  { id: 'isq-01', cat: 'isquemia', dif: 'intermedio',
    q: 'En el modelo de 17 segmentos, la cara anterior, el septo anterior y el ápex corresponden habitualmente a…',
    ref: 'Territorios coronarios',
    opts: [
      { t: 'La arteria descendente anterior (DA)', ok: true, e: 'Correcto. La DA irriga septo anterior, pared anterior y con frecuencia el ápex; la CD la cara inferior y la Cx la lateral.' },
      { t: 'La arteria circunfleja (Cx)', ok: false, e: 'La Cx irriga la pared lateral, no el septo anterior/ápex.' },
      { t: 'La coronaria derecha (CD)', ok: false, e: 'La CD irriga la cara inferior/inferoseptal basal.' },
      { t: 'El tronco de la coronaria izquierda de forma aislada', ok: false, e: 'El tronco irriga DA + Cx; el patrón descrito es específico de la DA.' },
    ]},
  { id: 'isq-02', cat: 'isquemia', dif: 'intermedio',
    q: 'Durante un eco de estrés, el hallazgo que indica isquemia es…',
    ref: 'Eco de estrés',
    opts: [
      { t: 'Aparición de una alteración nueva o el empeoramiento de la contractilidad segmentaria con el estrés', ok: true, e: 'Correcto. El miocardio normal aumenta su engrosamiento; una zona que empeora sugiere isquemia inducible.' },
      { t: 'Aumento homogéneo de la contractilidad global', ok: false, e: 'Eso es una respuesta normal, no isquemia.' },
      { t: 'Reducción de la frecuencia cardíaca con el esfuerzo', ok: false, e: 'No es un criterio de isquemia por imagen.' },
      { t: 'Dilatación de la aurícula izquierda', ok: false, e: 'No es el criterio de isquemia en el eco de estrés.' },
    ]},
  { id: 'isq-03', cat: 'isquemia', dif: 'avanzado',
    q: 'En dobutamina a dosis baja, una respuesta bifásica (mejora a dosis baja y empeora a dosis alta) indica…',
    ref: 'Viabilidad miocárdica',
    opts: [
      { t: 'Miocardio viable con isquemia (candidato a revascularización)', ok: true, e: 'Correcto. Mejora inicial por reserva contráctil y luego deterioro isquémico; predice recuperación tras revascularizar.' },
      { t: 'Cicatriz transmural sin viabilidad', ok: false, e: 'La cicatriz no mejora a dosis baja (no hay reserva contráctil).' },
      { t: 'Miocardio normal', ok: false, e: 'El miocardio normal no muestra ese deterioro isquémico a dosis altas.' },
      { t: 'Artefacto sin valor clínico', ok: false, e: 'La respuesta bifásica es un marcador clásico de viabilidad.' },
    ]},

  /* ===== TEE ===== */
  { id: 'tee-01', cat: 'tee', dif: 'intermedio',
    q: 'Para excluir trombo en la orejuela izquierda, el TEE debe…',
    ref: 'Interrogatorio de la orejuela',
    opts: [
      { t: 'Interrogar la orejuela en múltiples ángulos (p. ej., 0°, 45°, 90°, 135°) por sus lóbulos y músculos pectíneos', ok: true, e: 'Correcto. Los músculos pectíneos pueden simular trombos; el barrido multiplano reduce los falsos positivos.' },
      { t: 'Verla en un solo plano a 0°', ok: false, e: 'Un solo plano puede pasar por alto trombos o confundir pectíneos.' },
      { t: 'Usar solo Doppler continuo de la aorta', ok: false, e: 'No evalúa la orejuela.' },
      { t: 'Evaluar únicamente la válvula pulmonar', ok: false, e: 'No corresponde a la orejuela izquierda.' },
    ]},

  /* ===== STRAIN / 3D ===== */
  { id: 'str-01', cat: 'strain3d', dif: 'intermedio',
    q: 'El strain longitudinal global (GLS) normal es aproximadamente…',
    ref: 'GLS',
    opts: [
      { t: 'Más negativo que ~ −18% a −20% (los valores varían según el equipo)', ok: true, e: 'Correcto. Por convención, más negativo = mejor. Un GLS menos negativo que ~ −16% suele ser anormal. Conviene seguir al paciente con el mismo software.' },
      { t: 'Alrededor de +20%', ok: false, e: 'El strain longitudinal es negativo (acortamiento); +20% no tiene sentido fisiológico.' },
      { t: 'Menos negativo que −5% en sujetos sanos', ok: false, e: 'Un −5% indicaría disfunción marcada.' },
      { t: 'Igual a la FEVI expresada en porcentaje', ok: false, e: 'Son parámetros distintos; el GLS puede detectar disfunción con FEVI aún normal.' },
    ]},
  { id: 'str-02', cat: 'strain3d', dif: 'intermedio',
    q: 'Comparados con el 2D, los volúmenes del VI por eco 3D…',
    ref: 'Volúmenes por 3D',
    opts: [
      { t: 'Suelen ser mayores y más cercanos a la resonancia magnética, al no depender de suposiciones geométricas', ok: true, e: 'Correcto. El 3D evita el escorzo (foreshortening) y las suposiciones de forma, mejorando la exactitud.' },
      { t: 'Son sistemáticamente menores que por resonancia', ok: false, e: 'El 2D tiende a subestimar; el 3D se acerca más a la resonancia.' },
      { t: 'Requieren asumir una forma elipsoidal', ok: false, e: 'Justamente el 3D no necesita esa suposición.' },
      { t: 'No sirven para calcular la FEVI', ok: false, e: 'El 3D permite calcular una FEVI volumétrica robusta.' },
    ]},
];

/* ============================================================
   GENERADORES — preguntas de cálculo que regeneran valores
   cada vez que se muestran (para que "cada vez sean diferentes").
   Cada uno devuelve { q, opts, ref } como una pregunta estática.
   ============================================================ */

function _ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function _rc(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function _r1(x) { return Math.round(x * 10) / 10; }
function _r2(x) { return Math.round(x * 100) / 100; }

const GENERATORS = [
  { id: 'gen-ava', cat: 'aortica', dif: 'intermedio', build() {
      const d = _rc([1.8, 1.9, 2.0, 2.1, 2.2]);
      const lvotVTI = _ri(18, 26);
      const avVTI = _ri(72, 108);
      const area = 0.785 * d * d;
      const ava = area * lvotVTI / avVTI;
      const c = _r2(ava);
      return {
        ref: 'Ecuación de continuidad',
        q: `Ecuación de continuidad. Diámetro del TSVI ${d} cm, VTI del TSVI ${lvotVTI} cm, VTI aórtico ${avVTI} cm. ¿Cuál es el área valvular aórtica (AVA)?`,
        opts: [
          { t: `${c} cm²`, ok: true, e: `AVA = (área TSVI × VTI_TSVI) / VTI_Ao. Área TSVI = 0,785 × ${d}² = ${_r2(area)} cm². AVA = ${_r2(area)} × ${lvotVTI} / ${avVTI} = ${c} cm².` },
          { t: `${_r2(c * 0.6)} cm²`, ok: false, e: 'Valor incorrecto. Repite el cálculo con la ecuación de continuidad.' },
          { t: `${_r2(c * 1.4)} cm²`, ok: false, e: 'Valor demasiado alto: verifica el cociente VTI_TSVI / VTI_Ao.' },
          { t: `${_r2(area)} cm²`, ok: false, e: 'Ese es el área del TSVI (0,785 × D²); todavía falta dividir por el cociente de VTIs para obtener el AVA.' },
        ],
      };
    }},
  { id: 'gen-eroa', cat: 'mitral', dif: 'avanzado', build() {
      const r = _rc([0.7, 0.8, 0.9, 1.0, 1.1]);
      const va = _rc([30, 35, 40]);
      const vmax = _rc([450, 500, 550, 600]);
      const eroa = (2 * Math.PI * r * r * va) / vmax;
      const c = _r2(eroa);
      return {
        ref: 'PISA (superficie de isovelocidad)',
        q: `Método PISA en insuficiencia mitral. Radio de convergencia ${r} cm, velocidad de aliasing ${va} cm/s, velocidad máxima de la IM ${vmax} cm/s. ¿Cuál es el orificio regurgitante efectivo (EROA)?`,
        opts: [
          { t: `${c} cm²`, ok: true, e: `EROA = (2π·r²·V_alias) / V_max_IM = (2π × ${r}² × ${va}) / ${vmax} = ${c} cm². ${c >= 0.4 ? 'Compatible con IM severa (EROA ≥0,40).' : 'EROA <0,40 por este parámetro.'}` },
          { t: `${_r2(c * 1.5)} cm²`, ok: false, e: 'Valor incorrecto. Recuerda elevar el radio al cuadrado en 2π·r².' },
          { t: `${_r2(c * 0.5)} cm²`, ok: false, e: 'Valor incorrecto. Recalcula el hemisferio: 2π·r² × V_alias / V_max.' },
          { t: `${_r2(2 * Math.PI * r * r)} cm²`, ok: false, e: 'Ese es el área del hemisferio (2π·r²) sin multiplicar por V_alias/V_max; no es el EROA.' },
        ],
      };
    }},
  { id: 'gen-rvsp', cat: 'derecho', dif: 'básico', build() {
      const tr = _rc([2.8, 3.0, 3.2, 3.5, 3.8, 4.2, 4.5]);
      const rap = _rc([3, 8, 15]);
      const rvsp = 4 * tr * tr + rap;
      const c = Math.round(rvsp);
      return {
        ref: 'Bernoulli + PAD',
        q: `Velocidad máxima de la insuficiencia tricúspide ${tr} m/s, presión estimada de la AD ${rap} mmHg. ¿Cuál es la presión sistólica del VD (≈PSAP sin estenosis pulmonar)?`,
        opts: [
          { t: `${c} mmHg`, ok: true, e: `PSVD = 4·V_IT² + PAD = 4 × ${tr}² + ${rap} = ${c} mmHg.` },
          { t: `${Math.round(4 * tr * tr)} mmHg`, ok: false, e: `Olvidaste sumar la presión de la AD (${rap} mmHg). PSVD = 4V² + PAD.` },
          { t: `${Math.round(4 * tr + rap)} mmHg`, ok: false, e: 'Error frecuente: hay que elevar la velocidad al cuadrado (4V²), no usar 4V.' },
          { t: `${Math.round(tr * tr + rap)} mmHg`, ok: false, e: 'Falta el factor 4 de la ecuación de Bernoulli simplificada (4V²).' },
        ],
      };
    }},
  { id: 'gen-mva', cat: 'mitral', dif: 'intermedio', build() {
      const pht = _rc([120, 150, 180, 220, 260, 300]);
      const mva = 220 / pht;
      const c = _r2(mva);
      return {
        ref: 'AVM = 220/PHT',
        q: `Tiempo de hemipresión (PHT) mitral de ${pht} ms. ¿Cuál es el área valvular mitral estimada?`,
        opts: [
          { t: `${c} cm²`, ok: true, e: `AVM = 220 / PHT = 220 / ${pht} = ${c} cm².${c <= 1.5 ? ' Compatible con estenosis mitral significativa.' : ''}` },
          { t: `${_r2(160 / pht)} cm²`, ok: false, e: 'La constante empírica correcta es 220 (Hatle), no 160.' },
          { t: `${_r2(440 / pht)} cm²`, ok: false, e: 'Constante incorrecta: es 220/PHT.' },
          { t: `${_r2(c * 1.6)} cm²`, ok: false, e: 'Valor incorrecto; aplica AVM = 220/PHT.' },
        ],
      };
    }},
  { id: 'gen-co', cat: 'hemodinamica', dif: 'intermedio', build() {
      const d = _rc([1.9, 2.0, 2.1, 2.2]);
      const vti = _ri(16, 24);
      const hr = _ri(58, 92);
      const area = 0.785 * d * d;
      const sv = area * vti;
      const co = sv * hr / 1000;
      const c = _r1(co);
      return {
        ref: 'GC = VS × FC',
        q: `Diámetro del TSVI ${d} cm, VTI del TSVI ${vti} cm, frecuencia cardíaca ${hr} lpm. ¿Cuál es el gasto cardíaco?`,
        opts: [
          { t: `${c} L/min`, ok: true, e: `VS = área TSVI × VTI = ${_r2(area)} × ${vti} = ${Math.round(sv)} mL. GC = VS × FC = ${Math.round(sv)} × ${hr} / 1000 = ${c} L/min.` },
          { t: `${_r1(co * 0.7)} L/min`, ok: false, e: 'Valor incorrecto; revisa el área del TSVI (0,785 × D²).' },
          { t: `${_r1(co * 1.4)} L/min`, ok: false, e: 'Valor incorrecto; verifica VS × FC.' },
          { t: `${Math.round(sv)} mL`, ok: false, e: 'Ese es el volumen sistólico (mL), no el gasto cardíaco; falta multiplicar por la FC.' },
        ],
      };
    }},
  { id: 'gen-qpqs', cat: 'congenitas', dif: 'avanzado', build() {
      const dp = _rc([2.4, 2.5, 2.6, 2.7]);
      const vp = _ri(18, 24);
      const ds = _rc([1.9, 2.0, 2.1]);
      const vs = _ri(16, 22);
      const qp = 0.785 * dp * dp * vp;
      const qs = 0.785 * ds * ds * vs;
      const ratio = qp / qs;
      const c = _r2(ratio);
      return {
        ref: 'Qp/Qs por Doppler',
        q: `Cortocircuito izquierda–derecha. RVOT: diámetro ${dp} cm, VTI ${vp} cm. TSVI: diámetro ${ds} cm, VTI ${vs} cm. ¿Cuál es el Qp/Qs?`,
        opts: [
          { t: `${c}`, ok: true, e: `Qp/Qs = (área_RVOT × VTI_RVOT) / (área_TSVI × VTI_TSVI) = (${_r2(0.785 * dp * dp)} × ${vp}) / (${_r2(0.785 * ds * ds)} × ${vs}) = ${c}.${c >= 1.5 ? ' Cortocircuito significativo (Qp/Qs ≥1,5).' : ''}` },
          { t: `${_r2(ratio * 0.7)}`, ok: false, e: 'Valor incorrecto; usa las áreas (0,785 × D²) del RVOT y del TSVI.' },
          { t: `${_r2(1 / ratio)}`, ok: false, e: 'Cociente invertido: es Qp/Qs (pulmonar/sistémico), no Qs/Qp.' },
          { t: `${_r2(ratio * 1.3)}`, ok: false, e: 'Valor incorrecto; revisa el flujo pulmonar y el sistémico.' },
        ],
      };
    }},
  { id: 'gen-bernoulli', cat: 'hemodinamica', dif: 'básico', build() {
      const v = _rc([2.5, 3.0, 3.5, 4.2, 4.6]);
      const dp = 4 * v * v;
      const c = Math.round(dp);
      return {
        ref: 'ΔP = 4V²',
        q: `Una velocidad máxima de ${v} m/s a través de una válvula. ¿Cuál es el gradiente pico instantáneo estimado?`,
        opts: [
          { t: `${c} mmHg`, ok: true, e: `ΔP = 4 × V² = 4 × ${v}² = ${c} mmHg (Bernoulli simplificado).` },
          { t: `${Math.round(4 * v)} mmHg`, ok: false, e: 'Hay que elevar la velocidad al cuadrado: 4V², no 4V.' },
          { t: `${Math.round(v * v)} mmHg`, ok: false, e: 'Falta el factor 4 de la ecuación (4V²).' },
          { t: `${Math.round(2 * v * v)} mmHg`, ok: false, e: 'La constante es 4 (no 2) en la forma simplificada 4V².' },
        ],
      };
    }},
  { id: 'gen-lambda', cat: 'fisica', dif: 'intermedio', build() {
      const f = _rc([2, 2.5, 3.5, 5, 7.5]);
      const lam = 1.54 / f;
      const c = _r2(lam);
      return {
        ref: 'λ = c/f',
        q: `Un transductor de ${f} MHz. ¿Cuál es la longitud de onda aproximada en tejido blando (c ≈ 1540 m/s)?`,
        opts: [
          { t: `${c} mm`, ok: true, e: `λ = c / f = 1540 m/s / ${f} MHz = ${c} mm (usando la constante 1,54 mm·MHz).` },
          { t: `${_r2(f / 1.54)} mm`, ok: false, e: 'Fórmula invertida: λ = 1,54 / f, no f / 1,54.' },
          { t: `${_r2(lam * 2)} mm`, ok: false, e: 'Valor duplicado por error; usa λ = 1,54 / f(MHz).' },
          { t: `${_r2(lam / 2)} mm`, ok: false, e: 'Valor a la mitad; recalcula con λ = 1,54 / f(MHz).' },
        ],
      };
    }},
  { id: 'gen-dpdt', cat: 'sistolica', dif: 'avanzado', build() {
      const t = _rc([28, 32, 36, 40, 48]);
      const dpdt = 32000 / t;
      const c = Math.round(dpdt);
      return {
        ref: 'dP/dt = 32 mmHg / Δt(s)',
        q: `En la envolvente de una insuficiencia mitral, el tiempo entre 1 y 3 m/s es de ${t} ms. ¿Cuál es el dP/dt del VI?`,
        opts: [
          { t: `${c} mmHg/s`, ok: true, e: `Entre 1 y 3 m/s, ΔP = 4(3²) − 4(1²) = 36 − 4 = 32 mmHg. dP/dt = 32 / ${(t / 1000).toFixed(3)} s = ${c} mmHg/s. ${c > 1000 ? 'Normal (>1000 mmHg/s).' : 'Reducido (<1000 mmHg/s): sugiere disfunción sistólica.'}` },
          { t: `${Math.round(36000 / t)} mmHg/s`, ok: false, e: 'La ΔP correcta entre 1 y 3 m/s es 32 mmHg (36 − 4), no 36.' },
          { t: `${Math.round(4000 / t)} mmHg/s`, ok: false, e: 'Error en la ΔP: debe usarse 32 mmHg, no 4.' },
          { t: `${Math.round(32 / t)} mmHg/s`, ok: false, e: 'Cuidado con las unidades: Δt debe ir en segundos (ms ÷ 1000).' },
        ],
      };
    }},
];

window.ECHO_DATA = { CATEGORIES, STATIC_QUESTIONS, GENERATORS };
