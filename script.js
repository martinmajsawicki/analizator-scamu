document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyzeButton');
    const chatInput = document.getElementById('chatInput');
    const resultDiv = document.getElementById('result');
    const loader = document.getElementById('loader');
    const body = document.body;

    analyzeButton.addEventListener('click', async () => {
        const chatText = chatInput.value;
        if (!chatText.trim()) {
            resultDiv.innerHTML = '<p>Proszę wkleić treść rozmowy.</p>';
            return;
        }

        // Reset UI
        analyzeButton.disabled = true;
        analyzeButton.innerText = 'Analizuję...';
        loader.style.display = 'block';
        resultDiv.innerHTML = '';
        body.className = ''; // Reset body class/color

        try {
            const response = await fetch('/.netlify/functions/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat: chatText }),
            });

            if (!response.ok) {
                throw new Error(`Błąd serwera: ${response.statusText}`);
            }

            const data = await response.json();
            const analysis = data.analysis;
            resultDiv.innerText = analysis;

            // --- ZAKTUALIZOWANA LOGIKA ---
            // Zmień kolor tła i odtwórz dźwięk na podstawie odpowiedzi
            const riskLevelLine = analysis.split('\n')[0].toLowerCase();
            const alarmSound = document.getElementById('alarmSound'); // Pobieramy nasz odtwarzacz

            if (riskLevelLine.includes('średni')) {
                body.className = 'risk-medium';
            } else if (riskLevelLine.includes('wysoki') || riskLevelLine.includes('krytyczny')) {
                // Ustawiamy odpowiednią klasę dla tła (czarnego)
                body.className = riskLevelLine.includes('wysoki') ? 'risk-high' : 'risk-critical';
                
                // Uruchamiamy dźwięk alarmu!
                alarmSound.play();
            }
            // --- KONIEC ZAKTUALIZOWANEJ LOGIKI ---

        } catch (error) {
            resultDiv.innerText = `Wystąpił błąd: ${error.message}. Spróbuj ponownie później.`;
        } finally {
            analyzeButton.disabled = false;
            analyzeButton.innerText = 'Analizuj';
            loader.style.display = 'none';
        }
    });
});
