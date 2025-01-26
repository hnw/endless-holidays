const Holidays = window.Holidays.default

const hd = new Holidays('JP', '', '',{types: ['public']}); // 日本の祝日情報を取得
let currentDate = new Date();

function renderCalendar(date) {
    // 現在の年と月を表示
    const monthYearEl = document.getElementById('month-year');
    monthYearEl.textContent = date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = ''; // 古いカレンダーをクリア
    if (!calendarEl) return; // nullチェック

    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // 曜日ラベル
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        calendarEl.appendChild(dayEl);
    });

    // 最初の日までの空白を追加
    const emptyDays = firstDay.getDay();
    for (let i = 0; i < emptyDays; i++) {
        const emptyDiv = document.createElement('div');
        calendarEl.appendChild(emptyDiv);
    }

    // 祝日を保存するための配列
    const holidaysInMonth = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        const dayEl = document.createElement('div');
        dayEl.textContent = i.toString();

        const dayOfWeek = dayDate.getDay();
        const holiday = hd.isHoliday(dayDate);

        // 祝日があるかチェック
        if (holiday) {
            holidaysInMonth.push(`${i}日 ${holiday[0].name || '祝日'}`); // 祝日名がundefinedの場合の処理
        }

        // 色の設定
        if (dayOfWeek === 0 || holiday) {
            dayEl.classList.add('sunday', 'holiday');
        } else if (dayOfWeek === 6) {
            dayEl.classList.add('saturday');
        }

        calendarEl.appendChild(dayEl);
    }

    // 祝日を表示
    let holidaysEl = document.getElementById('holidays');
    if (!holidaysEl) {
        holidaysEl = document.createElement('div');
        holidaysEl.id = 'holidays';
        calendarEl.parentNode.appendChild(holidaysEl); // カレンダーの外に追加
    }
    holidaysEl.innerHTML = '当月の祝日：<br>' + holidaysInMonth.join('<br>');
}

// 月を移動するボタンの設定
function setupButtons() {
    const prevButton = document.getElementById('prev-month');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
    } else {
        console.error('Previous month button not found');
    }

    const nextButton = document.getElementById('next-month');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });
    } else {
        console.error('Next month button not found');
    }
}

// 初期化
setupButtons(); // ボタンの設定を呼び出す
renderCalendar(currentDate);
