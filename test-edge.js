const crypto = require('crypto');
const WebSocket = require('ws'); 
const fs = require('fs');

function getEdgeHeaders() {
    const unixEpochToWinEpochMs = 11644473600000n;
    const currentUnixMs = BigInt(Date.now());
    const ticks = (currentUnixMs + unixEpochToWinEpochMs) * 10000n;
    const roundedTicks = ticks - (ticks % 3000000000n);
    
    const hash = crypto.createHash('sha256')
        .update(roundedTicks.toString() + "6A5AA1D4EAFF4E9FB37E23D68491D6F4", 'utf8')
        .digest('hex').toUpperCase();
        
    return {
        'Sec-MS-GEC': hash,
        'Sec-MS-GEC-Version': '1-130.0.2849.68',
        'Origin': 'chrome-extension://jdiccldimpdaibmpndjcgndbkbkajjnp',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.68'
    };
}

function generateUUID() {
    return crypto.randomUUID().replace(/-/g, '');
}

async function getAudio(text, voice) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4', {
            headers: getEdgeHeaders()
        });
        const audioChunks = [];

        ws.on('open', () => {
            const configMsg = `X-Timestamp: ${new Date().toUTCString()}\r\nContent-Type: application/json; charset=utf-8\r\nPath: speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
            ws.send(configMsg);

            const requestId = generateUUID();
            const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='+0Hz' rate='0%' volume='100%'>${text}</prosody></voice></speak>`;
            const ssmlMsg = `X-RequestId: ${requestId}\r\nContent-Type: application/ssml+xml\r\nX-Timestamp: ${new Date().toUTCString()}\r\nPath: ssml\r\n\r\n${ssml}`;
            ws.send(ssmlMsg);
        });

        ws.on('message', (data, isBinary) => {
            if (isBinary) {
                const str = data.toString('utf8');
                const headerEnd = str.indexOf('\r\n\r\n');
                if (headerEnd !== -1) {
                    const headerLength = Buffer.byteLength(str.substring(0, headerEnd + 4), 'utf8');
                    audioChunks.push(data.slice(headerLength));
                }
            } else {
                const textMsg = data.toString('utf8');
                if (textMsg.includes('Path: turn.end')) {
                    ws.close();
                    resolve(Buffer.concat(audioChunks));
                }
            }
        });
        ws.on('error', reject);
    });
}

getAudio('नमस्कार, मी मराठी बोलते!', 'mr-IN-AarohiNeural').then(buffer => {
    fs.writeFileSync('test.mp3', buffer);
    console.log('Saved test.mp3, size:', buffer.length);
}).catch(console.error);
