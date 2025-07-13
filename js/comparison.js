// Configuração da interface de comparação
function setupComparisonInterface() {
    currentCriterionIndex = 0;
    comparisonData = {};
    
    criteria.forEach(criterion => {
        comparisonData[criterion] = {};
    });
    
    showComparisonForCriterion();
}

function showComparisonForCriterion() {
    const interface_ = document.getElementById('comparisonInterface');
    const criterion = criteria[currentCriterionIndex];
    
    let html = `
        <div class="comparison-question">
            <div class="question-text">
                Critério: ${criterion} (${currentCriterionIndex + 1} de ${criteria.length})
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(currentCriterionIndex / criteria.length) * 100}%"></div>
            </div>
        </div>
    `;
    
    // Passo 1: Escolher melhor alternativa
    if (!comparisonData[criterion].best) {
        html += `
            <div style="margin: 20px 0;">
                <h4>1. Qual alternativa é a MELHOR para o critério "${criterion}"?</h4>
                <div class="alternatives-grid">
        `;
        
        alternatives.forEach((alt, index) => {
            html += `
                <div class="alternative-card" onclick="selectBest('${criterion}', '${alt}', ${index})">
                    ${alt}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    // Passo 2: Escolher pior alternativa
    else if (!comparisonData[criterion].worst) {
        html += `
            <div style="margin: 20px 0;">
                <div class="success-message">✅ Melhor alternativa: ${comparisonData[criterion].best}</div>
                <h4>2. Qual alternativa é a PIOR para o critério "${criterion}"?</h4>
                <div class="alternatives-grid">
        `;
        
        alternatives.forEach((alt, index) => {
            if (alt !== comparisonData[criterion].best) {
                html += `
                    <div class="alternative-card" onclick="selectWorst('${criterion}', '${alt}', ${index})">
                        ${alt}
                    </div>
                `;
            }
        });
        
        html += `
                </div>
            </div>
        `;
    }
    // Passo 3: Definir scores das âncoras
    else if (comparisonData[criterion].bestScore === null || comparisonData[criterion].bestScore === undefined) {
        html += `
            <div style="margin: 20px 0;">
                <div class="success-message">✅ Melhor: ${comparisonData[criterion].best}</div>
                <div class="success-message">✅ Pior: ${comparisonData[criterion].worst}</div>
                <h4>3. Defina o score da melhor alternativa (Âncora Superior):</h4>
                <div class="form-group">
                    <label>Score para "${comparisonData[criterion].best}" (0-10):</label>
                    <input type="number" id="bestScore" min="0" max="10" placeholder="Ex: 10" step="0.1">
                    <button class="btn btn-primary" onclick="setBestScore('${criterion}')">Definir</button>
                </div>
            </div>
        `;
    }
    // Passo 4: Definir score da pior
    else if (comparisonData[criterion].worstScore === null || comparisonData[criterion].worstScore === undefined) {
        html += `
            <div style="margin: 20px 0;">
                <div class="success-message">✅ Melhor: ${comparisonData[criterion].best} (Score: ${comparisonData[criterion].bestScore})</div>
                <div class="success-message">✅ Pior: ${comparisonData[criterion].worst}</div>
                <h4>4. Defina o score da pior alternativa (Âncora Inferior):</h4>
                <div class="form-group">
                    <label>Score para "${comparisonData[criterion].worst}" (0-${comparisonData[criterion].bestScore}):</label>
                    <input type="number" id="worstScore" min="0" max="${comparisonData[criterion].bestScore}" placeholder="Ex: 0" step="0.1">
                    <button class="btn btn-primary" onclick="setWorstScore('${criterion}')">Definir</button>
                </div>
            </div>
        `;
    }
    // Passo 5: Avaliar alternativas restantes com comparação sequencial visual
    else {
        // Verificar se há uma posição selecionada esperando input de score
        if (comparisonData[criterion].selectedPosition) {
            const position = comparisonData[criterion].selectedPosition;
            const avgScore = Math.round((position.minScore + position.maxScore) / 2 * 10) / 10;
            
            html += `
                <div style="margin: 20px 0;">
                    <div class="success-message">✅ Posição selecionada: Entre "${position.higherAlt}" e "${position.lowerAlt}"</div>
                    <h4>Defina o score para "${position.alternative}":</h4>
                    <div class="form-group">
                        <label>Score para "${position.alternative}" (${position.minScore} - ${position.maxScore}):</label>
                        <input type="number" 
                               id="positionScore" 
                               min="${position.minScore}" 
                               max="${position.maxScore}" 
                               placeholder="Ex: ${avgScore}" 
                               step="0.1"
                               value="${avgScore}">
                        <button class="btn btn-primary" onclick="setPositionBetweenScore('${criterion}')">Definir Score</button>
                    </div>
                </div>
            `;
        } else {
            const remaining = alternatives.filter(alt => {
                const score = getScoreForAlternative(criterion, alt);
                return score === null || score === undefined;
            });
            
            if (remaining.length > 0) {
                const currentAlt = remaining[0];
                
                // Obter alternativas já avaliadas e ordenar por score
                const evaluated = getEvaluatedAlternatives(criterion);
                
                html += `
                    <div style="margin: 20px 0;">
                        <div class="ranking-display">
                            <h4>🏆 Ranking atual para "${criterion}"</h4>
                            ${evaluated.map((item, index) => `
                                <div class="ranking-item">
                                    <span class="rank">${index + 1}º</span>
                                    <span class="alt-name">${item.name}</span>
                                    <span class="alt-score">${item.score}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <h4>📍 Onde posicionar "${currentAlt}"?</h4>
                        <p>Escolha a posição mais adequada comparando com as alternativas já avaliadas:</p>
                        
                        <div class="position-options">
                            ${generatePositionOptions(criterion, currentAlt, evaluated)}
                        </div>
                    </div>
                `;
            } else {
                // Todos os scores foram definidos para este critério
                html += `
                    <div style="margin: 20px 0;">
                        <div class="success-message">✅ Avaliação completa para "${criterion}"!</div>
                        <div class="final-ranking">
                            <h4>🏆 Ranking final para "${criterion}"</h4>
                `;
                
                // Mostrar ranking final ordenado
                const finalRanking = getFinalRanking(criterion);
                finalRanking.forEach((item, index) => {
                    html += `
                        <div class="ranking-item final">
                            <span class="rank">${index + 1}º</span>
                            <span class="alt-name">${item.name}</span>
                            <span class="alt-score">${item.score}</span>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                        <button class="btn btn-primary" onclick="nextCriterion()">
                            ${currentCriterionIndex < criteria.length - 1 ? 'Próximo Critério →' : 'Ver Resultados Finais 🏁'}
                        </button>
                    </div>
                `;
            }
        }
    }
    
    interface_.innerHTML = html;
}

// Funções de seleção e comparação sequencial
function selectBest(criterion, alternative, index) {
    comparisonData[criterion].best = alternative;
    showComparisonForCriterion();
}

function selectWorst(criterion, alternative, index) {
    comparisonData[criterion].worst = alternative;
    showComparisonForCriterion();
}

function setBestScore(criterion) {
    const score = parseFloat(document.getElementById('bestScore').value);
    if (score >= 0 && score <= 10) {
        comparisonData[criterion].bestScore = score;
        showComparisonForCriterion();
    } else {
        showError('Score deve estar entre 0 e 10.');
    }
}

function setWorstScore(criterion) {
    const score = parseFloat(document.getElementById('worstScore').value);
    const maxScore = comparisonData[criterion].bestScore;
    if (score >= 0 && score <= maxScore) {
        comparisonData[criterion].worstScore = score;
        if (!comparisonData[criterion].scores) {
            comparisonData[criterion].scores = {};
        }
        showComparisonForCriterion();
    } else {
        showError(`Score deve estar entre 0 e ${maxScore}.`);
    }
}

// Função principal para obter alternativas já avaliadas ordenadas por score
function getEvaluatedAlternatives(criterion) {
    const evaluated = [];
    const addedAlternatives = new Set(); // Para evitar duplicatas
    
    // Inicializar scores se não existir
    if (!comparisonData[criterion].scores) {
        comparisonData[criterion].scores = {};
    }
    
    // Adicionar melhor alternativa
    if (comparisonData[criterion].best && comparisonData[criterion].bestScore !== null) {
        evaluated.push({
            name: comparisonData[criterion].best,
            score: comparisonData[criterion].bestScore
        });
        addedAlternatives.add(comparisonData[criterion].best);
    }
    
    // Adicionar pior alternativa
    if (comparisonData[criterion].worst && comparisonData[criterion].worstScore !== null) {
        evaluated.push({
            name: comparisonData[criterion].worst,
            score: comparisonData[criterion].worstScore
        });
        addedAlternatives.add(comparisonData[criterion].worst);
    }
    
    // Adicionar alternativas já avaliadas (que não sejam best/worst)
    Object.entries(comparisonData[criterion].scores).forEach(([alt, score]) => {
        if (!addedAlternatives.has(alt) && score !== null && score !== undefined) {
            evaluated.push({
                name: alt,
                score: score
            });
            addedAlternatives.add(alt);
        }
    });
    
    // Ordenar por score (decrescente)
    return evaluated.sort((a, b) => b.score - a.score);
}

// Função para gerar opções de posicionamento visual (MODIFICADA)
function generatePositionOptions(criterion, currentAlt, evaluated) {
    let options = '';
    
    // Opções: Entre duas alternativas consecutivas
    for (let i = 0; i < evaluated.length - 1; i++) {
        const higher = evaluated[i];
        const lower = evaluated[i + 1];
        
        // Só adicionar se houver diferença entre os scores
        if (higher.score !== lower.score) {
            const avgScore = Math.round((higher.score + lower.score) / 2 * 10) / 10;
            const minScore = lower.score;
            const maxScore = higher.score;
            const positionId = `between_${i}`;
            
            options += `
                <div class="alternative-card" onclick="selectPositionBetween('${criterion}', '${currentAlt}', '${positionId}', ${minScore}, ${maxScore}, '${higher.name}', '${lower.name}')">
                    <div class="position-label">📊 Entre "${higher.name}" e "${lower.name}" </div>
                    <div class="position-description">Range: ${minScore} - ${maxScore}</div>
                </div>
            `;
        }
    }
    
    // Opções: Mesmo nível de cada alternativa já avaliada
    evaluated.forEach(item => {
        options += `
            <div class="alternative-card" onclick="setPositionScore('${criterion}', '${currentAlt}', ${item.score})">
                <div class="position-label">⚖️ Mesmo nível de "${item.name}"</div>
                <div class="position-description">Score igual: ${item.score}</div>
            </div>
        `;
    });
    
    return options;
}

// Nova função para selecionar posição entre duas alternativas
function selectPositionBetween(criterion, alternative, positionId, minScore, maxScore, higherAlt, lowerAlt) {
    // Salvar informações da posição selecionada
    if (!comparisonData[criterion].selectedPosition) {
        comparisonData[criterion].selectedPosition = {};
    }
    
    comparisonData[criterion].selectedPosition = {
        alternative: alternative,
        positionId: positionId,
        minScore: minScore,
        maxScore: maxScore,
        higherAlt: higherAlt,
        lowerAlt: lowerAlt
    };
    
    // Atualizar interface para mostrar o input de score
    showComparisonForCriterion();
}

// Nova função para definir score da posição entre alternativas
function setPositionBetweenScore(criterion) {
    const score = parseFloat(document.getElementById('positionScore').value);
    const position = comparisonData[criterion].selectedPosition;
    
    if (score >= position.minScore && score <= position.maxScore) {
        if (!comparisonData[criterion].scores) {
            comparisonData[criterion].scores = {};
        }
        
        comparisonData[criterion].scores[position.alternative] = score;
        
        // Limpar posição selecionada
        delete comparisonData[criterion].selectedPosition;
        
        console.log(`Score definido para ${position.alternative}: ${score}`);
        console.log('Estado atual dos scores:', comparisonData[criterion].scores);
        
        showComparisonForCriterion();
    } else {
        showError(`Score deve estar entre ${position.minScore} e ${position.maxScore}.`);
    }
}

// Função para definir score baseado na posição escolhida
function setPositionScore(criterion, alternative, score) {
    if (!comparisonData[criterion].scores) {
        comparisonData[criterion].scores = {};
    }
    
    // Salvar o score da alternativa
    comparisonData[criterion].scores[alternative] = score;
    
    console.log(`Score definido para ${alternative}: ${score}`);
    console.log('Estado atual dos scores:', comparisonData[criterion].scores);
    
    // Atualizar interface para próxima alternativa
    showComparisonForCriterion();
}

// Função para obter ranking final de um critério
function getFinalRanking(criterion) {
    const ranking = [];
    
    // Adicionar apenas alternativas que foram avaliadas
    alternatives.forEach(alt => {
        const score = getScoreForAlternative(criterion, alt);
        if (score !== null && score !== undefined) {
            ranking.push({
                name: alt,
                score: score
            });
        }
    });
    
    // Ordenar por score (decrescente)
    return ranking.sort((a, b) => b.score - a.score);
}

// Função auxiliar para obter score de uma alternativa
function getScoreForAlternative(criterion, alternative) {
    if (alternative === comparisonData[criterion].best) {
        return comparisonData[criterion].bestScore;
    }
    if (alternative === comparisonData[criterion].worst) {
        return comparisonData[criterion].worstScore;
    }
    return comparisonData[criterion].scores?.[alternative] || null;
}

function nextCriterion() {
    currentCriterionIndex++;
    if (currentCriterionIndex < criteria.length) {
        showComparisonForCriterion();
    } else {
        // Todas as comparações foram feitas - mostrar resultados finais
        calculateAndShowFinalResults();
    }
}

function calculateAndShowFinalResults() {
    const interface_ = document.getElementById('comparisonInterface');
    interface_.innerHTML = `
        <div class="success-message">
            🎉 Todas as avaliações foram concluídas!<br>
            Processando resultados finais...
        </div>
    `;
    
    // Aqui você pode chamar a função para calcular e exibir os resultados finais
    setTimeout(() => {
        calculateResults(); // Esta função deve ser definida para calcular os resultados finais
    }, 1000);
}

function validateAllComparisons() {
    for (let criterion of criteria) {
        if (!comparisonData[criterion] || 
            !comparisonData[criterion].best || 
            !comparisonData[criterion].worst ||
            comparisonData[criterion].bestScore === undefined ||
            comparisonData[criterion].worstScore === undefined) {
            showError('Complete todas as comparações antes de continuar.');
            return false;
        }
        
        // Verificar se todas as alternativas têm scores
        for (let alt of alternatives) {
            const score = getScoreForAlternative(criterion, alt);
            if (score === null || score === undefined) {
                showError('Complete todas as avaliações antes de continuar.');
                return false;
            }
        }
    }
    return true;
}