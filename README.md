# 📶 FiWi V2 - Web Based Wi-Fi & Network Intelligence Manager

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socketdotio)
![PWA](https://img.shields.io/badge/PWA-Ready-00f2fe)
![License](https://img.shields.io/badge/License-MIT-green)

**FiWi V2**, Windows sisteminizde kaydedilmiş Wi-Fi parolalarını görüntülemenizi, canlı ağ durumunu izlemenizi, yakın çevredeki Wi-Fi spektrumunu tarayıp kanal çakışma analizi yapmanızı, ağdaki aktif cihazları keşfetmenizi ve Wi-Fi güvenlik analizi gerçekleştirmenizi sağlayan yeni nesil, web tabanlı gelişmiş bir Wi-Fi & Ağ yönetim platformudur.

**React 19**, **Vite**, **Express**, **Socket.io** ve **PWA** mimarisiyle anlık QR kod üretimi, canlı ping & gecikme grafiği, masaüstü bildirimleri ve Türkçe/İngilizce dil desteği sunar.

---

## ✨ Özellikler / Features

- 🔑 **Kayıtlı Wi-Fi Parolaları (Saved Passwords):** Windows'ta kayıtlı tüm ağları, güvenlik türlerini ve açık parolaları görüntüleme, arama ve tek tıkla kopyalama.
- 📱 **Wi-Fi QR Kod Üretici (Fast Connect QR):** Herhangi bir ağ için anında QR kod üreterek mobil cihazlarla şifre girmeden tek tıkla Wi-Fi'ye bağlanma.
- 📡 **Canlı Bağlantı & Ping Takibi (Active Status & Latency):** Aktif Wi-Fi SSID, BSSID, sinyal gücü %, alım/iletim hızı (Rx/Tx Mbps), frekans bandı (2.4/5GHz), IP/DNS/Gateway detayları ve Socket.io ile canlı ping grafiği.
- 🔍 **Yakındaki Ağlar & Kanal Analizörü (Nearby Spectrum Scanner):** Çevredeki Wi-Fi ağlarını tarama, sinyal güçlerini karşılaştırma ve çakışmasız en temiz Wi-Fi kanalını (2.4 GHz & 5 GHz) öneren analizör.
- 💻 **Ağdaki Aktif Cihazlar (Subnet ARP Device Scanner):** Yerel ağdaki cihazları tarama, IP/MAC adresi ve üretici (Vendor lookup) tespiti (Apple, Samsung, Intel, TP-Link vb.).
- 🛡️ **Wi-Fi Güvenlik Analizi (Security Audit & Health Score):** Kayıtlı ağların şifre karmaşıklığını ve güvenlik protokollerini (WEP, WPA2, Open) analiz ederek 100 üzerinden Ağ Sağlık Skoru verme.
- 🌐 **TR / EN Çoklu Dil Desteği:** Türkçe ve İngilizce dilleri arasında anında ve kesintisiz geçiş.
- 📄 **Yedekleme & Dışa Aktarma (JSON Export):** Tüm kayıtlı profilleri ve güvenlik analiz raporunu JSON formatında dışa aktarma.
- 📲 **PWA & Mobil Uyumluluk:** Mobil cihazlar ve tabletlerde kusursuz çalışan responsive cam (glassmorphic) arayüz.

---

## 💻 Sistem Gereksinimleri / Requirements

1. **Windows 10 veya Windows 11**
2. **Node.js** (v18.0.0 veya üzeri): [Node.js İndir](https://nodejs.org/)
3. **`netsh` & PowerShell:** Windows'ta varsayılan olarak bulunur.

---

## 🚀 Kurulum ve Çalıştırma / Quick Start

### ⚡ Tek Satırda Kurulum ve Çalıştırma (Hızlı Başlangıç)

Terminalinizde (CMD veya PowerShell) aşağıdaki komutu çalıştırarak FiWi V2'yi anında indirip başlatabilirsiniz:

```bash
git clone https://github.com/an1lbayram/FiWi-V2.git && cd FiWi-V2 && cd server && npm install && cd ../client && npm install && cd .. && node server/index.js
```

*(Windows CMD kullanıyorsanız, `FiWi.bat` dosyasına çift tıklayarak da başlatabilirsiniz).*

---

### 📋 Adım Adım Kurulum / Step-by-Step

#### 1️⃣ Depoyu Klonlayın veya İndirin
```bash
git clone https://github.com/an1lbayram/FiWi-V2.git
cd FiWi-V2
```

#### 2️⃣ Sunucu (Server) Bağımlılıklarını Yükleyin
```bash
cd server
npm install
cd ..
```

#### 3️⃣ İstemci (Client) Bağımlılıklarını Yükleyin ve Derleyin
```bash
cd client
npm install
npm run build
cd ..
```

#### 4️⃣ Uygulamayı Başlatın
```bash
node server/index.js
```
*(Alternatif olarak proje ana dizinindeki `FiWi.bat` dosyasına tıklayabilirsiniz).*

#### 5️⃣ Tarayıcıda Açın
Tarayıcınızı açıp `http://localhost:3002` adresine gidin. FiWi V2 yönetim paneli hazır!

---

## 📂 Proje Yapısı / Project Structure

```text
FiWi-V2/
├── FiWi.bat                  # Windows tek tıkla başlatma scripti
├── LICENSE                   # MIT Lisansı
├── README.md                 # Türkçe ve İngilizce belgelendirme
├── server/                   # Express + Socket.io backend (Netsh & Ağ Entegrasyonu)
│   ├── index.js              # Sunucu & REST API & Socket.io rotaları
│   ├── wifiService.js        # Netsh, IPConfig, ARP & Güvenlik Analizör servisi
│   └── package.json          # Sunucu bağımlılıkları
└── client/                   # React 19 + Vite + PWA frontend
    ├── public/               # Favicon & PWA Manifest
    ├── src/                  # React bileşenleri (Passwords, Active, Nearby, Devices, Audit, QRModal, Terminal)
    ├── vite.config.js        # Vite & PWA konfigürasyonu
    └── package.json          # İstemci bağımlılıkları
```

---

## 📄 Lisans / License

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

**Geliştirici:** [Anıl Bayram](https://github.com/an1lbayram)
