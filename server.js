const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json()); // I need to parse incoming JSON requests for easier handling

// This class represents a node in my abstract syntax tree (AST)
// I'll use it to build and evaluate the rules
class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type; 
        this.left = left;
        this.right = right; 
        this.value = value; 
    }
}

// Function to create a rule and return its AST
function create_rule(rule_string) {
    const root = parse_rule(rule_string);
    return root;
}

// Function to parse a rule string into an AST
function parse_rule(ruleString) {
    ruleString = ruleString.trim(); // First, I trim any whitespace

    // If the rule starts and ends with parentheses, I remove them
    if (ruleString.startsWith('(') && ruleString.endsWith(')')) {
        ruleString = ruleString.slice(1, -1).trim();
    }

    let operatorIndex = -1; // This will hold the index of the operator
    let operator = ''; // This will store the found operator

    let parenthesesCount = 0;
    for (let i = 0; i < ruleString.length; i++) {
        if (ruleString[i] === '(') parenthesesCount++;
        if (ruleString[i] === ')') parenthesesCount--;
        if (parenthesesCount === 0) {
            // When there are no open parentheses, I look for AND/OR operators
            if (ruleString.startsWith('AND', i)) {
                operatorIndex = i;
                operator = 'AND';
                break;
            }
            if (ruleString.startsWith('OR', i)) {
                operatorIndex = i;
                operator = 'OR';
                break;
            }
        }
    }
    // If no operator was found, I treat the whole rule as a single condition (operand)
    if (operatorIndex === -1) {
        return new Node("operand", null, null, ruleString);
    }

    // Split the rule into left and right parts based on the operator's index
    const left = ruleString.slice(0, operatorIndex).trim();
    const right = ruleString.slice(operatorIndex + operator.length).trim();
    
    return new Node("operator", parse_rule(left), parse_rule(right), operator);
}
// Function to combine rule1 and rule2
function combine_rules(rules) {
    let combinedroot = null;
    for (const rule of rules) {
        if (!rule) continue; 
        const astrule = create_rule(rule);
        if (!combinedroot) {
            combinedroot = astrule;
        } else {
            combinedroot = combineAst(combinedroot, astrule);
        }
    }
    return combinedroot;
}

function combineAst(root1, root2) {
    return new Node("operator", root1, root2, "AND");
}

function evaluate_rule(ast, data) {
    if (!ast) return { result: false, reasons: ['No rule to evaluate.'] };

    if (ast.type === "operand") {
        return evaluateOperand(ast.value, data);
    } else if (ast.type === "operator") {
        const leftEval = evaluate_rule(ast.left, data);
        const rightEval = evaluate_rule(ast.right, data);
        // If the operator is AND, both left and right conditions must be true
        if (ast.value === "AND") {
            if (!leftEval.result) {
                // If the left condition is false, return its reasons
                return { result: false, reasons: [...leftEval.reasons, ...rightEval.reasons] };
            }
            return { result: rightEval.result, reasons: rightEval.reasons };
        } else if (ast.value === "OR") {
            // If either left or right is true, return true
            if (leftEval.result || rightEval.result) {
                return { result: true, reasons: ['One of the conditions is true.'] };
            }
            return { result: false, reasons: [...leftEval.reasons, ...rightEval.reasons] };
        }
    }
}
function evaluateOperand(condition, data) {
    const match = condition.match(/(\w+)\s*([<>=]+)\s*(.+)/);
    if (!match) return { result: false, reasons: ['Invalid condition format.'] };

    const attr = match[1].trim();
    const operator = match[2].trim();
    const value = match[3].trim().replace(/'/g, "");
    const attrValue = data[attr];

    const numericValue = isNaN(value) ? value : parseFloat(value);
    let reasons = [];

    switch (operator) {
        case '>':
            if (attrValue <= numericValue)
                 reasons.push(`${attrValue} is not greater than ${numericValue}.`);
            break;
        case '<':
            if (attrValue >= numericValue)
                 reasons.push(`${attrValue} is not less than ${numericValue}.`);
            break;
        case '=':
            if (attrValue != value)
                 reasons.push(`${attrValue} is not equal to ${value}.`);
            break;
        default:
            return { result: false, reasons: ['Unsupported operator.'] };
    }

    // Return the result and any reasons for failure
    return { result: reasons.length === 0, reasons };
}


app.post('/evaluate', (req, res) => {
    const { rules, data } = req.body;  // I get the rules and data from the request body
    const combinedRule = combine_rules(rules);  // Combining all rules into one AST
    const evaluationResult = evaluate_rule(combinedRule, data);
    res.json({ result: evaluationResult.result, reasons: evaluationResult.reasons });
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Example rules and data
const rule1 = "(age > 30 AND department = 'IT')";
const rule2 = "(age > 12)"; 
const data = {
    age: 100,
    department: 'IT',
    salary: 60000,
    experience: 7
};
/*
         (age > 30)
              |
           [operator]
              |
     [operand]     [operand]
       (age > 30)       (value: 30)


  1. Evaluate left operand
  2. If left is false, return reasons
  3. Evaluate right operand
  4. Combine results based on operator (AND/OR)

*/

// Individual test
const ast1 = create_rule(rule2);
const res1 = evaluate_rule(ast1, data);
console.log('Individual Test :', res1); 

// Combined test
const combinedRule = combine_rules([rule1, rule2]);
const result = evaluate_rule(combinedRule, data);
console.log('Combined Test :', result); 
