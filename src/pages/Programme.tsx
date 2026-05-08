import { useAuth } from '@/hooks/useAuth'
import { daysUntil } from '@/lib/utils'

// Weekly training structure for a 20-week ultra hike build
// Phases: Base (wks 1-6), Build (wks 7-12), Peak (wks 13-17), Taper (wks 18-20)

interface Day {
  day: string
  type: 'walk' | 'gym' | 'rest' | 'long'
  title: string
  detail: string
  duration: string
}

interface Week {
  phase: string
  phaseColor: string
  focus: string
  days: Day[]
}

const PROGRAMME: Week[] = [
  {
    phase: 'Base', phaseColor: 'bg-sky-100 text-sky-700',
    focus: 'Build a movement habit. Easy effort only.',
    days: [
      { day: 'Mon', type: 'gym', title: 'Gym — legs & core', detail: 'Goblet squats 3×12, lunges 3×10, dead bugs 3×10, calf raises 3×15', duration: '40 min' },
      { day: 'Tue', type: 'walk', title: 'Easy walk', detail: 'Flat or gentle terrain. Conversational pace. Focus on posture.', duration: '45 min' },
      { day: 'Wed', type: 'rest', title: 'Rest or stretch', detail: 'Light yoga, foam roll, or full rest. Listen to your body.', duration: '—' },
      { day: 'Thu', type: 'gym', title: 'Gym — upper & core', detail: 'Rows 3×12, press-ups 3×10, plank 3×30s, hip bridges 3×15', duration: '40 min' },
      { day: 'Fri', type: 'walk', title: 'Hilly walk', detail: 'Find some incline. Short steep sections are fine. Poles optional.', duration: '60 min' },
      { day: 'Sat', type: 'long', title: 'Long walk', detail: 'Your longest walk of the week. Pack, water, snacks. Aim for 8–10km.', duration: '2–2.5 hr' },
      { day: 'Sun', type: 'rest', title: 'Rest & recover', detail: 'Feet up. Stretch, eat well, sleep.', duration: '—' },
    ]
  },
  {
    phase: 'Build', phaseColor: 'bg-trail-100 text-trail-700',
    focus: 'Increase long walk distance. Add elevation.',
    days: [
      { day: 'Mon', type: 'gym', title: 'Gym — loaded legs', detail: 'Barbell squats or goblet squats 4×10, step-ups 3×12, single-leg deadlift 3×8 each', duration: '45 min' },
      { day: 'Tue', type: 'walk', title: 'Tempo walk', detail: 'Brisk pace, slightly breathless. Include 2–3 uphill sections.', duration: '50 min' },
      { day: 'Wed', type: 'rest', title: 'Active recovery', detail: 'Swim, easy cycle, or yoga. No hiking boots.', duration: '30 min' },
      { day: 'Thu', type: 'gym', title: 'Gym — strength + cardio', detail: 'Circuit: kettlebell swings, rows, press, plank. Stairmaster 15 min.', duration: '50 min' },
      { day: 'Fri', type: 'walk', title: 'Hilly walk', detail: 'Seek out 200–300m of elevation. Walk the descents carefully.', duration: '75 min' },
      { day: 'Sat', type: 'long', title: 'Long walk', detail: 'Target 15–20km. Practice nutrition strategy. Eat every 45 min.', duration: '3–4 hr' },
      { day: 'Sun', type: 'rest', title: 'Rest', detail: 'Full rest. Note any hotspots or niggles in your session log.', duration: '—' },
    ]
  },
  {
    phase: 'Peak', phaseColor: 'bg-earth-100 text-earth-700',
    focus: 'Longest training walks. Build mental toughness.',
    days: [
      { day: 'Mon', type: 'gym', title: 'Gym — heavy legs', detail: 'Squats 4×8, hip thrusts 4×10, calf raises 4×20, core circuit 15 min', duration: '50 min' },
      { day: 'Tue', type: 'walk', title: 'Recovery walk', detail: 'Easy pace. Legs should feel yesterday\'s effort. Flat route.', duration: '40 min' },
      { day: 'Wed', type: 'rest', title: 'Rest', detail: 'Full rest. Sleep is training.', duration: '—' },
      { day: 'Thu', type: 'gym', title: 'Gym — functional strength', detail: 'Farmer carries, sled push or step-ups with pack, pallof press 3×12', duration: '45 min' },
      { day: 'Fri', type: 'walk', title: 'Hilly walk with pack', detail: 'Wear your race pack loaded. Get used to the weight. Max elevation.', duration: '90 min' },
      { day: 'Sat', type: 'long', title: 'Peak long walk', detail: '25–35km. Your biggest training day. Bring a partner if possible.', duration: '5–7 hr' },
      { day: 'Sun', type: 'rest', title: 'Rest & recover', detail: 'Priority: feet, food, sleep. Log how you felt in detail.', duration: '—' },
    ]
  },
  {
    phase: 'Taper', phaseColor: 'bg-purple-100 text-purple-700',
    focus: 'Cut volume. Keep intensity. Stay sharp.',
    days: [
      { day: 'Mon', type: 'gym', title: 'Gym — light tune-up', detail: 'Same exercises, 60% weight, 2 sets each. Keep it brisk.', duration: '30 min' },
      { day: 'Tue', type: 'walk', title: 'Easy walk', detail: 'Flat, easy, enjoyable. Remind yourself you\'re ready.', duration: '30 min' },
      { day: 'Wed', type: 'rest', title: 'Rest', detail: 'Resist the urge to do more. Trust your training.', duration: '—' },
      { day: 'Thu', type: 'gym', title: 'Gym — activation only', detail: 'Band work, bodyweight squats, hip bridges. Nothing heavy.', duration: '20 min' },
      { day: 'Fri', type: 'walk', title: 'Short shakeout walk', detail: 'Wear your race shoes. 30 min max. Flat and easy.', duration: '30 min' },
      { day: 'Sat', type: 'rest', title: 'Rest', detail: 'Pack your bag. Check kit. Sleep early.', duration: '—' },
      { day: 'Sun', type: 'long', title: '🏅 Race day!', detail: 'You\'ve done the work. Trust your training, walk your own pace, eat early and often.', duration: 'All day' },
    ]
  },
]

const TYPE_STYLES: Record<Day['type'], { dot: string; badge: string; icon: string }> = {
  walk:  { dot: 'bg-trail-400',  badge: 'bg-trail-50 text-trail-700 border-trail-200',   icon: '🥾' },
  gym:   { dot: 'bg-earth-400',  badge: 'bg-earth-50 text-earth-700 border-earth-200',   icon: '🏋️' },
  long:  { dot: 'bg-trail-600',  badge: 'bg-trail-100 text-trail-800 border-trail-300',  icon: '⛰️' },
  rest:  { dot: 'bg-stone-300',  badge: 'bg-stone-50 text-stone-500 border-stone-200',   icon: '😴' },
}

export default function ProgrammePage() {
  const { event } = useAuth()
  const weeksToEvent = event ? Math.max(1, Math.ceil(daysUntil(event.event_date) / 7)) : null

  // Pick the most relevant phase based on weeks remaining
  const currentPhaseIndex = weeksToEvent == null ? 0
    : weeksToEvent > 12 ? 0
    : weeksToEvent > 6 ? 1
    : weeksToEvent > 2 ? 2
    : 3

  const currentWeek = PROGRAMME[currentPhaseIndex]

  return (
    <div className="px-4 py-4 space-y-5 pb-8">
      {/* Phase selector */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Training phase</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PROGRAMME.map((w, i) => (
            <a
              key={w.phase}
              href={`#phase-${i}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                i === currentPhaseIndex ? w.phaseColor + ' border-transparent' : 'bg-white text-stone-500 border-stone-200'
              }`}
            >
              {w.phase}
              {i === currentPhaseIndex && ' ← now'}
            </a>
          ))}
        </div>
      </div>

      {/* Show current phase prominently, others collapsed */}
      {PROGRAMME.map((week, wi) => (
        <div key={wi} id={`phase-${wi}`} className={`rounded-2xl overflow-hidden border ${
          wi === currentPhaseIndex ? 'border-stone-200 shadow-sm' : 'border-stone-100'
        }`}>
          {/* Phase header */}
          <div className={`px-4 py-3 flex items-center justify-between ${wi === currentPhaseIndex ? 'bg-white' : 'bg-stone-50'}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${week.phaseColor}`}>
                  {week.phase}
                </span>
                {wi === currentPhaseIndex && (
                  <span className="text-xs text-stone-400">
                    {weeksToEvent ? `~${weeksToEvent} weeks to go` : 'current phase'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">{week.focus}</p>
            </div>
          </div>

          {/* Days */}
          <div className={`divide-y divide-stone-50 ${wi !== currentPhaseIndex ? 'bg-stone-50/50' : 'bg-white'}`}>
            {week.days.map((day, di) => {
              const style = TYPE_STYLES[day.type]
              return (
                <div key={di} className="flex items-start gap-3 px-4 py-3">
                  <div className="shrink-0 w-8 text-center">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{day.day}</p>
                    <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${style.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${wi === currentPhaseIndex ? 'text-stone-800' : 'text-stone-500'}`}>
                        {style.icon} {day.title}
                      </p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${style.badge}`}>
                        {day.duration}
                      </span>
                    </div>
                    {wi === currentPhaseIndex && (
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{day.detail}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-stone-400 text-center pb-2">
        Adjust based on how your body feels. Rest is training too.
      </p>
    </div>
  )
}
