// إعدادات Firebase الخاصة بك (تم التحديث بناءً على بياناتك)
const firebaseConfig = {
  apiKey: "AIzaSyA6BZkuinBFU2Yll0y9XyhPcdqj4LzKdp4",
  authDomain: "koko-app-d99b5.firebaseapp.com",
  databaseURL: "https://koko-app-d99b5-default-rtdb.firebaseio.com",
  projectId: "koko-app-d99b5",
  storageBucket: "koko-app-d99b5.firebasestorage.app",
  messagingSenderId: "261125877934",
  appId: "1:261125877934:web:933fae9ebc07bf9aef7d3f",
  measurementId: "G-2VR68W0NN8"
};

// تصدير الإعدادات لاستخدامها
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}
