import { KanjiItem } from '../types';

export const KANJI_DATA: KanjiItem[] = [
  {
    id: 'sakura',
    kanji: '桜',
    meaning: 'Cherry Blossom',
    kunyomi: 'さくら (sakura)',
    onyomi: 'オウ (ou)',
    romaji: 'sakura',
    jlpt: 'N3',
    strokes: 10,
    radicals: ['木 (tree)', 'ツ (crown)', '女 (woman)'],
    mnemonic: 'A tree (木) crowned with petals that delicate women (女) admire under the spring canopy.',
    examples: [
      { japanese: '桜が満開です', reading: 'さくらが まんかいです', meaning: 'The cherry blossoms are in full bloom.' },
      { japanese: '桜前線', reading: 'さくらぜんせん', meaning: 'Cherry blossom front (forecast).' },
      { japanese: '山桜', reading: 'やまざくら', meaning: 'Wild cherry tree.' }
    ]
  },
  {
    id: 'ki',
    kanji: '木',
    meaning: 'Tree / Wood',
    kunyomi: 'き (ki), こ- (ko-)',
    onyomi: 'ボク (boku), モク (moku)',
    romaji: 'ki',
    jlpt: 'N5',
    strokes: 4,
    radicals: ['木 (tree)'],
    mnemonic: 'Depicts the trunk of a tree with branches spreading out and roots anchoring below.',
    examples: [
      { japanese: '大きな木', reading: 'おおきな き', meaning: 'A large tree.' },
      { japanese: '木曜日', reading: 'もくようび', meaning: 'Thursday.' },
      { japanese: '木漏れ日', reading: 'こもれび', meaning: 'Sunlight filtering through trees.' }
    ]
  },
  {
    id: 'hana',
    kanji: '花',
    meaning: 'Flower / Blossom',
    kunyomi: 'はな (hana)',
    onyomi: 'カ (ka), ケ (ke)',
    romaji: 'hana',
    jlpt: 'N5',
    strokes: 7,
    radicals: ['艹 (grass/flower)', '化 (change/transform)'],
    mnemonic: 'Grass and flora that transforms (化) into a brilliant colorful flower.',
    examples: [
      { japanese: '花見に行く', reading: 'はなみに いく', meaning: 'Go flower viewing (Hanami).' },
      { japanese: '花火大会', reading: 'はなびたいかい', meaning: 'Fireworks festival.' },
      { japanese: '花束', reading: 'はなたば', meaning: 'Bouquet of flowers.' }
    ]
  },
  {
    id: 'tsuki',
    kanji: '月',
    meaning: 'Moon / Month',
    kunyomi: 'つき (tsuki)',
    onyomi: 'ゲツ (getsu), ガツ (gatsu)',
    romaji: 'tsuki',
    jlpt: 'N5',
    strokes: 4,
    radicals: ['月 (moon)'],
    mnemonic: 'A crescent moon with clouds drifting across its serene face.',
    examples: [
      { japanese: '月が綺麗ですね', reading: 'つきが きれいですね', meaning: 'The moon is beautiful, isn\'t it? (Subtle expression of love).' },
      { japanese: '今月', reading: 'こんげつ', meaning: 'This month.' },
      { japanese: '満月', reading: 'まんげつ', meaning: 'Full moon.' }
    ]
  },
  {
    id: 'kokoro',
    kanji: '心',
    meaning: 'Heart / Mind / Spirit',
    kunyomi: 'こころ (kokoro)',
    onyomi: 'シン (shin)',
    romaji: 'kokoro',
    jlpt: 'N4',
    strokes: 4,
    radicals: ['心 (heart)'],
    mnemonic: 'The chambers and arteries of the beating human heart, symbolizing spirit and emotion.',
    examples: [
      { japanese: '心からの感謝', reading: 'こころからの かんしゃ', meaning: 'Heartfelt gratitude.' },
      { japanese: '安心する', reading: 'あんしんする', meaning: 'To feel at ease / relieved.' },
      { japanese: '好奇心', reading: 'こうきしん', meaning: 'Curiosity.' }
    ]
  },
  {
    id: 'michi',
    kanji: '道',
    meaning: 'Road / Way / Path / Tao',
    kunyomi: 'みち (michi)',
    onyomi: 'ドウ (dou), トウ (tou)',
    romaji: 'michi',
    jlpt: 'N5',
    strokes: 12,
    radicals: ['辶 (walk/movement)', '首 (head/leader)'],
    mnemonic: 'Walking forward with your head held high along the designated path.',
    examples: [
      { japanese: '茶道', reading: 'さどう / ちゃどう', meaning: 'The Way of Tea (Tea Ceremony).' },
      { japanese: '武士道', reading: 'ぶしどう', meaning: 'Bushido (Way of the Samurai).' },
      { japanese: '帰り道', reading: 'かえりみち', meaning: 'The way back home.' }
    ]
  },
  {
    id: 'hikari',
    kanji: '光',
    meaning: 'Light / Ray',
    kunyomi: 'ひかり (hikari), ひかる (hikaru)',
    onyomi: 'コウ (kou)',
    romaji: 'hikari',
    jlpt: 'N4',
    strokes: 6,
    radicals: ['⺌ (sparks)', '兀 (human legs)'],
    mnemonic: 'A person carrying a flaming torch aloft, spreading radiance in all directions.',
    examples: [
      { japanese: '希望の光', reading: 'きぼうの ひかり', meaning: 'Ray of hope.' },
      { japanese: '日光', reading: 'にっこう', meaning: 'Sunlight.' },
      { japanese: '光陰矢の如し', reading: 'こういん やのごとし', meaning: 'Time flies like an arrow.' }
    ]
  },
  {
    id: 'wa',
    kanji: '和',
    meaning: 'Harmony / Japanese style / Peace',
    kunyomi: 'やわ-らぐ (yawaragu), なご-む (nagomu)',
    onyomi: 'ワ (wa), オ (o)',
    romaji: 'wa',
    jlpt: 'N3',
    strokes: 8,
    radicals: ['禾 (grain)', '口 (mouth)'],
    mnemonic: 'Sharing grain (禾) through every mouth (口) brings peace and harmony to all.',
    examples: [
      { japanese: '和風', reading: 'わふう', meaning: 'Japanese style.' },
      { japanese: '平和', reading: 'へいわ', meaning: 'Peace.' },
      { japanese: '和食', reading: 'わしょく', meaning: 'Traditional Japanese cuisine.' }
    ]
  },
  {
    id: 'hi',
    kanji: '日',
    meaning: 'Day / Sun / Japan',
    kunyomi: 'ひ (hi), -び (-bi), -か (-ka)',
    onyomi: 'ニチ (nichi), ジツ (jitsu)',
    romaji: 'hi',
    jlpt: 'N5',
    strokes: 4,
    radicals: ['日 (sun)'],
    mnemonic: 'The circle of the radiant sun with a solar flare in its center.',
    examples: [
      { japanese: '日本', reading: 'にほん', meaning: 'Japan.' },
      { japanese: '毎日', reading: 'まいにち', meaning: 'Every day.' },
      { japanese: '日曜日', reading: 'にちようび', meaning: 'Sunday.' }
    ]
  },
  {
    id: 'mizu',
    kanji: '水',
    meaning: 'Water',
    kunyomi: 'みず (mizu)',
    onyomi: 'スイ (sui)',
    romaji: 'mizu',
    jlpt: 'N5',
    strokes: 4,
    radicals: ['水 (water)'],
    mnemonic: 'A flowing river stream with splashes of water droplets on each side.',
    examples: [
      { japanese: '冷たい水', reading: 'つめたい みず', meaning: 'Cold water.' },
      { japanese: '水曜日', reading: 'すいようび', meaning: 'Wednesday.' },
      { japanese: '水泳', reading: 'すいえい', meaning: 'Swimming.' }
    ]
  },
  {
    id: 'yama',
    kanji: '山',
    meaning: 'Mountain',
    kunyomi: 'やま (yama)',
    onyomi: 'サン (san), ザン (zan)',
    romaji: 'yama',
    jlpt: 'N5',
    strokes: 3,
    radicals: ['山 (mountain)'],
    mnemonic: 'Three towering mountain peaks rising toward the heavens.',
    examples: [
      { japanese: '富士山', reading: 'ふじさん', meaning: 'Mount Fuji.' },
      { japanese: '山登り', reading: 'やまのぼり', meaning: 'Mountain climbing.' },
      { japanese: '火山', reading: 'かざん', meaning: 'Volcano.' }
    ]
  },
  {
    id: 'kawa',
    kanji: '川',
    meaning: 'River / Stream',
    kunyomi: 'かわ (kawa)',
    onyomi: 'セン (sen)',
    romaji: 'kawa',
    jlpt: 'N5',
    strokes: 3,
    radicals: ['川 (river)'],
    mnemonic: 'Three meandering river currents flowing downstream.',
    examples: [
      { japanese: '小川', reading: 'おがわ', meaning: 'Brook / Stream.' },
      { japanese: '河川', reading: 'かせん', meaning: 'Rivers / Waterways.' }
    ]
  },
  {
    id: 'sora',
    kanji: '空',
    meaning: 'Sky / Empty / Void',
    kunyomi: 'そら (sora), あ-く (a-ku)',
    onyomi: 'クウ (kuu)',
    romaji: 'sora',
    jlpt: 'N4',
    strokes: 8,
    radicals: ['穴 (cave/hole)', '工 (craft)'],
    mnemonic: 'A vaulted cave opening up into the boundless open sky.',
    examples: [
      { japanese: '青空', reading: 'あおぞら', meaning: 'Blue sky.' },
      { japanese: '空気', reading: 'くうき', meaning: 'Air / Atmosphere.' },
      { japanese: '空港', reading: 'くうこう', meaning: 'Airport.' }
    ]
  },
  {
    id: 'kaze',
    kanji: '風',
    meaning: 'Wind / Breeze / Style',
    kunyomi: 'かぜ (kaze)',
    onyomi: 'フウ (fuu)',
    romaji: 'kaze',
    jlpt: 'N4',
    strokes: 9,
    radicals: ['几 (enclosure)', '虫 (insect)'],
    mnemonic: 'Insects carried effortlessly upon gusting wind currents.',
    examples: [
      { japanese: '春風', reading: 'はるかぜ', meaning: 'Spring breeze.' },
      { japanese: '台風', reading: 'たいふう', meaning: 'Typhoon.' },
      { japanese: '和風', reading: 'わふう', meaning: 'Japanese style.' }
    ]
  },
  {
    id: 'ame',
    kanji: '雨',
    meaning: 'Rain',
    kunyomi: 'あめ (ame), あま- (ama-)',
    onyomi: 'ウ (u)',
    romaji: 'ame',
    jlpt: 'N5',
    strokes: 8,
    radicals: ['雨 (rain)'],
    mnemonic: 'Clouds hovering over the horizon dropping four raindrops.',
    examples: [
      { japanese: '大雨', reading: 'おおあめ', meaning: 'Heavy rain.' },
      { japanese: '雨季', reading: 'うき', meaning: 'Rainy season.' }
    ]
  },
  {
    id: 'gaku',
    kanji: '学',
    meaning: 'Study / Learn / Science',
    kunyomi: 'まな-ぶ (mana-bu)',
    onyomi: 'ガク (gaku)',
    romaji: 'gaku',
    jlpt: 'N5',
    strokes: 8,
    radicals: ['冖 (crown)', '子 (child)'],
    mnemonic: 'A child (子) under a roof gaining wisdom and knowledge.',
    examples: [
      { japanese: '学生', reading: 'がくせい', meaning: 'Student.' },
      { japanese: '大学', reading: 'だいがく', meaning: 'University.' },
      { japanese: '学校', reading: 'がっこう', meaning: 'School.' }
    ]
  },
  {
    id: 'yume',
    kanji: '夢',
    meaning: 'Dream / Vision',
    kunyomi: 'ゆめ (yume)',
    onyomi: 'ム (mu)',
    romaji: 'yume',
    jlpt: 'N3',
    strokes: 13,
    radicals: ['艹 (grass)', '罒 (net)', '夕 (evening)'],
    mnemonic: 'In the quiet evening (夕), your resting eyes envision distant dreams.',
    examples: [
      { japanese: '夢を見る', reading: 'ゆめを みる', meaning: 'To have a dream.' },
      { japanese: '夢中', reading: 'むちゅう', meaning: 'Absorbed / Entranced.' },
      { japanese: '悪夢', reading: 'あくむ', meaning: 'Nightmare.' }
    ]
  }
];
