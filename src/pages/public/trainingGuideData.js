import menMuscleImage from '../../assets/training-guides/men-muscle-building.webp';
import menWeightLossImage from '../../assets/training-guides/men-weight-loss.webp';
import womenWeightLossImage from '../../assets/training-guides/women-weight-loss.webp';
import womenFitnessImage from '../../assets/training-guides/women-fitness.webp';

const balancedMeals = [
  ['Monday', '2 eggs + whole-wheat roti + seasonal fruit', 'Chicken or chana salad + raita', 'Dahi or roasted chana', 'Daal + mixed sabzi + 1–2 rotis'],
  ['Tuesday', 'Oats in milk with banana and cinnamon', 'Chicken tikka + rice + cucumber salad', 'Apple or guava + 8–10 almonds', 'Fish + sautéed vegetables + roti'],
  ['Wednesday', 'Besan chilla + dahi', 'Daal chawal + kachumber salad', 'Unsweetened lassi', 'Chicken karahi with less oil + roti + salad'],
  ['Thursday', 'Egg omelette with vegetables + roti', 'Rajma or lobia + rice + raita', 'Seasonal fruit', 'Grilled chicken + sabzi + roti'],
  ['Friday', 'Dahi bowl with oats, fruit, and seeds', 'Fish or chicken + roti + salad', 'Roasted chana or a boiled egg', 'Moong daal khichdi + raita'],
  ['Saturday', '2 eggs + paratha cooked with minimal oil + dahi', 'Homemade chicken pulao + salad', 'Fruit chaat without sugar', 'Daal + bhindi/tori/lauki + roti'],
  ['Sunday', 'Chana chaat + egg', 'Family meal: use one plate, prioritise protein and salad', 'Tea without sugar + nuts', 'Light chicken/vegetable soup + roti'],
];

const muscleMeals = [
  ['Monday', '3 eggs + 2 rotis + milk + banana', 'Chicken + rice + salad + raita', 'Dahi + fruit + peanuts', 'Daal + beef/chicken + 2 rotis + sabzi'],
  ['Tuesday', 'Oats in milk + banana + 2 eggs', 'Chicken pulao + raita + salad', 'Roasted chana + lassi without sugar', 'Fish + rice/roti + vegetables'],
  ['Wednesday', 'Besan chilla + 2 eggs + dahi', 'Daal chawal + chicken tikka + salad', 'Banana milk smoothie without added sugar', 'Keema + peas + 2 rotis + raita'],
  ['Thursday', '3-egg vegetable omelette + 2 rotis', 'Rajma + rice + dahi', 'Fruit + handful of nuts', 'Chicken karahi with less oil + 2 rotis + salad'],
  ['Friday', 'Dahi + oats + fruit + 2 boiled eggs', 'Fish + rice + vegetables', 'Roasted chana + milk', 'Daal + chicken + 2 rotis'],
  ['Saturday', 'Eggs + homemade paratha with controlled oil + dahi', 'Chicken biryani/pulao + salad; moderate oil', 'Banana + peanuts', 'Lobia + rice + raita'],
  ['Sunday', 'Chana + eggs + roti', 'Family meal: double protein serving, add salad', 'Dahi + seasonal fruit', 'Grilled chicken + potato + vegetables'],
];

const weightLossMeals = balancedMeals.map(([day, breakfast, lunch, snack, dinner]) => [
  day,
  breakfast,
  lunch.replace('1–2 rotis', '1 roti'),
  snack,
  dinner.replace('1–2 rotis', '1 roti'),
]);

export const trainingGuides = [
  {
    slug: 'men-muscle-shape', audience: 'Men · 18+', title: 'Muscle & Shape Building', shortTitle: 'Men’s Muscle Building', image: menMuscleImage,
    intro: 'A four-day hypertrophy-focused strength structure with two lighter recovery days. Add weight or repetitions gradually while keeping technique controlled.',
    goal: 'Build muscle, improve proportions, and develop foundational strength.',
    nutrition: 'Start with regular balanced meals and a protein source at each meal. The sample portions suit an active adult, but energy needs vary—use the calorie and protein calculators to personalise them.',
    days: [
      ['Monday', 'Push · Chest, shoulders, triceps', 'Bench press 4×6–10; incline dumbbell press 3×8–12; shoulder press 3×8–12; lateral raise 3×12–15; triceps pressdown 3×10–15', '8–10 min easy cardio'],
      ['Tuesday', 'Pull · Back and biceps', 'Lat pulldown 4×8–12; seated row 3×8–12; one-arm dumbbell row 3×10/side; face pull 3×12–15; curls 3×10–15', 'Core: plank 3×30–45 sec'],
      ['Wednesday', 'Active recovery', '25–35 min brisk walk; hip, shoulder, and ankle mobility', 'Keep the pace conversational'],
      ['Thursday', 'Legs · Quads and hamstrings', 'Squat or leg press 4×6–10; Romanian deadlift 3×8–12; split squat 3×10/side; leg curl 3×10–15; calf raise 3×12–20', 'Light stretching'],
      ['Friday', 'Upper · Shape and volume', 'Incline press 3×10; chest-supported row 3×10; pulldown 3×10; lateral raise 4×12–15; rear-delt fly 3×15; biceps + triceps 3×12 each', 'Stop with 1–3 reps in reserve'],
      ['Saturday', 'Lower + conditioning', 'Hip thrust 3×8–12; goblet squat 3×12; walking lunge 3×10/side; leg curl 3×12', '10–15 min bike or incline walk'],
      ['Sunday', 'Rest', 'Full rest or an easy walk', 'Prepare meals and track next week’s lifts'],
    ],
    meals: muscleMeals,
  },
  {
    slug: 'men-weight-loss', audience: 'Men · 18+', title: 'Sustainable Weight Loss', shortTitle: 'Men’s Weight Loss', image: menWeightLossImage,
    intro: 'A joint-friendly combination of full-body strength and progressive cardio designed to preserve muscle while increasing weekly activity.',
    goal: 'Reduce body weight gradually while maintaining strength, energy, and consistency.',
    nutrition: 'Build meals around vegetables, pulses or lean protein, and controlled portions of roti or rice. Avoid liquid calories most days and aim for gradual—not crash—weight loss.',
    days: [
      ['Monday', 'Full body A', 'Goblet squat 3×10; chest press 3×10; pulldown 3×10; Romanian deadlift 3×10; plank 3×30 sec', '15 min incline walk'],
      ['Tuesday', 'Steady cardio', '35–45 min brisk walk, cycle, or cross-trainer', 'Comfortably challenging pace'],
      ['Wednesday', 'Full body B', 'Leg press 3×12; seated row 3×10; dumbbell shoulder press 3×10; hip thrust 3×12; farmer carry 4 rounds', '10 min easy cardio'],
      ['Thursday', 'Recovery + steps', '20–30 min easy walk and mobility', 'Build daily movement; avoid all-or-nothing thinking'],
      ['Friday', 'Strength circuit', 'Step-up, push-up/chest press, cable row, kettlebell deadlift, bike: 3–4 rounds of 40 sec work / 20 sec transition', 'Keep technique clean'],
      ['Saturday', 'Long cardio', '45–60 min walk, hike, cycle, or swimming', 'Moderate pace'],
      ['Sunday', 'Rest', 'Full rest or a relaxed family walk', 'Plan food and schedule workouts'],
    ],
    meals: weightLossMeals,
  },
  {
    slug: 'women-weight-loss', audience: 'Women · 18+', title: 'Strength-Led Weight Loss', shortTitle: 'Women’s Weight Loss', image: womenWeightLossImage,
    intro: 'Full-body resistance training plus moderate cardio supports sustainable fat loss without relying on punishing daily workouts.',
    goal: 'Improve strength and fitness while pursuing gradual, sustainable weight loss.',
    nutrition: 'Use regular meals rich in vegetables, daal, chana, dahi, eggs, chicken, or fish. Portions—not removing all roti or rice—are the main adjustment.',
    days: [
      ['Monday', 'Full body strength', 'Goblet squat 3×10; chest press 3×10; seated row 3×10; hip thrust 3×12; dead bug 3×8/side', '12 min incline walk'],
      ['Tuesday', 'Cardio + mobility', '30–40 min brisk walk, cycle, or aerobics', '10 min hips and shoulders mobility'],
      ['Wednesday', 'Lower body strength', 'Leg press 3×10; Romanian deadlift 3×10; reverse lunge 3×8/side; leg curl 3×12; calf raise 3×15', 'Keep 2 reps in reserve'],
      ['Thursday', 'Active recovery', '20–30 min comfortable walk plus gentle stretching', 'Prioritise sleep and hydration'],
      ['Friday', 'Upper body + core', 'Pulldown 3×10; dumbbell press 3×10; cable row 3×10; lateral raise 3×12; Pallof press 3×10/side', '10 min easy cardio'],
      ['Saturday', 'Aerobics or circuit', '30–45 min coached aerobics, or 3 rounds: step-up, squat to bench, row, bike, farmer carry', 'Moderate intensity'],
      ['Sunday', 'Rest', 'Rest or an easy walk', 'Review progress by habits, strength, and measurements—not scale alone'],
    ],
    meals: weightLossMeals,
  },
  {
    slug: 'women-fitness', audience: 'Women · 18+', title: 'Fitness, Strength & Energy', shortTitle: 'Women’s Fitness', image: womenFitnessImage,
    intro: 'A balanced week combining strength, aerobic fitness, mobility, and recovery for general health and everyday performance.',
    goal: 'Build full-body fitness, confidence, mobility, and lasting training habits.',
    nutrition: 'A flexible Pakistani plate works well: include a protein source, vegetables or fruit, roti/rice, and dahi or milk across the day.',
    days: [
      ['Monday', 'Full body foundation', 'Squat to bench 3×10; chest press 3×10; pulldown 3×10; hip hinge 3×10; plank 3×20–40 sec', 'Easy 10 min walk'],
      ['Tuesday', 'Aerobic fitness', '30–40 min aerobics, brisk walk, cycling, or cross-trainer', 'Finish with calf and hip stretches'],
      ['Wednesday', 'Lower body + balance', 'Leg press 3×10; hip thrust 3×12; reverse lunge 3×8/side; leg curl 3×12; single-leg balance 3×20 sec', 'Controlled tempo'],
      ['Thursday', 'Mobility and recovery', '20–30 min mobility or gentle yoga-style session', 'Optional relaxed walk'],
      ['Friday', 'Upper body + posture', 'Seated row 3×10; shoulder press 3×10; pulldown 3×10; face pull 3×12; curls + pressdowns 2×12', 'Core: bird dog 3×8/side'],
      ['Saturday', 'Fun conditioning', 'Coached circuit, aerobics, dance fitness, or 35–45 min mixed cardio', 'Choose something enjoyable'],
      ['Sunday', 'Rest', 'Rest and normal daily movement', 'Prepare for the next week'],
    ],
    meals: balancedMeals,
  },
];

export const findTrainingGuide = (slug) => trainingGuides.find((guide) => guide.slug === slug);
