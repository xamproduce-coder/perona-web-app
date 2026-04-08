const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file.includes('node_modules') || file.includes('.git')) return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Convert dark to light
    content = content.replace(/bg-black\b/g, 'bg-white');
    content = content.replace(/bg-black(\/[0-9]+)/g, 'bg-white');
    content = content.replace(/bg-\[#000000\]/g, 'bg-white');
    content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-slate-50');
    content = content.replace(/bg-\[#111111\]/g, 'bg-white');
    content = content.replace(/bg-\[#050505\]/g, 'bg-white');
    content = content.replace(/bg-\[#0d0d0d\]/g, 'bg-slate-50');
    content = content.replace(/bg-\[#101625\]/g, 'bg-slate-50');
    
    // Text to blue
    content = content.replace(/text-white\b/g, 'text-[#0066FF]');
    content = content.replace(/text-white(\/[0-9]+)/g, 'text-[#0066FF]');
    content = content.replace(/border-white\b/g, 'border-[#0066FF]');
    content = content.replace(/border-white(\/[0-9]+)/g, 'border-[#0066FF]');
    content = content.replace(/placeholder:text-white\b/g, 'placeholder:text-[#0066FF]');
    content = content.replace(/text-\[#ffffff\]/g, 'text-[#0066FF]');
    content = content.replace(/color:\s*'#ffffff'/g, 'color: \'#0066FF\'');
    content = content.replace(/from-white\b/g, 'from-[#0066FF]');
    content = content.replace(/to-white\b/g, 'to-[#0066FF]');
    content = content.replace(/via-white\b/g, 'via-[#0066FF]');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changed++;
        console.log('Updated:', file);
    }
});
console.log('Done mapping .jsx to Light Theme! Files updated:', changed);
