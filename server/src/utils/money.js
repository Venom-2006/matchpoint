
export const dollarsToCents = (dollars) => {
  if (typeof dollars !== "number" || !Number.isFinite(dollars)) {
    throw new TypeError("Dollars must be a finite number");
  }

  const cents = Math.round(dollars * 100);

  if (!Number.isSafeInteger(cents)) {
    throw new RangeError("Dollar amount is outside the supported range");
  }

  return cents;
};

export const centsToDollars = (cents) => {
  if (!Number.isSafeInteger(cents)) {
    throw new TypeError("Cents must be a safe integer");
  }

  return cents / 100;
};

export const formatCents = (cents) => {
  if (!Number.isSafeInteger(cents)) {
    throw new TypeError("Cents must be a safe integer");
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};
