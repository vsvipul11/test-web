/* ------------------------------------------------------------------
   Every word guests read lives here. Edit, save, refresh.

   STILL TO FILL IN:
   - the Vidai time, if there is one (an empty time is simply not shown)
------------------------------------------------------------------- */
window.WEDDING = {
  first: 'Jhanvi',
  second: 'Abhinav',
  date: '2026-12-05T19:00:00+05:30', // the countdown runs to the Mangal Vivah, 7 PM
  dateDots: '05 · 12 · 2026',
  dateLong: '5 December 2026',
  venue: 'Prayag Bhagirath Resort and Club',
  city: '',    // shown after the venue on the invitation page, if filled in

  /* Paste your shared Google Drive folder link here. Until then the button reads "Album opens soon". */
  driveLink: 'https://drive.google.com/drive/folders/18DJsR6Ba86TiutqCh_6f2PVzfvJsllHH',

  chapters: [
    { id: 'ch1a', pic: 'class6', seed: [.5, .42], label: 'Chapter one', deva: 'बचपन',
      title: 'It all started<br>in Class 6.',
      beats: [
        'We were just kids when our paths crossed.',
        'No grand plans. No idea what life had in store for us. Just two people who had absolutely no clue that one day, they’d become each other’s favourite person.'
      ] },
    { id: 'ch1b', pic: 'class11', seed: [.42, .42], label: 'Chapter one', deva: 'पहला प्यार',
      title: 'Then came<br>Class 11.',
      beats: [
        'Somewhere between growing up, stolen glances, conversations, and all the little moments that slowly became our moments, friendship turned into love.',
        'And just like that, we weren’t just part of each other’s school days anymore. We became part of each other’s lives.'
      ] },
    { id: 'ch3a', pic: 'abhinav', seed: [.45, .3], label: 'Chapter three', deva: 'सुकून',
      title: 'He’s the calm.',
      beats: [
        'He’s the steady when her world gets loud. The calm in her overthinking. The quiet presence that somehow makes everything feel a little less complicated.'
      ] },
    { id: 'ch3b', pic: 'jhanvi', seed: [.56, .22], label: 'Chapter three', deva: 'जादू', petals: true,
      title: 'She’s the magic.',
      beats: [
        'And her? Well, let’s just say life with her was never going to be boring.',
        'She’s the magic, the drama, the big feelings, the spontaneous ideas, and probably the reason he needs a little extra patience.'
      ] },
    { id: 'ch3c', pic: 'swing', seed: [.5, .4], label: 'Chapter three', deva: 'हम',
      title: 'He’s calm.<br>She’s magic.',
      beats: [
        'He’s probably thinking things through while she’s already imagined seventeen different scenarios.',
        'And somehow, in all our differences, we fit.',
        'Not because we’re the same, but because we’re us.'
      ] },
    { id: 'final', pic: 'balcony', seed: [.5, .2], label: 'The final chapter? Not even close.', deva: 'हमेशा',
      title: 'From the classroom<br>to the mandap.',
      beats: [
        'Almost twelve years ago, we began a story we couldn’t possibly have imagined.',
        'Now, here we are, ready to make a promise that goes far beyond school memories, teenage love, and everything we’ve shared so far.',
        'This isn’t the end of our love story.',
        'It’s the beginning of our favourite chapter yet.',
        'Same two people. More life to live. One forever to figure out together.',
        'And this time, we’re making it official.'
      ] }
  ],

  memories: {
    title: 'Almost 12 years.<br>A million memories.',
    prints: ['velvet', 'maroon', 'selfie', 'laugh', 'beach'],
    beats: [
      'We’ve known each other through different versions of ourselves.',
      'The younger us. The growing-up us. The figuring-life-out us. The us that laughed over absolutely nothing, argued over the smallest things, and somehow always found our way back to each other.',
      'We’ve watched each other change, dream, stumble, grow, and become the people we are today.',
      'And that’s the beautiful thing about us.',
      'We didn’t just fall in love with who we were back then. We kept finding reasons to love who we became.'
    ]
  },

  /* from the printed invitation. name may break onto two lines with <br>; label is the plain
     version for the top bar and the album. An empty date, time or venue is not shown. */
  events: [
    { pic: 'haldi', seed: [.5, .3], name: 'Haldi', label: 'Haldi', deva: 'शगुन की हल्दी',
      line: 'Golden moments, happy hearts, and a whole lot of yellow.',
      date: '4 December 2026', time: '12 PM onwards', venue: 'Prayag Bhagirath Resort and Club' },
    { pic: 'mehendi', seed: [.5, .55], name: 'Mehendi &amp;<br>Sangeet', label: 'Mehendi & Sangeet', deva: 'मेहंदी और संगीत के रंग',
      line: 'His name on her hands. Almost twelve years of love, and one night of questionable dance moves.',
      date: '4 December 2026', time: '6 PM onwards', venue: 'Prayag Bhagirath Resort and Club' },
    { pic: 'wedding', seed: [.5, .62], name: 'The Wedding', label: 'The Wedding', deva: 'मंगल विवाह',
      line: 'The girl from his growing-up years. The woman he’ll grow old with.',
      date: '5 December 2026', time: '7 PM onwards', venue: 'Prayag Bhagirath Resort and Club' },
    { pic: 'garden', seed: [.54, .35], name: 'Vidai', label: 'Vidai', deva: 'आशीर्वाद संग विदाई',
      line: 'Blessings, a few happy tears, and the beginning of a beautiful new chapter.',
      date: '6 December 2026', time: '', venue: 'Prayag Bhagirath Resort and Club' }
  ],

  lore: [
    { pic: 'abhinav', name: 'Abhinav', role: 'The calm one.',
      text: 'The steady hand. The composed one. The person who somehow keeps his cool while loving someone who absolutely does not.' },
    { pic: 'jhanvi', name: 'Jhanvi', role: 'The magic maker.',
      text: 'Big feelings, bigger energy, a million ideas, and a talent for making even ordinary days memorable.' },
    { pic: 'cinema', name: 'Together?', role: '',
      text: 'Equal parts soft love, bold energy, inside jokes, dramatic reactions, and a lifetime of choosing each other.' }
  ],

  gallery: ['lights', 'kiss'],

  /* which part of each picture stays in frame on wider screens: 0 = top, 1 = bottom */
  focus: { hero: .3, veil: .3, lights: .24, balcony: 0, abhinav: .16, jhanvi: .2, stone: .1, kiss: .28, field: .3, marigold: .36, blacktie: .3, swing: .5, palms: .4, garden: .28, cinema: .32 },

  /* where the colour first blooms in each picture */
  seeds: { field: [.62, .32], stone: [.52, .3], kiss: [.5, .34], balcony: [.5, .2], marigold: [.4, .4], lights: [.6, .3], blacktie: [.65, .4], veil: [.5, .42], cinema: [.5, .38], ringhands: [.5, .5], class6: [.45, .38], class11: [.42, .42] }
};
