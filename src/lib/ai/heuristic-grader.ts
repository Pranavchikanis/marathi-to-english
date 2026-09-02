export function evaluateHeuristically(submittedAnswer: string, referenceTranslations: string[]) {
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
  
  const normSubmitted = normalize(submittedAnswer);
  const normReferences = referenceTranslations.map(normalize);
  
  let bestMatch = false;
  let partialMatch = false;
  
  for (const ref of normReferences) {
    if (normSubmitted === ref) {
      bestMatch = true;
      break;
    }
    
    // Levenshtein distance simplified (length difference + character overlap)
    // If it's very close but has a typo (or missing "a"/"the")
    if (Math.abs(normSubmitted.length - ref.length) <= 3) {
      if (ref.includes(normSubmitted) || normSubmitted.includes(ref)) {
        partialMatch = true;
      } else {
        // Quick typo check: count matching words
        const submittedWords = normSubmitted.split(' ');
        const refWords = ref.split(' ');
        const overlap = submittedWords.filter(w => refWords.includes(w)).length;
        if (overlap >= refWords.length - 1 && overlap > 0) {
          partialMatch = true;
        }
      }
    }
  }

  const primaryReference = referenceTranslations[0] || 'N/A';

  if (bestMatch) {
    return {
      grade: 'A',
      explanation_marathi: 'तुमचे उत्तर अगदी बरोबर आहे! (टीप: हे उत्तर स्वयंचलित प्रणालीने तपासले आहे कारण आमचे मुख्य सर्व्हर व्यस्त आहेत.)',
      corrected_text: undefined,
      errors: []
    };
  } else if (partialMatch) {
    return {
      grade: 'B',
      explanation_marathi: 'तुमचे उत्तर जवळजवळ बरोबर आहे, पण त्यात एक छोटी चूक असावी. (टीप: सर्व्हर व्यस्त असल्याने आम्ही अचूक चूक सांगू शकत नाही. कृपया खालील अचूक उत्तर पहा.)',
      corrected_text: primaryReference,
      errors: []
    };
  } else {
    return {
      grade: 'D',
      explanation_marathi: 'तुमचे उत्तर थोडे वेगळे आहे किंवा चुकीचे आहे. (टीप: सर्व्हर व्यस्त असल्याने आम्ही सविस्तर स्पष्टीकरण देऊ शकत नाही. कृपया खालील अचूक उत्तर पहा.)',
      corrected_text: primaryReference,
      errors: []
    };
  }
}
