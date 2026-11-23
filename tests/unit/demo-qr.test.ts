import test from 'node:test';
import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

// ========================================
// COREMOTION | TESTES DO QR DE DEMONSTRAÇÃO
// Verifica a leitura real da matriz, não apenas sua aparência.
// ========================================
test('QR de demonstração é escaneável e nunca contém um Pix bancário', () => {
  const reference = 'COREMOTION|PAGAMENTO_SIMULADO|PIX|12345|11111111-1111-4111-8111-111111111111|NAO_PAGAVEL';
  const qr = QRCode.create(reference, { errorCorrectionLevel: 'M' });
  const quietZone = 4;
  const scale = 5;
  const dimensions = (qr.modules.size + quietZone * 2) * scale;
  const rgba = new Uint8ClampedArray(dimensions * dimensions * 4);
  for (let y = 0; y < dimensions; y++) {
    for (let x = 0; x < dimensions; x++) {
      const row = Math.floor(y / scale) - quietZone;
      const col = Math.floor(x / scale) - quietZone;
      const dark = row >= 0 && col >= 0 && row < qr.modules.size && col < qr.modules.size && qr.modules.get(row, col);
      const offset = (y * dimensions + x) * 4;
      rgba[offset] = rgba[offset + 1] = rgba[offset + 2] = dark ? 16 : 255;
      rgba[offset + 3] = 255;
    }
  }
  const scan = jsQR(rgba, dimensions, dimensions);
  assert.equal(scan?.data, reference);
  assert.ok(scan?.data.includes('NAO_PAGAVEL'));
  assert.ok(!scan?.data.includes('BR.GOV.BCB.PIX'));
});
