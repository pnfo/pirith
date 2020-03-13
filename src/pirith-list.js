export const pirithList = [ // order, desc, author, length, count, isStarred, isLoop
    ['02-saranagamanam', 0, 'සරණාගමනං', 'ariyadhamma', '1:41'],
    ['03-dasasikkhapadani', 1, 'දස සික්ඛාපදානි', 'ariyadhamma', '1:48'],
    ['04-samanera-panha', 2, 'සාමණේර පඤ්හො', 'ariyadhamma', '1:53'],
    ['05-dvattimsakaraya', 3, 'ද්වත්තිංසාකාරො', 'ariyadhamma', '1:09'],
    ['06-paccavekkhana', 4, 'පච්චවෙක්ඛණා', 'ariyadhamma', '3:24'],
    ['07-dasadhamma', 5, 'දසධම්ම සුත්තං', 'ariyadhamma', '5:24'],
    ['08-mahamangala', 6, 'මහා මඞ්ගල සුත්තං', 'ariyadhamma', '5:46'],
    ['09-rathana', 7, 'රතන සුත්තං', 'ariyadhamma', '10:21'],
    ['10-karaniya', 8, 'කරණීය මෙත්ත සුත්තං', 'ariyadhamma', '4:02'],
    ['11-khandha-parittam', 9, 'ඛන්ධ පරිත්තං', 'ariyadhamma', '6:50'],
    ['12-mettanisamsa', 10, 'මෙත්තානිසංස සුත්තං', 'ariyadhamma', '3:33'],
    ['13-mittanisamsa', 11, 'මිත්තානිසංස සුත්තං', 'ariyadhamma', '3:27'],
    ['14-mora-parittam', 12, 'මොර පරිත්තං', 'ariyadhamma', '2:25'],
    ['15-canda-parittam', 13, 'චන්ද පරිත්තං', 'ariyadhamma', '3:26'],
    ['16-suriya-parittam', 14, 'සූරිය පරිත්තං', 'ariyadhamma', '3:40'],
    ['17-dhajagga-parittam', 15, 'ධජග්ග පරිත්තං', 'ariyadhamma', '11:13'],
    ['18-kassapa-bojjhanga', 16, 'මහා කස්සප බොජ්ඣංග සුත්තං', 'ariyadhamma', '7:05'],
    ['19-moggallana-bojjhanga', 17, 'මහා මොග්ගල්ලාන බොජ්ඣංග සුත්තං', 'ariyadhamma', '7:03'],
    ['20-chunda-bojjhanga', 18, 'මහා චුන්ද බොජ්ඣංග සුත්තං', 'ariyadhamma', '6:53'],
    ['21-girimananda-suttam', 19, 'ගිරිමානන්ද සුත්තං', 'ariyadhamma', '24:11'],
    ['22-isigili-suttam', 20, 'ඉසිගිලි සුත්තං', 'ariyadhamma', '16:23'],
    ['23-dhammacakkappavattana', 21, 'ධම්මචක්කප්පවත්තන සුත්තං', 'ariyadhamma', '24:28'],
    ['24-mahasamaya-suttam', 22, 'මහාසමය සුත්තං', 'ariyadhamma', '30:17'],
    ['25-alavaka-suttam', 23, 'ආළවක සුත්තං', 'ariyadhamma', '9:40'],
    ['26-kasibharadvaja-suttam', 24, 'කසිභාරද්වාජ සුත්තං', 'ariyadhamma', '11:49'],
    ['27-parabhava-suttam', 25, 'පරාභව සුත්තං', 'ariyadhamma', '10:00'],
    ['28-aggika-bharadvaja-suttam', 26, 'අග්ගික භාරද්වාජ සුත්තං', 'ariyadhamma', '14:22'],
    ['29-saccavibhanga-suttam', 27, 'සච්චවිභඞ්ග සුත්තං', 'ariyadhamma', '30:31'],
    ['30-atanatiya-suttam-1', 28, 'ආටානාටිය සුත්තං 1', 'ariyadhamma', '41:02'],
    ['32-atanatiya-suttam-2', 29, 'ආටානාටිය සුත්තං 2', 'ariyadhamma', '48:55'],
    ['35-tesattati-nyana-parittam', 30, 'තෙසැත්තෑ ඤාණ පරිත්තං', 'ariyadhamma', '58:26'],
]

const authorList = {
    'ariyadhamma': ['නාඋයනේ අරියධම්ම ථෙරෝ', 'Nauyane Ariyadhamma Thero', [128, 256, 512]],
}

export function setupMediaSession(pInd) {
    if (!('mediaSession' in navigator)) {
        console.log('No mediaSession support in navigator');
        return;
    }
    const info = pirithList[pInd]
    const authorInfo = authorList[info[3]];
    const metadata = {
        title: info[2], // TODO needs script change 
        artist: authorInfo[1],
        album: 'පිරිත්',
    };
    metadata.artwork = authorInfo[2].map(size => {
        return { 
            src: `artwork/${info[3]}-${size}.png`,
            sizes: `${size}x${size}`, 
            type: 'image/png' 
        };
    });
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
}