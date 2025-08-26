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

            // Zmień kolor tła na podstawie odpowiedzi
            const riskLevelLine = analysis.split('\n')[0].toLowerCase();
            if (riskLevelLine.includes('średni')) {
                body.className = 'risk-medium';
            } else if (riskLevelLine.includes('wysoki')) {
                body.className = 'risk-high';
            } else if (riskLevelLine.includes('krytyczny')) {
                body.className = 'risk-critical';
            }

        } catch (error) {
            resultDiv.innerText = `Wystąpił błąd: ${error.message}. Spróbuj ponownie później.`;
        } finally {
            analyzeButton.disabled = false;
            analyzeButton.innerText = 'Analizuj';
            loader.style.display = 'none';
        }
    });
});