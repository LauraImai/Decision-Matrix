// Navegação entre passos
function nextStep() {
    if (validateCurrentStep()) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        if (currentStep === 4) {
            setupWeightingInterface();
        } else if (currentStep === 5) {
            setupComparisonInterface();
        } else if (currentStep === 6) {
            calculateResults();
        }
        
        updateProgressBar();
    }
}

function prevStep() {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgressBar();
}

function updateProgressBar() {
    const progress = (currentStep - 1) / 5 * 100;
    // Implementar barra de progresso se necessário
}

// Validação de passos
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            const title = document.getElementById('problemTitle').value.trim();
            if (!title) {
                showError('Por favor, insira um título para o problema.');
                return false;
            }
            return true;
            
        case 2:
            if (criteria.length < 2) {
                showError('Adicione pelo menos 2 critérios.');
                return false;
            }
            return true;
            
        case 3:
            if (alternatives.length < 2) {
                showError('Adicione pelo menos 2 alternativas.');
                return false;
            }
            return true;
            
        case 4:
            const method = document.getElementById('weightingMethod').value;
            if (!method) {
                showError('Selecione um método de pesagem.');
                return false;
            }
            if (!validateWeights()) {
                return false;
            }
            return true;
            
        case 5:
            return validateAllComparisons();
            
        default:
            return true;
    }
}

// Variável para controlar se deve normalizar automaticamente
let autoNormalize = true;

// Cálculo de resultados
function calculateResults() {
    const results = {};

    // Inicializar scores finais
    alternatives.forEach((alt) => {
        results[alt] = 0;
    });

    // Calcular score ponderado para cada alternativa
    criteria.forEach((criterion) => {
        const weight = weights[criterion];
        alternatives.forEach((alt) => {
            const score = getScoreForAlternative(criterion, alt);
            results[alt] += score * weight;
        });
    });

    // Ordenar alternativas por score (descendente)
    const sortedAlternatives = [...alternatives].sort(
        (a, b) => results[b] - results[a]
    );

    // Guardar todos os dados em lastResultsData para exportação
    lastResultsData = {
        problema: document.getElementById('problemTitle').value.trim(),
        descricao: document.getElementById('problemDescription').value.trim(),
        criterios: [...criteria],
        alternativas: [...alternatives],
        pesos: { ...weights },
        resultadosBrutos: { ...comparisonData },
        scoresFinais: { ...results },
        ordenacao: [...sortedAlternatives],
    };

    displayResults(results, sortedAlternatives);
}

function displayResults(results, sortedAlternatives) {
    const interface_ = document.getElementById('resultsInterface');

    let html = `
        <div class="results">
            <h3>🏆 Ranking Final das Alternativas</h3>
            <ul class="ranking" id="dynamicRanking">
    `;

    sortedAlternatives.forEach((alt, index) => {
        html += `
        <li>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="ranking-position">${index + 1}</div>
                <div style="flex-grow: 1;">
                    <strong>${alt}</strong>
                </div>
                <div class="score" id="score-${alt.replace(/\s+/g, '-')}">${results[alt].toFixed(2)}</div>
            </div>
        </li>
        `;
    });

    html += `
            </ul>
        </div>
        
        <!-- Painel de Ajuste Dinâmico de Pesos -->
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
            <h3>⚖️ Ajuste Dinâmico dos Pesos</h3>
            <p style="margin-bottom: 15px; color: #666;">Ajuste os pesos abaixo e veja os resultados atualizarem em tempo real:</p>
            
            <!-- Controles de Normalização -->
            <div style="margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 6px; border: 1px solid #ddd;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input 
                            type="checkbox" 
                            id="autoNormalizeCheckbox" 
                            ${autoNormalize ? 'checked' : ''} 
                            onchange="toggleAutoNormalize()"
                            style="transform: scale(1.2);"
                        />
                        <span style="font-weight: 500;">Normalização Automática</span>
                    </label>
                </div>
                <div style="font-size: 0.9em; color: #666;">
                    <strong>Ativado:</strong> Os pesos são automaticamente ajustados para somar 100%<br/>
                    <strong>Desativado:</strong> Você controla os pesos manualmente (recomendado que somem 100%)
                </div>
                
                <!-- Indicador de Status dos Pesos -->
                <div id="weightStatus" style="margin-top: 10px; padding: 8px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
                    <!-- Status será atualizado dinamicamente -->
                </div>
            </div>
            
            <div class="weight-controls" style="display: grid; gap: 15px;">
    `;

    criteria.forEach((criterion) => {
        const currentWeight = weights[criterion];
        const percentage = (currentWeight * 100).toFixed(1);
        
        html += `
                <div class="weight-control-item" style="display: flex; align-items: center; gap: 15px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #ddd;">
                    <div style="min-width: 150px; font-weight: 500;">${criterion}</div>
                    <div style="flex-grow: 1; display: flex; align-items: center; gap: 10px;">
                        <input 
                            type="range" 
                            id="weight-${criterion.replace(/\s+/g, '-')}" 
                            min="0" 
                            max="100" 
                            value="${percentage}" 
                            step="0.1"
                            style="flex-grow: 1;"
                            oninput="updateWeightDynamic('${criterion}', this.value)"
                        />
                        <div style="min-width: 80px; display: flex; align-items: center; gap: 5px;">
                            <input 
                                type="number" 
                                id="weight-input-${criterion.replace(/\s+/g, '-')}" 
                                min="0" 
                                max="100" 
                                step="0.1"
                                value="${percentage}" 
                                style="width: 60px; padding: 2px 4px; border: 1px solid #ccc; border-radius: 3px; text-align: center;"
                                onchange="updateWeightFromInput('${criterion}', this.value)"
                            />
                            <span style="font-size: 0.9em; color: #666;">%</span>
                        </div>
                    </div>
                </div>
        `;
    });

    html += `
            </div>
            
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-outline-primary" onclick="resetWeights()">
                    🔄 Restaurar Pesos Originais
                </button>
                <button class="btn btn-outline-success" onclick="equalizeWeights()">
                    ⚖️ Equalizar Pesos
                </button>
                <button class="btn btn-outline-warning" onclick="normalizeWeightsManually()">
                    📐 Normalizar Agora
                </button>
            </div>
        </div>
        
        <div style="margin-top: 30px;">
            <h3>📊 Matriz de Decisão Completa</h3>
            <div style="overflow-x: auto;">
                <table class="matrix-table" id="dynamicMatrix">
                    <thead>
                        <tr>
                            <th>Alternativas</th>
        `;

    criteria.forEach((criterion) => {
        html += `<th>${criterion}<br /><small id="weight-header-${criterion.replace(/\s+/g, '-')}">Peso: ${(weights[criterion] * 100).toFixed(1)}%</small></th>`;
    });

    html += `
                            <th>Score Final</th>
                        </tr>
                    </thead>
                    <tbody id="matrixBody">
        `;

    sortedAlternatives.forEach((alt) => {
        html += `<tr id="row-${alt.replace(/\s+/g, '-')}"><td><strong>${alt}</strong></td>`;

        criteria.forEach((criterion) => {
            const score = getScoreForAlternative(criterion, alt);
            const weightedScore = score * weights[criterion];
            html += `<td id="cell-${alt.replace(/\s+/g, '-')}-${criterion.replace(/\s+/g, '-')}">${score}<br /><small>(${weightedScore.toFixed(2)})</small></td>`;
        });

        html += `<td id="final-score-${alt.replace(/\s+/g, '-')}"><strong>${results[alt].toFixed(2)}</strong></td></tr>`;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="margin-top: 30px;">
            <h3>📈 Resumo da Análise</h3>
            <div class="items-list">
                <div class="item">
                    <span><strong>Problema:</strong> ${document.getElementById('problemTitle').value}</span>
                </div>
                <div class="item">
                    <span><strong>Critérios:</strong> ${criteria.length}</span>
                </div>
                <div class="item">
                    <span><strong>Alternativas:</strong> ${alternatives.length}</span>
                </div>
                <div class="item">
                    <span><strong>Método de Pesagem:</strong> ${getWeightingMethodName()}</span>
                </div>
                <div class="item">
                    <span><strong>Alternativa Recomendada:</strong> <span id="topAlternative">${sortedAlternatives[0]}</span></span>
                </div>
            </div>
        </div>
        
        <!-- Botão para salvar resultados em JSON -->
        <div style="margin-top: 20px; text-align: center; display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-secondary" onclick="saveResults()">
                💾 Salvar JSON
            </button>
            <button class="btn btn-secondary" onclick="saveResultsImage()">
                🖼️ Salvar Imagem
            </button>
        </div>
    `;

    interface_.innerHTML = html;
    
    // Atualizar status dos pesos após renderizar
    updateWeightStatus();
}

// Armazenar pesos originais para restauração
let originalWeights = {};

// Função para alternar normalização automática
function toggleAutoNormalize() {
    const checkbox = document.getElementById('autoNormalizeCheckbox');
    autoNormalize = checkbox.checked;
    
    if (autoNormalize) {
        normalizeWeights();
        updateWeightDisplays();
        updateResultsDisplay();
    }
    
    updateWeightStatus();
}

// Função para atualizar pesos dinamicamente
function updateWeightDynamic(criterion, value) {
    // Converter valor do slider (0-100) para peso (0-1.0)
    const newWeight = parseFloat(value) / 100;
    
    // Atualizar o peso do critério
    weights[criterion] = newWeight;
    
    // Se normalização automática estiver ativa, normalizar
    if (autoNormalize) {
        normalizeWeights();
    }
    
    // Atualizar display dos pesos
    updateWeightDisplays();
    
    // Atualizar status dos pesos
    updateWeightStatus();
    
    // Recalcular e atualizar resultados
    updateResultsDisplay();
}

// Função para atualizar peso via input numérico
function updateWeightFromInput(criterion, value) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
        // Se valor inválido, restaurar valor atual
        updateWeightDisplays();
        return;
    }
    
    // Limitar a 100% se não estiver normalizando
    const finalValue = autoNormalize ? numValue : Math.min(numValue, 100);
    
    // Atualizar peso
    weights[criterion] = finalValue / 100;
    
    // Se normalização automática estiver ativa, normalizar
    if (autoNormalize) {
        normalizeWeights();
    }
    
    // Atualizar display dos pesos
    updateWeightDisplays();
    
    // Atualizar status dos pesos
    updateWeightStatus();
    
    // Recalcular e atualizar resultados
    updateResultsDisplay();
}

// Normalizar pesos para somarem 1
function normalizeWeights() {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight > 0) {
        Object.keys(weights).forEach(criterion => {
            weights[criterion] = weights[criterion] / totalWeight;
        });
    }
}

// Normalizar pesos manualmente (botão)
function normalizeWeightsManually() {
    normalizeWeights();
    updateWeightDisplays();
    updateWeightStatus();
    updateResultsDisplay();
}

// Atualizar displays dos pesos
function updateWeightDisplays() {
    criteria.forEach(criterion => {
        const cleanCriterion = criterion.replace(/\s+/g, '-');
        const percentage = (weights[criterion] * 100).toFixed(1);
        
        // Atualizar slider
        const slider = document.getElementById(`weight-${cleanCriterion}`);
        if (slider) slider.value = percentage;
        
        // Atualizar input numérico
        const input = document.getElementById(`weight-input-${cleanCriterion}`);
        if (input) input.value = percentage;
        
        // Atualizar cabeçalho da tabela
        const header = document.getElementById(`weight-header-${cleanCriterion}`);
        if (header) header.textContent = `Peso: ${percentage}%`;
    });
}

// Atualizar status dos pesos
function updateWeightStatus() {
    const statusElement = document.getElementById('weightStatus');
    if (!statusElement) return;
    
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const totalPercentage = (totalWeight * 100).toFixed(1);
    
    let statusHtml = '';
    let statusClass = '';
    
    if (Math.abs(totalWeight - 1.0) < 0.001) {
        // Pesos somam aproximadamente 100%
        statusHtml = `✅ Total dos pesos: ${totalPercentage}% - Perfeito!`;
        statusClass = 'background: #d4edda; color: #155724; border: 1px solid #c7ddc7;';
    } else if (totalWeight > 1.0) {
        // Pesos somam mais que 100%
        statusHtml = `⚠️ Total dos pesos: ${totalPercentage}% - Acima de 100%`;
        statusClass = 'background: #fff3cd; color: #856404; border: 1px solid #fce4a6;';
        
        if (!autoNormalize) {
            statusHtml += `<br/>💡 Sugestão: Reduza alguns pesos ou ative a normalização automática`;
        }
    } else {
        // Pesos somam menos que 100%
        statusHtml = `⚠️ Total dos pesos: ${totalPercentage}% - Abaixo de 100%`;
        statusClass = 'background: #f8d7da; color: #721c24; border: 1px solid #f3c6cb;';
        
        if (!autoNormalize) {
            statusHtml += `<br/>💡 Sugestão: Aumente alguns pesos ou ative a normalização automática`;
        }
    }
    
    statusElement.innerHTML = statusHtml;
    statusElement.style.cssText = statusClass;
}

// Atualizar resultados sem recalcular toda a interface
function updateResultsDisplay() {
    const results = {};
    
    // Inicializar scores finais
    alternatives.forEach((alt) => {
        results[alt] = 0;
    });

    // Calcular score ponderado para cada alternativa
    criteria.forEach((criterion) => {
        const weight = weights[criterion];
        alternatives.forEach((alt) => {
            const score = getScoreForAlternative(criterion, alt);
            results[alt] += score * weight;
        });
    });

    // Ordenar alternativas por score (descendente)
    const sortedAlternatives = [...alternatives].sort(
        (a, b) => results[b] - results[a]
    );

    // Atualizar ranking
    updateRankingDisplay(results, sortedAlternatives);
    
    // Atualizar matriz
    updateMatrixDisplay(results, sortedAlternatives);
    
    // Atualizar alternativa recomendada
    const topAltElement = document.getElementById('topAlternative');
    if (topAltElement) topAltElement.textContent = sortedAlternatives[0];
    
    // Atualizar dados para exportação
    lastResultsData.pesos = { ...weights };
    lastResultsData.scoresFinais = { ...results };
    lastResultsData.ordenacao = [...sortedAlternatives];
}

// Atualizar display do ranking
function updateRankingDisplay(results, sortedAlternatives) {
    const rankingElement = document.getElementById('dynamicRanking');
    if (!rankingElement) return;

    let html = '';
    sortedAlternatives.forEach((alt, index) => {
        html += `
        <li>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="ranking-position">${index + 1}</div>
                <div style="flex-grow: 1;">
                    <strong>${alt}</strong>
                </div>
                <div class="score">${results[alt].toFixed(2)}</div>
            </div>
        </li>
        `;
    });
    
    rankingElement.innerHTML = html;
}

// Atualizar display da matriz
function updateMatrixDisplay(results, sortedAlternatives) {
    const matrixBody = document.getElementById('matrixBody');
    if (!matrixBody) return;

    let html = '';
    sortedAlternatives.forEach((alt) => {
        html += `<tr><td><strong>${alt}</strong></td>`;

        criteria.forEach((criterion) => {
            const score = getScoreForAlternative(criterion, alt);
            const weightedScore = score * weights[criterion];
            html += `<td>${score}<br /><small>(${weightedScore.toFixed(2)})</small></td>`;
        });

        html += `<td><strong>${results[alt].toFixed(2)}</strong></td></tr>`;
    });
    
    matrixBody.innerHTML = html;
}

// Restaurar pesos originais
function resetWeights() {
    if (Object.keys(originalWeights).length === 0) {
        // Se não temos pesos originais salvos, usar pesos iguais
        equalizeWeights();
        return;
    }
    
    weights = { ...originalWeights };
    updateWeightDisplays();
    updateWeightStatus();
    updateResultsDisplay();
}

// Equalizar todos os pesos
function equalizeWeights() {
    const equalWeight = 1 / criteria.length;
    criteria.forEach(criterion => {
        weights[criterion] = equalWeight;
    });
    
    updateWeightDisplays();
    updateWeightStatus();
    updateResultsDisplay();
}

// Salvar pesos originais quando a análise for iniciada
function saveOriginalWeights() {
    originalWeights = { ...weights };
}

// Modificar a função calculateResults original para salvar pesos originais
const originalCalculateResults = calculateResults;
calculateResults = function() {
    saveOriginalWeights();
    return originalCalculateResults.call(this);
};

function getWeightingMethodName() {
    const select = document.getElementById('weightingMethod');
    if (!select) return 'Elemento não encontrado';

    const method = select.value;
    const names = {
        adhoc: 'Ad-hoc',
        ranksum: 'Rank-Sum',
        roc: 'Rank Order Centroid (ROC)',
        swing: 'Swing',
        swingweighting: 'Swing Weighting',
    };

    return names[method] || 'Não selecionado';
}