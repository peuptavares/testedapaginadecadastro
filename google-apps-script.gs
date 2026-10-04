/**
 * Google Apps Script — webhook de recebimento de leads da MIDAS.
 *
 * Como instalar:
 * 1. Crie (ou abra) a planilha Google Sheets onde os leads vão cair.
 * 2. Menu Extensões > Apps Script.
 * 3. Apague o conteúdo padrão de Code.gs e cole este arquivo inteiro.
 * 4. Clique em Implantar > Nova implantação.
 * 5. Tipo: "App da Web". Executar como: "Eu". Quem pode acessar: "Qualquer pessoa".
 * 6. Implante e copie a URL do app da web (termina em /exec).
 * 7. Cole essa URL na constante WEBHOOK_URL do script.js.
 */

const SHEET_NAME = 'Leads';

const HEADER = [
  'Data/Hora Recebimento',
  'Nome',
  'WhatsApp',
  'E-mail',
  'Qualificado',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'UTM Term',
  'fbclid',
  'gclid',
  'Data/Hora Envio (cliente)',
  'URL de Origem'
];

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.nome || '',
      data.whatsapp || '',
      data.email || '',
      data.qualificado || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.utm_content || '',
      data.utm_term || '',
      data.fbclid || '',
      data.gclid || '',
      data.data_hora || '',
      data.url_origem || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}
