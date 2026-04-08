const fs = require('fs');
const path = require('path');

const NEW_BLUE = '#7DD3FC';
const OLD_ORANGE = '#F97316';
const NEW_NAVY = '#0F172A';
const NEW_BG_PRIMARY = '#F0F9FF';
const NEW_BG_SECONDARY = '#E0F2FE';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file.includes('node_modules') || file.includes('.git')) return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace Orange Hex
    content = content.replace(/#F97316/gi, NEW_BLUE);
    
    // Replace Orange RGBA (normalized)
    content = content.replace(/rgba\(249,\s*115,\s*22,\s*([0-9.]+)\)/g, 'rgba(125, 211, 252, $1)');
    content = content.replace(/rgba\(249,115,22,([0-9.]+)\)/g, 'rgba(125, 211, 252, $1)');

    // Replace Dark Backgrounds in Tailwind classes
    content = content.replace(/bg-\[#05070B\]/g, `bg-[${NEW_BG_PRIMARY}]`);
    content = content.replace(/bg-\[#061020\]/g, `bg-[${NEW_BG_PRIMARY}]`);
    content = content.replace(/bg-\[#080A0F\]/g, `bg-[${NEW_BG_SECONDARY}]`);
    content = content.replace(/bg-\[#0A0D14\]/g, `bg-[${NEW_BG_SECONDARY}]`);
    content = content.replace(/bg-black(\/[0-9]+)?/g, (match, op) => op ? `bg-white${op}` : 'bg-white');

    // Replace White Text/Borders with Dark Navy for Light Mode
    if (!file.endsWith('.css')) {
        content = content.replace(/text-white(\/[0-9]+)?/g, (match, op) => op ? `text-[${NEW_NAVY}]${op}` : `text-[${NEW_NAVY}]`);
        content = content.replace(/border-white(\/[0-9]+)?/g, (match, op) => op ? `border-[${NEW_NAVY}]${op}` : `border-[${NEW_NAVY}]`);
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log('Updated:', file);
    }
});

console.log(`Successfully updated ${changedCount} files to Frost & Ceramic theme.`);
