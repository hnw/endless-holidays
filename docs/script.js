const Holidays = window.Holidays.default;

const holidayCountries =  Object.keys((new Holidays()).getCountries())
const holidayHolders = Object.fromEntries(
    holidayCountries.map((country) => [country, new Holidays(country, '', '', { types: ['public'] })])
  );
let currentDate = new Date();
function renderCalendar(date) {
    const monthYearEl = document.getElementById('month-year');
    monthYearEl.textContent = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
    const calendarEl = document.getElementById('calendar');
    const holidaysEl = document.getElementById('holidays');
    calendarEl.innerHTML = '';
    holidaysEl.innerHTML = ''

    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const emptyDays = firstDay.getDay();
    for (let i = 0; i < emptyDays; i++) {
        const emptyDiv = document.createElement('div');
        calendarEl.appendChild(emptyDiv);
    }

    const holidaysInMonth = {};
    for (const [countryCode, holder] of Object.entries(holidayHolders)) {
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
                    if (holidaysInMonth[date][countryCode] == null) {
                        holidaysInMonth[date][countryCode] = [];
                    }
                    holidaysInMonth[date][countryCode].push(holiday)
                }
                holidayDate.setDate(holidayDate.getDate()+1);
            }
        }
    }
    const holidayDetails = []
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i)
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
            for (const [countryCode, holidays] of Object.entries(holidaysInMonth[i])) {
                for (const holiday of holidays) {
                    details.push(`${holiday.name || '祝日'} (<span class="fi fi-${countryCode.toLowerCase()}"></span>${countryCode})`)
                }
            }
            holidayDetails[i] = details
        }
        const showHolidays = () => {
            const holidayText = holidayDetails[i]?.join('</li><li>') || '祝日ではありません';
            const holidaysEl = document.getElementById('holidays');
            const monthDay = dayDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
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
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
    }

    const nextButton = document.getElementById('next-month');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });
    }
}

// 初期化
setupButtons();
renderCalendar(currentDate);
