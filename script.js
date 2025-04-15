document.addEventListener('DOMContentLoaded', function() {
    initEventTracking();
    initTextAnalyzer();
    initUI();
});

function initUI() {
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

   
}

function initEventTracking() {
    document.addEventListener('click', function(event) {
        logEvent('click', event.target);
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                logEvent('view', entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    document.querySelectorAll('img').forEach(img => {
        observer.observe(img);
    });
}

function logEvent(eventType, element) {
    const timestamp = new Date().toISOString();
    let elementType = element.tagName.toLowerCase();
    
    if (element.classList.contains('btn')) {
        elementType = 'button';
    } else if (element.tagName === 'IMG') {
        elementType = 'image';
    } else if (element.tagName === 'A') {
        elementType = 'link';
    } else if (element.tagName === 'INPUT') {
        elementType = 'input-' + element.type;
    } else if (element.tagName === 'TEXTAREA') {
        elementType = 'textarea';
    } else if (element.tagName === 'SELECT') {
        elementType = 'dropdown';
    }
    
    const logMessage = `${timestamp}, ${eventType}, ${elementType}`;
    console.log(`%c${logMessage}`, 'color: #D11B1B');
}

function initTextAnalyzer() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const sampleTextBtn = document.getElementById('sample-text-btn');
    const resetBtn = document.getElementById('reset-btn');
    const inputText = document.getElementById('input-text');
    
    if (analyzeBtn && sampleTextBtn && inputText && resetBtn) {
        analyzeBtn.addEventListener('click', function() {
            if (analyzeBtn.disabled) return;
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';
            setTimeout(() => {
                analyzeText(inputText.value);
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'Analyze Now';
            }, 100);
        });
        
        sampleTextBtn.addEventListener('click', function() {
            loadSampleText();
        });
        
        resetBtn.addEventListener('click', function() {
            inputText.value = '';
            resetResults();
        });
    }
}

function loadSampleText() {
    const inputText = document.getElementById('input-text');
    if (!inputText) return;
    
    inputText.value = '';
    const loadingMsg = document.createElement('div');
    loadingMsg.textContent = 'Loading sample text...';
    loadingMsg.style.color = '#C4B076';
    inputText.parentNode.insertBefore(loadingMsg, inputText.nextSibling);
    
    fetch('https://norvig.com/big.txt')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(text => {
            const sampleText = text.slice(0, 100000);
            inputText.value = sampleText;
            loadingMsg.remove();
            analyzeText(sampleText);
        })
        .catch(error => {
            console.error('Error loading sample text:', error);
            inputText.value = getSampleTextFallback();
            loadingMsg.remove();
            analyzeText(inputText.value);
        });
}

function getSampleTextFallback() {
    return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers. A man, a plan, a canal, Panama. All that glitters is not gold. A journey of a thousand miles begins with a single step. Actions speak louder than words. Beauty is in the eye of the beholder. Better late than never.

    I am going to the store to buy some groceries. She has been working on this project for weeks. They will arrive in the morning with all their luggage. We should have taken a different route to avoid traffic. You must submit your application before the deadline. He had already finished his homework when I called. The cat was sleeping on the windowsill in the sun.

    To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them. To die, to sleep—no more—and by a sleep to say we end the heartache and the thousand natural shocks that flesh is heir to.`;
}

function analyzeText(text) {
    if (!text.trim()) {
        resetResults();
        return;
    }
    
    const stats = calculateTextStats(text);
    displayTextStats(stats);
    
    const pronouns = countPronouns(text);
    displayTokenCounts('pronoun-results', pronouns);
    
    const prepositions = countPrepositions(text);
    displayTokenCounts('preposition-results', prepositions);
    
    const articles = countIndefiniteArticles(text);
    displayTokenCounts('article-results', articles);
}

function resetResults() {
    document.getElementById('char-count').textContent = 'Letters: 0';
    document.getElementById('word-count').textContent = 'Words: 0';
    document.getElementById('space-count').textContent = 'Spaces: 0';
    document.getElementById('newline-count').textContent = 'Newlines: 0';
    document.getElementById('special-count').textContent = 'Special Symbols: 0';
    ['pronoun-results', 'preposition-results', 'article-results'].forEach(id => {
        document.getElementById(id).innerHTML = '<p style="color: #C4B076;">No matches found.</p>';
    });
    document.getElementById('pronoun-total').textContent = 'Total Pronouns: 0';
    document.getElementById('preposition-total').textContent = 'Total Prepositions: 0';
    document.getElementById('article-total').textContent = 'Total Articles: 0';
}

function calculateTextStats(text) {
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const words = text.trim().split(/\s+/).length;
    const spaces = (text.match(/\s/g) || []).length;
    const newlines = (text.match(/\n/g) || []).length;
    const specialSymbols = (text.match(/[^\w\s]/g) || []).length;
    
    return { letters, words, spaces, newlines, specialSymbols };
}

function displayTextStats(stats) {
    document.getElementById('char-count').textContent = `Letters: ${stats.letters}`;
    document.getElementById('word-count').textContent = `Words: ${stats.words}`;
    document.getElementById('space-count').textContent = `Spaces: ${stats.spaces}`;
    document.getElementById('newline-count').textContent = `Newlines: ${stats.newlines}`;
    document.getElementById('special-count').textContent = `Special Symbols: ${stats.specialSymbols}`;
}

function countPronouns(text) {
    const pronounList = [
        'i', 'me', 'my', 'mine', 'myself',
        'you', 'your', 'yours', 'yourself', 'yourselves',
        'he', 'him', 'his', 'himself',
        'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself',
        'we', 'us', 'our', 'ours', 'ourselves',
        'they', 'them', 'their', 'theirs', 'themselves',
        'this', 'that', 'these', 'those',
        'who', 'whom', 'whose', 'which', 'what'
    ];
    return countTokens(text, pronounList);
}

function countPrepositions(text) {
    const prepositionList = [
        'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among',
        'around', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between',
        'beyond', 'by', 'concerning', 'considering', 'despite', 'down', 'during',
        'except', 'for', 'from', 'in', 'inside', 'into', 'like', 'near', 'of', 'off',
        'on', 'onto', 'out', 'outside', 'over', 'past', 'regarding', 'round', 'since',
        'through', 'throughout', 'to', 'toward', 'towards', 'under', 'underneath',
        'until', 'unto', 'up', 'upon', 'with', 'within', 'without'
    ];
    return countTokens(text, prepositionList);
}

function countIndefiniteArticles(text) {
    const articleList = ['a', 'an', 'the', 'some', 'any'];
    return countTokens(text, articleList);
}

function countTokens(text, tokenList) {
    const counts = {};
    tokenList.forEach(token => counts[token] = 0);
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(word => {
        if (tokenList.includes(word)) counts[word]++;
    });
    
    const sortedCounts = {};
    Object.keys(counts)
        .filter(token => counts[token] > 0)
        .sort((a, b) => counts[b] - counts[a])
        .forEach(token => sortedCounts[token] = counts[token]);
    
    return sortedCounts;
}

function displayTokenCounts(elementId, counts) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (Object.keys(counts).length === 0) {
        container.innerHTML = '<p style="color: #C4B076;">No matches found.</p>';
        document.getElementById(`${elementId.split('-')[0]}-total`).textContent = `Total ${elementId.split('-')[0].charAt(0).toUpperCase() + elementId.split('-')[0].slice(1)}: 0`;
        return;
    }
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th style="color: #C4B076;">Token</th>
                <th style="color: #C4B076;">Count</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    Object.entries(counts).forEach(([token, count]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${token}</td>
            <td>${count}</td>
    `;
        tbody.appendChild(row);
    });
    
    container.appendChild(table);
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    document.getElementById(`${elementId.split('-')[0]}-total`).textContent = `Total ${elementId.split('-')[0].charAt(0).toUpperCase() + elementId.split('-')[0].slice(1)}: ${total}`;
}