export function renderujPanelRodzica(dane) {
  const kontener = document.getElementById('parent-panel-view');
  if (!kontener) return;

  const odznaki = dane.odznaki || {};
  const celTygodniowy = dane.celTygodniowy || 0;
  const statystykiGier = dane.statystykiGier || {}; // Odczyt nowych statystyk
  
  const postepProcent = celTygodniowy > 0 ? Math.min((dane.gwiazdkiWTygodniu / celTygodniowy) * 100, 100) : 0;

  kontener.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="color: #831843; margin: 0;">Panel Rodzica</h1>
      <button onclick="window.pokazMenu()" style="background: #f3f4f6; border: none; padding: 8px 12px; border-radius: 10px; color: #4b5563; font-weight: bold; cursor: pointer;">✕ Zamknij</button>
    </div>
    
    <!-- RAPORT TYGODNIOWY -->
    <div class="stats-card" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10b981;">
      <h2 style="color: #047857;">📈 Podsumowanie Postępów</h2>
      <p style="color: #065f46; font-weight: 600; font-size: 16px; margin-bottom: 15px;">${dane.raportTekst}</p>
      
      <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 15px;">
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #047857;">${dane.dniCwiczen}</div>
          <div style="font-size: 12px; color: #065f46;">Dni z rzędu</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #047857;">${dane.totalWords}</div>
          <div style="font-size: 12px; color: #065f46;">Zaliczone słowa</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #047857;">${dane.gwiazdki}</div>
          <div style="font-size: 12px; color: #065f46;">Wszystkie gwiazdki</div>
        </div>
      </div>
    </div>

    <!-- CEL TYGODNIOWY -->
    <div class="mission-box">
      <h2>🎯 Cel Tygodniowy</h2>
      <p>Ustaw cel na ten tydzień i motywuj dziecko do działania!</p>
      
      <div class="mission-input-group">
        <input type="number" id="mission-target" placeholder="np. 50" value="${celTygodniowy > 0 ? celTygodniowy : ''}" />
        <button onclick="window.zapiszCelWTle(parseInt(document.getElementById('mission-target').value))">Ustaw cel</button>
      </div>

      <div id="mission-progress" style="display: ${celTygodniowy > 0 ? 'block' : 'none'}; margin-top: 15px;">
        <div class="progress-bar-container" style="background: #e5e7eb; height: 24px; border-radius: 12px;">
          <div class="progress-bar-fill" style="width: ${postepProcent}%; background: #10b981; height: 100%; border-radius: 12px; transition: width 0.5s;"></div>
        </div>
        <div class="progress-text" style="margin-top: 5px; font-weight: bold; color: #047857;">${dane.gwiazdkiWTygodniu} / ${celTygodniowy} gwiazdek w tym tygodniu</div>
      </div>
    </div>

    <!-- SZCZEGÓŁOWE STATYSTYKI GIER -->
    <div class="stats-card">
      <h2>📊 Skąd mamy gwiazdki?</h2>
      <div class="history-list" style="margin-top: 10px;">
        <div class="history-item">
          <span>🎤 Ćwiczenia wymowy</span>
          <span style="font-weight: bold; color: #db2777;">${statystykiGier.mowa || 0} ⭐</span>
        </div>
        <div class="history-item">
          <span>➕ Dodawanie</span>
          <span style="font-weight: bold; color: #f59e0b;">${statystykiGier.dodawanie || 0} ⭐</span>
        </div>
        <div class="history-item">
          <span>➖ Odejmowanie</span>
          <span style="font-weight: bold; color: #8b5cf6;">${statystykiGier.odejmowanie || 0} ⭐</span>
        </div>
        <div class="history-item">
          <span>✖️ Mnożenie</span>
          <span style="font-weight: bold; color: #10b981;">${statystykiGier.mnozenie || 0} ⭐</span>
        </div>
        <div class="history-item">
          <span>➗ Dzielenie</span>
          <span style="font-weight: bold; color: #ef4444;">${statystykiGier.dzielenie || 0} ⭐</span>
        </div>
      </div>
    </div>

    <!-- ODZNAKI -->
    <div class="stats-card">
      <h2>Twoje Odznaki</h2>
      <div style="display: flex; justify-content: space-around; margin-top: 20px; font-size: 45px;">
        <div title="Pierwszy krok (1 gwiazdka)" style="opacity: ${odznaki['pierwszy_krok'] ? 1 : 0.2}; transform: ${odznaki['pierwszy_krok'] ? 'scale(1.1)' : 'scale(1)'}; transition: all 0.3s;">${odznaki['pierwszy_krok'] ? '🏅' : '🔒'}</div>
        <div title="Konsekwencja (3 dni z rzędu)" style="opacity: ${odznaki['konsekwencja'] ? 1 : 0.2}; transform: ${odznaki['konsekwencja'] ? 'scale(1.1)' : 'scale(1)'}; transition: all 0.3s;">${odznaki['konsekwencja'] ? '🔥' : '🔒'}</div>
        <div title="Kolekcjoner (50 gwiazdek)" style="opacity: ${odznaki['kolekcjoner'] ? 1 : 0.2}; transform: ${odznaki['kolekcjoner'] ? 'scale(1.1)' : 'scale(1)'}; transition: all 0.3s;">${odznaki['kolekcjoner'] ? '🏆' : '🔒'}</div>
      </div>
    </div>

    <!-- ALBUM NAKLEJEK -->
    <div class="stats-card">
      <h2>Album Naklejek</h2>
      <div class="album-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 15px;">
        <div class="sticker ${dane.gwiazdki >= 10 ? 'unlocked' : ''}" title="10 gwiazdek">🦁</div>
        <div class="sticker ${dane.gwiazdki >= 25 ? 'unlocked' : ''}" title="25 gwiazdek">🚀</div>
        <div class="sticker ${dane.gwiazdki >= 50 ? 'unlocked' : ''}" title="50 gwiazdek">🦄</div>
        <div class="sticker ${dane.gwiazdki >= 100 ? 'unlocked' : ''}" title="100 gwiazdek">🐉</div>
        <div class="sticker ${dane.gwiazdki >= 200 ? 'unlocked' : ''}" title="200 gwiazdek">🍦</div>
        <div class="sticker ${dane.gwiazdki >= 500 ? 'unlocked' : ''}" title="500 gwiazdek">🏆</div>
      </div>
    </div>

    <!-- HISTORIA GŁOSEK -->
    <div class="stats-card">
      <h2>Szczegóły ćwiczeń wymowy</h2>
      <div class="history-list" id="parent-history-list" style="margin-top: 10px;">
        ${dane.historiaHTML}
      </div>
    </div>
  `;
}