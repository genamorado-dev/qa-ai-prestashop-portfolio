# qa-ai-prestashop-portfolio

Proyecto de portafolio de QA: automatización de pruebas end-to-end para una tienda **PrestaShop** usando **Playwright** con **TypeScript**, con integración de **IA** (OpenCode con modelos libres) para generar tests, datos de prueba y análisis de fallos.

## Tecnologías

- **Playwright** (E2E) + **TypeScript**
- **PrestaShop** como sistema bajo prueba (SUT)
- **Inteligencia Artificial** para generación de tests, healing de locators, análisis de fallos y generación de datos
- **GitHub Actions** para CI/CD
- Documentación de evidencias de QA en cada etapa

## Cómo ejecutar

> Prerequisitos: instalar PrestaShop localmente (ver `docs/01-plan-de-pruebas.md`) y configurar variables de entorno en un archivo `.env` (usar `.env.example` como referencia).

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar navegadores de Playwright
npx playwright install

# 3. Ejecutar todas las pruebas
npm test

# 4. Ejecutar con UI interactiva
npm run test:ui

# 5. Ver reporte HTML
npm run report
```

## Estado del proyecto

- [ ] Base del proyecto creada
- [ ] Configuración de PrestaShop local
- [ ] Tests E2E funcionales
- [ ] Integración de IA (OpenCode)
- [ ] CI/CD con GitHub Actions
- [ ] Documentación y evidencias completas