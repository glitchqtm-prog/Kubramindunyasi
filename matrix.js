// lib/matrix.js
// Kader Matrisi (Matrix of Fate) hesaplamaları — 22 Arkan sistemi
// Not: Şema, yaygın kullanılan klasik Matrix of Destiny yöntemine göredir.
// Okulunuza göre kanal formüllerini bu dosyadan kolayca değiştirebilirsiniz.

export const ARCANA = {
  1: "Büyücü (İrade, başlangıç gücü)",
  2: "Azize (Sezgi, bilgelik)",
  3: "İmparatoriçe (Bereket, yaratıcılık)",
  4: "İmparator (Güç, düzen, otorite)",
  5: "Aziz / Hierofant (Kurallar, öğreticilik)",
  6: "Aşıklar (Seçim, ilişkiler)",
  7: "Savaş Arabası (Hareket, zafer)",
  8: "Adalet (Denge, sebep-sonuç)",
  9: "Ermiş (İçsel bilgelik, yalnızlık)",
  10: "Kader Çarkı (Şans, döngüler)",
  11: "Güç (Enerji, tutku)",
  12: "Asılan Adam (Hizmet, fedakarlık)",
  13: "Ölüm (Dönüşüm, yenilenme)",
  14: "Denge / Ölçülülük (Uyum, sabır)",
  15: "Şeytan (Tutkular, bağımlılıklar, maddi güç)",
  16: "Kule (Yıkım ve yeniden yapılanma)",
  17: "Yıldız (Umut, ilham, tanınırlık)",
  18: "Ay (İllüzyon, sezgi, korkular)",
  19: "Güneş (Neşe, başarı, cömertlik)",
  20: "Mahkeme (Karma, ata soyu, uyanış)",
  21: "Dünya (Tamamlanma, evrensellik)",
  22: "Deli / Joker (Özgürlük, yeni yol)"
};

export const reduce22 = (n) => {
  while (n > 22) n = String(n).split("").reduce((s, d) => s + +d, 0);
  return n;
};
const digitSum = (n) => String(n).split("").reduce((s, d) => s + +d, 0);

/**
 * Kişisel Kader Matrisi
 * @param {number} day @param {number} month @param {number} year
 */
export function personalMatrix(day, month, year) {
  const A = reduce22(day);                 // Kişilik / dış imaj (doğum günü enerjisi)
  const B = reduce22(month);               // Ruhsal-duygusal kanal (anne hattı)
  const C = reduce22(digitSum(year));      // Ata soyu / geçmiş deneyim (baba hattı)
  const D = reduce22(A + B + C);           // Karmik görev tabanı
  const E = reduce22(A + B + C + D);       // Merkez: Ruh Arzusu / Konfor Alanı

  // Karmik kuyruk (geçmiş yaşam borçları): D - (D+E) - E üçlüsü
  const tailMid = reduce22(D + E);
  const karmicTail = [D, tailMid, E];

  // Para kanalı: (C+D) köşesi ile merkezin bileşimi
  const moneyBase = reduce22(C + D);
  const moneyChannel = reduce22(moneyBase + E);

  // İlişki kanalı: (A+B) köşesi ile merkezin bileşimi
  const loveBase = reduce22(A + B);
  const loveChannel = reduce22(loveBase + E);

  // Sosyal misyon / dünyaya sunulan
  const mission = reduce22(D + reduce22(A + B) + reduce22(B + C));

  const label = (n) => ({ number: n, arcana: ARCANA[n] });
  return {
    birthDayEnergy: label(A),
    emotionalLine: label(B),
    ancestralLine: label(C),
    karmicBase: label(D),
    center_soulDesire: label(E),
    karmicTail: karmicTail.map(label),
    moneyChannel: { base: label(moneyBase), channel: label(moneyChannel) },
    loveChannel: { base: label(loveBase), channel: label(loveChannel) },
    mission: label(mission)
  };
}

/** Yıllık enerji: doğum günü + içinde bulunulan yıl */
export function yearEnergy(day, month, targetYear) {
  return reduce22(reduce22(day) + reduce22(month) + reduce22(digitSum(targetYear)));
}

/** Uyum (çift) matrisi: iki kişinin matris noktalarının bileşimi */
export function compatibilityMatrix(m1, m2) {
  const mix = (a, b) => {
    const n = reduce22(a.number + b.number);
    return { number: n, arcana: ARCANA[n] };
  };
  return {
    sharedCenter: mix(m1.center_soulDesire, m2.center_soulDesire),      // İlişkinin Kalbi
    meetingReason: mix(m1.karmicBase, m2.karmicBase),                    // Karmik karşılaşma nedeni
    sharedMoney: mix(m1.moneyChannel.channel, m2.moneyChannel.channel),  // Ortak finans kanalı
    sharedLove: mix(m1.loveChannel.channel, m2.loveChannel.channel),     // Ortak duygusal kanal
    sharedMission: mix(m1.mission, m2.mission)                           // Çiftin misyonu
  };
}
