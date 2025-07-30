class EphemeralEditor {
    constructor() {
        this.editor = document.querySelector('.editor');
        this.wordCount = document.querySelector('.word-count');
        this.charCount = document.querySelector('.char-count');
        this.wordNumber = this.wordCount.querySelector('.number');
        this.wordLabel = this.wordCount.querySelector('.label');
        this.charNumber = this.charCount.querySelector('.number');
        this.charLabel = this.charCount.querySelector('.label');
        this.themeToggle = document.querySelector('.theme-toggle');
        this.logo = document.querySelector('.logo');
        this.counter = document.querySelector('.counter');
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupEditor();
        this.setupEventListeners();
        this.updateCounts();
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('ephemeral-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    setupEditor() {
        // Set philosophical quote as placeholder
        this.editor.setAttribute('data-placeholder', 'Write without history. Think without saving. When you leave, it leaves...');
        
        this.editor.focus();
    }
    
    setupEventListeners() {
        // Handle keypress for immediate markdown detection
        this.editor.addEventListener('keypress', (e) => {
            if (e.key === ' ') {
                this.checkForMarkdownOnSpace(e);
            }
        });
        
        // Handle input for inline markdown and counts
        this.editor.addEventListener('input', () => {
            // Use setTimeout to ensure DOM is updated before counting
            setTimeout(() => {
                this.processInlineMarkdown();
                this.updateCounts();
            }, 10);
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Logo button
        this.logo.addEventListener('click', () => {
            if (this.logo.classList.contains('active')) {
                this.dissolveContent();
            }
        });
        
        // Counter hide toggle
        this.counter.addEventListener('click', () => {
            this.counter.classList.toggle('hidden');
        });
        
        // Handle paste
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
        
        // Clear content on page unload
        window.addEventListener('beforeunload', () => {
            this.editor.innerHTML = '';
        });
    }
    
    checkForMarkdownOnSpace(e) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        
        // Only process text nodes
        if (node.nodeType !== Node.TEXT_NODE) return;
        
        const text = node.textContent;
        const offset = range.startOffset;
        
        // Get text from start of current line to cursor
        const beforeCursor = text.substring(0, offset);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const currentLine = beforeCursor.substring(lineStart);
        
        // Patterns that trigger on space
        const patterns = [
            { regex: /^#$/, tag: 'h1' },
            { regex: /^##$/, tag: 'h2' },
            { regex: /^###$/, tag: 'h3' },
            { regex: /^####$/, tag: 'h4' },
            { regex: /^>$/, tag: 'blockquote' },
            { regex: /^[*-]$/, tag: 'li' }
        ];
        
        for (const pattern of patterns) {
            if (pattern.regex.test(currentLine)) {
                e.preventDefault();
                
                // Calculate positions for text splitting
                const beforeMarkdown = text.substring(0, lineStart);
                const afterCursor = text.substring(offset);
                
                // Create the new element
                let newElement;
                if (pattern.tag === 'li') {
                    const ul = document.createElement('ul');
                    newElement = document.createElement('li');
                    newElement.innerHTML = '<br>';
                    ul.appendChild(newElement);
                    
                    // Insert the list
                    if (node.parentNode === this.editor) {
                        this.editor.insertBefore(ul, node);
                    } else {
                        node.parentNode.insertBefore(ul, node);
                    }
                } else {
                    newElement = document.createElement(pattern.tag);
                    newElement.innerHTML = '<br>';
                    
                    // Insert the element
                    if (node.parentNode === this.editor) {
                        this.editor.insertBefore(newElement, node);
                    } else {
                        node.parentNode.insertBefore(newElement, node);
                    }
                }
                
                // Update or remove the text node
                if (beforeMarkdown || afterCursor) {
                    node.textContent = beforeMarkdown + afterCursor;
                } else {
                    node.remove();
                }
                
                // Place cursor in the new element
                const newRange = document.createRange();
                const newSelection = window.getSelection();
                newRange.setStart(newElement, 0);
                newRange.collapse(true);
                newSelection.removeAllRanges();
                newSelection.addRange(newRange);
                
                break;
            }
        }
    }
    
    processInlineMarkdown() {
        const selection = window.getSelection();
        const savedRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        // Save cursor position
        let savedNode = null;
        let savedOffset = 0;
        if (savedRange) {
            savedNode = savedRange.startContainer;
            savedOffset = savedRange.startOffset;
        }
        
        // Get all text nodes
        const walker = document.createTreeWalker(
            this.editor,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip nodes that are already formatted
                    const parent = node.parentElement;
                    if (parent.tagName === 'STRONG' || parent.tagName === 'EM' || parent.tagName === 'CODE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        // Process each text node
        textNodes.forEach(textNode => {
            let text = textNode.textContent;
            const parent = textNode.parentElement;
            
            // Check for inline patterns
            const patterns = [
                { regex: /\*\*([^*]+)\*\*/g, tag: 'strong' },
                { regex: /\*([^*]+)\*/g, tag: 'em' },
                { regex: /`([^`]+)`/g, tag: 'code' }
            ];
            
            let hasMatch = false;
            for (const pattern of patterns) {
                if (pattern.regex.test(text)) {
                    hasMatch = true;
                    break;
                }
            }
            
            // Smart typography
            if (text.includes('--')) {
                text = text.replace(/--/g, '\u2014');
                textNode.textContent = text;
            }
            
            if (hasMatch) {
                // Create a temporary container
                const temp = document.createElement('span');
                temp.innerHTML = text
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>');
                
                // Replace text node with formatted content
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        });
        
        // Restore cursor
        if (savedNode && savedRange) {
            try {
                const newRange = document.createRange();
                newRange.setStart(savedNode, Math.min(savedOffset, savedNode.length || 0));
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // Cursor restoration failed
            }
        }
    }
    
    updateCounts() {
        // Force a reflow to ensure DOM is updated
        this.editor.offsetHeight;
        
        // Use TreeWalker to get only meaningful text nodes
        const walker = document.createTreeWalker(
            this.editor,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Only accept text nodes that have actual content (not just whitespace)
                    const content = node.textContent.trim();
                    return content.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            },
            false
        );
        
        const textParts = [];
        let node;
        while (node = walker.nextNode()) {
            const nodeText = node.textContent.trim();
            if (nodeText) {
                textParts.push(nodeText);
            }
        }
        
        // Join text parts with single spaces
        const finalText = textParts.join(' ');
        
        // Count words and characters
        const words = finalText === '' ? [] : finalText.split(' ').filter(word => word.length > 0);
        const chars = finalText.length;
        
        // Use consistent spacing by padding the text
        const wordText = words.length === 1 ? 'word' : 'words';
        const charText = chars === 1 ? 'character' : 'characters';
        
        this.wordNumber.textContent = this.formatNumber(words.length);
        this.wordLabel.textContent = wordText;
        this.charNumber.textContent = this.formatNumber(chars);
        this.charLabel.textContent = charText;
        
        // Change logo to "ephemeralize" when content exists
        if (chars > 0) {
            this.logo.classList.add('active');
        } else {
            this.logo.classList.remove('active');
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ephemeral-theme', newTheme);
    }
    
    dissolveContent() {
        // Add a gentle fade out animation
        this.editor.style.transition = 'opacity 0.4s ease';
        this.editor.style.opacity = '0.3';
        
        setTimeout(() => {
            this.editor.innerHTML = '';
            this.editor.style.opacity = '1';
            this.editor.focus();
            this.updateCounts();
        }, 200);
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'm';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
        }
        return num.toString();
    }
    
    smoothUpdateText(element, newText) {
        if (element.textContent === newText) return;
        
        element.style.transition = 'opacity 1s ease';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
        }, 500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EphemeralEditor();
});
