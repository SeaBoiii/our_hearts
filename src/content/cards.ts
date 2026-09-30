import type { Card, DeckId } from '../core/types';
import { CardSchema, DECK_IDS } from '../core/types';

/** Original, versioned built-in content. Keep IDs stable when editing copy. */
export const CONTENT_VERSION = 1;

export const decks: {
  id: DeckId;
  name: string;
  description: string;
  color: string;
  motif: string;
}[] = [
  { id: 'laughs', name: 'Little Laughs', description: 'A little nonsense. A lot of you.', color: 'peach', motif: 'spark' },
  { id: 'know', name: 'Know Me Better', description: 'The lovely details we keep discovering.', color: 'sage', motif: 'window' },
  { id: 'story', name: 'Our Story', description: 'Small moments, told in our own words.', color: 'sand', motif: 'path' },
  { id: 'closer', name: 'Closer Still', description: 'Room to listen, understand, and care.', color: 'rose', motif: 'loops' },
  { id: 'life', name: "The Life We’re Building", description: 'Make space for what matters to us.', color: 'blue', motif: 'home' },
  { id: 'us', name: 'Only Us', description: 'A few things that feel especially ours.', color: 'lilac', motif: 'puzzle' },
];

type Depth = 1 | 2 | 3;
type QuestionSpec = readonly [
  number: number,
  depth: Depth,
  prompt: string,
  tags: string[],
  followUp?: { prompt: string; depth: Depth },
];

function makeDeck(deckId: DeckId, specs: QuestionSpec[]): Card[] {
  return specs.map(([number, depth, prompt, tags, followUp]) => ({
    id: `${deckId}-${String(number).padStart(2, '0')}`,
    deckId,
    kind: 'question',
    prompt,
    depth,
    tags,
    ...(followUp ? { followUp } : {}),
  }));
}

export const questions: Card[] = [
  ...makeDeck('laughs', [
    [1, 1, 'If I were a slightly unnecessary household invention, what would I do?', ['playful', 'imagination'], { prompt: 'What would my very enthusiastic product review say?', depth: 1 }],
    [2, 1, 'Which everyday task deserves dramatic entrance music when I do it?', ['playful', 'everyday']],
    [3, 1, 'If we opened a shop selling exactly one ridiculous thing, what would it be?', ['playful', 'imagination'], { prompt: 'What would we name the shop?', depth: 1 }],
    [4, 1, 'What harmless rule would you introduce if you became mayor of our sofa?', ['playful', 'home']],
    [5, 1, 'Which animal would take our holiday planning far too seriously?', ['playful', 'travel'], { prompt: 'What would it insist we pack?', depth: 1 }],
    [6, 1, 'What would the opening scene of a very low-budget film about our day look like?', ['playful', 'everyday']],
    [7, 1, 'If my phone could give me one cheeky piece of advice, what would it say?', ['playful', 'habits'], { prompt: 'What would your phone say to you?', depth: 1 }],
    [8, 1, 'Which snack would be the least qualified captain of a spaceship?', ['playful', 'imagination']],
    [9, 1, 'What would you name a cloud that kept following us around?', ['playful', 'nature'], { prompt: 'What sort of personality would it have?', depth: 1 }],
    [10, 1, 'Which of my expressions deserves to become a punctuation mark?', ['playful', 'personality']],
    [11, 1, 'If we had to communicate using only three sound effects for an hour, which would you choose?', ['playful', 'imagination'], { prompt: 'Which one would mean it is time for food?', depth: 1 }],
    [12, 1, 'What wildly specific competition could we enter as a team?', ['playful', 'partnership']],
    [13, 1, 'Which object in this room seems most likely to have a secret hobby?', ['playful', 'imagination'], { prompt: 'What evidence has given it away?', depth: 1 }],
    [14, 1, 'What would our weather forecast sound like if it described our snack situation?', ['playful', 'food']],
    [15, 1, 'If I were a tour guide for something very ordinary, what would I explain with too much enthusiasm?', ['playful', 'personality'], { prompt: 'What would be my grand finale?', depth: 1 }],
    [16, 1, 'Which tiny inconvenience would make a surprisingly dramatic villain?', ['playful', 'everyday']],
    [17, 1, 'What is the most impractical but delightful feature you would add to an umbrella?', ['playful', 'imagination'], { prompt: 'What would its instruction manual warn us about?', depth: 1 }],
    [18, 1, 'If a pigeon reviewed our date, what would it give the most attention to?', ['playful', 'dates']],
    [19, 1, 'What would be a terrible name for a restaurant that we would still want to try?', ['playful', 'food'], { prompt: 'What dish would make the visit worth it?', depth: 1 }],
    [20, 1, 'Which ordinary sentence would sound funniest announced like a train-station message?', ['playful', 'everyday']],
    [21, 1, 'If our laundry formed a committee, what would be its first complaint?', ['playful', 'home'], { prompt: 'Which item would chair the meeting?', depth: 1 }],
    [22, 1, 'What would you put in a museum celebrating perfectly average afternoons?', ['playful', 'everyday']],
    [23, 1, 'Which fictional job would suit my least useful talent?', ['playful', 'personality'], { prompt: 'What would a good day at that job look like?', depth: 1 }],
    [24, 1, 'If we could add one absurd but harmless button to every lift, what would it do?', ['playful', 'imagination']],
    [25, 1, 'What would we call a dance move inspired by looking for our keys?', ['playful', 'everyday'], { prompt: 'Which other household task belongs in the routine?', depth: 1 }],
    [26, 1, 'Which food would make the funniest official mascot for a very serious club?', ['playful', 'food']],
    [27, 1, 'What object would you bring to a show-and-tell about a day when absolutely nothing happened?', ['playful', 'everyday'], { prompt: 'How would you make its introduction unnecessarily impressive?', depth: 1 }],
    [28, 1, 'If our imaginary pet rock had a diary, what would it write about us?', ['playful', 'imagination']],
    [29, 1, 'Which of my little habits would make an excellent cartoon sound effect?', ['playful', 'habits'], { prompt: 'What would the matching animation look like?', depth: 1 }],
    [30, 1, 'What very silly thing should come with a formal certificate of achievement?', ['playful', 'everyday']],
    [31, 1, 'If we hosted a cooking show with one ingredient missing every episode, which ingredient would cause the best chaos?', ['playful', 'food'], { prompt: 'What would our catchphrase be when we noticed?', depth: 1 }],
    [32, 1, 'Which pointless fact would you like me to announce whenever you enter a room?', ['playful', 'personality']],
    [33, 2, 'What is a small mistake you can laugh about now that once felt terribly embarrassing?', ['playful', 'reflection'], { prompt: 'What would you say to your past self in that moment?', depth: 2 }],
    [34, 2, 'What harmless thing do you take more seriously than anyone expects?', ['playful', 'preferences']],
    [35, 2, 'Which version of yourself comes out when nobody needs you to be sensible?', ['playful', 'personality'], { prompt: 'What helps that version feel welcome with me?', depth: 2 }],
    [36, 2, 'What kind of affectionate teasing actually feels fun to you?', ['playful', 'communication']],
    [37, 2, 'When has laughing at yourself made a difficult day a little easier?', ['playful', 'reflection']],
    [38, 2, 'Which childhood idea about being an adult seems funniest to you now?', ['playful', 'memories'], { prompt: 'Is there a tiny part of that idea you would still enjoy?', depth: 2 }],
    [39, 2, 'What small bit of silliness would you like more permission to enjoy?', ['playful', 'wishes']],
    [40, 2, 'What lets you know I am laughing with you in a way that feels kind?', ['playful', 'communication'], { prompt: 'How can we make it easy to say a joke has missed?', depth: 2 }],
  ]),
  ...makeDeck('know', [
    [1, 1, 'What is your favourite part of having an unexpectedly free afternoon?', ['preferences', 'everyday'], { prompt: 'What would make that afternoon feel entirely your own?', depth: 2 }],
    [2, 1, 'Which everyday sound do you find oddly comforting?', ['preferences', 'comfort']],
    [3, 1, 'What do you usually notice first when you enter a new place?', ['personality', 'preferences'], { prompt: 'What does that detail help you decide?', depth: 2 }],
    [4, 1, 'What is your ideal level of planning for an ordinary weekend?', ['preferences', 'habits']],
    [5, 1, 'Which small purchase tends to bring you more joy than expected?', ['preferences', 'everyday'], { prompt: 'What makes it feel like a treat?', depth: 1 }],
    [6, 1, 'What sort of seat would you choose if a whole café were empty?', ['preferences', 'comfort']],
    [7, 1, 'Which topic can turn you into a surprisingly enthusiastic storyteller?', ['personality', 'interests'], { prompt: 'How did you first become curious about it?', depth: 2 }],
    [8, 1, 'What do you like to do in the few minutes before leaving home?', ['habits', 'everyday']],
    [9, 1, 'Which food texture makes a meal especially satisfying for you?', ['food', 'preferences'], { prompt: 'What is a dish that gets it just right?', depth: 1 }],
    [10, 1, 'What kind of weather makes you want to change all your plans?', ['preferences', 'nature']],
    [11, 1, 'Which small thing do you almost always bring along, just in case?', ['habits', 'everyday'], { prompt: 'Has it ever saved the day?', depth: 1 }],
    [12, 1, 'What makes a walking route feel inviting to you?', ['nature', 'preferences']],
    [13, 1, 'How do you choose what to eat when everything sounds equally good?', ['food', 'habits'], { prompt: 'What kind of suggestion from me would help?', depth: 1 }],
    [14, 1, 'What is a skill you enjoy watching someone do well?', ['interests', 'preferences']],
    [15, 1, 'What small detail makes a room feel comfortable almost immediately?', ['home', 'comfort'], { prompt: 'Where did you first notice that detail mattered to you?', depth: 2 }],
    [16, 1, 'What is your favourite way to spend the last ten minutes of a good day?', ['habits', 'comfort']],
    [17, 1, 'Which kind of surprise is usually welcome in your day?', ['preferences', 'everyday'], { prompt: 'What makes a surprise feel easy to receive?', depth: 2 }],
    [18, 1, 'What is something you like to keep neatly arranged even when everything else is a little messy?', ['habits', 'personality']],
    [19, 2, 'What part of your personality takes a while for new people to notice?', ['personality', 'reflection'], { prompt: 'When do you feel most free to show it?', depth: 2 }],
    [20, 2, 'Which compliment stays with you because it notices something you care about?', ['appreciation', 'personality']],
    [21, 2, 'What do you wish you had more unhurried time to learn?', ['wishes', 'interests'], { prompt: 'What would an enjoyable first step look like?', depth: 2 }],
    [22, 2, 'What does a satisfying day look like when you have nothing to prove?', ['reflection', 'everyday']],
    [23, 2, 'How do you usually know you need some quiet time?', ['comfort', 'habits'], { prompt: 'What could I notice without having to guess your feelings?', depth: 2 }],
    [24, 2, 'What is a preference you have stopped apologising for?', ['preferences', 'reflection']],
    [25, 2, 'Which part of growing older are you quietly looking forward to?', ['wishes', 'reflection'], { prompt: 'What could you enjoy a little of already?', depth: 2 }],
    [26, 2, 'What helps you feel at ease around people you have just met?', ['comfort', 'personality']],
    [27, 2, 'What is something you changed your mind about after trying it yourself?', ['reflection', 'interests'], { prompt: 'What made you willing to give it a chance?', depth: 2 }],
    [28, 2, 'What kind of encouragement makes you want to keep going?', ['support', 'preferences']],
    [29, 2, 'Which ordinary decision uses more of your energy than people might realise?', ['everyday', 'reflection'], { prompt: 'What would make that decision a little lighter?', depth: 2 }],
    [30, 2, 'What is a quiet wish you would enjoy making room for this year?', ['wishes', 'reflection']],
    [31, 2, 'What do you like about the way you approach a problem?', ['personality', 'appreciation'], { prompt: 'When has that approach surprised you by working?', depth: 2 }],
    [32, 2, 'What sort of invitation is easiest for you to say yes to?', ['preferences', 'comfort']],
    [33, 2, 'What part of your day do you prefer to move through slowly?', ['habits', 'comfort']],
    [34, 2, 'Which personal tradition would you like me to understand better?', ['habits', 'reflection'], { prompt: 'What does keeping it give you?', depth: 2 }],
    [35, 2, 'What does feeling well rested allow you to enjoy more?', ['comfort', 'everyday']],
    [36, 2, 'Which value shows up in your life in small, practical ways?', ['personality', 'reflection'], { prompt: 'What recent choice felt true to that value?', depth: 2 }],
    [37, 3, 'What is a part of yourself you are still learning to describe kindly?', ['reflection', 'care']],
    [38, 3, 'What expectation would you feel relieved to set down for a while?', ['reflection', 'comfort'], { prompt: 'What would you want to make room for instead?', depth: 3 }],
    [39, 3, 'What makes it difficult for you to let someone help, even when you want the help?', ['support', 'reflection']],
    [40, 3, 'What do you hope I understand about you on days when you cannot explain yourself easily?', ['communication', 'care'], { prompt: 'What is one simple thing I could remember on those days?', depth: 3 }],
  ]),
  ...makeDeck('story', [
    [1, 1, 'What is one of the first little details you remember noticing about me?', ['memories', 'appreciation'], { prompt: 'Do you notice it differently now?', depth: 2 }],
    [2, 1, 'Which ordinary place has become more interesting because we have been there together?', ['memories', 'places']],
    [3, 1, 'What shared meal can you picture especially clearly?', ['memories', 'food'], { prompt: 'Which detail brings that moment back?', depth: 1 }],
    [4, 1, 'When have our plans taken a small turn that made the day better?', ['memories', 'adventure']],
    [5, 1, 'What is a moment with me that you wish you had a photograph of?', ['memories', 'appreciation'], { prompt: 'What would the photograph miss about being there?', depth: 2 }],
    [6, 1, 'Which thing did we first try together, however small?', ['memories', 'discovery']],
    [7, 1, 'What is a conversation of ours that wandered somewhere unexpectedly funny?', ['memories', 'playful'], { prompt: 'What started that turn in the conversation?', depth: 1 }],
    [8, 1, 'Which journey together do you remember more clearly than the destination?', ['memories', 'travel']],
    [9, 1, 'What tiny detail would help you retell one of our days exactly as it felt?', ['memories', 'everyday'], { prompt: 'What title would you give that day?', depth: 1 }],
    [10, 1, 'Which of our early conversations would be fun to have again with what we know now?', ['memories', 'communication']],
    [11, 1, 'When did you first notice we share a particular preference?', ['memories', 'preferences'], { prompt: 'Has that shared preference found its way into a routine?', depth: 1 }],
    [12, 1, 'What is a small thing we have learned to do more smoothly together?', ['memories', 'partnership']],
    [13, 1, 'Which unexpectedly long wait became a decent moment because we had each other for company?', ['memories', 'everyday'], { prompt: 'What helped us make something of that time?', depth: 2 }],
    [14, 1, 'What is a sound that brings back a particular moment with me?', ['memories', 'places']],
    [15, 1, 'What is a small thing we once got pleasantly lost in doing together?', ['memories', 'interests'], { prompt: 'What made it easy to forget the time?', depth: 1 }],
    [16, 1, 'What is the smallest souvenir, physical or otherwise, you have kept from a day with me?', ['memories', 'appreciation']],
    [17, 1, 'When did our different tastes lead us to something neither of us would have chosen alone?', ['memories', 'discovery'], { prompt: 'Would you choose it again?', depth: 1 }],
    [18, 1, 'Which moment between us would make a charming three-panel comic?', ['memories', 'playful']],
    [19, 1, 'What was a small act of thoughtfulness from me that you noticed recently?', ['memories', 'care'], { prompt: 'What made it land well for you?', depth: 2 }],
    [20, 1, 'What shared experience would you happily repeat without trying to improve it?', ['memories', 'preferences']],
    [21, 2, 'When have you felt particularly comfortable being quiet beside me?', ['memories', 'comfort'], { prompt: 'What made that silence feel easy?', depth: 2 }],
    [22, 2, 'What is something you understand about our beginning differently now?', ['memories', 'reflection']],
    [23, 2, 'Which small decision helped us become more of a team?', ['memories', 'partnership'], { prompt: 'What could we carry forward from that decision?', depth: 2 }],
    [24, 2, 'When did I surprise you in a way that helped you understand me better?', ['memories', 'discovery']],
    [25, 2, 'What is a difficult day we made a little more manageable together?', ['memories', 'support'], { prompt: 'What part of our response would you want to remember?', depth: 2 }],
    [26, 2, 'Which expectation about being together has changed through actually knowing each other?', ['memories', 'reflection']],
    [27, 2, 'What small tradition seems to have formed between us without a formal decision?', ['memories', 'habits'], { prompt: 'What makes it feel like ours?', depth: 2 }],
    [28, 2, 'When have we handled a change of plan with more patience than you expected?', ['memories', 'partnership']],
    [29, 2, 'What is something you have learned about yourself through spending time with me?', ['memories', 'reflection'], { prompt: 'How do you feel about that discovery?', depth: 2 }],
    [30, 2, 'Which chapter of our time together deserves more attention when we tell our story?', ['memories', 'reflection']],
    [31, 2, 'What moment made you feel that I was paying attention to the real you?', ['memories', 'care'], { prompt: 'What did I notice that mattered?', depth: 2 }],
    [32, 2, 'What is a way our conversations have become easier over time?', ['memories', 'communication']],
    [33, 2, 'Which memory of us feels gentler each time you return to it?', ['memories', 'comfort']],
    [34, 2, 'When have we made space for both of our preferences without needing a perfect compromise?', ['memories', 'partnership'], { prompt: 'What helped us be flexible?', depth: 2 }],
    [35, 2, 'What is a kind thing we did for someone else that you are glad we shared?', ['memories', 'care']],
    [36, 2, 'What part of our story would you tell a future version of us who has forgotten the little details?', ['memories', 'reflection'], { prompt: 'Which detail should we take care to remember?', depth: 2 }],
    [37, 3, 'Is there a moment from our story you would like me to understand from your side more fully?', ['memories', 'communication']],
    [38, 3, 'When has giving each other more time changed how we understood a difficult moment?', ['memories', 'care'], { prompt: 'What could remind us to offer that time again?', depth: 3 }],
    [39, 3, 'What change in our relationship has asked you to grow in a way you are still understanding?', ['memories', 'reflection']],
    [40, 3, 'Which part of our story would you like us to speak about with more kindness?', ['memories', 'care'], { prompt: 'What would a kinder way of telling it sound like?', depth: 3 }],
  ]),
  ...makeDeck('closer', [
    [1, 1, 'What is a small way I make everyday life more pleasant for you?', ['appreciation', 'everyday'], { prompt: 'When do you notice it most?', depth: 1 }],
    [2, 1, 'What kind of greeting from me makes you feel warmly welcomed?', ['care', 'preferences']],
    [3, 1, 'Which quality of mine have you appreciated lately?', ['appreciation', 'personality'], { prompt: 'Where have you seen it show up?', depth: 1 }],
    [4, 1, 'What is an easy way we could give each other our attention for a few minutes?', ['care', 'everyday']],
    [5, 1, 'What kind of message from me is lovely to find during a busy day?', ['communication', 'care'], { prompt: 'What makes it feel personal to you?', depth: 2 }],
    [6, 1, 'How do you like us to celebrate a small piece of good news?', ['appreciation', 'preferences']],
    [7, 1, 'What do you enjoy about the way we spend time without needing much of a plan?', ['comfort', 'partnership'], { prompt: 'What helps that time feel unhurried?', depth: 1 }],
    [8, 1, 'What is a little favour you would always feel comfortable asking me for?', ['support', 'everyday']],
    [9, 1, 'Which of my interests do you enjoy hearing about, even when it is not your own?', ['appreciation', 'interests'], { prompt: 'What makes my enthusiasm enjoyable to you?', depth: 2 }],
    [10, 1, 'What makes shared laughter feel especially connecting to you?', ['playful', 'comfort']],
    [11, 1, 'What would make a brief goodbye feel a little more thoughtful?', ['care', 'habits'], { prompt: 'Is there a small gesture you would enjoy making ours?', depth: 2 }],
    [12, 1, 'What is something you enjoy being able to offer me?', ['appreciation', 'partnership']],
    [13, 2, 'When you tell me about a frustrating day, what response feels most helpful first?', ['support', 'communication'], { prompt: 'How could you let me know when you want a different kind of response?', depth: 2 }],
    [14, 2, 'What helps you feel heard even when we see something differently?', ['communication', 'care']],
    [15, 2, 'How can I make it easier for you to ask for time on your own?', ['comfort', 'communication'], { prompt: 'What could help us reconnect after that space?', depth: 2 }],
    [16, 2, 'What sort of reassurance feels believable and useful to you?', ['support', 'preferences']],
    [17, 2, 'What do I sometimes do with good intentions that would help more in a different form?', ['support', 'communication'], { prompt: 'What would that different form look like?', depth: 2 }],
    [18, 2, 'How do you like me to check in when you seem unusually quiet?', ['communication', 'care']],
    [19, 2, 'What helps an apology feel complete for you?', ['communication', 'care'], { prompt: 'What small action could support the words?', depth: 2 }],
    [20, 2, 'What is one way we could make interruptions kinder when we both want to speak?', ['communication', 'partnership']],
    [21, 2, 'When do you feel most comfortable telling me that you have changed your mind?', ['communication', 'comfort'], { prompt: 'What could make that easier in other moments?', depth: 2 }],
    [22, 2, 'What is a sign that we should pause a conversation and return to it later?', ['communication', 'care']],
    [23, 2, 'How would you like me to respond when something good happens for you but you feel shy celebrating?', ['appreciation', 'support'], { prompt: 'What would let you enjoy the moment at your own pace?', depth: 2 }],
    [24, 2, 'What makes advice easier for you to receive from me?', ['support', 'communication']],
    [25, 2, 'What kind of appreciation have you needed lately that is easy to overlook?', ['appreciation', 'care'], { prompt: 'What would recognising it sound like?', depth: 2 }],
    [26, 2, 'How can we make room for a low-energy version of a plan we were excited about?', ['care', 'partnership']],
    [27, 2, 'What would help us bring up small concerns before they become difficult to mention?', ['communication', 'partnership'], { prompt: 'What opening sentence would feel gentle to you?', depth: 2 }],
    [28, 2, 'What does being on your side look like when I cannot solve the problem?', ['support', 'care']],
    [29, 2, 'What helps you trust that a request from me is a request you can discuss?', ['communication', 'comfort']],
    [30, 2, 'What is something we could give each other more credit for?', ['appreciation', 'partnership'], { prompt: 'What effort sits behind it that we might not always see?', depth: 2 }],
    [31, 2, 'What kind of gentle honesty do you particularly value between us?', ['communication', 'care']],
    [32, 2, 'How can I be better company while you work through something at your own pace?', ['support', 'comfort'], { prompt: 'What would feel like unnecessary pressure?', depth: 2 }],
    [33, 3, 'What feels hard to ask for even though you know it matters to you?', ['communication', 'support']],
    [34, 3, 'When you worry about disappointing me, what would help us talk more openly?', ['communication', 'care'], { prompt: 'What reassurance would you want to hear from me?', depth: 3 }],
    [35, 3, 'What would you like us to understand better about how you protect your energy?', ['care', 'reflection']],
    [36, 3, 'Is there a feeling you tend to make smaller when describing it to me?', ['communication', 'reflection'], { prompt: 'What would make it easier to give that feeling enough room?', depth: 3 }],
    [37, 3, 'What helps you feel respected when your answer is no?', ['communication', 'care']],
    [38, 3, 'What would repairing a difficult conversation look like before either of us has found perfect words?', ['communication', 'partnership'], { prompt: 'What is one small beginning that could be enough?', depth: 3 }],
    [39, 3, 'What part of being cared for are you still learning to feel comfortable with?', ['support', 'reflection']],
    [40, 3, 'What would you like me to remember when a fear of yours does not make immediate sense to me?', ['care', 'communication'], { prompt: 'What response would help you feel accompanied?', depth: 3 }],
  ]),
  ...makeDeck('life', [
    [1, 1, 'What small comfort would you love to have within reach in our home?', ['home', 'comfort'], { prompt: 'Where would it belong?', depth: 1 }],
    [2, 1, 'What would make an ordinary breakfast together feel especially pleasant?', ['home', 'food']],
    [3, 1, 'Which corner of a home would you most enjoy making our own?', ['home', 'imagination'], { prompt: 'What is the first detail you picture?', depth: 1 }],
    [4, 1, 'What simple outing could become a lovely once-in-a-while tradition for us?', ['routines', 'dates']],
    [5, 1, 'What would you like our place to feel like when someone visits?', ['home', 'care'], { prompt: 'What small choice would create that feeling?', depth: 2 }],
    [6, 1, 'Which everyday item would you enjoy choosing together?', ['home', 'preferences']],
    [7, 1, 'What is one meal you would enjoy learning to make as a team?', ['food', 'partnership'], { prompt: 'Which part would you be curious to try first?', depth: 1 }],
    [8, 1, 'How would you like us to spend a morning when neither of us needs to rush?', ['routines', 'comfort']],
    [9, 1, 'What kind of little collection would feel at home with us?', ['home', 'interests'], { prompt: 'What might be the first thing in it?', depth: 1 }],
    [10, 1, 'What is a nearby adventure we could enjoy without much preparation?', ['adventure', 'everyday']],
    [11, 1, 'What would make an evening at home feel different from simply finishing the day?', ['home', 'routines'], { prompt: 'What would be an easy version on a tired evening?', depth: 2 }],
    [12, 1, 'Which useful skill would be fun for us to learn side by side?', ['partnership', 'interests']],
    [13, 1, 'What would you put on a handwritten list of small things to enjoy together someday?', ['wishes', 'imagination'], { prompt: 'Which one could stay wonderfully simple?', depth: 1 }],
    [14, 1, 'What is a way we could bring a little more nature into an ordinary week?', ['nature', 'routines']],
    [15, 2, 'How could we share household tasks so the planning behind them is noticed too?', ['home', 'partnership'], { prompt: 'What would make a check-in about this feel practical and kind?', depth: 2 }],
    [16, 2, 'Which parts of our individual routines would you like us to protect as life becomes more shared?', ['routines', 'care']],
    [17, 2, 'What would a good balance of invitations and quiet weekends look like for us?', ['routines', 'preferences'], { prompt: 'How could we notice when that balance needs adjusting?', depth: 2 }],
    [18, 2, 'How would you like us to stay connected to the people and places that matter to each of us?', ['care', 'partnership']],
    [19, 2, 'How would you like us to decide which plans deserve our energy during a busy season?', ['partnership', 'routines'], { prompt: 'What could we happily let be simpler?', depth: 2 }],
    [20, 2, 'What kind of welcome would you like to come home to after a demanding day?', ['home', 'care']],
    [21, 2, 'What would make it easier for either of us to say a routine is no longer working?', ['communication', 'routines'], { prompt: 'How often would an informal check-in feel useful?', depth: 2 }],
    [22, 2, 'Which quality do you hope people feel when they spend time with us?', ['wishes', 'partnership']],
    [23, 2, 'How could we stay thoughtful about family time while leaving enough room to rest?', ['care', 'partnership'], { prompt: 'What would help us make plans together before answering invitations?', depth: 2 }],
    [24, 2, 'What small choice could make our future selves grateful for how we lived this week?', ['routines', 'reflection']],
    [25, 2, 'What would make a shared decision feel fair when we care about it in different amounts?', ['communication', 'partnership'], { prompt: 'How could we make those differences clear without keeping score?', depth: 2 }],
    [26, 2, 'What kind of curiosity would you like us to keep as our surroundings become familiar?', ['discovery', 'wishes']],
    [27, 2, 'How would you like us to support each other through a change in work or daily rhythm?', ['support', 'partnership'], { prompt: 'What familiar part of the day might help us feel settled?', depth: 2 }],
    [28, 2, 'What would you like us to make time for even when nobody else sees its value?', ['wishes', 'partnership']],
    [29, 2, 'How can we keep special occasions enjoyable without making them feel like a performance?', ['routines', 'care']],
    [30, 2, 'What does looking after our shared things mean to you?', ['home', 'partnership'], { prompt: 'Which expectations would be helpful to say aloud?', depth: 2 }],
    [31, 2, 'What is a hope for our life together that leaves plenty of room for surprise?', ['wishes', 'imagination']],
    [32, 2, 'What would help us stay willing to be beginners together?', ['discovery', 'partnership'], { prompt: 'What could make an imperfect first attempt enjoyable?', depth: 2 }],
    [33, 2, 'How would you like us to recognise when one of us is carrying an unusually heavy week?', ['support', 'routines']],
    [34, 2, 'What would a life that feels spacious mean to you, beyond the size of our home?', ['wishes', 'reflection'], { prompt: 'What is one small ingredient we can practise now?', depth: 2 }],
    [35, 3, 'What assumption about sharing a life would you like us to examine together?', ['reflection', 'partnership']],
    [36, 3, 'Which uncertainty about the future would feel easier if we could discuss it without needing an answer tonight?', ['wishes', 'communication'], { prompt: 'What can we offer each other while it remains uncertain?', depth: 3 }],
    [37, 3, 'What part of your independence feels particularly important to keep nurturing?', ['care', 'reflection']],
    [38, 3, 'How would you hope we respond if an important shared plan needs to change?', ['support', 'partnership'], { prompt: 'What would help us make room for different reactions?', depth: 3 }],
    [39, 3, 'What do you want us to remember about each other when life becomes more demanding than expected?', ['care', 'wishes']],
    [40, 3, 'What would make it safe for either of us to say our hopes have changed?', ['communication', 'partnership'], { prompt: 'How could we begin exploring the change together?', depth: 3 }],
  ]),
  ...makeDeck('us', [
    [1, 1, 'If Aleem and Nurul designed a park bench, what small feature would make it unmistakably ours?', ['nature', 'imagination'], { prompt: 'Where would we put it?', depth: 1 }],
    [2, 1, 'What would be our ideal pause between stops on a road trip?', ['travel', 'comfort']],
    [3, 1, 'If our day were a water-sort puzzle, which colour would need a little more space?', ['puzzles', 'everyday'], { prompt: 'What would give that part of the day some breathing room?', depth: 2 }],
    [4, 1, 'What ordinary date deserves an unnecessarily detailed engineering diagram?', ['playful', 'dates']],
    [5, 1, 'Which kind of landscape would make us both put our phones away?', ['nature', 'travel'], { prompt: 'What would you want to notice first once we were there?', depth: 1 }],
    [6, 1, 'What snack belongs in the front seat of our imaginary road-trip vehicle?', ['food', 'travel']],
    [7, 1, 'If Nurul could add a gentle bonus level to an ordinary day, what would it contain?', ['puzzles', 'imagination'], { prompt: 'What would make the level satisfying without being difficult?', depth: 1 }],
    [8, 1, 'What small daily problem would you enjoy watching Aleem invent a wildly elaborate solution for?', ['playful', 'everyday']],
    [9, 1, 'What is our best rainy-day alternative to a nature walk?', ['nature', 'dates'], { prompt: 'What could keep a little of the outdoor feeling?', depth: 1 }],
    [10, 1, 'Which part of exploring a new place would you happily do with no destination in mind?', ['travel', 'discovery']],
    [11, 1, 'If we named a trail after an ordinary part of our relationship, what would it be called?', ['nature', 'playful'], { prompt: 'What would its tiny signboard say?', depth: 1 }],
    [12, 1, 'What would the loading-screen tip for an Aleem-and-Nurul adventure say?', ['puzzles', 'playful']],
    [13, 1, 'Where in Singapore would you like us to spend a slow hour noticing little things?', ['places', 'nature'], { prompt: 'What would you be curious to look for?', depth: 1 }],
    [14, 1, 'What would you pack for a quiet date if everything had to fit in one small bag?', ['dates', 'preferences']],
    [15, 1, 'If our travel plans had a delightfully unnecessary test phase, what would we test at home?', ['travel', 'playful'], { prompt: 'What would count as a successful test?', depth: 1 }],
    [16, 1, 'Which two colours would you choose for a puzzle level inspired by a peaceful day together?', ['puzzles', 'imagination']],
    [17, 1, 'What would be the nicest thing to discover at the end of a short walking path?', ['nature', 'discovery'], { prompt: 'Would we linger or keep exploring?', depth: 1 }],
    [18, 1, 'What is a tiny luxury you would enjoy on a long journey with me?', ['travel', 'comfort']],
    [19, 1, 'If our home had one wonderfully overengineered feature, what should it be?', ['home', 'playful'], { prompt: 'What would its far-too-formal name be?', depth: 1 }],
    [20, 1, 'What would make a simple walk around the neighbourhood feel like a date for us?', ['dates', 'everyday']],
    [21, 1, 'Which holiday moment would you rather leave unplanned?', ['travel', 'preferences'], { prompt: 'What helps you enjoy not knowing what comes next?', depth: 2 }],
    [22, 1, 'What kind of puzzle could we enjoy together even if neither of us solved it?', ['puzzles', 'partnership']],
    [23, 1, 'If a helpful robot joined our trip, which task should it take so we could enjoy each other more?', ['travel', 'playful'], { prompt: 'What would we do with the time it gave us?', depth: 1 }],
    [24, 1, 'Which everyday view would you like to show me as though I were visiting Singapore for the first time?', ['places', 'discovery']],
    [25, 1, 'What would you like us to notice more often in the trees, sky, or small patches of green around us?', ['nature', 'everyday'], { prompt: 'What could remind us to look up?', depth: 1 }],
    [26, 1, 'What would be an excellent unofficial job title for each of us on a short trip?', ['travel', 'playful']],
    [27, 1, 'If Aleem and Nurul had a tiny field guide, what ordinary discovery would earn its own page?', ['nature', 'imagination'], { prompt: 'What observation would go beneath the drawing?', depth: 1 }],
    [28, 1, 'If we designed a tiny garden as a puzzle, what would be its unexpected rule?', ['puzzles', 'nature']],
    [29, 2, 'What does a satisfying puzzle teach you about the kind of challenges you enjoy?', ['puzzles', 'reflection'], { prompt: 'Where else do you find that feeling?', depth: 2 }],
    [30, 2, 'How could we balance wanting to explore with wanting to rest on the same trip?', ['travel', 'partnership']],
    [31, 2, 'What is one part of our everyday life that would benefit from a simpler design?', ['everyday', 'partnership'], { prompt: 'What is the smallest change we could try?', depth: 2 }],
    [32, 2, 'What kind of travel experience would feel meaningful even without an impressive photograph?', ['travel', 'reflection']],
    [33, 2, 'When we approach a problem differently, what do you appreciate about my way of thinking?', ['partnership', 'appreciation']],
    [34, 2, 'What does time in nature make easier for you to talk about?', ['nature', 'communication'], { prompt: 'What sort of place would make a good setting for that conversation?', depth: 2 }],
    [35, 2, 'How could we make space for our own interests while still enjoying the same quiet afternoon?', ['interests', 'partnership']],
    [36, 2, 'What would make an unfamiliar place feel welcoming to us while respecting the routines we care about?', ['travel', 'comfort'], { prompt: 'What could we find out beforehand to make the visit easier?', depth: 2 }],
    [37, 2, 'What would you enjoy showing me how to do without needing to become an expert teacher?', ['interests', 'care']],
    [38, 2, 'What is a small thing Aleem and Nurul do differently that you hope stays different?', ['personality', 'appreciation'], { prompt: 'What does that difference add to our days?', depth: 2 }],
    [39, 2, 'What makes a plan feel like something we built together, even if one of us drew up the details?', ['partnership', 'communication']],
    [40, 2, 'When you imagine us returning from an adventure, what feeling would you hope we bring into ordinary life?', ['travel', 'wishes'], { prompt: 'How could we make a little room for that feeling at home?', depth: 2 }],
  ]),
];

/** Optional, explicitly chosen interludes. They never count as questions. */
export const activities: Card[] = [
  { id: 'moment-01', deckId: 'closer', kind: 'activity', depth: 1, prompt: 'Offer one specific thank-you for something small the other person has done. A sentence is plenty.', tags: ['appreciation', 'care'] },
  { id: 'moment-02', deckId: 'laughs', kind: 'activity', depth: 1, prompt: 'Invent a very grand name for the ordinary place where you are sitting.', tags: ['playful', 'imagination'] },
  { id: 'moment-03', deckId: 'know', kind: 'activity', depth: 1, prompt: 'Each name one small comfort you would put in an imaginary care package for today.', tags: ['comfort', 'preferences'] },
  { id: 'moment-04', deckId: 'story', kind: 'activity', depth: 1, prompt: 'Give one ordinary day you have shared a title, as though it were a chapter in a book.', tags: ['memories', 'playful'] },
  { id: 'moment-05', deckId: 'life', kind: 'activity', depth: 1, prompt: 'Describe or sketch a tiny corner of a home you would both enjoy. No drawing skill needed.', tags: ['home', 'imagination'] },
  { id: 'moment-06', deckId: 'us', kind: 'activity', depth: 1, prompt: 'Build an imaginary road-trip snack bag by taking turns adding one thing.', tags: ['travel', 'food'] },
  { id: 'moment-07', deckId: 'closer', kind: 'activity', depth: 1, prompt: 'Complete this sentence for each other: “One thing I enjoy about your company is…”', tags: ['appreciation', 'comfort'] },
  { id: 'moment-08', deckId: 'laughs', kind: 'activity', depth: 1, prompt: 'Give a nearby object a very serious job title and a completely unnecessary responsibility.', tags: ['playful', 'imagination'] },
  { id: 'moment-09', deckId: 'know', kind: 'activity', depth: 1, prompt: 'Each choose a word for the pace you would enjoy for the rest of today. The words can be different.', tags: ['preferences', 'everyday'] },
  { id: 'moment-10', deckId: 'story', kind: 'activity', depth: 1, prompt: 'Rebuild a shared outing from three little details you remember, taking turns adding one.', tags: ['memories', 'places'] },
  { id: 'moment-11', deckId: 'life', kind: 'activity', depth: 1, prompt: 'Imagine an easy day together and describe it one small scene at a time. Leave the schedule loose.', tags: ['routines', 'imagination'] },
  { id: 'moment-12', deckId: 'us', kind: 'activity', depth: 1, prompt: 'Invent a two-step puzzle whose reward is a very ordinary pleasure you both enjoy.', tags: ['puzzles', 'playful'] },
  { id: 'moment-13', deckId: 'closer', kind: 'activity', depth: 2, prompt: 'Each offer a small request that would make this week easier. Listen before deciding what is possible.', tags: ['support', 'communication'] },
  { id: 'moment-14', deckId: 'laughs', kind: 'activity', depth: 1, prompt: 'Create a tiny advertisement for doing absolutely nothing for a while. Make it as sincere or silly as you like.', tags: ['playful', 'comfort'] },
  { id: 'moment-15', deckId: 'know', kind: 'activity', depth: 1, prompt: 'Share one interesting thing you learned recently. It can be as small as a better way to fold something.', tags: ['interests', 'discovery'] },
  { id: 'moment-16', deckId: 'story', kind: 'activity', depth: 1, prompt: 'Imagine a postcard from a place you have visited together and say its one-line message.', tags: ['memories', 'travel'] },
  { id: 'moment-17', deckId: 'life', kind: 'activity', depth: 1, prompt: 'Choose a small, flexible idea for time together that would still work on a low-energy day.', tags: ['routines', 'care'] },
  { id: 'moment-18', deckId: 'us', kind: 'activity', depth: 1, prompt: 'Describe a peaceful place outdoors using three details. It can be real or entirely imagined.', tags: ['nature', 'comfort'] },
  { id: 'moment-19', deckId: 'closer', kind: 'activity', depth: 2, prompt: 'Take turns naming one effort you have noticed the other person making lately. Let the appreciation stand on its own.', tags: ['appreciation', 'support'] },
  { id: 'moment-20', deckId: 'laughs', kind: 'activity', depth: 1, prompt: 'Make up a friendly warning label for an imaginary gadget that would make your day more amusing.', tags: ['playful', 'imagination'] },
  { id: 'moment-21', deckId: 'know', kind: 'activity', depth: 1, prompt: 'Offer each other a recommendation from your own interests, with one sentence about why you enjoy it.', tags: ['interests', 'discovery'] },
  { id: 'moment-22', deckId: 'story', kind: 'activity', depth: 2, prompt: 'Tell a short memory of a time you worked well together. Notice one thing that helped.', tags: ['memories', 'partnership'] },
  { id: 'moment-23', deckId: 'life', kind: 'activity', depth: 1, prompt: 'Make a spoken menu for an imaginary evening at home, including something to eat and something pleasantly unambitious to do.', tags: ['home', 'food'] },
  { id: 'moment-24', deckId: 'us', kind: 'activity', depth: 1, prompt: 'Write an imaginary one-line changelog for today that celebrates a small, useful improvement. Saying it aloud works too.', tags: ['playful', 'appreciation'] },
];

export const cards: Card[] = [...questions, ...activities];

/** Detect typography/case variants; this deliberately does not claim semantic originality. */
export function normalizePrompt(prompt: string): string {
  return prompt.normalize('NFKC').toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

/** Validate the complete published collection, including editorial invariants. */
export function validateContent(candidate: readonly unknown[] = cards): string[] {
  const errors: string[] = [];
  const validCards: Card[] = [];
  const ids = new Set<string>();
  const prompts = new Set<string>();

  if (candidate.length !== 264) errors.push('The built-in collection must contain 264 cards.');
  for (const [index, entry] of candidate.entries()) {
    const parsed = CardSchema.safeParse(entry);
    if (!parsed.success) {
      errors.push(`Card ${index + 1} has invalid required fields: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}.`);
      continue;
    }
    const card = parsed.data;
    validCards.push(card);
    if (ids.has(card.id)) errors.push(`Duplicate card ID: ${card.id}.`);
    ids.add(card.id);
    const normalized = normalizePrompt(card.prompt);
    if (!normalized) errors.push(`Card ${card.id} needs a readable prompt.`);
    if (prompts.has(normalized)) errors.push(`Duplicate normalized prompt: ${card.id}.`);
    prompts.add(normalized);
    if (!decks.some((deck) => deck.id === card.deckId)) errors.push(`Card ${card.id} references an unknown deck.`);
    if (!card.tags.length || new Set(card.tags).size !== card.tags.length) errors.push(`Card ${card.id} needs distinct, nonempty tags.`);
    if (card.followUp && card.followUp.depth < card.depth) errors.push(`Card ${card.id} has a follow-up below its question depth.`);
  }

  const deckIds = decks.map((deck) => deck.id);
  if (new Set(deckIds).size !== DECK_IDS.length || DECK_IDS.some((id) => !deckIds.includes(id))) errors.push('The six deck definitions must match the supported deck IDs.');
  for (const deck of decks) {
    const deckCards = validCards.filter((card) => card.kind === 'question' && card.deckId === deck.id);
    if (deckCards.length !== 40) errors.push(`${deck.name} must contain 40 questions.`);
    for (const maxDepth of [1, 2, 3]) {
      if (deckCards.filter((card) => card.depth <= maxDepth).length < 12) errors.push(`${deck.name} must support a twelve-question session at maximum depth ${maxDepth}.`);
    }
  }
  if (validCards.filter((card) => card.kind === 'activity').length !== 24) errors.push('The collection must contain 24 optional activities.');
  return errors;
}

// Validate built-in data once at the boundary, before any screen or session uses it.
const contentErrors = validateContent();
if (contentErrors.length) throw new Error(`Invalid built-in content: ${contentErrors.join(' ')}`);
