// Generic PDF Upload Handler
// Usage: initPDFUpload('pdfUpload', 'pdfDropZone', 'pdfStatus', 'englisch', fieldMapping)

async function extractPDFText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }
    return fullText.trim();
}

function initPDFUpload(uploadId, dropZoneId, statusId, subject, fieldMapping) {
    const pdfUpload = document.getElementById(uploadId);
    const pdfDropZone = document.getElementById(dropZoneId);
    const statusEl = document.getElementById(statusId);

    if (!pdfUpload || !pdfDropZone) return;

    async function handleUpload(file) {
        if (!file) return;

        statusEl.style.display = 'block';
        statusEl.textContent = 'PDF wird verarbeitet...';
        statusEl.style.color = 'rgba(102, 126, 234, 1)';

        try {
            const fullText = await extractPDFText(file);
            statusEl.textContent = 'Text wird analysiert und verteilt, bitte warten...';

            const response = await fetch('/api/parse-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfText: fullText, subject: subject })
            });

            if (!response.ok) {
                throw new Error('Fehler bei der Text-Analyse');
            }

            const data = await response.json();

            if (data.success) {
                // Fill fields based on mapping
                Object.entries(fieldMapping).forEach(([apiField, elementId]) => {
                    if (data.data[apiField]) {
                        const el = document.getElementById(elementId);
                        if (el) el.value = data.data[apiField];
                    }
                });

                statusEl.textContent = '✓ PDF erfolgreich geladen und Texte verteilt';
                statusEl.style.color = 'rgba(76, 175, 80, 1)';
            } else {
                throw new Error(data.error || 'Fehler bei der Verteilung');
            }

        } catch (error) {
            console.error('PDF Error:', error);
            // Fallback: put everything in first field
            const firstFieldId = Object.values(fieldMapping)[0];
            if (firstFieldId) {
                try {
                    const fullText = await extractPDFText(file);
                    document.getElementById(firstFieldId).value = fullText;
                } catch (e) {}
            }
            statusEl.textContent = '⚠ PDF geladen, aber automatische Verteilung fehlgeschlagen. Bitte manuell aufteilen.';
            statusEl.style.color = 'rgba(255, 152, 0, 1)';
        }
    }

    // File input change handler
    pdfUpload.addEventListener('change', (e) => {
        if (e.target.files[0]) handleUpload(e.target.files[0]);
    });

    // Click to upload
    pdfDropZone.addEventListener('click', () => pdfUpload.click());

    // Drag and drop
    pdfDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        pdfDropZone.style.background = 'rgba(102, 126, 234, 0.3)';
        pdfDropZone.style.borderColor = 'rgba(102, 126, 234, 0.8)';
    });

    pdfDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        pdfDropZone.style.background = 'rgba(255,255,255,0.1)';
        pdfDropZone.style.borderColor = 'rgba(255,255,255,0.4)';
    });

    pdfDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        pdfDropZone.style.background = 'rgba(255,255,255,0.1)';
        pdfDropZone.style.borderColor = 'rgba(255,255,255,0.4)';

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(files[0]);
            pdfUpload.files = dataTransfer.files;
            handleUpload(files[0]);
        } else {
            statusEl.style.display = 'block';
            statusEl.textContent = '✗ Bitte nur PDF-Dateien hochladen';
            statusEl.style.color = 'rgba(244, 67, 54, 1)';
        }
    });
}
