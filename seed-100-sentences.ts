import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
const SUPABASE_URL = 'https://gzaqxegswbuqtckdzaph.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6YXF4ZWdzd2J1cXRja2R6YXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE5NDk1NiwiZXhwIjoyMTAzNzcwOTU2fQ.-RfDjNvg-1HWJf45W0OSazuXMY2SiuHcz-UGdiTo6Xs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sentences = [
  // Greetings & Basics
  { m: 'नमस्कार', e: 'Hello', d: 1 },
  { m: 'शुभ रात्री', e: 'Good night', d: 1 },
  { m: 'धन्यवाद', e: 'Thank you', d: 1 },
  { m: 'माफ करा', e: 'Sorry', d: 1 },
  { m: 'कृपया', e: 'Please', d: 1 },
  { m: 'होय', e: 'Yes', d: 1 },
  { m: 'नाही', e: 'No', d: 1 },
  { m: 'तुम्ही कसे आहात?', e: 'How are you?', d: 1 },
  { m: 'मी ठीक आहे', e: 'I am fine', d: 1 },
  { m: 'पुन्हा भेटू', e: 'See you again', d: 1 },
  
  // Identifications
  { m: 'मी मुलगा आहे', e: 'I am a boy', d: 1 },
  { m: 'ती मुलगी आहे', e: 'She is a girl', d: 1 },
  { m: 'हा कुत्रा आहे', e: 'This is a dog', d: 1 },
  { m: 'ते मांजर आहे', e: 'That is a cat', d: 1 },
  { m: 'हे पुस्तक आहे', e: 'This is a book', d: 1 },
  { m: 'तो माझा मित्र आहे', e: 'He is my friend', d: 2 },
  { m: 'ती माझी बहीण आहे', e: 'She is my sister', d: 2 },
  { m: 'हे घर मोठे आहे', e: 'This house is big', d: 2 },
  { m: 'ते झाड हिरवे आहे', e: 'That tree is green', d: 2 },
  { m: 'माझे नाव राम आहे', e: 'My name is Ram', d: 1 },

  // Actions / Verbs (Present)
  { m: 'मी खातो', e: 'I eat', d: 2 },
  { m: 'ती पिते', e: 'She drinks', d: 2 },
  { m: 'तो पळतो', e: 'He runs', d: 2 },
  { m: 'आम्ही खेळतो', e: 'We play', d: 2 },
  { m: 'ते झोपतात', e: 'They sleep', d: 2 },
  { m: 'तू वाचतोस', e: 'You read', d: 2 },
  { m: 'मी लिहितो', e: 'I write', d: 2 },
  { m: 'ती गाते', e: 'She sings', d: 2 },
  { m: 'तो रडतो', e: 'He cries', d: 2 },
  { m: 'कुत्रा भुंकतो', e: 'The dog barks', d: 2 },

  // Daily Routine
  { m: 'मी सकाळी लवकर उठतो', e: 'I wake up early in the morning', d: 3 },
  { m: 'मी दात घासतो', e: 'I brush my teeth', d: 2 },
  { m: 'ती आंघोळ करते', e: 'She takes a bath', d: 2 },
  { m: 'आम्ही नाश्ता करतो', e: 'We have breakfast', d: 2 },
  { m: 'मी शाळेत जातो', e: 'I go to school', d: 2 },
  { m: 'तो काम करतो', e: 'He works', d: 2 },
  { m: 'मी टीव्ही पाहतो', e: 'I watch TV', d: 2 },
  { m: 'ती अभ्यास करते', e: 'She studies', d: 2 },
  { m: 'आम्ही जेवण करतो', e: 'We eat dinner', d: 2 },
  { m: 'तो रात्री झोपतो', e: 'He sleeps at night', d: 2 },

  // Questions
  { m: 'तुझे नाव काय आहे?', e: 'What is your name?', d: 1 },
  { m: 'तू कुठे राहतोस?', e: 'Where do you live?', d: 2 },
  { m: 'हे काय आहे?', e: 'What is this?', d: 1 },
  { m: 'तू काय करत आहेस?', e: 'What are you doing?', d: 2 },
  { m: 'तो कोण आहे?', e: 'Who is he?', d: 1 },
  { m: 'ती कुठे गेली?', e: 'Where did she go?', d: 3 },
  { m: 'तुला काय हवे आहे?', e: 'What do you want?', d: 2 },
  { m: 'शाळा कधी सुटते?', e: 'When does school finish?', d: 3 },
  { m: 'तू का रडत आहेस?', e: 'Why are you crying?', d: 2 },
  { m: 'हे पुस्तक कोणाचे आहे?', e: 'Whose book is this?', d: 3 },

  // Feelings / Adjectives
  { m: 'मला आनंद झाला', e: 'I am happy', d: 2 },
  { m: 'ती दुःखी आहे', e: 'She is sad', d: 2 },
  { m: 'तो रागावला आहे', e: 'He is angry', d: 2 },
  { m: 'मला भूक लागली आहे', e: 'I am hungry', d: 2 },
  { m: 'तुला तहान लागली आहे का?', e: 'Are you thirsty?', d: 2 },
  { m: 'हा चहा गरम आहे', e: 'This tea is hot', d: 2 },
  { m: 'पाणी थंड आहे', e: 'The water is cold', d: 2 },
  { m: 'हे सफरचंद गोड आहे', e: 'This apple is sweet', d: 2 },
  { m: 'ते लिंबू आंबट आहे', e: 'That lemon is sour', d: 2 },
  { m: 'ती खूप सुंदर आहे', e: 'She is very beautiful', d: 2 },

  // Past Tense
  { m: 'मी काल बाजारात गेलो', e: 'I went to the market yesterday', d: 3 },
  { m: 'त्याने आंबा खाल्ला', e: 'He ate a mango', d: 3 },
  { m: 'ती काल आली', e: 'She came yesterday', d: 3 },
  { m: 'आम्ही चित्रपट पाहिला', e: 'We watched a movie', d: 3 },
  { m: 'त्यांनी क्रिकेट खेळले', e: 'They played cricket', d: 3 },
  { m: 'मी तुला पाहिले', e: 'I saw you', d: 3 },
  { m: 'तिने गाणे गायले', e: 'She sang a song', d: 3 },
  { m: 'तो खूप धावला', e: 'He ran a lot', d: 3 },
  { m: 'आम्ही जिंकलो', e: 'We won', d: 3 },
  { m: 'मी काम संपवले', e: 'I finished the work', d: 3 },

  // Future Tense
  { m: 'मी उद्या शाळेत जाईन', e: 'I will go to school tomorrow', d: 3 },
  { m: 'ती लवकरच येईल', e: 'She will come soon', d: 3 },
  { m: 'आम्ही उद्या खेळू', e: 'We will play tomorrow', d: 3 },
  { m: 'तो अभ्यास करेल', e: 'He will study', d: 3 },
  { m: 'मी तुला मदत करेन', e: 'I will help you', d: 3 },
  { m: 'पाऊस पडेल', e: 'It will rain', d: 3 },
  { m: 'मी नवीन गाडी घेईन', e: 'I will buy a new car', d: 4 },
  { m: 'ती पत्र लिहील', e: 'She will write a letter', d: 3 },
  { m: 'आम्ही पुण्याला जाऊ', e: 'We will go to Pune', d: 3 },
  { m: 'तो जिंकणार', e: 'He will win', d: 2 },

  // Prepositions / Locations
  { m: 'पुस्तक टेबलावर आहे', e: 'The book is on the table', d: 3 },
  { m: 'मांजर खुर्चीखाली आहे', e: 'The cat is under the chair', d: 3 },
  { m: 'माझे घर शाळेजवळ आहे', e: 'My house is near the school', d: 3 },
  { m: 'तो खोलीत आहे', e: 'He is in the room', d: 2 },
  { m: 'पक्षी झाडावर बसला आहे', e: 'The bird is sitting on the tree', d: 4 },
  { m: 'मी मित्रांसोबत आहे', e: 'I am with my friends', d: 3 },
  { m: 'गाडी रस्त्यावर आहे', e: 'The car is on the road', d: 3 },
  { m: 'तो माझ्यामागे उभा आहे', e: 'He is standing behind me', d: 4 },
  { m: 'ती माझ्यासमोर आहे', e: 'She is in front of me', d: 4 },
  { m: 'आम्ही घरात आहोत', e: 'We are in the house', d: 2 },

  // Numbers & Colors
  { m: 'माझ्याकडे दोन पेन आहेत', e: 'I have two pens', d: 2 },
  { m: 'तिच्याकडे लाल साडी आहे', e: 'She has a red saree', d: 3 },
  { m: 'आकाशाचा रंग निळा आहे', e: 'The color of the sky is blue', d: 3 },
  { m: 'तो काळा कुत्रा आहे', e: 'That is a black dog', d: 2 },
  { m: 'माझे वय दहा वर्षे आहे', e: 'I am ten years old', d: 3 },
  { m: 'घड्याळात पाच वाजले आहेत', e: 'It is five o clock in the watch', d: 4 },
  { m: 'मी तीन सफरचंद खाल्ले', e: 'I ate three apples', d: 3 },
  { m: 'त्याची गाडी पांढरी आहे', e: 'His car is white', d: 2 },
  { m: 'हिरवे गवत छान दिसते', e: 'Green grass looks nice', d: 4 },
  { m: 'माझ्या वर्गात वीस मुले आहेत', e: 'There are twenty children in my class', d: 4 }
];

async function seed() {
  console.log("Starting seed of 100 sentences...");

  // Get the 'Beginner' stage and 'Greetings' concept
  const { data: stage, error: stageError } = await supabase.from('curriculum_stages').select('id').eq('level_number', 1).single();
  
  if (stageError || !stage) {
    console.error("Beginner stage not found. Error:", stageError);
    process.exit(1);
  }

  const { data: concept, error: conceptError } = await supabase.from('concepts').select('id').eq('stage_id', stage.id).eq('name', 'Greetings').single();
  
  if (conceptError || !concept) {
    console.error("Greetings concept not found. Error:", conceptError);
    process.exit(1);
  }

  // Format data for insertion
  const exercises = sentences.map(s => ({
    concept_id: concept.id,
    marathi_prompt: s.m,
    reference_translations: [s.e],
    difficulty_level: s.d
  }));

  console.log(`Inserting ${exercises.length} sentences...`);
  
  const { error } = await supabase.from('exercises').insert(exercises);
  
  if (error) {
    console.error("Error inserting exercises:", error.message);
  } else {
    console.log("Successfully added 100 new sentences!");
  }
  process.exit(0);
}

seed();
