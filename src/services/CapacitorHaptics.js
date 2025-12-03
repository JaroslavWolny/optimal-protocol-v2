import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const CapacitorHaptics = {
    /**
     * Triggers an impact haptic feedback.
     * @param {number} intensity - Intensity from 0.0 to 1.0. 
     *                             Maps to Light (<=0.3), Medium (<=0.7), or Heavy (>0.7).
     */
    playImpact: async (intensity = 1.0) => {
        try {
            let style = ImpactStyle.Medium;
            if (intensity <= 0.3) {
                style = ImpactStyle.Light;
            } else if (intensity > 0.7) {
                style = ImpactStyle.Heavy;
            }

            await Haptics.impact({ style });
        } catch (error) {
            console.warn('Haptics.impact failed:', error);
        }
    },

    /**
     * Triggers a success notification haptic feedback.
     * Replaces the "Charge Up" sensation from Swift.
     */
    playSuccess: async () => {
        try {
            await Haptics.notification({ type: NotificationType.Success });
        } catch (error) {
            console.warn('Haptics.notification (success) failed:', error);
        }
    },

    /**
     * Triggers an error notification haptic feedback.
     * Replaces the "Glitch" sensation from Swift.
     */
    playError: async () => {
        try {
            await Haptics.notification({ type: NotificationType.Error });
        } catch (error) {
            console.warn('Haptics.notification (error) failed:', error);
        }
    },

    /**
     * Triggers a selection changed haptic feedback.
     * Useful for UI selection changes.
     */
    selectionChanged: async () => {
        try {
            await Haptics.selectionChanged();
        } catch (error) {
            console.warn('Haptics.selectionChanged failed:', error);
        }
    }
};

export default CapacitorHaptics;
