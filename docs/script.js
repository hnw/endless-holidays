const Holidays = window.Holidays.default;
const currentTime = new Date();
const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

const holidayHolders = Object.fromEntries(
  Object.keys((new Holidays()).getCountries()).map((country) => [country, new Holidays(country, '', '', { types: ['public'] })])
);

var browserLanguage = (window.navigator.languages && window.navigator.languages[0]) ||
window.navigator.language ||
window.navigator.userLanguage ||
window.navigator.browserLanguage;

const holidayListHelper = (dayDate, holidays, lang) => {
    const holidayTextList = holidays ? holidays.map((el, i) => `<li>${el}</li>`).join('') : '<li>No holidays</li>';
    const monthDay = dayDate.toLocaleDateString(lang, { month: 'long', day: 'numeric' });
    return `<li>${monthDay}</li><ul>${holidayTextList}</ul>`;
}

function renderCalendar(year, month, country, lang) {
    const countryEl = document.getElementById('country')
    if (!holidayHolders[country]) {
      country = ''
    }
    while (countryEl.childNodes.length >= 2) {
        countryEl.removeChild(countryEl.lastChild);
    }
    if (holidayHolders[country]) {
      const holidayCountries = (new Holidays()).getCountries(lang)
      if (countryEl.childNodes.length <= 1) {
          countryEl.insertAdjacentHTML("beforeend", `<li><span class="fi fi-${country.toLowerCase()}"></span>${holidayCountries[country]}</li>`)
      }
    }
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const monthYearEl = document.getElementById('month-year');
    monthYearEl.textContent = firstDay.toLocaleDateString(lang, { year: 'numeric', month: 'long' });
    const calendarEl = document.getElementById('calendar');
    const holidaysEl = document.getElementById('holidays');
    calendarEl.innerHTML = '';
    holidaysEl.innerHTML = ''
    const emptyDays = firstDay.getDay();
    for (let i = 0; i < emptyDays; i++) {
        const emptyDiv = document.createElement('div');
        calendarEl.appendChild(emptyDiv);
    }
    const holidaysInMonth = {};
    for (const [cc, holder] of Object.entries(holidayHolders)) {
        if (country && country !== cc) {
            continue
        }
        for (const holiday of holder.getHolidays(year)) {
            const holidayDate = new Date(`${holiday.date.slice(0, 10)}T00:00:00`);
            const duration = Math.round((holiday.end.getTime()-holiday.start.getTime()) / 86400000)
            if (holidayDate > lastDay || (duration == 1 && holidayDate < firstDay)) {
                continue
            }
            for (let i = 1; i <= duration; i++) {
                const date = holidayDate.getDate();
                if (holidayDate >= firstDay && holidayDate <= lastDay) {
                    if (holidaysInMonth[date] == null) {
                        holidaysInMonth[date] = {};
                    }
                    if (holidaysInMonth[date][cc] == null) {
                        holidaysInMonth[date][cc] = [];
                    }
                    holidaysInMonth[date][cc].push(holiday)
                }
                holidayDate.setDate(holidayDate.getDate()+1);
            }
        }
    }
    const holidayDetails = []
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month - 1, i)
        const dayEl = document.createElement('div');
        dayEl.textContent = i.toString();

        const dayOfWeek = dayDate.getDay();
        if (dayOfWeek === 0) {
            dayEl.classList.add('sunday');
        } else if (dayOfWeek === 6) {
            dayEl.classList.add('saturday');
        }
        let isHoliday = false;
        if (holidaysInMonth[i]) {
            dayEl.classList.add('holiday');
            const details = [];
            for (const [cc, holidays] of Object.entries(holidaysInMonth[i])) {
                for (const holiday of holidays) {
                    let text = `${holiday.name || 'Holiday'}`
                    if (!country) {
                        text = `${text} (<span class="fi fi-${cc.toLowerCase()}"></span><a href="#${getHashString(year,month,cc,lang)}">${cc}</a>)`
                    }
                    details.push(text)
                }
            }
            holidayDetails[i] = details
        }
        const showHolidays = () => {
            holidaysEl.innerHTML = holidayListHelper(dayDate,holidayDetails[i],lang);
        }
        dayEl.addEventListener('click', showHolidays);
        if (dayDate.getTime() == today.getTime()) {
            dayEl.classList.add('today');
            showHolidays();
        }
        calendarEl.appendChild(dayEl);
    }
    if (window.location.hash.substring(1) == '') {
      // 初回アクセス時（ハッシュが空文字列のとき）は今日に特化した表示をする
    } else {
      holidaysEl.innerHTML = holidayDetails.map((el,i) => el ? `${holidayListHelper(new Date(year,month-1,i),el,lang)}` : el).join('');
    }
}

// 月を移動するボタンの設定
function setupButtons() {
    const prevButton = document.getElementById('prev-month');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            const { year, month, country, lang } = getParamsFromHash();
            updateHash(year, month - 1, country, lang);
        });
    }
    const nextButton = document.getElementById('next-month');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const { year, month, country, lang } = getParamsFromHash();
            updateHash(year, month + 1, country, lang);
        });
    }
    const worldIcon = document.getElementById('world-calendar');
    if (worldIcon) {
      worldIcon.addEventListener('click', (ev) => {
            const { year, month, country, lang } = getParamsFromHash();
            updateHash(year, month, '', lang);
        });
    }
}

// ハッシュから年・月・国を取得
function getParamsFromHash() {
    const hash = window.location.hash.substring(1); // '#'を取り除く
    const params = new URLSearchParams(hash);
    const year = parseInt(params.get('year')) || today.getFullYear();
    const month = parseInt(params.get('month')) || (today.getMonth() + 1);
    const country = params.get('country') || '';
    const lang = params.get('lang') || browserLanguage;
    return { year, month, country, lang };
}

// ハッシュを更新
function updateHash(year, month, country, lang) {
  const date = new Date(year, month - 1, 1);
  window.location.hash = getHashString(date.getFullYear(), date.getMonth()+1, country, lang);
}

function getHashString(year, month, country, lang) {
  return `year=${year}&month=${month}&country=${country}&lang=${lang}`
}

window.addEventListener('hashchange', () => {
    const { year, month, country, lang } = getParamsFromHash();
    renderCalendar(year, month, country, lang);
});

// 初期化
setupButtons();
const { year, month, country, lang} = getParamsFromHash();
renderCalendar(year, month, country, lang);
