// В публикуемых текстах нет длинного тире (U+2014): стиль репозитория.
import { repoFiles, isText, read, fail } from './lib.mjs';

const DASH = String.fromCodePoint(0x2014);
if (!`a ${DASH} b`.includes(DASH)) fail(['control failed'], 'em-dash');

const errors = [];
for (const f of repoFiles().filter(isText)) {
  read(f)
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (line.includes(DASH)) errors.push(`${f}:${i + 1}`);
    });
}
fail(errors, 'em-dash');
console.log('NO EM DASH');
