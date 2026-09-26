# qa-ai-prestashop-portfolio

Sistema de testing asistido por IA para una tienda **PrestaShop**, con **Playwright**, **TypeScript**, con integración de **IA** (OpenCode con modelos libres). Incluye extracción de requisitos desde código, inventario de historias de usuario, plan y estrategia de pruebas, todo en Markdown y totalmente trazable. Además, generación de tests, datos de prueba para su ejecución y análisis de fallos.

---

## 📖 Tabla de contenidos

- [Descripción](#-descripción)
- [Motivación](#-motivación)
- [Arquitectura](#-arquitectura)
- [Sistema de skills de IA](#-sistema-de-skills-de-ia)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Documentación y evidencias](#-documentación-y-evidencias)
- [Roadmap](#-roadmap)
- [Aprendizajes](#-aprendizajes)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎯 Descripción

Este proyecto demuestra un **flujo completo de QA asistido por IA** aplicado a una tienda PrestaShop local. No es solo una suite de tests: es un sistema que:

1. **Extrae requisitos desde el código fuente** de la aplicación, sin inventar funcionalidades.
2. **Genera un inventario funcional de historias de usuario** con condiciones verificables, criterios de aceptación y reglas de negocio comprobables.
3. **Deriva escenarios de prueba** positivos, negativos y de valores límite.
4. **Construye una matriz de trazabilidad** que vincula requisitos ↔ historias ↔ escenarios ↔ casos ↔ reglas.
5. **Elabora el plan y la estrategia de pruebas** documentando qué se prueba y por qué.
6. **Automatiza la ejecución** con Playwright y TypeScript.
7. **Integra IA** en generación de tests, datos y análisis de fallos.

Todo el sistema está gobernado por una **skill orquestadora** que valida cada fase antes de avanzar.

---

## 💡 Motivación

La mayoría de los portafolios de QA muestran tests aislados. Este proyecto busca demostrar el **ciclo de vida completo del testing**, con especial énfasis en:

- **Trazabilidad radical:** cada afirmación tiene una fuente verificable.
- **Cero invención:** la IA no descubre funcionalidades; las extrae del código o de requisitos explícitos.
- **IA como herramienta, no como atajo:** los prompts están versionados y documentados.
- **Evidencias concretas:** capturas, reportes y artefactos en cada fase.

---

## 🏗️ Arquitectura

```mermaid
graph TD
    A[Código PrestaShop] -->|SKILL 1| B[Inventario de fuentes]
    B -->|SKILL 2| C[Historias de usuario]
    C -->|SKILL 3| D[Escenarios y casos]
    C -->|SKILL 4| E[Reglas de negocio]
    D -->|SKILL 5| F[Matriz de trazabilidad]
    E -->|SKILL 5| F
    F -->|SKILL 6| G[Plan de pruebas]
    G -->|SKILL 7| H[Estrategia de pruebas]
    H -->|Automatización| I[Playwright + TypeScript]
    I -->|Ejecución| J[Reportes y evidencias]
    J -->|Análisis con IA| K[Informe de causa raíz]
    K -.->|Feedback| C
El flujo es secuencial y validado: si una skill no cumple su definition of done, el orquestador detiene la ejecución y reporta el bloqueo.

🤖 Sistema de skills de IA
El proyecto define 8 skills especializadas en ai/skills/, controladas por una skill orquestadora:

Skill	Nombre	Propósito	Salida
SKILL 0	Orchestrator	Coordina el flujo completo y valida cada fase	docs/00-progress-log.md
SKILL 1	Code Extractor	Extrae fuentes funcionales del código y requisitos	docs/01-inventario-fuentes.md
SKILL 2	User Story Inventory	Convierte fuentes en historias verificables	docs/02-inventario-historias-usuario.md
SKILL 3	Test Scenarios	Deriva escenarios positivos, negativos y de límite	docs/03-escenarios-y-casos.md
SKILL 4	Business Rules	Consolida reglas de negocio comprobables	docs/04-reglas-de-negocio.md
SKILL 5	Traceability Matrix	Vincula requisitos ↔ historias ↔ casos ↔ reglas	docs/05-matriz-trazabilidad.md
SKILL 6	Test Plan	Documenta qué se prueba y por qué	docs/06-plan-de-pruebas.md
SKILL 7	Test Strategy	Define el cómo y el por qué del enfoque	docs/07-estrategia-de-pruebas.md
Los prompts que gobiernan estas skills están versionados en ai/system-prompts/:

00-bootstrap-skills.prompt.md — genera el sistema completo de skills.

01-run-orchestrator.prompt.md — ejecuta el flujo completo.

02-run-single-skill.prompt.md — ejecuta una skill individual (útil para re-ejecutar fases).

Principios inviolables del sistema:

Formato único: Markdown.

Cero invención: sin fuente, no entra al inventario.

Trazabilidad obligatoria: [FUENTE: ...] en cada afirmación.

Sin asumir comportamiento: si el código es ambiguo, se pregunta.

🛠️ Stack tecnológico
Categoría	Herramienta	Versión
Framework de testing	Playwright	^1.48
Lenguaje	TypeScript	^5.6
Runtime	Node.js	>= 20
E-commerce bajo prueba	PrestaShop	8.0
Contenedores	Docker + Docker Compose	Última estable
LLM	OpenCode con OpenKilo / OpenCode Zen	Modelos libres
Cliente LLM	openai (compatible con estándar OpenAI)	^4.x
CI/CD	GitHub Actions	—
Formato de artefactos	Markdown	—

📁 Estructura del proyecto
qa-ai-prestashop-portfolio/
├── .github/workflows/          # CI/CD con GitHub Actions
├── ai/
│   ├── clients/                # Cliente LLM genérico
│   ├── mocks/                  # Mock para ejecutar sin API key
│   ├── prompts/                # Prompts operativos de las skills
│   ├── services/               # Generación, análisis, healing
│   ├── skills/                 # 8 skills especializadas (SKILL.md)
│   └── system-prompts/         # Prompts que gobiernan el sistema
├── config/                     # Configuración de entornos y LLM
├── data/                       # Datos de prueba (estáticos y generados)
├── docs/                       # Artefactos de QA en Markdown
├── evidence/                   # Capturas, videos, reportes
├── fixtures/                   # Fixtures de Playwright
├── pages/                      # Page Object Model
├── tests/                      # Tests E2E, generados por IA y visuales
├── utils/                      # Logger, screenshots, self-healing
├── reports/                    # Reportes de Playwright
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── docker-compose.yml          # PrestaShop + MySQL (fuera del repo)
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md

✅ Requisitos previos
Node.js >= 20 (descargar)

Docker y Docker Compose (descargar)

Git (descargar)

OpenCode instalado (opencode.ai)

Acceso a modelos libres vía OpenKilo o OpenCode Zen

🚀 Instalación
1. Clonar el repositorio
bash
git clone https://github.com/TU_USUARIO/qa-ai-prestashop-portfolio.git
cd qa-ai-prestashop-portfolio

2. Instalar dependencias
bash
npm install
npx playwright install

3. Configurar variables de entorno
bash
cp .env.example .env
# Edita .env con tus credenciales locales

4. Levantar PrestaShop local
En una carpeta separada (fuera del repo), crea un docker-compose.yml:

version: '3.7'
services:
  prestashop:
    image: prestashop/prestashop:8.0
    ports:
      - "8000:80"
    environment:
      - PS_INSTALL_AUTO=1
      - DB_SERVER=db
      - DB_NAME=prestashop
      - DB_USER=prestashop
      - DB_PASSWD=prestashop
    depends_on:
      - db
  db:
    image: mysql:5.7
    environment:
      - MYSQL_DATABASE=mitienda
      - MYSQL_USER=root

Levanta el stack:

bash
docker-compose up -d
Accede a http://localhost:8000 y completa la instalación.

⚙️ Configuración
Variables de entorno clave

Variable	Descripción	Ejemplo
BASE_URL	URL base de PrestaShop	http://localhost:8000
ADMIN_EMAIL	Email del admin del back office	admin@prestashop.local
ADMIN_PASSWORD	Contraseña del admin	prestashop_demo_2026
LLM_PROVIDER	Proveedor del LLM	openai
LLM_MODEL	Modelo a usar	deepseek/deepseek-r1:free
LLM_API_KEY	API key del proveedor	tu_api_key_aqui
HEADLESS	Ejecutar Playwright sin UI	true
SLOW_MO	Ralentizar ejecución (ms)	0
⚠️ Nunca subas .env a Git. Solo .env.example debe versionarse.

Configurar OpenCode
Opción A — OpenKilo (sin API key):

bash
npm install -g openkilo

Edita ~/.config/opencode/opencode.json:

json
{
  "plugin": ["openkilo"]
}
Reinicia OpenCode y selecciona un modelo bajo el proveedor OpenKilo.

Opción B — OpenCode Zen (API key gratuita):

1. Ve a opencode.ai/auth y copia tu API key.

2. En OpenCode, escribe /connect y selecciona OpenCode Zen.

3. Escribe /models y elige un modelo con etiqueta Free.

Uso
Ejecutar tests de Playwright
bash
npm test                    # Ejecutar todos los tests
npm run test:ui             # Modo UI interactivo
npm run test:debug          # Modo debug paso a paso
npm run report              # Ver reporte HTML
npm run codegen             # Generar selectores
Ejecutar el sistema de skills de IA
Desde OpenCode, en la raíz del proyecto:

Pega el contenido de ai/system-prompts/01-run-orchestrator.prompt.md.

Proporciona los parámetros de entrada:

PROJECT_ROOT: ./

START_SKILL: 1

STOP_SKILL: 1

STRICT_MODE: true

Confirma el plan de ejecución.

El orquestador generará los artefactos en docs/ y registrará el progreso en docs/00-progress-log.md.

Re-ejecutar una skill individual
Usa ai/system-prompts/02-run-single-skill.prompt.md y especifica el número de skill.

📚 Documentación y evidencias
Toda la documentación generada vive en docs/ en formato Markdown:

00-progress-log.md — bitácora de ejecución del orquestador.

01-inventario-fuentes.md — fuentes extraídas del código.

02-inventario-historias-usuario.md — historias de usuario verificables.

03-escenarios-y-casos.md — escenarios positivos, negativos y de límite.

04-reglas-de-negocio.md — reglas comprobables.

05-matriz-trazabilidad.md — matriz de cobertura.

06-plan-de-pruebas.md — plan de pruebas.

07-estrategia-de-pruebas.md — estrategia de pruebas.

Las evidencias visuales (capturas, videos, reportes) están en evidence/:

evidence/screenshots/ — capturas de la app y de fallos.

evidence/videos/ — grabaciones de ejecuciones fallidas.

evidence/reports/ — reportes HTML de Playwright.

evidence/ci/ — capturas de ejecuciones en GitHub Actions.

🗺️ Roadmap

☑ Estructura base del proyecto
☑ Sistema de 8 skills + orquestador
☑ Prompts versionados en ai/system-prompts/
□ Ejecutar SKILL 1 contra el código de PrestaShop
□ Completar inventario de historias de usuario
□ Generar matriz de trazabilidad
□ Implementar tests E2E con Playwright
□ Integrar análisis de fallos con IA
□ Configurar GitHub Actions con reporte de IA en PRs
□ Publicar reporte HTML en GitHub Pages
□ Grabar video demo de 3 minutos

🎓 Aprendizajes

- Este proyecto documenta mi proceso de aprendizaje en:

- Trazabilidad en QA: cómo vincular cada test con un requisito verificable.

- IA aplicada al testing: usar LLMs para generar, analizar y enriquecer, sin reemplazar el juicio humano.

- Prompts como código: versionar, documentar y evolucionar prompts igual que el código fuente.

- Automatización con Playwright: Page Object Model, fixtures, self-healing, CI/CD.

- Diseño de sistemas multi-agente: orquestación de skills con validación entre fases.

📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente, siempre que preserves la atribución.

📬 Contacto

Tu Nombre

💼 LinkedIn: linkedin.com/in/tu-perfil

🐙 GitHub: @TU_USUARIO

📧 Email: tu.email@example.com

Si te interesa el testing asistido por IA o quieres discutir sobre QA, automatización o Playwright, ¡escríbeme!