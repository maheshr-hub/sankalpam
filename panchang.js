/**
 * Sankalpam Calculator - JavaScript Implementation
 * Calculates Panchang elements for daily Hindu rituals
 * Uses astronomical algorithms with Lahiri Ayanamsha
 */

// Constants
const LAHIRI_AYANAMSHA_J2000 = 23.853833; // Degrees at J2000.0
const AYANAMSHA_ANNUAL_RATE = 50.2564 / 3600; // Degrees per year
const J2000 = 2451545.0; // Julian Day for J2000.0 epoch

const NAKSHATRA_SPAN = 13.333333333333334;
const TITHI_SPAN = 12.0;
const YOGA_SPAN = 13.333333333333334;
const RASHI_SPAN = 30.0;

const SAMVATSARA_EPOCH_YEAR = 1987;
const UTTARAYANA_MONTHS = [9, 10, 11, 0, 1, 2];

// Lookup tables with Sanskrit script, Tamil script, and English
const SAMVATSARAS = [
    ["Prabhava", "प्रभव", "பிரபவ", "Prabhava"],
    ["Vibhava", "विभव", "விபவ", "Vibhava"],
    ["Shukla", "शुक्ल", "சுக்ல", "Shukla"],
    ["Pramodoota", "प्रमोदूत", "பிரமோதூத", "Pramodoota"],
    ["Prajothpatti", "प्रजोत्पत्ति", "பிரஜோத்பத்தி", "Prajothpatti"],
    ["Angirasa", "आङ्गिरस", "ஆங்கிரச", "Angirasa"],
    ["Srimukha", "श्रीमुख", "ஸ்ரீமுக", "Srimukha"],
    ["Bhava", "भव", "பவ", "Bhava"],
    ["Yuva", "युव", "யுவ", "Yuva"],
    ["Dhathu", "धातु", "தாது", "Dhathu"],
    ["Eeshvara", "ईश्वर", "ஈஸ்வர", "Eeshvara"],
    ["Bahudhanya", "बहुधान्य", "பஹுதான்ய", "Bahudhanya"],
    ["Pramathi", "प्रमाथी", "பிரமாதி", "Pramathi"],
    ["Vikrama", "विक्रम", "விக்கிரம", "Vikrama"],
    ["Vishu", "विषु", "விஷு", "Vishu"],
    ["Chitrabhanu", "चित्रभानु", "சித்திரபானு", "Chitrabhanu"],
    ["Svabhanu", "स्वभानु", "சுபானு", "Svabhanu"],
    ["Tarana", "तारण", "தாரண", "Tarana"],
    ["Parthiva", "पार्थिव", "பார்த்திவ", "Parthiva"],
    ["Vyaya", "व्यय", "வியய", "Vyaya"],
    ["Sarvajith", "सर्वजित्", "சர்வஜித்", "Sarvajith"],
    ["Sarvadhari", "सर्वधारी", "சர்வதாரி", "Sarvadhari"],
    ["Virodhi", "विरोधी", "விரோதி", "Virodhi"],
    ["Vikrithi", "विकृति", "விக்ருதி", "Vikrithi"],
    ["Khara", "खर", "கர", "Khara"],
    ["Nandana", "नन्दन", "நந்தன", "Nandana"],
    ["Vijaya", "विजय", "விஜய", "Vijaya"],
    ["Jaya", "जय", "ஜய", "Jaya"],
    ["Manmatha", "मन्मथ", "மன்மத", "Manmatha"],
    ["Durmukhi", "दुर्मुखी", "துர்முகி", "Durmukhi"],
    ["Hevilambi", "हेविलम्बी", "ஹேவிளம்பி", "Hevilambi"],
    ["Vilambi", "विलम्बी", "விளம்பி", "Vilambi"],
    ["Vikari", "विकारी", "விகாரி", "Vikari"],
    ["Sharvari", "शार्वरी", "சார்வரி", "Sharvari"],
    ["Plava", "प्लव", "பிலவ", "Plava"],
    ["Shubhakrithu", "शुभकृत्", "சுபகிருது", "Shubhakrithu"],
    ["Shobhakrithu", "शोभकृत्", "சோபகிருது", "Shobhakrithu"],
    ["Krodhi", "क्रोधी", "குரோதி", "Krodhi"],
    ["Vishvavasu", "विश्वावसु", "விஸ்வாவசு", "Vishvavasu"],
    ["Parabhava", "पराभव", "பராபவ", "Parabhava"],
    ["Plavanga", "प्लवङ्ग", "பிலவங்க", "Plavanga"],
    ["Keelaka", "कीलक", "கீலக", "Keelaka"],
    ["Sowmya", "सौम्य", "சௌம்ய", "Sowmya"],
    ["Sadharana", "साधारण", "சாதாரண", "Sadharana"],
    ["Virodhikrithu", "विरोधिकृत्", "விரோதிகிருது", "Virodhikrithu"],
    ["Paridhavi", "परिधावी", "பரிதாபி", "Paridhavi"],
    ["Pramadicha", "प्रमादीच", "பிரமாதீச", "Pramadicha"],
    ["Ananda", "आनन्द", "ஆனந்த", "Ananda"],
    ["Rakshasa", "राक्षस", "ராக்ஷச", "Rakshasa"],
    ["Nala", "नल", "நள", "Nala"],
    ["Pingala", "पिङ्गल", "பிங்கள", "Pingala"],
    ["Kalayukthi", "कालयुक्ति", "காளயுக்தி", "Kalayukthi"],
    ["Siddharthi", "सिद्धार्थी", "சித்தார்த்தி", "Siddharthi"],
    ["Raudra", "रौद्र", "ரௌத்ரி", "Raudra"],
    ["Durmathi", "दुर्मति", "துர்மதி", "Durmathi"],
    ["Dundubhi", "दुन्दुभि", "துந்துபி", "Dundubhi"],
    ["Rudhirodgari", "रुधिरोद्गारी", "ருதிரோத்காரி", "Rudhirodgari"],
    ["Raktakshi", "रक्ताक्षी", "ரக்தாக்ஷி", "Raktakshi"],
    ["Krodhana", "क्रोधन", "குரோதன", "Krodhana"],
    ["Akshaya", "अक्षय", "அக்ஷய", "Akshaya"],
];

const MASAS = [
    ["Mesha", "मेष", "Chittirai", "சித்திரை", "Aries"],
    ["Vrishabha", "वृषभ", "Vaikasi", "வைகாசி", "Taurus"],
    ["Mithuna", "मिथुन", "Ani", "ஆனி", "Gemini"],
    ["Karka", "कर्क", "Adi", "ஆடி", "Cancer"],
    ["Simha", "सिंह", "Avani", "ஆவணி", "Leo"],
    ["Kanya", "कन्या", "Purattasi", "புரட்டாசி", "Virgo"],
    ["Tula", "तुला", "Aippasi", "ஐப்பசி", "Libra"],
    ["Vrischika", "वृश्चिक", "Karthigai", "கார்த்திகை", "Scorpio"],
    ["Dhanu", "धनु", "Margazhi", "மார்கழி", "Sagittarius"],
    ["Makara", "मकर", "Thai", "தை", "Capricorn"],
    ["Kumbha", "कुम्भ", "Masi", "மாசி", "Aquarius"],
    ["Meena", "मीन", "Panguni", "பங்குனி", "Pisces"],
];

const RITUS = [
    ["Vasanta", "वसन्त", "Ilavenil", "இளவேனில்", "Spring"],
    ["Grishma", "ग्रीष्म", "Mudhuvenil", "முதுவேனில்", "Summer"],
    ["Varsha", "वर्षा", "Kaar", "கார்", "Monsoon"],
    ["Sharad", "शरद्", "Kulir", "குளிர்", "Autumn"],
    ["Hemanta", "हेमन्त", "Munpani", "முன்பனி", "Pre-Winter"],
    ["Shishira", "शिशिर", "Pinpani", "பின்பனி", "Winter"],
];

const TITHIS_SHUKLA = [
    ["Prathama", "प्रथमा", "பிரதமை", "First"],
    ["Dvitiya", "द्वितीया", "துவிதியை", "Second"],
    ["Tritiya", "तृतीया", "திருதியை", "Third"],
    ["Chaturthi", "चतुर्थी", "சதுர்த்தி", "Fourth"],
    ["Panchami", "पञ्चमी", "பஞ்சமி", "Fifth"],
    ["Shashthi", "षष्ठी", "சஷ்டி", "Sixth"],
    ["Saptami", "सप्तमी", "சப்தமி", "Seventh"],
    ["Ashtami", "अष्टमी", "அஷ்டமி", "Eighth"],
    ["Navami", "नवमी", "நவமி", "Ninth"],
    ["Dashami", "दशमी", "தசமி", "Tenth"],
    ["Ekadashi", "एकादशी", "ஏகாதசி", "Eleventh"],
    ["Dvadashi", "द्वादशी", "துவாதசி", "Twelfth"],
    ["Trayodashi", "त्रयोदशी", "திரயோதசி", "Thirteenth"],
    ["Chaturdashi", "चतुर्दशी", "சதுர்தசி", "Fourteenth"],
    ["Purnima", "पूर्णिमा", "பௌர்ணமி", "Full Moon"],
];

const TITHIS_KRISHNA = [
    ["Prathama", "प्रथमा", "பிரதமை", "First"],
    ["Dvitiya", "द्वितीया", "துவிதியை", "Second"],
    ["Tritiya", "तृतीया", "திருதியை", "Third"],
    ["Chaturthi", "चतुर्थी", "சதுர்த்தி", "Fourth"],
    ["Panchami", "पञ्चमी", "பஞ்சமி", "Fifth"],
    ["Shashthi", "षष्ठी", "சஷ்டி", "Sixth"],
    ["Saptami", "सप्तमी", "சப்தமி", "Seventh"],
    ["Ashtami", "अष्टमी", "அஷ்டமி", "Eighth"],
    ["Navami", "नवमी", "நவமி", "Ninth"],
    ["Dashami", "दशमी", "தசமி", "Tenth"],
    ["Ekadashi", "एकादशी", "ஏகாதசி", "Eleventh"],
    ["Dvadashi", "द्वादशी", "துவாதசி", "Twelfth"],
    ["Trayodashi", "त्रयोदशी", "திரயோதசி", "Thirteenth"],
    ["Chaturdashi", "चतुर्दशी", "சதுர்தசி", "Fourteenth"],
    ["Amavasya", "अमावस्या", "அமாவாசை", "New Moon"],
];

const NAKSHATRAS = [
    ["Ashwini", "अश्विनी", "Aswini", "அஸ்வினி", "Ashwini"],
    ["Bharani", "भरणी", "Bharani", "பரணி", "Bharani"],
    ["Krittika", "कृत्तिका", "Karthigai", "கார்த்திகை", "Krittika"],
    ["Rohini", "रोहिणी", "Rohini", "ரோகிணி", "Rohini"],
    ["Mrigashira", "मृगशिरा", "Mrigasirisham", "மிருகசீரிஷம்", "Mrigashira"],
    ["Ardra", "आर्द्रा", "Thiruvathirai", "திருவாதிரை", "Ardra"],
    ["Punarvasu", "पुनर्वसु", "Punarpoosam", "புனர்பூசம்", "Punarvasu"],
    ["Pushya", "पुष्य", "Poosam", "பூசம்", "Pushya"],
    ["Ashlesha", "आश्लेषा", "Ayilyam", "ஆயில்யம்", "Ashlesha"],
    ["Magha", "मघा", "Magam", "மகம்", "Magha"],
    ["Purva Phalguni", "पूर्वफाल्गुनी", "Pooram", "பூரம்", "Purva Phalguni"],
    ["Uttara Phalguni", "उत्तरफाल्गुनी", "Uthiram", "உத்திரம்", "Uttara Phalguni"],
    ["Hasta", "हस्त", "Hastham", "ஹஸ்தம்", "Hasta"],
    ["Chitra", "चित्रा", "Chithirai", "சித்திரை", "Chitra"],
    ["Swati", "स्वाती", "Swathi", "சுவாதி", "Swati"],
    ["Vishakha", "विशाखा", "Visakam", "விசாகம்", "Vishakha"],
    ["Anuradha", "अनुराधा", "Anusham", "அனுஷம்", "Anuradha"],
    ["Jyeshtha", "ज्येष्ठा", "Kettai", "கேட்டை", "Jyeshtha"],
    ["Moola", "मूल", "Moolam", "மூலம்", "Moola"],
    ["Purva Ashadha", "पूर्वाषाढा", "Pooradam", "பூராடம்", "Purva Ashadha"],
    ["Uttara Ashadha", "उत्तराषाढा", "Uthiradam", "உத்திராடம்", "Uttara Ashadha"],
    ["Shravana", "श्रवण", "Thiruvonam", "திருவோணம்", "Shravana"],
    ["Dhanishta", "धनिष्ठा", "Avittam", "அவிட்டம்", "Dhanishta"],
    ["Shatabhisha", "शतभिषा", "Sathayam", "சதயம்", "Shatabhisha"],
    ["Purva Bhadrapada", "पूर्वभाद्रपदा", "Poorattathi", "பூரட்டாதி", "Purva Bhadrapada"],
    ["Uttara Bhadrapada", "उत्तरभाद्रपदा", "Uthirattathi", "உத்திரட்டாதி", "Uttara Bhadrapada"],
    ["Revati", "रेवती", "Revathi", "ரேவதி", "Revati"],
];

const YOGAS = [
    ["Vishkumbha", "विष्कुम्भ", "விஷ்கும்பம்", "Vishkumbha"],
    ["Priti", "प्रीति", "பிரீதி", "Priti"],
    ["Ayushman", "आयुष्मान्", "ஆயுஷ்மான்", "Ayushman"],
    ["Saubhagya", "सौभाग्य", "சௌபாக்யம்", "Saubhagya"],
    ["Shobhana", "शोभन", "சோபனம்", "Shobhana"],
    ["Atiganda", "अतिगण्ड", "அதிகண்டம்", "Atiganda"],
    ["Sukarma", "सुकर्मा", "சுகர்மா", "Sukarma"],
    ["Dhriti", "धृति", "திருதி", "Dhriti"],
    ["Shula", "शूल", "சூலம்", "Shula"],
    ["Ganda", "गण्ड", "கண்டம்", "Ganda"],
    ["Vriddhi", "वृद्धि", "விருத்தி", "Vriddhi"],
    ["Dhruva", "ध्रुव", "துருவம்", "Dhruva"],
    ["Vyaghata", "व्याघात", "வியாகாதம்", "Vyaghata"],
    ["Harshana", "हर्षण", "ஹர்ஷணம்", "Harshana"],
    ["Vajra", "वज्र", "வஜ்ரம்", "Vajra"],
    ["Siddhi", "सिद्धि", "சித்தி", "Siddhi"],
    ["Vyatipata", "व्यतीपात", "வியதீபாதம்", "Vyatipata"],
    ["Variyan", "वरीयान्", "வரியான்", "Variyan"],
    ["Parigha", "परिघ", "பரிகம்", "Parigha"],
    ["Shiva", "शिव", "சிவம்", "Shiva"],
    ["Siddha", "सिद्ध", "சித்தம்", "Siddha"],
    ["Sadhya", "साध्य", "சாத்தியம்", "Sadhya"],
    ["Shubha", "शुभ", "சுபம்", "Shubha"],
    ["Shukla", "शुक्ल", "சுக்லம்", "Shukla"],
    ["Brahma", "ब्रह्म", "பிரம்மம்", "Brahma"],
    ["Indra", "इन्द्र", "இந்திரம்", "Indra"],
    ["Vaidhriti", "वैधृति", "வைதிருதி", "Vaidhriti"],
];

const KARANAS_FIXED = [
    ["Shakuni", "शकुनि", "சகுனி", "Shakuni"],
    ["Chatushpada", "चतुष्पद", "சதுஷ்பாதம்", "Chatushpada"],
    ["Nagava", "नागव", "நாகவம்", "Nagava"],
    ["Kimstughna", "किंस्तुघ्न", "கிம்ஸ்துக்னம்", "Kimstughna"],
];

const KARANAS_ROTATING = [
    ["Bava", "बव", "பவம்", "Bava"],
    ["Balava", "बालव", "பாலவம்", "Balava"],
    ["Kaulava", "कौलव", "கௌலவம்", "Kaulava"],
    ["Taitila", "तैतिल", "தைதுலம்", "Taitila"],
    ["Garaja", "गरज", "கரஜம்", "Garaja"],
    ["Vanija", "वणिज", "வணிஜம்", "Vanija"],
    ["Vishti", "विष्टि", "பத்ரை", "Vishti"],
];

const VASARAS = [
    ["Bhanu", "भानु", "Ravi", "Nayiru", "ஞாயிறு", "Sunday"],
    ["Soma", "सोम", "Indu", "Thingal", "திங்கள்", "Monday"],
    ["Mangala", "मङ्गल", "Bhauma", "Sevvai", "செவ்வாய்", "Tuesday"],
    ["Budha", "बुध", "Sowmya", "Budhan", "புதன்", "Wednesday"],
    ["Guru", "गुरु", "Brihaspati", "Viyazhan", "வியாழன்", "Thursday"],
    ["Shukra", "शुक्र", "Bhrigu", "Velli", "வெள்ளி", "Friday"],
    ["Shani", "शनि", "Sthira", "Sani", "சனி", "Saturday"],
];

const PAKSHAS = [
    ["Shukla", "शुक्ल", "Valarpirai", "வளர்பிறை", "Bright/Waxing"],
    ["Krishna", "कृष्ण", "Theipirai", "தேய்பிறை", "Dark/Waning"],
];

const AYANAS = [
    ["Uttarayana", "उत्तरायण", "Uttarayanam", "உத்தராயணம்", "Northward Journey"],
    ["Dakshinayana", "दक्षिणायन", "Dakshinayanam", "தக்ஷிணாயணம்", "Southward Journey"],
];

// Astronomical calculation functions
function dateToJD(year, month, day, hour, minute, tzOffsetHours) {
    // Convert local time to UTC
    const utcHour = hour - tzOffsetHours + minute / 60;
    
    // Adjust date if UTC hour goes negative or past 24
    let adjYear = year, adjMonth = month, adjDay = day, adjHour = utcHour;
    if (adjHour < 0) {
        adjHour += 24;
        adjDay -= 1;
    } else if (adjHour >= 24) {
        adjHour -= 24;
        adjDay += 1;
    }
    
    // Julian Day calculation
    if (adjMonth <= 2) {
        adjYear -= 1;
        adjMonth += 12;
    }
    
    const A = Math.floor(adjYear / 100);
    const B = 2 - A + Math.floor(A / 4);
    
    const jd = Math.floor(365.25 * (adjYear + 4716)) + 
               Math.floor(30.6001 * (adjMonth + 1)) + 
               adjDay + adjHour / 24 + B - 1524.5;
    
    return jd;
}

function jdToDate(jd, tzOffsetHours) {
    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;
    
    let a;
    if (z < 2299161) {
        a = z;
    } else {
        const alpha = Math.floor((z - 1867216.25) / 36524.25);
        a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    const utcHour = f * 24;
    const localHour = utcHour + tzOffsetHours;
    
    const hours = Math.floor(localHour);
    const minutes = Math.floor((localHour - hours) * 60);
    const seconds = Math.floor(((localHour - hours) * 60 - minutes) * 60);
    
    return { year, month, day, hours, minutes, seconds };
}

function getLahiriAyanamsha(jd) {
    const t = (jd - J2000) / 365.25;
    return LAHIRI_AYANAMSHA_J2000 + AYANAMSHA_ANNUAL_RATE * t;
}

function getSunLongitude(jd) {
    // Simplified solar longitude calculation
    const t = (jd - J2000) / 36525;
    
    // Mean longitude
    let L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    L0 = L0 % 360;
    if (L0 < 0) L0 += 360;
    
    // Mean anomaly
    let M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    M = M * Math.PI / 180;
    
    // Equation of center
    const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * M) +
              0.000289 * Math.sin(3 * M);
    
    // True longitude
    let sunLong = L0 + C;
    
    // Convert to sidereal
    const ayanamsha = getLahiriAyanamsha(jd);
    sunLong = sunLong - ayanamsha;
    
    sunLong = sunLong % 360;
    if (sunLong < 0) sunLong += 360;
    
    return sunLong;
}

function getMoonLongitude(jd) {
    const t = (jd - J2000) / 36525;
    
    // Mean longitude
    let Lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
    Lp = Lp % 360;
    if (Lp < 0) Lp += 360;
    
    // Mean elongation
    let D = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
    D = D * Math.PI / 180;
    
    // Mean anomaly of Sun
    let M = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
    M = M * Math.PI / 180;
    
    // Mean anomaly of Moon
    let Mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
    Mp = Mp * Math.PI / 180;
    
    // Argument of latitude
    let F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;
    F = F * Math.PI / 180;
    
    // Longitude correction (simplified)
    let dL = 6288774 * Math.sin(Mp) +
             1274027 * Math.sin(2 * D - Mp) +
             658314 * Math.sin(2 * D) +
             213618 * Math.sin(2 * Mp) +
             -185116 * Math.sin(M) +
             -114332 * Math.sin(2 * F);
    
    dL = dL / 1000000;
    
    let moonLong = Lp + dL;
    
    // Convert to sidereal
    const ayanamsha = getLahiriAyanamsha(jd);
    moonLong = moonLong - ayanamsha;
    
    moonLong = moonLong % 360;
    if (moonLong < 0) moonLong += 360;
    
    return moonLong;
}

function getTimezoneOffset(timezone, date) {
    // Get timezone offset in hours
    const options = { timeZone: timezone, timeZoneName: 'longOffset' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    
    if (tzPart) {
        const match = tzPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
        if (match) {
            const sign = match[1] === '+' ? 1 : -1;
            const hours = parseInt(match[2]);
            const minutes = parseInt(match[3] || '0');
            return sign * (hours + minutes / 60);
        }
    }
    
    // Fallback: calculate from Date object
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate - utcDate) / (1000 * 60 * 60);
}

function findTithiTimes(jd, tithiIndex, tzOffset) {
    const targetStart = (tithiIndex * TITHI_SPAN) % 360;
    const targetEnd = ((tithiIndex + 1) * TITHI_SPAN) % 360;
    
    // Find start time
    let testJd = jd - 1;
    for (let i = 0; i < 15; i++) {
        const sunLong = getSunLongitude(testJd);
        const moonLong = getMoonLongitude(testJd);
        let elongation = (moonLong - sunLong) % 360;
        if (elongation < 0) elongation += 360;
        
        let error = (targetStart - elongation) % 360;
        if (error > 180) error -= 360;
        if (error < -180) error += 360;
        
        if (Math.abs(error) < 0.001) break;
        
        testJd += error / 12;
    }
    const startDate = jdToDate(testJd, tzOffset);
    
    // Find end time
    testJd = jd;
    for (let i = 0; i < 15; i++) {
        const sunLong = getSunLongitude(testJd);
        const moonLong = getMoonLongitude(testJd);
        let elongation = (moonLong - sunLong) % 360;
        if (elongation < 0) elongation += 360;
        
        let error = (targetEnd - elongation) % 360;
        if (error > 180) error -= 360;
        if (error < -180) error += 360;
        
        if (Math.abs(error) < 0.001) break;
        
        testJd += error / 12;
    }
    const endDate = jdToDate(testJd, tzOffset);
    
    return { startDate, endDate };
}

function findNakshatraTimes(jd, nakshatraIndex, tzOffset) {
    const targetStart = (nakshatraIndex * NAKSHATRA_SPAN) % 360;
    const targetEnd = ((nakshatraIndex + 1) * NAKSHATRA_SPAN) % 360;
    
    // Find start time
    let testJd = jd - 1;
    for (let i = 0; i < 15; i++) {
        const moonLong = getMoonLongitude(testJd);
        
        let error = (targetStart - moonLong) % 360;
        if (error > 180) error -= 360;
        if (error < -180) error += 360;
        
        if (Math.abs(error) < 0.001) break;
        
        testJd += error / 13;
    }
    const startDate = jdToDate(testJd, tzOffset);
    
    // Find end time
    testJd = jd;
    for (let i = 0; i < 15; i++) {
        const moonLong = getMoonLongitude(testJd);
        
        let error = (targetEnd - moonLong) % 360;
        if (error > 180) error -= 360;
        if (error < -180) error += 360;
        
        if (Math.abs(error) < 0.001) break;
        
        testJd += error / 13;
    }
    const endDate = jdToDate(testJd, tzOffset);
    
    return { startDate, endDate };
}

function formatDateTime(d) {
    const pad = n => n.toString().padStart(2, '0');
    return `${d.year}-${pad(d.month)}-${pad(d.day)} ${pad(d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`;
}

// Main calculation function
async function getPanchang(dateStr, timeStr, timezone) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    
    const jsDate = new Date(year, month - 1, day, hour, minute);
    const tzOffset = getTimezoneOffset(timezone, jsDate);
    
    const jd = dateToJD(year, month, day, hour, minute, tzOffset);
    
    const sunLong = getSunLongitude(jd);
    const moonLong = getMoonLongitude(jd);
    
    // Calculate elongation for Tithi
    let elongation = (moonLong - sunLong) % 360;
    if (elongation < 0) elongation += 360;
    
    const tithiIndex = Math.floor(elongation / TITHI_SPAN);
    const nakshatraIndex = Math.floor(moonLong / NAKSHATRA_SPAN);
    const yogaIndex = Math.floor(((sunLong + moonLong) % 360) / YOGA_SPAN);
    const masaIndex = Math.floor(sunLong / RASHI_SPAN);
    const rituIndex = Math.floor(masaIndex / 2);
    const ayanaIndex = UTTARAYANA_MONTHS.includes(masaIndex) ? 0 : 1;
    
    // Paksha
    const pakshaIndex = elongation < 180 ? 0 : 1;
    
    // Karana
    const degreesInTithi = elongation % TITHI_SPAN;
    const isSecondHalf = degreesInTithi >= (TITHI_SPAN / 2);
    const karanaPosition = tithiIndex * 2 + (isSecondHalf ? 1 : 0);
    
    let karana;
    if (karanaPosition === 0) karana = KARANAS_FIXED[3];
    else if (karanaPosition === 57) karana = KARANAS_FIXED[0];
    else if (karanaPosition === 58) karana = KARANAS_FIXED[1];
    else if (karanaPosition === 59) karana = KARANAS_FIXED[2];
    else karana = KARANAS_ROTATING[(karanaPosition - 1) % 7];
    
    // Samvatsara
    const tamilYear = masaIndex >= 9 ? year - 1 : year;
    const samvatsaraIndex = ((tamilYear - SAMVATSARA_EPOCH_YEAR) % 60 + 60) % 60;
    
    // Vasara (weekday)
    const dayOfWeek = jsDate.getDay();
    
    // Tithi name
    let tithi;
    if (tithiIndex < 15) {
        tithi = TITHIS_SHUKLA[tithiIndex];
    } else {
        tithi = TITHIS_KRISHNA[tithiIndex - 15];
    }
    
    // Calculate timing
    const tithiTimes = findTithiTimes(jd, tithiIndex, tzOffset);
    const nakshatraTimes = findNakshatraTimes(jd, nakshatraIndex, tzOffset);
    
    return {
        samvatsara: {
            index: samvatsaraIndex,
            sanskrit: SAMVATSARAS[samvatsaraIndex][0],
            sanskrit_script: SAMVATSARAS[samvatsaraIndex][1],
            tamil_script: SAMVATSARAS[samvatsaraIndex][2],
            english: SAMVATSARAS[samvatsaraIndex][3],
        },
        ayana: {
            index: ayanaIndex,
            sanskrit: AYANAS[ayanaIndex][0],
            sanskrit_script: AYANAS[ayanaIndex][1],
            tamil: AYANAS[ayanaIndex][2],
            tamil_script: AYANAS[ayanaIndex][3],
            english: AYANAS[ayanaIndex][4],
        },
        ritu: {
            index: rituIndex,
            sanskrit: RITUS[rituIndex][0],
            sanskrit_script: RITUS[rituIndex][1],
            tamil: RITUS[rituIndex][2],
            tamil_script: RITUS[rituIndex][3],
            english: RITUS[rituIndex][4],
        },
        masa: {
            index: masaIndex,
            sanskrit: MASAS[masaIndex][0],
            sanskrit_script: MASAS[masaIndex][1],
            tamil: MASAS[masaIndex][2],
            tamil_script: MASAS[masaIndex][3],
            english: MASAS[masaIndex][4],
        },
        paksha: {
            index: pakshaIndex,
            sanskrit: PAKSHAS[pakshaIndex][0],
            sanskrit_script: PAKSHAS[pakshaIndex][1],
            tamil: PAKSHAS[pakshaIndex][2],
            tamil_script: PAKSHAS[pakshaIndex][3],
            english: PAKSHAS[pakshaIndex][4],
        },
        tithi: {
            index: tithiIndex,
            sanskrit: tithi[0],
            sanskrit_script: tithi[1],
            tamil_script: tithi[2],
            english: tithi[3],
            start_time: formatDateTime(tithiTimes.startDate),
            end_time: formatDateTime(tithiTimes.endDate),
        },
        vasara: {
            index: dayOfWeek,
            sanskrit: VASARAS[dayOfWeek][0],
            sanskrit_script: VASARAS[dayOfWeek][1],
            alt_sanskrit: VASARAS[dayOfWeek][2],
            tamil: VASARAS[dayOfWeek][3],
            tamil_script: VASARAS[dayOfWeek][4],
            english: VASARAS[dayOfWeek][5],
        },
        nakshatra: {
            index: nakshatraIndex,
            sanskrit: NAKSHATRAS[nakshatraIndex][0],
            sanskrit_script: NAKSHATRAS[nakshatraIndex][1],
            tamil: NAKSHATRAS[nakshatraIndex][2],
            tamil_script: NAKSHATRAS[nakshatraIndex][3],
            english: NAKSHATRAS[nakshatraIndex][4],
            start_time: formatDateTime(nakshatraTimes.startDate),
            end_time: formatDateTime(nakshatraTimes.endDate),
        },
        yoga: {
            index: yogaIndex,
            sanskrit: YOGAS[yogaIndex][0],
            sanskrit_script: YOGAS[yogaIndex][1],
            tamil_script: YOGAS[yogaIndex][2],
            english: YOGAS[yogaIndex][3],
        },
        karana: {
            position: karanaPosition,
            sanskrit: karana[0],
            sanskrit_script: karana[1],
            tamil_script: karana[2],
            english: karana[3],
        },
    };
}
