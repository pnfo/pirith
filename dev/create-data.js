import fs from 'node:fs';
import assert from 'node:assert';

// In ES modules, __dirname is not available directly, but import.meta.dirname works in Node 20.11+
const rootFolder = import.meta.dirname;

const prePageHtml = fs.readFileSync(`${rootFolder}/pre-page.html`, { encoding: 'utf8' });

import { pirithList } from '../src/pirith-list.js';
const dataJson = {};

pirithList.forEach(info => processPirith(info[0], info[2]));

// write the data file
fs.writeFileSync(`${rootFolder}/../src/pirith-data.js`,
    'export const pirithData = ' + JSON.stringify(dataJson, null, 4),
    { encoding: 'utf-8' });


function readTransFile(fileName) {
    if (!fs.existsSync(fileName)) return [];
    const dataStr = fs.readFileSync(fileName, { encoding: 'utf-8' });
    return dataStr.split('\n\n').map(group => {
        return group.split('\n').filter(line => line.trim().length > 0);
    }).filter(group => group.length > 0);
};

function readSplitFile(fileName) {
    if (!fs.existsSync(fileName)) return [];
    const dataStr = fs.readFileSync(fileName, { encoding: 'utf-8' });
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
    const dataStr = fs.readFileSync(fileName, { encoding: 'utf-8' });
    //console.log(data);
    return dataStr.split('\n\n').map(group => {
        const lines = group.split('\n');
        return computeRowSpan(lines.map(line => {
            const [pali, sinh] = line.split('=').map(part => part.trim());
            //assert(parts.length == 2, `no = found on text line ${line} : group ${group}`);
            //if (parts[1].endsWith(';')) parts[1] = parts[1].slice(0, -1); // remove last ;
            return { pali, sinh };
        }));
    });
}

function processPirith(fileName, pirithName) {
    const fileNum = Number(fileName.split('-')[0]);
    if (!fs.existsSync(`${rootFolder}/data/${fileNum}-combi.txt`)) {
        console.log(`no data files for ${fileName}`);
        return; // dont process if no data files
    }

    const labels = readSplitFile(`${rootFolder}/data/${fileNum}-labels.txt`).map(line => line.split('\t').map(num => Number(num)));
    const text = readCombiFile(`${rootFolder}/data/${fileNum}-combi.txt`);
    const engTrans = readTransFile(`${rootFolder}/data/${fileNum}-trans.txt`);

    if (engTrans.length) {
        if (engTrans.length === text.length) {
            text.forEach((group, gIdx) => {
                if (engTrans[gIdx] && engTrans[gIdx].length === group.length) {
                    group.forEach((row, rIdx) => {
                        row.eng = engTrans[gIdx][rIdx];
                    });
                } else {
                    console.error(`Group line count mismatch in ${fileName}-trans.txt at group ${gIdx}:${engTrans[gIdx][0]}`);
                }
            });
        } else {
            console.error(`Group count mismatch in ${fileName}-trans.txt. Expected ${text.length}, got ${engTrans.length}`);
        }
    }

    assert(labels.length == text.length, `labels and text lengths are different for ${fileName}. ${labels.length} != ${text.length}`);
    dataJson[fileName] = {
        'labels': labels,
        'text': text,
    };
    console.log(`processed data for ${fileName}, num labels ${labels.length}`);

    // write the full sentences to static pages - optional full sentences available only for first 10 pirith
    //const paliSent = readSplitFile(`${rootFolder}/data/${fileNum}.txt`);
    //const sinhSent = readSplitFile(`${rootFolder}/data/${fileNum}-trans.txt`).map(line => line.length ? line : null);
    //assert(!paliSent.length || (paliSent.length == labels.length && sinhSent.length == labels.length),
    //    `labels and sentence lengths are different for ${fileName}. pali: ${paliSent.length}, labels: ${labels.length}`);

    const pageSize = writeStaticPage(fileName, pirithName, labels, text);
    console.log(`wrote static page for ${fileName}, page size ${pageSize}`);
}


/** STATIC PAGES */
function writeStaticPage(fileName, pirithName, labels, text) {
    const tablesHtml = text.map((rows, ind) => {
        const tbodyRows = rows.map(row => {
            let rowHtml = `<td class="pali part">${row.pali}</td>`;
            if (row.sinh) {
                rowHtml += `\n                <td class="sinh part" rowspan="${row.span}">${row.sinh}</td>`;
            }
            return `<tr class="text-row">\n                ${rowHtml}\n            </tr>`;
        }).join('\n            ');

        let tfootHtml = '';
        /*if (paliSent.length) {
            tfootHtml = `
        <tfoot class="sentences">
            <tr class="sentence">
                <td class="pali part">${paliSent[ind]}</td>
                <td class="sinh part">${sinhSent[ind]}</td>
            </tr>
        </tfoot>`;
        }*/

        return `
    <table class="label" label-start="${labels[ind][0]}" label-end="${labels[ind][1]}">
        <tbody class="text-rows">
            ${tbodyRows}
        </tbody>${tfootHtml}
    </table>`;
    }).join('');

    const contentHtml = `
<div class="content">
    <audio controls="controls" autoplay="autoplay" src="../audio/${fileName}.m4a"></audio>${tablesHtml}
</div>`;

    let tmplStr = prePageHtml.replace(/TITLEPLACEHOLDER/g, pirithName);
    tmplStr = tmplStr.replace(/PIRITHNAMEPLACEHOLDER/g, fileName);
    tmplStr = tmplStr.replace(/CONTENTPLACEHOLDER/, contentHtml);

    fs.writeFileSync(`${rootFolder}/../public/pages/${fileName}.html`, tmplStr);
    return tmplStr.length;
}