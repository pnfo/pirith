import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config({ path: path.join(import.meta.dirname, '../../misc-projects/ai-trans/.env') });

// --- CONFIGURATION ---
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3-pro-preview"; // Highly capable model for context-aware translation
const BASE_DIR = path.join(import.meta.dirname, 'data');

// Filter: Set to an array of pirith numbers (e.g., [5, 6]) to process only specific files.
// Set to [] or null to process all files.
const FILTER_FILES = [62];

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: API_KEY });

const getInstruction = (numGroups) => `You are an expert translator specializing in Pali and Sinhala Buddhist texts.
Your task is to provide context-aware English translations for Pali phrases, and simultaneously verify existing Sinhala translations.
You are given a portion of a "Paritta" (Buddhist chant) chunked into exactly ${numGroups} groups.

Each group is labeled (e.g., [Group 1]) and contains lines formatted as:
Pali = Sinhala

--- YOUR TASKS ---
1. Analyze the ENTIRE provided text altogether to understand the over-arching context of the Paritta. Do NOT translate line-by-line in isolation; use context-aware translation.
2. For each line, translate the meaning of the Pali phrase into clear, natural English.
3. Validate the provided Sinhala translation against the Pali ground-truth in a context-aware manner.
4. CRITICAL: If a Pali line has no Sinhala translation, or if a whole stanza's Sinhala translation is incorrectly lumped onto only the first line, you MUST break it down and provide the accurate line-by-line Sinhala translation in the "sinh" field for EVERY individual line.

--- REQUIRED OUTPUT FORMAT ---
You must output ONLY valid JSON. Returns an array of arrays representing the exact structural groupings of the input lines.
CRITICAL: The input contains exactly ${numGroups} groups. Your JSON output MUST be an array containing EXACTLY ${numGroups} sub-arrays. Do not combine or skip any groups!
For each line in a group, return an object:
{
  "eng": "Your English translation here",
  "sinh": "Your corrected or missing Sinhala text here (OMIT THIS FIELD entirely ONLY IF the original Sinhala provided for this specific line is already perfectly accurate)"
}

Example output structure matching 2 groups with 2 lines each:
[
  [
    { "eng": "I go to the Buddha for refuge." },
    { "eng": "I go to the Dhamma for refuge.", "sinh": "දහම් සරණ යමි." } 
  ],
  [
    { "eng": "For the second time, I go to the Buddha for refuge." },
    { "eng": "For the second time, I go to the Dhamma for refuge." }
  ]
]

DO NOT wrap the JSON in Markdown formatting blocks (e.g. \`\`\`json). Output raw JSON.
`;

function readCombiFile(filePath) {
    const dataStr = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return dataStr.split('\n\n').map(group => {
        return group.split('\n').filter(line => line.trim().length > 0);
    }).filter(group => group.length > 0);
}

function writeCombiFile(filePath, originalGroups, corrections) {
    let output = '';
    originalGroups.forEach((group, gIdx) => {
        group.forEach((line, lIdx) => {
            let parts = line.split('=');
            let pali = parts[0].trim();
            let sinh = parts.length > 1 ? parts[1].trim() : '';

            const correctData = corrections[gIdx] && corrections[gIdx][lIdx];
            if (correctData && correctData.sinh && correctData.sinh.trim().length > 0) {
                sinh = correctData.sinh; // apply correction
            }

            if (sinh) {
                output += `${pali} = ${sinh}\n`;
            } else {
                output += `${pali}\n`;
            }
        });
        output += '\n'; // group separator
    });
    fs.writeFileSync(filePath, output.trim(), 'utf-8');
}

function writeTransFile(filePath, translations) {
    let output = '';
    translations.forEach((group) => {
        group.forEach((data) => {
            output += `${data.eng || ''}\n`;
        });
        output += '\n'; // group separator
    });
    fs.writeFileSync(filePath, output.trim(), 'utf-8');
}

async function run() {
    if (!fs.existsSync(BASE_DIR)) {
        console.error(`❌ Data directory not found: ${BASE_DIR}`);
        return;
    }

    const allFiles = fs.readdirSync(BASE_DIR).filter(f => f.endsWith('-combi.txt'));
    console.log(`🔍 Found ${allFiles.length} combi files in ${BASE_DIR}`);

    let files = allFiles;
    if (FILTER_FILES && FILTER_FILES.length > 0) {
        const filterNames = FILTER_FILES.map(n => `${n}-combi`);
        files = allFiles.filter(f => {
            const nameWithoutExt = path.parse(f).name;
            return filterNames.includes(nameWithoutExt);
        });
        console.log(`🎯 Filtering: Processing ${files.length} out of ${allFiles.length} files.`);
    }

    for (const file of files) {
        console.log(`\n⏳ Processing ${file}...`);
        const filePath = path.join(BASE_DIR, file);
        const transPath = path.join(BASE_DIR, file.replace('-combi.txt', '-trans.txt'));

        const groups = readCombiFile(filePath);
        const totalLines = groups.reduce((acc, group) => acc + group.length, 0);
        const numParts = Math.max(1, Math.ceil(totalLines / 400));
        const linesPerChunkGoal = totalLines / numParts;

        const chunks = [];
        let currentChunkGroups = [];
        let currentChunkLines = 0;

        for (const group of groups) {
            currentChunkGroups.push(group);
            currentChunkLines += group.length;

            if (currentChunkLines >= linesPerChunkGoal && chunks.length < numParts - 1) {
                chunks.push(currentChunkGroups);
                currentChunkGroups = [];
                currentChunkLines = 0;
            }
        }
        if (currentChunkGroups.length > 0) {
            chunks.push(currentChunkGroups);
        }

        let allCorrections = [];
        let failed = false;

        for (let i = 0; i < chunks.length; i++) {
            const chunkGroups = chunks[i];
            const chunkContent = chunkGroups.map((g, idx) => `[Group ${idx + 1}]\n` + g.join('\n')).join('\n\n');

            console.log(`  -> Sending part ${i + 1} of ${chunks.length} (${chunkGroups.reduce((a, g) => a + g.length, 0)} lines) to Gemini...`);

            try {
                const response = await ai.models.generateContent({
                    model: MODEL_NAME,
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: getInstruction(chunkGroups.length) },
                                { text: "\n\n--- INPUT DATA ---\n\n" + chunkContent }
                            ]
                        }
                    ]
                });

                const text = response.candidates[0].content.parts.find(p => p.text)?.text || '';
                const cleanJson = text.replace(/```json\n?/ig, '').replace(/```\n?/g, '').trim();
                const corrections = JSON.parse(cleanJson);

                if (corrections.length !== chunkGroups.length) {
                    console.error(`⚠️ Output group count mismatch for ${file} part ${i + 1}! Expected ${chunkGroups.length}, got ${corrections.length}`);
                    failed = true;
                    break;
                }

                allCorrections.push(...corrections);

            } catch (err) {
                console.error(`❌ Error processing ${file} part ${i + 1}:`, err.message);
                failed = true;
                break;
            }
        }

        if (failed) {
            console.log(`❌ Skipping saving ${file} due to failure in one of the parts.`);
            continue;
        }

        writeCombiFile(filePath, groups, allCorrections);
        writeTransFile(transPath, allCorrections);

        console.log(`✅ Successfully processed translations & verified definitions for ${file}`);
    }
    console.log(`\n✨ All done! Data files have been generated/updated.`);
}

run();
