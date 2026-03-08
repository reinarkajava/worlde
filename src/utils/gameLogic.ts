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
    return { borderColor: Colors.border, backgroundColor: 'transparent' };
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

// Funktsioon teksti värvi määramiseks ruudustikus
export const getCellTextStyle = (row: number, currentRow: number) => {
  return row < currentRow ? { color: 'white' } : { color: 'black' };
};

export const getKeyStatuses = (board: string[][], currentRow: number, solution: string) => {
  const statuses: { [key: string]: string } = {};
  const solUpper = solution.toUpperCase();

  // 1. Loome sagedustabeli: kui palju on igat tähte lahendussõnas
  const solutionCharCounts: { [key: string]: number } = {};
  for (const char of solUpper) {
    solutionCharCounts[char] = (solutionCharCounts[char] || 0) + 1;
  }

  // 2. Leiame, millised tähed on MIHES ridades juba õiges kohas leitud
  // Kasutame Set-i, et hoida meeles unikaalseid asukohti (indekseid)
  const foundCorrectPositions = new Set<string>(); // Formaat: "T-0", "P-3", jne.

  for (let i = 0; i < currentRow; i++) {
    const row = board[i];
    row.forEach((letter, j) => {
      const upLetter = letter.toUpperCase();
      if (upLetter && upLetter === solUpper[j]) {
        foundCorrectPositions.add(`${upLetter}-${j}`);
      }
    });
  }

  // 3. Arvutame klaviatuuri olekud
  // Käime läbi kõik sisestatud tähed ja määrame värvi
  for (let i = 0; i < currentRow; i++) {
    const row = board[i];
    row.forEach((letter) => {
      const upLetter = letter.toUpperCase();
      if (!upLetter) return;

      // Loeb kokku, mitu korda on see konkreetne täht erinevates õigetes asukohtades leitud
      const correctDiscoveries = Array.from(foundCorrectPositions)
        .filter(pos => pos.startsWith(`${upLetter}-`)).length;

      // SINU ERITINGIMUS: Roheliseks läheb ainult siis, kui KÕIK asukohad on leitud
      if (correctDiscoveries > 0 && correctDiscoveries === solutionCharCounts[upLetter]) {
        statuses[upLetter] = 'all_correct'; // Muudame nime, et eristada täielikku võitu
      } 
      else if (correctDiscoveries > 0) {
        statuses[upLetter] = 'partially_correct'; // Vähemalt üks asukoht leitud, aga mitte kõik
      }
      else if (solUpper.includes(upLetter)) {
        statuses[upLetter] = 'present'; // Täht on olemas, aga ühtegi asukohta pole leitud
      } 
      else {
        if (!statuses[upLetter]) statuses[upLetter] = 'absent';
      }
    });
  }

  return statuses;
};