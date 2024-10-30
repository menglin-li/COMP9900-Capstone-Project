// Import the necessary modules
const sharp = require('sharp');
const { processImage } = require('../../utils/processImage'); // Adjust the path as necessary

// Mock sharp
jest.mock('sharp');

describe('processImage', () => {
    const mockBuffer = Buffer.from('test');
    const resizedBuffer = Buffer.from('resized image');

    beforeEach(() => {
        sharp.mockClear();
    });

    it('should process and resize the image correctly', async () => {
        // Setup sharp to resolve with a buffer on resize
        sharp.mockImplementation(() => ({
            resize: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(resizedBuffer),
        }));

        const result = await processImage(mockBuffer);
        expect(result).toEqual(resizedBuffer.toString('base64'));
        expect(sharp).toHaveBeenCalledWith(mockBuffer);
    });

    it('should throw an error if image processing fails', async () => {
        // Setup sharp to throw an error
        sharp.mockImplementation(() => ({
            resize: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockRejectedValue(new Error('Processing failed')),
        }));

        await expect(processImage(mockBuffer)).rejects.toThrow('Failed to process image');
    });
});
