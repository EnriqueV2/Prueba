# Tierra Viva

Página divulgativa en español sobre el calentamiento global: sus causas, sus efectos y las acciones individuales y colectivas que pueden contribuir a reducirlo. Incluye un globo animado, pestañas sobre los impactos y un plan personal de acciones que se puede descargar.

Es un sitio estático construido con Vite, JavaScript, CSS y Three.js. No requiere backend, cuentas de usuario, variables de entorno ni secretos. El despliegue está preparado para GitHub Pages.

## Desarrollo

Requiere **Node.js 22.12 o superior** y npm. Desde el directorio del proyecto:

```sh
npm ci
npm run dev
```

`npm ci` instala las versiones del archivo de bloqueo. `npm run dev` inicia el servidor de desarrollo de Vite.

Para comprobar la compilación de producción y visualizarla:

```sh
npm run build
npm run preview
```

La compilación genera los archivos estáticos en `dist/`. El comando `preview` sirve esa compilación para revisarla; no publica el sitio.

## Publicación en GitHub Pages

El flujo [pages.yml](.github/workflows/pages.yml) compila y publica la web al actualizar `main`, y también permite su ejecución manual en GitHub Actions. Usa la ruta del repositorio para que las imágenes, la fuente y el globo se carguen correctamente.

Antes del primer despliegue, activa **Settings → Pages → Build and deployment → Source → GitHub Actions** en el repositorio. Si la primera ejecución terminó antes de activar Pages, vuelve a ejecutarla desde la pestaña Actions.

Para reproducir la compilación que se publica:

```sh
npm ci
npm run build -- --base=/Prueba/
```

La dirección prevista es `https://enriquev2.github.io/Prueba/`. El sitio solo está publicado cuando el trabajo `deploy` termina correctamente y esa dirección devuelve la página.

## Plan de acciones y almacenamiento

La selección del plan de acciones se guarda en `localStorage`, bajo la clave `tierra-viva-actions-v1`, y permanece disponible al volver al sitio desde el mismo navegador y origen. No se envía a un servidor ni se sincroniza entre dispositivos. Borrar el almacenamiento del sitio restablece la selección.

## Fuentes científicas

Los contenidos se apoyan en las siguientes fuentes oficiales:

- [IPCC: informe de síntesis del Sexto Informe de Evaluación, resumen para responsables de políticas (2023)](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/).
- [NASA: causas del cambio climático](https://science.nasa.gov/climate-change/causes/).
- [NASA: efectos del cambio climático](https://science.nasa.gov/climate-change/effects/).
- [ONU: acciones por el clima](https://www.un.org/es/actnow/ten-actions).

Las cifras históricas deben leerse con sus períodos de referencia:

- **1,1 °C** de calentamiento medio global en **2011–2020** respecto a **1850–1900**, según el IPCC (2023, apartado A.1).
- **20 cm** de aumento del nivel medio global del mar entre **1901 y 2018**, según el IPCC (2023, apartado A.2.1).
- **3.300–3.600 millones de personas** en contextos muy vulnerables al cambio climático, según la evaluación del IPCC de **2023** (apartado A.2.2). Es una estimación recogida en esa evaluación, no un censo realizado en 2023.

Estos valores no son mediciones en tiempo real. Un año individual por encima de 1,5 °C no equivale por sí solo a superar el objetivo de temperatura del Acuerdo de París, referido al calentamiento sostenido a largo plazo. Los riesgos aumentan con cada incremento adicional de temperatura.

## Créditos de recursos visuales

- **Textura terrestre:** `earth_atmos_2048.jpg`, procedente de los [ejemplos de Three.js](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets). [Archivo original](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg). Este crédito identifica su procedencia; no atribuye una licencia específica a la imagen.
- **Tipografía:** Manrope, distribuida bajo la SIL Open Font License. El texto de la licencia se incluye en [public/fonts/OFL-Manrope.txt](public/fonts/OFL-Manrope.txt).

Los créditos de los recursos visuales son independientes de las fuentes científicas del contenido.
