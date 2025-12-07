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
            backgroundColor: null,
            useCORS: true, // Critical for external clean images
            allowTaint: true, // Allow tainted images if CORS fails (fallback)
            logging: false,
            scale: 1, // Native resolution (card is already 1080p)
        });

        // 2. Platform Check
        const isNative = window.Capacitor && window.Capacitor.isNativePlatform();

        if (isNative) {
            // --- NATIVE SHARING (Capacitor) ---
            const base64Data = canvas.toDataURL('image/png');
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache
            });

            await Share.share({
                title: title,
                text: text,
                url: savedFile.uri,
                dialogTitle: title,
            });
        } else {
            // --- WEB SHARING (Download Fallback) ---
            // Web Share API Level 2 supports files, but support is spotty.
            // For now, we force download which is reliable.
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        return true;
    } catch (error) {
        console.error('Error sharing element:', error);
        return false;
    }
};
