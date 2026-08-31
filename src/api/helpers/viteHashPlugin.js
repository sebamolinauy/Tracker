// Requirements
import crypto from 'crypto';


// Exported
export const hashEnHtml = () => ({
    name: 'hash-en-html',
    enforce: 'post',
    transformIndexHtml(html) {
        const hash = crypto.randomBytes(8).toString('hex');
        return html
            .replace(/\.js"/g, `.js?v=${hash}"`)
            .replace(/\.css"/g, `.css?v=${hash}"`);
    },
});
