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
    
    // Handle folder drops via DataTransferItem API
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
        let found = false;
        for (const item of items) {
            if (item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();
                if (entry && entry.isDirectory) {
                    found = await searchDirectoryForCarINI(entry);
                    if (found) break;
                }
            }
        }
        if (!found) {
            // Fall back to file handling
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        }
    } else {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }
});

// Recursively search a dropped directory for car.ini
async function searchDirectoryForCarINI(dirEntry) {
    return new Promise((resolve) => {
        const reader = dirEntry.createReader();
        reader.readEntries(async (entries) => {
            // First check this directory for car.ini
            for (const entry of entries) {
                if (entry.isFile && entry.name.toLowerCase() === 'car.ini') {
                    entry.file((file) => {
                        handleFile(file);
                        resolve(true);
                    });
                    return;
                }
            }
            // Then check subdirectories (look in 'data' folder etc.)
            for (const entry of entries) {
                if (entry.isDirectory) {
                    const found = await searchDirectoryForCarINI(entry);
                    if (found) { resolve(true); return; }
                }
            }
            resolve(false);
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
        if (file.name.endsWith('.ini')) {
            const text = await file.text();
            parseCarINI(text);
        } else if (file.name.endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            // Look for car.ini in the zip
            let carINIFound = false;
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (path.endsWith('car.ini') || path === 'car.ini') {
                    const text = await zipEntry.async('text');
                    parseCarINI(text);
                    carINIFound = true;
                    break;
                }
            }
            if (!carINIFound) {
                showStatus('No car.ini found in ZIP file', 'error');
            }
        } else {
            showStatus('Please select a car.ini file or ZIP containing car.ini', 'error');
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
