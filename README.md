# ECHO BOARD Simulator V3

Simulador estático para preparación de board de ecocardiografía, compatible con GitHub Pages.

## Incluye
- Banco inicial de **60 preguntas originales** en `questions.js`.
- Training: una pregunta a la vez, temporizador y explicación de **A, B, C y D** después de responder.
- Real Test: tiempo de 60 s/pregunta, sin feedback hasta terminar.
- Resultado final: score, correctas, incorrectas, no respondidas, tiempo y análisis por categoría.
- Guardado local de desempeño por pregunta.
- **Review wrong / Review correct** desde el dashboard.
- Question Bank con búsqueda, filtros y práctica individual.
- **Add question**: crear preguntas nuevas desde la interfaz y guardarlas en `localStorage`.
- **Import JSON / Export JSON** para ampliar o respaldar el banco.
- Responsive y sin backend.

## Formato para importar preguntas
El JSON puede ser un array o `{ "questions": [...] }`. Cada pregunta requiere:

```json
{
  "id": "CUSTOM-001",
  "category": "Valvular Disease",
  "difficulty": "Core",
  "question": "Your question",
  "options": [
    {"text":"Option A","explanation":"Why A is correct/incorrect."},
    {"text":"Option B","explanation":"Why B is correct/incorrect."},
    {"text":"Option C","explanation":"Why C is correct/incorrect."},
    {"text":"Option D","explanation":"Why D is correct/incorrect."}
  ],
  "answer": 0,
  "concept": "Key concept"
}
```

`answer` es 0=A, 1=B, 2=C, 3=D.

## GitHub Pages
1. Crea un repositorio, por ejemplo `echo-board-simulator`.
2. Sube `index.html`, `styles.css`, `app.js`, `questions.js` y `README.md`.
3. En **Settings → Pages**, selecciona **Deploy from branch → main → / (root)**.
4. Guarda y abre `https://TU-USUARIO.github.io/echo-board-simulator/`.

## Derechos de autor
El PDF suministrado es *Echocardiography Board Review: 600 Multiple Choice Questions with Discussion, Third Edition* (Wiley, 2025). El banco incluido aquí contiene preguntas **originales**, inspiradas en los dominios y conceptos del material, y no reproduce las 600 preguntas del libro literalmente. Si cuentas con una licencia/autorización para distribuir el banco del libro, puede adaptarse a este mismo esquema JSON.


## V3
- Banco de 600 preguntas (564 del PDF suministrado + 36 originales).
- 3–7 opciones A–G.
- Matching questions soportadas.
- Banco de errores/correctas, estadísticas, cronómetro, import/export y editor de preguntas.
- Lee `CONTENT_NOTICE.md` antes de publicar el banco en GitHub.
