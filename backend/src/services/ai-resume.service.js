const { GoogleGenAI } = require("@google/genai");

/*
 * Get Gemini client
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}


/*
 * Get configured Gemini model
 */
function getModelName() {
  return (
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash"
  );
}


/*
 * Safely parse JSON returned by Gemini
 */
function parseJson(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {
    console.error(
      "Gemini returned:",
      cleaned
    );

    throw new Error(
      "AI returned invalid JSON"
    );
  }

  try {
    return JSON.parse(
      cleaned.slice(start, end + 1)
    );
  } catch (error) {
    console.error(
      "JSON parse error:",
      error.message
    );

    throw new Error(
      "AI returned invalid JSON"
    );
  }
}


/*
 * Normalize arrays
 */
function list(value, max) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(Boolean)
    .map(String)
    .slice(0, max);
}


/*
 * Analyze Resume
 */
async function analyzeResume(resume) {
  console.log(
    "\n========== AI RESUME ANALYSIS =========="
  );

  /*
   * Check API key
   */
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "GEMINI_API_KEY is missing"
    );

    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  /*
   * Resume text
   */
  const text = String(
    resume.parsedText || ""
  ).slice(0, 30000);

  if (!text.trim()) {
    throw new Error(
      "Resume has no parsed text to analyze"
    );
  }

  /*
   * Gemini configuration
   */
  const modelName = getModelName();

  console.log(
    "Gemini API Key: LOADED"
  );

  console.log(
    "Gemini Model:",
    modelName
  );

  /*
   * Create Gemini client
   */
  const ai = getGeminiClient();

  /*
   * Extracted skills
   */
  const extractedSkills =
    Array.isArray(resume.extractedSkills)
      ? resume.extractedSkills.join(", ")
      : "";

  /*
   * Prompt
   */
  const prompt = `
You are an expert ATS resume analyzer.

Analyze the following resume and return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not add explanations outside the JSON.

Return exactly this structure:

{
  "summary": "2-3 sentence summary",
  "atsScore": 0,
  "strengths": [],
  "weaknesses": [],
  "missingKeywords": [],
  "technicalSkills": [],
  "softSkills": [],
  "experience": [],
  "education": [],
  "projects": [],
  "certifications": [],
  "improvements": [],
  "keywordsToAdd": []
}

Rules:

1. atsScore must be between 0 and 100.

2. Never invent information.

3. Only report information actually present
   in the resume.

4. Missing keywords and keywordsToAdd are
   recommendations, not claims.

5. Analyze:
   - ATS compatibility
   - Resume structure
   - Keywords
   - Technical skills
   - Soft skills
   - Measurable achievements
   - Projects
   - Education
   - Certifications
   - Resume clarity

6. Keep lists concise.

7. If information is missing,
   return an empty array.

8. Do not make hiring decisions.

9. Do not claim that the candidate
   will get a job.

Resume filename:
${resume.fileName || "Resume"}

Existing extracted skills:
${extractedSkills}

Resume text:
${text}
`;

  try {
    console.log(
      "Sending resume to Gemini..."
    );

    /*
     * Current Google GenAI SDK
     */
    const response =
      await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

    console.log(
      "Gemini request completed"
    );

    const responseText =
      response.text;

    console.log(
      "Gemini response received"
    );

    if (!responseText) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    /*
     * Parse AI JSON
     */
    const data =
      parseJson(responseText);

    console.log(
      "AI JSON parsed successfully"
    );

    console.log(
      "========================================\n"
    );

    /*
     * Return clean response
     */
    return {
      summary: String(
        data.summary || ""
      ),

      atsScore: Math.max(
        0,
        Math.min(
          100,
          Number(data.atsScore) || 0
        )
      ),

      strengths: list(
        data.strengths,
        5
      ),

      weaknesses: list(
        data.weaknesses,
        5
      ),

      missingKeywords: list(
        data.missingKeywords,
        12
      ),

      technicalSkills: list(
        data.technicalSkills,
        30
      ),

      softSkills: list(
        data.softSkills,
        15
      ),

      experience: list(
        data.experience,
        8
      ),

      education: list(
        data.education,
        8
      ),

      projects: list(
        data.projects,
        8
      ),

      certifications: list(
        data.certifications,
        10
      ),

      improvements: list(
        data.improvements,
        8
      ),

      keywordsToAdd: list(
        data.keywordsToAdd,
        12
      ),
    };

  } catch (error) {

    console.error(
      "\n========== GEMINI ERROR =========="
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Status:",
      error.status || "N/A"
    );

    console.error(
      "Name:",
      error.name || "N/A"
    );

    console.error(
      "Full error:",
      error
    );

    console.error(
      "==================================\n"
    );

    /*
     * Don't hide the actual error.
     */
    throw new Error(
      `Gemini AI failed: ${error.message}`
    );
  }
}


module.exports = {
  analyzeResume,
};