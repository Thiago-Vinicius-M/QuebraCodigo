function daysInMonth(month, year) {
  if (month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}

/** Normaliza 8 dígitos ddmmaaaa: impossíveis viram o máximo válido naquele contexto. */
export function sanitizeBirthDigits(raw) {
  let d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length === 0) return d;
  const a = d.split("");

  if (a.length >= 1 && a[0] > "3") a[0] = "3";
  if (a.length >= 2) {
    let dd = parseInt(a[0] + a[1], 10);
    if (dd < 1) {
      a[0] = "0";
      a[1] = "1";
    }
    if (dd > 31) {
      a[0] = "3";
      a[1] = "1";
    }
    if (a[0] === "3" && a[1] > "1") a[1] = "1";
  }

  if (a.length >= 3 && a[2] > "1") a[2] = "0";
  if (a.length >= 4) {
    let mm = parseInt(a[2] + a[3], 10);
    if (mm < 1) {
      a[2] = "0";
      a[3] = "1";
    }
    if (mm > 12) {
      a[2] = "1";
      a[3] = "2";
    }
    if (a[2] === "0" && a[3] === "0") a[3] = "1";
    if (a[2] === "1" && a[3] > "2") a[3] = "2";
  }

  if (a.length >= 4) {
    let dd = parseInt(a[0] + a[1], 10);
    const mm = parseInt(a[2] + a[3], 10);
    let maxD = 31;
    if (mm === 2) maxD = 29;
    else if (mm === 4 || mm === 6 || mm === 9 || mm === 11) maxD = 30;
    if (dd > maxD) {
      const s = String(maxD).padStart(2, "0");
      a[0] = s[0];
      a[1] = s[1];
    }
  }

  if (a.length >= 8) {
    let yyyy = parseInt(a.slice(4, 8).join(""), 10);
    const maxY = new Date().getFullYear();
    const minY = Math.max(1900, maxY - 120);
    if (yyyy > maxY) yyyy = maxY;
    if (yyyy < minY) yyyy = minY;
    const ys = String(yyyy).padStart(4, "0");
    for (let i = 0; i < 4; i++) a[4 + i] = ys[i];

    const mm = parseInt(a[2] + a[3], 10);
    let dd = parseInt(a[0] + a[1], 10);
    const dim = daysInMonth(mm, yyyy);
    if (dd > dim) {
      const s = String(dim).padStart(2, "0");
      a[0] = s[0];
      a[1] = s[1];
    }
    if (dd < 1) {
      a[0] = "0";
      a[1] = "1";
    }
  }

  return a.join("");
}

export function formatBRDateDigits(digits) {
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

export function isValidBirthDateStr(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str.trim());
  if (!m) return false;
  const dd = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const yyyy = parseInt(m[3], 10);
  const maxY = new Date().getFullYear();
  const minY = Math.max(1900, maxY - 120);
  if (yyyy < minY || yyyy > maxY) return false;
  if (mm < 1 || mm > 12) return false;
  const dim = daysInMonth(mm, yyyy);
  if (dd < 1 || dd > dim) return false;
  return true;
}
