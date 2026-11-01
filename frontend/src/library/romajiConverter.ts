/**
 * Lightweight real-time Romaji to Hiragana converter & reading validator
 * Supports WaniKani style live IME conversion as the user types.
 */

const ROMAJI_TABLE: [RegExp, string][] = [
  // Three-letter combinations (digraphs with small ya/yu/yo)
  [/kya/gi, 'きゃ'],
  [/kyu/gi, 'きゅ'],
  [/kyo/gi, 'きょ'],
  [/sha/gi, 'しゃ'],
  [/shu/gi, 'しゅ'],
  [/sho/gi, 'しょ'],
  [/sya/gi, 'しゃ'],
  [/syu/gi, 'しゅ'],
  [/syo/gi, 'しょ'],
  [/cha/gi, 'ちゃ'],
  [/chu/gi, 'ちゅ'],
  [/cho/gi, 'ちょ'],
  [/tya/gi, 'ちゃ'],
  [/tyu/gi, 'ちゅ'],
  [/tyo/gi, 'ちょ'],
  [/nya/gi, 'にゃ'],
  [/nyu/gi, 'にゅ'],
  [/nyo/gi, 'にょ'],
  [/hya/gi, 'ひゃ'],
  [/hyu/gi, 'ひゅ'],
  [/hyo/gi, 'ひょ'],
  [/mya/gi, 'みゃ'],
  [/myu/gi, 'みゅ'],
  [/myo/gi, 'みょ'],
  [/rya/gi, 'りゃ'],
  [/ryu/gi, 'りゅ'],
  [/ryo/gi, 'りょ'],
  [/gya/gi, 'ぎゃ'],
  [/gyu/gi, 'ぎゅ'],
  [/gyo/gi, 'ぎょ'],
  [/jya/gi, 'じゃ'],
  [/jyu/gi, 'じゅ'],
  [/jyo/gi, 'じょ'],
  [/bya/gi, 'びゃ'],
  [/byu/gi, 'びゅ'],
  [/byo/gi, 'びょ'],
  [/pya/gi, 'ぴゃ'],
  [/pyu/gi, 'ぴゅ'],
  [/pyo/gi, 'ぴょ'],

  // Special double-consonant 'nn'
  [/nn/gi, 'ん'],
  [/n'/gi, 'ん'],

  // Two-letter syllables
  [/ka/gi, 'か'],
  [/ki/gi, 'き'],
  [/ku/gi, 'く'],
  [/ke/gi, 'け'],
  [/ko/gi, 'こ'],
  [/sa/gi, 'さ'],
  [/si/gi, 'し'],
  [/shi/gi, 'し'],
  [/tsu/gi, 'つ'],
  [/su/gi, 'す'],
  [/se/gi, 'せ'],
  [/so/gi, 'そ'],
  [/ta/gi, 'た'],
  [/ti/gi, 'ち'],
  [/chi/gi, 'ち'],
  [/tu/gi, 'つ'],
  [/te/gi, 'て'],
  [/to/gi, 'と'],
  [/na/gi, 'な'],
  [/ni/gi, 'に'],
  [/nu/gi, 'ぬ'],
  [/ne/gi, 'ね'],
  [/no/gi, 'の'],
  [/ha/gi, 'は'],
  [/hi/gi, 'ひ'],
  [/hu/gi, 'ふ'],
  [/fu/gi, 'ふ'],
  [/he/gi, 'へ'],
  [/ho/gi, 'ほ'],
  [/ma/gi, 'ま'],
  [/mi/gi, 'み'],
  [/mu/gi, 'む'],
  [/me/gi, 'め'],
  [/mo/gi, 'も'],
  [/ya/gi, 'や'],
  [/yu/gi, 'ゆ'],
  [/yo/gi, 'よ'],
  [/ra/gi, 'ら'],
  [/ri/gi, 'り'],
  [/ru/gi, 'る'],
  [/re/gi, 'れ'],
  [/ro/gi, 'ろ'],
  [/wa/gi, 'わ'],
  [/wo/gi, 'を'],

  // Voiced consonants (Dakuten)
  [/ga/gi, 'が'],
  [/gi/gi, 'ぎ'],
  [/gu/gi, 'ぐ'],
  [/ge/gi, 'げ'],
  [/go/gi, 'ご'],
  [/za/gi, 'ざ'],
  [/zi/gi, 'じ'],
  [/ji/gi, 'じ'],
  [/zu/gi, 'ず'],
  [/ze/gi, 'ぜ'],
  [/zo/gi, 'ぞ'],
  [/da/gi, 'だ'],
  [/di/gi, 'ぢ'],
  [/du/gi, 'づ'],
  [/de/gi, 'で'],
  [/do/gi, 'ど'],
  [/ba/gi, 'ば'],
  [/bi/gi, 'び'],
  [/bu/gi, 'ぶ'],
  [/be/gi, 'べ'],
  [/bo/gi, 'ぼ'],

  // Semi-voiced consonants (Handakuten)
  [/pa/gi, 'ぱ'],
  [/pi/gi, 'ぴ'],
  [/pu/gi, 'ぷ'],
  [/pe/gi, 'ぺ'],
  [/po/gi, 'ぽ'],

  // Standalone 'j' variations
  [/ja/gi, 'じゃ'],
  [/ju/gi, 'じゅ'],
  [/jo/gi, 'じょ'],

  // Single vowels
  [/a/gi, 'あ'],
  [/i/gi, 'い'],
  [/u/gi, 'う'],
  [/e/gi, 'え'],
  [/o/gi, 'お'],
  [/-/g, 'ー'],
];

/**
 * Converts romaji text to hiragana in real time.
 * Automatically handles double-consonants (sokuon 'っ') like 'tte' -> 'って'.
 */
export function romajiToHiragana(text: string): string {
  if (!text) return '';

  let result = text.toLowerCase();

  // Convert double consonants: kk, ss, tt, pp, etc. into 'っ' + consonant
  result = result.replace(/([bcdfghjklmpqrstvwxyz])\1/gi, (match, letter) => {
    if (letter.toLowerCase() === 'n') return 'ん';
    return `っ${letter}`;
  });

  // Apply romaji conversion rules in order
  for (const [pattern, replacement] of ROMAJI_TABLE) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * Finalizes conversion on submit (e.g. trailing single 'n' becomes 'ん').
 */
export function finalizeHiragana(text: string): string {
  let res = romajiToHiragana(text);
  if (res.endsWith('n') || res.endsWith('N')) {
    res = res.slice(0, -1) + 'ん';
  }
  return res;
}

/**
 * Convert Katakana to Hiragana for comparison.
 */
export function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Strips punctuation often used in reading dictionaries (e.g., 'おお.きい' -> 'おおきい', '-び' -> 'び').
 */
export function cleanReading(reading: string): string {
  return reading.replace(/[\.\-\(\)]/g, '').trim().toLowerCase();
}

/**
 * Checks if the user's input matches any reading of the kanji.
 * Supports Hiragana, Katakana, and Romaji matching.
 */
export function matchesReading(
  userInput: string,
  onyomi: string[],
  kunyomi: string[]
): boolean {
  const normalizedUser = finalizeHiragana(userInput.trim().toLowerCase());
  const userHiragana = katakanaToHiragana(normalizedUser);

  const allReadings = [...onyomi, ...kunyomi];

  for (const r of allReadings) {
    const cleaned = cleanReading(r);
    const hiraganaReading = romajiToHiragana(cleaned);

    if (userHiragana === hiraganaReading) {
      return true;
    }

    // Also compare direct romaji if user didn't convert
    const rawUser = userInput.trim().toLowerCase();
    if (rawUser === cleaned) {
      return true;
    }
  }

  console.log(userHiragana);

  return false;
}

/**
 * Checks if the user's input matches any English meaning of the kanji.
 */
export function matchesMeaning(
  userInput: string,
  meanings: string[]
): boolean {
  const normalized = userInput.trim().toLowerCase();
  if (!normalized) return false;

  for (const m of meanings) {
    if (normalized === m.trim().toLowerCase()) return true;

    // Split compound meanings e.g. "Day / Sun"
    const subMeanings = m.split(/[\/,;]/).map((s) => s.trim().toLowerCase());
    if (subMeanings.includes(normalized)) return true;
  }

  return false;
}
