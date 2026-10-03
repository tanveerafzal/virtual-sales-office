"use client";

import { useMemo, useState } from "react";
import { calculateInstallment } from "@/lib/installment";
import type { TenantConfig } from "@/tenants/types";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Props = { tenant: TenantConfig };

export function InstallmentCalculator({ tenant }: Props) {
  const models = tenant.models.flatMap((model) =>
    model.price == null ? [] : [{ ...model, price: model.price }],
  );
  const [price, setPrice] = useState(models[0]?.price ?? 1_400_000);
  const [down, setDown] = useState(0);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(10);
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(
    () =>
      calculateInstallment({
        price,
        downPayment: down,
        annualRatePercent: rate,
        years,
      }),
    [price, down, rate, years],
  );

  return (
    <section className="px-6 py-10 md:px-10 md:py-14">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--t-gold)]">
          Pay over time
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-snug tracking-tight md:text-5xl">
          Installment calculator
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--t-muted)]">
          A buyer pays a set amount each month, like rent. When the full amount
          is paid, the home is transferred into their name. Enter the price,
          the rate of return, and the number of years.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {models.map((model) => (
          <button
            key={model.code}
            type="button"
            onClick={() => setPrice(model.price)}
            className={`rounded-full border px-3 py-1.5 text-left text-xs transition-colors ${
              price === model.price
                ? "border-[var(--t-gold)] text-[var(--t-fg)]"
                : "border-white/15 text-[var(--t-muted)] hover:text-[var(--t-fg)]"
            }`}
          >
            {model.code} {model.name} · {model.sqft} sq ft
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <form
          className="space-y-5 rounded-2xl border border-white/10 bg-black/20 p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <Field
            label="Home price"
            value={price}
            min={1}
            step={1000}
            prefix="$"
            onChange={setPrice}
          />
          <Field
            label="Paid up front (optional)"
            value={down}
            min={0}
            step={1000}
            prefix="$"
            onChange={setDown}
          />
          <Field
            label="Rate of return per year"
            value={rate}
            min={0}
            max={30}
            step={0.1}
            suffix="%"
            onChange={setRate}
          />
          <Field
            label="Years"
            value={years}
            min={1}
            max={50}
            step={1}
            onChange={setYears}
          />
        </form>

        <div className="rounded-2xl border border-white/10 bg-[var(--t-surface)] p-6">
          {"error" in result ? (
            <p className="text-[var(--t-gold)]">{result.error}</p>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--t-muted)]">
                Monthly installment
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--t-fg)] md:text-5xl">
                {money.format(result.monthly)}
              </p>
              <p className="mt-2 text-sm text-[var(--t-muted)]">
                {result.payments} payments
                {result.finalPayment !== result.monthly
                  ? `, last payment ${money.format(result.finalPayment)}`
                  : ""}
                . The home transfers after the last payment.
              </p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Stat label="Total the buyer pays" value={money.format(result.totalPaid)} />
                <Stat label="Amount financed" value={money.format(result.financed)} />
                <Stat label="Return over the term" value={money.format(result.returnAmount)} />
                <Stat
                  label="Paid up front"
                  value={money.format(roundShown(price - result.financed))}
                />
              </dl>
              <button
                type="button"
                className="mt-6 text-sm text-[var(--t-gold)] underline decoration-white/20 underline-offset-4"
                onClick={() => setShowSchedule((open) => !open)}
              >
                {showSchedule ? "Hide yearly schedule" : "Show yearly schedule"}
              </button>
              {showSchedule ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-[var(--t-muted)]">
                      <tr>
                        <th className="py-2 pr-3 font-medium">Year</th>
                        <th className="py-2 pr-3 font-medium">Paid</th>
                        <th className="py-2 pr-3 font-medium">Toward price</th>
                        <th className="py-2 pr-3 font-medium">Return</th>
                        <th className="py-2 font-medium">Still owing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.years.map((row) => (
                        <tr key={row.year} className="border-t border-white/10">
                          <td className="py-2 pr-3">{row.year}</td>
                          <td className="py-2 pr-3">{money.format(row.paid)}</td>
                          <td className="py-2 pr-3">{money.format(row.principal)}</td>
                          <td className="py-2 pr-3">{money.format(row.returnAmount)}</td>
                          <td className="py-2">{money.format(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-[var(--t-muted)]">
        Estimate only. This is not an offer, a mortgage, or a commitment to
        sell. The home stays in {tenant.builderName}&apos;s name until the full
        amount is paid, and a written agreement is required. Figures do not
        include taxes, legal fees, or adjustments unless they are already in
        the price you enter. Prices on this site are marketing information and
        can change. E&amp;O.E.
      </p>
    </section>
  );
}

function roundShown(n: number): number {
  return Math.round(n * 100) / 100;
}

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-[var(--t-muted)]">
        {label}
      </span>
      <span className="mt-2 flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3">
        {prefix ? <span className="text-[var(--t-muted)]">{prefix}</span> : null}
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          className="w-full bg-transparent py-3 text-lg text-[var(--t-fg)] outline-none"
        />
        {suffix ? <span className="text-[var(--t-muted)]">{suffix}</span> : null}
      </span>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-[var(--t-muted)]">{label}</dt>
      <dd className="mt-1 text-xl text-[var(--t-fg)]">{value}</dd>
    </div>
  );
}
