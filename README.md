# Invitación web — primera vuelta al sol de Eloísa

Sitio estático de una sola página para **GitHub Pages**. Incluye la tarjeta final ya diseñada, adaptaciones responsive, animaciones respetuosas de preferencias de accesibilidad, ampliación de tarjeta, cuenta regresiva, ubicación en Maps, archivo de calendario y sección RSVP para **Google Forms**.

## Antes de publicar: privacidad

> **MUY IMPORTANTE**: GitHub Pages es público. Esta tarjeta contiene fotos/ilustraciones familiares, el nombre de una menor y una dirección residencial. La opción `noindex` y `robots.txt` reducen la indexación voluntaria por buscadores, pero **no restringen el acceso**. Cualquier persona con el enlace puede verla. El repositorio público también mostrará los archivos. Publica únicamente si quienes aparecen y quienes organizan la celebración están de acuerdo.

No se guardan nombres de asistentes en GitHub ni en el código. El Google Form y las respuestas deben tener acceso restringido a los organizadores.

## 1) Activar Google Forms (sin SQL y sin backend)

**Estado actual:** la integración con Google Forms está programada, pero no se registrarán asistentes hasta que el organizador cree y publique un formulario real y pegue su enlace. No inventar enlaces ni simular confirmaciones.

1. Entra a [Google Forms](https://forms.google.com/) desde la cuenta que administrará la celebración y crea un formulario **Confirmación de asistencia — primer cumpleaños de Eloísa**.
2. Usa esta descripción: "¡Gracias por celebrar la primera vuelta al sol de Eloísa! Sábado 17 de octubre de 2026, de 12:00 a 16:00, Santa Corina 518, Estación Central. Por favor, confirma si nos acompañarás."
3. Crea estas cinco preguntas (en este orden):
   - **Nombre de la familia o invitado** — respuesta corta, obligatoria.
   - **¿Nos acompañarán?** — opción múltiple "Sí, asistiremos" / "No podremos asistir", obligatoria.
   - **Cantidad de adultos** — desplegable con opciones 0, 1, 2, …, 10, obligatoria (0 si no asisten).
   - **Cantidad de niños/as** — desplegable con opciones 0, 1, 2, …, 10, obligatoria (0 si no asisten).
   - **Mensaje para Eloísa** — párrafo, opcional.
4. Configura el mensaje de confirmación: "¡Gracias por responder! ♡ Nos hace muy felices compartir este momento tan especial."
5. Permite respuestas sin iniciar sesión: no habilites recopilación obligatoria de correo ni la opción "Limitar a 1 respuesta" (la interfaz de Google Forms puede cambiar). Verifica desde una ventana privada antes de compartir.
6. En la pestaña **Respuestas** de Forms, vincula una hoja de cálculo **Google Sheets** (hoja privada, no la publiques).
7. **Publica el formulario**, habilita la aceptación de respuestas y copia el enlace **para responder** (termina en `/viewform`). No utilices la URL de edición `/edit`.
8. Edita `js/config.js` y pega ese único enlace en `GOOGLE_FORM_PUBLIC_URL`. Ejemplo:

```js
window.ELOISA_CONFIG = Object.freeze({
  GOOGLE_FORM_PUBLIC_URL: 'https://docs.google.com/forms/d/e/ID_DE_TU_FORMULARIO/viewform',
  GOOGLE_FORM_EMBED_URL: ''
});
```

> El ID es un ejemplo: **no funcionará hasta poner un enlace real**. El sitio genera automáticamente la variante `?embedded=true` y muestra el formulario integrado en la sección de confirmaciones. Se puede usar un enlace completo con parámetros adicionales.

**Enlaces cortos:** si compartes solo una URL `https://forms.gle/…`, el sitio ofrecerá un botón para abrir el formulario en otra pestaña, porque Google no permite integrar directamente ese acortador como iframe. Para una integración dentro de la invitación, comparte el enlace completo de Google Forms.

**Privacidad:** el formulario, la hoja de respuestas y las respuestas deben ser administrados por la familia. No compartas el enlace de edición ni publiques la hoja de cálculo. GitHub Pages aloja exclusivamente archivos públicos y no almacena confirmaciones.

**Cómo comprobarlo:** despliega el sitio, ábrelo en una ventana privada o celular, completa una respuesta de prueba y verifica su llegada en Google Forms → Respuestas y en Google Sheets. El frontend no puede verificar directamente si Google recibió una respuesta dentro del iframe.

## 2) Crear repositorio nuevo en GitHub

1. Ve a https://github.com/new , autentícate como `mastfex` y crea un repositorio público llamado **`invitacion-eloisa`**.
2. Extrae el archivo ZIP y sube el **contenido de la carpeta** `invitacion-eloisa/` a la raíz del repositorio con "Add file" > "Upload files" (o utiliza Git local). El archivo `index.html` debe quedar en la raíz, NO dentro de otra carpeta.
3. En el repositorio abre **Settings > Pages**. En **Build and deployment** selecciona **Deploy from a branch**, rama `main`, carpeta `/(root)` y guarda.
4. Tras la publicación, el sitio normalmente queda en `https://mastfex.github.io/invitacion-eloisa/`.
5. Si cambias el nombre del repositorio o usas un dominio diferente, actualiza también `og:image` en `index.html` para la vista previa de WhatsApp.

**Consejo:** sube primero el sitio de prueba y revisa desde tu celular si deseas mostrar públicamente la información. Solo entonces comparte la dirección.

## Estructura

```
index.html                    # Página de invitación
css/styles.css                # Diseño responsive y animaciones
js/config.js                  # Configuración de Google Forms
js/app.js                     # Cuenta regresiva, modal y montaje del formulario
assets/tarjeta-eloisa.webp    # Imagen original de la invitación
assets/compartir-eloisa.jpg   # Imagen para previsualización en redes
assets/eloisa-cumpleanos.ics  # Archivo de calendario
assets/favicon.svg            # Ícono del sitio
robots.txt                    # Solicita no indexar; NO otorga privacidad
.nojekyll                     # Publicación estática directa
```

## Limitaciones

- Google Forms permite administrar respuestas y exportarlas a Sheets; **este proyecto no incluye panel de administración propio**.
- Los enlaces estáticos de GitHub Pages son **públicos**. `robots.txt` y `noindex` no sustituyen autenticación.
- La imagen de la invitación es una ilustración existente; no se cambia al convertirla en web.
- El sitio no almacena respuestas localmente; deshabilitar o cambiar Google Forms requiere modificar `js/config.js`.
- La cuenta regresiva usa el horario de Chile continental UTC-3 para el 17 de octubre de 2026.
- Con Google Forms no es posible garantizar visualmente el mismo estilo dentro del iframe, porque su contenido se sirve desde Google.
