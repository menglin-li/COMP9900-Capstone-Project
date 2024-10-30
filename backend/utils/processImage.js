const sharp = require('sharp');

// 图片处理函数，返回一个 Promise
function processImage(buffer) {
    return sharp(buffer)
        .resize(1024) // 将最大尺寸限制为1024x1024px
        .toBuffer()
        .then(resizedBuffer => resizedBuffer.toString('base64'))
        .catch(err => {
            throw new Error('Failed to process image');
        });
}
module.exports = { processImage }; 
