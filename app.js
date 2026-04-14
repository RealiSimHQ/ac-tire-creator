// Main Application Logic

let carMass = 1340; // Default mass
let physicsGenerator = new PhysicsGenerator(carMass);

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const carInfo = document.getElementById('carInfo');
const carWeight = document.getElementById('carWeight');
const frontWidthSelect = document.getElementById('frontWidth');
const frontAspectSelect = document.getElementById('frontAspect');
const frontRimSelect = document.getElementById('frontRim');
const rearWidthSelect = document.getElementById('rearWidth');
const rearAspectSelect = document.getElementById('rearAspect');
const rearRimSelect = document.getElementById('rearRim');
const frontSizePreview = document.getElementById('frontSizePreview');
const rearSizePreview = document.getElementById('rearSizePreview');
const lowHPPackCb = document.getElementById('lowHPPack');
const streetPackCb = document.getElementById('streetPack');
const compPackCb = document.getElementById('compPack');
const singleTireOnlyCb = document.getElementById('singleTireOnly');
const singleTireSelectDiv = document.getElementById('singleTireSelect');
const singleTireSelect = document.getElementById('singleTire');
const defaultTireSelect = document.getElementById('defaultTire');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');

// Tire size calculation helpers
function calcTireRadius(widthMM, aspect, rimInches) {
    const rimRadiusM = (rimInches * 25.4 / 2) / 1000;
    const sidewallM = (widthMM * (aspect / 100)) / 1000;
    return rimRadiusM + sidewallM;
}

function calcRimRadius(rimInches) {
    return (rimInches * 25.4 / 2) / 1000;
}

function populateSelect(select, values, defaultVal) {
    select.innerHTML = '';
    values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
    });
    if (defaultVal !== undefined) select.value = defaultVal;
}

function updateSizePreview() {
    frontSizePreview.textContent = `${frontWidthSelect.value}/${frontAspectSelect.value}R${frontRimSelect.value}`;
    rearSizePreview.textContent = `${rearWidthSelect.value}/${rearAspectSelect.value}R${rearRimSelect.value}`;
}

// Initialize tire size dropdowns
function initializeWidthDropdowns() {
    const widths = [];
    for (let w = 185; w <= 315; w += 5) widths.push(w);
    const aspects = [25, 30, 35, 40, 45, 50, 55, 60, 65];
    const rims = [15, 16, 17, 18, 19, 20];

    populateSelect(frontWidthSelect, widths, 255);
    populateSelect(frontAspectSelect, aspects, 35);
    populateSelect(frontRimSelect, rims, 18);
    populateSelect(rearWidthSelect, widths, 305);
    populateSelect(rearAspectSelect, aspects, 35);
    populateSelect(rearRimSelect, rims, 18);

    // Update preview on any change
    [frontWidthSelect, frontAspectSelect, frontRimSelect,
     rearWidthSelect, rearAspectSelect, rearRimSelect].forEach(el => {
        el.addEventListener('change', updateSizePreview);
    });
    updateSizePreview();
}

// Get selected tires based on pack selection
function getSelectedTires() {
    const tires = [];
    
    if (lowHPPackCb.checked) {
        tires.push(...TIRE_DATABASE.lowHP);
    }
    if (streetPackCb.checked) {
        tires.push(...TIRE_DATABASE.street);
    }
    if (compPackCb.checked) {
        tires.push(...TIRE_DATABASE.competition);
    }
    
    return tires;
}

// Update tire dropdowns based on pack selection
function updateTireDropdowns() {
    const tires = getSelectedTires();
    
    // Update single tire select
    singleTireSelect.innerHTML = '';
    tires.forEach(tire => {
        const option = document.createElement('option');
        option.value = tire.id;
        option.textContent = tire.name;
        singleTireSelect.appendChild(option);
    });
    
    // Update default tire select
    updateDefaultTireDropdown();
}

// Update default tire dropdown based on final tire selection
function updateDefaultTireDropdown() {
    const tires = getFinalTireList();
    
    defaultTireSelect.innerHTML = '';
    tires.forEach((tire, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = tire.name;
        defaultTireSelect.appendChild(option);
    });
}

// Get final list of tires to include
function getFinalTireList() {
    if (singleTireOnlyCb.checked) {
        const tireId = parseInt(singleTireSelect.value);
        const allTires = [...TIRE_DATABASE.street, ...TIRE_DATABASE.competition];
        const tire = allTires.find(t => t.id === tireId);
        return tire ? [tire] : [];
    } else {
        return getSelectedTires();
    }
}

// Drag and drop handlers
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    console.log('[Drop] Drop event fired, items:', e.dataTransfer.items?.length, 'files:', e.dataTransfer.files?.length);
    
    // Handle folder drops via DataTransferItem API
    const items = e.dataTransfer.items;
    let found = false;
    
    if (items && items.length > 0) {
        for (const item of items) {
            console.log('[Drop] Item kind:', item.kind, 'type:', item.type);
            if (item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();
                console.log('[Drop] Entry:', entry?.name, 'isDir:', entry?.isDirectory, 'isFile:', entry?.isFile);
                if (entry && entry.isDirectory) {
                    found = await searchDirectoryForFiles(entry);
                } else if (entry && entry.isFile) {
                    // Single file dropped
                    const file = item.getAsFile();
                    if (file) {
                        await handleFile(file);
                        found = true;
                    }
                }
            }
        }
    }
    
    if (!found) {
        // Fall back to files list
        const files = e.dataTransfer.files;
        console.log('[Drop] Fallback to files list, count:', files?.length);
        for (let i = 0; i < files.length; i++) {
            console.log('[Drop] File:', files[i].name, 'type:', files[i].type);
            await handleFile(files[i]);
        }
    }
});

// Recursively search a dropped directory for car.ini and tyres.ini
async function searchDirectoryForFiles(dirEntry) {
    return new Promise((resolve) => {
        const reader = dirEntry.createReader();
        reader.readEntries(async (entries) => {
            let foundAny = false;
            
            // Check this directory for car.ini and tyres.ini
            for (const entry of entries) {
                if (entry.isFile && entry.name.toLowerCase() === 'car.ini') {
                    await new Promise(r => entry.file((file) => { handleFile(file); r(); }));
                    foundAny = true;
                }
                if (entry.isFile && entry.name.toLowerCase() === 'tyres.ini') {
                    await new Promise(r => entry.file((file) => { handleFile(file); r(); }));
                    foundAny = true;
                }
            }
            
            // ALWAYS check subdirectories — car.ini may be at root, tyres.ini in data/
            for (const entry of entries) {
                if (entry.isDirectory) {
                    const found = await searchDirectoryForFiles(entry);
                    if (found) foundAny = true;
                }
            }
            resolve(foundAny);
        });
    });
}

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Handle file upload
async function handleFile(file) {
    try {
        if (file.name.toLowerCase() === 'car.ini') {
            const text = await file.text();
            parseCarINI(text);
        } else if (file.name.toLowerCase() === 'tyres.ini') {
            const text = await file.text();
            parseTyresINI(text);
        } else if (file.name.endsWith('.ini')) {
            // Generic .ini - try both parsers
            const text = await file.text();
            if (text.includes('TOTALMASS')) {
                parseCarINI(text);
            } else if (text.includes('[FRONT]')) {
                parseTyresINI(text);
            } else {
                showStatus('Unrecognized .ini file', 'error');
            }
        } else if (file.name.endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            let found = false;
            // Look for car.ini
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (path.toLowerCase().endsWith('car.ini')) {
                    const text = await zipEntry.async('text');
                    parseCarINI(text);
                    found = true;
                    break;
                }
            }
            // Also look for tyres.ini
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (path.toLowerCase().endsWith('tyres.ini')) {
                    const text = await zipEntry.async('text');
                    parseTyresINI(text);
                    found = true;
                    break;
                }
            }
            if (!found) {
                showStatus('No car.ini or tyres.ini found in ZIP file', 'error');
            }
        } else {
            showStatus('Please drop a car folder, data folder, or ZIP file', 'error');
        }
    } catch (error) {
        showStatus('Error reading file: ' + error.message, 'error');
    }
}

// Parse car.ini to extract TOTALMASS
function parseCarINI(text) {
    const lines = text.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim().split(';')[0].trim(); // strip comments
        
        if (trimmed.startsWith('TOTALMASS=')) {
            const mass = parseFloat(trimmed.split('=')[1]);
            if (!isNaN(mass)) {
                carMass = mass;
                physicsGenerator = new PhysicsGenerator(carMass);
                carWeight.textContent = mass.toFixed(0);
                carInfo.style.display = 'block';
                showStatus('Car weight detected successfully!', 'success');
                return;
            }
        }
    }
    
    showStatus('TOTALMASS not found in car.ini, using default 1340kg', 'info');
}

// Parse tyres.ini to extract tire sizes from first FRONT and REAR sections
function parseTyresINI(text) {
    const lines = text.split('\n');
    let currentSection = null;
    let frontWidth = null, frontRadius = null, frontRimRadius = null;
    let rearWidth = null, rearRadius = null, rearRimRadius = null;

    console.log(`[TyreDetect] Parsing tyres.ini (${lines.length} lines)`);
    for (const line of lines) {
        const trimmed = line.trim().split(';')[0].trim();
        
        // Match [FRONT] but not [FRONT_1], [FRONT_2] etc.
        if (/^\[FRONT\]$/i.test(trimmed)) { currentSection = 'front'; console.log('[TyreDetect] Found [FRONT]'); continue; }
        if (/^\[REAR\]$/i.test(trimmed)) { currentSection = 'rear'; console.log('[TyreDetect] Found [REAR]'); continue; }
        if (/^\[/.test(trimmed) && !/^\[FRONT\]$/i.test(trimmed) && !/^\[REAR\]$/i.test(trimmed)) {
            currentSection = null; continue;
        }

        if (!currentSection) continue;
        const [key, val] = trimmed.split('=').map(s => s.trim());
        if (!key || !val) continue;

        if (currentSection === 'front') {
            if (key === 'WIDTH') frontWidth = parseFloat(val);
            if (key === 'RADIUS') frontRadius = parseFloat(val);
            if (key === 'RIM_RADIUS') frontRimRadius = parseFloat(val);
        }
        if (currentSection === 'rear') {
            if (key === 'WIDTH') rearWidth = parseFloat(val);
            if (key === 'RADIUS') rearRadius = parseFloat(val);
            if (key === 'RIM_RADIUS') rearRimRadius = parseFloat(val);
        }
    }

    // Reverse-calculate tire size from WIDTH, RADIUS, RIM_RADIUS
    let detected = [];
    if (frontWidth && frontRadius && frontRimRadius) {
        const widthMM = Math.round(frontWidth * 1000);
        const rimInches = Math.round((frontRimRadius * 2 * 1000) / 25.4);
        const sidewallMM = (frontRadius - frontRimRadius) * 1000;
        const aspect = Math.round((sidewallMM / widthMM) * 100);
        
        const snappedWidth = snapToNearest(widthMM, 5, 185, 315);
        const snappedAspect = snapToNearest(aspect, 5, 25, 65);
        const snappedRim = snapToNearest(rimInches, 1, 15, 20);
        
        console.log(`[TyreDetect] Front raw: W=${frontWidth} R=${frontRadius} RR=${frontRimRadius} → ${widthMM}mm rim${rimInches}" aspect${aspect} → snapped ${snappedWidth}/${snappedAspect}R${snappedRim}`);
        
        frontWidthSelect.value = snappedWidth;
        frontAspectSelect.value = snappedAspect;
        frontRimSelect.value = snappedRim;
        detected.push(`Front: ${snappedWidth}/${snappedAspect}R${snappedRim}`);
    }
    if (rearWidth && rearRadius && rearRimRadius) {
        const widthMM = Math.round(rearWidth * 1000);
        const rimInches = Math.round((rearRimRadius * 2 * 1000) / 25.4);
        const sidewallMM = (rearRadius - rearRimRadius) * 1000;
        const aspect = Math.round((sidewallMM / widthMM) * 100);
        
        const snappedWidth = snapToNearest(widthMM, 5, 185, 315);
        const snappedAspect = snapToNearest(aspect, 5, 25, 65);
        const snappedRim = snapToNearest(rimInches, 1, 15, 20);
        
        console.log(`[TyreDetect] Rear raw: W=${rearWidth} R=${rearRadius} RR=${rearRimRadius} → ${widthMM}mm rim${rimInches}" aspect${aspect} → snapped ${snappedWidth}/${snappedAspect}R${snappedRim}`);
        
        rearWidthSelect.value = snappedWidth;
        rearAspectSelect.value = snappedAspect;
        rearRimSelect.value = snappedRim;
        detected.push(`Rear: ${snappedWidth}/${snappedAspect}R${snappedRim}`);
    }
    
    if (detected.length > 0) {
        updateSizePreview();
        showStatus('Tire sizes detected: ' + detected.join(', '), 'success');
    }
}

// Snap a value to the nearest step within min/max
function snapToNearest(val, step, min, max) {
    val = Math.max(min, Math.min(max, val));
    return Math.round(val / step) * step;
}

// Pack checkbox handlers
function ensureOneChecked(changedCb) {
    if (!lowHPPackCb.checked && !streetPackCb.checked && !compPackCb.checked) {
        changedCb.checked = true;
    }
    updateTireDropdowns();
}

lowHPPackCb.addEventListener('change', () => ensureOneChecked(lowHPPackCb));
streetPackCb.addEventListener('change', () => ensureOneChecked(streetPackCb));
compPackCb.addEventListener('change', () => ensureOneChecked(compPackCb));

// Single tire checkbox handler
singleTireOnlyCb.addEventListener('change', () => {
    singleTireSelectDiv.style.display = singleTireOnlyCb.checked ? 'block' : 'none';
    updateDefaultTireDropdown();
});

singleTireSelect.addEventListener('change', updateDefaultTireDropdown);

// Generate button handler
generateBtn.addEventListener('click', async () => {
    try {
        generateBtn.disabled = true;
        showStatus('Generating tire pack...', 'info');
        
        const frontWidth = parseInt(frontWidthSelect.value);
        const frontAspect = parseInt(frontAspectSelect.value);
        const frontRim = parseInt(frontRimSelect.value);
        const rearWidth = parseInt(rearWidthSelect.value);
        const rearAspect = parseInt(rearAspectSelect.value);
        const rearRim = parseInt(rearRimSelect.value);

        const frontRadius = calcTireRadius(frontWidth, frontAspect, frontRim);
        const frontRimRadius = calcRimRadius(frontRim);
        const rearRadius = calcTireRadius(rearWidth, rearAspect, rearRim);
        const rearRimRadius = calcRimRadius(rearRim);

        const tireSize = {
            frontWidth, frontAspect, frontRim, frontRadius, frontRimRadius,
            rearWidth, rearAspect, rearRim, rearRadius, rearRimRadius
        };

        const tires = getFinalTireList();
        const defaultIndex = parseInt(defaultTireSelect.value);
        
        if (tires.length === 0) {
            showStatus('No tires selected!', 'error');
            generateBtn.disabled = false;
            return;
        }
        
        // Create ZIP
        const zip = new JSZip();
        const dataFolder = zip.folder('data');
        
        // Determine if any Low HP tires are selected (affects header values)
        const hasLowHP = tires.some(t => t.tier === 'lowHP');
        const explosionTemp = hasLowHP && !streetPackCb.checked && !compPackCb.checked ? 320 : 650;
        const blanketsTemp = hasLowHP && !streetPackCb.checked && !compPackCb.checked ? 40 : 80;

        // Generate tyres.ini header
        let tyresINI = `; Generated by AC Tire Creator
; Car mass: ${carMass.toFixed(0)}kg
; Front: ${frontWidth}/${frontAspect}R${frontRim}, Rear: ${rearWidth}/${rearAspect}R${rearRim}
; ${tires.length} compound(s)

[HEADER]
VERSION=11

[_EXTENSION]
LATERAL_RAYS=7
LONGITUDINAL_RAYS=7
MAX_RAY_ANGLE=70
MAX_RAY_WIDTH_RATIO=1.3
DISABLE_RAY_DOUBLING=0
EXTENDED_RAYTRACING=0
USE_RELAX_LENGTH_ON_FORCE=11
USE_NEW_RR_SLIP=1

[THERMAL_MODEL]
VERSION=2

[VIRTUALKM]
USE_LOAD=1

[EXPLOSION]
TEMPERATURE=${explosionTemp}

[ADDITIONAL1]
BLANKETS_TEMP=${blanketsTemp}

[COMPOUND_DEFAULT]
INDEX=${defaultIndex}
`;

        // Generate each tire's data
        tires.forEach((tire, index) => {
            if (tire.tier === 'lowHP') {
                // Low HP uses completely different physics approach
                tyresINI += physicsGenerator.generateLowHPTyreINISection(tire, index, tireSize);
                const lutFiles = physicsGenerator.generateLowHPLUTFiles(tire, index);
                Object.entries(lutFiles).forEach(([filename, content]) => {
                    dataFolder.file(filename, content);
                });
            } else {
                // Street/Comp use original physics
                tyresINI += physicsGenerator.generateTyreINISection(tire, index, tireSize);
                const lutFiles = physicsGenerator.generateLUTFiles(tire, index);
                Object.entries(lutFiles).forEach(([filename, content]) => {
                    dataFolder.file(filename, content);
                });
            }
        });
        
        // Add tyres.ini to zip
        dataFolder.file('tyres.ini', tyresINI);
        
        // Generate and download ZIP
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ac_tires_${frontWidth}-${frontAspect}R${frontRim}_${rearWidth}-${rearAspect}R${rearRim}_${tires.length}compounds.zip`;
        a.click();
        URL.revokeObjectURL(url);
        
        showStatus(`Successfully generated ${tires.length} tire compound(s)!`, 'success');
        
    } catch (error) {
        showStatus('Error generating tire pack: ' + error.message, 'error');
        console.error(error);
    } finally {
        generateBtn.disabled = false;
    }
});

// Show status message
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    statusDiv.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize
initializeWidthDropdowns();
updateTireDropdowns();
