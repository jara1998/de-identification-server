const axios = require('axios');


const BaseUrl_analyzer = 'http://presidio-analyzer:3000/'; 
const BaseUrl_anonymizer = 'http://presidio-anonymizer:3000/'
const analyerUrl = BaseUrl_analyzer + 'analyze';
const anonymizerUrl = BaseUrl_anonymizer + 'anonymize';

// ```
// {
//     "text": "hello world, my name is Jane Doe. My number is: 034453334",
//     "analyzer_results": [
//         { "start": 24, "end": 32, "score": 0.8, "entity_type": "NAME" },
//         { "start": 24, "end": 28, "score": 0.8, "entity_type": "FIRST_NAME" },
//         { "start": 29, "end": 32, "score": 0.6, "entity_type": "LAST_NAME" },
//         { "start": 48, "end": 57,  "score": 0.95,
//             "entity_type": "PHONE_NUMBER" }
//     ]
// }
// ```

async function analyzeText(text: string) {
    // body of the request
    let body =  {
        text: text,
        language: "en"
    };

    // send the request
    let response = await axios.post(analyerUrl, body);
    return response.data;
};

function sortIntervals(masks: any[]): any[] {
    return masks.sort((a, b) => {
        if (a.start === b.start) {
            return a.end - b.end;
        }
        return a.start - b.start;
    });
}


function mergeMasks(masks: any[]): any[] {
    let sorted_masks = sortIntervals(masks);
    let merged: any[] = [];
    let currentInterval = sorted_masks[0];

    for (let i = 1; i < sorted_masks.length; i++) {
        let mask = sorted_masks[i];
        if (mask.start <= currentInterval.end) {
            if (mask.score > currentInterval.score) {
                currentInterval = mask;
            }
        } else {
            merged.push(currentInterval);
            currentInterval = mask;
        }
    }
    merged.push(currentInterval);

    return merged;
}

async function anonymizeText(text: string, masks: any[]): Promise<string> {
    let body =  {
        text: text,
        analyzer_results: masks
    };

    // send the request
    let response = await axios.post(anonymizerUrl, body);
    return response.data;
}

interface ProcessResInterface {
    res: any;
    masked: boolean;
}

async function processText(text: string): Promise<ProcessResInterface> {
    let raw_masks = await analyzeText(text);
    // read json response

    // let analyze_res = JSON.parse(raw_masks);
    // Don't need to mask it this case
    if (raw_masks.length === 0) {
        return {res: {text: text}, masked: false};
    }
    
    let filtered_masks: any[] = [];
    for (let i = 0; i < raw_masks.length; i++) {
        if (raw_masks[i].score >= 0.5) {
            filtered_masks.push(raw_masks[i]);
        }
    }

    let merged_masks = mergeMasks(filtered_masks);

    // apply masks to the text
    let processed_res = await anonymizeText(text, merged_masks);
    return {res: processed_res, masked: true};
}

export { processText };