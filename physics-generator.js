// Physics Generator for AC Tires
// Generates LUT files and tyres.ini based on tire characteristics

class PhysicsGenerator {
    constructor(carMass = 1340) {
        this.carMass = carMass;
        this.massScale = carMass / 1340; // Reference car mass
        
        // Low HP reference curves - exact values from reference files
        this.LOW_HP_LAT_FRONT = [[0,10.000],[100,6.286],[200,3.781],[300,2.943],[400,2.521],[500,2.266],[600,2.095],[700,1.971],[800,1.876],[900,1.802],[1000,1.742],[1500,1.550],[2000,1.443],[2500,1.369],[3000,1.311],[3500,1.264],[4000,1.223],[4500,1.186],[5000,1.153],[5500,1.122],[6000,1.094],[6500,1.067],[7000,1.041],[7500,1.017],[8000,0.994],[8500,0.973],[9000,0.952],[9500,0.932],[10000,0.914],[10500,0.896],[11000,0.879],[11500,0.863],[12000,0.848],[12500,0.833],[13000,0.820],[13500,0.807],[14000,0.794],[14500,0.783],[15000,0.772],[15500,0.761],[16000,0.751],[16500,0.742],[17000,0.733],[17500,0.725],[18000,0.717],[18500,0.710],[19000,0.703],[19500,0.696],[20000,0.690],[20500,0.684],[21000,0.679],[21500,0.674],[22000,0.669],[22500,0.664],[23000,0.660],[23500,0.656],[24000,0.652],[24500,0.649],[25000,0.645],[25500,0.642],[26000,0.639],[26500,0.637],[27000,0.634],[27500,0.632],[28000,0.629],[28500,0.627],[29000,0.625],[29500,0.623],[30000,0.621],[30500,0.620],[31000,0.618],[31500,0.617],[32000,0.615],[32500,0.614],[33000,0.613],[33500,0.612],[34000,0.611],[34500,0.610],[35000,0.609],[35500,0.609],[36000,0.609],[36500,0.609],[37000,0.609],[37500,0.609],[38000,0.609],[38500,0.609],[39000,0.609],[39500,0.609],[40000,0.609]];
        
        this.LOW_HP_LAT_REAR = [[0,10.000],[100,6.326],[200,3.822],[300,2.985],[400,2.565],[500,2.311],[600,2.140],[700,2.017],[800,1.924],[900,1.851],[1000,1.792],[1500,1.606],[2000,1.504],[2500,1.435],[3000,1.384],[3500,1.342],[4000,1.306],[4500,1.275],[5000,1.247],[5500,1.221],[6000,1.197],[6500,1.175],[7000,1.154],[7500,1.134],[8000,1.116],[8500,1.098],[9000,1.081],[9500,1.066],[10000,1.051],[10500,1.036],[11000,1.023],[11500,1.010],[12000,0.998],[12500,0.987],[13000,0.976],[13500,0.965],[14000,0.955],[14500,0.946],[15000,0.937],[15500,0.929],[16000,0.921],[16500,0.914],[17000,0.907],[17500,0.900],[18000,0.894],[18500,0.888],[19000,0.883],[19500,0.878],[20000,0.873],[20500,0.868],[21000,0.864],[21500,0.860],[22000,0.856],[22500,0.852],[23000,0.849],[23500,0.846],[24000,0.843],[24500,0.840],[25000,0.837],[25500,0.835],[26000,0.832],[26500,0.830],[27000,0.828],[27500,0.826],[28000,0.824],[28500,0.823],[29000,0.821],[29500,0.819],[30000,0.818],[30500,0.817],[31000,0.815],[31500,0.814],[32000,0.813],[32500,0.812],[33000,0.811],[33500,0.810],[34000,0.809],[34500,0.808],[35000,0.808],[35500,0.808],[36000,0.808],[36500,0.808],[37000,0.808],[37500,0.808],[38000,0.808],[38500,0.808],[39000,0.808],[39500,0.808],[40000,0.808]];
        
        this.LOW_HP_CAMBER = [[-90,0.900],[-30,0.944],[-25,0.950],[-20,0.960],[-17,0.968],[-15,0.974],[-14,0.978],[-13,0.982],[-12,0.987],[-11,0.993],[-10,1.000],[-9,1.007],[-8,1.015],[-7,1.025],[-6,1.042],[-5,1.063],[-4,1.042],[-3,1.025],[-2,1.015],[-1,1.007],[0,1.000],[1,0.993],[2,0.987],[3,0.982],[5,0.974],[10,0.962],[15,0.953],[20,0.947],[25,0.942],[30,0.938],[90,0.900]];
        
        this.LOW_HP_CAMBER_SPRING = [[-10,0.900],[-8,0.930],[-6,0.957],[-5,0.969],[-4,0.979],[-3,0.987],[-2,0.993],[-1,0.998],[0,1.000],[1,0.998],[2,0.993],[3,0.987],[4,0.979],[5,0.969],[6,0.957],[8,0.930],[10,0.900]];
        
        this.LOW_HP_HEAT_LEVEL = [[0,0.578],[20,0.592],[60,0.626],[85,0.680],[100,0.731],[150,0.911],[200,1.142],[250,1.408],[300,1.768]];
        
        this.LOW_HP_HEAT_SPEED = [[0,11.5],[85,10.0],[300,6.0]];
        
        this.LOW_HP_TCURVE = [[0,0.80000],[30,0.9500],[60,1.0000],[90,1.0000],[120,0.996],[150,0.990],[180,0.984],[210,0.978],[240,0.977],[270,0.976],[300,0.975],[330,0.950],[360,0.925],[390,0.900],[420,0.800]];
        
        // Low HP wear curves - onset delayed so tires don't degrade before heating up
        // Hard: virtually no wear
        this.LOW_HP_WEAR_HARD = [[0,100],[5,100],[10,100],[20,100],[30,99.5],[40,99],[50,98.5],[60,98],[80,97],[100,96]];
        
        // Medium: gradual, feel it over a long session
        this.LOW_HP_WEAR_MEDIUM = [[0,100],[3,100],[6,100],[10,100],[15,99.5],[20,99],[30,98],[40,96],[50,93],[60,88],[75,80]];
        
        // Soft: noticeable after several laps, real degradation by end of session
        this.LOW_HP_WEAR_SOFT = [[0,100],[2,100],[4,100],[6,99.5],[10,99],[15,97],[20,93],[25,87],[30,80],[35,72],[40,65]];
    }
    
    isLowHPTire(tire) {
        return tire.tier === "lowHP";
    }

    // Generate lateral slip curve (load-dependent grip)
    generateLatSlipCurve(tire, isRear = false) {
        // Higher grip tires need more front/rear differentiation for driftability
        // Front gets slightly less grip relative to rear as overall grip increases
        const frSplit = isRear ? 1.0 : (1.0 - (tire.gripMultiplier - 0.80) * 0.08);
        const gripMult = tire.gripMultiplier * frSplit;
        const basePoints = [
            [0, 4.350],
            [1000, 2.255],
            [3000, 1.577],
            [5000, 1.373],
            [8000, 1.204],
            [12000, 1.082],
            [15000, 1.032],
            [20000, 0.988],
            [40000, 0.950]
        ];

        // Scale Y values by grip multiplier
        // Budget tires have steeper dropoff at high load
        const loadSensitivity = tire.treadwear > 300 ? 1.15 : 
                              tire.treadwear > 200 ? 1.08 : 
                              tire.treadwear > 100 ? 1.03 : 1.0;

        return basePoints.map(([load, value]) => {
            let scaledValue = value * gripMult;
            // Apply load sensitivity (higher loads lose more grip on budget tires)
            if (load > 5000) {
                const loadFactor = (load - 5000) / 35000;
                scaledValue *= (1 - loadFactor * (loadSensitivity - 1) * 0.15);
            }
            return [load, scaledValue.toFixed(3)];
        });
    }

    // Generate longitudinal slip curve (similar to lateral but slightly different)
    generateLongSlipCurve(tire, isRear = false) {
        const latCurve = this.generateLatSlipCurve(tire, isRear);
        // Long grip is typically slightly higher than lateral
        return latCurve.map(([load, value]) => [load, (parseFloat(value) * 1.02).toFixed(3)]);
    }

    // Generate camber curve
    generateCamberCurve(tire) {
        const peakAngle = tire.camberPeakAngle;
        const peakValue = tire.camberPeakValue;
        
        const points = [
            [-90, 0.250],
            [-30, 0.725],
            [-25, 0.770],
            [-20, 0.820],
            [-15, 0.880],
            [-10, 0.947],
            [-9, 0.963],
            [-8, 0.982],
            [-7, 1.005],
            [-6, 1.030],
            [-5, 1.065],
            [-4, 1.110],
            [-3, 1.068],
            [-2, 1.042],
            [-1, 1.019],
            [0, 1.000],
            [1, 0.983],
            [2, 0.967],
            [3, 0.952],
            [5, 0.926],
            [10, 0.870],
            [15, 0.820],
            [20, 0.770],
            [25, 0.725],
            [30, 0.685],
            [90, 0.250]
        ];

        // Adjust peak based on tire characteristics
        return points.map(([angle, value]) => {
            if (angle === peakAngle) {
                return [angle, peakValue.toFixed(3)];
            }
            // Scale values around peak
            const distFromPeak = Math.abs(angle - peakAngle);
            if (distFromPeak <= 2 && angle < 0) {
                const factor = 1 + (peakValue - 1.110) * (1 - distFromPeak / 2);
                return [angle, (value * factor).toFixed(3)];
            }
            return [angle, value.toFixed(3)];
        });
    }

    // Generate thermal/grip curve (temperature vs grip multiplier)
    generateHeatMuCurve(tire) {
        const coldGrip = tire.coldGrip;
        const optLow = tire.optimalTempLow;
        const optHigh = tire.optimalTempHigh;
        const overheat = tire.overheatDropoff;

        const points = [];
        
        // Cold temps
        points.push([0, coldGrip.toFixed(3)]);
        points.push([10, (coldGrip + 0.03).toFixed(3)]);
        points.push([20, (coldGrip + 0.06).toFixed(3)]);
        points.push([30, (coldGrip + 0.09).toFixed(3)]);
        
        // Coming up to optimal
        points.push([optLow - 20, (coldGrip + 0.10).toFixed(3)]);
        points.push([optLow - 10, 0.995]);
        points.push([optLow, 1.000]);
        
        // Optimal range
        points.push([Math.floor((optLow + optHigh) / 2), 1.000]);
        points.push([optHigh, 0.999]);
        
        // Overheating - gentler dropoff, wider usable window
        points.push([optHigh + 15, 0.993]);
        points.push([optHigh + 30, 0.985]);
        points.push([optHigh + 50, (overheat + 0.06).toFixed(3)]);
        points.push([optHigh + 80, (overheat + 0.03).toFixed(3)]);
        points.push([optHigh + 120, overheat.toFixed(3)]);
        points.push([optHigh + 160, (overheat - 0.03).toFixed(3)]);
        
        return points;
    }

    // Generate heat speed curve (how fast tire heats at different speeds)
    generateHeatSpeedCurve(tire) {
        const heatMult = tire.heatSpeed;
        const basePoints = [
            [0, 13.8],
            [100, 12.0],
            [200, 9.0],
            [300, 6.0],
            [400, 11.0]
        ];

        return basePoints.map(([speed, value]) => 
            [speed, (value * heatMult).toFixed(1)]
        );
    }

    // Generate heat level curve (placeholder - using reference)
    generateHeatLevelCurve() {
        return [
            [0, 1.00],
            [1, 1.00]
        ];
    }

    // Generate wear curve - progressive degradation you can feel
    generateWearCurve(tire) {
        const wearKm = tire.wearKm;
        // Budget tires (high treadwear) wear more linearly
        // Performance tires drop off harder at end of life
        const isBudget = tire.treadwear > 300;
        const isMidrange = tire.treadwear > 150;
        
        if (isBudget) {
            // Budget: gradual but noticeable decline
            return [
                [0.0, 100], [0.1, 100], [0.5, 99.5],
                [wearKm * 0.15, 99], [wearKm * 0.3, 98],
                [wearKm * 0.5, 96], [wearKm * 0.7, 92],
                [wearKm * 0.85, 85], [wearKm, 75],
                [wearKm * 1.1, 68]
            ];
        } else if (isMidrange) {
            // Midrange: holds well then drops
            return [
                [0.0, 100], [0.1, 100], [0.5, 100],
                [wearKm * 0.2, 99.5], [wearKm * 0.4, 98.5],
                [wearKm * 0.6, 96], [wearKm * 0.75, 90],
                [wearKm * 0.9, 80], [wearKm, 70],
                [wearKm * 1.05, 62]
            ];
        } else {
            // Performance: peaks then cliff
            return [
                [0.0, 98], [0.05, 99.5], [0.2, 100],
                [wearKm * 0.25, 100], [wearKm * 0.5, 98],
                [wearKm * 0.7, 93], [wearKm * 0.85, 82],
                [wearKm, 68], [wearKm * 1.05, 58]
            ];
        }
    }

    // Generate camber spring curve (symmetric, same for all tires)
    generateCamberSpringCurve() {
        return [
            [-90, 1.00],
            [-10, 1.00],
            [-5, 1.00],
            [0, 1.00],
            [5, 1.00],
            [10, 1.00],
            [90, 1.00]
        ];
    }

    // Format LUT file
    formatLUT(points, comment = null) {
        let output = '';
        if (comment) {
            output += `; ${comment}\n`;
        }
        points.forEach(([x, y]) => {
            output += `${x}\t|\t${y}\n`;
        });
        return output;
    }

    // Calculate width-dependent parameters with full tire size
    getWidthParams(widthMM, aspect, rimInches, isRear = false) {
        const widthM = widthMM / 1000;
        const rimRadiusM = (rimInches * 25.4 / 2) / 1000;
        const sidewallM = (widthMM * (aspect / 100)) / 1000;
        const radius = rimRadiusM + sidewallM;
        const widthDiffFrom235 = (widthMM - 235) / 10;
        
        return {
            width: widthM,
            radius: radius,
            rimRadius: rimRadiusM,
            angularInertia: 1.350 + (widthDiffFrom235 * 0.015),
            damp: 400 + (widthDiffFrom235 * 5),
            rate: 215000 + (widthDiffFrom235 * 5000),
            fz0: (isRear ? 3200 : 2800) * this.massScale,
            pressureSpringGain: 8600 + (widthDiffFrom235 * 100)
        };
    }

    // Generate complete tyres.ini section for one compound
    generateTyreINISection(tire, index, tireSize) {
        const frontParams = this.getWidthParams(tireSize.frontWidth, tireSize.frontAspect, tireSize.frontRim, false);
        const rearParams = this.getWidthParams(tireSize.rearWidth, tireSize.rearAspect, tireSize.rearRim, true);
        const tirePrefix = `tire${String(index + 1).padStart(2, '0')}`;

        const suffix = index === 0 ? '' : `_${index}`;
        return `
[FRONT${suffix}]
NAME=${tire.name}
SHORT_NAME=${tire.shortName}
WIDTH=${frontParams.width.toFixed(3)}
RADIUS=${frontParams.radius.toFixed(4)}
RIM_RADIUS=${frontParams.rimRadius.toFixed(4)}
ANGULAR_INERTIA=${(frontParams.angularInertia * (tire.gripMultiplier < 0.80 ? 1.15 : tire.gripMultiplier < 0.90 ? 1.08 : 1.0)).toFixed(3)}
DAMP=${frontParams.damp.toFixed(0)}
RATE=${frontParams.rate.toFixed(0)}
CAMBER_SPRING_MULT=${tirePrefix}_tire_camber_spring_k.lut
WEAR_CURVE=${tirePrefix}_tire_wear.lut
SPEED_SENSITIVITY=0.001
RELAXATION_LENGTH=${(frontParams.width * 0.30).toFixed(4)}
ROLLING_RESISTANCE_0=14.5
ROLLING_RESISTANCE_1=0.00025
ROLLING_RESISTANCE_SLIP=800
CAMBER_GAIN=${tire.camberGain.toFixed(3)}
DCAMBER_0=1.0
DCAMBER_1=-8
DCAMBER_LUT=${tirePrefix}_tire_camber_dy.lut
DCAMBER_LUT_SMOOTH=0
DX_CAMBER_REF=3
DX_CAMBER_MULT=0.98
FRICTION_LIMIT_ANGLE=${tire.peakSlipAngle.toFixed(2)}
CX_MULT=1.17
FLEX_GAIN=${tire.flexGain.toFixed(3)}
COMBINED_FACTOR=${tire.combinedFactor.toFixed(2)}
COMBINED_FACTOR_1=${tire.combinedFactor1.toFixed(2)}
COMBINED_FACTOR_BRAKE_MULT=1.00
COMBINED_FACTOR_LOAD_K=0.0
BRAKE_DX_MOD=0.017
PRESSURE_STATIC=24.0
PRESSURE_SPRING_GAIN=${frontParams.pressureSpringGain.toFixed(0)}
PRESSURE_FLEX_GAIN=-0.17
PRESSURE_RR_GAIN=0.60
PRESSURE_D_GAIN=0.0022
PRESSURE_IDEAL=${tire.pressureIdeal.toFixed(1)}
FZ0=${frontParams.fz0.toFixed(0)}
LS_EXPY=0
LS_EXPX=0
DY_REF=0
DX_REF=0
DY_CURVE=${tirePrefix}_sx2_lat.lut
DX_CURVE=${tirePrefix}_sx2_long.lut
FALLOFF_LEVEL_CURVE=${tirePrefix}_tire_heat_level.lut
FALLOFF_SPEED_CURVE=${tirePrefix}_tire_heat_speed.lut
FALLOFF_LEVEL=${tire.falloffLevel.toFixed(3)}
FALLOFF_SPEED=${tire.falloffSpeed.toFixed(1)}
DROPOFF_FACTOR_0=10.5
DROPOFF_FACTOR_1=1.00
FALLOFF_YSPEED_MULT=1.00
SAT_MULT=${tire.satMult.toFixed(2)}
SAT_SPEED=1.45
SAT_PEAK_K=0.50
SAT_MULT_K=0.052
SAT_MIN_REF=-0.052
SAT_LOAD_K=-0.0000032
SIDEWALL_K_MULT=1.00
SIDEWALL_K_MULT_X=2.00
RADIUS_ANGULAR_K=0.010
RADIUS_ANGULAR_K_2=0.021
ROLLING_RADIUS_MULT=0.42
XMU=0.00
DY0=0.00
DY1=0.00
DX0=0.00
DX1=0.00
FLEX=0.00

[REAR${suffix}]
NAME=${tire.name}
SHORT_NAME=${tire.shortName}
WIDTH=${rearParams.width.toFixed(3)}
RADIUS=${rearParams.radius.toFixed(4)}
RIM_RADIUS=${rearParams.rimRadius.toFixed(4)}
ANGULAR_INERTIA=${(rearParams.angularInertia * (tire.gripMultiplier < 0.80 ? 1.15 : tire.gripMultiplier < 0.90 ? 1.08 : 1.0)).toFixed(3)}
DAMP=${rearParams.damp.toFixed(0)}
RATE=${rearParams.rate.toFixed(0)}
CAMBER_SPRING_MULT=${tirePrefix}_tire_camber_spring_k.lut
WEAR_CURVE=${tirePrefix}_tire_wear.lut
SPEED_SENSITIVITY=0.001
RELAXATION_LENGTH=${(rearParams.width * 0.30).toFixed(4)}
ROLLING_RESISTANCE_0=14.5
ROLLING_RESISTANCE_1=0.00025
ROLLING_RESISTANCE_SLIP=800
CAMBER_GAIN=${tire.camberGain.toFixed(3)}
DCAMBER_0=1.0
DCAMBER_1=-8
DCAMBER_LUT=${tirePrefix}_tire_camber_dy.lut
DCAMBER_LUT_SMOOTH=0
DX_CAMBER_REF=3
DX_CAMBER_MULT=0.98
FRICTION_LIMIT_ANGLE=${(tire.peakSlipAngle + 0.3).toFixed(2)}
CX_MULT=1.17
FLEX_GAIN=${(tire.flexGain - 0.002).toFixed(3)}
COMBINED_FACTOR=${(tire.combinedFactor - 0.10).toFixed(2)}
COMBINED_FACTOR_1=${(tire.combinedFactor1 + 0.03).toFixed(2)}
COMBINED_FACTOR_BRAKE_MULT=1.00
COMBINED_FACTOR_LOAD_K=0.0
BRAKE_DX_MOD=0.019
PRESSURE_STATIC=16.0
PRESSURE_SPRING_GAIN=${rearParams.pressureSpringGain.toFixed(0)}
PRESSURE_FLEX_GAIN=-0.17
PRESSURE_RR_GAIN=0.60
PRESSURE_D_GAIN=0.0022
PRESSURE_IDEAL=${(tire.pressureIdeal + 2.0).toFixed(1)}
FZ0=${rearParams.fz0.toFixed(0)}
LS_EXPY=0
LS_EXPX=0
DY_REF=0
DX_REF=0
DY_CURVE=${tirePrefix}_sx2rs_lat.lut
DX_CURVE=${tirePrefix}_sx2rs_long.lut
FALLOFF_LEVEL_CURVE=${tirePrefix}_tire_heat_level.lut
FALLOFF_SPEED_CURVE=${tirePrefix}_tire_heat_speed.lut
FALLOFF_LEVEL=${tire.falloffLevel.toFixed(3)}
FALLOFF_SPEED=${tire.falloffSpeed.toFixed(1)}
DROPOFF_FACTOR_0=10.5
DROPOFF_FACTOR_1=1.00
FALLOFF_YSPEED_MULT=1.00
SAT_MULT=${tire.satMult.toFixed(2)}
SAT_SPEED=1.45
SAT_PEAK_K=0.50
SAT_MULT_K=0.052
SAT_MIN_REF=-0.052
SAT_LOAD_K=-0.0000032
SIDEWALL_K_MULT=1.00
SIDEWALL_K_MULT_X=2.00
RADIUS_ANGULAR_K=0.010
RADIUS_ANGULAR_K_2=0.021
ROLLING_RADIUS_MULT=0.42
XMU=0.00
DY0=0.00
DY1=0.00
DX0=0.00
DX1=0.00
FLEX=0.00

[THERMAL_FRONT${suffix}]
SURFACE_TRANSFER=${(1.35 * Math.max(tire.heatSpeed, 0.7)).toFixed(2)}
PATCH_TRANSFER=0.0035
CORE_TRANSFER=0.00018
INTERNAL_CORE_TRANSFER=0.0024
FRICTION_K=${(0.0110 + (1.10 - tire.gripMultiplier) * 0.002).toFixed(4)}
ROLLING_K=0.16
PERFORMANCE_CURVE=${tirePrefix}_tire_heat_mu.lut
GRAIN_GAMMA=1.2
GRAIN_GAIN=0.13
BLISTER_GAMMA=1.2
BLISTER_GAIN=0.13
COOL_FACTOR=2.8
SURFACE_ROLLING_K=0.045
TREAD_DEPTH=0.0060
BULK_HEIGHT=11.0
BEAD_WIDTH=14.0

[THERMAL_REAR${suffix}]
SURFACE_TRANSFER=${(0.80 * tire.heatSpeed).toFixed(2)}
PATCH_TRANSFER=0.0018
CORE_TRANSFER=0.00009
INTERNAL_CORE_TRANSFER=0.0013
FRICTION_K=${(0.0060 + (1.10 - tire.gripMultiplier) * 0.001).toFixed(4)}
ROLLING_K=0.09
PERFORMANCE_CURVE=${tirePrefix}_tire_heat_mu.lut
GRAIN_GAMMA=1.2
GRAIN_GAIN=0.10
BLISTER_GAMMA=1.2
BLISTER_GAIN=0.10
COOL_FACTOR=3.5
SURFACE_ROLLING_K=0.020
TREAD_DEPTH=0.0060
BULK_HEIGHT=10.8
BEAD_WIDTH=14.5

[THERMAL2_FRONT${suffix}]
CARCASS_ROLLING_K=0.170
SURFACE_TO_AMBIENT=0.0220
SURFACE_TO_CARCASS=0.0420
CARCASS_TO_SURFACE=0.210
CARCASS_TO_CORE=0.0075
CORE_TO_CARCASS=0.0020
CORE_TO_AMBIENT=0.0018
BRAKE_TO_CORE=0.000060
FRICTION_TEMP_K=1.02

[THERMAL2_REAR${suffix}]
CARCASS_ROLLING_K=0.095
SURFACE_TO_AMBIENT=0.0330
SURFACE_TO_CARCASS=0.0280
CARCASS_TO_SURFACE=0.140
CARCASS_TO_CORE=0.0045
CORE_TO_CARCASS=0.0012
CORE_TO_AMBIENT=0.0022
BRAKE_TO_CORE=0.000028
FRICTION_TEMP_K=1.02
`;
    }

    // ==========================================
    // LOW HP TIRE GENERATION (DeNofa-based physics)
    // ==========================================

    generateLowHPTyreINISection(tire, index, tireSize) {
        const frontParams = this.getWidthParams(tireSize.frontWidth, tireSize.frontAspect, tireSize.frontRim, false);
        const rearParams = this.getWidthParams(tireSize.rearWidth, tireSize.rearAspect, tireSize.rearRim, true);
        const tirePrefix = `tire${String(index + 1).padStart(2, '0')}`;
        const suffix = index === 0 ? '' : `_${index}`;

        return `
[FRONT${suffix}]
NAME=${tire.name}
SHORT_NAME=${tire.shortName}
WIDTH=${frontParams.width.toFixed(3)}
RADIUS=${frontParams.radius.toFixed(4)}
RIM_RADIUS=${frontParams.rimRadius.toFixed(4)}
ANGULAR_INERTIA=1.7
DAMP=500
RATE=255616
WEAR_CURVE=${tirePrefix}_tire_wear.lut
SPEED_SENSITIVITY=0.002
RELAXATION_LENGTH=0.071400
ROLLING_RESISTANCE_0=12
ROLLING_RESISTANCE_1=0.001
ROLLING_RESISTANCE_SLIP=6500
FLEX=0.0006
CAMBER_GAIN=0.16
DCAMBER_0=1
DCAMBER_1=-13
FRICTION_LIMIT_ANGLE=8.31
XMU=0.27
PRESSURE_STATIC=24
PRESSURE_SPRING_GAIN=5112
PRESSURE_FLEX_GAIN=0.035
PRESSURE_RR_GAIN=0.6
PRESSURE_D_GAIN=0.004
FZ0=2330
LS_EXPX=0.7900
LS_EXPY=0.7500
DX_REF=1.28
DY_REF=1.27
FLEX_GAIN=0.035
FALLOFF_LEVEL=0.8800
FALLOFF_SPEED=0.5
CX_MULT=1.0
RADIUS_ANGULAR_K=0.0198
BRAKE_DX_MOD=0.05
DCAMBER_LUT=${tirePrefix}_tire_camber_dy.lut
DY_CURVE=${tirePrefix}_lat_front.lut
DX_CURVE=${tirePrefix}_long_front.lut
CAMBER_SPRING_MULT=${tirePrefix}_tire_camber_spring_k.lut
FALLOFF_LEVEL_CURVE=${tirePrefix}_tire_heat_level.lut
FALLOFF_SPEED_CURVE=${tirePrefix}_tire_heat_speed.lut

[REAR${suffix}]
NAME=${tire.name}
SHORT_NAME=${tire.shortName}
WIDTH=${rearParams.width.toFixed(3)}
RADIUS=${rearParams.radius.toFixed(4)}
RIM_RADIUS=${rearParams.rimRadius.toFixed(4)}
ANGULAR_INERTIA=1.7
DAMP=500
RATE=255616
WEAR_CURVE=${tirePrefix}_tire_wear.lut
SPEED_SENSITIVITY=0.002
RELAXATION_LENGTH=0.071400
ROLLING_RESISTANCE_0=12
ROLLING_RESISTANCE_1=0.001
ROLLING_RESISTANCE_SLIP=6500
FLEX=0.0006
CAMBER_GAIN=0.16
DCAMBER_0=1
DCAMBER_1=-13
FRICTION_LIMIT_ANGLE=8.31
XMU=0.27
PRESSURE_STATIC=16
PRESSURE_SPRING_GAIN=5112
PRESSURE_FLEX_GAIN=0.035
PRESSURE_RR_GAIN=0.6
PRESSURE_D_GAIN=0.004
FZ0=2330
LS_EXPX=0.7900
LS_EXPY=0.7500
DX_REF=1.28
DY_REF=1.27
FLEX_GAIN=0.035
FALLOFF_LEVEL=0.8800
FALLOFF_SPEED=0.5
CX_MULT=1.0
RADIUS_ANGULAR_K=0.0198
BRAKE_DX_MOD=0.05
DCAMBER_LUT=${tirePrefix}_tire_camber_dy.lut
DY_CURVE=${tirePrefix}_lat_rear.lut
DX_CURVE=${tirePrefix}_long_rear.lut
CAMBER_SPRING_MULT=${tirePrefix}_tire_camber_spring_k.lut

[THERMAL_FRONT${suffix}]
SURFACE_TRANSFER=0.030
PATCH_TRANSFER=0.0010
CORE_TRANSFER=0.000855
INTERNAL_CORE_TRANSFER=0.015
FRICTION_K=0.072858
ROLLING_K=0.15
PERFORMANCE_CURVE=${tirePrefix}_tire_heat_mu.lut
GRAIN_GAMMA=1
GRAIN_GAIN=0
BLISTER_GAMMA=1
BLISTER_GAIN=0
COOL_FACTOR=5
SURFACE_ROLLING_K=4

[THERMAL_REAR${suffix}]
SURFACE_TRANSFER=0.009
PATCH_TRANSFER=0.00025
CORE_TRANSFER=0.000855
INTERNAL_CORE_TRANSFER=0.015
FRICTION_K=0.072858
ROLLING_K=0.15
PERFORMANCE_CURVE=${tirePrefix}_tire_heat_mu.lut
GRAIN_GAMMA=1
GRAIN_GAIN=0
BLISTER_GAMMA=1
BLISTER_GAIN=0
COOL_FACTOR=5
SURFACE_ROLLING_K=4

[THERMAL2_FRONT${suffix}]
CARCASS_ROLLING_K=0.20
BRAKE_TO_CORE=0.000025
SURFACE_TO_AMBIENT=0.022
SURFACE_TO_CARCASS=0.040
CARCASS_TO_SURFACE=0.37
CARCASS_TO_CORE=0.0045
CORE_TO_CARCASS=0.0010
CORE_TO_AMBIENT=0.0020
FLEX_SPEED_COEFF=0.50
FRICTION_TEMP_K=0.92

[THERMAL2_REAR${suffix}]
CARCASS_ROLLING_K=0.22
BRAKE_TO_CORE=0.000025
SURFACE_TO_AMBIENT=0.022
SURFACE_TO_CARCASS=0.040
CARCASS_TO_SURFACE=0.37
CARCASS_TO_CORE=0.0045
CORE_TO_CARCASS=0.0010
CORE_TO_AMBIENT=0.0020
FLEX_SPEED_COEFF=0.52
FRICTION_TEMP_K=0.95
`;
    }

    generateLowHPLUTFiles(tire, index) {
        const tirePrefix = `tire${String(index + 1).padStart(2, '0')}`;
        const files = {};

        // Front and rear use the SAME lateral curve (matching DeNofa reference)
        // Reference tyres.ini uses identical DY_CURVE for both axles
        files[`${tirePrefix}_lat_front.lut`] = this.formatLUT(this.LOW_HP_LAT_FRONT);
        files[`${tirePrefix}_lat_rear.lut`] = this.formatLUT(this.LOW_HP_LAT_FRONT);

        // Longitudinal = lateral * 1.02
        files[`${tirePrefix}_long_front.lut`] = this.formatLUT(
            this.LOW_HP_LAT_FRONT.map(([load, val]) => [load, (val * 1.02).toFixed(3)])
        );
        files[`${tirePrefix}_long_rear.lut`] = this.formatLUT(
            this.LOW_HP_LAT_FRONT.map(([load, val]) => [load, (val * 1.02).toFixed(3)])
        );

        // Camber
        files[`${tirePrefix}_tire_camber_dy.lut`] = this.formatLUT(this.LOW_HP_CAMBER);
        files[`${tirePrefix}_tire_camber_spring_k.lut`] = this.formatLUT(this.LOW_HP_CAMBER_SPRING);

        // Thermal
        files[`${tirePrefix}_tire_heat_mu.lut`] = this.formatLUT(this.LOW_HP_TCURVE, `${tire.name} thermal curve`);
        files[`${tirePrefix}_tire_heat_level.lut`] = this.formatLUT(this.LOW_HP_HEAT_LEVEL);
        files[`${tirePrefix}_tire_heat_speed.lut`] = this.formatLUT(this.LOW_HP_HEAT_SPEED);

        // Wear curve - select based on compound
        const wearMap = {
            'hard': this.LOW_HP_WEAR_HARD,
            'medium': this.LOW_HP_WEAR_MEDIUM,
            'soft': this.LOW_HP_WEAR_SOFT
        };
        const wearCurve = wearMap[tire.compound] || this.LOW_HP_WEAR_HARD;
        files[`${tirePrefix}_tire_wear.lut`] = this.formatLUT(wearCurve, `${tire.name} wear curve`);

        return files;
    }

    // ==========================================
    // STREET/COMP TIRE GENERATION (original physics)
    // ==========================================

    // Generate all LUT files for a tire
    generateLUTFiles(tire, index) {
        const tirePrefix = `tire${String(index + 1).padStart(2, '0')}`;
        const files = {};

        // Slip curves
        files[`${tirePrefix}_sx2_lat.lut`] = this.formatLUT(
            this.generateLatSlipCurve(tire, false)
        );
        files[`${tirePrefix}_sx2_long.lut`] = this.formatLUT(
            this.generateLongSlipCurve(tire, false)
        );
        files[`${tirePrefix}_sx2rs_lat.lut`] = this.formatLUT(
            this.generateLatSlipCurve(tire, true)
        );
        files[`${tirePrefix}_sx2rs_long.lut`] = this.formatLUT(
            this.generateLongSlipCurve(tire, true)
        );

        // Camber curves
        files[`${tirePrefix}_tire_camber_dy.lut`] = this.formatLUT(
            this.generateCamberCurve(tire)
        );
        files[`${tirePrefix}_tire_camber_spring_k.lut`] = this.formatLUT(
            this.generateCamberSpringCurve()
        );

        // Thermal curves
        files[`${tirePrefix}_tire_heat_mu.lut`] = this.formatLUT(
            this.generateHeatMuCurve(tire),
            `${tire.name} thermal curve`
        );
        files[`${tirePrefix}_tire_heat_speed.lut`] = this.formatLUT(
            this.generateHeatSpeedCurve(tire)
        );
        files[`${tirePrefix}_tire_heat_level.lut`] = this.formatLUT(
            this.generateHeatLevelCurve()
        );

        // Wear curve
        files[`${tirePrefix}_tire_wear.lut`] = this.formatLUT(
            this.generateWearCurve(tire),
            `${tire.name} wear curve`
        );

        return files;
    }
}
