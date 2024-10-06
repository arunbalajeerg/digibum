import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAwa9sMKHvPEVrnVBWDWs4iIG_zn_8JAHY",
  authDomain: "imagepicker-50c0d.firebaseapp.com",
  projectId: "imagepicker-50c0d",
  storageBucket: "imagepicker-50c0d.appspot.com",
  messagingSenderId: "780822190561",
  appId: "1:780822190561:web:63c4bb6cf35a0048dedaa0",
  measurementId: "G-HK5H0L5ZPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
