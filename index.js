function Atom(initValue) {
  let value = initValue;
  const watchers = [];
  return {
    val: () => value,
    update: (f) => {
      const oldValue = value;
      const newValue = f(value);
      if (oldValue !== newValue) {
        value = newValue;
        watchers.forEach((watcher) => watcher(newValue));
      }
    },
    set: (val) => {
      const oldValue = value;
      if (val !== oldValue) {
        value = val;
        watchers.forEach((watcher) => watcher(val));
      }
    },
    addWatcher: (watcher) => watchers.push(watcher),
    removeWatcher: (watcher) => {
      watchers.splice(watchers.indexOf(watcher), 1);
    },
  };
}

function ok(v) {
  return { ok: v };
}

function err(v) {
  return { err: v };
}

function isOk(r) {
  return r["ok"];
}

function isErr(r) {
  return r["err"];
}

function mapOk(r, f) {
  if (isOk(r)) {
    return ok(f(r["ok"]));
  }
  return r;
}

function flatMapOk(r, f) {
  if (isOk(r)) {
    return f(r["ok"]);
  }
  return r;
}

function bindChain(initialResult, ...fns) {
  return fns.reduce((currentResult, fn) => {
    return flatMapOk(currentResult, fn);
  }, initialResult);
}

let dayInp;
let monthInp;
let yearInp;
let codeInp;
let outputBox;
let errorBox;
let copyButton;
let dayErrorField;
let monthErrorField;
let yearErrorField;
let codeErrorField;

const stateAtom = Atom({ day: null, month: null, year: null, code: null });

const isNotEmpty = (v) => {
  return v.length > 0 ? ok(v) : err(`Nie moze byc puste`);
};

const isNumber = (v) => {
  return Number.parseInt(v) ? ok(v) : err(`liczby sa oczekiwane`);
};

const isGreater = (n) => {
  return function (v) {
    return v >= n ? ok(v) : err(`liczba musi byc powyzej ${n}`);
  };
};

const isLess = (n) => {
  return function (v) {
    return v <= n ? ok(v) : err(`liczba musi byc ponizej ${n}`);
  };
};

const isPositive = (v) => {
  return v > 0 ? ok(v) : err(`musi byc dodatnia`);
};

const notEmptyStr = (s) => {
  return s !== "" ? ok(s) : err("nie moze byc puste");
};

const notContains = (s) => {
  return function (v) {
    return !v.includes(s) ? ok(v) : err(`nie moze zawierac: ${s}`);
  };
};

const validateDay = (val) => {
  return bindChain(ok(val), notEmptyStr, isNumber, isPositive, isLess(31));
};

const validateMonth = (val) => {
  return bindChain(ok(val), notEmptyStr, isNumber, isGreater(0), isLess(12));
};

const validateYear = (val) => {
  return bindChain(ok(val), notEmptyStr, isNumber, isGreater(1950));
};

const validateCode = (val) => {
  return bindChain(
    ok(val),
    notContains("9"),
    notContains("0"),
    notEmptyStr,
    isNumber,
    isGreater(1000),
    isLess(9999)
  );
};

const processInput = ({ val, field, validator, errorField, state }) => {
  const validation = validator(val);
  if (isOk(validation)) {
    errorField.textContent = "";

    state.update((ov) => ({
      ...ov,
      [field]: val,
    }));
  } else {
    errorField.textContent = validation["err"];
  }
};

document.addEventListener("DOMContentLoaded", () => {
  dayInp = document.querySelector(".date-input-container-day>input");
  monthInp = document.querySelector(".date-input-container-month>input");
  yearInp = document.querySelector(".date-input-container-year>input");
  outputBox = document.querySelector(".output-box");
  codeInp = document.querySelector(".code-container>input");
  errorBox = document.querySelector(".output-error");
  copyButton = document.querySelector(".copy-button");
  dayErrorField = document.querySelector(".day-error-field");
  monthErrorField = document.querySelector(".month-error-field");
  yearErrorField = document.querySelector(".year-error-field");
  codeErrorField = document.querySelector(".code-error-field");

  dayInp.addEventListener("input", (e) => {
    const val = e.target.value ? e.target.value : "";
    processInput({
      val,
      field: "day",
      validator: validateDay,
      errorField: dayErrorField,
      state: stateAtom,
    });
  });

  monthInp.addEventListener("input", (e) => {
    const val = e.target.value ? e.target.value : "";
    processInput({
      val,
      field: "month",
      validator: validateMonth,
      errorField: monthErrorField,
      state: stateAtom,
    });
  });

  yearInp.addEventListener("input", (e) => {
    const val = e.target.value ? e.target.value : "";
    processInput({
      val,
      field: "year",
      validator: validateYear,
      errorField: yearErrorField,
      state: stateAtom,
    });
  });

  codeInp.addEventListener("input", (e) => {
    const val = e.target.value ? e.target.value : "";
    processInput({
      val,
      field: "code",
      validator: validateCode,
      errorField: codeErrorField,
      state: stateAtom,
    });
  });

  copyButton.addEventListener("click", (_e) => {
    copyText(outputBox);
  });
});

const convertNumTwo = (s) => {
  if (!s) return "";
  const splitted = s.substring(0, 2);

  if (splitted == "00") return "00";

  if (splitted.length < 2 && splitted !== "0") {
    return `0${splitted}`;
  } else {
    return splitted;
  }
};

const genPass = (date, code) => {
  return Array.from(code ?? [])
    .map((x) => date[Number(x) - 1])
    .join("");
};

const formValidDate = (dateObj) => {
  return `${dateObj.year}${convertNumTwo(dateObj.month)}${convertNumTwo(
    dateObj.day
  )}`;
};

const copyText = (selector) => {
  if (!selector.innerText) return;
  navigator.clipboard.writeText(selector.innerText);

  errorBox.textContent = "Haslo zostalo skopiowano do schowka";
  setTimeout(() => {
    errorBox.textContent = "";
  }, 3000);
};

stateAtom.addWatcher((s) => {
  if (!s.day || !s.month || !s.year) return;

  let sanitizedDate = formValidDate(s);

  outputBox.textContent = genPass(sanitizedDate, s.code);
});
