let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioUrl = '';

export function initNagrywanie() {
  const btnNagraj = document.getElementById('btn-nagraj');
  const btnOdsluchaj = document.getElementById('btn-odsluchaj');
  
  if (!btnNagraj || !btnOdsluchaj) return;

  btnNagraj.onclick = async () => {
    if (isRecording) {
      // Zatrzymaj nagrywanie
      mediaRecorder.stop();
      btnNagraj.innerText = '🎙️ Nagraj';
      btnNagraj.style.background = '#8b5cf6'; // Powrót do fioletu
      isRecording = false;
    } else {
      // Rozpocznij nagrywanie
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          audioUrl = URL.createObjectURL(audioBlob);
          
          btnOdsluchaj.style.display = 'block';
          btnOdsluchaj.onclick = () => {
            const audio = new Audio(audioUrl);
            audio.play();
          };
        };

        mediaRecorder.start();
        btnNagraj.innerText = '⏹️ Zatrzymaj';
        btnNagraj.style.background = '#ef4444'; // Czerwony podczas nagrywania
        isRecording = true;
      } catch (err) {
        alert('Brak dostępu do mikrofonu. Upewnij się, że wyraziłeś zgodę.');
      }
    }
  };
}