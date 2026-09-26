---
name: 06-test-plan
description: Elabora el plan de pruebas documentando qué se va a probar y por qué, con alcance respaldado por el inventario, criterios de entrada y salida, riesgos derivados de los huecos de la matriz y cronograma relativo. Úsala como fase 6 del pipeline de QA.
artifact: skill-06-test-plan
version: 1.0.0
generated_by: SKILL-00 (bootstrap-skills)
date: 2026-09-26
sources:
  - ai/system-prompts/00-bootstrap-skills.prompt.md
---

# SKILL 6: PLAN DE PRUEBAS

## Propósito

Elaborar el plan de pruebas documentando **QUÉ** se va a probar y **POR QUÉ**, sin inventar alcance.

## Entradas (inputs)

| Entrada | Requerida |
| :--- | :--- |
| `./docs/02-inventario-historias-usuario.md` | Sí |
| `./docs/03-escenarios-y-casos.md` | Sí |
| `./docs/04-reglas-de-negocio.md` | Sí |
| `./docs/05-matriz-trazabilidad.md` | Sí |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/06-plan-de-pruebas.md` | Plan con alcance, objetivos, tipos de prueba, criterios, riesgos, entregables y cronograma relativo |

## Dependencias

- **SKILL 2, 3, 4 y 5.**

## Reglas específicas

1. **Todo lo listado en alcance debe existir** en el inventario de historias. Cada punto del alcance referencia su `US-XXX` y `REQ-XXX`.
2. **Prohibido agregar módulos, features o flujos no respaldados.** Si algo no está en el inventario, no aparece en el plan; si el usuario lo pide, va a "Fuera de alcance (requiere validación)".
3. **Riesgos desde la matriz:** la sección de riesgos se deriva de los huecos de la matriz de trazabilidad, no de suposiciones generales. Cada riesgo referencia el hueco que lo origina.
4. **Exclusión explícita de reglas no comprobables:** el plan indica que las RN marcadas como `No comprobable` en la SKILL 4 quedan fuera del alcance de prueba, citando sus IDs.
5. **Cronograma relativo:** usa unidades relativas (`D+1`, `Semana 1`, "por cada lote de 10 casos"). **Prohibido** inventar fechas, horas o duraciones en días calendario.
6. **Objetivos medibles:** cada objetivo describe un resultado verificable (cobertura, % de casos automatizados, defectos detectados), no una intención vaga.
7. **Criterios de entrada y salida:** los de entrada dependen de artefactos previos completos; los de salida de cobertura mínima alcanzada, con el umbral declarado y su fuente.
8. **Idioma:** español, salvo identificadores, rutas y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: test-plan
version: 0.1.0
generated_by: SKILL-06
date: YYYY-MM-DD
sources: [docs/02, docs/03, docs/04, docs/05]
---

# 06 — Plan de pruebas

## 1. Introducción y propósito
## 2. Alcance
### 2.1 In-scope
| Módulo / funcionalidad | Historia | Requisito | Fuente |
| :--- | :--- | :--- | :--- |
### 2.2 Out-of-scope
| Elemento | Motivo | Fuente |
| :--- | :--- | :--- |
## 3. Objetivos de prueba
| # | Objetivo | Métrica | Umbral | Fuente |
| :--- | :--- | :--- | :--- | :--- |
## 4. Historias cubiertas
| Historia | Casos asociados | Cobertura | Fuente |
| :--- | :--- | :--- | :--- |
## 5. Tipos de prueba
| Tipo | Objetivo | Alcance | Justificación |
| :--- | :--- | :--- | :--- |
## 6. Criterios de entrada y salida
### 6.1 Entrada
### 6.2 Salida
## 7. Riesgos y mitigaciones
| # | Riesgo | Origen (hueco de matriz) | Impacto | Mitigación | Responsable |
| :--- | :--- | :--- | :--- | :--- | :--- |
## 8. Entregables
| Entregable | Formato | Contenido |
| :--- | :--- | :--- |
## 9. Cronograma estimado (relativo)
| Hito | Marca relativa | Depende de | Precondición |
| :--- | :--- | :--- | :--- |
## 10. Supuestos
- [SUPUESTO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] El archivo `./docs/06-plan-de-pruebas.md` existe con encabezado completo.
- [ ] Están las 9 secciones obligatorias, numeradas y con título.
- [ ] Cada punto del alcance in-scope referencia `US-XXX` / `REQ-XXX` y su fuente.
- [ ] El out-of-scope está justificado con motivo y fuente.
- [ ] Los riesgos referencian huecos concretos de la matriz de trazabilidad.
- [ ] Las reglas no comprobables están explícitamente excluidas del alcance, con sus IDs.
- [ ] El cronograma usa marcas relativas; no hay fechas de calendario inventadas.
- [ ] Los objetivos tienen métrica y umbral.
- [ ] Los supuestos están marcados como `[SUPUESTO]`.
