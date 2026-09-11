/**
 * Calibration assessment — six short scenarios, one decision each, that set a
 * scout's starting profile before any training happens.
 *
 * Deltas here are read by `profileFromCalibration`, not applied as training
 * gains. A scout who answers every item strongly starts near 70; one who
 * answers every item weakly starts near 34. Nobody starts at zero.
 */

import type { Scenario } from '../domain/scenario';

export const CALIBRATION_SCENARIOS: Scenario[] = [
  {
    id: 'calib-quiet-patrol-meeting',
    kind: 'calibration',
    title: 'Nobody Answers',
    summary: 'You ask your patrol a question and get silence.',
    setting: 'Patrol corner, Tuesday troop meeting',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['scout', 'tenderfoot', 'second_class', 'first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['communication'],
    estimated_minutes: 1,
    branching_tree: {
      version: 1,
      root: 'ask',
      nodes: {
        ask: {
          id: 'ask',
          type: 'decision',
          prompt:
            'Your patrol is sitting in a circle. You ask, "So who wants to handle food for the campout?" Six scouts look at the floor. Nobody says anything for about ten seconds.',
          choices: [
            {
              id: 'wait-it-out',
              text: 'Wait. Let the silence sit until someone volunteers.',
              deltas: { communication: -1 },
              coaching: {
                text: 'Silence is a real tool, but an open question to a whole group usually gets nothing. The scouts are not refusing — they are waiting to see if it lands on someone else.',
                principle: 'Open questions land on nobody',
              },
              next: 'wrap',
            },
            {
              id: 'name-and-ask',
              text: 'Say, "Marcus, you did food last spring and it went well. Want it again, or want to teach someone else to do it?"',
              deltas: { communication: 3 },
              coaching: {
                text: 'Naming one scout turns a question nobody owns into a question one person has to answer. Offering the teaching option makes it a step up rather than the same chore twice.',
                edge_stage: 'enable',
                principle: 'Ask a person, not a room',
              },
              next: 'wrap',
            },
            {
              id: 'just-do-it',
              text: 'Say, "Fine, I will do food," and move to the next item.',
              deltas: { communication: -2, delegation: -1 },
              coaching: {
                text: 'This ends the silence and teaches the patrol that silence works. Next meeting the pause will be longer, because waiting you out is now the cheapest option.',
                principle: 'Do not reward the wait',
              },
              next: 'wrap',
            },
            {
              id: 'break-it-down',
              text: 'Say, "Okay, food is really three jobs — menu, shopping, and cooler. Who wants the smallest one?"',
              deltas: { communication: 2, planning: 1 },
              coaching: {
                text: 'Breaking one intimidating job into three visible pieces lowers what a scout has to say yes to. It also shows the patrol what the job actually involves.',
                edge_stage: 'explain',
                principle: 'Shrink the ask',
              },
              next: 'wrap',
            },
          ],
        },
        wrap: {
          id: 'wrap',
          type: 'outcome',
          prompt: 'The meeting moves on.',
          debrief:
            'How you ask decides what you get. Specific beats general, and a named scout beats an open room almost every time.',
        },
      },
    },
  },

  {
    id: 'calib-tent-argument',
    kind: 'calibration',
    title: 'Two Scouts, One Tent',
    summary: 'An argument over tent assignments is getting loud.',
    setting: 'Friday night setup, district camporee',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['tenderfoot', 'second_class', 'first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['conflict_resolution'],
    estimated_minutes: 1,
    branching_tree: {
      version: 1,
      root: 'flare',
      nodes: {
        flare: {
          id: 'flare',
          type: 'decision',
          prompt:
            'Tents are half up. Jordan and Eli are arguing about who is tenting with whom, loud enough that the next campsite over is watching. Neither one is backing down.',
          choices: [
            {
              id: 'order-it',
              text: 'Say, "Jordan, you are with Eli. Done," and walk away.',
              deltas: { conflict_resolution: -2 },
              coaching: {
                text: 'It stops the noise and settles nothing. Whatever is actually going on between them comes back at breakfast, and now it comes back with you attached to it.',
                principle: 'Loud is a symptom',
              },
              next: 'wrap',
            },
            {
              id: 'split-and-ask',
              text: 'Pull each one aside separately and ask what is going on.',
              deltas: { conflict_resolution: 3, communication: 1 },
              coaching: {
                text: 'Separating them drops the audience, which is usually half of why it got loud. You also get two versions of the story before you decide anything.',
                principle: 'Separate, then listen',
              },
              next: 'wrap',
            },
            {
              id: 'get-adult',
              text: 'Go get the Scoutmaster.',
              deltas: { conflict_resolution: -1, initiative: -2 },
              coaching: {
                text: 'A tent argument is inside what a patrol leader handles. Save the adults for safety, health, and anything that has stopped being a scout problem.',
                principle: 'Handle your own patrol first',
              },
              next: 'wrap',
            },
            {
              id: 'joke-it-off',
              text: 'Make a joke about it and hope they drop it.',
              deltas: { conflict_resolution: -1, communication: 1 },
              coaching: {
                text: 'Humour can lower the temperature, and that is worth something. It does not answer the question they are actually fighting about, so be ready for round two.',
                principle: 'Defusing is not resolving',
              },
              next: 'wrap',
            },
          ],
        },
        wrap: {
          id: 'wrap',
          type: 'outcome',
          prompt: 'Tents get finished, one way or another.',
          debrief:
            'Most patrol conflict is smaller than it sounds and is mostly about being heard. Getting the audience out of it is usually step one.',
        },
      },
    },
  },

  {
    id: 'calib-gear-before-friday',
    kind: 'calibration',
    title: 'Gear Before Friday',
    summary: 'Patrol gear has to be checked out and you have four scouts.',
    setting: 'Tuesday meeting, three days before the campout',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['tenderfoot', 'second_class', 'first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['delegation'],
    estimated_minutes: 1,
    branching_tree: {
      version: 1,
      root: 'assign',
      nodes: {
        assign: {
          id: 'assign',
          type: 'decision',
          prompt:
            'Patrol gear needs pulling from the trailer before Friday: two tents, the patrol box, a stove, and two water jugs. You have four scouts in front of you and about eight minutes left in the meeting.',
          choices: [
            {
              id: 'do-it-yourself',
              text: 'Handle it yourself Thursday. It is faster than explaining it.',
              deltas: { delegation: -3, initiative: 1 },
              coaching: {
                text: 'It is faster this once, and then it is your job forever. Every time you absorb a task, the patrol learns that gear is the PL problem.',
                principle: 'Fast now, stuck later',
              },
              next: 'wrap',
            },
            {
              id: 'named-pairs',
              text: 'Split it: two scouts on tents, one on the patrol box, one on stove and jugs. Say each name out loud.',
              deltas: { delegation: 3, planning: 1 },
              coaching: {
                text: 'Named jobs with a named deadline are the whole trick. Nobody can assume someone else has the jugs when the jugs have a name on them.',
                edge_stage: 'enable',
                principle: 'A job with no name has no owner',
              },
              next: 'wrap',
            },
            {
              id: 'group-ask',
              text: 'Say, "Everybody grab something from the trailer Thursday," and trust them.',
              deltas: { delegation: -1, communication: -1 },
              coaching: {
                text: 'Trust is right, the instruction is not. "Everybody grab something" reliably produces three stoves and no tents.',
                principle: 'Specific beats trusting',
              },
              next: 'wrap',
            },
            {
              id: 'ask-who-wants',
              text: 'Ask who wants what, then fill the leftovers yourself.',
              deltas: { delegation: 2, communication: 1 },
              coaching: {
                text: 'Letting scouts pick raises the odds they follow through. Just make sure the leftovers get a name too, instead of quietly becoming yours.',
                principle: 'Choice raises follow-through',
              },
              next: 'wrap',
            },
          ],
        },
        wrap: {
          id: 'wrap',
          type: 'outcome',
          prompt: 'The meeting closes.',
          debrief:
            'Delegating is not getting out of work. It is making sure the work has an owner who is not you.',
        },
      },
    },
  },

  {
    id: 'calib-forecast-turns',
    kind: 'calibration',
    title: 'The Forecast Turns',
    summary: 'Rain moves into the weekend forecast Thursday night.',
    setting: 'Thursday evening, day before departure',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['second_class', 'first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['planning'],
    estimated_minutes: 1,
    branching_tree: {
      version: 1,
      root: 'forecast',
      nodes: {
        forecast: {
          id: 'forecast',
          type: 'decision',
          prompt:
            'You check the forecast Thursday night. Saturday went from clear to rain most of the day. The plan was an all-day hike, and the patrol packed for sun.',
          choices: [
            {
              id: 'wait-and-see',
              text: 'Say nothing. Forecasts change, and you will deal with it there.',
              deltas: { planning: -2, initiative: -1 },
              coaching: {
                text: 'Forecasts do change, but the cost of being wrong is lopsided. If you say something and it stays dry, a few scouts carry rain gear for nothing.',
                principle: 'Weigh the cost of being wrong',
              },
              next: 'wrap',
            },
            {
              id: 'text-the-change',
              text: 'Message the patrol tonight: rain gear is now required, and pack a dry set of clothes in a bag.',
              deltas: { planning: 2, communication: 2 },
              coaching: {
                text: 'Tonight is the only time this message is useful, because tomorrow their bags are packed. Naming the specific items beats saying "it might rain".',
                principle: 'Information has an expiry time',
              },
              next: 'wrap',
            },
            {
              id: 'rework-plan',
              text: 'Message the patrol about rain gear, and bring a shorter loop hike to the Friday PLC as a backup.',
              deltas: { planning: 3, communication: 1, initiative: 1 },
              coaching: {
                text: 'Two moves: gear so the day is survivable, and an alternate plan so it is still worth doing. Bringing the backup to the PLC instead of deciding alone keeps the other leaders in it.',
                edge_stage: 'guide',
                principle: 'Have the second plan ready',
              },
              next: 'wrap',
            },
            {
              id: 'cancel',
              text: 'Push to cancel the hike and stay in camp.',
              deltas: { planning: -1 },
              coaching: {
                text: 'Rain by itself is not a reason to cancel — scouts hike in rain all the time. Save cancellation for lightning, real cold with wet gear, or trail conditions that turn dangerous.',
                principle: 'Adjust before you cancel',
              },
              next: 'wrap',
            },
          ],
        },
        wrap: {
          id: 'wrap',
          type: 'outcome',
          prompt: 'Friday comes.',
          debrief:
            'Planning is mostly noticing the thing that changed while there is still time to do something about it.',
        },
      },
    },
  },

  {
    id: 'calib-after-dinner-mess',
    kind: 'calibration',
    title: 'After Dinner',
    summary: 'The campsite is a mess and nothing is on the duty roster for it.',
    setting: 'Saturday evening, patrol campsite',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['scout', 'tenderfoot', 'second_class', 'first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['initiative'],
    estimated_minutes: 1,
    branching_tree: {
      version: 1,
      root: 'mess',
      nodes: {
        mess: {
          id: 'mess',
          type: 'decision',
          prompt:
            'Dinner is done. The cook crew is washing up, but there are wrappers by the fire ring, a stove left out, and someone\'s water bottle in the dirt. None of it is on the duty roster. Scouts are drifting toward the campfire.',
          choices: [
            {
              id: 'not-my-job',
              text: 'Leave it. It is not on the roster and the cook crew will probably get it.',
              deltas: { initiative: -3 },
              coaching: {
                text: 'The roster covers the predictable work. The gap between the roster and what the campsite actually needs is exactly where leadership shows up.',
                principle: 'The roster is a floor, not a ceiling',
              },
              next: 'wrap',
            },
            {
              id: 'quiet-fix',
              text: 'Pick it all up yourself without saying anything.',
              deltas: { initiative: 2, delegation: -2 },
              coaching: {
                text: 'You solved tonight. Nobody else learned that the site needed a sweep, so you will be doing it again tomorrow night.',
                principle: 'Doing it alone teaches nobody',
              },
              next: 'wrap',
            },
            {
              id: 'call-two-minutes',
              text: 'Say, "Two minutes, everyone grabs three things, then campfire," and start picking up.',
              deltas: { initiative: 3, delegation: 2, communication: 1 },
              coaching: {
                text: 'A short time box and a clear number make it something scouts will actually do on the way past. Starting yourself while you say it is the demonstrate step.',
                edge_stage: 'demonstrate',
                principle: 'Time box it and start',
              },
              next: 'wrap',
            },
            {
              id: 'tell-cook-crew',
              text: 'Tell the cook crew to get it when they finish dishes.',
              deltas: { initiative: -1, delegation: 1 },
              coaching: {
                text: 'It has an owner now, which is better than nothing. It also loads more work onto the two scouts already working while five walk past.',
                principle: 'Watch who you keep loading',
              },
              next: 'wrap',
            },
          ],
        },
        wrap: {
          id: 'wrap',
          type: 'outcome',
          prompt: 'The fire gets lit.',
          debrief:
            'Initiative is mostly noticing. The scouts who get asked to lead are usually the ones already picking things up.',
        },
      },
    },
  },

  {
    id: 'calib-new-scout-alone',
    kind: 'calibration',
    title: 'The New Guy',
    summary: 'A new scout has been standing by himself for twenty minutes.',
    setting: 'Saturday afternoon, first campout of the year',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['scout', 'tenderfoot', 'second_class', 'first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['communication', 'initiative'],
    estimated_minutes: 1,
    branching_tree: {
      version: 1,
      root: 'alone',
      nodes: {
        alone: {
          id: 'alone',
          type: 'decision',
          prompt:
            'Theo crossed over from the pack six weeks ago. This is his first campout. Everyone else is throwing a football or messing with the fire, and he has been standing near the tents on his own for about twenty minutes.',
          choices: [
            {
              id: 'leave-him',
              text: 'Leave him be. Some people want space, and he has not asked for anything.',
              deltas: { initiative: -2, communication: -1 },
              coaching: {
                text: 'A new eleven-year-old on his first campout almost never asks. Checking costs you thirty seconds and tells you which it actually is.',
                principle: 'New scouts do not ask',
              },
              next: 'wrap',
            },
            {
              id: 'general-invite',
              text: 'Call over, "Theo, come hang out with us."',
              deltas: { communication: 1, initiative: 1 },
              coaching: {
                text: 'Better than nothing, but it hands him the hard part — walking into a group that is already going. He will probably say he is fine.',
                principle: 'Do not make him cross the gap',
              },
              next: 'wrap',
            },
            {
              id: 'give-him-a-job',
              text: 'Walk over and say, "I need a hand splitting kindling — come on," then introduce him to whoever is at the fire.',
              deltas: { communication: 3, initiative: 3 },
              coaching: {
                text: 'A job gives him a reason to be standing there and something to do with his hands. Handing him off to the fire group means you are not the only person he knows by dinner.',
                edge_stage: 'guide',
                principle: 'A job beats an invitation',
              },
              next: 'wrap',
            },
            {
              id: 'tell-apl',
              text: 'Ask your APL to go include him.',
              deltas: { communication: 1, delegation: 2, initiative: -1 },
              coaching: {
                text: 'Using your APL is legitimate and it is not a dodge. Just be honest about whether you delegated it or avoided it.',
                principle: 'Delegate the task, not the discomfort',
              },
              next: 'wrap',
            },
          ],
        },
        wrap: {
          id: 'wrap',
          type: 'outcome',
          prompt: 'Dinner gets started.',
          debrief:
            'Most of the job is noticing one scout who is not doing fine, and doing something small about it early.',
        },
      },
    },
  },
];
