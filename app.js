const mainDisplay = document.getElementById('main-display');
const subDisplay = document.getElementById('sub-display');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');

let currentExpression = '0';
let history = [];
let lastButton = null;


function showMessage(message) {
    messageText.textContent = message;
    messageBox.style.display = 'flex';
}


function clearDisplay() {
    currentExpression = '0';
    updateDisplay();
    
    if (lastButton) {
        lastButton.classList.remove('active-operator');
        lastButton = null;
    }
}

function appendToDisplay(value) {
    
    if (lastButton && !isOperator(value)) {
        lastButton.classList.remove('active-operator');
        lastButton = null;
    }
    
    if (currentExpression === '0' && value !== '.' && !isOperator(value)) {
        currentExpression = value;
    } else if (currentExpression.endsWith('**2') || currentExpression.endsWith('**3')) {
        
        currentExpression = value;
    } else {
        if (isOperator(value) && isOperator(currentExpression.slice(-1))) {
            
            currentExpression = currentExpression.slice(0, -1) + value;
        } else {
            currentExpression += value;
        }
    }
    updateDisplay();
    
    
    if (isOperator(value) || value === 'Math.sqrt(') {
        let button;
        switch (value) {
            case '+': button = document.querySelector('.buttons-grid button[onclick="appendToDisplay(\'+\')"]'); break;
            case '-': button = document.querySelector('.buttons-grid button[onclick="appendToDisplay(\'-\')"]'); break;
            case '*': button = document.querySelector('.buttons-grid button[onclick="appendToDisplay(\'*\')"]'); break;
            case '/': button = document.querySelector('.buttons-grid button[onclick="appendToDisplay(\'/\')"]'); break;
            case '%': button = document.querySelector('.buttons-grid button[onclick="appendToDisplay(\'%\')"]'); break;
            case 'Math.sqrt(': button = document.querySelector('.buttons-grid button[onclick="appendToDisplay(\'Math.sqrt(\')"]'); break;
        }
        if (button) {
            if (lastButton) {
                lastButton.classList.remove('active-operator');
            }
            button.classList.add('active-operator');
            lastButton = button;
        }
    }
}

function isOperator(char) {
    return ['+', '-', '*', '/', '%'].includes(char);
}

function backspace() {
    if (currentExpression.length > 1) {
        currentExpression = currentExpression.slice(0, -1);
    } else {
        currentExpression = '0';
    }
    updateDisplay();
}

function calculate() {
    try {
        
        let expressionToEval = currentExpression
            .replace(/Math.sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**');

        
        const result = eval(expressionToEval);
        const finalResult = Math.round(result * 100000) / 100000; // Round to 5 decimal places

        
        saveCalculation(currentExpression, finalResult);

        
        subDisplay.textContent = currentExpression + ' =';
        mainDisplay.textContent = finalResult;
        currentExpression = finalResult.toString();

    } catch (error) {
        showMessage("Invalid expression!");
        subDisplay.textContent = '';
        mainDisplay.textContent = 'Error';
        currentExpression = '0';
        console.error('Calculation Error:', error);
    }
    
    if (lastButton) {
        lastButton.classList.remove('active-operator');
        lastButton = null;
    }
}

function updateDisplay() {
    mainDisplay.textContent = currentExpression;
    subDisplay.textContent = '';
}

// --- History Panel and localStorage Logic ---
function toggleHistoryPanel() {
    historyPanel.classList.toggle('open');
}

function saveCalculation(expression, result) {
    const newEntry = { expression, result, timestamp: new Date().toLocaleString() };
    history.unshift(newEntry);
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    renderHistory();
}

function loadHistory() {
    const storedHistory = localStorage.getItem('calculatorHistory');
    if (storedHistory) {
        try {
            history = JSON.parse(storedHistory);
        } catch (e) {
            history = [];
            console.error("Failed to parse history from localStorage", e);
        }
    }
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<li class="text-center text-sm text-gray-400 dark:text-gray-600 mt-4">No history yet.</li>';
        return;
    }
    history.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="font-semibold">${entry.expression}</span> = <span class="text-gray-500">${entry.result}</span><br><small class="text-gray-400">${entry.timestamp}</small>`;
        li.onclick = () => {
            currentExpression = entry.expression;
            updateDisplay();
            toggleHistoryPanel();
        };
        historyList.appendChild(li);
    });
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calculatorHistory');
    renderHistory();
}

// --- File Download Logic ---
document.getElementById('download-button').addEventListener('click', () => {
    if (history.length === 0) {
        showMessage("History is empty. Nothing to download.");
        return;
    }

    const historyText = history.map(entry => `${entry.expression} = ${entry.result} (Calculated on: ${entry.timestamp})`).join('\n');
    const blob = new Blob([historyText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'calculator_history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/[0-9]/.test(key) || key === '.') {
        appendToDisplay(key);
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('*');
    } else if (key === '/') {
        appendToDisplay('/');
    } else if (key === '%') {
        appendToDisplay('%');
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'c' || key === 'C') {
        clearDisplay();
    }
});
window.onload = () => {
    loadHistory();
};
