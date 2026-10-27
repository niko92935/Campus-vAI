export const STUDENT = {
  id: 'ML-2026-0184',
  name: 'Ayesha Rahman',
  firstName: 'Ayesha',
  initials: 'AR',
  email: 'ayesha.rahman@mindlink.ai',
  program: 'Senior Secondary · Science',
  cohort: 'Cohort 12 · Section A',
  joined: 'September 2025',
  streak: 12,
  hours: 48.5,
  averageScore: 92,
  rank: 8,
  weeklyGoal: 5,
  weeklyHours: 3.4,
};

export const COURSES = [
  {
    id: 'math',
    code: 'MATH 301',
    title: 'Advanced Mathematics',
    category: 'Mathematics',
    icon: '∑',
    accent: 'gold',
    instructor: 'Dr. Farhan Ahmed',
    instructorRole: 'Head of Mathematics',
    rating: 4.9,
    learners: 128,
    schedule: 'Mon & Thu · 09:00',
    description:
      'Build deep confidence in calculus, algebra and statistical reasoning through guided demonstrations, weekly problem sets and live workshops.',
    lessons: [
      {
        id: 'math-1',
        title: 'Functions & Limits',
        type: 'Reading',
        duration: 22,
        completed: true,
        summary:
          'A function maps every input to exactly one output. In this lesson we explore domain, range and the behaviour of functions as they approach a point.',
        takeaways: [
          'Identify the domain and range of common function families.',
          'Evaluate one-sided and two-sided limits from a graph.',
          'Recognise removable and non-removable discontinuities.',
        ],
      },
      {
        id: 'math-2',
        title: 'Derivatives from First Principles',
        type: 'Video',
        duration: 18,
        completed: true,
        summary:
          'The derivative measures the instantaneous rate of change of a function. We derive it using the limit of a difference quotient.',
        takeaways: [
          'Write and simplify a difference quotient.',
          'Differentiate simple polynomials from first principles.',
          'Connect gradients of tangent lines to derivative values.',
        ],
      },
      {
        id: 'math-3',
        title: 'Product & Quotient Rules',
        type: 'Video',
        duration: 16,
        completed: true,
        summary:
          'Learn two workhorse rules for differentiating products and quotients without expanding every expression.',
        takeaways: [
          'Apply the product rule fluently.',
          'Apply the quotient rule while tracking signs carefully.',
          'Choose the most efficient rule for a given expression.',
        ],
      },
      {
        id: 'math-4',
        title: 'Applications of Differentiation',
        type: 'Reading',
        duration: 20,
        completed: true,
        summary:
          'Derivatives help us locate maxima, minima and points of inflection, and they underpin optimisation problems in the real world.',
        takeaways: [
          'Find stationary points using the first derivative.',
          'Classify turning points with the second derivative.',
          'Model and solve a practical optimisation problem.',
        ],
      },
      {
        id: 'math-5',
        title: 'Integration Basics',
        type: 'Video',
        duration: 24,
        completed: true,
        summary:
          'Integration reverses differentiation and measures accumulated change. We begin with the power rule and standard integrals.',
        takeaways: [
          'Integrate polynomials using the power rule.',
          'Use the constant of integration correctly.',
          'Interpret definite integrals as signed area.',
        ],
      },
      {
        id: 'math-6',
        title: 'Definite Integrals',
        type: 'Video',
        duration: 19,
        completed: true,
        summary:
          'Definite integrals evaluate accumulated change between two points. This lesson connects the fundamental theorem of calculus to area problems.',
        takeaways: [
          'Evaluate definite integrals using antiderivatives.',
          'Split integrals across intervals correctly.',
          'Apply integrals to area between curves.',
        ],
      },
      {
        id: 'math-7',
        title: 'Integration by Parts',
        type: 'Video',
        duration: 18,
        completed: false,
        summary:
          'Integration by parts turns a difficult integral into a simpler one. We build the formula from the product rule and practise choosing u and dv wisely.',
        takeaways: [
          'Derive and apply the integration-by-parts formula.',
          'Choose u and dv using the LIATE heuristic.',
          'Handle repeated application and cyclic integrals.',
        ],
      },
      {
        id: 'math-8',
        title: 'Trigonometric Integrals',
        type: 'Reading',
        duration: 21,
        completed: false,
        summary:
          'Recognise common patterns in integrals involving sine, cosine and tangent, and select the right substitution.',
        takeaways: [
          'Use Pythagorean identities to simplify integrands.',
          'Apply half-angle identities to powers of sine and cosine.',
          'Handle odd and even powers with different strategies.',
        ],
      },
      {
        id: 'math-9',
        title: 'Differential Equations',
        type: 'Video',
        duration: 26,
        completed: false,
        summary:
          'A differential equation relates a function to its derivatives. We introduce separable equations and use them to model growth and decay.',
        takeaways: [
          'Identify order and linearity of a differential equation.',
          'Solve separable first-order equations.',
          'Interpret initial conditions in a model.',
        ],
      },
      {
        id: 'math-10',
        title: 'Vectors & Matrices',
        type: 'Reading',
        duration: 17,
        completed: false,
        summary:
          'Vectors describe magnitude and direction; matrices organise transformations and systems of equations. We connect the two viewpoints.',
        takeaways: [
          'Add, scale and dot vectors in two and three dimensions.',
          'Multiply matrices and interpret the result.',
          'Use matrices to solve small linear systems.',
        ],
      },
      {
        id: 'math-11',
        title: 'Probability & Statistics',
        type: 'Video',
        duration: 22,
        completed: false,
        summary:
          'Move from experimental probability to distributions and expected value, with a focus on interpreting data responsibly.',
        takeaways: [
          'Distinguish independent and dependent events.',
          'Compute expected value for a discrete distribution.',
          'Summarise a data set using mean, spread and outliers.',
        ],
      },
      {
        id: 'math-12',
        title: 'Exam Revision Workshop',
        type: 'Quiz',
        duration: 30,
        completed: false,
        summary:
          'A timed mixed-topic workshop that mirrors the structure of the end-of-term examination.',
        takeaways: [
          'Manage time across short and long-form questions.',
          'Identify recurring errors from your practice set.',
          'Build a focused revision plan for the final week.',
        ],
      },
    ],
  },
  {
    id: 'physics',
    code: 'PHYS 204',
    title: 'Physics',
    category: 'Physics',
    icon: '⚛',
    accent: 'blue',
    instructor: 'Ms. Nusrat Jahan',
    instructorRole: 'Senior Physics Faculty',
    rating: 4.8,
    learners: 96,
    schedule: 'Tue & Fri · 14:30',
    description:
      'Understand the forces that shape our universe through experiments, visual models and live problem-solving sessions.',
    lessons: [
      {
        id: 'phy-1',
        title: 'Kinematics in One Dimension',
        type: 'Reading',
        duration: 20,
        completed: true,
        summary:
          'Describe motion using displacement, velocity and acceleration, and connect the three through graphs.',
        takeaways: [
          'Read displacement and velocity from motion graphs.',
          'Select the appropriate kinematic equation.',
          'Solve multi-stage motion problems.',
        ],
      },
      {
        id: 'phy-2',
        title: "Newton's Laws of Motion",
        type: 'Video',
        duration: 23,
        completed: true,
        summary:
          'Newton’s three laws explain why objects stay still, speed up, slow down or change direction. We test them with everyday examples.',
        takeaways: [
          'Draw complete free-body diagrams.',
          'Apply F = ma to systems with multiple forces.',
          'Identify action–reaction pairs.',
        ],
      },
      {
        id: 'phy-3',
        title: 'Work, Energy & Power',
        type: 'Video',
        duration: 19,
        completed: true,
        summary:
          'Energy gives us a powerful alternative to force-based analysis. We track energy transfers through simple systems.',
        takeaways: [
          'Calculate work done by a constant force.',
          'Use conservation of mechanical energy.',
          'Relate power to work and time.',
        ],
      },
      {
        id: 'phy-4',
        title: 'Momentum & Collisions',
        type: 'Reading',
        duration: 21,
        completed: false,
        summary:
          'Momentum is conserved in every closed system. We compare elastic and inelastic collisions and use conservation laws to predict outcomes.',
        takeaways: [
          'Apply conservation of momentum in one dimension.',
          'Distinguish elastic from inelastic collisions.',
          'Interpret impulse from a force–time graph.',
        ],
      },
      {
        id: 'phy-5',
        title: 'Circular Motion',
        type: 'Video',
        duration: 18,
        completed: false,
        summary:
          'Objects moving in a circle are constantly accelerating toward the centre. We examine centripetal force in real systems.',
        takeaways: [
          'Relate speed, radius and centripetal acceleration.',
          'Identify the force providing centripetal acceleration.',
          'Analyse vertical circular motion at key points.',
        ],
      },
      {
        id: 'phy-6',
        title: 'Electromagnetism: Fields & Forces',
        type: 'Reading',
        duration: 25,
        completed: false,
        summary:
          'Electric currents create magnetic fields, and magnetic fields exert forces on moving charges. This lesson introduces the field model and the right-hand rule.',
        takeaways: [
          'Map the magnetic field around a current-carrying wire.',
          'Use the right-hand rule to find force direction.',
          'Explain how a simple electric motor works.',
        ],
      },
      {
        id: 'phy-7',
        title: 'Magnetic Fields & Induction',
        type: 'Video',
        duration: 22,
        completed: false,
        summary:
          'A changing magnetic flux induces an electromotive force. We connect Faraday’s law to generators and transformers.',
        takeaways: [
          'Calculate magnetic flux through a surface.',
          'Apply Faraday’s and Lenz’s laws qualitatively.',
          'Explain the principle of an AC generator.',
        ],
      },
      {
        id: 'phy-8',
        title: 'Waves & Optics',
        type: 'Quiz',
        duration: 24,
        completed: false,
        summary:
          'Review wave properties, superposition and the behaviour of light through lenses and slits.',
        takeaways: [
          'Relate frequency, wavelength and wave speed.',
          'Apply the superposition principle.',
          'Use ray diagrams to locate images formed by lenses.',
        ],
      },
    ],
  },
  {
    id: 'chemistry',
    code: 'CHEM 210',
    title: 'Chemistry',
    category: 'Chemistry',
    icon: '⚗',
    accent: 'green',
    instructor: 'Dr. Imran Chowdhury',
    instructorRole: 'Chemistry Department',
    rating: 4.9,
    learners: 84,
    schedule: 'Wed · 11:00',
    description:
      'From atomic structure to organic reaction mechanisms, understand matter through experiments, molecular models and structured practice.',
    lessons: [
      {
        id: 'chem-1',
        title: 'Atomic Structure & Periodicity',
        type: 'Reading',
        duration: 20,
        completed: true,
        summary:
          'Connect electron configuration to periodic trends and explain why elements behave the way they do.',
        takeaways: [
          'Write electron configurations for main-group elements.',
          'Explain trends in atomic radius and ionisation energy.',
          'Predict relative electronegativity.',
        ],
      },
      {
        id: 'chem-2',
        title: 'Chemical Bonding',
        type: 'Video',
        duration: 18,
        completed: true,
        summary:
          'Atoms bond to achieve stable electron arrangements. We compare ionic, covalent and metallic bonding.',
        takeaways: [
          'Draw Lewis structures for simple molecules.',
          'Predict molecular shape using VSEPR theory.',
          'Relate bond polarity to molecular polarity.',
        ],
      },
      {
        id: 'chem-3',
        title: 'Stoichiometry & Moles',
        type: 'Reading',
        duration: 22,
        completed: true,
        summary:
          'The mole connects mass to particle count. We use balanced equations to calculate reacting quantities.',
        takeaways: [
          'Convert between mass, moles and particles.',
          'Identify limiting reagents.',
          'Calculate theoretical and percentage yield.',
        ],
      },
      {
        id: 'chem-4',
        title: 'Acids, Bases & Buffers',
        type: 'Video',
        duration: 21,
        completed: true,
        summary:
          'Investigate proton transfer, pH and how buffers stabilise solutions in living systems.',
        takeaways: [
          'Calculate pH for strong and weak acids.',
          'Explain how a buffer resists pH change.',
          'Interpret titration curves.',
        ],
      },
      {
        id: 'chem-5',
        title: 'Thermochemistry',
        type: 'Video',
        duration: 19,
        completed: true,
        summary:
          'Chemical reactions exchange energy with their surroundings. We measure enthalpy changes and apply Hess’s law.',
        takeaways: [
          'Distinguish exothermic and endothermic processes.',
          'Calculate enthalpy change from calorimetry data.',
          'Use Hess’s law to find unknown enthalpies.',
        ],
      },
      {
        id: 'chem-6',
        title: 'Chemical Equilibrium',
        type: 'Reading',
        duration: 23,
        completed: true,
        summary:
          'Reversible reactions settle into a dynamic balance. We explore equilibrium constants and how conditions shift the balance.',
        takeaways: [
          'Write equilibrium expressions for homogeneous systems.',
          'Apply Le Chatelier’s principle.',
          'Calculate equilibrium concentrations from initial values.',
        ],
      },
      {
        id: 'chem-7',
        title: 'Redox & Electrochemistry',
        type: 'Video',
        duration: 20,
        completed: true,
        summary:
          'Oxidation and reduction describe electron transfer. We build electrochemical cells and predict their voltage.',
        takeaways: [
          'Assign oxidation states correctly.',
          'Balance redox half-equations.',
          'Predict cell potential from standard electrode values.',
        ],
      },
      {
        id: 'chem-8',
        title: 'Organic Reactions',
        type: 'Video',
        duration: 24,
        completed: false,
        summary:
          'Learn to recognise functional groups and predict the products of substitution, addition and elimination reactions.',
        takeaways: [
          'Identify nucleophiles and electrophiles.',
          'Distinguish SN1 and SN2 pathways.',
          'Predict major products using Markovnikov’s rule.',
        ],
      },
      {
        id: 'chem-9',
        title: 'Polymers & Materials',
        type: 'Reading',
        duration: 17,
        completed: false,
        summary:
          'Explore how monomers join to form polymers and how structure determines the properties of everyday materials.',
        takeaways: [
          'Compare addition and condensation polymerisation.',
          'Relate intermolecular forces to material strength.',
          'Discuss the environmental impact of plastics.',
        ],
      },
      {
        id: 'chem-10',
        title: 'Practical Exam Preparation',
        type: 'Quiz',
        duration: 28,
        completed: false,
        summary:
          'A practical-focused review covering apparatus, safety, observation tables and data analysis.',
        takeaways: [
          'Select appropriate apparatus for a given measurement.',
          'Record observations with correct precision.',
          'Evaluate sources of experimental error.',
        ],
      },
    ],
  },
  {
    id: 'english',
    code: 'ENG 112',
    title: 'English Literature',
    category: 'English',
    icon: '✒',
    accent: 'purple',
    instructor: 'Ms. Saira Khan',
    instructorRole: 'Literature Faculty',
    rating: 4.7,
    learners: 112,
    schedule: 'Mon · 13:00',
    description:
      'Read closely, argue clearly and write with confidence across drama, poetry and the modern novel.',
    lessons: [
      {
        id: 'eng-1',
        title: 'Macbeth: Ambition & Power',
        type: 'Reading',
        duration: 24,
        completed: true,
        summary:
          'Trace how ambition and prophecy drive Macbeth toward ruin, and how Shakespeare uses imagery to dramatise inner conflict.',
        takeaways: [
          'Analyse the role of prophecy in the plot.',
          'Trace the recurring motifs of blood and darkness.',
          'Build a thesis about ambition and moral choice.',
        ],
      },
      {
        id: 'eng-2',
        title: 'Character Study: Lady Macbeth',
        type: 'Video',
        duration: 18,
        completed: true,
        summary:
          'Examine Lady Macbeth’s shifting power and guilt through key soliloquies and her relationship with her husband.',
        takeaways: [
          'Compare her language before and after the murder.',
          'Discuss how gender expectations shape her actions.',
          'Select precise quotations for a character essay.',
        ],
      },
      {
        id: 'eng-3',
        title: 'Poetry of the Romantics',
        type: 'Reading',
        duration: 21,
        completed: true,
        summary:
          'Explore how Romantic poets treat nature, imagination and the individual through close reading of selected works.',
        takeaways: [
          'Identify Romantic conventions in a poem.',
          'Analyse imagery, metre and tone.',
          'Connect historical context to interpretation.',
        ],
      },
      {
        id: 'eng-4',
        title: 'Unseen Poetry Analysis',
        type: 'Video',
        duration: 16,
        completed: true,
        summary:
          'A repeatable method for approaching an unseen poem under timed conditions.',
        takeaways: [
          'Annotate for voice, form and imagery.',
          'Build a clear comparative argument.',
          'Write a focused opening paragraph.',
        ],
      },
      {
        id: 'eng-5',
        title: 'The Modern Novel',
        type: 'Reading',
        duration: 22,
        completed: true,
        summary:
          'Study narrative voice and structure in twentieth-century fiction, with attention to unreliable narration.',
        takeaways: [
          'Distinguish author, narrator and character perspectives.',
          'Analyse non-linear narrative structure.',
          'Evaluate the effect of an unreliable narrator.',
        ],
      },
      {
        id: 'eng-6',
        title: 'Writing the Perfect Essay',
        type: 'Video',
        duration: 19,
        completed: true,
        summary:
          'Turn close reading into a persuasive essay with a clear argument, well-chosen evidence and precise analysis.',
        takeaways: [
          'Write a thesis that answers the question directly.',
          'Integrate quotations into analytical sentences.',
          'Link paragraphs with conceptual transitions.',
        ],
      },
      {
        id: 'eng-7',
        title: 'Context & Criticism',
        type: 'Reading',
        duration: 20,
        completed: true,
        summary:
          'Use historical and critical context responsibly without letting it overwhelm your own interpretation.',
        takeaways: [
          'Select relevant contextual detail.',
          'Apply a critical lens to a short passage.',
          'Balance context with close textual analysis.',
        ],
      },
      {
        id: 'eng-8',
        title: 'Comparative Analysis',
        type: 'Video',
        duration: 23,
        completed: true,
        summary:
          'Compare two texts by building a shared conceptual framework rather than listing similarities.',
        takeaways: [
          'Create a comparative thesis.',
          'Organise body paragraphs by idea, not by text.',
          'Use comparative connectives precisely.',
        ],
      },
      {
        id: 'eng-9',
        title: 'Timed Essay Workshop',
        type: 'Quiz',
        duration: 30,
        completed: true,
        summary:
          'Plan and write a complete essay under exam conditions, then evaluate it against the marking criteria.',
        takeaways: [
          'Allocate time for planning and proofreading.',
          'Meet the assessment objectives consistently.',
          'Identify one concrete target for your next essay.',
        ],
      },
      {
        id: 'eng-10',
        title: 'Course Reflection & Portfolio',
        type: 'Reading',
        duration: 15,
        completed: true,
        summary:
          'Bring together your best work from the term and reflect on how your reading and writing have developed.',
        takeaways: [
          'Select evidence of your strongest analytical writing.',
          'Write a reflective introduction to your portfolio.',
          'Set a reading goal for the next term.',
        ],
      },
    ],
  },
];

export const LIVE_CLASS = {
  id: 'live-physics',
  courseId: 'physics',
  lessonId: 'phy-6',
  subject: 'Physics',
  title: 'Electromagnetism: Fields & Forces',
  tutor: 'Ms. Nusrat Jahan',
  tutorInitials: 'NJ',
  startsAt: 'Started 4 min ago',
  duration: '45 min',
  students: 24,
  agenda: [
    'Warm-up: magnetic field lines recap',
    'Live demonstration: current and compass needles',
    'Guided practice: force direction problems',
    'Open Q&A and next-lesson preview',
  ],
};

export const SCHEDULE = [
  {
    id: 'schedule-1',
    time: 'Now',
    title: 'Electromagnetism',
    subject: 'Physics',
    tutor: 'Ms. Nusrat Jahan',
    duration: '45 min',
    status: 'live',
    courseId: 'physics',
    lessonId: 'phy-6',
  },
  {
    id: 'schedule-2',
    time: '16:00',
    title: 'Integration by Parts',
    subject: 'Mathematics',
    tutor: 'Dr. Farhan Ahmed',
    duration: '40 min',
    status: 'upcoming',
    courseId: 'math',
    lessonId: 'math-7',
  },
  {
    id: 'schedule-3',
    time: 'Tomorrow',
    title: 'Organic Reactions',
    subject: 'Chemistry',
    tutor: 'Dr. Imran Chowdhury',
    duration: '45 min',
    status: 'upcoming',
    courseId: 'chemistry',
    lessonId: 'chem-8',
  },
];

export const NOTICES = [
  {
    id: 'notice-1',
    category: 'Academic',
    title: 'Mid-term examination schedule released',
    preview:
      'The full examination timetable for Term 2 is now available. Please review your subject dates and venue allocations.',
    body:
      'The Term 2 mid-term examinations will run from Monday, 9 November to Friday, 20 November. The complete timetable, including venue allocations, is now available in the Assessments section of your student portal.\n\nPlease arrive at least fifteen minutes before each paper with your student ID. Calculators are permitted for Mathematics, Physics and Chemistry; the approved model list is available from your subject teacher.\n\nIf you have an unavoidable clash or an access requirement, contact the Academic Office before Friday, 30 October. Requests received after this date may not be accommodated.',
    author: 'Academic Office',
    date: 'Today · 09:20',
    read: false,
    pinned: true,
  },
  {
    id: 'notice-2',
    category: 'Academic',
    title: 'Live Physics masterclass moved to 6:30 PM',
    preview:
      'This evening’s electromagnetism session will begin thirty minutes later than originally scheduled.',
    body:
      'Ms. Nusrat Jahan’s live Physics masterclass has been moved to 6:30 PM today due to a laboratory maintenance window. The session will still be recorded and posted within two hours of finishing.\n\nJoin from the Live Class card on your home screen. If you cannot attend live, your questions can be submitted in advance through the lesson page.',
    author: 'Physics Department',
    date: 'Today · 08:05',
    read: false,
    pinned: false,
  },
  {
    id: 'notice-3',
    category: 'System',
    title: 'Scheduled maintenance this Saturday',
    preview:
      'The student portal will be unavailable for approximately two hours while we upgrade the platform.',
    body:
      'We will perform scheduled maintenance on Saturday from 01:00 to 03:00. During this window, the mobile app, lesson downloads and live class joining may be temporarily unavailable.\n\nYour progress is saved automatically, so no action is needed. Push notifications about new notices will resume once the upgrade is complete.',
    author: 'Platform Team',
    date: 'Yesterday · 17:40',
    read: true,
    pinned: false,
  },
  {
    id: 'notice-4',
    category: 'Event',
    title: 'Science fair registration is now open',
    preview:
      'Form a team of up to three and submit your project proposal before the end of the month.',
    body:
      'This year’s MindLink Science Fair will take place on Saturday, 28 November in the main atrium. Projects can explore any area of science, engineering or applied mathematics.\n\nTeams of up to three students should submit a 150-word proposal outlining their question, method and expected outcome. The deadline is Friday, 30 October at 5:00 PM. Shortlisted teams will be paired with a faculty mentor.',
    author: 'Student Activities',
    date: 'Yesterday · 11:15',
    read: false,
    pinned: false,
  },
  {
    id: 'notice-5',
    category: 'Finance',
    title: 'Term 2 tuition invoices are available',
    preview:
      'Invoices have been issued to the primary guardian email. Payment is due by 5 November.',
    body:
      'Term 2 tuition invoices are now available. A copy has been sent to the primary guardian email address on file, and a summary can be viewed in the Finance section of the portal.\n\nPayment is due by Thursday, 5 November. If you believe there is an error or need to discuss a payment plan, please contact the Finance Office directly rather than replying to the automated email.',
    author: 'Finance Office',
    date: 'Mon · 14:30',
    read: true,
    pinned: false,
  },
  {
    id: 'notice-6',
    category: 'Wellbeing',
    title: 'New wellbeing and counselling hours',
    preview:
      'Drop-in appointments are now available every Tuesday and Thursday afternoon.',
    body:
      'The student wellbeing team has added drop-in hours every Tuesday and Thursday from 1:00 PM to 3:00 PM. No appointment is needed for a first conversation.\n\nSessions are confidential. If you would prefer to speak with someone outside school hours, the student support line is available 24 hours a day and is listed on the Help & Support page in your profile.',
    author: 'Wellbeing Team',
    date: 'Mon · 09:00',
    read: true,
    pinned: false,
  },
];

export function getCourseProgress(course) {
  if (!course || !course.lessons.length) return 0;
  const completed = course.lessons.filter((lesson) => lesson.completed).length;
  return Math.round((completed / course.lessons.length) * 100);
}

export function getCompletedCount(course) {
  return course.lessons.filter((lesson) => lesson.completed).length;
}

export function getNextLesson(course) {
  if (!course) return null;
  return course.lessons.find((lesson) => !lesson.completed) || null;
}

export function getCourseStats(courses) {
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLessons = courses.reduce((sum, course) => sum + getCompletedCount(course), 0);
  const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  return { totalLessons, completedLessons, progress };
}
