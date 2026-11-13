// Ten plik generuje cały widok Panelu Rodzica i zarządza jego logiką

export function renderujPanelRodzica(dane) {
  const kontener = document.getElementById('parent-panel-view');
  if (!kontener) return;

  // Generujemy HTML Panelu Rodzica
  kontener.innerHTML = `
    <h1 style="text-align: center; color: #831843; margin-bottom: 20px;">Panel Rodzica</h1>
    
    <!-- CEL TYGODNIOWY -->
    <div class="mission-box">
      <h2>🎯 Cel Tygodniowy</h2>
      <p>Ustaw cel na ten tydzień i motywuj dziecko do działania!</p>
      
      <div class="mission-input-group">
        <input type="number" id="mission-target" placeholder="np. 50" value="${dane.celTygodniowy > 0 ? dane.celTygodniowy : ''}" />
        <button onclick="window.ustawCel()">Ustaw cel</button>
      </div>

      <div id="mission-progress" style="display: ${dane.celTygodniowy > 0 ? 'block' : 'none'};">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" id="progress-fill" style="width: ${Math.min((dane.gwiazdki / dane.celTygodniowy) * 100, 100)}%"></div>
        </div>
        <div class="progress-text" id="progress-text">${dane.gwiazdki} / ${dane.celTygodniowy} gwiazdek</div>
      </div>
    </div>

    <!-- STREAK -->
    <div class="streak-box">
      <h2>🔥 Wyzwanie Dnia</h2>
      <div class="streak-number">${dane.streak}</div>
      <div class="streak-desc">dni z rzędu</div>
    </div>

    <!-- STATYSTYKI -->
    <div class="stats-card">
      <h2>Ogólne statystyki</h2>
      <div class="stats-grid">
        <div class="stat-box">
          <h3>Zdobyte gwiazdki</h3>
          <div class="value">${dane.gwiazdki}</div>
        </div>
        <div class="stat-box">
          <h3>Zaliczone słowa</h3>
          <div class="value">${dane.totalWords}</div>
        </div>
      </div>
    </div>

    <!-- ALBUM NAKLEJEK -->
    <div class="stats-card">
      <h2>Album Naklejek</h2>
      <p>Zbieraj gwiazdki, aby odblokować wszystkie naklejki!</p>
      <div class="album-grid">
        <div class="sticker ${dane.gwiazdki >= 10 ? 'unlocked' : ''}">🦁</div>
        <div class="sticker ${dane.gwiazdki >= 25 ? 'unlocked' : ''}">🚀</div>
        <div class="sticker ${dane.gwiazdki >= 50 ? 'unlocked' : ''}">🦄</div>
        <div class="sticker ${dane.gwiazdki >= 100 ? 'unlocked' : ''}">🐉</div>
        <div class="sticker ${dane.gwiazdki >= 200 ? 'unlocked' : ''}">🍦</div>
        <div class="sticker ${dane.gwiazdki >= 500 ? 'unlocked' : ''}">🏆</div>
      </div>
    </div>

    <!-- HISTORIA -->
    <div class="stats-card">
      <h2>Ostatnio ćwiczone głoski</h2>
      <div class="history-list" id="parent-history-list">
        ${dane.historiaHTML}
      </div>
    </div>

    <button class="back-to-app-btn" onclick="window.pokazGlowna()">← Wróć do ćwiczeń</button>
  `;
}

// Funkcja wywoływana z main.js po kliknięciu "Ustaw cel"
window.ustawCel = function() {
  const targetInput = document.getElementById('mission-target');
  const targetValue = parseInt(targetInput.value);
  
  if (isNaN(targetValue) || targetValue <= 0) {
    alert('Podaj poprawną liczbę gwiazdek (np. 50).');
    return;
  }

  // Wywołujemy funkcję z main.js, która zapisze to w bazie
  if (window.zapiszCelWTle) {
    window.zapiszCelWTle(targetValue);
    alert('Cel ustawiony!');
  }
};