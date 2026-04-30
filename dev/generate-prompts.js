const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenAI } = require("@google/genai");

// --- CONFIGURATION ---
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.1-pro-preview"; // As used in the project for synthesis and analysis
const BASE_DIR = path.join(__dirname, 'misc');
const INPUT_DIR = path.join(BASE_DIR, 'input');
const LANGUAGE = 'si'; // 'si' for Sinhala, 'en' for English
const PROMPTS_FILE = path.join(BASE_DIR, `prompts_${LANGUAGE}.txt`);
const DELAY_MS = 2000;
const REFERENCE_URL = ""//"https://pitaka.lk/books/bauddhayage-athpotha/7.html" // Only used for Sinhala

// Filter: Set to an array of filenames without extension (e.g., ['1', '2']) to process only specific images.
// Set to [] or null to process all images.
const FILTER_IMAGES = ['vidya-abhiknkna'];

// Initialize Gemini (using the newer SDK which supports urlContext and googleSearch properly)
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates the instruction prompt based on target language
 */
function getInstruction(language, referenceUrl) {
    const baseInstruction = `Analyze the attached image${language === 'si' && referenceUrl ? ` and the content at ${referenceUrl}` : ''}. 
    Create a "Nano Banana Pro" prompt for replacing the occurrences of Thai text in this photo with corresponding Modern ${language === 'si' ? 'Sinhala' : 'English'} text.

    --- CRITICAL CONSTRAINTS ---
    1. **Length Equality**: The ${language === 'si' ? 'Sinhala' : 'English'} translation for each text segment MUST be roughly the same length (character count) as the original Thai text to ensure a proper fit in the image layout.
    2. **Detail Preservation & Enhancement**: Explicitly describe non-text elements (paintings, frames, diagrams, borders) in high detail. Instruct the model to preserve the original style and enhance the sharpness and clarity of these elements to avoid loss of fidelity.
    3. **Indicate clearly which Thai text is replaced by which ${language === 'si' ? 'Sinhala' : 'English'} text`;

    const sinhalaConstraints = `
    3. **Simplified Typography**: Avoid using rare or complex Sinhala characters/conjuncts (e.g., ඍ, ඤ, ඥ, ළු, ඏ, ඐ, ඈ, ඓ, ඖ) or complex "බැඳි අකුරු" (conjuncts). Use simpler modern alternatives to ensure the image model can render them clearly.`;

    const tasks = `
    --- YOUR TASKS ---
    1. Identify all Thai text segments in the image.
    2. Use ${language === 'si' ? 'the provided URL and ' : ''}Google Search to ensure accurate terminology for the Buddhist themes depicted. 
    3. Translate Thai to ${language === 'si' ? 'Sinhala' : 'English'} following the constraints above.
    4. Create a highly detailed English prompt. This prompt MUST describe the entire scene (including background art, frames, and diagrams) with emphasis on "High Definition", "Extreme Sharpness", and "Pristine Detail" for both text and non-text elements.
    
    --- OUTPUT FORMAT ---
    The output should be the detailed prompt. At the end of the prompt, include a "Final Check" section for the image model:
    "Final Check: Ensure all ${language === 'si' ? 'Sinhala' : 'English'} characters are rendered sharply and accurately. Simultaneously, ensure all non-text elements like paintings, diagrams, and frames are rendered with extreme clarity, high contrast, and pristine detail, matching or exceeding the quality of the original image."

    --- FINAL VERIFICATION STEPS (For You) ---
    Before outputting the prompt, verify:
    - Is the ${language === 'si' ? 'Sinhala' : 'English'} text length similar to the Thai text for each segment?
    ${language === 'si' ? '- Have you avoided rare/complex characters that are hard to render?' : ''}
    - All the Thai text segments are translated and no Thai text is left behind?
    - Text replacements are defined as pairs of Thai text, ${language === 'si' ? 'Sinhala' : 'English'} text.
    - All concepts in the Thai text are captured in the translation?
    - Correct font sizes for each text segment based on the text length and available space specified?
    - Does the prompt explicitly request high-fidelity enhancement for the non-text visual elements?
    - Is the terminology accurate according to the ${language === 'si' && referenceUrl ? 'Buddhist reference provided' : 'Google Search results'}?`;

    return language === 'si' ? baseInstruction + sinhalaConstraints + tasks : baseInstruction + tasks;
}

/**
 * Loads prompts from a human-readable text file
 */
function loadPrompts(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf-8');
    const prompts = {};
    const parts = content.split('>>> FILE: ');
    for (const part of parts) {
        if (!part.trim()) continue;
        const lines = part.split('\n');
        const fileName = lines[0].trim();
        let body = lines.slice(1).join('\n');
        body = body.split('<<< END FILE')[0].trim();
        if (fileName && body) {
            prompts[fileName] = body;
        }
    }
    return prompts;
}

/**
 * Saves prompts to a human-readable text file
 */
function savePrompts(filePath, prompts) {
    let output = "";
    for (const file in prompts) {
        output += `>>> FILE: ${file}\n`;
        output += `${prompts[file]}\n`;
        output += `<<< END FILE\n\n`;
    }
    fs.writeFileSync(filePath, output, 'utf-8');
}

async function run() {
    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`❌ Input directory not found: ${INPUT_DIR}`);
        return;
    }

    // Get all jpg/jpeg files
    const allFiles = fs.readdirSync(INPUT_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ext === '.jpg' || ext === '.jpeg';
    });
    console.log(`🔍 Found ${allFiles.length} images in ${INPUT_DIR}`);

    // Filter images if FILTER_IMAGES is set
    let files = allFiles;
    if (FILTER_IMAGES && FILTER_IMAGES.length > 0) {
        files = allFiles.filter(f => {
            const nameWithoutExt = path.parse(f).name;
            return FILTER_IMAGES.includes(nameWithoutExt);
        });
        console.log(`🎯 Filtering: Processing ${files.length} out of ${allFiles.length} images.`);
    }

    // Load existing prompts to resume if needed
    const prompts = loadPrompts(PROMPTS_FILE);

    for (const file of files) {
        if (prompts[file]) {
            console.log(`⏩ Skipping ${file} (prompt already exists)`);
            continue;
        }

        console.log(`🎨 Generating prompt for ${file} [${LANGUAGE}]...`);
        const filePath = path.join(INPUT_DIR, file);

        try {
            const imageBuffer = fs.readFileSync(filePath);
            const imageBase64 = imageBuffer.toString("base64");
            const instruction = getInstruction(LANGUAGE, REFERENCE_URL);

            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: instruction },
                            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
                        ]
                    }
                ],
                config: {
                    tools: [
                        { urlContext: {} },
                        { googleSearch: {} }
                    ]
                }
            });

            // Extract text from the new SDK response structure
            const text = response.candidates[0].content.parts.find(p => p.text)?.text;
            if (!text) {
                throw new Error("No text content returned from model.");
            }

            // Clean markdown and trim
            const cleanPrompt = text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();

            prompts[file] = cleanPrompt;
            savePrompts(PROMPTS_FILE, prompts);
            console.log(`✅ Saved prompt for ${file}`);

        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }

        // Throttle requests
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }

    console.log(`\n✨ All done! You can now review and edit ${path.basename(PROMPTS_FILE)} before running the image generator.`);
}

run();