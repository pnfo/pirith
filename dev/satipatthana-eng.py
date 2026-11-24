"""Writes dev/data/67-trans.txt, the English of the Maha Satipatthana Sutta, one line per chanted paragraph of
67-combi.txt. The sutta repeats the same passages with one term changed, so they are built from templates here:
    python3 dev/satipatthana-eng.py
"""
from pathlib import Path
E = {}
ARDENT = 'ardent, clearly comprehending and mindful, having put away covetousness and grief for the world'
OBJ = {'body': 'the body in the body', 'feel': 'feelings in feelings', 'mind': 'the mind in the mind', 'dhamma': 'dhammas in dhammas'}
LOC = {'body': 'the body', 'feel': 'feelings', 'mind': 'the mind', 'dhamma': 'dhammas'}
IS = {'body': "'there is a body'", 'feel': "'there is feeling'", 'mind': "'there is mind'", 'dhamma': "'there are dhammas'"}
A = lambda k: f'Thus he dwells contemplating {OBJ[k]} internally, or he dwells contemplating {OBJ[k]} externally, or he dwells contemplating {OBJ[k]} both internally and externally.'
B = lambda k: f'He dwells contemplating the nature of arising in {LOC[k]}, or the nature of passing away in {LOC[k]}, or the nature of both arising and passing away in {LOC[k]}.'
C1 = lambda k: f'Or mindfulness that {IS[k]} is established in him,'
C2 = 'just to the extent needed for knowledge and awareness. He dwells independent, not clinging to anything in the world.'
C = lambda k: f'{C1(k)} {C2}'
D = lambda k, tail='': f'In this way too, monks, a monk dwells contemplating {OBJ[k]}{tail}.'
done = lambda what: f'The {what} is finished.'

E[1] = 'The Great Discourse on the Foundations of Mindfulness'
E[2] = "Thus have I heard. At one time the Blessed One was living among the Kurus, at a market town of the Kurus named Kammasadamma. There the Blessed One addressed the monks: 'Monks.' 'Venerable sir,' those monks replied. The Blessed One said this:"
PATH = 'this is the one-way path for the purification of beings, for overcoming sorrow and lamentation, for the ending of pain and grief, for attaining the right method, for the realisation of Nibbana: namely, the four foundations of mindfulness'
E[3] = f'Monks, {PATH}. What four? Here, monks, a monk dwells contemplating the body in the body, {ARDENT};'
E[4] = f'he dwells contemplating feelings in feelings, {ARDENT};'
E[5] = f'he dwells contemplating the mind in the mind, {ARDENT};'
E[6] = f'he dwells contemplating dhammas in dhammas, {ARDENT}.'
E[7] = done('summary')
BREATH = "reathing in long, he knows 'I breathe in long'; breathing out long, he knows 'I breathe out long'. Breathing in short, he knows 'I breathe in short'; breathing out short, he knows 'I breathe out short'. He trains: 'I shall breathe in experiencing the whole body'; he trains: 'I shall breathe out experiencing the whole body'. He trains: 'I shall breathe in calming the bodily formation'; he trains: 'I shall breathe out calming the bodily formation'."
E[8] = 'And how, monks, does a monk dwell contemplating the body in the body? Here, monks, a monk who has gone to the forest, to the foot of a tree or to an empty hut sits down, folds his legs crosswise, holds his body straight and establishes mindfulness in front of him. Mindful he breathes in, mindful he breathes out. B' + BREATH
E[9] = "Just as a skilled turner or his apprentice, monks, making a long turn knows 'I make a long turn', or making a short turn knows 'I make a short turn'; so too, monks, a monk b" + BREATH
E[10], E[11], E[12] = A('body'), B('body'), f"{C('body')} {D('body')}"
E[13] = done('section on in-and-out breathing')
E[14] = "Again, monks, when walking a monk knows 'I am walking'; when standing he knows 'I am standing'; when sitting he knows 'I am sitting'; when lying down he knows 'I am lying down'; or however his body is disposed, he knows it accordingly."
AB = lambda k: f'{A(k)} {B(k)}'
for i in (15, 19, 30, 35, 40, 45, 50, 55, 60, 64, 68, 72): E[i] = AB('body')
for i in (16, 61, 65, 69, 73): E[i] = E[12]
for i in (20, 31, 36, 41, 46, 51, 56): E[i] = C('body')
for i in (21, 32, 37, 42, 47, 52, 57): E[i] = D('body')
E[17] = done('section on the postures')
E[18] = 'Again, monks, a monk acts with clear comprehension when going forward and returning; when looking ahead and looking away; when bending and stretching his limbs; when wearing his robes and carrying his outer robe and bowl; when eating, drinking, chewing and tasting; when defecating and urinating; when walking, standing, sitting, falling asleep, waking up, talking and keeping silent.'
E[22] = done('section on clear comprehension')
REVIEW = 'a monk reviews this very body, up from the soles of the feet and down from the top of the hair, bounded by skin and full of many kinds of impurity:'
PARTS = "'In this body there are head hairs, body hairs, nails, teeth, skin, flesh, sinews, bones, bone marrow, kidneys, heart, liver, diaphragm, spleen, lungs, intestines, mesentery, contents of the stomach, faeces, bile, phlegm, pus, blood, sweat, fat, tears, grease, spittle, snot, oil of the joints and urine.'"
E[23] = f'Again, monks, {REVIEW}'
E[24] = PARTS
E[25] = f"Just as if, monks, there were a bag with an opening at both ends, full of various kinds of grain such as hill rice, paddy, green gram, beans, sesame and husked rice, and a man with good eyes were to open it and review it: 'This is hill rice, this is paddy, this is green gram, these are beans, this is sesame, this is husked rice'; so too, monks, {REVIEW} {PARTS}"
E[26] = f"{AB('body')} {C('body')} {D('body')}"
E[27] = done('section on attention to repulsiveness')
ELEM = "a monk reviews this very body, however it is placed, however it is disposed, by way of the elements: 'In this body there are the earth element, the water element, the fire element and the air element.'"
E[28] = f'Again, monks, {ELEM}'
E[29] = f'Just as if, monks, a skilled butcher or his apprentice had killed a cow and were seated at a crossroads with it cut up into pieces; so too, monks, {ELEM}'
E[33] = done('section on attention to the elements')
CORPSE = ['one, two or three days dead, bloated, livid and festering', 'being devoured by crows, hawks, vultures, dogs, jackals or various kinds of worms',
  'a skeleton with flesh and blood, held together by sinews', 'a fleshless skeleton smeared with blood, held together by sinews', 'a skeleton without flesh and blood, held together by sinews',
  'bones no longer connected, scattered in all directions: here a hand bone, there a foot bone, here an ankle bone, there a shin bone, here a thigh bone, there a back bone, here a hip bone, there a shoulder bone, here a neck bone, there a tooth, there the skull',
  'bones bleached white, the colour of shells', 'bones heaped up, more than a year old', 'bones rotted and crumbled to dust']
ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
for n, (start, end) in enumerate(zip((34, 39, 44, 49, 54, 59, 63, 67, 71), (38, 43, 48, 53, 58, 62, 66, 70, 74))):
    E[start] = f"Again, monks, as if a monk were to see a corpse thrown aside in a charnel ground, {CORPSE[n]}, he compares this very body with it: 'This body too is of the same nature; it will become like that; it is not exempt from that fate.'"
    E[end] = f'(The {ORD[n]} charnel ground contemplation)'
E[75] = 'The fourteen contemplations of the body are finished.'
E[76] = 'Contemplation of Feelings'
F3 = ['pleasant', 'painful', 'neither-painful-nor-pleasant']
E[77] = 'And how, monks, does a monk dwell contemplating feelings in feelings? Here, monks, w' + '; w'.join(f"hen feeling a {f} feeling {'a monk' if i == 0 else 'he'} knows 'I feel a {f} feeling'" for i, f in enumerate(F3)) + '.'
E[78] = ' '.join(f"When feeling {w} {f} feeling he knows 'I feel {w} {f} feeling'." for f in F3 for w in ('a worldly', 'an unworldly'))
E[79], E[80], E[81] = AB('feel'), f"{C('feel')} {D('feel')}", done('contemplation of feelings')
E[82] = 'Contemplation of the Mind'
E[83] = 'And how, monks, does a monk dwell contemplating the mind in the mind?'
MINDS = ['mind with lust', 'mind without lust', 'mind with hatred', 'mind without hatred', 'mind with delusion', 'mind without delusion', 'contracted mind', 'distracted mind',
  'exalted mind', 'unexalted mind', 'surpassable mind', 'unsurpassable mind', 'concentrated mind', 'unconcentrated mind', 'liberated mind', 'unliberated mind']
an = lambda s: ('an ' if s[0] in 'aeiou' else 'a ') + s
E[84] = 'Here, monks, a monk knows ' + ', '.join(f'{an(m)} as {an(m)}' for m in MINDS) + '.'
E[85], E[86], E[87] = AB('mind'), f"{C('mind')} {D('mind')}", done('contemplation of the mind')
E[88] = 'Contemplation of Dhammas'
E[89] = 'And how, monks, does a monk dwell contemplating dhammas in dhammas?'
def intro(what, first=False):
    t = f'a monk dwells contemplating dhammas in dhammas in terms of {what}. And how, monks, does a monk dwell contemplating dhammas in dhammas in terms of {what}?'
    return ('Here, monks, ' if first else 'Again, monks, ') + t
E[90] = intro('the five hindrances', True)
for i, x in enumerate(['sensual desire', 'ill will', 'dullness and drowsiness', 'restlessness and remorse', 'doubt']):
    E[91 + i] = ('Here, monks, w' if i == 0 else 'W') + f"hen {x} is present in him, {'a monk' if i == 0 else 'he'} knows 'There is {x} in me'; when {x} is not present in him, he knows 'There is no {x} in me'. He knows how unarisen {x} comes to arise, how arisen {x} is abandoned, and how abandoned {x} does not arise again in the future."
E[96] = f"{AB('dhamma')} {C1('dhamma')}"
E[97] = f"{C2[0].upper()}{C2[1:]} {D('dhamma', ' in terms of the five hindrances')}"
E[98] = '(The section on the hindrances is finished.)'
AGG = [('form', 'is'), ('feeling', 'is'), ('perception', 'is'), ('formations', 'are'), ('consciousness', 'is')]
E[99] = intro('the five aggregates of clinging') + " Here, monks, a monk knows: '" + '; '.join(f'such {v} {a}, such is the arising of {a}, such is the passing away of {a}' for a, v in AGG).capitalize() + ".'"
for i in (100, 111, 186): E[i] = AB('dhamma')
for i in (101, 112, 125, 187): E[i] = C('dhamma')
E[102] = D('dhamma', ' in terms of the five aggregates of clinging')
E[103] = done('section on the aggregates')
E[104] = intro('the six internal and external sense bases')
for i, (a, b) in enumerate([('eye', 'forms'), ('ear', 'sounds'), ('nose', 'smells'), ('tongue', 'tastes'), ('body', 'tangible objects'), ('mind', 'mental objects')]):
    E[105 + i] = ('Here, monks, a monk' if i == 0 else 'He') + f' knows the {a}, he knows {b}, and he knows the fetter that arises dependent on both. He knows how the unarisen fetter comes to arise, how the arisen fetter is abandoned, and how the abandoned fetter does not arise again in the future.'
E[113] = D('dhamma', ' in terms of the six internal and external sense bases')
E[114] = done('section on the sense bases')
E[115] = intro('the seven factors of awakening')
for i, x in enumerate(['mindfulness', 'investigation of dhammas', 'energy', 'rapture', 'tranquillity', 'concentration', 'equanimity']):
    f = f'the awakening factor of {x}'
    E[116 + i] = ('Here, monks, w' if i == 0 else 'W') + f"hen {f} is present in him, {'a monk' if i == 0 else 'he'} knows 'There is {f} in me'; when {f} is not present in him, he knows 'There is no awakening factor of {x} in me'. He knows how the unarisen awakening factor of {x} comes to arise, and how the arisen awakening factor of {x} comes to fulfilment by development."
E[123], E[124] = A('dhamma'), B('dhamma')
E[126] = D('dhamma', ' in terms of the seven factors of awakening')
E[127] = done('section on the factors of awakening')
E[128] = done('first recitation section')
E[129] = intro('the four noble truths')
WAY = 'the way leading to the cessation of suffering'
E[130] = "Here, monks, a monk knows as it really is: 'This is suffering'; he knows as it really is: 'This is the origin of suffering'; he knows as it really is: 'This is the cessation of suffering'; he knows as it really is: 'This is " + WAY + "'."
E[131] = 'And what, monks, is the noble truth of suffering? Birth is suffering, ageing is suffering, death is suffering; sorrow, lamentation, pain, grief and despair are suffering; association with the disliked is suffering, separation from the liked is suffering, not getting what one wants is suffering; in brief, the five aggregates of clinging are suffering.'
E[132] = 'And what, monks, is birth? The birth of the various beings in the various orders of beings, their being born, descent, production, the appearance of the aggregates, the obtaining of the sense bases: this, monks, is called birth.'
E[133] = 'And what, monks, is ageing? The ageing of the various beings in the various orders of beings, their decay, broken teeth, grey hair, wrinkled skin, decline of life, ripening of the faculties: this, monks, is called ageing.'
E[134] = 'And what, monks, is death? The passing of the various beings from the various orders of beings, their passing away, breaking up, disappearance, dying, death, completion of time, the breaking up of the aggregates, the laying down of the body, the cutting off of the life faculty: this, monks, is called death.'
WHO = 'of one who has met with some misfortune or is touched by some painful state'
E[135] = f'And what, monks, is sorrow? The sorrow, sorrowing, sorrowfulness, inner sorrow and deep inner sorrow {WHO}: this, monks, is called sorrow.'
E[136] = f'And what, monks, is lamentation? The wailing and lamenting, the act of wailing and lamenting, the state of wailing and lamenting {WHO}: this, monks, is called lamentation.'
E[137] = 'And what, monks, is pain? Bodily pain, bodily discomfort, the painful and uncomfortable feeling born of bodily contact: this, monks, is called pain.'
E[138] = 'And what, monks, is grief? Mental pain, mental discomfort, the painful and uncomfortable feeling born of mental contact: this, monks, is called grief.'
E[139] = f'And what, monks, is despair? The trouble and despair, the state of being troubled and in despair {WHO}: this, monks, is called despair.'
SIX = 'forms, sounds, smells, tastes, tangible objects and mental objects'
E[140] = f'And what, monks, is the suffering of association with the disliked? Here, whoever has unwanted, unloved, unpleasing {SIX}, or whoever has those who wish him harm, ill, discomfort and bondage: meeting, coming together, joining and mixing with them. This, monks, is called the suffering of association with the disliked.'
E[141] = f'And what, monks, is the suffering of separation from the liked? Here, whoever has wanted, loved, pleasing {SIX}, or whoever has those who wish him good, welfare, comfort and security, such as mother, father, brother, sister, elders, juniors, friends, companions or blood relatives: not meeting, not coming together, not joining and not mixing with them. This, monks, is called the suffering of separation from the liked.'
WISH = lambda x: f"n beings subject to {x}, monks, this wish arises: 'Oh, that we were not subject to {x}, that {x} would not come to us!' But this cannot be gained by wishing. This too is the suffering of not getting what one wants."
E[142] = 'And what, monks, is the suffering of not getting what one wants? I' + WISH('birth')
for i, x in enumerate(['ageing', 'sickness', 'death', 'sorrow', 'lamentation', 'pain', 'grief', 'despair']): E[143 + i] = 'I' + WISH(x)
E[151] = 'And what, monks, in brief, are the five aggregates of clinging that are suffering? They are the aggregate of clinging to form, the aggregate of clinging to feeling, the aggregate of clinging to perception, the aggregate of clinging to formations and the aggregate of clinging to consciousness. These, monks, are called, in brief, the five aggregates of clinging that are suffering. This, monks, is called the noble truth of suffering.'
E[152] = 'And what, monks, is the noble truth of the origin of suffering? It is this craving that leads to renewed existence, accompanied by delight and lust, delighting now here, now there; namely, craving for sensual pleasures, craving for existence and craving for non-existence.'
DEAR = 'in the world is dear and pleasing;'
ARISE = 'there this craving arises when it arises, there it settles when it settles.'
CEASE = 'there this craving is abandoned when it is abandoned, there it ceases when it ceases.'
SENSES = 'The ear in the world ... the nose in the world ... the tongue in the world ... the body in the world ... the mind'
E[153] = f'But where, monks, does this craving arise when it arises, and where does it settle when it settles? Whatever {DEAR} {ARISE} And what {DEAR[:-1]}? The eye {DEAR} {ARISE} {SENSES} {DEAR} {ARISE}'
O6 = ['forms', 'sounds', 'smells', 'tastes', 'tangible objects', 'mental objects']
S6 = ['eye', 'ear', 'nose', 'tongue', 'body', 'mind']
LISTS = [O6, [f'{s}-consciousness' for s in S6], [f'{s}-contact' for s in S6], [f'feeling born of {s}-contact' for s in S6], [f'perception of {o}' for o in O6],
  [f'volition regarding {o}' for o in O6], [f'craving for {o}' for o in O6], [f'thought about {o}' for o in O6], [f'examination of {o}' for o in O6]]
for i, items in enumerate(LISTS):
    line = ' ... '.join(items)
    E[154 + i] = f'{line[0].upper()}{line[1:]} {DEAR} {ARISE}'
    E[166 + i] = f'{line[0].upper()}{line[1:]} {DEAR} {CEASE}'
E[163] = 'This, monks, is called the noble truth of the origin of suffering.'
E[164] = f'And what, monks, is the noble truth of the cessation of suffering? It is the remainderless fading away and cessation of that very craving, the giving up and relinquishing of it, freedom from it, non-reliance on it. But where, monks, is this craving abandoned when it is abandoned, and where does it cease when it ceases? Whatever {DEAR} {CEASE}'
E[165] = f'And what {DEAR[:-1]}? The eye {DEAR} {CEASE} The ear ... the nose ... the tongue ... the body ... the mind {DEAR} {CEASE}'
E[175] = 'This, monks, is called the noble truth of the cessation of suffering.'
E[176] = f'And what, monks, is the noble truth of {WAY}? It is this noble eightfold path; namely, right view, right intention, right speech, right action, right livelihood, right effort, right mindfulness and right concentration.'
R = lambda name, body: f'And what, monks, is right {name}? {body} This, monks, is called right {name}.'
E[177] = R('view', f'Knowledge of suffering, knowledge of the origin of suffering, knowledge of the cessation of suffering and knowledge of {WAY}.')
E[178] = R('intention', 'The intention of renunciation, the intention of non-ill will and the intention of harmlessness.')
E[179] = R('speech', 'Abstaining from false speech, abstaining from divisive speech, abstaining from harsh speech and abstaining from idle chatter.')
E[180] = R('action', 'Abstaining from killing living beings, abstaining from taking what is not given and abstaining from sexual misconduct.')
E[181] = R('livelihood', 'Here, monks, a noble disciple gives up wrong livelihood and makes his living by right livelihood.')
EFF = 'generates desire, makes an effort, arouses energy, applies his mind and strives'
E[182] = R('effort', f'Here, monks, a monk {EFF} for the non-arising of unarisen evil, unwholesome states. He {EFF} for the abandoning of arisen evil, unwholesome states. He {EFF} for the arising of unarisen wholesome states. He {EFF} for the continuance, non-confusion, increase, abundance, development and fulfilment of arisen wholesome states.')
E[183] = R('mindfulness', 'Here, monks, a monk dwells contemplating ' + '; he dwells contemplating '.join(f'{OBJ[k]}, {ARDENT}' for k in OBJ) + '.')
E[184] = R('concentration', "Here, monks, secluded from sensual pleasures, secluded from unwholesome states, a monk enters and dwells in the first jhana, which is accompanied by thought and examination, with rapture and happiness born of seclusion. With the stilling of thought and examination he enters and dwells in the second jhana, which has inner confidence and unification of mind, is without thought and examination, and has rapture and happiness born of concentration. With the fading away of rapture he dwells equanimous, mindful and clearly comprehending, and experiences happiness with the body; he enters and dwells in the third jhana, of which the noble ones declare: 'He is equanimous, mindful, one who dwells happily.' With the abandoning of pleasure and pain, and with the earlier passing away of joy and grief, he enters and dwells in the fourth jhana, which is neither painful nor pleasant and has purity of mindfulness due to equanimity.")
E[185] = f'This, monks, is called the noble truth of {WAY}.'
E[188] = D('dhamma', ' in terms of the four noble truths')
FRUIT = 'one of two fruits may be expected for him: final knowledge here and now or, if there is any clinging left, the state of a non-returner.'
DEV = 'hoever should develop these four foundations of mindfulness in this way for'
TIMES = ['seven years', 'six years', 'five years', 'four years', 'three years', 'two years', 'one year', 'seven months', 'six months', 'five months', 'four months', 'three months', 'two months', 'one month', 'half a month', 'seven days']
E[189] = f'Monks, w{DEV} {TIMES[0]}, {FRUIT}'
for i in range(1, len(TIMES)): E[189 + i] = f'Let alone {TIMES[i - 1]}, monks. W{DEV} {TIMES[i]}, {FRUIT}'
E[205] = f"'Monks, {PATH}.' So it was said, and it was with reference to this that it was said."
E[206] = "This is what the Blessed One said. Pleased, those monks rejoiced in the Blessed One's words."
E[207] = 'The ninth, the Great Discourse on the Foundations of Mindfulness, is finished.'

missing = [i for i in range(1, 208) if i not in E]
assert not missing and len(E) == 207, missing
(Path(__file__).parent / 'data/67-trans.txt').write_text('\n\n'.join(E[i] for i in range(1, 208)) + '\n')
print('wrote 67-trans.txt')
