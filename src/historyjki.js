export function startHistoryjki(bazaSlow, callbackZapis) {
  const kontener = document.getElementById('historyjki-view');
  if (!kontener) return;

  // Losujemy 3 słowa z całej bazy
  const wszystkieSlowa = [];
  Object.values(bazaSlow).forEach(tablica => {
    tablica.forEach(slowo => wszystkieSlowa.push(slowo));
  });

  const losowe = wszystkieSlowa.sort(() => 0.5 - Math.random()).slice(0, 3);

  kontener.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
      <button class="nav-btn" style="background: #f3f4f6; color: #4b5563;" onclick="window.pokazGlowna()">← Wróć</button>
      <span style="font-weight:700; color:#db2777; font-size:18px;">Kreator Historyjek</span>
    </div>

    <div class="stats-card">
      <h2>Ułóż historyjkę z tych obrazków:</h2>
      
      <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0; font-size: 60px;">
        <div>${losowe[0].image}</div>
        <div>${losowe[1].image}</div>
        <div>${losowe[2].image}</div>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
        (${losowe[0].word}, ${losowe[1].word}, ${losowe[2].word})
      </p>

      <textarea id="historyjka-input" placeholder="Wpisz tutaj historyjkę ułożoną przez dziecko..." style="width: 100%; height: 100px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 10px; font-family: inherit; font-size: 16px; margin-bottom: 15px;"></textarea>
      
      <button class="cta-btn" style="background: #10b981; width: 100%;" onclick="window.zapiszHistoryjke('${losowe[0].word}', '${losowe[1].word}', '${losowe[2].word}')">Zapisz historyjkę</button>
    </div>
  `;

  window.zapiszHistoryjke = function(slowo1, slowo2, slowo3) {
    const tekst = document.getElementById('historyjka-input').value;
    if (!tekst) {
      alert('Wpisz historyjkę przed zapisaniem!');
      return;
    }
    callbackZapis(`Historyjka (${slowo1}, ${slowo2}, ${slowo3}): ${tekst}`);
    alert('Historyjka zapisana! Możesz ją zobaczyć w Panelu Rodzica.');
    window.pokazGlowna();
  };
}