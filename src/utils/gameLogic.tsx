import { Colors } from '../theme/colors';

export const getCellStyle = (
  row: number, 
  currentRow: number, 
  char: string, 
  index: number, 
  correctWord: string
) => {
  // Kui rida pole veel kinnitatud (mängija alles trükib), näitame ainult piirjoont
  if (row >= currentRow || char === "") {
    return { borderColor: Colors.border };
  }

  const upperChar = char.toUpperCase();
  const upperWord = correctWord.toUpperCase();

  // 1. Täppisvastus (Roheline)
  if (upperChar === upperWord[index]) {
    return { backgroundColor: Colors.correct, borderColor: Colors.correct };
  }

  // 2. Täht on sõnas olemas, aga vales kohas (Kollane)
  if (upperWord.includes(upperChar)) {
    return { backgroundColor: Colors.present, borderColor: Colors.present };
  }

  // 3. Tähte pole üldse sõnas (Hall)
  return { backgroundColor: Colors.absent, borderColor: Colors.absent };
};