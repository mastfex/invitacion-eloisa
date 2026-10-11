# Invitación web — primera vuelta al sol de Eloísa

Sitio estático de una sola página para **GitHub Pages**. Incluye la tarjeta final ya diseñada, adaptaciones responsive, animaciones respetuosas de preferencias de accesibilidad, ampliación de tarjeta, cuenta regresiva, ubicación en Maps, archivo de calendario y sección RSVP para **Google Forms**.

## Antes de publicar: privacidad

> **MUY IMPORTANTE**: GitHub Pages es público. Esta tarjeta contiene fotos/ilustraciones familiares, el nombre de una menor y una dirección residencial. La opción `noindex` y `robots.txt` reducen la indexación voluntaria por buscadores, pero **no restringen el acceso**. Cualquier persona con el enlace puede verla. El repositorio público también mostrará los archivos. Publica únicamente si quienes aparecen y quienes organizan la celebración están de acuerdo.

No se guardan nombres de asistentes en GitHub ni en el código. El Google Form y las respuestas deben tener acceso restringido a los organizadores.

## 1) Crear el formulario gratuito

1. Abre https://forms.google.com/ con tu cuenta de Google.
2. Crea un formulario **Confirmación cumpleaños de Eloísa** con:
   - Nombre de la familia o invitado (Respuesta corta; obligatoria)
   - ¿Asistirán? (Opción múltiple: Sí / No; obligatoria)
   - Cantidad de adultos (Desplegable: 0 a 10; obligatoria)
   - Cantidad de niños/as (Desplegable: 0 a 10; obligatoria)
   - Mensaje para Eloísa (Párrafo; opcional)
3. Evita marcar la opción que exige inicio de sesión si deseas recibir respuestas sin cuentas Google. No actives "Límite de 1 respuesta" si no quieres obligar a iniciar sesión.
4. En **Respuestas**, vincula una **hoja de cálculo de Google Sheets** para visualizar y sumar los asistentes. Mantén la hoja privada.
5. Publica/activa la recepción de respuestas del formulario (dependiendo de la interfaz actual de Google Forms).
6. En "Enviar" / "Compartir" / "Insertar HTML" copia la URL que aparece en `src="..."` del código del iframe (la etiqueta HTML completa NO se pega en la configuración).
7. En `js/config.js`, reemplaza `GOOGLE_FORM_EMBED_URL` por ese `src` y `GOOGLE_FORM_PUBLIC_URL` por el enlace para responder.

**Importante:** hasta que completes las URLs, la página muestra un aviso en la sección RSVP. No simula registros ni afirma que una respuesta se haya guardado. Google Forms gestiona el envío, confirmación y almacenamiento; la web no tiene backend ni PHP.

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
