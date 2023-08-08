import { collection, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase-setup";

export async function deleteFromDB(id) {
  try {
    await deleteDoc(doc(db, "entry", id));
  } catch (e) {
    console.log("delete error: ", e);
  }
}
export async function writeToDB(entry) {
  try {
    const docRef = await addDoc(collection(db, "entry"), entry);
  } catch (e) {
    console.log("write error: ", e);
  }
}
export async function setToDB(entry) {
  try {
    const docRef = await setDoc(doc(db, "entry", entry.id), entry, {merge:true});
  } catch (e) {
    console.log("Set error: ", e);
  }
}

