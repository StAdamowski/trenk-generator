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

let dayInp;
let monthInp;
let yearInp;
let codeInp;
let outputBox;
let errorBox;

let stateAtom = Atom({ day: null, month: null, year: null, code: null });

document.addEventListener("DOMContentLoaded", () => {
    dayInp = document.querySelector(".date-input-container-day>input");
    monthInp = document.querySelector(".date-input-container-month>input");
    yearInp = document.querySelector(".date-input-container-year>input");
    outputBox = document.querySelector(".output-box");
    codeInp = document.querySelector(".code-container>input");
    errorBox = document.querySelector(".output-error");

    dayInp.addEventListener("input", (e) => {
        stateAtom.update((ov) => ({
            ...ov,
            day: e.target.value.substring(0, 2),
        }));
    });
    monthInp.addEventListener("input", (e) => {
        stateAtom.update((ov) => ({
            ...ov,
            month: e.target.value.substring(0, 2),
        }));
    });
    yearInp.addEventListener("input", (e) => {
        stateAtom.update((ov) => ({
            ...ov,
            year: e.target.value.substring(0, 4),
        }));
    });

    codeInp.addEventListener("input", (e) =>
        stateAtom.update((ov) => ({
            ...ov,
            code: e.target.value.substring(0, 4),
        }))
    );
});

const convertNumTwo = (s) => {
    if (!s) return "";
    let splitted = s.substring(0, 2);

    if (splitted == "00") return "00";

    if (splitted.length < 2 && splitted !== "0") {
        return `0${splitted}`;
    } else {
        return splitted;
    }
};

const genPass = (date, code) => {
    let out = "";
    for (let cyf of code) {
        if (cyf < 1 || cyf > 8) {
            errorBox.textContent =
                "kod nie moze zawierac cyfry mniej 0 a wiecej 8";
            return;
        }

        out += date[Number(cyf) - 1];
    }

    return out;
};

const formValidDate = (dateObj) => {
    return `${dateObj.year}${convertNumTwo(dateObj.month)}${convertNumTwo(
        dateObj.day
    )}`;
};

stateAtom.addWatcher((s) => {
    if (s.day.length < 1 || s.month.length < 1 || s.year.length < 4) {
        errorBox.textContent =
            "Dzien i miesiac musza zawierac 1-2 cyfry, rok 4 cyfry";
        return;
    }

    if (!s.code || s.code.length < 4) {
        errorBox.textContent = "Kod Trenkwalder niepoprawny";
        return;
    }
    errorBox.textContent = "";

    let sanitizedDate = formValidDate(s);

    outputBox.textContent = genPass(sanitizedDate, s.code);
});
