---
artifact: run-repetitive-tasks-skill-prompt
version: 1.0.0
purpose: DISEÑAR Y GENERAR un conjunto de skills especializadas que automaticen las TAREAS REPETITIVAS de un QA Engineer
target_agent: OpenCode / Cursor / Claude
model_recommended: deepseek-r1:free o qwen3-coder:free
created: 2026-09-26
last_run: null
---

Actúa como un arquitecto de sistemas de testing asistido por IA. Tu tarea es DISEÑAR Y GENERAR un conjunto de skills especializadas que automaticen las TAREAS REPETITIVAS de un QA Engineer. Estas skills son distintas de las que ya existen en ./ai/skills/ (00-07), que se encargan de extraer requisitos desde el código. Estas nuevas skills operan SOBRE los artefactos de QA (historias, casos, reportes, logs, código de test) para acelerar el trabajo diario.

=========================
CONTEXTO DEL PROYECTO
=========================
- Repositorio: qa-ai-prestashop-portfolio
- Skills existentes: ./ai/skills/00-orchestrator a 07-test-strategy (sistema de extracción de requisitos).
- Nuevas skills: deben vivir en ./ai/skills/tasks/ con el prefijo TSK-XX.
- Herramientas: OpenCode con modelos libres, Playwright, TypeScript.
- Carpeta de artefactos de entrada: ./docs/ (inventario de historias, casos, plan, estrategia) y ./evidence/ (reportes, logs, screenshots).
- Carpeta de salida de las skills: ./docs/tasks/ y ./evidence/tasks/.
- Prompts del sistema: ./ai/system-prompts/.

=========================
PRINCIPIOS INVIOLABLES (aplican a TODAS las skills)
=========================
1. FORMATO ÚNICO: Toda salida en Markdown puro. Nunca JSON, YAML, XML ni texto plano sin estructura.
2. CERO INVENCIÓN: Ninguna skill puede inventar información. Si un dato no está en la entrada, se marca como `[PENDIENTE DE VALIDAR]` o `[SIN FUENTE]`.
3. TRAZABILIDAD OBLIGATORIA: Cada afirmación debe citar su fuente. Ej: `[FUENTE: docs/02-inventario-historias-usuario.md#US-012]`, `[FUENTE: logs/run-2026-09-26.txt:L145]`, `[FUENTE: tests/e2e/checkout.spec.ts:L32]`.
4. AISLAMIENTO: Cada skill opera sobre su propia entrada y produce su propia salida. No modifica artefactos de otras skills.
5. IDEMPOTENCIA: Ejecutar la misma skill dos veces sobre la misma entrada produce el mismo resultado.
6. IDIOMA: Español, salvo nombres de archivo, rutas, identificadores y términos técnicos.
7. VERSIONADO: Cada artefacto generado incluye encabezado con versión, fecha, skill y entradas.

=========================
SKILLS A CREAR (selecciona solo las que el usuario confirme)
=========================
Crea un archivo SKILL.md por cada skill confirmada dentro de ./ai/skills/tasks/TSK-XX-nombre/SKILL.md.

Cada SKILL.md debe contener:
- ID y nombre
- Propósito (1 párrafo)
- Cuándo usarla (disparadores)
- Entradas (rutas concretas)
- Salidas (rutas concretas)
- Dependencias (otras skills o artefactos)
- Proceso paso a paso
- Reglas específicas
- Plantilla de salida en Markdown
- Criterios de "listo" (definition of done)
- Ejemplos de invocación

─────────────────────────────────────────
CATÁLOGO BASE (las 9 tareas que el usuario ya identificó)
─────────────────────────────────────────

TSK-01 — Revisión de requisitos
Entrada: docs/02-inventario-historias-usuario.md
Salida: docs/tasks/TSK-01-revision-requisitos.md
Detecta: criterios de aceptación faltantes, casos límite ausentes, requisitos ambiguos, reglas de negocio no comprobables.
Formato de salida: tabla por historia con hallazgo, severidad, recomendación y fuente.

TSK-02 — Generación de casos de prueba
Entrada: docs/02-inventario-historias-usuario.md, docs/04-reglas-de-negocio.md
Salida: docs/tasks/TSK-02-casos-de-prueba.md
Genera: escenarios positivos, negativos, límite y de integración por historia.
Formato: TS-XXX con precondiciones, pasos, resultado esperado, criterio cubierto, tipo.

TSK-03 — Contrato API (OpenAPI)
Entrada: ruta al archivo OpenAPI (.yaml/.json) + endpoints de interés
Salida: docs/tasks/TSK-03-contrato-api.md
Analiza: validación de request, casos negativos, revisión de esquema, códigos de error, headers, autenticación.
Formato: por endpoint, con request/response esperados, casos negativos y validaciones sugeridas.

TSK-04 — Revisión de código de automatización
Entrada: archivos .spec.ts, .page.ts, .fixture.ts del proyecto
Salida: docs/tasks/TSK-04-revision-codigo-automatizacion.md
Detecta: data hardcodeada, aserciones débiles, localizadores inestables, código duplicado, waits bloqueantes, antipatrones de Playwright.
Formato: por archivo y línea, con categoría, severidad, recomendación y fuente.

TSK-05 — Análisis de fallos de ejecución
Entrada: reporte HTML de Playwright, logs, stack traces, screenshots
Salida: docs/tasks/TSK-05-analisis-fallos.md
Clasifica cada fallo en: defecto de producto, problema de automatización, problema de datos, fallo de ambiente.
Formato: tabla con test, error, categoría, evidencia, causa probable, acción recomendada.

TSK-06 — Análisis de tests inestables (flaky)
Entrada: histórico de ejecuciones (varias corridas), reportes previos
Salida: docs/tasks/TSK-06-analisis-flaky.md
Identifica: tests con fallos intermitentes, patrones de timing, dependencias entre tests, condiciones de carrera.
Formato: ranking de tests por tasa de fallo, patrón detectado, causa raíz probable, mitigación.

TSK-07 — Redacción de defectos
Entrada: logs, screenshots, respuestas de API, pasos de reproducción
Salida: docs/tasks/TSK-07-defectos/BUG-XXX.md (un archivo por defecto)
Formato: título, severidad, prioridad, ambiente, precondiciones, pasos, resultado esperado vs real, evidencia adjunta, fuente.

TSK-08 — Selección de tests para regresión
Entrada: diff de código (git), servicios afectados, histórico de defectos
Salida: docs/tasks/TSK-08-seleccion-regresion.md
Recomienda: set mínimo de tests a ejecutar, con justificación por cambio y riesgo.
Formato: tabla con test, motivo, criticidad, cobertura del cambio.

TSK-09 — Resumen de release
Entrada: reportes de ejecución, estado de defectos, riesgos conocidos
Salida: docs/tasks/TSK-09-resumen-release.md
Produce: estado de calidad del release, cobertura, defectos abiertos por severidad, riesgos, recomendación go/no-go.

─────────────────────────────────────────
CATÁLOGO ADICIONAL (sugerencias — el usuario decide si las incluye)
─────────────────────────────────────────

TSK-10 — Healthcheck de entorno
Valida que el entorno esté operativo antes de correr la suite (URL, login, servicios, versiones).

TSK-11 — Generación y enmascaramiento de datos
Genera datos de prueba realistas y enmascara PII en logs y reportes.

TSK-12 — Triage de fallos de pipeline CI/CD
Analiza logs de GitHub Actions y clasifica el fallo (código, infra, dependencias, timeout).

TSK-13 — Detección de breaking changes en OpenAPI
Compara dos versiones del contrato y reporta cambios incompatibles.

TSK-14 — Análisis de cobertura funcional
Cruza el inventario de historias con los tests existentes y reporta gaps.

TSK-15 — Priorización de automatización por ROI
Puntúa candidatos a automatizar por frecuencia × criticidad × costo.

TSK-16 — Auditoría de accesibilidad WCAG básica
Revisa contraste, ARIA, navegación por teclado y estructura semántica.

TSK-17 — Detección de redundancia en tests
Identifica tests duplicados o solapados que pueden consolidarse.

TSK-18 — Validación post-deploy
Compara comportamiento antes/después de un despliegue en smoke tests críticos.

TSK-19 — Métricas de calidad del release
Produce un dashboard textual: defectos por severidad, escape rate, cobertura, flakiness.

TSK-20 — Revisión de accesibilidad en localizadores
Audita que los selectores de Playwright usen atributos accesibles (role, aria-label, data-test) en lugar de clases CSS frágiles.

─────────────────────────────────────────
SKILL ORQUESTADORA DE TAREAS
─────────────────────────────────────────
Crea ./ai/skills/tasks/00-orchestrator-tasks/SKILL.md con:
- Propósito: coordinar la ejecución de las skills TSK-XX según un pipeline configurable.
- Pipelines predefinidos:
  - "nueva-historia": TSK-01 → TSK-02 → TSK-14
  - "revision-suite": TSK-04 → TSK-17 → TSK-20
  - "post-ejecución": TSK-05 → TSK-06 → TSK-07
  - "pre-release": TSK-08 → TSK-09 → TSK-19
  - "pre-ejecución": TSK-10 → TSK-11
- Entradas: nombre del pipeline o lista explícita de TSK-XX.
- Salidas: docs/tasks/00-orchestrator-tasks-log.md (bitácora en Markdown).
- Reglas: valida la salida de cada skill antes de pasar a la siguiente; si una falla, detén el pipeline y reporta.

─────────────────────────────────────────
FORMATO Y CONVENCIONES GLOBALES
─────────────────────────────────────────
- Encabezado obligatorio en cada artefacto:

artifact: [nombre]
version: 0.1.0
generated_by: TSK-XX
date: YYYY-MM-DD
sources: [lista de entradas]

- IDs: BUG-XXX (defectos), TS-XXX (escenarios), TC-XXX (casos), HALL-XXX (hallazgos).
- Citas de fuente: `[FUENTE: ...]` siempre en línea.
- Bloqueos: `[BLOQUEADO: falta fuente]`, `[PENDIENTE DE VALIDAR]`, `[SIN FUENTE]`.
- Tablas Markdown para todo lo tabular.
- Diagramas Mermaid cuando aporten valor.

─────────────────────────────────────────
TAREA CONCRETA
─────────────────────────────────────────
1. Pregúntame primero qué skills del catálogo adicional (TSK-10 a TSK-20) quiero incluir. Espera mi respuesta.
2. Crea la carpeta ./ai/skills/tasks/ con una subcarpeta por skill confirmada (TSK-01 a TSK-NN + 00-orchestrator-tasks).
3. Crea un archivo SKILL.md por cada skill con todas las secciones indicadas.
4. Crea ./ai/skills/tasks/README.md con un diagrama Mermaid del catálogo completo y los pipelines predefinidos.
5. Crea la estructura vacía de ./docs/tasks/ y ./evidence/tasks/ con archivos .gitkeep.
6. Crea los prompts de sistema en ./ai/system-prompts/:
 - 03-bootstrap-qa-task-skills.prompt.md (este mismo prompt, guardado)
 - 04-run-task-skill.prompt.md (prompt para ejecutar una TSK-XX individual)
 - 05-run-task-pipeline.prompt.md (prompt para ejecutar un pipeline completo)
7. NO ejecutes ninguna skill todavía. Solo crea la infraestructura.

Al finalizar, muestra:
- Árbol de carpetas y archivos creados.
- Tabla resumen con cada TSK-XX: nombre, entrada, salida.
- Lista de pipelines predefinidos.
- Confirmación de que ningún artefacto contiene contenido inventado.
- Pregunta al usuario qué pipeline quiere ejecutar primero.