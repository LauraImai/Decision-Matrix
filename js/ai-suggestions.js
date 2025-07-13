// ai-suggestions.js - Versão Corrigida
const API_KEY = "AIzaSyCzPH1pBOXVUMCEVLWcvk7hpd3y9aNUgGs"; // Substitua pela sua chave real da API do Gemini

async function sugerirCritériosGemini(titulo, descricao) {
    console.log('Iniciando sugestão de critérios...');
    console.log('Título:', titulo);
    console.log('Descrição:', descricao);
    
    const prompt = `Dado o seguinte problema de decisão:
Título: "${titulo}"
Descrição: "${descricao}"

Sugira de 3 a 5 critérios relevantes para avaliar as alternativas deste problema de decisão. 
Responda APENAS com uma lista separada por vírgulas, sem explicações ou formatação adicional.

Exemplo de resposta: Custo, Qualidade, Prazo, Localização, Facilidade de implementação`;

    try {
        console.log('Enviando requisição para a API...');
        
        // Usando a API do Gemini via fetch
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                    topP: 0.8,
                    topK: 10
                }
            })
        });

        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Resposta completa da API:', data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('Estrutura de resposta inválida:', data);
            throw new Error('Resposta da API em formato inválido');
        }
        
        const text = data.candidates[0].content.parts[0].text;
        console.log('Texto recebido:', text);
        
        // Processar o texto para extrair os critérios
        const criterios = text
            .split(/[,\n]/) // Dividir por vírgula ou quebra de linha
            .map(s => s.trim()) // Remover espaços
            .filter(s => s.length > 0) // Remover strings vazias
            .map(s => s.replace(/^[\d\.\-\*\+]\s*/, '')) // Remover numeração/bullet points
            .filter(s => s.length > 0); // Filtrar novamente após limpeza
        
        console.log('Critérios processados:', criterios);
        
        return criterios;
        
    } catch (error) {
        console.error("Erro detalhado ao buscar critérios com Gemini:", error);
        
        // Mostrar erro mais específico para o usuário
        if (error.message.includes('404')) {
            alert("Erro 404: Verifique se a URL da API está correta e se a chave da API é válida.");
        } else if (error.message.includes('403')) {
            alert("Erro 403: Chave da API inválida ou sem permissão. Verifique sua chave do Gemini.");
        } else if (error.message.includes('400')) {
            alert("Erro 400: Requisição inválida. Verifique os parâmetros enviados.");
        } else if (error.message.includes('429')) {
            alert("Erro 429: Muitas requisições. Tente novamente em alguns minutos.");
        } else if (error.message.includes('Failed to fetch')) {
            alert("Erro de conexão: Verifique sua conexão com a internet.");
        } else {
            alert("Erro ao buscar sugestões de critérios com IA: " + error.message);
        }
        
        return [];
    }
}

// Função para testar a configuração da API
window.testarAPI = async function() {
    console.log('Testando configuração da API...');
    
    if (API_KEY === "AIzaSyCzPH1pBOXVUMCEVLWcvk7hpd3y9aNUgGs" || API_KEY === "") {
        alert("Configure sua chave da API do Gemini no arquivo ai-suggestions.js");
        return;
    }
    
    try {
        const resultado = await sugerirCritériosGemini("Teste", "Problema de teste");
        console.log('Teste concluído com sucesso:', resultado);
        alert("API configurada corretamente! Critérios de teste: " + resultado.join(", "));
    } catch (error) {
        console.error('Erro no teste:', error);
        alert("Erro na configuração da API: " + error.message);
    }
};