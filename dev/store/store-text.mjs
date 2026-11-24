// The store texts of the pirith apps: Google Play (play-listing.mjs: en-US and si-LK) and the App Store
// (asc-listing.mjs: en-US only - the App Store has no Sinhala locale and allows no Sinhala letters in en-US).
import { piriths } from '../../src/catalog.js'

const N = piriths.length

export const play = {
  'en-US': {
    title: 'Pirith - Paritta Chanting',
    shortDescription: `${N} Paritta chants with the Pali text and its meaning, word by word. Offline.`,
    fullDescription: `Buddhist Paritta (Pirith) chanting from the Sri Lankan tradition, by the Most Venerable Nauyane Ariyadhamma Maha Thero. Read the Pali text with its meaning while you listen: the line and the Pali word being chanted are highlighted, so it is easy to follow and to learn.

${N} chants, all of them inside the app - no internet connection is needed.

It has all the chants of the 'Piruwana Poth Wahanse' (The Book of Protection) and several other important suttas:
• Maha Mangala, Ratana and Karaniya Metta Suttas
• Bojjhanga, Mora, Canda, Suriya, Khandha, Dhajagga and Angulimala Parittas
• Dhammacakkappavattana, Maha Samaya, Girimananda, Isigili and Atanatiya Suttas
• Jaya Mangala Gatha, Jinapanjara, Atavisi Piritha, Samantha Patthana and more
• Seevali Piritha, Jalanandana Piritha and Ratanamali Yantra

Suitable to be played and recited for:
• Pregnant mothers seeking blessings
• Those recovering from illnesses
• Students preparing for exams
• Special life milestones and events
• Bodhi Poojas and daily chanting at homes or temples

Features:
• Meaning while you listen: Pali text and meaning side by side, in Sinhala or English. Tap any line to listen from there.
• Plays with the screen off: pause, resume and skip from the lock screen, the notification or your headset.
• Playlists: keep your own lists of chants and arrange their order.
• Repeat counts: repeat a chant 3, 7, 21 or 108 times.
• Playback speed and a sleep timer.
• Search by name in Sinhala, Singlish or English.
• Dark mode and adjustable text size.
• Fully offline.

The same chants are at https://pitaka.lk/pirith/

Please share this app with your parents, elders, and forest-dwelling monks who may not have internet access, as a gift of Dhamma (Dhammadana).

May this effort be a tribute to the venerable Nauyane Ariyadhamma Thero. If you find this app helpful, please encourage us with a 5-star review!`,
  },
  'si-LK': {
    title: 'Pirith - සෙත් පිරිත්',
    shortDescription: `සෙත් පිරිත් ${N} ක් පාලි පෙළ සහ පදයෙන් පදය සිංහල තේරුම සමඟ, offline අසන්න.`,
    fullDescription: `ආරක්ෂක පිරිත් පදයෙන් පදය සිංහල අර්ථ සහිතව, අතිපූජ්‍ය නාඋයනේ අරියධම්ම මහා ස්වාමීන් වහන්සේගේ කටහඬින්. පිරිත අසන අතරම පාලි පෙළ සහ එහි තේරුම කියවන්න - සජ්ඣායනා වන පේළිය සහ පාලි වචනය ඉස්මතු වී පෙනේ.

පිරිත් ${N} ක්ම යෙදුම තුළම ඇති නිසා අන්තර්ජාලය නොමැතිව (offline) ඇසිය හැක.

පිරුවානා පොත් වහන්සේ තුළ ඇතුළත් සියලු පිරිත් ද ඊට අමතර සූත්‍ර කිහිපයක් ද ඇතුළත් වේ:
 - මහා මංගල, රතන, කරණීය මෙත්ත සූත්‍ර
 - බොජ්ඣංග, මෝර, චන්ද, සූරිය, ඛන්ධ, ධජග්ග, අංගුලිමාල පිරිත්
 - ධම්මචක්කප්පවත්තන, මහා සමය, ගිරිමානන්ද, ඉසිගිලි, ආටානාටිය සූත්‍ර
 - ජයමංගල ගාථා, ජිනපඤ්ජරය, අටවිසි පිරිත, සමන්ත පට්ඨානය ආදිය
 - සීවලී පිරිත, ජලනන්දන පිරිත, රත්නමාලි ගාථා යන්ත්‍රය

ගැබිණි මාතාවන්ට, ලෙඩ රෝග සෑදුනු අයට, විභාග වලට මුහුණ දෙන දරුවන්ට, ජීවිතයේ විශේෂ අවස්ථාවන්ට, බෝධි පූජා සහ පන්සල් නිවෙස් වල දිනපතා සජ්ඣායනා කිරීමට සුදුසුයි.

විශේෂාංග:
 - අසන අතර තේරුම: පාලි පෙළ සහ තේරුම එක ළඟ, සිංහලෙන් හෝ ඉංග්‍රීසියෙන්. ඕනෑම පේළියක් මත තට්ටු කර එතැනින් අසන්න.
 - තිරය නිවී තිබියදීත් පිරිත ඇසේ: lock screen එකෙන්, notification එකෙන් හෝ headset එකෙන් නවත්වන්න, ඊළඟ පිරිතට යන්න.
 - ඔබට වැදගත් පිරිත් වෙනම පිරිත් ලැයිස්තු (playlists) ලෙස සකසා ගන්න, පිළිවෙල වෙනස් කරන්න.
 - පිරිතක් 3, 7, 21, 108 වාරයක් නැවත නැවත (repeat) අසන්න.
 - සජ්ඣායනා වේගය වෙනස් කරන්න, නින්දට පෙර නවතින ලෙස (sleep timer) සකසන්න.
 - පිරිතක නම සිංහලෙන් හෝ singlish අකුරෙන් සොයන්න.
 - රාත්‍රියට අඳුරු තිරය, ඔබට ගැලපෙන අකුරු ප්‍රමාණය.

https://pitaka.lk/pirith/ අන්තර්ජාල ලිපිනය තුළින් ද පිරිත් වලට සවන් දිය හැකිය.

හැකිතාක් ඔබගේ දෙමාපියන්ට සහ අන්තර්ජාල පහසුකම් නැති ආරණ්‍යවාසී භික්ෂූන් වහන්සේලාට ලබාදී ධර්මදානයට දායක වෙන්න.
මේ‍ ව්‍යායාමය නාඋයනේ අරියධම්ම හිමියන්ගේ ශ්‍රී නාමයට කෙරෙන උපහාරයක්ම වේවා. තරු පහක - 5 star review එකක් ලබාදී අපව දිරිමත් කරන්න.

Buddhist Paritta chanting from the Sri Lankan tradition, with the Pali text and its meaning highlighted as you listen.`,
  },
}

export const apple = {
  promotionalText: `${N} Paritta chants with the Pali text and its meaning, highlighted word by word as you listen. Fully offline.`,
  description: `Buddhist Paritta (Pirith) chanting from the Sri Lankan tradition, by the Most Venerable Nauyane Ariyadhamma Maha Thero. Read the Pali text with its meaning while you listen: the line and the Pali word being chanted are highlighted, so it is easy to follow and to learn.

${N} chants, all of them inside the app - no internet connection is needed.

It has all the chants of the 'Piruwana Poth Wahanse' (The Book of Protection) and several other important suttas:
- Maha Mangala, Ratana and Karaniya Metta Suttas
- Bojjhanga, Mora, Canda, Suriya, Khandha, Dhajagga and Angulimala Parittas
- Dhammacakkappavattana, Maha Samaya, Girimananda, Isigili and Atanatiya Suttas
- Jaya Mangala Gatha, Jinapanjara, Atavisi Piritha, Samantha Patthana and more
- Seevali Piritha, Jalanandana Piritha and Ratanamali Yantra

Features:
- Meaning while you listen: Pali text and meaning side by side, in Sinhala or English. Tap any line to listen from there.
- Plays with the screen locked: pause, resume and skip from the lock screen, Control Centre or your headphones.
- Playlists: keep your own lists of chants and arrange their order.
- Repeat counts: repeat a chant 3, 7, 21 or 108 times.
- Playback speed and a sleep timer.
- Search by name in Sinhala, Singlish or English.
- Dark mode and adjustable text size.

The same chants are at https://pitaka.lk/pirith/

Please share this app with your parents and elders as a gift of Dhamma (Dhammadana). May this effort be a tribute to the venerable Nauyane Ariyadhamma Thero.`,
  whatsNew: `Three chants you asked for in your reviews:
- Seevali Piritha
- Jalanandana Piritha
- Ratanamali Yantra
With the Pali text, its meaning in Sinhala and English, and the word being chanted highlighted. ${N} chants in all.`,
  keywords: 'Pirith,Paritta,Buddhist,chanting,Pali,Sinhala,Sri Lanka,Ariyadhamma,sutta,Theravada,metta,Buddha',
}

export const releaseNotes = {
  'en-US': `Three chants you asked for in your reviews:
• Seevali Piritha
• Jalanandana Piritha
• Ratanamali Yantra
With the Pali text, its meaning and the chanted word highlighted.`,
  'si-LK': `ඔබ ඉල්ලූ පිරිත් තුනක් එක් කළෙමු:
• සීවලී පිරිත
• ජලනන්දන පිරිත
• රත්නමාලි ගාථා යන්ත්‍රය
පාලි පෙළ, තේරුම සහ සජ්ඣායනා වන වචනය ඉස්මතු වීම සමඟ.`,
}
