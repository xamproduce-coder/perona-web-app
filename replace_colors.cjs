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
        } else if (file.endsWith('.css') || file.endsWith('.jsx') || file.endsWith('.js')) {
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
    
    // Hex colors
    content = content.replace(/#318CE7/gi, '#1D4ED8'); // Primary accent
    content = content.replace(/#63A4FF/gi, '#3B82F6'); // Light accent
    content = content.replace(/#1B75D0/gi, '#2563EB'); // Hover 
    content = content.replace(/#184673/gi, '#1E3A8A'); // Dim
    
    // RGB colors for shadow/glows
    content = content.replace(/49,\s*140,\s*231/g, '29, 78, 216');
    content = content.replace(/49,140,231/g, '29,78,216');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changed++;
        console.log('Updated:', file);
    }
});
console.log('Done! Files updated to Navy:', changed);
