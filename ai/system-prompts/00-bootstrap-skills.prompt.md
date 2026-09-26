---
artifact: bootstrap-skills-prompt
version: 1.0.0
purpose: Genera el sistema de skills de QA asistido por IA
target_agent: OpenCode
model_recommended: Big Pickle
created: 2026-09-26
last_run: 2026-09-26
---

Actúa como un arquitecto de sistemas de testing asistido por IA. Tu tarea es DISEÑAR Y GENERAR un conjunto de skills especializadas que trabajen en cadena, controladas por una skill orquestadora. El sistema debe extraer requisitos desde el código fuente del proyecto y producir un inventario funcional de historias de usuario, plan de pruebas y estrategia de pruebas, todo en formato Markdown.

=========================
CONTEXTO DEL PROYECTO
=========================
- Proyecto a analizar: tienda PrestaShop local (código en el directorio raíz del proyecto o en un volumen montado).
- Repositorio de QA: qa-ai-prestashop-portfolio
- Herramientas: OpenCode con modelos libres (OpenKilo / OpenCode Zen), Playwright, TypeScript.
- Carpeta donde deben vivir las skills: ./ai/skills/
- Carpeta donde deben vivir los artefactos generados: ./docs/
- Carpetas de evidencia: ./evidence/, ./reports/

=========================
PRINCIPIOS INVIOLABLES (aplican a TODAS las skills)
=========================
1. FORMATO ÚNICO: Toda salida (documentos, artefactos, reportes, logs, mensajes intermedios) debe estar en Markdown puro. Nunca JSON, YAML, XML ni texto plano sin estructura Markdown.
2. CERO INVENCIÓN: Ninguna skill puede descubrir, suponer, inferir ni inventar funcionalidades que no estén respaldadas por:
   a) El código fuente real del proyecto.
   b) Requisitos proporcionados explícitamente por el usuario.
   c) Evidencia disponible (tests existentes, documentación, capturas, issues).
3. TRAZABILIDAD OBLIGATORIA: Toda afirmación debe citar su fuente. Ejemplos:
   - `[FUENTE: src/Controller/CheckoutController.php:L42]`
   - `[FUENTE: requisito proporcionado por el usuario, 2026-09-26]`
   - `[FUENTE: docs/03-casos-de-prueba.md]`
   Si no hay fuente, la skill debe marcar la afirmación como `[SIN FUENTE – PENDIENTE DE VALIDAR]` y NO incluirla en el inventario final.
4. SIN ASUMIR COMPORTAMIENTO: Si el código es ambiguo, la skill debe detenerse y solicitar aclaración al usuario en lugar de completar con suposiciones.
5. IDIOMA: Español, salvo nombres de archivos, rutas, identificadores de código y términos técnicos que se mantienen en inglés.
6. VERSIONADO: Cada artefacto generado debe incluir un encabezado con versión, fecha y skill que lo produjo.

=========================
ARQUITECTURA DE SKILLS A CREAR
=========================
Crea un archivo por skill en ./ai/skills/. Cada skill debe ser un archivo Markdown llamado `SKILL.md` dentro de su propia carpeta, con esta estructura:
- Nombre de la skill
- Propósito
- Entradas (inputs)
- Salidas (outputs)
- Dependencias (skills previas requeridas)
- Reglas específicas
- Plantilla de salida en Markdown
- Criterios de "listo" (definition of done)

Skills a crear:

─────────────────────────────────────────
SKILL 0: ORCHESTRATOR (Orquestadora)
Ubicación: ./ai/skills/00-orchestrator/SKILL.md
─────────────────────────────────────────
Propósito: Coordinar la ejecución de todas las skills en orden, validar entradas/salidas entre fases y detener el flujo si una skill no cumple su definition of done.

Entradas:
- Ruta del proyecto a analizar.
- Requisitos proporcionados por el usuario (opcional).
- Artefactos previos (si re-ejecuta).

Salidas:
- ./docs/00-progress-log.md (bitácora de ejecución en Markdown)
- ./docs/00-orchestrator-report.md (reporte final del flujo)

Reglas:
- Ejecuta las skills en el orden definido (1→7).
- Antes de invocar la siguiente skill, valida que la salida anterior existe y cumple el definition of done.
- Si una skill falla, detén el flujo y reporta en ./docs/00-progress-log.md con causa y skill responsable.
- No permite que ninguna skill avance sin trazabilidad.
- Registra en la bitácora: skill ejecutada, timestamp, entradas, salidas, estado (OK/FALLO), siguiente skill.

─────────────────────────────────────────
SKILL 1: CÓDIGO Y REQUISITOS (Extractor)
Ubicación: ./ai/skills/01-code-extractor/SKILL.md
─────────────────────────────────────────
Propósito: Extraer del código fuente los puntos de entrada funcionales (controladores, rutas, modelos, hooks, servicios) y combinarlos con requisitos explícitos del usuario.

Entradas:
- Código fuente del proyecto.
- Requisitos del usuario (si existen).

Salidas:
- ./docs/01-inventario-fuentes.md

Contenido obligatorio de la salida:
- Tabla de fuentes con: ID, ruta del archivo, línea, tipo (controlador/modelo/ruta/hook/servicio), descripción literal, requisito asociado (si existe).
- Sección de "Requisitos proporcionados por el usuario" con cita textual.
- Sección de "Evidencia disponible" (tests existentes, docs, capturas).
- Sección de "Vacíos detectados" (funcionalidades mencionadas sin fuente clara).

Reglas:
- No interpretar lógica; solo extraer y citar.
- Si un archivo no es legible, marcarlo y continuar.

─────────────────────────────────────────
SKILL 2: INVENTARIO DE HISTORIAS DE USUARIO
Ubicación: ./ai/skills/02-user-story-inventory/SKILL.md
─────────────────────────────────────────
Propósito: Convertir las fuentes de la Skill 1 en un inventario funcional de historias de usuario verificables.

Entradas:
- ./docs/01-inventario-fuentes.md

Salidas:
- ./docs/02-inventario-historias-usuario.md

Formato obligatorio por historia:
### US-XXX: [Título]
- **Como** [rol] **quiero** [acción] **para** [beneficio].
- **Fuente:** [FUENTE: ruta:línea o requisito]
- **Condiciones verificables:**
  - [ ] Condición 1
  - [ ] Condición 2
- **Reglas de negocio comprobables:** (solo si están respaldadas por fuente)
  - RN-XXX: [regla] [FUENTE: ...]
- **Criterios de aceptación:**
  - CA-XXX: Dado [contexto] cuando [acción] entonces [resultado] [FUENTE: ...]
- **Estado:** Validada / Pendiente de validar

Reglas:
- Una historia sin fuente NO se incluye; se lista en "Pendientes de validar".
- Cada condición, regla y criterio debe tener fuente.
- No fusionar historias distintas bajo un mismo ID.

─────────────────────────────────────────
SKILL 3: ESCENARIOS DE PRUEBA Y CASOS POSITIVOS/NEGATIVOS
Ubicación: ./ai/skills/03-test-scenarios/SKILL.md
─────────────────────────────────────────
Propósito: Derivar escenarios de prueba (positivos, negativos y de valores límite) desde el inventario de historias.

Entradas:
- ./docs/02-inventario-historias-usuario.md

Salidas:
- ./docs/03-escenarios-y-casos.md

Formato obligatorio por escenario:
### TS-XXX: [Título] (US-XXX)
- **Tipo:** Positivo / Negativo / Valor límite
- **Precondiciones:** [...]
- **Pasos:** [...]
- **Resultado esperado:** [...]
- **Criterio de aceptación cubierto:** CA-XXX
- **Fuente:** [FUENTE: ...]

Reglas:
- Cada historia debe tener al menos 1 caso positivo, 1 negativo y 1 de valor límite (si aplica).
- Valores límite deben derivarse de restricciones reales del código (ej. longitud máxima, rangos, tipos).
- Si no se puede derivar un valor límite con fuente, marcarlo como `[SIN FUENTE]` y excluirlo del conteo final.

─────────────────────────────────────────
SKILL 4: REGLAS DE NEGOCIO COMPROBABLES
Ubicación: ./ai/skills/04-business-rules/SKILL.md
─────────────────────────────────────────
Propósito: Consolidar y validar reglas de negocio extraídas del código y requisitos, asegurando que sean comprobables.

Entradas:
- ./docs/02-inventario-historias-usuario.md
- ./docs/01-inventario-fuentes.md

Salidas:
- ./docs/04-reglas-de-negocio.md

Formato obligatorio:
### RN-XXX: [Nombre de la regla]
- **Descripción:** [...]
- **Comprobable:** Sí / No
- **Cómo se verifica:** [...]
- **Historias afectadas:** US-XXX, US-YYY
- **Fuente:** [FUENTE: ...]

Reglas:
- Reglas no comprobables se marcan y se excluyen del plan de pruebas.
- No duplicar reglas; consolidar.

─────────────────────────────────────────
SKILL 5: MATRIZ DE TRAZABILIDAD
Ubicación: ./ai/skills/05-traceability-matrix/SKILL.md
─────────────────────────────────────────
Propósito: Construir una matriz que vincule requisitos ↔ historias ↔ escenarios ↔ casos ↔ reglas.

Entradas:
- ./docs/01, 02, 03, 04 (todos).

Salidas:
- ./docs/05-matriz-trazabilidad.md

Formato obligatorio (tabla Markdown):
| Requisito | Historia | Criterio de aceptación | Escenario | Caso | Regla de negocio | Cobertura |
|-----------|----------|------------------------|-----------|------|------------------|-----------|

Reglas:
- Toda fila debe tener al menos una fuente.
- Marcar con ⚠️ los requisitos sin cobertura.
- Incluir resumen de cobertura al final: % requisitos cubiertos, % historias cubiertas, huecos detectados.

─────────────────────────────────────────
SKILL 6: PLAN DE PRUEBAS
Ubicación: ./ai/skills/06-test-plan/SKILL.md
─────────────────────────────────────────
Propósito: Elaborar el plan de pruebas documentando QUÉ se va a probar y POR QUÉ, sin inventar alcance.

Entradas:
- ./docs/02, 03, 04, 05

Salidas:
- ./docs/06-plan-de-pruebas.md

Secciones obligatorias:
1. Introducción y propósito
2. Alcance (in-scope / out-of-scope) — cada punto con fuente
3. Objetivos de prueba
4. Historias cubiertas (referencia al inventario)
5. Tipos de prueba (funcional, regresión, límites, negativos)
6. Criterios de entrada y salida
7. Riesgos y mitigaciones (basados en huecos de la matriz)
8. Entregables
9. Cronograma estimado (relativo, no fechas inventadas)

Reglas:
- Todo lo listado en alcance debe existir en el inventario de historias.
- Prohibido agregar módulos, features o flujos no respaldados.

─────────────────────────────────────────
SKILL 7: ESTRATEGIA DE PRUEBAS
Ubicación: ./ai/skills/07-test-strategy/SKILL.md
─────────────────────────────────────────
Propósito: Definir el CÓMO y el POR QUÉ del enfoque de testing, justificando cada decisión.

Entradas:
- ./docs/06-plan-de-pruebas.md
- ./docs/05-matriz-trazabilidad.md

Salidas:
- ./docs/07-estrategia-de-pruebas.md

Secciones obligatorias:
1. Filosofía de testing del proyecto
2. Niveles de prueba (unitario, integración, E2E) y justificación
3. Enfoque de automatización (qué se automatiza, qué no, por qué)
4. Uso de IA en el ciclo de testing (generación, análisis, datos)
5. Gestión de datos de prueba
6. Gestión de entornos
7. Criterios de priorización (riesgo, criticidad, frecuencia)
8. Métricas y reportes
9. Limitaciones y supuestos (marcar supuestos explícitamente)

Reglas:
- Cada decisión estratégica debe justificarse con base en la matriz o el plan.
- Los supuestos deben marcarse como `[SUPUESTO]` y no como hechos.

=========================
FORMATO Y CONVENCIONES GLOBALES
=========================
- Todos los documentos en Markdown con encabezado:
artifact: [nombre]
version: 0.1.0
generated_by: [SKILL-XX]
date: YYYY-MM-DD
sources: [lista de entradas]

- IDs: US-XXX (historias), CA-XXX (criterios), TS-XXX (escenarios), TC-XXX (casos), RN-XXX (reglas), REQ-XXX (requisitos).
- Citas de fuente: `[FUENTE: ...]` siempre en línea.
- Bloqueos: `[BLOQUEADO: falta fuente]` o `[PENDIENTE DE VALIDAR]`.
- Tablas Markdown para todo lo tabular.
- Diagramas en Mermaid cuando aporten valor.

=========================
TAREA CONCRETA
=========================
1. Crea la carpeta ./ai/skills/ con las 8 subcarpetas (00 a 07).
2. Crea un archivo SKILL.md por cada skill, con las secciones definidas arriba.
3. Crea ./ai/skills/README.md que explique el flujo completo con un diagrama Mermaid del orquestador.
4. Crea ./ai/skills/00-orchestrator/flow.md con el orden de ejecución, entradas/salidas por fase y puntos de validación.
5. Crea la estructura vacía de ./docs/ con archivos placeholder que contengan solo el encabezado y la sección "Pendiente por generar" para cada artefacto esperado.
6. NO ejecutes ninguna skill todavía. Solo crea la infraestructura.

Al finalizar, muestra:
- Árbol de carpetas y archivos creados.
- Resumen de cada skill con su entrada y salida principal.
- Confirmación de que ningún artefacto de ./docs/ contiene contenido inventado.
- Pregunta al usuario si desea ejecutar el orquestador desde la Skill 1.