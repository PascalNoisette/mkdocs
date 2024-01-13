import { definePreparserSetup } from '@slidev/types'
import fs from 'fs';
import path from 'path';

export default definePreparserSetup(({filepath, headmatter, ...opts}) => {

    let/*'s*/ processIncludesRecursively = headmatter.includes??false;
    let/*'s*/ autoBreakPages = headmatter.autoBreakPages??false;

    return [
    {
        /**
         * Define a new instruction `includes: <path>` in headmatter.
         * 
         * All markdown files inside directory <path> are going to be added recursively
         * as https://sli.dev/guide/syntax.html#multiple-entries
        */
        transformRawLines(lines: string[]) {
                
            if (!processIncludesRecursively) {
                return;
            }
            processIncludesRecursively = false; // avoid loop

            const files: string[] = fs.readdirSync(path.join(path.dirname(filepath), headmatter.includes), {recursive: true});
            const isCover = (file) => (headmatter.src??false) && path.basename(headmatter.src??false) == path.basename(file);
            files.filter((file)=>file.endsWith('.md') && !isCover(file))
                .forEach((file) => {
                console.log(`Adding ${headmatter.includes}/${file}`)
                lines.push('---')
                lines.push(`src: ${headmatter.includes}/${file}`)
                lines.push('---')
            });
        },
    },
    {
        /**
         * Define a new instruction `autoBreakPages: <bool>` in headmatter.
         *
         * All markdown headers will cause a page break, this make markdown easier to read without dash everywhere
        */
        transformRawLines(lines: string[]) {
                const lineBreakSymbols = ['', '---', ''];
                const lineNumbersToBreak:number[] = [];
                if (!autoBreakPages) {
                    return;
                }

                lines.reduce((previousLineWasAlreadyBreak, line, index) => {
                    if (line.startsWith('#') && !previousLineWasAlreadyBreak) {
                        lineNumbersToBreak.push(index+lineBreakSymbols.length*lineNumbersToBreak.length);
                    }
                    return line == '---' || line.startsWith('#') || (previousLineWasAlreadyBreak && line.trim().length === 0);
                }, true);

                lineNumbersToBreak.forEach(index=>lines.splice(index, 0, ...lineBreakSymbols));
            }
        }
    ];
})
