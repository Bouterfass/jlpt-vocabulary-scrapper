const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const utils = require('./utils');
const fs = require('fs');


let items = {
    words: [],
    id: '',
    level: 0,
    word: '',
    rom: '', //romanisation
    hiragana: '',
    types: [],
    translations: [],
    splitRomHiragana: (text) => {
        for (let i = 0; i < text.length; i++) {
            if (utils.isLetter(text[i]) || text[i] === '/')
                items.rom += text[i];
            else
                items.hiragana += text[i];
        }
        if (items.rom.trim().includes("/")){
            items.rom = items.rom.trim().split('/');
            items.rom.map(el => el.trim());
            items.rom = items.rom.filter(el => el);
        } else {
            items.rom = items.rom.trim();
        }
        if (items.hiragana.trim().includes(" ")){
            items.hiragana = items.hiragana.trim().split(' ');
            items.hiragana.forEach(el => el.trim());
            items.hiragana = items.hiragana.filter(el => el);
        } else {
            items.hiragana = items.hiragana.trim();
        }     
    },
    splitType: (text) => {
        const content = text.replaceAll(',', ';').replaceAll('/', ';');
        content.split(';').forEach(el => {
            items.types.push(el.trim());
        })
    },
    splitTranslation: (text) => {
        const content = text.replaceAll(',', ';').replaceAll('/', ';');
        content.split(';').forEach(el => {
            items.translations.push(el.trim());
        })
    },
    addItem: () => {
        items.words.push({
            id: items.id,
            level: items.level,
            word: items.word,
            rom: items.rom,
            hiragana: items.hiragana,
            types: [...items.types],
            translations: [...items.translations]
        })
    },
    reset: () => {
        items.id = '';
        items.level = 0;
        items.word = '';
        items.rom = ''; //romanisation
        items.hiragana = '';
        items.types = [];
        items.translations = [];
    }
}
let count = 0;

const fillWord = (count, obj, content) => {

    if (count == 0)
        obj.id = content.trim();
    if (count == 1)
        obj.word = content.trim();
    if (count == 2)
        obj.splitRomHiragana(content.trim());
    if (count == 3)
        obj.splitType(content.trim());
    if (count == 4)
        obj.splitTranslation(content.trim());
}


const getKanji = level => {

    const pagesPERlevel = {
        5: 7,
        4: 6,
        3: 2,
        2: 1
    }


    let jsonData;

    (async () => {
        for (let i = 1; i <= pagesPERlevel[level]; i++) {
            if (i === 1)
                url = `https://jlptsensei.com/jlpt-n${level}-vocabulary-list/`;
            else
                url = `https://jlptsensei.com/jlpt-n${level}-vocabulary-list/page/${i}`;
            
            console.log("scrapping: ", url);
            const response = await got(url);
            const dom = new JSDOM(response.body);
            const colList = [...dom.window.document.querySelectorAll('.align-middle')];

            colList.forEach(el => {
                if (count == 5) {
                    count = 0;
                    items.level = level;
                    items.addItem();
                    items.reset();
                }
                fillWord(count, items, el.textContent);
                count++;
            })
            items.level = level;
            items.addItem();
        }
        jsonData = JSON.stringify(items.words);
        fs.writeFile(`JLPT-${level}.json`, jsonData, 'utf8', (err) => {
            if (err) {
                console.log("An error has occured when creating JSON file.");
                return console.log(err);;
            }
            console.log(`JLPT-${level}.json has been created successfully!`);
        })
    })();
}

getKanji(5);

