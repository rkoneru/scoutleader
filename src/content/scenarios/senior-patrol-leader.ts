/**
 * Training scenarios written primarily for Senior Patrol Leaders: working
 * through patrol leaders rather than around them.
 */

import type { Scenario } from '../../domain/scenario';

export const SENIOR_PATROL_LEADER_SCENARIOS: Scenario[] = [
  {
    id: 'plc-runs-long',
    kind: 'training',
    title: 'The PLC That Will Not End',
    summary: 'Forty minutes in, one patrol leader has used most of them.',
    setting: 'Sunday evening PLC, planning the next month',
    role_relevance: ['SPL'],
    rank_relevance: ['star', 'life', 'eagle'],
    primary_dimensions: ['communication', 'planning', 'delegation'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'forty-minutes',
      nodes: {
        'forty-minutes': {
          id: 'forty-minutes',
          type: 'decision',
          prompt:
            'The PLC is scheduled for an hour. You are forty minutes in and have covered one of five agenda items, because Marcus has re-argued the campout destination four times. Two patrol leaders have stopped talking entirely and one is on his phone.',
          choices: [
            {
              id: 'let-it-run',
              text: 'Let it play out. Marcus cares about this and cutting him off would be rude.',
              deltas: { planning: -3, delegation: -1 },
              coaching: {
                text: 'Protecting one scout from being interrupted is costing four others their agenda items. Running the meeting is your job and nobody else at the table can do it.',
                principle: 'Airtime is a resource you allocate',
              },
              next: 'overtime',
            },
            {
              id: 'time-box-it',
              text: 'Say, "Marcus, two more minutes on this, then we vote and move to the November calendar."',
              deltas: { planning: 3, communication: 3 },
              coaching: {
                text: 'A time box plus a named next step ends it without ending him — he knows exactly how much runway he has. Saying the vote is coming makes the two minutes about persuading, not repeating.',
                principle: 'Time box, then decide',
              },
              next: 'after-box',
            },
            {
              id: 'shut-him-down',
              text: 'Say, "Marcus, we have heard you. Moving on," and go to the next item.',
              deltas: { planning: 2, conflict_resolution: -2 },
              coaching: {
                text: 'The agenda is moving again and it cost you the most engaged person in the room. He will bring it back outside the meeting, where you cannot manage it.',
                principle: 'Cut the topic, not the person',
              },
              next: 'after-box',
            },
            {
              id: 'ask-the-quiet',
              text: 'Say, "Before we settle this — Devon, Priya, you two have not said anything. What do your patrols want?"',
              deltas: { communication: 3, delegation: 2, conflict_resolution: 1 },
              coaching: {
                text: 'Bringing in the quiet leaders usually ends a circular argument faster than cutting off the loud one, because the loop was being sustained by having no new input. It also reminds the table that they represent patrols.',
                principle: 'Add voices to end a loop',
              },
              next: 'after-box',
            },
          ],
        },

        'after-box': {
          id: 'after-box',
          type: 'decision',
          prompt:
            'The destination gets settled. You have eighteen minutes and four agenda items: November calendar, meeting segment assignments, the recruiting night, and a gear inventory nobody has done.',
          choices: [
            {
              id: 'rush-all-four',
              text: 'Push through all four in eighteen minutes.',
              deltas: { planning: -1, communication: -1 },
              coaching: {
                text: 'Four items in eighteen minutes produces four decisions nobody can repeat on Tuesday. A meeting that covers everything and lands nothing is the expensive kind.',
                principle: 'Cover less, land it',
              },
              next: 'thin-decisions',
            },
            {
              id: 'triage-agenda',
              text: 'Say, "Calendar and segments now, because they block everyone. Recruiting night and gear go to two people who bring a proposal next PLC."',
              deltas: { planning: 3, delegation: 3 },
              coaching: {
                text: 'Deciding what does not need the whole table is the part of running a PLC that nobody teaches. Two scouts with a proposal beat eighteen rushed minutes of six people.',
                edge_stage: 'enable',
                principle: 'Not everything needs the table',
              },
              next: 'landed-plc',
            },
            {
              id: 'extend-meeting',
              text: 'Extend the meeting by half an hour to get through everything.',
              deltas: { planning: -2, communication: -1 },
              coaching: {
                text: 'You can, once. Do it twice and patrol leaders start finding reasons not to come, and a PLC people avoid is worse than a short one.',
                principle: 'Protect the end time',
              },
              next: 'thin-decisions',
            },
          ],
        },

        'landed-plc': {
          id: 'landed-plc',
          type: 'outcome',
          prompt:
            'The PLC ends four minutes early with two decisions everyone can repeat and two owners assigned. Marcus catches you after and says the destination thing was fair.',
          debrief:
            'An SPL who runs a tight PLC gets patrol leaders who show up. The main levers are a time box, a named decision point, and moving work off the table to individuals.',
          edge_focus: 'enable',
        },

        'thin-decisions': {
          id: 'thin-decisions',
          type: 'outcome',
          prompt:
            'The meeting ends. On Tuesday two patrol leaders have different ideas about what was decided on segments, and the gear inventory still has no owner.',
          debrief:
            'A decision without a named owner and a date is a topic that was discussed. Most of what a PLC produces should be somebody\'s name next to something.',
        },

        overtime: {
          id: 'overtime',
          type: 'outcome',
          prompt:
            'The PLC runs eighty minutes, gets through two items, and two patrol leaders leave early. The next one has three people at it.',
          debrief:
            'Nobody quits a PLC because of one long meeting. They quit because of three, and the SPL is the only person in the room who can prevent that.',
        },
      },
    },
  },

  {
    id: 'patrol-leader-not-leading',
    kind: 'training',
    title: 'The PL Who Is Not Leading',
    summary: 'One patrol is falling apart and its leader is not doing the job.',
    setting: 'Two months into the term',
    role_relevance: ['SPL'],
    rank_relevance: ['star', 'life', 'eagle'],
    primary_dimensions: ['delegation', 'conflict_resolution'],
    estimated_minutes: 5,
    branching_tree: {
      version: 1,
      root: 'the-pattern',
      nodes: {
        'the-pattern': {
          id: 'the-pattern',
          type: 'decision',
          prompt:
            'The Hawk patrol has not had a duty roster in three campouts. Their gear comes back dirty. Two of their scouts have started sitting with other patrols at meetings. Their PL, Brandon, was elected in a landslide and is well liked, and every time you have seen him he is friendly and says it is fine.',
          choices: [
            {
              id: 'run-their-patrol',
              text: 'Start assigning the Hawk patrol\'s jobs yourself at campouts so at least the work gets done.',
              deltas: { delegation: -3, initiative: 1 },
              coaching: {
                text: 'The work gets done and Brandon is now formally irrelevant in his own patrol, in front of his scouts. An SPL who steps over a PL takes the whole troop\'s patrol method with it.',
                principle: 'Never lead a patrol around its leader',
              },
              next: 'undermined',
            },
            {
              id: 'ask-brandon',
              text: 'Sit down with Brandon alone and ask him what the hardest part of the job has been.',
              deltas: { communication: 3, conflict_resolution: 2, delegation: 1 },
              coaching: {
                text: 'Asking what is hard gets you further than asking why the roster is missing, because it does not require him to admit failure first. Most struggling PLs know exactly what is wrong.',
                edge_stage: 'guide',
                principle: 'Ask what is hard, not what is wrong',
              },
              next: 'brandon-opens',
            },
            {
              id: 'tell-scoutmaster',
              text: 'Tell the Scoutmaster that Brandon is not doing the job and ask him to handle it.',
              deltas: { initiative: -2, delegation: -1 },
              coaching: {
                text: 'Coaching patrol leaders is the core of the SPL job — this is the thing, not a distraction from it. Bring the Scoutmaster in after you have tried, and with specifics.',
                principle: 'Coaching PLs is the SPL job',
              },
              next: 'undermined',
            },
            {
              id: 'public-standard',
              text: 'At the next PLC, announce that every patrol will show a duty roster before departure from now on.',
              deltas: { planning: 2, communication: 1, conflict_resolution: -1 },
              coaching: {
                text: 'A troop-wide standard is a fair way to raise the floor without naming anyone. Everyone in that room will know exactly who it is aimed at, so it does not replace the conversation.',
                principle: 'A rule aimed at one person is still aimed',
              },
              next: 'brandon-opens',
            },
          ],
        },

        'brandon-opens': {
          id: 'brandon-opens',
          type: 'decision',
          prompt:
            'Brandon takes a while. Then: "I do not know how to make people do stuff. Like, Jake just does not listen to me and everyone knows it, so if I make the roster and he ignores it I look worse than if there is no roster."',
          choices: [
            {
              id: 'tell-him-to-be-firm',
              text: 'Tell him he needs to be more assertive and hold his patrol accountable.',
              deltas: { communication: -2, delegation: -1 },
              coaching: {
                text: '"Be more assertive" is a description of the outcome, not an instruction he can act on. He just told you the specific thing he is afraid of and it deserves a specific answer.',
                principle: 'Advice has to be a next action',
              },
              next: 'no-change',
            },
            {
              id: 'one-concrete-step',
              text: 'Say, "Forget the whole patrol. This week you do one thing: post the roster before we leave the lot and read it out loud. That is it. I will be standing there."',
              deltas: { delegation: 3, communication: 3, planning: 2 },
              coaching: {
                text: 'One narrow action he can actually complete beats a general call to lead better. Standing there is the guide step — present, not doing it for him.',
                edge_stage: 'guide',
                principle: 'One action, this week',
              },
              next: 'jake-problem',
            },
            {
              id: 'swap-him-out',
              text: 'Tell him it might be better if he stepped down and let the APL take over.',
              deltas: { conflict_resolution: -2, delegation: -2 },
              coaching: {
                text: 'Two months in, with a scout who just told you honestly what he is struggling with, is early to remove someone. Position of responsibility is supposed to be where a scout learns this.',
                principle: 'The position is where they learn it',
              },
              next: 'no-change',
            },
          ],
        },

        'jake-problem': {
          id: 'jake-problem',
          type: 'decision',
          prompt:
            'The roster goes up Friday. Saturday, Jake skips his assignment in front of everyone and says, loudly, "Brandon is not my boss." Brandon looks at you.',
          choices: [
            {
              id: 'step-in-directly',
              text: 'Step in and tell Jake to do his job.',
              deltas: { conflict_resolution: 1, delegation: -3 },
              coaching: {
                text: 'It works right now and proves Brandon cannot make Jake do anything without you. You have confirmed the exact belief that started the problem.',
                principle: 'Solving it for him proves his fear',
              },
              next: 'undermined',
            },
            {
              id: 'back-him-quietly',
              text: 'Catch Brandon\'s eye, stay put, and afterwards tell him what you saw and what you would say to Jake next.',
              deltas: { delegation: 3, conflict_resolution: 3, communication: 2 },
              coaching: {
                text: 'Not stepping in is the hardest and most valuable thing you do here — it leaves the authority where it belongs. The debrief after is where the actual teaching happens.',
                edge_stage: 'guide',
                principle: 'Stay out of it, then coach it',
              },
              next: 'slow-turn',
            },
            {
              id: 'talk-to-jake-later',
              text: 'Say nothing now. Later, talk to Jake alone about how a patrol works, without mentioning Brandon.',
              deltas: { conflict_resolution: 2, delegation: 1, communication: 1 },
              coaching: {
                text: 'Handling Jake out of sight avoids undercutting Brandon in the moment, which is the main risk. Be careful it does not become you quietly running his patrol from behind.',
                principle: 'Quiet help is still help you have to taper',
              },
              next: 'slow-turn',
            },
          ],
        },

        'slow-turn': {
          id: 'slow-turn',
          type: 'outcome',
          prompt:
            'It takes six weeks. The rosters go up every trip, Jake tests it twice more and then stops, and the two scouts who were drifting come back. Brandon is still not a great PL. He is a functioning one.',
          debrief:
            'Coaching a patrol leader is slow and the results are never dramatic. The measure is whether the patrol works when you are not standing there, not whether it looks good this weekend.',
          edge_focus: 'guide',
        },

        undermined: {
          id: 'undermined',
          type: 'outcome',
          prompt:
            'The Hawk patrol\'s work gets done when you are watching. Brandon stops coming to the PLC, and at the next election two scouts run for PL of other patrols rather than his.',
          debrief:
            'An SPL who fixes patrols directly gets a troop of patrols that only run when the SPL is present. That is a harder problem than one weak roster.',
        },

        'no-change': {
          id: 'no-change',
          type: 'outcome',
          prompt:
            'Nothing much changes. Brandon finishes his term quietly, the patrol stays loose, and he does not run for anything again.',
          debrief:
            'General advice feels like coaching and changes nothing. The difference is whether the scout leaves the conversation with one specific thing to do before the next campout.',
        },
      },
    },
  },

  {
    id: 'service-project-short',
    kind: 'training',
    title: 'Half the Volunteers',
    summary: 'Nine scouts signed up for the service project. Four showed up.',
    setting: '8:05 Saturday morning, county park trailhead',
    role_relevance: ['SPL', 'PL'],
    rank_relevance: ['first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['planning', 'initiative'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'headcount',
      nodes: {
        headcount: {
          id: 'headcount',
          type: 'decision',
          prompt:
            'The park ranger is expecting nine scouts to clear two hundred yards of trail and rebuild three water bars. It is 8:05 and you have four scouts, two adults, and the ranger walking over with a clipboard.',
          choices: [
            {
              id: 'start-and-hope',
              text: 'Start on the original plan and hope some more show up.',
              deltas: { planning: -2, initiative: 1 },
              coaching: {
                text: 'Starting beats standing around, so the instinct is not wrong. Committing four scouts to a nine-scout plan means you finish nothing rather than something.',
                principle: 'Do not spread four across nine',
              },
              next: 'noon',
            },
            {
              id: 'rescope-with-ranger',
              text: 'Meet the ranger first: "We are four instead of nine. What is the one piece that matters most if we only get one thing done?"',
              deltas: { planning: 3, communication: 3, initiative: 2 },
              coaching: {
                text: 'The person who owns the trail knows which two hundred yards matter, and asking makes them a partner instead of someone being let down. Rescoping at 8:05 is normal project work, not failure.',
                principle: 'Rescope early and out loud',
              },
              next: 'the-work',
            },
            {
              id: 'chase-the-missing',
              text: 'Spend the first half hour calling and texting the five who did not show.',
              deltas: { planning: -2, initiative: -1 },
              coaching: {
                text: 'You will get two answers and neither will be here before ten. The four scouts who did show are standing in a parking lot watching you work the phone.',
                principle: 'Lead who showed up',
              },
              next: 'noon',
            },
          ],
        },

        'the-work': {
          id: 'the-work',
          type: 'decision',
          prompt:
            'The ranger says the water bars are what actually matter — the trail clearing is cosmetic. Three water bars, four scouts, and one of them is a Tenderfoot who has never used a McLeod.',
          choices: [
            {
              id: 'split-solo',
              text: 'Put one scout on each water bar and take the third yourself, so all three go at once.',
              deltas: { delegation: 1, planning: -1 },
              coaching: {
                text: 'Three parallel jobs finishes faster on paper. The scout who has never done it builds one badly and unsupervised, which is the one the ranger has to redo.',
                principle: 'Parallel is not always faster',
              },
              next: 'noon',
            },
            {
              id: 'teach-then-split',
              text: 'Build the first one together with everyone watching, then split into two pairs for the other two.',
              deltas: { planning: 3, delegation: 3, communication: 2 },
              coaching: {
                text: 'One demonstration up front costs twenty minutes and saves two rebuilds, and everyone can see the standard. Pairing the Tenderfoot rather than leaving him solo is the guide step.',
                edge_stage: 'demonstrate',
                principle: 'Teach once, then parallelise',
              },
              next: 'finished',
            },
            {
              id: 'keep-new-scout-off',
              text: 'Give the Tenderfoot the water jug and trash bags so the experienced scouts can work fast.',
              deltas: { delegation: -2, initiative: -1 },
              coaching: {
                text: 'He came at seven in the morning to do trail work and got handed a trash bag. That is the service project he will remember when the next one gets announced.',
                principle: 'Do not park the new scout',
              },
              next: 'noon',
            },
          ],
        },

        finished: {
          id: 'finished',
          type: 'outcome',
          prompt:
            'Three water bars are in by 11:40, built the same way. The ranger walks them, says they will hold, and asks if the troop wants the trail section again in the spring.',
          debrief:
            'A project that is half staffed is a scoping problem, not a doomed day. Ask the owner what matters, cut to that, and teach once before you split up.',
          edge_focus: 'demonstrate',
        },

        noon: {
          id: 'noon',
          type: 'outcome',
          prompt:
            'At noon there is one finished water bar, one half-built, and about eighty yards of cleared trail. The ranger is polite about it.',
          debrief:
            'Four scouts can do real work in four hours. What burns the morning is trying to run the plan that was written for nine.',
        },
      },
    },
  },

  {
    id: 'recruiting-night',
    kind: 'training',
    title: 'Crossover Night',
    summary: 'Fifteen Webelos and their parents are coming and your troop is not ready.',
    setting: 'Tuesday meeting, one week before the crossover visit',
    role_relevance: ['SPL', 'PL'],
    rank_relevance: ['star', 'life', 'eagle'],
    primary_dimensions: ['planning', 'delegation', 'initiative'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'one-week',
      nodes: {
        'one-week': {
          id: 'one-week',
          type: 'decision',
          prompt:
            'Fifteen Webelos and most of their parents are visiting next Tuesday. Right now the troop\'s meetings run about twenty minutes late, the meeting room has two broken patrol boxes stacked in the corner, and last time a visiting family came, three scouts ran a dodgeball game and the parents watched from the wall.',
          choices: [
            {
              id: 'adults-handle-it',
              text: 'The committee usually handles recruiting. Let them plan it.',
              deltas: { initiative: -3, delegation: -1 },
              coaching: {
                text: 'Parents decide based on whether the scouts look like they run the troop. An adult-run recruiting night quietly answers the question the families came to ask.',
                principle: 'They are watching who runs it',
              },
              next: 'the-night',
            },
            {
              id: 'plan-the-night',
              text: 'Take twenty minutes of tonight\'s PLC to plan it: who greets at the door, what the Webelos actually do for an hour, and who talks to parents.',
              deltas: { planning: 3, initiative: 3, delegation: 2 },
              coaching: {
                text: 'Naming the three jobs is most of the work — door, activity, parents — because each one fails differently if nobody owns it. An hour of Webelos doing something beats an hour of them watching something.',
                principle: 'Name the jobs, not the theme',
              },
              next: 'assigning',
            },
            {
              id: 'do-a-normal-meeting',
              text: 'Run a completely normal meeting so the families see what the troop is actually like.',
              deltas: { planning: -1, communication: 1 },
              coaching: {
                text: 'Being honest about what the troop is like is a defensible call and beats staging something fake. A normal meeting that starts twenty minutes late shows them something you probably did not intend.',
                principle: 'Honest still means prepared',
              },
              next: 'assigning',
            },
          ],
        },

        assigning: {
          id: 'assigning',
          type: 'decision',
          prompt:
            'You have the jobs. Now the people: your two most confident scouts always end up doing the talking, and both are busy that night with a merit badge session.',
          choices: [
            {
              id: 'take-it-yourself',
              text: 'Take the door and the parent conversation yourself. You are the SPL, and it matters.',
              deltas: { delegation: -3, initiative: 1 },
              coaching: {
                text: 'You will do it well and you can only be in one place. The visiting families will meet the SPL and not much of the troop.',
                principle: 'You cannot be three places',
              },
              next: 'the-night',
            },
            {
              id: 'newer-scouts-with-script',
              text: 'Give the door and the Webelos activity to two first-year scouts, and spend ten minutes at Tuesday\'s meeting walking them through exactly what to say and do.',
              deltas: { delegation: 3, communication: 3, planning: 2 },
              coaching: {
                text: 'First-year scouts are the ones the Webelos will actually relate to, and ten minutes of explain-and-demonstrate is what makes it safe to hand them. Pre-briefing is not scripting them, it is removing the guessing.',
                edge_stage: 'explain',
                principle: 'Prepare people you have never used',
              },
              next: 'the-night-ready',
            },
            {
              id: 'wing-the-assignments',
              text: 'Assign the jobs Tuesday night when you see who is there.',
              deltas: { planning: -2, delegation: 1 },
              coaching: {
                text: 'Assigning on the night means nobody arrives having thought about it. The jobs get filled and each one gets done at whatever quality the first available scout can manage cold.',
                principle: 'Assign before the night',
              },
              next: 'the-night',
            },
          ],
        },

        'the-night-ready': {
          id: 'the-night-ready',
          type: 'outcome',
          prompt:
            'Two first-year scouts run the door and a fire-building relay. The Webelos spend the hour doing things. Nine of the fifteen families come back in March.',
          debrief:
            'Recruiting is a planning and delegation problem wearing a different hat. The visiting families are mostly deciding whether the scouts here look like they are running something.',
          edge_focus: 'explain',
        },

        'the-night': {
          id: 'the-night',
          type: 'outcome',
          prompt:
            'The meeting starts fifteen minutes late. The Webelos sit along the wall with their parents for most of it, and four families come back in March.',
          debrief:
            'Nothing went wrong exactly. The families just did not see anything that told them their son would have something to do here in six months.',
        },
      },
    },
  },
];
