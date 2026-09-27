---
name: TSK-10-healthcheck-entorno
description: Comprueba que el entorno de pruebas está operativo antes de ejecutar la suite: URL base accesible, login válido, servicios dependientes disponibles, versiones de navegador y runtime, y configuración de Playwright. Úsala antes de cada corrida para separar fallos de entorno de fallos de producto.
artifact: skill-tsk-10-healthcheck-entorno
version: 1.0.0
generated_by: TSK-00 (bootstrap-qa-task-skills)
date: 2026-09-27
sources:
  - ai/system-prompts/03-run-repetitive-tasks-skill.prompt.md
---

# TSK-10: HEALTHCHECK DE ENTORNO

## Propósito

Verificar, antes de lanzar la suite, que todo lo que la suite necesita para ejecutarse está disponible y es coherente con la configuración: la aplicación responde, las credenciales funcionan, los servicios externos están levantados y las versiones de runtime y navegador son las esperadas. Su valor principal es evitar perder tiempo de análisis en fallos que no son del producto y registrar el estado del entorno con evidencia para poder comparar entre corridas.

## Cuándo usarla (disparadores)

- Inicio de la jornada, antes de ejecutar la suite completa.
- Antes de un pipeline de CI, como paso previo.
- Después de un despliegue o un cambio de configuración de entorno.
- Cuando la suite falla de forma masiva y hay que descartar un problema de entorno.
- Antes de una regresión programada, para no correr contra un entorno caído.
- Cada vez que `TSK-05` clasifique varios fallos como "fallo de ambiente".

## Entradas (inputs)

| Entrada | Requerida | Notas |
| :--- | :--- | :--- |
| `./playwright.config.ts` | Sí | Fuente de `baseURL`, `timeout`, `retries`, `projects`, `reporter` |
| `.env` o `.env.example` | No | Variables de entorno requeridas; nunca copies valores secretos al informe |
| URL base del entorno | No | Parámetro `BASE_URL`; si se omite, se toma de `playwright.config.ts` |
| Credenciales de prueba | No | Parámetro `TEST_USER` / `TEST_PASSWORD`; se valida el resultado, no el valor |
| Servicios externos requeridos | No | Parámetro `SERVICES` (endpoints, SMTP, pasarela de pago, etc.) |

## Salidas (outputs)

| Artefacto | Contenido |
| :--- | :--- |
| `./docs/tasks/TSK-10-healthcheck-entorno.md` | Checklist con estado por verificación, evidencias y veredicto APTO / NO APTO |
| `./evidence/tasks/TSK-10/` | Referencias a las capturas o logs de la verificación (rutas, no copias) |

## Dependencias

- Ninguna interna. Es la primera skill del pipeline `pre-ejecución`.
- Alimenta a: `TSK-05` (distinguir fallo de entorno), `TSK-11` (datos), `TSK-12` (triage de CI).

## Proceso paso a paso

1. **Recopilar la configuración esperada.** Lee `playwright.config.ts` y extrae: `baseURL`, `timeout` por test, `retries`, `workers`, `projects` (navegadores), `reporter` y `webServer`, si existe. Cada valor con `[FUENTE: playwright.config.ts:Ln]`. Esta es la línea base contra la que se compara.
2. **Verificar la disponibilidad de la aplicación.** Comprueba que la URL base responde. Registra el código HTTP obtenido, el tiempo de respuesta y la URL efectiva. No asumas 200: un 301 o 302 a un login también es "disponible", y eso se anota.
3. **Verificar la autenticación.** Valida que las credenciales de prueba permiten autenticarse y llegar a una página autenticada. Registra **solo** el resultado y el usuario enmascarado (`adm***@example.com`); **nunca** la contraseña ni el token.
4. **Verificar los servicios dependientes.** Para cada `SERVICE` declarado: disponibilidad, código de respuesta y tiempo. Si la lista no la aporta el usuario, infiérela de los `baseURL` de la configuración y de las variables de entorno usadas, y márcala `[PENDIENTE DE VALIDAR]`.
5. **Verificar el runtime.** Registra la versión de Node, del gestor de paquetes y del navegador de Playwright, junto con las esperadas por la configuración o por `package.json`. Una diferencia de versión se reporta, no se corrige.
6. **Verificar la coherencia de la configuración.** Señala inconsistencias que invaliden la corrida: `retries > 0` en un entorno donde se busca señal limpia, `workers` alto para un entorno compartido, `timeout` por debajo de la duración media observada, proyectos duplicados, `baseURL` apuntando a `localhost` en CI.
7. **Emitir el veredicto:**
   - **APTO** — todas las verificaciones obligatorias en OK; se puede ejecutar la suite.
   - **APTO CON RESERVAS** — todo lo crítico en OK, pero hay verificaciones no críticas degradadas o incoherencias de configuración; se documentan.
   - **NO APTO** — alguna verificación crítica falla; **no se debe ejecutar la suite** hasta resolverlo.
8. **Registrar la evidencia** de cada verificación: la ruta del log o captura, y la línea cuando el origen es un archivo de texto.

### Verificaciones y criticidad

| # | Verificación | Crítica | Método |
| :--- | :--- | :--- | :--- |
| 1 | URL base responde | Sí | Lectura del código HTTP y tiempo de respuesta |
| 2 | Autenticación funciona | Sí | Intento de login con usuario de prueba |
| 3 | Página autenticada accesible | Sí | Comprobación de un elemento de la zona privada |
| 4 | Servicios externos disponibles | Sí, si están declarados | Comprobación de endpoint por servicio |
| 5 | Versión de Node esperada | No | Comparación con la declarada |
| 6 | Navegadores instalados | Sí, si el proyecto los requiere | Inventario de navegadores de Playwright |
| 7 | Variables de entorno definidas | Sí | Comprobación de presencia, nunca de valor |
| 8 | Almacenamiento con espacio suficiente | No | Estado del volumen de reportes y evidencias |
| 9 | Sin ejecución concurrente conflictiva | Sí | Estado de otros procesos o pipelines activos |
| 10 | Coherencia de `playwright.config.ts` | No | Revisión de la configuración contra el escenario |

## Reglas específicas

1. **Cero secretos en la salida.** Contraseñas, tokens, cookies y claves no aparecen en el informe, ni enmascarados parcialmente si basta con un `****`. Las variables se reportan por nombre y presencia: `TEST_PASSWORD: definida`.
2. **La configuración es la línea base.** Todo "esperado" procede de `playwright.config.ts`, `package.json` o del usuario. Si no hay fuente, el valor esperado es `[PENDIENTE DE VALIDAR]` y la verificación queda en `REVISAR`, no en `OK`.
3. **No corrijas el entorno.** Esta skill informa. Si detecta `baseURL` mal apuntando, lo reporta; no lo modifica.
4. **No ejecutes la suite.** La verificación se limita a comprobar disponibilidad y autenticación. Correr tests es un paso posterior explícito.
5. **Estados discretos.** Cada verificación queda en `OK`, `FALLO`, `DEGRADADO` o `REVISAR`. No hay estados intermedios ni "más o menos".
6. **Veredicto trazable.** `APTO` exige que **todas** las verificaciones críticas estén en `OK`. Con una crítica en `DEGRADADO`, el veredicto es `APTO CON RESERVAS`; con una crítica en `FALLO`, es `NO APTO`.
7. **Trazabilidad.** Cada línea de la checklist tiene `[FUENTE: ...]` o `[PENDIENTE DE VALIDAR]`.
8. **Comparabilidad.** La sección de estado del entorno debe permitir comparar entre corridas: misma tabla, mismos campos.
9. **Aislamiento.** Escribe únicamente en `docs/tasks/TSK-10-healthcheck-entorno.md` y las referencias en `evidence/tasks/TSK-10/`.
10. **Markdown puro.** Sin JSON ni YAML.
11. **Idioma:** español, salvo rutas, identificadores y términos técnicos.

## Plantilla de salida en Markdown

```markdown
---
artifact: tsk-10-healthcheck-entorno
version: 0.1.0
generated_by: TSK-10
date: YYYY-MM-DD
sources: [playwright.config.ts, package.json, .env.example]
---

# TSK-10 — Healthcheck de entorno

## Línea base de configuración
| Parámetro | Valor esperado | Fuente |
| :--- | :--- | :--- |
| baseURL | http://… | [FUENTE: playwright.config.ts:L8] |
| timeout por test | 30 000 ms | [FUENTE: playwright.config.ts:L15] |
| retries | 0 | [FUENTE: playwright.config.ts:L16] |
| Navegadores | chromium, firefox | [FUENTE: playwright.config.ts:L22] |
| Versión de Node | … | [PENDIENTE DE VALIDAR] |

## Checklist
| # | Verificación | Crítica | Estado | Valor observado | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | URL base responde | Sí | OK | HTTP 200 en 412 ms | [FUENTE: evidence/tasks/TSK-10/url-check.log:L1] |
| 2 | Autenticación funciona | Sí | OK | Login correcto (adm***@example.com) | [FUENTE: evidence/tasks/TSK-10/login-check.log:L3] |
| 5 | Versión de Node | No | DEGRADADO | v20.11.0, esperado v22 | [PENDIENTE DE VALIDAR] |

## Servicios dependientes
| Servicio | Endpoint | Estado | Código | Tiempo | Fuente |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Pasarela de pago | … | FALLO | 503 | 5 000 ms | [FUENTE: evidence/tasks/TSK-10/services.log:L8] |

## Variables de entorno
| Variable | Estado | Comentario |
| :--- | :--- | :--- |
| TEST_PASSWORD | definida | Valor no registrado por política |
| API_TOKEN | FALLO | No definida; requerida por … |

## Incoherencias de configuración detectadas
| Incoherencia | Impacto | Fuente |
| :--- | :--- | :--- |
| `retries: 2` activa | Oculta instabilidad y falsea la tasa de fallo | [FUENTE: playwright.config.ts:L16] |

## Veredicto

> ## NO APTO
> Motivo: el servicio de pasarela de pago no responde (HTTP 503) y es requerido por los tests de checkout.

| Acción requerida | Responsable | Prioridad |
| :--- | :--- | :--- |
| Levantar el servicio de pasarela en el entorno | [PENDIENTE DE VALIDAR] | Alta |

## Bloqueos
- [BLOQUEADO: ...]
```

## Criterios de "listo" (definition of done)

- [ ] `./docs/tasks/TSK-10-healthcheck-entorno.md` existe con encabezado completo.
- [ ] La línea base de configuración lista los valores esperados con `[FUENTE: playwright.config.ts:Ln]` o `[PENDIENTE DE VALIDAR]`.
- [ ] La checklist cubre las diez verificaciones, cada una con estado `OK`, `FALLO`, `DEGRADADO` o `REVISAR`.
- [ ] Cada verificación marcada crítica está en `OK` si el veredicto es `APTO`.
- [ ] Existe un veredicto único (`APTO`, `APTO CON RESERVAS` o `NO APTO`) con su motivo.
- [ ] El veredicto `NO APTO` incluye la lista de acciones requeridas.
- [ ] Ninguna credencial, token o valor secreto aparece en el informe.
- [ ] Cada valor observado tiene su fuente o `[PENDIENTE DE VALIDAR]`.
- [ ] No se ejecutó ningún test de la suite.

## Ejemplos de invocación

| Objetivo | Invocación |
| :--- | :--- |
| Healthcheck completo | `Ejecuta TSK-10 usando ./playwright.config.ts como línea base` |
| Con servicios declarados | `Ejecuta TSK-10 con SERVICES=[pasarela-pago, smtp, api-interna]` |
| Con URL explícita | `Ejecuta TSK-10 con BASE_URL=https://staging.example.com` |
| En pipeline | `Ejecuta el pipeline "pre-ejecución" (TSK-10 → TSK-11)` |
