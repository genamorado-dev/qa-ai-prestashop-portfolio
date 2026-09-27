---
name: TSK-01-revision-requisitos
description: Audita el inventario de historias de usuario y detecta criterios de aceptación faltantes, casos límite ausentes, requisitos ambiguos y reglas de negocio no comprobables, entregando hallazgos con severidad, recomendación y fuente por historia. Úsala al recibir una historia nueva o antes de diseñar pruebas.
artifact: skill-tsk-01-revision-requisitos
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-01: REVISIÓN DE REQUISITOS

## Propósito

Auditar el inventario de historias de usuario para localizar lo que impide escribir pruebas válidas: criterios de aceptación ausentes o no observables, escenarios límite no contemplados, redactos ambiguos y reglas de negocio escritas de forma no comprobable. Produce una lista de hallazgos priorizada que sirve de entrada directa a la generación de casos de prueba, sin reescribir las historias ni proponer funcionalidad nueva.

## Cuándo usarla (disparadores)

- Llega una historia nueva o una versión revisada de una historia existente.
- Antes de ejecutar `TSK-02` para asegurar que las historias son testeables.
- El equipo pide "revisar los requisitos" o "dime qué falta para poder probar esto".
- Tras una iteración de planificación donde cambiaron criterios de aceptación.
- Cuando un caso automatizado falla y se sospecha que la ambigüedad está en el requisito, no en el producto.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `./docs/02-inventario-historias-usuario.md` | Sí | Fuente primaria: historias `US-XXX`, criterios `CA-XXX` |
| `./docs/04-reglas-de-negocio.md` | No | Permite contrastar reglas `RN-XXX` con los criterios de aceptación |
| `./docs/01-inventario-fuentes.md` | No | Permite verificar si un requisito tiene respaldo en código |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-01-revision-requisitos.md` | Tabla de hallazgos `HALL-XXX` por historia + resumen de severidades + bloqueos |
| `./evidence/tasks/` | Sin escritura. Esta skill no produce evidencia |

## Dependencias

- **SKILL 02** (`docs/02-inventario-historias-usuario.md`) — dependencia dura.
- **SKILL 04** (`docs/04-reglas-de-negocio.md`) — dependencia opcional.
- Alimenta a: `TSK-02`, `TSK-14`, `TSK-15`.

## Proceso paso a paso

1. **Verificar entradas.** Comprueba que `docs/02-inventario-historias-usuario.md` existe y contiene al menos una historia `US-XXX`. Si no existe: detén y reporta `[BLOQUEADO: falta docs/02-inventario-historias-usuario.md]`.
2. **Indexar historias.** Extrae el listado completo de `US-XXX` con su título y, si existe, su enlace a `FUENTE-XXX`. No interpretes: copia el identificador literal.
3. **Auditar por historia, en este orden fijo:**
   1. **Criterios de aceptación:** ¿existen? ¿son observables? Un criterio como "el sistema debe ser rápido" no es comprobable; uno como "el total se muestra en 2 decimales" sí lo es.
   2. **Casos límite:** ¿la historia menciona campos acotados (longitud, rango, cantidad, formato, obligatoriedad)? Si sí, ¿hay criterio para el valor mínimo, máximo y vacío?
   3. **Ambigüedad:** ¿hay términos sin definir, actor implícito, resultado no declarado o condiciones no exhaustivas (¿y si…?)?
   4. **Reglas de negocio:** ¿las `RN-XXX` asociadas se pueden verificar con una aserción observable? Si solo describen intención, es un hallazgo.
4. **Asignar severidad** según la tabla de severidades de más abajo. La severidad refleja el impacto en la capacidad de probar, no la urgencia del negocio.
5. **Redactar la recomendación.** Debe ser accionable y específica: qué escribir, no "definir mejor". Ejemplo: "Añadir criterio para email con formato inválido y el mensaje de error esperado".
6. **Anotar la fuente.** Cada hallazgo cita `US-XXX`/`CA-XXX` y, cuando aplique, la línea del inventario: `[FUENTE: docs/02-inventario-historias-usuario.md#US-012]`.
7. **Emitir el informe** con la plantilla de salida, incluyendo el recuento por severidad y el veredicto de testeabilidad por historia.
8. **No modificar la entrada.** Esta skill es de solo lectura sobre `docs/`.

## Reglas específicas

1. **Cero invención.** No escribas el criterio que falta: describe qué falta. Si sugieres una redacción, va marcada como `[PENDIENTE DE VALIDAR]` y en una sección aparte de "sugerencias", nunca mezclada con los hallazgos.
2. **Un hallazgo = un defecto.** No agrupes "criterios faltantes y ambigüedad" en la misma fila: si son dos problemas corregibles de forma independiente, son dos `HALL-XXX`.
3. **Severidad objetiva:**

   | Severidad | Criterio |
   | :--- | :--- |
   | **Bloqueante** | No se puede escribir ningún caso de prueba válido para la historia. |
   | **Alta** | Se puede probar el camino feliz, pero alguna rama relevante queda sin criterio. |
   | **Media** | El criterio es ambiguo y dos testers interpretarían el resultado esperado de forma distinta. |
   | **Baja** | Falta un caso límite o una precisión menor de redacción. |

4. **Sin criterio, no hay caso.** Esta skill no genera casos de prueba; solo señala los huecos que `TSK-02` deberá cubrir.
5. **Trazabilidad obligatoria.** Toda fila de la tabla de hallazgos incluye `[FUENTE: ...]`. Sin fuente, el hallazgo se mueve a la sección `[SIN FUENTE]` y no cuenta para el resumen de severidades.
6. **Aislamiento.** No leas ni modifiques salidas de otras `TSK-XX`. Solo lectura sobre `docs/`.
7. **Idempotencia.** Dos ejecuciones sobre la misma entrada producen el mismo informe, salvo el encabezado `date`. No numeres hallazgos con valores derivados del reloj.
8. **Orden estable.** Las historias se procesan en el orden en que aparecen en el inventario, no en orden alfabético, para que el informe sea comparable entre ejecuciones.
9. **Markdown puro.** Tablas Markdown para todo lo tabular. Sin JSON ni YAML.
10. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-01-revision-requisitos
version: 0.1.0
generated_by: TSK-01
date: YYYY-MM-DD
sources: [docs/02-inventario-historias-usuario.md, docs/04-reglas-de-negocio.md]
---

# TSK-01 — Revisión de requisitos

## Resumen
| Métrica | Valor |
| :--- | :--- |
| Historias revisadas | X |
| Historias con hallazgo bloqueante | Y |
| Hallazgos totales | Z |
| Hallazgos con fuente | Z1 (Z%) |

## Hallazgos por historia

### US-012 — [Título de la historia]
- **Fuente de la historia:** [FUENTE: docs/02-inventario-historias-usuario.md#US-012]
- **Veredicto de testeabilidad:** NO TESTEABLE / PARCIALMENTE TESTEABLE / TESTEABLE

| ID | Categoría | Descripción del hallazgo | Severidad | Recomendación | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| HALL-001 | Criterio faltante | No existe criterio para el caso de email con formato inválido | Bloqueante | Añadir criterio con el mensaje de error esperado | [FUENTE: docs/02-inventario-historias-usuario.md#US-012] |
| HALL-002 | Regla no comprobable | RN-004 dice "el descuento debe ser justo" sin umbral objetivo | Media | Definir el umbral numérico y la aserción asociada | [FUENTE: docs/04-reglas-de-negocio.md#RN-004] |

## Resumen por severidad
| Severidad | Cantidad | IDs |
| :--- | :--- | :--- |
| Bloqueante | X | HALL-001, ... |
| Alta | X | ... |
| Media | X | ... |
| Baja | X | ... |

## Hallazgos sin fuente (excluidos del resumen)
| ID | Descripción | Motivo | Marca |
| :--- | :--- | :--- | :--- |
| HALL-099 | ... | Referencia ambigua en el inventario | [SIN FUENTE] |

## Sugerencias de redacción (no son hallazgos)
> Todas las líneas de esta sección están marcadas `[PENDIENTE DE VALIDAR]` y requieren aprobación del responsable de requisitos.

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-01-revision-requisitos.md` existe con encabezado completo (`artifact`, `version`, `generated_by`, `date`, `sources`).
- [ ] Todas las historias `US-XXX` del inventario aparecen revisadas, incluidas las que no tienen hallazgos.
- [ ] Cada hallazgo tiene ID `HALL-XXX`, categoría, descripción, severidad, recomendación y `[FUENTE: ...]`.
- [ ] Cada historia declarada NO TESTEABLE tiene al menos un hallazgo de severidad Bloqueante.
- [ ] Existe el resumen por severidad con el listado de IDs incluidos en el conteo.
- [ ] Los hallazgos sin fuente están en sección separada y excluidos del resumen.
- [ ] Las sugerencias de redacción están marcadas `[PENDIENTE DE VALIDAR]` y no se presentan como hallazgos.
- [ ] `docs/02-inventario-historias-usuario.md` no ha sido modificado.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Revisión completa del inventario actual | `Ejecuta TSK-01 sobre ./docs/02-inventario-historias-usuario.md y escribe el informe en ./docs/tasks/TSK-01-revision-requisitos.md` |
| Pipeline de historia nueva | `Ejecuta el pipeline "nueva-historia" con TSK-01` |
| Modo simulación sin escribir archivos | `Ejecuta TSK-01 en DRY_RUN=true, no escribas el artefacto` |
| Con reglas de negocio | `Ejecuta TSK-01 usando también ./docs/04-reglas-de-negocio.md como entrada` |
