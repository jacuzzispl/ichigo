import { SentenceQuestionData } from '../types';

export const KANJI_SENTENCE_MAP: Record<string, SentenceQuestionData> = {
  '日': {
    japaneseSentence: '今日はとても天気がいいですね。',
    furigana: 'きょう は とても てんき が いい です ね。',
    targetKanji: '日',
    correctAnswer: 'Today the weather is very nice, isn’t it?',
    options: [
      'Today the weather is very nice, isn’t it?',
      'Tomorrow it will rain heavily in the afternoon.',
      'Yesterday night was unusually cold.',
      'There are many dark clouds in the sky.',
    ],
    englishExplanation: '「今日」(きょう - today) uses the kanji 日 (day/sun).',
  },
  '月': {
    japaneseSentence: '今夜の月はとても綺麗に輝いています。',
    furigana: 'こんや の つき は とても きれい に かがやいて います。',
    targetKanji: '月',
    correctAnswer: 'The moon tonight is shining very beautifully.',
    options: [
      'The moon tonight is shining very beautifully.',
      'The sun rose early over the quiet horizon.',
      'Next month I will travel to Tokyo by train.',
      'I borrowed three history books from the library.',
    ],
    englishExplanation: '「月」(つき - moon) describes the shining moon in the night sky.',
  },
  '人': {
    japaneseSentence: 'あの日本人の先生はとても親切です。',
    furigana: 'あの にほんじん の せんせい は とても しんせつ です。',
    targetKanji: '人',
    correctAnswer: 'That Japanese teacher is very kind.',
    options: [
      'That Japanese teacher is very kind.',
      'That tall building is very famous in Kyoto.',
      'There are three quiet dogs resting in the garden.',
      'This restaurant serves delicious and affordable lunch.',
    ],
    englishExplanation: '「日本人」(にほんじん - Japanese person) combines 日本 and 人.',
  },
  '水': {
    japaneseSentence: '運動のあとに冷たいお水を一杯飲みました。',
    furigana: 'うんどう の あと に つめたい おみず を いっぱい のみました。',
    targetKanji: '水',
    correctAnswer: 'I drank a glass of cold water after exercising.',
    options: [
      'I drank a glass of cold water after exercising.',
      'I ordered a warm cup of green tea at the café.',
      'The river current flows very quickly through the valley.',
      'We went swimming in the public pool on Wednesday.',
    ],
    englishExplanation: '「お水」(おみず - water) is the native kun’yomi reading of 水.',
  },
  '火': {
    japaneseSentence: '冬のキャンプ場で暖炉に火をつけました。',
    furigana: 'ふゆ の キャンプじょう で だんろ に ひ を つけました。',
    targetKanji: '火',
    correctAnswer: 'We lit a fire in the hearth at the winter campsite.',
    options: [
      'We lit a fire in the hearth at the winter campsite.',
      'Heavy snow began falling over the pine trees.',
      'Tuesday is typically my busiest workday of the week.',
      'We cooked fresh vegetables in a large iron pot.',
    ],
    englishExplanation: '「火」(ひ - fire) refers to the flame in the fireplace.',
  },
  '山': {
    japaneseSentence: '来週の週末、友達と富士山に登る予定です。',
    furigana: 'らいしゅう の しゅうまつ、ともだち と ふじさん に のぼる よてい です。',
    targetKanji: '山',
    correctAnswer: 'Next weekend, I plan to climb Mt. Fuji with my friend.',
    options: [
      'Next weekend, I plan to climb Mt. Fuji with my friend.',
      'Next week, my family is taking a trip to the sea.',
      'The mountain view from the fast train was stunning.',
      'I bought sturdy hiking boots at the sports shop.',
    ],
    englishExplanation: '「富士山」(ふじさん - Mt. Fuji) uses the on’yomi reading サン for 山.',
  },
  '大': {
    japaneseSentence: '公園の真ん中にとても大きい木が立っています。',
    furigana: 'こうえん の まんなか に とても おおきい き が たって います。',
    targetKanji: '大',
    correctAnswer: 'A very large tree stands in the middle of the park.',
    options: [
      'A very large tree stands in the middle of the park.',
      'A tiny yellow bird landed on the windowsill.',
      'The university library opens promptly at nine.',
      'Solving this math problem was quite difficult.',
    ],
    englishExplanation: '「大きい」(おおきい - big/large) is the primary adjective formed from 大.',
  },
  '小': {
    japaneseSentence: '庭でかわいい小さい子猫が遊んでいます。',
    furigana: 'にわ で かわいい ちいさい こねこ が あそんで います。',
    targetKanji: '小',
    correctAnswer: 'A cute little kitten is playing in the garden.',
    options: [
      'A cute little kitten is playing in the garden.',
      'A large black dog was barking across the street.',
      'The children walked together to the elementary school.',
      'I enjoyed a small cup of hot coffee after lunch.',
    ],
    englishExplanation: '「小さい」(ちいさい - small/little) is the adjective form of 小.',
  },
  '木': {
    japaneseSentence: '春が来ると、桜の木に美しい花がたくさん咲きます。',
    furigana: 'はる が くると、さくら の き に うつくしい はな が たくさん さきます。',
    targetKanji: '木',
    correctAnswer: 'When spring comes, many beautiful flowers bloom on the cherry tree.',
    options: [
      'When spring comes, many beautiful flowers bloom on the cherry tree.',
      'In autumn, the maple leaves turn vivid crimson red.',
      'Thursday afternoon is when our calligraphy workshop meets.',
      'We rested under the cool shade of the old pine tree.',
    ],
    englishExplanation: '「木」(き - tree) is the primary native kun’yomi reading.',
  },
  '口': {
    japaneseSentence: '駅の東口の改札前で待ち合わせをしましょう。',
    furigana: 'えき の ひがしぐち の かいさつまえ で まちあわせ を しましょう。',
    targetKanji: '口',
    correctAnswer: 'Let’s meet in front of the ticket gate at the station’s east exit.',
    options: [
      'Let’s meet in front of the ticket gate at the station’s east exit.',
      'The subway train is arriving shortly at platform number two.',
      'Please present your passport at the immigration counter.',
      'The population of this coastal town is steadily growing.',
    ],
    englishExplanation: '「東口」(ひがしぐち - east exit/gate) uses 口 (opening/mouth).',
  },
  '一': {
    japaneseSentence: '朝ごはんに甘いりんごを一つ食べました。',
    furigana: 'あさごはん に あまい りんご を ひとつ たべました。',
    targetKanji: '一',
    correctAnswer: 'I ate one sweet apple for breakfast.',
    options: [
      'I ate one sweet apple for breakfast.',
      'I bought two fresh oranges at the morning market.',
      'Everyone arrived on time for the annual celebration.',
      'Today is the first day of the new autumn semester.',
    ],
    englishExplanation: '「一つ」(ひとつ - one item) is the native Japanese counter using 一.',
  },
};

/**
 * Returns sentence question data for a kanji or builds a graceful fallback.
 */
export function getSentenceQuestion(character: string, meanings: string[]): SentenceQuestionData {
  if (KANJI_SENTENCE_MAP[character]) {
    return KANJI_SENTENCE_MAP[character];
  }

  const primaryMeaning = meanings[0] || 'concept';
  return {
    japaneseSentence: `これは「${character}」についての簡単な例文です。`,
    furigana: `これ は「${character}」に ついて の かんたん な れいぶん です。`,
    targetKanji: character,
    correctAnswer: `This is a sample sentence related to ${primaryMeaning}.`,
    options: [
      `This is a sample sentence related to ${primaryMeaning}.`,
      'The weather was pleasant and sunny yesterday.',
      'I will meet my friends at the station tomorrow.',
      'Reading books every evening helps relax the mind.',
    ],
    englishExplanation: `This sentence reinforces the meaning "${primaryMeaning}".`,
  };
}
