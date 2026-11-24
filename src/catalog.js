/**
 * Catalog of all piriths and the recordings available for each.
 *
 * RULES
 * - The ORDER of `piriths` must never change: the array index (pInd) is stored in
 *   users' playlists and listening metrics. New piriths go at the END.
 * - `id` is also the URL (pages/<id>.html) and the audio file name. Do not rename
 *   an id that is already live - search engines rank those URLs.
 *
 * FIELDS
 *   id     file/url name
 *   si     Pali title in Sinhala script (what is chanted)
 *   pop    the name Sinhala speakers search for (පිරිත / සූත්‍රය form)
 *   roman  Pali title in Roman script with diacritics
 *   sg     "Singlish" spellings people type into Google - first one is shown in titles
 *   en     English meaning of the title
 *   cat    category key (see `categories`)
 *   rec    recordings: [speakerKey, 'm:ss'] - first one is the default.
 *          Audio lives at public/audio/<speaker>/<id>.m4a and timing at
 *          dev/data/timing/<speaker>/<N>-labels.txt. To add a speaker: add it to
 *          `speakers`, drop the audio + labels in those folders and add a `rec` entry.
 *
 * Audio note: VBR mp3 drifts when seeking, so the originals were converted with
 *   for f in *.mp3; do afconvert -f m4af -d aach -b 24000 -c 1 "$f" "${f%.mp3}.m4a"; done
 */
export const speakers = {
  ariyadhamma: {
    si: 'නාඋයනේ අරියධම්ම ථෙරෝ',
    en: 'Nauyane Ariyadhamma Thero',
    artwork: [128, 256, 512], // public/artwork/<speaker>-<size>.png
  },
  // chants from other sources where the chanting monk is not named (the recordings are of pirith.org).
  // artwork: a Dhammacakka, dev/store/dhammachakka.mjs. siBy: "<whose> සජ්ඣායනය" when ගේ does not fit
  pitaka: {
    si: 'pitaka.lk',
    en: 'pitaka.lk',
    siBy: 'pitaka.lk වෙබ් අඩවියේ',
    artwork: [128, 256, 512],
  },
}

export const categories = {
  basic: { si: 'මූලික', en: 'Basics' },
  paritta: { si: 'පිරිත්', en: 'Protections' },
  sutta: { si: 'සූත්‍ර', en: 'Discourses' },
  gatha: { si: 'ගාථා', en: 'Verses' },
}

const A = 'ariyadhamma'
const P = (id, si, pop, roman, sg, en, cat, dur) => ({ id, si, pop, roman, sg, en, cat, rec: [[A, dur]] })

export const piriths = [
  P('02-saranagamanam', 'සරණාගමනං', 'තිසරණය', 'Saraṇāgamanaṃ', ['Tisarana', 'Saranagamanaya', 'Thisarana'], 'Going for Refuge', 'basic', '1:41'),
  P('03-dasasikkhapadani', 'දස සික්ඛාපදානි', 'දස සිල්', 'Dasa Sikkhāpadāni', ['Dasa Sil', 'Dasa Sikkhapada'], 'The Ten Precepts', 'basic', '1:48'),
  P('04-samanera-panha', 'සාමණේර පඤ්හො', 'සාමණේර ප්‍රශ්න', 'Sāmaṇera Pañho', ['Samanera Prashna', 'Samanera Panha'], "The Novice's Questions", 'basic', '1:53'),
  P('05-dvattimsakaraya', 'ද්වත්තිංසාකාරො', 'දෙතිස් කුණප කොටස්', 'Dvattiṃsākāro', ['Dethis Kunapa', 'Dvattimsakara'], 'The Thirty-two Parts of the Body', 'basic', '1:09'),
  P('06-paccavekkhana', 'පච්චවෙක්ඛණා', 'ප්‍රත්‍යවේක්ෂාව', 'Paccavekkhaṇā', ['Prathyaweksha', 'Paccavekkhana'], 'The Four Reflections', 'basic', '3:24'),
  P('07-dasadhamma', 'දසධම්ම සුත්තං', 'දසධම්ම සූත්‍රය', 'Dasadhamma Suttaṃ', ['Dasa Dhamma Suthraya'], 'Discourse on the Ten Dhammas', 'sutta', '5:24'),
  P('08-mahamangala', 'මහා මඞ්ගල සුත්තං', 'මහා මංගල සූත්‍රය', 'Mahā Maṅgala Suttaṃ', ['Maha Mangala Suthraya', 'Mangala Sutta'], 'The Great Discourse on Blessings', 'sutta', '5:46'),
  P('09-rathana', 'රතන සුත්තං', 'රතන සූත්‍රය', 'Ratana Suttaṃ', ['Rathana Suthraya', 'Ratana Sutta'], 'The Jewel Discourse', 'sutta', '10:21'),
  P('10-karaniya', 'කරණීය මෙත්ත සුත්තං', 'කරණීය මෙත්ත සූත්‍රය', 'Karaṇīya Metta Suttaṃ', ['Karaniya Meththa Suthraya', 'Karaneeya Metta Sutta'], 'Discourse on Loving-kindness', 'sutta', '4:02'),
  P('11-khandha-parittam', 'ඛන්ධ පරිත්තං', 'ඛන්ධ පිරිත', 'Khandha Parittaṃ', ['Khanda Piritha', 'Kanda Piritha'], 'The Khandha Protection', 'paritta', '6:50'),
  P('12-mettanisamsa', 'මෙත්තානිසංස සුත්තං', 'මෙත්තානිසංස සූත්‍රය', 'Mettānisaṃsa Suttaṃ', ['Meththanisansa Suthraya'], 'The Benefits of Loving-kindness', 'paritta', '3:33'),
  P('13-mittanisamsa', 'මිත්තානිසංස සුත්තං', 'මිත්තානිසංස සූත්‍රය', 'Mittānisaṃsa Suttaṃ', ['Miththanisansa Suthraya'], 'The Benefits of Friendship', 'paritta', '3:27'),
  P('14-mora-parittam', 'මොර පරිත්තං', 'මෝර පිරිත', 'Mora Parittaṃ', ['Mora Piritha'], "The Peacock's Protection", 'paritta', '2:25'),
  P('15-canda-parittam', 'චන්ද පරිත්තං', 'චන්ද පිරිත', 'Canda Parittaṃ', ['Chanda Piritha'], 'The Moon Protection', 'paritta', '3:26'),
  P('16-suriya-parittam', 'සූරිය පරිත්තං', 'සූරිය පිරිත', 'Suriya Parittaṃ', ['Suriya Piritha', 'Sooriya Piritha'], 'The Sun Protection', 'paritta', '3:40'),
  P('17-dhajagga-parittam', 'ධජග්ග පරිත්තං', 'ධජග්ග පිරිත', 'Dhajagga Parittaṃ', ['Dajagga Piritha', 'Dhajagga Suthraya'], 'The Banner Protection', 'paritta', '11:13'),
  P('18-kassapa-bojjhanga', 'මහා කස්සප බොජ්ඣංග සුත්තං', 'මහා කස්සප බොජ්ඣංග පිරිත', 'Mahā Kassapa Bojjhaṅga Suttaṃ', ['Maha Kassapa Bojjanga Piritha'], 'Factors of Enlightenment – to Maha Kassapa', 'paritta', '7:05'),
  P('19-moggallana-bojjhanga', 'මහා මොග්ගල්ලාන බොජ්ඣංග සුත්තං', 'මහා මොග්ගල්ලාන බොජ්ඣංග පිරිත', 'Mahā Moggallāna Bojjhaṅga Suttaṃ', ['Maha Moggallana Bojjanga Piritha'], 'Factors of Enlightenment – to Maha Moggallana', 'paritta', '7:03'),
  P('20-chunda-bojjhanga', 'මහා චුන්ද බොජ්ඣංග සුත්තං', 'මහා චුන්ද බොජ්ඣංග පිරිත', 'Mahā Cunda Bojjhaṅga Suttaṃ', ['Maha Chunda Bojjanga Piritha'], 'Factors of Enlightenment – by Maha Cunda', 'paritta', '6:53'),
  P('21-girimananda-suttam', 'ගිරිමානන්ද සුත්තං', 'ගිරිමානන්ද සූත්‍රය', 'Girimānanda Suttaṃ', ['Girimananda Suthraya', 'Girimananda Piritha'], 'Discourse to Girimananda', 'sutta', '24:11'),
  P('22-isigili-suttam', 'ඉසිගිලි සුත්තං', 'ඉසිගිලි සූත්‍රය', 'Isigili Suttaṃ', ['Isigili Suthraya'], 'The Isigili Discourse', 'sutta', '16:23'),
  P('23-dhammacakkappavattana', 'ධම්මචක්කප්පවත්තන සුත්තං', 'ධම්මචක්ක පවත්තන සූත්‍රය', 'Dhammacakkappavattana Suttaṃ', ['Dhammachakka Pawaththana Suthraya', 'Dhamsak Pawathum Suthraya'], 'Setting in Motion the Wheel of Dhamma', 'sutta', '24:28'),
  P('24-mahasamaya-suttam', 'මහාසමය සුත්තං', 'මහා සමය සූත්‍රය', 'Mahāsamaya Suttaṃ', ['Maha Samaya Suthraya'], 'The Great Assembly', 'sutta', '30:17'),
  P('25-alavaka-suttam', 'ආළවක සුත්තං', 'ආලවක සූත්‍රය', 'Āḷavaka Suttaṃ', ['Alawaka Suthraya'], 'Discourse to Alavaka', 'sutta', '9:40'),
  P('26-kasibharadvaja-suttam', 'කසිභාරද්වාජ සුත්තං', 'කසීභාරද්වාජ සූත්‍රය', 'Kasibhāradvāja Suttaṃ', ['Kasi Bharadwaja Suthraya'], 'Discourse to Kasi Bharadvaja', 'sutta', '11:49'),
  P('27-parabhava-suttam', 'පරාභව සුත්තං', 'පරාභව සූත්‍රය', 'Parābhava Suttaṃ', ['Parabhawa Suthraya'], 'Discourse on Downfall', 'sutta', '10:00'),

  P('28-aggika-bharadvaja-suttam', 'අග්ගික භාරද්වාජ සුත්තං', 'වසල සූත්‍රය', 'Aggika Bhāradvāja Suttaṃ', ['Wasala Suthraya', 'Aggika Bharadwaja Suthraya'], 'Discourse on the Outcast', 'sutta', '14:22'),
  P('29-saccavibhanga-suttam', 'සච්චවිභඞ්ග සුත්තං', 'සච්චවිභංග සූත්‍රය', 'Saccavibhaṅga Suttaṃ', ['Sachcha Vibhanga Suthraya'], 'Analysis of the Truths', 'sutta', '30:31'),
  P('30-atanatiya-suttam-1', 'ආටානාටිය සුත්තං 1', 'ආටානාටිය සූත්‍රය 1', 'Āṭānāṭiya Suttaṃ 1', ['Atanatiya Suthraya 1', 'Atanatiya Piritha'], 'The Atanatiya Protection – Part 1', 'sutta', '41:02'),
  P('32-atanatiya-suttam-2', 'ආටානාටිය සුත්තං 2', 'ආටානාටිය සූත්‍රය 2', 'Āṭānāṭiya Suttaṃ 2', ['Atanatiya Suthraya 2', 'Atanatiya Piritha'], 'The Atanatiya Protection – Part 2', 'sutta', '48:55'),
  P('35-tesattati-nyana-parittam', 'තෙසත්තති ඤාණ පරිත්තං', 'තෙසැත්තෑ ඤාණ පිරිත', 'Tesattati Ñāṇa Parittaṃ', ['Thesaththa Gnana Piritha', 'Tesattati Nana'], 'The Seventy-three Knowledges', 'paritta', '58:26'),

  P('50-angulimala', 'අංගුලිමාල පරිත්තං', 'අංගුලිමාල පිරිත', 'Aṅgulimāla Parittaṃ', ['Angulimala Piritha'], "Angulimala's Protection", 'paritta', '2:03'),
  P('51-atavisi', 'අටවිසි පරිත්තං', 'අටවිසි පිරිත', 'Aṭavisi Parittaṃ', ['Atavisi Piritha', 'Atawisi Piritha'], 'Protection of the Twenty-eight Buddhas', 'paritta', '2:08'),
  P('52-wattaka', 'වට්ටක පරිත්තං', 'වට්ටක පිරිත', 'Vaṭṭaka Parittaṃ', ['Wattaka Piritha'], "The Quail's Protection", 'paritta', '2:01'),
  P('53-jaya-mangala-attha-gatha', 'ජය මංගල අට්ඨ ගාථා', 'ජයමංගල ගාථා', 'Jaya Maṅgala Aṭṭha Gāthā', ['Jayamangala Gatha', 'Jaya Mangala Gatha'], 'Eight Verses of Joyous Victory', 'gatha', '4:46'),
  P('54-narasiha-gatha', 'නරසීහ ගාථා', 'නරසීහ ගාථා', 'Narasīha Gāthā', ['Narasiha Gatha'], 'Verses on the Lion of Men', 'gatha', '3:21'),
  P('55-maha-jaya-mangala-gatha', 'මහා ජයමංගල ගාථා', 'මහා ජයමංගල ගාථා', 'Mahā Jayamaṅgala Gāthā', ['Maha Jayamangala Gatha', 'Maha Karuniko Natho'], 'Great Verses of Joyous Victory', 'gatha', '5:34'),
  P('56-jaya-parittam', 'ජය පරිත්තං', 'ජය පිරිත', 'Jaya Parittaṃ', ['Jaya Piritha'], 'The Victory Protection', 'paritta', '3:22'),
  P('57-jvara-parittam', 'ජ්වර පරිත්තං', 'ජ්වර පිරිත', 'Jvara Parittaṃ', ['Jwara Piritha'], 'Protection against Fever', 'paritta', '15:52'),
  P('58-antharaya-nivarana-parittam', 'අන්තරාය නිවාරණ පරිත්තං', 'අන්තරාය නිවාරණ පිරිත', 'Antarāya Nivāraṇa Parittaṃ', ['Antharaya Niwarana Piritha'], 'The Protection that Averts Dangers', 'paritta', '0:53'),
  P('59-jinapanjara-parittam', 'ජිනපඤ්ජර පරිත්තං', 'ජිනපඤ්ජර පිරිත', 'Jinapañjara Parittaṃ', ['Jinapanjara Piritha'], "The Victor's Cage", 'paritta', '6:10'),
  P('60-dasa-disa-parittam', 'දස දිසා පරිත්තං', 'දස දිසා පිරිත', 'Dasa Disā Parittaṃ', ['Dasa Disa Piritha'], 'Protection of the Ten Directions', 'paritta', '1:30'),
  P('61-bojjhanga-parittam', 'බොජ්ඣංග පරිත්තං', 'බොජ්ඣංග පිරිත', 'Bojjhaṅga Parittaṃ', ['Bojjanga Piritha'], 'The Factors of Enlightenment Protection', 'paritta', '3:18'),
  P('62-samantha-pattana', 'සමන්ත පට්ඨානය', 'සමන්ත පට්ඨාන සූත්‍රය', 'Samanta Paṭṭhānaṃ', ['Samantha Pattana Suthraya', 'Pattana Suthraya', 'Pattana Piritha', 'Pattanaya'], 'The Great Book of Conditional Relations', 'sutta', '40:48'),
  // source mp3 of pirith.org: the talk at the start (21.5s) removed and played 1.1x faster to match the other chants
  { ...P('63-jalanandana-parittam', 'ජලනන්දන පරිත්තං', 'ජලනන්දන පිරිත', 'Jalanandana Parittaṃ', ['Jalanandana Piritha', 'Jala Nandana Piritha'], 'The Jalanandana Protection', 'paritta', '2:48'), rec: [['pitaka', '2:48']] },
  // source mp3 of pirith.org (SeevaliePiritha.mp3): the talk at the start (48.7s) removed, played 1.1x faster
  { ...P('64-seevali-parittam', 'සීවලී පරිත්තං', 'සීවලී පිරිත', 'Sīvalī Parittaṃ', ['Seevali Piritha', 'Sivali Piritha', 'Seewali Piritha'], 'The Sivali Protection', 'paritta', '10:15'), rec: [['pitaka', '10:15']] },
  // source mp3 of pirith.org (RathaMaleeYanthra.mp3): the talk at the start (81.8s) and the spoken wish at the end removed, played 1.1x faster
  { ...P('65-ratanamali-yantra', 'රතනමාලී යන්ත්‍රය', 'රත්නමාලි ගාථා යන්ත්‍රය', 'Ratanamālī Yantra', ['Rathnamali Yanthraya', 'Rathnamali Gatha', 'Ratnamali Yantra'], 'The Garland of Jewels', 'gatha', '2:55'), rec: [['pitaka', '2:55']] },
]

export const pirithById = Object.fromEntries(piriths.map((p, pInd) => [p.id, { ...p, pInd }]))

/** number used in dev/data file names: '08-mahamangala' -> 8 */
export const fileNum = (id) => Number(id.split('-')[0])

export const durationSecs = (dur) => dur.split(':').reduce((s, n) => s * 60 + Number(n), 0)

/** the recording to play for a pirith - preferred speaker if it has one, else the first */
export function recordingOf(p, preferredSpeaker) {
  const rec = p.rec.find(r => r[0] === preferredSpeaker) || p.rec[0]
  return { speaker: rec[0], dur: rec[1], audio: `audio/${rec[0]}/${p.id}.m4a` }
}

/** localized display fields */
export function titleOf(p, locale) {
  return locale === 'en' ? p.roman : p.si
}
export function subtitleOf(p, locale) {
  return locale === 'en' ? p.en : (p.pop !== p.si ? p.pop : '')
}
