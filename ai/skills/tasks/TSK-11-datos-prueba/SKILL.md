---
name: TSK-11-datos-prueba
description: Genera conjuntos de datos de prueba realistas, únicos por corrida e idempotentes, y audita dónde hay datos sensibles sin enmascarar en logs, reportes y capturas, proponiendo un patrón de enmascaramiento concreto. Úsala antes de una corrida que necesite datos aislados o cuando haya exposición de PII en la evidencia.
artifact: skill-tsk-11-datos-prueba
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-11: GENERACIÓN Y ENMASCARAMIENTO DE DATOS

## Propósito

Dos responsabilidades separadas con una misma fuente de verdad. Primero, proponer un plan de datos de prueba que evite colisiones entre corridas y entre testers: identificadores únicos, datos coherentes con las reglas de negocio y limpieza garantizada. Segundo, auditar los puntos donde la suite emite datos sensibles y definir cómo enmascararlos en logs, reportes y capturas, sin romper la utilidad de la evidencia para el diagnóstico.

## Cuándo usarla (disparadores)

- Antes de una corrida que comparta datos con otra (carrito, cupón, stock, cuenta de cliente).
- Un test falla de forma intermitente por datos (ver `TSK-06`, patrón "Colisión de datos").
- Hay que preparar datos para una nueva historia o un nuevo módulo.
- Se sospecha exposición de PII o credenciales en `evidence/` o en `reports/`.
- Antes de compartir evidencia con terceros o con el equipo de desarrollo.
- Después de un incidente de exposición: hay que revisar qué evidencia quedó publicada.

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| Reglas de negocio que condicionan los datos | Sí | `./docs/04-reglas-de-negocio.md` (formatos, longitudes, obligatoriedad) |
| Casos de prueba que consumen los datos | No | `./docs/tasks/TSK-02-casos-de-prueba.md` |
| Código de la suite: fixtures y generadores | No | `./fixtures/**/*.ts`, `./tests/**/*.spec.ts` |
| Archivos a auditar por PII | No | `./evidence/`, `./reports/`, `./utils/logger.ts` |
| Pantalla de login y datos de cuenta | No | `./pages/LoginPage.ts` |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-11-datos-prueba.md` | Plan de datos por escenario (patrón, unicidad, limpieza) + auditoría de exposición con puntos enmascarados |
| `./data/generated/` | Solo si el usuario lo pide explícitamente; por defecto **no se escriben datos reales** |

## Dependencias

- **SKILL 04** — las reglas de negocio definen qué datos son válidos.
- **TSK-10** — el entorno debe estar operativo antes de generar y sembrar datos.
- Alimenta a: `TSK-06` (colisiones de datos), `TSK-05` (clasificación "problema de datos"), `TSK-07` (enmascarado de la evidencia del bug).

## Proceso paso a paso

1. **Inventariar los datos que la suite consume.** Recorre los fixtures y los specs, y lista por escenario qué entidades se crean: cliente, usuario, producto, carrito, cupón, pedido, dirección, método de pago. Para cada una, anota qué campos se rellenan y con qué valores.
2. **Contrastar con las reglas de negocio.** Para cada campo, verifica el formato y los límites contra `RN-XXX`. Un valor que viola una regla produce un fallo de datos, no un defecto de producto. Cita la regla: `[FUENTE: docs/04-reglas-de-negocio.md#RN-007]`.
3. **Diseñar el patrón de unicidad.** Define el prefijo o sufijo que hace único cada registro por corrida, con base en `RUN_ID` y, si aplica, en el usuario que ejecuta. La regla debe ser legible y reproducible: un identificador como `qa-<RUN_ID>-<contador>` basta. Si el código actual ya tiene un patrón, se documenta y se reutiliza en lugar de inventar otro.
4. **Definir la estrategia de limpieza.** Por cada entidad creada: quién la borra, cuándo (antes de la corrida, al final) y cómo. Sin estrategia de limpieza declarada, la entidad se marca `[PENDIENTE DE VALIDAR]` y se advierte que contaminará corridas futuras.
5. **Detectar colisiones previsibles.** Cruza las entidades con los casos de `TSK-02` que las usan: si dos casos usan el mismo cupón o el mismo cliente, es una colisión. Tabla obligatoria.
6. **Auditar la exposición de datos sensibles.** Revisa `utils/logger.ts`, los mensajes de error, los `console.log` y los reportes, y localiza: contraseñas, tokens, cookies de sesión, correos reales, datos de pago, documentos de identidad, direcciones. Para cada uno: ubicación exacta, tipo de dato y si se emite en claro.
7. **Definir el patrón de enmascaramiento.** Una tabla de reglas con el patrón de sustitución por tipo de dato. Enmascarar nunca debe inutilizar la evidencia: conserva suficiente contexto para que el diagnóstico siga siendo posible, y anota qué se pierde al enmascarar.
8. **Proponer las ubicaciones del enmascaramiento** en el código (logger, `beforeEach`, screenshot helper), con la alternativa de implementación cuando el caso lo requiera.
9. **Emitir el informe** con la plantilla de salida. No escribas datos reales en el repositorio por defecto: el plan describe qué generar, no genera.

### Patrones de enmascaramiento

| Tipo de dato | Ejemplo original | Patrón de sustitución | Se conserva |
| :--- | :--- | :--- | :--- |
| Contraseña | `P@ssw0rd!` | `pass****` | Nada |
| Token / bearer | `eyJhbGci…` | `token:****` (solo longitud) | Longitud del token |
| Correo | `juan.perez@correo.com` | `j***@correo.com` | Dominio, inicial y longitud |
| Teléfono | `+34 600 123 456` | `+34 *** *** 456` | Últimos 3 dígitos |
| Tarjeta / IBAN | `4111 1111 1111 1111` | `**** **** **** 1111` | Últimos 4 dígitos |
| DNI / documento | `12345678Z` | `*******Z` | Letra del documento |
| Dirección | `Calle Mayor 1, Madrid` | `Calle ***, Madrid` | Localidad, necesaria para el diagnóstico |
| Cookie de sesión | `PHPSESSID=abc…` | `PHPSESSID=****` | Nombre de la cookie |

## Reglas específicas

1. **Nunca inventes reglas de formato.** Cada restricción de los datos cita su `RN-XXX` o el código que la impone. Sin fuente: `[PENDIENTE DE VALIDAR]`.
2. **Unicidad obligatoria.** Todo dato compartido entre casos lleva un sufijo único. Un plan sin unicidad no es un plan: es la causa conocida de flakiness por colisión.
3. **Cero datos reales por defecto.** No escribas credenciales, correos reales ni datos de personas en archivos del repositorio. El artefacto describe el patrón, no lo materializa, salvo petición explícita del usuario.
4. **Enmascarar ≠ eliminar.** El enmascaramiento debe preservar la capacidad de diagnóstico. Si una regla elimina el dato crítico para el análisis, se marca como `NO ENMASCARABLE` y se documenta el riesgo.
5. **Auditoría antes de publicación.** Cualquier evidencia que vaya a salir del equipo pasa por la sección de exposición. Un hallazgo de exposición de credencial es de severidad **Bloqueante** y requiere rotación.
6. **Severidades de la auditoría:**

   | Severidad | Criterio |
   | :--- | :--- |
   | **Bloqueante** | Credencial o token real emitido en claro. Requiere rotación inmediata. |
   | **Alta** | PII personal (correo, teléfono, documento, dirección) emitida sin enmascarar. |
   | **Media** | Datos de negocio sensibles (importes, stock, cupones) expuestos en reportes públicos. |
   | **Baja** | Riesgo teórico o enmascarado incompleto pero no identificable. |

7. **No modifiques la suite.** Esta skill propone; aplicar los cambios en `logger.ts` o en los fixtures es un paso posterior explícito del usuario.
8. **Trazabilidad.** Cada dato del plan cita la regla o el archivo que lo origina; cada hallazgo de exposición cita ruta y línea.
9. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-11-datos-prueba.md`.
10. **Markdown puro.** Sin JSON ni YAML.
11. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-11-datos-prueba
version: 0.1.0
generated_by: TSK-11
date: YYYY-MM-DD
sources: [docs/04-reglas-de-negocio.md, fixtures/base.fixture.ts, utils/logger.ts, evidence/screenshots/checkout-total.png]
---

# TSK-11 — Datos de prueba y enmascaramiento

## Datos consumidos por la suite
| Entidad | Campo | Valor actual | Regla aplicable | Válido | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Cliente | email | `qa@example.com` | Formato y unicidad | Sí | [FUENTE: fixtures/base.fixture.ts:L14] |
| Cupón | código | `SUMMER10` | Alfanumérico, 8-12 caracteres | No (7 caracteres) | [FUENTE: docs/04-reglas-de-negocio.md#RN-011] |

## Plan de datos
| Escenario | Entidad | Patrón de unicidad | Ejemplo de valor | Limpieza | Fuente de la restricción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Checkout con cupón | Cupón | `qa-<RUN_ID>-<n>` | `qa-r7f2-01` | Borrar al final de la corrida | [FUENTE: docs/04-reglas-de-negocio.md#RN-011] |
| Login válido | Cliente | `qa.<RUN_ID>@example.com` | `qa.r7f2@example.com` | No requiere limpieza | [FUENTE: fixtures/base.fixture.ts:L14] |

## Colisiones previsibles
| Dato compartido | Casos consumidores | Riesgo | Mitigación |
| :--- | :--- | :--- | :--- |
| Cupón `SUMMER10` | TC-018, TC-021 | Un caso consume el cupón y el segundo falla | Sufijo único por `RUN_ID` |

## Patrones de enmascaramiento
| Tipo de dato | Sustitución | Se conserva | Dónde se aplica |
| :--- | :--- | :--- | :--- |

## Auditoría de exposición
| ID | Ubicación | Tipo de dato | Se emite en claro | Severidad | Acción | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| EXP-001 | `tests/e2e/login.spec.ts:L12` | Contraseña | Sí | Bloqueante | Mover a variable de entorno y rotar la credencial | [FUENTE: tests/e2e/login.spec.ts:L12] |
| EXP-002 | `utils/logger.ts:L22` | Token de sesión | Sí | Bloqueante | Enmascarar con `token:****` conservando longitud | [FUENTE: utils/logger.ts:L22] |

## Puntos de aplicación propuestos
| Prioridad | Ubicación | Cambio propuesto | Sin cambio se pierde |
| :--- | :--- | :--- | :--- |
| 1 | `utils/logger.ts:L22` | Función `mask()` antes del formateo del mensaje | El token deja de ser trazable en el log |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-11-datos-prueba.md` existe con encabezado completo.
- [ ] La tabla de datos consumidos cubre todas las entidades que crean los fixtures y los specs revisados.
- [ ] Cada campo con restricción tiene su `RN-XXX` o el archivo que la impone, con `[FUENTE: ...]`.
- [ ] El plan de datos asigna un patrón de unicidad a cada dato compartido entre casos.
- [ ] Cada entidad tiene una estrategia de limpieza declarada o marcada `[PENDIENTE DE VALIDAR]`.
- [ ] Existe la tabla de colisiones previsibles con los casos consumidores.
- [ ] Existe la tabla de patrones de enmascaramiento con qué información se conserva.
- [ ] La auditoría de exposición cubre logger, reports y evidence, con ruta y línea en cada hallazgo.
- [ ] Los hallazgos de credencial o token en claro son de severidad Bloqueante e indican rotación.
- [ ] No se escribió ningún dato real ni secreto en el repositorio.
- [ ] Ningún archivo de la suite fue modificado.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Plan de datos completo | `Ejecuta TSK-11 usando docs/04-reglas-de-negocio.md y los fixtures del proyecto` |
| Solo auditoría de exposición | `Ejecuta TSK-11 en modo auditoría sobre ./evidence, ./reports y ./utils/logger.ts` |
| Datos para un escenario concreto | `Ejecuta TSK-11 limitado al escenario de checkout con cupón` |
| En pipeline | `Ejecuta el pipeline "pre-ejecución" (TSK-10 → TSK-11)` |
