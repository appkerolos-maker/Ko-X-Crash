/**
 * نظام المزامنة مع Firebase
 * هذا الملف مسؤول عن نقل البيانات من التخزين المحلي إلى السحاب لكي يراها الأدمن
 */

let db;

function initFirebase() {
    if (typeof firebase === 'undefined') return;
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        
        // مزامنة فورية عند الاتصال لضمان رؤية البيانات من الأجهزة الأخرى
        syncFromFirebase();
        
        console.log("Firebase Global Sync Active");
    } catch (error) {
        console.error("Firebase Init Error:", error);
    }
}

// تعديل دالة المزامنة من السحاب لتحديث حالة النشاط
function syncFromFirebase() {
    if (!db) return;

    // مزامنة المستخدمين والرصيد والنشاط
    db.ref('users').on('value', (snapshot) => {
        const remoteUsers = snapshot.val();
        if (!remoteUsers) return;

        const localUsers = JSON.parse(localStorage.getItem('melcrash_users') || "[]");
        const localBalances = JSON.parse(localStorage.getItem('melcrash_user_balances') || "{}");
        const localActivity = JSON.parse(localStorage.getItem('melcrash_user_activity') || "{}");

        Object.keys(remoteUsers).forEach(username => {
            const remoteUser = remoteUsers[username];
            const localUser = localUsers.find(u => u.username === username);
            
            // تحقق من الحظر للمستخدم الحالي
            if (username === localStorage.getItem('melcrash_session') && remoteUser.isBanned) {
                localStorage.removeItem('melcrash_session');
                alert("تم حظر حسابك بسبب استخدام برامج غش");
                window.location.reload();
                return;
            }

            if (!localUser) {
                localUsers.push({
                    userId: remoteUser.userId || `U${Date.now()}`,
                    username: username,
                    password: remoteUser.password || "123456",
                    limitX2: remoteUser.limitX2 || false,
                    limit150: remoteUser.limit150 || false,
                    limit115: remoteUser.limit115 || false,
                    scriptMode: remoteUser.scriptMode || false
                });
            } else {
                // تحديث الإعدادات للمستخدم الحالي
                localUser.limitX2 = remoteUser.limitX2 || false;
                localUser.limit150 = remoteUser.limit150 || false;
                localUser.limit115 = remoteUser.limit115 || false;
                localUser.scriptMode = remoteUser.scriptMode || false;
            }
            localBalances[username] = remoteUser.balance || 0;
            // تحديث بيانات الرهان ونقطة الانفجار محلياً لسهولة الوصول
            localUser.currentBet = remoteUser.currentBet || null;
            localUser.currentCrash = remoteUser.currentCrash || null;
            // تحديث النشاط محلياً للأدمن
            if (remoteUser.lastAt) {
                localActivity[username] = { lastAt: remoteUser.lastAt };
            }
        });

        localStorage.setItem('melcrash_users', JSON.stringify(localUsers));
        localStorage.setItem('melcrash_user_balances', JSON.stringify(localBalances));
        localStorage.setItem('melcrash_user_activity', JSON.stringify(localActivity));
        
        if (typeof updateTopBalance === 'function') updateTopBalance();
    });

    // مزامنة طلبات الإيداع للجميع (لاعب وأدمن)
    db.ref('deposits').on('value', (snapshot) => {
        const remoteDeposits = snapshot.val();
        if (remoteDeposits) {
            // جلب الصور بشكل متوازي لضمان ظهورها
            db.ref('deposit_images').once('value', (imgSnapshot) => {
                const images = imgSnapshot.val() || {};
                const list = Object.values(remoteDeposits).map(req => {
                    let finalImageData = "";
                    const imgObj = images[req.id];
                    if (imgObj) {
                        if (imgObj.isSplit && imgObj.parts) {
                            finalImageData = imgObj.parts.join('');
                        } else {
                            finalImageData = imgObj.imageData;
                        }
                    }
                    return { ...req, imageData: finalImageData };
                }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                localStorage.setItem('melcrash_deposit_requests', JSON.stringify(list));
                if (typeof renderPlayerTransactions === 'function') renderPlayerTransactions();
            });
        }
    });

    // مزامنة طلبات السحب للجميع
    db.ref('withdrawals').on('value', (snapshot) => {
        const remoteWithdrawals = snapshot.val();
        if (remoteWithdrawals) {
            const list = Object.values(remoteWithdrawals).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            localStorage.setItem('melcrash_withdrawal_requests', JSON.stringify(list));
            if (typeof renderPlayerTransactions === 'function') renderPlayerTransactions();
        }
    });

    // مزامنة سجل العمليات (Transactions) للجميع لضمان تحديث الحالة
    db.ref('transactions').on('value', (snapshot) => {
        const remoteTxs = snapshot.val();
        if (remoteTxs) {
            const list = Object.values(remoteTxs).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            localStorage.setItem('melcrash_transactions', JSON.stringify(list));
            if (typeof renderPlayerTransactions === 'function') renderPlayerTransactions();
        }
    });

    // استماع للإشعارات الخاصة بالمستخدم الحالي
    const currentLocalUser = localStorage.getItem('melcrash_session');
    if (currentLocalUser) {
        db.ref(`notifications/${currentLocalUser}`).on('child_added', (snapshot) => {
            const notification = snapshot.val();
            if (!notification) return;

            const isRecent = (Date.now() - new Date(notification.createdAt).getTime()) < 60000; // آخر دقيقة
            if (isRecent) {
                const localNotifications = JSON.parse(localStorage.getItem('melcrash_user_notifications') || "[]");
                if (!localNotifications.find(n => n.id === notification.id)) {
                    localNotifications.unshift(notification);
                    localStorage.setItem('melcrash_user_notifications', JSON.stringify(localNotifications));
                    
                    // إظهار الإشعار فوراً في اللعبة
                    if (typeof showUnreadNotificationsForUser === 'function') {
                        showUnreadNotificationsForUser(currentLocalUser);
                    }
                }
            }
        });

        // استماع خاص لرصيد المستخدم الحالي لضمان المزامنة الفورية
        db.ref(`users/${currentLocalUser}/balance`).on('value', (snapshot) => {
            const remoteBalance = snapshot.val();
            if (remoteBalance !== null) {
                const localBalances = JSON.parse(localStorage.getItem('melcrash_user_balances') || "{}");
                if (localBalances[currentLocalUser] !== remoteBalance) {
                    localBalances[currentLocalUser] = remoteBalance;
                    localStorage.setItem('melcrash_user_balances', JSON.stringify(localBalances));
                    if (typeof updateTopBalance === 'function') updateTopBalance();
                    console.log("Current user balance updated from specific listener:", remoteBalance);
                }
            }
        });
    }

    // استماع لتحديثات العمليات (للاعب فقط)
    db.ref('transactions').limitToLast(1).on('child_added', (snapshot) => {
        const tx = snapshot.val();
        if (!tx) return;

        const isRecent = (Date.now() - new Date(tx.createdAt).getTime()) < 10000;
        const currentLocalUser = localStorage.getItem('melcrash_session');
        
        if (isRecent && tx.username === currentLocalUser) {
            if (tx.status === 'approved') {
                sendLocalNotification("تم قبول العملية ✅", `تم قبول طلب ${tx.type === 'deposit' ? 'الإيداع' : 'السحب'} بنجاح: ${tx.amount} ج.م`);
            } else if (tx.status === 'rejected') {
                sendLocalNotification("تم رفض العملية ❌", `للأسف تم رفض طلب ${tx.type === 'deposit' ? 'الإيداع' : 'السحب'}: ${tx.amount} ج.م`);
            }
        }
    });
}

// مزامنة طلب إيداع للسحاب
async function syncDepositRequest(request) {
    if (!db) {
        console.error("Firebase DB not initialized for deposit sync");
        throw new Error("قاعدة البيانات غير متصلة");
    }
    try {
        console.log("Attempting to sync deposit:", request.id);
        
        // إنشاء نسخة من الطلب بدون الصورة لتقليل الحجم لضمان المزامنة
        const { imageData, ...requestWithoutImage } = request;
        
        // إرسال البيانات الأساسية أولاً
        await db.ref('deposits/' + request.id).set(requestWithoutImage);
        console.log("Basic deposit data synced");

        // محاولة إرسال الصورة بشكل منفصل إذا كانت موجودة
        if (imageData) {
            // تقسيم الصورة إذا كانت كبيرة جداً (أكثر من 200 كيلوبايت لزيادة الأمان)
            const CHUNK_SIZE = 200000; 
            if (imageData.length > CHUNK_SIZE) {
                console.log("Large image detected, splitting into chunks...");
                const parts = [];
                for (let i = 0; i < imageData.length; i += CHUNK_SIZE) {
                    parts.push(imageData.substring(i, i + CHUNK_SIZE));
                }
                
                // إرسال الأجزاء جزءاً تلو الآخر لضمان عدم التحميل الزائد
                await db.ref('deposit_images/' + request.id).set({ 
                    isSplit: true,
                    count: parts.length,
                    createdAt: new Date().toISOString()
                });

                for (let i = 0; i < parts.length; i++) {
                    await db.ref('deposit_images/' + request.id + '/parts/' + i).set(parts[i]);
                    console.log(`Synced image part ${i+1}/${parts.length}`);
                }
            } else {
                await db.ref('deposit_images/' + request.id).set({ 
                    imageData,
                    isSplit: false,
                    createdAt: new Date().toISOString()
                });
            }
        }
        
        console.log("Deposit synced successfully to cloud");
        return true;
    } catch (e) { 
        console.error("Deposit sync error:", e);
        throw e;
    }
}

async function syncWithdrawalRequest(request) {
    if (!db) {
        console.error("Firebase DB not initialized for withdrawal sync");
        return;
    }
    try {
        console.log("Attempting to sync withdrawal:", request.id);
        await db.ref('withdrawals/' + request.id).set(request);
        console.log("Withdrawal synced successfully to cloud");
    } catch (e) { 
        console.error("Withdrawal sync error:", e);
        alert("خطأ في مزامنة السحب: " + e.message);
    }
}

async function syncTransaction(transaction) {
    if (!db) {
        console.error("Firebase DB not initialized for transaction sync");
        return;
    }
    try {
        await db.ref('transactions/' + transaction.id).set(transaction);
        console.log("Transaction synced successfully:", transaction.id);
    } catch (e) { console.error("Transaction sync error:", e); }
}

// وظيفة لتقليل حجم الصورة قبل الإرسال لضمان نجاح المزامنة
async function compressImage(base64Str, maxWidth = 800) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // ضغط الجودة لـ 70%
        };
        img.onerror = () => resolve(base64Str); // في حال الفشل نرسل الأصل
    });
}

// وظيفة إرسال إشعار للنظام (Web Notifications)
function sendLocalNotification(title, body) {
    if (!("Notification" in window)) return;
    
    const showNotification = () => {
        const options = {
            body: body,
            icon: './icon.ico',
            badge: './icon.ico',
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
            tag: 'melcrash-important',
            renotify: true,
            requireInteraction: true, // يجعل الإشعار لا يختفي حتى يضغط عليه المستخدم (مثل واتساب)
            actions: [
                { action: 'open', title: 'فتح اللعبة' }
            ]
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, options);
            });
        } else {
            new Notification(title, options);
        }
    };

    if (Notification.permission === "granted") {
        showNotification();
    } else {
        Notification.requestPermission().then(p => {
            if (p === "granted") showNotification();
        });
    }
}

// طلب الإذن عند التحميل بشكل صريح لضمان تفاعل WebView
window.addEventListener('load', () => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        setTimeout(() => {
            Notification.requestPermission().then(permission => {
                console.log("Notification permission:", permission);
            });
        }, 3000); // تأخير بسيط لضمان تحميل الصفحة
    }
});

// مزامنة مستخدم جديد
async function syncUserAccount(userData) {
    if (!db) return;
    try {
        await db.ref('users/' + userData.username).update({
            userId: userData.userId,
            username: userData.username,
            password: userData.password,
            balance: userData.balance || 0,
            lastAt: new Date().toISOString()
        });
    } catch (e) { console.error(e); }
}

// مزامنة رصيد المستخدم للسحاب عند كل تغيير (مكسب أو خسارة) مع إرسال سجل الجولة
async function syncUserBalance(username, newBalance, profitData = null) {
    if (!db) return;
    try {
        const updates = { 
            balance: newBalance,
            lastAt: new Date().toISOString()
        };
        await db.ref('users/' + username).update(updates);
        
        // إذا كان هناك بيانات جولة (مكسب/خسارة)، أرسلها للسحاب
        if (profitData) {
            const historyId = `H${Date.now()}`;
            await db.ref('game_history/' + username + '/' + historyId).set({
                profit: profitData.profit,
                multiplier: profitData.multiplier || 0,
                createdAt: new Date().toISOString()
            });
        }
        
        console.log("Balance and history synced for:", username);
    } catch (e) { console.error("Balance/History sync error:", e); }
}

// تحديث حالة النشاط بشكل دوري
async function syncActivity(username) {
    if (!db || !username) return;
    try {
        await db.ref('users/' + username).update({
            lastAt: new Date().toISOString()
        });
    } catch (e) { console.error("Activity sync error:", e); }
}

// مزامنة التوقع لبرنامج Predictor
async function syncPrediction(value) {
    if (!db) return;
    try {
        await db.ref('current_prediction').set({
            value: value,
            at: new Date().toISOString()
        });
    } catch (e) { console.error("Prediction sync error:", e); }
}
