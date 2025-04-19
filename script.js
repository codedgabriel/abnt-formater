const { jsPDF } = window.jspdf;
        
// Objeto para armazenar as páginas de cada seção
const sectionPages = {
    'resumo': { start: 0 },
    'introducao': { start: 0 },
    'desenvolvimento': { start: 0 },
    'conclusao': { start: 0 },
    'referencias': { start: 0 }
};

// Adiciona uma seção inicial
addDevelopmentSection();

// Funções para gerenciar seções de desenvolvimento
function addDevelopmentSection() {
    const container = document.getElementById('developmentSections');
    const sectionCount = container.children.length + 1;
    
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'development-section';
    sectionDiv.setAttribute('data-section', sectionCount);
    sectionDiv.innerHTML = `
        <div class="section-title">Seção 2.${sectionCount}</div>
        <input type="text" class="section-title-input" placeholder="Título da seção" required>
        
        <div class="content-options">
            <button type="button" class="btn-add-content" onclick="addTextArea(this)">+ Texto</button>
            <button type="button" class="btn-add-content" onclick="addListOptions(this)">+ Lista</button>
            <button type="button" class="btn-add-content" onclick="addImageInput(this)">+ Imagem</button>
        </div>
        
        <div class="section-content">
            <textarea class="content-text" rows="6" placeholder="Conteúdo textual (pressione Enter para novos parágrafos)"></textarea>
        </div>
        
        <button type="button" class="btn-remove" onclick="removeDevelopmentSection(this)">Remover Seção</button>
    `;
    
    container.appendChild(sectionDiv);
}

function removeDevelopmentSection(button) {
    const container = document.getElementById('developmentSections');
    if (container.children.length > 1) {
        button.parentElement.remove();
        // Renumerar as seções restantes
        document.querySelectorAll('.development-section').forEach((section, index) => {
            const sectionNumber = index + 1;
            section.setAttribute('data-section', sectionNumber);
            section.querySelector('.section-title').textContent = `Seção 2.${sectionNumber}`;
        });
    } else {
        alert('O trabalho deve ter pelo menos uma seção de desenvolvimento.');
    }
}

// Função para adicionar área de texto
function addTextArea(button) {
    const contentDiv = button.closest('.development-section').querySelector('.section-content');
    const textarea = document.createElement('textarea');
    textarea.className = 'content-text';
    textarea.rows = 6;
    textarea.placeholder = "Novo parágrafo de texto";
    contentDiv.appendChild(textarea);
}

// Função para adicionar opções de lista
function addListOptions(button) {
    const contentDiv = button.closest('.development-section').querySelector('.section-content');
    const listDiv = document.createElement('div');
    listDiv.className = 'list-type';
    
    listDiv.innerHTML = `
        <div style="margin-bottom: 10px;">
            <select class="list-style" style="width: auto; padding: 8px 12px;">
                <option value="disc">• Lista não ordenada</option>
                <option value="decimal">1. Lista numerada</option>
                <option value="lower-alpha">a. Lista alfabética</option>
                <option value="upper-alpha">A. Lista alfabética maiúscula</option>
                <option value="lower-roman">i. Lista romana</option>
            </select>
        </div>
        <button type="button" class="btn-add-content" onclick="addListItem(this)">+ Adicionar Item</button>
        
        <div class="list-items">
            <div class="list-item">
                <input type="text" class="list-item-input" placeholder="Digite um item da lista">
                <button type="button" class="btn-remove-item" onclick="removeListItem(this)">×</button>
            </div>
        </div>
    `;
    
    contentDiv.appendChild(listDiv);
}

// Função para adicionar item à lista
function addListItem(button) {
    const listItemsDiv = button.closest('.list-type').querySelector('.list-items');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.innerHTML = `
        <input type="text" class="list-item-input" placeholder="Digite um item da lista">
        <button type="button" class="btn-remove-item" onclick="removeListItem(this)">×</button>
    `;
    listItemsDiv.appendChild(itemDiv);
}

// Função para remover item da lista
function removeListItem(button) {
    const listItem = button.closest('.list-item');
    if (listItem.parentElement.children.length > 1) {
        listItem.remove();
    } else {
        alert('A lista deve ter pelo menos um item.');
    }
}

// Função para adicionar campo de imagem
function addImageInput(button) {
    const contentDiv = button.closest('.development-section').querySelector('.section-content');
    const imageDiv = document.createElement('div');
    imageDiv.className = 'image-upload';
    
    imageDiv.innerHTML = `
        <label>Imagem:</label>
        <input type="file" class="section-image" accept="image/*">
        <div style="margin-top: 10px;">
            <input type="text" class="image-caption" placeholder="Legenda da imagem (obrigatório)" style="width: 100%;">
        </div>
        <img class="image-preview">
        <button type="button" class="btn-remove" onclick="removeImageInput(this)" style="margin-top: 10px;">Remover Imagem</button>
    `;
    
    // Adiciona evento para preview da imagem
    imageDiv.querySelector('.section-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            const previewImg = this.parentElement.querySelector('.image-preview');
            
            reader.onload = function(event) {
                previewImg.src = event.target.result;
                previewImg.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    contentDiv.appendChild(imageDiv);
}

// Função para remover campo de imagem
function removeImageInput(button) {
    button.parentElement.remove();
}

// Preview da logo da instituição
document.getElementById('institutionLogo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.getElementById('logoPreview');
            img.src = event.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

async function generatePDF() {
    // Validar campos obrigatórios
    const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#f44336';
            isValid = false;
        } else {
            input.style.borderColor = '#ced4da';
        }
    });
    
    if (!isValid) {
        alert('Por favor, preencha todos os campos obrigatórios marcados com *.');
        return;
    }
    
    // Coletar dados do formulário
    const logoFile = document.getElementById('institutionLogo').files[0];
    const institution = document.getElementById('institution').value;
    const faculty = document.getElementById('faculty').value;
    const course = document.getElementById('course').value;
    const title = document.getElementById('title').value;
    const subtitle = document.getElementById('subtitle').value;
    const author = document.getElementById('author').value;
    const professor = document.getElementById('professor').value;
    const discipline = document.getElementById('discipline').value;
    const city = document.getElementById('city').value;
    const year = document.getElementById('year').value;
    const frontPageText = document.getElementById('frontPageText').value;
    const abstract = document.getElementById('abstract').value;
    const keywords = document.getElementById('keywords').value;
    const introduction = document.getElementById('introduction').value;
    const conclusion = document.getElementById('conclusion').value;
    const references = document.getElementById('references').value.split('\n').filter(ref => ref.trim() !== '');
    
    // Coletar seções de desenvolvimento
    const developmentSections = [];
    document.querySelectorAll('.development-section').forEach(section => {
        const sectionData = {
            number: section.getAttribute('data-section'),
            title: section.querySelector('.section-title-input').value,
            contents: []
        };
        
        // Processar cada elemento de conteúdo
        section.querySelectorAll('.section-content > *').forEach(element => {
            if (element.classList.contains('content-text') && element.value.trim() !== '') {
                sectionData.contents.push({
                    type: 'text',
                    value: element.value
                });
            } 
            else if (element.classList.contains('list-type')) {
                const style = element.querySelector('.list-style').value;
                const items = Array.from(element.querySelectorAll('.list-item-input'))
                                  .map(input => input.value)
                                  .filter(item => item.trim() !== '');
                
                if (items.length > 0) {
                    sectionData.contents.push({
                        type: 'list',
                        style: style,
                        items: items
                    });
                }
            } 
            else if (element.classList.contains('image-upload')) {
                const imageFile = element.querySelector('.section-image').files[0];
                const caption = element.querySelector('.image-caption').value;
                
                if (imageFile) {
                    if (!caption.trim()) {
                        alert('Por favor, adicione uma legenda para a imagem.');
                        throw new Error('Legenda de imagem faltando');
                    }
                    
                    sectionData.contents.push({
                        type: 'image',
                        file: imageFile,
                        caption: caption
                    });
                }
            }
        });
        
        if (sectionData.contents.length > 0) {
            developmentSections.push(sectionData);
        }
    });
    
    // Criar PDF com margens ABNT (3cm esquerda, 2cm direita/superior/inferior)
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4'
    });
    
    // Configurações ABNT atualizadas
    const marginLeft = 30;   // 3cm esquerda
    const marginRight = 20;  // 2cm direita
    const marginTop = 30;    // 3cm superior
    const marginBottom = 25; // 2.5cm inferior
    const pageWidth = 210;   // Largura A4 em mm
    const pageHeight = 297;  // Altura A4 em mm
    const contentWidth = pageWidth - marginLeft - marginRight;
    let yPosition = marginTop;
    let currentPage = 1;
    
    // Fontes Times New Roman (padrão ABNT)
    const fontNormal = 'times';
    const fontBold = 'times-bold';
    const fontItalic = 'times-italic';
    
    // Tamanhos de fonte
    const fontSizeLarge = 16;
    const fontSizeMedium = 14;
    const fontSizeNormal = 12;
    const fontSizeSmall = 10;
    
    // Espaçamento entre linhas
    const lineSpacingNormal = 1.5;
    const lineSpacingTight = 1.2;
    
    // Função para estimar altura do texto
    function estimateTextHeight(text, fontSize, spacing) {
        const lineHeight = fontSize * spacing * 0.35;
        const lines = doc.splitTextToSize(text, contentWidth);
        return lines.length * lineHeight;
    }
    
    // Função para adicionar texto formatado
    function addText(text, fontSize = fontSizeNormal, isBold = false, align = 'left', spacing = lineSpacingNormal, isItalic = false) {
        doc.setFontSize(fontSize);
        doc.setFont(isBold ? fontBold : (isItalic ? fontItalic : fontNormal));
        
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * spacing * 0.35;
        
        // Verifica se cabe na página
        if (yPosition + (lines.length * lineHeight) > pageHeight - marginBottom) {
            addPage();
        }
        
        let xPosition = marginLeft;
        if (align === 'center') {
            xPosition = pageWidth / 2;
        } else if (align === 'right') {
            xPosition = pageWidth - marginRight;
        }
        
        // Configuração para texto justificado
        const textOptions = {
            maxWidth: contentWidth,
            align: align === 'justify' ? 'left' : align // jsPDF não tem justify nativo
        };
        
        // Simular texto justificado
        if (align === 'justify') {
            const words = text.split(' ');
            let line = '';
            let justifiedLines = [];
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const testWidth = doc.getTextWidth(testLine);
                
                if (testWidth > contentWidth && i > 0) {
                    justifiedLines.push(line);
                    line = words[i] + ' ';
                } else {
                    line = testLine;
                }
            }
            justifiedLines.push(line);
            
            justifiedLines.forEach((line, idx) => {
                if (idx < justifiedLines.length - 1) {
                    // Distribuir espaços para linhas não finais
                    const words = line.trim().split(' ');
                    if (words.length > 1) {
                        const spaceWidth = (contentWidth - doc.getTextWidth(line.trim())) / (words.length - 1);
                        let x = marginLeft;
                        
                        words.forEach((word, i) => {
                            doc.text(word, x, yPosition);
                            x += doc.getTextWidth(word + ' ') + (i < words.length - 1 ? spaceWidth : 0);
                        });
                        yPosition += lineHeight;
                    } else {
                        doc.text(line, marginLeft, yPosition, textOptions);
                        yPosition += lineHeight;
                    }
                } else {
                    doc.text(line, marginLeft, yPosition, textOptions);
                    yPosition += lineHeight;
                }
            });
            
            return;
        }
        
        doc.text(lines, xPosition, yPosition, textOptions);
        yPosition += lines.length * lineHeight;
        return lines.length * lineHeight;
    }
    
    // Função para adicionar título de seção
    function addSectionTitle(text, level = 1) {
        let fontSize, spacing, alignment;
        
        switch(level) {
            case 1: // Título principal (ex: 1 INTRODUÇÃO)
                fontSize = fontSizeMedium;
                spacing = 1.8;
                alignment = 'center';
                break;
            case 2: // Subseção (ex: 2.1 Metodologia)
                fontSize = fontSizeNormal;
                spacing = 1.6;
                alignment = 'left';
                break;
            case 3: // Subsubseção
                fontSize = fontSizeNormal;
                spacing = 1.4;
                alignment = 'left';
                break;
            default:
                fontSize = fontSizeNormal;
                spacing = 1.5;
                alignment = 'left';
        }
        
        // Verifica se cabe na página
        if (yPosition + (fontSize * spacing * 0.35) > pageHeight - marginBottom) {
            addPage();
        }
        
        // Adiciona espaço antes do título
        if (level === 1) {
            yPosition += 15;
        } else {
            yPosition += 10;
        }
        
        // Adiciona o título
        addText(text, fontSize, level < 3, alignment, spacing, level === 3);
        
        // Adiciona espaço após o título
        yPosition += 5;
    }
    
    // Função para adicionar parágrafo
    function addParagraph(text, indentFirstLine = true) {
        const formattedText = indentFirstLine ? '    ' + text : text; // Recuo de 1cm (4 espaços)
        addText(formattedText, fontSizeNormal, false, 'justify', lineSpacingNormal);
        yPosition += 4; // Espaço entre parágrafos
    }
    
    // Função para adicionar citação longa (ABNT)
    function addLongQuote(text, fontSize = fontSizeSmall) {
        const originalY = yPosition;
        
        // Verifica se cabe na página
        const quoteHeight = estimateTextHeight(text, fontSize, 1.0);
        if (yPosition + quoteHeight > pageHeight - marginBottom) {
            addPage();
        }
        
        // Configurações da citação
        const quoteMargin = 20;
        const quoteIndent = 15;
        const lineHeight = fontSize * 1.0 * 0.35;
        
        // Posiciona a citação
        doc.setFontSize(fontSize);
        doc.setFont(fontItalic);
        
        // Desenha retângulo de fundo (opcional)
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft + quoteIndent, yPosition - 2, contentWidth - quoteIndent - quoteMargin, quoteHeight + 4, 'F');
        
        // Adiciona texto
        const lines = doc.splitTextToSize(text, contentWidth - quoteIndent - quoteMargin);
        lines.forEach((line, index) => {
            doc.text(line, marginLeft + quoteIndent + 2, yPosition + (index * lineHeight));
        });
        
        yPosition += lines.length * lineHeight + 10;
    }
    
    // Função para adicionar lista
    function addList(items, style, fontSize = fontSizeNormal, spacing = lineSpacingTight) {
        const lineHeight = fontSize * spacing * 0.35;
        const itemHeight = lineHeight;
        
        items.forEach((item, index) => {
            let prefix = '';
            if (style === 'decimal') prefix = `${index + 1}. `;
            if (style === 'lower-alpha') prefix = `${String.fromCharCode(97 + index)}. `;
            if (style === 'upper-alpha') prefix = `${String.fromCharCode(65 + index)}. `;
            if (style === 'lower-roman') prefix = `${toRoman(index + 1)}. `;
            if (style === 'disc') prefix = '• ';
            
            const text = `${prefix}${item}`;
            
            // Verifica se cabe na página
            if (yPosition + itemHeight > pageHeight - marginBottom) {
                addPage();
            }
            
            doc.setFontSize(fontSize);
            doc.setFont(fontNormal);
            
            // Adiciona espaço antes do primeiro item se necessário
            if (index === 0) {
                yPosition += 5;
            }
            
            // Recuo para listas
            const listIndent = 10;
            
            // Divide o texto em linhas se necessário
            const lines = doc.splitTextToSize(text, contentWidth - listIndent);
            lines.forEach((line, lineIndex) => {
                doc.text(line, marginLeft + (lineIndex === 0 ? 0 : listIndent), yPosition + (lineIndex * lineHeight), {
                    maxWidth: contentWidth - listIndent,
                    align: 'left'
                });
            });
            
            yPosition += lines.length * lineHeight;
        });
        
        // Adiciona espaço após a lista
        yPosition += 8;
    }
    
    // Função auxiliar para números romanos
    function toRoman(num) {
        const roman = {
            M: 1000, CM: 900, D: 500, CD: 400,
            C: 100, XC: 90, L: 50, XL: 40,
            X: 10, IX: 9, V: 5, IV: 4, I: 1
        };
        let str = '';
        
        for (let i of Object.keys(roman)) {
            let q = Math.floor(num / roman[i]);
            num -= q * roman[i];
            str += i.repeat(q);
        }
        
        return str.toLowerCase();
    }
    
    // Função para adicionar imagem mantendo proporção
    async function addImage(imgData, maxWidth, maxHeight, caption = '') {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                // Calcular dimensões mantendo proporção
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }
                
                if (height > maxHeight) {
                    const ratio = maxHeight / height;
                    height = maxHeight;
                    width = width * ratio;
                }
                
                // Verificar se cabe na página
                if (yPosition + height > pageHeight - marginBottom - (caption ? 15 : 0)) {
                    addPage();
                }
                
                // Centralizar imagem
                const xPosition = (pageWidth - width) / 2;
                
                // Adicionar espaço antes da imagem
                yPosition += 10;
                
                // Adicionar imagem
                doc.addImage(imgData, 'JPEG', xPosition, yPosition, width, height);
                yPosition += height + 5;
                
                // Adicionar legenda se existir
                if (caption) {
                    addText(`Figura ${document.querySelectorAll('.image-upload').length}: ${caption}`, fontSizeSmall, false, 'center', 1);
                    yPosition += 10;
                }
                
                resolve();
            };
            img.src = imgData;
        });
    }
    
    // Função para adicionar nova página
    function addPage() {
        doc.addPage();
        currentPage++;
        yPosition = marginTop;
        
        // Adicionar número da página (exceto na capa)
        if (currentPage > 1) {
            addPageNumber();
        }
    }
    
    // Função para adicionar número da página
    function addPageNumber() {
        doc.setFontSize(fontSizeSmall);
        doc.setFont(fontNormal);
        doc.text(`${currentPage}`, pageWidth - marginRight, 10);
    }
    
    // Função para adicionar item de sumário com pontos condutores
    function addSummaryItem(text, page) {
        const textX = marginLeft;
        const pageX = pageWidth - marginRight;
        const textY = yPosition;
        
        // Adicionar o texto
        doc.text(text, textX, textY);
        
        // Adicionar os pontos condutores
        const textWidth = doc.getTextWidth(text);
        const dotsStart = textX + textWidth + 2;
        const dotsEnd = pageX - doc.getTextWidth(page.toString()) - 5;
        
        if (dotsEnd > dotsStart) {
            const dotsCount = Math.floor((dotsEnd - dotsStart) / 2);
            const dots = '.'.repeat(dotsCount);
            doc.text(dots, dotsStart, textY);
        }
        
        // Adicionar o número da página
        doc.text(page.toString(), pageX, textY, { align: 'right' });
        
        yPosition += 8;
    }
    
    // CAPA (página 1)
    doc.setPage(1);
    
    if (logoFile) {
        await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async function(event) {
                const imgData = event.target.result;
                const img = new Image();
                img.onload = function() {
                    // Definir tamanho máximo para logo
                    const maxWidth = 50;
                    const maxHeight = 30;
                    let width = img.width;
                    let height = img.height;
                    
                    // Redimensionar mantendo proporção
                    if (width > maxWidth) {
                        const ratio = maxWidth / width;
                        width = maxWidth;
                        height = height * ratio;
                    }
                    
                    if (height > maxHeight) {
                        const ratio = maxHeight / height;
                        height = maxHeight;
                        width = width * ratio;
                    }
                    
                    // Centralizar
                    const centerX = (pageWidth - width) / 2;
                    
                    // Posicionar a logo
                    doc.addImage(imgData, 'JPEG', centerX, marginTop, width, height);
                    yPosition = marginTop + height + 20;
                    
                    // Restante da capa
                    addText(institution.toUpperCase(), fontSizeMedium, true, 'center', 1.5);
                    addText(faculty, fontSizeNormal, false, 'center', 1.5);
                    addText(course, fontSizeNormal, false, 'center', 1.5);
                    
                    // Espaço de 1/3 da página
                    yPosition = marginTop + (pageHeight / 3);
                    
                    // Título do trabalho (CAIXA ALTA, centralizado)
                    addText(title.toUpperCase(), fontSizeLarge, true, 'center', 1.5);
                    
                    // Subtítulo (se existir, centralizado)
                    if (subtitle) {
                        addText(subtitle, fontSizeMedium, false, 'center', 1.5);
                    }
                    
                    // Espaço de 2/3 da página
                    yPosition = marginTop + (pageHeight * 2/3);
                    
                    // Autor(es) (centralizado)
                    addText(author, fontSizeNormal, false, 'center', 1.5);
                    
                    // Local e data (centralizado, na parte inferior)
                    yPosition = pageHeight - marginBottom - 20;
                    addText(`${city}`, fontSizeNormal, false, 'center', 1.5);
                    addText(`${year}`, fontSizeNormal, false, 'center', 1.5);
                    
                    resolve();
                };
                img.src = imgData;
            };
            reader.readAsDataURL(logoFile);
        });
    } else {
        // Versão sem logo
        addText(institution.toUpperCase(), fontSizeMedium, true, 'center', 1.5);
        addText(faculty, fontSizeNormal, false, 'center', 1.5);
        addText(course, fontSizeNormal, false, 'center', 1.5);
        
        // Espaço de 1/3 da página
        yPosition = marginTop + (pageHeight / 3);
        
        // Título do trabalho (CAIXA ALTA, centralizado)
        addText(title.toUpperCase(), fontSizeLarge, true, 'center', 1.5);
        
        // Subtítulo (se existir, centralizado)
        if (subtitle) {
            addText(subtitle, fontSizeMedium, false, 'center', 1.5);
        }
        
        // Espaço de 2/3 da página
        yPosition = marginTop + (pageHeight * 2/3);
        
        // Autor(es) (centralizado)
        addText(author, fontSizeNormal, false, 'center', 1.5);
        
        // Local e data (centralizado, na parte inferior)
        yPosition = pageHeight - marginBottom - 20;
        addText(`${city}`, fontSizeNormal, false, 'center', 1.5);
        addText(`${year}`, fontSizeNormal, false, 'center', 1.5);
    }
    
    // Folha de rosto (página 2)
    addPage();
    sectionPages['folha_rosto'] = currentPage;
    
    // Repete informações da capa com adicionais
    addText(institution.toUpperCase(), fontSizeMedium, true, 'center', 1.5);
    addText(faculty, fontSizeNormal, false, 'center', 1.5);
    addText(course, fontSizeNormal, false, 'center', 1.5);
    
    yPosition += 20;
    
    addText(title.toUpperCase(), fontSizeLarge, true, 'center', 1.5);
    if (subtitle) {
        addText(subtitle, fontSizeMedium, false, 'center', 1.5);
    }
    
    yPosition += 30;
    
    // Texto específico da folha de rosto (personalizável)
    const frontPageLines = frontPageText.split('\n').filter(line => line.trim() !== '');
    frontPageLines.forEach(line => {
        addText(line, fontSizeNormal, false, 'right', 1.5);
    });
    
    yPosition += 20;
    
    addText(`Professor: ${professor}`, fontSizeNormal, false, 'center', 1.5);
    addText(author, fontSizeNormal, false, 'center', 1.5);
    
    yPosition += 20;
    
    addText(`${city}`, fontSizeNormal, false, 'center', 1.5);
    addText(`${year}`, fontSizeNormal, false, 'center', 1.5);
    
    // Resumo (página 3)
    addPage();
    sectionPages['resumo'].start = currentPage;
    
    addText('RESUMO', fontSizeMedium, true, 'center', 1.5);
    yPosition += 15;
    
    // Texto do resumo
    addText(abstract, fontSizeNormal, false, 'justify', lineSpacingNormal);
    yPosition += 10;
    
    // Palavras-chave
    if (keywords) {
        addText(`Palavras-chave: ${keywords}`, fontSizeNormal, false, 'left', lineSpacingNormal);
    }
    
    // Sumário (página 4)
    addPage();
    const summaryPage = currentPage;
    
    addText('SUMÁRIO', fontSizeMedium, true, 'center', 1.5);
    yPosition += 20;
    
    // Introdução (página 5)
    addPage();
    sectionPages['introducao'].start = currentPage;
    addSectionTitle('1 INTRODUÇÃO', 1);
    const introParagraphs = introduction.split('\n').filter(p => p.trim() !== '');
    introParagraphs.forEach(p => addParagraph(p));
    
    // Desenvolvimento (página seguinte)
    addPage();
    sectionPages['desenvolvimento'].start = currentPage;
    addSectionTitle('2 DESENVOLVIMENTO', 1);
    
    // Processar cada seção de desenvolvimento
    for (const section of developmentSections) {
        addSectionTitle(`2.${section.number} ${section.title}`, 2);
        
        // Processar cada conteúdo da seção
        for (const content of section.contents) {
            if (content.type === 'text') {
                const paragraphs = content.value.split('\n').filter(p => p.trim() !== '');
                paragraphs.forEach(p => addParagraph(p));
            } 
            else if (content.type === 'list') {
                addList(content.items, content.style);
            } 
            else if (content.type === 'image') {
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = async function(event) {
                        await addImage(event.target.result, contentWidth, 100, content.caption);
                        resolve();
                    };
                    reader.readAsDataURL(content.file);
                });
            }
        }
    }
    
    // Conclusão (página seguinte)
    addPage();
    sectionPages['conclusao'].start = currentPage;
    addSectionTitle('3 CONCLUSÃO', 1);
    const conclusionParagraphs = conclusion.split('\n').filter(p => p.trim() !== '');
    conclusionParagraphs.forEach(p => addParagraph(p));
    
    // Referências (nova página)
    addPage();
    sectionPages['referencias'].start = currentPage;
    addSectionTitle('REFERÊNCIAS', 1);
    
    // Ordenar referências alfabeticamente
    references.sort((a, b) => {
        // Extrai o sobrenome do autor (primeira palavra antes da vírgula)
        const getAuthor = (ref) => {
            const commaIndex = ref.indexOf(',');
            return commaIndex !== -1 ? ref.substring(0, commaIndex).toUpperCase() : ref.toUpperCase();
        };
        return getAuthor(a).localeCompare(getAuthor(b));
    });
    
    // Adicionar referências formatadas
    references.forEach(ref => {
        if (ref.trim()) {
            addText(ref.trim(), fontSizeNormal, false, 'left', lineSpacingTight);
            yPosition += 4; // Espaço entre referências
        }
    });
    
    // Agora que sabemos todas as páginas, vamos atualizar o sumário
    doc.setPage(summaryPage);
    yPosition = marginTop + 20;
    
    // Adicionar título do sumário
    addText('SUMÁRIO', fontSizeMedium, true, 'center', 1.5);
    yPosition += 20;
    
    // Adicionar itens do sumário com pontos condutores
    addSummaryItem('RESUMO', sectionPages['resumo'].start);
    addSummaryItem('1 INTRODUÇÃO', sectionPages['introducao'].start);
    addSummaryItem('2 DESENVOLVIMENTO', sectionPages['desenvolvimento'].start);
    
    developmentSections.forEach(section => {
        addSummaryItem(`2.${section.number} ${section.title}`, sectionPages['desenvolvimento'].start);
    });
    
    addSummaryItem('3 CONCLUSÃO', sectionPages['conclusao'].start);
    addSummaryItem('REFERÊNCIAS', sectionPages['referencias'].start);
    
    // Atualizar números de página em todas as páginas (exceto capa)
    for (let i = 2; i <= doc.internal.pages.length; i++) {
        doc.setPage(i);
        doc.setFontSize(fontSizeSmall);
        doc.setFont(fontNormal);
        doc.text(`${i}`, pageWidth - marginRight, 10);
    }
    
    // Salvar o PDF
    const fileName = `Trabalho_${title.substring(0, 30).replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}