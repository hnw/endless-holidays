const Holidays = window.Holidays.default;

const holidayCountries =  (new Holidays()).getCountries()
const holidayHolders = Object.fromEntries(
  Object.keys(holidayCountries).map((country) => [country, new Holidays(country, '', '', { types: ['public'] })])
);

var language = (window.navigator.languages && window.navigator.languages[0]) ||
window.navigator.language ||
window.navigator.userLanguage ||
window.navigator.browserLanguage;
let currentDate = new Date();

function renderCalendar(year, month, country) {
      const countryEl = document.getElementById('country')
    if (!holidayHolders[country]) {
      country = ''
      countryEl.innerHTML = ''
    } else {
      countryEl.innerHTML = `<span class="fi fi-${country.toLowerCase()}"></span>${holidayCountries[country]}`
    }
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    const monthYearEl = document.getElementById('month-year');
    monthYearEl.textContent = firstDay.toLocaleDateString(language, { year: 'numeric', month: 'long' });
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
                        text = `${text} (<span class="fi fi-${cc.toLowerCase()}"></span><a href="#year=${year}&month=${month}&country=${cc}">${cc}</a>)`
                    }
                    details.push(text)
                }
            }
            holidayDetails[i] = details
        }
        const showHolidays = () => {
            const holidayText = holidayDetails[i]?.join('</li><li>') || 'No holidays';
            const holidaysEl = document.getElementById('holidays');
            const monthDay = dayDate.toLocaleDateString(language, { month: 'long', day: 'numeric' });
            holidaysEl.innerHTML = `${monthDay}:<ul><li>${holidayText}</li></ul>`;
        }
        dayEl.addEventListener('click', showHolidays);
        if (dayDate.toDateString() === new Date().toDateString()) {
            dayEl.classList.add('today');
            showHolidays()
        }
        calendarEl.appendChild(dayEl);
    }

    //const holidaysEl = document.getElementById('holidays');
    //holidaysEl.innerHTML = holidayDetails.join('<br>');
    //holidaysEl.innerHTML = ''
}

// 月を移動するボタンの設定
function setupButtons() {
    const prevButton = document.getElementById('prev-month');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            const { year, month, country } = getParamsFromHash();
            updateHash(year, month - 1, country)
            renderCalendar(year, month - 1, country)
        });
    }

    const nextButton = document.getElementById('next-month');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const { year, month, country } = getParamsFromHash();
            updateHash(year, month + 1, country)
            renderCalendar(year, month + 1, country)
        });
    }
}

// ハッシュから年・月・国を取得
function getParamsFromHash() {
    const hash = window.location.hash.substring(1); // '#'を取り除く
    const params = new URLSearchParams(hash);
    const year = parseInt(params.get('year')) || new Date().getFullYear();
    const month = parseInt(params.get('month')) || (new Date().getMonth() + 1);
    const country = params.get('country') || '';
    return { year, month, country };
}

// ハッシュを更新
function updateHash(year, month, country) {
    const date = new Date(year, month - 1, 1);
    window.location.hash = `year=${date.getFullYear()}&month=${date.getMonth()+1}&country=${country}`;
}

window.addEventListener('hashchange', () => {
    const { year, month, country } = getParamsFromHash();
    renderCalendar(year, month, country);
});

// 初期化
setupButtons();
const { year, month, country } = getParamsFromHash();
renderCalendar(year, month, country);
