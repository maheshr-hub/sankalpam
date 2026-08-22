/**
 * Sankalpam Festival Calendar - calculation engine
 * Depends on panchang.js being loaded first (uses its getSunLongitude,
 * getMoonLongitude, dateToJD, jdToDate, findNextCrossing, getTimezoneOffset).
 *
 * Conventions used throughout (confirmed with the app owner):
 *  - Tithi is the default determinant unless a festival specifies otherwise.
 *  - Smarta tradition followed wherever a Smarta/Vaishnava split exists.
 *  - Yajurveda convention followed wherever a Vedic-shakha split exists
 *    (e.g. Upakarma on Shravana Purnima, not Shravana nakshatra).
 *  - Sunrise-vyapti tithi governs the day for most festivals; madhyahna-vyapti
 *    (midday) is used for the two classical exceptions, Rama Navami and
 *    Ganesha Chaturthi; nishita-vyapti timing is approximated for Krishna
 *    Janmashtami (Smarta) via the sunrise-prevailing-tithi rule, which gives
 *    the same result as niśīta-vyāpti in the overwhelming majority of years.
 *  - Amanta (South Indian) lunar month reckoning throughout. Two Tamil-solar-
 *    calendar festivals (Panguni Uthiram, Karthikai Deepam) are computed
 *    against the Tamil solar month instead, since that is how they are
 *    universally observed regardless of amanta/purnimanta labelling.
 *  - Manual overrides (festival-overrides.json) always take precedence over
 *    computed results - use them if a computed date ever disagrees with your
 *    family priest or drikpanchang for a given year.
 */

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

/* ============================================================
   CITY / LOCATION DATA
   ============================================================ */
const FESTIVAL_CITIES = [
  { key: 'chennai',    label: 'Chennai',    lat: 13.0827,  lon: 80.2707,  tz: 'Asia/Kolkata' },
  { key: 'bengaluru',  label: 'Bengaluru',  lat: 12.9716,  lon: 77.5946,  tz: 'Asia/Kolkata' },
  { key: 'brisbane',   label: 'Brisbane',   lat: -27.4698, lon: 153.0251, tz: 'Australia/Brisbane' },
  { key: 'sydney',     label: 'Sydney',     lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { key: 'melbourne',  label: 'Melbourne',  lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne' },
  { key: 'perth',      label: 'Perth',      lat: -31.9523, lon: 115.8613, tz: 'Australia/Perth' },
  { key: 'canberra',   label: 'Canberra',   lat: -35.2809, lon: 149.1300, tz: 'Australia/Sydney' },
  { key: 'singapore',  label: 'Singapore',  lat: 1.3521,   lon: 103.8198, tz: 'Asia/Singapore' },
  { key: 'kualalumpur',label: 'Malaysia',   lat: 3.1390,   lon: 101.6869, tz: 'Asia/Kuala_Lumpur' },
  { key: 'london',     label: 'London',     lat: 51.5074,  lon: -0.1278,  tz: 'Europe/London' },
  { key: 'newyork',    label: 'New York',   lat: 40.7128,  lon: -74.0060, tz: 'America/New_York' },
  { key: 'chicago',    label: 'Chicago',    lat: 41.8781,  lon: -87.6298, tz: 'America/Chicago' },
  { key: 'losangeles', label: 'Los Angeles',lat: 34.0522,  lon: -118.2437,tz: 'America/Los_Angeles' },
  { key: 'auckland',   label: 'Auckland',   lat: -36.8485, lon: 174.7633, tz: 'Pacific/Auckland' },
  { key: 'dubai',      label: 'Dubai',      lat: 25.2048,  lon: 55.2708,  tz: 'Asia/Dubai' },
  { key: 'tokyo',      label: 'Tokyo',      lat: 35.6762,  lon: 139.6503, tz: 'Asia/Tokyo' },
];

/* ============================================================
   SUNRISE / SUNSET / MADHYAHNA (NOAA sunrise-equation family)
   ============================================================ */
function dayOfYear(y, m, d) {
  const start = Date.UTC(y, 0, 1);
  const cur = Date.UTC(y, m - 1, d);
  return Math.round((cur - start) / 86400000) + 1;
}

function calcSunriseLocalHours(year, month, day, lat, lon, tzOffsetHours) {
  const N = dayOfYear(year, month, day);
  const lngHour = lon / 15;
  const t = N + ((6 - lngHour) / 24);
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * D2R) + 0.020 * Math.sin(2 * M * D2R) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
  RA = ((RA % 360) + 360) % 360;
  const Lq = Math.floor(L / 90) * 90, RAq = Math.floor(RA / 90) * 90;
  RA = (RA + (Lq - RAq)) / 15;
  const sinDec = 0.39782 * Math.sin(L * D2R);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * D2R) - sinDec * Math.sin(lat * D2R)) / (cosDec * Math.cos(lat * D2R));
  if (cosH > 1 || cosH < -1) return null;
  let H = (360 - R2D * Math.acos(cosH)) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  let UT = ((T - lngHour) % 24 + 24) % 24;
  return ((UT + tzOffsetHours) % 24 + 24) % 24;
}

function calcSunsetLocalHours(year, month, day, lat, lon, tzOffsetHours) {
  const N = dayOfYear(year, month, day);
  const lngHour = lon / 15;
  const t = N + ((18 - lngHour) / 24);
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * D2R) + 0.020 * Math.sin(2 * M * D2R) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
  RA = ((RA % 360) + 360) % 360;
  const Lq = Math.floor(L / 90) * 90, RAq = Math.floor(RA / 90) * 90;
  RA = (RA + (Lq - RAq)) / 15;
  const sinDec = 0.39782 * Math.sin(L * D2R);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * D2R) - sinDec * Math.sin(lat * D2R)) / (cosDec * Math.cos(lat * D2R));
  if (cosH > 1 || cosH < -1) return null;
  let H = (R2D * Math.acos(cosH)) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  let UT = ((T - lngHour) % 24 + 24) % 24;
  return ((UT + tzOffsetHours) % 24 + 24) % 24;
}

function sunriseJD(year, month, day, lat, lon, tzOffsetHours) {
  const h = calcSunriseLocalHours(year, month, day, lat, lon, tzOffsetHours);
  if (h === null) return null;
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  return dateToJD(year, month, day, hh, mm, tzOffsetHours);
}

function madhyahnaJD(year, month, day, lat, lon, tzOffsetHours) {
  const sr = calcSunriseLocalHours(year, month, day, lat, lon, tzOffsetHours);
  const ss = calcSunsetLocalHours(year, month, day, lat, lon, tzOffsetHours);
  if (sr === null || ss === null) return null;
  const mid = (sr + ss) / 2;
  const hh = Math.floor(mid), mm = Math.round((mid - hh) * 60);
  return dateToJD(year, month, day, hh, mm, tzOffsetHours);
}

/* ============================================================
   LUNAR (AMANTA) MONTH DETECTION, WITH ADHIKA-MASA HANDLING
   ============================================================ */
const LUNAR_MASAS = ["Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada",
                      "Ashwin","Kartika","Margashirsha","Pausha","Magha","Phalguna"];
const LUNAR_MASAS_DEVANAGARI = ["चैत्र","वैशाख","ज्येष्ठ","आषाढ","श्रावण","भाद्रपद",
                                 "आश्विन","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन"];
const LUNAR_MASAS_IAST = ["caitra","vaiśākha","jyeṣṭha","āṣāḍha","śrāvaṇa","bhādrapada",
                           "āśvina","kārtika","mārgaśīrṣa","pauṣa","māgha","phālguna"];
/* Approximate phonetic Tamil-script rendering for display consistency only -
   these lunar (amanta) month names are not traditionally used in spoken
   Tamil, which instead uses the solar month names already in panchang.js. */
const LUNAR_MASAS_TAMIL = ["சைத்திரம்","வைசாகம்","ஜ்யேஷ்டம்","ஆஷாடம்","ஸ்ராவணம்","பாத்ரபதம்",
                            "ஆஸ்வினம்","கார்த்திகம்","மார்கசீர்ஷம்","பௌஷம்","மாகம்","பால்குனம்"];

function genericCrossing(valueFn, startJd, targetDeg, maxDays, step) {
  step = step || 0.02;
  function delta(jd) { return (((valueFn(jd) - targetDeg + 180) % 360 + 360) % 360) - 180; }
  let prevJd = startJd, prevVal = delta(prevJd);
  for (let t = step; t <= maxDays; t += step) {
    const curJd = startJd + t, curVal = delta(curJd);
    if (prevVal < 0 && curVal >= 0) {
      let lo = prevJd, hi = curJd;
      for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (delta(mid) < 0) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    }
    prevJd = curJd; prevVal = curVal;
  }
  return null;
}
function findCrossingNearExpected(valueFn, targetDeg, expectedJd, radiusDays) {
  return genericCrossing(valueFn, expectedJd - radiusDays, targetDeg, 2 * radiusDays);
}
function elongation(jd) {
  let e = (getMoonLongitude(jd) - getSunLongitude(jd)) % 360;
  return e < 0 ? e + 360 : e;
}
function rashiAt(jd) { return Math.floor(getSunLongitude(jd) / 30); }

function findAmavasyas(startJd, endJd) {
  const results = [];
  let jd = startJd;
  while (jd < endJd) {
    const cross = findNextCrossing(jd, 0, 32);
    if (cross === null) break;
    results.push(cross);
    jd = cross + 5;
  }
  return results;
}

function buildLunarMonths(year) {
  const startJd = dateToJD(year - 1, 10, 15, 0, 0, 0);
  const endJd = dateToJD(year + 1, 2, 15, 0, 0, 0);
  const amavasyas = findAmavasyas(startJd, endJd);
  const raw = [];
  for (let i = 0; i < amavasyas.length - 1; i++) {
    const s = amavasyas[i], e = amavasyas[i + 1];
    raw.push({ startJd: s, endJd: e, rashiStart: rashiAt(s), rashiEnd: rashiAt(e) });
  }
  const months = [];
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i];
    if (m.rashiEnd === m.rashiStart) {
      let j = i + 1, nextRashi = null;
      while (j < raw.length) { if (raw[j].rashiEnd !== raw[j].rashiStart) { nextRashi = raw[j].rashiEnd; break; } j++; }
      months.push({ ...m, isAdhika: true, rashi: nextRashi, baseName: nextRashi !== null ? LUNAR_MASAS[nextRashi] : null });
    } else if (((m.rashiEnd - m.rashiStart + 12) % 12) === 1) {
      months.push({ ...m, isAdhika: false, rashi: m.rashiEnd, baseName: LUNAR_MASAS[m.rashiEnd] });
    } else {
      months.push({ ...m, isAdhika: false, rashi: m.rashiEnd, baseName: null }); // kshaya masa (very rare)
    }
  }
  return months;
}

function findLunarMonth(months, name, year) {
  const candidates = months.filter(m => !m.isAdhika && m.baseName === name);
  let best = null, bestScore = Infinity;
  for (const m of candidates) {
    const sd = jdToDate(m.startJd, 0);
    const score = Math.abs(sd.year - year) * 400 + Math.abs(sd.month - 6);
    if (score < bestScore) { bestScore = score; best = m; }
  }
  return best;
}

/* ============================================================
   SOLAR MONTH WINDOW (for Tamil-solar-calendar festivals)
   ============================================================ */
function sankrantiDate(rashiIndex, year, tzOffset) {
  const targetDeg = rashiIndex * 30;
  const startJd = dateToJD(year, 1, 2, 0, 0, 0);
  const crossJd = genericCrossing(getSunLongitude, startJd, targetDeg, 400);
  if (crossJd === null) return null;
  const d = jdToDate(crossJd, tzOffset);
  return { year: d.year, month: d.month, day: d.day, jd: crossJd };
}
function solarMonthWindow(rashiIndex, year, tz) {
  const s = sankrantiDate(rashiIndex, year, tz);
  const e = sankrantiDate((rashiIndex + 1) % 12, year, tz);
  return { startJd: s.jd, endJd: e.jd };
}

/* ============================================================
   TITHI / NAKSHATRA VYAPTI RULES
   ============================================================ */
function tithiTargetDeg(paksha, tithiNum) {
  const idx = paksha === 'shukla' ? (tithiNum - 1) : (14 + tithiNum);
  return idx * 12;
}

function sunriseDayForWindow(tithiStartJd, tithiEndJd, lat, lon, tzOffset) {
  const civil = jdToDate(tithiStartJd, tzOffset);
  for (let i = -1; i <= 2; i++) {
    const d = new Date(Date.UTC(civil.year, civil.month - 1, civil.day + i));
    const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, dd = d.getUTCDate();
    const sr = sunriseJD(y, m, dd, lat, lon, tzOffset);
    if (sr === null) continue;
    if (sr >= tithiStartJd - 1e-6 && sr <= tithiEndJd + 1e-6) return { year: y, month: m, day: dd };
  }
  return { year: civil.year, month: civil.month, day: civil.day, flagged: true };
}
function madhyahnaDayForWindow(tithiStartJd, tithiEndJd, lat, lon, tzOffset) {
  const civil = jdToDate(tithiStartJd, tzOffset);
  for (let i = -1; i <= 2; i++) {
    const d = new Date(Date.UTC(civil.year, civil.month - 1, civil.day + i));
    const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, dd = d.getUTCDate();
    const mj = madhyahnaJD(y, m, dd, lat, lon, tzOffset);
    if (mj === null) continue;
    if (mj >= tithiStartJd - 1e-6 && mj <= tithiEndJd + 1e-6) return { year: y, month: m, day: dd };
  }
  return { year: civil.year, month: civil.month, day: civil.day, flagged: true };
}

/* Amanta lunar-month tithi search: uses expected-position + narrow radius to
   avoid the month's own start/end boundary being confused with the adjacent
   month's occurrence of the same tithi degree (this matters specifically for
   Pratipada and Amavasya). */
function tithiInLunarMonth(monthObj, paksha, tithiNum, vyapti, lat, lon, tzOffset) {
  const targetDeg = tithiTargetDeg(paksha, tithiNum);
  const monthLen = monthObj.endJd - monthObj.startJd;
  const ordinal = paksha === 'shukla' ? (tithiNum - 1) : (14 + tithiNum);
  const expectedJd = monthObj.startJd + (ordinal / 30) * monthLen;
  const tStart = findCrossingNearExpected(elongation, targetDeg, expectedJd, 2.5);
  if (tStart === null) return null;
  const tEnd = genericCrossing(elongation, tStart, (targetDeg + 12) % 360, 3);
  return vyapti === 'madhyahna'
    ? madhyahnaDayForWindow(tStart, tEnd, lat, lon, tzOffset)
    : sunriseDayForWindow(tStart, tEnd, lat, lon, tzOffset);
}

/* Solar-month-window tithi search (Tamil calendar festivals): a plain forward
   scan is safe here since tithi boundaries don't coincide with the solar
   window's own sankranti boundaries. */
function tithiInSolarWindow(monthObj, paksha, tithiNum, lat, lon, tzOffset) {
  const targetDeg = tithiTargetDeg(paksha, tithiNum);
  const searchStart = monthObj.startJd - 1;
  const maxDays = (monthObj.endJd - monthObj.startJd) + 3;
  const tStart = genericCrossing(elongation, searchStart, targetDeg, maxDays);
  if (tStart === null) return null;
  const tEnd = genericCrossing(elongation, tStart, (targetDeg + 12) % 360, 3);
  return sunriseDayForWindow(tStart, tEnd, lat, lon, tzOffset);
}

/* Nakshatra-at-sunrise within a lunar month window. */
function nakshatraInLunarMonth(monthObj, nakshatraIndex, lat, lon, tzOffset) {
  const NAK_SPAN = 13.333333333333334;
  const targetDeg = nakshatraIndex * NAK_SPAN;
  const monthLen = monthObj.endJd - monthObj.startJd;
  let nStart = null, cursor = monthObj.startJd - 1;
  while (cursor < monthObj.endJd + 1) {
    const c = genericCrossing(getMoonLongitude, cursor, targetDeg, monthLen + 3);
    if (c === null) break;
    if (c >= monthObj.startJd - 0.5 && c <= monthObj.endJd + 0.5) { nStart = c; break; }
    cursor = c + 1;
  }
  if (nStart === null) return null;
  const nEnd = genericCrossing(getMoonLongitude, nStart, (targetDeg + NAK_SPAN) % 360, 2);
  return sunriseDayForWindow(nStart, nEnd, lat, lon, tzOffset);
}

/* ============================================================
   TIMEZONE OFFSET HELPER (reuses panchang.js's Intl-based lookup)
   ============================================================ */
function tzOffsetForDate(tzName, dateObj) {
  return getTimezoneOffset(tzName, dateObj);
}

/* ============================================================
   FESTIVAL DEFINITIONS (17 festivals)
   Each entry's compute(year, lat, lon, tz, months) returns {year,month,day}
   or null. "months" is the pre-built buildLunarMonths(year) result, shared
   across all festivals for efficiency.
   ============================================================ */
const RASHI = { Mesha:0, Vrishabha:1, Mithuna:2, Karka:3, Simha:4, Kanya:5,
                 Tula:6, Vrischika:7, Dhanu:8, Makara:9, Kumbha:10, Meena:11 };
const NAK = { Ardra: 5 };

const FESTIVAL_DEFINITIONS = [
  {
    key: 'pongal', name: 'Pongal', rule: 'Makara Sankranti',
    compute: (year, lat, lon, tz) => sankrantiDate(RASHI.Makara, year, tz)
  },
  {
    key: 'rama_navami', name: 'Rama Navami', rule: 'Chaitra Shukla Navami (madhyahna-vyapti)',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Chaitra', year);
      return m ? tithiInLunarMonth(m, 'shukla', 9, 'madhyahna', lat, lon, tz) : null;
    }
  },
  {
    key: 'panguni_uthiram', name: 'Panguni Uthiram', rule: 'Meena (Tamil solar) Purnima',
    compute: (year, lat, lon, tz) => {
      const w = solarMonthWindow(RASHI.Meena, year, tz);
      return tithiInSolarWindow(w, 'shukla', 15, lat, lon, tz);
    }
  },
  {
    key: 'puthandu', name: 'Puthandu', rule: 'Mesha Sankranti',
    compute: (year, lat, lon, tz) => sankrantiDate(RASHI.Mesha, year, tz)
  },
  {
    key: 'karadaiyan_nombu', name: 'Karadaiyan Nombu', rule: 'Meena Sankranti',
    compute: (year, lat, lon, tz) => sankrantiDate(RASHI.Meena, year, tz)
  },
  {
    key: 'krishna_janmashtami', name: 'Krishna Janmashtami', rule: 'Shravana Krishna Ashtami (Smarta)',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Shravana', year);
      return m ? tithiInLunarMonth(m, 'krishna', 8, 'sunrise', lat, lon, tz) : null;
    }
  },
  {
    key: 'upakarma', name: 'Upakarma', rule: 'Shravana Purnima (Yajurveda)',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Shravana', year);
      return m ? tithiInLunarMonth(m, 'shukla', 15, 'sunrise', lat, lon, tz) : null;
    }
  },
  {
    key: 'vara_lakshmi', name: 'Vara Lakshmi Pooja', rule: 'First Shukra Vaara in Shravana Shukla Paksha',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Shravana', year);
      if (!m) return null;
      const start = tithiInLunarMonth(m, 'shukla', 1, 'sunrise', lat, lon, tz);
      if (!start) return null;
      for (let i = 0; i < 15; i++) {
        const d = new Date(Date.UTC(start.year, start.month - 1, start.day + i));
        if (d.getUTCDay() === 5) return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
      }
      return null;
    }
  },
  {
    key: 'navratri', name: 'Navratri', rule: 'Ashwin Shukla Pratipada (9 days)',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Ashwin', year);
      return m ? tithiInLunarMonth(m, 'shukla', 1, 'sunrise', lat, lon, tz) : null;
    }
  },
  {
    key: 'vijaya_dashami', name: 'Vijaya Dashami', rule: 'Tenth day after Navratri Pratipada',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Ashwin', year);
      const start = m ? tithiInLunarMonth(m, 'shukla', 1, 'sunrise', lat, lon, tz) : null;
      if (!start) return null;
      const d = new Date(Date.UTC(start.year, start.month - 1, start.day + 9));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
    }
  },
  {
    key: 'ganesha_chaturthi', name: 'Ganesha Chaturthi', rule: 'Bhadrapada Shukla Chaturthi (madhyahna-vyapti)',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Bhadrapada', year);
      return m ? tithiInLunarMonth(m, 'shukla', 4, 'madhyahna', lat, lon, tz) : null;
    }
  },
  {
    key: 'mahaalaya_paksha', name: 'Mahaalaya Paksha (start)', rule: 'Bhadrapada Krishna Pratipada',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Bhadrapada', year);
      return m ? tithiInLunarMonth(m, 'krishna', 1, 'sunrise', lat, lon, tz) : null;
    }
  },
  {
    key: 'mahaalaya_amavasya', name: 'Mahaalaya Amavasya', rule: 'Amavasya of Mahaalaya Paksha',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Bhadrapada', year);
      return m ? tithiInLunarMonth(m, 'krishna', 15, 'sunrise', lat, lon, tz) : null;
    }
  },
  {
    key: 'deepavali', name: 'Deepavali', rule: 'Ashwin Krishna Chaturdashi (displayed as "Karthika")',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Ashwin', year);
      return m ? tithiInLunarMonth(m, 'krishna', 14, 'sunrise', lat, lon, tz) : null;
    }
  },
  {
    key: 'karthikai_deepam', name: 'Karthikai Deepam', rule: 'Vrischika (Tamil solar) Purnima',
    compute: (year, lat, lon, tz) => {
      const w = solarMonthWindow(RASHI.Vrischika, year, tz);
      return tithiInSolarWindow(w, 'shukla', 15, lat, lon, tz);
    }
  },
  {
    key: 'arudra_darshanam', name: 'Arudra Darshanam', rule: 'Margashirsha, Ardra Nakshatra at sunrise',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Margashirsha', year);
      return m ? nakshatraInLunarMonth(m, NAK.Ardra, lat, lon, tz) : null;
    }
  },
  {
    key: 'hanumat_jayanthi', name: 'Hanumat Jayanthi', rule: 'Margashirsha Amavasya',
    compute: (year, lat, lon, tz, months) => {
      const m = findLunarMonth(months, 'Margashirsha', year);
      return m ? tithiInLunarMonth(m, 'krishna', 15, 'sunrise', lat, lon, tz) : null;
    }
  },
];

/* ============================================================
   PUBLIC ENTRY POINT
   ============================================================ */
async function computeFestivalYear(year, cityKey, overrides) {
  const city = FESTIVAL_CITIES.find(c => c.key === cityKey) || FESTIVAL_CITIES[0];
  const tzSample = new Date(year, 5, 15); // mid-year sample date for offset lookup
  const tz = tzOffsetForDate(city.tz, tzSample);
  const months = buildLunarMonths(year);
  overrides = overrides || {};

  return FESTIVAL_DEFINITIONS.map(def => {
    const overrideKey = `${def.key}:${year}`;
    if (overrides[overrideKey]) {
      const [oy, om, od] = overrides[overrideKey].split('-').map(Number);
      return { key: def.key, name: def.name, rule: def.rule, year: oy, month: om, day: od, overridden: true };
    }
    const result = def.compute(year, city.lat, city.lon, tz, months);
    if (!result) return { key: def.key, name: def.name, rule: def.rule, year: null, month: null, day: null, flagged: true };
    return { key: def.key, name: def.name, rule: def.rule, year: result.year, month: result.month, day: result.day, flagged: !!result.flagged };
  });
}
