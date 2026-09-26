---
name: 07-test-strategy
description: Define cómo y por qué se prueba, justificando cada decisión con base en el plan de pruebas y la matriz de trazabilidad: niveles, automatización, uso de IA, datos, entornos, priorización, métricas y supuestos. Úsala como fase 7 del pipeline de QA.
artifact: skill-07-test-strategy
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
---

# SKILL 7: ESTRATEGIA DE PRUEBAS

## Propósito

Definir el **CÓMO** y el **POR QUÉ** del enfoque de testing, justificando cada decisión estratégica con base en el plan de pruebas y la matriz de trazabilidad.

## Entradas (inputs)

| Entrada | Requerida |
| :--- | :--- |
| `./docs/06-plan-de-pruebas.md` | Sí |
| `./docs/05-matriz-trazabilidad.md` | Sí |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/07-estrategia-de-pruebas.md` | Estrategia con 9 secciones justificadas y supuestos marcados |

## Dependencias

- **SKILL 5 y SKILL 6.** Última fase del pipeline.

## Reglas específicas

1. **Justificación obligatoria:** cada decisión estratégica cita la base concreta (matriz, plan, hueco, o tipo de prueba del inventario). Sin base, la decisión no se incluye.
2. **Supuestos explícitos:** todo supuesto se marca como `[SUPUESTO]`. **Prohibido** presentar un supuesto como hecho.
3. **Niveles de prueba:** para cada nivel (unitario, integración, E2E) indica qué parte del inventario cubre y qué no, con `US-XXX` / `TC-XXX` de referencia. No prometas niveles que el proyecto no pueda sostener.
4. **Automatización:** define qué se automatiza, qué no y **por qué** (criterio explícito, no opinión). Añade el esfuerzo relativo estimado.
5. **IA en el ciclo:** delimita el uso de IA (generación de casos, análisis de fallos, datos de prueba, sanación de localizadores). **Prohibido** delegar en IA la decisión de qué es un defecto o la validación de un resultado crítico: esas decisiones son humanas.
6. **Datos de prueba:** describe origen, generación, aislamiento y limpieza. Los datos se generan desde la matriz, no desde supuestos del negocio.
7. **Entornos:** solo describe entornos existentes o marcados como `[SUPUESTO]`/`[PENDIENTE DE VALIDAR]`. No inventes credenciales, URLs ni versiones.
8. **Priorización:** criterios de riesgo, criticidad y frecuencia, con la fuente de la criticidad (impacto en el negocio declarado en el plan o en el inventario).
9. **Métricas:** define métrica, fuente de datos, frecuencia de cálculo y objetivo. Sin objetivo declarado, márcalo como `[PENDIENTE DE VALIDAR]`.
10. **Idioma:** español, salvo identificadores, rutas y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: test-strategy
version: 0.1.0
generated_by: SKILL-07
date: YYYY-MM-DD
sources: [docs/06-plan-de-pruebas.md, docs/05-matriz-trazabilidad.md]
---

# 07 — Estrategia de pruebas

## 1. Filosofía de testing del proyecto
[Enfoque + fuente]

## 2. Niveles de prueba
| Nivel | Qué cubre | Historias / casos | Justificación |
| :--- | :--- | :--- | :--- |

## 3. Enfoque de automatización
| Elemento | ¿Automatizar? | Motivo | Esfuerzo relativo |
| :--- | :--- | :--- | :--- |

## 4. Uso de IA en el ciclo de testing
| Uso | Qué hace | Qué NO hace | Supervisión humana |
| :--- | :--- | :--- | :--- |

## 5. Gestión de datos de prueba
| Aspecto | Definición | Fuente |
| :--- | :--- | :--- |

## 6. Gestión de entornos
| Entorno | Propósito | Estado | Fuente |
| :--- | :--- | :--- | :--- |

## 7. Criterios de priorización
| Criterio | Definición | Fuente de la criticidad |
| :--- | :--- | :--- |

## 8. Métricas y reportes
| Métrica | Fuente de datos | Frecuencia | Objetivo | Estado |
| :--- | :--- | :--- | :--- | :--- |

## 9. Limitaciones y supuestos
- [SUPUESTO: ...]
- [PENDIENTE DE VALIDAR: ...]
```

## Criterios de "listo" (definition of done)

- [ ] El archivo `./docs/07-estrategia-de-pruebas.md` existe con encabezado completo.
- [ ] Están las 9 secciones obligatorias, numeradas y con título.
- [ ] Cada decisión de nivel, automatización e IA tiene justificación con base en el plan o la matriz.
- [ ] La sección de IA delimita explícitamente qué no se delega a IA.
- [ ] Los datos de prueba tienen origen, generación, aislamiento y limpieza definidos.
- [ ] Los entornos no inventados están marcados como `[SUPUESTO]` o `[PENDIENTE DE VALIDAR]`.
- [ ] Los criterios de priorización citan la fuente de la criticidad.
- [ ] Las métricas tienen fuente de datos y frecuencia; los objetivos sin dato están marcados.
- [ ] Todos los supuestos están marcados como `[SUPUESTO]`.
