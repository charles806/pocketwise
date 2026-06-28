import  { cert, initializeApp } from "firebase-admin"
import { getApps } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set in environment variables");
}

const serviceAccount = JSON.parse(serviceAccountJson)

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

export const fcmMessaging = getMessaging();

