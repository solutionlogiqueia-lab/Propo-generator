const eur0 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 5490 → « 5 490 € » ; 8.5 → « 8,50 € ». */
export const eur = (n: number) => (Number.isInteger(n) ? eur0.format(n) : eur2.format(n));

export const dateFr = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d.length === 10 ? d + "T12:00:00" : d) : d;
  return isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

export const aujourdhui = () => new Date().toISOString().slice(0, 10);
export const uid = () => Math.random().toString(36).slice(2, 10);
