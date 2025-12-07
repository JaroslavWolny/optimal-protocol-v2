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
            backgroundColor: '#000000',
            useCORS: true,
            allowTaint: false,
            logging: true,
            scale: 1,
            width: 1080,         // Force functionality on small screens
            height: 1920,        // Force functionality on small screens
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            foreignObjectRendering: false // Disable if causing issues, standard canvas is safer
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
