import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Beef, Calculator, ChevronRight, Droplets, Dumbbell, Flame, Gauge, HeartPulse, Scale, Target, Timer, Weight, X } from 'lucide-react';

const calculators = [
  { id: 'bmi', title: 'BMI Calculator', group: 'Body', copy: 'Check your body-mass index and general weight range.', icon: Scale },
  { id: 'calories', title: 'Calorie & TDEE', group: 'Nutrition', copy: 'Estimate maintenance, fat-loss, and muscle-gain calories.', icon: Flame },
  { id: 'macros', title: 'Macro Calculator', group: 'Nutrition', copy: 'Split daily calories into protein, carbs, and fats.', icon: Calculator },
  { id: 'protein', title: 'Protein Calculator', group: 'Nutrition', copy: 'Estimate a daily protein range for your training goal.', icon: Beef },
  { id: 'water', title: 'Water Intake', group: 'Wellness', copy: 'Estimate hydration from body weight and training time.', icon: Droplets },
  { id: 'ideal-weight', title: 'Healthy Weight Range', group: 'Body', copy: 'View a broad reference range based on your height.', icon: Target },
  { id: 'body-fat', title: 'Body-Fat Estimate', group: 'Body', copy: 'Estimate body-fat percentage from tape measurements.', icon: HeartPulse },
  { id: 'one-rep-max', title: 'One-Rep Max', group: 'Strength', copy: 'Estimate your maximum lift from weight and repetitions.', icon: Dumbbell },
  { id: 'training-weight', title: 'Training Weights', group: 'Strength', copy: 'Calculate working weights at common 1RM percentages.', icon: Gauge },
  { id: 'plates', title: 'Barbell Plates', group: 'Strength', copy: 'Find the plates required on each side of the bar.', icon: Weight },
  { id: 'burned', title: 'Calories Burned', group: 'Cardio', copy: 'Estimate workout energy expenditure by activity.', icon: Activity },
  { id: 'pace', title: 'Running Pace', group: 'Cardio', copy: 'Calculate pace and speed from distance and time.', icon: Timer },
  { id: 'timeline', title: 'Goal Timeline', group: 'Planning', copy: 'Estimate a realistic weight-loss or gain timeline.', icon: Target },
];

export default function CalculatorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get('tool');
  const selected = calculators.find((item) => item.id === active);

  return (
    <div>
      <header className="mx-auto max-w-screen-xl px-6 pt-14 pb-10 md:pt-16 md:pb-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Tools · Fitness calculators</span>
        <h1 className="mt-6 font-display text-6xl leading-[0.85] uppercase md:text-8xl">Know your<br />numbers.</h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-muted">Practical estimates for training, nutrition, strength, and goal planning. Choose a calculator to get started.</p>
      </header>
      <section className="mx-auto max-w-screen-xl px-6 pb-16 md:pb-20">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((item, index) => <CalculatorCard key={item.id} item={item} index={index} onOpen={() => setSearchParams({ tool: item.id })} />)}
        </div>
        <p className="mt-8 border-l-2 border-ember pl-4 text-xs leading-relaxed text-ink-muted">These tools provide general estimates for educational purposes. Individual needs vary, especially during pregnancy or with medical conditions; consult a qualified professional when appropriate.</p>
      </section>
      {selected && <CalculatorModal calculator={selected} onClose={() => setSearchParams({})} />}
    </div>
  );
}

function CalculatorCard({ item, index, onOpen }) {
  const Icon = item.icon;
  return <button onClick={onOpen} className="group flex min-h-64 flex-col justify-between border border-ink/10 bg-paper p-7 text-left transition hover:border-ember hover:bg-paper-dim"><div className="flex items-start justify-between"><Icon className="h-7 w-7 text-ember" /><span className="font-mono text-[10px] tracking-[0.22em] text-ink/30">{String(index + 1).padStart(2, '0')}</span></div><div><span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ember">{item.group}</span><h2 className="mt-3 font-display text-3xl uppercase leading-none">{item.title}</h2><p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">{item.copy}</p><span className="mt-6 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] group-hover:text-ember">Open calculator <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></button>;
}

function CalculatorModal({ calculator, onClose }) {
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-ink/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="mx-auto my-5 w-full max-w-3xl bg-paper shadow-2xl"><div className="flex items-start justify-between border-b border-ink/10 p-6 md:p-8"><div><span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ember">{calculator.group}</span><h2 className="mt-2 font-display text-4xl uppercase leading-none md:text-5xl">{calculator.title}</h2><p className="mt-3 max-w-xl text-sm text-ink-muted">{calculator.copy}</p></div><button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center border border-ink/10 hover:border-ember" aria-label="Close"><X className="h-5 w-5" /></button></div><div className="p-6 md:p-8"><CalculatorBody id={calculator.id} /></div></div></div>;
}

function CalculatorBody({ id }) {
  if (id === 'bmi') return <BmiCalculator />;
  if (id === 'calories') return <CalorieCalculator />;
  if (id === 'macros') return <MacroCalculator />;
  if (id === 'protein') return <ProteinCalculator />;
  if (id === 'water') return <WaterCalculator />;
  if (id === 'ideal-weight') return <IdealWeightCalculator />;
  if (id === 'body-fat') return <BodyFatCalculator />;
  if (id === 'one-rep-max') return <OneRepMaxCalculator />;
  if (id === 'training-weight') return <TrainingWeightCalculator />;
  if (id === 'plates') return <PlateCalculator />;
  if (id === 'burned') return <BurnedCalculator />;
  if (id === 'pace') return <PaceCalculator />;
  return <TimelineCalculator />;
}

function BmiCalculator() {
  const [form, setForm] = useState({ weight: '', height: '' });
  const bmi = form.weight && form.height ? Number(form.weight) / ((Number(form.height) / 100) ** 2) : 0;
  const label = bmi < 18.5 ? 'Below reference range' : bmi < 25 ? 'Within reference range' : bmi < 30 ? 'Above reference range' : 'Well above reference range';
  return <ToolLayout inputs={<><NumberField label="Weight (kg)" value={form.weight} onChange={(weight) => setForm({ ...form, weight })} /><NumberField label="Height (cm)" value={form.height} onChange={(height) => setForm({ ...form, height })} /></>} result={bmi > 0 && <Result value={bmi.toFixed(1)} label={label} detail={`Reference weight at this height: ${(18.5 * (form.height / 100) ** 2).toFixed(1)}–${(24.9 * (form.height / 100) ** 2).toFixed(1)} kg`} />} />;
}

function useTdee(form) {
  if (!form.weight || !form.height || !form.age) return 0;
  const bmr = 10 * Number(form.weight) + 6.25 * Number(form.height) - 5 * Number(form.age) + (form.sex === 'male' ? 5 : -161);
  return Math.round(bmr * Number(form.activity));
}

function BaseCalorieInputs({ form, setForm, includeGoal = false }) {
  return <><SelectField label="Sex" value={form.sex} onChange={(sex) => setForm({ ...form, sex })} options={[['male', 'Male'], ['female', 'Female']]} /><NumberField label="Age" value={form.age} onChange={(age) => setForm({ ...form, age })} /><NumberField label="Weight (kg)" value={form.weight} onChange={(weight) => setForm({ ...form, weight })} /><NumberField label="Height (cm)" value={form.height} onChange={(height) => setForm({ ...form, height })} /><SelectField label="Activity" value={form.activity} onChange={(activity) => setForm({ ...form, activity })} options={activityOptions} />{includeGoal && <SelectField label="Goal" value={form.goal} onChange={(goal) => setForm({ ...form, goal })} options={[['loss', 'Fat loss'], ['maintain', 'Maintain'], ['gain', 'Muscle gain']]} />}</>;
}

const activityOptions = [['1.2', 'Mostly sedentary'], ['1.375', 'Light exercise 1–3 days'], ['1.55', 'Training 3–5 days'], ['1.725', 'Hard training 6–7 days'], ['1.9', 'Very demanding activity']];
const initialCalories = { sex: 'male', age: '', weight: '', height: '', activity: '1.55', goal: 'maintain' };

function CalorieCalculator() {
  const [form, setForm] = useState(initialCalories); const tdee = useTdee(form);
  return <ToolLayout inputs={<BaseCalorieInputs form={form} setForm={setForm} />} result={tdee > 0 && <div className="grid gap-3 sm:grid-cols-3"><Result value={tdee - 400} label="Fat loss kcal/day" /><Result value={tdee} label="Maintenance kcal/day" /><Result value={tdee + 300} label="Muscle gain kcal/day" /></div>} />;
}

function MacroCalculator() {
  const [form, setForm] = useState(initialCalories); const tdee = useTdee(form); const calories = tdee + (form.goal === 'loss' ? -400 : form.goal === 'gain' ? 300 : 0); const protein = Math.round(Number(form.weight) * (form.goal === 'gain' ? 2 : 1.8)); const fat = Math.round(Number(form.weight) * 0.8); const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return <ToolLayout inputs={<BaseCalorieInputs form={form} setForm={setForm} includeGoal />} result={calories > 0 && <><Result value={`${calories} kcal`} label="Daily target" /><div className="mt-3 grid grid-cols-3 gap-3"><Result value={`${protein}g`} label="Protein" /><Result value={`${carbs}g`} label="Carbs" /><Result value={`${fat}g`} label="Fat" /></div></>} />;
}

function ProteinCalculator() {
  const [form, setForm] = useState({ weight: '', goal: 'general' }); const factors = { general: [1.2, 1.6], muscle: [1.6, 2.2], loss: [1.8, 2.4] }; const range = factors[form.goal];
  return <ToolLayout inputs={<><NumberField label="Weight (kg)" value={form.weight} onChange={(weight) => setForm({ ...form, weight })} /><SelectField label="Goal" value={form.goal} onChange={(goal) => setForm({ ...form, goal })} options={[['general', 'General fitness'], ['muscle', 'Build muscle'], ['loss', 'Fat loss while training']]} /></>} result={form.weight && <Result value={`${Math.round(form.weight * range[0])}–${Math.round(form.weight * range[1])}g`} label="Estimated protein per day" detail="Spread across 3–5 meals where practical." />} />;
}

function WaterCalculator() {
  const [form, setForm] = useState({ weight: '', minutes: '45' }); const litres = (form.weight * 0.035) + (form.minutes / 30 * 0.35);
  return <ToolLayout inputs={<><NumberField label="Weight (kg)" value={form.weight} onChange={(weight) => setForm({ ...form, weight })} /><NumberField label="Training minutes/day" value={form.minutes} onChange={(minutes) => setForm({ ...form, minutes })} /></>} result={form.weight && <Result value={`${litres.toFixed(1)} L`} label="Estimated daily fluids" detail="Hot weather and heavy sweating may increase your needs." />} />;
}

function IdealWeightCalculator() {
  const [height, setHeight] = useState(''); const metres = height / 100; const low = 18.5 * metres ** 2; const high = 24.9 * metres ** 2;
  return <ToolLayout inputs={<NumberField label="Height (cm)" value={height} onChange={setHeight} />} result={height && <Result value={`${low.toFixed(1)}–${high.toFixed(1)} kg`} label="General BMI reference range" detail="Build, muscle mass, age, and health context can change what is appropriate for you." />} />;
}

function BodyFatCalculator() {
  const [form, setForm] = useState({ sex: 'male', height: '', waist: '', neck: '', hip: '' }); const valid = form.height && form.waist && form.neck && (form.sex === 'male' || form.hip); const inches = (value) => Number(value) / 2.54; let result = 0; if (valid) result = form.sex === 'male' ? 86.01 * Math.log10(inches(form.waist) - inches(form.neck)) - 70.041 * Math.log10(inches(form.height)) + 36.76 : 163.205 * Math.log10(inches(form.waist) + inches(form.hip) - inches(form.neck)) - 97.684 * Math.log10(inches(form.height)) - 78.387;
  return <ToolLayout inputs={<><SelectField label="Sex" value={form.sex} onChange={(sex) => setForm({ ...form, sex })} options={[['male', 'Male'], ['female', 'Female']]} /><NumberField label="Height (cm)" value={form.height} onChange={(height) => setForm({ ...form, height })} /><NumberField label="Waist (cm)" value={form.waist} onChange={(waist) => setForm({ ...form, waist })} /><NumberField label="Neck (cm)" value={form.neck} onChange={(neck) => setForm({ ...form, neck })} />{form.sex === 'female' && <NumberField label="Hip (cm)" value={form.hip} onChange={(hip) => setForm({ ...form, hip })} />}</>} result={valid && Number.isFinite(result) && <Result value={`${Math.max(2, result).toFixed(1)}%`} label="Estimated body fat" detail="Tape measurements can vary; use the same technique when tracking change." />} />;
}

function OneRepMaxCalculator() {
  const [form, setForm] = useState({ weight: '', reps: '' }); const max = Number(form.weight) * (1 + Number(form.reps) / 30);
  return <ToolLayout inputs={<><NumberField label="Weight lifted (kg)" value={form.weight} onChange={(weight) => setForm({ ...form, weight })} /><NumberField label="Completed reps (1–12)" value={form.reps} onChange={(reps) => setForm({ ...form, reps })} /></>} result={max > 0 && <Result value={`${max.toFixed(1)} kg`} label="Estimated one-rep max" detail="Do not attempt a maximum lift without appropriate experience and supervision." />} />;
}

function TrainingWeightCalculator() {
  const [max, setMax] = useState('');
  return <ToolLayout inputs={<NumberField label="One-rep max (kg)" value={max} onChange={setMax} />} result={max && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[50, 60, 70, 75, 80, 85, 90, 95].map((percentage) => <Result key={percentage} value={`${(max * percentage / 100).toFixed(1)} kg`} label={`${percentage}% of 1RM`} />)}</div>} />;
}

function PlateCalculator() {
  const [rawForm, setForm] = useState({ total: '', bar: 20 });
  const form = { total: rawForm.total === '' ? '' : Number(rawForm.total), bar: Number(rawForm.bar) };
  const perSide = Math.max(0, (form.total - form.bar) / 2); let remaining = perSide; const loaded = []; [25, 20, 15, 10, 5, 2.5, 1.25].forEach((plate) => { const count = Math.floor((remaining + 0.001) / plate); if (count) { loaded.push([plate, count]); remaining -= count * plate; } });
  return <ToolLayout inputs={<><NumberField label="Target total (kg)" value={form.total} onChange={(total) => setForm({ ...form, total })} /><SelectField label="Bar weight" value={form.bar} onChange={(bar) => setForm({ ...form, bar })} options={[['20', '20 kg Olympic bar'], ['15', '15 kg bar'], ['10', '10 kg bar']]} /></>} result={form.total >= form.bar && <><Result value={`${perSide.toFixed(2)} kg`} label="Load on each side" /><div className="mt-3 flex flex-wrap gap-2">{loaded.map(([plate, count]) => <span key={plate} className="border border-ink/15 bg-paper px-4 py-3 text-sm font-semibold">{plate} kg × {count}</span>)}</div>{remaining > 0.01 && <p className="mt-3 text-xs text-amber-700">Remaining {remaining.toFixed(2)} kg per side cannot be loaded with the listed plates.</p>}</>} />;
}

const activities = [['3.5', 'Walking'], ['6', 'Weight training'], ['7', 'Aerobics'], ['8', 'Circuit training'], ['8.3', 'Running (moderate)'], ['10', 'Running (fast)'], ['7.5', 'Cycling'], ['6', 'Rowing']];
function BurnedCalculator() {
  const [form, setForm] = useState({ weight: '', minutes: '45', met: '6' }); const burned = Number(form.met) * 3.5 * Number(form.weight) / 200 * Number(form.minutes);
  return <ToolLayout inputs={<><SelectField label="Activity" value={form.met} onChange={(met) => setForm({ ...form, met })} options={activities} /><NumberField label="Weight (kg)" value={form.weight} onChange={(weight) => setForm({ ...form, weight })} /><NumberField label="Duration (minutes)" value={form.minutes} onChange={(minutes) => setForm({ ...form, minutes })} /></>} result={burned > 0 && <Result value={`${Math.round(burned)} kcal`} label="Estimated calories burned" detail="Intensity, fitness, and equipment accuracy affect actual expenditure." />} />;
}

function PaceCalculator() {
  const [form, setForm] = useState({ distance: '5', hours: '0', minutes: '30' }); const totalMinutes = Number(form.hours) * 60 + Number(form.minutes); const pace = totalMinutes / Number(form.distance); const paceMinutes = Math.floor(pace); const paceSeconds = Math.round((pace - paceMinutes) * 60); const speed = Number(form.distance) / (totalMinutes / 60);
  return <ToolLayout inputs={<><NumberField label="Distance (km)" value={form.distance} onChange={(distance) => setForm({ ...form, distance })} /><NumberField label="Hours" value={form.hours} onChange={(hours) => setForm({ ...form, hours })} /><NumberField label="Minutes" value={form.minutes} onChange={(minutes) => setForm({ ...form, minutes })} /></>} result={totalMinutes > 0 && form.distance > 0 && <div className="grid gap-3 sm:grid-cols-2"><Result value={`${paceMinutes}:${String(paceSeconds).padStart(2, '0')} /km`} label="Average pace" /><Result value={`${speed.toFixed(1)} km/h`} label="Average speed" /></div>} />;
}

function TimelineCalculator() {
  const [form, setForm] = useState({ current: '', target: '', weekly: '0.5' }); const difference = Math.abs(Number(form.current) - Number(form.target)); const weeks = difference / Number(form.weekly); const direction = Number(form.target) < Number(form.current) ? 'loss' : 'gain';
  return <ToolLayout inputs={<><NumberField label="Current weight (kg)" value={form.current} onChange={(current) => setForm({ ...form, current })} /><NumberField label="Target weight (kg)" value={form.target} onChange={(target) => setForm({ ...form, target })} /><SelectField label="Target change per week" value={form.weekly} onChange={(weekly) => setForm({ ...form, weekly })} options={[['0.25', '0.25 kg — gradual'], ['0.5', '0.5 kg — moderate'], ['0.75', '0.75 kg — faster']]} /></>} result={weeks > 0 && <Result value={`${Math.ceil(weeks)} weeks`} label={`Estimated ${direction} timeline`} detail={`Approximately ${Math.ceil(weeks / 4.345)} months. Progress is rarely perfectly linear.`} />} />;
}

function ToolLayout({ inputs, result }) { return <div className="grid gap-7 md:grid-cols-[0.9fr_1.1fr]"><div className="grid content-start gap-4">{inputs}</div><div className="min-h-48 bg-paper-dim p-5 md:p-7">{result || <div className="grid h-full place-items-center text-center"><p className="max-w-xs text-sm text-ink-muted">Enter your details to see an estimate.</p></div>}</div></div>; }
function NumberField({ label, value, onChange }) { return <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">{label}<input type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-ink/15 bg-paper px-4 py-3 font-sans text-base normal-case tracking-normal outline-none focus:border-ember" /></label>; }
function SelectField({ label, value, onChange, options }) { return <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-ink/15 bg-paper px-4 py-3 font-sans text-sm normal-case tracking-normal outline-none focus:border-ember">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>; }
function Result({ value, label, detail }) { return <div className="border border-ink/10 bg-paper p-5"><p className="font-display text-4xl uppercase leading-none text-ember">{value}</p><p className="mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/60">{label}</p>{detail && <p className="mt-3 text-xs leading-relaxed text-ink-muted">{detail}</p>}</div>; }
