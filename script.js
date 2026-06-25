// Calculator behavior and keyboard support
const historyElement = document.getElementById('history');
const outputElement = document.getElementById('output');
const buttons = document.querySelectorAll('.button');

let historyValue = '';
let outputValue = '';
let lastAction = '';

function updateScreen() {
    historyElement.textContent = historyValue || '0';
    outputElement.textContent = outputValue || '0';
}

function appendNumber(value) {
    if (lastAction === '=') {
        historyValue = '';
        outputValue = '';
    }
    if (value === '.' && outputValue.includes('.')) return;
    if (outputValue === '0' && value !== '.') {
        outputValue = value;
    } else {
        outputValue = outputValue + value;
    }
    lastAction = 'number';
}

function appendOperator(operator) {
    if (!outputValue && !historyValue) {
        if (operator === '-') {
            outputValue = '-';
            updateScreen();
        }
        return;
    }

    if (lastAction === '=') {
        historyValue = outputValue;
        outputValue = '';
    }

    if (outputValue) {
        historyValue += outputValue;
        outputValue = '';
    }

    if (/[$+\-×÷%]$/.test(historyValue)) {
        historyValue = historyValue.slice(0, -1) + operator;
    } else {
        historyValue += operator;
    }

    lastAction = 'operator';
}

function applyPercent() {
    if (!outputValue) return;
    const number = parseFloat(outputValue);
    if (Number.isNaN(number)) return;
    outputValue = String(number / 100);
    lastAction = 'percent';
}

function deleteLast() {
    if (outputValue) {
        outputValue = outputValue.slice(0, -1);
        if (outputValue === '' || outputValue === '-') {
            outputValue = '';
        }
    } else if (historyValue) {
        historyValue = historyValue.slice(0, -1);
    }
    lastAction = 'delete';
}

function clearAll() {
    historyValue = '';
    outputValue = '';
    lastAction = 'clear';
}

function calculateResult() {
    if (!outputValue && !historyValue) return;

    if (outputValue) {
        historyValue += outputValue;
    }

    const expression = historyValue
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');

    try {
        const result = Function(`"use strict"; return (${expression})`)();
        if (!Number.isFinite(result)) {
            throw new Error('Invalid result');
        }
        outputValue = String(Number(result.toFixed(12)));
        historyValue = `${historyValue} =`;
        lastAction = '=';
    } catch (error) {
        outputValue = 'Error';
        historyValue = '';
        lastAction = 'error';
    }
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;

        if (!action) return;
        switch (action) {
            case 'clear':
                clearAll();
                break;
            case 'delete':
                deleteLast();
                break;
            case '%':
                applyPercent();
                break;
            case '=':
                calculateResult();
                break;
            case '+':
            case '-':
            case '×':
            case '÷':
                appendOperator(action);
                break;
            default:
                appendNumber(action);
        }
        updateScreen();
    });
});

window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/^[0-9]$/.test(key)) {
        appendNumber(key);
    } else if (key === '.') {
        appendNumber(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        const operatorMap = { '*': '×', '/': '÷' };
        appendOperator(operatorMap[key] || key);
    } else if (key === '%') {
        applyPercent();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
    } else {
        return;
    }

    event.preventDefault();
    updateScreen();
});

updateScreen();
