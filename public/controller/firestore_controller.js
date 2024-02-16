import {
    getFirestore,
    collection,
    addDoc,
    orderBy,
    getDocs,
    getDoc,
    query,
    doc,
    where,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"
import { app } from "./firebase_core.js";
import { CollectionName } from "../model/constants.js";
import { Thread } from "../model/Thread.js";


const db = getFirestore(app);

export async function addThread(thread) {
    const collRef = collection(db, CollectionName.threads);
    const docRef = await addDoc(collRef, thread.toFirestore());
    return docRef.id;
}

export async function addReply(reply) { // Renamed the function to addReply
    const collRef = collection(db, CollectionName.replies);
    const docRef = await addDoc(collRef, reply.toFirestore());
    return docRef.id;
}

export async function getThreadList() {
    let threadList = [];
    const q = query(collection(db, CollectionName.threads),
        orderBy('timestamp', 'desc'));
    const snapShot = await getDocs(q);
    snapShot.forEach(doc => {
        const t = new Thread(doc.data());
        t.set_docId(doc.id);
        threadList.push(t);
    });
    return threadList;
}

export async function getThreadById(threadId) {
    const docRef = doc(db, CollectionName.threads, threadId);
    const docSnap = await getDoc(docRef);
    if(!docSnap.exists()) {
        return null;
    }
    const t = new Thread(docSnap.data());
    t.set_docId(threadId);
    return t;
}

export async function getReplyList(threadId) {
    const q = query(collection(db, CollectionName.replies),
    where('threadId', '==', threadId),
    orderBy('timestamp'));
    const snapShot = await getDocs(q);

    const replies = [];
    snapShot.forEach(doc =>{
        const r = new Reply(doc.data());
        r.set_docId(doc.id);
        replies.push(r);
    })
    return replies;
}