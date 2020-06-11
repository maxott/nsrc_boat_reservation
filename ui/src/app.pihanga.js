/* eslint-disable object-property-newline */
/* eslint-disable object-curly-newline */
import moment from 'moment';

const SIX_OCLOCK = moment().hour(6);

const FORM_FIELDS = (s) => [
  // {
  //   id: 'passport', type: 'textField', label: 'Passport#', required: true, grid: { xs: 12, sm: 12 }, mui: {},
  // },
  {
    id: 'day',
    type: 'radioGroup',
    label: 'Day',
    options: new Array(5).fill(0).map((_, i) => {
      const t = moment().add(i, 'days');
      const label = ['Today', 'Tomorrow'][i] || t.format('ddd');
      return { id: `${t.format('YYYY-MM-DD')}`, label };
    }),
    rowLayout: true,
    required: true,
    grid: { xs: 12, sm: 12 },
    mui: {},
  },
  {
    id: 'startTime',
    type: 'radioGroup',
    label: 'Start Time',
    options: startTimeOptions(s),
    rowLayout: true,
    required: true,
    grid: { xs: 12, sm: 12 },
    mui: {},
  },
  {
    id: 'boat',
    type: 'radioGroup',
    label: 'Boat',
    options: (s.availableBoats || []).map((b) => {
      const id = b.csSAID;
      const label = b.csName;
      return { id, label };
    }).sort((a, b) => a.label.localeCompare(b.label)),
    rowLayout: true,
    required: true,
    grid: { xs: 12, sm: 12 },
    mui: {},
  },
  // {id: "question", type: "selectField", label: "Question", required: true, options: QUESTIONS.map(q => q.q) },
  // {id: "ring", type: "selectField", label: "Using Ring", required: true, help: 'Select Ring to use', options: RINGS },
];

function startTimeOptions(s) {
  const day = s.pihanga.reservationForm?.values?.day;
  const start = day ? moment(day) : moment();
  const opts = new Array(12).fill(0).map((_, i) => {
    const t = moment(start).hour(6).minute(15 * i);
    let count = 0;
    if (s.reservations) {
      const rk = t.format('YYYY-MM-DDThh:mm:00+00:00');
      count = s.reservations[rk] || 0;
    }
    const label = `${t.format('h:mm')} (${count})`;
    return { id: `${6 * 60 + 15 * i}`, label, disabled: count >= 3 };
  });
  return opts;
}

// -  How many accounts are held by a UBO with passport number X
// - Of these, how many have been dormant for three months
// - what is the average transaction amount over the last three months across these accounts
// - what is the maximum transaction amount over the last three months

const page = {
  page: {
    cardType: 'PiSimplePage',
    contentCard: 'entryPage', // s => s.step,
    maxWidth: '700px', // 'md',
    signature: 'Built with \u2764 while not rowing',
  },

  entryPage: {
    cardType: 'PiTitledPage',
    contentCard: 'content', // 'logonForm',
    title: 'Boat Reservation',
    mui: { content: { style: { padding: 30, width: '100%' } } },
  },

  content: {
    cardType: 'PiGrid',
    content: (s) => [
      { cardName: 'alert',
        item: true,
        xs: 12, sm: 12, md: 12, lg: 12,
      },
      { cardName: s.step, item: true, xs: 12, sm: 12, md: 12, lg: 12 },
    ],
    spacing: 0,
    // mui: { direction: 'column', },
    // grid: { md: 11, sm: 11, xs: 11 },
  },

  alert: {
    cardType: 'PiAlert',
    message: (s) => s.alertMsg,
    isOpen: (s) => !!s.alertMsg,
    severity: 'error',
    asSnackBar: false,
    withAction: false,
    mui: { style: { marginBottom: 30 } },
  },

  logonForm: {
    cardType: 'PiForm',
    submitLabel: 'Log On',
    fields: [
      {
        id: 'userID', type: 'textField', label: 'User ID', required: true, // grid: { xs: 12, sm: 6 }, mui: {},
      },
      {
        id: 'password', type: 'textField', label: 'Password', required: true, mui: { type: 'password' }, // grid: { xs: 12, sm: 6 }, mui: {},
      },
    ],
  },

  reservationForm: {
    cardType: 'PiForm',
    submitLabel: 'Make Reservation',
    // submitLabel: {label: 'Send Query', disabled: false},
    fields: FORM_FIELDS,
    autoFocus: 'day',
    grid: { md: 11, sm: 11, xs: 11 },
    //   mui: {outer: {style: {paddingTop: 30}}},
    // values: {confirm: 'confirm'},
  },

  reservationOK: {
    cardType: 'PiAlert',
    title: 'Congratulations!',
    message: (s) => {
      const { boatName, from } = s.myReservation;
      const t = moment(from).calendar();
      return `Enjoy your row ${t} with ${boatName}`;
    },
    isOpen: true,
    severity: 'success',
    asSnackBar: false,
    withAction: false,
  },
};

export default { ...page };
