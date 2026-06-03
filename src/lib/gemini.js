import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Reusable AI service utilizing Google Gemini API for parsing and generative intelligence.
 * Incorporates premium fail-safe simulation fallbacks.
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
export class GeminiService {
  /**
   * Initializes the GeminiService by fetching keys from env variables.
   * 
   * @author Arnav Garg
   * @version 1.0.0
   */
  constructor() {
    this.genAI = null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "AIzaSyYourGeminiApiKeyHere" && apiKey.trim() !== "") {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn("GeminiService: GEMINI_API_KEY is not configured. Running in high-fidelity mock simulation mode.");
    }
  }

  /**
   * Generates a detailed resume analysis (ATS, Strengths, Weaknesses, Roles, Skills).
   * Falls back to a mock parsed template if key is missing or API call fails.
   * 
   * @param {string} resumeText Plain text extracted from the candidate's resume
   * @returns {Promise<Object>} Promise resolving to a ResumeAnalysis object
   * @author Arnav Garg
   * @version 1.0.0
   */
  async analyzeResume(resumeText) {
    if (!this.genAI) {
      return this.getMockResumeAnalysis(resumeText);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an expert ATS (Applicant Tracking System) reviewer and hiring manager.
        Analyze the following resume plain text and extract key attributes.
        Return ONLY a raw JSON string matching the typescript interface below. 
        Do not include markdown tags (like \`\`\`json) or extra text.
        
        Interface:
        {
          "atsScore": number, // out of 100, based on format, impact, and standard metrics
          "strengths": string[], // top 3-5 strengths of the profile
          "weaknesses": string[], // top 2-4 development areas
          "missingSkills": string[], // 3-6 important skills commonly expected for recommended roles but missing
          "recommendedRoles": string[], // top 2-3 target roles (e.g. Frontend Engineer, Fullstack Developer)
          "skills": string[] // list of all technologies, tools, and libraries identified in the resume
        }

        Resume text:
        ${resumeText}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      const cleanJson = text.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini API resume analysis failed. Reverting to mock:", error);
      return this.getMockResumeAnalysis(resumeText);
    }
  }

  /**
   * Ranks job compatibility against a parsed resume.
   * 
   * @param {string[]} skills Candidate's technical and professional skills list
   * @param {string} jobTitle Target position title
   * @param {string} jobDesc Target position description
   * @param {string[]} jobSkills Required skills listed by recruiter
   * @returns {Promise<Object>} Promise resolving to a JobMatch object
   * @author Arnav Garg
   * @version 1.0.0
   */
  async matchJob(skills, jobTitle, jobDesc, jobSkills) {
    if (!this.genAI) {
      return this.getMockJobMatch(skills, jobTitle, jobSkills);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an AI Job Matching Assistant.
        Evaluate the compatibility of the candidate's skills list against the target job requirements.
        Return ONLY a raw JSON string matching the typescript interface below. 
        Do not include markdown tags or extra text.

        Candidate Skills: [${skills.join(", ")}]
        Job Title: ${jobTitle}
        Job Description: ${jobDesc}
        Job Required Skills: [${jobSkills.join(", ")}]

        Interface:
        {
          "company": string, // leave blank if unknown, or infer
          "role": string, // target job role title
          "matchScore": number, // integer score from 0 to 100 matching relevance
          "missingSkills": string[] // list of required job skills that candidate does not seem to possess
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini API job match failed. Reverting to mock:", error);
      return this.getMockJobMatch(skills, jobTitle, jobSkills);
    }
  }

  /**
   * Generates mock preparation questions: 5 Technical, 3 Behavioral, 2 Project questions.
   * 
   * @param {string[]} skills Candidate's skills array
   * @param {string[]} recommendedRoles Recommended target job titles
   * @returns {Promise<Object>} Promise resolving to InterviewQuestions object
   * @author Arnav Garg
   * @version 1.0.0
   */
  async generateInterviewQuestions(skills, recommendedRoles) {
    if (!this.genAI) {
      return this.getMockInterviewQuestions(skills, recommendedRoles);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are a seasoned technical interviewer.
        Based on the candidate's skills and target roles, generate high-quality, tailored interview preparation questions.
        Provide a diverse, highly specific set of questions. Introduce variety and select from intermediate to advanced concepts.
        Avoid returning the exact same standard questions across multiple requests.
        Random seed hint: ${Math.random()}

        Candidate Skills: [${skills.join(", ")}]
        Target Roles: [${recommendedRoles.join(", ")}]

        Interface:
        {
          "technical": string[], // Exactly 5 technical questions based on skills
          "behavioral": string[], // Exactly 3 behavioral/HR questions
          "project": string[] // Exactly 2 questions about architectural design or projects on their tech stack
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini API interview generation failed. Reverting to mock:", error);
      return this.getMockInterviewQuestions(skills, recommendedRoles);
    }
  }

  /**
   * Simulates resume analysis outputs.
   * 
   * @param {string} resumeText User input resume content
   * @returns {Object} Mocked analysis results
   * @author Arnav Garg
   * @version 1.0.0
   */
  getMockResumeAnalysis(resumeText) {
    const textLower = resumeText.toLowerCase();
    const skillsList = ["React", "TypeScript", "Node.js", "MongoDB", "Prisma", "Express", "Next.js", "Tailwind CSS", "JavaScript", "HTML", "CSS", "SQL", "Git"];
    const foundSkills = skillsList.filter(skill => textLower.includes(skill.toLowerCase()));
    
    if (foundSkills.length === 0) {
      foundSkills.push("React", "JavaScript", "CSS", "Git");
    }

    const missingSkills = ["GraphQL", "Docker", "AWS", "CI/CD", "Redis"].filter(
      skill => !foundSkills.includes(skill)
    );

    return {
      atsScore: Math.floor(Math.random() * 20) + 70,
      strengths: [
        "Solid foundation in web application development using modern frameworks.",
        "Demonstrated understanding of database querying and object modeling layers.",
        "Clear organization of codebase components and structural integrity."
      ],
      weaknesses: [
        "Limited exposure to cloud containerization technologies like Docker.",
        "Lack of metrics showcasing business or application runtime optimizations.",
        "No explicit mention of testing tools (Jest, Cypress, or Playwright)."
      ],
      missingSkills,
      recommendedRoles: ["Frontend Engineer", "Fullstack Developer"],
      skills: foundSkills
    };
  }

  /**
   * Simulates job matching score calculation.
   * 
   * @param {string[]} skills Candidate's technical skills
   * @param {string} jobTitle Job title
   * @param {string[]} jobSkills Required skills for the job
   * @returns {Object} Mocked job compatibility score
   * @author Arnav Garg
   * @version 1.0.0
   */
  getMockJobMatch(skills, jobTitle, jobSkills) {
    const matched = jobSkills.filter(skill => 
      skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    const missing = jobSkills.filter(skill => 
      !skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );

    const matchRatio = jobSkills.length > 0 ? (matched.length / jobSkills.length) : 0.8;
    const score = Math.floor(matchRatio * 40) + 60;

    return {
      company: "",
      role: jobTitle,
      matchScore: Math.min(score, 100),
      missingSkills: missing
    };
  }

  /**
   * Simulates mock interview questions compilation.
   * 
   * @param {string[]} skills Candidate's skills list
   * @param {string[]} recommendedRoles Recommended jobs
   * @returns {Object} Mocked lists of questions
   * @author Arnav Garg
   * @version 1.0.0
   */
  getMockInterviewQuestions(skills, recommendedRoles) {
    const candidateSkills = (skills && skills.length > 0) ? skills : ["React", "JavaScript", "SQL"];
    const targetRoles = (recommendedRoles && recommendedRoles.length > 0) ? recommendedRoles : ["Frontend Engineer", "Fullstack Developer"];
    
    // Helper to shuffle array in-place and slice
    const getRandomSample = (arr, count) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // 1. Technical questions pool mapped by specific key technologies
    const skillQuestions = {
      react: [
        "Explain the core lifecycle hooks and state management differences in React.",
        "How do React Server Components (RSC) differ from standard client-side components?",
        "What are the best strategies to optimize rendering performance in large React lists?",
        "How do you handle global state sharing in React using Context API vs Redux?",
        "Describe React's reconciliation algorithm and the importance of keys in list rendering."
      ],
      javascript: [
        "Explain event delegation and how event bubbling works in vanilla JavaScript.",
        "What is the difference between microtasks and macrotasks in the JavaScript Event Loop?",
        "Explain closures and provide a real-world use case where closures prevent memory leaks.",
        "How do prototypal inheritance and class-based syntax differ in JavaScript?",
        "Explain the differences between Promise.all, Promise.allSettled, and async/await error handling."
      ],
      typescript: [
        "What are utility types in TypeScript? Explain Record, Partial, and Omit with examples.",
        "How do you implement type guards and discriminated unions to handle dynamic payloads?",
        "What is the difference between type aliases and interfaces in TypeScript?",
        "Explain the 'unknown' type and how it differs from 'any' in type-safe development.",
        "How does TypeScript's compiler option 'strictNullChecks' protect production codebases?"
      ],
      node: [
        "Explain the cluster module in Node.js and how it helps scale network services.",
        "How does the libuv thread pool handle asynchronous I/O operations in Node.js?",
        "Describe the difference between streams and buffers when reading large file inputs.",
        "How do you secure Node.js applications against memory leaks and CPU-blocking operations?",
        "Explain middleware propagation and error handling structures in Express/Koa."
      ],
      mongodb: [
        "How do you design index patterns in MongoDB to optimize slow query execution?",
        "Explain MongoDB transaction limitations and how they differ from SQL transactions.",
        "Describe aggregation pipelines and when you would prefer them over standard queries.",
        "How do document referencing and embedding models impact read vs write performance?",
        "What are replica sets in MongoDB, and how does secondary read routing work?"
      ],
      sql: [
        "Explain the differences between transaction isolation levels: Read Committed vs Serializable.",
        "How do clustered and non-clustered indexes affect database lookup and insertion times?",
        "Describe the database execution lifecycle when processing nested JOIN queries.",
        "When would you use CTEs (Common Table Expressions) over standard subqueries?",
        "Explain write-ahead logging (WAL) and how it guarantees ACID compliance."
      ],
      prisma: [
        "How does Prisma client prevent N+1 query problems in schema relations?",
        "Explain Prisma transactions ($transaction) and how they enforce batch integrity.",
        "How do migrations work in Prisma, and how do you handle schema drift in production?",
        "Explain the difference between relation mode 'prisma' and foreign keys in database engines."
      ],
      css: [
        "Explain CSS Flexbox vs Grid alignment and when to select one over the other.",
        "What is the CSS specificity hierarchy, and how does tailwind handle styling overrides?",
        "Explain the CSS box model and the difference between content-box and border-box."
      ]
    };

    // Generic technical questions if no matching skill found
    const genericTechnical = [
      "Explain standard practices to secure API endpoints from CSRF, XSS, and SQL-Injection risks.",
      "What is the difference between REST, GraphQL, and gRPC architectures?",
      "Describe the TCP three-way handshake and how HTTPS ensures data integrity.",
      "How do CORS policies work, and how do you resolve a CORS block on a production server?",
      "Explain the differences between symmetric and asymmetric encryption.",
      "What is the purpose of caching strategies like Redis and CDN edge caching?",
      "Explain container virtualization and how Docker differs from traditional Virtual Machines."
    ];

    // Gather matched technical questions
    let technicalPool = [];
    candidateSkills.forEach(s => {
      const sLower = s.toLowerCase();
      Object.keys(skillQuestions).forEach(key => {
        if (sLower.includes(key) || key.includes(sLower)) {
          technicalPool.push(...skillQuestions[key]);
        }
      });
    });

    // Make sure we have enough unique technical questions, fallback to generic if pool is small
    if (technicalPool.length < 5) {
      technicalPool.push(...genericTechnical);
    }
    
    // De-duplicate questions
    technicalPool = Array.from(new Set(technicalPool));
    const technicalQuestions = getRandomSample(technicalPool, 5);

    // 2. Behavioral questions pool
    const behavioralPool = [
      "Tell me about a time you faced a difficult technical challenge and how you resolved it.",
      "Describe a situation where you had to work with a team member who disagreed with your approach.",
      "How do you prioritize your deliverables when managing multiple deadlines under stress?",
      "Tell me about a time you made a critical mistake in a project. How did you handle the consequences?",
      "Describe a time when you had to learn a new technology quickly to meet a project deliverable.",
      "How do you handle constructive criticism and feedback on your code from senior developers?",
      "Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder.",
      "Tell me about a project you worked on where the requirements changed midway. How did you adapt?"
    ];
    const behavioralQuestions = getRandomSample(behavioralPool, 3);

    // 3. Project / Architecture questions pool
    const mainRole = targetRoles[0] || "Software Engineer";
    const mainSkill = candidateSkills[0] || "React";
    const secondSkill = candidateSkills[1] || "Node.js";

    const projectPool = [
      `How would you architect a production-ready, horizontally scalable file upload feature utilizing ${mainSkill} and secure storage APIs?`,
      `Describe the deployment pipeline for a application built on your stack. How do you monitor container failures?`,
      `How would you design a real-time notification service using WebSockets or Server-Sent Events (SSE) with ${mainSkill}?`,
      `Describe how you would structure database indexing and caching for a high-traffic endpoint for a ${mainRole} system.`,
      `How do you manage schema evolution, database backups, and seamless rolling deployments without downtime?`,
      `Explain how you would design a robust role-based access control (RBAC) security system using ${secondSkill} middleware.`
    ];
    const projectQuestions = getRandomSample(projectPool, 2);

    return {
      technical: technicalQuestions,
      behavioral: behavioralQuestions,
      project: projectQuestions
    };
  }

  /**
   * Evaluates a candidate's practice response to an interview question.
   * Utilizes Gemini generative evaluation, falling back to a smart local
   * keyword matching logic if API keys are missing.
   * 
   * @param {string} question The interview question asked
   * @param {string} answer The candidate's response text
   * @returns {Promise<Object>} Object containing score (0-100) and feedback text
   * @author Arnav Garg
   * @version 1.0.0
   */
  async gradeAnswer(question, answer) {
    const cleanAnswer = (answer || "").trim();
    
    // 1. Pre-validation check for empty/short responses
    if (cleanAnswer.length < 8 || !/[a-zA-Z]{3,}/.test(cleanAnswer)) {
      return {
        score: 0,
        feedback: "The response is too short or contains invalid characters. Please type a meaningful, structured explanation to receive AI feedback."
      };
    }

    // Heuristics to detect random keystrokes or gibberish (e.g., "coireeee", "naslnknkca")
    const gibberishRegex = /([a-z])\1{3,}|[bcdfghjklmnpqrstvwxyz]{6,}|[aeiou]{6,}/i;
    if (gibberishRegex.test(cleanAnswer) || cleanAnswer.split(" ").length < 3) {
      return {
        score: 5,
        feedback: "Your response appears to be random text or gibberish. Please provide a relevant technical or behavioral response to practice."
      };
    }

    if (!this.genAI) {
      return this.getMockAnswerGrading(question, cleanAnswer);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an expert technical interviewer evaluating a candidate's answer to a practice interview question.
        Analyze the answer and provide constructive, detailed feedback and a score (0 to 100).
        If the response is gibberish, incorrect, or irrelevant, score it below 10 and explain why.
        Return ONLY a raw JSON string matching the typescript interface below. Do not include markdown blocks or extra text.

        Question: ${question}
        Candidate Response: ${cleanAnswer}

        Interface:
        {
          "score": number, // integer from 0 to 100
          "feedback": string // 2-3 sentences of tailored, constructive feedback
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json\s*|```$/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Gemini API answer grading failed. Reverting to mock:", error);
      return this.getMockAnswerGrading(question, cleanAnswer);
    }
  }

  /**
   * Smart local fallback for response grading using keyword analysis.
   * 
   * @param {string} question The interview question asked
   * @param {string} answer The candidate's response
   * @returns {Object} Mocked grade evaluation
   * @author Arnav Garg
   * @version 1.0.0
   */
  getMockAnswerGrading(question, answer) {
    const qLower = question.toLowerCase();
    const aLower = answer.toLowerCase();

    let score = 50;
    let feedback = "";

    // 1. SQL / Database questions
    if (qLower.includes("sql") || qLower.includes("database") || qLower.includes("schema")) {
      const sqlKeywords = ["select", "query", "index", "join", "table", "transaction", "primary key", "foreign key", "relational", "nosql", "mongodb", "postgres"];
      const matches = sqlKeywords.filter(kw => aLower.includes(kw));

      if (matches.length > 2) {
        score = 85;
        feedback = `Excellent. You correctly mentioned key database concepts like ${matches.slice(0, 3).join(", ")}. Expand on query plans or index scan optimization in your next round.`;
      } else {
        score = 45;
        feedback = "Your response mentions database terms, but lacks specific details about execution lifecycle, connections, indexing, or transaction isolation levels.";
      }
    } 
    // 2. React / State questions
    else if (qLower.includes("react") || qLower.includes("state") || qLower.includes("lifecycle") || qLower.includes("hook")) {
      const reactKeywords = ["state", "effect", "hook", "render", "props", "mount", "update", "context", "redux", "virtual dom", "component"];
      const matches = reactKeywords.filter(kw => aLower.includes(kw));

      if (matches.length > 2) {
        score = 80;
        feedback = `Good answer. You highlighted component concepts like ${matches.slice(0, 3).join(", ")}. Be sure to discuss hooks cleanup actions to prevent memory leaks in production.`;
      } else {
        score = 40;
        feedback = "Your answer is quite generic. To strengthen it, discuss state hooks (useState, useEffect) or architectural hydration states.";
      }
    }
    // 3. Behavioral / HR
    else {
      if (aLower.includes("team") || aLower.includes("resolve") || aLower.includes("communication") || aLower.includes("deadline") || aLower.includes("project")) {
        score = 75;
        feedback = "Well structured behavioral response. You effectively frame the situation and resolution path. Remember to format answers using the STAR technique (Situation, Task, Action, Result).";
      } else {
        score = 50;
        feedback = "Your response is somewhat brief. Provide a specific scenario from your academic or project history where you demonstrated this behavioral leadership.";
      }
    }

    return { score, feedback };
  }
}

/**
 * Singleton instance of GeminiService
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
export const geminiService = new GeminiService();
