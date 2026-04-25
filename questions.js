// Simple question bank with categories and difficulties
// You can replace or extend this list as needed.
window.DEFAULT_QUESTIONS = [
	{
		id: "gk-1",
		category: "general",
		difficulty: "easy",
		question: "What is the capital of France?",
		choices: ["Berlin", "Madrid", "Paris", "Rome"],
		answerIndex: 2
	},
	{
		id: "gk-2",
		category: "general",
		difficulty: "medium",
		question: "Which ocean is the largest on Earth?",
		choices: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
		answerIndex: 3
	},
	{
		id: "sci-1",
		category: "science",
		difficulty: "easy",
		question: "Water boils at what temperature at sea level?",
		choices: ["90°C", "100°C", "110°C", "212°C"],
		answerIndex: 1
	},
	{
		id: "sci-2",
		category: "science",
		difficulty: "medium",
		question: "What gas do plants primarily absorb for photosynthesis?",
		choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
		answerIndex: 2
	},
	{
		id: "tech-1",
		category: "tech",
		difficulty: "easy",
		question: "HTML stands for?",
		choices: ["Hyperlinks and Text Markup Language", "Hyper Text Markup Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"],
		answerIndex: 1
	},
	{
		id: "tech-2",
		category: "tech",
		difficulty: "medium",
		question: "Which CSS property controls text size?",
		choices: ["font-style", "text-size", "font-size", "text-style"],
		answerIndex: 2
	},
	{
		id: "tech-3",
		category: "tech",
		difficulty: "hard",
		question: "What is the time complexity of binary search on a sorted array?",
		choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
		answerIndex: 1
	},
	{
		id: "gk-3",
		category: "general",
		difficulty: "hard",
		question: "Which year did the World Wide Web become publicly available?",
		choices: ["1989", "1991", "1993", "1995"],
		answerIndex: 2
	}
];

// Additional Programming category questions
window.DEFAULT_QUESTIONS.push(
	{
		id: "prog-1",
		category: "programming",
		difficulty: "easy",
		question: "Which language is primarily used to style web pages?",
		choices: ["HTML", "CSS", "JavaScript", "Python"],
		answerIndex: 1
	},
	{
		id: "prog-2",
		category: "programming",
		difficulty: "easy",
		question: "In JavaScript, which symbol starts a single-line comment?",
		choices: ["<!-- -->", "//", "/* */", "#"],
		answerIndex: 1
	},
	{
		id: "prog-3",
		category: "programming",
		difficulty: "medium",
		question: "What does SQL stand for?",
		choices: ["Structured Query Language", "Sequential Query Logic", "Server Queue Language", "Simple Query Language"],
		answerIndex: 0
	},
	{
		id: "prog-4",
		category: "programming",
		difficulty: "medium",
		question: "Which data structure uses the LIFO principle?",
		choices: ["Queue", "Linked List", "Stack", "Heap"],
		answerIndex: 2
	},
	{
		id: "prog-5",
		category: "programming",
		difficulty: "hard",
		question: "What is the Big-O time complexity of quicksort on average?",
		choices: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
		answerIndex: 1
	},
	{
		id: "prog-6",
		category: "programming",
		difficulty: "hard",
		question: "In Git, which command creates a new branch and switches to it?",
		choices: ["git branch new && git checkout new", "git checkout -b new", "git switch && git branch new", "git new-branch"],
		answerIndex: 1
	}
);


