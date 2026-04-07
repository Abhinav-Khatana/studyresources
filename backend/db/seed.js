// Run with: npm run db:seed
// This seeds all students, subjects, units, topics, and resources into PostgreSQL

import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME     || "studyhub",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting seed...\n");

    // ── Run schema first ───────────────────────────────────────────────────
    const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await client.query(schema);
    console.log("✅ Schema applied");

    // ── Students ───────────────────────────────────────────────────────────
    const students = [
      { id: "CS2021001", name: "Arjun Sharma",  password: "pass123", batch: "2021", semester: 5, cgpa: 8.4, avatar: "AS", role: "student" },
      { id: "CS2021002", name: "Priya Verma",   password: "pass123", batch: "2021", semester: 5, cgpa: 9.1, avatar: "PV", role: "student" },
      { id: "CS2021003", name: "Rahul Singh",   password: "pass123", batch: "2021", semester: 5, cgpa: 7.8, avatar: "RS", role: "student" },
      { id: "CS2021004", name: "Sneha Gupta",   password: "pass123", batch: "2021", semester: 5, cgpa: 8.9, avatar: "SG", role: "student" },
      { id: "CS2021005", name: "Vikram Patel",  password: "pass123", batch: "2021", semester: 5, cgpa: 8.2, avatar: "VP", role: "student" },
      // ── ADD YOUR OWN STUDENT ID HERE AND SET role: "admin" ────────────────
      { id: "ADMIN001",  name: "Admin",          password: "admin123", batch: "2021", semester: 5, cgpa: 10.0, avatar: "AD", role: "admin" },
    ];

    for (const s of students) {
      const hash = await bcrypt.hash(s.password, 10);
      await client.query(
        `INSERT INTO students (id, name, password_hash, batch, semester, cgpa, branch, avatar, role)
         VALUES ($1,$2,$3,$4,$5,$6,'CSE',$7,$8)
         ON CONFLICT (id) DO UPDATE SET name=$2, password_hash=$3, role=$8`,
        [s.id, s.name, hash, s.batch, s.semester, s.cgpa, s.avatar, s.role]
      );
    }
    console.log(`✅ Seeded ${students.length} students`);

    // ── Subjects ───────────────────────────────────────────────────────────
    const subjects = [
      { id: "daa",  name: "Design & Analysis of Algorithms", code: "CS301", credits: 4, icon: "🧮", color: "from-violet-500 to-purple-700" },
      { id: "dbms", name: "Database Management Systems",     code: "CS302", credits: 4, icon: "🗄️", color: "from-blue-500 to-cyan-700"     },
      { id: "os",   name: "Operating Systems",               code: "CS303", credits: 4, icon: "💻", color: "from-green-500 to-emerald-700"  },
      { id: "cn",   name: "Computer Networks",               code: "CS304", credits: 3, icon: "🌐", color: "from-orange-500 to-red-700"     },
      { id: "toc",  name: "Theory of Computation",           code: "CS305", credits: 3, icon: "🤖", color: "from-pink-500 to-rose-700"      },
    ];

    for (const s of subjects) {
      await client.query(
        `INSERT INTO subjects (id, name, code, semester, credits, icon, color)
         VALUES ($1,$2,$3,5,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET name=$2, code=$3, credits=$4, icon=$5, color=$6`,
        [s.id, s.name, s.code, s.credits, s.icon, s.color]
      );
    }
    console.log(`✅ Seeded ${subjects.length} subjects`);

    // ── Units + Topics + Resources ─────────────────────────────────────────
    const unitData = [
      // ── DAA ────────────────────────────────────────────────────────────
      { subject: "daa", num: 1, title: "Algorithm Analysis & Divide and Conquer",
        topics: ["Asymptotic Notation","Recurrence Relations","Master Theorem","Merge Sort","Quick Sort","Binary Search"],
        resources: [
          { id:"n1-1", type:"notes",    title:"Unit 1 Teacher Notes – Algorithm Basics",       url:"#",  uploadedBy:"Prof. R.K. Sharma", fileSize:"2.4 MB" },
          { id:"n1-2", type:"notes",    title:"Asymptotic Notation & Master Theorem Summary",  url:"#",  uploadedBy:"Prof. R.K. Sharma", fileSize:"1.1 MB" },
          { id:"v1-1", type:"videos",   title:"Asymptotic Analysis – Abdul Bari",              url:"https://www.youtube.com/watch?v=0oDAlMwTrLo", duration:"14:55", channel:"Abdul Bari" },
          { id:"v1-2", type:"videos",   title:"Master Theorem in 10 minutes",                  url:"https://www.youtube.com/watch?v=OynWkEj0S-s", duration:"10:22", channel:"Back To Back SWE" },
          { id:"v1-3", type:"videos",   title:"Merge Sort – Divide & Conquer",                 url:"https://www.youtube.com/watch?v=mB5HXBb_HY8", duration:"18:40", channel:"Abdul Bari" },
          { id:"a1-1", type:"articles", title:"Big O, Big Theta, Big Omega – GeeksforGeeks",   url:"https://www.geeksforgeeks.org/asymptotic-notation-and-analysis-based-on-input-and-whether-an-algorithm-is-the-new-one-based-on-input/", readTime:"12 min" },
          { id:"a1-2", type:"articles", title:"Master Theorem – Brilliant.org",                url:"https://brilliant.org/wiki/master-theorem/", readTime:"8 min" },
          { id:"p1-1", type:"pyqs",     title:"DAA PYQ 2023 – Unit 1",                         url:"#", year:"2023" },
          { id:"p1-2", type:"pyqs",     title:"DAA PYQ 2022 – Unit 1",                         url:"#", year:"2022" },
          { id:"p1-3", type:"pyqs",     title:"DAA PYQ 2021 – Unit 1",                         url:"#", year:"2021" },
        ]
      },
      { subject: "daa", num: 2, title: "Greedy Algorithms",
        topics: ["Greedy Strategy","Activity Selection","Huffman Coding","Fractional Knapsack","Prim's Algorithm","Kruskal's Algorithm"],
        resources: [
          { id:"n2-1", type:"notes",    title:"Unit 2 Teacher Notes – Greedy Algorithms",  url:"#", uploadedBy:"Prof. R.K. Sharma", fileSize:"1.9 MB" },
          { id:"v2-1", type:"videos",   title:"Greedy Algorithm – Activity Selection",     url:"https://www.youtube.com/watch?v=ARvQcqJ_-NY", duration:"15:22", channel:"Abdul Bari" },
          { id:"v2-2", type:"videos",   title:"Huffman Coding Algorithm",                 url:"https://www.youtube.com/watch?v=co4_ahEDCho", duration:"20:08", channel:"Abdul Bari" },
          { id:"v2-3", type:"videos",   title:"Kruskal's and Prim's Algorithm",           url:"https://www.youtube.com/watch?v=4ZlRH0eK-qQ", duration:"22:16", channel:"Abdul Bari" },
          { id:"a2-1", type:"articles", title:"Greedy Algorithms – GeeksforGeeks",        url:"https://www.geeksforgeeks.org/greedy-algorithms/", readTime:"10 min" },
          { id:"p2-1", type:"pyqs",     title:"DAA PYQ 2023 – Unit 2",                    url:"#", year:"2023" },
          { id:"p2-2", type:"pyqs",     title:"DAA PYQ 2022 – Unit 2",                    url:"#", year:"2022" },
        ]
      },
      { subject: "daa", num: 3, title: "Dynamic Programming",
        topics: ["Optimal Substructure","Memoization","0/1 Knapsack","LCS","Matrix Chain Multiplication","Floyd Warshall"],
        resources: [
          { id:"n3-1", type:"notes",    title:"Unit 3 Teacher Notes – Dynamic Programming", url:"#", uploadedBy:"Prof. R.K. Sharma", fileSize:"3.1 MB" },
          { id:"v3-1", type:"videos",   title:"Dynamic Programming – Introduction",         url:"https://www.youtube.com/watch?v=vYquumk4nAsS", duration:"13:47", channel:"Abdul Bari" },
          { id:"v3-2", type:"videos",   title:"0/1 Knapsack Problem",                       url:"https://www.youtube.com/watch?v=8LusJS5-AGo", duration:"23:01", channel:"Abdul Bari" },
          { id:"v3-3", type:"videos",   title:"Longest Common Subsequence",                 url:"https://www.youtube.com/watch?v=sSno9rV8Rhg", duration:"25:30", channel:"Abdul Bari" },
          { id:"a3-1", type:"articles", title:"DP Pattern Guide – LeetCode",                url:"https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns", readTime:"20 min" },
          { id:"p3-1", type:"pyqs",     title:"DAA PYQ 2023 – Unit 3",                      url:"#", year:"2023" },
        ]
      },
      { subject: "daa", num: 4, title: "Graph Algorithms & Backtracking",
        topics: ["BFS & DFS","Topological Sort","Shortest Paths","N-Queens","Graph Coloring","Hamiltonian Cycle"],
        resources: [
          { id:"n4-1", type:"notes",    title:"Unit 4 Teacher Notes – Graph Algorithms",  url:"#", uploadedBy:"Prof. R.K. Sharma", fileSize:"2.7 MB" },
          { id:"v4-1", type:"videos",   title:"BFS and DFS – Graph Traversal",            url:"https://www.youtube.com/watch?v=pcKY4hjDrxk", duration:"19:43", channel:"Abdul Bari" },
          { id:"v4-2", type:"videos",   title:"Dijkstra's Algorithm",                     url:"https://www.youtube.com/watch?v=XB4MIexjvY0", duration:"16:55", channel:"Abdul Bari" },
          { id:"v4-3", type:"videos",   title:"N-Queens – Backtracking",                  url:"https://www.youtube.com/watch?v=xFv_Hl4B83A", duration:"21:12", channel:"Abdul Bari" },
          { id:"a4-1", type:"articles", title:"Backtracking – GeeksforGeeks",             url:"https://www.geeksforgeeks.org/backtracking-algorithms/", readTime:"12 min" },
          { id:"p4-1", type:"pyqs",     title:"DAA PYQ 2023 – Unit 4",                    url:"#", year:"2023" },
        ]
      },
      { subject: "daa", num: 5, title: "NP-Completeness & Approximation",
        topics: ["P vs NP","NP-Hard & NP-Complete","Reduction","Cook's Theorem","Approximation Algorithms","Travelling Salesman"],
        resources: [
          { id:"n5-1", type:"notes",    title:"Unit 5 Teacher Notes – NP-Completeness",   url:"#", uploadedBy:"Prof. R.K. Sharma", fileSize:"2.0 MB" },
          { id:"v5-1", type:"videos",   title:"P, NP, NP-Complete, NP-Hard – Explained", url:"https://www.youtube.com/watch?v=e2cF8a5aAhL", duration:"22:30", channel:"Abdul Bari" },
          { id:"a5-1", type:"articles", title:"P vs NP – GeeksforGeeks",                  url:"https://www.geeksforgeeks.org/difference-between-p-and-np/", readTime:"10 min" },
          { id:"p5-1", type:"pyqs",     title:"DAA PYQ 2023 – Unit 5",                    url:"#", year:"2023" },
        ]
      },
      // ── DBMS (empty resources — add via admin panel) ──────────────────
      { subject:"dbms", num:1, title:"Introduction to Databases & ER Model",     topics:["Database Concepts","DBMS Architecture","ER Diagrams","Keys & Constraints"], resources:[] },
      { subject:"dbms", num:2, title:"Relational Model & SQL",                   topics:["Relational Algebra","SQL DDL & DML","Joins","Subqueries"], resources:[] },
      { subject:"dbms", num:3, title:"Normalization",                             topics:["Functional Dependencies","1NF 2NF 3NF","BCNF","Decomposition"], resources:[] },
      { subject:"dbms", num:4, title:"Transaction Management",                   topics:["ACID Properties","Concurrency Control","Locking","Deadlock"], resources:[] },
      { subject:"dbms", num:5, title:"File Organization & Indexing",             topics:["B Trees","B+ Trees","Hashing","Query Optimization"], resources:[] },
      // ── OS ────────────────────────────────────────────────────────────
      { subject:"os",   num:1, title:"OS Introduction & Process Management",     topics:["OS Structure","Process Concepts","PCB","Process States"], resources:[] },
      { subject:"os",   num:2, title:"CPU Scheduling",                           topics:["FCFS","SJF","Round Robin","Priority Scheduling"], resources:[] },
      { subject:"os",   num:3, title:"Memory Management",                        topics:["Paging","Segmentation","Virtual Memory","Page Replacement"], resources:[] },
      { subject:"os",   num:4, title:"Deadlocks & Synchronization",              topics:["Mutex","Semaphores","Deadlock Detection","Banker's Algorithm"], resources:[] },
      { subject:"os",   num:5, title:"File Systems & I/O",                       topics:["File Concepts","Directory Structure","Disk Scheduling","RAID"], resources:[] },
      // ── CN ────────────────────────────────────────────────────────────
      { subject:"cn",   num:1, title:"Network Models & Physical Layer",           topics:["OSI Model","TCP/IP","Transmission Media","Encoding"], resources:[] },
      { subject:"cn",   num:2, title:"Data Link Layer",                           topics:["Framing","Error Detection","Flow Control","MAC Protocols"], resources:[] },
      { subject:"cn",   num:3, title:"Network Layer",                             topics:["IP Addressing","Routing Algorithms","IPv4 & IPv6","Subnetting"], resources:[] },
      { subject:"cn",   num:4, title:"Transport Layer",                           topics:["TCP","UDP","Flow Control","Congestion Control"], resources:[] },
      { subject:"cn",   num:5, title:"Application Layer & Security",              topics:["HTTP","DNS","SMTP","SSL/TLS"], resources:[] },
      // ── TOC ───────────────────────────────────────────────────────────
      { subject:"toc",  num:1, title:"Finite Automata & Regular Languages",       topics:["DFA","NFA","Regular Expressions","Minimization"], resources:[] },
      { subject:"toc",  num:2, title:"Context-Free Languages",                    topics:["CFG","Ambiguity","Pushdown Automata","CYK Algorithm"], resources:[] },
      { subject:"toc",  num:3, title:"Turing Machines",                           topics:["TM Model","Variants","Church-Turing Thesis","Decidability"], resources:[] },
      { subject:"toc",  num:4, title:"Decidability & Reducibility",               topics:["Halting Problem","Rice's Theorem","Mapping Reduction","Oracle TM"], resources:[] },
      { subject:"toc",  num:5, title:"Complexity Classes",                        topics:["Time Complexity","P vs NP","NP-Completeness","Space Complexity"], resources:[] },
    ];

    let unitCount = 0, topicCount = 0, resourceCount = 0;

    for (const u of unitData) {
      // Upsert unit
      const unitRes = await client.query(
        `INSERT INTO units (subject_id, unit_number, title)
         VALUES ($1,$2,$3)
         ON CONFLICT (subject_id, unit_number) DO UPDATE SET title=$3
         RETURNING id`,
        [u.subject, u.num, u.title]
      );
      const unitId = unitRes.rows[0].id;
      unitCount++;

      // Topics
      await client.query(`DELETE FROM unit_topics WHERE unit_id=$1`, [unitId]);
      for (let i = 0; i < u.topics.length; i++) {
        await client.query(
          `INSERT INTO unit_topics (unit_id, topic, position) VALUES ($1,$2,$3)`,
          [unitId, u.topics[i], i]
        );
        topicCount++;
      }

      // Resources
      for (const r of u.resources) {
        await client.query(
          `INSERT INTO resources (id, unit_id, type, title, url, uploaded_by, file_size, duration, channel, read_time, year)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO UPDATE SET title=$4, url=$5`,
          [r.id, unitId, r.type, r.title, r.url||"#", r.uploadedBy||null, r.fileSize||null, r.duration||null, r.channel||null, r.readTime||null, r.year||null]
        );
        resourceCount++;
      }
    }
    console.log(`✅ Seeded ${unitCount} units, ${topicCount} topics, ${resourceCount} resources`);

    // ── Sample announcements ───────────────────────────────────────────────
    await client.query(
      `INSERT INTO announcements (title, content, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      ["Welcome to StudyHub!", "All resources for DAA Unit 1 & 2 are now live. More coming soon.", "ADMIN001"]
    );
    console.log("✅ Seeded sample announcement");

    console.log("\n🎉 Database seeded successfully!");
    console.log("   Admin login: ADMIN001 / admin123");
    console.log("   Student login: CS2021001 / pass123\n");

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
