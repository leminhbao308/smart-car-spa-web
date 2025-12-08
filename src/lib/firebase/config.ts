import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7_FziwkhkCMxGqzs8PNgexsG3qrsXvv4",
  authDomain: "scsms-106.firebaseapp.com",
  projectId: "scsms-106",
  storageBucket: "scsms-106.firebasestorage.app",
  messagingSenderId: "94039662872",
  appId: "1:94039662872:web:4f063e8e52560b7a053e6d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
