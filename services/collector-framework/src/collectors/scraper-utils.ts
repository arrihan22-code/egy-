export interface ScrapedRecord {
  [key: string]: unknown;
}

export interface ScrapeResult {
  records: ScrapedRecord[];
  sourceUrl: string;
  sourceName: string;
  fetchedAt: Date;
  recordCount: number;
  errors: string[];
}

export class ScraperUtils {
  private static userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ];

  private static lastRequestTime = 0;
  private static minDelayMs = 1500;

  static async rateLimitedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minDelayMs) {
      await new Promise(r => setTimeout(r, this.minDelayMs - elapsed));
    }
    this.lastRequestTime = Date.now();
    const ua = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    return fetch(url, {
      ...options,
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar-EG,ar;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        ...(options.headers || {}),
      },
    });
  }

  static extractTextBetween(html: string, start: string, end: string): string {
    const idx = html.indexOf(start);
    if (idx === -1) return '';
    const from = idx + start.length;
    const to = html.indexOf(end, from);
    return to === -1 ? html.substring(from) : html.substring(from, to);
  }

  static extractAllBetween(html: string, start: string, end: string): string[] {
    const results: string[] = [];
    let idx = 0;
    while (true) {
      const s = html.indexOf(start, idx);
      if (s === -1) break;
      const from = s + start.length;
      const e = html.indexOf(end, from);
      if (e === -1) { results.push(html.substring(from)); break; }
      results.push(html.substring(from, e));
      idx = e + end.length;
    }
    return results;
  }

  static extractTagContent(html: string, tag: string): string[] {
    const results: string[] = [];
    const openTag = `<${tag}`;
    const closeTag = `</${tag}>`;
    let idx = 0;
    while (true) {
      const s = html.indexOf(openTag, idx);
      if (s === -1) break;
      const closeBracket = html.indexOf('>', s);
      if (closeBracket === -1) break;
      const from = closeBracket + 1;
      const e = html.indexOf(closeTag, from);
      if (e === -1) break;
      results.push(html.substring(from, e).trim());
      idx = e + closeTag.length;
    }
    return results;
  }

  static extractAttribute(html: string, tag: string, attr: string): string[] {
    const results: string[] = [];
    const pattern = `<${tag}[^>]*${attr}=["']([^"']*)["']`;
    const regex = new RegExp(pattern, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push(match[1]);
    }
    return results;
  }

  static extractTableRows(html: string): string[][] {
    const rows: string[][] = [];
    const rowHtmls = this.extractAllBetween(html, '<tr', '</tr>');
    for (const rowHtml of rowHtmls) {
      const cells = this.extractAllBetween(rowHtml, '<td', '</td>').map(c => {
        const inner = this.extractAllBetween(c, '>', '<');
        return inner.length > 0 ? inner[0] : c.replace(/<[^>]*>/g, '').trim();
      });
      if (cells.length > 0) rows.push(cells);
    }
    return rows;
  }

  static extractJsonLd(html: string): Record<string, unknown>[] {
    const results: Record<string, unknown>[] = [];
    const scripts = this.extractAllBetween(html, '<script type="application/ld+json"', '</script>');
    for (const script of scripts) {
      const jsonStart = script.indexOf('>');
      if (jsonStart === -1) continue;
      const jsonStr = script.substring(jsonStart + 1).trim();
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) results.push(...parsed);
        else results.push(parsed);
      } catch {}
    }
    return results;
  }

  static extractScriptVar(html: string, varName: string): string | null {
    const patterns = [
      new RegExp(`var\\s+${varName}\\s*=\\s*'([^']+)'`),
      new RegExp(`var\\s+${varName}\\s*=\\s*"([^"]+)"`),
      new RegExp(`let\\s+${varName}\\s*=\\s*'([^']+)'`),
      new RegExp(`let\\s+${varName}\\s*=\\s*"([^"]+)"`),
      new RegExp(`const\\s+${varName}\\s*=\\s*'([^']+)'`),
      new RegExp(`const\\s+${varName}\\s*=\\s*"([^"]+)"`),
      new RegExp(`${varName}\\s*=\\s*'([^']+)'`),
      new RegExp(`${varName}\\s*=\\s*"([^"]+)"`),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  static extractJsonFromScript(html: string, varName: string): Record<string, unknown> | null {
    const raw = this.extractScriptVar(html, varName);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  static extractJsonArrayFromScript(html: string, varName: string): Record<string, unknown>[] | null {
    const raw = this.extractScriptVar(html, varName);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch { return null; }
  }

  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  }

  static extractByRegex(html: string, pattern: RegExp): string[] {
    const results: string[] = [];
    let match;
    while ((match = pattern.exec(html)) !== null) {
      results.push(match[1] || match[0]);
    }
    return results;
  }

  static extractTable(html: string): Record<string, string>[] {
    const rows: Record<string, string>[] = [];
    const tableHtmls = this.extractAllBetween(html, '<table', '</table>');
    for (const tableHtml of tableHtmls) {
      const rowHtmls = this.extractAllBetween(tableHtml, '<tr', '</tr>');
      let headers: string[] = [];
      for (let i = 0; i < rowHtmls.length; i++) {
        const cells = this.extractAllBetween(rowHtmls[i], '<td', '</td>').map(c => this.stripHtml(c));
        if (cells.length === 0) {
          headers = this.extractAllBetween(rowHtmls[i], '<th', '</th>').map(c => this.stripHtml(c));
          continue;
        }
        if (headers.length > 0 && cells.length === headers.length) {
          const row: Record<string, string> = {};
          headers.forEach((h, j) => { row[h] = cells[j] || ''; });
          rows.push(row);
        } else if (cells.length > 0) {
          const row: Record<string, string> = {};
          cells.forEach((c, j) => { row[`col${j}`] = c; });
          rows.push(row);
        }
      }
    }
    return rows;
  }

  static extractCoordinates(html: string): { lat: number; lng: number } | null {
    const patterns = [
      /(?:lat|latitude)[":\s]*([\d.-]+)[,\s]*(?:lng|lng|longitude|lon)[":\s]*([\d.-]+)/i,
      /(?:lng|longitude|lon)[":\s]*([\d.-]+)[,\s]*(?:lat|latitude)[":\s]*([\d.-]+)/i,
      /data-lat=["']([\d.-]+)["'][^>]*data-lng=["']([\d.-]+)["']/i,
      /data-lng=["']([\d.-]+)["'][^>]*data-lat=["']([\d.-]+)["']/i,
      /data-latitude=["']([\d.-]+)["'][^>]*data-longitude=["']([\d.-]+)["']/i,
      /data-longitude=["']([\d.-]+)["'][^>]*data-latitude=["']([\d.-]+)["']/i,
      /class="[^"]*lat[^"]*"[^>]*>([\d.-]+)</i,
      /class="[^"]*lng[^"]*"[^>]*>([\d.-]+)</i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
    }
    return null;
  }

  static extractPhoneNumbers(text: string): string[] {
    const phones: string[] = [];
    const patterns = [
      /(?:\+20|0)?1[0-2]\d{8}/g,
      /(?:\+20|0)?1[0-9]{9}/g,
      /0\d{2,3}[-\s]?\d{3}[-\s]?\d{4}/g,
      /(?:\+20|0020)?\d{9,10}/g,
      /1\d{4,9}/g,
    ];
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) phones.push(...matches);
    }
    return [...new Set(phones)];
  }

  static extractWorkingHours(text: string): string {
    const patterns = [
      /(?:ساعات العمل|مواعيد العمل|working hours|open|hours)[:\s]*([^.\n]{5,100})/i,
      /(?:من|from)\s+(\d{1,2}[:.]?\d{0,2}\s*(?:ص|م|AM|PM)?)\s*(?:إلى|to)\s*(\d{1,2}[:.]?\d{0,2}\s*(?:ص|م|AM|PM)?)/i,
      /(\d{1,2}[:.]?\d{0,2}\s*(?:ص|م|AM|PM)?)\s*[-–—to]+\s*(\d{1,2}[:.]?\d{0,2}\s*(?:ص|م|AM|PM)?)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0].trim();
    }
    return '';
  }

  static extractGovernorate(text: string): string {
    const govs = [
      'القاهرة', 'Cairo',
      'الجيزة', 'Giza',
      'الإسكندرية', 'Alexandria',
      'الدقهلية', 'Dakahlia',
      'الشرقية', 'Sharqia',
      'القليوبية', 'Qalyubia',
      'الغربية', 'Gharbia',
      'المنوفية', 'Monufia',
      'البحيرة', 'Beheira',
      'كفر الشيخ', 'Kafr El Sheikh',
      'دمياط', 'Damietta',
      'بورسعيد', 'Port Said',
      'الإسماعيلية', 'Ismailia',
      'السويس', 'Suez',
      'شمال سيناء', 'North Sinai',
      'جنوب سيناء', 'South Sinai',
      'بني سويف', 'Beni Suef',
      'الفيوم', 'Fayoum',
      'المنيا', 'Minya',
      'أسيوط', 'Assiut',
      'سوهاج', 'Sohag',
      'قنا', 'Qena',
      'الأقصر', 'Luxor',
      'أسوان', 'Aswan',
      'البحر الأحمر', 'Red Sea',
      'الوادي الجديد', 'New Valley',
      'مطروح', 'Matrouh',
      'شمال سيناء', 'North Sinai',
      'جنوب سيناء', 'South Sinai',
      'حلوان', 'Helwan',
      '6 أكتوبر', '6th of October',
    ];
    for (let i = 0; i < govs.length; i += 2) {
      if (text.includes(govs[i])) return govs[i];
    }
    for (let i = 1; i < govs.length; i += 2) {
      if (text.includes(govs[i])) return govs[i];
    }
    return '';
  }

  static extractCity(text: string): string {
    const cities = [
      'القاهرة', 'Cairo',
      'الجيزة', 'Giza',
      'الإسكندرية', 'Alexandria',
      'شبرا الخيمة', 'Shubra El Kheima',
      'حلوان', 'Helwan',
      'المحلة الكبرى', 'El Mahalla El Kubra',
      'المنصورة', 'Mansoura',
      'طنطا', 'Tanta',
      'بورسعيد', 'Port Said',
      'السويس', 'Suez',
      'الأقصر', 'Luxor',
      'أسوان', 'Aswan',
      'المنيا', 'Minya',
      'سوهاج', 'Sohag',
      'أسيوط', 'Assiut',
      'بنها', 'Benha',
      'شبين الكوم', 'Shebin El Kom',
      'بنى سويف', 'Beni Suef',
      'الفيوم', 'Fayoum',
      'قنا', 'Qena',
      'كفر الشيخ', 'Kafr El Sheikh',
      'دمياط', 'Damietta',
      'بورسعيد', 'Port Said',
      'الإسماعيلية', 'Ismailia',
      'السويس', 'Suez',
      'الأقصر', 'Luxor',
      'أسوان', 'Aswan',
      'الغردقة', 'Hurghada',
      'شرم الشيخ', 'Sharm El Sheikh',
      'مرسى مطروح', 'Mersa Matruh',
      'طنطا', 'Tanta',
      'المنصورة', 'Mansoura',
      'الزقازيق', 'Zagazig',
      'بنها', 'Benha',
      'كفر الشيخ', 'Kafr El Sheikh',
      'دمياط', 'Damietta',
      'المنيا', 'Minya',
      'سوهاج', 'Sohag',
      'أسيوط', 'Assiut',
      'قنا', 'Qena',
      'الأقصر', 'Luxor',
      'أسوان', 'Aswan',
      'الغردقة', 'Hurghada',
      'شرم الشيخ', 'Sharm El Sheikh',
      'مرسى مطروح', 'Mersa Matruh',
      'بني سويف', 'Beni Suef',
      'الفيوم', 'Fayoum',
      'دمنهور', 'Damanhur',
      'المنصورة', 'Mansoura',
      'الزقازيق', 'Zagazig',
      'بنها', 'Benha',
      'دمياط', 'Damietta',
      'بورسعيد', 'Port Said',
      'الإسماعيلية', 'Ismailia',
      'السويس', 'Suez',
      'الأقصر', 'Luxor',
      'أسوان', 'Aswan',
      'الغردقة', 'Hurghada',
    ];
    for (let i = 0; i < cities.length; i += 2) {
      if (text.includes(cities[i])) return cities[i];
    }
    for (let i = 1; i < cities.length; i += 2) {
      if (text.includes(cities[i])) return cities[i];
    }
    return '';
  }

  static extractPrice(text: string): number | null {
    const patterns = [
      /(\d+[.,]?\d*)\s*(?:جنيه|EGP|LE|ج\.م|جم|ج م)/,
      /(?:جنيه|EGP|LE|ج\.م|جم|ج م)\s*(\d+[.,]?\d*)/,
      /price[":\s]*(\d+[.,]?\d*)/i,
      /(\d+[.,]?\d*)\s*(?:EGP|LE)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseFloat(match[1].replace(',', ''));
        if (!isNaN(num)) return num;
      }
    }
    return null;
  }

  static extractServices(text: string): string[] {
    const services: string[] = [];
    const serviceKeywords = [
      'صراف آلي', 'ATM', 'إيداع', 'Deposit', 'سحب', 'Withdrawal',
      'تحويل', 'Transfer', 'دفع فواتير', 'Bill Payment',
      'شحن', 'Recharge', 'استعلام', 'Inquiry',
      'تسديد', 'Payment', 'صرف', 'Exchange',
      'خدمة عملاء', 'Customer Service', 'إنترنت', 'Internet',
      'توصيل', 'Delivery', 'طلب أونلاين', 'Online Order',
    ];
    for (const kw of serviceKeywords) {
      if (text.includes(kw)) services.push(kw);
    }
    return services;
  }

  static extractCoordinatesFromScript(html: string): { lat: number; lng: number } | null {
    const patterns = [
      /(?:lat|latitude)\s*[:=]\s*([\d.-]+)[,\s}]*(?:lng|lng|longitude|lon)\s*[:=]\s*([\d.-]+)/i,
      /(?:lng|longitude|lon)\s*[:=]\s*([\d.-]+)[,\s}]*(?:lat|latitude)\s*[:=]\s*([\d.-]+)/i,
      /"lat"\s*:\s*([\d.-]+)[,\s]*"lng"\s*:\s*([\d.-]+)/i,
      /"lng"\s*:\s*([\d.-]+)[,\s]*"lat"\s*:\s*([\d.-]+)/i,
      /"latitude"\s*:\s*([\d.-]+)[,\s]*"longitude"\s*:\s*([\d.-]+)/i,
      /"longitude"\s*:\s*([\d.-]+)[,\s]*"latitude"\s*:\s*([\d.-]+)/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= 22 && lat <= 32 && lng >= 25 && lng <= 37) {
          return { lat, lng };
        }
      }
    }
    return null;
  }

  static extractAddressBlock(html: string): string {
    const patterns = [
      /(?:العنوان|Address|address|location|Location)[:\s]*([^<.]{10,200})/i,
      /(?:عنوان|address|location)["\s:]*([^"]{10,200})/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return this.stripHtml(match[1]).trim();
    }
    return '';
  }

  static extractName(html: string, lang: 'ar' | 'en' = 'ar'): string {
    if (lang === 'ar') {
      const patterns = [
        /<h[1-6][^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)/i,
        /<h[1-6][^>]*>([^<]{3,100})<\/h[1-6]>/,
        /<title>([^<]{3,100})<\/title>/i,
        /class="[^"]*(?:title|name|heading)[^"]*"[^>]*>([^<]{3,100})/i,
        /<span[^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)/i,
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return this.stripHtml(match[1]).trim();
      }
    } else {
      const patterns = [
        /<h[1-6][^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)/i,
        /<h[1-6][^>]*>([^<]{3,100})<\/h[1-6]>/,
        /<title>([^<]{3,100})<\/title>/i,
        /class="[^"]*(?:title|name|heading)[^"]*"[^>]*>([^<]+)/i,
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return this.stripHtml(match[1]).trim();
      }
    }
    return '';
  }

  static extractPhone(text: string): string {
    const phones = this.extractPhoneNumbers(text);
    return phones.length > 0 ? phones[0] : '';
  }

  static extractAllPhones(text: string): string[] {
    return this.extractPhoneNumbers(text);
  }

  static extractWorkingHoursFromHtml(html: string): string {
    const text = this.stripHtml(html);
    return this.extractWorkingHours(text);
  }

  static extractGovernorateFromHtml(html: string): string {
    const text = this.stripHtml(html);
    return this.extractGovernorate(text);
  }

  static extractCityFromHtml(html: string): string {
    const text = this.stripHtml(html);
    return this.extractCity(text);
  }

  static extractServicesFromHtml(html: string): string[] {
    const text = this.stripHtml(html);
    return this.extractServices(text);
  }

  static extractPriceFromHtml(html: string): number | null {
    const text = this.stripHtml(html);
    return this.extractPrice(text);
  }

  static extractAddressFromHtml(html: string): string {
    const text = this.stripHtml(html);
    return this.extractAddressBlock(html) || text.substring(0, 200).trim();
  }

  static extractNameFromHtml(html: string, lang: 'ar' | 'en' = 'ar'): string {
    return this.extractName(html, lang);
  }

  static extractPhoneFromHtml(html: string): string {
    const text = this.stripHtml(html);
    return this.extractPhone(text);
  }

  static extractAllPhonesFromHtml(html: string): string[] {
    const text = this.stripHtml(html);
    return this.extractAllPhones(text);
  }

  static extractWorkingHoursFromText(text: string): string {
    return this.extractWorkingHours(text);
  }

  static extractGovernorateFromText(text: string): string {
    return this.extractGovernorate(text);
  }

  static extractCityFromText(text: string): string {
    return this.extractCity(text);
  }

  static extractServicesFromText(text: string): string[] {
    return this.extractServices(text);
  }

  static extractPriceFromText(text: string): number | null {
    return this.extractPrice(text);
  }

  static extractAddressFromText(text: string): string {
    return this.extractAddressBlock(text) || text.substring(0, 200).trim();
  }
}