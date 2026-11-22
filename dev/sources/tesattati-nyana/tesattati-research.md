# Tesattati Ñāṇa Parittaṃ (Ven. Nauyane Ariyadhamma, 58:26) - text research

## Conclusion (high confidence on structure, medium on exact spelling of some item names)

The chant is NOT a plain reading of the Paṭisambhidāmagga mātikā. It is a "Buddha-guṇa" style litany:
each of the 73 knowledges is put into a fixed five-sentence formula, followed by one summary block
for "tesattati ñāṇa" and then standard closing blessing verses. No Namo tassa / intro: the track
starts directly with item 1.

Per-item formula (X = short name of the knowledge = the last phrase of the mātikā item, e.g. `සුතමයෙ`):

    සො භගවා ඉතිපි X ඤාණෙන සමන්නාගතො.
    X ඤාණෙන සමන්නාගතො වත සො භගවා.
    තං භගවන්තං X ඤාණෙන සමන්නාගතං සරණං ගච්ඡාමි.
    තං භගවන්තං X ඤාණෙන සමන්නාගතං සිරසා නමාමි.
    තෙන X ඤාණතෙජසා සොත්ථි තෙ හොතු සබ්බදා.

Only the short name is chanted (e.g. "sutamaye ñāṇena", not "sotāvadhāne paññā sutamaye ñāṇena").

### Evidence
1. Published text with exactly this formula: https://paritha.org/?p=2814 ("බුදුගුණ පිරිත", with a section headed
   "තෙසැත්තාඤාණ පිරිත"). It gives the nine Buddha qualities in the formula, then dasabala, catuvesārajja, and then
   knowledges from `දුක්ඛෙඤාණෙන සමන්නාගතො` to `අනාවරණඤාණෙන සමන්නාගතො` (i.e. only the last ~18 of the 73, an abridged
   version; spelling on that page is loose). Refrain there: `තේන ... ඤාණ තෙජසා සොත්ථිතෙ හොතු සබ්බදා`.
2. The local audio itself (/Volumes/2TB/node/pirith/public/audio/ariyadhamma/35-tesattati-nyana-parittam.m4a). I ran a
   greedy CTC decode with the project's own MMS forced-alignment model (dev/align/.venv, torchaudio MMS_FA) to get a
   rough romanised phonetic transcript: /private/tmp/claude-501/-Volumes-2TB-node-pirith/e321b957-ca5d-4bf9-8026-ca4dbc77f49c/scratchpad/decode-full.txt (20 s per line). Example, 0:00-0:40:
   "so bagewa itipi sutemeyi nya ni nesamanna [geto] ... wate so bagewa tangbagewantan ... sarenangga cya mi
   tangbagewantang sutemeyi nyahane nesamanna getang siresa nama mi te ne sutemeyi nahane tejesa so tite ho tu sambeda".
   The same frame is heard for every item; item names heard in order match the mātikā order 1..73.
3. http://aagiyakatha.blogspot.com/2011/09/blog-post_25.html (2011 blog on the "තෙසැත්තෑ ඤාණ බුද්ධ පූජා") says the practice
   was popularised by Ven. Nauyane Ariyadhamma and his circle, lists the 73 mātikā items as what is recited, and ends
   with `ඉමෙහි තෙසත්තතියා ඤාණෙහි සමන්නාගතං සම්මාසම්බුද්ධං තං සිරසා නමාමි` (a pūjā variant, not the recorded paritta wording).

### Structure and timings heard in the recording
- 0:00 - ~52:20: 73 blocks, about 40-45 s each (item starts roughly: 1 0:00, 2 0:40, 3 1:20, 4 2:00, 5 2:40, 6 3:20,
  7 4:00, 8 4:40, 9 5:20, 10 6:00, 11 6:40, 12 7:20, 13 8:10, 14 8:50, 15 9:35, 16 10:15, ... 56 39:10, 57 39:45,
  58 40:25, 59 41:05, 60 41:45, ... 72 51:00, 73 51:40).
- ~52:25 - 53:05: summary block, same formula with X = `තෙසත්තති` ("so bhagavā itipi tesattati ñāṇena samannāgato ...
  tena tesattati ñāṇatejasā sotthi te hotu sabbadā").
- ~53:05 - 58:26 closing verses (standard paritta endings, identified from the phonetic decode):
  - `සබ්බීතියො විවජ්ජන්තු සබ්බරොගො විනස්සතු, මා තෙ භවත්වන්තරායො සුඛී දීඝායුකො භව`
  - `භවතු සබ්බමඞ්ගලං රක්ඛන්තු සබ්බදෙවතා, සබ්බබුද්ධානුභාවෙන සදා සොත්ථි භවන්තු තෙ` (x3: buddha / dhamma / saṅgha)
  - `නක්ඛත්තයක්ඛභූතානං පාපග්ගහනිවාරණා, පරිත්තස්සානුභාවෙන හන්තු තෙසං උපද්දවෙ`
  - `යං දුන්නිමිත්තං අවමඞ්ගලඤ්ච ... බුද්ධානුභාවෙන විනාසමෙන්තු` (x3: buddha / dhamma / saṅgha)
  - `දුක්ඛප්පත්තා ච නිද්දුක්ඛා ... හොන්තු සබ්බෙපි පාණිනො`
  - `එත්තාවතා ච අම්හෙහි සම්භතං පුඤ්ඤසම්පදං ...`, `දානං දදන්තු සද්ධාය ...`
  - `සබ්බෙ බුද්ධා බලප්පත්තා ... රක්ඛං බන්ධාමි සබ්බසො` (x3)
  - `ආකාසට්ඨා ච භුම්මට්ඨා දෙවා නාගා මහිද්ධිකා, පුඤ්ඤං තං අනුමොදිත්වා චිරං රක්ඛන්තු ...` (x3-4: sāsanaṃ / desanaṃ / maṃ paraṃ ...)
  - `බුද්ධං සුද්ධගුණාකරං දසබලං දෙවාතිදෙවං ජිනං ... පාලෙන්තු ... සදා` then `සාධු සාධු සාධු`.
  Exact wording/variants of these closing verses should be taken from the project's existing texts and checked by ear.

### Word count vs duration
- 73 blocks generated from the mātikā names: 2,424 words (about 33 per block) - draft at /private/tmp/claude-501/-Volumes-2TB-node-pirith/e321b957-ca5d-4bf9-8026-ca4dbc77f49c/scratchpad/reconstructed-draft.txt
- + summary block (~33) + closing verses (~180-200) = about 2,650 words.
- 58.4 min -> about 45 words/min. Reference: Mahāsamaya ~1,300 words in 30:17 = 43 words/min. Consistent.

### Uncertain points (need listening / forced-alignment check)
- Exact form of X for compound items. Heard forms suggest: 32 `ආනන්තරිකසමාධිම්හි` (not the BJT `සමාධිස්මිං`), 70 `යමකපාටිහාරියෙ`
  (BJT has `යමකපාටිහීරෙ`), 68 `ඉන්ද්රියපරොපරියත්තෙ ඤාණෙන`, 69 unclear whether `සත්තානං` is chanted before `ආසයානුසයෙ`.
  Items 4, 10, 13, 40, 41, 51-54, 72, 73 have stem-form names (`ධම්මට්ඨිති ඤාණෙන`, `ගොත්රභූ`, `විමුත්ති`, `දස්සනවිසුද්ධි`, `ඛන්ති`,
  `සොතධාතුවිසුද්ධි`, `චෙතොපරිය`, `පුබ්බෙනිවාසානුස්සති`, `දිබ්බචක්ඛු`, `සබ්බඤ්ඤුත`, `අනාවරණ`).
- Short a / e cannot be told apart in the phonetic decode, so "sutamaye ñāṇena" vs "sutamayañāṇena" rests on the paritha.org
  spelling (`දුක්ඛෙඤාණෙන`) and the locative forms heard in e.g. `saṅkhārupekkhāsu`, `paṭipadāya`.
- The tejasā line: heard as "tena X ñāṇa-tejasā"; paritha.org prints `තේන X ඤාණ තෙජසා`.
- No complete printed text of the full 73-item version was found online.

## 1. Local check
- File: /Volumes/2TB/node/tipitaka.lk/public/static/text/kn-ps.json (Paṭisambhidāmagga, Mahāvagga, Ñāṇakathā, heading `මාතිකා`).
- Location: pages[0].pali.entries[9] (item 1) to pages[3].pali.entries[15] (item 73); closing sentence pages[3].pali.entries[16];
  `මාතිකා නිට්ඨිතා.` at pages[3].entries[17]. Items per page index: p0 = 1-13, p1 = 14-37, p2 = 38-57, p3 = 58-73.
- Word count: 73 items = 305 words (numbers and footnote markers removed); closing sentence 13 words; total 318.
- Footnote variants of interest: 13 `ඡින්නවටුමානුපස්සනෙ` (මඡසං); 14 `සමුපාගතෙ`, `විපස්සනෙ`; 24 `ඵස්සනට්ඨෙ`; 32 `සමාධිම්හි` (මඡසං, ස්‍යා);
  68 `ඉන්ද්‍රියපරොපරියත්තෙ ඤාණං`; closing `සාවකෙහීති`.
- /Volumes/2TB/node/pirith/dev/sources/PirithPotha_160_240.txt and Gatha_Saha_Pirith.txt: no hits for `තෙසත්තති`, `තෙසැත්තෑ`, `ඤාණ පරිත්ත`.
- Project catalog entry: /Volumes/2TB/node/pirith/src/catalog.js line 76 (`35-tesattati-nyana-parittam`, 58:26).

### Mātikā text (BJT, footnote markers removed)

1. සොතාවධානෙ පඤ්ඤා සුතමයෙ ඤාණං.
2. සුත්වාන සංවරෙ පඤ්ඤා සීලමයෙ ඤාණං.
3. සංවරිත්වා සමාදහනෙ පඤ්ඤා සමාධිභාවනාමයෙ ඤාණං.
4. පච්චයපරිග්ගහෙ පඤ්ඤා ධම්මට්ඨිති ඤාණං.
5. අතීතානාගතපච්චුප්පන්නානං ධම්මානං සඞ්ඛිපිත්වා වවත්ථානෙ පඤ්ඤා සම්මසනෙ ඤාණං.
6. පච්චුප්පන්නානං ධම්මානං විපරිනාමානුපස්සනෙ පඤ්ඤා උදයබ්බයානුපස්සනෙ ඤාණං.
7. ආරම්මණං පටිසඞ්ඛා භඞ්ගානුපස්සනෙ පඤ්ඤා විපස්සනෙ ඤාණං.
8. භයතුපට්ඨානෙ පඤ්ඤා ආදීනවෙ ඤාණං.
9. මුඤ්චිතුකම්යතාපටිසඞ්ඛාසන්තිට්ඨනා පඤ්ඤා සඞ්ඛාරුපෙක්ඛාසු ඤාණං.
10. බහිද්ධා වුට්ඨානවිවට්ටනෙ පඤ්ඤා ගොත්රභූ ඤාණං.
11. දුභතො වුට්ඨානවිවට්ටනෙ පඤ්ඤා මග්ගෙ ඤාණං.
12. පයොගපටිප්පස්සද්ධි පඤ්ඤා ඵලෙ ඤාණං.
13. ඡින්නවට්ටමනුපස්සනෙ පඤ්ඤා විමුත්ති ඤාණං.
14. තදා සමුදාගතෙ ධම්මෙ පස්සනෙ පඤ්ඤා පච්චවෙක්ඛනෙ ඤාණං.
15. අජ්ඣත්තවවත්ථානෙ පඤ්ඤා වත්ථුනානත්තෙ ඤාණං.
16. බහිද්ධාවවත්ථානෙ පඤ්ඤා ගොචරනානත්තෙ ඤාණං.
17. චරියාවවත්ථානෙ පඤ්ඤා චරියානානත්තෙ ඤාණං.
18. චතුධම්මවවත්ථානෙ පඤ්ඤා භූමිනානත්තෙ ඤාණං.
19. නවධම්මවවත්ථානෙ පඤ්ඤා ධම්මනානත්තෙ ඤාණං.
20. අභිඤ්ඤාපඤ්ඤා ඤාතට්ඨෙ ඤාණං.
21. පරිඤ්ඤාපඤ්ඤා තීරණට්ඨෙ ඤාණං.
22. පහානෙ පඤ්ඤා පරිච්චාගට්ඨෙ ඤාණං.
23. භාවනාපඤ්ඤා එකරසට්ඨෙ ඤාණං.
24. සච්ඡිකිරියාපඤ්ඤා ඵුසනට්ඨෙ ඤාණං.
25. අත්ථනානත්තෙ පඤ්ඤා අත්ථපටිසම්භිදෙ ඤාණං.
26. ධම්මනානත්තෙ පඤ්ඤා ධම්මපටිසම්භිදෙ ඤාණං.
27. නිරුත්තිනානත්තෙ පඤ්ඤා නිරුත්තිපටිසම්භිදෙ ඤාණං.
28. පටිභාන නානත්තෙ පඤ්ඤා පටිභානපටිසම්භිදෙ ඤාණං.
29. විහාරනානත්තෙ පඤ්ඤා විහාරට්ඨෙ ඤාණං.
30. සමාපත්තිනානත්තෙ පඤ්ඤා සමාපත්තට්ඨෙ ඤාණං.
31. විහාරසමාත්තිනානත්තෙ පඤ්ඤා විහාරසමාපත්තට්ඨෙ ඤාණං.
32. අවික්ඛෙපපරිසුද්ධත්තා ආසවසමුච්ඡෙදෙ පඤ්ඤා ආනන්තරිකසමාධිස්මිං ඤාණං.
33. දස්සනාධිපතෙය්යං සන්තො ච විහාරාධිගමො පණීතාධිමුත්තතා පඤ්ඤා අරණවිහාරෙ ඤාණං.
34. ද්වීහි බලෙහි සමන්නාගතත්තා තයො ච සඞ්ඛාරානං පටිප්පස්සද්ධියා සොළසහි ඤාණචරියාහි නවහි සමාධිචරියාහි වසිභාවතා පඤ්ඤා නිරොධසමාපත්තියා ඤාණං.
35. සම්පජානස්ස පවත්තපරියාදානෙ පඤ්ඤා පරිනිබ්බානෙ ඤාණං.
36. සබ්බධම්මානං සම්මා සමුච්ඡෙදෙ නිරොධෙ ච අනුපට්ඨානතා පඤ්ඤා සමසීසට්ඨෙ ඤාණං.
37. පුථුනානත්තතෙජපරියොදානෙ පඤ්ඤා සල්ලෙඛට්ඨෙ ඤාණං.
38. අසල්ලීනත්ත පහිතත්ත-පග්ගහට්ඨෙ පඤ්ඤා විරියාරම්භෙ ඤාණං.
39. නානාධම්මපකාසන්තා පඤ්ඤා අත්ථසන්දස්සනෙ ඤාණං.
40. සබ්බධම්මානං එකසඞ්ගහතානානත්තෙකත්තපටිවෙධෙ පඤ්ඤා දස්සනවිසුද්ධිඤාණං.
41. විදිතත්තා පඤ්ඤා ඛන්ති ඤාණං.
42. ඵුට්ඨත්තා පඤ්ඤා පරියොගාහනෙ ඤාණං.
43. සමොදහනෙ පඤ්ඤා පදෙසවිහාරෙ ඤාණං.
44. අධිපතත්තා පඤ්ඤා සඤ්ඤාවිවට්ටෙ ඤාණං.
45. නානත්තෙ පඤ්ඤා චෙතොවිවට්ටෙ ඤාණං.
46. අධිට්ඨානෙ පඤ්ඤා චිත්තවිවට්ටෙ ඤාණං.
47. සුඤ්ඤතෙ පඤ්ඤා ඤාණවිවට්ටෙ ඤාණං.
48. වොස්සග්ගෙ පඤ්ඤා විමොක්ඛවිවට්ටෙ ඤාණං.
49. තථට්ඨෙ පඤ්ඤා සච්චවිවට්ටෙ ඤාණං.
50. කායම්පි චිත්තම්පි එකවවත්ථානතා සුඛසඤ්ඤඤ්ච ලහුසඤ්ඤඤ්ච අධිට්ඨානවසෙන ඉජ්ඣනට්ඨෙ පඤ්ඤා ඉද්ධිවිධෙ ඤාණං.
51. විතක්කවිප්ඵාරවසෙන නානත්තෙකත්ත සද්දනිමිත්තානං පරියොගාහනෙ පඤ්ඤා සොතධාතුවිසුද්ධිඤාණං.
52. තිණ්ණං චිත්තානං විප්ඵාරත්තා ඉන්ද්රියානං පසාදවසෙන නානත්තෙකත්තවිඤ්ඤාණචරියාපරියොගාහනෙ පඤ්ඤා චෙතොපරියඤාණං.
53. පච්චයප්පවත්තානං ධම්මානං නානත්තෙකත්තකම්මවිප්ඵාරවසෙන පරියොගාහනෙ පඤ්ඤා පුබ්බෙනිවාසානුස්සති ඤාණං.
54. ඔභාසවසෙන නානත්තෙකත්තරූපනිමිත්තානං දස්සනට්ඨෙ පඤ්ඤා දිබ්බචක්ඛුඤාණං.
55. චතුසට්ඨියා ආකාරෙහි තිණ්ණං ඉන්ද්රියානං වසිභාවතා පඤ්ඤා ආසවානං ඛයෙ ඤාණං.
56. පරිඤ්ඤට්ඨෙ පඤ්ඤා දුක්ඛෙ ඤාණං.
57. පහානට්ඨෙ පඤ්ඤා සමුදයෙ ඤාණං.
58. සච්ඡිකිරියට්ඨෙ පඤ්ඤා නිරොධෙ ඤාණං.
59. භාවනට්ඨෙ පඤ්ඤා මග්ගෙ ඤාණං.
60. දුක්ඛෙ ඤාණං.
61. දුක්ඛසමුදයෙ ඤාණං.
62. දුක්ඛනිරොධෙ ඤාණං.
63. දුක්ඛනිරොධගාමිනියා පටිපදාය ඤාණං.
64. අත්ථපටිසම්භිදෙ ඤාණං.
65. ධම්මපටිසම්භිදෙ ඤාණං.
66. නිරුත්තිපටිසම්භිදෙ ඤාණං,
67. පටිභානපටිසම්භිදෙ ඤාණං.
68. ඉන්ද්රියපරොපරියත්තඤාණං.
69. සත්තානං ආසයානුසයෙ ඤාණං.
70. යමකපාටිහීරෙ ඤාණං.
71. මහාකරුණාසමාපත්තියා ඤාණං.
72. සබ්බඤ්ඤුතඤාණං.
73. අනාවරණඤාණං.
ඉමානි තෙසත්තති ඤාණානි. ඉමෙසං තෙසත්තතියා ඤාණානං සත්තසට්ඨි ඤාණානි සාවකසාධාරණානි. ඡ ඤාණානි අසාධාරණානි සාවෙකෙහි.

## 2. Web sources
- https://paritha.org/?p=2814 - "බුදුගුණ පිරිත" incl. "තෙසැත්තාඤාණ පිරිත": the formula in print (abridged list). Best textual source.
- https://paritha.org/?p=2845 - "තෙසැත්තෑඤාණ වන්දනාව": a different work, Sinhala verses with heading lines `X ඤාණං බුද්ධ ඤාණං නමාමි`. Not the chant.
- http://aagiyakatha.blogspot.com/2011/09/blog-post_25.html - description of the 73-ñāṇa Buddha pūjā, mātikā list, link to Ven. Ariyadhamma.
- http://bududhahama.blogspot.com/2012/12/download-pirith-mp3-form-ven-nauyane.html - track list of this collection; track 35 =
  http://www.archive.org/download/PirithChanting_432/35.TesattatiNyanaParittam.mp3 (audio only, no text).
- Internet Archive copies of the same/similar recordings (no text in descriptions): https://archive.org/details/thesaett-nana-parittam-nauyane-dc50cb6b62 (58:28),
  https://archive.org/details/352.-nauyane-ariyadhamma-thero (58:25), https://archive.org/details/tesaett-buddha-nana-vandanava-nauyane-5952b81273,
  https://archive.org/details/175.-ven-na-uyane-ariyadhamma, https://archive.org/details/tesaett-nana-pirit-sajjhayanava-nauyane-207b6798be
- https://dr.lib.sjp.ac.lk/items/d36b7b94-4594-41f0-b96c-3112387e104f - book "තෙසැත්තෑ බුද්ධ ඥාන" (Kukulpane Sudassi, 2009); not examined, may contain the full text.
- Searches on pirith.org, mahamevnawa, tipitaka.lk etc. for the Sinhala/Roman spellings gave no page with the full 73-item paritta.

## Scratch files
- /private/tmp/claude-501/-Volumes-2TB-node-pirith/e321b957-ca5d-4bf9-8026-ca4dbc77f49c/scratchpad/matika.txt - the 73 items + closing sentence
- /private/tmp/claude-501/-Volumes-2TB-node-pirith/e321b957-ca5d-4bf9-8026-ca4dbc77f49c/scratchpad/reconstructed-draft.txt - 73 blocks generated mechanically from the mātikā (a draft to be checked by ear, not a verified text)
- /private/tmp/claude-501/-Volumes-2TB-node-pirith/e321b957-ca5d-4bf9-8026-ca4dbc77f49c/scratchpad/decode-full.txt - rough phonetic decode of the whole recording
