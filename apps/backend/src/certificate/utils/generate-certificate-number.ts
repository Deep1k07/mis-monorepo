// Ported from tnvServer/src/services/GenerateCertificateNumber.js.
// Computes certificate number and the initial/surveillance/recertification
// date strings used in the final certificate's info table.

export type CertificateType =
  | 'initial'
  | 'transfer'
  | 'surveillance'
  | 'recertification';

export interface GenerateCertificateNumberInput {
  entity_id: string;
  cab_code: string;
  type?: CertificateType;
  valid_until?: string; // dd/mm/yyyy — only used for recertification
  newCertificateNo?: string; // manual override
}

export interface GeneratedCertificateNumber {
  today: string; // dd/mm/yyyy
  curr_date: string; // dd/mm/yyyy
  certificationNumber: string;
  firstSurvalance: string; // dd/mm/yyyy
  secondSurvalance: string; // dd/mm/yyyy
  rec: string; // dd/mm/yyyy
  expiryDate: string; // dd/mm/yyyy
}

const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getTodayIST = (): Date => {
  const nowUTC = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(nowUTC.getTime() + istOffset);
};

const adjustDate = (
  baseDate: Date,
  { years = 0, months = 0, days = 0 }: { years?: number; months?: number; days?: number },
): Date => {
  const date = new Date(baseDate);
  const originalDay = date.getUTCDate();
  const targetYear = date.getUTCFullYear() + years;
  const targetMonth = date.getUTCMonth() + months;
  const lastDayOfMonth = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  const finalDay = Math.min(originalDay, lastDayOfMonth);
  const temp = new Date(Date.UTC(targetYear, targetMonth, finalDay));
  temp.setUTCDate(temp.getUTCDate() + days);
  return temp;
};

const randomTwoDigit = (): string =>
  String(Math.floor(Math.random() * 100)).padStart(2, '0');

export function generateCertificateNumber(
  data: GenerateCertificateNumberInput,
  country: string | undefined,
  mssCode: string,
  code: string = randomTwoDigit(),
): GeneratedCertificateNumber {
  const todayIST = getTodayIST();
  const baseDate = new Date(
    Date.UTC(
      todayIST.getUTCFullYear(),
      todayIST.getUTCMonth(),
      todayIST.getUTCDate(),
    ),
  );

  let firstSurvalanceDate: Date;
  let secondSurvalanceDate: Date;
  let recertificationDate: Date;

  if (data.type === 'recertification' && data.valid_until) {
    const [day, month, year] = data.valid_until.split('/').map(Number);
    const validUntilDate = new Date(Date.UTC(year, month - 1, day));
    const nextDayAfterValidUntil = new Date(validUntilDate);
    nextDayAfterValidUntil.setUTCDate(nextDayAfterValidUntil.getUTCDate() + 1);

    firstSurvalanceDate = adjustDate(nextDayAfterValidUntil, {
      years: 1,
      months: -1,
    });
    secondSurvalanceDate = adjustDate(nextDayAfterValidUntil, {
      years: 2,
      months: -1,
    });
    recertificationDate = adjustDate(validUntilDate, { years: 3 });
  } else {
    firstSurvalanceDate = adjustDate(baseDate, { years: 1, months: -1 });
    secondSurvalanceDate = adjustDate(baseDate, { years: 2, months: -1 });
    recertificationDate = adjustDate(baseDate, { years: 3, days: -1 });
  }

  const curr_date = formatDate(baseDate);
  const firstSurvalance = formatDate(firstSurvalanceDate);
  const secondSurvalance = formatDate(secondSurvalanceDate);
  const rec = formatDate(recertificationDate);

  const dd = String(todayIST.getDate()).padStart(2, '0');
  const mm = String(todayIST.getMonth() + 1).padStart(2, '0');
  const yyyy = todayIST.getFullYear();
  const datePart = `${yyyy}${mm}${dd}`;

  const certificationNumber = data.newCertificateNo
    ? data.newCertificateNo
    : `${data.entity_id}${data.cab_code}${datePart}${country ?? ''}${mssCode}${code}`;

  return {
    today: curr_date,
    curr_date,
    certificationNumber,
    firstSurvalance,
    secondSurvalance,
    rec,
    expiryDate: rec,
  };
}
