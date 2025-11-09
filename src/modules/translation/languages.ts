interface LanguageEntry {
  code: string;
  name: string;
}

type languageCode =
  | 'AR'
  | 'BG'
  | 'CS'
  | 'DA'
  | 'DE'
  | 'EL'
  | 'EN'
  | 'ES'
  | 'ES-419'
  | 'ET'
  | 'FI'
  | 'FR'
  | 'HU'
  | 'ID'
  | 'IT'
  | 'JA'
  | 'KO'
  | 'LT'
  | 'LV'
  | 'NB'
  | 'NL'
  | 'PL'
  | 'PT'
  | 'PT-BR'
  | 'PT-PT'
  | 'RO'
  | 'RU'
  | 'SK'
  | 'SL'
  | 'SV'
  | 'TH'
  | 'TR'
  | 'UK'
  | 'VI'
  | 'ZH'
  | 'ZH-HANS'
  | 'ZH-HANT';

const languages: Record<languageCode, LanguageEntry> = {
  'AR': {code: "AR", name: "Arabic"},
  'BG': {code: "BG", name: "Bulgarian"},
  'CS': {code: "CS", name: "Czech"},
  'DA': {code: "DA", name: "Danish"},
  'DE': {code: "DE", name: "German"},
  'EL': {code: "EL", name: "Greek"},
  'EN': {code: "EN", name: "English"},
  'ES': {code: "ES", name: "Spanish (all variants)"},
  'ES-419': {code: "ES-419", name: "Spanish (Latin American)"},
  'ET': {code: "ET", name: "Estonian"},
  'FI': {code: "FI", name: "Finnish"},
  'FR': {code: "FR", name: "French"},
  'HU': {code: "HU", name: "Hungarian"},
  'ID': {code: "ID", name: "Indonesian"},
  'IT': {code: "IT", name: "Italian"},
  'JA': {code: "JA", name: "Japanese"},
  'KO': {code: "KO", name: "Korean"},
  'LT': {code: "LT", name: "Lithuanian"},
  'LV': {code: "LV", name: "Latvian"},
  'NB': {code: "NB", name: "Norwegian Bokmål"},
  'NL': {code: "NL", name: "Dutch"},
  'PL': {code: "PL", name: "Polish"},
  'PT': {code: "PT", name: "Portuguese (all variants)"},
  'PT-BR': {code: "PT-BR", name: "Portuguese (Brazilian)"},
  'PT-PT': {code: "PT-PT", name: "Portuguese (excluding Brazilian)"},
  'RO': {code: "RO", name: "Romanian"},
  'RU': {code: "RU", name: "Russian"},
  'SK': {code: "SK", name: "Slovak"},
  'SL': {code: "SL", name: "Slovenian"},
  'SV': {code: "SV", name: "Swedish"},
  'TH': {code: "TH", name: "Thai (next-gen only)"},
  'TR': {code: "TR", name: "Turkish"},
  'UK': {code: "UK", name: "Ukrainian"},
  'VI': {code: "VI", name: "Vietnamese (next-gen only)"},
  'ZH': {code: "ZH", name: "Chinese (all variants)"},
  'ZH-HANS': {code: "ZH-HANS", name: "Chinese (simplified)"},
  'ZH-HANT': {code: "ZH-HANT", name: "Chinese (traditional)"},
};

type sourceLanguageCode =
  'AR'
  | 'BG'
  | 'CS'
  | 'DA'
  | 'DE'
  | 'EL'
  | 'EN'
  | 'ES'
  | 'ET'
  | 'FI'
  | 'FR'
  | 'HU'
  | 'ID'
  | 'IT'
  | 'JA'
  | 'KO'
  | 'LT'
  | 'LV'
  | 'NB'
  | 'NL'
  | 'PL'
  | 'PT'
  | 'RO'
  | 'RU'
  | 'SK'
  | 'SL'
  | 'SV'
  | 'TH'
  | 'TR'
  | 'UK'
  | 'VI'
  | 'ZH';

const sourceLanguages: Record<sourceLanguageCode, LanguageEntry> = {
  'AR': languages['AR'],
  'BG': languages['BG'],
  'CS': languages['CS'],
  'DA': languages['DA'],
  'DE': languages['DE'],
  'EL': languages['EL'],
  'EN': languages['EN'],
  'ES': languages['ES'],
  'ET': languages['ET'],
  'FI': languages['FI'],
  'FR': languages['FR'],
  'HU': languages['HU'],
  'ID': languages['ID'],
  'IT': languages['IT'],
  'JA': languages['JA'],
  'KO': languages['KO'],
  'LT': languages['LT'],
  'LV': languages['LV'],
  'NB': languages['NB'],
  'NL': languages['NL'],
  'PL': languages['PL'],
  'PT': languages['PT'],
  'RO': languages['RO'],
  'RU': languages['RU'],
  'SK': languages['SK'],
  'SL': languages['SL'],
  'SV': languages['SV'],
  'TH': languages['TH'],
  'TR': languages['TR'],
  'UK': languages['UK'],
  'VI': languages['VI'],
  'ZH': languages['ZH'],
};

type targetLanguageCode =
  'AR'
  | 'BG'
  | 'CS'
  | 'DA'
  | 'DE'
  | 'EL'
  | 'EN'
  | 'ES'
  | 'ES-419'
  | 'ET'
  | 'FI'
  | 'FR'
  | 'HU'
  | 'ID'
  | 'IT'
  | 'JA'
  | 'KO'
  | 'LT'
  | 'LV'
  | 'NB'
  | 'NL'
  | 'PL'
  | 'PT'
  | 'PT-BR'
  | 'PT-PT'
  | 'RO'
  | 'RU'
  | 'SK'
  | 'SL'
  | 'SV'
  | 'TH'
  | 'TR'
  | 'UK'
  | 'VI'
  | 'ZH'
  | 'ZH-HANS'
  | 'ZH-HANT';

const targetLanguages: Record<string, LanguageEntry> = {
  'AR': languages['AR'],
  'BG': languages['BG'],
  'CS': languages['CS'],
  'DA': languages['DA'],
  'DE': languages['DE'],
  'EL': languages['EL'],
  'EN': languages['EN'],
  'EN-GB': languages['EN-GB'],
  'EN-US': languages['EN-US'],
  'ES': languages['ES'],
  'ES-419': languages['ES-419'],
  'ET': languages['ET'],
  'FI': languages['FI'],
  'FR': languages['FR'],
  'HU': languages['HU'],
  'ID': languages['ID'],
  'IT': languages['IT'],
  'JA': languages['JA'],
  'KO': languages['KO'],
  'LT': languages['LT'],
  'LV': languages['LV'],
  'NB': languages['NB'],
  'NL': languages['NL'],
  'PL': languages['PL'],
  'PT': languages['PT'],
  'PT-BR': languages['PT-BR'],
  'PT-PT': languages['PT-PT'],
  'RO': languages['RO'],
  'RU': languages['RU'],
  'SK': languages['SK'],
  'SL': languages['SL'],
  'SV': languages['SV'],
  'TH': languages['TH'],
  'TR': languages['TR'],
  'UK': languages['UK'],
  'VI': languages['VI'],
  'ZH': languages['ZH'],
  'ZH-HANS': languages['ZH-HANS'],
  'ZH-HANT': languages['ZH-HANT'],
};

export {
  languages,
  sourceLanguages,
  targetLanguages,
  type languageCode,
  type sourceLanguageCode,
  type targetLanguageCode
};
