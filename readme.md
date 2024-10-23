# Rule Engine with AST (backend)
## Overview
This application is a simple 3-tier rule engine that determines user eligibility based on attributes such as age, department, income, and experience. It utilizes an Abstract Syntax Tree (AST) to represent and evaluate conditional rules dynamically.
## Features
- Create rules from strings to AST representation.
- Combine multiple rules into a single AST.
- Evaluate the combined AST against user attribute data.
- Detailed reasons for rule evaluation results.

## Data Structure

- **Node Class:**
   - Represents a node in the AST.
   - `type:` String indicating node type ("operator" or "operand").
   - `left:` Reference to the left child Node.
   - `right:` Reference to the right child Node (for operators).
   - `value:` Optional value for operand nodes.

## Wrokflow
                 +---------------------------+
                 |        Start              |
                 +---------------------------+
                              |
                              V
                 +---------------------------+
                 | Receive HTTP POST Request  |
                 +---------------------------+
                              |
                              V
                 +---------------------------+
                 | Extract Rules and Data     |
                 | from Request Body          |
                 +---------------------------+
                              |
                              V
                 +---------------------------+
                 | Combine Rules into an     |
                 | Abstract Syntax Tree (AST)|
                 +---------------------------+
                              |
                              V
                 +---------------------------+
                 |   Evaluate Combined Rule  |
                 +---------------------------+
                              |
                              V
                 +---------------------------+
                 |     Is the AST Empty?     |
                 +---------------------------+
                      /           \
                   Yes             No
                    |               |
                    V               V
         +-----------------+  +---------------------------+
         |   Return False  |  | Is it an Operand?        |
         +-----------------+  +---------------------------+
                              |            \
                             Yes            No
                              |              |
                 +------------------+   +---------------------------+
                 | Evaluate Operand  |   |  Evaluate Operator       |
                 +------------------+   +---------------------------+
                              |              |
                              |              |
                 +---------------------------+
                 | Are Conditions Met?       |
                 +---------------------------+
                      /           \
                   Yes             No
                    |               |
         +-----------------+   +-----------------+
         |   Return True   |   | Return False    |
         +-----------------+   +-----------------+
                    |               |
                    |               |
         +---------------------------+
         | Return Result with Reasons |
         +---------------------------+
                              |
                              V
                 +---------------------------+
                 |      Send JSON Response    |
                 +---------------------------+
                              |
                              V
                 +---------------------------+
                 |          End              |
                 +---------------------------+


## API Endpoints

- POST /evaluate
   - Request Body:
   ```json
   {
   "rules": ["rule_string_1", "rule_string_2"],
   "data": {
      "age": 35,
      "department": "Sales",
      "salary": 60000,
      "experience": 3
    }
   }
   ```
   - Response:
   ```json
   {
      "result": true,
      "reasons": []
   }

   ```

## Functions
- **create_rule(rule_string):** Converts a rule string into its corresponding AST.
- **combine_rules(rules):** Combines multiple rule strings into a single AST.
- **evaluate_rule(ast, data):** Evaluates the AST against provided user data and returns the result and reasons for evaluation.

## Example Usage
- Individual Rule Evaluation:

```js
const rule = "(age > 30 AND department = 'IT')";
const ast = create_rule(rule);
const result = evaluate_rule(ast, data);
```

- Combined Rule Evaluation:
```js
const combinedRule = combine_rules([rule1, rule2]);
const result = evaluate_rule(combinedRule, data);
```

## Error Handling
- Handles invalid rule strings and formats.
- Provides detailed reasons for evaluation failures.

## Bonus Features (Future Enhancements)
- Modify existing rules.
- Support user-defined functions in rules.
## Installation
- Clone the repository.
- Run npm install to install dependencies.
- Start the server with node app.js.
- Access the API at http://localhost:5000/evaluate