/**
 * Training scenarios written primarily for Patrol Leaders: direct peer
 * situations inside one patrol.
 */

import type { Scenario } from '../../domain/scenario';

export const PATROL_LEADER_SCENARIOS: Scenario[] = [
  {
    id: 'dish-duty-drift',
    kind: 'training',
    title: 'Dish Duty Drift',
    summary: 'A scout in your patrol has skipped cleanup twice this weekend.',
    setting: 'Sunday morning, second day of a fall campout',
    role_relevance: ['PL', 'APL'],
    rank_relevance: ['second_class', 'first_class', 'star', 'life'],
    primary_dimensions: ['conflict_resolution', 'delegation'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'notice',
      nodes: {
        notice: {
          id: 'notice',
          type: 'decision',
          prompt:
            'Cole is on the duty roster for cleanup both nights. Friday he disappeared to the latrine and came back when the pots were done. Last night he did the same thing. Two other scouts covered for him and one of them just said something to you about it.',
          speaker: 'Ramon',
          line: '"I am not doing his pots again tonight."',
          choices: [
            {
              id: 'public-callout',
              text: 'Say it at the patrol site where everyone can hear: "Cole, you are on dishes and you keep bailing."',
              deltas: { conflict_resolution: -2, communication: -1 },
              coaching: {
                text: 'Correcting a scout in front of his patrol turns a work problem into a status problem, and he will defend his status before he fixes the work. Praise can be public; correction almost never should be.',
                principle: 'Correct in private',
              },
              next: 'public-reaction',
            },
            {
              id: 'pull-aside',
              text: 'Wait until after breakfast, walk over to him away from the others, and bring it up.',
              deltas: { conflict_resolution: 2, communication: 2 },
              coaching: {
                text: 'No audience means he does not have to protect anything, which is most of what makes these conversations go badly. It also signals you are handling it rather than staging it.',
                principle: 'Drop the audience first',
              },
              next: 'aside-opening',
            },
            {
              id: 'quiet-reassign',
              text: 'Move Cole off dishes on tonight\'s roster and put Ramon on it instead. Avoid the conversation.',
              deltas: { delegation: -2, conflict_resolution: -2, planning: 1 },
              coaching: {
                text: 'The pots get washed and the actual problem gets bigger. You have also just told the scout who complained that the reward for doing his job is more work.',
                principle: 'Do not tax the reliable',
              },
              next: 'reassign-fallout',
            },
          ],
        },

        'public-reaction': {
          id: 'public-reaction',
          type: 'decision',
          prompt:
            'Cole goes red. "I did dishes Friday. Ramon just wants to be in charge." Two scouts laugh. Everyone is watching you now instead of packing.',
          choices: [
            {
              id: 'double-down',
              text: 'Hold your ground in front of everyone: "You did not, and you know it."',
              deltas: { conflict_resolution: -3, communication: -1 },
              coaching: {
                text: 'Now it is about which of you is right in front of witnesses, and no version of that ends with clean pots. Being correct is not the same as getting the outcome.',
                principle: 'Winning the exchange is not the goal',
              },
              next: 'rough-landing',
            },
            {
              id: 'move-it-private',
              text: 'Say, "Fair — let us talk about it over by the trailer," and walk away from the group.',
              deltas: { conflict_resolution: 2, communication: 2 },
              coaching: {
                text: 'You cannot unstart it, but you can end the public part in one sentence. Taking the blame off him in front of the others makes the private conversation possible.',
                principle: 'You can always leave the audience',
              },
              next: 'aside-opening',
            },
            {
              id: 'drop-it',
              text: 'Say, "Whatever, forget it," and go back to packing.',
              deltas: { conflict_resolution: -1, initiative: -2 },
              coaching: {
                text: 'You raised it, lost the room, and dropped it. The patrol now knows that pushing back works, and Ramon knows nothing is coming.',
                principle: 'Do not start what you will not finish',
              },
              next: 'rough-landing',
            },
          ],
        },

        'aside-opening': {
          id: 'aside-opening',
          type: 'decision',
          prompt:
            'It is just the two of you by the trailer. Cole is looking at the ground, arms crossed, waiting for you to start.',
          choices: [
            {
              id: 'ask-open',
              text: 'Say, "You have been off for dishes twice. What is going on?" — then stop talking.',
              deltas: { conflict_resolution: 3, communication: 3 },
              coaching: {
                text: 'Naming the fact and then going quiet gives him room to say the real reason, which is often not what you assumed. The silence after the question is the part most people skip.',
                edge_stage: 'guide',
                principle: 'Name the fact, then be quiet',
              },
              next: 'reason-surfaces',
            },
            {
              id: 'state-standard',
              text: 'Say, "Everyone does their roster job. You are on pots tonight and I will be there."',
              deltas: { conflict_resolution: 1, communication: 2, delegation: 1 },
              coaching: {
                text: 'Clear, fair, and it applies to everyone rather than singling him out. You may still be solving the wrong problem if there is a reason behind it.',
                edge_stage: 'explain',
                principle: 'Same standard for everyone',
              },
              next: 'reason-surfaces',
            },
            {
              id: 'soft-pass',
              text: 'Say, "Just try to be around at cleanup, okay?" and leave it there.',
              deltas: { conflict_resolution: -1, communication: -2 },
              coaching: {
                text: 'You had the private conversation and then did not actually say anything in it. "Try to be around" is not a standard he can meet or miss.',
                principle: 'Vague asks get vague results',
              },
              next: 'soft-landing',
            },
          ],
        },

        'reason-surfaces': {
          id: 'reason-surfaces',
          type: 'decision',
          prompt:
            'Cole shrugs. "I do not know how you guys do the grease thing. Last time I did it wrong and Ramon redid all of it in front of everybody. So I just leave."',
          choices: [
            {
              id: 'teach-it',
              text: 'Say, "That is fixable. Come to the wash line tonight, I will run the three pots with you, then you have got it."',
              deltas: { delegation: 3, communication: 2, conflict_resolution: 2 },
              coaching: {
                text: 'This is the whole EDGE sequence in one move — you explain it, do the first pot with him, then let him run the rest. An avoidance problem was really a skill problem.',
                edge_stage: 'demonstrate',
                principle: 'Avoidance is often missing skill',
              },
              next: 'good-landing',
            },
            {
              id: 'talk-to-ramon',
              text: 'Say, "I will talk to Ramon about redoing people\'s work in front of everyone." Leave the dishes part for later.',
              deltas: { conflict_resolution: 2, communication: 1, delegation: -1 },
              coaching: {
                text: 'You caught the half of this that Cole could not fix himself, and that matters. Cole still does not know how to degrease a pot, so tonight is likely a repeat.',
                principle: 'Fix both halves',
              },
              next: 'soft-landing',
            },
            {
              id: 'minimize',
              text: 'Say, "Nobody cares about that. Just do the job."',
              deltas: { conflict_resolution: -3, communication: -2 },
              coaching: {
                text: 'He told you the real reason, which is the hard part, and you told him it did not count. He will not tell you the real reason next time.',
                principle: 'Do not punish honesty',
              },
              next: 'rough-landing',
            },
          ],
        },

        'reassign-fallout': {
          id: 'reassign-fallout',
          type: 'decision',
          prompt:
            'You quietly swap the roster. Ramon sees it, looks at you, and does not say anything. Cole notices too and does not say anything either.',
          choices: [
            {
              id: 'course-correct',
              text: 'Put the roster back and go find Cole before dinner.',
              deltas: { conflict_resolution: 2, initiative: 2 },
              coaching: {
                text: 'Backing out of a bad call the same day costs almost nothing. Letting it stand all weekend costs you the scout who was covering.',
                principle: 'Reverse small mistakes fast',
              },
              next: 'aside-opening',
            },
            {
              id: 'leave-it',
              text: 'Leave it. It is one more night and then everyone goes home.',
              deltas: { conflict_resolution: -2, delegation: -2, initiative: -2 },
              coaching: {
                text: 'It is never one more night. Next campout the roster is the same, the pattern is established, and Ramon has stopped volunteering.',
                principle: 'Patterns outlive weekends',
              },
              next: 'rough-landing',
            },
          ],
        },

        'good-landing': {
          id: 'good-landing',
          type: 'outcome',
          prompt:
            'Cole does pots that night with you standing there for the first one. He does the other two on his own, badly at first, then fine. Ramon leaves it alone.',
          debrief:
            'A scout who keeps ducking a job is usually avoiding something specific — not knowing how, or being embarrassed in front of the patrol. You only find that out by asking and then not filling the silence.',
          edge_focus: 'demonstrate',
        },

        'soft-landing': {
          id: 'soft-landing',
          type: 'outcome',
          prompt:
            'Cole shows up for cleanup, hangs back, and does about half of it. Nobody says anything about it.',
          debrief:
            'Half-addressing something buys you one quiet night. The scouts who covered for him are keeping a tally even when they stop mentioning it.',
        },

        'rough-landing': {
          id: 'rough-landing',
          type: 'outcome',
          prompt:
            'Cole does not come to cleanup. Ramon does the pots, slowly, making sure you can see him doing it.',
          debrief:
            'Nothing here was unrecoverable. The cost was not the pots — it was that two scouts now believe the roster only applies to whoever cannot get out of it.',
        },
      },
    },
  },

  {
    id: 'grubmaster-empty-handed',
    kind: 'training',
    title: 'Grubmaster, Empty-Handed',
    summary: 'Your grubmaster shows up at departure with no food.',
    setting: 'Friday 5:40 pm, church parking lot, trucks loading',
    role_relevance: ['PL', 'APL'],
    rank_relevance: ['second_class', 'first_class', 'star', 'life'],
    primary_dimensions: ['planning', 'delegation'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'arrival',
      nodes: {
        arrival: {
          id: 'arrival',
          type: 'decision',
          prompt:
            'Departure is in twenty minutes. Nathan volunteered to be grubmaster two weeks ago. He just walked up with a backpack and nothing else. "My mom said we would do it after school and then she had to work."',
          choices: [
            {
              id: 'blow-up',
              text: 'Say, "Are you serious? You had two weeks," in front of the loading crew.',
              deltas: { conflict_resolution: -2, communication: -1 },
              coaching: {
                text: 'Twenty minutes before departure is the worst possible time to spend on who is at fault. Nothing you say right now buys food.',
                principle: 'Fix first, review later',
              },
              next: 'triage',
            },
            {
              id: 'triage-now',
              text: 'Say, "Okay. Tell me what we do have," and start counting what is already in the patrol box.',
              deltas: { planning: 3, initiative: 2 },
              coaching: {
                text: 'You moved straight to the only question that matters before the trucks leave. Knowing what is actually in the box is the difference between one problem and a weekend of them.',
                principle: 'Inventory before decisions',
              },
              next: 'triage',
            },
            {
              id: 'tell-adult',
              text: 'Go tell the Scoutmaster the patrol has no food and ask what to do.',
              deltas: { initiative: -2, planning: -1, communication: 1 },
              coaching: {
                text: 'You will need to tell an adult — someone is driving to a store. Leading with "what do we do" instead of "here is our plan, we need a driver" hands your patrol\'s problem to an adult.',
                principle: 'Bring a plan, not just a problem',
              },
              next: 'triage',
            },
        ],
        },

        triage: {
          id: 'triage',
          type: 'decision',
          prompt:
            'The patrol box has a bag of rice, two cans of chili, oatmeal packets, and a half bottle of oil. That is one dinner and a thin breakfast for six scouts, for a two-night campout. There is a grocery store four minutes from the campground.',
          choices: [
            {
              id: 'nathan-owns-it',
              text: 'Tell Nathan: "You are still grubmaster. Write a list for two dinners and two breakfasts on the drive. We stop at the store on the way in — I will ask Mr. Alvarez."',
              deltas: { delegation: 3, planning: 2, communication: 2 },
              coaching: {
                text: 'Leaving the job with the scout who dropped it is the harder call and the right one — you replaced the failure with a chance to fix it. You handled the part he cannot, which is getting an adult and a vehicle.',
                edge_stage: 'enable',
                principle: 'Let people recover their own job',
              },
              next: 'store-stop',
            },
            {
              id: 'take-it-over',
              text: 'Take the menu yourself. Nathan clearly cannot handle it.',
              deltas: { delegation: -3, planning: 1 },
              coaching: {
                text: 'The weekend gets fed and Nathan learns that dropping a job means someone else picks it up. You have also added grubmaster to everything else you are doing this weekend.',
                principle: 'Rescuing teaches the wrong lesson',
              },
              next: 'store-stop',
            },
            {
              id: 'stretch-it',
              text: 'Skip the store. Stretch what is in the box and make it work.',
              deltas: { planning: -2, initiative: 1 },
              coaching: {
                text: 'Six scouts on rice and oatmeal for two days is not toughness, it is a planning failure with extra steps. Cold, hungry scouts make worse decisions on Saturday.',
                principle: 'Do not make scouts pay for a fixable gap',
              },
              next: 'lean-weekend',
            },
          ],
        },

        'store-stop': {
          id: 'store-stop',
          type: 'decision',
          prompt:
            'The store stop works. Bags are in the truck and the patrol is setting up by dark. Sunday afternoon, gear is unloaded and Nathan is standing around waiting to see if you are going to say something.',
          choices: [
            {
              id: 'no-debrief',
              text: 'Say nothing. It worked out and the weekend was fine.',
              deltas: { communication: -2, planning: -1 },
              coaching: {
                text: 'Skipping the conversation means the only lesson available is "it worked out". The next grubmaster job will go the same way.',
                principle: 'The debrief is where it sticks',
              },
              next: 'lean-weekend',
            },
            {
              id: 'fix-the-system',
              text: 'Say, "That was close. Next time the menu is due at the Tuesday meeting, not Friday — I will ask you for it then." ',
              deltas: { planning: 3, delegation: 2, communication: 2 },
              coaching: {
                text: 'You changed the deadline instead of just changing your opinion of Nathan. A checkpoint three days early turns a disaster into a small fixable miss.',
                edge_stage: 'explain',
                principle: 'Move the deadline forward',
              },
              next: 'solid-weekend',
            },
            {
              id: 'blame-debrief',
              text: 'Say, "You almost wrecked the campout for everybody."',
              deltas: { conflict_resolution: -2, communication: -1 },
              coaching: {
                text: 'He knows. Saying it out loud on Sunday costs you the chance that he volunteers for anything again.',
                principle: 'Say the thing that changes next time',
              },
              next: 'lean-weekend',
            },
          ],
        },

        'lean-weekend': {
          id: 'lean-weekend',
          type: 'outcome',
          prompt:
            'The patrol eats thin, complains about it Saturday, and nobody volunteers for grubmaster at the next meeting.',
          debrief:
            'The food was recoverable in about fifteen minutes. What is harder to recover is a patrol that has learned volunteering for a job is how you end up blamed.',
        },

        'solid-weekend': {
          id: 'solid-weekend',
          type: 'outcome',
          prompt:
            'Nathan brings a menu to the Tuesday meeting before you ask for it. It is not a great menu, but it is two weeks early.',
          debrief:
            'Most dropped jobs are not attitude problems — they are deadline problems. Moving the checkpoint earlier gives you room to catch it while it is still small.',
          edge_focus: 'enable',
        },
      },
    },
  },

  {
    id: 'two-scouts-one-story',
    kind: 'training',
    title: 'Two Scouts, One Story',
    summary: 'Two scouts give you completely different accounts of the same thing.',
    setting: 'Saturday afternoon, summer camp campsite',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['conflict_resolution', 'communication'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'report',
      nodes: {
        report: {
          id: 'report',
          type: 'decision',
          prompt:
            'Devin tells you that Sam went through his pack and took his knife. Sam says Devin lent it to him Thursday and is now "making it a thing". They are both certain, both loud, and both looking at you.',
          choices: [
            {
              id: 'pick-a-side',
              text: 'Decide who you believe based on what you know about each of them.',
              deltas: { conflict_resolution: -3 },
              coaching: {
                text: 'Deciding on reputation means the scout with the better standing wins every dispute, which is exactly how a patrol stops bringing you things. You have not asked a single question yet.',
                principle: 'Never rule on reputation',
              },
              next: 'ruling-fallout',
            },
            {
              id: 'both-separately',
              text: 'Separate them. Talk to each one alone and ask for the whole sequence — where, when, who else was around.',
              deltas: { conflict_resolution: 3, communication: 2 },
              coaching: {
                text: 'Detail is what tells two honest misunderstandings apart from one scout covering. Asking for the sequence rather than "what happened" gets you facts that can be checked.',
                principle: 'Ask for the sequence',
              },
              next: 'details-emerge',
            },
            {
              id: 'make-them-shake',
              text: 'Tell them both to drop it and shake hands.',
              deltas: { conflict_resolution: -1, communication: -1 },
              coaching: {
                text: 'A forced handshake ends the noise in front of you and nothing else. Whichever one is actually right now believes that being right does not matter.',
                principle: 'Quiet is not resolved',
              },
              next: 'ruling-fallout',
            },
          ],
        },

        'details-emerge': {
          id: 'details-emerge',
          type: 'decision',
          prompt:
            'Alone, Devin says he lent Sam a different knife back in the spring and never got it back, and today he saw his own knife in Sam\'s hand. Sam, alone, says Devin handed it to him at the trading post Thursday and that Devin does this. Neither one has a witness.',
          choices: [
            {
              id: 'declare-verdict',
              text: 'Decide Sam is lying and tell him to give it back.',
              deltas: { conflict_resolution: -2, communication: -1 },
              coaching: {
                text: 'You do not have enough to decide, and guessing at a verdict is how you end up wrong in front of everyone. There is a version of this where both of them believe what they are saying.',
                principle: 'Do not rule on a coin flip',
              },
              next: 'ruling-fallout',
            },
            {
              id: 'fix-forward',
              text: 'Bring them together and say, "I cannot prove what happened Thursday. Here is what we do from here: the knife goes back to Devin, and nobody in this patrol borrows gear without the owner saying it out loud in front of someone else."',
              deltas: { conflict_resolution: 3, communication: 3, planning: 1 },
              coaching: {
                text: 'Being straight that you cannot establish the past is more credible than a guess, and it lets you spend your authority on the rule instead of the verdict. The new rule prevents the next one.',
                edge_stage: 'explain',
                principle: 'Rule on the future, not the past',
              },
              next: 'workable-peace',
            },
            {
              id: 'escalate',
              text: 'Take it to the Scoutmaster — a knife and an accusation of stealing is above you.',
              deltas: { conflict_resolution: 1, communication: 1 },
              coaching: {
                text: 'A theft accusation at camp is a reasonable thing to loop an adult into, and you are not wrong to. Go in with what each scout said and what you have already ruled out, so the adult is adding judgement rather than starting over.',
                principle: 'Escalate with your work attached',
              },
              next: 'adult-involved',
            },
          ],
        },

        'ruling-fallout': {
          id: 'ruling-fallout',
          type: 'decision',
          prompt:
            'Whichever way you called it, the scout on the losing end has stopped talking to you. By dinner the patrol has quietly picked sides and two scouts are eating apart from everyone.',
          choices: [
            {
              id: 'go-back',
              text: 'Go back to the scout you ruled against, tell him you called it too fast, and ask him to walk you through it again.',
              deltas: { conflict_resolution: 3, communication: 2, initiative: 2 },
              coaching: {
                text: 'Saying you got ahead of yourself costs less standing than defending a call you are not sure of. Scouts extend a lot of credit to a leader who reopens something.',
                principle: 'You are allowed to reopen it',
              },
              next: 'workable-peace',
            },
            {
              id: 'hold-the-line',
              text: 'Hold the call. Reversing it would make you look like you can be pushed around.',
              deltas: { conflict_resolution: -2, communication: -1 },
              coaching: {
                text: 'Consistency is worth something, but not when what you are being consistent about is a guess. The patrol reads it as "he decides and then defends it", which is not the same as fair.',
                principle: 'Firm is not the same as right',
              },
              next: 'cold-patrol',
            },
          ],
        },

        'workable-peace': {
          id: 'workable-peace',
          type: 'outcome',
          prompt:
            'Neither scout is happy. Both accept it. The gear rule holds for the rest of the week, and by Wednesday they are on the same volleyball team without discussing it.',
          debrief:
            'Most peer disputes cannot be proved, and trying to is the trap. You get further by being honest about what you do not know and being specific about what happens next.',
          edge_focus: 'explain',
        },

        'adult-involved': {
          id: 'adult-involved',
          type: 'outcome',
          prompt:
            'The Scoutmaster talks to both scouts and to a camp staffer who was at the trading post Thursday. It gets sorted out that afternoon.',
          debrief:
            'Bringing in an adult is not losing. Doing it with your own work attached is what separates escalating from handing it off.',
        },

        'cold-patrol': {
          id: 'cold-patrol',
          type: 'outcome',
          prompt:
            'The split holds through the week. Nobody brings you anything else, including two things you would have wanted to know about.',
          debrief:
            'The real cost of a bad ruling is not that one scout is upset. It is that the patrol stops telling you things early, while they are still small.',
        },
      },
    },
  },

  {
    id: 'frozen-out',
    kind: 'training',
    title: 'Frozen Out',
    summary: 'A scout who transferred into your patrol is being left out of everything.',
    setting: 'Third troop meeting since the patrol reshuffle',
    role_relevance: ['PL', 'APL'],
    rank_relevance: ['second_class', 'first_class', 'star', 'life'],
    primary_dimensions: ['conflict_resolution', 'communication'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'pattern',
      nodes: {
        pattern: {
          id: 'pattern',
          type: 'decision',
          prompt:
            'Owen moved into your patrol when the troop reorganised. Nobody is mean to him. He just never gets picked, never gets asked, and when the patrol jokes about last year he has nothing to say. Tonight he sat one chair outside the circle for the whole meeting and nobody moved over.',
          choices: [
            {
              id: 'lecture-patrol',
              text: 'Tell the patrol they need to include Owen and that it is not Scoutlike to leave someone out.',
              deltas: { communication: -1, conflict_resolution: -1 },
              coaching: {
                text: 'You are right on the substance, and a lecture makes Owen the kid who needed the PL to make people be nice to him. That is worse for him than where he started.',
                principle: 'Do not make him the project',
              },
              next: 'after-lecture',
            },
            {
              id: 'ask-owen',
              text: 'Catch Owen on the way out and ask him how it is going in the patrol.',
              deltas: { communication: 3, conflict_resolution: 1 },
              coaching: {
                text: 'Asking him first means you find out whether he is unhappy or just quiet, which changes what you should do. He may also tell you something specific you had not seen.',
                principle: 'Ask before you fix',
              },
              next: 'owens-answer',
            },
            {
              id: 'structural-fix',
              text: 'Say nothing to anyone. Put Owen and two others on a job together for the campout and let it work itself out.',
              deltas: { delegation: 2, planning: 2, communication: -1 },
              coaching: {
                text: 'Shared work builds more than announcements do, so the instinct is good. Doing it without ever asking Owen means you are guessing at what the problem is.',
                principle: 'Shared work beats announcements',
              },
              next: 'campout-test',
            },
          ],
        },

        'owens-answer': {
          id: 'owens-answer',
          type: 'decision',
          prompt:
            'Owen shrugs. "It is fine." Then, after a second: "I mean, I do not really know anybody. At my old patrol I was the one who did the fire." He says it like he is not asking for anything.',
          choices: [
            {
              id: 'give-him-the-fire',
              text: 'Say, "Then you are on fire and cooking for the campout. Take Miles with you — he has never lit one without help."',
              deltas: { delegation: 3, communication: 2, initiative: 2 },
              coaching: {
                text: 'He told you exactly what he brings, and you gave him a role where the patrol has to interact with him to eat. Pairing him with someone who needs teaching turns him into the person who knows something.',
                edge_stage: 'enable',
                principle: 'Give the new scout a reason to be needed',
              },
              next: 'campout-test',
            },
            {
              id: 'reassure',
              text: 'Say, "Give it time, you will fit in," and leave it.',
              deltas: { communication: -2, initiative: -2 },
              coaching: {
                text: 'He will fit in eventually or he will quit, and nothing you did affects which. He gave you a concrete thing he can do and you handed it back.',
                principle: 'Time is not a plan',
              },
              next: 'slow-fade',
            },
            {
              id: 'tell-others-quietly',
              text: 'Quietly ask two scouts in the patrol to pull him in without telling him you did.',
              deltas: { conflict_resolution: 2, communication: 1, delegation: 1 },
              coaching: {
                text: 'Working through two scouts rather than announcing it to the patrol keeps his standing intact. It depends entirely on picking the right two.',
                principle: 'Work through individuals',
              },
              next: 'campout-test',
            },
          ],
        },

        'after-lecture': {
          id: 'after-lecture',
          type: 'decision',
          prompt:
            'The patrol nods through it. For about ten minutes people make a point of including Owen in a way that is obvious to everyone including Owen. Then it goes back to normal.',
          choices: [
            {
              id: 'now-ask-owen',
              text: 'Find Owen after and ask him directly how it is going.',
              deltas: { communication: 2, conflict_resolution: 1, initiative: 1 },
              coaching: {
                text: 'Following an announcement with an actual conversation recovers most of it. Ask about the patrol rather than about the speech.',
                principle: 'Follow the announcement with a conversation',
              },
              next: 'owens-answer',
            },
            {
              id: 'call-it-done',
              text: 'Consider it handled. You said something and they agreed.',
              deltas: { conflict_resolution: -2, communication: -1 },
              coaching: {
                text: 'Agreement in a meeting is free. Nothing about how the patrol actually spends time changed, which is where the problem lives.',
                principle: 'Agreement is not change',
              },
              next: 'slow-fade',
            },
          ],
        },

        'campout-test': {
          id: 'campout-test',
          type: 'outcome',
          prompt:
            'On the campout Owen runs the fire, shows Miles how to build it, and burns the first batch of bacon badly enough that it becomes a patrol joke. He is in the joke rather than outside it.',
          debrief:
            'Belonging in a patrol comes from doing something the patrol needs, not from being told to be nicer. Your job was to find the thing he could own and hand it to him.',
          edge_focus: 'enable',
        },

        'slow-fade': {
          id: 'slow-fade',
          type: 'outcome',
          prompt:
            'Owen comes to the next two meetings, misses the campout, and then stops showing up. Nobody in the patrol mentions it.',
          debrief:
            'Scouts rarely quit over one thing. They quit over a few months of no particular reason to be there, which is a problem a patrol leader is actually positioned to see coming.',
        },
      },
    },
  },

  {
    id: 'meeting-segment',
    kind: 'training',
    title: 'Your Fifteen Minutes',
    summary: 'You have a meeting segment to run and eleven minutes to plan it.',
    setting: 'Tuesday, fifteen minutes before the troop meeting',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['tenderfoot', 'second_class', 'first_class', 'star'],
    primary_dimensions: ['planning', 'communication'],
    estimated_minutes: 4,
    branching_tree: {
      version: 1,
      root: 'assigned',
      nodes: {
        assigned: {
          id: 'assigned',
          type: 'decision',
          prompt:
            'The SPL gave your patrol fifteen minutes of tonight\'s meeting for a skill session on knots. Four of your six scouts need the two half-hitches for rank. Two already have it. You have eleven minutes before the meeting starts and no rope out yet.',
          choices: [
            {
              id: 'wing-it',
              text: 'You know the knot. Get the rope out and figure out the rest when you are up there.',
              deltas: { planning: -3, initiative: 1 },
              coaching: {
                text: 'Knowing a knot and teaching a knot to six scouts of different levels are different jobs. Fifteen unplanned minutes becomes five minutes of demo and ten of scouts hitting each other with rope.',
                principle: 'Knowing it is not a lesson plan',
              },
              next: 'the-session',
            },
            {
              id: 'edge-plan',
              text: 'Sketch it: two minutes explaining where the knot gets used, two demonstrating slowly, seven with everyone on their own rope while you circle, last two everyone ties it without looking at you.',
              deltas: { planning: 3, communication: 2 },
              coaching: {
                text: 'That is EDGE with a clock on it — and the clock is the part people skip. Ending with everyone tying it unaided is how you find out if it landed.',
                edge_stage: 'guide',
                principle: 'Put a clock on each stage',
              },
              next: 'the-session',
            },
            {
              id: 'use-the-two',
              text: 'Grab the two scouts who already know it and tell them each to take two of the others. You float.',
              deltas: { delegation: 3, planning: 2 },
              coaching: {
                text: 'Two-on-one beats six-on-one for anything with hands, and the scouts teaching it learn it better than they knew it. Give them thirty seconds of direction first so they do not each teach a different knot.',
                edge_stage: 'enable',
                principle: 'The best teacher just learned it',
              },
              next: 'the-session',
            },
          ],
        },

        'the-session': {
          id: 'the-session',
          type: 'decision',
          prompt:
            'Six minutes in. Two scouts have it. Two are close. One is tying a granny knot with total confidence, and one has put his rope down and is talking to someone in the next patrol.',
          choices: [
            {
              id: 'restart-for-all',
              text: 'Stop everyone and demonstrate the whole thing again from the front.',
              deltas: { communication: -1, planning: -1 },
              coaching: {
                text: 'You have just taken the two scouts who had it and given them four minutes of nothing to do. A repeat from the front is the most expensive way to reach two scouts.',
                principle: 'Do not reteach the room for two',
              },
              next: 'mixed-result',
            },
            {
              id: 'pair-and-redirect',
              text: 'Pair each scout who has it with one who does not, and go sit next to the scout with the granny knot yourself.',
              deltas: { delegation: 3, communication: 2, planning: 1 },
              coaching: {
                text: 'Everyone has something to do and the hardest case gets the person with the most skill, which is you. The scout who drifted off is usually the one who cannot do it and does not want that visible.',
                edge_stage: 'guide',
                principle: 'Split the room by what they need',
              },
              next: 'landed',
            },
            {
              id: 'push-through',
              text: 'Keep going and finish on time. Most of them have it.',
              deltas: { planning: 1, communication: -2 },
              coaching: {
                text: 'Finishing on time is worth something and the two scouts who needed it are the two who came for it. "Most of them" was not the point of the session.',
                principle: 'On time is not the same as done',
              },
              next: 'mixed-result',
            },
          ],
        },

        landed: {
          id: 'landed',
          type: 'outcome',
          prompt:
            'At fourteen minutes everyone ties it once, unaided, while you watch. The granny-knot scout gets it on his third try and looks around to see if anyone noticed.',
          debrief:
            'A skill session is not done when you have explained it — it is done when you have watched each scout do it. That last check is what turns a demo into a sign-off.',
          edge_focus: 'enable',
        },

        'mixed-result': {
          id: 'mixed-result',
          type: 'outcome',
          prompt:
            'The segment ends on time. Four scouts can tie it, two cannot, and both of those two needed it for rank.',
          debrief:
            'Fifteen minutes is enough to teach two half-hitches to six scouts if the plan splits them by what they already know. Running one lesson at the whole room is what makes it not enough.',
        },
      },
    },
  },

  {
    id: 'totin-chip-call',
    kind: 'training',
    title: 'The Hatchet',
    summary: 'A younger scout is using a hatchet in a way that is about to hurt someone.',
    setting: 'Saturday morning, patrol wood pile',
    role_relevance: ['PL', 'APL', 'SPL'],
    rank_relevance: ['first_class', 'star', 'life', 'eagle'],
    primary_dimensions: ['initiative', 'communication'],
    estimated_minutes: 3,
    branching_tree: {
      version: 1,
      root: 'the-swing',
      nodes: {
        'the-swing': {
          id: 'the-swing',
          type: 'decision',
          prompt:
            'Kai is eleven, earned his Totin\' Chip three weeks ago, and is splitting kindling with a hatchet. He is holding the piece upright with his free hand and swinging down at it. Another scout is standing about two feet to his left watching. Nobody has been hurt yet.',
          choices: [
            {
              id: 'stop-now',
              text: 'Say "Kai, stop" loud enough to be heard, and walk over.',
              deltas: { initiative: 3, communication: 2 },
              coaching: {
                text: 'Unsafe tool use is the one place where stopping it first and being polite second is correct. The blood circle and the hand placement are both wrong, and you do not have time to phrase it well.',
                principle: 'Safety interrupts everything',
              },
              next: 'after-stop',
            },
            {
              id: 'wait-for-pause',
              text: 'Wait until he finishes the piece, then bring it up so you do not startle him mid-swing.',
              deltas: { initiative: -2, communication: 1 },
              coaching: {
                text: 'Not startling someone holding an axe is a real consideration — say his name rather than shouting from behind. Waiting for the piece to finish is waiting for the swing that lands on his hand.',
                principle: 'Do not wait out an unsafe swing',
              },
              next: 'after-stop',
            },
            {
              id: 'find-adult',
              text: 'Go find an adult leader and let them handle a tool safety issue.',
              deltas: { initiative: -3 },
              coaching: {
                text: 'The adult is thirty seconds away and the hatchet is swinging now. A scout with a Totin\' Chip can be corrected by any scout — that is the point of the card.',
                principle: 'Distance is the deciding factor',
              },
              next: 'near-miss',
            },
          ],
        },

        'after-stop': {
          id: 'after-stop',
          type: 'decision',
          prompt:
            'Kai stops and looks up, embarrassed, with three other scouts now watching. The hatchet is down.',
          choices: [
            {
              id: 'corner-the-chip',
              text: 'Cut a corner off his Totin\' Chip on the spot. That is what it is for.',
              deltas: { conflict_resolution: -2, communication: -1 },
              coaching: {
                text: 'Corners are real and sometimes correct, and using one as the first move in front of an audience spends a lot for a first mistake. Ask yourself whether he does not care or was never actually taught.',
                principle: 'Ask whether it is attitude or training',
              },
              next: 'chip-cut',
            },
            {
              id: 'show-him',
              text: 'Say, "Your hand is inside the swing." Show him the contact method with a stick and a batoning piece, then watch him do three.',
              deltas: { communication: 3, initiative: 2, delegation: 1 },
              coaching: {
                text: 'Naming the specific error, showing the alternative, then watching him do it is the whole correction in about ninety seconds. The scouts watching just got the lesson too.',
                edge_stage: 'demonstrate',
                principle: 'Correct with a replacement, not a rule',
              },
              next: 'taught',
            },
            {
              id: 'vague-warning',
              text: 'Say, "Be careful with that," and go back to what you were doing.',
              deltas: { communication: -2, initiative: -1 },
              coaching: {
                text: '"Be careful" tells him to keep doing what he is doing with more tension in his shoulders. He does not know which part was wrong.',
                principle: 'Name the specific error',
              },
              next: 'near-miss',
            },
          ],
        },

        taught: {
          id: 'taught',
          type: 'outcome',
          prompt:
            'Kai splits the rest of the pile with his hand out of the way. Twenty minutes later you see him telling another scout to move out of the blood circle.',
          debrief:
            'Safety corrections stick when they come with a replacement technique and a few reps under supervision. A rule alone leaves the scout with nothing to do differently.',
          edge_focus: 'demonstrate',
        },

        'chip-cut': {
          id: 'chip-cut',
          type: 'outcome',
          prompt:
            'Kai hands over the card with a corner gone and does not touch a tool for the rest of the weekend. He also does not learn the right way to do it.',
          debrief:
            'The Totin\' Chip has corners for a reason and cutting one is sometimes exactly right. It works as a consequence for a scout who knows better, not as a substitute for teaching one who does not.',
        },

        'near-miss': {
          id: 'near-miss',
          type: 'outcome',
          prompt:
            'The hatchet glances off a knot and buries in the dirt two inches from his shoe. Everyone stops. Nobody is hurt.',
          debrief:
            'This one landed in the dirt. The gap between a near miss and a trip to the emergency room at camp is usually a few inches and not much else.',
        },
      },
    },
  },
];
