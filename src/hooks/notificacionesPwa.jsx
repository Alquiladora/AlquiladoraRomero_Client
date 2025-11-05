/* eslint-disable */
import api from "../utils/AxiosConfig";


const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};


const getVapidKey = async (csrfToken) => {
    try {
        const response = await api.get('/api/usuarios/config/vapid-public-key', {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken },
        });

        if (response.data && response.data.publicKey) {
            return response.data.publicKey;
        }
        throw new Error('Clave VAPID pública no encontrada en la respuesta del servidor.');
    } catch (error) {
        console.error('⚠️ Error al obtener la clave VAPID del servidor:', error);
        throw error;
    }
};


const showSimpleDesktopNotification = (title, body) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/icons/favicon-96x96.png',
        });
    }
};

let isSubscribing = false;

export const subscribeUserToPush = async (userId, csrfToken) => {

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn("❌ Notificaciones Push no soportadas por este navegador.");
        return;
    }
    let permission = Notification.permission;

    if (permission === 'default') {
        permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
        console.warn("⛔ Suscripción abortada: Permiso de notificación denegado o cerrado.");
        return;
    }

    console.log("✅ Permiso de notificación concedido.");
    if (isSubscribing) {
        console.warn("🛡️ Bloqueando intento doble de suscripción.");
        return;
    }

    const SESSION_KEY = 'welcome_notified_' + userId;
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        console.log("Notificación de bienvenida ya mostrada en esta sesión. Abortando.");
        isSubscribing = false;
        return;
    }


    try {
        isSubscribing = true;
        const vapidKey = await getVapidKey(csrfToken);

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        let shouldShowWelcome = false;

        if (!subscription) {
            console.log("⏳ Creando nueva suscripción...");
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
            console.log("🎉 Nueva clave de suscripción generada.");
            shouldShowWelcome = true;

        } else {
            console.log("🔔 Usuario ya suscrito. Actualizando estado en el servidor.");
            shouldShowWelcome = true;
        }

        await api.post('/api/usuarios/suscripcion', {
            userId: userId,
            subscription: subscription,
            permissionStatus: 'granted'
        }, {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken }
        });

        console.log("🚀 Clave de suscripción enviada y guardada/actualizada en el servidor.");
        if (shouldShowWelcome) {
            showSimpleDesktopNotification(
                "¡Dispositivo Vinculado!",
                "Este navegador ya tenía permisos. Las notificaciones están ahora activas para tu cuenta."
            );
            sessionStorage.setItem(SESSION_KEY, 'true');
        }


    } catch (error) {
        console.error("⚠️ Error fatal en el proceso de suscripción Push:", error);
    } finally {
        isSubscribing = false;
    }
};

//Eliminar la suscripcion de notificaciones
export const unsubscribeUserFromPush = async (csrfToken) => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await api.post('/api/usuarios/desuscripcion', {
                endpoint: subscription.endpoint,
            }, {
                withCredentials: true,
                headers: { 'X-CSRF-Token': csrfToken }
            });
            console.log("Servidor notificado de la desuscripción.");


        }
    } catch (error) {
        console.error("⚠️ Error al desuscribir:", error);
    }

}