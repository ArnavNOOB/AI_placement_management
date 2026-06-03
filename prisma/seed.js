const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

/**
 * MongoDB Seed Data Script
 * Populates User accounts, Resumes, Jobs, and Application records.
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
async function main() {
  console.log("Starting database seeding process...");

  // 1. Clean existing records in MongoDB
  console.log("Cleaning existing records...");
  await prisma.application.deleteMany({});
  await prisma.resume.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash standard password for seed profiles
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. Generate 10 Recruiters
  console.log("Seeding 10 Recruiters...");
  const recruiters = [];
  const companies = [
    "Google", "Microsoft", "Amazon", "Meta", "Netflix", 
    "Apple", "Stripe", "Uber", "Oracle", "Salesforce"
  ];

  for (let i = 0; i < 10; i++) {
    const email = `recruiter.${companies[i].toLowerCase()}@placementai.com`;
    const user = await prisma.user.create({
      data: {
        name: `${companies[i]} Recruiting Team`,
        email,
        password: hashedPassword,
        role: "RECRUITER"
      }
    });
    recruiters.push(user);
  }

  // 3. Generate 15 Jobs
  console.log("Seeding 15 Jobs...");
  const jobsData = [
    {
      company: "Google",
      role: "Frontend Software Engineer",
      description: "Join the Search Frontend team to build interactive interfaces using React and TypeScript. Optimize runtime core web vitals and write accessible layout components.",
      skillsRequired: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Web Vitals"],
      package: "24 LPA",
      location: "Bangalore, IN",
      cgpaCut: 7.5
    },
    {
      company: "Microsoft",
      role: "Azure Cloud Architect",
      description: "Design serverless backend pipelines, manage hybrid Kubernetes container clusters, and configure cloud databases with Cosmos DB and Azure SQL.",
      skillsRequired: ["Azure", "Docker", "Kubernetes", "SQL", "Cloud Architecture"],
      package: "28 LPA",
      location: "Hyderabad, IN",
      cgpaCut: 8.0
    },
    {
      company: "Amazon",
      role: "Fullstack Web Developer",
      description: "Build scalable e-commerce services. Manage Next.js serverless functions, relational databases, Node.js microservices, and Tailwind layouts.",
      skillsRequired: ["Next.js", "Node.js", "Express", "MongoDB", "Prisma", "Tailwind CSS"],
      package: "22 LPA",
      location: "Chennai, IN",
      cgpaCut: 7.0
    },
    {
      company: "Meta",
      role: "React Native Developer",
      description: "Architect and deliver mobile user flows using React Native. Integrate secure client cache stores and write clean modular components.",
      skillsRequired: ["React", "React Native", "TypeScript", "JavaScript", "Redux"],
      package: "26 LPA",
      location: "Remote",
      cgpaCut: 7.5
    },
    {
      company: "Netflix",
      role: "DevOps Pipeline Engineer",
      description: "Automate delivery and testing configurations. Build robust CI/CD pipelines, configure Docker containers, and optimize load balancers.",
      skillsRequired: ["Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Linux"],
      package: "30 LPA",
      location: "Mumbai, IN",
      cgpaCut: 8.5
    },
    {
      company: "Apple",
      role: "iOS Platform Engineer",
      description: "Create native experiences for iOS applications. Write high-performance Swift, debug layouts, and design local SQLite databases.",
      skillsRequired: ["Swift", "iOS SDK", "Xcode", "SQLite", "Git"],
      package: "32 LPA",
      location: "Bangalore, IN",
      cgpaCut: 8.0
    },
    {
      company: "Stripe",
      role: "Backend Payments Engineer",
      description: "Help build Stripe global checkout APIs. Scale Node.js microservices, design Postgres database entities, and secure payment payloads.",
      skillsRequired: ["Node.js", "Express", "TypeScript", "PostgreSQL", "API Design", "Security"],
      package: "25 LPA",
      location: "Remote",
      cgpaCut: 7.5
    },
    {
      company: "Uber",
      role: "Systems Site Reliability Engineer",
      description: "Scale high-throughput real-time routing engines. Optimize Redis caching queues, configure Docker, and monitor Linux log streams.",
      skillsRequired: ["Go", "Redis", "Docker", "Linux", "Git", "Kubernetes"],
      package: "27 LPA",
      location: "Hyderabad, IN",
      cgpaCut: 8.0
    },
    {
      company: "Oracle",
      role: "Database Administrator Engineer",
      description: "Monitor SQL databases, design database structures, and scale MongoDB and PostgreSQL pipelines.",
      skillsRequired: ["SQL", "PostgreSQL", "MongoDB", "Prisma", "Linux"],
      package: "18 LPA",
      location: "Noida, IN",
      cgpaCut: 6.5
    },
    {
      company: "Salesforce",
      role: "Frontend UX Engineer",
      description: "Implement interactive web layouts. Design user templates in React, style widgets using Tailwind CSS, and support mobile devices.",
      skillsRequired: ["React", "JavaScript", "Tailwind CSS", "HTML", "CSS", "Figma"],
      package: "20 LPA",
      location: "Pune, IN",
      cgpaCut: 6.0
    },
    {
      company: "Google",
      role: "Machine Learning Researcher",
      description: "Design predictive models and training datasets. Deploy pipeline models using Python, TensorFlow, PyTorch, and SQL queries.",
      skillsRequired: ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas"],
      package: "35 LPA",
      location: "Bangalore, IN",
      cgpaCut: 8.5
    },
    {
      company: "Netflix",
      role: "Backend Core Architect",
      description: "Manage stream analytics routing. Program low-latency engines in Go, configure Redis caches, and document REST endpoints.",
      skillsRequired: ["Go", "Node.js", "Redis", "Docker", "API Design"],
      package: "29 LPA",
      location: "Remote",
      cgpaCut: 8.5
    },
    {
      company: "Uber",
      role: "Data Infrastructure Engineer",
      description: "Optimize big data logs. Write Spark scripts, configure distributed pipelines, and design relational databases.",
      skillsRequired: ["Python", "SQL", "Spark", "PostgreSQL", "Linux"],
      package: "23 LPA",
      location: "Bangalore, IN",
      cgpaCut: 7.5
    },
    {
      company: "Stripe",
      role: "Security Engineer",
      description: "Audit financial pipelines. Scan source code for vulnerabilities, secure tokens, and configure auth firewalls.",
      skillsRequired: ["Security", "Linux", "Node.js", "Docker", "Git"],
      package: "26 LPA",
      location: "Remote",
      cgpaCut: 7.5
    },
    {
      company: "Meta",
      role: "AI Integration Engineer",
      description: "Embed generative models into user flows. Integrate Gemini APIs, write structured prompts, and implement TypeScript handlers.",
      skillsRequired: ["TypeScript", "Next.js", "API Design", "Node.js", "React"],
      package: "28 LPA",
      location: "Remote",
      cgpaCut: 8.0
    }
  ];

  const jobs = [];
  for (const jobItem of jobsData) {
    const job = await prisma.job.create({
      data: jobItem
    });
    jobs.push(job);
  }

  // 4. Generate 20 Students
  console.log("Seeding 20 Students...");
  const students = [];
  const studentNames = [
    "Rahul Sharma", "Priya Patel", "Amit Verma", "Sneha Reddy", "Vikram Singh",
    "Anjali Gupta", "Rohan Das", "Neha Kapoor", "Abhishek Kumar", "Divya Nair",
    "Siddharth Rao", "Kirti Joshi", "Aditya Mishra", "Shreya Sen", "Manish Pandey",
    "Pooja Chaudhary", "Sanjay Yadav", "Nisha Saxena", "Arjun Prasad", "Tanvi Bhatia"
  ];

  const skillsProfiles = [
    ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Tailwind CSS", "Git"],
    ["Node.js", "Express", "MongoDB", "Prisma", "SQL", "JavaScript", "Git"],
    ["Python", "SQL", "Pandas", "Matplotlib", "Git"],
    ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"],
    ["React", "Next.js", "TypeScript", "Node.js", "Prisma", "Tailwind CSS", "Git"],
    ["Swift", "iOS SDK", "SQLite", "Git"],
    ["Go", "Redis", "Docker", "Linux", "Git"],
    ["Java", "Spring Boot", "SQL", "PostgreSQL", "Git"],
    ["React", "React Native", "TypeScript", "Redux", "Git"],
    ["Security", "Linux", "Node.js", "Express", "Git"]
  ];

  for (let i = 0; i < 20; i++) {
    const email = `student.${studentNames[i].toLowerCase().replace(/\s+/g, ".")}@placementai.com`;
    const student = await prisma.user.create({
      data: {
        name: studentNames[i],
        email,
        password: hashedPassword,
        role: "STUDENT",
        cgpa: Math.round((Math.random() * 2.8 + 7.0) * 100) / 100 // CGPA between 7.00 and 9.80
      }
    });
    students.push(student);

    // Seed Resumes for 16 of the 20 students (leaving 4 without resumes to simulate empty states)
    if (i < 16) {
      const profileIdx = i % skillsProfiles.length;
      const skills = skillsProfiles[profileIdx];
      const atsScore = Math.floor(Math.random() * 25) + 70; // 70 to 94

      // Recommended roles based on skills index
      let recommendedRoles = ["Frontend Engineer", "Fullstack Developer"];
      let missingSkills = ["GraphQL", "Docker"];
      if (profileIdx === 1) {
        recommendedRoles = ["Backend Developer", "API Architect"];
        missingSkills = ["AWS", "Redis"];
      } else if (profileIdx === 2) {
        recommendedRoles = ["Data Analyst", "Python Developer"];
        missingSkills = ["Tableau", "TensorFlow"];
      } else if (profileIdx === 3) {
        recommendedRoles = ["DevOps Engineer", "Cloud Engineer"];
        missingSkills = ["Terraform", "Ansible"];
      }

      await prisma.resume.create({
        data: {
          userId: student.id,
          fileUrl: `/uploads/sample-resume-${i + 1}.pdf`,
          atsScore,
          skills,
          strengths: [
            "Good understanding of fundamental structures and modern paradigms.",
            "Strong command over source control management using Git workflows.",
            "Clear logical division of features in modular interfaces."
          ],
          weaknesses: [
            "Limited exposure to continuous optimization logs.",
            "No unit testing coverage mentions in project stack details."
          ],
          missingSkills,
          recommendedRoles,
          questions: {
            technical: [
              "Explain the client-server request cycle of your main backend stack.",
              "How do you handle schema updates without causing production downtime?",
              "What is the difference between structured and unstructured database models?",
              "How do you secure candidate credentials during hashing?",
              "Explain standard caching methodologies for speed performance."
            ],
            behavioral: [
              "Describe a project you worked on where you made a design mistake. How did you react?",
              "How do you approach learning a new language or framework when assigned to a task?",
              "Tell me about a time you worked under a tight launch deadline."
            ],
            project: [
              "Detail the folder directory layout of your latest fullstack repository.",
              "How would you optimize database read operations for rapid scaling?"
            ]
          }
        }
      });
    }
  }

  // 5. Generate 1 Placement Officer
  console.log("Seeding 1 Placement Officer...");
  await prisma.user.create({
    data: {
      name: "Professor Arnav Garg",
      email: "officer@placementai.com",
      password: hashedPassword,
      role: "PLACEMENT_OFFICER"
    }
  });

  // 6. Generate 15 Application linkings
  console.log("Seeding 15 Applications...");
  const applicationStatuses = ["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "ACCEPTED"];
  
  // Link students (with resumes) to random jobs
  for (let i = 0; i < 15; i++) {
    const student = students[i]; // has resume
    const job = jobs[i % jobs.length];
    
    // Choose status (include 4 ACCEPTED to show placed counters)
    let status = applicationStatuses[i % applicationStatuses.length];
    if (i < 4) {
      status = "ACCEPTED";
    }

    await prisma.application.create({
      data: {
        studentId: student.id,
        jobId: job.id,
        status
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
