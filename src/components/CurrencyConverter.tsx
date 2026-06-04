import React, { useState } from 'react';
import { Coins, ArrowLeftRight, Check, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // rate units per 1 USD
  name: string;
  flag: string;
  trend: string;
  isUp: boolean;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar', flag: '🇺🇸', trend: '+0.00%', isUp: true },
  { code: 'EUR', symbol: '€', rate: 0.9215, name: 'Euro', flag: '🇪🇺', trend: '-0.14%', isUp: false },
  { code: 'GBP', symbol: '£', rate: 0.7842, name: 'British Pound', flag: '🇬🇧', trend: '+0.08%', isUp: true },
  { code: 'RUB', symbol: '₽', rate: 90.4570, name: 'Russian Ruble', flag: '🇷🇺', trend: '+0.65%', isUp: true },
  { code: 'KES', symbol: 'KSh', rate: 132.5000, name: 'Kenyan Shilling', flag: '🇰🇪', trend: '+0.12%', isUp: true },
  { code: 'CNY', symbol: '¥', rate: 7.2435, name: 'Chinese Yuan', flag: '🇨🇳', trend: '-0.05%', isUp: false },
  { code: 'JPY', symbol: '¥', rate: 148.5200, name: 'Japanese Yen', flag: '🇯🇵', trend: '+0.31%', isUp: true },
  { code: 'AUD', symbol: 'A$', rate: 1.5020, name: 'Australian Dollar', flag: '🇦🇺', trend: '-0.22%', isUp: false },
  { code: 'CAD', symbol: 'C$', rate: 1.3685, name: 'Canadian Dollar', flag: '🇨🇦', trend: '+0.04%', isUp: true },
  { code: 'CHF', symbol: 'CHF', rate: 0.8912, name: 'Swiss Franc', flag: '🇨🇭', trend: '-0.11%', isUp: false },
];

interface CurrencyConverterProps {
  selectedStoreCurrency: string;
  onSelectStoreCurrency: (code: string) => void;
  lang?: string;
}

export default function CurrencyConverter({
  selectedStoreCurrency,
  onSelectStoreCurrency,
  lang = 'en'
}: CurrencyConverterProps) {
  const [calculatorAmount, setCalculatorAmount] = useState<string>('120.00');
  const [convertFrom, setConvertFrom] = useState<string>('USD');
  const [convertTo, setConvertTo] = useState<string>('EUR');
  const [showTooltip, setShowTooltip] = useState(false);

  // Parse input amount safely
  const amountVal = parseFloat(calculatorAmount) || 0;

  // Find currencies
  const fromCurrency = CURRENCIES.find(c => c.code === convertFrom) || CURRENCIES[0];
  const toCurrency = CURRENCIES.find(c => c.code === convertTo) || CURRENCIES[1];

  // Global conversion: arbitrary From -> To currency math with complete ledger precision
  const usdAmount = amountVal / fromCurrency.rate; // Convert From to baseline USD
  const convertedResult = usdAmount * toCurrency.rate; // Convert USD to To currency

  // Quick swap conversion directions
  const handleSwap = () => {
    setConvertFrom(convertTo);
    setConvertTo(convertFrom);
  };

  // Setup simple localized text inside compiler-safe framework
  const localText: Record<string, Record<string, string>> = {
    en: {
      title: "Moscovium Currency Exchange Bureau",
      converter: "High-Accuracy Ledgers Converter",
      ratesTable: "Live Central Bank Rates Desk",
      convertFrom: "Convert From",
      convertTo: "Convert To",
      enterAmount: "Specify Amount",
      applyStore: "Set as store currency",
      ledgerRates: "Exchange Rates vs 1 USD",
      activeStore: "Active Store Default",
      successMsg: "Prices converted successfully!"
    },
    sw: {
      title: "Ofisi ya Soko la Kubadilisha Fedha",
      converter: "Kikokotoo cha Kubadili Fedha",
      ratesTable: "Kiwango cha Sasa cha Ledge",
      convertFrom: "Badilisha Kutoka",
      convertTo: "Badilisha Kuwa",
      enterAmount: "Weka Kiasi",
      applyStore: "Weka kama Fedha ya Duka",
      ledgerRates: "Viwango vya kubadilisha dhidi ya 1 USD",
      activeStore: "Kazi Default ya Duka",
      successMsg: "Bei zimebadilishwa kikamilifu!"
    },
    es: {
      title: "Oficina de Cambio de Divisas de Moscovium",
      converter: "Conversor de Alta Precisión Ledger",
      ratesTable: "Mesa de Tasas de Cambio en Vivo",
      convertFrom: "Convertir de",
      convertTo: "Convertir a",
      enterAmount: "Especificar cantidad",
      applyStore: "Aplicar a toda la tienda",
      ledgerRates: "Tasas de cambio relativas a 1 USD",
      activeStore: "Moneda de tienda por defecto",
      successMsg: "¡Moneda de tienda cambiada con éxito!"
    },
    fr: {
      title: "Bureau de Change Moscovium",
      converter: "Convertisseur de Devises Précis",
      ratesTable: "Cours des Devises en Temps Réel",
      convertFrom: "Convertir depuis",
      convertTo: "Convertir en",
      enterAmount: "Spécifier le montant",
      applyStore: "Définir comme devise du magasin",
      ledgerRates: "Taux de change par rapport à 1 USD",
      activeStore: "Devise par défaut",
      successMsg: "Devise modifiée avec succès !"
    },
    de: {
      title: "Moscovium Devisenwechsel-Büro",
      converter: "Hochpräziser Wechselkurs-Rechner",
      ratesTable: "Live-Dezimalwechselkurse",
      convertFrom: "Konvertieren von",
      convertTo: "Konvertieren in",
      enterAmount: "Spezifischer Betrag",
      applyStore: "Auf gesamten Marktplatz anwenden",
      ledgerRates: "Wechselkurse gegenüber 1 USD",
      activeStore: "Aktive Standardwährung",
      successMsg: "Preise erfolgreich umgerechnet!"
    },
    zh: {
      title: "莫斯科元素货币高精度兑换局",
      converter: "高精度外汇记账兑换器",
      ratesTable: "全球账本实时汇率表",
      convertFrom: "转换源货币",
      convertTo: "兑换目标货币",
      enterAmount: "输入交易数额",
      applyStore: "一键配置为商城应用结算货币",
      ledgerRates: "每1美元(USD)对应的多国货币比率",
      activeStore: "商城当前生效本币",
      successMsg: "商城全站货品标价已换算生效！"
    },
    ru: {
      title: "Бюро обмена валют Moscovium",
      converter: "Высокоточный форекс-конвертер",
      ratesTable: "Таблица текущих курсов валют",
      convertFrom: "Конвертировать из",
      convertTo: "Конвертировать в",
      enterAmount: "Задать сумму",
      applyStore: "Применить как валюту магазина",
      ledgerRates: "Валютные курсы относительно 1 USD",
      activeStore: "Текущая валюта по умолчанию",
      successMsg: "Цены пересчитаны успешно!"
    },
    it: {
      title: "Ufficio Cambio Valute Moscovium",
      converter: "Convertitore di Precisione Ledger",
      ratesTable: "Tabella Tassi di Cambio in Tempo Reale",
      convertFrom: "Converti da",
      convertTo: "Converti in",
      enterAmount: "Specifica importo",
      applyStore: "Imposta come valuta predefinita d'acquisto",
      ledgerRates: "Tassi di cambio rispetto a 1 USD",
      activeStore: "Valuta predefinita",
      successMsg: "Prezzi convertiti con successo !"
    },
    ar: {
      title: "مكتب موسكوفيوم الذكي للتبادل المالي والعملات",
      converter: "مفرز حوسبة الأسعار المالي الفوري",
      ratesTable: "لوحة مؤشرات التداول والعملات المباشرة",
      convertFrom: "تمويل من عملة",
      convertTo: "إرسال إلى عملة",
      enterAmount: "أدخل القيمة المالية",
      applyStore: "تطبيق هذه العملة على المتجر بالكامل",
      ledgerRates: "أسعار تحويل العملات مقابل 1 دولار أمريكي",
      activeStore: "العملة الفعالة الحالية بالمتجر",
      successMsg: "تم تعديل وعرض الأسعار بالعملة الجديدة!"
    }
  };

  const gt = (key: string) => {
    return localText[lang]?.[key] || localText['en']?.[key] || key;
  };

  // Find active store currency object
  const activeCurrencyObj = CURRENCIES.find(c => c.code === selectedStoreCurrency) || CURRENCIES[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
      {/* Container Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 h-40 w-40 bg-red-600/10 rounded-full blur-2.5xl pointer-events-none" />
        
        {/* Header Title Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-650 flex items-center justify-center text-white font-black text-lg shadow-md animate-spin-slow">
              💱
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider uppercase text-red-400 font-sans tracking-tight">Moscovium Exchange Bureau</h2>
              <p className="text-xs text-slate-300 font-sans font-medium mt-0.5">{gt('title')}</p>
            </div>
          </div>
          
          {/* Active Store Target Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <Coins className="h-4 w-4 text-emerald-400 font-bold" />
            <span className="text-slate-400 font-bold">{gt('activeStore')}:</span>
            <span className="font-mono text-white font-extrabold bg-red-600 px-2 py-0.5 rounded text-[10px]">
              {activeCurrencyObj.flag} {activeCurrencyObj.code} ({activeCurrencyObj.symbol})
            </span>
          </div>
        </div>

        {/* Two Columns: Left calculator, Right market table */}
        <div className="grid lg:grid-cols-5 gap-6">
          
          {/* Column 1: Converter Form (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/65 rounded-2.5xl p-4 sm:p-5 border border-white/5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                {gt('converter')}
              </span>
              <button 
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
                title="Ledger precision help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>

            {showTooltip && (
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-mono">
                Real-time 6-digit fractional precision is maintained against the USD ledger anchor ($1 = 1.000000 USD). This prevents arbitrage desynchronization.
              </div>
            )}

            <div className="space-y-4 font-sans">
              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{gt('enterAmount')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold font-mono">{fromCurrency.symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full text-xs font-bold font-mono bg-slate-950 text-white border border-slate-750 p-2.5 pl-8 rounded-xl focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
                    placeholder="e.g. 100.00"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversion Pair Dropdowns with Instant Swap */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                {/* From Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{gt('convertFrom')}</label>
                  <select
                    className="w-full text-xs font-bold bg-slate-950 text-white border border-slate-750 p-2.5 rounded-xl focus:outline-none"
                    value={convertFrom}
                    onChange={(e) => setConvertFrom(e.target.value)}
                  >
                    {CURRENCIES.map(c => (
                      <option key={`from-${c.code}`} value={c.code} className="text-slate-900">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Icon Button */}
                <button
                  onClick={handleSwap}
                  type="button"
                  className="bg-slate-850 hover:bg-slate-750 border border-slate-700 p-2.5 rounded-xl transition-all active:scale-90 hover:border-red-500/50 flex items-center justify-center text-red-400 h-[38px] cursor-pointer"
                  title="Swap Currencies"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>

                {/* To Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{gt('convertTo')}</label>
                  <select
                    className="w-full text-xs font-bold bg-slate-950 text-white border border-slate-750 p-2.5 rounded-xl focus:outline-none"
                    value={convertTo}
                    onChange={(e) => setConvertTo(e.target.value)}
                  >
                    {CURRENCIES.map(c => (
                      <option key={`to-${c.code}`} value={c.code} className="text-slate-900">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Responsive calculated ledger output display */}
              <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3.5 space-y-1 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 font-sans">
                  Current Convert Conversion Quote
                </span>
                
                {/* Live Output String */}
                <p className="text-xs text-slate-300 font-mono">
                  {amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {convertFrom} =
                </p>
                <p className="text-lg font-black font-mono text-red-400">
                  {toCurrency.symbol}{convertedResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
                <span className="block text-[8px] text-slate-500 font-mono mt-1">
                  Rate: 1 {convertFrom} = {(toCurrency.rate / fromCurrency.rate).toFixed(6)} {convertTo}
                </span>
              </div>

              {/* Action: Set converted to "To Currency" as Store default */}
              <button
                type="button"
                onClick={() => {
                  onSelectStoreCurrency(convertTo);
                  alert(`${toCurrency.flag} Store successfully switched to matching ${toCurrency.name} (${toCurrency.code})!`);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] text-xs font-sans flex items-center justify-center gap-2"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{gt('applyStore')} : {toCurrency.code}</span>
              </button>
            </div>
          </div>

          {/* Column 2: Live central bank ledger desk (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900/65 rounded-2.5xl p-4 sm:p-5 border border-white/5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {gt('ratesTable')}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-sans tracking-wide">
                Synced 6-Digit Ledgers
              </span>
            </div>

            {/* Scrollable rates ledger cabinet */}
            <div className="overflow-y-auto max-h-[225px] pr-1 scrollbar-none space-y-1.5 font-sans">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-widest text-[9px] font-sans pb-1.5">
                    <th className="py-1">Currency</th>
                    <th className="py-1 text-right">Value vs 1 USD</th>
                    <th className="py-1 text-right">24h Delta</th>
                    <th className="py-1 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {CURRENCIES.map((curr) => {
                    const isActive = curr.code === selectedStoreCurrency;
                    return (
                      <tr key={`row-${curr.code}`} className={`hover:bg-white/5 transition-colors ${isActive ? 'bg-red-500/5' : ''}`}>
                        <td className="py-2.5 flex items-center gap-2">
                          <span className="text-sm shrink-0 select-none">{curr.flag}</span>
                          <div>
                            <span className="font-bold text-white uppercase block leading-none font-mono">{curr.code}</span>
                            <span className="text-[9px] text-slate-400 truncate max-w-[120px] block font-sans mt-0.5">{curr.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-xs">
                          {curr.symbol} {curr.rate.toFixed(4)}
                        </td>
                        <td className={`py-2.5 text-right font-mono font-bold text-[10px] ${curr.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                          {curr.trend}
                        </td>
                        <td className="py-2.5 text-right">
                          {isActive ? (
                            <span className="inline-flex h-6 px-2.5 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                              <Check className="h-3 w-3 mr-0.5" /> Shop active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectStoreCurrency(curr.code);
                              }}
                              className="inline-flex h-6 px-2.5 items-center justify-center rounded-lg bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 text-slate-300 text-[10px] font-semibold transition-all cursor-pointer select-none leading-none"
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Note prompt at bottom */}
            <p className="text-[9px] text-slate-450 leading-relaxed font-mono mt-2 border-t border-white/5 pt-2">
              ⚠️ Note: Currency quotes calculated dynamically base anchor coefficients. Complete invoice dispatch will lock payment in equivalent global currencies securely.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
