import React, { createContext, useContext, useState } from 'react';

const translations = {
  TR: {
    appTitle: 'FiWi V2',
    subTitle: 'Gelişmiş Wi-Fi & Ağ Yönetim Paneli',
    connectedAs: 'Bağlı Ağ',
    notConnected: 'Bağlantı Yok',
    refresh: 'Yenile',
    fullAudit: 'Tam Taramayı Başlat',
    exportData: 'Yedekle / Dışa Aktar',
    terminalLog: 'Canlı Terminal',
    
    // Tabs
    tabPasswords: 'Kayıtlı Parolalar',
    tabActive: 'Canlı Bağlantı & Ping',
    tabNearby: 'Yakındaki Ağlar',
    tabDevices: 'Ağdaki Cihazlar',
    tabAudit: 'Güvenlik Analizi',
    
    // Passwords Tab
    searchPlaceholder: 'Ağ adı (SSID) ile ara...',
    totalSaved: 'Kayıtlı Ağ Sayısı',
    showPassword: 'Şifreyi Göster',
    hidePassword: 'Gizle',
    copyPassword: 'Kopyala',
    copied: 'Kopyalandı!',
    qrCode: 'QR Kod',
    forgetNetwork: 'Ağı Sil',
    confirmDeleteTitle: 'Ağı Silmek İstediğinize Emin Misiniz?',
    confirmDeleteBody: 'bu ağ sistemden kaldırılacak. Tekrar bağlanmak için şifreyi yeniden girmeniz gerekir.',
    cancel: 'İptal',
    delete: 'Evet, Sil',
    noPassword: 'Şifresiz / Açık Ağ',
    securityType: 'Güvenlik Türü',
    cipherType: 'Şifreleme',
    
    // Active Connection Tab
    signalStrength: 'Sinyal Gücü',
    radioProtocol: 'Radyo Protokolü',
    channel: 'Kanal',
    frequency: 'Frekans Bandı',
    downloadSpeed: 'Alma Hızı (Rx)',
    uploadSpeed: 'İletim Hızı (Tx)',
    macAddress: 'BSSID (MAC Adresi)',
    ipAddress: 'Yerel IP Adresi',
    subnetMask: 'Alt Ağ Maskesi',
    gateway: 'Varsayılan Ağ Geçidi',
    dnsServer: 'DNS Sunucusu',
    latencyBenchmark: 'Canlı Ping & Gecikme Takibi',
    pingTarget: 'Hedef Sunucu',
    pingMs: 'Gecikme (ms)',
    
    // Nearby Scan Tab
    foundNetworks: 'Bulunan Yakın Ağlar',
    recommendationTitle: 'Kanal Çakışma Analizi & Öneri',
    rec24GHz: '2.4 GHz İçin En Temiz Kanal',
    rec5GHz: '5 GHz İçin En Temiz Kanal',
    bssidDetails: 'BSSID Detayları',
    signal: 'Sinyal',
    
    // Network Devices Tab
    activeDevices: 'Ağdaki Aktif Cihazlar',
    deviceIp: 'IP Adresi',
    deviceMac: 'MAC Adresi',
    deviceVendor: 'Üretici / Cihaz',
    deviceType: 'Erişim Türü',
    
    // Security Audit Tab
    networkHealthScore: 'Ağ Güvenlik Skoru',
    auditIssues: 'Tespit Edilen Güvenlik Riskleri',
    auditRecommendations: 'Önerilen İyileştirmeler',
    noIssuesFound: 'Tebrikler! Kayıtlı ağlarınızda kritik bir güvenlik riski bulunamadı.',
    
    // QR Modal
    qrModalTitle: 'Wi-Fi Hızlı Bağlantı QR Kodu',
    qrModalSub: 'Mobil cihazınızın kamerası ile taratarak şifre yazmadan anında bağlanın.',
    downloadQR: 'QR Resmi İndir',

    // Theme
    darkMode: 'Karanlık Mod',
    lightMode: 'Aydınlık Mod'
  },
  EN: {
    appTitle: 'FiWi V2',
    subTitle: 'Advanced Wi-Fi & Network Intelligence Manager',
    connectedAs: 'Connected Network',
    notConnected: 'Not Connected',
    refresh: 'Refresh',
    fullAudit: 'Start Full Scan',
    exportData: 'Export / Backup',
    terminalLog: 'Live Terminal',
    
    // Tabs
    tabPasswords: 'Saved Passwords',
    tabActive: 'Active Connection & Ping',
    tabNearby: 'Nearby Scanner',
    tabDevices: 'Network Devices',
    tabAudit: 'Security Audit',
    
    // Passwords Tab
    searchPlaceholder: 'Search network by SSID...',
    totalSaved: 'Total Saved Networks',
    showPassword: 'Show Password',
    hidePassword: 'Hide',
    copyPassword: 'Copy',
    copied: 'Copied!',
    qrCode: 'QR Code',
    forgetNetwork: 'Forget Network',
    confirmDeleteTitle: 'Are you sure you want to forget this network?',
    confirmDeleteBody: 'will be removed from your Windows profiles. Re-connecting will require entering the password again.',
    cancel: 'Cancel',
    delete: 'Yes, Forget',
    noPassword: 'Open / No Password',
    securityType: 'Security Type',
    cipherType: 'Cipher',
    
    // Active Connection Tab
    signalStrength: 'Signal Strength',
    radioProtocol: 'Radio Protocol',
    channel: 'Channel',
    frequency: 'Frequency Band',
    downloadSpeed: 'Receive Speed (Rx)',
    uploadSpeed: 'Transmit Speed (Tx)',
    macAddress: 'BSSID (MAC Address)',
    ipAddress: 'Local IP Address',
    subnetMask: 'Subnet Mask',
    gateway: 'Default Gateway',
    dnsServer: 'DNS Server',
    latencyBenchmark: 'Live Ping & Latency Benchmark',
    pingTarget: 'Target Server',
    pingMs: 'Latency (ms)',
    
    // Nearby Scan Tab
    foundNetworks: 'In-Range Networks Found',
    recommendationTitle: 'Channel Overlap Analysis & Advice',
    rec24GHz: 'Best Channel for 2.4 GHz',
    rec5GHz: 'Best Channel for 5 GHz',
    bssidDetails: 'BSSID Details',
    signal: 'Signal',
    
    // Network Devices Tab
    activeDevices: 'Active Network Devices',
    deviceIp: 'IP Address',
    deviceMac: 'MAC Address',
    deviceVendor: 'Vendor / Device',
    deviceType: 'Access Type',
    
    // Security Audit Tab
    networkHealthScore: 'Network Health Score',
    auditIssues: 'Detected Security Vulnerabilities',
    auditRecommendations: 'Recommended Recommendations',
    noIssuesFound: 'Awesome! No security vulnerabilities found in your saved networks.',
    
    // QR Modal
    qrModalTitle: 'Wi-Fi Fast Connect QR Code',
    qrModalSub: 'Scan with your smartphone camera to connect instantly without typing passwords.',
    downloadQR: 'Download QR Image',

    // Theme
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('TR');

  const toggleLanguage = () => {
    setLang(prev => (prev === 'TR' ? 'EN' : 'TR'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
