
const fs = require('fs');
const assert = require('assert');
const vkbeautify = require('vkbeautify');

var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);
const CE = (elem, cls) => $(`<${elem}/>`).addClass(cls), 
    CED = (cls) => CE('div', cls), CES = (cls) => CE('span', cls); // helper func

const rootFolder = __dirname;

const prePageHtml = fs.readFileSync(`${rootFolder}/pre-page.html`, { encoding: 'utf8' });

// copied from the main pirith-list.js file
const pirithList = [ // file-name, order, name, author, length
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

    ['50-angulimala', 31, 'අංගුලිමාල පරිත්තං', 'ariyadhamma', '2:03'],
    ['51-atavisi', 32, 'අටවිසි පරිත්තං', 'ariyadhamma', '2:08'],
    ['52-wattaka', 33, 'වට්ටක පරිත්තං', 'ariyadhamma', '2:01'],
    ['53-jaya-mangala-attha-gatha', 34, 'ජය මංගල අට්ඨ ගාථා', 'ariyadhamma', '4:46'],
    ['54-narasiha-gatha', 35, 'නරසීහ ගාථා', 'ariyadhamma', '3:21'],
    ['55-maha-jaya-mangala-gatha', 36, 'මහා ජයමංගල ගාථා', 'ariyadhamma', '5:34'],
    ['56-jaya-parittam', 37, 'ජය පරිත්තං', 'ariyadhamma', '3:22'],
    ['57-jvara-parittam', 38, 'ජ්වර පරිත්තං', 'ariyadhamma', '15:52'],
    ['58-antharaya-nivarana-parittam', 39, 'අන්තරාය නිවාරණ පරිත්තං', 'ariyadhamma', '0:53'],
    ['59-jinapanjara-parittam', 40, 'ජිනපඤ්ජර පරිත්තං', 'ariyadhamma', '6:10'],
    ['60-dasa-disa-parittam', 41, 'දස දිසා පරිත්තං', 'ariyadhamma', '1:30'],
    ['61-bojjhanga-parittam', 42, 'බොජ්ඣංග පරිත්තං', 'ariyadhamma', '3:18'],
]
const dataJson = {};

pirithList.forEach(info => processPirith(info[0], info[1]));

// write the data file
fs.writeFileSync(`${rootFolder}/../src/pirith-data.js`, 
    'export const pirithData = ' + vkbeautify.json(JSON.stringify(dataJson)), 
    {encoding: 'utf-8'});


function readSplitFile(fileName) {
    if (!fs.existsSync(fileName)) return [];
    const dataStr = fs.readFileSync(fileName, {encoding: 'utf-8'});
    //console.log(data);
    return dataStr.split('\n').map(line => line.trim());
};

function computeRowSpan(rows) { // since some sinh parts map to multiple pali parts
    let rowspan = 1
    for (let i = rows.length - 1; i >= 0; i--) {
        if (!rows[i].sinh) {
            rowspan++
        }
        else {
            rows[i].span = rowspan
            rowspan = 1
        }
    }
    return rows;
}

function readCombiFile(fileName) {
    if (!fs.existsSync(fileName)) return [];
    const dataStr = fs.readFileSync(fileName, {encoding: 'utf-8'});
    //console.log(data);
    return dataStr.split('\r\n\r\n').map(group => {
        const lines = group.split('\r\n');
        return computeRowSpan(lines.map(line => {
            const [pali, sinh] = line.split('=').map(part => part.trim());
            //assert(parts.length == 2, `no = found on text line ${line} : group ${group}`);
            //if (parts[1].endsWith(';')) parts[1] = parts[1].slice(0, -1); // remove last ;
            return { pali, sinh };
        }));
    });
}

function processPirith(pirithName, pInd) {
    const fileNum = Number(pirithName.split('-')[0]);
    if (!fs.existsSync(`${rootFolder}/data/${fileNum}-combi.txt`)) return; // dont process if no data files

    const labels = readSplitFile(`${rootFolder}/data/${fileNum}-labels.txt`).map(line => line.split('\t').map(num => Number(num)));
    const text = readCombiFile(`${rootFolder}/data/${fileNum}-combi.txt`);
    assert(labels.length == text.length, `labels and text lengths are different for ${pirithName}`);
    dataJson[pirithName] = {
        'labels': labels,
        'text': text,
    };
    console.log(`processed data for ${pirithName}, num labels ${labels.length}`);

    // write the full sentences to static pages - optional full sentences available only for first 10 pirith
    const paliSent = readSplitFile(`${rootFolder}/data/${fileNum}.txt`);
    const sinhSent = readSplitFile(`${rootFolder}/data/${fileNum}-trans.txt`).map(line => line.length ? line : null);
    assert(!paliSent.length || (paliSent.length == labels.length && sinhSent.length == labels.length), 
        `labels and sentence lengths are different for ${pirithName}`);

    const pageSize = writeStaticPage(pirithName, pInd, labels, text, paliSent, sinhSent);
    console.log(`wrote static page for ${pirithName}, page size ${pageSize}`);
}


/** STATIC PAGES */

function writeStaticPage(pirithName, pInd, labels, text, paliSent, sinhSent) {
    const renderedText = text.map((rows, ind) => {
        const textE = CED(`text-rows`).append(rows.map(row => CED('text-row').append(
            [CED('pali part').text(row.pali), CED('sinh part').text(row.sinh)])));
        const labelE = CED('label').append(textE)
            .attr('label-start', labels[ind][0])
            .attr('label-end', labels[ind][1]);
        if (paliSent.length) {
            labelE.append(CED('sentences').append(
                CED('pali-sent').text(paliSent[ind]), 
                CED('sinh-sent').text(sinhSent[ind])));
        }
        return labelE;
    });
    const audio = $('<audio controls autoplay></audio>').attr('src', `../audio/${pirithName}.mp3`);
    const contentDiv = CED('content').append(
        audio,
        renderedText
    );

    const contentHtml = vkbeautify.xml(CED('div').append(contentDiv).html());
    let tmplStr = prePageHtml.replace(/TITLEPLACEHOLDER/g, pirithList[pInd][2]);
    tmplStr = tmplStr.replace(/PIRITHNAMEPLACEHOLDER/g, pirithName);
    tmplStr = tmplStr.replace(/CONTENTPLACEHOLDER/, contentHtml)
    fs.writeFileSync(`${rootFolder}/../public/pages/${pirithName}.html`, tmplStr);
    return tmplStr.length;
}