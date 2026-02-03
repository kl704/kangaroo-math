// Questions Database
const QUESTIONS = [
    {
        id: 1,
        level: 1,
        category: "Logic",
        question: "Which shadow belongs to Labubu? 🐰",
        options: ["Short Ears", "Long Ears", "No Ears", "Three Ears"],
        answer: 1,
        points: 3
    },
    {
        id: 2,
        level: 1,
        category: "Arithmetic",
        question: "Labubu has 3 apples 🍎 and finds 2 more. How many apples does Labubu have now?",
        options: ["4", "5", "6", "3"],
        answer: 1,
        points: 3
    },
    {
        id: 3,
        level: 1,
        category: "Geometry",
        question: "How many triangles can you see in a square with one diagonal line?",
        options: ["1", "2", "3", "4"],
        answer: 1,
        points: 4
    },
    {
        id: 4,
        level: 1,
        category: "Patterns",
        question: "Complete the sequence: 🔴 🔵 🔴 🔵 ... ?",
        options: ["🔵", "🔴", "🟡", "🟢"],
        answer: 1,
        points: 3
    },
    {
        id: 5,
        level: 1,
        category: "Logic",
        question: "If yesterday was Tuesday, what day is it today?",
        options: ["Monday", "Wednesday", "Thursday", "Friday"],
        answer: 1,
        points: 4
    },
    {
        id: 6,
        level: 2,
        category: "Arithmetic",
        question: "10 - 4 + 2 = ?",
        options: ["4", "6", "8", "10"],
        answer: 2,
        points: 3
    },
    {
        id: 7,
        level: 2,
        category: "Geometry",
        question: "Which shape has 5 sides?",
        options: ["Square", "Triangle", "Pentagon", "Hexagon"],
        answer: 2,
        points: 3
    },
    {
        id: 8,
        level: 1,
        category: "Logic",
        question: "A mother kangaroo and her baby Jojo weigh 60kg. The mother weighs 50kg. How much does Jojo weigh?",
        options: ["5kg", "10kg", "15kg", "20kg"],
        answer: 1,
        points: 5
    },
    {
        id: 9,
        level: 1,
        category: "Patterns",
        question: "2, 4, 6, 8, ... What is next?",
        options: ["9", "10", "11", "12"],
        answer: 1,
        points: 3
    },
    {
        id: 10,
        level: 1,
        category: "Logic",
        question: "How many legs do 3 Labubus have together? (Each has 2 legs)",
        options: ["4", "5", "6", "8"],
        answer: 2,
        points: 4
    }
];

// Generator for thousands of questions
function generateMoreQuestions() {
    const categories = ["Arithmetic", "Logic", "Geometry", "Patterns"];
    
    // Add 200 Arithmetic questions
    for (let i = 0; i < 200; i++) {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const op = Math.random() > 0.5 ? '+' : '-';
        let ans, question;
        
        if (op === '+') {
            ans = a + b;
            question = `Labubu found ${a} stars ⭐ and then ${b} more stars. How many stars in total?`;
        } else {
            const bigger = Math.max(a, b);
            const smaller = Math.min(a, b);
            ans = bigger - smaller;
            question = `Labubu had ${bigger} cookies 🍪 and ate ${smaller}. How many are left?`;
        }
        
        const options = [ans, ans + 1, ans - 1, ans + 2].filter(n => n >= 0).sort(() => Math.random() - 0.5);
        const uniqueOptions = [...new Set(options)];
        while(uniqueOptions.length < 4) {
            let extra = Math.floor(Math.random() * 40);
            if(!uniqueOptions.includes(extra)) uniqueOptions.push(extra);
        }
        uniqueOptions.sort(() => Math.random() - 0.5);

        QUESTIONS.push({
            id: QUESTIONS.length + 1,
            level: 1,
            category: "Arithmetic",
            question: question,
            options: uniqueOptions.map(String),
            answer: uniqueOptions.indexOf(ans),
            points: 3
        });
    }

    // Add 100 Pattern questions
    const shapes = ["🔴", "🔵", "🟡", "🟢", "⭐", "💎", "🍄", "🍎", "🍐", "🍊", "🍋"];
    for (let i = 0; i < 100; i++) {
        const s1 = shapes[Math.floor(Math.random() * shapes.length)];
        let s2 = shapes[Math.floor(Math.random() * shapes.length)];
        while (s1 === s2) s2 = shapes[Math.floor(Math.random() * shapes.length)];
        
        QUESTIONS.push({
            id: QUESTIONS.length + 1,
            level: 1,
            category: "Patterns",
            question: `What comes next in the pattern? ${s1} ${s2} ${s1} ${s2} ${s1} ...`,
            options: [s2, s1, "🌈", "🔥"],
            answer: 0,
            points: 3
        });
    }

    // Add 100 Logic/Counting questions
    for (let i = 0; i < 100; i++) {
        const count = Math.floor(Math.random() * 5) + 2;
        const legs = count * 2;
        QUESTIONS.push({
            id: QUESTIONS.length + 1,
            level: 1,
            category: "Logic",
            question: `How many ears do ${count} Labubus have? (Each has 2 ears 🐰)`,
            options: [String(legs), String(legs + 2), String(legs - 2), String(count)],
            answer: 0,
            points: 4
        });
    }
}

generateMoreQuestions();

// Function to get a random set of questions
function getQuestionSet(count) {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

