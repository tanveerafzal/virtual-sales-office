export type YearRow = {
  year: number;
  paid: number;
  principal: number;
  returnAmount: number;
  balance: number;
};

export type InstallmentResult = {
  financed: number;
  monthly: number;
  finalPayment: number;
  payments: number;
  totalPaid: number;
  returnAmount: number;
  years: YearRow[];
};

export type InstallmentInput = {
  price: number;
  downPayment: number;
  annualRatePercent: number;
  years: number;
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateInstallment(
  input: InstallmentInput,
): InstallmentResult | { error: string } {
  const price = input.price;
  const down = input.downPayment;
  const n = Math.round(input.years * 12);

  if (!(price > 0)) return { error: "Enter the home price." };
  if (!(down >= 0) || down >= price) {
    return { error: "The upfront amount must be less than the home price." };
  }
  if (!(n >= 1) || n > 600) {
    return { error: "The term must be between 1 month and 50 years." };
  }
  if (!(input.annualRatePercent >= 0) || input.annualRatePercent > 30) {
    return { error: "The rate of return must be between 0% and 30%." };
  }

  const financed = round2(price - down);
  const i = input.annualRatePercent / 100 / 12;
  const raw =
    i === 0
      ? financed / n
      : (financed * (i * (1 + i) ** n)) / ((1 + i) ** n - 1);
  const monthly = round2(raw);

  let balance = financed;
  const years: YearRow[] = [];
  let yearPaid = 0;
  let yearPrincipal = 0;
  let yearReturn = 0;
  let finalPayment = monthly;

  for (let p = 1; p <= n; p++) {
    const interest = i === 0 ? 0 : round2(balance * i);
    let principal = round2(monthly - interest);
    if (p === n || principal >= balance) principal = balance;
    const paid = round2(principal + interest);
    if (p === n) finalPayment = paid;
    balance = round2(Math.max(0, balance - principal));
    yearPaid = round2(yearPaid + paid);
    yearPrincipal = round2(yearPrincipal + principal);
    yearReturn = round2(yearReturn + interest);
    if (p % 12 === 0 || p === n) {
      years.push({
        year: Math.ceil(p / 12),
        paid: yearPaid,
        principal: yearPrincipal,
        returnAmount: yearReturn,
        balance,
      });
      yearPaid = 0;
      yearPrincipal = 0;
      yearReturn = 0;
    }
  }

  const installments = round2(years.reduce((sum, row) => sum + row.paid, 0));
  return {
    financed,
    monthly,
    finalPayment,
    payments: n,
    totalPaid: round2(down + installments),
    returnAmount: round2(years.reduce((sum, row) => sum + row.returnAmount, 0)),
    years,
  };
}
