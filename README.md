# EchoBoard — Simulador de examen de ecocardiografía

Aplicación web estática para entrenar de cara al **board de ecocardiografía (ASE)**. Funciona sin conexión y sin servidor: son solo archivos HTML/CSS/JS que puedes subir a GitHub Pages.

## Qué incluye

- **Modo Entrenamiento** — pregunta a pregunta. Al responder, se muestra la explicación de **todas** las opciones (por qué cada una es o no correcta), con **cronómetro por pregunta**. Los aciertos y fallos se guardan.
- **Modo Examen real** — todas las preguntas seguidas con **tiempo total** y cuenta atrás (autoentrega al agotarse). Al terminar: **puntuación**, desglose de aciertos/fallos, **análisis por categoría** y revisión completa con explicaciones.
- **Preguntas que cambian** — el orden de preguntas y de opciones se baraja en cada sesión, y las **preguntas de cálculo generan valores nuevos** cada vez (AVA por continuidad, PISA/EROA, PSVD, AVM por PHT, gasto cardíaco, Qp/Qs, Bernoulli, longitud de onda, dP/dt).
- **Repaso dirigido** — repasa tus preguntas falladas o las que marcaste.
- **Progreso persistente** en el dispositivo (localStorage), con historial de exámenes.
- **Tema oscuro/claro**, diseño responsive y atajos de teclado (A–D para responder, ←/→ para navegar).

> **Contenido original.** Las preguntas están redactadas de nuevo sobre el temario y los valores de corte de las guías ASE (que son de dominio público). No reproduce ningún libro con derechos de autor. Es material educativo y **no sustituye** las guías ni el juicio clínico.

## Estructura

```
echo-board-sim/
├── index.html            # punto de entrada
├── assets/
│   ├── styles.css        # estilos (tema oscuro/claro)
│   ├── questions.js      # BANCO DE PREGUNTAS  ← edita aquí para añadir preguntas
│   └── app.js            # lógica (modos, cronómetros, progreso, análisis)
└── README.md
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo, `echo-board-sim`).
2. Sube estos archivos manteniendo la estructura de carpetas. Por línea de comandos:
   ```bash
   git init
   git add .
   git commit -m "EchoBoard: simulador de eco"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/echo-board-sim.git
   git push -u origin main
   ```
3. En el repositorio: **Settings → Pages**.
4. En **Build and deployment → Source**, elige **Deploy from a branch**.
5. Selecciona la rama **main** y la carpeta **/ (root)**. Guarda.
6. Espera ~1 minuto. Tu app quedará en:
   `https://TU_USUARIO.github.io/echo-board-sim/`

No hace falta ningún paso de compilación: es un sitio estático.

También puedes abrir `index.html` directamente en el navegador (doble clic). En ese modo `file://`, algunos navegadores bloquean el almacenamiento local y el progreso podría no guardarse; en GitHub Pages (https) funciona con normalidad.

## Añadir o editar preguntas

Abre `assets/questions.js`.

### Pregunta conceptual

Añade un objeto al array `STATIC_QUESTIONS`. Cada opción lleva su propia explicación (`e`), que es lo que se muestra en el modo entrenamiento:

```js
{
  id: 'mit-05',              // identificador único
  cat: 'mitral',            // id de categoría (ver lista CATEGORIES)
  dif: 'intermedio',        // etiqueta libre: básico | intermedio | avanzado
  q: 'Enunciado de la pregunta…',
  ref: 'Concepto o guía de referencia',
  opts: [
    { t: 'Opción correcta',   ok: true,  e: 'Por qué es correcta.' },
    { t: 'Distractor 1',      ok: false, e: 'Por qué no es correcta.' },
    { t: 'Distractor 2',      ok: false, e: 'Por qué no es correcta.' },
    { t: 'Distractor 3',      ok: false, e: 'Por qué no es correcta.' },
  ],
},
```

Marca **una sola** opción con `ok: true`. Puedes poner 3, 4 o más opciones (las teclas van de la A a la F). El orden se baraja solo.

### Pregunta de cálculo (valores nuevos cada vez)

Añade un objeto al array `GENERATORS` con una función `build()` que devuelva `{ q, opts, ref }`. Usa los ayudantes `_ri` (entero aleatorio), `_rc` (elige de una lista), `_r1`/`_r2` (redondeo):

```js
{ id: 'gen-mi', cat: 'hemodinamica', dif: 'intermedio', build() {
    const v = _rc([1.5, 2.0, 2.5]);
    const resultado = 4 * v * v;
    return {
      ref: 'Concepto',
      q: `Con una velocidad de ${v} m/s, ¿cuál es el gradiente?`,
      opts: [
        { t: `${resultado} mmHg`, ok: true,  e: `4 × ${v}² = ${resultado} mmHg.` },
        { t: `${4 * v} mmHg`,     ok: false, e: 'Falta elevar al cuadrado.' },
        { t: `${v * v} mmHg`,     ok: false, e: 'Falta el factor 4.' },
      ],
    };
  }},
```

### Añadir una categoría nueva

Agrega una entrada al array `CATEGORIES` con `id`, `name` y un `color` (hex). Luego usa ese `id` en el campo `cat` de tus preguntas.

## Personalizar el aspecto

Los colores y radios están como variables CSS al inicio de `assets/styles.css` (bloque `:root`, y `[data-theme="light"]` para el tema claro). Cambia `--brand` para el color de acento principal.
