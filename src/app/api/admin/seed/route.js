import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Handles GET request to trigger database seeding.
 * Truncates existing tables in MongoDB and inserts standard seed documents.
 * 
 * @param {Request} req Request object
 * @returns {Promise<Response>} NextResponse with status reports
 * @author Arnav Garg
 * @version 1.0.0
 */
export async function GET(req) {
  try {
    console.log("Admin Seeding API Triggered...");

    // Clean tables
    await prisma.application.deleteMany({});
    await prisma.resume.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Recruiters
    const companies = [
      "Google", "Microsoft", "Amazon", "Meta", "Netflix", 
      "Apple", "Stripe", "Uber", "Oracle", "Salesforce"
    ];
    for (let i = 0; i < 10; i++) {
      await prisma.user.create({
        data: {
          name: `${companies[i]} Recruiting Team`,
          email: `recruiter.${companies[i].toLowerCase()}@placementai.com`,
          password: hashedPassword,
          role: "RECRUITER"
        }
      });
    }

    // 2. Jobs
    const jobsData = [
      {
        company: "Google",
        role: "Frontend Software Engineer",
        description: "Join the Search Frontend team to build interactive interfaces using React and TypeScript. Optimize runtime core web vitals and write accessible layout components.",
        skillsRequired: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Web Vitals"],
        package: "24 LPA",
        location: "Bangalore, IN"
      },
      {
        company: "Microsoft",
        role: "Azure Cloud Architect",
        description: "Design serverless backend pipelines, manage hybrid Kubernetes container clusters, and configure cloud databases with Cosmos DB and Azure SQL.",
        skillsRequired: ["Azure", "Docker", "Kubernetes", "SQL", "Cloud Architecture"],
        package: "28 LPA",
        location: "Hyderabad, IN"
      },
      {
        company: "Amazon",
        role: "Fullstack Web Developer",
        description: "Build scalable e-commerce services. Manage Next.js serverless functions, relational databases, Node.js microservices, and Tailwind layouts.",
        skillsRequired: ["Next.js", "Node.js", "Express", "MongoDB", "Prisma", "Tailwind CSS"],
        package: "22 LPA",
        location: "Chennai, IN"
      },
      {
        company: "Meta",
        role: "React Native Developer",
        description: "Architect and deliver mobile user flows using React Native. Integrate secure client cache stores and write clean modular components.",
        skillsRequired: ["React", "React Native", "TypeScript", "JavaScript", "Redux"],
        package: "26 LPA",
        location: "Remote"
      },
      {
        company: "Netflix",
        role: "DevOps Pipeline Engineer",
        description: "Automate delivery and testing configurations. Build robust CI/CD pipelines, configure Docker containers, and optimize load balancers.",
        skillsRequired: ["Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Linux"],
        package: "30 LPA",
        location: "Mumbai, IN"
      },
      {
        company: "Apple",
        role: "iOS Platform Engineer",
        description: "Create native experiences for iOS applications. Write high-performance Swift, debug layouts, and design local SQLite databases.",
        skillsRequired: ["Swift", "iOS SDK", "Xcode", "SQLite", "Git"],
        package: "32 LPA",
        location: "Bangalore, IN"
      },
      {
        company: "Stripe",
        role: "Backend Payments Engineer",
        description: "Help build Stripe checkout APIs. Scale Node.js microservices, design Postgres database entities, and secure payment payloads.",
        skillsRequired: ["Node.js", "Express", "TypeScript", "PostgreSQL", "API Design", "Security"],
        package: "25 LPA",
        location: "Remote"
      },
      {
        company: "Uber",
        role: "Systems Site Reliability Engineer",
        description: "Scale high-throughput real-time routing engines. Optimize Redis caching queues, configure Docker, and monitor Linux log streams.",
        skillsRequired: ["Go", "Redis", "Docker", "Linux", "Git", "Kubernetes"],
        package: "27 LPA",
        location: "Hyderabad, IN"
      },
      {
        company: "Oracle",
        role: "Database Administrator Engineer",
        description: "Monitor SQL databases, design backup configurations, tune indexes, and write complex MongoDB Aggregations and Oracle PL/SQL.",
        skillsRequired: ["SQL", "PostgreSQL", "MongoDB", "Prisma", "Linux"],
        package: "18 LPA",
        location: "Noida, IN"
      },
      {
        company: "Salesforce",
        role: "Frontend UX Engineer",
        description: "Implement interactive web layouts. Design user templates in React, style widgets using Tailwind CSS, and support mobile devices.",
        skillsRequired: ["React", "JavaScript", "Tailwind CSS", "HTML", "CSS", "Figma"],
        package: "20 LPA",
        location: "Pune, IN"
      },
      {
        company: "Google",
        role: "Machine Learning Researcher",
        description: "Design predictive models and training datasets. Deploy pipeline models using Python, TensorFlow, PyTorch, and SQL queries.",
        skillsRequired: ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas"],
        package: "35 LPA",
        location: "Bangalore, IN"
      },
      {
        company: "Netflix",
        role: "Backend Core Architect",
        description: "Manage stream analytics routing. Program low-latency engines in Go, configure Redis caches, and document REST endpoints.",
        skillsRequired: ["Go", "Node.js", "Redis", "Docker", "API Design"],
        package: "29 LPA",
        location: "Remote"
      },
      {
        company: "Uber",
        role: "Data Infrastructure Engineer",
        description: "Optimize big data logs. Write Spark scripts, configure distributed pipelines, and design relational databases.",
        skillsRequired: ["Python", "SQL", "Spark", "PostgreSQL", "Linux"],
        package: "23 LPA",
        location: "Bangalore, IN"
      },
      {
        company: "Stripe",
        role: "Security Engineer",
        description: "Audit financial pipelines. Scan source code for vulnerabilities, secure tokens, and configure auth firewalls.",
        skillsRequired: ["Security", "Linux", "Node.js", "Docker", "Git"],
        package: "26 LPA",
        location: "Remote"
      },
      {
        company: "Meta",
        role: "AI Integration Engineer",
        description: "Embed generative models into user flows. Integrate Gemini APIs, write structured prompts, and implement TypeScript handlers.",
        skillsRequired: ["TypeScript", "Next.js", "API Design", "Node.js", "React"],
        package: "28 LPA",
        location: "Remote"
      }
    ];

    const jobs = [];
    for (const jobItem of jobsData) {
      const job = await prisma.job.create({
        data: jobItem
      });
      jobs.push(job);
    }

    // 3. Students
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

    const students = [];
    for (let i = 0; i < 20; i++) {
      const student = await prisma.user.create({
        data: {
          name: studentNames[i],
          email: `student.${studentNames[i].toLowerCase().replace(/\s+/g, ".")}@placementai.com`,
          password: hashedPassword,
          role: "STUDENT"
        }
      });
      students.push(student);

      if (i < 16) {
        const profileIdx = i % skillsProfiles.length;
        const skills = skillsProfiles[profileIdx];
        const atsScore = Math.floor(Math.random() * 25) + 70;

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

    // 4. Officer
    await prisma.user.create({
      data: {
        name: "Professor Arnav Garg",
        email: "officer@placementai.com",
        password: hashedPassword,
        role: "PLACEMENT_OFFICER"
      }
    });

    // 5. Applications
    for (let i = 0; i < 15; i++) {
      const student = students[i];
      const job = jobs[i % jobs.length];
      
      const statuses = ["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "ACCEPTED"];
      let status = statuses[i % statuses.length];
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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully. 20 Students, 10 Recruiters, 15 Jobs, 16 Resumes, and 15 Applications created."
    });
  } catch (error) {
    console.error("Seed API failed:", error);
    return NextResponse.json({
      success: false,
      error: "Database seeding failed."
    }, { status: 500 });
  }
}
