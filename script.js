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
    calendarEl.innerHTML = '';

    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        calendarEl.appendChild(dayEl);
    });

    const emptyDays = firstDay.getDay();
    for (let i = 0; i < emptyDays; i++) {
        const emptyDiv = document.createElement('div');
        calendarEl.appendChild(emptyDiv);
    }

    const holidaysInMonth = [];

    const timezoneOffset = currentDate.getTimezoneOffset()
    const tzOffset = (-timezoneOffset+11*60) * 60000 // offset for UTC-11
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date((new Date(year,month, i)).getTime() + tzOffset)
        const dayEl = document.createElement('div');
        dayEl.textContent = i.toString();

        const dayOfWeek = dayDate.getDay();
        let isHoliday = false;

        // 各国の祝日をチェック
        for (const [countryCode, holder] of Object.entries(holidayHolders)) {
            const holiday = holder.isHoliday(dayDate);
            if (holiday) {
                isHoliday = true;
                holidaysInMonth.push(`${i}日 ${holiday[0].name || '祝日'} (${countryCode})`);
            }
        }

        if (dayOfWeek === 0 || isHoliday) {
            dayEl.classList.add('sunday', 'holiday');
        } else if (dayOfWeek === 6) {
            dayEl.classList.add('saturday');
        }
        calendarEl.appendChild(dayEl);
    }

    const holidaysEl = document.getElementById('holidays');
    holidaysEl.innerHTML = holidaysInMonth.join('<br>');
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
