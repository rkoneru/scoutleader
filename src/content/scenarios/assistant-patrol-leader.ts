/**
 * Training scenarios written primarily for Assistant Patrol Leaders: leading
 * without the title, and covering when the PL is not there.
 */

import type { Scenario } from '../../domain/scenario';

export const ASSISTANT_PATROL_LEADER_SCENARIOS: Scenario[] = [
  {
    id: 'apl-steps-in',
    kind: 'training',
    title: 'You Are Up',
    summary: 'Your PL is out sick and the campout leaves in two hours.',
    setting: 'Friday afternoon, text message from your PL',
    role_relevance: ['APL', 'PL'],
    rank_relevance: ['second_class', 'first_class', 'star', 'life'],
    primary_dimensions: ['initiative', 'delegation'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'the-text',
      nodes: {
        'the-text': {
          id: 'the-text',
          type: 'decision',
          prompt:
            'Your PL texts you at 3 pm: "Got strep, not coming. Sorry." Departure is 5:30. You do not know who has the patrol box, whether the menu got shopped, or what the patrol signed up to do at the camporee tomorrow.',
          choices: [
            {
              id: 'show-up-and-see',
              text: 'Show up at 5:30 and sort it out in the parking lot with everyone there.',
              deltas: { initiative: -2, planning: -2 },
              coaching: {
                text: 'You have two and a half hours that are worth more than the twenty minutes you will have in the lot. Everything you can find out now is something you are not improvising in front of the patrol.',
                principle: 'Use the time you have now',
              },
              next: 'the-lot',
            },
            {
              id: 'three-texts',
              text: 'Send three texts right now: one to the patrol asking who has the box and the food, one to the PL asking what he already set up, one to the SPL saying you are covering.',
              deltas: { initiative: 3, communication: 3, planning: 2 },
              coaching: {
                text: 'Three short messages in the right direction close most of the unknowns before you leave the house. Telling the SPL matters because he is now planning around a patrol with a different leader.',
                principle: 'Close the unknowns early',
              },
              next: 'the-lot',
            },
            {
              id: 'ask-spl-to-lead',
              text: 'Text the SPL and ask him to run your patrol this weekend since the PL is out.',
              deltas: { initiative: -3, delegation: -1 },
              coaching: {
                text: 'This is the job. Assistant Patrol Leader means you are the patrol leader when the patrol leader is not there, and handing it up is the one move that is clearly not in the role.',
                principle: 'Backing up is the whole job',
              },
              next: 'the-lot',
            },
          ],
        },

        'the-lot': {
          id: 'the-lot',
          type: 'decision',
          prompt:
            'In the parking lot: the patrol box is there, the food is not, and two scouts assumed the campout was cancelled when they heard the PL was sick. One of them, Wes, is a year older than you and has been PL before.',
          choices: [
            {
              id: 'announce-authority',
              text: 'Open with, "The PL is out so I am in charge this weekend, and I need everyone to listen."',
              deltas: { communication: -2, conflict_resolution: -1 },
              coaching: {
                text: 'Announcing that you are in charge is what people do when they are not sure they are. Giving out the first useful instruction establishes it faster than claiming it.',
                principle: 'Authority comes from the first instruction',
              },
              next: 'wes-question',
            },
            {
              id: 'assign-and-move',
              text: 'Say, "Wes, take two guys and do the food run with Mr. Reyes — here is the menu. Everyone else, gear in the truck."',
              deltas: { delegation: 3, initiative: 2, communication: 2 },
              coaching: {
                text: 'Giving the older scout the biggest job is a stronger move than trying to keep him small. Everyone is doing something inside ninety seconds, which is what settles a parking lot.',
                edge_stage: 'enable',
                principle: 'Give the strongest scout the real job',
              },
              next: 'wes-question',
            },
            {
              id: 'defer-to-wes',
              text: 'Tell Wes he should probably run the weekend since he has done it before.',
              deltas: { initiative: -3, delegation: 1 },
              coaching: {
                text: 'Handing the role to whoever is oldest undoes the point of having an APL. Use his experience — asking him what he would do is different from giving him the job.',
                principle: 'Use experience without surrendering the role',
              },
              next: 'wes-question',
            },
          ],
        },

        'wes-question': {
          id: 'wes-question',
          type: 'decision',
          prompt:
            'Saturday morning, in front of the patrol, Wes says, "We should skip the first camporee event and do our own thing. It is going to be boring." Four scouts look at you. He is probably right that it will be boring.',
          choices: [
            {
              id: 'cave',
              text: 'Go with it. He knows the camporee better than you do.',
              deltas: { initiative: -2, conflict_resolution: -1 },
              coaching: {
                text: 'Your patrol signed up and the event count affects the troop. Changing the plan because the loudest scout finds it boring is the decision you will be asked about later.',
                principle: 'Boring is not a reason',
              },
              next: 'loose-weekend',
            },
            {
              id: 'hold-with-reason',
              text: 'Say, "We signed up, so we are going. If it is bad after twenty minutes, come find me and we will figure out the afternoon."',
              deltas: { initiative: 3, communication: 3, conflict_resolution: 2 },
              coaching: {
                text: 'You held the commitment and gave him a real path to be heard, which is what keeps a strong scout working with you rather than against you. The twenty-minute window costs you nothing.',
                principle: 'Hold the line, leave a door',
              },
              next: 'solid-weekend',
            },
            {
              id: 'shut-down',
              text: 'Say, "I am in charge, we are going," and end it.',
              deltas: { conflict_resolution: -2, initiative: 1 },
              coaching: {
                text: 'You got the right outcome and paid more for it than you needed to. "We signed up" is a reason the patrol can accept; "I am in charge" is one they can only comply with.',
                principle: 'Reasons travel further than rank',
              },
              next: 'solid-weekend',
            },
          ],
        },

        'solid-weekend': {
          id: 'solid-weekend',
          type: 'outcome',
          prompt:
            'The patrol does the event, places fourth, and complains about it cheerfully all afternoon. On Sunday the SPL asks you who ran the patrol, because it looked like it ran fine.',
          debrief:
            'Covering for a PL is not a lesser version of the job. Most of it is closing unknowns early and giving the first clear instruction before anyone else fills the gap.',
          edge_focus: 'enable',
        },

        'loose-weekend': {
          id: 'loose-weekend',
          type: 'outcome',
          prompt:
            'The patrol skips the event, the troop is short a patrol in the standings, and the SPL asks you about it Sunday in front of the other leaders.',
          debrief:
            'The weekend was survivable. What it cost was the answer to "can this patrol run without its PL", and that answer follows you into the next position.',
        },
      },
    },
  },

  {
    id: 'homesick-first-night',
    kind: 'training',
    title: 'First Night at Camp',
    summary: 'An eleven-year-old is crying behind the tents and does not want anyone to know.',
    setting: 'Sunday night, first night of summer camp',
    role_relevance: ['APL', 'PL', 'SPL'],
    rank_relevance: ['first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['communication', 'initiative'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'find-him',
      nodes: {
        'find-him': {
          id: 'find-him',
          type: 'decision',
          prompt:
            'It is about 9:40. You go behind the tent line to get something out of your pack and find Elias sitting against a tree, crying, phone in his hand. He sees you and wipes his face fast. This is his first week away from home.',
          choices: [
            {
              id: 'back-away',
              text: 'Back off and pretend you did not see. He clearly does not want anyone to know.',
              deltas: { initiative: -3, communication: -1 },
              coaching: {
                text: 'He does not want the patrol to know, which is not the same as wanting to be alone. Leaving now confirms to him that it is the kind of thing people walk away from.',
                principle: 'Private is not the same as alone',
              },
              next: 'morning-after',
            },
            {
              id: 'sit-down',
              text: 'Sit down a few feet away without saying much, and wait.',
              deltas: { communication: 3, initiative: 2 },
              coaching: {
                text: 'Sitting rather than standing over him drops the pressure, and not talking first means he is not being interrogated at the worst moment of his day. This is usually the fastest way in.',
                principle: 'Sit down and wait',
              },
              next: 'he-talks',
            },
            {
              id: 'cheer-up',
              text: 'Say, "Hey, you are fine, it is only a week — tomorrow is the climbing tower, it is awesome."',
              deltas: { communication: -2, initiative: 1 },
              coaching: {
                text: 'You noticed and you engaged, which beats walking away. Telling an upset eleven-year-old that he is fine mostly teaches him not to mention it again.',
                principle: 'Do not argue with how he feels',
              },
              next: 'he-talks',
            },
            {
              id: 'straight-to-adult',
              text: 'Go get the Scoutmaster right away — homesickness is an adult issue.',
              deltas: { initiative: -1, communication: 1 },
              coaching: {
                text: 'Adults do need to know at some point tonight, especially if he is asking to go home. Leading with it means his first experience of being upset at camp is being reported.',
                principle: 'Loop adults in, do not open with them',
              },
              next: 'morning-after',
            },
          ],
        },

        'he-talks': {
          id: 'he-talks',
          type: 'decision',
          prompt:
            'After a while he says, "I texted my mom to come get me. She said to ask you guys." He is not being dramatic about it. He just wants to go home.',
          choices: [
            {
              id: 'one-day-deal',
              text: 'Say, "Okay. Do one day. Tomorrow night if you still want to go, I will walk you to the Scoutmaster myself and I will not make it weird."',
              deltas: { communication: 3, conflict_resolution: 2, initiative: 2 },
              coaching: {
                text: 'A short commitment he can actually see the end of beats "give it a week", and promising to help him leave means you are on his side rather than blocking him. Most homesickness breaks inside forty-eight hours once there is something to do.',
                principle: 'Shrink the commitment',
              },
              next: 'tuesday',
            },
            {
              id: 'talk-him-out',
              text: 'Tell him nobody goes home from camp and he will regret it.',
              deltas: { communication: -2, conflict_resolution: -1 },
              coaching: {
                text: 'He might regret it, and that is not an argument that reaches a homesick eleven-year-old at 9:40 pm. You have also told him the answer is no from the one person he was willing to talk to.',
                principle: 'Do not close the only open door',
              },
              next: 'morning-after',
            },
            {
              id: 'get-adult-with-him',
              text: 'Say, "That is a real thing and it is not mine to decide. Come with me and we will tell Mr. Boyd together — I will stay with you."',
              deltas: { communication: 2, initiative: 2 },
              coaching: {
                text: 'A scout asking to leave camp is genuinely an adult decision and you are right to move it there. Walking in with him instead of sending him is what keeps it from feeling like being turned in.',
                principle: 'Walk them in, do not send them',
              },
              next: 'tuesday',
            },
          ],
        },

        tuesday: {
          id: 'tuesday',
          type: 'outcome',
          prompt:
            'Elias stays. Monday is rough. By Tuesday he has a partner in swimming class and has stopped checking his phone at dinner. On Friday he asks whether the troop does winter camp.',
          debrief:
            'Homesickness is not solved by arguing about it. It is solved by a short horizon, something to do tomorrow, and one person who noticed without making it public.',
          edge_focus: 'guide',
        },

        'morning-after': {
          id: 'morning-after',
          type: 'outcome',
          prompt:
            'Elias goes home Monday afternoon. He does not come back in the fall, and the troop loses a scout it never really had.',
          debrief:
            'Sometimes a scout goes home and that is the right call. The part worth looking at is whether anyone sat down with him before the decision got made for him.',
        },
      },
    },
  },

  {
    id: 'plc-report-back',
    kind: 'training',
    title: 'Reporting Back',
    summary: 'You went to the PLC for your PL and now have to bring it back to the patrol.',
    setting: 'Right after the PLC, before the troop meeting starts',
    role_relevance: ['APL', 'PL'],
    rank_relevance: ['second_class', 'first_class', 'star', 'life'],
    primary_dimensions: ['communication', 'planning'],
    estimated_minutes: 3,
    branching_tree: {
      version: 1,
      root: 'walk-out',
      nodes: {
        'walk-out': {
          id: 'walk-out',
          type: 'decision',
          prompt:
            'You sat in on the PLC in your PL\'s place. Four things got decided: the November campout moved to the 14th, each patrol owes a meeting segment, dues are going up five dollars, and the troop needs two scouts for a service project on the 8th. You have about four minutes before the meeting starts.',
          choices: [
            {
              id: 'tell-pl-only',
              text: 'Send it all to your PL and let him tell the patrol next week.',
              deltas: { communication: -2, initiative: -1 },
              coaching: {
                text: 'By next week the service project is three days out and nobody has signed up. Information that has a date on it does not keep.',
                principle: 'Dated information does not keep',
              },
              next: 'next-week',
            },
            {
              id: 'dump-it-all',
              text: 'Read all four items to the patrol in the next four minutes.',
              deltas: { communication: 1, planning: -1 },
              coaching: {
                text: 'Everything got said, which is better than nothing getting said. Four items in four minutes to a patrol that is half paying attention means they will remember roughly one.',
                principle: 'Four items is three too many',
              },
              next: 'next-week',
            },
            {
              id: 'lead-with-action',
              text: 'Lead with the two things that need something from them tonight — the service project sign-up and who takes the meeting segment — and send the date and dues in the group chat after.',
              deltas: { communication: 3, planning: 3 },
              coaching: {
                text: 'Sorting by what needs a decision tonight versus what just needs to be known is most of good reporting. The chat handles the reference material without spending the patrol\'s attention on it.',
                principle: 'Separate decisions from announcements',
              },
              next: 'good-handoff',
            },
          ],
        },

        'good-handoff': {
          id: 'good-handoff',
          type: 'decision',
          prompt:
            'You get two volunteers for the service project inside a minute. For the meeting segment, nobody moves — the patrol has been assigned this three times and it has landed on the same two scouts every time.',
          choices: [
            {
              id: 'same-two',
              text: 'Ask the same two. They are reliable and it is easier.',
              deltas: { delegation: -2, communication: -1 },
              coaching: {
                text: 'Reliable scouts get used until they are done being reliable. Three in a row is where a patrol starts sorting itself into the ones who do things and the ones who do not.',
                principle: 'Rotate before you burn them',
              },
              next: 'next-week',
            },
            {
              id: 'pair-new-with-old',
              text: 'Pair one of the two reliable scouts with someone who has never run a segment, and tell the experienced one his job is to let the other one talk.',
              deltas: { delegation: 3, communication: 2, initiative: 1 },
              coaching: {
                text: 'This is the enable step done deliberately — the experienced scout is there as a backstop, not a presenter. It is also how the pool of scouts who can run a segment gets bigger.',
                edge_stage: 'enable',
                principle: 'Pair to widen the pool',
              },
              next: 'good-handoff-end',
            },
          ],
        },

        'good-handoff-end': {
          id: 'good-handoff-end',
          type: 'outcome',
          prompt:
            'Two scouts run the segment next week. It is rough in the middle and finishes fine. The one who had never done it asks to take the next one alone.',
          debrief:
            'Bringing information back from the PLC is a real job, not a formality. Sorting it by what the patrol has to decide tonight is what makes it useful instead of noise.',
          edge_focus: 'enable',
        },

        'next-week': {
          id: 'next-week',
          type: 'outcome',
          prompt:
            'At the next meeting two scouts find out the campout moved by hearing their parents talk about it. The service project runs two scouts short.',
          debrief:
            'A patrol that hears things late stops planning around them at all. Most of the fix is deciding what has to be said out loud tonight and what can go in a message.',
        },
      },
    },
  },
];
