import type { Workout } from './types';

const encoder = new TextEncoder();
const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

function escapeXml(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r/g, '&#13;');
}

function zip(files: Record<string, string>): ArrayBuffer {
  const entries = Object.entries(files).map(([name, content]) => ({
    name: encoder.encode(name),
    data: encoder.encode(xmlHeader + content),
  }));

  const size = entries.reduce(
    (total, entry) =>
      total + 76 + entry.name.length * 2 + entry.data.length,
    22
  );

  const buffer = new ArrayBuffer(size);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let offset = 0;

  const word = (value: number) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };

  const dword = (value: number) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };

  const write = (value: Uint8Array) => {
    bytes.set(value, offset);
    offset += value.length;
  };

  const records = entries.map((entry) => {
    let crc = 0xffffffff;

    for (const byte of entry.data) {
      crc ^= byte;

      for (let bit = 0; bit < 8; bit++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }

    crc = (crc ^ 0xffffffff) >>> 0;
    const start = offset;

    dword(0x04034b50);
    word(20); word(0); word(0); word(0); word(33);
    dword(crc);
    dword(entry.data.length);
    dword(entry.data.length);
    word(entry.name.length);
    word(0);
    write(entry.name);
    write(entry.data);

    return { ...entry, crc, start };
  });

  const centralStart = offset;

  for (const entry of records) {
    dword(0x02014b50);
    word(20); word(20); word(0); word(0); word(0); word(33);
    dword(entry.crc);
    dword(entry.data.length);
    dword(entry.data.length);
    word(entry.name.length);
    word(0); word(0); word(0); word(0);
    dword(0);
    dword(entry.start);
    write(entry.name);
  }

  const centralSize = offset - centralStart;

  dword(0x06054b50);
  word(0); word(0);
  word(records.length);
  word(records.length);
  dword(centralSize);
  dword(centralStart);
  word(0);

  return buffer;
}

export function createWorkoutExcel(workouts: Workout[]): ArrayBuffer {
  if (workouts.length > 1048575) {
    throw new Error('Слишком много тренировок для одного листа Excel.');
  }

  const feelings: Record<string, string> = {
    excellent: 'Отлично',
    good: 'Хорошо',
    normal: 'Нормально',
    hard: 'Тяжело',
    light: 'Легко',
    heavy: 'Тяжело',
    exhausted: 'Без сил',
  };

  const rows = [
    ['Дата', 'Подходы (кг × повторения)', 'Самочувствие', 'Теги', 'Заметка'],
    ...[...workouts]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((workout) => [
        workout.date,
        workout.sets
          .map((set) => `${set.weight} × ${set.reps}`)
          .join('; '),
        feelings[workout.feeling] ?? workout.feeling ?? '',
        (workout.tags ?? []).join('; '),
        workout.notes ?? '',
      ]),
  ];

  const sheetData = rows.map((row, index) => {
    const cells = row.map((value, column) => {
      const address = `${String.fromCharCode(65 + column)}${index + 1}`;

      if (value.length > 32767) {
        throw new Error(`Слишком длинный текст в ячейке ${address}.`);
      }

      return value === ''
        ? `<c r="${address}"/>`
        : `<c r="${address}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join('');

    return `<row r="${index + 1}">${cells}</row>`;
  }).join('');

  const main =
    'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const relations =
    'http://schemas.openxmlformats.org/package/2006/relationships';
  const office =
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

  return zip({
    '[Content_Types].xml':
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,

    '_rels/.rels':
      `<Relationships xmlns="${relations}"><Relationship Id="rId1" Type="${office}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,

    'xl/workbook.xml':
      `<workbook xmlns="${main}" xmlns:r="${office}"><sheets><sheet name="Тренировки" sheetId="1" r:id="rId1"/></sheets></workbook>`,

    'xl/_rels/workbook.xml.rels':
      `<Relationships xmlns="${relations}"><Relationship Id="rId1" Type="${office}/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,

    'xl/worksheets/sheet1.xml':
      `<worksheet xmlns="${main}"><sheetData>${sheetData}</sheetData></worksheet>`,
  });
}

export function downloadWorkoutExcel(workouts: Workout[]) {
  const blob = new Blob([createWorkoutExcel(workouts)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `HeroLift-${today.getFullYear()}-${month}-${day}.xlsx`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
