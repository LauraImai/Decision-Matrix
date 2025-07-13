// Funções de utilidade
function showError(message) {
    const existing = document.querySelector('.error-message');
    if (existing) existing.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const currentStepDiv = document.querySelector('.step.active');
    currentStepDiv.insertBefore(errorDiv, currentStepDiv.querySelector('.navigation'));
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    const existing = document.querySelector('.success-message');
    if (existing) existing.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const currentStepDiv = document.querySelector('.step.active');
    currentStepDiv.insertBefore(successDiv, currentStepDiv.querySelector('.navigation'));
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Função auxiliar para mostrar erros
function showError(message) {
    alert(message); 
}