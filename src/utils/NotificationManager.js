export class NotificationManager {
    constructor() {
        this.permission = null;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    send(title, body, tag) {
        if (this.permission === 'granted') {
            const options = {
                body,
                icon: '/icon-192.png', // Assuming we have an icon or will have one
                tag, // Prevents duplicate notifications
                renotify: true,
                requireInteraction: true // Goggins style: make them dismiss it manually
            };
            new Notification(title, options);
        }
    }

    // Check time and status to trigger aggressive messages
    checkRoutine(habits, history) {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const todayStr = now.toISOString().split('T')[0];
        const completedCount = (history[todayStr] || []).length;
        const totalHabits = habits.length;
        const isAllDone = totalHabits > 0 && completedCount === totalHabits;

        // 06:00 - Wake up call
        if (hour === 6 && minute === 0) {
            this.send("THE ENEMY IS TRAINING", "While you sleep, they are getting stronger. GET UP.", "wakeup");
        }

        // 20:00 - Evening check
        if (hour === 20 && minute === 0 && !isAllDone) {
            this.send("MEDIOCRE PERFORMANCE DETECTED", "The day is almost over and you are still average. FIX IT.", "evening_check");
        }

        // Random "Tough Love" checks (e.g., if idle for too long - hard to detect without more logic, so sticking to time)
    }
}

export const notificationManager = new NotificationManager();
