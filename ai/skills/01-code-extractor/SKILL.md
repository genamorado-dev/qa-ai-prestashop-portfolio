---
name: 01-code-extractor
description: Extrae del código fuente los puntos de entrada funcionales (controladores, rutas, modelos, hooks, servicios) y los combina con los requisitos explícitos del usuario, citando cada hallazgo. Úsala como fase 1 del pipeline de QA para construir el inventario de fuentes.
artifact: skill-01-code-extractor
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
---

# SKILL 1: CÓDIGO Y REQUISITOS (Extractor)

## Propósito

Extraer del código fuente del proyecto los puntos de entrada funcionales (controladores, rutas, modelos, hooks, servicios) y combinarlos con los requisitos explícitos del usuario, **citando siempre la ubicación exacta** de cada hallazgo.

Es una skill de **extracción pura**: copia y cita, no interpreta.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Código fuente del proyecto (`PROJECT_ROOT`) | Sí | Repositorio PrestaShop local o volumen montado |
| Requisitos del usuario (`REQUIREMENTS_FILE` o requisitos en conversación) | No | Se citan textualmente, nunca se reinterpretan |
| Evidencia disponible (tests, docs, capturas) | No | Se inventarian, no se generan |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/01-inventario-fuentes.md` | Tabla de fuentes + requisitos del usuario + evidencia + vacíos detectados |

## Dependencias

- Ninguna. Fase 1 del pipeline.
- Requiere las definiciones de `00-orchestrator/SKILL.md` (principios globales).

## Reglas específicas

1. **No interpretar lógica.** Solo extraer y citar. Si un fragmento requiere interpretación para entenderse, márcalo como `[PENDIENTE DE VALIDAR]`.
2. **Cita obligatoria con línea.** Toda fila de la tabla de fuentes incluye `ruta:línea`. Sin línea, la fuente no es válida.
3. **Descripción literal.** La columna "descripción" cita o parafrasea literalmente el código; no resume el comportamiento de negocio.
4. **Archivos ilegibles:** márcalos con `[BLOQUEADO: archivo no legible]` en la tabla y **continúa** con el resto. No detengas el flujo por un archivo.
5. **Sin suposiciones:** si un archivo no existe o una ruta no está clara, no lo inventes ni lo completes.
6. **Requisitos del usuario:** copia textual, con fecha y origen. Si el requisito no tiene cita, es `[PENDIENTE DE VALIDAR]`.
7. **Un ID por fuente:** `FUENTE-XXX` secuencial y estable, para que las fases siguientes puedan citarla.
8. **Vacíos detectados:** toda funcionalidad mencionada en requisitos o evidencia que no tenga fuente clara en el código va a la sección de vacíos. No la incorpores a la tabla como si estuviera respaldada.
9. **Cobertura del barrido:** registra qué directorios se recorrieron y cuáles se excluyeron, para que la fase 2 sepa el perímetro real.

## Plantilla de salida en Markdown

```markdown
---
artifact: inventory-sources
version: 0.1.0
generated_by: SKILL-01
date: YYYY-MM-DD
sources: [PROJECT_ROOT, REQUIREMENTS_FILE, evidencia]
---

# 01 — Inventario de fuentes

## Perímetro analizado
| Directorio | Recorrido | Notas |
| :--- | :--- | :--- |

## Tabla de fuentes
| ID | Ruta del archivo | Línea | Tipo | Descripción literal | Requisito asociado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FUENTE-001 | src/.../Controller.php | L42 | controlador | [cita literal] | REQ-001 |

Tipos válidos: `controlador` · `modelo` · `ruta` · `hook` · `servicio` · `configuración` · `otro`

## Requisitos proporcionados por el usuario
> Cita textual. [FUENTE: requisito proporcionado por el usuario, YYYY-MM-DD]

| ID | Requisito (cita textual) | Fecha | Observaciones |
| :--- | :--- | :--- | :--- |

## Evidencia disponible
| Tipo | Ruta | Qué aporta |
| :--- | :--- | :--- |

## Vacíos detectados
| Vacío | Mencionado en | Impacto |
| :--- | :--- | :--- |

## Bloqueos
- [BLOQUEADO: ...] / [PENDIENTE DE VALIDAR: ...]
```

## Criterios de "listo" (definition of done)

- [ ] El archivo `./docs/01-inventario-fuentes.md` existe con encabezado completo.
- [ ] Existe la sección "Perímetro analizado" con los directorios recorridos y excluidos.
- [ ] Existe la tabla de fuentes con columnas ID, ruta, línea, tipo, descripción literal y requisito asociado.
- [ ] Todas las filas tienen `ruta:línea` y `[FUENTE: ...]`.
- [ ] Existe la sección de requisitos del usuario con cita textual, o la indicación explícita de que no se proporcionaron.
- [ ] Existe la sección de evidencia disponible.
- [ ] Existe la sección de vacíos detectados.
- [ ] No hay ninguna funcionalidad inferida: todo lo listado tiene fuente.
