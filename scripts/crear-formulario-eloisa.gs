/**
 * Crea una sola vez el Google Form de confirmaciones de Eloísa Violeta Rubin Ojeda,
 * lo vincula a ESTA hoja de cálculo de Google y deja el enlace en "Panel".
 *
 * EJECUCIÓN:
 *   1. Abrir la hoja de asistentes en Google Sheets.
 *   2. Extensiones → Apps Script.
 *   3. Sustituir Code.gs por este contenido y guardar.
 *   4. Elegir crearFormularioEloisa, pulsar Ejecutar y autorizar.
 *   5. Volver a "Panel" y copiar el enlace público de B23.
 *
 * No ejecutarlo desde un proyecto Apps Script independiente: este script
 * requiere estar vinculado a la hoja existente.
 */
function crearFormularioEloisa() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Abre este código desde Extensiones > Apps Script en la hoja de asistentes.');
  }
  const panel = ss.getSheetByName('Panel');
  if (!panel) {
    throw new Error('No se encontró la pestaña "Panel" en la hoja de asistentes de Eloísa.');
  }

  const props = PropertiesService.getScriptProperties();
  const propertyKey = 'FORMULARIO_ELOISA_ID';
  let id = props.getProperty(propertyKey);
  let form;

  if (id) {
    form = FormApp.openById(id);
  } else {
    form = FormApp.create('Confirmación de asistencia — Primer cumpleaños de Eloísa Violeta Rubin Ojeda', true);
    // Guardar el ID temprano evita crear formularios duplicados al reintentar.
    id = form.getId();
    props.setProperty(propertyKey, id);

    form.setDescription(
      '¡Gracias por ser parte de la primera vuelta al sol de Eloísa Violeta Rubin Ojeda! 🌸\n' +
      'Te esperamos el sábado 17 de octubre de 2026, de 12:00 a 16:00, ' +
      'en Santa Corina 518, Estación Central, Santiago.\n\n' +
      'Por favor, confírmanos si podrás venir y cuántas personas te acompañarán.'
    );
    form.setConfirmationMessage(
      '¡Muchas gracias por confirmar! ♡ Nos hará muy felices celebrar con ustedes.\n' +
      'Sábado 17 de octubre · 12:00 a 16:00.'
    );
    form.setCollectEmail(false);
    form.setLimitOneResponsePerUser(false);
    form.setShowLinkToRespondAgain(true);
    form.setAllowResponseEdits(true);
  }

  // Configuración idempotente: si hubo un error anterior, agregamos
  // solamente las preguntas que todavía falten.
  const existingTitles = new Set(form.getItems().map(item => item.getTitle()));
  function addIfMissing(title, creator) {
    if (!existingTitles.has(title)) {
      creator();
      existingTitles.add(title);
    }
  }

  addIfMissing('Nombre de la familia o invitado', () => {
    form.addTextItem()
      .setTitle('Nombre de la familia o invitado')
      .setHelpText('Escribe tu nombre o el de tu grupo familiar.')
      .setRequired(true);
  });

  addIfMissing('¿Nos acompañarán?', () => {
    form.addMultipleChoiceItem()
      .setTitle('¿Nos acompañarán?')
      .setChoiceValues(['Sí, asistiremos', 'No podremos asistir'])
      .setRequired(true);
  });

  const opciones = Array.from({length: 11}, (_, i) => String(i));
  addIfMissing('Cantidad de adultos', () => {
    form.addListItem()
      .setTitle('Cantidad de adultos')
      .setHelpText('Selecciona 0 si no pueden asistir.')
      .setChoiceValues(opciones)
      .setRequired(true);
  });

  addIfMissing('Cantidad de niños/as', () => {
    form.addListItem()
      .setTitle('Cantidad de niños/as')
      .setHelpText('Selecciona 0 si no asistirán niños/as.')
      .setChoiceValues(opciones)
      .setRequired(true);
  });

  addIfMissing('Mensaje para Eloísa', () => {
    form.addParagraphTextItem()
      .setTitle('Mensaje para Eloísa')
      .setHelpText('Opcional: déjale unas palabras de cariño.')
      .setRequired(false);
  });

  // Google Forms crea una nueva pestaña de respuestas dentro de la hoja existente.
  if (form.getDestinationId() !== ss.getId()) {
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  }

  if (typeof form.supportsAdvancedResponderPermissions === 'function' &&
      form.supportsAdvancedResponderPermissions()) {
    form.setPublished(true);
  }
  form.setAcceptingResponses(true);
  SpreadsheetApp.flush();

  // La hoja ya contiene la pestaña "Panel"; Forms añade una segunda pestaña.
  // La renombramos para que las fórmulas del panel funcionen sin ajustes.
  if (!ss.getSheetByName('Respuestas')) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const others = ss.getSheets().filter(sheet => sheet.getName() !== 'Panel');
      const matched = others.find(sheet =>
        typeof sheet.getFormUrl === 'function' &&
        String(sheet.getFormUrl() || '').includes(form.getId())
      );
      const responseSheet = matched || (others.length === 1 ? others[0] : null);
      if (responseSheet) {
        responseSheet.setName('Respuestas');
        break;
      }
      Utilities.sleep(500);
    }
  }

  const url = form.getPublishedUrl();
  const editUrl = form.getEditUrl();
  panel.getRange('A22:B25').setValues([
    ['FORMULARIO CREADO', 'Enlace / estado'],
    ['ENLACE PÚBLICO PARA CONFIRMAR (compartir)', url],
    ['ENLACE PARA EDITAR (no compartir)', editUrl],
    ['RESPUESTAS EN ESTA HOJA', ss.getUrl()],
  ]);
  panel.getRange('A22:B22').setBackground('#f2e1f7').setFontWeight('bold');
  panel.getRange('B23:B24').setWrap(true);
  panel.getRange('A23:A24').setFontWeight('bold');

  console.log('Google Form creado: ' + url);
  console.log('Edición del formulario: ' + editUrl);
  console.log('Google Sheets de confirmaciones: ' + ss.getUrl());
  console.log('En la pestaña "Panel", el enlace público también está en B23.');
}
