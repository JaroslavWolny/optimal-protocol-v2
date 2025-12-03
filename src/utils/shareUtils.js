import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Captures a DOM element as an image and shares it using the native share sheet.
 * @param {HTMLElement} element - The DOM element to capture.
 * @param {string} fileName - The name of the file to share (e.g., 'share-card.png').
 * @param {string} title - The title for the share dialog.
 * @param {string} text - The text to share along with the image.
 */
export const shareElement = async (element, fileName = 'share.png', title = 'Share', text = '') => {
    try {
        if (!element) throw new Error('Element not found');

        // 1. Capture the element
        const canvas = await html2canvas(element, {
            backgroundColor: null, // Transparent background if possible, or use specific color
            scale: 2, // Higher resolution
            useCORS: true, // Allow cross-origin images (like QR codes)
            logging: false
        });

        // 2. Convert to Base64
        const base64Data = canvas.toDataURL('image/png');

        // 3. Write to filesystem (Capacitor Share needs a file path on some platforms, or base64)
        // For Capacitor Share, we can often pass base64 directly as a file, or write it.
        // Let's try writing to cache first for better compatibility.

        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
        });

        // 4. Share
        await Share.share({
            title: title,
            text: text,
            url: savedFile.uri,
            dialogTitle: title,
        });

        return true;
    } catch (error) {
        console.error('Error sharing element:', error);
        // Fallback for web: Download the image
        if (!window.Capacitor) {
            const canvas = await html2canvas(element, { scale: 2 });
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL();
            link.click();
            return true;
        }
        return false;
    }
};
