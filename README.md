# AC Tire Creator

A web-based tool for generating realistic Assetto Corsa tire physics packs with multiple compounds.

## Features

- **17 unique tire compounds** based on real drift tires
- **Street Pack** (10 tires): Budget-friendly to mid-tier street tires
- **Competition Pack** (7 tires): Pro-level competition compounds
- **Realistic physics**: Each tire has unique grip, thermal, wear, and camber characteristics
- **Car-specific tuning**: Reads your car's mass from car.ini for accurate physics
- **Customizable widths**: Front and rear widths from 185-305mm in 5mm increments
- **Single or multi-compound**: Generate one tire or entire packs

## How to Use

1. **Open index.html** in any modern web browser
2. **Upload your car.ini** (drag & drop or click to select)
   - Accepts car.ini directly, or a ZIP file containing it
   - Extracts TOTALMASS for accurate physics scaling
3. **Select tire widths** for front and rear (e.g., 235mm front, 265mm rear)
4. **Choose tire pack(s)**:
   - Street Tires (10 compounds)
   - Competition Tires (7 compounds)
   - Both packs together (17 compounds!)
5. **Optional**: Check "Select single tireset only" to pick just one tire
6. **Select default tire** that will be active when the car loads
7. **Click "Generate Tire Pack"**
8. **Extract the ZIP** to your AC car folder

## Output

Generates a ZIP file containing:
- `data/tyres.ini` - Complete tire physics configuration
- `data/tire01_*.lut` through `data/tireXX_*.lut` - Individual LUT files for each compound

Each tire includes:
- VERSION=11 extended physics
- THERMAL_MODEL VERSION=2
- Unique slip curves (lateral/longitudinal)
- Camber sensitivity curves
- Thermal/grip curves
- Wear curves
- Heat generation curves

## Tire Characteristics

Each of the 17 tires has been tuned based on real-world drift tire data:

### Street Pack (Budget to Mid-Tier)
1. **Kenda Vezda KR20A** - Balanced mid-tier, good for learning
2. **Accelera 351 Sport GD** - Ultra-budget smoke machine
3. **Accelera 651 Sport** - Budget performance
4. **GT Radial SX2 RS** - Best overall grassroots (reference tire)
5. **Valino Pergea 08RS** - Competition-level grip
6. **Nankang NS-2R** - Most progressive, ideal for learning
7. **Federal 595RS-RR** - Snappy, temperature sensitive
8. **Nitto NT555RII** - Low grip, long life, street-friendly
9. **Toyo R888R** - Very high grip, racing tire
10. **Ironman iMove Gen 2** - Lowest grip, longest life, maximum smoke

### Competition Pack (Pro-Level)
11. **GT Radial SX2 RS (Pro)** - Pro-am bridge tire
12. **Kenda Competition** - Formula Drift proven
13. **Nitto NT555 G2** - Street performance upgraded
14. **Kumho Ecsta V730** - Autocross crossover
15. **Falken RT615K+** - Balanced performance
16. **Federal RS-Pro** - Aggressive pro compound
17. **Bridgestone RE-71RS** - Maximum grip, grip-focused

## Technical Details

- **Physics generator**: Based on reference Kenda tire (VERSION=11 extended physics)
- **Tire differentiation**: Each tire has unique:
  - Grip multipliers (0.72x to 1.13x)
  - Peak slip angles (6.3° to 9.2°)
  - Thermal windows (cold grip, optimal range, overheat behavior)
  - Camber sensitivity (peak angles and gains)
  - Wear characteristics (life multipliers, km before dropoff)
  - Heat generation rates
  - Combined grip factors
  - Self-aligning torque characteristics

- **Width scaling**: Automatically calculates:
  - Radius (35 aspect ratio, 18" rim default)
  - Angular inertia
  - Spring rates
  - Damping
  - FZ0 (nominal load)
  - Pressure spring gain

- **Mass scaling**: Adjusts FZ0 based on car weight vs 1340kg reference

## Files

- `index.html` - Main application
- `style.css` - Dark theme styling
- `tire-data.js` - Tire database with 17 compound definitions
- `physics-generator.js` - Physics calculation and LUT generation
- `app.js` - UI logic and ZIP generation

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- JSZip library (loaded from CDN)

## Credits

Tire data compiled from:
- Real-world UTQG ratings
- Grassroots and professional drifter feedback
- Community forums (Reddit r/drifting, Zilvia, DriftingCom)
- Formula Drift and regional competition data

Physics based on Kenda reference tire files (VERSION=11 extended physics).

---

**No installation required** - just open index.html and start creating!
