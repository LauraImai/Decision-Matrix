function saveResults() {
    if (typeof lastResultsData === 'undefined') {
        alert('Nenhum resultado para salvar. Execute a análise antes.');
        return;
    }
    // Converte objeto para string JSON formatada
    const jsonString = JSON.stringify(lastResultsData, null, 2);
    // Cria um Blob contendo o JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    // Cria um link para download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Nome sugerido para o arquivo
    const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
    a.download = `resultados-matriz-decisao-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function saveResultsImage() {
    const container = document.getElementById('resultsInterface');
    if (!container || container.innerHTML.trim() === '') {
        alert('Execute a análise antes de salvar a imagem.');
        return;
    }
    // Chama html2canvas para capturar o elemento
    html2canvas(container, { backgroundColor: '#FFFFFF' })
        .then(canvas => {
            // Converte canvas em Blob e dispara download
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
                a.download = `resultados-matriz-decisao-${timestamp}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        })
        .catch(err => {
            console.error('Erro ao gerar imagem:', err);
            alert('Não foi possível gerar a imagem dos resultados.');
        });
}

