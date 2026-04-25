// ================== Global Variables ==================
var curr = 'en';
var tempLang = 'en';
var currentRating = 0;
var API_BASE_URL='https://pindown-backend-api.onrender.com';

// Firebase Config
var firebaseConfig = {
    apiKey: "AIzaSyD65Kp2FGBAhWAwAK_xTQCtwZh", 
    authDomain: "pindown-feedback.firebaseapp.com",
    databaseURL: "https://pindown-feedback-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pindown-feedback",
    storageBucket: "pindown-feedback.appspot.com",
    messagingSenderId: "950579410414",
    appId: "1:950579410414:web:967548a2602cc",
    measurementId: "G-2NV4C419K2"
};

// Firebase initialization will happen after load event
var db;
window.addEventListener('load', function() {
    if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
    }
    // Ensure theme & language also load
    loadTheme();
    loadLanguage();
    // Hide loader with transition
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("loader-hidden");
            loader.addEventListener("transitionend", () => {
                loader.style.display = "none";
            }, { once: true });
        }, 4000);
    }
});

// ================== Feedback ==================
let currentCategory = "";

function selectCategory(btn, category) {
    document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = category;
}

// ---------- Helper Functions ----------
function showFieldError(inputId, msg) {
    var input = document.getElementById(inputId);
    if (input) input.classList.add('error-border');
    var errorSpan = document.getElementById(inputId + '-error');
    if (errorSpan) {
        errorSpan.innerText = msg;
        errorSpan.style.display = 'block';
    }
}

function clearFieldError(inputId) {
    var input = document.getElementById(inputId);
    if (input) input.classList.remove('error-border');
    var errorSpan = document.getElementById(inputId + '-error');
    if (errorSpan) {
        errorSpan.innerText = '';
        errorSpan.style.display = 'none';
    }
}

// ---------- Updated submitFeedback ----------
function submitFeedback() {
    var feedbackArea = document.getElementById('f-area');
    var nickNameInput = document.getElementById('f-nickname');
    var text = feedbackArea.value.trim();
    var nickname = nickNameInput ? nickNameInput.value.trim() : '';

    // Reset all errors
    clearFieldError('f-nickname');
    clearFieldError('f-area');

    var hasError = false;

    if (!currentCategory) {
        alert("Please select a category!");
        return;
    }

    if (!nickname || nickname.length < 3) {
        showFieldError('f-nickname', 'Minimum 3 letters required');
        if (nickNameInput) nickNameInput.focus();
        hasError = true;
    }

    if (!text || text.length < 7) {
        showFieldError('f-area', 'Minimum 7 letters required');
        if (!hasError) feedbackArea.focus();
        hasError = true;
    }

    if (hasError) return;

    if (!db) {
        showToast("Firebase not connected. Please try again later.");
        return;
    }

    db.ref('feedbacks').push({
        category: currentCategory,
        nickname: nickname,
        message: text,
        timestamp: new Date().toISOString(),
        userName: "Unknown",
        device: "Anonymous"
    })
    .then(function() {
        showToast("Thanks! We'll handle it.");
        feedbackArea.value = '';
        if (nickNameInput) nickNameInput.value = '';
        document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
        currentCategory = "";
        clearFieldError('f-nickname');
        clearFieldError('f-area');
        setTimeout(function() {
            if (typeof closePage === "function") closePage('feedbackPage');
        }, 2000);
    })
    .catch(function(error) {
        alert("Error: " + error.message);
    });}
    
  
function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast-noti";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

// ================== Language Data (8 languages) ==================
var langData = {
    en: { 
        main: "PINTEREST DOWNLOADER", 
        in: "Paste Pinterest link here...", 
        pas: "PASTE", 
        get: "GET VIDEO", 
        dl: "DOWNLOAD NOW", 
        hist: "Download History", 
        lang: "Language: English", 
        abt: "About App", 
        priv: "Privacy Policy", 
        rate: "Rate Us", 
        feed: "Feedback", 
        lt: "Select Language", 
        lc: "Cancel", 
        lch: "Apply", 
        proc: "PROCESSING...", 
        err: "Failed to get video. Please check your link and try again.", 
        h_title: "Download History", 
        h_clear: "Clear All", 
        r_desc: "Enjoying the app? Rate us!", 
        f_desc: "Tell us what you think! Your feedback helps us improve.", 
        abt_page: "<h4>Version 2.0</h4><p>PinDown Pro is the ultimate Pinterest downloader with support for HD videos, images, and GIFs.</p><h4>Developer</h4><p>Mg Chit San Maung <br> PLCU (Plang Long)       </p><h4>Features</h4><p>✓ HD Video Downloads<br>✓ Multi-language Support<br>✓ Download History<br>✓ Dark/Light Theme</p>", 
        priv_page: "<h4>Data Collection</h4><p>We do not collect any personal data. All download history is stored locally on your device only.</p><h4>Security</h4><p>Your privacy is our priority. No login required, no data tracking.</p>",
        empty: "No downloads yet",
        help_title: "How to Download",
        step1: "Open Pinterest app and find the video you want to download",
        step2: "Tap the share button and copy the link",
        step3: "Open PinDown Pro and paste the link",
        step4: "Tap \"GET VIDEO\" and wait for processing",
        step5: "Tap \"DOWNLOAD NOW\" to save the video",
        server_err: "Cannot connect to server. Make sure Termux is running."
    },
    my: { 
        main: "Pinterest ဗီဒီယိုဒေါင်းလုဒ်", 
        in: "Pinterest လင့်ခ်ကို ဤနေရာတွင်ထည့်ပါ...", 
        pas: "ကူးမည်", 
        get: "ဗီဒီယိုရယူမည်", 
        dl: "ဒေါင်းလုဒ်လုပ်မည်", 
        hist: "ဒေါင်းလုဒ်မှတ်တမ်း", 
        lang: "ဘာသာစကား: မြန်မာ", 
        abt: "အက်ပ်အကြောင်း", 
        priv: "ကိုယ်ရေးလုံခြုံမှု", 
        rate: "အဆင့်သတ်မှတ်ရန်", 
        feed: "တုံ့ပြန်ချက်ပေးရန်", 
        lt: "ဘာသာစကားရွေးချယ်ပါ", 
        lc: "မလုပ်တော့ပါ", 
        lch: "လက်ခံမည်", 
        proc: "လုပ်ဆောင်နေသည်...", 
        err: "ဗီဒီယိုရယူ၍မရပါ။ လင့်ခ်ကို စစ်ပြီး ထပ်စမ်းကြည့်ပါ။", 
        h_title: "ဒေါင်းလုဒ်မှတ်တမ်း", 
        h_clear: "အားလုံးဖျက်မည်", 
        r_desc: "အက်ပ်ကို ကြိုက်နှစ်သက်ပါသလား?", 
        f_desc: "သင့်ထင်မြင်ချက်များကို ဖော်ပြပေးပါ။", 
        abt_page: "<h4>ဗားရှင်း ၂.၀</h4><p>PinDown Pro သည် HD ဗီဒီယိုများ၊ ပုံများနှင့် GIF များကို ထောက်ပံ့သော အဆင့်မြင့် Pinterest downloader ဖြစ်ပါသည်။</p><h4>ဖန်တီးသူ</h4><p>Mg Chit San Maung</p>", 
        priv_page: "<h4>ဒေတာစုဆောင်းခြင်း</h4><p>ကိုယ်ရေးအချက်အလက် မစုဆောင်းပါ။ ဒေါင်းလုဒ်မှတ်တမ်းများကို သင့်အက်ပ်တွင်သာ သိမ်းဆည်းထားပါသည်။</p>",
        empty: "ဒေါင်းလုဒ်မရှိသေးပါ",
        help_title: "ဒေါင်းလုဒ်လုပ်နည်း",
        step1: "Pinterest အက်ပ်ဖွင့်ပြီး ဒေါင်းလုဒ်လုပ်ချင်တဲ့ ဗီဒီယိုကို ရှာပါ",
        step2: "Share ခလုတ်ကို နှိပ်ပြီး လင့်ခ်ကို ကူးယူပါ",
        step3: "PinDown Pro ဖွင့်ပြီး လင့်ခ်ကို ထည့်ပါ",
        step4: "\"ဗီဒီယိုရယူမည်\" ကို နှိပ်ပြီး စောင့်ပါ",
        step5: "\"ဒေါင်းလုဒ်လုပ်မည်\" နှိပ်ပြီး ဗီဒီယိုကို သိမ်းပါ",
        server_err: "ဆာဗာနှင့်ချိတ်ဆက်၍မရပါ။ Termux run နေပါသလားစစ်ပါ။"
    },
    id: { 
        main: "PENGUNDUH PINTEREST", 
        in: "Tempel tautan Pinterest di sini...", 
        pas: "TEMPEL", 
        get: "DAPATKAN VIDEO", 
        dl: "UNDUH SEKARANG", 
        hist: "Riwayat Unduhan", 
        lang: "Bahasa: Indonesia", 
        abt: "Tentang Aplikasi", 
        priv: "Kebijakan Privasi", 
        rate: "Beri Nilai", 
        feed: "Umpan Balik", 
        lt: "Pilih Bahasa", 
        lc: "Batal", 
        lch: "Terapkan", 
        proc: "Memproses...", 
        err: "Gagal mendapatkan video. Periksa tautan dan coba lagi.", 
        h_title: "Riwayat", 
        h_clear: "Hapus Semua", 
        r_desc: "Suka aplikasinya? Beri kami bintang!", 
        f_desc: "Beri tahu kami pendapat Anda!", 
        abt_page: "<h4>Versi 2.0</h4><p>PinDown Pro adalah pengunduh Pinterest ultimate dengan dukungan untuk video HD, gambar, dan GIF.</p><h4>Pengembang</h4><p>Mg Chit San Maung</p>", 
        priv_page: "<h4>Privasi</h4><p>Kami tidak mengumpulkan data pribadi apa pun. Semua riwayat unduhan disimpan secara lokal di perangkat Anda.</p>",
        empty: "Belum ada unduhan",
        help_title: "Cara Mengunduh",
        step1: "Buka aplikasi Pinterest dan temukan video yang ingin diunduh",
        step2: "Ketuk tombol bagikan dan salin tautan",
        step3: "Buka PinDown Pro dan tempel tautan",
        step4: "Ketuk \"DAPATKAN VIDEO\" dan tunggu pemrosesan",
        step5: "Ketuk \"UNDUH SEKARANG\" untuk menyimpan video",
        server_err: "Tidak dapat terhubung ke server. Pastikan Termux berjalan."
    },
    th: { 
        main: "ตัวดาวน์โหลด PINTEREST", 
        in: "วางลิงก์ Pinterest ที่นี่...", 
        pas: "วาง", 
        get: "รับวิดีโอ", 
        dl: "ดาวน์โหลดตอนนี้", 
        hist: "ประวัติการดาวน์โหลด", 
        lang: "ภาษา: ไทย", 
        abt: "เกี่ยวกับแอป", 
        priv: "นโยบายความเป็นส่วนตัว", 
        rate: "ให้คะแนน", 
        feed: "ข้อเสนอแนะ", 
        lt: "เลือกภาษา", 
        lc: "ยกเลิก", 
        lch: "ใช้งาน", 
        proc: "กำลังดำเนินการ...", 
        err: "ไม่สามารถรับวิดีโอได้ กรุณาตรวจสอบลิงก์และลองอีกครั้ง", 
        h_title: "ประวัติ", 
        h_clear: "ล้างทั้งหมด", 
        r_desc: "ชอบแอปนี้ไหม? ให้คะแนนเรา!", 
        f_desc: "บอกเราว่าคุณคิดอย่างไร!", 
        abt_page: "<h4>เวอร์ชัน 2.0</h4><p>PinDown Pro เป็นตัวดาวน์โหลด Pinterest ที่รองรับวิดีโอ HD, รูปภาพ และ GIF</p><h4>ผู้พัฒนา</h4><p>Mg Chit San Maung</p>", 
        priv_page: "<h4>ความเป็นส่วนตัว</h4><p>เราไม่เก็บรวบรวมข้อมูลส่วนบุคคลใดๆ ประวัติการดาวน์โหลดทั้งหมดจัดเก็บในอุปกรณ์ของคุณเท่านั้น</p>",
        empty: "ยังไม่มีการดาวน์โหลด",
        help_title: "วิธีดาวน์โหลด",
        step1: "เปิดแอป Pinterest และหาวิดีโอที่ต้องการดาวน์โหลด",
        step2: "แตะปุ่มแชร์และคัดลอกลิงก์",
        step3: "เปิด PinDown Pro และวางลิงก์",
        step4: "แตะ \"รับวิดีโอ\" และรอการประมวลผล",
        step5: "แตะ \"ดาวน์โหลดตอนนี้\" เพื่อบันทึกวิดีโอ",
        server_err: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ ตรวจสอบว่า Termux กำลังทำงานอยู่"
    },
    zh: { 
        main: "PINTEREST 下载器", 
        in: "在此粘贴链接...", 
        pas: "粘贴", 
        get: "获取视频", 
        dl: "立即下载", 
        hist: "历史记录", 
        lang: "语言: 中文", 
        abt: "关于", 
        priv: "隐私政策", 
        rate: "评分", 
        feed: "反馈", 
        lt: "选择语言", 
        lc: "取消", 
        lch: "应用", 
        proc: "处理中...", 
        err: "获取视频失败，请检查链接并重试。", 
        h_title: "下载历史", 
        h_clear: "清空全部", 
        r_desc: "喜欢这个应用吗？请给我们评分！", 
        f_desc: "告诉我们您的想法！您的反馈能帮助我们改进。", 
        abt_page: "<h4>版本 2.0</h4><p>PinDown Pro 是支持高清视频、图片和 GIF 的 Pinterest 下载器。</p><h4>开发者</h4><p>Mg Chit San Maung</p>", 
        priv_page: "<h4>数据收集</h4><p>我们不收集任何个人数据。所有下载历史仅存储在您的设备本地。</p>",
        empty: "暂无下载记录",
        help_title: "如何下载",
        step1: "打开 Pinterest 应用并找到你想下载的视频",
        step2: "点击分享按钮并复制链接",
        step3: "打开 PinDown Pro 并粘贴链接",
        step4: "点击“获取视频”并等待处理",
        step5: "点击“立即下载”保存视频",
        server_err: "无法连接到服务器。请确保 Termux 正在运行。"
    },
    ko: { 
        main: "핀터레스트 다운로더", 
        in: "링크를 붙여넣으세요...", 
        pas: "붙여넣기", 
        get: "비디오 가져오기", 
        dl: "지금 다운로드", 
        hist: "히스토리", 
        lang: "언어: 한국어", 
        abt: "정보", 
        priv: "개인정보 보호", 
        rate: "평가하기", 
        feed: "피드백", 
        lt: "언어 선택", 
        lc: "취소", 
        lch: "적용", 
        proc: "처리 중...", 
        err: "비디오를 가져오지 못했습니다. 링크를 확인하고 다시 시도하세요.", 
        h_title: "다운로드 기록", 
        h_clear: "모두 삭제", 
        r_desc: "앱이 마음에 드시나요? 별점을 남겨주세요!", 
        f_desc: "여러분의 의견을 들려주세요! 피드백은 발전에 큰 도움이 됩니다.", 
        abt_page: "<h4>버전 2.0</h4><p>PinDown Pro는 HD 비디오, 이미지, GIF를 지원하는 궁극의 핀터레스트 다운로더입니다.</p><h4>개발자</h4><p>Mg Chit San Maung</p>", 
        priv_page: "<h4>데이터 수집</h4><p>개인 정보를 수집하지 않습니다. 모든 다운로드 기록은 사용자의 기기에만 로컬로 저장됩니다.</p>",
        empty: "다운로드 내역 없음",
        help_title: "다운로드 방법",
        step1: "Pinterest 앱을 열고 다운로드할 비디오를 찾습니다",
        step2: "공유 버튼을 누르고 링크를 복사합니다",
        step3: "PinDown Pro를 열고 링크를 붙여넣습니다",
        step4: "\"비디오 가져오기\"를 누르고 처리를 기다립니다",
        step5: "\"지금 다운로드\"를 눌러 비디오를 저장합니다",
        server_err: "서버에 연결할 수 없습니다. Termux가 실행 중인지 확인하세요."
    },
    hi: { 
        main: "पिनटेरेस्ट डाउनलोडर", 
        in: "Pinterest लिंक यहाँ पेस्ट करें...", 
        pas: "पेस्ट करें", 
        get: "वीडियो प्राप्त करें", 
        dl: "अभी डाउनलोड करें", 
        hist: "डाउनलोड इतिहास", 
        lang: "भाषा: हिन्दी", 
        abt: "ऐप के बारे में", 
        priv: "गोपनीयता नीति", 
        rate: "हमें रेट करें", 
        feed: "फीडबैक", 
        lt: "भाषा चुनें", 
        lc: "रद्द करें", 
        lch: "लागू करें", 
        proc: "प्रक्रिया जारी है...", 
        err: "वीडियो प्राप्त करने में विफल। कृपया लिंक जांचें और पुनः प्रयास करें।", 
        h_title: "इतिहास", 
        h_clear: "सब साफ़ करें", 
        r_desc: "ऐप पसंद आया? रेटिंग दें!", 
        f_desc: "हमें अपनी राय बताएं!", 
        abt_page: "<h4>संस्करण 2.0</h4><p>PinDown Pro HD वीडियो, छवियों और GIF के लिए एक बेहतरीन Pinterest डाउनलोडर है।</p><h4>डेवलपर</h4><p>Mg Chit San Maung</p>", 
        priv_page: "<h4>गोपनीयता</h4><p>हम कोई व्यक्तिगत डेटा एकत्र नहीं करते हैं। सारा डाउनलोड इतिहास आपके डिवाइस पर ही सुरक्षित रहता है।</p>",
        empty: "अभी तक कोई डाउनलोड नहीं",
        help_title: "कैसे डाउनलोड करें",
        step1: "Pinterest ऐप खोलें और वीडियो खोजें जिसे आप डाउनलोड करना चाहते हैं",
        step2: "शेयर बटन टैप करें और लिंक कॉपी करें",
        step3: "PinDown Pro खोलें और लिंक पेस्ट करें",
        step4: "\"वीडियो प्राप्त करें\" टैप करें और प्रक्रिया का इंतजार करें",
        step5: "वीडियो सेव करने के लिए \"अभी डाउनलोड करें\" टैप करें",
        server_err: "सर्वर से कनेक्ट नहीं हो सका। सुनिश्चित करें कि Termux चल रहा है।"
    },
    ph: { 
        main: "PINTEREST DOWNLOADER", 
        in: "I-paste ang Pinterest link dito...", 
        pas: "I-PASTE", 
        get: "KUNIN ANG VIDEO", 
        dl: "I-DOWNLOAD NA", 
        hist: "Kasaysayan", 
        lang: "Wika: Filipino", 
        abt: "Tungkol sa App", 
        priv: "Privacy Policy", 
        rate: "I-rate Kami", 
        feed: "Feedback", 
        lt: "Pumili ng Wika", 
        lc: "Kanselahin", 
        lch: "Ilapat", 
        proc: "Pinoproseso...", 
        err: "Nabigong kunin ang video. Pakitingnan ang link at subukan muli.", 
        h_title: "Kasaysayan", 
        h_clear: "I-clear Lahat", 
        r_desc: "Nagugustuhan mo ba ang app?", 
        f_desc: "Sabihin sa amin ang iyong opinyon!", 
        abt_page: "<h4>Bersyon 2.0</h4><p>Ang PinDown Pro ay isang Pinterest downloader na sumusuporta sa HD videos, images, at GIFs.</p><h4>Developer</h4><p>Mg Chit San Maung</p>", 
        priv_page: "<h4>Privacy</h4><p>Hindi kami nangongolekta ng personal na data. Ang lahat ng download history ay naka-store lang sa iyong device.</p>",
        empty: "Wala pang downloads",
        help_title: "Paano Mag-download",
        step1: "Buksan ang Pinterest app at hanapin ang video na gusto mong i-download",
        step2: "I-tap ang share button at i-copy ang link",
        step3: "Buksan ang PinDown Pro at i-paste ang link",
        step4: "I-tap ang \"KUNIN ANG VIDEO\" at maghintay",
        step5: "I-tap ang \"I-DOWNLOAD NA\" para i-save ang video",
        server_err: "Hindi makakonekta sa server. Tiyaking tumatakbo ang Termux."
    }
};

// ================== Theme Functions ==================
function toggleTheme() { 
    var b = document.body; 
    var icon = document.getElementById('themeIcon');
    var text = document.getElementById('themeText');
    
    if (b.classList.contains('white-theme')) {
        b.classList.remove('white-theme');
        icon.textContent = '☀️';
        text.textContent = 'LIGHT';
    } else {
        b.classList.add('white-theme');
        icon.textContent = '🌙';
        text.textContent = 'DARK';
    }
    localStorage.setItem('theme', b.classList.contains('white-theme') ? 'light' : 'dark');
}

function loadTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.add('white-theme');
        document.getElementById('themeIcon').textContent = '🌙';
        document.getElementById('themeText').textContent = 'DARK';
    }
}

// ================== Sidebar Functions ==================
function toggleNav() { 
    var s = document.getElementById("mySidebar"); 
    if (s.style.width === "280px") {
        s.style.width = "0";
    } else {
        s.style.width = "280px";
    }
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

function openPage(id) { 
    closeNav(); 
    document.getElementById(id).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePage(id) { 
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = '';
}

// ================== Language Functions ==================
function openLangModal() { 
    closeNav(); 
    var modal = document.getElementById('langModal');
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('active'); }, 10);
    tempLang = curr;
    updateLangSelection();
}

function closeLangModal() { 
    var modal = document.getElementById('langModal');
    modal.classList.remove('active');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
}

function selectLang(lang) {
    tempLang = lang;
    updateLangSelection();
}

function updateLangSelection() {
    var opts = document.querySelectorAll('.lang-opt');
    for (var i = 0; i < opts.length; i++) {
        var opt = opts[i];
        if (opt.dataset.lang === tempLang) {
            opt.classList.add('active');
            opt.querySelector('input').checked = true;
        } else {
            opt.classList.remove('active');
            opt.querySelector('input').checked = false;
        }
    }
}

function applyLanguage() { 
    curr = tempLang;
    var t = langData[curr] || langData['en'];
    
    document.getElementById('t-main').innerText = t.main;
    document.getElementById('linkInput').placeholder = t.in;
    document.getElementById('b-paste').innerText = t.pas;
    document.getElementById('btnText').innerText = t.get;
    document.getElementById('dl-text').innerText = t.dl;
    document.getElementById('m-history').innerText = t.hist;
    document.getElementById('m-lang').innerText = t.lang;
    document.getElementById('m-about').innerText = t.abt;
    document.getElementById('m-privacy').innerText = t.priv;
    document.getElementById('m-rate').innerText = t.rate;
    document.getElementById('m-feed').innerText = t.feed;
    document.getElementById('h-title').innerText = t.h_title;
    document.getElementById('h-clear').innerText = t.h_clear;
    document.getElementById('a-title').innerText = t.abt;
    document.getElementById('p-title').innerText = t.priv;
    document.getElementById('r-title').innerText = t.rate;
    document.getElementById('f-title').innerText = t.feed;
    document.getElementById('r-desc').innerText = t.r_desc;
    document.getElementById('f-desc').innerText = t.f_desc;
    document.getElementById('about-content').innerHTML = t.abt_page;
    document.getElementById('privacy-content').innerHTML = t.priv_page;
    document.getElementById('l-title').innerText = t.lt;
    document.getElementById('l-cancel').innerText = t.lc;
    document.getElementById('l-change').innerText = t.lch;
    
    document.getElementById('help-title').innerText = t.help_title;
    document.getElementById('step1').innerText = t.step1;
    document.getElementById('step2').innerText = t.step2;
    document.getElementById('step3').innerText = t.step3;
    document.getElementById('step4').innerText = t.step4;
    document.getElementById('step5').innerText = t.step5;
    
    localStorage.setItem('language', curr);
    closeLangModal();
}

function loadLanguage() {
    var saved = localStorage.getItem('language');
    if (saved && langData[saved]) {
        curr = saved;
        tempLang = saved;
    }
    applyLanguage();
}

// ================== Help Section Toggle ==================
function toggleHelp() {
    var helpSection = document.getElementById('helpSection');
    helpSection.classList.toggle('open');
}

// ================== Paste and Download Functions ==================
function pasteLink() { 
    try {
        navigator.clipboard.readText().then(function(text) {
            document.getElementById('linkInput').value = text;
        }).catch(function(e) {
            alert('Cannot access clipboard');
        });
    } catch(e) {
        alert('Cannot access clipboard');
    }
}

// ================== History Functions ==================
function saveToHistory(thumb, video, title) {
    var history = JSON.parse(localStorage.getItem('pindown_history') || '[]');
    var exists = history.some(function(item) { return item.video === video; });
    if (!exists) {
        history.unshift({ 
            thumb: thumb, 
            video: video, 
            title: title || '',
            time: new Date().toLocaleString(),
            id: Date.now()
        });
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem('pindown_history', JSON.stringify(history));
    }
}

function openHistory() { 
    renderHistory(); 
    openPage('historyPage'); 
}

function renderHistory() { 
    var list = document.getElementById('history-list');
    var history = JSON.parse(localStorage.getItem('pindown_history') || '[]');
    var t = langData[curr];
    
    if (history.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>' + t.empty + '</p></div>';
        return;
    }
    
    var html = '';
    history.forEach(function(item, i) {
        html += '<div class="history-item" style="animation-delay: ' + (i * 0.05) + 's">' +
            '<img src="' + item.thumb + '" class="hist-thumb" onerror="this.src=\'https://via.placeholder.com/70\'">' +
            '<div class="hist-info">' +
            '<div class="hist-time">' + item.time + '</div>' +
            '<a href="' + item.video + '" target="_blank" class="hist-link">⬇ Download ' + (item.title || 'Video') + '</a>' +
            '</div>' +
            '<button class="del-btn" onclick="deleteHistoryItem(' + i + ')">×</button>' +
            '</div>';
    });
    list.innerHTML = html;
}

function deleteHistoryItem(index) { 
    var history = JSON.parse(localStorage.getItem('pindown_history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('pindown_history', JSON.stringify(history));
    renderHistory();
}

function clearAllHistory() { 
    if(confirm('Clear all history?')) {
        localStorage.removeItem('pindown_history');
        renderHistory();
    }
}

// ================== Download Video (Fetch with timeout) ==================
function getVideo() {
    var url = document.getElementById('linkInput').value.trim();
    var errorDiv = document.getElementById('errorMsg');
    var t = langData[curr];
    
    if(!url) {
        errorDiv.innerText = 'Please enter a Pinterest link';
        errorDiv.style.display = 'block';
        return;
    }
    
    errorDiv.style.display = 'none';
    var btn = document.getElementById('b-get');
    var resDiv = document.getElementById('result');
    var btnText = document.getElementById('btnText');
    
    btnText.innerHTML = t.proc + '<span class="loading"></span>';
    btn.disabled = true;
    resDiv.style.display = 'none';

    const controller = new AbortController();
    const timeoutId = setTimeout(function() { controller.abort(); }, 30000);
    
    fetch(API_BASE_URL + '/download?url=' + encodeURIComponent(url), {
        signal: controller.signal
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Server responded with ' + response.status);
        }
        return response.json();
    })
    .then(function(response) {
        clearTimeout(timeoutId);
        btnText.innerText = t.get;
        btn.disabled = false;
        
        if(response.status === 'success' || response.video_url || response.url) {
            var videoUrl = response.video_url || response.url || response.download_url;
            var thumbUrl = response.thumbnail || response.thumb || 'https://via.placeholder.com/400x300/E60023/ffffff?text=Video';
            var title = response.title || 'Pinterest Video';
            
            document.getElementById('thumb').src = thumbUrl;
            document.getElementById('b-dl').href = videoUrl;
            document.getElementById('b-dl').download = title + '.mp4';
            resDiv.style.display = 'block';
            
            document.getElementById('b-get').style.display = 'none';
            
            saveToHistory(thumbUrl, videoUrl, title);
            setTimeout(function() {
                resDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } else {
            errorDiv.innerText = response.message || t.err;
            errorDiv.style.display = 'block';
        }
    })
    .catch(function(error) {
        clearTimeout(timeoutId);
        btnText.innerText = t.get;
        
        btn.disabled = false;
        
        btn.style.display = 'block';
        
        if (error.name === 'AbortError') {
            errorDiv.innerText = 'Request timeout. Please try again.';
        } else {
            errorDiv.innerText = t.server_err;
        }
        errorDiv.style.display = 'block';
    });
}

// ================== Rating Functions ==================
function rate(stars) {
    currentRating = stars;
    var starElements = document.querySelectorAll('.star');
    starElements.forEach(function(star, i) {
        if (i < stars) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function openPlayStore() {
    if (currentRating === 0) {
        alert('Please select a rating first');
        return;
    }
    window.open('https://play.google.com', '_blank');
}

// ================== Enter key support ==================
document.getElementById('linkInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') getVideo();
});

document.getElementById('linkInput').addEventListener('input', function() {
    document.getElementById('b-get').style.display = 'block';
});
