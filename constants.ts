
import { Chapter, ChapterStatus, Question } from './types';

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    subject: 'Physics',
    chapterId: 'phys_01',
    text: 'A physical quantity of the dimensions of length that can be formed out of c, G and e^2/(4πε₀) is [c is velocity of light, G is universal constant of gravitation and e is charge]:',
    options: [
      'c² [G e² / 4πε₀ ]^1/2',
      '1/c² [G e² / 4πε₀ ]^1/2',
      '1/c² [G e² / 4πε₀ ]',
      'c² [G e² / 4πε₀ ]'
    ],
    correctAnswer: 1
  },
  {
    id: 'q2',
    subject: 'Physics',
    chapterId: 'phys_01',
    text: 'The density of a material in SI units is 128 kg/m³. In certain units in which the unit of length is 25 cm and the unit of mass is 50 g, the numerical value of density of the material is:',
    options: ['40', '16', '640', '410'],
    correctAnswer: 0
  },
  {
    id: 'q3',
    subject: 'Physics',
    chapterId: 'phys_01',
    text: 'Percentage error in measurement of mass and speed are 2% and 3% respectively. The error in estimate of kinetic energy obtained by measuring mass and speed will be:',
    options: ['8%', '2%', '12%', '10%'],
    correctAnswer: 0
  },
  {
    id: 'q4',
    subject: 'Physics',
    chapterId: 'phys_01',
    text: 'Which of the following is the most precise device for measuring length?',
    options: [
      'Vernier callipers with 20 divisions on sliding scale',
      'Screw gauge of pitch 1mm and 100 divisions on circular scale',
      'Optical instrument that can measure length to within a wavelength of light',
      'Meter scale'
    ],
    correctAnswer: 2
  }
];

const UNITS_AND_MEASUREMENTS_NOTES = `
# CHAPTER 1: UNITS AND MEASUREMENTS

## 1. Introduction to Physical Quantities
Physical quantities are the properties of an object or system that can be measured and expressed in numbers. These are divided into Fundamental and Derived quantities. 
Fundamental quantities like mass, length, and time are independent, while derived quantities like velocity and force are built from fundamental ones.

## 2. The International System of Units (SI)
The SI system is the modern form of the metric system. It is based on 7 base units:
1. **Meter (m):** Length
2. **Kilogram (kg):** Mass
3. **Second (s):** Time
4. **Ampere (A):** Electric Current
5. **Kelvin (K):** Temperature
6. **Mole (mol):** Amount of Substance
7. **Candela (cd):** Luminous Intensity

## 3. Dimensional Analysis (Core JEE Topic)
Dimensions are the powers to which fundamental units are raised to express a physical quantity.
- **Velocity:** [L T⁻¹]
- **Force:** [M L T⁻²]
- **Work/Energy:** [M L² T⁻²]
- **Universal Gravitational Constant (G):** [M⁻¹ L³ T⁻²]

### 3.1 Principles of Homogeneity
The dimensions of each term of a physical equation on both sides should be the same. This is used to check correctness and derive new formulae.

## 4. Errors in Measurement
No measurement is absolute. Error = True Value - Measured Value.
- **Absolute Error:** Magnitude of difference.
- **Relative Error:** Absolute error / True value.
- **Percentage Error:** Relative error × 100.

### 4.1 Propagation of Errors
- **Addition/Subtraction:** ΔZ = ΔA + ΔB
- **Multiplication/Division:** ΔZ/Z = ΔA/A + ΔB/B
- **Power Rule:** If Z = Aⁿ, then ΔZ/Z = n(ΔA/A)

## 5. Significant Figures
Digits known reliably plus the first uncertain digit.
- Non-zero digits are always significant.
- Zeros between non-zeros are significant.
- Leading zeros are never significant.
- Trailing zeros in decimal numbers are significant.

## 6. Measuring Instruments
- **Vernier Callipers:** Least count = 1 MSD - 1 VSD.
- **Screw Gauge:** Least count = Pitch / No. of circular scale divisions. Zero error correction is vital for JEE numericals.

## 7. Numerical Strategy for JEE
Always check dimensions first in MCQ options. Eliminate dimensionally incorrect options. In error analysis, focus on the term with the highest power as it contributes most to the percentage error.
`;

const createEmptyChapter = (id: string, name: string, subject: 'Physics' | 'Chemistry' | 'Mathematics'): Omit<Chapter, 'userId'> => ({
  id,
  name,
  description: `Fundamental concepts and advanced applications of ${name} in the context of IIT JEE.`,
  subject,
  status: ChapterStatus.NOT_STARTED,
  confidence: 0,
  videoLinks: [],
  questions: [],
  attempts: [],
  notes: '',
  timeSpentMinutes: 0,
  videosWatchedMinutes: 0,
  questionsSolvedCount: 0
});

export const INITIAL_CHAPTERS: Omit<Chapter, 'userId'>[] = [
  // PHYSICS (20 Units)
  { 
    ...createEmptyChapter('phys_01', 'Units and Measurements', 'Physics'),
    notes: UNITS_AND_MEASUREMENTS_NOTES,
    questions: SAMPLE_QUESTIONS,
    videoLinks: [{ id: 'v_p1_1', title: 'Complete Units & Dimensions Lecture', url: 'https://www.youtube.com/watch?v=kYI9M0A7bQU' }]
  },
  createEmptyChapter('phys_02', 'Kinematics', 'Physics'),
  createEmptyChapter('phys_03', 'Laws of Motion', 'Physics'),
  createEmptyChapter('phys_04', 'Work, Energy and Power', 'Physics'),
  createEmptyChapter('phys_05', 'Rotational Motion', 'Physics'),
  createEmptyChapter('phys_06', 'Gravitation', 'Physics'),
  createEmptyChapter('phys_07', 'Properties of Solids and Liquids', 'Physics'),
  createEmptyChapter('phys_08', 'Thermodynamics', 'Physics'),
  createEmptyChapter('phys_09', 'Kinetic Theory of Gases', 'Physics'),
  createEmptyChapter('phys_10', 'Oscillations and Waves', 'Physics'),
  createEmptyChapter('phys_11', 'Electrostatics', 'Physics'),
  createEmptyChapter('phys_12', 'Current Electricity', 'Physics'),
  createEmptyChapter('phys_13', 'Magnetic Effects of Current and Magnetism', 'Physics'),
  createEmptyChapter('phys_14', 'Electromagnetic Induction and Alternating Currents', 'Physics'),
  createEmptyChapter('phys_15', 'Electromagnetic Waves', 'Physics'),
  createEmptyChapter('phys_16', 'Optics', 'Physics'),
  createEmptyChapter('phys_17', 'Dual Nature of Matter and Radiation', 'Physics'),
  createEmptyChapter('phys_18', 'Atoms and Nuclei', 'Physics'),
  createEmptyChapter('phys_19', 'Electronic Devices', 'Physics'),
  createEmptyChapter('phys_20', 'Experimental Skills', 'Physics'),

  // CHEMISTRY (20 Units)
  createEmptyChapter('chem_01', 'Some Basic Concepts in Chemistry', 'Chemistry'),
  createEmptyChapter('chem_02', 'Atomic Structure', 'Chemistry'),
  createEmptyChapter('chem_03', 'Chemical Bonding and Molecular Structure', 'Chemistry'),
  createEmptyChapter('chem_04', 'Chemical Thermodynamics', 'Chemistry'),
  createEmptyChapter('chem_05', 'Solutions', 'Chemistry'),
  createEmptyChapter('chem_06', 'Equilibrium', 'Chemistry'),
  createEmptyChapter('chem_07', 'Redox Reactions and Electrochemistry', 'Chemistry'),
  createEmptyChapter('chem_08', 'Chemical Kinetics', 'Chemistry'),
  createEmptyChapter('chem_09', 'Classification of Elements and Periodicity in Properties', 'Chemistry'),
  createEmptyChapter('chem_10', 'p-Block Elements', 'Chemistry'),
  createEmptyChapter('chem_11', 'd- and f-Block Elements', 'Chemistry'),
  createEmptyChapter('chem_12', 'Coordination Compounds', 'Chemistry'),
  createEmptyChapter('chem_13', 'Purification and Characterisation of Organic Compounds', 'Chemistry'),
  createEmptyChapter('chem_14', 'Some Basic Principles of Organic Chemistry', 'Chemistry'),
  createEmptyChapter('chem_15', 'Hydrocarbons', 'Chemistry'),
  createEmptyChapter('chem_16', 'Organic Compounds Containing Halogens', 'Chemistry'),
  createEmptyChapter('chem_17', 'Organic Compounds Containing Oxygen', 'Chemistry'),
  createEmptyChapter('chem_18', 'Organic Compounds Containing Nitrogen', 'Chemistry'),
  createEmptyChapter('chem_19', 'Biomolecules', 'Chemistry'),
  createEmptyChapter('chem_20', 'Principles Related to Practical Chemistry', 'Chemistry'),

  // MATHEMATICS (14 Units)
  createEmptyChapter('math_01', 'Sets, Relations and Functions', 'Mathematics'),
  createEmptyChapter('math_02', 'Complex Numbers and Quadratic Equations', 'Mathematics'),
  createEmptyChapter('math_03', 'Matrices and Determinants', 'Mathematics'),
  createEmptyChapter('math_04', 'Permutations and Combinations', 'Mathematics'),
  createEmptyChapter('math_05', 'Binomial Theorem and its Simple Applications', 'Mathematics'),
  createEmptyChapter('math_06', 'Sequence and Series', 'Mathematics'),
  createEmptyChapter('math_07', 'Limit, Continuity and Differentiability', 'Mathematics'),
  createEmptyChapter('math_08', 'Integral Calculus', 'Mathematics'),
  createEmptyChapter('math_09', 'Differential Equations', 'Mathematics'),
  createEmptyChapter('math_10', 'Co-ordinate Geometry', 'Mathematics'),
  createEmptyChapter('math_11', 'Three Dimensional Geometry', 'Mathematics'),
  createEmptyChapter('math_12', 'Vector Algebra', 'Mathematics'),
  createEmptyChapter('math_13', 'Statistics and Probability', 'Mathematics'),
  createEmptyChapter('math_14', 'Trigonometry', 'Mathematics'),
];
