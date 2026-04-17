// ── Curated DSA Problem List ──────────────────────────────────────────────────
// YouTube links: NeetCode (nc) or Striver (sv) — direct video IDs
// LeetCode: direct problem slugs
// GFG: direct article slugs
// ─────────────────────────────────────────────────────────────────────────────

const nc  = (id)   => `https://www.youtube.com/watch?v=${id}`;
const sv  = (id)   => `https://www.youtube.com/watch?v=${id}`;
const lc  = (slug) => `https://leetcode.com/problems/${slug}/`;
const gfg = (slug) => `https://www.geeksforgeeks.org/${slug}/`;

export const DSA_SECTIONS = [
  {
    id: "s1", title: "Arrays & Hashing",
    problems: [
      { id: "a1",  title: "Two Sum",                             difficulty: "Easy",   lc: lc("two-sum"),                                     gfg: gfg("two-sum-everything-need-know"),                       yt: nc("KLlXCFG5TnA") },
      { id: "a2",  title: "Best Time to Buy & Sell Stock",      difficulty: "Easy",   lc: lc("best-time-to-buy-and-sell-stock"),               gfg: gfg("best-time-to-buy-and-sell-stock"),                    yt: nc("ily3x-aHWkU") },
      { id: "a3",  title: "Contains Duplicate",                  difficulty: "Easy",   lc: lc("contains-duplicate"),                           gfg: gfg("check-if-array-contains-contiguous-integers-with-duplicates-allowed"), yt: nc("3OamzN90kPg") },
      { id: "a4",  title: "Maximum Subarray (Kadane's)",        difficulty: "Medium", lc: lc("maximum-subarray"),                             gfg: gfg("largest-sum-contiguous-subarray"),                    yt: nc("5WZl3MMT0Eg") },
      { id: "a5",  title: "Product of Array Except Self",       difficulty: "Medium", lc: lc("product-of-array-except-self"),                 gfg: gfg("product-of-an-array-except-self"),                    yt: nc("bNvIQI2wAjk") },
      { id: "a6",  title: "Merge Intervals",                     difficulty: "Medium", lc: lc("merge-intervals"),                              gfg: gfg("merging-intervals"),                                  yt: nc("44H3cEC2fFM") },
      { id: "a7",  title: "3Sum",                                difficulty: "Medium", lc: lc("3sum"),                                         gfg: gfg("find-triplets-array-whose-sum-equal-zero"),           yt: nc("jzZsG8n2R9A") },
      { id: "a8",  title: "Rotate Array",                        difficulty: "Medium", lc: lc("rotate-array"),                                 gfg: gfg("array-rotation"),                                     yt: sv("wvcQg43_V8U") },
      { id: "a9",  title: "Trapping Rain Water",                 difficulty: "Hard",   lc: lc("trapping-rain-water"),                          gfg: gfg("trapping-rain-water"),                                yt: nc("ZI2z5pq0TqA") },
      { id: "a10", title: "Container With Most Water",           difficulty: "Medium", lc: lc("container-with-most-water"),                    gfg: gfg("container-with-most-water"),                          yt: nc("UuiTKBwPgAo") },
    ],
  },
  {
    id: "s2", title: "Binary Search",
    problems: [
      { id: "bs1", title: "Binary Search",                        difficulty: "Easy",   lc: lc("binary-search"),                               gfg: gfg("binary-search"),                                      yt: nc("s4DPM8ct1pI") },
      { id: "bs2", title: "Search Insert Position",               difficulty: "Easy",   lc: lc("search-insert-position"),                      gfg: gfg("search-insert-position"),                             yt: nc("K-RYzDZkzqA") },
      { id: "bs3", title: "Find Peak Element",                    difficulty: "Medium", lc: lc("find-peak-element"),                           gfg: gfg("find-a-peak-in-a-given-array"),                       yt: nc("HtSuA80QTyo") },
      { id: "bs4", title: "Search in Rotated Sorted Array",       difficulty: "Medium", lc: lc("search-in-rotated-sorted-array"),               gfg: gfg("search-an-element-in-a-rotated-sorted-array"),       yt: nc("U8XENwh8Oy8") },
      { id: "bs5", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", lc: lc("find-minimum-in-rotated-sorted-array"),         gfg: gfg("find-minimum-element-in-a-sorted-and-rotated-array"),yt: nc("nIVW4P8b1VA") },
      { id: "bs6", title: "Koko Eating Bananas",                  difficulty: "Medium", lc: lc("koko-eating-bananas"),                         gfg: gfg("koko-eating-bananas"),                                yt: nc("U2SozAs9RDQ") },
      { id: "bs7", title: "Median of Two Sorted Arrays",          difficulty: "Hard",   lc: lc("median-of-two-sorted-arrays"),                 gfg: gfg("median-of-two-sorted-arrays"),                        yt: nc("q6IEcpVNnuo") },
    ],
  },
  {
    id: "s3", title: "Strings",
    problems: [
      { id: "st1", title: "Valid Palindrome",                     difficulty: "Easy",   lc: lc("valid-palindrome"),                            gfg: gfg("c-program-check-given-string-palindrome"),            yt: nc("jn1MgDeBFSA") },
      { id: "st2", title: "Valid Anagram",                        difficulty: "Easy",   lc: lc("valid-anagram"),                               gfg: gfg("check-whether-two-strings-are-anagram-of-each-other"),yt: nc("9UtInBqnCgA") },
      { id: "st3", title: "Longest Substring Without Repeating",  difficulty: "Medium", lc: lc("longest-substring-without-repeating-characters"),gfg: gfg("length-of-the-longest-substring-without-repeating-characters"), yt: nc("wiGpZaoCasE") },
      { id: "st4", title: "Longest Palindromic Substring",        difficulty: "Medium", lc: lc("longest-palindromic-substring"),               gfg: gfg("longest-palindrome-substring-set-1"),                 yt: nc("XYQecbcd6_c") },
      { id: "st5", title: "Group Anagrams",                       difficulty: "Medium", lc: lc("group-anagrams"),                              gfg: gfg("given-a-sequence-of-words-print-all-anagrams-together"),yt: nc("vzdNq5aqqbe") },
      { id: "st6", title: "Minimum Window Substring",             difficulty: "Hard",   lc: lc("minimum-window-substring"),                    gfg: gfg("find-the-smallest-window-in-a-string-containing-all-characters-of-another-string"), yt: nc("jSto0O4AJbM") },
    ],
  },
  {
    id: "s4", title: "Linked List",
    problems: [
      { id: "ll1", title: "Reverse Linked List",                  difficulty: "Easy",   lc: lc("reverse-linked-list"),                         gfg: gfg("reverse-a-linked-list"),                              yt: nc("G0_I-ZF0S38") },
      { id: "ll2", title: "Merge Two Sorted Lists",               difficulty: "Easy",   lc: lc("merge-two-sorted-lists"),                      gfg: gfg("merge-two-sorted-linked-lists"),                      yt: nc("XIdigk956ot") },
      { id: "ll3", title: "Linked List Cycle",                    difficulty: "Easy",   lc: lc("linked-list-cycle"),                           gfg: gfg("detect-loop-in-a-linked-list"),                       yt: nc("gBTe7lFR3vc") },
      { id: "ll4", title: "Remove Nth Node From End",             difficulty: "Medium", lc: lc("remove-nth-node-from-end-of-list"),            gfg: gfg("remove-nth-node-from-end-of-linked-list"),            yt: nc("XVuQAVdkZZs") },
      { id: "ll5", title: "Reorder List",                         difficulty: "Medium", lc: lc("reorder-list"),                                gfg: gfg("program-of-reorder-list"),                            yt: nc("S5bfdUTyAIM") },
      { id: "ll6", title: "Find the Duplicate Number",            difficulty: "Medium", lc: lc("find-the-duplicate-number"),                   gfg: gfg("find-the-only-repetitive-element-between-1-to-n-1"), yt: nc("wjYB09b5KXA") },
      { id: "ll7", title: "LRU Cache",                            difficulty: "Medium", lc: lc("lru-cache"),                                   gfg: gfg("lru-cache-implementation"),                           yt: nc("7ABFKPK2hD4") },
      { id: "ll8", title: "Merge K Sorted Lists",                 difficulty: "Hard",   lc: lc("merge-k-sorted-lists"),                        gfg: gfg("merge-k-sorted-linked-lists"),                        yt: nc("q5a5OiGbT6Q") },
    ],
  },
  {
    id: "s5", title: "Stacks & Queues",
    problems: [
      { id: "sq1", title: "Valid Parentheses",                    difficulty: "Easy",   lc: lc("valid-parentheses"),                           gfg: gfg("check-for-balanced-parentheses-in-an-expression"),    yt: nc("WTzjTskDFMg") },
      { id: "sq2", title: "Min Stack",                            difficulty: "Medium", lc: lc("min-stack"),                                   gfg: gfg("design-a-stack-that-supports-getmin-in-o1-extra-space"), yt: nc("qkLl7nAwsfg") },
      { id: "sq3", title: "Evaluate Reverse Polish Notation",     difficulty: "Medium", lc: lc("evaluate-reverse-polish-notation"),             gfg: gfg("evaluation-of-expression-in-reverse-polish-notation"), yt: nc("iu0082AtZiI") },
      { id: "sq4", title: "Daily Temperatures",                   difficulty: "Medium", lc: lc("daily-temperatures"),                          gfg: gfg("daily-temperatures"),                                 yt: nc("cTBiBSr8PSQ") },
      { id: "sq5", title: "Next Greater Element I",               difficulty: "Easy",   lc: lc("next-greater-element-i"),                      gfg: gfg("next-greater-element"),                               yt: nc("Du881K7Jtk8") },
      { id: "sq6", title: "Largest Rectangle in Histogram",       difficulty: "Hard",   lc: lc("largest-rectangle-in-histogram"),              gfg: gfg("largest-rectangle-under-histogram"),                  yt: nc("zx5Sw9130E0") },
    ],
  },
  {
    id: "s6", title: "Sliding Window & Two Pointers",
    problems: [
      { id: "sw1", title: "Move Zeroes",                          difficulty: "Easy",   lc: lc("move-zeroes"),                                 gfg: gfg("move-zeroes-to-end"),                                 yt: nc("aayNRwUN3Do") },
      { id: "sw2", title: "Sliding Window Maximum",               difficulty: "Hard",   lc: lc("sliding-window-maximum"),                      gfg: gfg("sliding-window-maximum-maximum-of-all-subarrays-of-size-k"), yt: nc("DfljaUwZsOk") },
      { id: "sw3", title: "Permutation in String",                difficulty: "Medium", lc: lc("permutation-in-string"),                       gfg: gfg("check-whether-a-given-string-is-an-anagram-of-another"),yt: nc("UbyhOgBN834") },
      { id: "sw4", title: "Longest Repeating Character Replace",  difficulty: "Medium", lc: lc("longest-repeating-character-replacement"),     gfg: gfg("longest-repeating-character-replacement"),            yt: nc("gqXU1UyA8pk") },
      { id: "sw5", title: "Two Sum II (Sorted Array)",            difficulty: "Medium", lc: lc("two-sum-ii-input-array-is-sorted"),            gfg: gfg("two-pointers-technique"),                             yt: nc("cQ1Oz4ckceM") },
    ],
  },
  {
    id: "s7", title: "Trees",
    problems: [
      { id: "tr1", title: "Invert Binary Tree",                   difficulty: "Easy",   lc: lc("invert-binary-tree"),                          gfg: gfg("invert-actual-binary-tree"),                          yt: nc("OnSn2XEQ4MY") },
      { id: "tr2", title: "Maximum Depth of Binary Tree",         difficulty: "Easy",   lc: lc("maximum-depth-of-binary-tree"),                gfg: gfg("write-a-c-program-to-find-the-maximum-depth-or-height-of-a-tree"), yt: nc("hTM3phVI5CQ") },
      { id: "tr3", title: "Same Tree",                            difficulty: "Easy",   lc: lc("same-tree"),                                   gfg: gfg("write-c-code-to-determine-if-two-trees-are-identical"), yt: nc("vRbbcKXCxOw") },
      { id: "tr4", title: "Binary Tree Level Order Traversal",    difficulty: "Medium", lc: lc("binary-tree-level-order-traversal"),           gfg: gfg("level-order-tree-traversal"),                         yt: nc("6ZnyEApgkvQ") },
      { id: "tr5", title: "Validate Binary Search Tree",          difficulty: "Medium", lc: lc("validate-binary-search-tree"),                 gfg: gfg("a-program-to-check-if-a-binary-tree-is-bst-or-not"), yt: nc("s6ATth0p9v8") },
      { id: "tr6", title: "Lowest Common Ancestor",               difficulty: "Medium", lc: lc("lowest-common-ancestor-of-a-binary-tree"),     gfg: gfg("lowest-common-ancestor-binary-tree-set-1"),           yt: nc("WO1VwFbzzoQ") },
      { id: "tr7", title: "Binary Tree Right Side View",          difficulty: "Medium", lc: lc("binary-tree-right-side-view"),                 gfg: gfg("right-view-binary-tree"),                             yt: nc("d4zLyf32e3I") },
      { id: "tr8", title: "Binary Tree Maximum Path Sum",         difficulty: "Hard",   lc: lc("binary-tree-maximum-path-sum"),                gfg: gfg("find-maximum-path-sum-in-a-binary-tree"),             yt: nc("Hr5cWUweDR4") },
      { id: "tr9", title: "Serialize and Deserialize Binary Tree",difficulty: "Hard",   lc: lc("serialize-and-deserialize-binary-tree"),       gfg: gfg("serialize-deserialize-binary-tree"),                  yt: nc("u4JAi2JJhI8") },
    ],
  },
  {
    id: "s8", title: "Graphs",
    problems: [
      { id: "g1",  title: "Number of Islands",                    difficulty: "Medium", lc: lc("number-of-islands"),                           gfg: gfg("find-number-of-islands"),                             yt: nc("pV2kpPD66nE") },
      { id: "g2",  title: "Clone Graph",                          difficulty: "Medium", lc: lc("clone-graph"),                                 gfg: gfg("clone-an-undirected-graph"),                          yt: nc("mQeF6bN8hMk") },
      { id: "g3",  title: "Course Schedule (Topological Sort)",   difficulty: "Medium", lc: lc("course-schedule"),                             gfg: gfg("topological-sorting"),                                yt: nc("EgI5nU9etnU") },
      { id: "g4",  title: "Pacific Atlantic Water Flow",          difficulty: "Medium", lc: lc("pacific-atlantic-water-flow"),                 gfg: gfg("pacific-atlantic-water-flow"),                        yt: nc("s-VZmdh1M68") },
      { id: "g5",  title: "Rotten Oranges (BFS)",                 difficulty: "Medium", lc: lc("rotting-oranges"),                             gfg: gfg("minimum-time-required-so-that-all-oranges-become-rotten"), yt: nc("y704fEOx0s0") },
      { id: "g6",  title: "Walls and Gates",                      difficulty: "Medium", lc: null,                                              gfg: gfg("distance-nearest-cell-having-1"),                     yt: nc("e69C6ZHwOe0") },
      { id: "g7",  title: "Dijkstra's Algorithm",                 difficulty: "Medium", lc: lc("network-delay-time"),                          gfg: gfg("dijkstras-shortest-path-algorithm-greedy-algo-7"),    yt: sv("V6H1qAeB-l4") },
      { id: "g8",  title: "Word Ladder",                          difficulty: "Hard",   lc: lc("word-ladder"),                                 gfg: gfg("word-ladder-length-of-shortest-chain-to-reach-a-target-word"), yt: nc("h9C8ZRkpcrc") },
    ],
  },
  {
    id: "s9", title: "Dynamic Programming",
    problems: [
      { id: "dp1",  title: "Climbing Stairs",                     difficulty: "Easy",   lc: lc("climbing-stairs"),                             gfg: gfg("count-ways-reach-nth-stair-using-step-1-2-3"),        yt: nc("Y0lT9Fck7qI") },
      { id: "dp2",  title: "House Robber",                        difficulty: "Medium", lc: lc("house-robber"),                                gfg: gfg("the-painters-partition-problem-ii"),                  yt: nc("0o2Cg8EjWWU") },
      { id: "dp3",  title: "Coin Change",                         difficulty: "Medium", lc: lc("coin-change"),                                 gfg: gfg("coin-change-dp-7"),                                   yt: nc("H9bfqozjoqs") },
      { id: "dp4",  title: "Longest Increasing Subsequence",      difficulty: "Medium", lc: lc("longest-increasing-subsequence"),              gfg: gfg("longest-increasing-subsequence-dp-3"),                yt: nc("cjWnW0hdF1Y") },
      { id: "dp5",  title: "Longest Common Subsequence",          difficulty: "Medium", lc: lc("longest-common-subsequence"),                  gfg: gfg("longest-common-subsequence-dp-4"),                    yt: nc("Ua0GhsJSlWM") },
      { id: "dp6",  title: "0/1 Knapsack",                        difficulty: "Medium", lc: null,                                              gfg: gfg("0-1-knapsack-problem-dp-10"),                         yt: sv("GqOmJHQZivw") },
      { id: "dp7",  title: "Word Break",                          difficulty: "Medium", lc: lc("word-break"),                                  gfg: gfg("word-break-problem-dp-32"),                           yt: nc("Sx9NNALdAeA") },
      { id: "dp8",  title: "Unique Paths",                        difficulty: "Medium", lc: lc("unique-paths"),                                gfg: gfg("count-possible-paths-top-left-bottom-right-nXm-matrix"), yt: nc("IlEsdxuD4lY") },
      { id: "dp9",  title: "Edit Distance",                       difficulty: "Hard",   lc: lc("edit-distance"),                               gfg: gfg("edit-distance-dp-5"),                                 yt: nc("XYi2-LPfd6s") },
      { id: "dp10", title: "Burst Balloons",                      difficulty: "Hard",   lc: lc("burst-balloons"),                              gfg: gfg("burst-balloons-to-maximize-coins"),                   yt: nc("VFskby7lUaA") },
    ],
  },
  {
    id: "s10", title: "Backtracking",
    problems: [
      { id: "bt1", title: "Subsets",                              difficulty: "Medium", lc: lc("subsets"),                                     gfg: gfg("power-set"),                                          yt: nc("REOH1v5aZqI") },
      { id: "bt2", title: "Permutations",                         difficulty: "Medium", lc: lc("permutations"),                                gfg: gfg("write-a-c-program-to-print-all-permutations-of-a-given-string"), yt: nc("s7AvT7cGdSo") },
      { id: "bt3", title: "Combination Sum",                      difficulty: "Medium", lc: lc("combination-sum"),                             gfg: gfg("combinational-sum"),                                  yt: nc("GBKI8hfemxc") },
      { id: "bt4", title: "Word Search",                          difficulty: "Medium", lc: lc("word-search"),                                 gfg: gfg("search-a-word-in-a-2d-grid-of-characters"),           yt: nc("pfiQ_PS1g8E") },
      { id: "bt5", title: "Letter Combinations of Phone Number",  difficulty: "Medium", lc: lc("letter-combinations-of-a-phone-number"),       gfg: gfg("letter-combinations-of-a-phone-number"),              yt: nc("0snEunUacZY") },
      { id: "bt6", title: "N-Queens",                             difficulty: "Hard",   lc: lc("n-queens"),                                    gfg: gfg("n-queen-problem-backtracking-3"),                     yt: nc("i05h_HznKw4") },
      { id: "bt7", title: "Sudoku Solver",                        difficulty: "Hard",   lc: lc("sudoku-solver"),                               gfg: gfg("sudoku-backtracking-7"),                              yt: nc("G_UYXmE7g-c") },
    ],
  },
  {
    id: "s11", title: "Heaps / Priority Queue",
    problems: [
      { id: "hp1", title: "Kth Largest Element in Array",        difficulty: "Medium", lc: lc("kth-largest-element-in-an-array"),             gfg: gfg("kth-largest-element-in-an-array"),                    yt: nc("XEmy3g1p5mc") },
      { id: "hp2", title: "K Closest Points to Origin",          difficulty: "Medium", lc: lc("k-closest-points-to-origin"),                  gfg: gfg("k-closest-points-to-origin"),                         yt: nc("rI2EBUEMfTk") },
      { id: "hp3", title: "Top K Frequent Elements",             difficulty: "Medium", lc: lc("top-k-frequent-elements"),                     gfg: gfg("frequent-element"),                                   yt: nc("YPTqKL6uLCU") },
      { id: "hp4", title: "Task Scheduler",                      difficulty: "Medium", lc: lc("task-scheduler"),                              gfg: gfg("cpu-task-scheduler"),                                 yt: nc("s8p_ddFW8x8") },
      { id: "hp5", title: "Find Median from Data Stream",        difficulty: "Hard",   lc: lc("find-median-from-data-stream"),                gfg: gfg("median-in-a-stream-of-integers-running-integers"), yt: nc("itmhHWaHupI") },
    ],
  },
  {
    id: "s12", title: "Greedy",
    problems: [
      { id: "gr1", title: "Jump Game",                            difficulty: "Medium", lc: lc("jump-game"),                                   gfg: gfg("jump-game"),                                          yt: nc("Yan0cv2kch0") },
      { id: "gr2", title: "Jump Game II",                         difficulty: "Medium", lc: lc("jump-game-ii"),                                gfg: gfg("minimum-number-of-jumps-to-reach-end-of-a-given-array"), yt: nc("dJ7sWiOoK7g") },
      { id: "gr3", title: "Gas Station",                          difficulty: "Medium", lc: lc("gas-station"),                                 gfg: gfg("circular-tour-problem"),                              yt: nc("lJwbB4qHoaY") },
      { id: "gr4", title: "Activity Selection Problem",           difficulty: "Medium", lc: null,                                              gfg: gfg("activity-selection-problem-greedy-algo-1"),           yt: sv("DHpCB6X_Lmo") },
      { id: "gr5", title: "Fractional Knapsack",                  difficulty: "Medium", lc: null,                                              gfg: gfg("fractional-knapsack-problem"),                        yt: sv("1ibsQrnuEEg") },
      { id: "gr6", title: "Candy",                                difficulty: "Hard",   lc: lc("candy"),                                       gfg: gfg("candy-distribution-problem"),                         yt: nc("1IzCjQ59er4") },
    ],
  },
];

// Flatten all problems for stats
export const ALL_PROBLEMS = DSA_SECTIONS.flatMap(s => s.problems.map(p => ({ ...p, sectionId: s.id })));
export const TOTAL_EASY   = ALL_PROBLEMS.filter(p => p.difficulty === "Easy").length;
export const TOTAL_MEDIUM = ALL_PROBLEMS.filter(p => p.difficulty === "Medium").length;
export const TOTAL_HARD   = ALL_PROBLEMS.filter(p => p.difficulty === "Hard").length;
